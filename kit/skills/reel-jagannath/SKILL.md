---
name: reel-jagannath
description: "Make a 9:16 Pixar-style 3D AI cartoon short of child Jagannath, Balabhadra and Subhadra living a cute everyday bal-leela moment (school morning, mango chori, rain, festival), optionally with the user's own child as a character, end to end - story ideas, cast pictures (incl. cartoonizing the kid from photos), scene table for approval, Gemini/Veo prompts, captions, devotional music bed, render. Use when the user says /reel-jagannath, or asks for a Jagannath / Jagannath Prabhu / bal-leela / child-god cartoon reel, a video 'like the Jagannath video', or wants their kid in such a reel."
---

# Jagannath bal-leela reel

**Look:** Pixar/Disney-style 3D chibi child deities (Jagannath black with big red-rimmed eyes; Balabhadra white;
Subhadra golden) in a warm Odisha village, golden light; 3–5 shots of 5–8 s, hard cuts; Veo's own giggles and short
lines; Roman-caps captions; soft flute-and-mridanga bed; comment-question end card. Optionally the user's child is
their friend. **Best for:** kids' devotional shorts (India by Bharat or a kids' channel).

Before writing anything, read `C:/Users/Admin/Reels/jagannath-reels/STYLE.md` (cast, recipe, respect rules, sound,
commands). The sample is `C:/Users/Admin/Reels/jagannath-reels/template/reel.json` (4 shots, "Aam chori mission").
Follow `/hyperframes` for any edit. The user makes frames and shots in Gemini + Veo (see memory on reel-minihand), so
the default route is `jl.py prompts`; use the HeyGen route (`jl.py cast/frames/shots`) only if they're signed in
with HyperFrames Pro and say so, and **never send the child's photos anywhere without their explicit OK**.

## Steps
1. **Story.** If no story was given, offer 6–8 bal-leela ideas (one line each: setup → mischief → twist → sharing).
2. **Ask once** (AskUserQuestion): include their child? (which child, and their first name), channel / follow line,
   caption language (Hinglish Roman caps or English), 3, 4 or 5 shots.
3. **Scene table for approval:** per shot the beat, cast, frame, motion, speech, caption, plus the hook and end question.
   Check it against the respect rules. Wait for approval.
4. **Reel folder:** `bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh jagannath-reels <slug>`, write `reel.json`.
   If an earlier reel has cast pictures, copy its `assets/cast/*.png` and `cast` block (the cast is reused across
   reels; only the kid's card changes per child). Run `python ../../tools/jl.py prompts`, open PROMPTS.md for the user.
5. **Cast (first reel only):** the user makes the cast pictures from PROMPTS.md step 1 and saves them into
   `assets/cast/` (the kid's photos go to `assets/cast/photos/` only if they use our HeyGen route). Run `castsheet`, read
   `_cast.png`: the deities match the iconography, and the kid looks like the kid and in the same style. Then **write the
   kid's `card` from the cartoon** (replace the FILL IN text) and re-run `prompts`.
6. **Frames:** the user makes them (attaching the cast pictures listed per scene) and saves `assets/frames/<id>.png`.
   `sheet` → read `_sheet.png`; name any frame to remake (STYLE.md faults). OK the frames before shots.
7. **Shots:** the user makes image-to-video shots → `assets/shots/<id>.mp4`. Check each with a strip
   (`ffmpeg -i s1.mp4 -vf fps=1,scale=180:-1,tile=8x1 -frames:v 1 strip.png`) and transcribe its audio; set `trim`,
   `focus` (or `"aspect": "16:9"` if they came out wide), `line.at`; mute stray made-up English speech.
   Meanwhile make the music bed (STYLE.md) and loop it past the reel length.
8. **Build and check:** `jl.py build` → `~/.cache/hyperframes/hf check` (0 errors) → `hf snapshot` at the hook, each
   caption and the end card; read the sheet.
9. **Preview** in the browser pane (a `launch.json` entry running `hf preview --no-open --foreground --port 3015 <reel>`
   through `C:/Program Files/Git/bin/bash.exe -c`) and show the user.
10. **Render** after approval: `bash ../../../_shared/tools/finish.sh <slug>`; `hf audio renders/<slug>.mp4 --json`
    (say it was measured, not heard). Write `POST.md`: title, 1-line story, comment question, 6–8 hashtags
    (#JaiJagannath #BalLeela #KidsCartoon ...), and a note to switch on the platform's AI-content label.
