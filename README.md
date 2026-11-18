# hyperframes

Video project: **UK Director Liquidation, Part 1 of 3: Using AI to Beat the Red Tape** (about 3:38), built with [Hyperframes](https://hyperframes.heygen.com).

## Links

| | |
|---|---|
| Hub | https://rifaterdemsahin.github.io/hyperframes/ |
| Script (Preprod) | https://rifaterdemsahin.github.io/hyperframes/script.html |
| Hyperframes guide (Prod) | https://rifaterdemsahin.github.io/hyperframes/hyperframes-guide/ |
| Cloud vs local render speed | https://rifaterdemsahin.github.io/hyperframes/hyperframes-guide/speed.html |
| Rendering paths | https://rifaterdemsahin.github.io/hyperframes/hyperframes-guide/rendering.html |
| CLI cheat sheet | https://rifaterdemsahin.github.io/hyperframes/hyperframes-guide/cli.html |
| Master spec (Postprod, template) | https://rifaterdemsahin.github.io/hyperframes/master-spec.html |
| Release checklist | https://rifaterdemsahin.github.io/hyperframes/release-checklist.html |
| Changelog | https://rifaterdemsahin.github.io/hyperframes/changelog.html |
| Changes (Postprod) | https://rifaterdemsahin.github.io/hyperframes/changes.html |
| AGENTS.md page | https://rifaterdemsahin.github.io/hyperframes/agents.html |
| Reuse as template | https://rifaterdemsahin.github.io/hyperframes/reuse.html |
| Kanban (tasks + your instructions) | https://rifaterdemsahin.github.io/hyperframes/kanban.html |
| Storyboard (editable, with draft voiceover and a copy-feedback bar) | https://rifaterdemsahin.github.io/hyperframes/storyboard/ |
| Hyperframes vs Remotion | https://rifaterdemsahin.github.io/hyperframes/compare.html |
| Why pay for Hyperframes? | https://rifaterdemsahin.github.io/hyperframes/why-pay.html |
| Recommendations | https://rifaterdemsahin.github.io/hyperframes/recommendations.html |
| Design doc | [docs/superpowers/specs/2026-11-18-liquidation-video-design.md](docs/superpowers/specs/2026-11-18-liquidation-video-design.md) |
| Scene data | [script/scenes.json](script/scenes.json) |
| Hyperframes project | [video/](video/) |

## Regenerate

```bash
scripts/gen-backgrounds.sh        # fal.ai backgrounds -> video/assets/bg
scripts/gen-voiceover.sh [voice]  # fal.ai draft voiceover -> video/assets/vo
node scripts/build-storyboard.mjs # storyboard/index.html from script/scenes.json
node scripts/build-script-page.mjs # script.html from script/scenes.json
node scripts/build-master-spec.mjs # master-spec.html, release-checklist.html, templates/MASTER-SPEC.md
node scripts/build-agents-page.mjs # agents.html from AGENTS.md
node scripts/build-changes-page.mjs # changes.html from git (run after the bump, before the commit)
node scripts/version.mjs bump minor "what changed" [page ...] [--clear-notes] # version every page + changelog; --clear-notes deletes implemented feedback notes
```

The fal.ai key lives in a git-ignored `.env` (`FAL_KEY=...`). Never commit it.

*AI organises and explains. The insolvency practitioner decides. This is information, not legal advice.*

## For AI agents

See [AGENTS.md](AGENTS.md) (`CLAUDE.md` points to it).

## Reuse as a template

See [templates/README.md](templates/README.md): copy `templates/project.template.json` and `scenes.template.json`, fill them in, run the build scripts.
