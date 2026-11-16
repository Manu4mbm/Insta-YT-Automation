---
name: reel-collage
description: "Make a 9:16 narrated explainer reel in the vintage photo-collage style (a calm narrator tells a curious story while cut-out old photos and paintings float, rise and open on a dusty teal paper sky above a clover field, with red typewriter captions and torn-paper transitions) for the user's channels, end to end - topic ideas, research, script and scene table for approval, picture sourcing and cut-outs, voice, scenes, music, render. Use when the user says /reel-collage, or asks for a narration/explainer reel 'like the Insta collage one', vintage collage, photo collage, paper cut-out, surreal collage, or 'what if' mystery story reel."
---

# Collage narration reel

**Look:** dusty teal paper sky with grain, cut-out vintage photos (B&W people, golden hero objects like a moon or
mask), a band of clover with white flowers, drifting clover leaves, slow pushes, surreal beats (a giant moon, a head
that opens to the stars, a framed night sky, a beam), red typewriter captions at the top, torn-paper reveals,
parchment title and comment cards.
**Best for:** mysteries, ancient history, "what if" theories, science and astronomy facts, origin stories, culture.

Before writing anything, read `C:/Users/Admin/Reels/collage-reels/STYLE.md`: it has the look, the script shape,
picture sourcing and cutting, the `Collage` API and the rules. Follow the `/hyperframes` contract for any edit.
The sample to copy from is `C:/Users/Admin/Reels/collage-reels/reels/jantar-mantar` (6 scenes, 26 s).

## Steps

1. **Topic.** If none was given, offer 8 to 10 ideas that suit the look: title, one-line hook, and the surreal image
   it gives. Research the chosen one with web search and write `SOURCES.md`. Mark legends and theories as such.
2. **Ask once** (AskUserQuestion): language (English, Hindi or Hinglish), voice (narrator D, the MKD clone,
   ElevenLabs, or the user's own recording) and channel (India by Bharat or Protech Synergy, for the follow line).
3. **Script and scene table, for approval.** 6 to 9 lines, 30 to 45 s, in the STYLE.md shape
   (hook → setup → fact with a precise number → "So what if…" → twist → comment question). For each line show:
   the words (with English meaning if not English), the picture (which cut-outs, where they come from), the surreal
   beat, the motion, and the outro keyword. Wait for approval.
4. **Pictures.** Ask before downloading. Search Wikimedia Commons through its API (check the licence), or use the
   user's images or generated ones. Save into `reels/<slug>/_raw/`. Cut with
   `~/.cache/hyperframes/musicgen-venv/Scripts/python.exe -I C:/Users/Admin/Reels/_shared/tools/cut.py <mode> …`
   (`matte` people, `key` objects on plain backgrounds, `print` for scenes). Check every cut on teal before use.
5. **Build.**
   - `bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh collage-reels <slug>`, then work inside that folder.
   - Write `reel.json` (same shape as the sample). Record the voice in the background: `vo.py` (VoiceStudio:
     check `curl -s localhost:3900/health` first; ~3 to 5 min a line on CPU) or `el_vo.py` (ElevenLabs; the free
     plan refuses library voices, so check the plan first).
   - Make the music bed meanwhile: musicgen venv `music.py assets/bgm/bed.wav "slow mysterious ambient documentary score, soft piano, warm strings pad, gentle music box, no drums"`.
   - Write `compositions/s1..sN.html` from the scene table with `Collage` helpers, and the hosts in `index.html`
     (one per line, `data-lines`). While the voice records, test in a scratch copy with stand-in tone clips.
   - When the voice is done: check the words (VoiceStudio `/v1/audio/transcriptions`, or `heard.py`), then
     `python ../../../_shared/tools/place.py && python ../../../_shared/tools/overlap.py`.
   - Retime each scene's beats to `timing.json`. Run `~/.cache/hyperframes/hf check` and
     `hf snapshot --at <a time in every scene and on every tear>`; read the contact sheet and fix.
6. **Preview** in the browser pane (a `launch.json` entry running `hf preview --no-open --foreground --port 3012 <reel>`
   through `C:/Program Files/Git/bin/bash.exe -c`) and show the user.
7. **Render** after approval: `bash ../../../_shared/tools/finish.sh <slug>` (−14 LUFS). Write `POST.md`: hook
   caption, the story in 2 to 3 lines, sources and image credits, the comment question, 6 to 8 hashtags.

## Keep it true to the look
- Every shot moves (camera push plus at least one subject motion plus leaves).
- People are black-and-white cut-outs; only one or two warm or golden hero objects per scene.
- One surreal idea per line; it should show the sentence, not decorate it.
- Captions stay at the top in typewriter caps (Mukta for Devanagari); keep subjects below y 330.
- Scene 1 is the thumbnail: full picture at frame 0, plate label ("PLATE I" / place, year), no tear.
- Never claim speculation as fact; Indian faiths and figures are shown with respect.
