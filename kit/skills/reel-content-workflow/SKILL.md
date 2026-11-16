---
name: reel-content-workflow
description: End-to-end workflow for an Instagram Reel / YouTube Short in the AI-tech niche — reference video → original Hinglish script → voiceover → reel → caption/post pack → approval → schedule. Use when the user says "next reel banao", gives a reference reel, asks for a script, caption, hook, or what format/time to post.
---

# Reel content workflow (channel playbook)

Detailed docs in this folder: `REEL-WORKFLOW.md` (steps + caption rules), `WHAT-WORKS.md` (what went viral and why), `CONTENT-STRATEGY.md` (niche, pillars, lead magnets). Read them before writing a script.

## Steps — stop at every ⏸
1. **Reference:** user gives a reel link/file. Watch it (use the `watch` skill: frames + transcript). Note hook, beats, pacing, on-screen style, CTA. Save `reference/notes.md`.
2. **Script:** ORIGINAL Hinglish script — same idea/angle, new words (never copy lines). Facts about AI tools verified against official docs this week (sources in notes.md). Format: one line = one on-screen beat, `*hero*` words, no TTS tags. 45–60 s explainers; dialogue may run longer. End: `Comment <KEYWORD> + follow → guide DM mein`. ⏸ user approves.
3. **Voiceover:** VoiceStudio PTS Narrator (D) (default, local) / user records / ElevenLabs → `audio.mp3` in the reel folder.
4. **Build:** `kinetic-reel` skill (Pass 01→06) or the matching style skill (effects demo, chat-UI demo, stickman, pixel-art dialogue). 1080×1920, 30 fps, H.264/AAC + `cover.png` (hook inside centre 3:4).
5. **Post pack:** `post.json` = caption, ≤ 5 hashtags, keyword, dm_text, guide_url, first_comment + the lead-magnet guide (`lead-magnet-guide` skill). ⏸ show reel + cover + caption + guide.
6. **Schedule:** `instagram-autopost-dm` skill (upload, posts + dm_rules rows, IG + YT same slot).
7. **Data:** check metrics at 6 h / 24 h; update WHAT-WORKS.md.

## What wins (from real data)
- Line 1 = money/time pain + free/fast promise ("X ka bill dekh ke…", "Editor ko paise dene se pehle…").
- Dialogue/story (creator ↔ AI) > narrated explainer. Pixel-art characters for dialogue.
- Mass topic (creators, students, freelancers) > dev-niche topic.
- 3 steps, plain words, text on screen from frame 1, frame change every ≤ 4 s, last line echoes the hook (loop).
- Premium motion graphics (3D camera, morphing shapes, relevant graphics), every reel looks different from the last.
- Slots: **12:00 and 13:30 IST** (13:30 got ~80% more views than 16:00 at 6 h). Never early morning / evening.

## Caption rules
- First ~125 chars: hook + search words ("Claude Code Hindi", tool names). Never start with greeting/hashtag/emoji.
- 3–4 ✅ value lines → ONE ask (comment keyword + follow) → share line ("🔁 Us dost ko bhejo jo…") → save line ("💾 Save kar lo") → one easy question.
- ≤ 5 specific hashtags on the last line (no #viral #fyp). No links in caption. Emoji ≤ 4 per 100 chars.
- No fake stats, no income guarantees, original/licensed audio only.
