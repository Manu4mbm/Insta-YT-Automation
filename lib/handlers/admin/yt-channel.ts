import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isCronAuthorized } from '../../auth.js';
import { yt, ytAccessToken } from '../../yt.js';

/**
 * Protected. GET  /api/admin/yt-channel → channel snippet/branding/stats + recent uploads (titles, privacy, views)
 *            POST /api/admin/yt-channel  JSON {description?, keywords?, country?, bannerUrl?} → updates branding
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  try {
    const ch = await yt<any>('GET', 'channels', { part: 'snippet,brandingSettings,statistics,contentDetails', mine: 'true' });
    const c = ch.items?.[0];
    if (!c) return res.status(404).json({ error: 'no channel' });
    if (req.method === 'GET') {
      const up = c.contentDetails?.relatedPlaylists?.uploads;
      let videos: any[] = [];
      if (up) {
        const pl = await yt<any>('GET', 'playlistItems', { part: 'contentDetails,snippet,status', playlistId: up, maxResults: '50' });
        videos = (pl.items ?? []).map((i: any) => ({ id: i.contentDetails?.videoId, title: i.snippet?.title, published: i.contentDetails?.videoPublishedAt, privacy: i.status?.privacyStatus }));
        const ids = videos.map((v) => v.id).filter(Boolean);
        if (ids.length) {
          const st = await yt<any>('GET', 'videos', { part: 'statistics,contentDetails', id: ids.join(',') });
          const by: Record<string, any> = {};
          for (const x of st.items ?? []) by[x.id] = { ...x.statistics, duration: x.contentDetails?.duration };
          videos = videos.map((v) => ({ ...v, ...(by[v.id] ?? {}) }));
        }
      }
      return res.status(200).json({ id: c.id, title: c.snippet?.title, customUrl: c.snippet?.customUrl, description: c.snippet?.description, country: c.snippet?.country, branding: c.brandingSettings?.channel, hasBanner: Boolean(c.brandingSettings?.image?.bannerExternalUrl), stats: c.statistics, videos });
    }
    if (req.method !== 'POST') return res.status(405).end();
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body ?? {};
    const channel = { ...(c.brandingSettings?.channel ?? {}) };
    delete channel.title; // not writable via API
    if (body.description !== undefined) channel.description = body.description;
    if (body.keywords !== undefined) channel.keywords = body.keywords;
    if (body.country !== undefined) channel.country = body.country;
    if (body.defaultLanguage !== undefined) channel.defaultLanguage = body.defaultLanguage;
    const branding: any = { channel };
    if (body.bannerUrl) {
      const img = await fetch(body.bannerUrl);
      if (!img.ok) throw new Error(`fetch banner: ${img.status}`);
      const up = await fetch('https://www.googleapis.com/upload/youtube/v3/channelBanners/insert', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await ytAccessToken()}`, 'Content-Type': img.headers.get('content-type') || 'image/jpeg' },
        body: Buffer.from(await img.arrayBuffer()),
      });
      const j: any = await up.json().catch(() => ({}));
      if (!up.ok) throw new Error(`banner upload: ${j?.error?.message || up.status}`);
      branding.image = { bannerExternalUrl: j.url };
    }
    const hidden: string[] = [];
    for (const vid of body.hideVideoIds ?? []) { // reversible: set to private
      await yt('PUT', 'videos', { part: 'status' }, { id: vid, status: { privacyStatus: 'private' } });
      hidden.push(vid);
    }
    const r = await yt<any>('PUT', 'channels', { part: 'brandingSettings' }, { id: c.id, brandingSettings: branding });
    return res.status(200).json({ ok: true, hidden, channel: r.brandingSettings?.channel, banner: Boolean(r.brandingSettings?.image) });
  } catch (e: any) {
    return res.status(502).json({ error: e.message });
  }
}
