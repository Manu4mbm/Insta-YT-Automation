import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, getSetting } from '../../db.js';
import { isCronAuthorized } from '../../auth.js';
import { uploadVideoFromUrl, postTweet } from '../../x.js';

const MAX_ATTEMPTS = 3; // each post costs API credits: keep retries low

/** Posts due rows from x_posts (one per run). Called by pg_cron every 10 min. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  if (!(await getSetting('x_refresh_token'))) return res.status(200).json({ ok: true, log: ['x not connected yet'] });
  const { data: due } = await db().from('x_posts').select('*').eq('status', 'queued')
    .lte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(1);
  const log: string[] = [];
  for (const p of due ?? []) {
    await db().from('x_posts').update({ status: 'posting', attempts: p.attempts + 1 }).eq('id', p.id);
    try {
      const mediaId = p.video_url ? await uploadVideoFromUrl(p.video_url) : undefined;
      const id = await postTweet(p.text, mediaId);
      await db().from('x_posts').update({ status: 'posted', tweet_id: id, posted_at: new Date().toISOString(), error: null }).eq('id', p.id);
      log.push(`${p.slug}: posted ${id}`);
      if (p.reply_text) {
        try {
          const r = await postTweet(p.reply_text, undefined, id);
          await db().from('x_posts').update({ reply_id: r }).eq('id', p.id);
        } catch (e: any) { await db().from('x_posts').update({ error: `reply: ${e.message}`.slice(0, 500) }).eq('id', p.id); }
      }
    } catch (e: any) {
      const failed = p.attempts + 1 >= MAX_ATTEMPTS;
      await db().from('x_posts').update({ status: failed ? 'failed' : 'queued', error: String(e.message).slice(0, 500) }).eq('id', p.id);
      log.push(`${p.slug}: ${e.message}`);
    }
  }
  return res.status(200).json({ ok: true, log });
}
