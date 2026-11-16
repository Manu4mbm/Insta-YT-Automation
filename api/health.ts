import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../lib/db.js';
import { ig, igUserId, isUnified } from '../lib/ig.js';
import { isCronAuthorized } from '../lib/auth.js';
import { runAs, listAccounts } from '../lib/account.js';

/** Protected health check: token valid? IG_USER_ID matches? Supabase reachable? Never returns secrets. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const acct = String(req.query.account ?? 'main');
  return runAs(acct, () => check(res, acct));
}

async function check(res: VercelResponse, acct: string) {
  const out: Record<string, unknown> = { account: acct };
  try { out.accounts = await listAccounts(); } catch { /* settings table unreachable: reported below */ }
  const missing = ['IG_USER_ID', 'IG_ACCESS_TOKEN', 'META_APP_SECRET', 'WEBHOOK_VERIFY_TOKEN', 'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY']
    .filter((k) => !process.env[k]);
  out.missing_env = missing;
  try {
    const { count, error, status } = await db().from('posts').select('id', { count: 'exact' }).limit(1);
    const k = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
    const keyKind = k.startsWith('sb_secret_') ? 'sb_secret' : k.startsWith('sb_publishable_') ? 'sb_publishable(WRONG)' : k.startsWith('eyJ') ? 'jwt' : 'unknown';
    out.supabase = error ? { error: error.message || error.code || 'unknown', status, key_kind: keyKind } : `ok (${count} posts)`;
  } catch (e: any) { out.supabase = `error: ${e.message}`; }
  try {
    const me = await ig<any>('GET', 'me', { fields: isUnified() ? 'id,username' : 'user_id,username,account_type' });
    const configured = await igUserId();
    out.instagram = {
      token: 'ok',
      setup: isUnified() ? 'unified-login (graph.facebook.com)' : 'instagram-login (graph.instagram.com)',
      username: me.username,
      ig_user_id: me.user_id ?? me.id, // public account id, not a secret
      account_type: me.account_type,
      ig_user_id_matches: configured === me.user_id || configured === me.id,
    };
    try {
      const lim = await ig<any>('GET', `${configured}/content_publishing_limit`, { fields: 'quota_usage,config' });
      out.publishing_limit = lim?.data?.[0] ?? lim;
    } catch (e: any) { out.publishing_limit = `error: ${e.message}`; }
  } catch (e: any) { out.instagram = `error: ${e.message}`; }
  return res.status(200).json(out);
}
