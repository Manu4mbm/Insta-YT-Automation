# Proportions & styling

## Default proportions

Everything is measured in units of `HEAD_R` (the head circle's radius),
defined once in `assets/starter.html`:

| Bone | Length (× `HEAD_R`) | Notes |
|---|---|---|
| Head radius | 1.0 | the unit itself |
| Neck | 0.35 | short — most of the "neck" read comes from the head sitting atop it |
| Torso | 3.1 | hip to shoulder line |
| Upper arm | 1.55 | shoulder to elbow |
| Forearm | 1.4 | elbow to hand |
| Thigh | 1.9 | hip to knee |
| Shin | 1.85 | knee to ankle |
| Foot | 0.85 | ankle to toe |

Standing straight, this comes out to roughly an 8-heads-tall figure (head
diameter + neck + torso + thigh + shin ≈ 9.2 head-units), a fairly standard
"heroic" proportion for a simple line figure — tall enough to read as an
adult, not so long-limbed that it looks like a fashion sketch.

## Restyling proportions

All of it lives in one object (`BONES` in `assets/starter.html`) and the
rig math does not care what you put there — every angle, every IK target,
every pose in `references/poses.md` is defined relative to bone lengths,
not absolute pixels. Two common restyles:

- **Chibi / cute**: shrink `TORSO`, `THIGH`, `SHIN` to ~60-70% of default,
  keep `HEAD_R` the same or grow it slightly. Comes out ~4-5 heads tall.
- **Heroic / lanky**: lengthen `THIGH`, `SHIN`, `UPPER_ARM`, `FOREARM` to
  ~115-125%. Comes out 9+ heads tall.

Nothing else needs to change — poses, the walk cycle, IK, all of it keeps
working because they operate on angles and ground-relative targets, not
fixed pixel offsets.

## Line style

`STYLE` controls the whole figure's look:

```js
const STYLE = { stroke:'#1b1e26', strokeWidth:9, headFill:'#1b1e26' };
```

- **Stroke weight** relative to `HEAD_R`: the default (`strokeWidth: 9`
  against `HEAD_R: 28`, a ratio of ~0.32) reads as a clean, confident
  marker line at typical video resolutions (1280×720 stage, scaled up to
  1080p+ output). Thinner (`~0.15×HEAD_R`) reads as a technical/diagram
  style; thicker (`~0.45×HEAD_R`) reads as a bold, chunky cartoon style.
- **`stroke-linecap="round"`** is set on the `<g id="figure">` container
  in the starter's SVG, so every bone end (including the "open" ends of
  hands and feet) gets a soft rounded cap instead of a hard square end —
  this is what keeps hands/feet from looking like they were cut off with
  scissors. Keep this if you restyle; a square cap looks noticeably worse
  at the same stroke weight.
- **Head fill vs. outline**: default is a filled solid circle
  (`headFill` = same as `stroke`). An outlined/hollow head (set
  `fill="none"` and give the circle its own `stroke`) reads more
  "friendly cartoon," a filled head reads more "bold icon."

## Color and multiple figures

The rig has no assumption of a single color. For a crowd or a two-character
scene, duplicate the `<g id="figure">` block (give every child a unique
`id` suffix), duplicate the small `el` lookup object and the render calls
in JS, and give each instance its own `STYLE`. Nothing about `render()`,
`solveLegIK()`, or `gaitFoot()` is global state tied to a single figure —
every function takes the hip position and pose as arguments, so N figures
is N independent calls.

## Mirroring / facing direction

Every render call takes a `facing` argument (`1` or `-1`). This flips the
horizontal component of every bone vector (`downVec`/`upVec` multiply `dx`
by `facing`), so a figure walking right-to-left is `facing:-1` with
otherwise identical pose data — never author a mirrored pose table by
hand.
