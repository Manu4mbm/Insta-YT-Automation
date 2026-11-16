---
name: instagram-autopost-dm
description: Set up and run Instagram Reels + YouTube Shorts auto-posting on a schedule and a comment-to-DM lead-magnet funnel (follow-gate, pacing, cooldowns) with Vercel + Supabase + Instagram API with Instagram Login. Use for posting/scheduling reels, comment→DM, webhooks, DM blocks, posting-time data, or deploying this backend.
---

# Instagram auto-post + comment→DM funnel

Full working code: `assets/insta-ai-automation/` (Node + TypeScript, Vercel functions, Supabase). Read its `CLAUDE.md`, `docs/ARCHITECTURE.md`, `docs/META-SETUP.md`, `docs/YOUTUBE.md` first.

## Setup (once)
1. Instagram → Professional (Creator/Business), public.
2. Meta app (developers.facebook.com) → "Instagram API with Instagram Login" → permissions `instagram_business_basic`, `instagram_business_content_publish`, `instagram_business_manage_comments`, `instagram_business_manage_messages` → long-lived token.
3. Supabase project → run `supabase/schema-full.sql` (replace `YOUR_CRON_SECRET`, `YOUR-APP`). Creates tables, public `reels` bucket, pg_cron jobs (publish every 15 min, poll every 1 min, YouTube every 10 min).
4. GitHub repo → Vercel import → env vars from `.env.example` (IG_USER_ID, IG_ACCESS_TOKEN, META_APP_SECRET, WEBHOOK_VERIFY_TOKEN, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, CRON_SECRET, GRAPH_VERSION, APP_URL, YT_CLIENT_ID, YT_CLIENT_SECRET).
5. Webhook `https://<app>/api/webhook`, field `comments`. YouTube: OAuth once via `/api/youtube/auth`.
6. Public DMs need Meta App Review (Advanced Access) + Business Verification; until then the poll cron is the safety net.
**Secrets only in Vercel env / .env — never in chat, never committed.**

## Queue a reel
Upload `final.mp4` + cover JPEG to Storage (`/api/admin/upload-url?path=<slug>/<file>`, Bearer CRON_SECRET) → insert `posts` (caption, keyword, scheduled_at, first_comment) + `dm_rules` (keyword, dm_text with guide URL, follow_gate=true, any_comment=true) + `yt_posts` (same time). Check status after the slot (`posts.status = published`, `ig_media_id` set).

## DM funnel rules (learned from an Instagram action block)
- DM only commenters; ONE private reply per comment within 7 days; one resource per person per reel; follow-up only if the user replies (24 h window).
- Follow-gate always on: button "follow karo" → after follow, link as a **button** (not text). Already-followers get the link directly.
- Pacing: ≤ 2 new comment DMs/min, random 3–7 s gap, ~33% of runs skipped (human rhythm), hourly/daily caps in `settings` (start 30/300, raise slowly after clean days).
- On block (#368, spam/limit errors): automatic cooldown 20→40→60→120→240→360 min. Viral spike (≥ 25 DMs/h on a reel) → no public replies. Vary every text. One DM tool per account (not ManyChat + this together).
- Poll keeps ≥ 20 s spare per step under the 60 s function limit and handles the **newest reel first** (otherwise old backlog starves new comments).
- `/guides` hub link in bio as fallback.

## Known gotchas
- `media_publish` can time out while Instagram still publishes → repair step recovers the media id by caption.
- Instagram API cannot delete media (#100/33) — delete in the app.
- `dm_log.status` check constraint must allow `skipped`, or the queue loops on the same comment.
- Max 100 API posts / 24 h; ≤ 5 hashtags; `share_to_feed=true`.
- Metrics snapshots at 1/3/6/24/48 h → `slot_performance` view decides posting slots.
