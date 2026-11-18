# Master spec: UK Director Liquidation, Part 1 of 3: The Real Process

Spec v1.0 · site v1.2.0. Generated from spec/project.json and script/scenes.json. Do not edit by hand.

## 1. Brief
- **Series:** Part 1 of 3 (Part 2: the AI automation behind it, Part 3: how it ends)
- **Owner:** Rifat
- **Audience:** UK company directors facing insolvency, and anyone who wants to see how the process really works
- **Goal:** Explain how a UK liquidation works in plain words, with the real costs and the five things to do first, and show that you learn the process and delegate the busywork to AI while still using a professional.
- **One call to action:** Subscribe for Part 2
- **Tone:** Honest, calm, first person. No hype, no promises about outcomes.
- **Length:** 3:16 target, plan 3:16
- **Language:** en-GB
- **Disclaimer:** AI organises and explains. The insolvency practitioner decides. This is information, not legal advice.

## 2. Pipeline
1. Preprod: script, storyboard, feedback, kanban, recommendations. Done when the storyboard is approved and open decisions are closed.
2. Prod: build scenes in Hyperframes, bring in real footage and voice. Done when every scene renders and the check passes.
3. Postprod: final render, quality control, captions, publish. Done when the acceptance criteria and release checklist are complete.

Every change: commit, push, deploy, bump version.

## 3. Technical spec
- Resolution 1920x1080, 30 fps, MP4 (H.264)
- Quality: Hyperframes default 'looks' (CRF 16); 'draft' for review cuts
- Rendering: Local, npx hyperframes render, project pinned to hyperframes@0.9.67
- Voice now: AI draft: fal.ai Kokoro, British male (bm_george), used for timing and review
- Voice final: Your own recording (recommended). Re-time the scene slots after recording
- Captions: Burned in, timed from the final transcript

## 4. Scenes
1. 0:00 **Hook** (33 words, slot 12 s). B-roll: Goal image, slow push-in. No figures on screen
2. 0:12 **Part 1 of 3: the real process** (28 words, slot 11 s). B-roll: Face cam, lower-third: Part 1 of 3
3. 0:23 **The goal** (33 words, slot 15 s). B-roll: Goal infographic, the three-step process highlighted
4. 0:38 **Five things to do first** (103 words, slot 39 s). B-roll: On-screen numbered list 1 to 5. Optional HMRC screen inset for step 1 (S2), UTR, login and balance hidden
5. 1:17 **What it costs and how long it takes** (78 words, slot 28 s). B-roll: Cost and timeline graphic: £1,500 + £2,100, five stages, Gazette wait
6. 1:45 **The exceptions** (63 words, slot 26 s). B-roll: Four exception cards on screen, red accent
7. 2:11 **What my emails taught me** (67 words, slot 24 s). B-roll: Email timeline graphic (S12): chase reminders, the receipt, the liquidation-date email (names and addresses blurred)
8. 2:35 **How I keep track of it** (45 words, slot 22 s). B-roll: n8n canvas, 20 seconds (S3), then the dashboard (S10)
9. 2:57 **Subscribe for Part 2** (18 words, slot 8 s). B-roll: Subscribe button animation, Part 2 title card
10. 3:05 **Disclaimer + outro** (20 words, slot 11 s). B-roll: Goal image again, end screen: Part 2 teaser

## 5. Asset manifest
- Part 1 of 3: the real process: Face cam clip (Your footage / capture), Needed
- Five things to do first: HMRC screen (S2), optional (Your footage / capture), Needed
- What my emails taught me: Email screenshots (S12), blurred (Your footage / capture), Needed
- How I keep track of it: n8n canvas recording (S3) + dashboard (S10) (Your footage / capture), Needed
- All: Background plates (6 images) (fal.ai, text-free), Done
- All: Draft voiceover (per scene) (fal.ai Kokoro), Done, to be replaced by your recording
- All: Music and sound effects (TBD), Open
- All: Thumbnail (TBD), Open

## 6. Rules
- No AI-generated text, numbers, documents or screens. Backgrounds are mood plates only; every figure on screen is editable HTML text.
- Real footage for real things: HMRC screen, emails, n8n canvas and dashboard are your captures, never mock-ups.
- Blur UTR, logins, names and addresses in the source image, then check the exported frame.
- No secrets in the repo. Keys live in a git-ignored .env.
- No figure for the company's debt in the video. Fees and dates only where the viewer needs them.
- Keep the disclaimer. Have the insolvency practitioner read the script before publishing.
- One call to action per video.

## 7. Open decisions
- Palette and font: Open (You)
- Music: Open (You)
- Final voice: your recording or AI: Open (recording recommended) (You)
- Repo stays public until release?: Open (You)
- Thumbnail and title wording: Open (You and Claude)

## 8. Acceptance criteria
- [ ] Final MP4 plays end to end at 1920x1080, 30 fps, with audio in sync with every scene.
- [ ] Every scene in scenes.json appears, in order, within about 1 second of its planned slot.
- [ ] No UTR, login, name or address is readable in any frame.
- [ ] Captions are present, match the audio and stay inside the safe area.
- [ ] npm run check passes and snapshots of every scene were looked at.
- [ ] The practitioner has confirmed the factual claims, or you have noted which claims are your own experience.
- [ ] Chapters, title, description and thumbnail are ready (see the release checklist).

## 9. Risks
- Factual claims about liability and process may be wrong or out of date. Mitigation: Practitioner reads the script; present personal details as your own experience
- Personal data visible in footage. Mitigation: Blur at source, inspect the exported frames
- Public repo and site reveal the story before release. Mitigation: Decide before release whether to make the repo private or rewrite history
- Exposed API key. Mitigation: Rotate the fal.ai key, keep it only in .env
- Hyperframes is pre-1.0 and ships many releases. Mitigation: Pin the version, read release notes before upgrading

## 10. Chapters (starting point)
```
0:00 Hook
0:12 Part 1 of 3: the real process
0:23 The goal
0:38 Five things to do first
1:17 What it costs and how long it takes
1:45 The exceptions
2:11 What my emails taught me
2:35 How I keep track of it
2:57 Subscribe for Part 2 and Disclaimer + outro
```
