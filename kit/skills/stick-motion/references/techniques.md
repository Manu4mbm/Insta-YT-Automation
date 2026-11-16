# Polish techniques & pitfalls

## Secondary motion already built into the rig

- **Arm counter-swing**: `renderWalk()` drives `shoulderL`/`shoulderR`
  with `sin()` at the opposite phase of the legs — this alone is most of
  what makes a walk cycle read as "alive" instead of "shuffling." Keep
  arms swinging opposite the same-side leg (right leg forward → left arm
  forward) for any new locomotion pose.
- **Hip bounce**: small, cosmetic, decoupled from correctness (see
  `rig-architecture.md`). Don't be afraid to exaggerate it for a bouncier
  character personality — it cannot break foot placement.

## Secondary motion worth adding yourself

- **Head lag / overshoot**: delay the head's rotation slightly behind the
  torso's (tween `pose.neck` on a short delay, or with a slower ease, than
  `pose.torso`) so the head "catches up" a beat after a sharp torso turn.
  Cheap, and one of the highest-leverage "this doesn't feel robotic"
  fixes for any FK chain.
- **Squash & stretch on landing**: on a jump landing frame, briefly scale
  the whole `#figure` group down vertically (~90%) and slightly out
  horizontally for 2-3 frames, then back to 100% — classic animation
  weight cue, applied as a plain CSS/SVG transform on the group, entirely
  separate from the skeletal pose.
- **Foot roll**: `footBendL/footBendR` already exist for this — flat
  (~`-90°`) during stance/contact, lifted (~`-60°`) during swing (toes
  trailing up) is what the walk cycle does by default. For a more
  deliberate heel-strike/toe-off read, add a third sub-phase inside stance
  that eases `footBend` from heel-down to flat to toe-up as the stance
  foot rolls forward under the body.

## Ground contact — the check that actually matters

The single biggest tell that a stick-figure animation is AI-generated
rather than hand-tuned is a foot that floats above or slides across the
ground. This rig makes that structurally hard to get wrong (see the
foot-lock derivation in `rig-architecture.md`), but it is *not* impossible
to break:

- If you ever author a leg pose with a raw thigh/knee angle instead of a
  ground-relative foot target, you've reintroduced the failure mode this
  rig exists to prevent. Don't.
- If you change `WALK.speed` without also changing (or re-deriving) the
  hip tween's actual px/s, the foot-lock guarantee silently breaks — no
  error, just a periodic sliding drift that gets worse every cycle. Run
  `scripts/snap.mjs` after any change to gait parameters; it fails loudly
  if this happens.

## Known cosmetic rough edge

At a very small render scale, the neck bone's rounded stroke cap can peek
out very slightly past the head circle's edge when `neck` and `torso`
angles are both exactly 0 and stroke widths are large relative to
`HEAD_R`. Harmless, barely visible at normal video resolutions, and an
easy fix if it bothers you for a particular style: draw the head circle
*after* the neck line in the SVG (it already is, in the shipped starter)
and/or increase `HEAD_R` slightly relative to `NECK` length so the circle
fully swallows the cap.

## Pitfalls that have already cost real debugging time

Keep these front-of-mind before changing the rig math — all four were
real bugs in this rig's own construction, none of them threw an error,
all four produced a figure that still "ran" but looked wrong:

1. **GSAP does not tween nested object properties.** `{footL: {dx, dy}}`
   silently fails to interpolate. Keep every pose field a flat number.
2. **Never reassign a tweened object; mutate it with `tl.set()`.**
   Reassigning (`S.pose = {...newPose}`) detaches every tween that was
   built against the old reference — the figure freezes at whatever pose
   was live at the moment of reassignment, with no error.
3. **2-bone IK sign errors don't crash, they fold the limb the wrong
   way.** If you touch `solveLegIK()`, re-verify by hand: pick a target,
   independently compute a knee position from a chosen thigh angle, check
   the resulting shin actually reaches the target within a fraction of a
   pixel. A wrong sign still returns real numbers; only the resulting
   shape reveals the mistake.
4. **`footBend` sign determines which way the toe points, and a wrong
   sign looks like a foot bent backward (a little like a flipper/hook)
   instead of a flat foot pointing the way the figure is walking.** The
   shipped presets use `footBendL/footBendR: 90` (stance, toe forward)
   and `60` (swing, toe lifted) for exactly this reason — `-90`/`-60`
   point the toe *behind* the ankle, against the direction of travel.
   This one is easy to miss because the leg still reaches the correct
   ankle position (that part is IK-guaranteed); only the cosmetic foot
   segment is backward, so it can look like a minor rendering glitch
   rather than a real bug. It isn't — always sanity-check which way the
   toe segment points relative to `facing` after changing any
   `footBend*` value.

## Restyling ideas that don't touch the rig math

Because pose data is always angles + ground-relative targets, none of the
following need any change to `render()`, `solveLegIK()`, or `gaitFoot()`:

- Multiple stroke colors per bone group (e.g. a different color for
  limbs vs. torso) — just give each `<line>` its own `stroke` instead of
  the shared loop in the starter.
- A shadow/silhouette pass: duplicate the figure group, offset it, fill
  black at low opacity, render behind the real figure.
- Trailing "motion lines": keep the last N frames' hand/foot world
  positions (returned by `render()`) and draw fading line segments
  between them for a speed-lines effect on fast motions.
