---
name: educational-youtube-editor
description: "Turn a long lesson recording into a clean, chaptered YouTube edit. Use when the user runs /educational-youtube-editor or asks for this edit, with a long 16:9 lesson recording."
metadata:
  category: Reel formats
---

# /educational-youtube-editor

**Input:** a long 16:9 lesson recording

## What it does
 Turn a long lesson recording into a clean, chaptered YouTube edit.

## Steps
1. Remove mistakes, retakes and long pauses.
2. Add chapter cards where the topic changes, and chapter timestamps for the description.
3. Add on-screen text for key terms and simple diagrams where I explain a concept.
4. Render 1920×1080 instead of 9:16.

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
