import { db, getSetting } from './db.js';
import { ig } from './ig.js';
import { inCooldown, isRateLimit, startCooldown } from './throttle.js';

/**
 * Every outgoing Instagram action (private reply, DM, public comment reply) goes through here so the
 * account behaves like a person, not a bot: hourly + daily budget (settings dm_hourly_cap / dm_daily_cap,
 * raise them slowly as the account matures), automatic pause on Instagram blocks, and a send log.
 */
export type Kind = 'private_reply' | 'dm' | 'nudge' | 'public_reply';

export async function canSend(): Promise<boolean> {
  if (await inCooldown()) return false;
  const hourCap = Number((await getSetting('dm_hourly_cap')) || 30);
  const dayCap = Number((await getSetting('dm_daily_cap')) || 300);
  const h = new Date(Date.now() - 3600e3).toISOString();
  const d = new Date(Date.now() - 864e5).toISOString();
  const [{ count: inHour }, { count: inDay }] = await Promise.all([
    db().from('send_log').select('id', { count: 'exact', head: true }).gte('at', h),
    db().from('send_log').select('id', { count: 'exact', head: true }).gte('at', d),
  ]);
  return (inHour ?? 0) < hourCap && (inDay ?? 0) < dayCap;
}

/** Throws on failure; starts the cooldown itself on Instagram block/rate-limit errors. */
export async function send(kind: Kind, path: string, params: Record<string, any>, body?: unknown) {
  try {
    const r = await ig<any>('POST', path, params, body);
    await db().from('send_log').insert({ kind });
    await new Promise((ok) => setTimeout(ok, 3000 + Math.random() * 4000)); // human-like gap between actions
    return r;
  } catch (e: any) {
    if (isRateLimit(e.message)) await startCooldown();
    throw e;
  }
}

/** Small natural variation so no two DMs are byte-identical. */
const OPENERS = ['', 'Hey! ', 'Hi 👋 ', 'Thanks for the comment! ', 'Haan ji! ', 'Ye raha 👇 '];
export const vary = (text: string) => OPENERS[Math.floor(Math.random() * OPENERS.length)] + text;

/** A reel is "hot" when it got ≥ 25 comment DMs in the last hour → one message per commenter, no gate, no public replies. */
export async function isHot(postId: string | null | undefined): Promise<boolean> {
  if (!postId) return false;
  const h = new Date(Date.now() - 3600e3).toISOString();
  const { count } = await db().from('dm_log').select('comment_id', { count: 'exact', head: true }).eq('post_id', postId).gte('sent_at', h);
  return (count ?? 0) >= 25;
}

/** Guide link as tappable buttons (button template) instead of raw URLs in text — raw links at volume look like spam. */
export function linkMessage(dmText: string): any {
  const urls = Array.from(new Set(dmText.match(/https?:\/\/\S+/g) ?? []));
  if (!urls.length) return { text: vary(dmText) };
  const text = vary(dmText.replace(/(📄\s*PDF:\s*)?https?:\/\/\S+/g, '').replace(/\n{3,}/g, '\n\n').trim()).slice(0, 600);
  const buttons = urls.slice(0, 3).map((u, i) => ({ type: 'web_url', url: u, title: /\.pdf$/i.test(u) ? 'PDF download 📄' : i === 0 ? 'Guide kholo 📘' : 'Link kholo' }));
  return { attachment: { type: 'template', payload: { template_type: 'button', text, buttons } } };
}

/** Send the guide; if Instagram refuses the template (not a block), fall back to plain text once. */
export async function sendLink(kind: Kind, igId: string, recipient: any, dmText: string) {
  try {
    return await send(kind, `${igId}/messages`, {}, { recipient, message: linkMessage(dmText) });
  } catch (e: any) {
    if (isRateLimit(e.message) || /comment_id/.test(JSON.stringify(recipient)) && /already|replied/i.test(e.message)) throw e;
    return await send(kind, `${igId}/messages`, {}, { recipient, message: { text: vary(dmText) } });
  }
}
