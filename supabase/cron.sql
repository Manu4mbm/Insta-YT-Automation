-- Run AFTER the Vercel deploy. Replace the two placeholders first (Claude does this for you
-- without ever printing the secret): APP_URL = your Vercel URL, CRON_SECRET = same value as the Vercel env var.
select vault.create_secret('https://YOUR-APP.vercel.app', 'app_url');
select vault.create_secret('PASTE_CRON_SECRET_HERE', 'cron_secret');

select cron.schedule('publish-due-reels', '*/15 * * * *', $$ select net.http_get(
  url := (select decrypted_secret from vault.decrypted_secrets where name = 'app_url') || '/api/cron/publish',
  headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
  timeout_milliseconds := 60000); $$);
select cron.schedule('poll-comments-dms', '* * * * *', $$ select net.http_get(
  url := (select decrypted_secret from vault.decrypted_secrets where name = 'app_url') || '/api/cron/poll',
  headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
  timeout_milliseconds := 55000); $$);
select cron.schedule('upload-due-youtube', '*/10 * * * *', $$ select net.http_get(
  url := (select decrypted_secret from vault.decrypted_secrets where name = 'app_url') || '/api/cron/youtube',
  headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
  timeout_milliseconds := 300000); $$);
-- only if you sell paid guides: re-checks missed keyword comments on paid reels
select cron.schedule('paid-reels-watch', '*/5 * * * *', $$ select net.http_get(
  url := (select decrypted_secret from vault.decrypted_secrets where name = 'app_url') || '/api/admin/paid-watch',
  headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'cron_secret')),
  timeout_milliseconds := 60000); $$);
select cron.schedule('purge-dm-log-90d', '15 2 * * *', $$ delete from public.dm_log where sent_at < now() - interval '90 days' $$);
