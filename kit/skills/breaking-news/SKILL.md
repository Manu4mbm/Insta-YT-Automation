---
name: breaking-news
description: "A TV-news lower third, a scrolling ticker and a channel bug. Use when the user runs /breaking-news or asks for this edit, with a 9:16 talking-head clip."
metadata:
  category: Looks
---

# /breaking-news

**Input:** a 9:16 talking-head clip

## What it does
 A TV-news lower third, a scrolling ticker and a channel bug.

## Steps
1. Add a red BREAKING lower third with my name and the topic.
2. Run a news ticker along the bottom with short headlines.
3. Put a channel logo bug in the top corner.
4. Open with a short breaking-news sting.

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
