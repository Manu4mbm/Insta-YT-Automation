import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setSetting } from '../../db.js';
import { newPkce, xAuthUrl } from '../../x.js';
import { MAIN, SLUG_RE } from '../../account.js';

/**
 * The owner opens this once per X account in the browser → X consent → /api/x/callback.
 * `?account=<slug>` connects an extra account (e.g. protech); without it = main (@indiabybharat).
 * Log in to x.com as the RIGHT account in that browser first: X authorises whoever is signed in.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const account = String(req.query.account ?? MAIN).toLowerCase();
  if (!SLUG_RE.test(account)) return res.status(400).send('bad account slug');
  const p = newPkce();
  await setSetting('x_oauth_state', `${p.state}:${p.verifier}:${Date.now()}:${account}`);
  res.redirect(302, xAuthUrl(p.state, p.challenge));
}
