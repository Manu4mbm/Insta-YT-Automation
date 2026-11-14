import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, setSetting } from '../../db.js';
import { igUserId } from '../../ig.js';
import { isCronAuthorized } from '../../auth.js';
import { handleComment, pickRule, allComments } from '../../../api/webhook.js';

/**
 * Watchdog for PAID reels (rule dm_text has a /buy/ link) — runs every 3 min from pg_cron.
 * Any keyword comment 1 min – 48 h old that has no DM yet (or failed with a transient/blocked error) is processed now.
 * Max 10 per run so the account never bursts. Summary saved in settings.paid_watch_last.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const { data: rules } = await db().from('dm_rules').select('*').eq('active', true).like('dm_text', '%/buy/%').not('post_id', 'is', null);
  const postIds = [...new Set((rules ?? []).map((r: any) => r.post_id))];
  const { data: posts } = postIds.length ? await db().from('posts').select('id, reel_slug, ig_media_id').in('id', postIds).eq('status', 'published') : { data: [] as any[] };
  const igId = await igUserId();
  let budget = 10;
  const out: any[] = [];
  for (const p of posts ?? []) {
    if (!p.ig_media_id) continue;
    try {
      const cs = await allComments(p.ig_media_id, 2);
      const ids = cs.map((c: any) => c.id);
      const { data: logged } = ids.length ? await db().from('dm_log').select('comment_id,status,error,ig_user_id,sent_at').in('comment_id', ids) : { data: [] as any[] };
      const log = new Map((logged ?? []).map((x: any) => [x.comment_id, x]));
      let pending = 0, fixed = 0;
      for (const c of cs) {
        const age = Date.now() - new Date(c.timestamp).getTime();
        if (age < 60e3 || age > 48 * 3600e3 || c.from?.id === igId) continue;
        if (!pickRule(rules ?? [], p.id, c.text ?? '')) continue;
        const l: any = log.get(c.id);
        const retryable = l && ((l.status === 'failed' && /invalid for a private reply/i.test(l.error || ''))
          || (l.status === 'skipped' && l.error === 'no text/author'));
        if (l && !retryable) continue;
        pending++;
        if (budget <= 0) continue;
        budget--;
        if (l) await db().from('dm_log').delete().eq('comment_id', c.id).in('status', ['failed', 'skipped']);
        await handleComment(igId, igId, { id: c.id, text: c.text, from: { id: c.from?.id || (l?.ig_user_id !== 'unknown' ? l?.ig_user_id : undefined) }, media: { id: p.ig_media_id } });
        fixed++;
      }
      out.push({ reel: p.reel_slug, pending, fixed });
    } catch (e: any) { out.push({ reel: p.reel_slug, error: e.message }); }
  }
  await setSetting('paid_watch_last', JSON.stringify({ at: new Date().toISOString(), out }));
  return res.status(200).json({ ok: true, out });
}
