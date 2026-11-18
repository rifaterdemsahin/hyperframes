// Builds first-draft.html (the Postprod "First draft" page) from draft/meta.json + scenes.json.
// Signal over noise: the video, what is real vs still a placeholder, and what you need to do. Nothing else.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const J = (p) => JSON.parse(readFileSync(`${root}/${p}`, "utf8"));
const S = J("script/scenes.json"), V = J("versions.json");
const VERS = J("draft/versions.json"), N = VERS.latest, DV = VERS.versions.find((v) => v.n === N), PREV = VERS.versions.filter((v) => v.n !== N).sort((a, b) => b.n - a.n);
const M = existsSync(`${root}/draft/v${N}/meta.json`) ? J(`draft/v${N}/meta.json`) : null;
const DIR = `draft/v${N}`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const tc = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const mb = (n) => `${(n / 1048576).toFixed(1)} MB`;
const total = S.scenes[S.scenes.length - 1].start + S.scenes[S.scenes.length - 1].duration;
const needs = S.scenes.filter((s) => s.ph).map((s) => ({ s, what: s.realAsset || s.ph }));

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Draft Video</title>
<link rel="stylesheet" href="site.css">
<style>
.alt{display:none}body.all .alt{display:block}
video{width:100%;max-width:860px;border-radius:12px;background:#000;display:block;border:1px solid var(--line)}
.strip{display:grid;gap:8px;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));margin-top:12px;align-items:start}.sc{border:1px solid var(--line);border-radius:10px;background:var(--card);padding:6px}.sc .fbx{margin:6px 0 2px;border-style:solid}.strip button{all:unset;cursor:pointer;display:block;border:2px solid var(--line);border-radius:8px;overflow:hidden;background:var(--bg)}.strip button:hover,.strip button:focus-visible{border-color:var(--accent)}.strip img{width:100%;display:block}.strip span{display:block;padding:4px 8px;font-size:12px;color:var(--mute)}
.stat{display:flex;gap:10px 24px;flex-wrap:wrap;margin:12px 0}.stat div{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 14px}.stat b{display:block;font-size:20px;color:var(--accent)}.stat small{color:var(--mute)}
</style></head><body>
<script src="nav.js?v=${V.site}"></script>
<main>
  <div class="crumbs">📦 Postprod</div>
  <h1>🎞️ Draft v${N}</h1>
  <p class="lead">${esc(S.title)}: the whole film, ${tc(total)}, built from your script with the AI draft voice. Real footage is still to come, so each place that needs it shows a dashed frame.</p>
  ${M ? `<div class="stat"><div><b>${tc(Math.round(M.duration))}</b><small>length</small></div><div><b>${M.renderSeconds ?? "?"} s</b><small>to render</small></div><div><b>${esc(M.check)}</b><small>Hyperframes check</small></div><div><b>${mb(M.webBytes)}</b><small>web copy (full 1080p: ${mb(M.fullBytes)})</small></div></div>` : ""}
  <video id="v" controls preload="metadata" poster="${DIR}/frames/${esc(S.scenes[0].id)}.jpg" src="${DIR}/video.mp4"></video>
  <h2 data-fb-skip>What changed in v${N}</h2>
  <div class="card"><ul>${DV.changes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>${PREV.length ? `\n  <div class="alt card"><b>Earlier versions</b> (hidden unless <code>?all=1</code>): ${PREV.map((v) => `v${v.n} ${esc(v.label)}, ${esc(v.date)}: <a href="draft/v${v.n}/video.mp4">video</a>`).join(" · ")}</div>` : ""}
  <h2 data-fb-skip>Scenes</h2>
  <p>Click a scene to jump to it, then say what to change right under it.</p>
  <div class="strip">${S.scenes.map((sc, i) => `<div class="sc" id="sc-${esc(sc.id)}" data-fb="Scene ${String(i + 1).padStart(2, "0")} · ${esc(sc.title)} (${tc(sc.start)})" data-fb-id="${esc(sc.id)}" data-fb-kind="scene" data-fb-open><button data-t="${sc.start}" title="Jump to ${tc(sc.start)}"><img src="${DIR}/frames/${esc(sc.id)}.jpg" alt="" loading="lazy"><span>${String(i + 1).padStart(2, "0")} · ${tc(sc.start)} · ${esc(sc.title)}</span></button></div>`).join("")}</div>

  <h2>What you need to supply</h2>
  <p>Only these scenes wait on your footage. Everything else in the draft is final-quality layout.</p>
  <div class="tw"><table><tr><th>When</th><th>Scene</th><th>Footage</th></tr>${needs.map(({ s, what }) => `<tr><td>${tc(s.start)}</td><td>${esc(s.title)}</td><td>${esc(what)}</td></tr>`).join("")}</table></div>

  <h2>Edit it in the Hyperframes Studio app</h2>
  <ol>
    <li>Open the Studio app and choose <b>Open project</b>, then pick the <code>video</code> folder of this repo. Or run <code>npx hyperframes open</code> inside <code>video/</code>.</li>
    <li>Each scene is its own file in <code>video/compositions/</code>, so the timeline shows ten scene rows plus the voiceover and the draft tag.</li>
    <li>For wording, edit the script on the <a href="storyboard/">storyboard</a> instead: <code>video/</code> is regenerated from <code>script/scenes.json</code>, so edits made directly in the Studio app can be overwritten by the next build.</li>
  </ol>

  <h2>Known gaps in this draft</h2>
  <ul>
    <li>The voice is the AI draft, not yours. Record yours and the timings get re-set around it.</li>
    <li>No music or sound effects yet.</li>
    <li>Captions are timed from sentence length, not word by word. Final captions will come from your real recording.</li>
    <li>Backgrounds are mood plates. The face cam, HMRC screen, emails and n8n canvas are placeholders.</li>
  </ul>
  <p><small>How long this takes to build is on the <a href="performance.html">Performance</a> page. Rebuild with <code>node scripts/render-draft.mjs</code>.</small></p>
</main>
<script>
if(/[?&]all=1/.test(location.search))document.body.classList.add("all");
var v=document.getElementById("v");document.querySelectorAll(".strip button").forEach(function(b){b.onclick=function(){v.currentTime=+b.dataset.t;v.play();v.scrollIntoView({block:"center",behavior:"smooth"})}});
</script>
</body></html>
`;
writeFileSync(`${root}/first-draft.html`, html);
console.log(`wrote first-draft.html (${S.scenes.length} scenes, ${needs.length} need your footage)`);
