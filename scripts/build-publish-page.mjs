// Builds publish.html (title, description, tags, thumbnails) from spec/publish.json + scenes.json + project.json.
// Run: node scripts/build-publish-page.mjs     Thumbnails: scripts/build-thumbnails.sh
import { readFileSync, writeFileSync, statSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const J = (p) => JSON.parse(readFileSync(`${root}/${p}`, "utf8"));
const pub = J("spec/publish.json"), S = J("script/scenes.json"), P = J("spec/project.json"), V = J("versions.json");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const tc = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// chapters: first at 0:00, each at least 10 s (short scenes merge into the next; the last into the previous)
const ch = S.scenes.map((s) => ({ start: s.start, dur: s.duration, title: s.title }));
for (let i = 0; i < ch.length; i++) {
  if (ch[i].dur >= 10) continue;
  if (i < ch.length - 1) { ch[i + 1] = { start: ch[i].start, dur: ch[i].dur + ch[i + 1].dur, title: `${ch[i].title} and ${ch[i + 1].title}` }; ch.splice(i, 1); i--; }
  else { ch[i - 1].dur += ch[i].dur; ch[i - 1].title += ` and ${ch[i].title}`; ch.pop(); }
}
const chapters = ch.map((c) => `${tc(c.start)} ${c.title}`).join("\n");
const description = pub.descriptionTemplate.replace("{{chapters}}", chapters).replace("{{disclaimer}}", P.disclaimer);
const tags = pub.tags.join(", ");
const bytes = (f) => (existsSync(`${root}/${f}`) ? statSync(`${root}/${f}`).size : 0);
const kb = (n) => `${Math.round(n / 1024)} KB`;

// when you have selected an option, the others are hidden (add ?all=1 to the address to show them)
const hasTi = pub.titles.some((t) => t.selected), hasTh = pub.thumbnails.some((t) => t.selected);
const copyBtn = (id) => `<button class="cp" data-copy="${id}">Copy</button> <small class="cm"></small>`;
const titles = pub.titles.map((t, i) => `<tr class="${t.selected ? "sel" : hasTi ? "alt" : ""}"><td>${t.selected ? "✅ " : !hasTi && t.recommended ? "⭐ " : ""}<b id="t${i}">${esc(t.text)}</b>${t.selected ? ' <span class="tag sl">SELECTED</span>' : ""}${!hasTi && t.recommended ? ' <span class="tag ok">RECOMMENDED</span>' : ""}</td><td>${t.text.length}${t.text.length > 60 ? ' <small class="warn">may be cut off on phones</small>' : ""}</td><td>${esc(t.why)}<br><small>Thumbnail ${esc(t.pair)}</small></td><td>${copyBtn("t" + i)}</td></tr>`).join("");
const thumbs = pub.thumbnails.map((t) => `<div class="th${t.selected ? " sel" : hasTh ? " alt" : ""}"><img src="${esc(t.file)}" alt="${esc(t.name)}" width="640" height="360"><h3>${t.selected ? "✅ " : !hasTh && t.recommended ? "⭐ " : ""}${esc(t.name)} ${t.selected ? '<span class="tag sl">SELECTED</span> ' : ""}${!hasTh && t.recommended ? '<span class="tag ok">RECOMMENDED</span>' : ""}</h3><p>${esc(t.idea)}</p><p><small>${esc(t.file.split("/").pop())}: 1280 x 720, ${kb(bytes(t.file))} (limit 2 MB). <a href="${esc(t.file)}" download>Download JPG</a> · <a href="${esc(t.html)}">HTML source</a></small></p><p class="sm"><img src="${esc(t.file)}" alt="" width="168" height="94"> <small>Small-size check (168 x 94)</small></p></div>`).join("");

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Title, Description and Thumbnail</title>
<link rel="stylesheet" href="site.css">
<style>
.tag.ok{color:var(--ok)}.tag.sl{color:#04222a;background:var(--accent);border-color:var(--accent)}tr.sel td{background:color-mix(in srgb,var(--accent) 12%,var(--card))}.th.sel{border-color:var(--accent);border-width:2px}.alt{display:none}body.all tr.alt{display:table-row}body.all .th.alt{display:block}.pick{display:grid;gap:14px;grid-template-columns:200px 1fr;align-items:center;background:var(--card);border:2px solid var(--accent);border-radius:12px;padding:14px 18px}.pick img{width:200px;border-radius:6px;display:block}@media(max-width:560px){.pick{grid-template-columns:1fr}}.warn{color:var(--warn)}.cp,button.cp{font:inherit;font-size:13px;background:var(--accent);color:#04222a;border:0;border-radius:8px;padding:5px 12px;font-weight:700;cursor:pointer}
pre.desc{white-space:pre-wrap;font-size:14px}.ths{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr))}.th{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px}.th img{max-width:100%;height:auto;border-radius:8px;display:block}.th h3{margin:10px 0 4px}.sm img{display:inline-block;vertical-align:middle;border:1px solid var(--line);border-radius:4px;margin-right:8px}
</style></head><body>
<script src="nav.js?v=${V.site}"></script>
<main>
  <div class="crumbs">🚀 4 Publish</div>
  <h1>📣 Title, description and thumbnail</h1>
  <p class="lead">The publish copy for <b>${esc(S.title)}</b>, ready to paste into YouTube. Generated from <code>spec/publish.json</code> by <code>scripts/build-publish-page.mjs</code>; thumbnails by <code>scripts/build-thumbnails.sh</code>.</p>
  <p class="note">These are drafts for you to choose from. The description makes the same claims as the script, so have the practitioner read it too. ${(() => { const n = (description.match(/\[[A-Z][^\]]*\]/g) || []).length; return n ? `${n === 1 ? "One placeholder" : n + " placeholders"} in square brackets ${n === 1 ? "needs" : "need"} your input.` : "No placeholders left."; })()}</p>

  ${(() => {
    const ti = pub.titles.find((t) => t.selected), th = pub.thumbnails.find((t) => t.selected);
    if (!ti && !th) return "";
    return `<h2>Your selection</h2><div class="pick">${th ? `<img src="${esc(th.file)}" alt="${esc(th.name)}">` : "<span></span>"}<div>${ti ? `<p><b>Title:</b> ${esc(ti.text)} <small>(${ti.text.length} characters)</small></p>` : ""}${th ? `<p><b>Thumbnail:</b> ${esc(th.name)}</p>` : ""}${pub.selectionNote ? `<p><small>${esc(pub.selectionNote)}</small></p>` : ""}</div></div>`;
  })()}

  <h2>1. Title</h2>
  <p>Lead with the subject or the viewer's question, name the series, and promise no outcome. Under 60 characters shows in full on phones.</p>
  <div class="tw"><table><tr><th>Option</th><th>Chars</th><th>Why</th><th></th></tr>${titles}</table></div>

  <h2>2. Description</h2>
  <p>The first two lines show before "Show more", so they carry the hook. Chapters come from the current scene timings: retime them after the final edit.</p>
  <pre class="desc" id="desc">${esc(description)}</pre>
  <p>${copyBtn("desc")} <small>${description.length} characters (YouTube allows 5,000).</small></p>

  <h2>3. Tags and hashtags</h2>
  <pre class="desc" id="tags">${esc(tags)}</pre>
  <p>${copyBtn("tags")} <small>The three hashtags at the end of the description show above the title.</small></p>
  <div class="card"><h3>Pinned comment (suggestion)</h3><p>${esc(pub.pinnedComment)}</p></div>

  <h2>4. Thumbnail</h2>
  <div class="ths">${thumbs}</div>
  <h3 style="margin-top:20px">Rules these follow</h3>
  <ul>${pub.thumbnailRules.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>

  <h2>5. Before you publish</h2>
  <div class="card"><ul>${pub.openItems.map((r) => `<li>${esc(r)}</li>`).join("")}</ul>
  <p><small>Tick these off on the <a href="release-checklist.html">release checklist</a>.</small></p></div>
</main>
<script>
if(/[?&]all=1/.test(location.search))document.body.classList.add("all");
document.querySelectorAll("button.cp").forEach(function(b){b.onclick=function(){
  var t=document.getElementById(b.dataset.copy).textContent, m=b.parentNode.querySelector(".cm")||b.nextElementSibling;
  (navigator.clipboard?navigator.clipboard.writeText(t):Promise.reject()).then(function(){if(m)m.textContent="Copied"},function(){if(m)m.textContent="Copy failed: select the text"});
};});
</script>
</body></html>
`;
writeFileSync(`${root}/publish.html`, html);
console.log(`wrote publish.html (${pub.titles.length} titles, ${pub.thumbnails.length} thumbnails, description ${description.length} chars)`);
