---
name: reel-map
description: "Make a 9:16 narrated map-animation reel (a tilted vintage war map on a dark table: real coastlines, rivers and mountains; armies, war elephants and fleets marching along glowing routes; territories spreading; battles clashing; a camera that glides and follows) for the user's channels, end to end - topic ideas, research, script and map/scene table for approval, map baking, voice, scenes, captions, music, render. Use when the user says /reel-map, or asks for a map animation, war map, battle map, invasion/campaign route, empire expansion, partition map, trade route or 'how X conquered Y' reel, or a reel 'like the map animation one'."
---

# Map animation reel

**Look:** a big map lying tilted on a dark table (teal sea, olive parchment land, pale coastal halo, hachured
mountains, spaced serif labels, ringed towns), seen through a camera that never stops. Little upright figurines
(infantry blocks with flags, war elephants, cavalry, longships, tanks, planes) march along routes leaving glowing or
dashed trails; regions spread out in faction colours; rivers light up on their word; battles clash with swords,
shock rings, smoke and camera shake. Big yellow hook title, parchment date badge, counting number cards, engraved
captions in the lower third, parchment comment card at the end.
**Best for:** battles and campaigns, invasions, empires rising and falling, partition and borders, explorers and trade
routes (India by Bharat); shipping lanes, pipelines, chokepoints, oil and gas fields, wars and the economy
(Protech Synergy, usually with the `atlas` theme).

Before writing anything, read `C:/Users/Admin/Reels/map-reels/STYLE.md`: it has the look, the script shape,
`maps.json` and the baker, the `MapKit` API and the rules. Follow the `/hyperframes` contract for any edit.
The sample to copy from is `C:/Users/Admin/Reels/map-reels/reels/alexander-porus` (6 scenes, 2 maps).

## Steps

1. **Topic.** If none was given, offer 8 to 10 map stories that suit the look: title, one-line hook, and the map
   moment it gives (the march, the river, the clash, the spreading empire). Research the chosen one with web search
   and write `SOURCES.md`: dates, places with lon/lat, routes, numbers with the source that gives them. Mark legends
   and disputed numbers as such.
2. **Ask once** (AskUserQuestion): language (English, Hindi or Hinglish), voice (narrator D, the MKD clone, or the
   user's own recording), channel (India by Bharat or Protech Synergy, for the follow line) and theme (`war`,
   `parchment` or `atlas`) if the topic leaves it open.
3. **Script and scene table, for approval.** 5 to 8 lines, 30 to 45 s, in the STYLE.md shape. For each line show
   the words (with English meaning if not English), which map and where the camera is, what moves (units, routes,
   regions, rivers), the beat on the key word, and on-screen text (title, badge, counter). Say which borders are
   hand-drawn historical ones. Wait for approval.
4. **Build.**
   - `bash C:/Users/Admin/Reels/_shared/tools/new_reel.sh map-reels <slug>`, then work inside that folder.
   - Write `reel.json` (same shape as the sample) and start the voice in the background:
     `python ../../../_shared/tools/vo.py reel.json assets/vo` (VoiceStudio: check `curl -s localhost:3900/health`
     first; about 7 min a line on CPU, so start it before anything else).
   - Make the music bed meanwhile: musicgen venv `music.py assets/bgm/bed.wav "epic ancient war documentary score, slow deep war drums, low strings ostinato, distant horns, tense and cinematic, no vocals"` (calmer prompt for trade/economy topics).
   - Write `maps.json` (one wide map for the journey, one close map for the battle is the usual pair), run
     `node ../../tools/bake.mjs` (`--list <name>` to find country/state/river names), and put one
     `<script src="assets/maps/<id>.js">` per map in `index.html`. Check the baked `places` px values when placing
     units across a river.
   - Write `compositions/s1..sN.html` from the scene table with `MapKit`, hosts in `index.html` (one per line,
     `data-lines`). Snapshot while the voice records: `~/.cache/hyperframes/hf snapshot --at <times>`.
   - When the voice is done: check the words (`heard.py` or VoiceStudio transcription), run
     `python ../../../_shared/tools/place.py`, retime each scene's beats to `timing.json`, and add an impact sfx on
     each clash between the `sfx` markers in `index.html` (place.py keeps them).
   - `hf check`, then `hf snapshot --at <a time in every scene and on every beat>`; read the contact sheet and fix.
5. **Preview** in the browser pane (a `launch.json` entry running `hf preview --no-open --foreground --port 3012 <reel>`
   through `C:/Program Files/Git/bin/bash.exe -c`) and show the user.
6. **Render** after approval: `bash ../../../_shared/tools/finish.sh <slug>` (−14 LUFS). Write `POST.md`: hook
   caption, the story in 2 to 3 lines, sources, a map-data credit ("Map data: Natural Earth"), the comment question,
   6 to 8 hashtags.

## Keep it true to the look
- Every shot moves: a camera glide, follow or drift on every scene plus at least one moving thing.
- Real geography always (baked coastlines and rivers); historical borders hand-drawn and named as approximate.
- The place or number in the line lights up on its word (river trace, city pop, counter, mark).
- Units stand upright and sit above their anchors; keep markers ~150 px off a unit.
- Captions in the lower third; keep titles/badges above y 600 and the action around y 900 to 1300.
- Scene 1 is the thumbnail: both sides, the big title and the lit landmark at frame 0.
- Indian rulers, faiths and peoples are shown with respect; never present one side's propaganda as fact.
