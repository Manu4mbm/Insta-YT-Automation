---
name: reel-bharat
description: Make a catchy 9:16 Instagram reel for the user's "India by Bharat" channel (Indian culture, history, geography, religion, philosophy, stories, food) end to end - research, script, narrator-D voice in Hindi/English/Hinglish, manuscript-style HyperFrames scenes, word-pop captions, music, render. Use when the user says /reel-bharat, asks for an India by Bharat reel, or a reel on an Indian culture/history/food/religion topic.
---

# India by Bharat reel

Kit: `C:\Users\Admin\Reels` (read `README.md` there for the pipeline) and the channel style `C:\Users\Admin\Reels\india-by-bharat\STYLE.md`.
Read STYLE.md before writing anything. Also follow the `/hyperframes` skill contract for every scene edit.

## Steps

1. **Topic + language.** The topic comes from the args or the user. Language: Hindi is the default; ask only if the user hasn't said.
   Research with web search and prefer ASI, state tourism, scholarly or major-publication sources.
   - Mark legends as legends ("माना जाता है").
   - Keep a `SOURCES.md` in the reel folder.
   - Be respectful of every faith and region.
2. **Folder.** Run `bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh india-by-bharat <slug>`. All later commands run inside that folder.
3. **Script.** Write `reel.json` lines in the STYLE.md shape: hook, where/when, story with a number, secret, repeatable line, CTA.
   - Write numbers as Hindi words and names phonetically in Devanagari in `say`.
   - `show` can use digits and Latin script, with `*word*` marking emphasis.
   - Show the user the script (with an English meaning) and get approval before recording. Recording costs ~3–4 min per line.
4. **Voice.** Check that VoiceStudio is up: `curl -s localhost:3900/health`. If it isn't, launch it with `explorer.exe "C:\Users\Admin\AppData\Local\Programs\VoiceStudio\VoiceStudio.exe"`.
   Run `PYTHONIOENCODING=utf-8 python -u ../../../_shared/tools/vo.py reel.json assets/vo` in the background.
5. **Music.** Reuse `assets/bgm/bed.wav` (the tanpura and bansuri channel bed). Make a new one only if asked:
   `/c/Users/Admin/.cache/hyperframes/musicgen-venv/Scripts/python ../../../_shared/tools/music.py assets/bgm/bed.wav "<prompt>"`.
6. **Layout.** Run `python ../../../_shared/tools/place.py`. It writes the scene timing, the captions, the whooshes, the music length and `timing.json`.
7. **Scenes.** Rewrite `compositions/*.html` for the topic in the manuscript look.
   - Reuse the template's scene types: hook (line drawing + question), place (rising sun + name + place/era), count (count-up numbers with marks), sundial (big rotating diagram), payoff (stamp), outro (diya + follow).
   - Draw subjects as SVG woodcut line art. Use real photos of real places when available, with a warm grade, a slow drift and the source credited.
   - Set the series chip with the `series` variable.
   - Search `/hyperframes-registry` before hand-building a named effect.
   - Re-run place.py after changing scene hosts.
8. **Check.** Run `~/.cache/hyperframes/hf check --json` and fix the errors.
   Then `hf snapshot --at <times>` across the hook, each scene and the captions; confirm the safe band (168–1330 px).
   Open the preview for the user.
9. **Render** after the user approves the preview: `bash ../../../_shared/tools/finish.sh <slug>` (−14 LUFS).
10. **Post copy.** Write the caption: hook, the story in 2–3 lines, sources, 5–8 hashtags (Hindi and English).

## Catchy checklist
- [ ] Frame 0 shows the wow-line and the main drawing.
- [ ] Wow-fact or question in the first 2 s; a new beat every 3–4 s.
- [ ] One number or detail people will repeat.
- [ ] No disputed-border maps, no copyrighted music.
- [ ] 30–55 s total.
