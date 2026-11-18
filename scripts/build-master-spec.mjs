// Builds master-spec.html, release-checklist.html and templates/MASTER-SPEC.md
// from spec/project.json + script/scenes.json.   Run: node scripts/build-master-spec.mjs
// For a new video: copy the files in templates/, fill them in, run this script. See templates/README.md.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const P = JSON.parse(readFileSync(`${root}/spec/project.json`, "utf8"));
const S = JSON.parse(readFileSync(`${root}/script/scenes.json`, "utf8"));
const V = JSON.parse(readFileSync(`${root}/versions.json`, "utf8"));

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const tc = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
const words = (t) => t.split(/\s+/).filter(Boolean).length;
const totalSlots = S.scenes.reduce((a, s) => a + s.duration, 0);
const totalVoice = S.scenes.reduce((a, s) => a + (s.voSeconds || 0), 0);
const totalWords = S.scenes.reduce((a, s) => a + words(s.vo), 0);

// YouTube chapters: first at 0:00, each at least 10 s. Merge a short scene into the next one (last one into the previous).
const chapters = [];
S.scenes.forEach((s) => chapters.push({ start: s.start, dur: s.duration, title: s.title }));
for (let i = 0; i < chapters.length; i++) {
  if (chapters[i].dur >= 10) continue;
  if (i < chapters.length - 1) {
    chapters[i + 1] = { start: chapters[i].start, dur: chapters[i].dur + chapters[i + 1].dur, title: `${chapters[i].title} and ${chapters[i + 1].title}` };
    chapters.splice(i, 1); i--;
  } else {
    chapters[i - 1].dur += chapters[i].dur; chapters[i - 1].title += ` and ${chapters[i].title}`; chapters.pop();
  }
}
const chapterText = chapters.map((c) => `${tc(c.start)} ${c.title}`).join("\n");

const assets = S.scenes.filter((s) => s.realAsset).map((s) => ({ scene: s.title, asset: s.realAsset, kind: "Your footage / capture", status: "Needed" }));
assets.push(
  { scene: "All", asset: "Background plates (6 images)", kind: "fal.ai, text-free", status: "Done" },
  { scene: "All", asset: "Draft voiceover (per scene)", kind: "fal.ai Kokoro", status: "Done, to be replaced by your recording" },
  { scene: "All", asset: "Music and sound effects", kind: "TBD", status: "Open" },
  { scene: "All", asset: "Thumbnail", kind: "TBD", status: "Open" }
);

const table = (head, rows) =>
  `<div class="tw"><table><tr>${head.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</table></div>`;
const list = (a) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;

const head = (title, extraCss = "") => `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="site.css">
<style>.kv{display:grid;grid-template-columns:170px 1fr;gap:6px 14px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:14px 18px}.kv b{color:var(--accent)}
@media(max-width:560px){.kv{grid-template-columns:1fr}}.step{counter-increment:s}.steps li{margin:6px 0}
.chk{display:flex;gap:10px;align-items:flex-start;padding:6px 0}.chk input{margin-top:5px;width:18px;height:18px}.chk.done span{color:var(--mute);text-decoration:line-through}
.prog{font-weight:700;color:var(--accent)}${extraCss}</style></head><body>
<script src="nav.js?v=${V.site}"></script>
<main>`;
const foot = `</main></body></html>\n`;

