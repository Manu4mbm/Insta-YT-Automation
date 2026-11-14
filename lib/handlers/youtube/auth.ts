import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setSetting } from '../../db.js';
import { ytAuthUrl, newState } from '../../yt.js';

/** The owner opens this once in the browser → Google consent → /api/youtube/callback. */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const state = newState();
  await setSetting('yt_oauth_state', `${state}:${Date.now()}`);
  res.redirect(302, ytAuthUrl(state));
}
