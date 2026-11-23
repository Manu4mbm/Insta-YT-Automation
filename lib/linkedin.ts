import crypto from 'node:crypto';
import { env } from './env.js';
import { getSetting, setSetting } from './db.js';
import { currentAccount } from './account.js';

/**
 * LinkedIn — OAuth 2.0 (3-legged) + Posts API (text, image, PDF document, video) + first comment.
 * Settings per account slug (always suffixed, e.g. `li_access_token:protech`):
 *   li_access_token, li_refresh_token, li_expires_at (ms), li_person (urn:li:person:…),
 *   li_author (URN posts are published as: the person, or urn:li:organization:… for a Company Page), li_name.
 * Personal profile needs the "Share on LinkedIn" + "Sign In with LinkedIn using OpenID Connect" products.
 * Company Page also needs the Community Management API (LinkedIn review) → set LINKEDIN_ORG_SCOPES=1.
 */
const REST = 'https://api.linkedin.com/rest';
const OAUTH = 'https://www.linkedin.com/oauth/v2';
export const liVersion = () => process.env.LINKEDIN_VERSION || '202608';
export const liRedirectUri = () => `${env('APP_URL', false) || ''}/api/x/linkedin-callback`;
export const liKey = (base: string, acct = currentAccount()) => `${base}:${acct}`;

export function liScopes(): string[] {
  const s = ['openid', 'profile', 'w_member_social'];
  if (process.env.LINKEDIN_ORG_SCOPES === '1') s.push('w_organization_social', 'r_organization_social', 'rw_organization_admin');
  return s;
}

export const newState = () => crypto.randomBytes(16).toString('hex');

export function liAuthUrl(state: string) {
  const u = new URL(`${OAUTH}/authorization`);
  u.searchParams.set('response_type', 'code');
  u.searchParams.set('client_id', env('LINKEDIN_CLIENT_ID'));
  u.searchParams.set('redirect_uri', liRedirectUri());
  u.searchParams.set('state', state);
  u.searchParams.set('scope', liScopes().join(' '));
  return u.toString();
}

async function tokenCall(params: Record<string, string>) {
  const res = await fetch(`${OAUTH}/accessToken`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: env('LINKEDIN_CLIENT_ID'), client_secret: env('LINKEDIN_CLIENT_SECRET'), ...params }),
  });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`LinkedIn token: ${j.error_description || j.error || res.status}`);
  await setSetting(liKey('li_access_token'), j.access_token);
  await setSetting(liKey('li_expires_at'), String(Date.now() + (j.expires_in ?? 5184000) * 1000));
  if (j.refresh_token) await setSetting(liKey('li_refresh_token'), j.refresh_token);
  return j.access_token as string;
}
export const exchangeCode = (code: string) =>
  tokenCall({ grant_type: 'authorization_code', code, redirect_uri: liRedirectUri() });

/** Days left on the access token (negative = expired). Member tokens last 60 days. */
export async function liDaysLeft(): Promise<number | null> {
  const exp = Number(await getSetting(liKey('li_expires_at')));
  return exp ? Math.floor((exp - Date.now()) / 86400e3) : null;
}

export async function liAccessToken(): Promise<string> {
  const tok = await getSetting(liKey('li_access_token'));
  if (!tok) throw new Error(`LinkedIn not connected for "${currentAccount()}" (open /api/x/linkedin-auth?account=${currentAccount()})`);
  const exp = Number(await getSetting(liKey('li_expires_at')));
  if (exp && exp < Date.now() + 5 * 60e3) {
    const rt = await getSetting(liKey('li_refresh_token'));
    if (!rt) throw new Error(`LinkedIn token expired for "${currentAccount()}": reconnect via /api/x/linkedin-auth?account=${currentAccount()}`);
    return tokenCall({ grant_type: 'refresh_token', refresh_token: rt });
  }
  return tok;
}

const headers = async (json = true) => ({
  Authorization: `Bearer ${await liAccessToken()}`,
  'LinkedIn-Version': liVersion(),
  'X-Restli-Protocol-Version': '2.0.0',
  ...(json ? { 'Content-Type': 'application/json' } : {}),
});

/** Versioned REST call. Returns { json, res } so callers can read x-restli-id. */
export async function li(method: 'GET' | 'POST', path: string, body?: unknown) {
  const res = await fetch(`${REST}/${path}`, { method, headers: await headers(!!body), body: body ? JSON.stringify(body) : undefined });
  const json: any = res.status === 204 ? {} : await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`LinkedIn ${method} ${path.split('?')[0]}: ${json?.message || json?.code || res.status}`);
  return { json, res };
}

/** OpenID userinfo → person id + name (needs the openid + profile scopes). */
export async function liUserinfo(): Promise<{ sub: string; name?: string }> {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', { headers: { Authorization: `Bearer ${await liAccessToken()}` } });
  const j: any = await res.json().catch(() => ({}));
  if (!res.ok || !j.sub) throw new Error(`LinkedIn userinfo: ${j.message || res.status}`);
  return j;
}

/** Organizations the member administers (only with LINKEDIN_ORG_SCOPES=1). */
export async function liAdminOrgs(): Promise<string[]> {
  const { json } = await li('GET', 'organizationAcls?q=roleAssignee&role=ADMINISTRATOR&state=APPROVED');
  return (json.elements ?? []).map((e: any) => e.organization as string).filter(Boolean);
}