// ---------------- master spec page ----------------
const spec = `${head("Master Spec")}
  <h1>📘 Master spec</h1>
  <p class="lead">${esc(P.title)}. The single reference for what this video is, how it is made and when it is done. Built to be reused as a template for the next video.</p>
  <p class="note">Generated from <code>spec/project.json</code> and <code>script/scenes.json</code> by <code>scripts/build-master-spec.mjs</code>. Spec v${esc(P.specVersion)}, site v${esc(V.site)}. To change it, give feedback with the boxes below and I update the source files. <a href="templates/MASTER-SPEC.md">Download as Markdown</a>.</p>

  <h2>1. Brief</h2>
  <div class="kv">
    <b>Title</b><span>${esc(P.title)}</span>
    <b>Series</b><span>${esc(P.series)}</span>
    <b>Owner</b><span>${esc(P.owner)}</span>
    <b>Audience</b><span>${esc(P.audience)}</span>
    <b>Goal</b><span>${esc(P.goal)}</span>
    <b>One call to action</b><span>${esc(P.singleCallToAction)}</span>
    <b>Tone</b><span>${esc(P.tone)}</span>
    <b>Length</b><span>${tc(P.targetLengthSeconds)} target; plan ${tc(totalSlots)} (${S.scenes.length} scenes, ${totalWords} words, ${totalVoice.toFixed(0)} s of draft voice)</span>
    <b>Language</b><span>${esc(P.language)}</span>
    <b>Disclaimer</b><span>${esc(P.disclaimer)}</span>
  </div>

  <h2>2. Pipeline</h2>
  ${table(["Stage", "What happens", "Pages", "Done when"], [
    ["📝 <b>Preprod</b>", "Script, storyboard, feedback loop, task tracking, recommendations", `<a href="script.html">Script</a>, <a href="storyboard/">Storyboard</a>, <a href="kanban.html">Kanban</a>, <a href="recommendations.html">Recommendations</a>`, "You approve the storyboard and the open decisions below are closed"],
    ["🎬 <b>Prod</b>", "Build the scenes in Hyperframes, bring in real footage and voiceover, check and snapshot", `<a href="hyperframes-guide/">Hyperframes guide</a>`, "Every scene renders, <code>npm run check</code> passes, snapshots reviewed"],
    ["🎞️ <b>Postprod</b>", "Final render, quality control, captions, publish", `<a href="master-spec.html">Master spec</a>, <a href="release-checklist.html">Release checklist</a>, <a href="publish.html">Publish copy</a>, <a href="agents.html">AGENTS.md</a>, <a href="reuse.html">Reuse</a>`, "All acceptance criteria met and the release checklist is complete"],
  ])}
  <p><b>Working rule:</b> every change is committed, pushed and deployed to GitHub Pages, and every release bumps the version (<a href="changelog.html">changelog</a>).</p>

  <h2>3. Technical spec</h2>
  <div class="kv">
    <b>Resolution</b><span>${esc(P.format.resolution)}</span>
    <b>Frame rate</b><span>${P.format.fps} fps</span>
    <b>Container</b><span>${esc(P.format.container)}</span>
    <b>Quality</b><span>${esc(P.format.quality)}</span>
    <b>Rendering</b><span>${esc(P.format.render)} (see <a href="hyperframes-guide/speed.html">speed</a>)</span>
    <b>Voice now</b><span>${esc(P.voice.now)}</span>
    <b>Voice final</b><span>${esc(P.voice.final)}</span>
    <b>Captions</b><span>${esc(P.voice.captions)}</span>
  </div>

  <h2>4. Scenes</h2>
  ${table(["#", "Time", "Scene", "Words", "Voice / slot", "B-roll"], S.scenes.map((s, i) => [
    String(i + 1).padStart(2, "0"), tc(s.start), esc(s.title), String(words(s.vo)), `${s.voSeconds || "?"} s / ${s.duration} s`, esc(s.broll),
  ]))}
  <p><small>Full text on the <a href="script.html">Script</a> page. Source: <code>script/scenes.json</code>.</small></p>

  <h2>5. Asset manifest</h2>
  ${table(["Scene", "Asset", "Kind", "Status"], assets.map((a) => [esc(a.scene), esc(a.asset), esc(a.kind), esc(a.status)]))}

  <h2>6. Rules and non-goals</h2>
  ${list(P.rules)}

  <h2>7. Open decisions</h2>
  ${table(["Decision", "Status", "Owner"], P.decisions.map((d) => [esc(d.item), esc(d.status), esc(d.owner)]))}

  <h2>8. Acceptance criteria</h2>
  <p>The video is done when all of these are true:</p>
  ${list(P.acceptance)}

  <h2>9. Risks</h2>
  ${table(["Risk", "Mitigation"], P.risks.map((r) => [esc(r.risk), esc(r.mitigation)]))}

  <h2>10. Use this as a template</h2>
  <ol class="steps">
    <li>Copy the repo (or start from this one) and keep <code>nav.js</code>, <code>feedback.js</code>, <code>site.css</code>, <code>versions.json</code>, <code>AGENTS.md</code> and <code>scripts/</code> (see <a href="reuse.html">Reuse</a>).</li>
    <li>Copy <code>templates/project.template.json</code> to <code>spec/project.json</code> and fill it in. Copy <code>templates/scenes.template.json</code> to <code>script/scenes.json</code> and write your scenes.</li>
    <li>Run <code>scripts/gen-backgrounds.sh</code> and <code>scripts/gen-voiceover.sh</code> if you want fal.ai drafts (needs <code>FAL_KEY</code> in <code>.env</code>).</li>
    <li>Run <code>node scripts/build-storyboard.mjs</code>, <code>build-script-page.mjs</code> and <code>build-master-spec.mjs</code>.</li>
    <li>Give feedback on the storyboard and each page, iterate, then build the scenes in <code>video/</code>.</li>
    <li>Render, run the <a href="release-checklist.html">release checklist</a>, publish.</li>
    <li>After each change run <code>node scripts/version.mjs bump minor "what changed"</code>, then commit, push and deploy.</li>
  </ol>
${foot}`;
writeFileSync(`${root}/master-spec.html`, spec);

