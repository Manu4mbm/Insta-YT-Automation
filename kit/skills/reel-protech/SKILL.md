---
name: reel-protech
description: Make a catchy 9:16 Instagram reel for the user's "Protech Synergy" channel (AI, new tech, oil & gas, energy, infrastructure, economy) end to end - research, script, narrator-D voice in Hindi/English/Hinglish, HyperFrames scenes, word-pop captions, music, render. Use when the user says /reel-protech, asks for a Protech Synergy reel, or a reel on an AI/tech/energy/oil-gas/infra/economy topic.
---

# Protech Synergy reel

Kit: `C:\Users\Admin\Reels` (read `README.md` there for the pipeline) and the channel style `C:\Users\Admin\Reels\protech-synergy\STYLE.md`.
Read STYLE.md before writing anything. Also follow the `/hyperframes` skill contract for every scene edit.

**Protech Synergy is only the channel name.** Never promote the consulting company: no services, no company logo, no "contact us".
The only CTA is to follow the channel.

## Steps

1. **Topic + language.** The topic comes from the args or the user. Language: Hinglish is the default; ask only if the user hasn't said.
   Research with web search. Every number needs a source and a date; keep a `SOURCES.md` in the reel folder.
2. **Folder.** Run `bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh protech-synergy <slug>`. All later commands run inside that folder.
3. **Script.** Write `reel.json` lines in the STYLE.md shape: hook, context, number, why, meaning, payoff, CTA.
   - Keep each line to 6–14 words, with one scene per line.
   - `say` is what the voice reads; `show` is the caption, with `*word*` marking emphasis on each emphasised word.
   - Show the user the script (with an English meaning if it's in Hindi) and get approval before recording. Recording costs ~3–4 min per line.
4. **Voice.** Check that VoiceStudio is up: `curl -s localhost:3900/health`. If it isn't, launch it with `explorer.exe "C:\Users\Admin\AppData\Local\Programs\VoiceStudio\VoiceStudio.exe"`.
   Run `PYTHONIOENCODING=utf-8 python -u ../../../_shared/tools/vo.py reel.json assets/vo` in the background.
5. **Music.** Reuse `assets/bgm/bed.wav` (the channel bed). Make a new one only if asked:
   `/c/Users/Admin/.cache/hyperframes/musicgen-venv/Scripts/python ../../../_shared/tools/music.py assets/bgm/bed.wav "<prompt>"`.
6. **Layout.** Run `python ../../../_shared/tools/place.py`. It places the voice, sets each scene host's start and duration from `data-lines`, writes the captions, the whooshes and the music length, and writes `timing.json`.
7. **Scenes.** Rewrite `compositions/*.html` (and the `data-lines` hosts in index.html) for the topic.
   - Reuse the template's scene types: hook (icon + 2 lines), versus (A = B cards), rise (chart draw-on + tag), split (two cards), payoff (big statement), outro (follow button).
   - Add or remove scenes as needed, one per line, and re-run place.py after changing hosts.
   - Use `timing.json` word times to land visual beats on spoken words.
   - The topic chip goes in the `topic` variable on index.html.
   - Search `/hyperframes-registry` before hand-building a named effect.
8. **Check.** Run `~/.cache/hyperframes/hf check --json` and fix the errors.
   Then `hf snapshot --at <times>`: look at the hook frame (0 s), each scene and the captions, and confirm nothing is in the top 168 px or below 1330 px.
   Open the preview (launch config or `hf preview`) for the user.
9. **Render** after the user approves the preview: `bash ../../../_shared/tools/finish.sh <slug>`. It gives −14 LUFS; confirm the printed loudness.
10. **Post copy.** Write the Instagram caption: hook line, 2–3 lines of value, sources, 5–8 hashtags.
    Use the `protech-voice-writer` rules (no em dashes, no buzzwords). Offer a LinkedIn version via `linkedin-post-writer`.

## Catchy checklist
- [ ] Frame 0 shows the hook text and icon (it's the thumbnail).
- [ ] Hook claim in the first 2 s; something moves or changes every 2–3 s.
- [ ] One surprising number or comparison, said and shown.
- [ ] Payoff line under 8 words.
- [ ] Under 45 s total.
