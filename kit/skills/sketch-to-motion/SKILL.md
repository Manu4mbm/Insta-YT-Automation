---
name: sketch-to-motion
description: "Your rough paper sketches turned into a polished app-promo animation: the sketch stays on the left, the finished motion graphic plays next to it, like the Kulhad chai reel. Use when the user runs /sketch-to-motion or asks for this edit, with 8–10 photos of your sketches, plus your product photos and stock clips."
metadata:
  category: Animated videos
---

# /sketch-to-motion

**Input:** 8–10 photos of your sketches, plus your product photos and stock clips

## What it does
 Your rough paper sketches turned into a polished app-promo animation: the sketch stays on the left, the finished motion graphic plays next to it, like the Kulhad chai reel.

## Steps
1. Read each sketch: the boxes, arrows and notes like “tap!”, “zoom in + type”, “flip up”, “burst!”. Each sketch is one scene.
2. Layout: a static paper card labelled “Drawing” with the sketch, and a bigger card labelled with the Claude logo + “Opus 5.5” where the finished scene plays. Nothing spills outside the card.
3. Build each scene from real assets: real app icons, product cutouts with transparent backgrounds, stock video (rain, steam, pouring), and mood photos.
4. Do exactly what the notes say: tap with a finger and zoom, type into a search bar, flip a result screen up, scroll a photo grid, burst a word into particles.
5. Cut on the beat of the song (about every 0.55 s), and end on a logo card.
6. Render 9:16 for reels and a 16:9 version.

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
