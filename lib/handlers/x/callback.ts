import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSetting, setSetting } from '../../db.js';
import { exchangeCode, x } from '../../x.js';

const page = (title: string, msg: string) =>
  `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:18px system-ui;background:#0C0D11;color:#F2EFE8;padding:32px"><h2>${title}</h2><p>${msg}</p></body>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state, error } = req.query as Record<string, string>;
  if (error) return res.status(400).send(page('X connect cancelled', String(error)));
  const [s, verifier, ts] = ((await getSetting('x_oauth_state')) ?? '').split(':');
  if (!state || state !== s || !verifier || Date.now() - Number(ts) > 15 * 60e3) return res.status(400).send(page('Link expired', 'Dobara /api/x/auth kholo.'));
  try {
    await exchangeCode(code, verifier);
    await setSetting('x_oauth_state', '');
    const me = await x<any>('GET', 'users/me');
    await setSetting('x_user', JSON.stringify({ id: me.data?.id, username: me.data?.username }));
    return res.status(200).send(page('X connected ✅', `Account: <b>@${me.data?.username ?? 'unknown'}</b>. Ye tab band kar do.`));
  } catch (e: any) {
    return res.status(500).send(page('Connect failed', e.message));
  }
}
