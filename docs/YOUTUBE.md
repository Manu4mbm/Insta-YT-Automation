# YouTube — strategy + pipeline (decided 2026-10-24)

Channel niche: **Build with AI (Hinglish)** — same brand as Instagram @{{IG_HANDLE}}.

## Schedule
| What | When (IST) | Source |
|---|---|---|
| YouTube Short | 2/day, same file + same time as the IG reel (12:00 + 13:30 IST) | every reel = a Short |
| Long video | **Mon, Wed, Sat 11:00 IST** | the owner 2026-10-25: no evening posts — morning/afternoon only |

Spacing 2–3 days between long videos; max 2 uploads/day (notification cap is 3/24h).

## Format
- **Long video (8–12 min, 16:9 1920x1080):** one full build/tutorial ("X se Y banao, step by step"). Chapters, hook in first 30 s, re-hook every ~60–90 s, guide link in description + pinned comment.
- **Hub → spokes:** each long video seeds 2–3 reels/Shorts (hook moments). Reels point to the long video ("full build YouTube pe").
- **Shorts:** same as reel. Completion is king (70%+ = push); sweet spot 15–60 s. Hook in 1–3 s, visual change every ~3 s. Title 4–6 words (~40 chars visible), 3–5 hashtags.
- Music: only our own synthesized beds (no licensed tracks → no Content ID blocks, full Shorts revenue share).

## Monetization targets (verify on YouTube Help before applying)
- Now: 1,000 subs + 4,000 long-form watch hours (12 mo) **or** 10M Shorts views (90 d). Expanded tier: 500 subs + 3 uploads/90 d + 3,000 h or 3M Shorts views.
- **From 1 Feb 2027 (new applicants): 8,000 qualified watch hours or 20M qualified Shorts views** (PPC Land, citing Team YouTube). → Aim to qualify + apply before Feb 2027 if possible; long-form watch hours is the realistic route.
- "Inauthentic content" policy (Jul 2025): mass-produced/templated content risks monetization → every long video must have the owner's own voice/commentary, real screen recordings, original teaching. Disclose realistic AI-altered/synthetic media in Studio when applicable.

## Growth rules (from claude-youtube skill references)
- Algorithm = audience satisfaction: shares > rewatch > session continuation > saves > likes > comments.
- AVD < 40% gets deprioritized → tight scripts, no long intros.
- Reply to comments in the first 2 hours.
- Channels < 500 subs get extra testing; consistency > frequency.
- Shorts lose freshness after ~28–30 days.

## Pipeline (code: api/youtube/*, table yt_posts)
- OAuth once  → refresh token stored in `settings` (never printed).
- `yt_posts` queue: slug, kind (short|long), video_url, title, description, tags, privacy, scheduled_at, status, yt_video_id.
- Cron (pg_cron every 15 min) → `/api/cron/youtube` uploads due items (resumable upload streamed from Supabase Storage).
- Unaudited API projects upload as **private**; until the Google audit passes, the owner flips to Public in Studio (or we set it after audit).

## Skills installed
- `.claude/skills/youtube` (AgriciDaniel/claude-youtube, MIT): script, hook, seo, metadata, shorts, calendar, monetize sub-skills + references.
- Skipped: davepoon youtube-automation (needs Composio/Rube third-party), youtube-full (paid TranscriptAPI), rediumvex (Seedance/Higgsfield prompts, not our Remotion pipeline), smorand/claude-config (repo not reachable). HyperFrames CLAUDE.md is for HyperFrames projects; our engine stays Remotion.

## Per-reel checklist (added to the reel workflow)
When a reel is queued for IG, also insert a `yt_posts` row (kind=short, same video_url + SAME scheduled_at — the owner: same reel same day on both): title ≤ 40 chars, description = hook + steps + guide link + 3–5 hashtags incl. #Shorts, tags, first_comment with guide link, synthetic_media=true when AI voices are used.

## Setup status
- Code deployed (routes: /api/youtube/auth, /api/youtube/callback, /api/cron/youtube, /api/admin/youtube). Cron waits until connected.
- Pending : Google Cloud project → enable YouTube Data API v3 → OAuth consent (External, publish to Production) → OAuth client (Web, redirect https://{{APP_DOMAIN}}/api/youtube/callback) → Vercel env YT_CLIENT_ID + YT_CLIENT_SECRET → redeploy → open /api/youtube/auth. Then API audit form for public uploads.
- YT Shorts: reel-1 uploaded 2026-10-24 (r528teM3s4A); reel-2 Sun 25 Oct 13:00 IST; reel-3 Mon 26 Oct 20:30 IST (Shorts best: weekdays 7–11 PM, Sun 11 AM–2 PM).
