# Reel workflow  — follow exactly

## Steps
1. **the owner gives a reference video** (file in chat / in folder).
2. **Claude:** transcribe it (faster-whisper) + note structure (hook, beats, CTA, pacing, on-screen style).
   Create folder `clients/my-brand/reels/reel-<N>-<title-slug>/` with:
   - `reference/` (reference video + `transcript.txt` + `notes.md` — what works, what to improve)
   - `script.txt` — ORIGINAL Hinglish script inspired by the reference: same idea/angle, rewritten, enhanced, facts verified this week (sources in `notes.md`). Never copy lines verbatim.
     Format: reel-studio rules (one beat per line, `*hero*` words, no TTS tags). Target ~45–60 s for explainers; no hard cap — dialogue reels may run longer .
   - If the reel has a lead magnet: CTA line "Comment <KEYWORD> …" at the end.
   → **Stop. the owner approves script.**
3. **the owner:** makes `audio.mp3` with ElevenLabs from `script.txt` and drops it in the reel folder.
4. **Claude:** kinetic-reel pipeline (Pass 01→06) → `out/final.mp4` (40–60 s, 1080×1920, 30 fps, H.264/AAC) + `out/cover.png` (thumbnail: hook text big inside centre 3:4, readable on phone grid).
5. **Claude:** `post.json` (caption, hashtags, keyword, dm_text, guide_url) + lead magnet (if any).
   → **Stop. Show the owner: reel + thumbnail + caption + resource.** Nothing is queued before approval.
6. **On "approve":** from Claude's cloud workspace (no commands on the owner's laptop):
   - get one-time upload URLs: `GET /api/admin/upload-url?path=<reel-slug>/<file>` (Bearer CRON_SECRET) → `PUT` final.mp4, cover.jpg (JPEG cover for IG).
   - insert `posts` row (caption + ≤5 hashtags, keyword, scheduled_at IST) + `dm_rules` row (dm_text with guide URL, follow_gate true, gate_text) via Supabase MCP.
   - (`/reel-post` + `scripts/queue-reel.ts` still work from a machine that has `.env`.)
   - schedule a check-in ~20 min after slot to verify `status=published`.
7. After publish: check `/api/health` + posts row = published; note in `notes.md`.

## Lead-magnet reels ("comment X, resource milega")
Claude makes and manages all 4: **reel, thumbnail, caption, resource**.
- Resource = useful guide/cheat sheet/prompt pack, published as a page at
  `https://YOUR-APP.vercel.app/guides/<slug>` (file `insta-ai-automation/public/guides/<slug>.html`, deployed on Vercel). Mobile-first, branded, no login.
- `post.json.guide_url` = that URL; `dm_text` = 1 line value + link + soft follow CTA.
- Keyword: short, unique, UPPERCASE, matches the CTA said in the audio.
- Until Meta App Review passes, public DMs run via ManyChat with the same keyword + link.

## Caption & reach rules (Instagram, verified Oct 2026)
- **Max 5 hashtags** (Instagram caps posts/Reels at 5 since Dec 2025) — use 3–5 specific ones, no generic spam blocks. (queue-reel enforces ≤5.)
- First line = hook (shows before "more"); keywords people search (e.g. "Claude Code tutorial Hindi") in first 1–2 lines — captions are searchable.
- Body: 3–4 ✅ value lines, then CTA ("Comment RAG + follow → guide + PDF DM mein"), then a **share line** ("🔁 Us dost ko bhejo jo…") and a **save line** ("💾 Save kar lo…") — shares/saves weigh most for reach — then 1 easy question to drive comments.
- First ~125 chars = hook + searchable words (tool names, "Hindi mein"); they show before "more".
- `post.json.first_comment`: publish cron auto-posts a CTA comment right after publishing → **the owner pins it** in the app (pinning isn't available via API).
- `share_to_feed=true` (set in publish code) so the reel shows on the grid.
- Cover: own designed `cover.png`, hook text inside centre 3:4 (grid crop).
- Post time: 13:30 IST by default (see PLAYBOOK) unless the owner says otherwise.
- Original audio only (ElevenLabs VO); no copyrighted music.
- No fake stats, no income guarantees; tool facts verified the week of posting.

## Extra rules (adapted from Jakeschincariol/instagram-agent-skill — read as reference, scripts not executed)
- **Beat sheet:** 0–2 s hook (motion in frame 1, no greeting/logo sting) → 2–7 s stake (why it matters) → body, one idea per beat, **no beat > 4 s, no static frame > 8 s**, change the frame every beat → last 3 s payoff + ONE ask.
- **Loop:** last line echoes a word from the hook so the replay loops.
- **One idea per reel.** Specific numbers over adjectives; never invent metrics.
- **On-screen text:** ≤ 6 words per card; hook card at frame 1; burned-in captions for the body (most watch muted). Keep key text out of the right ~230 px and the bottom caption zone.
- **Caption:** decide its job first (Reel hooks → line 1 = the ask; caption-as-content → line 1 = hook ending on a cliff). Never start with a greeting, hashtag or emoji. Then 2–6 short paragraphs, **one ask only**, hashtags (≤ 5, specific, no #viral/#fyp/#explorepage) on the last line. Work **2–3 search phrases** into the body as natural sentences (IG search reads captions). No links in caption (bio/DM/first comment). Emoji ≤ 4 per 100 chars. Keyword CTA = one typeable word, also said in the video.
- **Visual standard :** premium dynamic motion graphics — smooth 3D camera moves (perspective/parallax/dolly), morphing shapes, relevant professional graphics (not just typography); characters in **pixel art** for dialogue reels.
