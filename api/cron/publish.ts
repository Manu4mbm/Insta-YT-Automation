import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../lib/db.js';
import { ig, igUserId } from '../../lib/ig.js';
import { snapshotMetrics, autoPaid } from '../../lib/metrics.js';
import { isCronAuthorized } from '../../lib/auth.js';

export const config = { maxDuration: 60 };

const MAX_PUBLISH_PER_RUN = 3;
const SAFE_DAILY_CEILING = 50; // RESEARCH.md: treat 50 as safe ceiling
const MAX_ATTEMPTS = 8; // container polls across cron runs before giving up
const PREP_MS = 16 * 60 * 1000; // create the IG container up to 16 min early so it is processed by the slot

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function publishingQuotaLeft(igId: string): Promise<number> {
  try {
    const r = await ig<any>('GET', `${igId}/content_publishing_limit`, { fields: 'quota_usage,config' });
    const row = r?.data?.[0];
    const total = Math.min(row?.config?.quota_total ?? SAFE_DAILY_CEILING, SAFE_DAILY_CEILING);
    return total - (row?.quota_usage ?? 0);
  } catch {
    return 1; // limit endpoint unavailable: allow one, IG will reject if over
  }
}

async function markError(id: string, error: string) {
  await db().from('posts').update({ status: 'error', error }).eq('id', id);
}

/** media_publish can succeed on Instagram while our request times out → find the live media by caption, save its id, post the first comment. */
export async function recoverMediaId(igId: string, post: any): Promise<string | null> {
  const r = await ig<any>('GET', `${igId}/media`, { fields: 'id,caption,timestamp', limit: 15 });
  const head = String(post.caption ?? '').slice(0, 60);
  const m = (r.data ?? []).find((x: any) => String(x.caption ?? '').startsWith(head));
  if (!m) return null;
  await db().from('posts').update({ ig_media_id: m.id, published_at: m.timestamp ? new Date(m.timestamp).toISOString() : new Date().toISOString() }).eq('id', post.id);
  if (post.first_comment && !post.first_comment_id) {
    try {
      const c = await ig<any>('POST', `${m.id}/comments`, { message: post.first_comment });
      await db().from('posts').update({ first_comment_id: c.id }).eq('id', post.id);
    } catch (e: any) {
      await db().from('posts').update({ error: `first comment: ${e.message}`.slice(0, 300) }).eq('id', post.id);
    }
  }
  return m.id;
}

