import { env, GRAPH_VERSION } from './env.js';
import { getSetting } from './db.js';
import { currentAccount, MAIN } from './account.js';

/**
 * IG_API_HOST selects the Meta setup:
 *  - graph.instagram.com (default): "API setup with Instagram login" — 60-day Instagram User token, `me` = IG account.
 *  - graph.facebook.com: "API setup with Unified login" (all new Meta apps since Oct 2026) — Business Integration
 *    System User token that never expires; `me` is the system user, so every `me/...` path is sent to the IG user id.
 */
const HOST = (process.env.IG_API_HOST || 'graph.instagram.com').replace(/^https?:\/\//, '').replace(/\/$/, '');
const BASE = `https://${HOST}`;
export const isUnified = () => HOST === 'graph.facebook.com';
/** Profile fields valid on both setups (user_id/account_type exist only on graph.instagram.com). */
export const PROFILE_FIELDS = () => (isUnified() ? 'id,username,name,followers_count,follows_count,media_count' : 'user_id,username,name,followers_count,follows_count,media_count');

export async function igToken(): Promise<string> {
  const a = currentAccount();
  if (a !== MAIN) { const t = await getSetting(`ig_access_token:${a}`); if (t) return t; }
  return (await getSetting('ig_access_token')) || env('IG_ACCESS_TOKEN');
}
export async function igUserId(): Promise<string> {
  const a = currentAccount();
  if (a !== MAIN) {
    const id = await getSetting(`ig_user_id:${a}`);
    if (!id) throw new Error(`Instagram account "${a}" is not configured (settings ig_user_id:${a})`);
    return id;
  }
  return (await getSetting('ig_user_id')) || env('IG_USER_ID');
}

type Params = Record<string, string | number | undefined>;

export async function ig<T = any>(
  method: 'GET' | 'POST' | 'DELETE',
  path: string,
  params: Params = {},
  body?: unknown,
  timeoutMs = 12000,
): Promise<T> {
  const token = await igToken();
  let p = path.replace(/^\//, '');
  if (isUnified() && (p === 'me' || p.startsWith('me/'))) p = (await igUserId()) + p.slice(2);
  const url = new URL(`${BASE}/${GRAPH_VERSION()}/${p}`);
  for (const [k, v] of Object.entries(params)) if (v !== undefined) url.searchParams.set(k, String(v));
  const init: RequestInit = { method, headers: { Authorization: `Bearer ${token}` } };
  if (body !== undefined) {
    init.body = JSON.stringify(body);
    (init.headers as Record<string, string>)['Content-Type'] = 'application/json';
  }
  const res = await fetch(url, { ...init, signal: AbortSignal.timeout(timeoutMs) });
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok || json.error) {
    const msg = json?.error?.message || `HTTP ${res.status}`;
    const code = json?.error?.code !== undefined ? ` (#${json.error.code}/${json.error.error_subcode ?? ''})` : '';
    throw new Error(`IG ${method} ${path}${code}: ${msg}`);
  }
  return json as T;
}
