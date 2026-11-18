#!/usr/bin/env bash
# Generate text-free background plates with fal.ai (flux/schnell). Key comes from ./.env (git-ignored).
# Usage: scripts/gen-backgrounds.sh
set -euo pipefail
cd "$(dirname "$0")/.."
set -a; source .env; set +a
OUT=video/assets/bg
mkdir -p "$OUT"

gen() { # name, prompt
  local name="$1" prompt="$2"
  [ -s "$OUT/$name.jpg" ] && { echo "skip $name"; return; }
  local url
  url=$(curl -sS https://fal.run/fal-ai/flux/schnell \
    -H "Authorization: Key $FAL_KEY" -H "Content-Type: application/json" \
    --data "$(jq -n --arg p "$prompt" '{prompt:$p,image_size:"landscape_16_9",num_images:1,num_inference_steps:4,enable_safety_checker:true}')" \
    | jq -r '.images[0].url')
  [ "$url" != "null" ] && [ -n "$url" ] || { echo "FAILED $name" >&2; return 1; }
  curl -sS "$url" -o "$OUT/$name.jpg"
  echo "ok $name"
}

NOTEXT="no text, no letters, no numbers, no logos, no watermark"
gen goal      "moody dark navy abstract background, soft light beam over a calm desk with an empty chair, cinematic, shallow depth of field, $NOTEXT"
gen desk      "overhead view of a tidy home office desk with a laptop and notebooks, soft warm window light, muted tones, blurred, cinematic, $NOTEXT"
gen storage   "dim self-storage unit corridor with rows of closed orange doors, moody lighting, blurred, cinematic, $NOTEXT"
gen warning   "dark charcoal abstract background with a subtle red glow from the lower edge, soft grain, minimal, $NOTEXT"
gen network   "dark blue abstract node network glowing softly, minimal tech background, depth of field, $NOTEXT"
gen calm      "soft dark teal gradient abstract background with gentle bokeh lights, minimal, $NOTEXT"
