import crypto from 'node:crypto';

/**
 * Razorpay (optional).
 *  live: RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET            → used for every buyer
 *  test: RAZORPAY_TEST_KEY_ID + RAZORPAY_TEST_KEY_SECRET  → only when the checkout is opened with ?rptest=1
 * Without keys the checkout falls back to direct UPI.
 */
export type RpMode = 'live' | 'test';
const creds = (m: RpMode) => m === 'test'
  ? { id: process.env.RAZORPAY_TEST_KEY_ID || '', secret: process.env.RAZORPAY_TEST_KEY_SECRET || '' }
  : { id: process.env.RAZORPAY_KEY_ID || '', secret: process.env.RAZORPAY_KEY_SECRET || '' };
export const rpEnabled = (m: RpMode = 'live') => { const c = creds(m); return !!(c.id && c.secret); };
export const rpKeyId = (m: RpMode = 'live') => creds(m).id;
export const modeOf = (provider: string): RpMode => (provider === 'razorpay_test' ? 'test' : 'live');

async function rp(m: RpMode, method: 'GET' | 'POST', path: string, body?: unknown) {
  const c = creds(m);
  const auth = Buffer.from(`${c.id}:${c.secret}`).toString('base64');
  const r = await fetch(`https://api.razorpay.com/v1/${path}`, {
    method, headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined,
  });
  const j: any = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j?.error?.description || `razorpay ${r.status}`);
  return j;
}

export const rpCreateOrder = (m: RpMode, amountPaise: number, receipt: string, notes: Record<string, string>) =>
  rp(m, 'POST', 'orders', { amount: amountPaise, currency: 'INR', receipt: receipt.slice(0, 40), notes });

/** Razorpay-hosted payment page (Payment Link) — buyer pays on rzp.io, so no website-whitelist check. */
export const rpCreateLink = (m: RpMode, amountPaise: number, ref: string, desc: string, email: string, phone: string, callbackUrl: string, notes: Record<string, string>) =>
  rp(m, 'POST', 'payment_links', {
    amount: amountPaise, currency: 'INR', description: desc.slice(0, 2048), reference_id: ref.slice(0, 40),
    customer: phone ? { email, contact: '+91' + phone } : { email }, notify: { sms: false, email: false }, reminder_enable: false,
    callback_url: callbackUrl, callback_method: 'get', notes, expire_by: Math.floor(Date.now() / 1000) + 23 * 3600,
  });

/** Authoritative check: the captured payment on this Razorpay order / payment link (or null). */
export async function rpPaidPayment(m: RpMode, rpOrderId: string): Promise<{ id: string; amount: number } | null> {
  if (rpOrderId.startsWith('plink_')) {
    const l = await rp(m, 'GET', `payment_links/${encodeURIComponent(rpOrderId)}`);
    if (l.status !== 'paid') return null;
    return { id: l.payments?.[0]?.payment_id || rpOrderId, amount: l.amount_paid };
  }
  const ps = await rp(m, 'GET', `orders/${encodeURIComponent(rpOrderId)}/payments`);
  const cap = (ps.items || []).find((p: any) => p.status === 'captured');
  return cap ? { id: cap.id, amount: cap.amount } : null;
}

/** Checkout handler signature: HMAC_SHA256(order_id|payment_id, key_secret) */
export function rpSignatureOk(m: RpMode, orderId: string, paymentId: string, sig: string) {
  const mac = crypto.createHmac('sha256', creds(m).secret).update(`${orderId}|${paymentId}`).digest('hex');
  const a = Buffer.from(mac), b = Buffer.from(String(sig || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
