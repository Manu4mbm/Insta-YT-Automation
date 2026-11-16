import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db.js';
import { isCronAuthorized } from '../../auth.js';
import { yt } from '../../yt.js';

/** Protected: move an uploaded-but-unpublished video's publishAt to yt_posts.scheduled_at. GET /api/admin/yt-reschedule?slug=<slug> */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const slug = String(req.query.slug ?? '');
  const { data: p } = await db().from('yt_posts').select('id, yt_video_id, scheduled_at').eq('slug', slug).not('yt_video_id', 'is', null).maybeSingle();
  if (!p) return res.status(404).json({ error: 'no uploaded video for this slug' });
  const at = new Date(p.scheduled_at);
  if (at.getTime() < Date.now() + 5 * 60e3) return res.status(400).json({ error: 'scheduled_at must be at least 5 min in the future' });
  try {
    const cur = await yt<any>('GET', 'videos', { part: 'status', id: p.yt_video_id });
    const st = cur.items?.[0]?.status;
    if (!st) return res.status(404).json({ error: 'video not found on YouTube' });
    if (st.privacyStatus === 'public') return res.status(409).json({ error: 'already public' });
    const status = { ...st, privacyStatus: 'private', publishAt: at.toISOString() };
    delete status.uploadStatus; delete status.failureReason; delete status.rejectionReason;
    const out = await yt<any>('PUT', 'videos', { part: 'status' }, { id: p.yt_video_id, status });
    return res.status(200).json({ ok: true, video: p.yt_video_id, publishAt: out.status?.publishAt, privacy: out.status?.privacyStatus });
  } catch (e: any) { return res.status(502).json({ error: e.message }); }
}
