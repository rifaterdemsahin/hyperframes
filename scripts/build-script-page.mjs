// Builds script.html (the Preprod script page) from script/scenes.json. Run: node scripts/build-script-page.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(`${root}/script/scenes.json`, "utf8"));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const tc = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const words = (t) => t.split(/\s+/).filter(Boolean).length;
const totalWords = data.scenes.reduce((a, s) => a + words(s.vo), 0);
const totalVoice = data.scenes.reduce((a, s) => a + (s.voSeconds || 0), 0);

const rows = data.scenes
  .map((s, i) => {
    const over = s.voSeconds && s.voSeconds > s.duration;
    return `<section class="scene" id="${s.id}">
  <div class="head"><span class="tc">${tc(s.start)}</span><span class="lab">${esc(s.label)}</span><h2>${String(i + 1).padStart(2, "0")} · ${esc(s.title)}</h2></div>
  <p class="vo">${esc(s.vo)}</p>
  <p class="meta"><b>B-roll:</b> ${esc(s.broll)}</p>
  <p class="meta">${words(s.vo)} words · slot ${s.duration}s${s.voSeconds ? ` · voice <span class="${over ? "over" : "ok"}">${s.voSeconds}s</span>` : ""}${s.realAsset ? ` · <span class="asset">needs: ${esc(s.realAsset)}</span>` : ""}</p>
</section>`;
  })
  .join("\n");

const plain = data.scenes.map((s) => `[${tc(s.start)}] ${s.label}: ${s.title}\n${s.vo}\nB-roll: ${s.broll}`).join("\n\n");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Script</title>
<link rel="stylesheet" href="site.css">
<style>
.scene{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 18px;margin:14px 0}
.head{display:flex;gap:10px;align-items:baseline;flex-wrap:wrap}.head h2{margin:0;font-size:18px}
.tc{font-variant-numeric:tabular-nums;color:var(--accent);font-weight:700}.lab{font-size:11px;font-weight:700;color:var(--mute);border:1px solid var(--line);border-radius:99px;padding:0 8px}
.vo{font-size:17px;margin:10px 0}.meta{margin:4px 0;color:var(--mute);font-size:13.5px}.meta b{color:var(--accent)}.over{color:#ff6b6b;font-weight:600}.ok{color:var(--ok)}.asset{color:var(--warn)}
button{font:inherit;background:var(--accent);color:#04222a;border:0;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer}
</style></head><body>
<script src="nav.js?v=1.31.0"></script>
<main>
  <h1>📜 Script</h1>
  <p class="lead">${esc(data.title)}. ${data.scenes.length} scenes, ${totalWords} words, about ${tc(data.totalSecondsApprox)}.</p>
  <p class="note">Generated from <code>script/scenes.json</code>, the single source of truth. To change wording, edit it on the <a href="storyboard/">storyboard</a> and paste the copied feedback into the chat. Draft voiceover runs ${totalVoice.toFixed(0)}s in total; red means it overruns its slot.</p>
  <p><button id="copy">Copy whole script</button> <small id="msg"></small></p>
${rows}
  <p class="next"><a href="storyboard/">Next: storyboard &rarr;</a><a href="kanban.html">Kanban &rarr;</a></p>
</main>
<script>
document.getElementById("copy").onclick=function(){var t=${JSON.stringify(plain)};var m=document.getElementById("msg");
(navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){m.textContent="Copied"},function(){m.textContent="Copy failed"});};
</script>
</body></html>`;

writeFileSync(`${root}/script.html`, html);
console.log("wrote script.html");
