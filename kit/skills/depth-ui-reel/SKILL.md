---
name: depth-ui-reel
description: "Floating app interfaces that sit behind my head, with my body cut out in front of them. Use when the user runs /depth-ui-reel or asks for this edit, with a 9:16 talking-head clip."
metadata:
  category: Reel formats
---

# /depth-ui-reel

**Input:** a 9:16 talking-head clip

## What it does
 Floating app interfaces that sit behind my head, with my body cut out in front of them.

## Steps
1. Cut me out of the background on every frame (person segmentation).
2. Draw clean UI cards (chat bubbles, stats, browser windows) between the background and me.
3. Animate the cards in on the words they relate to.
4. Composite me back on top so the UI looks like it's behind my head.

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
