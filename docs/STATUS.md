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
- 2026-11-16: Multi-account code live (main=@indiabybharat, protech, visionguider; extra accounts need IG_ACCESS_TOKEN_<SLUG>). YouTube connected: Google Cloud project indiabybharat-reels-automation (owner mankdixit@gmail.com, consent published), channel IndiabyBharat UCPpOUfozU2n9TKU3rFN6lRg authorised via indiabybharat@gmail.com. Uploads stay private until YouTube API audit.
- 2026-11-23: X (Twitter) connected: app IndiaByBharat-AutoPost (console.x.com, pay-per-use credits), OAuth 2.0 as @indiabybharat; code lib/x.ts + api/x/[op] (auth|callback|cron); queue table `x_posts` (text ≤280, no links — link posts cost ~13x); pg_cron `post-due-x` every 10 min. Pending owner: add card in X Billing → Credits.
- 2026-11-23: Pro Tech Synergy social: X is now multi-account (`x_posts.account`, token `x_refresh_token:<slug>`, connect via /api/x/auth?account=protech; also `image_url` + `thread` columns). LinkedIn module added (lib/linkedin.ts; routes /api/x/linkedin-auth|linkedin-callback|linkedin-cron inside the X function to stay at 12 functions; queue `linkedin_posts`: text / image / PDF document / video + first comment; supabase/linkedin.sql). Pending owner: LinkedIn developer app + Vercel env LINKEDIN_CLIENT_ID/SECRET, connect /api/x/linkedin-auth?account=protech, connect Pro Tech X account; pg_cron `post-due-linkedin`. Member tokens last 60 days: reconnect when the cron log warns. Voice guide: protech-voice-writer skill.
- Next: webhook verify + comments field; add @protechsynergy & @visionguidersofficial (multi-account code); test post; brand placeholders; YouTube; App Review.
- (old) Pending owner: Vercel secrets (CRON_SECRET, WEBHOOK_VERIFY_TOKEN, SUPABASE_SERVICE_ROLE_KEY, Meta vars), Vault `cron_secret`, brand placeholders.

## Next
(first reel)

## Posting log
| Date | Reel | Slot (IST) | Trial? | 6h views | Notes |
|---|---|---|---|---|---|

## 2026-11-16 — kit pushed to repo
- `kit/` = laptop AI-Reels-Automation-Kit (skills, video-studio/animo-kit incl. india-unification project, tools/voicestudio-mcp, .mcp.json for VoiceStudio). Excluded: .env, node_modules, renders, zip, laptop copy of automation (repo root is canonical). `.vercelignore` keeps kit/ out of Vercel deploys.
- VoiceStudio: built-in MCP at http://127.0.0.1:3900/mcp/ (Claude Code via .mcp.json). Cloud chat needs desktop-config bridge (mcp-remote) — not yet connected.
- Pending: india-unification vo.wav → map reel render → schedule IG/YT (CTA PATEL, DM rule needed).

## 2026-11-17 — session log
- Published: india-unification (16 Nov 20:00), asean-manila (17 Nov 09:00), ind-pak-rivalry IG (17 Nov 16:30, owner-supplied video).
- Queued: jaipur-300 IG + YT long (18 Nov 13:00 IST); sixgen-race IG + YT Short (19 Nov 13:30 IST, English, 62 s).
- Added admin ops: yt-reschedule, yt-channel now returns per-video stats.
- Learnings: 30–40 s shorts get ~1.2k views; >70 s and "giant hand" style underperform. IG insights blocked (no insights permission) — likes only.
- Project sources: /home/claude/work/{jaipur,asean,sixgen} (Remotion). sixgen = dark radar world-map template, reusable for defence topics.

## 2026-11-23 — session handoff (India by Bharat)
**Strategy (approved):** plan doc "IndiabyBharat — 90-Day Growth & Monetisation Plan" (claude.ai/artifact/LqVthcHxeJMLrYGVEyhRWx).
- One upload/day, 13:30 IST, both platforms; Sunday long video (8–12 min) on YouTube.
- Series: इतिहास का Twist (indigo/gold), भारत के योद्धा (crimson/bronze, two-part stories), Rajasthan; IG-only defence/nostalgia (text+music, no voice); This Is India = YouTube only.
- Stop: politics/event coverage, meme trends, gimmicks, stock montages on IG, Alexander topics, reposts.
- Workflow per piece, made the DAY BEFORE: script + cited facts → approval → ONE ElevenLabs take (Ajay YBBkra773die41zqs6qu, eleven_v4) → render → approval → schedule.
- Style: "dynamic v2" (cuts every 1.5–3 s, moving camera, slam type, word-pop captions, grain, impact drums, no whoosh). Reference project: /home/claude/work/lachit (src/Reel.tsx). Skill proposed: dynamic-history-reel.

