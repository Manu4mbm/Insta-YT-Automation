-- X (Twitter) auto-post queue. Rows are added only for reels the owner has approved.
create table if not exists public.x_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  text text not null,                 -- max 280 chars; avoid links (a post with a URL costs ~13x more)
  video_url text,
  reply_text text,                    -- optional first reply under the post
  scheduled_at timestamptz not null,
  status text not null default 'queued',   -- queued | posting | posted | failed
  attempts integer not null default 0,
  tweet_id text,
  reply_id text,
  error text,
  posted_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.x_posts enable row level security;
-- Run AFTER deploy:
-- select cron.schedule('post-due-x', '*/10 * * * *', $$ select net.http_get(
--   url := (select decrypted_secret from vault.decrypted_secrets where name = 'app_url') || '/api/x/cron',
--   headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
--   timeout_milliseconds := 300000); $$);
