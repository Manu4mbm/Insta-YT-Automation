import type { VercelRequest, VercelResponse } from '@vercel/node';
import comments from '../../lib/handlers/admin/comments.js';
import paidWatch from '../../lib/handlers/admin/paid-watch.js';
import insights from '../../lib/handlers/admin/insights.js';
import resend from '../../lib/handlers/admin/resend.js';
import uploadUrl from '../../lib/handlers/admin/upload-url.js';
import youtube from '../../lib/handlers/admin/youtube.js';
import ytChannel from '../../lib/handlers/admin/yt-channel.js';
import ytDirect from '../../lib/handlers/admin/yt-direct.js';
import deleteMedia from '../../lib/handlers/admin/delete-media.js';
import account from '../../lib/handlers/admin/account.js';

// One function for all admin routes (Vercel Hobby = max 12 functions).
export const config = { maxDuration: 60 };
const ROUTES: Record<string, (req: VercelRequest, res: VercelResponse) => unknown> = {
  comments, 'paid-watch': paidWatch, insights, resend, 'upload-url': uploadUrl, youtube, 'yt-channel': ytChannel, 'yt-direct': ytDirect, 'delete-media': deleteMedia, account,
};
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const fn = ROUTES[String(req.query.op ?? '')];
  if (!fn) return res.status(404).json({ error: 'not found' });
  return fn(req, res);
}
