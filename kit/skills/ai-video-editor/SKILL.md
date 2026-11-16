---
name: ai-video-editor
description: Professional AI video editor playbook. Use for ANY video/reel request — reel from a voiceover or one-line topic, client ad, explainer, animated character, lyric video, effects on a talking-head clip, photo edit, cover, or "which skill should I use". Routes to the right skill and enforces the timing, design, self-check and licensing rules learned so far.
---

# AI video editor (master playbook)

Vertical 1080×1920, 30 fps, H.264 + AAC, Remotion (React) + ffmpeg. Hinglish replies. Execution-first: build, self-check, deliver; stop only at the approval gates below.

## 1. Pick the route
| Request | Use |
|---|---|
| VO + script → motion-graphic / kinetic reel, client ad | `kinetic-reel` (6 passes) + `remotion-cinematic` for 3D/glass looks |
| Bold "made without After Effects" motion graphic | `bold-kinetic-motion` |
| SaaS / app / product launch video | `saas-product-video` |
| One line "reel banao: <topic>" → full reel with research, voice, mascot/sprite avatar | `animo-reels` (animo kit in `video-studio/animo-kit`) |
| Avatar narrator + app window explainer (the best-performing format) | template `video-studio/templates/avatar-explainer` |
| Reference reel to copy structure from | `reel-content-workflow` (+ `ig-viral` for competitor research) |
| Effects on a talking-head clip | `effects` (42 effects, face tracking, cut-outs) |
| Song + lyrics, words synced | `song-lyric-sync`; looks: `kinetic-lyrics`, `hindi-lyric-video`, `lyric-video`, `sketch-music-video`, `stickman-lyric-reel` |
| Story / cartoon / explainer styles | `anime-reel`, `titan-anime`, `madhubani-kahani`, `katha-video`, `latent-reel`, `pusho-reel`, `news-report`, `podcast-explainer`, `personal-explainer`, `blueprint-explainer`, `comic-reel`, `watercolor-map`, `sketch-to-motion` |
| Talking-head edit styles / looks | `talking-head-edit`, `kinetic-talking-head-edit`, `podcast-reel-edit`, `iphone-style-widgets`, `depth-ui-reel`, `cinema-scope`, `neon-outline`, `magazine-cover`, `rgb-glitch-live`, `breaking-news`, `comic-halftone`, `hindi-pastel-reel-edit`, `red-kinetic-collage-edit`, `dark-red-timeline-motion-graphics`, `instagram-ui-hinglish` |
| Single motion pieces | `glass-stat-card`, `particle-text`, `particle-chart`, `led-matrix-text`, `match-cut`, `shutter-stack`, `price-tag-zoom`, `ranking-format`, `triptych-timecode` |
| Business / personal / long-form | `business-short-form-reels`, `personal-short-form-reels`, `personal-broll-library`, `educational-youtube-editor`, `youtube-clips` |
| Stick figures | `stick-motion` |
| Caption, hooks, post plan, analytics | `ig-reel`, `ig-caption`, `ig-plan`, `ig-audit`, `ig-viral`, `viral-instagram-reels`, other `ig-*` |
| Lead magnet + auto-posting + DM funnel | `lead-magnet-guide`, `instagram-autopost-dm` |
| YouTube SEO / channel work | `youtube` |
Remotion API questions → `remotion-best-practices` / `remotion-markup`.

