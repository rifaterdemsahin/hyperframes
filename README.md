# hyperframes

Video project: **UK Director Liquidation, Part 1 of 3: Using AI to Beat the Red Tape** (about 3:38), built with [Hyperframes](https://hyperframes.heygen.com).

## Links

| | |
|---|---|
| Hub | https://rifaterdemsahin.github.io/hyperframes/ |
| Script (Preprod) | https://rifaterdemsahin.github.io/hyperframes/script.html |
| Hyperframes guide (Prod) | https://rifaterdemsahin.github.io/hyperframes/hyperframes-guide/ |
| Desktop app and players (vs Remotion) | https://rifaterdemsahin.github.io/hyperframes/hyperframes-guide/app-and-players.html |
| Cloud vs local render speed | https://rifaterdemsahin.github.io/hyperframes/hyperframes-guide/speed.html |
| Rendering paths | https://rifaterdemsahin.github.io/hyperframes/hyperframes-guide/rendering.html |
| CLI cheat sheet | https://rifaterdemsahin.github.io/hyperframes/hyperframes-guide/cli.html |
| Master spec (Postprod, template) | https://rifaterdemsahin.github.io/hyperframes/master-spec.html |
| Release checklist | https://rifaterdemsahin.github.io/hyperframes/release-checklist.html |
| Changelog | https://rifaterdemsahin.github.io/hyperframes/changelog.html |
| Title, description, thumbnail (Postprod) | https://rifaterdemsahin.github.io/hyperframes/publish.html |
| First draft (Postprod) | https://rifaterdemsahin.github.io/hyperframes/first-draft.html |
| Review (Postprod) | https://rifaterdemsahin.github.io/hyperframes/review.html |
| Performance (Postprod) | https://rifaterdemsahin.github.io/hyperframes/performance.html |
| Changes (Postprod) | https://rifaterdemsahin.github.io/hyperframes/changes.html |
| AGENTS.md page | https://rifaterdemsahin.github.io/hyperframes/agents.html |
| Video releases & storage limits | https://rifaterdemsahin.github.io/hyperframes/video-releases.html |
| GitHub Releases (1080p MP4 downloads) | https://github.com/rifaterdemsahin/hyperframes/releases |
| Costs & estimates | https://rifaterdemsahin.github.io/hyperframes/costs.html |
| Portable Review spec | [docs/REVIEW-SPEC.md](docs/REVIEW-SPEC.md) |
| Reuse as template | https://rifaterdemsahin.github.io/hyperframes/reuse.html |
| Gaps (Preprod, what is waiting on you) | https://rifaterdemsahin.github.io/hyperframes/gaps.html |
| Kanban (tasks + your instructions) | https://rifaterdemsahin.github.io/hyperframes/kanban.html |
| Storyboard (editable, with draft voiceover and a copy-feedback bar) | https://rifaterdemsahin.github.io/hyperframes/storyboard/ |
| Hyperframes vs Remotion | https://rifaterdemsahin.github.io/hyperframes/compare.html |
| Why pay for Hyperframes? | https://rifaterdemsahin.github.io/hyperframes/why-pay.html |
| Recommendations | https://rifaterdemsahin.github.io/hyperframes/recommendations.html |
| Design doc | [docs/superpowers/specs/2026-11-18-liquidation-video-design.md](docs/superpowers/specs/2026-11-18-liquidation-video-design.md) |
| Scene data | [script/scenes.json](script/scenes.json) |
| Hyperframes project | [video/](video/) |

## Video Releases & Storage Limits

Can video outputs be pushed to GitHub Releases? **Yes, up to 2 GB per file.**

- **Master 1080p Renders**: Full-fidelity MP4 master outputs (e.g. Draft v7 at 63 MB) are published directly to [GitHub Releases](https://github.com/rifaterdemsahin/hyperframes/releases) via `node scripts/publish-release.mjs` or `gh release create`.
- **Why Releases instead of Git commits?**: Standard Git commits block files above 100 MB and permanently bloat clone history. Git LFS caps free monthly bandwidth at only 1 GB. GitHub Releases provides **2 GB per file**, unlimited total releases, and fast CDN distribution with zero repo bloat.
- **Three-tier storage model**:
  1. **Git Repository (`main`)**: Composition code, HTML, CSS, GSAP timelines, `scenes.json` (< 5 MB).
  2. **GitHub Pages**: Lightweight 720p HD streaming copies for in-browser review (`draft/v7/video.mp4`, ~14 MB).
  3. **GitHub Releases**: Full-quality 1080p/4K master archival files (up to 2 GB per file).
- **Comprehensive Guide**: Read the [Video Releases & Storage Limits Page](https://rifaterdemsahin.github.io/hyperframes/video-releases.html) for exact CLI recipes and full quota comparisons across GitHub, Git LFS, Pages, and S3/R2.

## Regenerate

```bash
scripts/gen-backgrounds.sh        # fal.ai backgrounds -> video/assets/bg
scripts/gen-voiceover.sh [voice]  # fal.ai draft voiceover -> video/assets/vo
node scripts/build-storyboard.mjs # storyboard/index.html from script/scenes.json
node scripts/build-script-page.mjs # script.html from script/scenes.json
node scripts/build-master-spec.mjs # master-spec.html, release-checklist.html, templates/MASTER-SPEC.md
node scripts/build-agents-page.mjs # agents.html from AGENTS.md
node scripts/build-video.mjs # video/ project from scenes.json
node scripts/render-draft.mjs # build, check, render and time the draft; refreshes the draft, review and performance pages
node scripts/build-architecture.mjs # architecture diagram on the hub
node scripts/build-publish-page.mjs # publish.html; scripts/build-thumbnails.sh for the JPGs
node scripts/build-changes-page.mjs # changes.html from git (run after the bump, before the commit)
node scripts/publish-release.mjs # publish master 1080p MP4 to GitHub Releases (up to 2 GB per file)
node scripts/version.mjs bump minor "what changed" [page ...] [--clear-notes] # version every page + changelog; --clear-notes deletes implemented feedback notes
```

The fal.ai key lives in a git-ignored `.env` (`FAL_KEY=...`). Never commit it.

*AI organises and explains. The insolvency practitioner decides. This is information, not legal advice.*

## For AI agents

See [AGENTS.md](AGENTS.md) (`CLAUDE.md` points to it).

## Reuse as a template

See [templates/README.md](templates/README.md): copy `templates/project.template.json` and `scenes.template.json`, fill them in, run the build scripts.
