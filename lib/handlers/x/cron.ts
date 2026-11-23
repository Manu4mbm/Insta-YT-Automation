import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, getSetting } from '../../db.js';
import { isCronAuthorized } from '../../auth.js';
import { uploadVideoFromUrl, uploadImageFromUrl, postTweet, xKey } from '../../x.js';
import { MAIN, runAs } from '../../account.js';

const MAX_ATTEMPTS = 3; // each post costs API credits: keep retries low

/**
 * Posts due rows from x_posts (one per run). Called by pg_cron every 10 min.
 * Each row posts as its `account` (main = @indiabybharat, protech = Pro Tech Synergy, …).
 * `thread` (text[]) posts as replies chained under the main post; `reply_text` stays supported.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const { data: due } = await db().from('x_posts').select('*').eq('status', 'queued')
    .lte('scheduled_at', new Date().toISOString()).order('scheduled_at').limit(1);
  const log: string[] = [];
  for (const p of due ?? []) {
    const account = p.account || MAIN;
    await runAs(account, async () => {
      if (!(await getSetting(xKey('x_refresh_token')))) { log.push(`${p.slug}: x not connected for ${account}`); return; }
      await db().from('x_posts').update({ status: 'posting', attempts: p.attempts + 1 }).eq('id', p.id);
      try {
        const mediaId = p.video_url ? await uploadVideoFromUrl(p.video_url)
          : p.image_url ? await uploadImageFromUrl(p.image_url) : undefined;
        const id = await postTweet(p.text, mediaId);
        await db().from('x_posts').update({ status: 'posted', tweet_id: id, posted_at: new Date().toISOString(), error: null }).eq('id', p.id);
        log.push(`${account}/${p.slug}: posted ${id}`);
        const replies: string[] = [...(Array.isArray(p.thread) ? p.thread : []), ...(p.reply_text ? [p.reply_text] : [])];
        let parent = id;
        for (const [i, t] of replies.entries()) {
          try {
            parent = await postTweet(t, undefined, parent);
            if (i === 0) await db().from('x_posts').update({ reply_id: parent }).eq('id', p.id);
          } catch (e: any) {
            await db().from('x_posts').update({ error: `reply ${i + 1}: ${e.message}`.slice(0, 500) }).eq('id', p.id);
            break;
          }
        }
      } catch (e: any) {
        const failed = p.attempts + 1 >= MAX_ATTEMPTS;
        await db().from('x_posts').update({ status: failed ? 'failed' : 'queued', error: String(e.message).slice(0, 500) }).eq('id', p.id);
        log.push(`${account}/${p.slug}: ${e.message}`);
      }
    });
  }
  return res.status(200).json({ ok: true, log });
}
