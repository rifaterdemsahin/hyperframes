# Master spec: UK Director Liquidation, Part 1 of 3: Using AI to Beat the Red Tape

Spec v1.1 · site v1.16.0. Generated from spec/project.json and script/scenes.json. Do not edit by hand.

## 1. Brief
- **Series:** Part 1 of 3 (Part 2: how I build the stages, the app and the AI agents that email the right parties; Part 3: how it ends)
- **Owner:** Rifat
- **Audience:** UK company directors facing insolvency, and anyone stuck in real-world red tape who wants to use AI to get moving
- **Goal:** Show how to use AI to get through real-world red tape, using closing a UK company as the example: AI as support and leverage, learn the process and delegate with AI, still use a professional, keep expectations low, divide and conquer, and learn from every problem.
- **One call to action:** Subscribe for Part 2
- **Tone:** Honest, calm, first person. AI is support, not magic. No hype, no promises about outcomes.
- **Length:** 4:04 target, plan 4:03
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
- Voice now: AI draft: fal.ai Kokoro British male (bm_lewis, serious tone), used for timing and review
- Voice final: Your own recording (recommended). Re-time the scene slots after recording
- Captions: Burned in, timed from the final transcript

## 4. Scenes
1. 0:00 **Hook** (38 words, slot 14 s). B-roll: Goal image, animated AI core engine, slow push-in
2. 0:14 **Part 1 of 3: AI and real-world red tape** (56 words, slot 23 s). B-roll: Face cam, lower-third: Part 1 of 3, UK IT contractor IR35 shift
3. 0:37 **The goal** (45 words, slot 20 s). B-roll: Goal infographic, three-step liquidation pipeline, legal debt separation
4. 0:57 **Five things to do first, with AI** (111 words, slot 40 s). B-roll: Numbered list 1 to 5 with live ChatGPT co-pilot interaction & learning animation
5. 1:37 **What it costs and how long it takes** (82 words, slot 27 s). B-roll: Cost and timeline graphic: £1,500 + £2,100, 2 months before + 2 months after
6. 2:04 **The exceptions** (80 words, slot 29 s). B-roll: Exceptions cards, security guardrail badge, hands-on AI loop
7. 2:33 **What my emails taught me** (55 words, slot 23 s). B-roll: Online methods as database animation, MCP connection pipeline
8. 2:56 **How I keep track of it** (63 words, slot 24 s). B-roll: n8n deterministic cron email vs AI probabilistic reply workflow diagram, Friend's advice vs honour card
9. 3:20 **Subscribe for Part 2** (71 words, slot 24 s). B-roll: Motivational dawn background, shame to grace card, Part 2 question prompt for comments
10. 3:44 **Disclaimer + outro** (42 words, slot 19 s). B-roll: Bot-to-human legal handover animation, disclaimer banner, Skool community link with logo

## 5. Asset manifest
- Part 1 of 3: AI and real-world red tape: Face cam clip (Your footage / capture), Needed
- Disclaimer + outro: Skool community link (Your footage / capture), Needed
- All: Background plates (6 images) (fal.ai, text-free), Done
- All: Draft voiceover (per scene) (fal.ai Kokoro), Done, to be replaced by your recording
- All: Music and sound effects (TBD), Open
- All: Thumbnail (TBD), Open

## 6. Rules
- No AI-generated text, numbers, documents or screens. Backgrounds are mood plates only; every figure on screen is editable HTML text.
- Real footage for real things: HMRC screen, emails, n8n canvas and dashboard are your captures, never mock-ups.
- Blur UTR, logins, names and addresses in the source image, then check the exported frame.
- No secrets in the repo. Keys live in a git-ignored .env.
- No figure for the company's debt in the video. Fees only where the viewer needs them.
- Keep the disclaimer. Have the insolvency practitioner read the script before publishing.
- One main call to action: subscribe for Part 2. The Skool community gets one soft mention in the outro, not a second ask.
- Frame AI as support with low expectations: it gives courage and an assist, and it does not replace the insolvency practitioner.
- Anything about AI agents emailing the parties is shown as your own approach. Messages to creditors and other parties go through or with the practitioner.

## 7. Open decisions
- Palette and font: Open (You)
- Music: Open (You)
- Final voice: your recording or AI: Open (recording recommended) (You)
- Repo stays public until release?: Open (You)
- Skool community name and link for the end screen and description: Open (You)
- Gmail and Drive over MCP: show a real demo or a diagram?: Open (diagram planned) (You)

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
- Viewers read AI emailing as advice to bulk-contact creditors. Mitigation: Say 'the right parties', show it as your own approach, and check creditor communication with the practitioner first
- Overclaiming what AI can do in a legal or tax process. Mitigation: Keep the low-expectations message and the disclaimer; the practitioner decides

## 10. Chapters (starting point)
```
0:00 Hook
0:14 Part 1 of 3: AI and real-world red tape
0:37 The goal
0:57 Five things to do first, with AI
1:37 What it costs and how long it takes
2:04 The exceptions
2:33 What my emails taught me
2:56 How I keep track of it
3:20 Subscribe for Part 2
3:44 Disclaimer + outro
```
