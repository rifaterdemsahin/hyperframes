# Starting a new video from this template

1. Keep: `nav.js`, `feedback.js`, `site.css`, `versions.json`, `scripts/`, `.gitignore`. Replace: everything in `script/`, `spec/`, `storyboard/`, `video/assets/`.
2. `cp templates/project.template.json spec/project.json` and fill in every `<<...>>`.
3. `cp templates/scenes.template.json script/scenes.json` and write your scenes. `bg` is one of the background names in `video/assets/bg` (`goal`, `desk`, `storage`, `warning`, `network`, `calm`) or your own. `overlay` is the on-screen text. `realAsset` names footage you must supply, or `null`.
4. Put `FAL_KEY=...` in a git-ignored `.env` if you want fal.ai drafts, then run `scripts/gen-backgrounds.sh` and `scripts/gen-voiceover.sh`. Both read scenes from `script/scenes.json`.
5. Build the pages: `node scripts/build-storyboard.mjs && node scripts/build-script-page.mjs && node scripts/build-master-spec.mjs`.
6. Update the `pages` list in `versions.json` and the menu in `nav.js` if you add or remove pages. Then `node scripts/version.mjs bump minor "new video: <title>"`.
7. Work through Preprod (script, storyboard, feedback), Prod (build in `video/`), Postprod (render, release checklist). Commit, push and deploy after every change.

`templates/MASTER-SPEC.md` is generated for the current video. It is also a good example of a finished spec.
