# Music: source and licence

| | |
|---|---|
| File used in the film | `bed-mix.mp3` (made from `bed-raw.mp3` by `scripts/mix-music.mjs`) |
| Source file | `bed-raw.mp3`: generated for this project on 20 Nov 2026 by `scripts/gen-music.sh` |
| Generator | fal.ai, model endpoint `fal-ai/ace-step` (request id in `source.json`) |
| Model | ACE-Step v1 3.5B, open weights: https://huggingface.co/ACE-Step/ACE-Step-v1-3.5B |
| Model licence | Apache License 2.0 (https://github.com/ace-step/ACE-Step/blob/main/LICENSE). It places no restriction on the audio the model produces. |
| Service terms | fal.ai terms of service: https://fal.ai/terms |
| Prompt | instrumental only (`lyrics: "[inst]"`), tags and seed in `source.json`, so the same request can be repeated |
| Third-party material | none: no samples, stems or tracks from anyone else were used |

## What this means for publishing

- The track is original, machine-generated audio made for this film. It is not from a stock library, so there is no stock licence and no attribution requirement.
- It is instrumental: a speech check (Whisper) found no words in it.
- Caveat: generated music is not checked against existing recordings. If YouTube Content ID ever flags it, dispute with this file and `source.json` as the record, or regenerate with a new seed.

## How the mix works

`scripts/mix-music.mjs` stretches the 239.9 s bed to the film's 244 s and ducks it under the voiceover with a sidechain compressor keyed on the voice. Measured: about 17 dB under the voice while he speaks; it swells to about voice level in every gap between scenes; in the hook and from "Tell me in the comments" to "Subscribe" it is ducked lightly (about 7 to 8 dB under the voice) so the build is heard; after the last word of the Subscribe scene it swells fully. The generated piece has its own ending, so only its audible part is used (stretched about 3%), and that ending lands on the last line, "See you next time". Levels, windows and measurements are in `mix.json`.
