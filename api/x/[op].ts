import type { VercelRequest, VercelResponse } from '@vercel/node';
import auth from '../../lib/handlers/x/auth.js';
import callback from '../../lib/handlers/x/callback.js';
import cron from '../../lib/handlers/x/cron.js';
import liAuth from '../../lib/handlers/linkedin/auth.js';
import liCallback from '../../lib/handlers/linkedin/callback.js';
import liCron from '../../lib/handlers/linkedin/cron.js';

// One function for all X + LinkedIn routes (Vercel Hobby = max 12 functions; this project already uses 12).
export const config = { maxDuration: 300 };
const ROUTES: Record<string, (req: VercelRequest, res: VercelResponse) => unknown> = {
  auth, callback, cron,
  'linkedin-auth': liAuth, 'linkedin-callback': liCallback, 'linkedin-cron': liCron,
};
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fn = ROUTES[String(req.query.op ?? '')];
  if (!fn) return res.status(404).send('not found');
  return fn(req, res);
}
