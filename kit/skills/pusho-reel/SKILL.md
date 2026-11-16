---
name: pusho-reel
description: "A Puneet Superstar “Baba Pusho” cartoon reel with the full class: Baba Pusho teaching, his students reacting, Hindi captions on every word, a new scene for every line. Use when the user runs /pusho-reel or asks for this edit, with a Puneet Superstar audio clip (MP3)."
metadata:
  category: Animated videos
---

# /pusho-reel

**Input:** a Puneet Superstar audio clip (MP3)

## What it does
 A Puneet Superstar “Baba Pusho” cartoon reel with the full class: Baba Pusho teaching, his students reacting, Hindi captions on every word, a new scene for every line.

## Steps
1. Transcribe the Hindi in Devanagari with whisper (large-v3), stop and let me fix wrong words, then force-align the corrected text.
2. Use one fixed cast and keep it identical in every episode: Baba Pusho (long white beard, dark cap, saffron shawl) and his students (a footballer in a #7 jersey, a young man in a kurta, an old bearded baba, a Greek marble bust).
3. Plan one scene per line: the classroom with a chalkboard titled “पुशो ज्ञान केंद्र”, temples, a sunset lake, a bridge, a living room. Pusho's mouth moves with the voice, and the students react (laugh, shock, nod).
4. Add a small “पुशो वाणी” badge top-left and pop stickers on key words (RED FLAG, अभागा, 100% STEEL).
5. Captions: Hindi, 3–5 words, spoken word in yellow, on a dark band at the bottom.
6. Render 16:9 and a 9:16 version.

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
