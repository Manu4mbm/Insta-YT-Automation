import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db.js';
import { ig } from '../../ig.js';
import { isCronAuthorized } from '../../auth.js';

/** Protected: delete a published reel from Instagram. GET /api/admin/delete-media?slug=<reel_slug> */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const slug = String(req.query.slug ?? '');
  const { data: p } = await db().from('posts').select('id, ig_media_id').eq('reel_slug', slug).eq('status', 'published').maybeSingle();
  if (!p?.ig_media_id) return res.status(404).json({ error: 'published post not found' });
  try {
    const r = await ig('DELETE', p.ig_media_id);
    await db().from('posts').update({ status: 'error', error: `deleted from IG ${new Date().toISOString()} (repost)` }).eq('id', p.id);
    return res.status(200).json({ ok: true, r });
  } catch (e: any) { return res.status(200).json({ ok: false, error: e.message }); }
}
