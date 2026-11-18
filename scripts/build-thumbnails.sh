#!/usr/bin/env bash
# Renders thumbnails/thumb-*.html to 1280x720 JPGs (YouTube spec: 1280x720, under 2 MB) with headless Chrome + ffmpeg.
# The text is HTML on purpose: AI image models garble text. Usage: scripts/build-thumbnails.sh
set -euo pipefail
cd "$(dirname "$0")/.."
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
for f in thumbnails/thumb-*.html; do
  name=$(basename "$f" .html)
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --window-size=1280,720 --screenshot="/tmp/$name.png" "file://$PWD/$f" >/dev/null 2>&1
  ffmpeg -y -loglevel error -i "/tmp/$name.png" -q:v 3 "thumbnails/$name.jpg"
  rm -f "/tmp/$name.png"
  echo "$name.jpg $(ffprobe -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 thumbnails/$name.jpg) $(stat -f%z thumbnails/$name.jpg) bytes"
done
