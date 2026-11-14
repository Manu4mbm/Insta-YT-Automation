import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ig, igUserId, PROFILE_FIELDS } from '../../ig.js';
import { isCronAuthorized } from '../../auth.js';

/** Protected (CRON_SECRET): account-level analytics.
 *  GET /api/admin/account?part=profile  → profile + 30-day account insights
 *  GET /api/admin/account?part=media    → every post with its insights
 *  GET /api/admin/account?part=audience → follower demographics (needs 100+ followers) */
const ACC_TOTALS = ['reach', 'views', 'accounts_engaged', 'total_interactions', 'likes', 'comments', 'shares', 'saves', 'replies', 'profile_links_taps', 'follows_and_unfollows'];
const MEDIA_METRICS = ['views', 'reach', 'saved', 'shares', 'total_interactions', 'ig_reels_avg_watch_time', 'follows', 'profile_visits'];

const safe = async <T>(f: () => Promise<T>) => { try { return await f(); } catch (e: any) { return { error: String(e.message).slice(0, 160) } as any; } };

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!isCronAuthorized(req)) return res.status(401).json({ error: 'unauthorized' });
  const part = String(req.query.part ?? 'profile');
  const uid = await igUserId();
  const now = Math.floor(Date.now() / 1000), since = now - 29 * 86400;

  if (part === 'profile') {
    const profile = await safe(() => ig('GET', 'me', { fields: PROFILE_FIELDS() }));
    const totals: Record<string, any> = {};
    await Promise.all(ACC_TOTALS.map(async (m) => {
      totals[m] = await safe(async () => {
        const r = await ig<any>('GET', `${uid}/insights`, { metric: m, period: 'day', metric_type: 'total_value', since, until: now, ...(m === 'follows_and_unfollows' ? { breakdown: 'follow_type' } : {}) });
        const tv = r.data?.[0]?.total_value;
        return tv?.breakdowns?.length ? { value: tv.value, breakdown: tv.breakdowns[0].results } : tv?.value ?? null;
      });
    }));
    const daily_reach = await safe(async () => (await ig<any>('GET', `${uid}/insights`, { metric: 'reach', period: 'day', since, until: now })).data?.[0]?.values ?? null);
    const follower_count = await safe(async () => (await ig<any>('GET', `${uid}/insights`, { metric: 'follower_count', period: 'day', since, until: now })).data?.[0]?.values ?? null);
    return res.status(200).json({ profile, last_30_days: totals, daily_reach, follower_count });
  }

  if (part === 'media') {
    const list = await ig<any>('GET', 'me/media', { fields: 'id,caption,media_type,media_product_type,permalink,timestamp,like_count,comments_count', limit: 60 });
    const items: any[] = list.data ?? [];
    const out: any[] = [];
    for (let i = 0; i < items.length; i += 6) {
      const chunk = await Promise.all(items.slice(i, i + 6).map(async (m) => {
        const ins: Record<string, any> = {};
        await Promise.all(MEDIA_METRICS.map(async (k) => {
          ins[k] = await safe(async () => { const r = await ig<any>('GET', `${m.id}/insights`, { metric: k }); return r.data?.[0]?.values?.[0]?.value ?? r.data?.[0]?.total_value?.value ?? null; });
          if (ins[k]?.error) ins[k] = null;
        }));
        return { id: m.id, type: m.media_product_type || m.media_type, timestamp: m.timestamp, permalink: m.permalink, caption: String(m.caption ?? '').slice(0, 90), likes: m.like_count, comments: m.comments_count, ...ins };
      }));
      out.push(...chunk);
    }
    return res.status(200).json({ count: out.length, media: out });
  }

  if (part === 'audience') {
    const demo: Record<string, any> = {};
    for (const b of ['country', 'city', 'age', 'gender']) {
      demo[b] = await safe(async () => (await ig<any>('GET', `${uid}/insights`, { metric: 'follower_demographics', period: 'lifetime', metric_type: 'total_value', breakdown: b, timeframe: 'this_month' })).data?.[0]?.total_value?.breakdowns?.[0]?.results ?? null);
    }
    demo.engaged_country = await safe(async () => (await ig<any>('GET', `${uid}/insights`, { metric: 'engaged_audience_demographics', period: 'lifetime', metric_type: 'total_value', breakdown: 'country', timeframe: 'this_month' })).data?.[0]?.total_value?.breakdowns?.[0]?.results ?? null);
    return res.status(200).json(demo);
  }
  return res.status(400).json({ error: 'part must be profile|media|audience' });
}
