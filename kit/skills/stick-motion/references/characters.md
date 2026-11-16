# Character variants

Not separate skills, one shared rig with named presets. A separate
`SKILL.md` per character (a "red-stickman skill," a "woman-stickman
skill," ...) would fragment agent-skill discovery for no benefit — the
skeleton, FK/IK math, pose library, and walk cycle are identical for every
character. Only two things ever change between characters:

1. **Stroke color** (and optionally weight/head fill).
2. **A purely decorative accessory** layered on top of the same skeleton —
   never a change to bone lengths or joint angles.

Both live in one object, `CHARACTERS`, in `assets/starter.html`, right
above `BONES`.

## Switching characters

```js
const CHARACTERS = {
  classic: { stroke:'#1b1e26', strokeWidth:9, headFill:'#1b1e26', accessory:'none' },
  red:     { stroke:'#c62828', strokeWidth:9, headFill:'#c62828', accessory:'none' },
  white:   { stroke:'#f5f6f8', strokeWidth:9, headFill:'#f5f6f8', accessory:'none' },
  woman:   { stroke:'#1b1e26', strokeWidth:9, headFill:'#1b1e26', accessory:'skirt+ponytail' },
};
const STYLE = CHARACTERS.classic; // <-- change this line to switch character
```

- `classic` — the default figure, dark stroke on the light default
  background.
- `red` — same skeleton, red stroke. Good for a "the other team" /
  "the rival" character in a two-figure scene.
- `white` — white stroke. **Pair this with a dark `#stage`/background**
  (edit the `background` in the `<style>` block, or the `#stage`
  `background`) — a white figure on the default light-gray stage is
  invisible. Good for a night scene or a dark-mode composition.
- `woman` — same skeleton, plus a skirt (covering the upper legs) and a
  ponytail (swaying off the back of the head). This is the pattern to
  copy for any new silhouette accessory — see below.

## Why accessories don't need a new pose library

`drawAccessories()` runs *after* `render()`/`renderWalk()`, reading
positions `render()` already computed (`hip`, `headCenter`, `footL`,
`footR` — all returned from `render()`). It never touches a bone length or
a joint angle. That means every existing pose (`STAND`, `WAVE_UP`,
`CROUCH`, the walk cycle, everything in `references/poses.md`) keeps
working under a `woman` character with zero changes — the skirt and
ponytail just ride along.

- **Skirt**: a trapezoid SVG `<path>` from the hip down to ~85% of the
  thigh length, tapering wider at the hem, with a small horizontal sway
  proportional to how far apart the current foot targets are (a cheap
  "the skirt isn't a rigid cone" cue, not a cloth simulation). Legs are
  still drawn underneath and will show below the hem during a stride —
  this is expected and looks correct at normal stroke weights; it is not
  worth solving with real cloth physics for a stick-figure rig.
- **Ponytail**: two small line segments anchored just behind the head
  (`headCenter` offset opposite `facing`), swaying with
  `Math.sin(2π·t/1.6)`. Driven by `t` (the same `tl.time()` used
  everywhere else), not by accumulated per-frame state — keeps it
  seek-safe like the rest of the rig.

## Multiple characters on stage at once

Each `CHARACTERS` entry is just data — nothing stops two figures with
different presets appearing together (e.g. the two-racer story in a
previous prompt: one `classic`, one `red`). Follow
`references/anatomy.md`'s "Color and multiple figures" section: duplicate
the `<g id="figure">` **and** the new `<g id="accessories">` SVG groups
with unique id suffixes, duplicate the `el`/`acc` lookup objects, and call
`render()`/`renderWalk()` + `drawAccessories()` once per figure per frame,
each with its own `STYLE` reference.

## Adding a new accessory

1. Add a preset to `CHARACTERS` with a new `accessory` tag (e.g.
   `'ponytail+cap'` — tags are just substrings checked with
   `hasAccessory('cap')`, so you can combine any number of them).
2. Add whatever SVG element(s) the accessory needs inside
   `<g id="accessories">`, and a matching entry in the `acc` lookup
   object.
3. In `drawAccessories()`, add an `if (hasAccessory('cap')) { ... }`
   block that positions the new element from arguments already passed in
   (`hip`, `headCenter`, `footL`, `footR`, `facing`, `t`) — never from a
   new angle on the skeleton itself.
4. Remember the SVG default-attribute gotcha: whatever "hidden" state you
   give a new accessory element in the markup (e.g. `opacity="0"`), make
   sure the styling block explicitly sets it to visible for presets that
   use it — it is easy to wire the drawing logic correctly and forget
   this, which makes the accessory computed correctly but invisible.

## Ideas for further accessories (not shipped, same rules apply)

- **Cap/hat**: a small triangle or arc anchored at `headCenter`, offset
  in the `facing` direction, rotating with the head/neck angle (available
  from `render()`'s `headBase`/`headCenter` if you also return the
  torso+neck angle, or approximate it from the `headBase`→`headCenter`
  vector).
- **Glasses**: two small circles or a bar, anchored at `headCenter`, offset
  slightly toward `facing` and down.
- **Backpack**: a rounded rectangle anchored at `shoulder` (returned by
  `render()`), offset behind the torso opposite `facing`.
- **Tie/scarf**: a short tapered shape hanging from `shoulder`, with a
  light sway similar to the ponytail's.
