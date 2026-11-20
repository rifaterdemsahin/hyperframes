# Video Review & Drawing Annotation Specification

A portable, serverless review framework for video production pipelines (Hyperframes, Remotion, After Effects, or custom web compositions). It enables reviewers to scrub video frame-by-frame, draw visual instructions directly on video frames, automatically upload marked frames to cloud storage (Azure Blob SAS), verify completed backlog tasks, and export structured Markdown with unique IDs for 1:1 git commit traceability by AI coding agents.

---

## 1. Architecture Overview

```mermaid
flowchart TD
    Reviewer["👤 Human Reviewer (Browser)"]
    Player["🎬 HTML5 Video Player + Overlay Canvas"]
    DownloadBtn["⬇ Download Video (Slug-Draft-vN-Review.mp4)"]
    LocalState["💾 Browser LocalStorage (review-v2, review-verified-v1)"]
    Carousel["✅ Completed Tasks Verification Carousel"]
    AzureBlob["☁️ Azure Blob Storage (Direct SAS PUT)"]
    Clipboard["📋 Markdown Feedback Generator (with Unique IDs)"]
    Agent["🤖 AI Coding Agent (Claude Code / Cursor)"]
    Repo["📦 Video Codebase & Render Pipeline"]

    Reviewer -->|1. Scrub, Step Frame, Draw, Note| Player
    Reviewer -->|Download Review Master| DownloadBtn
    Player -->|2. Persist Vector Shapes & Unique IDs| LocalState
    Player -->|3. Composite Canvas to JPEG Blob| AzureBlob
    AzureBlob -->|4. Return Public SAS Image URL| LocalState
    LocalState -->|5. Click 'Copy Feedback'| Clipboard
    Clipboard -->|6. Paste Markdown with [id: fb-...]| Agent
    Agent -->|7. Implement Feedback & Reference ID in Commit| Repo
    Repo -->|8. Release with --clear-notes & Link Commit in Carousel| Carousel
    Carousel -->|9. Scrub to Verify & Tick Verified Box| Reviewer
```

### Key Principles
1. **Zero Backend Required**: Runs as a 100% static HTML/JS web page (hosted on GitHub Pages, Vercel, or S3).
2. **Deterministic Frame Accuracy**: Timecodes are converted to exact video frames based on composition FPS (`Math.round(currentTime * FPS)`).
3. **Unique Feedback Identification**: Every feedback note and drawing is stamped with a unique identifier (`fb-<frame>-<shortId>`), ensuring 1:1 traceability from review note to git commit.
4. **Standardized Asset Naming**: Downloaded videos and frame snapshots always carry the project slug, draft version, review label, and feedback ID (e.g. `UK-Director-Liquidation-Part-1-Draft-v9-Review.mp4`).
5. **Interactive Verification Loop**: An embedded carousel allows the reviewer to step through all completed backlog items, seek directly to the exact frame, inspect drawing diffs, view the git commit hash, and toggle persistent verification checkboxes.
6. **Normalized Vector Coordinate Space**: Drawing strokes use `[0..1]` normalized coordinates so markings scale responsively across mobile, laptop, and 4K displays.
7. **Zero-Secret Cloud Uploads**: The reviewer supplies an Azure Container SAS URL directly in their browser UI or URL hash (`#sas=...`). Secrets are never committed to git.
8. **Lossless Communication Loop**: Outputs grouped Markdown with exact timestamps, frame indices, unique IDs, scene names, and clickable Azure frame URLs for the AI coding agent.

---

## 2. Review Data Schema

Each feedback annotation is stored in browser `localStorage` under `review-v2` as a serialized JSON object, capturing both global composition coordinates and scene-relative original footage timecodes:

