/**
 * Queue a finished reel for auto-posting.
 *   npx tsx insta-ai-automation/scripts/queue-reel.ts <reel-folder> --at "2026-10-25 19:00 IST" [--keyword GUIDE] [--dry-run]
 * Reads <reel-folder>/out/final.mp4, out/cover.png (optional), post.json:
 *   { caption, hashtags?: string[] (max 5), keyword?, dm_text?, guide_url?, public_reply?, follow_gate? (default true), gate_text? }
 * Uploads media to Supabase Storage bucket "reels", inserts rows in posts + dm_rules.
 */
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

const here = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(here, '..', '.env') });

function arg(name: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  return i > -1 ? process.argv[i + 1] : undefined;
}
const exists = (p: string) => access(p).then(() => true, () => false);

/** "2026-10-25 19:00 IST" | "2026-10-25 19:00" (IST assumed) | ISO with offset */
export function parseWhen(s: string): Date {
  const t = s.trim();
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(t)) return new Date(t);
  const m = t.replace(/\s*IST$/i, '').match(/^(\d{4}-\d{2}-\d{2})[ T](\d{1,2}):(\d{2})$/);
  if (!m) throw new Error(`Can't parse --at "${s}". Use "YYYY-MM-DD HH:MM IST".`);
  return new Date(`${m[1]}T${m[2].padStart(2, '0')}:${m[3]}:00+05:30`);
}

async function main() {
  const folder = process.argv[2];
  const at = arg('at');
  if (!folder || folder.startsWith('--') || !at) {
    console.error('Usage: queue-reel.ts <reel-folder> --at "YYYY-MM-DD HH:MM IST" [--keyword KW] [--dry-run]');
    process.exit(1);
  }
  const dir = path.resolve(folder);
  const slug = path.basename(dir);
  const video = path.join(dir, 'out', 'final.mp4');
  const cover = path.join(dir, 'out', 'cover.png');
  const postJsonPath = path.join(dir, 'post.json');
  if (!(await exists(video))) throw new Error(`Missing ${video}`);
  if (!(await exists(postJsonPath))) throw new Error(`Missing ${postJsonPath}`);

  const post = JSON.parse(await readFile(postJsonPath, 'utf8'));
  const keyword: string | undefined = (arg('keyword') || post.keyword)?.toUpperCase();
  const tags: string[] = post.hashtags ?? [];
  if (tags.length > 5) throw new Error(`Max 5 hashtags allowed by Instagram (got ${tags.length})`);
  const caption = [post.caption, tags.map((h) => (h.startsWith('#') ? h : `#${h}`)).join(' ')]
    .filter(Boolean)
    .join('\n\n');
  if (!post.caption) throw new Error('post.json needs "caption"');
  if (caption.length > 2200) throw new Error(`Caption too long (${caption.length}/2200)`);
  if (keyword && !post.dm_text) throw new Error('post.json needs "dm_text" when a keyword is set');
  const scheduledAt = parseWhen(at);
  if (isNaN(+scheduledAt)) throw new Error('Invalid date');

  const dmText = post.dm_text && post.guide_url && !post.dm_text.includes(post.guide_url)
    ? `${post.dm_text}\n${post.guide_url}`
    : post.dm_text;

  console.log(`Reel: ${slug}\nWhen: ${scheduledAt.toISOString()} (${scheduledAt.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST)\nKeyword: ${keyword ?? '—'}`);
  if (process.argv.includes('--dry-run')) {
    console.log('\n--- caption ---\n' + caption + (dmText ? '\n--- dm ---\n' + dmText : ''));
    return;
  }

  const url = process.env.SUPABASE_URL, key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in insta-ai-automation/.env');
  const sb = createClient(url, key, { auth: { persistSession: false } });

  const stamp = Date.now();
  async function upload(file: string, name: string, type: string) {
    const objectPath = `${slug}/${stamp}-${name}`;
    const { error } = await sb.storage.from('reels').upload(objectPath, await readFile(file), { contentType: type, upsert: true });
    if (error) throw new Error(`Upload ${name}: ${error.message}`);
    return sb.storage.from('reels').getPublicUrl(objectPath).data.publicUrl;
  }
  console.log('Uploading video…');
  const videoUrl = await upload(video, 'final.mp4', 'video/mp4');
  const coverUrl = (await exists(cover)) ? await upload(cover, 'cover.png', 'image/png') : null;

  const { data: row, error } = await sb
    .from('posts')
    .insert({ account: arg('account') || 'main', reel_slug: slug, video_url: videoUrl, cover_url: coverUrl, caption, keyword, scheduled_at: scheduledAt.toISOString(), first_comment: post.first_comment ?? null })
    .select('id')
    .single();
  if (error) throw new Error(`Insert post: ${error.message}`);

  if (keyword) {
    const { error: e2 } = await sb.from('dm_rules').insert({
      post_id: row.id,
      keyword,
      dm_text: dmText,
      follow_gate: post.follow_gate !== false, // default: resource only after follow
      ...(post.gate_text ? { gate_text: post.gate_text } : {}),
      ...(post.public_reply ? { public_reply: post.public_reply } : {}),
    });
    if (e2) throw new Error(`Insert dm_rule: ${e2.message}`);
  }
  console.log(`Queued ✔ post ${row.id}. Publish cron picks it up after the scheduled time.`);
}

main().catch((e) => {
  console.error('✖', e.message);
  process.exit(1);
});
