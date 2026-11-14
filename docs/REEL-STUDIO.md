# reel-studio (existing kit — reuse, don't rebuild)

This folder sits inside reel-studio (`../`). Start Claude Code from the reel-studio root so the skill and /commands load.

- `CLAUDE.md`, `SETUP.md` (Windows install: Node, Python, ffmpeg, Claude Code, `npx skills add remotion-dev/skills`)
- `.claude/skills/kinetic-reel/` — 6-pass pipeline (prep → timing → karaoke → meaning map → pilot → ship), scripts (`timing.py` forced alignment MMS_FA + Whisper cross-check, `cut.sh`, `sfx_gen_example.py`), references (motion vocabulary, quality bar, safe area, fixes)
- `.claude/commands/` — `/reel-new` `/reel-prep` `/reel-timing` `/reel-karaoke` `/reel-direct` `/reel-pilot` `/reel-ship` `/reel-short`
- `engine/` — Remotion template: `lib/` (clock, motion springs/stamp, Phrase, theme, fonts), `fx/` (Paper, Handheld), `props/` (People illustrations, NameTag, UGC Kit: Phone/chat/Door/Room/stickers/icons), `ugc/Caption.tsx`, `sfx/gen.py` (synth SFX + music bed)
- Examples: `clients/vision-guiders/reels/reel-1…` (kinetic editorial), `reel-2…` (UGC ad style)

Gotchas learned:
- Emoji: use system "Noto Color Emoji"/"Segoe UI Emoji"; don't import @fontsource/noto-color-emoji (renders blank headless).
- Digits in script ("10") need spoken forms in aligner (handled in align.py NUM map).
- Clamp spring-driven numbers (overshoot → negative %).
- Strip TTS tags like [thoughtful] from scripts.

New for this project: add `/reel-post <reel-folder> --at <datetime> --keyword <KW>` → runs `insta-ai-automation/scripts/queue-reel.ts`.
