---
name: reel-retro
description: "Make a nostalgic 70s-90s India slice-of-life reel in a hand-painted anime look (a calm 'day in 1987' of one family: chai on the kerosene stove, Sunday TV with the whole mohalla, power cuts, kites on the terrace, sleeping under the stars), with Gemini keyframes + Veo clips cut together in HyperFrames with crossfades, year hook, part cards, film grain, a nostalgic music bed and an end card. Use when the user says /reel-retro, or asks for a retro / nostalgia / purana zamana / 80s or 90s India / 'day in the life' anime reel, or a video 'like the Jhibli-style Indian 90s video'."
---

# Retro India slice-of-life reel

**Look:** hand-painted 2D anime (soft ink lines, watercolour backgrounds, warm muted light), 16–22 calm scenes of
~2.6 s on 0.35 s crossfades, each clip's own ambient sound, a soft sitar/bansuri bed, a year hook ("1987 | एक रविवार"),
typewriter part cards, 3–4 quiet captions, warm film grain, and a memory-question end card. **Best for:** India by Bharat.

Before writing anything, read `C:/Users/Admin/Reels/retro-reels/STYLE.md` (pipeline, story shape, era lock, checks,
sound, commands). The sample is `C:/Users/Admin/Reels/retro-reels/template/reel.json` (18 scenes, "1987: Ek Ravivaar").
Follow `/hyperframes` for any edit. The user makes pictures and clips in Gemini + Veo, so `rt.py prompts` is the route;
there is no HeyGen route here.

## Steps
1. **Idea.** If no topic was given, offer 6–8 ideas (year + town + one family + the "everyone remembers" beat).
2. **Ask once** (AskUserQuestion): the decade/year and town, 9:16 short (40–60 s) or 16:9 long (2–3 min), whether to reuse
   an earlier reel's cast, and the caption language (Hindi Devanagari default).
3. **Scene table for approval:** the parts with their cards and outfits, then per scene: kind, cast, beat, frame, motion,
   sound, still or not, caption. Check it against the era lock (STYLE.md): nothing from after the year, no real show,
   song or brand. Wait for approval.
4. **Reel folder:** `bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh retro-reels <slug>`, write `reel.json`
   (reuse `cast` + `assets/cast/*.png` from an earlier reel when the user wants the same family). Run
   `python ../../tools/rt.py prompts` and open PROMPTS.md for the user. Tell them: one Gemini chat for all frames, set
   9:16 in Veo, and still scenes need no clip.
5. **Cast:** once the cast pictures are in, run `castsheet` and read `_cast.png` (Indian features, same painting style,
   no modern items). Adjust the cards if the pictures show something different, then re-run `prompts`.
6. **Frames:** run `sheet` and read `_sheet.png` row by row. Name each frame to remake (an era fault, text/logo, a face
   mismatch, fingers, cut off). Then **build from frames alone** (stills fill in) and show a preview, so the user sees the
   rhythm before spending on Veo.
7. **Shots:** as clips arrive, run `clips` and read `_clips.png`; transcribe each shot's audio (VoiceStudio
   `/v1/audio/transcriptions` or faster-whisper on decoded samples) and mute stray speech or music. Set `trim` to the
   calmest 2–3 s, and `focus` if a clip came out 16:9. Make the music bed meanwhile (STYLE.md).
8. **Build and check:** `rt.py build` → `~/.cache/hyperframes/hf check` (0 errors) → `hf snapshot` at the hook, each
   part card, each caption and the end card; read them.
9. **Preview** in the browser pane (a `launch.json` entry running `hf preview --no-open --foreground --port 3016 <reel>`
   through `C:/Program Files/Git/bin/bash.exe -c`) and show the user.
10. **Render** after approval: `bash ../../../_shared/tools/finish.sh <slug>`; `hf audio renders/<slug>.mp4 --json`
    (say it was measured, not heard). Write `POST.md`: title, the hook line, the comment question, 6–8 hashtags
    (#80sKids #90sKids #PuraneDin #Nostalgia #IndianNostalgia #IndiaByBharat ...), and a note to switch on the
    platform's AI-content label.
