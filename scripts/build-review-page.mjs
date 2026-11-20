// Builds review.html: watch the draft, leave timestamped notes and drawings on any frame, copy them for the chat.
// Modelled on the review.html in the live-overlay-video repo (timecode, frame stepping, drawing tools, backlog / in progress / done),
// but with no server: notes live in this browser and "Copy feedback for Claude" carries them into the chat.
// Run: node scripts/build-review-page.mjs      Data: script/scenes.json, spec/publish.json, draft/meta.json
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const J = (p) => JSON.parse(readFileSync(`${root}/${p}`, "utf8"));
const S = J("script/scenes.json"), PUB = J("spec/publish.json"), P = J("spec/project.json"), V = J("versions.json");
const VERS = J("draft/versions.json"), N = VERS.latest;
const M = existsSync(`${root}/draft/v${N}/meta.json`) ? J(`draft/v${N}/meta.json`) : { duration: S.scenes.at(-1).start + S.scenes.at(-1).duration };
const FPS = 30;

// the selected title (or the first), and the description as the Publish page builds it
const title = (PUB.titles.find((t) => t.selected) || PUB.titles[0]).text;
const ch = S.scenes.map((s) => ({ start: s.start, dur: s.duration, title: s.title }));
for (let i = 0; i < ch.length; i++) {
  if (ch[i].dur >= 10) continue;
  if (i < ch.length - 1) { ch[i + 1] = { start: ch[i].start, dur: ch[i].dur + ch[i + 1].dur, title: `${ch[i].title} and ${ch[i + 1].title}` }; ch.splice(i, 1); i--; }
  else { ch[i - 1].dur += ch[i].dur; ch[i - 1].title += ` and ${ch[i].title}`; ch.pop(); }
}
const tc = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const description = PUB.descriptionTemplate.replace("{{chapters}}", ch.map((c) => `${tc(c.start)} ${c.title}`).join("\n")).replace("{{disclaimer}}", P.disclaimer);

// per scene: sentences with approximate times (share of the words), so the page can show the line being spoken
const scenes = S.scenes.map((s, i) => {
  const sents = s.vo.split(/(?<=[.?!])\s+/).filter(Boolean);
  const w = sents.map((x) => x.split(/\s+/).length), wt = w.reduce((a, b) => a + b, 0);
  const t0 = s.start + 0.25, dur = s.voSeconds || s.duration - 0.5;
  let acc = 0;
  return {
    id: s.id, n: i + 1, title: s.title, start: s.start, end: s.start + s.duration,
    lines: sents.map((x, k) => { const a = t0 + (dur * acc) / wt; acc += w[k]; return { t: Math.round(a * 100) / 100, text: x }; }),
  };
});

