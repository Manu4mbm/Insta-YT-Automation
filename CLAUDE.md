# Reels Automation — project rules for Claude

## Brand (filled in during setup — keep up to date)
- Owner name: {{OWNER_NAME}}
- Business name: {{BUSINESS_NAME}}
- Instagram handle: @{{IG_HANDLE}}
- Contact email: {{CONTACT_EMAIL}}
- App URL: https://{{APP_DOMAIN}}
- Niche: {{NICHE}}
- Language for scripts/captions: {{LANGUAGE}}  (e.g. Hinglish, Hindi, English)
- Voice: {{VOICE}}  (ElevenLabs voice name, or "owner records")

## Goal
1. Claude writes reel scripts (facts checked against current sources).
2. Reels are built with the video studio (`../video-studio`) and the video skills in `../skills`.
3. Reels auto-post to Instagram (and optionally YouTube Shorts) on a schedule.
4. Comment-to-DM funnel: a viewer comments a keyword → gets a DM with a free guide/link (lead magnet).

## Read first, every session
1. This file
2. `docs/STATUS.md` — what is done, what is next (update it at the end of every session)
3. `docs/ARCHITECTURE.md` — how the system works
4. `docs/META-SETUP.md` — what the owner must do in Meta / Instagram
5. `docs/PLAYBOOK.md` — what makes reels perform
6. `docs/REEL-WORKFLOW.md` — how every reel is made

## Working style
- Execution-first: read docs → build → fix only blocking errors → push to GitHub → deploy to Vercel.
- Ask only for: missing credentials, destructive actions, genuinely ambiguous decisions.
- Before any task, check STATUS.md so completed work is never repeated.

## Stack
- Vercel (serverless functions + crons), Supabase (Postgres + Storage for public video URLs, pg_cron + pg_net + Vault),
  GitHub, Instagram API with Instagram Login (graph.instagram.com), Node.js + TypeScript.

## Posting
- Default slot: 13:30 IST (test others inside 12:00–15:00; compare 6h views in the `slot_performance` view).
- New account / reach stuck with old followers → post as trial reel (`posts.trial_strategy = 'SS_PERFORMANCE'`).

## Hard rules
- Secrets (IG token, app secret, Supabase service key, webhook verify token, cron secret, Razorpay keys) live ONLY in `.env` / Vercel env vars / Supabase Vault. Never commit, never print, never ask the owner to paste them in chat.
- Respect API limits: ≤100 API-published posts / 24h; private reply = ONE DM per comment, within 7 days of the comment.
- DM only people who commented on that reel (keyword, or any comment when the rule has `any_comment`). One resource per person per reel. No spammy follow-ups.
- NEVER retry IG "(#2) Service temporarily unavailable" private replies — they often deliver anyway; retries spam users.
- Every link ever sent in a DM must keep working: when moving/renaming a guide, deploy a redirect first, then change the rule.
- Only use audio, footage and visuals the owner has rights to. Copy a viral reel's formula, never its video, script or artwork.
- Content facts (tool features, prices, laws, numbers) must be checked against current sources before scripting, and cited.
