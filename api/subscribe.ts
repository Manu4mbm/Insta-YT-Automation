import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ig } from '../lib/ig.js';
import { isCronAuthorized } from '../lib/auth.js';

/** Protected: GET = current webhook subscription of our IG account; POST = subscribe to comments + messages + postbacks. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  try {
    if (req.method === 'POST') {
      const r = await ig('POST', 'me/subscribed_apps', { subscribed_fields: 'comments,messages,messaging_postbacks' });
      return res.status(200).json({ subscribed: r });
    }
    const r = await ig('GET', 'me/subscribed_apps');
    return res.status(200).json(r);
  } catch (e: any) {
    return res.status(502).json({ error: e.message });
  }
}
