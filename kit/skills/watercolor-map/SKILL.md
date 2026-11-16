---
name: watercolor-map
description: "A painted watercolor world map: a pin drops on the start city, a plane flies the real great-circle route, and the destination washes in with colour. Use when the user runs /watercolor-map or asks for this edit, with two places, like “Bengaluru → California”."
metadata:
  category: Animated videos
---

# /watercolor-map

**Input:** two places, like “Bengaluru → California”

## What it does
 A painted watercolor world map: a pin drops on the start city, a plane flies the real great-circle route, and the destination washes in with colour.

## Steps
1. Set up a Remotion project with d3-geo, topojson-client and world-atlas.
2. Fit a map projection around the route and paint every country as an uneven watercolor wash using SVG turbulence, displacement and edge-pooling filters, with paper grain on top.
3. Draw the great-circle route with d3's geoInterpolate and fly a small plane along it, turned to its heading, leaving a dashed red trail.
4. Camera: start close on the first city, zoom out to follow the plane, then zoom into the destination.
5. Add handwritten labels for both places, a running km counter, and an end title card.

## Every time it runs
- Build it in Remotion. Animate only with useCurrentFrame() and interpolate(), never CSS animations.
- Use real map data (world-atlas) and the real great-circle route, never a hand-drawn line.
- Show me 5 stills across the video before the full render.
- Render 1920×1080 at 30 fps, and a 1080×1920 version if I ask.

## In this studio (buildwithvijay.ai)
- Prefer the reel-studio engine for rendering: Remotion project per reel + the kinetic-reel timing scripts (MMS_FA forced alignment, chunked for long audio). Plain HTML canvas + ffmpeg is fine when Remotion is overkill.
- Solid colours by default (Vijay dislikes heavy gradients/sci-fi looks unless asked); captions Hinglish, brand handle @buildwithvijay.ai.
- Characters, logos and scenes must be original or Vijay's own. Do not redraw copyrighted characters, film scenes or brand mascots; use only audio Vijay has the rights to.
- Deliver 1080x1920 MP4 (loudnorm -14 LUFS) + cover.jpg; facts about AI tools must be checked against current sources.
