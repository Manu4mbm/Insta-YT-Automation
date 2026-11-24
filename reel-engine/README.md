# Reel engine — India by Bharat

One reusable engine for every reel. A new reel = **one JSON spec** (`specs/<slug>.json`) + one voice file.
No new animation code is needed unless a story needs a brand-new scene (then add it to `src/engine/scenes.tsx` so the library grows).

## Pipeline (per reel, made the day before it posts)
1. Script (Hindi, 35–42 s narration; numbers written as words) + cited facts → **owner approval**.
2. ONE ElevenLabs take: voice "Ajay – Engaging Documentary Narrator" (`YBBkra773die41zqs6qu`), model `eleven_v4`. Save as `voice/<slug>.mp3`.
3. `python3 tools/voice.py voice/<slug>.mp3 <slug>` → `public/<slug>.wav` + word timings, prints `voiceEnd`.
4. Write `specs/<slug>.json` (schema below) using those timings: one shot per phrase, 1.5–3 s each.
5. Preview stills: `npx remotion still src/index.ts Reel out/f.png --props=specs/<slug>.json --frame=120`.
6. `bash tools/render.sh specs/<slug>.json` → `out/<slug>.mp4` (+ `-silent.mp4`).
7. `python3 tools/cover.py specs/<slug>.json` → `out/<slug>-cover.jpg`.
8. Owner approval → copy mp4 + cover to `../public/media/`, push, verify with ffprobe, insert rows in Supabase `posts`, `yt_posts`, `x_posts` (13:30 IST).

Setup on a new machine: Node 20+, FFmpeg, Google Chrome, Python 3 with `pip install faster-whisper numpy`; then `npm install` in this folder.

## Spec schema
```jsonc
{
  "slug": "yoddha-ep2-abbakka-part1",
  "theme": "yoddha",            // yoddha | twist | rajasthan | defence | travel
  "series": "भारत के योद्धा", "badge": "EP 2 · PART 1",
  "voice": "yoddha-ep2-abbakka-part1.wav",   // in public/ (omit for text+music reels)
  "voiceEnd": 37.4, "endCard": 3,
  "captions": [[0.0, "पहली पंक्ति"], [1.6, "दूसरी पंक्ति"]],   // phrase start times from voice.py
  "keywords": ["अब्बक्का", "1555"],                          // shown in gold in captions
  "shots": [ { "a": 0, "b": 1.6, "type": "title", "text": "रानी अब्बक्का", "impact": true }, ... ],
  "end": { "top": "PART 2 · कल 1:30 PM", "title": "…", "sub": "…" },
  "cover": { "top": "भारत के योद्धा · EP 2", "headline": "line1\n*gold line*", "chip": "ULLAL · 1555", "bottom": "रानी अब्बक्का", "sprite": "fort" }
}
```
Text markup everywhere: `*gold*`, `_accent_`, `~red~`.
Common shot keys: `a`, `b` (seconds), `type`, `impact` (shake+flash+drum), `cam` (push | pull | panL | panR | tiltU | tiltD | dutch | still — auto-varied if omitted), `bg` (plain | embers | rays | night | dawn | black | blood | fire | water), `head` (slam headline at top), `headSub`, `stamp {text, at, color, size}`, `chip {text, at}`.

## Scene library (33 types — see `specs/_demo.json` for a working example of each)
| Type | Use | Key params |
|---|---|---|
| title | name / episode title | text, sub, style (slam/rise/blur/type) |
| slam | stacked lines slamming in | lines[], stagger |
| quote | famous line with light rays | lines[], by |
| typewriter | "कहा जाता है…" beats | text |
| year | big year, optional count-up | to, from, sub |
| counter | number counting up | to, prefix, suffix, label |
| slash | sword-cut split text | text, sub, at |
| compare | A vs B columns | left{title,rows}, right{…} |
| timeline | dated milestones | items[{y,t}] |
| bars | simple comparison bars | items[{l,v,d}], hi |
| map_india | India map, pins, routes | pins[{at:[lon,lat],label}], route[[lon,lat]…], dashed, flyTo, label |
| map_region | zoomed region (bbox) | box[w,s,e,n], river[[lon,lat]…], riverLabel, pins, arrows[{from,to}], lines[{at,label}] |
| map_world | world/region map | box, route, pins |
| fleet_attack / fleet_retreat / boat_charge / fleet_advance | naval story beats | sprite (boat/ship), enemyColor |
| night_river | night, moon, river | head |
| army_march | parallax army | cavalry, dir |
| silhouette | backlit figure | sprite (soldier/king/fort/temple…), label |
| landmark | fort/temple at dawn or night | sprite, bg, label |
| jets | fighter jets climbing | n |
| wall_build | blocks dropping + clock | clock (start hour), frac |
| dawn | sunrise reveal | stamp |
| scroll | royal order / letter | title, meta, lines[], seal |
| stone | carved inscription | text, note |
| lamp | flickering lamp (news/tension) | head |
| pulse | heartbeat, desaturate (cliffhanger) | text, sprite |
| fire | flames | text, sub |
| medal | medal / honour | label, text, sub |
| image | own / licensed / CC0 photo with Ken Burns | src (in public/), credit |

Variety rule: no scene type more than 3 times per reel; vary `cam` and `bg`; add a new custom scene type when a story needs one.
