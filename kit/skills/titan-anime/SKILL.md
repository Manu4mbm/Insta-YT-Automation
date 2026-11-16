---
name: titan-anime
description: "An anime episode set in an Attack on Titan-style world: giant walls, green capes, horses, flags and titans, with your own original characters telling the story. Use when the user runs /titan-anime or asks for this edit, with a script and the voice MP3s for each line."
metadata:
  category: Animated videos
---

# /titan-anime

**Input:** a script and the voice MP3s for each line

## What it does
 An anime episode set in an Attack on Titan-style world: giant walls, green capes, horses, flags and titans, with your own original characters telling the story.

## Steps
1. Read the script and plan shots in a walled-city world: wall tops at sunset, a gate, a training ground, a castle in the clouds, titans peeking over the wall.
2. Design original characters (never copy real anime characters): anime faces, green capes with a wing emblem, brown harness straps. Save a character sheet so they look the same in every shot.
3. Use the world as metaphors for the lesson: the wall is the limit you break, the gate opens when you succeed, the Survey Corps flag is your mission.
4. Lip-sync every voice line, add speed lines, impact frames and shake on the big moments, and a horse ride for the “mission” beat.
5. Captions: 2–3 words with the spoken word in the speaker's colour, plus a small episode badge (ZERO SE FREELANCE · EP 3).
6. Render 9:16 for reels and a 16:9 copy.

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