const DATA = { fps: FPS, src: `draft/v${N}/video.mp4`, poster: `draft/v${N}/frames/${S.scenes[0].id}.jpg`, label: `🎬 Draft v${N}`, draftN: N, duration: M.duration, scenes, title, description, pageKey: "review.html", videoTitle: S.title };
const json = JSON.stringify(DATA).replace(/</g, "\\u003c");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Review · Draft v${N}</title>
<link rel="stylesheet" href="site.css">
<style>
.wrap{max-width:1500px;margin:0 auto;padding:16px 16px 90px}
.grid2{display:grid;grid-template-columns:minmax(0,2fr) minmax(300px,1fr);gap:16px;align-items:start}@media(max-width:950px){.grid2{grid-template-columns:1fr}}
h1{margin:0 0 8px}.badge{display:inline-block;min-width:22px;text-align:center;padding:1px 9px;border-radius:999px;background:var(--accent);color:#04222a;font:700 14px system-ui;vertical-align:middle}
.stage{position:relative;line-height:0;background:#000;border-radius:10px;overflow:hidden}.stage video{width:100%;display:block;max-height:68vh;object-fit:contain;background:#000}
#cv{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;touch-action:none}#cv.on{pointer-events:auto;cursor:crosshair}
#bigplay{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:88px;height:88px;border-radius:50%;border:3px solid #fff;background:#1f8f4acc;color:#fff;font-size:38px;padding:0 0 0 8px;cursor:pointer;z-index:3}#bigplay.hide{display:none}
.ctl{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin:10px 0}
button,select{font:inherit;padding:7px 12px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}button.pri{background:var(--accent);color:#04222a;border-color:var(--accent);font-weight:700}button.on{outline:2px solid var(--accent)}
button.big{padding:9px 18px;font-size:16px;font-weight:700;background:#1f8f4a;color:#fff;border-color:#27b95f}button.big.stop{background:#8a2a2a;border-color:#c44}
#tc{font:700 22px ui-monospace,monospace;color:var(--accent);min-width:120px}
.now{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:8px 0;font-size:14px}.now b{color:var(--accent)}.now .ln{color:var(--mute);margin-top:2px}
kbd{background:var(--card);border:1px solid var(--line);border-radius:4px;padding:1px 6px;font:12px ui-monospace,monospace}.hint,small{color:var(--mute)}
#panel{position:sticky;top:56px;border:1px solid var(--line);border-radius:14px;padding:12px;background:var(--card)}#panel textarea,.box textarea{width:100%;font:inherit;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:8px;resize:vertical}
#tools{display:none;gap:8px;flex-wrap:wrap;align-items:center;margin:8px 0;padding:8px;border:1px solid var(--line);border-radius:10px}#tools.on{display:flex}input[type=color]{width:40px;height:34px;padding:0;border:1px solid var(--line);border-radius:6px;background:none}
.m{border:1px solid var(--line);border-radius:10px;padding:8px 10px;margin:8px 0;background:var(--card)}.m b{font-family:ui-monospace,monospace;color:var(--accent);cursor:pointer}.m textarea{width:100%;margin-top:6px;font:inherit;background:var(--bg);color:var(--ink);border:1px solid var(--line);border-radius:8px;padding:6px;resize:vertical}.m .x{float:right;padding:1px 8px}.m.isdone{opacity:.6}
.pill{font-size:13px;padding:2px 10px;border-radius:999px;border:1px solid var(--line)}.pill.p{border-color:var(--accent);color:var(--accent)}.pill.d{border-color:var(--ok);color:var(--ok)}
.box{border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:12px 0;background:var(--card)}pre.post{white-space:pre-wrap;font:13px/1.5 system-ui;background:var(--bg);border:1px solid var(--line);border-radius:8px;padding:8px;margin:6px 0}
#msg{min-height:20px;font-size:14px}.ok{color:var(--ok)}.err{color:#ff6b6b}
</style></head><body data-feedback="custom">
<script src="nav.js?v=${V.site}"></script>
<div class="wrap">
  <div class="crumbs">🔍 3 Review</div>
  <h1>📝 Review · <span class="badge" style="background:var(--accent);color:#04222a;font-size:16px;padding:3px 12px;vertical-align:middle">Draft v${N}</span> <span class="badge" id="total">0</span></h1>
  <p class="lead">Watch <b>Draft v${N}</b> (${tc(M.duration)} runtime), pause on the exact moment, and say what to change. Notes are tied to the time, the frame and the script scene, and you can draw on the frame. Drawings auto-upload to Azure when configured, and "Copy feedback for Claude" outputs timestamped notes with direct Azure links.</p>
  <div class="grid2">
  <section>
    <div class="stage"><video id="v" controls preload="metadata" playsinline poster="${DATA.poster}"></video><canvas id="cv"></canvas><button id="bigplay" aria-label="Play" title="Play (Space)">▶</button></div>
    <div class="ctl"><button id="play" class="big">▶ Play</button><button id="stop" class="big stop">⏹ Stop</button><span id="tc">00:00.00</span><small id="fr">frame 0</small>
      <button id="fm">◀ frame</button><button id="fp">frame ▶</button><button id="b5">−5s</button><button id="f5">+5s</button>
      <select id="rate"><option>0.5</option><option selected>1</option><option>1.5</option><option>2</option></select></div>
    <div class="now" id="now"></div>
    <p class="hint"><kbd>M</kbd> add feedback &nbsp; <kbd>D</kbd> draw &nbsp; <kbd>A</kbd> arrow &nbsp; <kbd>Space</kbd>/<kbd>K</kbd> play/pause &nbsp; <kbd>←</kbd><kbd>→</kbd> frame &nbsp; <kbd>Shift</kbd>+<kbd>←</kbd><kbd>→</kbd> 1 s &nbsp; <kbd>J</kbd> −5 s <kbd>L</kbd> +5 s &nbsp; <kbd>⌘/Ctrl Z</kbd> undo stroke</p>
    <div class="box"><h3 style="margin:0 0 6px">📣 Post copy</h3><div id="posts"></div></div>
  </section>
  <aside id="panel">
    <h2 style="margin:0 0 8px">➕ Add feedback <span class="badge" id="count2">0</span></h2>
    <div class="hint" style="margin-bottom:6px">At <b id="atTc">00:00.00</b> · <b id="atScene"></b></div>
    <textarea id="note" rows="3" placeholder="What should change at this moment? (Enter adds, Shift+Enter new line)"></textarea>
    <div class="ctl"><button class="pri" id="add" style="flex:1;padding:11px">📍 Add feedback (M)</button><button id="draw">✏️ Draw (D)</button><button id="arrowBtn">➡️ Arrow (A)</button></div>
    <div id="tools"><button data-tool="pen" class="on">🖊️</button><button data-tool="arrow">➡️</button><button data-tool="rect">▭</button><button data-tool="circle">◯</button><button data-tool="text">🔤</button><input type="color" id="col" value="#ff3b30"><select id="wid"><option value="3">thin</option><option value="6" selected>medium</option><option value="11">thick</option></select><button id="undo">↩️</button><button id="clr">🧹</button><small style="flex-basis:100%">Draw on the paused frame, then <b>Add feedback</b>.</small></div>
    <div id="msg"></div>
    <div class="ctl"><button class="pri" id="copy" style="flex:1;padding:11px">📋 Copy feedback for Claude</button></div>
    <small class="hint">Open items only. Done items stay in the list but are left out of the copy.</small>
    <div style="margin-top:12px;padding:8px 10px;background:rgba(255,255,255,.04);border:1px solid var(--line);border-radius:10px;font-size:12px">
      <details id="azDetails">
        <summary style="cursor:pointer;color:var(--accent);font-weight:600">☁️ Azure Storage for Drawings <span id="azStatus" style="font-size:11px;color:var(--mute)"></span></summary>
        <div style="margin-top:6px;display:flex;gap:6px">
          <input id="azSas" type="password" placeholder="Azure SAS URL (stored in browser only)" style="flex:1;padding:5px 8px;font-size:12px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--ink)">
          <button id="saveSas" style="padding:5px 10px;font-size:12px">Save</button>
        </div>
        <small class="hint" style="display:block;margin-top:4px">Drawings auto-upload to Azure and output direct image links in the copied feedback.</small>
      </details>
    </div>
  </aside>
  </div>
  <div class="ctl" style="justify-content:space-between;margin-top:18px"><h2 style="margin:0">🗂️ Feedback <span class="badge" id="count">0</span></h2><div id="states" class="ctl" style="margin:0"></div>
    <div class="ctl" style="margin:0"><select id="sfilter"><option value="open" selected>Open (backlog + in progress)</option><option value="backlog">Backlog</option><option value="in-progress">In progress</option><option value="done">Done</option><option value="">All</option></select><button id="clear">🗑️ Clear all</button></div></div>
  <div id="list"></div>
  <textarea id="fallback" hidden readonly style="width:100%;height:150px;font:12px ui-monospace,monospace"></textarea>
</div>
<script>
const R = ${json};
const KEY = "review-v2", FPS = R.fps, KEY_SAS = "azure-feedback-sas-v1";
const $ = (id) => document.getElementById(id), v = $("v"), cv = $("cv"), ctx = cv.getContext("2d");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const uid = () => Math.random().toString(16).slice(2, 10);
const fmt = (t) => { const m = Math.floor(t / 60), s = Math.floor(t % 60), f = Math.round((t % 1) * FPS) % FPS; return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + "." + String(f).padStart(2, "0"); };
const sceneAt = (t) => R.scenes.find((s) => t >= s.start && t < s.end) || R.scenes[R.scenes.length - 1];
v.src = R.src;

function getSas() {
  try {
    const h = (location.hash || "").match(/sas=([^&]+)/);
    if (h) {
      const decoded = decodeURIComponent(h[1]);
      localStorage.setItem(KEY_SAS, decoded);
      history.replaceState(null, "", location.pathname + location.search);
      return decoded;
    }
    return localStorage.getItem(KEY_SAS) || "";
  } catch (e) { return ""; }
}
function updateAzStatus() {
  const sas = getSas();
  const el = $("azStatus");
  if (el) el.textContent = sas ? "✅ Connected" : "⚠️ Not set";
  if ($("azSas") && sas && !$("azSas").value) $("azSas").value = sas;
}
if ($("saveSas")) {
  $("saveSas").onclick = () => {
    const val = ($("azSas").value || "").trim();
    if (val) localStorage.setItem(KEY_SAS, val); else localStorage.removeItem(KEY_SAS);
    updateAzStatus();
    $("msg").className = "ok";
    $("msg").textContent = val ? "Azure SAS URL saved." : "Azure SAS cleared.";
  };
}

// ---- notes live in this browser; those written before the last "feedback implemented" release are deleted (newer stay)
let items = []; try { items = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) {}
const cleared = (window.SITE_INFO && window.SITE_INFO.clearedAt) || "";
if (cleared) items = items.filter((i) => !(i.ts && new Date(i.ts).toISOString() < cleared));
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(items)); } catch (e) {} };
persist();

let tool = "pen", drawing = false, shapes = [], cur = null, drawMode = false;

// ---- player
function syncPlay() { const p = !v.paused; $("play").textContent = p ? "⏸ Pause" : "▶ Play"; $("bigplay").classList.toggle("hide", p || drawMode); }
const toggle = () => { if (v.paused) v.play(); else v.pause(); };
function tick() {
  const t = v.currentTime, s = sceneAt(t);
  $("tc").textContent = fmt(t); $("atTc").textContent = fmt(t); $("fr").textContent = "frame " + Math.round(t * FPS);
  $("atScene").textContent = "scene " + s.n + " · " + s.title;
  let line = s.lines[0]; s.lines.forEach((l) => { if (t >= l.t) line = l; });
  $("now").innerHTML = "<b>Scene " + s.n + " of " + R.scenes.length + "</b> · " + esc(s.title) + "<div class='ln'>“" + esc(line.text) + "”</div>";
}
["timeupdate", "seeked", "loadedmetadata"].forEach((e) => v.addEventListener(e, tick));
v.addEventListener("play", syncPlay); v.addEventListener("pause", syncPlay);
$("play").onclick = toggle; $("bigplay").onclick = toggle; $("stop").onclick = () => { v.pause(); v.currentTime = 0; };
const step = (n) => { v.pause(); v.currentTime = Math.max(0, v.currentTime + n / FPS); };
const seekBy = (s) => { v.currentTime = Math.max(0, v.currentTime + s); };
$("fm").onclick = () => step(-1); $("fp").onclick = () => step(1); $("b5").onclick = () => seekBy(-5); $("f5").onclick = () => seekBy(5);
$("rate").onchange = () => { v.playbackRate = +$("rate").value; };
v.addEventListener("click", (e) => { if (!drawMode) { /* native controls handle clicks */ } });

// ---- feedback items
function add() {
  v.pause();
  const n = $("note");
  const it = { cid: uid(), ts: Date.now(), state: "backlog", kind: "marker", t: v.currentTime, frame: Math.round(v.currentTime * FPS), scene: sceneAt(v.currentTime).id, note: n.value.trim(), shapes: JSON.parse(JSON.stringify(shapes)) };
  if (!it.note && !it.shapes.length) { $("msg").className = "err"; $("msg").textContent = "Type a note or draw something first."; return; }
  items.push(it); n.value = ""; shapes = []; redraw(); persist(); render();
  $("msg").className = "ok"; $("msg").textContent = "Added at " + fmt(it.t) + ".";
  if (it.shapes.length && getSas()) uploadToAzure(it);
}
$("add").onclick = add;
const open = (i) => (i.state || "backlog") !== "done";
function render() {
  const sf = $("sfilter").value;
  const all = items.filter((i) => i.kind === "marker" || i.note);
  const list = all.filter((i) => !sf || (sf === "open" ? open(i) : (i.state || "backlog") === sf)).sort((a, b) => (a.kind === "text") - (b.kind === "text") || a.t - b.t);
  const box = $("list"); box.innerHTML = "";
  list.forEach((m) => {
    const d = document.createElement("div"); d.className = "m" + (m.state === "done" ? " isdone" : "");
    const sc = R.scenes.find((s) => s.id === m.scene);
    const imgLink = m.imgUrl ? ' <a href="' + m.imgUrl + '" target="_blank" style="color:var(--accent);font-size:12px;margin-left:6px;text-decoration:underline">🖼️ Azure image</a>' : (m.shapes && m.shapes.length && getSas() ? ' <button class="up-az" style="font-size:11px;padding:1px 6px">☁️ Upload Azure</button>' : "");
    const where = m.kind === "text" ? "📣 " + esc(m.section) : "<b>" + fmt(m.t) + "</b> <small>frame " + m.frame + (sc ? " · scene " + sc.n + " " + esc(sc.title) : "") + (m.shapes && m.shapes.length ? " · ✏️ " + m.shapes.length + " mark(s)" : "") + imgLink + "</small>";
    d.innerHTML = '<button class="x" title="Delete">✕</button>' + where + ' <select class="state"><option value="backlog">📋 Backlog</option><option value="in-progress">🛠️ In progress</option><option value="done">✅ Done</option></select>' + (m.shapes && m.shapes.length ? ' <button class="dl" title="Download this frame with the drawing">⬇ frame</button>' : "") + '<textarea rows="2" placeholder="Feedback…"></textarea>';
    const b = d.querySelector("b"); if (b) b.onclick = () => goto(m);
    d.querySelector(".x").onclick = () => { items = items.filter((i) => i !== m); persist(); render(); renderPosts(); };
    const ta = d.querySelector("textarea"); ta.value = m.note || ""; ta.oninput = () => { m.note = ta.value; m.ts = Date.now(); persist(); };
    const sel = d.querySelector("select.state"); sel.value = m.state || "backlog"; sel.onchange = () => { m.state = sel.value; persist(); render(); };
    const dl = d.querySelector(".dl"); if (dl) dl.onclick = () => downloadFrame(m);
    const upBtn = d.querySelector(".up-az"); if (upBtn) upBtn.onclick = () => uploadToAzure(m);
    box.appendChild(d);
  });
  if (!list.length) box.innerHTML = '<p class="hint">' + (all.length ? "Nothing in this view." : "No feedback yet. Pause the video, type a note, press <kbd>M</kbd>.") + "</p>";
  const cnt = (s) => all.filter((i) => (i.state || "backlog") === s).length;
  $("states").innerHTML = '<span class="pill">📋 ' + cnt("backlog") + ' backlog</span><span class="pill p">🛠️ ' + cnt("in-progress") + ' in progress</span><span class="pill d">✅ ' + cnt("done") + " done</span>";
  $("count").textContent = list.length; $("count2").textContent = all.filter(open).length; $("total").textContent = all.filter(open).length;
  document.title = (all.filter(open).length ? "(" + all.filter(open).length + ") " : "") + "Review · Draft v" + R.draftN;
}
function goto(m) { v.pause(); v.currentTime = m.t; shapes = JSON.parse(JSON.stringify(m.shapes || [])); redraw(); if (shapes.length) setDraw(true); window.scrollTo({ top: 0, behavior: "smooth" }); }

// ---- post copy (title and description), each with its own feedback box
function renderPosts() {
  const box = $("posts"); box.innerHTML = "";
  [["TITLE", R.title], ["DESCRIPTION", R.description]].forEach(([sec, txt]) => {
    const d = document.createElement("div");
    d.innerHTML = "<b>" + sec + "</b> <small>" + txt.length + ' characters</small><pre class="post">' + esc(txt) + '</pre><textarea rows="2" placeholder="Feedback on this text (rewrite, tone, length)…"></textarea>';
    const ta = d.querySelector("textarea"); const mine = items.find((i) => i.kind === "text" && i.section === sec); ta.value = mine ? mine.note : "";
    ta.oninput = () => {
      let it = items.find((i) => i.kind === "text" && i.section === sec);
      if (!it) { it = { cid: uid(), ts: Date.now(), state: "backlog", kind: "text", section: sec, t: 0, frame: 0, note: "", shapes: [] }; items.push(it); }
      it.note = ta.value; it.ts = Date.now();
      if (!it.note.trim()) items = items.filter((x) => x !== it);
      persist(); render();
    };
    box.appendChild(d);
  });
}

// ---- drawing: shapes use 0..1 coordinates of the video frame
function sizeCv() { const c = v.parentElement.getBoundingClientRect(); cv.width = Math.round(c.width * devicePixelRatio); cv.height = Math.round(c.height * devicePixelRatio); redraw(); }
function videoBox(w, h) { const vw = v.videoWidth || 16, vh = v.videoHeight || 9, s = Math.min(w / vw, h / vh); return { x: (w - vw * s) / 2, y: (h - vh * s) / 2, w: vw * s, h: vh * s }; }
function paint(c, list, box) {
  list.forEach((s) => {
    c.strokeStyle = c.fillStyle = s.c; c.lineWidth = s.w * (box.w / 1280); c.lineCap = c.lineJoin = "round";
    const P = (p) => [box.x + p[0] * box.w, box.y + p[1] * box.h];
    if (s.k === "pen") { c.beginPath(); s.p.forEach((p, i) => { const q = P(p); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.stroke(); }
    else if (s.k === "rect") { const a = P(s.p[0]), b = P(s.p[1]); c.strokeRect(a[0], a[1], b[0] - a[0], b[1] - a[1]); }
    else if (s.k === "circle") { const a = P(s.p[0]), b = P(s.p[1]); c.beginPath(); c.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]) / 2, Math.abs(b[1] - a[1]) / 2, 0, 0, 7); c.stroke(); }
    else if (s.k === "arrow") { const a = P(s.p[0]), b = P(s.p[1]), g = Math.atan2(b[1] - a[1], b[0] - a[0]), L = 14 * (box.w / 1280) * (s.w / 4 + 1); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); c.beginPath(); c.moveTo(b[0], b[1]); c.lineTo(b[0] - L * Math.cos(g - 0.45), b[1] - L * Math.sin(g - 0.45)); c.lineTo(b[0] - L * Math.cos(g + 0.45), b[1] - L * Math.sin(g + 0.45)); c.closePath(); c.fill(); }
    else if (s.k === "text") { const a = P(s.p[0]); c.font = "700 " + Math.round(26 * box.w / 1280) + "px system-ui"; c.lineWidth = 5 * box.w / 1280; c.strokeStyle = "#000"; c.strokeText(s.t, a[0], a[1]); c.fillText(s.t, a[0], a[1]); }
  });
}
function redraw() { ctx.clearRect(0, 0, cv.width, cv.height); paint(ctx, cur ? shapes.concat([cur]) : shapes, videoBox(cv.width, cv.height)); }
function setDraw(on) { drawMode = on; syncPlay(); cv.classList.toggle("on", on); $("tools").classList.toggle("on", on); $("draw").classList.toggle("on", on); if (on) v.pause(); }
function pt(e) { const r = cv.getBoundingClientRect(), b = videoBox(r.width, r.height); return [Math.min(1, Math.max(0, (e.clientX - r.left - b.x) / b.w)), Math.min(1, Math.max(0, (e.clientY - r.top - b.y) / b.h))]; }
cv.addEventListener("pointerdown", (e) => {
  if (!drawMode) return; e.preventDefault(); const p = pt(e), base = { c: $("col").value, w: +$("wid").value };
  if (tool === "text") { const t = window.prompt("Text on the frame:"); if (t) { shapes.push({ ...base, k: "text", p: [p], t }); redraw(); } return; }
  drawing = true; cur = { ...base, k: tool, p: tool === "pen" ? [p] : [p, p] }; cv.setPointerCapture(e.pointerId);
});
cv.addEventListener("pointermove", (e) => { if (!drawing) return; const p = pt(e); tool === "pen" ? cur.p.push(p) : (cur.p[1] = p); redraw(); });
const endDraw = () => {
  if (!drawing) return; drawing = false;
  if (cur.k === "arrow" && Math.hypot(cur.p[1][0] - cur.p[0][0], cur.p[1][1] - cur.p[0][1]) < 0.015) { const [x, y] = cur.p[1]; cur.p = [[Math.max(0.02, x - 0.13), Math.max(0.03, y - 0.16)], [x, y]]; }
  shapes.push(cur); cur = null; redraw();
};
cv.addEventListener("pointerup", endDraw); cv.addEventListener("pointercancel", endDraw);
document.querySelectorAll("[data-tool]").forEach((b) => (b.onclick = () => { tool = b.dataset.tool; document.querySelectorAll("[data-tool]").forEach((x) => x.classList.toggle("on", x === b)); }));
$("arrowBtn").onclick = () => { setDraw(true); document.querySelector('[data-tool="arrow"]').click(); };
$("undo").onclick = () => { shapes.pop(); redraw(); }; $("clr").onclick = () => { shapes = []; redraw(); }; $("draw").onclick = () => setDraw(!drawMode);
if (window.ResizeObserver) new ResizeObserver(sizeCv).observe(v.parentElement); window.addEventListener("resize", sizeCv); v.addEventListener("loadedmetadata", sizeCv);