**Posted/queued:**
- 23 Nov 13:30 — itihas-twist-ep1-zero (IG + YT cjK2yk_3WxU) — live.
- 24 Nov 13:30 — yoddha-ep1-lachit-part1 (v2) — IG + YT live; X at 15:00.
- 25 Nov 13:30 — yoddha-ep1-lachit-part2 — IG + YT + X.
- RULE: every India by Bharat reel goes to IG + YT + X (x_posts, account main, short Hindi text + hashtags).

**Next:**
- 25 Nov: Lachit Part 2 — Saraighat 1671 (Lachit gravely ill, carried to war-boat, Mughals pushed back; Ram Singh retreats). Sources: kamrup.assam.gov.in, nvli.in, theprint.in excerpt, indianculture.gov.in. Script to owner by 16:00 IST 24 Nov.
- Then per calendar in plan doc (26 Nov Constitution handwritten / IG BrahMos; 27–28 Kuldhara Pt 1–2; 29 long video #1).
- Pending owner action: regenerate IG system-user token with instagram_manage_insights and put it in Vercel IG_ACCESS_TOKEN (insights still error #10).
- Lesson: copy only fully-encoded mp4s to public/media and verify with ffprobe after deploy (truncated repost files on 19 Nov).

## 2026-11-24 — reel engine (options A + B)
- `reel-engine/`: reusable Remotion engine, 33 scene types, 5 themes, spec-driven (`specs/<slug>.json`). Tools: voice.py (tighten + word timings), music.py, render.sh, cover.py. Demo of every scene: `specs/_demo.json`.
- From now on reels are made by writing a spec, not new code (target: about half the Claude usage per reel).
- `AGENTS.md` (rules for any AI) and `docs/ANTIGRAVITY-SETUP.md` (backup builder on owner's PC) added.
- Posted/queued: Lachit Part 1 live 24 Nov (IG/YT 13:30, X 15:00); Lachit Part 2 queued 25 Nov 13:30 IG+YT+X.

## 2026-11-26 handoff
- Kuldhara Part 1 (`rajasthan-kuldhara-part1`, 38.4 s) rendered and queued for IG, YT and X on 27 Nov 08:00 UTC (13:30 IST). Media verified live.
- New engine scenes: `village` (mode day|night|out|ruins, build), `caravan`, `stepwell` (from/to water level), `curse`. Cover tool: `cleanShot`/`cleanAt` renders a text-free background.
- Next: Kuldhara Part 2 (28 Nov), evidence: wells dry by 1815, earthquake study (Roy et al., Current Science), Salim Singh taxes. Script needs approval first.

## 2026-11-26 — aiwithdevansh (separate pipeline)
- Account setup done: Supabase settings row, Vercel token env, Meta tester role. Webhook OFF on purpose. Details: `aiwithdevansh-engine/STATUS.md`.
- Its own engine lives in `aiwithdevansh-engine/` (theme, scenes, voice, docs). India by Bharat's `reel-engine/` is not used for it.
- Gemini Skills reel (v4) approved. Uploaded 26 Nov to `reels/aiwithdevansh/gemini-skills-devansh.mp4` + `-cover.jpg` (verified). Queued 26 Nov: posts id 17a0206c-8aed-4cee-945a-24b4a3e44597, 27 Nov 13:30 IST, keyword SKILL. Owner decision: DMs via ReplyKaro only, NO built-in dm_rules for aiwithdevansh (no global/SKILL rules exist, checked). Guide live: https://insta-yt-automation-smoky.vercel.app/guides/gemini-skills. ReplyKaro automation created 26 Nov: Next Post, keywords SKILL/skill/Skill/SKILLS/skills/Skills, follow gate on, final button 'Open the guide' → guide URL (2 of 3 free automations used). Test: comment SKILL from another account after 13:30 IST 27 Nov. Note: built-in gate text defaults to IG_HANDLE (@indiabybharat); set `gate_text` with @aiwithdevansh in its dm_rules row.
- Cloud upload method (owner approved 26 Nov): pg_net call to /api/admin/upload-url using Vault `cron_secret` inside SQL, then curl PUT to the signed URL. Details: aiwithdevansh-engine/docs/PIPELINE.md step 10.

## 2026-11-27 handoff
- Kuldhara Part 2 (`rajasthan-kuldhara-part2`, 44.9 s) v2 queued for IG, YT and X on 28 Nov 08:00 UTC (13:30 IST). Media verified (byte-identical).
- Owner feedback: v1 visuals "monotonous". v2 uses new `src/engine/dossier.tsx` scenes: `board` (corkboard, polaroids, red string; focus/cross/tag), `polaroid` (hero photo + tape + note), `casefile` (folder opens, typed lines, stamp), `newspaper` (spin-in front page). Polaroid art kinds: village, night, well, river, coin, crack, people, curse, question. Prefer these for mystery/evidence reels.
- Also added: `harvest` scene, village `mode:"quake"`, counter `from`.
- Rule: never show invented numbers in graphics (removed % labels from harvest bars).
- git: shell glob `slug.*` misses `slug-cover.jpg`; add both files explicitly.
- Next: 29 Nov long video #1; 1 Dec Rani Abbakka Part 1 (promised on end cards). Script needs approval first.
