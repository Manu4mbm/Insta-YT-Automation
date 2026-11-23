import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, getSetting } from '../../db.js';
import { isCronAuthorized } from '../../auth.js';
import { commentOn, createPost, liDaysLeft, liKey } from '../../linkedin.js';
import { runAs } from '../../account.js';

const MAX_ATTEMPTS = 3;

/** Posts due rows from linkedin_posts (one per run). Called by pg_cron every 10 min. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const { data: due } = await db().from('linkedin_posts').select('*').eq('status', 'queued')
    .lte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(1);
  const log: string[] = [];
  for (const p of due ?? []) {
    await runAs(p.account, async () => {
      if (!(await getSetting(liKey('li_access_token')))) { log.push(`${p.slug}: linkedin not connected for ${p.account}`); return; }
      const days = await liDaysLeft();
      if (days !== null && days <= 7) log.push(`${p.account}: LinkedIn token expires in ${days} day(s) — reconnect via /api/x/linkedin-auth?account=${p.account}`);
      await db().from('linkedin_posts').update({ status: 'posting', attempts: p.attempts + 1 }).eq('id', p.id);
      try {
        const urn = await createPost(p.commentary, { type: p.media_type, url: p.media_url, title: p.media_title, alt: p.alt_text });
        await db().from('linkedin_posts').update({ status: 'posted', post_urn: urn, posted_at: new Date().toISOString(), error: null }).eq('id', p.id);
        log.push(`${p.account}/${p.slug}: posted ${urn}`);
        if (p.first_comment) {
          try {
            const c = await commentOn(urn, p.first_comment);
            await db().from('linkedin_posts').update({ comment_urn: c }).eq('id', p.id);
          } catch (e: any) { await db().from('linkedin_posts').update({ error: `comment: ${e.message}`.slice(0, 500) }).eq('id', p.id); }
        }
      } catch (e: any) {
        const failed = p.attempts + 1 >= MAX_ATTEMPTS;
        await db().from('linkedin_posts').update({ status: failed ? 'failed' : 'queued', error: String(e.message).slice(0, 500) }).eq('id', p.id);
        log.push(`${p.account}/${p.slug}: ${e.message}`);
      }
    });
  }
  return res.status(200).json({ ok: true, log });
}
