import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setSetting } from '../../db.js';
import { newPkce, xAuthUrl } from '../../x.js';

/** The owner opens this once in the browser → X consent → /api/x/callback. */
export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const p = newPkce();
  await setSetting('x_oauth_state', `${p.state}:${p.verifier}:${Date.now()}`);
  res.redirect(302, xAuthUrl(p.state, p.challenge));
}
