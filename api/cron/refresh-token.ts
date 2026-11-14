import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setSetting } from '../../lib/db.js';
import { igToken } from '../../lib/ig.js';
import { isCronAuthorized } from '../../lib/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const url = new URL('https://graph.instagram.com/refresh_access_token');
  url.searchParams.set('grant_type', 'ig_refresh_token');
  url.searchParams.set('access_token', await igToken());
  const r = await fetch(url);
  const json: any = await r.json().catch(() => ({}));
  if (!r.ok || !json.access_token) {
    return res.status(502).json({ ok: false, error: json?.error?.message || `HTTP ${r.status}` });
  }
  const expiresAt = new Date(Date.now() + (json.expires_in ?? 0) * 1000).toISOString();
  await setSetting('ig_access_token', json.access_token);
  await setSetting('ig_token_expires_at', expiresAt);
  return res.status(200).json({ ok: true, expires_at: expiresAt }); // token itself never returned
}