```typescript
interface ReviewMarker {
  cid: string;                      // Unique identifier (e.g. 'fb-1270-38a4')
  ts: number;                       // Creation timestamp (epoch ms)
  createdAt: string;                // ISO 8601 creation timestamp
  resolvedAt?: string;              // ISO 8601 resolution timestamp (when marked done)
  resolvedTs?: number;              // Epoch ms when marked done
  state: "backlog" | "in-progress" | "done";
  kind: "marker" | "text";          // Video frame marker vs copy/post feedback
  t: number;                        // Exact timecode in seconds (e.g. 42.10)
  frame: number;                    // Absolute frame index (e.g. 1270 at 30 fps)
  scene: string;                    // Target scene ID (e.g. 's03-goal')
  sceneNum: number;                 // Scene number (e.g. 3)
  sceneTitle: string;               // Human-readable title (e.g. 'The goal')
  sceneStart: number;               // Scene start time in composition (e.g. 37.0)
  originalFootageTimecode: string;  // Footage-relative offset (e.g. '00:05.10')
  originalFootageFrame: number;     // Footage-relative frame index (e.g. 153)
  originalFootageLocation: string;  // Formatted location (e.g. 'Scene 03 +00:05.10 (scene fr 153)')
  note: string;                     // Reviewer instructions
  shapes: Shape[];                  // Vector annotations on the frame
  imgUrl?: string;                  // Direct Azure Blob Storage image URL (preserving SAS)
}

interface Shape {
  k: "pen" | "arrow" | "rect" | "circle" | "text";
  c: string;                        // Stroke color (e.g. '#ff3b30')
  w: number;                        // Line width in px
  p: [number, number][];            // Normalized [x, y] coordinates (0.0 to 1.0)
  t?: string;                       // Text payload if k === 'text'
}

interface CompletedTask {
  id: string;                       // Unique feedback/task ID (e.g. 'fb-s03-bam')
  category: "latest" | "scenes" | "platform";
  scene: string;                    // Scene title or subsystem
  t: number | null;                 // Seek timecode (or null for platform pages)
  link?: string;                    // Optional link for platform pages (e.g. 'costs.html')
  commit?: string;                  // Git commit hash implementing the change (e.g. 'fbd5e1a')
  title: string;                    // Summary of what was done
  draft: string;                    // Draft or site version
  desc: string;                     // Technical description of the change
  imgUrl?: string;                  // Optional reference image URL
  createdAt?: string;               // ISO 8601 creation timestamp
  resolvedAt?: string;              // ISO 8601 resolution timestamp
  duration?: string;                // Human-readable resolution turnaround (e.g. '24m 41s')
}
```

---

## 3. Video & Frame Download Naming Specification

To eliminate ambiguity when reviewers download assets locally or share them with editors, all downloads follow a strict, human-readable naming convention containing the project slug, draft number, and review context.

### 1. Master Review Video Download
```
${Project-Slug}-Draft-v${DraftNumber}-Review.mp4
```
*Example:* `UK-Director-Liquidation-Part-1-Draft-v9-Review.mp4`

Provided as an explicit download button in the player control bar on `review.html`:
```html
<button id="dlVideoBtn" class="pri">⬇ Download Video (UK-Director-Liquidation-Part-1-Draft-v9-Review.mp4)</button>
<button id="dlNotesBtn">⬇ Notes (.md)</button>
```

### 2. Review Notes Markdown Download
```
${Project-Slug}-Draft-v${DraftNumber}-Review-Feedback.md
```
*Example:* `UK-Director-Liquidation-Draft-v9-Review-Feedback.md`

### 3. Annotated Frame Capture Download (PNG)
```
${Project-Slug}-Draft-v${DraftNumber}-Review-${Timecode}-${FeedbackId}.png
```
*Example:* `UK-Director-Liquidation-Draft-v9-Review-00-42-10-fb-1270-38a4.png`

### 4. Azure Blob Cloud Upload (JPEG)
```
${Project-Slug}-Draft-v${DraftNumber}-Review-${Timecode}-${FeedbackId}.jpg
```
*Example:* `UK-Director-Liquidation-Draft-v9-Review-03-13-00-fb-5820-502d.jpg`

---

## 4. Drawing Engine & Canvas Synchronization

The review interface overlays an HTML5 `<canvas>` directly over the native `<video>` element within an absolute-positioned container:

