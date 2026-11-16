---
name: youtube-clips
description: "Find the best moments in a long YouTube video and turn each into a vertical clip. Use when the user runs /youtube-clips or asks for this edit, with a long 16:9 video or a YouTube link."
metadata:
  category: Reel formats
---

# /youtube-clips

**Input:** a long 16:9 video or a YouTube link

## What it does
 Find the best moments in a long YouTube video and turn each into a vertical clip.

## Steps
1. Transcribe the full video and score every moment for hook strength, a complete thought, and energy.
2. Pick the top 5 moments, each 30–60 seconds, starting on a strong first line.
3. Reframe each to 9:16 by following the speaker's face.
4. Add captions and a title card for each clip.

## Every time it runs
- Transcribe my audio with word-level timings, so every graphic lands on the word I say.
- Keep text out of the top 250 px and the bottom 420 px (Instagram buttons and caption).
- Render a 1080×1920 MP4 at 30 fps with my original audio. Never re-grade or filter my face unless the skill says so.
- Show me 3 snapshots before the final render, and ask before overwriting files.

## In this studio (buildwithvijay.ai)
- Prefer the reel-studio engine for rendering: Remotion project per reel + the kinetic-reel timing scripts (MMS_FA forced alignment, chunked for long audio). Plain HTML canvas + ffmpeg is fine when Remotion is overkill.
- Solid colours by default (Vijay dislikes heavy gradients/sci-fi looks unless asked); captions Hinglish, brand handle @buildwithvijay.ai.
- Characters, logos and scenes must be original or Vijay's own. Do not redraw copyrighted characters, film scenes or brand mascots; use only audio Vijay has the rights to.
- Deliver 1080x1920 MP4 (loudnorm -14 LUFS) + cover.jpg; facts about AI tools must be checked against current sources.
