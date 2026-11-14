# Architecture

```
 laptop (Claude Code + reel-studio)                     Vercel                          Instagram (graph.instagram.com)
 ┌──────────────────────────────┐        ┌───────────────────────────────┐        ┌───────────────────────────┐
 │ /reel-ship → out/final.mp4   │        │ /api/cron/publish  (every 15m)│──────▶ │ POST /{IG_ID}/media        │
 │ /reel-post → queue-reel.ts ──┼──┐     │   due posts → container →     │        │   media_type=REELS,video_url│
 └──────────────────────────────┘  │     │   poll status → media_publish │        │ GET /{container}?status_code│
                                    ▼     │ /api/cron/refresh-token (wkly)│        │ POST /{IG_ID}/media_publish │
                          Supabase       │ /api/webhook  GET verify       │◀────── │ webhook: comments           │
                ┌────────────────────┐   │               POST comments ───┼──────▶ │ POST /{IG_ID}/messages      │
                │ Storage: reels/    │◀──│   keyword → private reply DM  │        │   recipient.comment_id (DM) │
                │ posts, dm_rules,   │   │   + public reply "DM check karo"│       │ POST /{comment_id}/replies  │
                │ dm_log, settings   │   └───────────────────────────────┘        └───────────────────────────┘
                └────────────────────┘
```

## Supabase schema
```sql
create table posts (
  id uuid primary key default gen_random_uuid(),
  reel_slug text not null,
  video_url text not null,            -- public URL from Storage bucket "reels"
  cover_url text,
  caption text not null,
  keyword text,                        -- e.g. GUIDE / RAG / CLAUDE (comment trigger)
  scheduled_at timestamptz not null,
  status text not null default 'queued', -- queued | container | published | error
  container_id text,
  ig_media_id text,
  error text,
  created_at timestamptz default now()
);
create table dm_rules (                -- keyword → DM content (per post or global)
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id),   -- null = applies to all posts
  keyword text not null,               -- match case-insensitive, whole word
  dm_text text not null,               -- includes guide URL
  public_reply text default 'DM check karo 📩'
);
create table dm_log (                  -- idempotency: one DM per comment
  comment_id text primary key,
  ig_user_id text, post_id uuid, sent_at timestamptz default now(), ok boolean, error text
);
create table settings (key text primary key, value text, updated_at timestamptz default now());
-- settings: ig_access_token, ig_token_expires_at, ig_user_id
```
Bucket `reels`: public read, write only with service key.

## Endpoints
- `GET /api/webhook` — echo `hub.challenge` if `hub.verify_token` == `WEBHOOK_VERIFY_TOKEN`.
- `POST /api/webhook` — verify `X-Hub-Signature-256` with `META_APP_SECRET`; for each `comments` change: skip own comments, match keyword, skip if in `dm_log`, send private reply (`POST /{IG_ID}/messages` body `{recipient:{comment_id}, message:{text}}`), public reply on comment, write `dm_log`. Always return 200 fast.
- `GET /api/cron/publish` (Vercel Cron, protected by `CRON_SECRET`): for `queued` posts with `scheduled_at <= now()` → create container; for `container` posts → check `status_code`; `FINISHED` → `media_publish` → store `ig_media_id`; `ERROR/EXPIRED` → mark error. Check `content_publishing_limit` first.
- `GET /api/cron/refresh-token` weekly: `GET https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=…` → save to `settings`.

## Env vars
`IG_USER_ID`, `IG_ACCESS_TOKEN` (initial long-lived; then from settings), `META_APP_SECRET`, `WEBHOOK_VERIFY_TOKEN`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CRON_SECRET`, `GRAPH_VERSION` (check current version in Meta docs at build time).

## Local CLI (`scripts/queue-reel.ts`)
`npx tsx scripts/queue-reel.ts <reel-folder> --at "2026-10-25 19:00 IST" --keyword GUIDE`
Reads `<reel-folder>/out/final.mp4`, `out/cover.png`, `post.json` (caption, hashtags, keyword, dm_text) → uploads to Storage → inserts `posts` + `dm_rules`.

## Video spec
1080×1920, 30fps, H.264 + AAC MP4 (reel-studio default). Verify current Reels API spec in Meta docs before first upload.
