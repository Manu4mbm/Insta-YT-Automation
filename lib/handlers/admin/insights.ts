import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db.js';
import { ig } from '../../ig.js';
import { isCronAuthorized } from '../../auth.js';

/** Protected (CRON_SECRET): reel insights. GET /api/admin/insights?slug=<reel_slug> */
const METRICS = ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'total_interactions', 'ig_reels_avg_watch_time', 'ig_reels_video_view_total_time', 'follows', 'profile_visits'];
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const { data: post } = await db().from('posts').select('ig_media_id, published_at').eq('reel_slug', String(req.query.slug ?? '')).maybeSingle();
  if (!post?.ig_media_id) return res.status(404).json({ error: 'post not published' });
  const out: Record<string, any> = { published_at: post.published_at };
  try {
    const m = await ig<any>('GET', post.ig_media_id, { fields: 'like_count,comments_count,permalink,timestamp' });
    Object.assign(out, m);
  } catch (e: any) { out.media_error = e.message; }
  for (const k of METRICS) { // one call per metric so one unsupported metric doesn't fail all
    try {
      const r = await ig<any>('GET', `${post.ig_media_id}/insights`, { metric: k });
      out[k] = r.data?.[0]?.values?.[0]?.value ?? r.data?.[0]?.total_value?.value ?? null;
    } catch (e: any) { out[k] = `n/a: ${String(e.message).slice(0, 90)}`; }
  }
  return res.status(200).json(out);
}
