---
name: reel-collage-long
description: Make a long (2 to 5 minute) 9:16 narrated video in the vintage photo-collage style (teal paper sky, cut-out old photos, clover band, red typewriter captions, torn-paper cuts) told in chapters with PLATE cards, ticket stubs, rubber stamps and cut-paper numbers, end to end - research, chaptered script for approval, Commons pictures, voice, music bed from several sections, 30 to 45 scenes from a generator, checks, preview, render. Use when the user says /reel-collage-long, or asks for a 3-minute / long / documentary-length collage video (history of a rivalry, an era, a person's life, a timeline topic).
---

# Long collage video (2 to 5 minutes)

The same look as `/reel-collage` (read `C:/Users/Admin/Reels/collage-reels/STYLE.md` first), stretched to a
chaptered story. The pilot is `C:/Users/Admin/Reels/collage-reels/reels/ind-pak-rivalry` (India vs Pakistan cricket,
Hinglish, narrator D, 42 lines, about 3 min 10 s). Copy from it.

## What changes from the short format
- **Chapters.** 6 to 9 chapters of 3 to 7 lines. The first scene of each chapter carries a plate label
  (`PLATE II` / place, year) under the captions. Scene 1 is still the thumbnail (no tear, everything on screen).
- **Length maths.** Narrator D speaks Hindi/Hinglish at about **0.064 s per character of `say` text**, plus a 0.45 s
  gap per line. 3 minutes needs about 2,600 characters, which is about 40 lines. Count before asking for approval;
  a short script cannot be stretched later without re-recording.
- **One scene per line**, 3 to 8 s each, each with its own beat on a spoken word. Reuse cut-outs across scenes,
  but vary the stage: night / dusk / sky tones, dunes, road, hills, frames, island.
- **Props for facts** (`assets/collage/long.js`, also in `template/`): `ticket` (venue, date), `stamp` + `slam`
  (results: "BY 61", "8–0"), `ransom` + `popLetters` (big numbers: 309, 82*), `card`, `stick` (stumps that fall),
  `seesaw` (momentum swings), `island` (neutral venue), `ghostCup` + `pedestal` (a missing trophy), `split`
  (a photo torn in two), `pitch`, `dunes`, `petals`, `glow`. Keep any reading text at 32 px or more.
- **Music.** MusicGen makes 30 s, so make 4 to 6 sections with related prompts (mysterious, nostalgic, tense,
  hopeful, reflective; all "no drums") and join them with `acrossfade=d=4` into `assets/bgm/bed.wav`. Set
  `sfx_volume` to about 0.25 in reel.json: there is a whoosh on every cut.

## Steps
1. **Topic and research.** Web search; write `SOURCES.md` with every fact and number (head-to-head counts change:
   date them). Mark legends as legends. For politics or conflict, state what happened, blame no side.
2. **Ask once:** language, voice, format/channel (as in `/reel-collage`).
3. **Script and scene table** in `SCRIPT.md`: chapters, each line (with meaning), picture, surreal beat, prop.
   Show the estimated length. Wait for approval.
4. **Scaffold:** `bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh collage-reels <slug>`; copy `index.html`
   and `compositions/captions.tpl.html` from the pilot for Hindi/Hinglish (Mukta captions, Tiro cards, long.js
   loaded); write `reel.json`. Start `vo.py` in the background at once (about 8 min a line on CPU while other
   jobs run: a 40-line video is a 5-hour recording). Start the music sections after it.
5. **Pictures:** ask before downloading. `python -I C:/Users/Admin/Reels/_shared/tools/commons.py search "<q>"`
   then `... get "File:<title>" _raw/<name>.jpg` (it retries Commons' 429 rate limit; space out searches).
   Cut with `cut.py`: `matte` for people (it erases objects, and leaves holes in busy photos: hide a hole in the
   clover), `print` for stadiums, crowds, objects on busy backgrounds, `circle` for balls/coins (its `--cx/--cy/--r`
   are in the scaled image, so pass `--max` equal to the source size), `key` only on plain walls. Look at every cut
   on teal (hstack/vstack sheets; the ffmpeg `tile` filter dropped frames here).
6. **Scenes:** copy the pilot's `build_scenes.py`, keep its engine (bottom half), replace `PLATES` and the
   `S["voN"]` bodies. Bodies get `C, root, tl, st, D, END, at(k)` (start of word k of that line, from timing.json).
   - Test before the voice exists: make a scratch copy (`reels/_preview-<slug>`) with sine stand-ins sized by the
     0.064 s/char estimate, then `place.py`, `overlap.py`, `build_scenes.py`, `hf check`, and
     `hf snapshot --at <0.72 into every scene> --no-end`. Read every contact sheet and fix.
   - Lines added after recording started get new ids (vo35...) inserted in story order; record them with a
     second `vo.py reel.json assets/vo vo35 vo36 ...` run.
7. **When the voice is done:** check the words (`heard.py`), then in the real folder `place.py && overlap.py &&
   python build_scenes.py` (it re-reads timing.json), `hf check`, snapshots, preview in the browser pane, render
   with `finish.sh`, write `POST.md` with image credits.

## Gotchas from the pilot
- `plate()` text is dark brown: it vanishes on night paper. Use sky or dusk under a plate.
- Flipping a cut-out mirrors shirt text and logos: flip the one without lettering.
- A portrait cut-out (head and shoulders) has a hard bottom edge: anchor it below y 1900 so the clover hides it.
- Stamps placed on tickets cover the ticket text: put them below the ticket.
