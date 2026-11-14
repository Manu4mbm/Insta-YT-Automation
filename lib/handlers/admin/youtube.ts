import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, getSetting } from '../../db.js';
import { isCronAuthorized } from '../../auth.js';
import { yt } from '../../yt.js';

/** Protected: YouTube connection status + queue + video stats. GET /api/admin/youtube */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const out: any = { connected: Boolean(await getSetting('yt_refresh_token')), channel: JSON.parse((await getSetting('yt_channel')) || 'null') };
  const { data: q } = await db().from('yt_posts').select('slug,kind,status,scheduled_at,yt_video_id,error').order('scheduled_at', { ascending: false }).limit(20);
  out.queue = q;
  const ids = (q ?? []).map((x: any) => x.yt_video_id).filter(Boolean);
  if (out.connected) {
    try {
      const ch = await yt<any>('GET', 'channels', { part: 'statistics', mine: 'true' });
      out.stats = ch.items?.[0]?.statistics;
      if (ids.length) {
        const v = await yt<any>('GET', 'videos', { part: 'statistics,status', id: ids.join(',') });
        out.videos = (v.items ?? []).map((x: any) => ({ id: x.id, privacy: x.status?.privacyStatus, publishAt: x.status?.publishAt, ...x.statistics }));
      }
    } catch (e: any) { out.error = e.message; }
  }
  return res.status(200).json(out);
}
