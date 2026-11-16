---
name: saas-product-video
description: Premium SaaS / software / app launch video (16:9 or 9:16) in Remotion — dark product UI, 3D-tilted app windows, feature sections that build live on the voiceover, end card with CTA. Use when the user wants a SaaS video, product launch, app promo or software explainer.
---

# SaaS product video

Reference build: ReelPilot launch video (`example/`). Kit: `kit/saas.tsx` + `kit/fonts.ts`.

## Look (keep it international, not "template")
- Solid near-black bg `#0A0C11` + faint 80px engineering grid. **No big gradients.**
- One main accent (blue `#4D7CFE`) + small use of lime (success), coral (problem), amber (warning), violet.
- Type: Inter 800–900 for headlines (tight tracking), Instrument Serif italic for one emotional word per line, JetBrains Mono for UI labels / section numbers.
- Real-looking product UI: macOS window with app sidebar (product nav), cards, chips, check marks, cursor clicks. Show the feature *working*, not just its name.
- Numbers shown as sample data are tagged "demo data". No fake stats, testimonials or user counts.

## Script structure (60–90s, English for global audience)
1. Problem (0–12s): the pain in 3 concrete beats + "your whole day — gone."
2. Introducing <Product> — logo draws, wordmark wipe, one-line tagline, platform chips.
3. "One system" — 3 pillars.
4. 4–5 feature sections, each "0N — FEATURE / Title / one-line sub" on the left + a live 3D-tilted app window on the right that builds on the spoken words.
5. Whole funnel in one line (nodes light up in order).
6. Emotional line (serif) → "<Product> does the rest."
7. End card: logo + tagline + CTA comment box that types the keyword + handle.

## Build steps
1. Voiceover → `timing.py <folder> en` → `words.json`. Note the word index of every visual beat (make a table).
2. Copy `kit/` into `src/`, `src/lib/clock.ts` gives `useT`, `WORDS`, `ws(i)`.
3. `Reel.tsx`: scene boundary array `S`, a `Scene` wrapper (blur+scale cross-fade, slow push), one component per scene, every reveal keyed to `W(i)` word times. Bottom subtitle strip (7-word chunks, current word bright).
4. `Root.tsx`: 1920×1080 30fps (or 1080×1920 for 9:16; re-layout, don't just scale) + `Cover` still.
5. `npx tsc --noEmit` → stills at every beat (`stills.mjs`, absolute paths, scale 0.3) → contact sheet → fix overlaps/clipping (long headlines: split into lines + fixed width).
6. `mix.py`: VO 0.95, music −20 dB sidechain-ducked under VO, SFX on events (pop for cards, whoosh on scene cuts, click on cursor, notification on DMs, impact on logo/hero), loudnorm −14 LUFS.
7. Render `--concurrency=2 --crf=18`, render Cover, deliver.

## Checks
- Nothing touches the frame edges; text never overlaps UI.
- Every feature claim is true for the product.
- Each scene has motion every ~0.5s (something pops, types, fills or ticks).
