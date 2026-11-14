import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../../db.js';
import { ig, igUserId } from '../../ig.js';
import { isCronAuthorized } from '../../auth.js';

/**
 * Protected (CRON_SECRET): re-send the current resource message of a rule to users who already
 * received it (status=delivered) and interacted within the last 24 h (Instagram messaging window).
 * POST /api/admin/resend?keyword=EDIT
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  if (req.method !== 'POST') return res.status(405).end();
  const keyword = String(req.query.keyword ?? '').toUpperCase();
  const { data: rule } = await db().from('dm_rules').select('*').eq('keyword', keyword).eq('active', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (!rule) return res.status(404).json({ error: 'rule not found' });
  const since = new Date(Date.now() - 23.5 * 3600e3).toISOString();
  const { data: rows } = await db().from('dm_log').select('comment_id, ig_user_id, delivered_at').eq('keyword', keyword).eq('status', 'delivered').gte('delivered_at', since);
  const igId = await igUserId();
  const sentTo = new Set<string>(); const out: any[] = [];
  for (const r of rows ?? []) {
    if (!r.ig_user_id || sentTo.has(r.ig_user_id)) continue; // once per person
    try {
      await ig('POST', `${igId}/messages`, {}, { recipient: { id: r.ig_user_id }, message: { text: rule.dm_text } });
      sentTo.add(r.ig_user_id); out.push({ comment: r.comment_id, ok: true });
    } catch (e: any) { out.push({ comment: r.comment_id, ok: false, error: e.message }); }
  }
  return res.status(200).json({ keyword, results: out });
}
