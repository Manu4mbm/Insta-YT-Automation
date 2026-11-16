# Avatar narrator + app window (the best-performing format)

A code-drawn chibi narrator stands at the bottom (lip-synced to your voice via `src/amp.json`), an app window at the top shows the story, a headline chip and word-synced captions sit in between.

Example in `src/Reel.tsx`: a 38 s reel about a prompt gallery (hook montage → chat UI → gallery → category clips → pick/copy/paste flow → CTA).

## Make your own
1. Put your voiceover in `public/audio.mp3`, `public/music.wav` (licensed bed) and `public/sfx.wav` (or remove those `<Audio>` lines).
2. Ask Claude: "use the avatar-explainer template: align my audio (faster-whisper word timestamps → src/words.json + lines.json, loudness → src/amp.json), then rewrite the scenes in src/Reel.tsx for my script". Follow `skills/kinetic-reel` + `skills/ai-video-editor`.
3. Change the narrator's look in `src/Character.tsx` (`K` colours, hair path, beard) once, then reuse it in every reel.
4. `npm install` → `npx remotion studio` to preview → `npx remotion render Reel out/reel.mp4 --concurrency=2` → `npx remotion still Cover out/cover.png`.

The example references video clips (`element_*.mp4`) that are NOT included (they belonged to other creators) — replace them with your own footage or screen recordings.
