# Pose library

Every pose in `POSES` (in `assets/starter.html`) is a **flat object**
(never nested — see `rig-architecture.md`'s GSAP gotcha) with these fields:

```js
{
  torso, neck,                          // degrees, up-reference
  shoulderL, elbowBendL,                // degrees, down-reference / relative
  shoulderR, elbowBendR,
  footLdx, footLdy, footRdx, footRdy,   // px, offset from the GROUND LINE (not the hip)
  footBendL, footBendR,                 // degrees, relative to shin
  hipDrop,                              // px, added to the standing hip height (+ = lower/crouch, - = higher/jump)
}
```

**Foot fields are always ground-relative offsets, never angles.** This is
the one rule that must not be broken when adding a pose — it is what lets
`solveLegIK()` guarantee the foot lands where you meant it to regardless of
`hipDrop`, torso lean, or anything else changing that frame.

## Shipped presets

| Pose | Use | Key idea |
|---|---|---|
| `STAND` | idle, default rest pose | feet shoulder-width apart, arms relaxed |
| `WAVE_UP` / `WAVE_DOWN` | greeting, alternate between them | only `shoulderR`/`elbowBendR` change; legs stay at `STAND` |
| `POINT` | pointing at something off-frame | arm extended, minimal elbow bend |
| `CHEER` | celebration, both arms overhead | wide stance (`footLdx/footRdx` further out) for a stable-looking base |
| `CROUCH` | anticipation before a jump, or a "ready" stance | moderate `hipDrop`; feet stay under the hip so the IK doesn't have to fold the knee to its limit (see the anatomy warning below) |
| `JUMP_PEAK` | apex of a jump | negative `hipDrop` (hip rises), feet tucked up (negative `footLdy/footRdy`, i.e. above the ground line) |

## Blending between poses

Tween the *same* persistent pose object with GSAP — never replace it (see
the GSAP gotcha in `rig-architecture.md`):

```js
function poseTween(at, dur, target, ease='sine.inOut'){
  tl.to(S.pose, {...target, duration:dur, ease}, at);
}
poseTween(0.5, 0.4, POSES.WAVE_UP);
poseTween(0.9, 0.3, POSES.WAVE_DOWN);
```

Every field not mentioned in `target` keeps easing from wherever it
currently is toward... nothing — GSAP only tweens fields you pass, so if
`target` omits a field, that field freezes at its current value instead of
returning to a baseline. In practice this means: **always pass a complete
pose object**, not a partial one, unless you deliberately want a field to
hold still while others move.

## A crouch depth warning (why the shipped `CROUCH` doesn't drop very far)

If `hipDrop` gets large enough that the hip-to-foot-target distance drops
close to the shin length alone (`BONES.SHIN`), the 2-bone IK solver still
returns a mathematically valid answer, but it is a very sharply bent knee
positioned oddly far from the body — anatomically it reads as "kneeling
strangely" rather than "crouching." This isn't a bug (the target is still
reached exactly), it is a real geometric limit of a 2-bone leg: a deep
crouch needs the ankle to also rotate under the hip somewhat, not just the
knee to fold. Keep `hipDrop` moderate (roughly `< 0.3 × (THIGH+SHIN)`) for
a "ready to jump" crouch; if you want a true deep squat or sit pose, widen
the stance (`footLdx`/`footRdx` further from center) so the hip-to-target
distance stays comfortably above `SHIN` alone.

## Walk / run tuning (`WALK`)

```js
const WALK = { T, duty, speed, stepHeight, hipBaseY, bounce };
```

| Field | Meaning | Walk default | To make it a run |
|---|---|---|---|
| `T` | seconds per full gait cycle (both legs) | 0.72 | shorter (~0.4-0.5) — faster cadence |
| `duty` | fraction of the cycle each foot is planted | 0.62 | lower (~0.35-0.45); below 0.5 both feet leave the ground at once for a real flight phase |
| `speed` | px/s the hip travels — **must match the hip tween's actual speed**, see `rig-architecture.md` | 200 | higher |
| `stepHeight` | px the swinging foot lifts | 26 | higher (~45-60) |
| `bounce` | px of cosmetic hip bob, purely visual | 8 | higher, plus more forward torso lean in `renderWalk()`'s pose |

Nothing else needs new math — a run is a walk with different numbers, not
a different algorithm.

## Adding a new pose

1. Start from the nearest existing preset (copy it).
2. Only ever set leg fields as `footLdx/footLdy/footRdx/footRdy` relative
   to the ground line — never compute or guess a thigh/knee angle.
3. Keep every field a flat number.
4. If the pose involves the hip leaving standing height (jump, sit,
   kneel), use `hipDrop`, not a change to `GROUND_Y` or `WALK.hipBaseY`.
5. Sanity-check with `scripts/snap.mjs` or `?debug=1` + the scrub bar
   before wiring it into a timeline — a typo'd sign on `footLdy` (positive
   instead of negative for "foot above ground") is the most common mistake
   and is instantly obvious as a foot buried in or floating far above the
   ground line.

## Poses worth building next (not shipped, same rules apply)

- **Sit**: wide-set feet, `hipDrop` large, torso angled back slightly,
  hands resting on knees (short elbow bend, shoulder angle pointing
  toward the thigh).
- **Kick**: one foot target swung far forward and slightly up
  (`footRdy` negative, `footRdx` large), opposite leg's `footLdy=0` planted,
  torso leaned back for counterbalance.
- **Sit-to-stand or fall**: this is just `poseTween()` between `STAND` and
  a low `hipDrop` pose with a bouncier ease (`bounce.out`, `elastic.out`)
  — no new mechanism needed, only new keyframes.
