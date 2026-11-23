import type { VercelRequest, VercelResponse } from '@vercel/node';
import auth from '../../lib/handlers/x/auth.js';
import callback from '../../lib/handlers/x/callback.js';
import cron from '../../lib/handlers/x/cron.js';

// One function for all X routes (Vercel Hobby = max 12 functions).
export const config = { maxDuration: 300 };
const ROUTES: Record<string, (req: VercelRequest, res: VercelResponse) => unknown> = { auth, callback, cron };
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fn = ROUTES[String(req.query.op ?? '')];
  if (!fn) return res.status(404).send('not found');
  return fn(req, res);
}
