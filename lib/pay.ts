import crypto from 'node:crypto';
import { db, getSetting, setSetting } from './db.js';

export const APP_URL = () => (process.env.APP_URL || '').replace(/\/$/, '');

/** Bank alert senders we trust (DKIM domain must end with one of these). Override with PAY_BANK_DOMAINS. */
export const bankDomains = () =>
  (process.env.PAY_BANK_DOMAINS || 'kotak.com,kotak.bank.in').split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);

export const rupees = (p: number) => (p / 100).toFixed(2);

export function upiLink(vpa: string, name: string, amountPaise: number, note: string) {
  const q = new URLSearchParams({ pa: vpa, pn: name, am: rupees(amountPaise), cu: 'INR', tn: note });
  return `upi://pay?${q.toString().replace(/\+/g, '%20')}`;
}

export function timingSafeEq(a: string, b: string) {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && crypto.timingSafeEqual(x, y);
}

/** Apps Script signs `${ts}.${payload}` with the paired secret (HMAC-SHA256, hex). */
export async function verifySigned(body: any): Promise<any | null> {
  const secret = await getSetting('pay_hmac_secret');
  if (!secret || !body || typeof body.payload !== 'string' || typeof body.sig !== 'string') return null;
  const ts = Number(body.ts);
  if (!ts || Math.abs(Date.now() - ts) > 5 * 60_000) return null;
  const mac = crypto.createHmac('sha256', secret).update(`${ts}.${body.payload}`).digest('hex');
  if (!timingSafeEq(mac, body.sig)) return null;
  try { return JSON.parse(body.payload); } catch { return null; }
}

export async function pairOnce(): Promise<string | null> {
  const until = Number((await getSetting('pay_pair_until')) || 0);
  if (Date.now() > until) return null;
  const secret = crypto.randomBytes(32).toString('hex');
  await setSetting('pay_hmac_secret', secret);
  await setSetting('pay_pair_until', '0');
  return secret;
}

/** Parse a bank credit alert. Returns null unless it is clearly a CREDIT. */
export function parseAlert(subject: string, body: string): { amount_paise: number; utr: string | null } | null {
  const text = `${subject}\n${body}`.replace(/ /g, ' ');
  if (!/(credit|credited|received)/i.test(text)) return null;
  if (/\b(debited|debit alert|payment of inr .* successful|sent from your)\b/i.test(subject)) return null;
  const m =
    text.match(/Amount\s*:?\s*(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i) ||
    text.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)\s*(?:has been\s*)?(?:credited|received)/i) ||
    text.match(/(?:₹|Rs\.?|INR)\s*([\d,]+(?:\.\d{1,2})?)/i);
  if (!m) return null;
  const amount_paise = Math.round(parseFloat(m[1].replace(/,/g, '')) * 100);
  if (!amount_paise) return null;
  const u =
    text.match(/(?:RRN|UPI Ref(?:erence)?(?: No\.?| Number)?|UTR)[^\d]{0,40}(\d{12})/i) || text.match(/\b(\d{12})\b/);
  return { amount_paise, utr: u ? u[1] : null };
}

/** DKIM must pass for a trusted bank domain (Authentication-Results added by Gmail). */
export function trustedSender(authResults: string): boolean {
  const ar = (authResults || '').toLowerCase();
  if (!/dkim=pass/.test(ar)) return false;
  const doms = [...ar.matchAll(/header\.(?:i|d)=@?([a-z0-9.-]+)/g)].map((x) => x[1]);
  return doms.some((d) => bankDomains().some((b) => d === b || d.endsWith('.' + b)));
}

export async function orderView(o: any) {
  const { data: p } = await db().from('products').select('slug,title,kit_path').eq('slug', o.product_slug).single();
  return {
    id: o.id, status: o.status, product: p?.slug, title: p?.title,
    amount: rupees(o.amount_paise), price: rupees(o.price_paise),
    expires_at: o.expires_at, paid: o.status === 'paid', kit_ready: !!p?.kit_path,
    email: String(o.email || '').replace(/^(.{2})[^@]*(@.*)$/, '$1•••$2'),
    paid_at: o.paid_at, mailed: !!o.mailed_at,
  };
}

/** Paid orders whose email has not gone out yet → Apps Script sends them from the owner's Gmail. */
export async function pendingMails() {
  const { data } = await db().from('orders').select('id,email,token,product_slug,amount_paise,utr')
    .eq('status', 'paid').is('mailed_at', null).limit(20);
  if (!data?.length) return [];
  const { data: prods } = await db().from('products').select('slug,title');
  const t = Object.fromEntries((prods || []).map((p) => [p.slug, p.title]));
  return data.map((o) => {
    const link = `${APP_URL()}/buy/${o.product_slug}?o=${o.id}&t=${o.token}`;
    return {
      id: o.id, to: o.email,
      subject: `${t[o.product_slug] || 'Your kit'} - order #${o.id.slice(0, 8).toUpperCase()}`,
      body: `Hi,\n\nThanks for buying the ${t[o.product_slug] || 'kit'} (order #${o.id.slice(0, 8).toUpperCase()}). Your payment of Rs ${rupees(o.amount_paise)} is confirmed.\n\nAapka kit is page pe hai, jab chaho khol lo:\n${link}\n\nKahin atko to bas is email pe reply kar dena, main khud jawab dunga.\n\nEk chhoti request: agar ye email Spam ya Promotions mein mila ho to "Not spam" dabake Primary mein move kar dena, taaki aage ke updates miss na ho.\n\n${process.env.BRAND_NAME || ''}${process.env.IG_HANDLE ? '\nInstagram: @' + process.env.IG_HANDLE.replace(/^@/, '') : ''}`,
    };
  });
}
