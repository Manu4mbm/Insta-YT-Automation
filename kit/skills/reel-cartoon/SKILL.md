---
name: reel-cartoon
description: Make a funny animated cartoon story reel (9:16, chibi characters, 2D flat or 3D shaded look) for the user's "India by Bharat" channel from just a story name or topic - story ideas, research, script and scene plan for the user's approval, narrator voice (D, the user's MKD clone, or their own recording), cartoon scenes, word-pop captions, cartoon sound effects, music, comment-question ending, render. Use when the user says /reel-cartoon, asks for a cartoon reel/short/kahani, or wants a story told as a cartoon like the Napoleon-vs-rabbits style.
---

# Cartoon story reel ("कार्टून कहानी", India by Bharat)

The user gives a story name or topic. You get their approval on the story and the narration, then build the reel.
Every reel has the same look: chibi characters with big heads and eyes, bright sets, word-pop captions, cartoon sound effects, and a comment-question card at the end.

**Kit:** `C:\Users\Admin\Reels`.
- Read `README.md` for the shared pipeline.
- Read `india-by-bharat\cartoon-template\TOON.md` before writing scenes: it is the whole vocabulary of characters, faces, actions, sets, props and camera moves.
- Follow the `/hyperframes` contract.
- The sample reel is `india-by-bharat\reels\cobra-effect`. Copy its `reel.json` patterns.

## 1. Story

- **If there are no args, or only a theme** ("Akbar Birbal", "funny history"): offer **10 story ideas** as a numbered list. Give each a title, a one-line hook and its type (true history / legend / folk tale / Panchatantra / Akbar–Birbal / Tenali Rama). Let the user pick.
- **If a story is named,** go straight to research.
- **Good stories:** one funny, surprising turn with a punchline (a backfire, a clever trick, a reversal). Indian history oddities, folk tales, Panchatantra, Jataka, Akbar–Birbal, Tenali Rama, Sheikh Chilli, temple and food legends.
- **Research** with web search (scholarly, ASI, major publications). Write `SOURCES.md` in the reel folder.
  - Mark legends and anecdotes as such in the narration ("कहा जाता है", "लोककथा है कि").
  - Never invent dates or numbers.
  - Be respectful of every faith and region. The joke is on the situation, never on a community, a god or a real living person.

## 2. Ask once (one AskUserQuestion with three questions)

- **Language:** Hindi (default), Hinglish or English.
- **Voice:** narrator D (fast, ~6 min a line), the MKD clone (~7–8 min a line), or the user's own phone recording.
- **Look:** 2D flat or 3D shaded.

If the user has already said any of these, don't ask it again.

## 3. Script and scene plan, then get approval ("proof")

Write 6–9 lines, 30–45 s in total, using this shape:

1. **Hook (frame 0 is the thumbnail):** the punchline as a question or a wow-line. Example: "अंग्रेज़ों ने साँप मारने के पैसे दिए, और साँप बढ़ गए!"
2. **Setup:** who, where, when, with "कहा जाता है" for legends.
3. **Two to four beats of the story:** each line is one clear action that can be drawn.
4. **Twist / payoff:** the funny reversal.
5. **The repeatable line:** a name for the lesson ("इसे कहते हैं…") or a one-liner.
6. **Comment question** (always last): "आपके साथ कभी ऐसा हुआ है? कमेंट में बताइए!"

Rules for the lines:
- Write numbers as Hindi words and names phonetically in Devanagari in `say`. `show` can use digits and Latin script.
- Avoid "नई" (voice D can make it sound like "नहीं").
- Narration tells the story. Speech bubbles hold only 1–3 word reactions ("अरे!", "हम्म...", "पैसा ही पैसा!").

Show the user, in one message:
- the lines, each with an English meaning;
- a scene table: line → set → who is on screen → what they do and feel → bubble or stamp;
- the cast: each character's look in a few words.

**Wait for approval before recording,** because voice takes minutes per line. Apply every change they ask for and show it again if it changed a lot.

## 4. Build

1. Make the reel folder:

   ```bash
   bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh india-by-bharat <slug> cartoon-template
   ```

   All later commands run inside that folder.
2. Write `reel.json`: `look`, `voice`, `cast`, `lines`, `scenes` (TOON.md). The last scene is `"kind": "outro"` with `ask`.
   - Scene 1 has a `title` and its characters already on screen at frame 0. No `enter-*` at 0 in scene 1.
   - Put an action, a face change or a camera event in every scene. The comedy beat gets a `punch@` or `shake@` plus a `stamp` or reaction face.
   - Hold the reaction: the punchline face stays on screen for at least 1 s.
3. **Voice:**
   - Check VoiceStudio with `curl -s localhost:3900/health`. If it isn't up, launch it with `explorer.exe "C:\Users\Admin\AppData\Local\Programs\VoiceStudio\VoiceStudio.exe"`.
   - Run this in the background: `PYTHONIOENCODING=utf-8 python -u ../../../_shared/tools/vo.py reel.json assets/vo`
   - **The user's own recording:** ask for one clip per line, then convert each with `ffmpeg -i in.m4a -ac 1 -ar 24000 assets/vo/voN.wav`.
4. **While the voice records:**
   - Run `PYTHONIOENCODING=utf-8 python ../../../_shared/tools/toon_build.py --placeholder`.
   - Run `~/.cache/hyperframes/hf check --json`. The output has progress lines first; strip lines starting with `[hyperframes]` before parsing.
   - Run `hf snapshot --at <one time per scene>`. Read the contact sheet and fix the acting, positions and overlaps in reel.json.
5. **When every line is done:**
   - Check the words with `/c/Users/Admin/.cache/hyperframes/musicgen-venv/Scripts/python -I ../../../_shared/tools/heard.py assets/vo/*.wav`. If it segfaults while VoiceStudio holds RAM, use VoiceStudio's `/v1/audio/transcriptions`.
   - Re-record a bad line with `vo.py reel.json assets/vo vo3`, or reword it.
   - Re-run `toon_build.py` **without** `--placeholder`. It must not print the placeholder WARNING.
6. **Check:**
   - Run `hf check --json` and fix the errors.
   - Snapshot every scene again, plus the hook (0.1 s) and the outro.
   - Look for these: the bubble or stamp is readable, nobody's face is under a caption or the outro card, crowds don't hide the main character, and the frame-0 thumbnail reads on its own.
   - Then play-test the preview in the browser pane. Add a `cartoon-<slug>` entry to `C:\Users\Admin\.claude\.claude\launch.json` with runtimeExecutable `C:/Program Files/Git/bin/bash.exe` and args `-c "~/.cache/hyperframes/hf preview --no-open --foreground --port 3012 <reel path>"`. Open it with `preview_start` and show the user.

## 5. Render and post

- Render only after the user approves the preview: `bash ../../../_shared/tools/finish.sh <slug>` (−14 LUFS).
- Then write `POST.md`: a hook caption, the story in 2–3 lines, "Legend/anecdote" or source notes, the comment question again, and 6–8 hashtags in Hindi and English (#कार्टूनकहानी #IndiaByBharat …).

## Look and feel (keep it the same every reel)
- 1080×1920 at 30 fps. Chip "कार्टून कहानी" at the top.
- Titles go on a wooden sign; stamps are yellow with an ink outline.
- Captions are white Baloo 2 with an ink outline. The spoken word turns orange; `*emphasis*` words are yellow.
- The music bed is playful (pizzicato, marimba, tabla, bansuri) at 0.16. Never use film songs.
- Safe band: nothing readable from 0 to 168 px or below 1330 px. Captions sit at 1172–1330 px over the characters' legs.
- Don't copy any existing cartoon's characters or style (no Napoleon, no named TV characters). Draw our own cast with the kit.
