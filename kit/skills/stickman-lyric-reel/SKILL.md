---
name: stickman-lyric-reel
description: "Emotional stickman reel synced to a song : glowing stick figure on dark/flat scenes, one visual metaphor per lyric line, pose + expression changes on the words, karaoke captions. Use when the user sends a song for a stickman/stick-figure reel."
metadata:
  sources: "rig math from cafermutluozkan/stick-motion (MIT); pose/expression ideas from bassimeledath/stix; direction rules from kaomei/stickman-video-director + advibly stickman-animation; emotion→atmosphere map from zrt-ai-lab video-stickfigure"
---

# /stickman-lyric-reel

Kit: `studio/stickman-kit/` (Remotion). Files:
- `src/rig.ts` — skeleton (fixed bone lengths), FK arms/torso/head, analytic 2-bone IK legs, foot-locked `gaitFoot`/`walkPose` (WALK, RUN, custom sad walk), `POSES` library (26), `poseAt(t, keys)` blending, `alive()` breathing/sob shake, `mix()`.
- `src/Stickman.tsx` — renders a figure: color, width, glow, face (none/neutral/happy/sad/surprised/cry/sleep/angry), headFill, accessory (ponytail/cap), facing, scale.
- `src/Props.tsx` — glowing line-art props: Ground, RoadPerspective, Bus, Clock, City (flip), Sun, Moon, Stars, Rain, Fall (petals/leaves), Dust, StreetLamp, Bench, Bed, Door (open), Heart (crack/split), Phone (buzz), Tree (bare/leafy), Stairs, Balloon, Cloud, Halo (red spotlight disc), Zzz, Thought bubble, Chain (break), Mountain. Put `<GlowDefs/>` once per svg.
- `src/FX.tsx` — `Camera` (keyframed zoom/pan/rot + drift + impact shake), `Scene` with transitions (fade, black, iris, flip, slideUp, zoomThrough, flash, cut), `Karaoke` (word-timed line), `Vignette`, `Grain`.
- `src/Type.tsx` — kinetic lyrics: `Lyric` (styles rise/type/stamp/hand; fonts sans/serif(Playfair)/hand(Caveat)/cinema(Bebas); per-word meaning fx: glow, big (serif + underline sweep), flip, crack, fall, shake, fade, heart, stretch, whisper) and `Title` (staggered letter stamp for chorus hits).
- v2 motion: `EASE` presets (soft, snap, anticipate, heavy, settle) on pose keys; `track()` = poseAt + head lag + forearm follow-through; `squash()` impact squash/stretch → `sq` prop. New poses: WIPE_TEARS, CLUTCH_CHEST, OFFER_HAND, CALL_OUT, SIT_BENCH_SAD, LOOK_BACK, FALL_FORWARD.
- v2 Stickman: blink, brows by emotion + `intensity`, trembling mouth, tear streams (cry/hurt), faces hope/hurt, continuous `facing` (-1..1) for turning, `glowColor` rim light, `shadow`, `reflect` (puddle), `sq`.
- v2 atmosphere: Skyline (parallax depth + camX), Splashes, LightRays, Bokeh, Fog, WindowRain, PhotoFrame (memory polaroid with a mini scene inside).
- v3 (2026-10-25): KNEE FIX — default IK knee sign is -1 (knee bends forward like a human); `kneeFlip:1` only reverses it (almost never). `footBend*` is now an ABSOLUTE angle (90 = flat forward on ground, -95 = toes back when kneeling). Standing emotional poses keep hipDrop ≤ 4 and feet ≥ ±22 apart so legs never overlap into a "Z".
- `Stage3D` + `Layer` (FX.tsx): real CSS 3D camera — keys {at, rx, ry, rz, z (dolly), x, y} with smootherstep (zero-velocity at keys) + drift + impact shake; put scene parts on depth layers (far sky z≈-1100, skyline -650/-300, figure 0, rain/particles +200..+260). A Layer can rotate itself (`rx`) e.g. the world flipping over in 3D.
- `Madhubani.tsx`: MB palette, MBDefs patterns (hatch, dots, scales, waves), MBorder (animated triangle-band frame), MSun (face + petal rays), MFish, MTree (tree of life, grows), MPeacock (tail opens), MLotus (opens), MGround. Stickman `outline` = Madhubani double-line look. Use for memory / folk / rebirth beats; mix 1–2 Madhubani scenes into a glow-noir reel, don't overdo.
- `src/DemoV3.tsx` — 19 s CURRENT reference (3D orbit rain city → Madhubani memory painting swinging in 3D → patterned heart crack with camera roll → 3D world flip → crane-up Madhubani dawn). Start new reels from this.
- `scripts/render-chunks.sh <Comp> <frames> <audio> <out>` — resumable chunked render for full songs (4–5 min), then cut reel clips with ffmpeg.
- `src/DemoV2.tsx` — 18.5 s best-practice reference (rain city → memory polaroid with 2 characters → heart crack → world flips → dawn). Start every new reel from this. `src/Demo.tsx` = v1. `src/PoseSheet.tsx` — visual check of every pose.

