---
name: lyric-video
description: "A hand-drawn crayon lyric video on a dark chalkboard: every word writes on as it's sung, and each line gets its own little drawing. Use when the user runs /lyric-video or asks for this edit, with a song MP3 and its lyrics, one sung line per row."
metadata:
  category: Animated videos
---

# /lyric-video

**Input:** a song MP3 and its lyrics, one sung line per row

## What it does
 A hand-drawn crayon lyric video on a dark chalkboard: every word writes on as it's sung, and each line gets its own little drawing.

## Steps
1. Separate the vocals with demucs, force-align the lyrics to them, and find the beats with librosa.
2. Write each word on letter by letter at its exact sung time, in mixed playful fonts and a pastel crayon palette on a dark navy board.
3. Mask every stroke with a crayon grain texture and re-jitter it 8 times a second, so it looks hand-drawn.
4. Draw one simple doodle per line, stroke by stroke: a moon, a globe, a lightning bolt, a heart tunnel.
5. Pop and shake on the beats, and clear the board just before the next line starts.
6. Render 16:9 with the song as AAC 256k.

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
