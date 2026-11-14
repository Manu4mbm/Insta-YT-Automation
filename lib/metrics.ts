import { db } from './db.js';
import { ig } from './ig.js';

const AGES = [1, 3, 6, 24, 48, 72, 168];
const METRICS = ['views', 'reach', 'likes', 'comments', 'shares', 'saved', 'ig_reels_avg_watch_time'];

async function insights(mediaId: string) {
  const out: Record<string, number | null> = {};
  for (const k of METRICS) {
    try {
      const r = await ig<any>('GET', `${mediaId}/insights`, { metric: k });
      out[k] = r.data?.[0]?.values?.[0]?.value ?? r.data?.[0]?.total_value?.value ?? null;
    } catch { out[k] = null; }
  }
  return out;
}

/** Snapshot each published reel at 1/3/6/24/48 h after posting, so time slots can be compared at the same age. */
export async function snapshotMetrics(log: string[], deadline: number) {
  const since = new Date(Date.now() - 172 * 3600e3).toISOString();
  const { data: posts } = await db().from('posts').select('id, reel_slug, ig_media_id, published_at').eq('status', 'published').not('ig_media_id', 'is', null).gte('published_at', since);
  for (const p of posts ?? []) {
    const ageH = (Date.now() - new Date(p.published_at).getTime()) / 3600e3;
    const due = AGES.filter((a) => ageH >= a && ageH < a + (a < 6 ? 1 : a < 72 ? 3 : 4));
    if (!due.length) continue;
    const { data: have } = await db().from('post_metrics').select('age_h').eq('post_id', p.id).in('age_h', due);
    const todo = due.filter((a) => !(have ?? []).some((h: any) => h.age_h === a));
    if (!todo.length || Date.now() > deadline) continue;
    const m = await insights(p.ig_media_id);
    for (const a of todo) {
      await db().from('post_metrics').upsert({ post_id: p.id, age_h: a, views: m.views, reach: m.reach, likes: m.likes, comments: m.comments, shares: m.shares, saved: m.saved, avg_watch_ms: m.ig_reels_avg_watch_time });
      log.push(`${p.reel_slug}: metrics @${a}h`);
    }
  }
}

/**
 * Free → paid auto switch : a reel starts with a free guide; once its views cross
 * posts.auto_paid.views (within 48 h) the reel's DM switches to the paid buy link. Links already sent keep working.
 * posts.auto_paid = { views: 10000, product: 'slug', dm_text: '...', done?: true, at?: iso }
 */
export async function autoPaid(log: string[]) {
  const since = new Date(Date.now() - 48 * 3600e3).toISOString();
  const { data: posts } = await db().from('posts').select('id, reel_slug, ig_media_id, auto_paid').eq('status', 'published').not('auto_paid', 'is', null).gte('published_at', since);
  for (const p of posts ?? []) {
    const a = p.auto_paid as any;
    if (!a || a.done || !a.views || !a.product || !a.dm_text) continue;
    let views: number | null = null;
    try { const r = await ig<any>('GET', `${p.ig_media_id}/insights`, { metric: 'views' }); views = r.data?.[0]?.values?.[0]?.value ?? r.data?.[0]?.total_value?.value ?? null; } catch { continue; }
    if (views == null || views < a.views) continue;
    await db().from('products').update({ active: true }).eq('slug', a.product);
    await db().from('dm_rules').update({ dm_text: a.dm_text }).eq('post_id', p.id).eq('active', true);
    await db().from('posts').update({ auto_paid: { ...a, done: true, at: new Date().toISOString(), views_at_switch: views } }).eq('id', p.id);
    log.push(`${p.reel_slug}: auto-paid ON at ${views} views`);
  }
}