async function tryFinish(igId: string, post: any): Promise<'published' | 'pending' | 'error'> {
  const s = await ig<any>('GET', post.container_id, { fields: 'status_code,status' });
  if (s.status_code === 'FINISHED') {
    if (Date.now() < new Date(post.scheduled_at).getTime()) return 'pending'; // ready, wait for the slot
    const pub = await ig<any>('POST', `${igId}/media_publish`, { creation_id: post.container_id }, undefined, 40000);
    await db()
      .from('posts')
      .update({ status: 'published', ig_media_id: pub.id, published_at: new Date().toISOString(), error: null })
      .eq('id', post.id);
    if (post.first_comment) {
      try {
        const c = await ig<any>('POST', `${pub.id}/comments`, { message: post.first_comment });
        await db().from('posts').update({ first_comment_id: c.id }).eq('id', post.id);
      } catch (e: any) {
        await db().from('posts').update({ error: `first comment: ${e.message}` }).eq('id', post.id);
      }
    }
    return 'published';
  }
  if (s.status_code === 'ERROR' || s.status_code === 'EXPIRED') {
    await markError(post.id, `container ${s.status_code}: ${s.status ?? ''}`);
    return 'error';
  }
  if (s.status_code === 'PUBLISHED') {
    await db().from('posts').update({ status: 'published' }).eq('id', post.id);
    await recoverMediaId(igId, { ...post, status: 'published' });
    return 'published';
  }
  const attempts = (post.attempts ?? 0) + 1;
  if (attempts >= MAX_ATTEMPTS) {
    await markError(post.id, `container stuck in ${s.status_code} after ${attempts} checks`);
    return 'error';
  }
  await db().from('posts').update({ attempts }).eq('id', post.id);
  return 'pending';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const igId = await igUserId();
  const log: string[] = [];

  const t0 = Date.now();
  // 0) Repair: published on Instagram but our request timed out before we saved the media id
  const { data: orphans } = await db().from('posts').select('*').eq('status', 'published').is('ig_media_id', null)
    .not('container_id', 'is', null).gte('scheduled_at', new Date(Date.now() - 2 * 864e5).toISOString());
  for (const p of orphans ?? []) {
    try { log.push(`${p.reel_slug}: media id recovered ${await recoverMediaId(igId, p)}`); } catch (e: any) { log.push(`${p.reel_slug}: recover failed ${e.message}`); }
  }

  // 1) Containers already created in earlier runs
  const { data: inFlight } = await db().from('posts').select('*').eq('status', 'container').order('scheduled_at');
  for (const p of inFlight ?? []) {
    try {
      log.push(`${p.reel_slug}: ${await tryFinish(igId, p)}`);
    } catch (e: any) {
      log.push(`${p.reel_slug}: check failed ${e.message}`);
    }
  }

  // 2) Due posts → create containers
  let quota = await publishingQuotaLeft(igId);
  const { data: due } = await db()
    .from('posts')
    .select('*')
    .eq('status', 'queued')
    .lte('scheduled_at', new Date(Date.now() + PREP_MS).toISOString())
    .order('scheduled_at')
    .limit(MAX_PUBLISH_PER_RUN);

  const created: any[] = [];
  for (const p of due ?? []) {
    if (quota <= 0) {
      log.push('publishing quota reached, waiting');
      break;
    }
    try {
      const base = { media_type: 'REELS', video_url: p.video_url, caption: p.caption, cover_url: p.cover_url ?? undefined };
      let c: any;
      if (p.trial_strategy) {
        // Trial reel: shown to non-followers first; SS_PERFORMANCE = Instagram auto-shares to followers if it performs
        try { c = await ig<any>('POST', `${igId}/media`, { ...base, trial_params: JSON.stringify({ graduation_strategy: p.trial_strategy }) }); }
        catch (e: any) { log.push(`${p.reel_slug}: trial reel rejected (${e.message}) → normal reel`); }
      }
      if (!c) c = await ig<any>('POST', `${igId}/media`, { ...base, share_to_feed: 'true' });
      await db().from('posts').update({ status: 'container', container_id: c.id, attempts: 0 }).eq('id', p.id);
      created.push({ ...p, container_id: c.id, attempts: 0 });
      quota--;
      log.push(`${p.reel_slug}: container ${c.id}`);
    } catch (e: any) {
      await markError(p.id, e.message);
      log.push(`${p.reel_slug}: error ${e.message}`);
    }
  }

  // 3) Short in-run poll so typical reels publish in the same run
  const deadline = Date.now() + 40_000;
  let pending = created;
  while (pending.length && Date.now() < deadline) {
    await sleep(10_000);
    const next: any[] = [];
    for (const p of pending) {
      try {
        const r = await tryFinish(igId, p);
        if (r === 'pending') next.push({ ...p, attempts: (p.attempts ?? 0) + 1 });
        else log.push(`${p.reel_slug}: ${r}`);
      } catch (e: any) {
        log.push(`${p.reel_slug}: poll failed ${e.message}`);
      }
    }
    pending = next;
  }

  try { await snapshotMetrics(log, t0 + 45000); } catch (e: any) { log.push(`metrics error ${e.message}`); }
  try { await autoPaid(log); } catch (e: any) { log.push(`auto-paid error ${e.message}`); }
  return res.status(200).json({ ok: true, log });
}
