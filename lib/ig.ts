import { env, GRAPH_VERSION } from './env.js';
import { getSetting } from './db.js';

const BASE = 'https://graph.instagram.com';

export async function igToken(): Promise<string> {
  return (await getSetting('ig_access_token')) || env('IG_ACCESS_TOKEN');
}
export async function igUserId(): Promise<string> {
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
  const url = new URL(`${BASE}/${GRAPH_VERSION()}/${path.replace(/^\//, '')}`);
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
