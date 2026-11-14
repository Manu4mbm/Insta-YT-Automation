import { getSetting, setSetting } from './db.js';

/** Instagram "action block" / spam / rate-limit style errors (codes are added to messages by lib/ig.ts). */
export function isRateLimit(msg: string): boolean {
  return /\(#(4|17|32|368|613)[/)]|2207051|2534022|spam|rate limit|too many|try again later|मर्यादित|प्रयत्न करू/i.test(msg ?? '');
}

export async function cooldownUntil(): Promise<number> {
  return Number((await getSetting('send_cooldown_until')) || 0);
}
export async function inCooldown(): Promise<boolean> {
  return Date.now() < (await cooldownUntil());
}

/** Pause all outgoing DMs/replies. Escalates 20 → 40 → 60 → 120 → 240 → 360 min if blocks keep coming within 8 h. */
export async function startCooldown(): Promise<number> {
  const last = Number((await getSetting('send_cooldown_set_at')) || 0);
  const prev = Number((await getSetting('send_cooldown_level')) || 0);
  const level = Date.now() - last < 8 * 3600e3 ? Math.min(prev + 1, 6) : 1;
  const mins = [0, 20, 40, 60, 120, 240, 360][level]; // #368 action blocks can last hours — back off hard, don't poke it
  const until = Date.now() + mins * 60e3;
  if (until > (await cooldownUntil())) {
    await setSetting('send_cooldown_until', String(until));
    await setSetting('send_cooldown_level', String(level));
    await setSetting('send_cooldown_set_at', String(Date.now()));
  }
  return mins;
}

export const PUBLIC_REPLIES = ['DM check karo 📩', 'Bhej diya, DM dekho 🙌', 'DM mein hai 📬', 'Check your DM ✅', 'Inbox check karo 📩', 'Sent! DM dekho 🚀'];
