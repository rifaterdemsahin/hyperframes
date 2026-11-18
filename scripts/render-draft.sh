#!/usr/bin/env bash
# Builds the first draft end to end and prepares what the site shows. Usage: scripts/render-draft.sh
#   1. generate the Hyperframes project from script/scenes.json   2. npm run check (summary saved)
#   3. render the 1080p draft with sound (local)                  4. make a light 960x540 web copy + one frame per scene
#   5. write draft/meta.json (read by scripts/build-first-draft-page.mjs)
set -euo pipefail
cd "$(dirname "$0")/.."
node scripts/build-video.mjs
mkdir -p draft/frames video/renders
( cd video && npm run check -- --no-cache 2>&1 | grep -v -E 'check: |INFO' > ../draft/check.txt || true )
CHECK_LINE=$(grep -E "error\(s\)" draft/check.txt | awk '{e+=$2; w+=$4} END {printf "%d errors, %d warnings", e, w}')
s=$(date +%s)
( cd video && npx -y hyperframes@0.9.67 render --quality draft --output renders/first-draft.mp4 > ../draft/render.log 2>&1 )
RENDER_S=$(( $(date +%s) - s ))
ffmpeg -y -loglevel error -i video/renders/first-draft.mp4 -vf scale=960:540 -c:v libx264 -crf 29 -preset medium -c:a aac -b:a 64k -movflags +faststart draft/first-draft.mp4
jq -r '.scenes[] | "\(.id) \(.start + ([.duration * 0.45, 5.5] | min))"' script/scenes.json | while read -r id t; do
  ffmpeg -y -loglevel error -ss "$t" -i video/renders/first-draft.mp4 -frames:v 1 -vf scale=640:-1 -q:v 4 "draft/frames/$id.jpg"
done
jq -n --arg check "$CHECK_LINE" --argjson render "$RENDER_S" \
  --argjson full "$(stat -f%z video/renders/first-draft.mp4)" --argjson web "$(stat -f%z draft/first-draft.mp4)" \
  --arg dur "$(ffprobe -v error -show_entries format=duration -of csv=p=0 video/renders/first-draft.mp4)" \
  --arg date "$(date -u +%Y-%m-%d)" --arg hf "0.9.67" \
  '{check:$check, renderSeconds:$render, fullBytes:$full, webBytes:$web, duration:($dur|tonumber), date:$date, hyperframes:$hf}' > draft/meta.json
cat draft/meta.json
