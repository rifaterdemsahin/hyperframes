# Master spec: Part 1 of 3: How I Taught Myself Anything with AI (Closing My Company Was the Test)

Spec v1.2 · site v1.40.0. Generated from spec/project.json and script/scenes.json. Do not edit by hand.

## 1. Brief
- **Series:** Part 1 of 3 (Part 2: how I build the stages, the app and the AI agents that email the right parties; Part 3: how it ends)
- **Owner:** Rifat
- **Audience:** A mass audience facing a big change or an unfamiliar process (UK directors closing a company are one example) who want to learn it quickly with AI. Every specialist term is explained in plain words.
- **Goal:** Inspire viewers to transform by teaching themselves anything with AI, using closing a UK company as the worked example: AI as a tutor and support, check facts with official sources, still use a professional, turn learning into a checklist, and grow skills that carry into the next project.
- **One call to action:** Subscribe for Part 2
- **Tone:** Inspiring but honest, calm, first person. AI is a tutor and support, not magic. No hype, no promises about outcomes.
- **Length:** 4:00 target, plan 4:00
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
1. 0:00 **Every big change starts with something new** (45 words, slot 17 s). B-roll: Goal image, animated AI core engine, slow push-in
2. 0:17 **Part 1 of 3: learning anything with AI** (53 words, slot 22 s). B-roll: Face cam, lower-third: Part 1 of 3, UK IT contractor IR35 shift
3. 0:39 **The goal: transformation** (59 words, slot 24 s). B-roll: Goal infographic, three-step liquidation pipeline, legal debt separation
4. 1:03 **How I learned it: five steps with AI** (109 words, slot 41 s). B-roll: Numbered list 1 to 5 with live ChatGPT co-pilot interaction & learning animation
5. 1:44 **What it cost and how long it took** (65 words, slot 24 s). B-roll: Cost and timeline graphic: £1,500 + £2,100, 2 months before + 2 months after
6. 2:08 **The honest part** (68 words, slot 24 s). B-roll: Exceptions cards, security guardrail badge, hands-on AI loop
7. 2:32 **Three lessons from my inbox** (62 words, slot 24 s). B-roll: Online methods as database animation, MCP connection pipeline
8. 2:56 **Workflows plus AI** (64 words, slot 23 s). B-roll: n8n deterministic cron email vs AI probabilistic reply workflow diagram, Friend's advice vs honour card
9. 3:19 **From shame to grace, and Part 2** (60 words, slot 21 s). B-roll: Motivational dawn background, shame to grace card, Part 2 question prompt for comments
10. 3:40 **Disclaimer + outro** (45 words, slot 20 s). B-roll: Bot-to-human legal handover animation, disclaimer banner, Skool community link with logo

## 5. Asset manifest
- Part 1 of 3: learning anything with AI: Face cam clip (Your footage / capture), Needed
- Disclaimer + outro: Skool community link (Your footage / capture), Needed
- All: Background plates (6 images) (fal.ai, text-free), Done
- All: Draft voiceover (per scene) (fal.ai Kokoro), Done, to be replaced by your recording
- All: Music and sound effects (TBD), Open
- All: Thumbnail (TBD), Open

## 6. Rules
- No AI-generated text, numbers, documents or screens. Backgrounds are mood plates only; every figure on screen is editable HTML text.
- Real footage for real things: HMRC screen, emails, n8n canvas and dashboard are your captures, never mock-ups. NOT APPLIED TO PART 1: owner decision 20 Nov 2026, this film is a pure keynote cut with no real footage, and real things are shown as simple drawn visuals (icons, diagrams, numbers), never logos or screenshots. The rule applies again if footage is added.
- Blur UTR, logins, names and addresses in the source image, then check the exported frame.
- No secrets in the repo. Keys live in a git-ignored .env.
- No figure for the company's debt in the video. Fees only where the viewer needs them.
- Keep the disclaimer. Have the insolvency practitioner read the script before publishing.
- One main call to action: subscribe for Part 2. The Skool community gets one soft mention in the outro, not a second ask.
- Frame AI as support with low expectations: it gives courage and an assist, and it does not replace the insolvency practitioner.
- Anything about AI agents emailing the parties is shown as your own approach. Messages to creditors and other parties go through or with the practitioner.
- Explain every specialist term in plain words the first time it appears (IR35, HMRC, insolvency practitioner, the Crown, MCP, n8n, AI agents), on screen and in the voiceover.

## 7. Open decisions
- Final voice: your recording or AI: Open (recording recommended) (You)
- Repo stays public until release?: Open (You)
- Title and thumbnail: Open again (Draft v13 angle): 5 titles and 4 thumbnails on the Publish page; recommended title 1 with Thumbnail C (You)
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
0:00 Every big change starts with something new
0:17 Part 1 of 3: learning anything with AI
0:39 The goal: transformation
1:03 How I learned it: five steps with AI
1:44 What it cost and how long it took
2:08 The honest part
2:32 Three lessons from my inbox
2:56 Workflows plus AI
3:19 From shame to grace, and Part 2
3:40 Disclaimer + outro
```

## 11. Learnings and system insights
- Clean Canvas Over Watermarks: Reviewers and clients strongly prefer clean video output without intrusive 'DRAFT V*' tags on screen; review version metadata belongs in the web player header, not burned into the video composition frames.
- Flat-Rate Subscription Economics: Video creators on $20/mo Claude Pro and Gemini Antigravity plans producing 3 videos/week amortize agent orchestration to ~$3.08 per video ($0.00 marginal cost per revision/token), making multi-round video iteration practically free.
- Preserving SAS Query Parameters for AI Agents: Azure Blob Storage containers without public anonymous access reject unauthenticated requests with 409 Conflict. Appending and preserving the SAS query string (?se=...&sp=...) makes frame drawings immediately consumable by Claude, external tools, curl, and browsers without credential headers.
- Pre-Copy Upload Flush: Reviewers click 'Copy feedback for Claude' as soon as they finish writing notes; ensuring the copy handler flushes and awaits pending image uploads prevents missing visual links in feedback prompts.
- Automated Release Asset Pipelines: Large binary outputs (1080p master MP4, ~63MB) exceed git repository best practices; automated GitHub Releases via `gh release create` solve delivery without bloating git history.
- Collapsible Creation vs Sticky Audit Workflow: Reviewers switch between drafting critique and verifying implemented changes. Making the feedback input form collapsible (<details>) with persistent browser storage brings verification tasks to the top of the sticky sidebar for distraction-free auditing.
- Turnaround and Verification Traceability: Stamping creation and resolution timestamps on feedback cards alongside turnaround duration pills (e.g. 'Resolved in 24m 41s') and dedicated Verified/Not Verified filtering creates a transparent, high-velocity iteration loop between human reviewers and coding agents.
- HTTP 206 Byte-Range Streaming for HTML5 Video Seeking: Modern desktop and mobile browsers (Chrome, Safari) require servers to support HTTP 206 Partial Content range requests (`Accept-Ranges: bytes`) for seeking; servers returning HTTP 200 reset playback to 0:00 when `video.currentTime` is set.
- Pre-Roll Auditioning for Audio Edits: Verifying audio cuts or SFX removals requires jumping to an automated pre-roll window (1.5s–2.0s before the edit) and playing unmuted; jumping directly to the edit timestamp starts playback after the event and prevents hearing the transition.
- Zero-Config Cloud Sync via Azure Key Vault: Relying on browser localStorage for cloud SAS URLs creates manual friction; storing credentials in Azure Key Vault (`dp-kv-deliverypilot`) and provisioning via backend API delivers instant, secure, cross-device verification sync without exposed credentials in git.