## Rules that keep it from looking AI-broken
1. Never hand-draw limbs. Pick/blend poses; legs only via foot targets (IK). `kneeFlip:1` for sitting / kneeling / knees-up.
2. Walking: hip x speed MUST equal `gait.speed * scale` (foot-lock). Sad walk = `{...WALK, T:1.15, speed:105, stepHeight:12, arm:10}` + `mood:1`.
3. Every pose hold gets `alive()` (breath); crying gets `sob`. Head leads emotion (neck angle), hands second.
4. One metaphor per lyric line, a visual change every 1.5–3 s, max 3 accent colours (warm orange = memory/hope, red = pain, blue = loneliness/night) on a dark (#0E0E10) or flat orange canvas.
5. Each scene ends on a state the next inherits (pose, direction, shape filling frame) — match cuts, flips on "palat/ulta", iris on dreams, black on endings.
6. Karaoke OUTSIDE `Camera`. Figure scale 1.4–1.8 for reels (big, readable on phone); keep text out of top 250 px / bottom 420 px.
7. Everything is a pure function of time (seeded randomness only).
8. Typography reacts to meaning: pick ONE fx word per line (the emotional word), others plain; font by mood (hand = intimate, serif = memory/romance, sans stamp = pain/impact, cinema = world-changing). Lyrics at y≈300 (top third), outside Camera.
9. Use `track()` (not bare poseAt) for any visible pose change; `anticipate` for reaching/throwing, `heavy` for collapsing, `settle` for hopeful rises, `snap` for shocks.
10. Every scene: at least one moving atmosphere layer (rain/fog/bokeh/dust/rays) + one parallax or camera move + figure shadow/reflection — never a flat static frame.

## Workflow (per song)
1. Audio in → `ffmpeg` 16 kHz mono → faster-whisper word timestamps (internal, for timing + meaning only) + librosa onsets/beat grid for cut points.
2. Lyrics on screen: ONLY if the song is the user's own / original (or they confirm rights). For released film/label songs, do not write or display lyric text — sync visuals to the vocal phrases and use short original captions/emotion words instead. Instagram may also mute copyrighted audio on API posts → prefer adding the song from IG's music library manually.
3. Storyboard table: line time → emotion → metaphor scene → poses (keys on the stressed words) → props → camera → transition out. Use the emotion map below.
4. Build in Remotion (copy Demo.tsx structure), contact sheet of stills → fix → full render (`--concurrency=2`) → loudnorm −14 → cover.
5. Caption carries the "how it's made" line + guide keyword (never inside the reel).

## Emotion map (pose · props · colour · camera)
| Emotion | Poses | Props / atmosphere | Colour | Camera |
|---|---|---|---|---|
| Loss / missed chance | RUN → REACH_OUT → SAD | Bus/train leaving, red tail-light line | red accent on dark | push-in + shake on stop |
| Loneliness | sad walk, SIT_HUG_KNEES | street lamp, rain, bench, moon | blue/night | slow pull-back (figure gets small) |
| Dream / denial | LIE + sleep face | red Halo, Zzz, Bed, Clock spinning | red disc | zoom-out from close |
| Time passing | STAND idle | Clock spin, Fall leaves, Tree bare→leafy | gold | slow rotate |
| Life flipped | KNEEL_DESPAIR (sob) → LOOK_UP | City rotates 180° | flat orange + dark ink | flip transition |
| Heartbreak | HAND_ON_HEART → HEAD_IN_HANDS | Heart crack → split | red | hold, then shake |
| Burden / struggle | BURDEN, PUSH, sad walk uphill | Chain, Stairs, Mountain, Rain | grey | low angle |
| Lie / betrayal | ANGRY → turn away (facing flip) | Phone buzz, Door closing | red | whip pan |
| Hope / rise | LOOK_UP → REACH_UP → CHEER | Sun rising, Fall petals gold, Door open light | warm | pull back + tilt up |
| Memory | THINK | Thought bubble with mini scene, Balloon | warm orange | iris in |