```html
<div class="stage">
  <video id="v" controls playsinline poster="poster.jpg"></video>
  <canvas id="cv"></canvas>
</div>
```

### Responsive Video Box Calculation
Videos often letterbox inside their containers. The canvas matches `devicePixelRatio` and bounds drawing strictly to the rendered video rectangle:

```javascript
function videoBox(canvasWidth, canvasHeight) {
  const vw = video.videoWidth || 16;
  const vh = video.videoHeight || 9;
  const scale = Math.min(canvasWidth / vw, canvasHeight / vh);
  return {
    x: (canvasWidth - vw * scale) / 2,
    y: (canvasHeight - vh * scale) / 2,
    w: vw * scale,
    h: vh * scale
  };
}
```

---

## 5. Azure Blob Direct Upload (No Server Proxy)

When a reviewer marks a frame, the client composites the video frame and vector overlay into an offscreen canvas and uploads it directly to Azure Blob Storage using a container-scoped Shared Access Signature (SAS).

```javascript
async function uploadToAzure(marker, sasUrl) {
  const blob = await captureFrameBlob(marker);
  const u = new URL(sasUrl);
  const cid = marker.cid || `fb-${marker.frame}-${uid()}`;
  marker.cid = cid;
  const filename = `UK-Director-Liquidation-Draft-v${draftN}-Review-${formatTimecode(marker.t)}-${cid}.jpg`;
  
  // Destination: https://<account>.blob.core.windows.net/<container>/<folder>/<filename>?<sasToken>
  const putUrl = `${u.origin}${u.pathname.replace(/\/$/, "")}/hyperframes/${filename}${u.search}`;

  const res = await fetch(putUrl, {
    method: "PUT",
    headers: {
      "x-ms-blob-type": "BlockBlob",
      "Content-Type": "image/jpeg"
    },
    body: blob
  });

  if (res.ok) {
    marker.imgUrl = putUrl;
    persist();
  }
}
```

---

## 6. Markdown Feedback Export with Unique IDs & Footage Timecodes

Clicking **"📋 Copy feedback for Claude"** generates a standardized Markdown block where every item includes an explicit `[id: fb-...]` tag and footage-relative offset:

```markdown
Review feedback on "UK Director Liquidation, Part 1 of 3: Using AI to Beat the Red Tape (draft v9)" (page v1.23.0, site v1.23.0)
https://rifaterdemsahin.github.io/hyperframes/review.html

## Scene 03 · The goal (00:37 to 00:57)
- 00:42.10 (comp frame 1270) [footage: +00:05.10 / scene fr 153] [id: fb-1270-38a4]: remove the sound effect bang from the background

## Scene 07 · What my emails taught me (02:33 to 02:56)
- 02:38.26 (comp frame 4766) [footage: +00:05.26 / scene fr 158] [id: fb-4766-9b12]: it is not process stops it is process starts when all balance in the liquidation company is paid off. Update subtitle and text.

## Scene 08 · How I keep track of it (02:56 to 03:20)
- 03:13.00 (comp frame 5820) [footage: +00:16.00 / scene fr 480] [id: fb-5820-502d] [drawing: 1 rect] [image: https://animationasistant.blob.core.windows.net/live-overlay-feedback/hyperframes/UK-Director-Liquidation-Draft-v9-Review-03-13-00-fb-5820-502d.jpg?...]: change the question sound tone when the friend asks; enlarge and center the quote card

## 🖼️ Visual Drawing References (Public & Consumable by Claude)
- **03:13.00 (comp frame 5820 · footage: +00:16.00 / scene fr 480 · Scene 08 · [id: fb-5820-502d])**: https://animationasistant.blob.core.windows.net/live-overlay-feedback/hyperframes/UK-Director-Liquidation-Draft-v9-Review-03-13-00-fb-5820-502d.jpg?...
```

### Quick ID Copy Button
Each feedback item card in the UI includes a `📋 Copy ID` button next to its pill badge, allowing reviewers and editors to instantly copy `fb-1270-38a4` to the clipboard for fast communication in PRs, issues, or chats.

