-- Multi-account X + LinkedIn auto-post queues. Rows are added only for posts the owner has approved.
alter table public.x_posts add column if not exists account text not null default 'main'; -- main = @indiabybharat, protech = Pro Tech Synergy
alter table public.x_posts add column if not exists image_url text;                         -- PNG/JPG chart (used when no video_url)
alter table public.x_posts add column if not exists thread text[];                          -- extra posts chained as a thread

create table if not exists public.linkedin_posts (
  id uuid primary key default gen_random_uuid(),
  account text not null default 'protech',
  slug text not null unique,
  commentary text not null,            -- plain text; #Hashtags auto-converted, reserved chars auto-escaped. No links (put them in first_comment)
  media_type text not null default 'none' check (media_type in ('none','image','document','video')),
  media_url text,                      -- public URL (Supabase Storage): PNG/JPG, PDF carousel, or MP4
  media_title text,                    -- required for documents (shown on the carousel)
  alt_text text,
  first_comment text,
  scheduled_at timestamptz not null,
  status text not null default 'queued',   -- queued | posting | posted | failed
  attempts integer not null default 0,
  post_urn text,
  comment_urn text,
  error text,
  posted_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.linkedin_posts enable row level security;
create index if not exists linkedin_posts_due on public.linkedin_posts (status, scheduled_at);
create index if not exists x_posts_due on public.x_posts (status, scheduled_at);
-- Run AFTER deploy:
-- select cron.schedule('post-due-linkedin', '*/10 * * * *', $$ select net.http_get(
--   url := (select decrypted_secret from vault.decrypted_secrets where name = 'app_url') || '/api/x/linkedin-cron',
--   headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
--   timeout_milliseconds := 300000); $$);
