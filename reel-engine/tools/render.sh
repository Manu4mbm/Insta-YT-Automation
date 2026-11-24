#!/usr/bin/env bash
# Render a reel from its spec:  bash tools/render.sh specs/<slug>.json
# Output: out/<slug>.mp4 (Instagram/YouTube-safe 1080x1920, 30 fps, AAC) and out/<slug>-silent.mp4
set -euo pipefail
SPEC="$1"; SLUG=$(basename "$SPEC" .json); mkdir -p out
npx remotion render src/index.ts Reel "out/$SLUG-raw.mp4" --props="$SPEC" --concurrency=2 --log=error
python3 tools/music.py "$SPEC" "out/$SLUG-music.wav"
ENC="-c:v libx264 -crf 20 -preset medium -maxrate 9M -bufsize 18M -pix_fmt yuv420p -profile:v high -level 4.1 -r 30 -g 60 -flags +cgop -sc_threshold 0 -movflags +faststart"
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "out/$SLUG-raw.mp4" | grep -q .; then
  ffmpeg -v error -y -i "out/$SLUG-raw.mp4" -i "out/$SLUG-music.wav" -filter_complex "[0:a]aresample=48000,aformat=channel_layouts=stereo,asplit=2[vo][sc];[1:a]volume=0.4[m];[m][sc]sidechaincompress=threshold=0.05:ratio=4:attack=20:release=250[md];[vo][md]amix=inputs=2:normalize=0,alimiter=limit=0.95[a]" -map 0:v -map "[a]" $ENC -c:a aac -b:a 192k -ar 48000 -ac 2 "out/$SLUG.mp4"
else
  ffmpeg -v error -y -i "out/$SLUG-raw.mp4" -i "out/$SLUG-music.wav" -map 0:v -map 1:a $ENC -c:a aac -b:a 192k -ar 48000 -ac 2 -shortest "out/$SLUG.mp4"
fi
ffmpeg -v error -y -i "out/$SLUG.mp4" -f lavfi -i anullsrc=r=48000:cl=stereo -map 0:v -map 1:a -c:v copy -c:a aac -shortest "out/$SLUG-silent.mp4"
echo "done: out/$SLUG.mp4 ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "out/$SLUG.mp4") s)"
