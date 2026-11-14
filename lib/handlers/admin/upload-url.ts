import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db.js';
import { isCronAuthorized } from '../../auth.js';

/**
 * Protected (CRON_SECRET): returns a one-time signed upload URL for the public "reels" bucket,
 * so Claude's cloud workspace can upload rendered reels without ever holding the service key.
 * GET /api/admin/upload-url?path=<slug>/<file>
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const path = String(req.query.path ?? '');
  if (!/^[a-z0-9-]+\/[a-zA-Z0-9._-]+\.(mp4|png|jpg)$/.test(path)) return res.status(400).json({ error: 'bad path' });
  const { data, error } = await db().storage.from('reels').createSignedUploadUrl(path, { upsert: true });
  if (error) return res.status(500).json({ error: error.message });
  const publicUrl = db().storage.from('reels').getPublicUrl(path).data.publicUrl;
  return res.status(200).json({ signedUrl: data.signedUrl, token: data.token, path, publicUrl });
}
