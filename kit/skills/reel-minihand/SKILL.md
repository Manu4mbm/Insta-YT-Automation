---
name: reel-minihand
description: "Make a 9:16 'giant hand rescues tiny people' reel (a photoreal human hand uses an everyday object - sponge, syringe, matchstick, ice cube, fan, ruler - to fix a disaster in a tilt-shift miniature diorama while tiny toy figurines cheer and squeak 'thank you'), AI first frames + AI video shots built in HyperFrames, for the user's channels, end to end - scene ideas, scene table for approval, frames, shots, tiny voices, captions, sound effects, music, render. Use when the user says /reel-minihand, or asks for a mini hand / giant hand / tiny people / miniature diorama / 'helping tiny people' reel, or a short 'like the cartoon shorts reel with the hand'."
---

# Mini-hand rescue reel

**Look:** a real giant hand over a miniature diorama; glossy toy people (3 cm, big heads); one everyday tool per
scene; one physical fix (liquid, smoke, fire, light); 6–8 scenes × 8 s, hard cuts; the shots' own sound (Gemini/Veo ambience,
splashes, cheers); a one-line "thank you" caption per scene (yellow word highlight); playful music; a comment-question end
card. No narrator, and by default no added voice (`"voice": "none"`): the user prefers captions only.
**Best for:** satisfying, rewatchable shorts on everyday problems (monsoon, heat, smog, potholes, power cuts, festivals)
for India by Bharat, or energy / oil & gas / infra fixes for Protech Synergy.

Before writing anything, read `C:/Users/Admin/Reels/minihand-reels/STYLE.md` (look, scene recipe, prompt rules,
sound, reel.json, commands). Follow the `/hyperframes` contract for any edit, and `/media-use` for every generate call.
The sample is `C:/Users/Admin/Reels/minihand-reels/template/reel.json`.

## Steps

1. **Sign-in check.** `npx hyperframes auth status`. If you aren't signed in, tell the user in one line that the AI frames and
   shots need it, and start it for them in a terminal tab (`npx.cmd --yes hyperframes auth login`; plain `npx` is
   blocked by PowerShell's script policy). Image and video generate also need a **HyperFrames Pro** plan: a refusal
   says "HyperFrames Pro feature; nothing was charged". A plan is the user's purchase, never start one. Otherwise, use
   `mh.py prompts` → `PROMPTS.md` so the user can make frames and shots in their own AI tool (Gemini/Veo, Kling,
   Hailuo, Meta AI) and drop them into `assets/frames/<id>.png` and `assets/shots/<id>.mp4`; everything after that
   is the same. Don't fake the look with SVG.
2. **Theme and ideas.** If no theme was given, offer 4–6 themes. For the chosen one, offer 10–12 scene ideas
   (problem → tool → fix, one line each) in the STYLE.md recipe. Keep them original and local, never a copy of
   someone else's reel.
3. **Ask once** (AskUserQuestion): channel (India by Bharat or Protech Synergy), caption language (Hinglish/Hindi in Roman
   caps, or English) and number of scenes (6 or 8). Captions only with the video's own sound is the default; add a tiny
   voice (narrator D pitched up, `"voice": "D"`) only if the user asks for one.
4. **Scene table, for approval.** For each scene: problem, tool, frame, motion, line (`say` + `show`), sfx, and
   the hook and end question. Order: strongest first, warmest last. Wait for approval.
5. **Build the reel folder.** `bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh minihand-reels <slug>`, then write
   `reel.json` there.
6. **Frames.** `python ../../tools/mh.py frames --plan` (for your own check, never quote prices), then `frames`, then `sheet`. Read
   `assets/frames/_sheet.png` and every frame; remake only for a named fault (STYLE.md). **Show the user the
   sheet and get an OK before making shots**, since shots are the expensive step.
7. **Shots.** `mh.py shots` in the background (each shot takes minutes). Meanwhile make the music bed (loop it past the reel
   length with acrossfade). Keep the shots' own sound (`"shot_audio": 1.6`); transcribe it first, no spoken words. Only if a
   voice was asked for: `mh.py lines`, `vo.py vo-lines.json assets/vo` (check `curl -s localhost:3900/health`), `mh.py tiny`.
   Extra action SFX (`media-use resolve --type sfx`, ask before downloading) only where a shot is silent. When the shots land, check each one with a 6-frame strip
   (`ffmpeg -i assets/shots/s1.mp4 -vf fps=1,scale=180:-1,tile=8x1 -frames:v 1 strip.png`): the fix really happens,
   faces don't melt, there's no cut. Set `trim` if the good part is shorter, and set each `line.at` to when the people cheer.
8. **Build and check.** `mh.py build` → `~/.cache/hyperframes/hf check` (fix until 0 errors) →
   `hf snapshot --at <hook, every caption, end card>`; read the contact sheet.
9. **Preview** in the browser pane (a `launch.json` entry running `hf preview --no-open --foreground --port 3014 <reel>`
   through `C:/Program Files/Git/bin/bash.exe -c`) and show the user.
10. **Render** after approval: `bash ../../../_shared/tools/finish.sh <slug>`; check `hf audio renders/<slug>.mp4 --json`
    (say it was measured, not heard). Write `POST.md`: hook caption, a 1-line premise, the comment question,
    6–8 hashtags, and a note that the visuals are AI-generated (Instagram/YouTube AI label on).

## Keep it true to the look
- One tool, one fix, one line per scene. The fix is visible by 3 s and done by 5 s.
- The hand stays the same person (same skin and sleeve) in every scene; the people stay toy-like, never realistic humans.
- No text in frames or shots; all words come from HyperFrames.
- Hindi lines are captioned in Roman caps; captions stay at y about 1240, clear of the Instagram UI.
- Indian places, faiths and festivals are shown with respect; the disasters are light, never real tragedies.
