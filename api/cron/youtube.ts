import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db, getSetting } from '../../lib/db.js';
import { isCronAuthorized } from '../../lib/auth.js';
import { uploadFromUrl, setThumbnail, yt } from '../../lib/yt.js';

export const config = { maxDuration: 300 };
const LEAD_MS = 30 * 60e3; // upload 30 min early as private + publishAt → YouTube publishes on time
const MAX_ATTEMPTS = 5;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  if (!(await getSetting('yt_refresh_token'))) return res.status(200).json({ ok: true, log: ['youtube not connected yet'] });
  // first comment for scheduled videos: post once they are public (comments on private videos are rejected)
  const { data: pend } = await db().from('yt_posts').select('id, slug, kind, yt_video_id, first_comment, attempts')
    .eq('status', 'uploaded').is('comment_id', null).not('first_comment', 'is', null).lte('scheduled_at', new Date(Date.now() - 2 * 60e3).toISOString()).limit(5);
  for (const p of pend ?? []) {
    try {
      const c = await yt<any>('POST', 'commentThreads', { part: 'snippet' }, { snippet: { videoId: p.yt_video_id, topLevelComment: { snippet: { textOriginal: p.first_comment } } } });
      await db().from('yt_posts').update({ comment_id: c.id, error: null }).eq('id', p.id);
    } catch (e: any) { await db().from('yt_posts').update({ error: `comment: ${e.message}`.slice(0, 500) }).eq('id', p.id); }
  }
  const horizon = new Date(Date.now() + LEAD_MS).toISOString();
  const { data: due } = await db().from('yt_posts').select('*').eq('status', 'queued').lte('scheduled_at', horizon).order('scheduled_at').limit(1);
  const log: string[] = [];
  for (const p of due ?? []) {
    await db().from('yt_posts').update({ status: 'uploading', attempts: p.attempts + 1 }).eq('id', p.id);
    try {
      const future = new Date(p.scheduled_at).getTime() > Date.now() + 60e3;
      const id = await uploadFromUrl(p.video_url, {
        snippet: { title: p.title, description: p.description, tags: p.tags, categoryId: p.category_id, defaultLanguage: 'hi', defaultAudioLanguage: 'hi' },
        status: {
          privacyStatus: future ? 'private' : 'public',
          ...(future ? { publishAt: new Date(p.scheduled_at).toISOString() } : {}),
          selfDeclaredMadeForKids: false,
          containsSyntheticMedia: p.synthetic_media,
        },
      });
      await db().from('yt_posts').update({ status: 'uploaded', yt_video_id: id, uploaded_at: new Date().toISOString(), error: null }).eq('id', p.id);
      log.push(`${p.slug}/${p.kind}: uploaded ${id}`);
      const extra: string[] = [];
      if (p.thumbnail_url) { try { await setThumbnail(id, p.thumbnail_url); } catch (e: any) { extra.push(e.message); } }
      if (p.first_comment && !future) {
        try {
          const c = await yt<any>('POST', 'commentThreads', { part: 'snippet' }, { snippet: { videoId: id, topLevelComment: { snippet: { textOriginal: p.first_comment } } } });
          await db().from('yt_posts').update({ comment_id: c.id }).eq('id', p.id);
        } catch (e: any) { extra.push(`comment: ${e.message}`); }
      }
      if (extra.length) await db().from('yt_posts').update({ error: extra.join(' | ').slice(0, 500) }).eq('id', p.id);
    } catch (e: any) {
      const failed = p.attempts + 1 >= MAX_ATTEMPTS;
      await db().from('yt_posts').update({ status: failed ? 'failed' : 'queued', error: String(e.message).slice(0, 500) }).eq('id', p.id);
      log.push(`${p.slug}/${p.kind}: ${e.message}`);
    }
  }
  return res.status(200).json({ ok: true, log });
}
