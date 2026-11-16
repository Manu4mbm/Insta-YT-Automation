---
name: song-lyric-sync
description: Sync song lyrics word-by-word to the music and animate them as kinetic typography in a video (Hindi, Hinglish, Gujarati, Punjabi or English). Use when the user gives a song MP3 + a lyrics text file and wants the words to appear exactly when they are sung — kinetic lyrics, lyric reel, karaoke-style words, "words gaane se sync karo".
---

# Song lyric sync → kinetic lyrics video

**Input:** `song.mp3` + `lyrics.txt` (one sung line per row, exactly as sung; repeat the chorus every time it is sung). Optional: photos/video clips to put behind the words, style reference.
**Output:** `out/lyrics.mp4` (1080×1920, 30 fps, H.264/AAC, original song audio) + `out/lyrics-720.mp4` (< 20 MB) + `timing/words.json`.

## Steps (stop and show after 3 and 5)
1. **Folder:** `videos/<slug>/` with `song.mp3`, `lyrics.txt`. Check tools: ffmpeg, python, torch, torchaudio, faster-whisper, uroman, demucs, librosa, node. Install what's missing (`pip install demucs librosa`).
2. **Vocals only:** `python -m demucs --two-stems=vocals -n htdemucs -o .work song.mp3` → `.work/htdemucs/song/vocals.wav`. Alignment on the full mix drifts; on vocals it is tight.
3. **Forced alignment (never guess):**
   - Copy `lyrics.txt` → `script.txt` (one line = one on-screen beat; mark 1–2 hero words per line with `*word*`).
   - Convert vocals to `audio.mp3` in the same folder: `ffmpeg -i .work/htdemucs/song/vocals.wav -ac 1 audio.mp3`.
   - Run the kinetic-reel aligner: `python .agents/skills/kinetic-reel/scripts/timing.py videos/<slug> hi` (run from the project root) (`hi` for Hindi/Hinglish/Gujarati/Punjabi, `en` for English). It romanises non-Latin words internally (uroman) but keeps the original script on screen, aligns with torchaudio MMS_FA and cross-checks with whisper.
   - Read `timing/report.md`: low-confidence lines, gaps. Song-specific fixes:
     - **Held notes / long vowels:** word `end` = next word `start` − 0.05 s (keep it on screen while it is sung).
     - **Alaap / humming / music-only parts:** no words — leave them out of `script.txt`; fill with visuals.
     - **Echo / backing vocals:** only the lead line goes in `script.txt`.
     - **Whole song early/late:** apply one global offset (± ms) instead of re-aligning.
     - Long song (> 90 s): align in 30–60 s chunks (split at silences).
   - Render a **plain karaoke check** (white words on black, current word highlighted) with the engine's `Karaoke` composition and send it. User watches on phone with sound → fixes only the lines they name → "approved" locks timing.
4. **Beats:** `librosa.beat.beat_track` on the full mix → `timing/beats.json` (beat times + BPM). Strong beats = downbeats (every 4th).
5. **Design (Remotion, engine/ template):** copy `engine/` → `reel/`, put `song.mp3` in `reel/public/`, `words.json`/`lines.json`/`beats.json` in `reel/src/`.
   - Each line builds **word by word at its sung time**: pop in (spring, 6–8 frames), small squash on strong beats, hero word 2–3× bigger / accent colour.
   - Clear the line with a quick wipe/slide just before the next line starts.
   - Fonts: one heavy display font for Latin (Anton / Archivo Black), Noto Serif Devanagari / Gujarati for Indic text (`@fontsource/*` + `delayRender`). ≤ 6 words on screen at once, inside the safe area (top 250 px, bottom 420 px, right 230 px free).
   - Accents tied to meaning (rain on "baarish", petals on "pyaar", flame on "aag") — drawn in SVG/CSS, never stock images.
   - Background: solid / paper / dark by default; if photos or clips are given, put them behind with a slow push and a dark gradient for readability; cut-outs (mediapipe selfie_segmenter) let words go behind the person.
   - Beat punch: 2–4 % scale or light flash on strong beats only.
   - Render a **pilot (first chorus, ~10 s) + 6 stills** → show → wait for approval.
6. **Full render:** `npx remotion render src/index.ts Reel ../out/lyrics.mp4 --concurrency=<cores> --crf=18`, then a 720p copy under 20 MB for WhatsApp. Contact sheet every 2 s: words early/late, clipping, overlaps, unreadable lines.

## Rules
- Timing only from forced alignment + the user's karaoke check. Never shift words by eye.
- Words on screen exactly as in the user's `lyrics.txt` (spelling, script). Do not translate unless asked.
- Original song audio, untouched (no re-encode below AAC 256k).
- `random(seed)` only, no `Math.random()` — renders must be identical every time.
- Use songs and lyrics the user owns or has permission to use.
