# Design: "UK Director Liquidation, Part 1 of 3" video

Status: short design, written after the user opted to proceed with placeholders (no answer given on real assets). Treat the calls below as proposals the user can override.

## Intent
A ~3:18 YouTube video (landscape 1920x1080) explaining the real liquidation process for a UK director owing HMRC, with real costs and five first steps. Part 1 of 3. The user wants to be able to edit it afterwards.

## Goals
- Storyboard first, reviewed before any motion is built.
- Every on-screen number, date and name is editable text (HTML), sourced from `script/scenes.json`.
- Re-renderable MP4 via Hyperframes.
- Commit and push at every stage (user instruction).

## Non-goals / anti-goals
- No AI-generated text, numbers, or fake HMRC / email / n8n screens. Misleading imagery about a real tax debt is a failure even if it looks good.
- No secrets in git. The fal.ai key lives in a git-ignored `.env`.
- Not legal advice. The disclaimer scene stays.

## Approaches considered
1. **Storyboard board (HTML) -> Hyperframes build.** Static board with one panel per scene, then scenes built as sub-compositions. Chosen: cheap to review, reuses the same HTML/CSS.
2. Build the full timeline straight away. Rejected: user asked for storyboards first.
3. Render the whole thing from AI video clips. Rejected: garbles numbers, costs more, hard to edit.

## Calls made (user can override)
- Scene data in `script/scenes.json` is the single source of truth (timings, VO, B-roll notes).
- fal.ai is used only for text-free backgrounds and the goal image; all text and graphics are HTML overlays.
- Real footage (HMRC balance, face cam, n8n canvas, dashboard, emails) is a clearly labelled placeholder until the user supplies it. The user blurs the UTR, login, names and addresses.
- Timings come from the script's own timecodes; total about 198 s.
- Voiceover audio is not generated; the user records it (face cam in Part 1).

## Stages (each ends in a commit + push)
1. Scaffold, design, scene data. (this commit)
2. Storyboard board with fal.ai concept backgrounds.
3. Review and revise the storyboard with the user.
4. Build scenes in Hyperframes with placeholders; `npm run check`, snapshots.
5. Swap in real footage and VO, render MP4.

## Left to the builder
Palette and type, motion details, background prompts, caption style.

## Revision, v1.4.0 (after the Script page feedback)
The video is now AI-focused: it shows how to use AI to get through real-world red tape, with closing a UK company as the example, and not a walk through the liquidation process. New title: "UK Director Liquidation, Part 1 of 3: Using AI to Beat the Red Tape". Target length 3:38. Themes added: AI as support and leverage, learn the process and delegate with AI, low expectations of AI, divide and conquer, Gmail and Drive as data sources over MCP, learn from problems and iterate. The call to action stays "subscribe"; the Skool community is one soft mention in the outro. The master spec (`spec/project.json`) is the current source of truth for the brief.
