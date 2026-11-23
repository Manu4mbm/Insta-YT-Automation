import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSetting, setSetting } from '../../db.js';
import { exchangeCode, liAdminOrgs, liKey, liUserinfo } from '../../linkedin.js';
import { runAs } from '../../account.js';

const page = (title: string, msg: string) =>
  `<!doctype html><meta name="viewport" content="width=device-width,initial-scale=1"><body style="font:18px system-ui;background:#0C0D11;color:#F2EFE8;padding:32px"><h2>${title}</h2><p>${msg}</p></body>`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { code, state, error, error_description } = req.query as Record<string, string>;
  if (error) return res.status(400).send(page('LinkedIn connect cancelled', String(error_description || error)));
  const [s, ts, account, as, org] = ((await getSetting('li_oauth_state')) ?? '').split(':');
  if (!state || state !== s || !account || Date.now() - Number(ts) > 15 * 60e3) return res.status(400).send(page('Link expired', 'Open /api/x/linkedin-auth?account=… again.'));
  try {
    return await runAs(account, async () => {
      await exchangeCode(code);
      await setSetting('li_oauth_state', '');
      const me = await liUserinfo();
      const person = `urn:li:person:${me.sub}`;
      await setSetting(liKey('li_person'), person);
      await setSetting(liKey('li_name'), me.name ?? '');
      let author = person;
      let label = `profile <b>${me.name ?? me.sub}</b>`;
      if (as === 'org') {
        const orgs = await liAdminOrgs();
        const pick = org ? orgs.find((o) => o.endsWith(`:${org}`)) : orgs.length === 1 ? orgs[0] : undefined;
        if (!pick) {
          await setSetting(liKey('li_author'), person);
          return res.status(200).send(page('LinkedIn connected (profile only) ⚠️',
            `Company Page not picked. Pages you administer: ${orgs.join(', ') || 'none'}. Re-open with &as=org&org=&lt;id&gt;. Posts will go to your profile until then.`));
        }
        author = pick;
        label = `Company Page <b>${pick}</b>`;
      }
      await setSetting(liKey('li_author'), author);
      return res.status(200).send(page('LinkedIn connected ✅', `Account <b>${account}</b> → ${label}. Token valid ~60 days. Ye tab band kar do.`));
    });
  } catch (e: any) {
    return res.status(500).send(page('Connect failed', e.message));
  }
}
