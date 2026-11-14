import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../lib/db.js';
import { ig, igUserId } from '../../lib/ig.js';
import { isCronAuthorized } from '../../lib/auth.js';
import { handleComment, handleMessaging, pickRule, allComments, userFollows } from '../webhook.js';
import { inCooldown, cooldownUntil, isRateLimit } from '../../lib/throttle.js';
import { canSend, send, sendLink } from '../../lib/send.js';

const ACTIONS_PER_RUN = 3; // users who replied/tapped (followers get their link first)
const MAX_NEW_PER_RUN = 2; // paced: ≤2 new comment DMs per minute (~150 msgs/h incl. links) so Instagram doesn't action-block the account

const FOLLOWED_NUDGES = ['Follow ke liye thanks 🙌 DM mein bas "done" likh do, link turant aa jayega 📩', 'Thanks for following! 🙌 DM mein "done" bhejo, guide turant milega', 'Follow dikh gaya ✅ DM mein "done" likh do, link bhej deta hoon 📩']

export const config = { maxDuration: 60 };

/**
 * Polling safety net (runs every minute via Supabase pg_cron).
 * Meta only delivers webhooks after Advanced Access; this catches the same events by polling:
 *  1) comments (keyword, or any comment if the reel's rule has any_comment) on reels published in the last 7 days that have no dm_log row → handleComment
 *  2) DM threads where a gated user wrote/tapped after our last message → handleMessaging (follow check → link or nudge)
 * Idempotent: dm_log (one row per comment) + dm_log.poll_seen_at.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const igId = await igUserId();
  const log: string[] = [];
  const since7 = new Date(Date.now() - 7 * 864e5).toISOString();
  if (await inCooldown()) return res.status(200).json({ ok: true, log: [`instagram cooldown until ${new Date(await cooldownUntil()).toISOString()}`] });
  // Human-like rhythm: skip ~1 in 3 runs at random so sends never land at machine-regular intervals.
  if (Math.random() < 0.33) return res.status(200).json({ ok: true, log: ['jitter skip'] });
  if (!(await canSend())) return res.status(200).json({ ok: true, log: ['hourly/daily send budget reached — waiting'] });
  let budget = MAX_NEW_PER_RUN;
  const t0 = Date.now(); const timeLeft = () => 42000 - (Date.now() - t0); // one send can take ~20 s (follow check + 3–7 s pacing + IG call) → every step keeps ≥20 s spare under the 60 s limit

  // 2) DM threads of gated users — scan ALL recent conversations (paginated), not just the latest 25,
  //    so no "Follow kar liya" tap is missed on a viral reel. Oldest waiting first, ≤ACTIONS_PER_RUN sends/min.
  try {
    const { data: gates } = await db().from('dm_log').select('*').eq('status', 'gated').gte('sent_at', since7);
    if (gates?.length && !(await inCooldown())) {
      const byUser = new Map<string, any[]>();
      for (const g of gates) byUser.set(g.ig_user_id, [...(byUser.get(g.ig_user_id) ?? []), g]);
      const todo: { gate: any; from: string; at: number }[] = [];
      let after: string | undefined;
      // Full scan only every 5th minute; otherwise the 2 newest pages (taps land on top) → leaves time for new comments.
      const pages = new Date().getMinutes() % 5 === 0 ? 12 : 2;
      for (let page = 0; page < pages && timeLeft() > 34000; page++) {
        const conv = await ig<any>('GET', 'me/conversations', { platform: 'instagram', fields: 'updated_time,messages.limit(1){from,created_time}', limit: 50, ...(after ? { after } : {}) });
        for (const c of conv.data ?? []) {
          const last = c.messages?.data?.[0];
          const from = last?.from?.id;
          if (!last || !from || from === igId) continue; // last word was ours → nothing new from the user
          const list = byUser.get(from); if (!list) continue;
          const at = new Date(last.created_time).getTime();
          const gate = list.filter((g: any) => at > new Date(g.sent_at).getTime() && !(g.poll_seen_at && at <= new Date(g.poll_seen_at).getTime()))
            .sort((x: any, y: any) => new Date(y.sent_at).getTime() - new Date(x.sent_at).getTime())[0];
          if (gate) todo.push({ gate, from, at });
        }
        after = conv.paging?.cursors?.after;
        const oldest = conv.data?.[conv.data.length - 1]?.updated_time;
        if (!after || !conv.data?.length || (oldest && new Date(oldest).getTime() < Date.now() - 7 * 864e5)) break;
      }
      todo.sort((x, y) => x.at - y.at);
      log.push(`gates waiting for a reply: ${todo.length}`);
      for (const t of todo.slice(0, ACTIONS_PER_RUN)) {
        if (timeLeft() < 24000 || !(await canSend())) break;
        await db().from('dm_log').update({ poll_seen_at: new Date(t.at).toISOString() }).eq('comment_id', t.gate.comment_id);
        await handleMessaging(igId, { sender: { id: t.from }, postback: { payload: `GATE:${t.gate.comment_id}` } });
        log.push(`gate ${t.gate.comment_id}: user action processed`);
      }
    }
  } catch (e: any) { log.push(`conversations error ${e.message}`); }

  // 4) followers whose link DM was blocked by Instagram's rate limit → resend (max 5 tries, ≤4 per run).
  try {
    if (!(await inCooldown())) {
      const { data: pend } = await db().from('dm_log').select('*')
        .eq('status', 'gated').gte('sent_at', since7).lt('retries', 5)
        .or('error.like.deliver:%,error.like.auto-dm blocked:%')
        .order('sent_at', { ascending: true }).limit(1);
      for (const g of pend ?? []) {
        if (timeLeft() < 24000) break;
        let follows = false;
        try { follows = await userFollows(g.ig_user_id); } catch { continue; }
        if (!follows) continue;
        const { data: rule } = await db().from('dm_rules').select('dm_text').eq('id', g.rule_id).maybeSingle();
        if (!rule) continue;
        try {
          if (!(await canSend())) break;
          await sendLink('dm', igId, { id: g.ig_user_id }, rule.dm_text);
          await db().from('dm_log').update({ status: 'delivered', delivered_at: new Date().toISOString(), error: null }).eq('comment_id', g.comment_id);
          log.push(`gate ${g.comment_id}: pending link delivered`);
        } catch (e: any) {
          await db().from('dm_log').update({ retries: (g.retries ?? 0) + 1, error: `deliver: ${e.message}`.slice(0, 300) }).eq('comment_id', g.comment_id);
          if (isRateLimit(e.message)) break;
        }
      }
    }
  } catch (e: any) { log.push(`pending deliver error ${e.message}`); }

  // 1) comments
  const { data: posts } = await db().from('posts').select('id, reel_slug, ig_media_id').eq('status', 'published').gte('published_at', since7).order('published_at', { ascending: false }); // newest reel first — fresh comments never wait behind old backlog
  // Rotate the starting reel every minute (newest first on even minutes) so a busy new reel never starves older reels' backlog.
  const rot = (posts ?? []).length ? new Date().getMinutes() % (posts ?? []).length : 0;
  const rotated = new Date().getMinutes() % 2 === 0 ? (posts ?? []) : [...(posts ?? []).slice(rot), ...(posts ?? []).slice(0, rot)];
  // Paid reels (rule links to /buy/) always first — a buyer must never wait
  const { data: paidRules } = await db().from('dm_rules').select('post_id').eq('active', true).like('dm_text', '%/buy/%');
  const paidSet = new Set((paidRules ?? []).map((r: any) => r.post_id));
  const ordered = [...rotated.filter((p: any) => paidSet.has(p.id)), ...rotated.filter((p: any) => !paidSet.has(p.id))];
  for (const p of ordered) {
    if (!p.ig_media_id || budget <= 0 || timeLeft() < 24000) continue;
    try {
      const { data: rules } = await db().from('dm_rules').select('*').eq('active', true).or(`post_id.eq.${p.id},post_id.is.null`);
      if (!rules?.length) continue;
      // newest page only most minutes (fast pickup of fresh comments); full 10-page backlog scan every 10th minute
      const r = { data: await allComments(p.ig_media_id, new Date().getMinutes() % 10 === 0 ? 10 : 1, Date.now() + timeLeft() - 20000) };
      const ids = (r.data ?? []).map((c: any) => c.id);
      if (!ids.length) continue;
      const { data: done } = await db().from('dm_log').select('comment_id, status, retries, sent_at, error').in('comment_id', ids);
      // Failed private replies (e.g. Instagram's temporary spam/rate limit) are retried: up to 3 more tries, 30+ min apart.
      const retryAt = Date.now() - 30 * 60e3;
      const retry = new Map<string, number>();
      const seen = new Set<string>();
      const { data: srv } = await db().from('dm_log').select('ig_user_id').eq('post_id', p.id).in('status', ['gated', 'delivered']);
      const served = new Set<string>((srv ?? []).map((r: any) => r.ig_user_id));
      for (const d of done ?? []) {
        // Instagram's transient "(#2) Service temporarily unavailable" is not the user's fault → up to 10 tries
        const transient = /\(#2\/|temporarily unavailable/i.test(d.error ?? '');
        // IG's '(#2) Service temporarily unavailable' often DOES deliver the private reply → never retry it (retrying spammed one user ~10x)
        if (d.status === 'failed' && !transient && (d.retries ?? 0) < 3 && new Date(d.sent_at).getTime() < retryAt) retry.set(d.comment_id, (d.retries ?? 0) + 1);
        else seen.add(d.comment_id);
      }
      for (const c of r.data ?? []) {
        if (budget <= 0 || timeLeft() < 20000 || !(await canSend())) break;
        if (seen.has(c.id) || c.from?.id === igId) continue;
        // GIF/sticker-only comments or hidden authors can't get a private reply → mark once, never burn the budget on them
        if (!c.text || !c.from?.id) { await db().from('dm_log').insert({ comment_id: c.id, ig_user_id: c.from?.id ?? 'unknown', post_id: p.id, keyword: '-', status: 'skipped', error: 'no text/author' }); continue; }
        if (!pickRule(rules, p.id, c.text ?? '')) continue;
        // Same person already got (or is gated for) this reel's resource → record the skip, no send, no budget
        if (served.has(c.from.id)) { await db().from('dm_log').insert({ comment_id: c.id, ig_user_id: c.from.id, post_id: p.id, keyword: '-', status: 'skipped' }); continue; }
        served.add(c.from.id);
        budget--;
        const n = retry.get(c.id);
        if (n !== undefined) await db().from('dm_log').delete().eq('comment_id', c.id).eq('status', 'failed');
        await handleComment(igId, igId, { id: c.id, text: c.text, from: { id: c.from?.id }, media: { id: p.ig_media_id }, retries: n ?? 0 });
        log.push(`${p.reel_slug}: comment ${c.id} handled${n ? ` (retry ${n})` : ''}`);
      }
    } catch (e: any) { log.push(`${p.reel_slug}: comments error ${e.message}`); }
  }

  // 3) gated users who followed from the profile without tapping the button.
  //    Check follow every ~10 min (7-day window). If followed: try the link DM once; if Meta blocks it
  //    (no reply from the user yet), post ONE public reply on their comment asking them to DM "done".
  try {
    const cut = new Date(Date.now() - 10 * 60e3).toISOString();
    const { data: watch } = await db().from('dm_log').select('*')
      .eq('status', 'gated').gte('sent_at', since7).is('follow_nudged_at', null)
      .or(`follow_checked_at.is.null,follow_checked_at.lt.${cut}`)
      .order('follow_checked_at', { ascending: true, nullsFirst: true }).limit(15);
    let nudges = 0;
    for (const g of watch ?? []) {
      if (timeLeft() < 20000) break;
      await db().from('dm_log').update({ follow_checked_at: new Date().toISOString() }).eq('comment_id', g.comment_id);
      let follows = false;
      try { follows = await userFollows(g.ig_user_id); } catch { continue; }
      if (!follows) continue;
      const { data: rule } = await db().from('dm_rules').select('dm_text').eq('id', g.rule_id).maybeSingle();
      if (!rule) continue;
      try {
        if (!(await canSend())) break;
        await sendLink('dm', igId, { id: g.ig_user_id }, rule.dm_text);
        await db().from('dm_log').update({ status: 'delivered', delivered_at: new Date().toISOString(), error: null }).eq('comment_id', g.comment_id);
        log.push(`gate ${g.comment_id}: followed via profile → link sent`);
      } catch (e: any) {
        if (isRateLimit(e.message)) { await db().from('dm_log').update({ error: `deliver: ${e.message}`.slice(0, 300) }).eq('comment_id', g.comment_id); break; }
        if (nudges >= 1) continue; // ≤1 public nudge per minute
        nudges++;
        try {
          await send('public_reply', `${g.comment_id}/replies`, { message: FOLLOWED_NUDGES[Math.floor(Math.random() * FOLLOWED_NUDGES.length)] });
          await db().from('dm_log').update({ follow_nudged_at: new Date().toISOString(), error: `auto-dm blocked: ${e.message}`.slice(0, 300) }).eq('comment_id', g.comment_id);
          log.push(`gate ${g.comment_id}: followed via profile → public nudge`);
        } catch (e2: any) {
          await db().from('dm_log').update({ follow_nudged_at: new Date().toISOString(), error: `nudge: ${e2.message}`.slice(0, 300) }).eq('comment_id', g.comment_id);
        }
      }
    }
  } catch (e: any) { log.push(`follow watch error ${e.message}`); }

  log.push(`took ${Date.now() - t0} ms`);
  return res.status(200).json({ ok: true, log });
}
