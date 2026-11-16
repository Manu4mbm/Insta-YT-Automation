import crypto from 'node:crypto';
import { env } from './env.js';
import { getSetting, setSetting } from './db.js';

export const YT_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.force-ssl',
  'https://www.googleapis.com/auth/youtube.readonly',
];
export const ytRedirectUri = () => `${env('APP_URL', false) || ''}/api/youtube/callback`;

export function ytAuthUrl(state: string) {
  const u = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  u.searchParams.set('client_id', env('YT_CLIENT_ID'));
  u.searchParams.set('redirect_uri', ytRedirectUri());
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('scope', YT_SCOPES.join(' '));
  u.searchParams.set('access_type', 'offline');
  u.searchParams.set('prompt', 'select_account consent'); // always show the account + brand-channel chooser
  u.searchParams.set('include_granted_scopes', 'true');
  u.searchParams.set('state', state);
  return u.toString();
}
export const newState = () => crypto.randomBytes(16).toString('hex');

async function tokenCall(params: Record<string, string>) {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env('YT_CLIENT_ID'), client_secret: env('YT_CLIENT_SECRET'), ...params }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Google token: ${j.error_description || j.error || res.status}`);
  return j;
}
export async function exchangeCode(code: string) {
  const j = await tokenCall({ code, grant_type: 'authorization_code', redirect_uri: ytRedirectUri() });
  if (j.refresh_token) await setSetting('yt_refresh_token', j.refresh_token);
  return j.access_token as string;
}
let cached: { token: string; exp: number } | null = null;
export async function ytAccessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60e3) return cached.token;
  const rt = await getSetting('yt_refresh_token');
  if (!rt) throw new Error('YouTube not connected (open /api/youtube/auth)');
  const j = await tokenCall({ refresh_token: rt, grant_type: 'refresh_token' });
  cached = { token: j.access_token, exp: Date.now() + (j.expires_in ?? 3600) * 1000 };
  return cached.token;
}

export async function yt<T = any>(method: 'GET' | 'POST' | 'PUT', path: string, params: Record<string, string> = {}, body?: unknown): Promise<T> {
  const u = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  for (const [k, v] of Object.entries(params)) u.searchParams.set(k, v);
  const res = await fetch(u, {
    method,
    headers: { Authorization: `Bearer ${await ytAccessToken()}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`YT ${method} ${path}: ${j?.error?.message || res.status}`);
  return j as T;
}

/** Resumable upload, streamed from a public URL (Supabase Storage). Returns the new video id. */
export async function uploadFromUrl(videoUrl: string, resource: unknown): Promise<string> {
  const src = await fetch(videoUrl);
  if (!src.ok || !src.body) throw new Error(`fetch video: HTTP ${src.status}`);
  const len = src.headers.get('content-length');
  const type = src.headers.get('content-type') || 'video/mp4';
  if (!len) throw new Error('video has no content-length');
  const init = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await ytAccessToken()}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'X-Upload-Content-Length': len,
      'X-Upload-Content-Type': type,
    },
    body: JSON.stringify(resource),
  });
  if (!init.ok) { const j: any = await init.json().catch(() => ({})); throw new Error(`YT upload init: ${j?.error?.message || init.status}`); }
  const loc = init.headers.get('location');
  if (!loc) throw new Error('YT upload init: no session URL');
  const put = await fetch(loc, {
    method: 'PUT',
    headers: { 'Content-Length': len, 'Content-Type': type },
    body: src.body as any,
    // @ts-ignore node fetch streaming
    duplex: 'half',
  });
  const j: any = await put.json().catch(() => ({}));
  if (!put.ok || !j.id) throw new Error(`YT upload: ${j?.error?.message || put.status}`);
  return j.id as string;
}

export async function setThumbnail(videoId: string, imageUrl: string) {
  const img = await fetch(imageUrl);
  if (!img.ok) throw new Error(`fetch thumbnail: HTTP ${img.status}`);
  const buf = Buffer.from(await img.arrayBuffer());
  const res = await fetch(`https://www.googleapis.com/upload/youtube/v3/thumbnails/set?videoId=${videoId}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${await ytAccessToken()}`, 'Content-Type': img.headers.get('content-type') || 'image/jpeg' },
    body: buf,
  });
  if (!res.ok) { const j: any = await res.json().catch(() => ({})); throw new Error(`YT thumbnail: ${j?.error?.message || res.status}`); }
}
