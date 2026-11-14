import type { VercelRequest, VercelResponse } from '@vercel/node';
import auth from '../../lib/handlers/youtube/auth.js';
import callback from '../../lib/handlers/youtube/callback.js';

const ROUTES: Record<string, (req: VercelRequest, res: VercelResponse) => unknown> = { auth, callback };
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fn = ROUTES[String(req.query.op ?? '')];
  if (!fn) return res.status(404).send('not found');
  return fn(req, res);
}