// ---- download or upload the frame with its drawing
const seekTo = (t) => new Promise((ok) => { const done = () => { v.removeEventListener("seeked", done); ok(); }; v.addEventListener("seeked", done); v.currentTime = t; });
async function captureFrameBlob(m) {
  v.pause(); const keep = v.currentTime; await seekTo(m.t);
  const w = v.videoWidth || 1280, h = v.videoHeight || 720, c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.drawImage(v, 0, 0, w, h); paint(g, m.shapes, { x: 0, y: 0, w, h });
  await seekTo(keep);
  return new Promise((ok) => c.toBlob(ok, "image/jpeg", 0.88));
}
async function uploadToAzure(m) {
  const sas = getSas();
  if (!sas || !m.shapes || !m.shapes.length) return;
  const msg = $("msg"); if (msg) { msg.className = ""; msg.textContent = "Uploading frame drawing to Azure…"; }
  try {
    const blob = await captureFrameBlob(m);
    const u = new URL(sas);
    const fname = "review-" + fmt(m.t).replace(/[:.]/g, "-") + "-" + (m.cid || uid()) + ".jpg";
    const putUrl = u.origin + u.pathname.replace(/\\/$/, "") + "/hyperframes/" + fname + u.search;
    const res = await fetch(putUrl, {
      method: "PUT",
      headers: { "x-ms-blob-type": "BlockBlob", "Content-Type": "image/jpeg" },
      body: blob
    });
    if (res.ok) {
      m.imgUrl = u.origin + u.pathname.replace(/\\/$/, "") + "/hyperframes/" + fname;
      persist();
      render();
      if (msg) { msg.className = "ok"; msg.textContent = "Drawing saved to Azure."; }
    } else {
      if (msg) { msg.className = "err"; msg.textContent = "Azure upload failed: HTTP " + res.status; }
    }
  } catch (err) {
    if (msg) { msg.className = "err"; msg.textContent = "Azure upload failed: " + err.message; }
  }
}
async function downloadFrame(m) {
  v.pause(); const keep = v.currentTime; await seekTo(m.t);
  const w = v.videoWidth || 960, h = v.videoHeight || 540, c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); g.drawImage(v, 0, 0, w, h); paint(g, m.shapes, { x: 0, y: 0, w, h });
  const a = document.createElement("a"); a.href = c.toDataURL("image/png"); a.download = "review-" + fmt(m.t).replace(/[:.]/g, "-") + ".png"; a.click(); await seekTo(keep);
}

