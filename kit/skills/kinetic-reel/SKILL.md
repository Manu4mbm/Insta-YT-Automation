---
name: kinetic-reel
description: Make a motion-designed 9:16 kinetic-typography marketing reel (Instagram Reels / Meta ad) from a voiceover + script with Remotion. Use for any reel, short, ad video, or "make a video from this audio" request in this repo.
---

# Kinetic Reel pipeline

Six passes. **Stop at every checkpoint and wait for the user.** Record status in the reel's `notes.md` after each pass.
Paths below are relative to the reel folder `clients/<client>/reels/<reel>/`. Scripts live in this skill's `scripts/`.

## Inputs
- `audio.mp3` — trimmed voiceover (own/licensed audio only).
- `script.txt` — one line = one on-screen beat; `*hero*` words; exact words as spoken; Roman Hinglish stays Roman, Devanagari stays Devanagari.
- `../../brand.md` — colours, fonts, logo path, CTA, contact, allowed claims. If missing, ask once; use placeholders and list them in notes.md.

## Pass 01 — Prep → `setup-report.md`
1. `ffprobe` duration / sample rate / channels; `ffmpeg -af silencedetect=noise=-35dB:d=0.4` and `volumedetect`.
2. Classify: clean speech / speech over music / singing. Count lines, words, hero words, scripts used.
3. Check tools: node, python, ffmpeg, torch, torchaudio, faster-whisper, uroman. Install what's missing (`pip install torch torchaudio --index-url https://download.pytorch.org/whl/cpu`, `pip install faster-whisper uroman soundfile numpy`).
4. Write `setup-report.md`. **Stop.**

## Pass 02 — Timing map → `timing/`
Run `python scripts/timing.py <reel-folder>`. It:
- converts to 16 kHz wav (and, if music is present, tell the user to supply a dry vocal or run Demucs first),
- **forced-aligns script.txt** with torchaudio `MMS_FA` (multilingual, romanised — Hinglish works; Devanagari is romanised internally only),
- cross-checks with faster-whisper word timestamps (DP-matched),
- writes `timing/words.json` `[{i,text,start,end,line,hero}]`, `timing/lines.json`, `timing/report.md` (coverage, gaps > 0.5 s, per-line high/medium/low, disagreements > 0.25 s).
When the two methods disagree, check against `silencedetect` boundaries before trusting either. **Never** replace script words with the transcript. **Stop.**

## Pass 03 — Karaoke check → `checks/karaoke.mp4`
Copy `engine/` → `reel/` (if not already), copy `audio.mp3` → `reel/public/`, `timing/*.json` → `reel/src/`.
`npx remotion render src/index.ts Karaoke ../checks/karaoke.mp4 --concurrency=<cores>`.
It is plain on purpose (timing only). Tell the user to watch on phone with sound. Fix only the lines they name (global offset or re-align those lines).
On "approved": make `timing/`, `audio.mp3`, `script.txt` read-only. **Stop.**

## Pass 04 — Meaning map → `direction/brief.md` + `direction/scenes.json`
Act as art director. For every line: what it means (incl. slang/sarcasm), which 1–2 words carry it, what that meaning would *do* physically on screen.
- Group lines into 8–12 scenes; plan an energy curve calm → build → peak → release; some scenes barely move.
- ONE **throughline** prop that transforms across the reel (e.g. name tag, boarding pass, door, progress bar).
- Each scene hands off through an on-screen object/camera move, not a generic wipe.
- ≤3 typefaces with jobs (see `references/motion-vocabulary.md`). Palette from brand.md.
- **Marketing structure:** hook ≤1.5 s → problem → what to do → how the brand helps → CTA end card (logo, CTA, contact) last 2–3 s.
- Plan the **20 s ad cut** (which scenes, cut points inside silences).
- `scenes.json` fields: id, lines, start, end, meaning, keyWord, idea, typeStyle, setting, entersFrom, exitsInto, energy, toDraw.
Self-review: name 3 weakest scenes and rework them; flag any idea used > 2 times. Send the 5 strongest moments. **Stop.**

