---
name: talking-head-edit
description: "Your raw clip, fully edited: captions on every word, the screen splits into two windows to show what you're talking about, and demo videos play full screen. Your face is never re-coloured. Use when the user runs /talking-head-edit or asks for this edit, with a 9:16 talking-head clip."
metadata:
  category: Animated videos
---

# /talking-head-edit

**Input:** a 9:16 talking-head clip

## What it does
 Your raw clip, fully edited: captions on every word, the screen splits into two windows to show what you're talking about, and demo videos play full screen. Your face is never re-coloured.

## Steps
1. If it's iPhone HDR footage, convert it with Apple's avconvert. Never use an ffmpeg colour filter, and never change brightness or grade my face.
2. Start on my full face. When I name a thing, move me into the bottom window and show it in the top window (image, GIF, website scroll, PDF pages), with 20 px rounded corners and no gap at the bottom.
3. When I say “main dikhata hoon” or “dekho”, pause my clip, play the demo video full screen, then carry on.
4. Use 2–3 word captions with the spoken word in light blue, in my palette: deep green #1f3a2c and light blue #a8ecfc.
5. End with a comment-keyword CTA: a comment box typing the word, then a DM bubble.

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
