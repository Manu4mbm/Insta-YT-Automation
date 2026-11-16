import { getSetting } from '../lib/db.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import crypto from 'node:crypto';
import { env } from '../lib/env.js';
import { db } from '../lib/db.js';
import { ig, igUserId } from '../lib/ig.js';
import { accountForIgId, runAs } from '../lib/account.js';
import { isRateLimit, PUBLIC_REPLIES } from '../lib/throttle.js';
import { canSend, send, sendLink, vary, isHot } from '../lib/send.js';

export const config = { api: { bodyParser: false }, maxDuration: 30 };

const HANDLE = process.env.IG_HANDLE ? '@' + process.env.IG_HANDLE.replace(/^@/, '') : 'us';
const DEFAULT_GATE_TEXT =
  `Hey! 👋 Resource ready hai.\nBas ${HANDLE} ko follow karo, phir neeche button dabao (ya yahan "done" likh do) — link turant aa jayega 📩`;
const NOT_FOLLOWING_TEXT =
  `Abhi follow nahi dikh raha 🙂\n${HANDLE} ko follow karo, phir button dobara dabao — link turant bhej dunga.`;
const BUTTON_TITLE = 'Follow kar liya ✅';
const MAX_GATE_ATTEMPTS = 2; // nudges only in reply to the user's own tap/message
const GATE_WINDOW_DAYS = 7;

async function rawBody(req: VercelRequest): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(typeof c === 'string' ? Buffer.from(c) : c);
  return Buffer.concat(chunks);
}

function validSignature(raw: Buffer, header: string | undefined): boolean {
  if (!header?.startsWith('sha256=')) return false;
  const expected = crypto.createHmac('sha256', env('META_APP_SECRET')).update(raw).digest('hex');
  const got = header.slice(7);
  return got.length === expected.length && crypto.timingSafeEqual(Buffer.from(got), Buffer.from(expected));
}

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export function matchesKeyword(text: string, keyword: string): boolean {
  return new RegExp(`(^|[^\\p{L}\\p{N}])${esc(keyword)}($|[^\\p{L}\\p{N}])`, 'iu').test(text);
}

/**
 * Rule for a comment — scoped to its own reel, never mixed across reels:
 * 1) this reel's keyword rule, 2) a global keyword rule, 3) this reel's "any comment" rule (any_comment=true).
 */
export function pickRule(rules: any[], postId: string | null | undefined, text: string): any | null {
  const own = postId ? rules.filter((r) => r.post_id === postId) : [];
  const glob = rules.filter((r) => !r.post_id);
  return own.find((r) => matchesKeyword(text, r.keyword))
    ?? glob.find((r) => matchesKeyword(text, r.keyword))
    ?? own.find((r) => r.any_comment)
    ?? null;
}

/** All top-level comments on a media (paginated, capped). */
export async function allComments(mediaId: string, maxPages = 10, deadline = Infinity): Promise<any[]> {
  const out: any[] = [];
  let after: string | undefined;
  for (let i = 0; i < maxPages && Date.now() < deadline; i++) {
    const r = await ig<any>('GET', `${mediaId}/comments`, { fields: 'id,text,timestamp,from{id}', limit: 50, ...(after ? { after } : {}) });
    out.push(...(r.data ?? []));
    after = r.paging?.next ? r.paging?.cursors?.after : undefined;
    if (!after) break;
  }
  return out;
}

function buttonMessage(text: string, payload: string) {
  return {
    attachment: {
      type: 'template',
      payload: {
        template_type: 'button',
        text,
        buttons: [{ type: 'postback', title: BUTTON_TITLE, payload }],
      },
    },
  };
}

