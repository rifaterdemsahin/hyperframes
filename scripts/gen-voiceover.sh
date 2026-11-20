#!/usr/bin/env bash
# Generate one voiceover clip per scene. Key comes from ./.env.
# Priority:
# 1. ElevenLabs API if ELEVENLABS_API_KEY is set (Serious tone)
# 2. fal.ai Kokoro if FAL_KEY is valid
# 3. Local macOS British English voice (Daniel - serious tone) as reliable fallback
# Writes video/assets/vo/<scene-id>.mp3 and stores measured length as voSeconds in script/scenes.json.
set -euo pipefail
cd "$(dirname "$0")/.."
[ -f .env ] && { set -a; source .env; set +a; }

VOICE="${1:-bm_george}"
OUT=video/assets/vo
mkdir -p "$OUT"

jq -r '.scenes[].id' script/scenes.json | while read -r id; do
  [ -s "$OUT/$id.mp3" ] && [ "${FORCE:-0}" -ne 1 ] && { echo "skip $id"; continue; }
  text=$(jq -r --arg id "$id" '.scenes[]|select(.id==$id)|.vo' script/scenes.json)
  # Clean text of emojis for speech engines
  clean_text=$(echo "$text" | sed 's/[^a-zA-Z0-9.,?!:;'"'"' -]//g')

  generated=0

  # 1. Try ElevenLabs if configured
  if [ -n "${ELEVENLABS_API_KEY:-}" ] && [ "$generated" -eq 0 ]; then
    echo "Attempting ElevenLabs for $id..."
    # George voice or default
    voice_id="${ELEVENLABS_VOICE_ID:-JBFqnCBsd6RMkjVDRZzb}"
    if curl -sS -X POST "https://api.elevenlabs.io/v1/text-to-speech/$voice_id" \
      -H "xi-api-key: $ELEVENLABS_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$(jq -n --arg t "$clean_text" '{text:$t,model_id:"eleven_multilingual_v2",voice_settings:{stability:0.65,similarity_boost:0.85}}')" \
      -o "/tmp/$id.mp3"; then
      if [ -s "/tmp/$id.mp3" ] && ! grep -q "detail" "/tmp/$id.mp3" 2>/dev/null; then
        ffmpeg -y -loglevel error -i "/tmp/$id.mp3" -filter:a "atempo=1.1" -ac 1 -b:a 128k "$OUT/$id.mp3"
        rm -f "/tmp/$id.mp3"
        echo "ElevenLabs ok $id (1.1x)"
        generated=1
      fi
    fi
  fi

  # 2. Try Fal Kokoro if FAL_KEY is set (Charismatic tone bm_george with speed 1.1)
  if [ -n "${FAL_KEY:-}" ] && [ "$generated" -eq 0 ]; then
    url=$(curl -sS https://fal.run/fal-ai/kokoro/british-english \
      -H "Authorization: Key $FAL_KEY" -H "Content-Type: application/json" \
      --data "$(jq -n --arg p "$clean_text" --arg v "$VOICE" '{prompt:$p,voice:$v,speed:1.1}')" | jq -r '.audio.url // empty') || true
    if [ -n "$url" ] && [ "$url" != "null" ]; then
      curl -sS "$url" -o "/tmp/$id.wav"
      ffmpeg -y -loglevel error -i "/tmp/$id.wav" -ac 1 -b:a 128k "$OUT/$id.mp3"
      rm -f "/tmp/$id.wav"
      echo "fal ok $id (voice: $VOICE, speed: 1.1)"
      generated=1
    fi
  fi

  # 3. Fallback: Local macOS British voice Daniel (at 1.1x rate 195 wpm)
  if [ "$generated" -eq 0 ]; then
    echo "Using macOS British English voice (Daniel at 1.1x speed) for $id..."
    say -v Daniel -r 195 -o "/tmp/$id.aiff" "$clean_text"
    ffmpeg -y -loglevel error -i "/tmp/$id.aiff" -ac 1 -b:a 128k "$OUT/$id.mp3"
    rm -f "/tmp/$id.aiff"
    echo "local Daniel ok $id (1.1x)"
    generated=1
  fi
done

# record measured lengths
tmp=$(mktemp)
cp script/scenes.json "$tmp"
for f in "$OUT"/*.mp3; do
  id=$(basename "$f" .mp3)
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$f")
  jq --arg id "$id" --argjson d "$(printf '%.1f' "$d")" '(.scenes[]|select(.id==$id)|.voSeconds)=$d' "$tmp" > "$tmp.n" && mv "$tmp.n" "$tmp"
done
mv "$tmp" script/scenes.json
jq -r '.scenes[]|"\(.id)\t\(.duration)s slot\t\(.voSeconds)s voice"' script/scenes.json