// ---------------- release checklist page ----------------
const groups = [
  ["Render and quality", [
    "Run npm run check in video/ and fix every error",
    "Take snapshots of every scene and look at them",
    "Render the final MP4 at 1920x1080, 30 fps, default quality",
    "Watch the whole file once, with sound, end to end",
    "Every scene starts within about 1 second of its planned time",
    "Audio is in sync, no clipping, music sits under the voice",
    "Captions match the audio and stay inside the safe area",
  ]],
  ["Privacy and legal", [
    "No UTR, login, name or address readable in any frame (check the exported file, not the preview)",
    "No debt figure on screen or in the voice",
    "Anything shown about AI emailing the parties was checked with the practitioner",
    "The practitioner has read the script, or personal claims are framed as your own experience",
    "The disclaimer is on screen and in the description",
    "No API key or secret in the repo, the video or the description",
  ]],
  ["YouTube packaging", [
    "Title chosen from the Publish page (subject or viewer's question first, no promised outcome)",
    "Description pasted from the Publish page, both [LINK] placeholders replaced, disclaimer included",
    "Chapters pasted into the description (below)",
    "Thumbnail uploaded (1280x720 JPG from the Publish page) and checked at small size",
    "Captions file uploaded or auto-captions reviewed",
    "End screen and one call to action set: " + P.singleCallToAction,
    "Added to the series playlist",
    "Skool community link on the end screen and in the description (one soft mention, not a second call to action)",
  ]],
  ["After publishing", [
    "Add the video link to the repo README and the hub",
    "Bump the site version and write the changelog entry",
    "Commit, push, deploy",
    "Decide whether to make the repo private or rewrite history",
    "Note what to change in the template for the next video",
  ]],
];
const lists = groups
  .map(
    ([name, items]) => `<h2>${esc(name)} <small class="prog" data-prog></small></h2>
<div class="card" data-group>${items.map((t, i) => `<label class="chk"><input type="checkbox" data-id="${esc(name)}:${i}"><span>${esc(t)}</span></label>`).join("")}</div>`
  )
  .join("\n");
