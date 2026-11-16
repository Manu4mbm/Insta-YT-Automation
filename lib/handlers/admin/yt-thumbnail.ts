import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db.js';
import { isCronAuthorized } from '../../auth.js';
import { setThumbnail } from '../../yt.js';

/** Protected: (re)apply yt_posts.thumbnail_url to an already uploaded video. GET /api/admin/yt-thumbnail?slug=<slug> */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const slug = String(req.query.slug ?? '');
  const { data: p } = await db().from('yt_posts').select('id, yt_video_id, thumbnail_url').eq('slug', slug).not('yt_video_id', 'is', null).maybeSingle();
  if (!p?.thumbnail_url) return res.status(404).json({ error: 'no uploaded video with thumbnail_url for this slug' });
  try { await setThumbnail(p.yt_video_id, p.thumbnail_url); return res.status(200).json({ ok: true, video: p.yt_video_id }); }
  catch (e: any) { await db().from('yt_posts').update({ error: `thumbnail: ${e.message}`.slice(0, 500) }).eq('id', p.id); return res.status(502).json({ error: e.message }); }
}
