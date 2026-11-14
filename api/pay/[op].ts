import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, getSetting, setSetting } from '../../lib/db.js';
import { isCronAuthorized } from '../../lib/auth.js';
import {
  upiLink, rupees, verifySigned, pairOnce, parseAlert, trustedSender, orderView, pendingMails, timingSafeEq,
} from '../../lib/pay.js';
import { rpEnabled, rpKeyId, rpCreateOrder, rpCreateLink, rpPaidPayment, rpSignatureOk, modeOf, RpMode } from '../../lib/razorpay.js';

/**
 * Direct-UPI paid resources (no gateway). One function, many ops (Vercel Hobby = 12 functions).
 * Public:  GET product?slug · POST create {slug,email,phone} · GET status?id&t · POST claim {id,t,utr} · GET download?id&t
 * Gmail Apps Script (HMAC): POST pair · POST alert {ts,payload,sig} · POST mailed {ts,payload,sig}
 * Admin (CRON_SECRET): POST open-pair · POST mark-paid?id · GET orders · GET kit-upload-url?slug&file · POST product {...}
 */
export const config = { maxDuration: 30 };

const bad = (res: VercelResponse, code: number, error: string) => res.status(code).json({ error });
const body = (req: VercelRequest) => (typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {});

async function getOrder(id: string, t: string) {
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^[0-9a-f]{36}$/.test(t)) return null;
  const { data } = await db().from('orders').select('*').eq('id', id).maybeSingle();
  return data && timingSafeEq(data.token, t) ? data : null;
}

async function markPaidRp(orderId: string, paymentId: string) {
  await db().from('orders').update({ status: 'paid', paid_at: new Date().toISOString(), rp_payment_id: paymentId || null, utr: paymentId || null })
    .eq('id', orderId).eq('status', 'pending');
}
const isRp = (o: any) => o?.provider === 'razorpay' || o?.provider === 'razorpay_test';
const rpInfo = (o: any, title?: string) => ({ provider: 'razorpay', rp: { key: rpKeyId(modeOf(o.provider)), test: o.provider === 'razorpay_test', order_id: o.rp_order_id, url: o.rp_link_url || null, amount: o.amount_paise, name: process.env.BRAND_NAME || 'Store', description: title || 'Digital kit', email: o.email, contact: o.phone } });

