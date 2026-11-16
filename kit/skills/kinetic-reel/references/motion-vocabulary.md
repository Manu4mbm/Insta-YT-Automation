# Motion vocabulary

| Line is about… | Try |
|---|---|
| Urgency, pressure | Tight spacing, faster cuts, words crowding edges, dark bg (indigo), screen shake on the impact only |
| Calm, trust, relief | Slow drift (1–2%), generous spacing, long holds, one colour, serif italic |
| Contrast / "but…" | Split frame, colour flip, second half pushes the first out |
| Money, numbers | Counters, taxi meter, receipts printing, stacks growing |
| Time passing | Counter (MAHINA 01→24), calendar pages, clock hands |
| Lists, steps | Items stacking, checkboxes ticking on each word |
| A question | Line holds unfinished; blinking cursor |
| Comparison / peer pressure | Name tags, labels, ticker of names in the background |
| Copying / sameness | Photocopies stacking, each greyer; CTRL+C · CTRL+V |
| Decline / failure | Bars dropping with weight (low damping, high mass), number going down |
| Not knowing / blind | Blur on the word, jitter |
| Confusion → answer | Tangled line redraws as a straight arrow |
| Movement, abroad | Map pins, dotted arc, plane |
| Identity, "be yourself" | Old labels fall with gravity; blank tag stamps the new word |
| Punchline / CTA | Subtraction: strip everything, one word, hold; button press |

## Type system (3 faces max)
- **Loud** (Anton / Bebas / Archivo Black): stamps, hero nouns, CTA.
- **Serif italic** (Instrument Serif / DM Serif): emotional words, questions, "tum?".
- **Sans** (Inter / Manrope): supporting lines.
- Mono (JetBrains Mono): tiny labels only (counts as decoration).
Devanagari: test Noto Sans Devanagari / Mukta / Tiro Devanagari on the hardest word first; never split a word into characters.

## Easing by material
- Heavy (stamp, falling tag, dropping bar): `damping 7–11, stiffness 120–420, mass 1–1.4`, overshoot + shake.
- Light (label, bubble, tick): `damping 9–12, stiffness 250–320`.
- Calm (drift, fades): linear interpolate over 3–6 s, or `Easing.inOut(Easing.cubic)`.
