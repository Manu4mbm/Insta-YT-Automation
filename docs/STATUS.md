# STATUS — update at the end of every session

## Setup checklist
- [ ] 1. Brand details filled (CLAUDE.md "Brand" section + public/*.html placeholders)
- [x] 2. Supabase project created, `supabase/schema.sql` run
- [x] 3. GitHub repo created and pushed
- [x] 4. Vercel project deployed, env vars added (see .env.example)
- [x] 5. Meta app (Unified login, main = @indiabybharat; webhook verify pending): Instagram API with Instagram Login, token in env, webhook verified (docs/META-SETUP.md)
- [x] 6. `supabase/cron.sql` run (Vault secrets + pg_cron jobs)
- [ ] 7. Test: /api/health OK, test comment on a reel → DM arrives
- [ ] 8. Optional: YouTube Shorts connected (docs/YOUTUBE.md)
- [ ] 9. Optional: paid guides (Razorpay) configured
- [x] 10. Video studio: `video-studio/engine` npm install + one test render

## Done
- 2026-11-14: Supabase project jfhwzjfaefywfktzerlp — schema.sql applied, public bucket `reels`, Vault `app_url`, pg_cron jobs (publish 15m, poll 1m, youtube 10m, purge daily).
- 2026-11-14: GitHub Manu4mbm/insta-yt-automation (main) pushed; Vercel project insta-yt-automation linked, live at https://insta-yt-automation-smoky.vercel.app
- 2026-11-14: Meta app 2167109920843634 (Unified login, SUAT config 1494606345938240); code supports IG_API_HOST=graph.facebook.com; /api/health all green for @indiabybharat (17841480386963690). Windows setup done on owner laptop.
- Next: webhook verify + comments field; add @protechsynergy & @visionguidersofficial (multi-account code); test post; brand placeholders; YouTube; App Review.
- (old) Pending owner: Vercel secrets (CRON_SECRET, WEBHOOK_VERIFY_TOKEN, SUPABASE_SERVICE_ROLE_KEY, Meta vars), Vault `cron_secret`, brand placeholders.

## Next
(first reel)

## Posting log
| Date | Reel | Slot (IST) | Trial? | 6h views | Notes |
|---|---|---|---|---|---|