// ---- copy for the chat: grouped by scene, in time order, open items only
function describeShapes(sh) { const n = {}; sh.forEach((s) => (n[s.k] = (n[s.k] || 0) + 1)); return Object.entries(n).map(([k, c]) => c + " " + k).join(", "); }
function build() {
  const mine = items.filter((i) => (i.kind === "marker" || i.note) && open(i));
  if (!mine.length) return "";
  const info = window.SITE_INFO || {};
  const out = ['Review feedback on "' + R.videoTitle + ' (draft v' + R.draftN + ')" (page v' + (info.version || "?") + ", site v" + (info.site || "?") + ")", info.url || location.href, ""];
  R.scenes.forEach((s) => {
    const list = mine.filter((i) => i.kind === "marker" && i.scene === s.id).sort((a, b) => a.t - b.t); if (!list.length) return;
    out.push("## Scene " + String(s.n).padStart(2, "0") + " · " + s.title + " (" + fmt(s.start).slice(0, 5) + " to " + fmt(s.end).slice(0, 5) + ")");
    list.forEach((i) => {
      const drawDesc = i.shapes.length ? " [drawing: " + describeShapes(i.shapes) + "]" : "";
      const imgDesc = i.imgUrl ? " [image: " + i.imgUrl + "]" : "";
      const progDesc = i.state === "in-progress" ? " [in progress]" : "";
      out.push("- " + fmt(i.t) + " (frame " + i.frame + ")" + drawDesc + imgDesc + progDesc + ": " + (i.note || "(no note)"));
    });
    out.push("");
  });
  const texts = mine.filter((i) => i.kind === "text");
  if (texts.length) { out.push("## Post copy"); texts.forEach((i) => out.push("- [" + i.section + "] " + i.note)); }
  return out.join("\\n").trim();
}
$("copy").onclick = () => {
  const t = build(), b = $("copy"), label = "📋 Copy feedback for Claude";
  if (!t) { b.textContent = "Nothing open to copy"; return setTimeout(() => (b.textContent = label), 1600); }
  const done = (ok) => { b.textContent = ok ? "Copied. Paste it in the chat" : "Copy failed: select the text below"; if (!ok) { const f = $("fallback"); f.hidden = false; f.value = t; f.select(); } setTimeout(() => (b.textContent = label), 2500); };
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(() => done(true), () => done(false)); else done(false);
};
$("clear").onclick = () => { if (window.confirm("Delete ALL review feedback in this browser?")) { items = []; persist(); render(); renderPosts(); } };
$("sfilter").onchange = render;

// ---- keyboard
document.addEventListener("keydown", (e) => {
  const tg = e.target.tagName; if (tg === "TEXTAREA" || tg === "INPUT" || tg === "SELECT") { if (e.target.id === "note" && e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add(); } return; }
  const k = e.key.toLowerCase();
  if ((e.metaKey || e.ctrlKey) && k === "z") { shapes.pop(); redraw(); e.preventDefault(); }
  else if (k === " " || k === "k") { e.preventDefault(); toggle(); }
  else if (k === "m") { e.preventDefault(); $("note").focus(); }
  else if (k === "d") setDraw(!drawMode);
  else if (k === "a") $("arrowBtn").click();
  else if (k === "arrowleft") { e.preventDefault(); e.shiftKey ? seekBy(-1) : step(-1); }
  else if (k === "arrowright") { e.preventDefault(); e.shiftKey ? seekBy(1) : step(1); }
  else if (k === "j") seekBy(-5); else if (k === "l") seekBy(5);
});

updateAzStatus(); renderPosts(); render(); tick(); syncPlay();
</script>
</body></html>
`;
writeFileSync(`${root}/review.html`, html);
console.log(`wrote review.html (${scenes.length} scenes, title "${title.slice(0, 40)}…")`);
