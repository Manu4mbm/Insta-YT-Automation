import crypto from 'node:crypto';
import { env } from './env.js';
import { getSetting, setSetting } from './db.js';

/** X (Twitter) API v2 — OAuth 2.0 (PKCE, confidential client) + chunked video upload + post. */
export const X_SCOPES = ['tweet.read', 'tweet.write', 'users.read', 'media.write', 'offline.access'];
const API = 'https://api.x.com/2';
export const xRedirectUri = () => `${env('APP_URL', false) || ''}/api/x/callback`;

const b64url = (b: Buffer) => b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export function newPkce() {
  const verifier = b64url(crypto.randomBytes(32));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  return { verifier, challenge, state: crypto.randomBytes(16).toString('hex') };
}

export function xAuthUrl(state: string, challenge: string) {
  const u = new URL('https://x.com/i/oauth2/authorize');
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', env('X_CLIENT_ID'));
  u.searchParams.set('redirect_uri', xRedirectUri());
  u.searchParams.set('scope', X_SCOPES.join(' '));
  u.searchParams.set('state', state);
  u.searchParams.set('code_challenge', challenge);
  u.searchParams.set('code_challenge_method', 'S256');
  return u.toString();
}

async function tokenCall(params: Record<string, string>) {
  const basic = Buffer.from(`${env('X_CLIENT_ID')}:${env('X_CLIENT_SECRET')}`).toString('base64');
  const res = await fetch(`${API}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${basic}` },
    body: new URLSearchParams({ client_id: env('X_CLIENT_ID'), ...params }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`X token: ${j.error_description || j.error || res.status}`);
  // X rotates refresh tokens: always store the newest one
  if (j.refresh_token) await setSetting('x_refresh_token', j.refresh_token);
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 7200) * 1000 };
  return j.access_token as string;
}
export const exchangeCode = (code: string, verifier: string) =>
  tokenCall({ grant_type: 'authorization_code', code, redirect_uri: xRedirectUri(), code_verifier: verifier });

let cached: { token: string; exp: number } | null = null;
export async function xAccessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60e3) return cached.token;
  const rt = await getSetting('x_refresh_token');
  if (!rt) throw new Error('X not connected (open /api/x/auth)');
  return tokenCall({ grant_type: 'refresh_token', refresh_token: rt });
}

export async function x<T = any>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API}/${path}`, {
    method,
    headers: { Authorization: `Bearer ${await xAccessToken()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`X ${method} ${path}: ${j?.detail || j?.title || j?.errors?.[0]?.message || res.status}`);
  return j as T;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const CHUNK = 4 * 1024 * 1024;

/** Upload a video from a public URL (Supabase Storage) with the v2 chunked media upload. Returns media id. */
export async function uploadVideoFromUrl(videoUrl: string): Promise<string> {
  const src = await fetch(videoUrl);
  if (!src.ok) throw new Error(`fetch video: HTTP ${src.status}`);
  const buf = Buffer.from(await src.arrayBuffer());
  const type = src.headers.get('content-type') || 'video/mp4';
  const init = await x<any>('POST', 'media/upload/initialize', { media_type: type, total_bytes: buf.length, media_category: 'tweet_video' });
  const id: string = init?.data?.id;
  if (!id) throw new Error('X upload init: no media id');
  for (let i = 0, seg = 0; i < buf.length; i += CHUNK, seg++) {
    const fd = new FormData();
    fd.append('segment_index', String(seg));
    fd.append('media', new Blob([buf.subarray(i, i + CHUNK)], { type }), 'chunk');
    const r = await fetch(`${API}/media/upload/${id}/append`, { method: 'POST', headers: { Authorization: `Bearer ${await xAccessToken()}` }, body: fd });
    if (!r.ok) { const j: any = await r.json().catch(() => ({})); throw new Error(`X upload append ${seg}: ${j?.detail || j?.title || r.status}`); }
  }
  let info = (await x<any>('POST', `media/upload/${id}/finalize`))?.data?.processing_info;
  for (let n = 0; info && info.state !== 'succeeded' && n < 40; n++) {
    if (info.state === 'failed') throw new Error(`X video processing failed: ${info.error?.message || 'unknown'}`);
    await sleep(Math.min((info.check_after_secs ?? 3) * 1000, 10e3));
    info = (await x<any>('GET', `media/upload?command=STATUS&media_id=${id}`))?.data?.processing_info;
  }
  if (info && info.state !== 'succeeded') throw new Error('X video processing timed out');
  return id;
}

export async function postTweet(text: string, mediaId?: string, replyTo?: string): Promise<string> {
  const j = await x<any>('POST', 'tweets', {
    text,
    ...(mediaId ? { media: { media_ids: [mediaId] } } : {}),
    ...(replyTo ? { reply: { in_reply_to_tweet_id: replyTo } } : {}),
  });
  return j.data.id as string;
}