/** Comment → ONE private reply (gate message with button, or the resource if gate is off). */
export async function handleComment(igId: string, entryId: string | undefined, v: any) {
  const commentId: string | undefined = v?.id;
  const text: string = v?.text ?? '';
  const fromId: string | undefined = v?.from?.id;
  const mediaId: string | undefined = v?.media?.id;
  if (!commentId || !text || !fromId) return;
  if (fromId === igId || fromId === entryId) return; // own comment / our own public replies

  const { data: post } = mediaId
    ? await db().from('posts').select('id').eq('ig_media_id', mediaId).maybeSingle()
    : { data: null };

  let q = db().from('dm_rules').select('*').eq('active', true);
  q = post ? q.or(`post_id.eq.${post.id},post_id.is.null`) : q.is('post_id', null);
  const { data: rules } = await q;
  const rule = pickRule(rules ?? [], post?.id, text);
  if (!rule) { console.log('comment: no rule', JSON.stringify({media: mediaId, knownPost: Boolean(post)})); return; }
  console.log('comment: rule', rule.keyword);

  // One resource per person per reel: a second comment by the same user on the same reel gets nothing.
  if (post) {
    const { data: prior } = await db().from('dm_log').select('comment_id')
      .eq('post_id', post.id).eq('ig_user_id', fromId).neq('status', 'skipped').neq('status', 'failed').limit(1);
    if (prior?.length) {
      await db().from('dm_log').insert({ comment_id: commentId, ig_user_id: fromId, post_id: post.id, keyword: rule.keyword, rule_id: rule.id, status: 'skipped' });
      return;
    }
  }

  // Paused by Instagram or over our hourly/daily budget → don't send now; the poller picks this comment up later (7-day window).
  if (!(await canSend())) return;
  const hot = await isHot(post?.id);

  // Claim the comment first: one private reply per comment, ever.
  const { error: claimErr } = await db().from('dm_log').insert({
    comment_id: commentId, ig_user_id: fromId, post_id: post?.id ?? null,
    keyword: rule.keyword, rule_id: rule.id, status: rule.follow_gate ? 'gated' : 'delivered', retries: v?.retries ?? 0,
  });
  if (claimErr) return; // duplicate delivery → already handled

  // Already a follower? Skip the gate and send the resource in the one allowed private reply.
  let alreadyFollows = false;
  if (rule.follow_gate) {
    try { alreadyFollows = await userFollows(fromId); } catch { /* profile not available yet → gate */ }
  }
  // Follow-gate always stays on. Hot reels only lose the public "check DM" reply.
  const gated = rule.follow_gate && !alreadyFollows;
  if (!gated) await db().from('dm_log').update({ status: 'delivered' }).eq('comment_id', commentId);
  try {
    if (gated) await send('private_reply', `${igId}/messages`, {}, { recipient: { comment_id: commentId }, message: buttonMessage(vary(rule.gate_text || DEFAULT_GATE_TEXT), `GATE:${commentId}`) });
    else await sendLink('private_reply', igId, { comment_id: commentId }, rule.dm_text);
    await db().from('dm_log')
      .update({ ok: true, ...(gated ? {} : { delivered_at: new Date().toISOString() }) })
      .eq('comment_id', commentId);
  } catch (e: any) {
    if (isRateLimit(e.message)) {
      // Not this user's fault: release the claim (the private reply was not used) and pause sending.
      await db().from('dm_log').delete().eq('comment_id', commentId);
      return;
    }
    if (/invalid for a private reply/i.test(e.message)) {
      // Instagram won't allow a private reply on this comment (thread reply / restricted account).
      // Fallback: ask them in public to DM us; any DM from them is then handled like a gate (follow check → link).
      await db().from('dm_log').update({ ok: false, status: 'gated', error: `private reply blocked → asked to DM`.slice(0, 300) }).eq('comment_id', commentId);
      try { await send('public_reply', `${commentId}/replies`, { message: `Aapke comment pe DM nahi ja pa raha 🙏 Mujhe DM mein "${rule.keyword}" likh do, link turant bhej dunga 📩` }); } catch {}
      return;
    }
    await db().from('dm_log').update({ ok: false, status: 'failed', error: e.message }).eq('comment_id', commentId);
    return; // don't post "check DM" if the DM failed
  }
  // Public "check DM" reply: varied wording and at most 4 per 15 min, so it never looks like spam.
  // Public "DM check karo" replies can be switched off (settings.public_replies = 'off') so the whole send budget goes to guides.
  if (rule.public_reply && !hot && (await getSetting('public_replies')) !== 'off' && (await canSend())) {
    const since = new Date(Date.now() - 15 * 60e3).toISOString();
    const { count } = await db().from('dm_log').select('comment_id', { count: 'exact', head: true }).gte('public_replied_at', since);
    if ((count ?? 0) < 4) {
      const text = PUBLIC_REPLIES[Math.floor(Math.random() * PUBLIC_REPLIES.length)];
      try {
        await send('public_reply', `${commentId}/replies`, { message: text });
        await db().from('dm_log').update({ public_replied_at: new Date().toISOString() }).eq('comment_id', commentId);
      } catch (e: any) {
        await db().from('dm_log').update({ error: `public reply: ${e.message}`.slice(0, 300) }).eq('comment_id', commentId);
      }
    }
  }
}

