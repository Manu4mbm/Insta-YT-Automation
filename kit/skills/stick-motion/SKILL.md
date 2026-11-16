---
name: stick-motion
description: Build stick-figure character animation in the browser (walking, running, waving, jumping, cheering, and other posed/keyframed actions) using a jointed 2D rig — forward kinematics for arms/head, inverse kinematics for feet — instead of freehand-drawn coordinates. Use this skill whenever a user asks for a stick figure, stickman, or simple line-figure animation/video, or complains that an agent-drawn stick figure looks broken, has floating/sliding feet, disproportionate limbs, or a walk cycle that "looks wrong." Output is a single index.html — double-click to play. Also use when extending an existing stick-figure scene with a new pose or action.
license: MIT
metadata:
  version: "1.1.0"
  homepage: local
---

# Stick Motion — jointed stick-figure rig for agents

## Why this exists

Ask an agent to "draw a stickman walking" and it will usually free-hand a
new set of coordinates every frame: a line here, a circle there, angles
guessed from scratch each time. Nothing enforces that the arm stays the
same length between frames, nothing stops a foot from floating above the
ground or sliding across it mid-stride, and nothing stops the proportions
from drifting scene to scene. This is why AI-drawn stick figures look
subtly (or badly) wrong even when every individual frame looks fine in
isolation.

The fix is not a better prompt. It's a **rig**: a fixed skeleton (bone
lengths that never change) posed by **angles** (for arms/head — forward
kinematics) and **ground-relative foot targets** (for legs — inverse
kinematics, solved analytically). An agent using this skill never invents
coordinates; it picks or blends poses from a small library, and the rig's
math guarantees the anatomy and ground contact stay correct. Full
derivation, including the exact bugs this caught and fixed while building
it, is in `references/rig-architecture.md`.

## What you get

- A working rig in **one file**, `assets/starter.html` — open it, it
  plays (autoplay + loop), no build step, no server required.
- **FK arms/head, IK legs.** Arms are posed with simple shoulder/elbow
  angles. Legs are posed with a foot *target point* relative to the
  ground line; the rig solves the thigh/knee angles that reach it exactly
  — a foot specified this way cannot float or clip through the ground.
- **A deterministic, foot-locked walk cycle.** `gaitFoot()` is a pure,
  closed-form function of time that keeps the planted foot's world
  position fixed while the body walks over it (no sliding) and arcs the
  swinging foot forward. Scrub to any time, it's correct; no simulation,
  no accumulated state.
- **A small pose library** (`POSES` in the starter): stand, wave, point,
  cheer, crouch, jump-peak. New poses are angle/target presets, not new
  code.
- **Named character variants** (`CHARACTERS` in the starter): color
  presets (`classic`, `red`, `white`) plus a `woman` preset that layers a
  skirt + ponytail on the exact same skeleton — no separate pose library
  or rig needed per character. See `references/characters.md`.
- **A verification script** (`scripts/snap.mjs`, optional, needs Node +
  a local Chrome/Edge) that screenshots key seconds and automatically
  checks that stance-phase feet sit exactly on the ground line.

## Hard rules (checkable, not vibes)

1. **Never author a leg with a raw thigh/knee angle.** Legs are always
   posed via `footLdx/footLdy/footRdx/footRdy` (offsets from the ground
   line) fed through `solveLegIK()`. This is the rule that prevents
   floating/sliding feet — see `references/rig-architecture.md`.
2. **Every pose field is a flat number.** Never nest an object inside a
   pose (`footL: {dx, dy}` breaks GSAP tweening silently — see the same
   reference doc). Use `footLdx`/`footLdy` etc.
3. **Never reassign a tweened state object.** Mutate `S.pose` in place
   (`tl.set(S.pose, {...preset}, atTime)`), never `S.pose = {...preset}`
   — reassignment detaches every tween built against the old reference
   and freezes the figure with no error thrown.
4. **Bone lengths (`BONES`) never change during an animation.** Restyling
   proportions (chibi, heroic, etc.) happens once, before building scenes
   — see `references/anatomy.md`.
