import type { VercelRequest } from '@vercel/node';
import { env } from './env.js';

/** Vercel Cron sends `Authorization: Bearer <CRON_SECRET>`. */
export function isCronAuthorized(req: VercelRequest): boolean {
  const secret = env('CRON_SECRET');
  return req.headers.authorization === `Bearer ${secret}`;
}
