// Builds renders.html: comprehensive view of all video renders, MP4 assets, live composition status, and pipeline render state.
// Run: node scripts/build-renders-page.mjs
import { readFileSync, writeFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const J = (p) => JSON.parse(readFileSync(`${root}/${p}`, "utf8"));
const S = J("script/scenes.json"), V = J("versions.json");
const VERS = J("draft/versions.json"), N = VERS.latest;
const PERF = existsSync(`${root}/spec/performance.json`) ? J("spec/performance.json") : { runs: [] };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const tc = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;

let renderedN = N;
while (renderedN > 1 && !existsSync(`${root}/draft/v${renderedN}/video.mp4`)) {
  renderedN--;
}
const isRenderPending = (renderedN !== N);

// Build catalog of all draft versions
const drafts = VERS.versions.map((ver) => {
  const mp4Path = `${root}/draft/v${ver.n}/video.mp4`;
  const metaPath = `${root}/draft/v${ver.n}/meta.json`;
  const framesPath = `${root}/draft/v${ver.n}/frames`;

  const isRendered = existsSync(mp4Path);
  let size = 0;
  if (isRendered) {
    try { size = statSync(mp4Path).size; } catch (_) {}
  }
  const meta = existsSync(metaPath) ? J(`draft/v${ver.n}/meta.json`) : null;
  const frameCount = existsSync(framesPath) ? readdirSync(framesPath).filter((f) => f.endsWith(".jpg")).length : 0;
  const poster = existsSync(`${framesPath}/s01-hook.jpg`) ? `draft/v${ver.n}/frames/s01-hook.jpg` : `draft/v${renderedN}/frames/s01-hook.jpg`;

  return {
    n: ver.n,
    label: ver.label,
    date: ver.date,
    changes: ver.changes || [],
    isRendered,
    size,
    sizeStr: size ? mb(size) : "Pending render",
    meta,
    duration: meta?.duration || (S.scenes.at(-1).start + S.scenes.at(-1).duration),
    frameCount,
    poster,
    mp4Url: isRendered ? `draft/v${ver.n}/video.mp4` : null,
    isCurrentComposition: ver.n === N,
    isCurrentStreaming: ver.n === renderedN
  };
}).sort((a, b) => b.n - a.n);

const activeVideo = drafts.find((d) => d.isCurrentStreaming) || drafts[0];

// ---- Render timing, measured by scripts/render-draft.mjs (spec/performance.json + draft/vN/meta.json)
const secs = (n) => n == null ? "–" : n >= 60 ? `${Math.floor(n / 60)} min ${String(Math.round(n % 60)).padStart(2, "0")} s` : `${Math.round(n)} s`;
const stepOf = (run, prefix) => run.steps.find((x) => x.name.startsWith(prefix))?.seconds ?? null;
const median = (a) => { const b = [...a].sort((x, y) => x - y); const m = b.length >> 1; return b.length ? (b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2) : null; };
const runs = PERF.runs || [];
const lastRun = runs.at(-1) || null;
const recent = runs.slice(-5);
const timing = {
  runs: runs.length,
  machine: lastRun?.machine || "unknown",
  lastTotal: lastRun?.total ?? null,
  lastRender: lastRun ? stepOf(lastRun, "Render") : null,
  recentTotals: recent.map((r) => r.total),
  recentRenders: recent.map((r) => stepOf(r, "Render")).filter((x) => x != null),
  allTotals: runs.map((r) => r.total),
};
timing.medianTotal = median(timing.recentTotals);
timing.medianRender = median(timing.recentRenders);
const stepRows = lastRun ? lastRun.steps.map((st) => `<tr><td>${esc(st.name)}</td><td style="font-family:ui-monospace,monospace;white-space:nowrap">${secs(st.seconds)}</td><td style="font-size:12.5px;color:var(--mute)">${esc(st.note || "")}</td></tr>`).join("") : "";

// Active scene compositions in video/compositions/
const scenesList = S.scenes.map((sc, i) => {
  const compFile = `video/compositions/${sc.id}.html`;
  const exists = existsSync(`${root}/${compFile}`);
  const isV10Changed = sc.id === "s08-tracking" || sc.id === "s10-outro";
  let snapshot = null;
  if (sc.id === "s08-tracking") snapshot = "docs/snapshots/s08-fixed-194.06s.png";
  if (sc.id === "s10-outro") snapshot = "docs/snapshots/s10-fixed-241.01s.png";

  return {
    id: sc.id,
    num: String(i + 1).padStart(2, "0"),
    title: sc.title,
    start: sc.start,
    duration: sc.duration,
    compFile,
    exists,
    isV10Changed,
    snapshot
  };
});

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Video Renders & Render State · Hyperframes</title>
<link rel="stylesheet" href="site.css">
<style>
.crumbs{font-size:13px;color:var(--mute);margin-bottom:8px}
.pill{display:inline-flex;align-items:center;gap:5px;font-size:11.5px;font-weight:700;padding:2px 10px;border-radius:999px;border:1px solid var(--line)}
.pill.ok{background:rgba(47,133,90,.15);color:var(--ok);border-color:rgba(47,133,90,.3)}
.pill.warn{background:rgba(255,209,102,.15);color:var(--warn);border-color:rgba(255,209,102,.35)}
.pill.pri{background:rgba(76,195,217,.15);color:var(--accent);border-color:rgba(76,195,217,.35)}
.kpi-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:12px;margin:16px 0 24px}
.kpi-card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 16px;display:flex;flex-direction:column;gap:4px}
.kpi-card .label{font-size:12px;color:var(--mute);font-weight:600;text-transform:uppercase;letter-spacing:.03em}
.kpi-card .val{font-size:22px;font-weight:800;color:var(--ink);line-height:1.2}
.kpi-card .sub{font-size:12px;color:var(--mute);margin-top:2px}
.render-banner{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:16px 0;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.stage{position:relative;background:#000;border-radius:12px;overflow:hidden;border:1px solid var(--line);margin:16px 0}
.stage video{width:100%;max-height:68vh;display:block;background:#000}
.ver-switcher{display:flex;gap:6px;flex-wrap:wrap;margin:12px 0}
.ver-btn{font:inherit;font-size:12px;padding:5px 10px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer;transition:all .15s}
.ver-btn:hover{border-color:var(--accent);color:var(--accent)}
.ver-btn.active{background:var(--accent);color:#04222a;border-color:var(--accent);font-weight:700}
.table-wrap{overflow-x:auto;margin:16px 0}
.comp-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:12px;margin:16px 0}
.comp-card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px;display:flex;flex-direction:column;gap:6px;transition:border-color .15s}
.comp-card:hover{border-color:var(--accent)}
.comp-card.updated{border-color:rgba(76,195,217,.6);box-shadow:0 0 12px rgba(76,195,217,.15)}
pre.cli{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:12px;font:13px/1.5 ui-monospace,monospace;overflow-x:auto;position:relative}
.copy-btn{position:absolute;top:8px;right:8px;font-size:11px;padding:3px 8px;border-radius:6px;border:1px solid var(--line);background:var(--bg);color:var(--ink);cursor:pointer}
</style></head><body>
<script src="nav.js?v=${V.site}"></script>
<main style="max-width:1100px">
  <div class="crumbs">🎬 2 Build &nbsp;·&nbsp; Production Pipeline</div>
  <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-bottom:8px">
    <h1 style="margin:0">🎬 Video Renders &amp; Render State</h1>
    <div style="display:flex;gap:6px;align-items:center">
      <span class="pill pri">Composition: Draft v${N}</span>
      <span class="pill ok">Active Streaming: Draft v${renderedN}</span>
    </div>
  </div>
  <p class="lead">Complete audit of all Hyperframes MP4 video cuts, render times, file sizes, live composition templates, and active server streaming state.</p>

  <!-- Live Render State Banner -->
  <div class="render-banner" style="${isRenderPending ? "border-color:rgba(255,209,102,.45);background:rgba(255,209,102,.07)" : "border-color:rgba(47,133,90,.3);background:rgba(47,133,90,.05)"}">
    <div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="pill ${isRenderPending ? "warn" : "ok"}">${isRenderPending ? "⏳ Composition Live · Render Pending" : "✅ Current Draft Fully Rendered"}</span>
        <b style="font-size:15px;color:var(--ink)">${isRenderPending ? `Draft v${N} composition updated · Serving Draft v${renderedN} video render` : `Draft v${N} 1080p Master Rendered`}</b>
      </div>
      <div style="font-size:12.5px;color:var(--mute);margin-top:4px">
        Active MP4 Asset: <code>draft/v${renderedN}/video.mp4</code> (${activeVideo.sizeStr}) · Serving with HTTP 206 Partial Content range seeking
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center">
      <a href="review.html" class="pill pri" style="text-decoration:none;padding:6px 14px;font-size:13px">🔍 Open Review</a>
      <a href="first-draft.html" class="pill" style="text-decoration:none;padding:6px 14px;font-size:13px">🎞️ Draft Player</a>
    </div>
  </div>

  <!-- KPI Grid -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <span class="label">Live Composition Code</span>
      <span class="val" style="color:var(--accent)">Draft v${N}</span>
      <span class="sub">10 scenes in <code>video/compositions/</code></span>
    </div>
    <div class="kpi-card">
      <span class="label">Streaming Master Video</span>
      <span class="val" style="color:var(--ok)">Draft v${renderedN}</span>
      <span class="sub">${activeVideo.sizeStr} · 1080p @ 30 FPS</span>
    </div>
    <div class="kpi-card">
      <span class="label">Runtime &amp; Audio Pacing</span>
      <span class="val">${tc(activeVideo.duration)}</span>
      <span class="sub">172 WPM · Kokoro TTS (bm_lewis)</span>
    </div>
    <div class="kpi-card">
      <span class="label">Hyperframes QA Check</span>
      <span class="val" style="color:var(--ok)">${esc((activeVideo.meta?.check || "not recorded").split(",")[0])}</span>
      <span class="sub">${esc(activeVideo.meta?.check || "")} · Draft v${renderedN}</span>
    </div>
    <div class="kpi-card">
      <span class="label">Time to Render a Draft</span>
      <span class="val">${secs(timing.lastTotal)}</span>
      <span class="sub">Last run end to end · ${secs(timing.lastRender)} of it is the MP4 render · <a href="#render-time">breakdown</a></span>
    </div>
  </div>

  <!-- Interactive Player & Switcher -->
  <h2 style="margin-top:24px">📺 Interactive Video Player &amp; Cut Audition</h2>
  <p style="font-size:13.5px;color:var(--mute);margin-top:-6px">Switch between any rendered draft cut to compare audio cadence, overlay adjustments, and motion polish.</p>
  
  <div class="ver-switcher" id="switcher">
    ${drafts.filter((d) => d.isRendered).map((d) => `<button class="ver-btn${d.n === renderedN ? " active" : ""}" data-src="${d.mp4Url}" data-n="${d.n}" data-label="${esc(d.label)}" data-size="${d.sizeStr}" data-poster="${d.poster}">Draft v${d.n} (${esc(d.label)} · ${d.sizeStr})</button>`).join("")}
  </div>

  <div class="stage">
    <video id="player" controls preload="metadata" poster="${activeVideo.poster}" src="${activeVideo.mp4Url}"></video>
  </div>
  <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;font-size:13px;color:var(--mute);margin-top:4px">
    <span id="playerMeta">Now playing: <b>Draft v${renderedN} (${esc(activeVideo.label)})</b> · ${activeVideo.sizeStr}</span>
    <a id="playerDl" href="${activeVideo.mp4Url}" download="UK-Director-Liquidation-Part-1-Draft-v${renderedN}-Render.mp4" class="pill pri" style="text-decoration:none">⬇ Download this MP4</a>
  </div>

  <!-- Complete Renders Catalog Table -->
  <h2 style="margin-top:36px">📊 All Draft Video Renders (v1 to v${N})</h2>
  <div class="table-wrap">
    <table>
      <thead>
        <tr>
          <th>Version</th>
          <th>Date</th>
          <th>Render Status</th>
          <th>File Size</th>
          <th>Duration</th>
          <th>Render Time</th>
          <th>What Changed</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${drafts.map((d) => `
        <tr style="${d.n === N ? "background:rgba(76,195,217,.06)" : ""}">
          <td>
            <b style="font-size:14px;color:var(--accent)">Draft v${d.n}</b><br>
            <small style="color:var(--mute)">${esc(d.label)}</small>
            ${d.n === N ? '<br><span class="pill pri" style="font-size:10px;padding:1px 6px;margin-top:4px">Latest Code</span>' : ''}
            ${d.isCurrentStreaming ? '<br><span class="pill ok" style="font-size:10px;padding:1px 6px;margin-top:4px">Streaming MP4</span>' : ''}
          </td>
          <td style="white-space:nowrap;font-size:12.5px">${esc(d.date)}</td>
          <td>
            ${d.isRendered ? '<span class="pill ok">✅ Rendered MP4</span>' : '<span class="pill warn">⏳ Render Pending</span>'}
          </td>
          <td style="white-space:nowrap;font-family:ui-monospace,monospace;font-size:12.5px">
            ${d.isRendered ? d.sizeStr : '<span style="color:var(--mute)">In composition</span>'}
          </td>
          <td style="white-space:nowrap;font-family:ui-monospace,monospace;font-size:12.5px">${tc(d.duration)}</td>
          <td style="white-space:nowrap;font-family:ui-monospace,monospace;font-size:12.5px">${d.meta?.renderSeconds != null ? `${secs(d.meta.renderSeconds)}<br><small style="color:var(--mute)">${d.meta.workers ?? "?"} workers</small>` : '<span style="color:var(--mute)">–</span>'}</td>
          <td style="font-size:12.5px;max-width:380px">
            <ul style="margin:2px 0;padding-left:16px">
              ${d.changes.slice(0, 3).map((c) => `<li>${esc(c)}</li>`).join("")}
              ${d.changes.length > 3 ? `<li><small style="color:var(--mute)">+${d.changes.length - 3} more changes</small></li>` : ""}
            </ul>
          </td>
          <td style="white-space:nowrap">
            ${d.isRendered ? `
              <div style="display:flex;flex-direction:column;gap:4px">
                <button class="pill ver-btn" data-src="${d.mp4Url}" data-n="${d.n}" data-label="${esc(d.label)}" data-size="${d.sizeStr}" data-poster="${d.poster}" style="font-size:11px;padding:2px 8px;cursor:pointer">▶ Play Cut</button>
                <a href="${d.mp4Url}" download="UK-Director-Liquidation-Draft-v${d.n}.mp4" style="font-size:11px;color:var(--accent);text-decoration:underline">⬇ Download</a>
                <a href="review.html" style="font-size:11px;color:var(--mute);text-decoration:underline">🔍 Review</a>
              </div>
            ` : `
              <a href="video/compositions/s08-tracking.html" target="_blank" style="font-size:11.5px;color:var(--accent);font-weight:700;text-decoration:underline">🎬 Live Compositions ↗</a>
            `}
          </td>
        </tr>
        `).join("")}
      </tbody>
    </table>
  </div>

  <!-- Render time -->
  <h2 id="render-time" style="margin-top:36px">⏱️ How Long a Render Takes</h2>
  <p style="font-size:13.5px;color:var(--mute);margin-top:-6px">Measured by <code>node scripts/render-draft.mjs</code> on every draft (${timing.runs} runs recorded, ${esc(timing.machine)}). Rendered locally; the clock covers build, check, render, web copy, frames and site pages.</p>
  <div class="kpi-grid">
    <div class="kpi-card"><span class="label">Typical end to end (last 5 runs)</span><span class="val">${secs(timing.medianTotal)}</span><span class="sub">median · range ${secs(Math.min(...timing.recentTotals))} to ${secs(Math.max(...timing.recentTotals))}</span></div>
    <div class="kpi-card"><span class="label">Of which: MP4 render (last 5)</span><span class="val">${secs(timing.medianRender)}</span><span class="sub">1080p, 30 fps, with sound, high quality</span></div>
    <div class="kpi-card"><span class="label">All runs, end to end</span><span class="val">${secs(Math.min(...timing.allTotals))} to ${secs(Math.max(...timing.allTotals))}</span><span class="sub">grew as scenes gained animation and HD visuals</span></div>
  </div>
  ${lastRun ? `<div class="table-wrap"><table><thead><tr><th>Step (last run, ${esc(lastRun.at.slice(0, 16).replace("T", " "))} UTC)</th><th>Time</th><th>Note</th></tr></thead><tbody>${stepRows}<tr><td><b>Total</b></td><td style="font-family:ui-monospace,monospace"><b>${secs(lastRun.total)}</b></td><td></td></tr></tbody></table></div>` : ""}

  <!-- Live Hyperframes Scene Compositions -->
  <h2 style="margin-top:36px">🎬 Live Hyperframes Compositions (10 Scenes)</h2>
  <p style="font-size:13.5px;color:var(--mute);margin-top:-6px">Each scene runs in its own HTML/GSAP composition inside <code>video/compositions/</code>. You can open any scene directly in the browser to preview real-time vector animations before rendering to MP4.</p>

  <div class="comp-grid">
    ${scenesList.map((sc) => `
    <div class="comp-card${sc.isV10Changed ? " updated" : ""}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <b style="font-size:13px;color:var(--ink)">Scene ${sc.num} · ${esc(sc.title)}</b>
        ${sc.isV10Changed ? '<span class="pill pri" style="font-size:9.5px;padding:1px 5px">Draft v10 Update</span>' : ''}
      </div>
      <div style="font-size:11.5px;color:var(--mute)">
        ⏱️ Timecode: <b>${tc(sc.start)}</b> (${Math.round(sc.duration)}s duration)
      </div>
      <div style="margin-top:auto;display:flex;justify-content:space-between;align-items:center;padding-top:6px;border-top:1px solid var(--line)">
        <a href="${sc.compFile}" target="_blank" style="font-size:11.5px;color:var(--accent);font-weight:700;text-decoration:underline">Live Composition ↗</a>
        ${sc.snapshot ? `<a href="${sc.snapshot}" target="_blank" style="font-size:11px;color:var(--ok);text-decoration:underline">Verified Snapshot 📸</a>` : `<span style="font-size:10.5px;color:var(--mute)"><code>${sc.id}.html</code></span>`}
      </div>
    </div>
    `).join("")}
  </div>

  <!-- CLI Commands Cheat Sheet -->
  <h2 style="margin-top:36px">⌨️ Production CLI &amp; Render Commands</h2>
  <p style="font-size:13.5px;color:var(--mute);margin-top:-6px">Execute local renders, run comprehensive lint and WCAG contrast checks, or generate thumbnail master plates.</p>

  <pre class="cli"><code><span style="color:var(--mute)"># 1. Full end-to-end draft build &amp; timed render with performance recording:</span>
node scripts/render-draft.mjs --version=10

<span style="color:var(--mute)"># 2. Local 1080p Drawelement render using pinned Hyperframes 0.9.67:</span>
cd video && npx --yes hyperframes@0.9.67 render --quality looks --output renders/draft-v10.mp4

<span style="color:var(--mute)"># 3. Comprehensive Hyperframes lint, layout, and WCAG AA contrast check:</span>
cd video && npm run check

<span style="color:var(--mute)"># 4. Generate 1280x720 thumbnail designs via headless Chrome &amp; FFmpeg:</span>
scripts/build-thumbnails.sh</code><button class="copy-btn" id="copyCliBtn">Copy Commands</button></pre>

  <div class="note" style="margin-top:20px">
    <b>Render contract &amp; zero-bloat policy:</b> Video renders are deterministic and timed to milliseconds using GSAP timelines registered on <code>window.__timelines</code>. Heavy master 1080p MP4 files are published via GitHub Releases and Fly.io HTTP 206 streaming proxies rather than inflating git history.
  </div>
</main>

<script>
const player = document.getElementById("player");
const metaEl = document.getElementById("playerMeta");
const dlEl = document.getElementById("playerDl");

document.querySelectorAll(".ver-btn").forEach((btn) => {
  btn.onclick = () => {
    const src = btn.dataset.src;
    const n = btn.dataset.n;
    const label = btn.dataset.label;
    const size = btn.dataset.size;
    const poster = btn.dataset.poster;

    if (!src) return;

    document.querySelectorAll(".ver-btn").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    player.src = src;
    if (poster) player.poster = poster;
    player.load();
    player.play().catch(() => {});

    metaEl.innerHTML = "Now playing: <b>Draft v" + n + " (" + label + ")</b> · " + size;
    dlEl.href = src;
    dlEl.download = "UK-Director-Liquidation-Part-1-Draft-v" + n + "-Render.mp4";
    dlEl.textContent = "⬇ Download Draft v" + n + " MP4 (" + size + ")";
  };
});

const copyCli = document.getElementById("copyCliBtn");
if (copyCli) {
  copyCli.onclick = () => {
    const txt = "node scripts/render-draft.mjs --version=10\\ncd video && npx --yes hyperframes@0.9.67 render --quality looks --output renders/draft-v10.mp4\\ncd video && npm run check";
    if (navigator.clipboard) {
      navigator.clipboard.writeText(txt).then(() => {
        copyCli.textContent = "✓ Copied!";
        setTimeout(() => (copyCli.textContent = "Copy Commands"), 1500);
      });
    }
  };
}
</script>
</body></html>
`;

writeFileSync(`${root}/renders.html`, html);
console.log(`wrote renders.html (${drafts.length} drafts cataloged, active streaming v${renderedN})`);