## Pass 05 — Motion kit + pilot → `pilot/pilot.mp4` + 6 stills
Engine (`reel/src/`) already has: `lib/clock.ts` (word times), `lib/motion.ts` (`sp` spring, `stamp`, `exitX`, `fadeIn`), `lib/Phrase.tsx` (line arrives as a unit, hero word pops), `lib/theme.ts`, `lib/fonts.ts` (@fontsource + delayRender), `fx/Paper.tsx` (paper/grain bg), `props/` (throughline props).
- Edit `lib/theme.ts` from brand.md. Add fonts via `npm i @fontsource/<font>` and `lib/fonts.ts`.
- Build the throughline prop as SVG/CSS in `props/`. No downloaded images.
- Build the first 1–2 scenes (5–8 s, usually the hook) fully finished. Register them in `Reel.tsx` `SCENES`.
- Rules: `references/quality-bar.md`. Load `/remotion-markup` for Remotion API questions.
- Render `Pilot` composition + 6 stills; build a contact sheet and **review it yourself first** (clipping, overlaps, empty frames, safe area, template look). Fix, then show. **Stop.**

## Illustrations, sound & trust (always)
- **Illustrations:** use `props/People.tsx` — `<Person kind="boy|girl|papa|mom|friend|counsellor" mood="neutral|happy|sad|confused" acc={['cap','helmet','stethoscope','glasses','books']} blind={0..1}/>` and `<Avatar …/>` for circle-framed faces on cards. Add a character to every scene where a person is mentioned; mood follows the line (problem = sad/confused, solution = happy). Extend the file for new characters — flat vector, no stock images.
- **Throughline card (`props/NameTag.tsx`):** the band shows WHO the label belongs to (`label="SHARMA JI KA BETA"`, `"TUMHARA CAREER"`) — never generic text like "HELLO".
- **Sound:** write `reel/sfx/gen.py` (copy `scripts/sfx_gen_example.py`) — cue one synthesized SFX per visual event, tied to word times: whoosh on entrances/exits, `thud` on stamps, `pop` on bubbles/avatars, `tick` on counters/copies, `scribble`/`marker` on writing, rising `note`s on positive bars/ticks, `chime` on logo/success, `heartbeat`/`flatline` for emotion. Plus a soft music bed: tense minor under the problem, hopeful I–V–vi–IV from the turn. Run `python sfx/gen.py` → `public/sfx.wav`, `public/music.wav`; mix in `Reel.tsx` (VO 0.9, SFX 0.45, music 0.8) and check the summed peak < 1.0. If the client has a licensed music track, use it instead of the synth bed.
- **Trust (education/health/finance clients):** real logo from brand.md on the brand moment + end card, calm navy/cream palette from the logo, a family (student + parents) on the end card, no invented stats or claims.

## Style variants
- **Kinetic editorial** (Reel 1): paper texture, Anton/serif type, throughline card, `Phrase`. Example: `engine/src/scenes-example/Rest.tsx`.
- **UGC ad** (Reel 2): `engine/src/ugc/` — `Handheld` (phone-camera drift + punch-ins), `Caption` (TikTok-style auto captions, active word yellow; pass `hide` ranges where visuals carry the words), `Kit` (Room/Spot/Sky backgrounds, Door, Phone, WhatsApp-style chat, Typing, Confetti, RedCircle, BigX, Tick, Sticker, Icon set), white-flash jump cuts in `Reel.tsx`. Example: `engine/src/scenes-example/R2-ugc.tsx`.
- Each new reel for the same client should look different from the last: change style variant, throughline, palette emphasis.
- **Emoji:** rely on the system emoji font (`"Noto Color Emoji", "Segoe UI Emoji", "Apple Color Emoji"` in the font stack). Do NOT import `@fontsource/noto-color-emoji` (renders blank in headless Chrome). On Linux: `apt install fonts-noto-color-emoji`.
- **Scripts with TTS tags** ([thoughtful], [short pause] …): strip the tags, keep the words, one beat per line.

## Pass 06 — Scale & ship → `out/`
1. Build remaining scenes on the same engine.
2. Contact sheet every ~2 s (or 0.5 s for QA) → check words early/late, clipping, overlaps, jumps, repeated ideas, key text outside safe area, negative/overshoot numbers. Fix, re-check.
3. `npx remotion render src/index.ts Reel ../out/final.mp4 --codec=h264 --audio-codec=aac --crf=18`.
4. 20 s ad cut: `scripts/cut.sh` (trim at silences, concat) → `out/final-20s.mp4`.
5. `cover.png`: strongest frame, hook inside centre 3:4.
6. Update `notes.md` with weak spots. Deliver.

## Next reels
Same client: copy `reel/` from the previous reel, replace `public/audio.mp3` + `src/*.json`, write new scenes. Start from Pass 04.

## References
- `references/motion-vocabulary.md` — what move fits what meaning
- `references/quality-bar.md` — designed vs generated, motion rules
- `references/safe-area.md` — Reels / Reels-ad safe zones, export spec
- `references/fixes.md` — one-line fixes