export async function liAuthor(): Promise<string> {
  const a = (await getSetting(liKey('li_author'))) || (await getSetting(liKey('li_person')));
  if (!a) throw new Error(`LinkedIn author unknown for "${currentAccount()}": reconnect`);
  return a;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchBytes(url: string) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`fetch media: HTTP ${r.status}`);
  return Buffer.from(await r.arrayBuffer());
}

async function putBytes(uploadUrl: string, buf: Buffer) {
  const r = await fetch(uploadUrl, { method: 'PUT', headers: { Authorization: `Bearer ${await liAccessToken()}` }, body: new Uint8Array(buf) });
  if (!r.ok) throw new Error(`LinkedIn upload PUT: HTTP ${r.status}`);
  return r.headers.get('etag');
}

async function waitAvailable(kind: 'videos' | 'documents' | 'images', urn: string) {
  for (let n = 0; n < 24; n++) {
    const { json } = await li('GET', `${kind}/${encodeURIComponent(urn)}`);
    const st = json.status;
    if (st === 'AVAILABLE') return;
    if (st === 'PROCESSING_FAILED') throw new Error(`LinkedIn ${kind} processing failed`);
    await sleep(5000);
  }
  throw new Error(`LinkedIn ${kind} still processing after 2 min`);
}

/** Image (PNG/JPG). Returns urn:li:image:… */
export async function uploadImage(url: string, owner: string): Promise<string> {
  const buf = await fetchBytes(url);
  const { json } = await li('POST', 'images?action=initializeUpload', { initializeUploadRequest: { owner } });
  await putBytes(json.value.uploadUrl, buf);
  await waitAvailable('images', json.value.image);
  return json.value.image;
}

/** PDF document (LinkedIn "carousel" in the feed). Returns urn:li:document:… */
export async function uploadDocument(url: string, owner: string): Promise<string> {
  const buf = await fetchBytes(url);
  const { json } = await li('POST', 'documents?action=initializeUpload', { initializeUploadRequest: { owner } });
  await putBytes(json.value.uploadUrl, buf);
  await waitAvailable('documents', json.value.document);
  return json.value.document;
}

/** MP4 video, multipart upload + finalize. Returns urn:li:video:… */
export async function uploadVideo(url: string, owner: string): Promise<string> {
  const buf = await fetchBytes(url);
  const { json } = await li('POST', 'videos?action=initializeUpload', {
    initializeUploadRequest: { owner, fileSizeBytes: buf.length, uploadCaptions: false, uploadThumbnail: false },
  });
  const v = json.value;
  const etags: string[] = [];
  for (const part of v.uploadInstructions ?? []) {
    const etag = await putBytes(part.uploadUrl, buf.subarray(part.firstByte, part.lastByte + 1));
    if (!etag) throw new Error('LinkedIn video upload: missing ETag');
    etags.push(etag);
  }
  await li('POST', 'videos?action=finalizeUpload', { finalizeUploadRequest: { video: v.video, uploadToken: v.uploadToken ?? '', uploadedPartIds: etags } });
  await waitAvailable('videos', v.video);
  return v.video;
}

/**
 * LinkedIn "little text": reserved characters must be escaped or the post is cut short.
 * #Hashtags become real hashtags; everything else reserved is escaped.
 */
export function littleText(text: string): string {
  const esc = (s: string) => s.replace(/[\\|{}@\[\]()<>#*_~]/g, (c) => `\\${c}`);
  return text.split(/(#[A-Za-z][A-Za-z0-9_]*)/g)
    .map((part) => (/^#[A-Za-z][A-Za-z0-9_]*$/.test(part) ? `{hashtag|\\#|${part.slice(1)}}` : esc(part)))
    .join('');
}

export type LiMedia = { type: 'none' | 'image' | 'document' | 'video'; url?: string; title?: string; alt?: string };

/** Publish a post. Returns the post URN (urn:li:share:… / urn:li:ugcPost:…). */
export async function createPost(commentary: string, media: LiMedia = { type: 'none' }): Promise<string> {
  const author = await liAuthor();
  let content: any;
  if (media.type !== 'none') {
    if (!media.url) throw new Error(`media_url required for ${media.type}`);
    if (media.type === 'image') content = { media: { id: await uploadImage(media.url, author), ...(media.alt ? { altText: media.alt } : {}) } };
    if (media.type === 'document') content = { media: { id: await uploadDocument(media.url, author), title: media.title || 'Document' } };
    if (media.type === 'video') content = { media: { id: await uploadVideo(media.url, author), ...(media.title ? { title: media.title } : {}) } };
  }
  const { res } = await li('POST', 'posts', {
    author,
    commentary: littleText(commentary),
    visibility: 'PUBLIC',
    distribution: { feedDistribution: 'MAIN_FEED', targetEntities: [], thirdPartyDistributionChannels: [] },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
    ...(content ? { content } : {}),
  });
  const urn = res.headers.get('x-restli-id');
  if (!urn) throw new Error('LinkedIn post: no id returned');
  return urn;
}

/** First comment under a post (links go here, never in the post body). Returns comment URN. */
export async function commentOn(postUrn: string, text: string): Promise<string> {
  const actor = await liAuthor();
  const { json, res } = await li('POST', `socialActions/${encodeURIComponent(postUrn)}/comments`, {
    actor, object: postUrn, message: { text },
  });
  return res.headers.get('x-restli-id') || json.id || json['$URN'] || '';
}