const OPS: Record<string, (req: VercelRequest, res: VercelResponse) => Promise<unknown>> = {
  async product(req, res) {
    const { data } = await db().from('products').select('slug,title,description,price_paise,active')
      .eq('slug', String(req.query.slug || '')).maybeSingle();
    if (!data || !data.active) return bad(res, 404, 'not found');
    res.setHeader('Cache-Control', 's-maxage=60');
    return res.json({ slug: data.slug, title: data.title, description: data.description, price: rupees(data.price_paise) });
  },

  async create(req, res) {
    if (req.method !== 'POST') return bad(res, 405, 'POST');
    const b = body(req);
    const email = String(b.email || '').trim().toLowerCase();
    const phone = String(b.phone || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/.test(email)) return bad(res, 400, 'Sahi email daalo');
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return bad(res, 400, 'Sahi 10-digit mobile number daalo');
    const mode: RpMode = b.test === true && rpEnabled('test') ? 'test' : 'live';
    const prov = mode === 'test' ? 'razorpay_test' : 'razorpay';
    if (rpEnabled(mode)) {
      const slug = String(b.slug || '');
      const { data: prod } = await db().from('products').select('slug,title,price_paise,active').eq('slug', slug).maybeSingle();
      if (!prod || !prod.active) return bad(res, 404, 'Product nahi mila');
      let { data: o } = await db().from('orders').select('*').eq('product_slug', slug).eq('email', email).eq('status', 'pending')
        .eq('provider', prov).not('rp_link_url', 'is', null).gt('expires_at', new Date().toISOString()).order('created_at', { ascending: false }).limit(1).maybeSingle();
      if (!o) {
        const ins = await db().from('orders').insert({ product_slug: slug, email, phone, price_paise: prod.price_paise, amount_paise: prod.price_paise, provider: prov,
          expires_at: new Date(Date.now() + 30 * 60e3).toISOString() }).select('*').single();
        if (ins.error) return bad(res, 500, 'try again');
        o = ins.data;
        try {
          const back = `https://${req.headers.host}/buy/${encodeURIComponent(slug)}?o=${o.id}&t=${o.token}`;
          const r = await rpCreateLink(mode, prod.price_paise, o.id, prod.title, email, phone, back, { order: o.id, product: slug });
          await db().from('orders').update({ rp_order_id: r.id, rp_link_url: r.short_url }).eq('id', o.id); o.rp_order_id = r.id; o.rp_link_url = r.short_url;
        } catch (e: any) { return bad(res, 502, 'Payment start nahi hua, dobara try karo'); }
      } else if (o.phone !== phone) { await db().from('orders').update({ phone }).eq('id', o.id); o.phone = phone; }
      return res.json({ ...(await orderView(o)), t: o.token, ...rpInfo(o, prod.title) });
    }
    const vpa = await getSetting('upi_vpa');
    if (!vpa) return bad(res, 503, 'Payments abhi band hain, thodi der mein try karo');
    const { data: o, error } = await db().rpc('pay_create_order', { p_slug: String(b.slug || ''), p_email: email, p_phone: phone });
    if (error) return bad(res, error.message.includes('busy') ? 503 : 404, error.message.includes('busy') ? 'Abhi bahut orders chal rahe hain, 5 min baad try karo' : 'Product nahi mila');
    const name = (await getSetting('upi_payee_name')) || (process.env.BRAND_NAME || 'Store');
    return res.json({
      ...(await orderView(o)), t: o.token, vpa, payee: name,
      upi: upiLink(vpa, name, o.amount_paise, `KIT ${o.id.slice(0, 8).toUpperCase()}`), merchant: (await getSetting('upi_is_merchant')) === 'true',
    });
  },

  async status(req, res) {
    const o = await getOrder(String(req.query.id || ''), String(req.query.t || ''));
    if (!o) return bad(res, 404, 'order not found');
    res.setHeader('Cache-Control', 'no-store');
    const v = await orderView(o);
    if (o.status !== 'paid' && isRp(o)) {
      // authoritative check with Razorpay (covers a closed popup / slow redirect)
      if (o.rp_order_id && rpEnabled(modeOf(o.provider)) && Date.now() - new Date(o.created_at).getTime() > 10_000) {
        try { const pay = await rpPaidPayment(modeOf(o.provider), o.rp_order_id); if (pay && pay.amount >= o.amount_paise) { await markPaidRp(o.id, pay.id); return res.json({ ...(await orderView({ ...o, status: 'paid' })), contact: {email: o.email, phone: o.phone} }); } } catch {}
      }
      const { data: prod } = await db().from('products').select('title').eq('slug', o.product_slug).maybeSingle();
      if (!o.rp_link_url && rpEnabled(modeOf(o.provider)) && new Date(o.expires_at).getTime() > Date.now()) {
        try {
          const back = `https://${req.headers.host}/buy/${encodeURIComponent(o.product_slug)}?o=${o.id}&t=${o.token}`;
          const r = await rpCreateLink(modeOf(o.provider), o.amount_paise, o.id, prod?.title || 'Digital kit', o.email, o.phone, back, { order: o.id, product: o.product_slug });
          await db().from('orders').update({ rp_order_id: r.id, rp_link_url: r.short_url }).eq('id', o.id); o.rp_order_id = r.id; o.rp_link_url = r.short_url;
        } catch {}
      }
      return res.json({ ...v, contact: {email: o.email, phone: o.phone}, ...rpInfo(o, prod?.title) });
    }
    if (o.status !== 'paid') {
      const vpa = await getSetting('upi_vpa'); const name = (await getSetting('upi_payee_name')) || (process.env.BRAND_NAME || 'Store');
      const merchant = (await getSetting('upi_is_merchant')) === 'true';
      return res.json({ ...v, contact: {email: o.email, phone: o.phone}, vpa, payee: name, merchant, upi: vpa ? upiLink(vpa, name, o.amount_paise, `KIT ${o.id.slice(0, 8).toUpperCase()}`) : null });
    }
    return res.json({ ...v, contact: {email: o.email, phone: o.phone} });
  },

  /** Buyer fixes email / phone (token holder only). Amount stays the same. If already paid, the kit email is re-sent to the new address. */
  async update(req, res) {
    if (req.method !== 'POST') return bad(res, 405, 'POST');
    const b = body(req);
    const o = await getOrder(String(b.id || ''), String(b.t || ''));
    if (!o) return bad(res, 404, 'order not found');
    const email = String(b.email || '').trim().toLowerCase();
    const phone = String(b.phone || '').replace(/\D/g, '').replace(/^(91|0)(?=\d{10}$)/, '');
    if (!/^[^\s@]{1,64}@[^\s@]{1,190}\.[a-z]{2,}$/.test(email)) return bad(res, 400, 'Sahi email daalo');
    if (phone && !/^[6-9]\d{9}$/.test(phone)) return bad(res, 400, 'Sahi 10-digit mobile number daalo');
    const patch: Record<string, any> = {email, phone};
    if (o.status === 'paid' && email !== o.email) patch.mailed_at = null; // re-send kit to the corrected email
    const {error} = await db().from('orders').update(patch).eq('id', o.id);
    if (error) return bad(res, 500, 'try again');
    return res.json({ok: true, resend: !!(o.status === 'paid' && email !== o.email)});
  },

  /** Razorpay checkout success handler → verify signature → paid */
  async 'rp-verify'(req, res) {
    if (req.method !== 'POST') return bad(res, 405, 'POST');
    const b = body(req);
    const o = await getOrder(String(b.id || ''), String(b.t || ''));
    if (!o || !isRp(o)) return bad(res, 404, 'order not found');
    if (b.razorpay_order_id !== o.rp_order_id || !rpSignatureOk(modeOf(o.provider), o.rp_order_id, String(b.razorpay_payment_id || ''), String(b.razorpay_signature || '')))
      return bad(res, 400, 'Payment verify nahi hua. Agar paise kate hain to 1–2 min mein page khud update ho jayega.');
    await markPaidRp(o.id, String(b.razorpay_payment_id));
    return res.json({ ok: true });
  },

  /** Razorpay webhook (payment.captured / order.paid). No secret needed: we re-check the order with Razorpay's API. */
  async 'rp-webhook'(req, res) {
    try {
      const b = body(req); const pl = b?.payload || {};
      const rpOrder = pl.payment_link?.entity?.id || pl.payment?.entity?.order_id || pl.order?.entity?.id;
      if (rpOrder) {
        const { data: o } = await db().from('orders').select('id,status,amount_paise,provider').eq('rp_order_id', String(rpOrder)).maybeSingle();
        if (o && o.status === 'pending' && rpEnabled(modeOf(o.provider))) { const pay = await rpPaidPayment(modeOf(o.provider), String(rpOrder)); if (pay && pay.amount >= o.amount_paise) await markPaidRp(o.id, pay.id); }
      }
    } catch {}
    return res.json({ ok: true });
  },

  async claim(req, res) {
    if (req.method !== 'POST') return bad(res, 405, 'POST');
    const b = body(req);
    const o = await getOrder(String(b.id || ''), String(b.t || ''));
    if (!o) return bad(res, 404, 'order not found');
    const utr = String(b.utr || '').replace(/\D/g, '');
    if (!/^\d{12}$/.test(utr)) return bad(res, 400, '12-digit UPI Ref / UTR number daalo');
    const { data, error } = await db().rpc('pay_claim_utr', { p_order: o.id, p_utr: utr });
    if (error) return bad(res, 500, 'try again');
    return res.json({ result: data });
  },

  async download(req, res) {
    const o = await getOrder(String(req.query.id || ''), String(req.query.t || ''));
    if (!o || o.status !== 'paid') return bad(res, 403, 'not paid');
    const { data: p } = await db().from('products').select('kit_path').eq('slug', o.product_slug).single();
    if (!p?.kit_path) return bad(res, 409, 'Kit upload ho raha hai — thodi der mein isi link se download karo');
    const name = p.kit_path.split('/').pop();
    const { data, error } = await db().storage.from('kits').createSignedUrl(p.kit_path, 600, { download: name });
    if (error || !data) return bad(res, 500, 'try again');
    await db().from('orders').update({ downloads: (o.downloads || 0) + 1 }).eq('id', o.id);
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, data.signedUrl);
  },

  // ---- Gmail Apps Script ----
  async pair(req, res) {
    if (req.method !== 'POST') return bad(res, 405, 'POST');
    const secret = await pairOnce();
    if (!secret) return bad(res, 403, 'pairing window closed');
    return res.json({ secret });
  },

  async alert(req, res) {
    if (req.method !== 'POST') return bad(res, 405, 'POST');
    const p = await verifySigned(body(req));
    if (!p) return bad(res, 401, 'bad signature');
    const out: any[] = [];
    for (const m of (Array.isArray(p.alerts) ? p.alerts : []).slice(0, 50)) {
      const id = String(m.id || '');
      if (!id) continue;
      const parsed = parseAlert(String(m.subject || ''), String(m.body || ''));
      const trusted = trustedSender(String(m.auth || ''));
      const row = {
        id, from_addr: String(m.from || '').slice(0, 200), subject: String(m.subject || '').slice(0, 300),
        amount_paise: trusted && parsed ? parsed.amount_paise : null, utr: trusted && parsed ? parsed.utr : null,
        received_at: new Date(Number(m.date) || Date.now()).toISOString(),
        note: !trusted ? 'untrusted_sender' : !parsed ? 'not_credit' : null,
      };
      await db().from('pay_alerts').upsert(row, { onConflict: 'id', ignoreDuplicates: true });
      const { data: matched } = await db().rpc('pay_match_alert', { p_alert: id });
      out.push({ id, amount: row.amount_paise, matched: matched || null, note: row.note });
    }
    // Orders that were claimed by UTR before the alert arrived
    const { data: claims } = await db().from('orders').select('id,claimed_utr').eq('status', 'pending')
      .not('claimed_utr', 'is', null).gt('created_at', new Date(Date.now() - 6 * 3600_000).toISOString()).limit(20);
    for (const c of claims || []) await db().rpc('pay_claim_utr', { p_order: c.id, p_utr: c.claimed_utr });
    // Razorpay safety net: buyer paid but closed the tab before returning (no status poll ran)
    const { data: rpPend } = await db().from('orders').select('id,provider,rp_order_id,amount_paise').eq('status', 'pending')
      .in('provider', ['razorpay', 'razorpay_test']).not('rp_order_id', 'is', null)
      .gt('created_at', new Date(Date.now() - 24 * 3600_000).toISOString()).order('created_at', { ascending: false }).limit(25);
    await Promise.all((rpPend || []).map(async (o) => {
      try { if (!rpEnabled(modeOf(o.provider))) return; const pay = await rpPaidPayment(modeOf(o.provider), o.rp_order_id); if (pay && pay.amount >= o.amount_paise) await markPaidRp(o.id, pay.id); } catch {}
    }));
    await setSetting('pay_last_alert_poll', new Date().toISOString());
    return res.json({ processed: out, mail: await pendingMails() });
  },

  async mailed(req, res) {
    if (req.method !== 'POST') return bad(res, 405, 'POST');
    const p = await verifySigned(body(req));
    if (!p) return bad(res, 401, 'bad signature');
    const ids = (Array.isArray(p.ids) ? p.ids : []).filter((x: any) => /^[0-9a-f-]{36}$/.test(String(x)));
    if (ids.length) await db().from('orders').update({ mailed_at: new Date().toISOString() }).in('id', ids);
    return res.json({ ok: ids.length });
  },

  // ---- Admin (CRON_SECRET) ----
  async 'open-pair'(req, res) {
    if (!isCronAuthorized(req)) return bad(res, 401, 'unauthorized');
    await setSetting('pay_pair_until', String(Date.now() + 15 * 60_000));
    return res.json({ open_for_minutes: 15 });
  },

  async 'mark-paid'(req, res) {
    if (!isCronAuthorized(req)) return bad(res, 401, 'unauthorized');
    const { data } = await db().from('orders').update({ status: 'paid', paid_at: new Date().toISOString(), utr: String(req.query.utr || '') || null })
      .eq('id', String(req.query.id || '')).eq('status', 'pending').select('id');
    return res.json({ updated: data?.length || 0 });
  },

  async orders(req, res) {
    if (!isCronAuthorized(req)) return bad(res, 401, 'unauthorized');
    const { data } = await db().from('orders').select('id,product_slug,status,amount_paise,utr,created_at,paid_at,mailed_at,downloads')
      .order('created_at', { ascending: false }).limit(100);
    const last = await getSetting('pay_last_alert_poll');
    return res.json({ last_alert_poll: last, orders: data });
  },

  async 'kit-upload-url'(req, res) {
    if (!isCronAuthorized(req)) return bad(res, 401, 'unauthorized');
    const slug = String(req.query.slug || ''), file = String(req.query.file || '');
    if (!/^[a-z0-9-]+$/.test(slug) || !/^[a-zA-Z0-9._-]+\.(zip|pdf)$/.test(file)) return bad(res, 400, 'bad path');
    const path = `${slug}/${file}`;
    const { data, error } = await db().storage.from('kits').createSignedUploadUrl(path, { upsert: true });
    if (error) return bad(res, 500, error.message);
    await db().from('products').update({ kit_path: path }).eq('slug', slug);
    return res.json({ signedUrl: data.signedUrl, path });
  },

  /** Add / update a paid resource: {slug,title,description,price (rupees),active} */
  async product_upsert(req, res) {
    if (!isCronAuthorized(req)) return bad(res, 401, 'unauthorized');
    const b = body(req);
    if (!/^[a-z0-9-]{2,60}$/.test(String(b.slug || '')) || !(Number(b.price) >= 2)) return bad(res, 400, 'slug + price>=2');
    const { error } = await db().from('products').upsert({
      slug: b.slug, title: String(b.title || b.slug), description: b.description ?? null,
      price_paise: Math.round(Number(b.price) * 100), active: b.active !== false,
    });
    if (error) return bad(res, 500, error.message);
    return res.json({ ok: true, buy_url: `/buy/${b.slug}` });
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fn = OPS[String(req.query.op ?? '')];
  if (!fn) return bad(res, 404, 'not found');
  try { return await fn(req, res); } catch (e: any) { return bad(res, 500, 'server error'); }
}
