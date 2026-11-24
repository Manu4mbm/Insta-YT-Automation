# AGENTS.md — rules for any AI working on this repo (Claude, Antigravity/Gemini, others)

Read this file, then `CLAUDE.md` and `docs/STATUS.md`, before doing anything. Update `docs/STATUS.md` at the end of every session.

## What this repo does
- `reel-engine/` — makes India by Bharat reels from a JSON spec (see `reel-engine/README.md`). **New reels = new spec files, not new code.**
- Vercel API + Supabase cron — posts queued videos to Instagram (`posts`), YouTube (`yt_posts`) and X (`x_posts`) for account `main`.
- `public/media/` — finished mp4s and covers, served publicly after push to `main` (Vercel deploys automatically).

## Owner rules (Mr. Dixit)
- Address him as "Mr. Dixit"; replies short, formal, precise. Neutral and non-political.
- Nothing is posted, scheduled or changed on any platform without his approval. Workflow per reel: script + sources → approval → voice/render/cover → approval → schedule.
- One voice take only (ElevenLabs credits). No whoosh sounds. Only original or licensed visuals/audio; no logos or copyrighted IP.
- Every fact checked against current sources and cited in the caption/description.
- Default slot 13:30 IST, one reel a day, on Instagram + YouTube + X.

## Hard rules
- Secrets live only in Vercel env vars / Supabase Vault. Never write keys or tokens in any file, commit, or chat.
- Do not change posting code, cron, or database schema unless the owner asks.
- Only copy fully encoded mp4s to `public/media/`, then verify the served file with ffprobe after deploy.
- Work in one tool at a time. Before switching tools: commit and push. On arrival: pull.
- Prefer a branch for code changes (`git checkout -b <task>`); merge to `main` only after a test render.
