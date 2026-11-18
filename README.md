# hyperframes

Video project: **UK Director Liquidation, Part 1 of 3: the real process** (about 3 minutes), built with [Hyperframes](https://hyperframes.heygen.com).

## Links

| | |
|---|---|
| Hub | https://rifaterdemsahin.github.io/hyperframes/ |
| Kanban (tasks + your instructions) | https://rifaterdemsahin.github.io/hyperframes/kanban.html |
| Storyboard (editable, with draft voiceover and a copy-feedback bar) | https://rifaterdemsahin.github.io/hyperframes/storyboard/ |
| Hyperframes vs Remotion | https://rifaterdemsahin.github.io/hyperframes/compare.html |
| Design doc | [docs/superpowers/specs/2026-11-18-liquidation-video-design.md](docs/superpowers/specs/2026-11-18-liquidation-video-design.md) |
| Scene data | [script/scenes.json](script/scenes.json) |
| Hyperframes project | [video/](video/) |

## Regenerate

```bash
scripts/gen-backgrounds.sh        # fal.ai backgrounds -> video/assets/bg
scripts/gen-voiceover.sh [voice]  # fal.ai draft voiceover -> video/assets/vo
node scripts/build-storyboard.mjs # storyboard/index.html from script/scenes.json
```

The fal.ai key lives in a git-ignored `.env` (`FAL_KEY=...`). Never commit it.

*AI organises and explains. The insolvency practitioner decides. This is information, not legal advice.*
