import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db.js';
import { ig, igUserId } from '../../ig.js';
import { isCronAuthorized } from '../../auth.js';
import { handleComment, pickRule, allComments } from '../../../api/webhook.js';

/**
 * Protected (CRON_SECRET) diagnostics + safety net for missed webhooks.
 * GET  /api/admin/comments?slug=<reel_slug>          → comment ids/times, keyword match, already handled?
 * POST /api/admin/comments?slug=<reel_slug>&replay=1 → process unhandled keyword comments (< 7 days old) exactly like the webhook.
 * Never returns comment text or usernames.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const slug = String(req.query.slug ?? '');
  const { data: post } = await db().from('posts').select('id, ig_media_id').eq('reel_slug', slug).maybeSingle();
  if (!post?.ig_media_id) return res.status(404).json({ error: 'post not published' });
  const { data: rules } = await db().from('dm_rules').select('*').eq('active', true).or(`post_id.eq.${post.id},post_id.is.null`);
  const igId = await igUserId();
  try {
    const r = { data: await allComments(post.ig_media_id) };
    const ids = (r.data ?? []).map((c: any) => c.id);
    const { data: logged } = ids.length ? await db().from('dm_log').select('comment_id,status,error,ig_user_id').in('comment_id', ids) : { data: [] as any[] };
    // a row skipped only because the poll saw no text/author is not really handled: let replay retry it
    const retry = new Set((logged ?? []).filter((x: any) => (x.status === 'skipped' && x.error === 'no text/author') || (x.status === 'failed' && /invalid for a private reply/i.test(x.error || ''))).map((x: any) => x.comment_id));
    const knownFrom = new Map((logged ?? []).filter((x: any) => x.ig_user_id && x.ig_user_id !== 'unknown').map((x: any) => [x.comment_id, x.ig_user_id]));
    const done = new Set((logged ?? []).filter((x: any) => !retry.has(x.comment_id)).map((x: any) => x.comment_id));
    const items = (r.data ?? []).map((c: any) => ({
      id: c.id, timestamp: c.timestamp, own: c.from?.id === igId,
      keyword: pickRule(rules ?? [], post.id, c.text ?? '')?.keyword ?? null,
      handled: done.has(c.id), _c: c,
    }));
    const replayed: string[] = [];
    if (req.method === 'POST' && req.query.replay === '1') {
      for (const it of items) {
        const fresh = Date.now() - new Date(it.timestamp).getTime() < 7 * 864e5;
        if (it.keyword && !it.handled && !it.own && fresh) {
          if (retry.has(it.id)) await db().from('dm_log').delete().eq('comment_id', it.id).in('status', ['skipped', 'failed']);
          await handleComment(igId, igId, { id: it.id, text: it._c.text, from: { id: it._c.from?.id || knownFrom.get(it.id) }, media: { id: post.ig_media_id } });
          replayed.push(it.id);
        }
      }
    }
    return res.status(200).json({ count: items.length, comments: items.map(({ _c, ...x }: any) => x), replayed });
  } catch (e: any) {
    return res.status(502).json({ error: e.message });
  }
}
