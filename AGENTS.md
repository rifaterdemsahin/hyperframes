# AGENTS.md

Instructions for AI coding agents (Claude Code, Codex, Cursor) working in this repo. Humans: start with README.md. This file is reusable: keep it when you copy the repo as a template for the next video.

## What this repo is

A video production workspace. It holds the script, a storyboard, a master spec and a Hyperframes project (`video/`) that renders the MP4, plus a GitHub Pages site that the owner uses to review work and give feedback. Work moves through three stages: Preprod (script, storyboard, feedback), Prod (build in Hyperframes), Postprod (render, QA, publish).

The single source of truth for the current video is `script/scenes.json` (scenes, voiceover text, timings, overlays) and `spec/project.json` (brief, rules, acceptance criteria, risks, decisions). Everything on the site that describes the video is generated from those two files.

## Layout

| Path | What it is | Edit by hand? |
|---|---|---|
| `script/scenes.json` | Scenes: voiceover, B-roll, overlays, timings | Yes (then regenerate) |
| `spec/project.json` | Brief, rules, acceptance, risks, decisions | Yes (then regenerate) |
| `spec/publish.json`, `thumbnails/*.html` | YouTube title options, description template, tags, thumbnail designs (text is HTML, never AI-drawn) | Yes (then regenerate) |
| `versions.json` | Site and page versions, changelog, note-clearing times | Only through `scripts/version.mjs` |
| `nav.js`, `feedback.js`, `site.css` | Shared menu, version footer, copy-feedback bar, styles | Yes |
| `scripts/` | Generators and fal.ai helpers | Yes |
| `video/` | The Hyperframes project. `index.html` and `compositions/*.html` are generated from `scenes.json` by `scripts/build-video.mjs` | Edit the script, not these files |
| `templates/` | Blank spec, scenes and a reuse guide for the next video | Yes |
| `script.html`, `storyboard/`, `master-spec.html`, `release-checklist.html`, `agents.html`, `publish.html`, `first-draft.html`, `review.html`, `performance.html`, `changes.html`, `changelog.html`, `templates/MASTER-SPEC.md` | Generated | No. Regenerate |
| `index.html` (the architecture block between the ARCH markers is generated), `kanban.html`, `recommendations.html`, `compare.html`, `why-pay.html`, `reuse.html`, `hyperframes-guide/` | Hand-written pages | Yes |

## Commands

```bash
node scripts/build-storyboard.mjs     # storyboard/ from scenes.json
node scripts/build-script-page.mjs    # script.html
node scripts/build-master-spec.mjs    # master-spec.html, release-checklist.html, templates/MASTER-SPEC.md
node scripts/build-agents-page.mjs    # agents.html from this file
node scripts/build-publish-page.mjs   # publish.html from spec/publish.json (titles, description, tags, thumbnails)
scripts/build-thumbnails.sh           # thumbnails/thumb-*.html to 1280x720 JPG with headless Chrome + ffmpeg
node scripts/build-architecture.mjs   # architecture diagram + dependency table inside index.html (edit NODES/EDGES/DEPS in the script)
node scripts/build-video.mjs          # regenerate video/index.html + video/compositions from scenes.json
node scripts/render-draft.mjs         # build, check, render and TIME the whole draft; refreshes first-draft, review and performance pages
node scripts/build-changes-page.mjs   # changes.html: latest release, script diffs, commits (run after the bump, before the commit)
scripts/gen-backgrounds.sh            # fal.ai background images (needs FAL_KEY in .env)
scripts/gen-voiceover.sh [voice]      # fal.ai draft voiceover, writes voSeconds into scenes.json
node scripts/version.mjs bump minor|patch|major "what changed" [page ...] [--clear-notes=page,page]
cd video && npm run check && npx hyperframes snapshot --at 1,3,5 && npm run render
```

When the system itself changes (a new script, service or page), update NODES, EDGES and DEPS in `scripts/build-architecture.mjs` so the hub diagram stays true.

Regenerate in this order after changing `scenes.json`: voiceover (only scenes whose text changed: delete their mp3 first, the script skips existing files), re-time slots, then the build scripts.

## Workflow rules

1. **Commit, push and deploy every change, and say so.** The site is GitHub Pages from `main` at the repo root. After pushing, wait until the live URL serves the new content, then report "committed, pushed, deployed" with the URL. Open the page in Google Chrome (`open -a "Google Chrome" <url>`).
2. **Version every release.** Run `node scripts/version.mjs bump ...` with a one-line message and the pages that changed. It updates `versions.json`, the footer data in `nav.js`, `changelog.html` and the `?v=` cache-busters. Use patch for wording fixes, minor for new content or features, major for a restructure. Release order: bump, run the build scripts, run `build-changes-page.mjs` (it compares HEAD with the working tree, so it must run before the commit), then commit, push and deploy.
3. **Feedback loop.** The owner pastes text copied from the copy-feedback bars (the storyboard, the kanban, and the bar on every other page). Implement it, update every related section (script, spec, checklist, recommendations, kanban, hub, README), then release with `--clear-notes=<the pages you implemented>`. That deletes only those pages' notes from the owner's browser; the version is the only record kept. Never clear notes on pages you did not implement.
4. **Do not touch the owner's browser storage when testing.** Browser automation runs in the owner's real Chrome profile, so `localStorage` on the live site holds their real notes. Test read-only. If a test must write, save the existing value first and put it back. Never call `removeItem` or `clear` on a key you did not create.
5. **No secrets in git.** The repo is public. `FAL_KEY` lives only in `.env` (git-ignored). Run `git grep` for key prefixes before every commit.
6. **Signal, not noise.** When the owner selects an option, hide the ones not selected (collapse them out of the page, keep them in the source file, and reveal them with `?all=1` where it makes sense). Show decided items as decided, not as open. Keep pages and replies to what the owner needs to act on.
7. **State what you did not verify.** Say when a number is your estimate, when a source is the vendor's own, and when you did not look at the rendered result.

## Content rules

The rules in `spec/project.json` win. The main ones: no AI-generated text, numbers, documents or screens in images (fal.ai makes text-free mood plates only); real footage for real things; blur personal data at the source; one main call to action; keep the disclaimer; AI is framed as support, not a replacement for the professional. Do not invent links, prices or facts: ask, or mark the item as open in the kanban.

## Adding a page

1. Create the page. Include `<script src="nav.js?v=1.0.0"></script>` right after `<body>` (use `../nav.js` in a subfolder) and use `site.css`. The version footer and the copy-feedback bar appear automatically.
2. Add it to `MENU` in `nav.js` and to `pages` in `versions.json`.
3. Run `node scripts/version.mjs bump minor "new page" <page>`, then commit, push, deploy.

Pages with their own feedback UI set `<body data-feedback="custom">`.

## Hyperframes project notes

- The project in `video/` pins `hyperframes@0.9.67`. Read the release notes before upgrading.
- `video/index.html` is the composition that renders to MP4. Never add the site menu or footer to it.
- Follow `video/CLAUDE.md` for the render contract: timed elements need `data-start` and `class="clip"`, the root timeline is paused and registered on `window.__timelines`, and only deterministic logic.
- Always run `npm run check`, then look at snapshots, before reporting a scene done.
- Render locally; see the speed page for why cloud rendering rarely pays off at this length.

## Reuse

To start the next video from this repo, follow `templates/README.md`, or the Reuse page on the site. Keep this file as it is and change only the video-specific parts of `spec/project.json`.
