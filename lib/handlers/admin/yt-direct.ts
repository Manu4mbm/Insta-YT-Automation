import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db.js';
import { isCronAuthorized } from '../../auth.js';
import { ytAccessToken, setThumbnail, yt } from '../../yt.js';

/**
 * Protected. For videos larger than the Storage upload limit.
 * POST ?id=<yt_posts.id>&step=session&size=<bytes> → {location} (resumable session; client PUTs the file to it)
 * POST ?id=<yt_posts.id>&step=finish&video=<videoId> → thumbnail + first comment + mark uploaded
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const { id, step, size, video } = req.query as Record<string, string>;
  const { data: p } = await db().from('yt_posts').select('*').eq('id', id).maybeSingle();
  if (!p) return res.status(404).json({ error: 'no post' });
  try {
    if (step === 'session') {
      const future = new Date(p.scheduled_at).getTime() > Date.now() + 60e3;
      const r = await fetch('https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await ytAccessToken()}`, 'Content-Type': 'application/json; charset=UTF-8', 'X-Upload-Content-Length': size, 'X-Upload-Content-Type': 'video/mp4' },
        body: JSON.stringify({
          snippet: { title: p.title, description: p.description, tags: p.tags, categoryId: p.category_id, defaultLanguage: 'hi', defaultAudioLanguage: 'hi' },
          status: { privacyStatus: future ? 'private' : 'public', ...(future ? { publishAt: new Date(p.scheduled_at).toISOString() } : {}), selfDeclaredMadeForKids: false, containsSyntheticMedia: p.synthetic_media },
        }),
      });
      if (!r.ok) { const j: any = await r.json().catch(() => ({})); throw new Error(j?.error?.message || String(r.status)); }
      await db().from('yt_posts').update({ status: 'uploading' }).eq('id', id);
      return res.status(200).json({ location: r.headers.get('location') });
    }
    if (step === 'finish') {
      const extra: string[] = [];
      if (p.thumbnail_url) { try { await setThumbnail(video, p.thumbnail_url); } catch (e: any) { extra.push(e.message); } }
      if (p.first_comment && new Date(p.scheduled_at).getTime() <= Date.now()) { try { await yt('POST', 'commentThreads', { part: 'snippet' }, { snippet: { videoId: video, topLevelComment: { snippet: { textOriginal: p.first_comment } } } }); } catch (e: any) { extra.push(`comment: ${e.message}`); } }
      await db().from('yt_posts').update({ status: 'uploaded', yt_video_id: video, uploaded_at: new Date().toISOString(), error: extra.join(' | ') || null }).eq('id', id);
      return res.status(200).json({ ok: true, extra });
    }
    return res.status(400).json({ error: 'step?' });
  } catch (e: any) {
    return res.status(502).json({ error: e.message });
  }
}