### Git Commit Traceability Contract
When coding agents implement feedback, the commit message must reference the feedback ID:
```bash
git commit -m "Remove BAM sfx in Scene 03 [id: fb-1270-38a4] and update Scene 07 balance rule [id: fb-4766-9b12]"
```

---

## 7. Completed Tasks Verification Carousel

Directly beneath the **➕ Add feedback** form, an interactive **Completed Tasks Verification Carousel** allows reviewers to audit all historical and newly completed items. The **➕ Add feedback** form itself is collapsible with persistent browser memory, enabling reviewers to collapse the input controls (`▾ Collapse` / `▸ Expand`) and bring the Verification Carousel directly to the top of the sticky sidebar:

1. **Category & Verification Filtering**: Chips filter tasks across `All (24)`, `✅ Verified (0)`, `⏳ Not verified (24)`, `Latest (5)`, `Scenes (16)`, and `Platform (3)`. Dynamic badge counts update in real time as reviewers verify tasks.
2. **Quick Jump Selector**: A dropdown lists all tasks with their `[fb-...]` IDs for instant selection.
3. **Turnaround & Resolution Timing**: Each completed task card highlights creation time (`📅 Created: 2026-11-20 16:46 UTC`), resolution timestamp (`🏁 Resolved: 2026-11-20 17:10 UTC`), and the exact turnaround duration pill (`⏱️ Resolved in 24m 41s`). Live feedback items marked `✅ Done` automatically record `resolvedAt` and calculate real-time turnaround.
4. **One-Click Video Scrubbing**: Clicking `▶ Verify in Video (03:13.00)` pauses playback, seeks the HTML5 video directly to the timecode, redraws vector annotations on the canvas, and smoothly scrolls to the player.
5. **Copy Task ID**: Every task card features a `📋 Copy ID` button for instant clipboard access.
6. **Direct Git Commit Links**: Each card renders a clickable link to the git commit that implemented the task (e.g. `Commit: fbd5e1a`).
7. **Persistent Verification Checkboxes**: Checkboxes save verification state to `localStorage` under `review-verified-v1`, updating the progress summary counter (e.g. `5/24 verified`).
8. **Keyboard Navigation**: Reviewers can cycle through items using Left/Right Arrow keys (`←`/`→`) or square brackets (`[`/`]`).

---

## 8. Feedback Implementation & Auto-Clearing Loop

To prevent duplicate work across releases, implemented feedback is automatically cleared from the reviewer's browser without deleting newly added notes:

1. **Agent Implementation**: The coding agent implements the requested changes.
2. **Version Bump with Clear Flag**:
   ```bash
   node scripts/version.mjs bump minor "Implemented review feedback" review.html --clear-notes=review.html
   ```
3. **Stamping `clearedAt`**:
   `version.mjs` stamps `window.SITE_INFO.clearedAt = "2026-11-20T12:00:00Z"` into `nav.js`.
4. **Browser Retention Logic**:
   On the next page load, `review.html` filters out notes created before `clearedAt`:
   ```javascript
   const cleared = (window.SITE_INFO && window.SITE_INFO.clearedAt) || "";
   if (cleared) {
     items = items.filter((i) => !(i.ts && new Date(i.ts).toISOString() < cleared));
     localStorage.setItem(KEY, JSON.stringify(items));
   }
   ```

---

## 9. Quick Recipe to Replicate in a New Project

1. **Copy the Review Generator**: Copy `scripts/build-review-page.mjs` into your new repo.
2. **Define Scenes and Video Slug**: In `script/scenes.json`, define scenes and set the project video slug.
3. **Configure Azure Container SAS**:
   - Create a private Azure Blob Container (e.g. `video-reviews`).
   - Generate a container SAS token with `racwdl` permissions (Read, Add, Create, Write, Delete, List).
   - In the review page UI, paste the SAS URL or bookmark with `#sas=<url_encoded_sas>`.
4. **Add Version Clearing**: Use `version.mjs` to bump versions and stamp `clearedAt`.
