# Quality bar — two-second test: designed or generated?

| Reads as AI-made | Reads as designed |
|---|---|
| Every word pops in on its own | Phrases arrive as units; the hero word gets the moment (`Phrase`) |
| Everything dead-centre, same size | One dominant element per frame, real scale contrast, left-aligned type |
| Same ease on everything | Easing chosen per object (see vocabulary) |
| Wipe/glitch between scenes | Something in scene N causes scene N+1 (throughline prop, circle reveal from the prop) |
| Whole frame pulses on beats | Beat hits only on impacts/hero words |
| Empty half-frames | Fill with meaning-led decoration (ticker, giant outline glyph) — decoration may bleed into UI zones |

## Motion rules
- Wind-up before, settle after (anticipation + overshoot).
- Stamps: scale 1.9→1 in ~6 frames, 2-frame opacity, decaying shake 10 frames.
- Exits pull back ~4% then shoot out.
- Camera drift 1–3% over a scene; never constant zoom.
- Deterministic: `random('seed')`, never `Math.random()`.
- Clamp every displayed number (springs overshoot → negative %!).

## Self-QA before showing anything
Contact sheet → check: clipping at edges, overlaps that hurt legibility, text outside safe area, empty frames, numbers out of range, a hero word missing its moment, an idea repeated > 2×.
