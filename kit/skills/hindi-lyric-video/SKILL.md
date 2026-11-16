---
name: hindi-lyric-video
description: "A calm Hindi lyric video like Banjaare's “Barsaat”: Devanagari lines write on over old paper while rain falls and footprints walk across the page with the song. Use when the user runs /hindi-lyric-video or asks for this edit, with a Hindi song MP3 and its lyrics in Devanagari, one line per row."
metadata:
  category: Animated videos
---

# /hindi-lyric-video

**Input:** a Hindi song MP3 and its lyrics in Devanagari, one line per row

## What it does
 A calm Hindi lyric video like Banjaare's “Barsaat”: Devanagari lines write on over old paper while rain falls and footprints walk across the page with the song.

## Steps
1. Separate the vocals with demucs and force-align the Devanagari lyrics to them (romanise each word for the aligner, keep Devanagari on screen).
2. Background: aged paper texture with soft vignette and light rain streaks that never stop.
3. Write each line on letter by letter at its sung time in a clean Devanagari font, in ink, slightly offset from the line before, like handwriting on a diary page.
4. Footprints walk across the page in time with the beat, and every new verse moves the camera slowly along the path.
5. Add small story moments on key words (an umbrella, a train, a lamp), drawn in the same ink style.
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
