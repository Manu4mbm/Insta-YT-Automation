# Using Antigravity (Gemini) as the backup reel maker

Use this when Claude reaches its limit. Antigravity edits the same GitHub repo and renders reels on your own computer.

## One-time setup — DONE on Mr. Dixit's Windows PC (24 Nov 2026)
Project folder: `C:\Users\Admin\Documents\insta-yt-automation`. Test still rendered OK.

Windows notes (PowerShell blocks npm scripts): always type `npm.cmd` / `npx.cmd` instead of `npm` / `npx`.
Rendering a full reel uses bash: run it from **Git Bash** (Start menu → Git Bash), e.g.
`cd ~/Documents/insta-yt-automation/reel-engine && bash tools/render.sh specs/<slug>.json`.
Python tools: `python tools/voice.py ...`, `python tools/cover.py ...`.

## One-time setup (reference, for a new machine)
1. Install: Google Antigravity, Git, Node.js 20 LTS, FFmpeg (add to PATH), Google Chrome, Python 3.
2. In Antigravity: Clone Repository → sign in to GitHub → choose `insta-yt-automation`.
3. Open a terminal in Antigravity:
   ```
   cd reel-engine
   npm install
   pip install faster-whisper numpy
   npx remotion still src/index.ts Reel out/test.png --props=specs/_demo.json --frame=40
   ```
   If `out/test.png` appears, the engine works on your PC.

## Each time you use it
1. Pull the latest (Sync button).
2. Paste this prompt:
   > Read AGENTS.md, docs/STATUS.md and reel-engine/README.md first and follow them exactly.
   > Task: make tomorrow's reel "<topic>". Step 1: give me the Hindi script (35–42 s) with sources and wait for my approval.
   > After approval I will put the ElevenLabs voice file in reel-engine/voice/. Then run tools/voice.py, write the spec using only existing scene types,
   > render stills for me to check, then render the video and cover. Do not schedule or post anything until I approve.
3. Generate the voice yourself on elevenlabs.io (voice "Ajay – Engaging Documentary Narrator", one take) and save it as `reel-engine/voice/<slug>.mp3`.
4. After you approve the video: ask Antigravity to copy the files to `public/media/`, commit and push.
5. Scheduling: ask Claude (next session) to add the Supabase rows, or add them in the Supabase dashboard (Table editor → posts / yt_posts / x_posts).

## Notes
- Antigravity cannot run inside the automation; posting stays on Vercel + Supabase.
- Rendering a 40 s reel takes about 3–6 minutes on a normal laptop.
- Commit and push before going back to Claude.