const rel = `${head("Release Checklist")}
  <h1>🚀 Release checklist</h1>
  <p class="lead">Everything to do between "scenes built" and "published". Ticks are saved in this browser. Generated from the <a href="master-spec.html">master spec</a>.</p>
  <p class="prog" id="total"></p>
${lists}
  <h2>Chapters for the description</h2>
  <p class="note">Computed from the scene timings: the first chapter is 0:00 and each is at least 10 seconds, so short scenes are merged. Retime after the final edit.</p>
  <pre id="chapters">${esc(chapterText)}</pre>
  <p><button id="cc" style="font:inherit;background:var(--accent);color:#04222a;border:0;border-radius:8px;padding:8px 14px;font-weight:700;cursor:pointer">Copy chapters</button> <small id="cm"></small></p>
<script>
(function(){
  var KEY="rc-v1:release", saved={};
  try{saved=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
  var boxes=[].slice.call(document.querySelectorAll("input[data-id]"));
  function paint(){
    var all=0;
    document.querySelectorAll("[data-group]").forEach(function(g){
      var b=g.querySelectorAll("input"),n=0;b.forEach(function(x){if(x.checked)n++;x.parentNode.classList.toggle("done",x.checked)});
      all+=n;var p=g.previousElementSibling.querySelector("[data-prog]");if(p)p.textContent=n+" / "+b.length;
    });
    document.getElementById("total").textContent="Overall: "+all+" / "+boxes.length+" done";
  }
  boxes.forEach(function(b){b.checked=!!saved[b.dataset.id];b.onchange=function(){saved[b.dataset.id]=b.checked;try{localStorage.setItem(KEY,JSON.stringify(saved))}catch(e){}paint()}});
  paint();
  document.getElementById("cc").onclick=function(){var m=document.getElementById("cm");
    (navigator.clipboard?navigator.clipboard.writeText(document.getElementById("chapters").textContent):Promise.reject()).then(function(){m.textContent="Copied"},function(){m.textContent="Copy failed"})};
})();
</script>
${foot}`;
writeFileSync(`${root}/release-checklist.html`, rel);

// ---------------- markdown template ----------------
const md = `# Master spec: ${P.title}

Spec v${P.specVersion} · site v${V.site}. Generated from spec/project.json and script/scenes.json. Do not edit by hand.

## 1. Brief
- **Series:** ${P.series}
- **Owner:** ${P.owner}
- **Audience:** ${P.audience}
- **Goal:** ${P.goal}
- **One call to action:** ${P.singleCallToAction}
- **Tone:** ${P.tone}
- **Length:** ${tc(P.targetLengthSeconds)} target, plan ${tc(totalSlots)}
- **Language:** ${P.language}
- **Disclaimer:** ${P.disclaimer}

## 2. Pipeline
1. Preprod: script, storyboard, feedback, kanban, recommendations. Done when the storyboard is approved and open decisions are closed.
2. Prod: build scenes in Hyperframes, bring in real footage and voice. Done when every scene renders and the check passes.
3. Postprod: final render, quality control, captions, publish. Done when the acceptance criteria and release checklist are complete.

Every change: commit, push, deploy, bump version.

## 3. Technical spec
- Resolution ${P.format.resolution}, ${P.format.fps} fps, ${P.format.container}
- Quality: ${P.format.quality}
- Rendering: ${P.format.render}
- Voice now: ${P.voice.now}
- Voice final: ${P.voice.final}
- Captions: ${P.voice.captions}

## 4. Scenes
${S.scenes.map((s, i) => `${i + 1}. ${tc(s.start)} **${s.title}** (${words(s.vo)} words, slot ${s.duration} s). B-roll: ${s.broll}`).join("\n")}

## 5. Asset manifest
${assets.map((a) => `- ${a.scene}: ${a.asset} (${a.kind}), ${a.status}`).join("\n")}

## 6. Rules
${P.rules.map((r) => `- ${r}`).join("\n")}

## 7. Open decisions
${P.decisions.map((d) => `- ${d.item}: ${d.status} (${d.owner})`).join("\n")}

## 8. Acceptance criteria
${P.acceptance.map((r) => `- [ ] ${r}`).join("\n")}

## 9. Risks
${P.risks.map((r) => `- ${r.risk}. Mitigation: ${r.mitigation}`).join("\n")}

## 10. Chapters (starting point)
\`\`\`
${chapterText}
\`\`\`
`;
mkdirSync(`${root}/templates`, { recursive: true });
writeFileSync(`${root}/templates/MASTER-SPEC.md`, md);
console.log(`wrote master-spec.html, release-checklist.html, templates/MASTER-SPEC.md (${chapters.length} chapters)`);