4b. **Character variants (color, skirt, ponytail, ...) are decoration on
   top of the skeleton, never a second rig.** Switch/add characters via
   `CHARACTERS` and `drawAccessories()` — never by forking the pose
   library or the FK/IK math per character. See
   `references/characters.md`. If an accessory element needs to be
   visible for a given character, explicitly set that in the styling
   block; don't rely on whatever the SVG markup's default happens to be.
5. **Everything is a pure function of time.** No `Math.random()`, no
   `Date.now()`, no per-frame accumulation in the render path — so
   `?debug=1` scrubbing is exact and nothing drifts on repeated loops.
   The walk cycle in particular relies on this: see the foot-lock proof
   in `references/rig-architecture.md`.
6. **A walk/run's `speed` parameter must match however fast the hip is
   actually being translated.** If you add a scene where the body moves,
   derive the movement tween's duration from the gait speed (or vice
   versa) — never pick them independently. This is the one way the
   foot-lock guarantee can silently break; `scripts/snap.mjs` catches it.

## Workflow

1. **Figure out what's being asked**: a single pose/reaction (wave,
   point, cheer) vs. a locomotion cycle (walk, run) vs. a full scene with
   several beats. This changes how much of the pose library you need vs.
   how much gait tuning is involved.
2. **Copy `assets/starter.html`** as the base for the new deliverable —
   don't start from a blank file. It already has the rig, the render
   loop, the scrub UI, and a working demo timeline (idle → wave → crouch
   → walk → jump → cheer) to crib patterns from.
3. **Reuse or extend the pose library** (`references/poses.md`) before
   writing new poses from scratch. If a new pose is needed, follow the
   "Adding a new pose" checklist there — it exists specifically to keep
   new poses from reintroducing floating-foot or nested-object bugs.
4. **For any locomotion (walk/run/etc.)**, read the foot-lock derivation
   in `references/rig-architecture.md` before touching `WALK` or
   `gaitFoot()`. Tune `T`/`duty`/`speed`/`stepHeight`, don't rewrite the
   formula.
5. **Blend poses with `poseTween()`** (`tl.to(S.pose, {...target,
   duration, ease}, at)`), driven by one GSAP timeline, one `frame(t)`
   function reading `tl.time()` — mirror the existing demo's structure
   rather than inventing a second render path.
6. **Verify before delivering.** Either run `node scripts/snap.mjs`
   (needs Node + `npm install puppeteer-core --no-save` once, and a local
   Chrome/Edge install) or open the file with `?debug=1` and scrub by
   hand through every new pose transition, checking specifically: do feet
   ever float above or sink below the ground line? Does any limb look
   longer/shorter than in neighboring frames (it shouldn't be possible,
   but check anyway)?
7. **Deliver one `index.html`** (copy/rename the finished starter) that
   opens directly via `file://` — no server, no build step, no missing
   asset paths. Mention `?debug=1` for scrubbing if the user wants to
   inspect it.

## Layout

```
SKILL.md                       this file — rules & workflow
references/
  rig-architecture.md          FK/IK math, foot-lock derivation, GSAP gotchas — read before editing rig code
  anatomy.md                   proportions, restyling, line style, mirroring, multiple figures
  poses.md                     the pose library, how to blend/add poses, walk→run tuning
  characters.md                named color/accessory presets (classic/red/white/woman), adding new ones
  techniques.md                secondary motion, polish, known pitfalls
assets/
  starter.html                 the rig + a working demo timeline — copy this, don't start blank
scripts/
  snap.mjs                     optional verification: screenshots + automatic foot-lock check (needs Node + puppeteer-core + local Chrome/Edge)
package.json                   optional-dependency declaration for scripts/snap.mjs
```

## Requirements

| To… | You need |
|---|---|
| Watch the result | a browser + internet (GSAP loads from CDN). Nothing else. |
| Verify automatically | Node + `npm install puppeteer-core --no-save` + a local Chrome or Edge install |
| Scrub by hand instead | nothing — open with `?debug=1`, no Node required |

A delivered `index.html` never requires `npm install` to be *watched*;
Node is only for the optional verification tooling.
