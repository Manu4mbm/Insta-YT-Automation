#!/usr/bin/env bash
# 20s ad cut: ./cut.sh out/final.mp4 out/final-20s.mp4 "0-7.6" "30.2-40.6" "61.5-69.07"
# Pick cut points INSIDE silences (see timing/report.md gaps).
set -e; IN=$1; OUT=$2; shift 2; L=$(mktemp); i=0
for r in "$@"; do a=${r%-*}; b=${r#*-}; ffmpeg -hide_banner -loglevel error -y -ss $a -to $b -i "$IN" -c:v libx264 -crf 18 -c:a aac -ar 44100 "${L}_$i.mp4"; echo "file '${L}_$i.mp4'" >> $L.txt; i=$((i+1)); done
ffmpeg -hide_banner -loglevel error -y -f concat -safe 0 -i $L.txt -c copy "$OUT"; echo "→ $OUT"
