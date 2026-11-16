import { AsyncLocalStorage } from 'node:async_hooks';
import { db } from './db.js';

/**
 * Multi-account support. Every Instagram call runs "as" one account slug.
 *  - `main`  = IG_USER_ID / IG_ACCESS_TOKEN env vars (or settings ig_user_id / ig_access_token).
 *  - others  = settings `ig_user_id:<slug>` (+ optional `ig_access_token:<slug>`; without it the main
 *              token is used — one Unified-login system-user token can cover several accounts).
 * posts.account / yt_posts.account pick the account for each reel.
 */
const als = new AsyncLocalStorage<string>();
export const MAIN = 'main';
export const SLUG_RE = /^[a-z0-9_-]{2,24}$/;

export const currentAccount = (): string => als.getStore() ?? MAIN;
export const runAs = <T>(slug: string | null | undefined, fn: () => Promise<T>): Promise<T> => als.run(slug || MAIN, fn);

export async function listAccounts(): Promise<string[]> {
  const { data } = await db().from('settings').select('key').like('key', 'ig_user_id:%');
  const extra = (data ?? []).map((r: any) => String(r.key).slice('ig_user_id:'.length)).filter((s) => s !== MAIN && SLUG_RE.test(s));
  return [MAIN, ...Array.from(new Set(extra)).sort()];
}

/** Webhook entry.id (IG professional account id) → account slug. */
export async function accountForIgId(igId: string | undefined): Promise<string> {
  if (!igId) return MAIN;
  const { data } = await db().from('settings').select('key').like('key', 'ig_user_id:%').eq('value', igId).limit(1);
  const key = data?.[0]?.key as string | undefined;
  return key ? key.slice('ig_user_id:'.length) : MAIN;
}
