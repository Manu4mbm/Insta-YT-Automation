import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSetting, setSetting } from '../../db.js';
import { exchangeCode, yt } from '../../yt.js';

const page = (title: string, msg: string) =>
  `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:18px system-ui;background:#0C0D11;color:#F2EFE8;padding:32px"><h2>${title}</h2><p>${msg}</p></body>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state, error } = req.query as Record<string, string>;
  if (error) return res.status(400).send(page('YouTube connect cancelled', String(error)));
  const saved = (await getSetting('yt_oauth_state')) ?? '';
  const [s, ts] = saved.split(':');
  if (!state || state !== s || Date.now() - Number(ts) > 15 * 60e3) return res.status(400).send(page('Link expired', 'Dobara /api/youtube/auth kholo.'));
  try {
    await exchangeCode(code);
    await setSetting('yt_oauth_state', '');
    const ch = await yt<any>('GET', 'channels', { part: 'snippet,statistics', mine: 'true' });
    const c = ch.items?.[0];
    if (c) await setSetting('yt_channel', JSON.stringify({ id: c.id, title: c.snippet?.title }));
    return res.status(200).send(page('YouTube connected ✅', `Channel: <b>${c?.snippet?.title ?? 'unknown'}</b>. Ye tab band kar do.`));
  } catch (e: any) {
    return res.status(500).send(page('Connect failed', e.message));
  }
}
