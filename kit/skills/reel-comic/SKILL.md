---
name: reel-comic
description: "Make a 9:16 narrated story reel in the Comic Book style (thick ink outlines, halftone dot shading, an orange sunburst sky, punchy flat colours, stamps in red boxes like comic SFX) for the user's channels, end to end - story ideas, research, script and scene table for approval, voice, scenes, captions, music, render. Use when the user says /reel-comic, or asks for a reel/video/short in Comic Book style (comic, comic book, halftone, superhero comic, pop art)."
---

# Comic Book reel

**Look:** thick ink outlines, halftone dot shading, an orange sunburst sky, punchy flat colours, stamps in red boxes like comic SFX.
**Best for:** action beats, heroic moments, funny twists, 'did you know' facts with punch.

This is one of 10 style skills that share one kit. Before writing anything, read `C:/Users/Admin/Reels/style-reels/WORKFLOW.md`. It has the steps, the `reel.json` shape and every character, action, set and camera move. Follow the `/hyperframes` contract for any edit.

## This style
- In `reel.json`, set `"style": "comic"` (engine: 2D (SVG)). The captions, titles, stamps, outro card and series chip all take this style's look automatically.
- Use `stamp` for SFX words ("धनुष टूटा!", "BOOM"). The sunburst sky slowly rotates. Use camera `shake@` on hits. Day time. Characters read best at the default size.
- To see this style next to the other nine, look at the `comic` scene in `C:/Users/Admin/Reels/style-reels/reels/style-test` (render: `renders/style-test.mp4`).

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
