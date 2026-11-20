// Builds storyboard/index.html from script/scenes.json. Run: node scripts/build-storyboard.mjs
import { readFileSync, writeFileSync, mkdirSync, cpSync, copyFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const data = JSON.parse(readFileSync(`${root}/script/scenes.json`, "utf8"));
mkdirSync(`${root}/storyboard`, { recursive: true });
cpSync(`${root}/video/assets/bg`, `${root}/storyboard/bg`, { recursive: true });
cpSync(`${root}/video/assets/vo`, `${root}/storyboard/vo`, { recursive: true });

copyFileSync(`${root}/scripts/storyboard-editor.js`, `${root}/storyboard/editor.js`);

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const tc = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const panels = data.scenes
  .map((s, i) => {
    const words = s.vo.split(/\s+/).length;
    const [head, ...rest] = s.overlay;
    return `
<article class="panel" data-id="${s.id}" data-title="${String(i + 1).padStart(2, "0")} · ${esc(s.title)}">
  <div class="frame" style="background-image:url(bg/${s.bg}.jpg)">
    <div class="shade"></div>
    <div class="ov"><h2 contenteditable="plaintext-only" data-f="o0">${esc(head)}</h2>${rest.map((r, j) => `<p contenteditable="plaintext-only" data-f="o${j + 1}">${esc(r)}</p>`).join("")}</div>
    ${s.ph ? `<div class="ph">PLACEHOLDER · ${esc(s.ph)}</div>` : ""}
    <span class="tag">${esc(s.label)}</span>
  </div>
  <div class="meta">
    <div class="row"><b>${String(i + 1).padStart(2, "0")} · ${esc(s.title)}</b><span>${tc(s.start)} → ${tc(s.start + s.duration)} · ${s.duration}s · ${words} words</span></div>
    <p class="broll"><b>B-roll:</b> ${esc(s.broll)}</p>
    ${s.voSeconds ? `<audio controls preload="none" src="vo/${s.id}.mp3"></audio>
    <p class="fit ${s.voSeconds > s.duration ? "over" : "ok"}">Voice ${s.voSeconds}s vs ${s.duration}s slot${s.voSeconds > s.duration ? ` · runs over by ${(s.voSeconds - s.duration).toFixed(1)}s` : ""}</p>` : ""}
    <p class="vo" contenteditable="plaintext-only" data-f="vo">${esc(s.vo)}</p>
    <textarea class="fb" data-f="fb" placeholder="Feedback on this panel: what to change, move, cut..."></textarea>
  </div>
</article>`;
  })
  .join("\n");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Storyboard – Liquidation Part 1</title>
<style>
:root{--bg:#0e1116;--card:#171b22;--ink:#e8ecf1;--mute:#8b95a5;--accent:#4cc3d9;--red:#ff5a5f}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,sans-serif}
header{padding:32px 24px 8px;max-width:1280px;margin:auto}h1{margin:0 0 4px;font-size:28px}header p{color:var(--mute);margin:0}
main{max-width:1280px;margin:auto;padding:16px 24px 64px;display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,560px),1fr));gap:24px}
.panel{background:var(--card);border-radius:12px;overflow:hidden;border:1px solid #232a35}
.frame{position:relative;aspect-ratio:16/9;background-size:cover;background-position:center}
.shade{position:absolute;inset:0;background:linear-gradient(180deg,#0006,#000a)}
.ov{position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:6%;gap:.4em}
.ov h2{margin:0;font-size:clamp(20px,3.4vw,40px);line-height:1.15;text-shadow:0 2px 12px #000}
.ov p{margin:0;font-size:clamp(13px,1.7vw,20px);color:#dfe7ee;text-shadow:0 1px 8px #000}
.tag{position:absolute;top:10px;left:10px;background:var(--accent);color:#04222a;font-weight:700;font-size:12px;padding:3px 8px;border-radius:4px}
.ph{position:absolute;bottom:10px;left:10px;right:10px;border:1px dashed #ffd166;color:#ffd166;background:#000a;font-size:12px;padding:5px 8px;border-radius:4px}
.meta{padding:14px 16px 18px}.row{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}.row span{color:var(--mute);font-size:13px}
audio{width:100%;margin-top:8px;height:36px}.fit{margin:.3em 0;font-size:12px}.fit.ok{color:#68d391}.fit.over{color:var(--red)}
[contenteditable]{outline:none;border-radius:4px;cursor:text}[contenteditable]:hover{box-shadow:0 0 0 1px #ffd16688}[contenteditable]:focus{box-shadow:0 0 0 2px var(--accent);background:#0006}[contenteditable].changed{box-shadow:0 0 0 2px #ffd166}
.fb{width:100%;min-height:54px;margin-top:10px;font:inherit;font-size:14px;background:var(--bg);color:var(--ink);border:1px solid #232a35;border-radius:6px;padding:8px;resize:vertical}
#bar{position:sticky;bottom:0;z-index:50;background:#0e1116ee;border-top:1px solid #232a35;padding:10px 16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;backdrop-filter:blur(6px)}
#bar button{font:inherit;border:1px solid #232a35;background:var(--card);color:var(--ink);padding:8px 14px;border-radius:8px;cursor:pointer}#bar #copy{background:var(--accent);color:#04222a;font-weight:700;border-color:var(--accent)}#count{color:var(--mute);font-size:13px}
#gen{max-width:1280px;margin:0 auto;padding:0 24px 24px}#gen label{display:block;color:var(--mute);margin-bottom:6px}#gen textarea{width:100%;min-height:90px;font:inherit;background:var(--card);color:var(--ink);border:1px solid #232a35;border-radius:8px;padding:10px}
.broll{color:var(--mute);font-size:14px;margin:.5em 0}.broll b{color:var(--accent)}.vo{margin:.4em 0 0;font-size:15px}
</style></head><body data-feedback="custom">
<script src="../nav.js?v=1.13.0"></script>
<header><h1>${esc(data.title)}</h1><p>Storyboard · ${data.scenes.length} scenes · about ${tc(data.totalSecondsApprox)} · generated from script/scenes.json. Dashed boxes are real footage you supply. Backgrounds and voiceover are fal.ai (British male, Kokoro); press play on each panel. <b>Click any overlay or voiceover text to edit it</b> (edited text gets a yellow outline), add feedback per panel, then use Copy at the bottom. Total voice time: ${data.scenes.reduce((a,x)=>a+(x.voSeconds||0),0).toFixed(0)}s.</p></header>
<main>${panels}
</main>
<section id="gen"><label for="general">General feedback (pacing, voice, look, anything else)</label><textarea id="general" placeholder="e.g. make the hook shorter, try a female voice, warmer colours..."></textarea><textarea id="fallback" hidden style="margin-top:8px"></textarea></section>
<div id="bar"><button id="copy">Copy feedback for Claude</button><button id="reset">Reset edits</button><span id="count"></span></div>
<script src="editor.js?v=1.13.0"></script>
</body></html>`;

writeFileSync(`${root}/storyboard/index.html`, html);
console.log("wrote storyboard/index.html");
