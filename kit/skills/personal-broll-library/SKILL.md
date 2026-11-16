---
name: personal-broll-library
description: "Search my own B-roll folder in plain English (\"me walking at night\") and return the best matching clips. Use when the user runs /personal-broll-library or asks for this edit, with a folder of my B-roll clips."
metadata:
  category: Reel formats
---

# /personal-broll-library

**Input:** a folder of my B-roll clips

## What it does
 Search my own B-roll folder in plain English ("me walking at night") and return the best matching clips.

## Steps
1. Go through every clip in the folder and sample frames.
2. Write a short description of each clip (place, action, mood, time of day) into an index file.
3. When I ask for a scene in plain English, return the 3 best matching clips with timestamps.
4. Keep the index updated when I add new clips.

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