## 2. Pipeline (every reel)
1. **Brief:** goal, audience, CTA keyword, brand (logo, colours, contact). Facts researched from sources opened this week; every number has a URL. Claims a client cannot legally make (e.g. "100% guaranteed visa", income guarantees, fake stats) are rewritten honestly and the reason is said once.
2. **Script ⏸ approval:** hook ≤ 3 s (~7 words, result / mistake / question / money-pain; never "hi guys"), one idea, 3 steps, twist, comment-keyword CTA. 35–55 s ≈ 2.5 words/s. Format: one line = one beat, `*hero*` words. Strip TTS tags ([thoughtful]…) before alignment.
3. **Voice:** VoiceStudio (default — saved voice PTS Narrator (D), local API http://localhost:3900, see `voicestudio` skill), ElevenLabs/OpenAI, the user's own recording, or a free local clone of the user's OWN voice only (VoxCPM2 — good English words; Chatterbox-Multilingual-hi — clearest Hindi; 10–20 s quiet sample + exact transcript; generate 2–3 sentences per chunk, seed per chunk, join with ~0.06 s gaps).
4. **Timing (never guess):** script decides WHAT, audio decides WHEN. Forced alignment (torchaudio MMS_FA, romanised Hindi) + faster-whisper word timestamps cross-check; for gaps: anchors on both sides → remove silences → spread words by length. Report < 70 % matched = text ≠ speech, fix the text, never the words to match Whisper. Numbers: give the aligner the spoken form. Music under vocals → demucs first.
5. **Direction:** meaning map per line → 8–12 scenes, energy curve, ONE throughline object (passport, file, card) that transforms; new scene every 4–8 s, something moves every ~2 s, no static frame > 3 s; every element pops on the word it illustrates.
6. **Build:** brand tokens in one theme file (never hard-code colours in scenes); fonts local via `@fontsource` + `delayRender` (Google-font fetches fail behind proxies); `random(seed)` only; draw props as SVG/CSS (generic passport/documents — no real national emblems or real people's documents); photos only free-licensed (Unsplash/Pexels download from their CDN, crop to 1188×2112 for drift room, avoid upscaling > 1.2×); logos only from the client.
7. **Safe zones:** keep text/faces inside x 60–960, y 220–1540 (top ~220, bottom ~380, right ~120 covered by Instagram UI). Captions: 2–5 words, spoken = solid, upcoming = dim, active word accent, sit just above the bottom zone; content above them.
8. **Audio:** VO 0.9–0.95, SFX −10…−16 dB on every visual event (whoosh on cuts, impact on stamps, pop on chips/ticks, clicks on typing), music bed ducked under VO (−15…−17 dB, −7 dB more while speaking), low-pass the bed during the "problem" part and open it on the brand reveal; loudnorm −14 LUFS, TP −1. Music/SFX only with a free/commercial licence (Mixkit Free License) — note the credit.
9. **Self-check ⏸ before showing:** stills every 2 s (0.5 s for QA) → contact sheet → look for overlaps, text crossing edges or caption zone, empty stretches, tiny/low-contrast text, wrong-time words. (animo kit: `npm run check -- <id>` also measures every element and fails on overflow / safe-zone / overlap.) Fix → re-check. Say honestly what was and wasn't checked.
10. **Deliver:** `out/<slug>.mp4` (crf 18 master; crf 22 copy < 30 MB for phone/desktop/IG upload), `cover.png/jpg` (hook text inside centre 3:4), post caption + ≤ 5 hashtags, sources.

## 3. Environment notes
- Remotion render: if Chromium isn't found, pass `--browser-executable=<path to chrome/chromium>`; keep `--concurrency` ≤ CPU cores or the render aborts.
- New projects can symlink an existing Remotion project's `node_modules` to save install time.
- Stills/contact sheet: render with `renderStill` at scale 0.35–0.5, tile with PIL.

## 4. Avatars & characters
- Code-drawn SVG mascot: big head, big eyes, one signature detail; props `expression`, `open` (mouth from per-frame loudness), `blink` every 3–4 s, idle bob. Lock the design once approved; reuse across reels.
- Sprite sheet (animo kit): 5×4 = 20 poses on pure #00FF00, head fixed per cell, mouth closed, white sticker outline; pose cues `{at, pose}` every 2–4 s.
- Pixel-art dialogue characters for creator ↔ AI reels (these performed best).

## 5. Never
Copyrighted lyrics/characters/logos in output, someone else's voice without permission, fake results or guarantees in ads, rendering the final without a self-check, secrets in files or chat.
