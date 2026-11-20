# Master spec: Part 1 of 3: How I Taught Myself Anything with AI (Closing My Company Was the Test)

Spec v2.0 · site v1.42.0. Generated from spec/project.json and script/scenes.json. Do not edit by hand.

## 1. Brief
- **Series:** Part 1 of 3: how I taught myself a whole new process with AI, with closing my company as the test. Part 2: how I built the workflows and AI agents. Part 3: how it ends.
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
2. Prod: build scenes in Hyperframes: voice, keynote screens, visuals and music. Done when every scene renders and the check passes.
3. Postprod: final render, quality control, captions, publish. Done when the acceptance criteria and release checklist are complete.

Every change: commit, push, deploy, bump version.

## 3. Technical spec
- Resolution 1920x1080, 30 fps, MP4 (H.264)
- Quality: Hyperframes default 'looks' (CRF 16); 'draft' for review cuts
- Rendering: Local, npx hyperframes render, project pinned to hyperframes@0.9.67
- Baseline: Draft v13 (20 Nov 2026), approved by you as the baseline: transformation and teaching yourself with AI, closing the company as the example. Later drafts change from here.
- Style: Keynote: one idea per screen, at most 6 words, Inter 140 to 200 px on a black radial background, one blue accent (#2997ff), drawn SVG visuals for real things, no logos, no screenshots, no real footage
- Music: Inspiring piano-led bed (fal.ai ACE-Step, Apache-2.0, seed 20261121), about 18 dB under the voice, swelling in the hook, the gaps and the Subscribe ending; source and licence in video/assets/music/
- Voice now: AI draft: fal.ai Kokoro British male (bm_george, speed 1.1). Whisper word timestamps time every screen to the spoken word
- Voice final: Your own recording (recommended). After recording: new transcripts, re-time the slots, re-mix the music
- Captions: Not burned in (keynote cut). Upload a caption file (SRT) to YouTube made from the final voice transcript

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
- All: Keynote screens and drawn visuals (HTML + SVG from scenes.json (no footage, no logos)), Done
- Scene 8: Mountain image (Share the real journey) (fal.ai mood plate, text-free), Done
- All: Draft voiceover (per scene) + word transcripts (fal.ai Kokoro + Whisper), Done, to be replaced by your recording
- All: Music bed (fal.ai ACE-Step (Apache-2.0), piano-led), Done (listen once)
- All: Caption file (SRT) (From the final voice transcript), Open
- All: Thumbnail (HTML, 4 options on the Publish page), Pick one

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
- [ ] Every screen appears on its spoken word, within about half a second.
- [ ] The keynote audit (scripts/audit-keynote.mjs) reports 0 flagged moments: at most 6 words, no lists, one idea per screen.
- [ ] Every specialist term is explained in plain words the first time it appears.
- [ ] Music stays at least 15 dB under the voice while he speaks (video/assets/music/mix.json) and its source and licence are recorded.
- [ ] A caption file (SRT) matching the final voice is uploaded to YouTube.
- [ ] npm run check passes and snapshots of every scene were looked at.
- [ ] The practitioner has confirmed the factual claims, or you have noted which claims are your own experience.
- [ ] Chapters, title, description and thumbnail are ready (see the release checklist).

## 9. Risks
- Factual claims about liability and process may be wrong or out of date. Mitigation: Practitioner reads the script and the description; present personal details as your own experience
- The angle overpromises ('learn anything'). Mitigation: Show one real process, keep AI as a tutor, not a lawyer; avoid 'anything' in the title or make it clearly a challenge
- Azure storage write tokens are public (review.html, /api/azure-config). Mitigation: Revoke them by rotating the storage keys; then uploads go through the server and links become short-lived and read-only
- Generated music could resemble an existing recording (Content ID). Mitigation: Keep source.json and LICENSE.md as the record; dispute, or regenerate with a new seed
- Public repo and site reveal the story before release. Mitigation: Decide before release whether to make the repo private or rewrite history
- Exposed API keys (fal.ai, DeepInfra). Mitigation: Rotate them, keep them only in .env
- Hyperframes is pre-1.0 and ships many releases. Mitigation: Pin the version, read release notes before upgrading
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
- Never put SAS query strings in shared links or committed files: a container-level SAS with write rights in a public page lets anyone list, overwrite or delete the container. Serve images through the server, or give short-lived, read-only, per-blob links.
- Pre-Copy Upload Flush: Reviewers click 'Copy feedback for Claude' as soon as they finish writing notes; ensuring the copy handler flushes and awaits pending image uploads prevents missing visual links in feedback prompts.
- Automated Release Asset Pipelines: Large binary outputs (1080p master MP4, ~63MB) exceed git repository best practices; automated GitHub Releases via `gh release create` solve delivery without bloating git history.
- Collapsible Creation vs Sticky Audit Workflow: Reviewers switch between drafting critique and verifying implemented changes. Making the feedback input form collapsible (<details>) with persistent browser storage brings verification tasks to the top of the sticky sidebar for distraction-free auditing.
- Turnaround and Verification Traceability: Stamping creation and resolution timestamps on feedback cards alongside turnaround duration pills (e.g. 'Resolved in 24m 41s') and dedicated Verified/Not Verified filtering creates a transparent, high-velocity iteration loop between human reviewers and coding agents.
- HTTP 206 Byte-Range Streaming for HTML5 Video Seeking: Modern desktop and mobile browsers (Chrome, Safari) require servers to support HTTP 206 Partial Content range requests (`Accept-Ranges: bytes`) for seeking; servers returning HTTP 200 reset playback to 0:00 when `video.currentTime` is set.
- Pre-Roll Auditioning for Audio Edits: Verifying audio cuts or SFX removals requires jumping to an automated pre-roll window (1.5s–2.0s before the edit) and playing unmuted; jumping directly to the edit timestamp starts playback after the event and prevents hearing the transition.
- Zero-Config Cloud Sync via Azure Key Vault: Relying on browser localStorage for cloud SAS URLs creates manual friction; storing credentials in Azure Key Vault (`dp-kv-deliverypilot`) and provisioning via backend API delivers instant, secure, cross-device verification sync without exposed credentials in git.
- Render only after the check passes: render-draft stops at a failing Hyperframes check, and a fallback player hid that v10 never rendered. A test now fails when the latest draft has no MP4.
- Keynote readability is measurable: stepping each scene in headless Chrome and counting words, lines, lists and font size flagged 163 of 163 moments in v10 and 0 in v11 to v13.
- Time screens from a transcript, not word position: Whisper word timestamps put every screen on its spoken word, and showed which screens were too short to read.
- Hand-written pages go stale silently: Recommendations stopped at Draft v2 for nine drafts. Stamp the draft it was reviewed against and fail the tests when it falls behind.
- Generated music has its own ending: use the audible part and stretch it to the film, so the ending lands on the last line instead of leaving silence.
- A wider angle lifts the value: reframing from a liquidation how-to to transformation with AI, and explaining every term, made the same story useful to a mass audience (estimated value 72 to 82).
