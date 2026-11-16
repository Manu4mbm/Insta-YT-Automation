---
name: anime-reel
description: "An anime-style episode with original characters drawn in code and lip-synced to your voice lines, like the Zero Se Freelance series. Use when the user runs /anime-reel or asks for this edit, with a script and the voice MP3s for each line."
metadata:
  category: Animated videos
---

# /anime-reel

**Input:** a script and the voice MP3s for each line

## What it does
 An anime-style episode with original characters drawn in code and lip-synced to your voice lines, like the Zero Se Freelance series.

## Steps
1. Read the script and split it into shots: who speaks, where it happens, and the camera move.
2. Draw each character in anime style (big eyes, thick clean outlines, flat colours with one shade) and save a character sheet, so they look the same in every shot.
3. Force-align every voice line and open and close each mouth with the loudness of that character's voice. Add blinks and small idle motion.
4. Add anime tricks on key lines: speed lines, impact frames, screen shake and chibi reactions.
5. Add 2–3 word captions with the spoken word in the speaker's colour, and sound effects on the hits. No background music unless I ask.
6. Render 9:16 for reels and a 16:9 copy for YouTube.

## Every time it runs
- Draw everything in code (an HTML canvas rendered frame by frame in headless Chrome, encoded with ffmpeg). No stock footage or image generators, so the look is the same every time.
- Time every word with forced alignment (torchaudio MMS_FA). Never guess timings.
- Show me a contact sheet of stills before the full render, and ask before overwriting files.
- Render the MP4 with the original audio, plus a 720p copy under 20 MB for WhatsApp.

## In this studio (buildwithvijay.ai)
- Prefer the reel-studio engine for rendering: Remotion project per reel + the kinetic-reel timing scripts (MMS_FA forced alignment, chunked for long audio). Plain HTML canvas + ffmpeg is fine when Remotion is overkill.
- Solid colours by default (Vijay dislikes heavy gradients/sci-fi looks unless asked); captions Hinglish, brand handle @buildwithvijay.ai.
- Characters, logos and scenes must be original or Vijay's own. Do not redraw copyrighted characters, film scenes or brand mascots; use only audio Vijay has the rights to.
- Deliver 1080x1920 MP4 (loudnorm -14 LUFS) + cover.jpg; facts about AI tools must be checked against current sources.
