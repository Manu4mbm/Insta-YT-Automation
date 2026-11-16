---
name: reel-pixel
description: "Make a 9:16 narrated story reel in the Pixel Art style (16-bit retro game look: chunky 6-px pixels, a limited posterized palette, dark sprite outlines and a banded sunset sky) for the user's channels, end to end - story ideas, research, script and scene table for approval, voice, scenes, captions, music, render. Use when the user says /reel-pixel, or asks for a reel/video/short in Pixel Art style (pixel, 8-bit, 16-bit, retro game, sprite, pixel art)."
---

# Pixel Art reel

**Look:** 16-bit retro game look: chunky 6-px pixels, a limited posterized palette, dark sprite outlines and a banded sunset sky.
**Best for:** retro and nostalgic topics, epics told like a game level (quests, journeys, battles), kids' stories.

This is one of 10 style skills that share one kit. Before writing anything, read `C:/Users/Admin/Reels/style-reels/WORKFLOW.md`. It has the steps, the `reel.json` shape and every character, action, set and camera move. Follow the `/hyperframes` contract for any edit.

## This style
- In `reel.json`, set `"style": "pixel"` (engine: 2D (SVG)). The captions, titles, stamps, outro card and series chip all take this style's look automatically.
- Sunset or dusk skies show the banded gradient best. Use `walk` with camera `track` for the side-scroller feel. Keep characters big and few (2-3), because small details vanish at 180x320 pixels. Stamps read like game text ("LEVEL 2", "+1 वरदान").
- To see this style next to the other nine, look at the `pixel` scene in `C:/Users/Admin/Reels/style-reels/reels/style-test` (render: `renders/style-test.mp4`).

## Steps (short version: WORKFLOW.md has the detail)
1. **Story.** Offer 10 ideas that suit this style if no topic was given. Research the story and write `SOURCES.md`; mark legends as legends.
2. **Ask once:** language, voice (D, MKD or the user's own recording) and channel.
3. **Approval.** Show the lines with English meanings, the scene table (set, time, who, action, camera, title/stamp/FX) and the cast. Wait for the user's approval.
4. **Build.**
   - Make the folder: `bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh style-reels <slug>`.
   - Write `reel.json`.
   - Record the voice with `vo.py` in the background.
   - Preview meanwhile with `python ../../../_shared/tools/style_build.py --placeholder`, then `hf check` and `hf snapshot`. Fix what you see.
5. **Final build.** When the voice is done, check the words, rebuild without `--placeholder`, run check and snapshot again, and open the preview for the user.
6. **Render** after the user approves: `bash ../../../_shared/tools/finish.sh <slug>`. Then write `POST.md`.
