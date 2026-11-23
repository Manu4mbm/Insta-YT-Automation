import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setSetting } from '../../db.js';
import { liAuthUrl, newState } from '../../linkedin.js';
import { SLUG_RE } from '../../account.js';

/**
 * The owner opens this in the browser (logged in to linkedin.com as himself) → consent → /api/x/linkedin-callback.
 *   /api/x/linkedin-auth?account=protech            → posts as the personal profile
 *   /api/x/linkedin-auth?account=protech&as=org     → posts as the Company Page he administers
 *                                                    (needs Community Management API + LINKEDIN_ORG_SCOPES=1)
 *   …&as=org&org=123456                             → pick one page when he administers several
 * Re-open every ~55 days: LinkedIn member tokens expire after 60 days.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const account = String(req.query.account ?? '').toLowerCase();
  if (!SLUG_RE.test(account)) return res.status(400).send('add ?account=<slug>, e.g. ?account=protech');
  const as = req.query.as === 'org' ? 'org' : 'person';
  const org = String(req.query.org ?? '').replace(/\D/g, '');
  const state = newState();
  await setSetting('li_oauth_state', [state, Date.now(), account, as, org].join(':'));
  res.redirect(302, liAuthUrl(state));
}