export async function userFollows(igsid: string): Promise<boolean> {
  const p = await ig<any>('GET', igsid, { fields: 'is_user_follow_business' });
  return p?.is_user_follow_business === true;
}

/** User tapped the button or replied → check follow → send resource or a nudge. */
export async function handleMessaging(igId: string, m: any) {
  const sender: string | undefined = m?.sender?.id;
  if (!sender || sender === igId) return;
  if (m?.message?.is_echo) return;
  const payload: string | undefined = m?.postback?.payload ?? m?.message?.quick_reply?.payload;
  const isUserAction = Boolean(m?.postback || m?.message?.text);
  if (!isUserAction) return;

  // Find the gated request: by payload's comment id, else the user's latest open gate.
  const since = new Date(Date.now() - GATE_WINDOW_DAYS * 864e5).toISOString();
  let gate: any = null;
  if (payload?.startsWith('GATE:')) {
    const { data } = await db().from('dm_log').select('*').eq('comment_id', payload.slice(5)).maybeSingle();
    gate = data && data.ig_user_id === sender ? data : null;
  }
  if (!gate) {
    const { data } = await db().from('dm_log').select('*')
      .eq('ig_user_id', sender).eq('status', 'gated').gte('sent_at', since)
      .order('sent_at', { ascending: false }).limit(1).maybeSingle();
    gate = data;
  }
  if (!gate || gate.status !== 'gated') return; // nothing pending → ignore (normal DM)

  const { data: rule } = await db().from('dm_rules').select('*').eq('id', gate.rule_id).maybeSingle();
  if (!rule) return;

  let follows = false;
  try {
    follows = await userFollows(sender);
  } catch (e: any) {
    await db().from('dm_log').update({ error: `follow check: ${e.message}` }).eq('comment_id', gate.comment_id);
    return;
  }

  if (follows) {
    if (!(await canSend())) { // send later from the poller (step 4)
      await db().from('dm_log').update({ error: 'deliver: pending (paced)' }).eq('comment_id', gate.comment_id);
      return;
    }
    try {
      await sendLink('dm', igId, { id: sender }, rule.dm_text);
      await db().from('dm_log')
        .update({ status: 'delivered', delivered_at: new Date().toISOString(), error: null })
        .eq('comment_id', gate.comment_id);
    } catch (e: any) {
      await db().from('dm_log').update({ error: `deliver: ${e.message}`.slice(0, 300) }).eq('comment_id', gate.comment_id);
    }
    return;
  }

  if (gate.gate_attempts >= MAX_GATE_ATTEMPTS) return; // stop nudging
  if (!(await canSend())) return;
  await db().from('dm_log').update({ gate_attempts: gate.gate_attempts + 1 }).eq('comment_id', gate.comment_id);
  try {
    await send('nudge', `${igId}/messages`, {}, {
      recipient: { id: sender },
      message: buttonMessage(vary(NOT_FOLLOWING_TEXT), `GATE:${gate.comment_id}`),
    });
  } catch (e: any) {
    await db().from('dm_log').update({ error: `nudge: ${e.message}`.slice(0, 300) }).eq('comment_id', gate.comment_id);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const q = req.query;
    if (q['hub.mode'] === 'subscribe' && q['hub.verify_token'] === env('WEBHOOK_VERIFY_TOKEN')) {
      return res.status(200).send(String(q['hub.challenge'] ?? ''));
    }
    return res.status(403).send('forbidden');
  }
  if (req.method !== 'POST') return res.status(405).end();

  const raw = await rawBody(req);
  if (!validSignature(raw, req.headers['x-hub-signature-256'] as string | undefined)) {
    return res.status(401).send('bad signature');
  }
  let payload: any;
  try {
    payload = JSON.parse(raw.toString('utf8'));
  } catch {
    return res.status(200).send('ok');
  }

  try {
    for (const entry of payload?.entry ?? []) {
      await runAs(await accountForIgId(entry?.id), async () => {
      const igId = await igUserId();
      // diagnostics (no message text / personal data logged)
      console.log('webhook', JSON.stringify({object: payload?.object, fields: (entry?.changes ?? []).map((c: any) => c?.field), messaging: (entry?.messaging ?? []).length}));
      for (const change of entry?.changes ?? []) {
        if (change?.field === 'comments') await handleComment(igId, entry?.id, change.value);
      }
      for (const m of entry?.messaging ?? []) await handleMessaging(igId, m);
      });
    }
  } catch (e) {
    console.error('webhook error', (e as Error).message);
  }
  return res.status(200).send('ok');
}
