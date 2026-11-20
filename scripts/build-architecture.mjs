// Builds the architecture diagram + dependency table and injects it into index.html
// between <!--ARCH-START--> and <!--ARCH-END-->.   Run: node scripts/build-architecture.mjs
// Edit NODES / EDGES / DEPS below when the system changes, then re-run.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// ---- layout
const W = 170, H = 64;
const COLX = [8, 248, 488, 728, 968];
const ROWY = [56, 146, 236, 326, 416, 506];
const VB = { w: 1146, h: 604 };

// kind: person | src (source of truth) | gen (generator) | out (output) | ext (external service) | secret
const NODES = {
  you:     { c: 0, r: 0, i: "👤", t: "You", s: "feedback + footage", k: "person" },
  claude:  { c: 0, r: 1, i: "🤖", t: "Claude Code", s: "follows AGENTS.md", k: "person" },
  env:     { c: 0, r: 3, i: "🔑", t: ".env  FAL_KEY", s: "git-ignored secret", k: "secret" },
  scenes:  { c: 1, r: 0, i: "📜", t: "scenes.json", s: "script + timings", k: "src" },
  project: { c: 1, r: 1, i: "📘", t: "project.json", s: "brief, rules, checks", k: "src" },
  versions:{ c: 1, r: 2, i: "🕘", t: "versions.json", s: "versions, changelog", k: "src" },
  assets:  { c: 1, r: 4, i: "🖼️", t: "assets/bg + vo", s: "images, voiceover", k: "src" },
  build:   { c: 2, r: 1, i: "🏗️", t: "build-*.mjs", s: "pages from the sources", k: "gen" },
  ver:     { c: 2, r: 2, i: "🔖", t: "version.mjs", s: "bump + changelog", k: "gen" },
  genfal:  { c: 2, r: 3, i: "🎨", t: "gen-*.sh", s: "image + voice drafts", k: "gen" },
  audit:   { c: 2, r: 5, i: "🔍", t: "audit-keynote.mjs", s: "text rules per frame", k: "gen" },
  pages:   { c: 3, r: 0, i: "🌐", t: "Site pages", s: "Preprod to Postprod", k: "out" },
  engine:  { c: 3, r: 1, i: "🧩", t: "nav, feedback, css", s: "menu + feedback bar", k: "out" },
  vproj:   { c: 3, r: 4, i: "🎬", t: "video/ project", s: "HTML composition", k: "out" },
  mp4:     { c: 3, r: 5, i: "📼", t: "Final MP4", s: "1080p, 30 fps", k: "out" },
  gh:      { c: 4, r: 0, i: "🐙", t: "GitHub Pages", s: "hosts the live site", k: "ext" },
  fal:     { c: 4, r: 3, i: "✨", t: "fal.ai", s: "images + voice API", k: "ext" },
  hf:      { c: 4, r: 4, i: "🎞️", t: "Hyperframes CLI", s: "Chrome + FFmpeg", k: "ext" },
};
const box = (n) => ({ x: COLX[n.c], y: ROWY[n.r] });
// anchor on a side of a node; f = fraction along that side
const anchor = (id, side, f = 0.5) => {
  const b = box(NODES[id]);
  if (side === "l") return [b.x, b.y + H * f];
  if (side === "r") return [b.x + W, b.y + H * f];
  if (side === "t") return [b.x + W * f, b.y];
  return [b.x + W * f, b.y + H];
};
// edge: from side/fraction to side/fraction, optional label, both arrows, dashed
const EDGES = [
  { a: "you", sa: "b", b: "claude", sb: "t", l: "feedback" },
  { a: "claude", sa: "r", fa: 0.3, b: "scenes", sb: "l", fb: 0.75, l: "edits" },
  { a: "claude", sa: "r", fa: 0.65, b: "project", sb: "l", fb: 0.65 },
  { a: "env", sa: "r", b: "genfal", sb: "l", l: "API key" },
  { a: "scenes", sa: "r", fa: 0.7, b: "build", sb: "l", fb: 0.2, l: "reads" },
  { a: "project", sa: "r", b: "build", sb: "l", fb: 0.5 },
  { a: "versions", sa: "r", fa: 0.3, b: "build", sb: "l", fb: 0.85 },
  { a: "versions", sa: "r", fa: 0.7, b: "ver", sb: "l", fb: 0.7, both: true, l: "writes" },
  { a: "genfal", sa: "l", fa: 0.85, b: "assets", sb: "r", fb: 0.3, l: "writes" },
  { a: "genfal", sa: "r", b: "fal", sb: "l", l: "API calls" },
  { a: "build", sa: "r", fa: 0.3, b: "pages", sb: "l", fb: 0.7, l: "generates" },
  { a: "engine", sa: "t", b: "pages", sb: "b", l: "loaded by" },
  { a: "ver", sa: "r", fa: 0.4, b: "engine", sb: "l", fb: 0.8, l: "stamps" },
  { a: "pages", sa: "r", b: "gh", sb: "l", l: "git push" },
  { a: "engine", sa: "r", fa: 0.4, b: "gh", sb: "l", fb: 0.8 },
  { a: "assets", sa: "r", b: "vproj", sb: "l", l: "media" },
  { a: "vproj", sa: "r", b: "hf", sb: "l", fb: 0.4, l: "render" },
  { a: "hf", sa: "l", fa: 0.85, b: "mp4", sb: "r", fb: 0.3, l: "MP4" },
  { a: "audit", sa: "r", fa: 0.3, b: "vproj", sb: "l", fb: 0.8, l: "audits" },
  { a: "mp4", sa: "l", fa: 0.7, b: "audit", sb: "r", fb: 0.7, l: "thumbs" },
];

// ---- dependency table (what each part needs)
const DEPS = [
  ["📜", "script/scenes.json", "Edited by you and Claude. Read by every generator and by the video project."],
  ["📘", "spec/project.json", "Edited by you and Claude. Read by build-master-spec."],
  ["🕘", "versions.json", "Written only by version.mjs. Read by nav.js (footer, menu), changelog and the changes page."],
  ["🎨", "gen-backgrounds.sh, gen-voiceover.sh", "scenes.json, FAL_KEY in .env, the fal.ai API, plus curl, jq and ffmpeg."],
  ["🏗️", "build-*.mjs", "Node.js, scenes.json, project.json, versions.json, AGENTS.md, and git history (changes page)."],
  ["🔖", "version.mjs", "versions.json. Rewrites nav.js data, changelog.html and the ?v= cache-busters in every page."],
  ["🌐", "Site pages", "The build scripts, plus nav.js, feedback.js and site.css loaded by every page."],
  ["🧩", "nav.js, feedback.js", "versions data stamped into nav.js, and your browser's localStorage for notes and ticks."],
  ["🐙", "GitHub Pages", "A push to main. Pages caches for about 10 minutes, so assets carry a ?v= version."],
  ["🎬", "video/ project", "Generated by build-video.mjs from scenes.json (timings, text), plus assets/bg, assets/vo, the npm package hyperframes@0.9.67 and GSAP from a CDN."],
  ["⏱️", "render-draft.mjs", "build-video, the Hyperframes CLI (check, render), ffmpeg and gh (deploy history). Feeds the First draft, Review and Performance pages."],
  ["🔍", "audit-keynote.mjs", "Google Chrome (DevTools protocol over Node's built-in WebSocket, no npm packages), the scene files in video/compositions, ffmpeg and a rendered MP4 for thumbnails. Writes docs/keynote-audit/."],
  ["🧪", "run-tests.mjs, run-evals.mjs", "Automated test suite (spec, server HTTP 206/CORS, syntax, review query state) and production evals (voiceover WPM pacing, hook retention, editorial compliance)."],
  ["📼", "Final MP4", "The video project rendered by the Hyperframes CLI using headless Chrome and FFmpeg."],
  ["📣", "Publish page, thumbnails", "publish.json, scenes.json (chapters), project.json (disclaimer); thumbnails need headless Chrome, ffmpeg and the fal.ai red-tape plate."],
  ["🤖", "Claude Code", "AGENTS.md for the rules, your pasted feedback as input, git, and gh to check the deploy."],
];

// ---- draw
const nodeSvg = (id, n) => {
  const { x, y } = box(n);
  return `<g class="nd ${n.k}" transform="translate(${x},${y})"><title>${esc(n.t)}: ${esc(n.s)}</title>
  <rect width="${W}" height="${H}" rx="10"/>
  <text class="ic" x="12" y="${H / 2 + 8}">${n.i}</text>
  <text class="tt" x="44" y="${H / 2 - 4}">${esc(n.t)}</text>
  <text class="st" x="44" y="${H / 2 + 14}">${esc(n.s)}</text></g>`;
};
const edgeSvg = (e) => {
  const [x1, y1] = anchor(e.a, e.sa, e.fa ?? 0.5), [x2, y2] = anchor(e.b, e.sb, e.fb ?? 0.5);
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
  const line = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" marker-end="url(#ah)"${e.both ? ' marker-start="url(#ah)"' : ""}/>`;
  const vertical = Math.abs(x1 - x2) < 5; // short vertical arrows: put the label beside the line, not on top of the boxes
  const label = e.l ? (vertical ? `<text class="el" x="${mx + 8}" y="${my + 3}" text-anchor="start">${esc(e.l)}</text>` : `<text class="el" x="${mx}" y="${my - 5}" text-anchor="middle">${esc(e.l)}</text>`) : "";
  return `<g class="ed">${line}${label}</g>`;
};
const [gx, gy] = anchor("gh", "t", 0.5), [yx, yy] = anchor("you", "t", 0.5);
const loop = `<g class="ed loop"><path d="M${gx},${gy} L${gx},22 L${yx},22 L${yx},${yy - 1}" fill="none" marker-end="url(#ah)"/>
  <text class="el" x="${(gx + yx) / 2}" y="16" text-anchor="middle">👀 you review the live site in Chrome, copy feedback, paste it to Claude</text></g>`;

const svg = `<svg viewBox="0 0 ${VB.w} ${VB.h}" role="img" aria-labelledby="archT archD" xmlns="http://www.w3.org/2000/svg">
<title id="archT">Architecture of the video workspace</title>
<desc id="archD">You and Claude Code edit the source files. Generators build the site pages and media. Pages deploy to GitHub Pages, the video project renders to MP4 with Hyperframes, and your feedback loops back to Claude.</desc>
<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="ahp"/></marker></defs>
${["Inputs", "Sources of truth", "Generators", "Outputs", "Platforms"].map((t, i) => `<text class="col" x="${COLX[i] + W / 2}" y="${ROWY[5] + H + 16}" text-anchor="middle">${t}</text>`).join("")}
${EDGES.map(edgeSvg).join("\n")}
${loop}
${Object.entries(NODES).map(([id, n]) => nodeSvg(id, n)).join("\n")}
</svg>`;

const css = `<style>
#arch{margin:24px 0 8px}#arch h2{margin:0 0 4px;font-size:20px}#arch .sub2{color:var(--mute);margin:0 0 12px;font-size:14px}
#arch .scroll{overflow-x:auto;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:8px}
#arch svg{display:block;min-width:820px;width:100%;height:auto;font-family:system-ui,sans-serif}
#arch .nd rect{fill:var(--bg);stroke:var(--line);stroke-width:1.5}
#arch .nd.src rect{stroke:var(--accent);stroke-width:2}#arch .nd.gen rect{stroke:#7c6bd6;stroke-width:2}#arch .nd.out rect{stroke:#2f9e6e;stroke-width:2}
#arch .nd.ext rect{stroke:var(--mute);stroke-width:1.5;stroke-dasharray:5 4}#arch .nd.secret rect{stroke:#d08a1e;stroke-width:2;stroke-dasharray:2 3}#arch .nd.person rect{stroke:var(--ink);stroke-width:1.5}
#arch .ic{font-size:22px}#arch .tt{font-size:13px;font-weight:700;fill:var(--ink)}#arch .st{font-size:10.5px;fill:var(--mute)}
#arch .ed line,#arch .ed path{stroke:var(--mute);stroke-width:1.5;fill:none}#arch .loop path{stroke:var(--accent);stroke-dasharray:6 4;stroke-width:1.6}
#arch .ahp{fill:var(--mute)}#arch .el{font-size:10px;fill:var(--mute);paint-order:stroke;stroke:var(--card);stroke-width:4px;stroke-linejoin:round}
#arch .loop .el{fill:var(--accent);font-size:11px}#arch .col{font-size:11px;font-weight:700;fill:var(--mute);letter-spacing:.06em;text-transform:uppercase}
#arch .legend{display:flex;flex-wrap:wrap;gap:6px 16px;margin:10px 2px;font-size:12.5px;color:var(--mute)}
#arch .legend i{display:inline-block;width:14px;height:14px;border-radius:4px;border:2px solid;vertical-align:-2px;margin-right:6px}
#arch table{width:100%;border-collapse:collapse;background:var(--card);border:1px solid var(--line);border-radius:10px;overflow:hidden;font-size:14px;margin-top:6px}
#arch th,#arch td{text-align:left;padding:8px 12px;border-bottom:1px solid var(--line);vertical-align:top}#arch th{color:var(--accent);font-size:12px;text-transform:uppercase;letter-spacing:.04em}#arch tr:last-child td{border-bottom:0}
#arch .tw{overflow-x:auto}#arch details{margin-top:10px}#arch summary{cursor:pointer;color:var(--accent);font-weight:600}
</style>`;

const legend = `<div class="legend">
<span><i style="border-color:var(--ink)"></i>People and agents</span>
<span><i style="border-color:var(--accent)"></i>Source of truth</span>
<span><i style="border-color:#7c6bd6"></i>Generator</span>
<span><i style="border-color:#2f9e6e"></i>Output</span>
<span><i style="border-color:var(--mute);border-style:dashed"></i>External service</span>
<span><i style="border-color:#d08a1e;border-style:dotted"></i>Secret</span>
<span>Arrow = depends on / feeds into</span></div>`;

const table = `<details open><summary>Dependencies, part by part</summary><div class="tw"><table><tr><th></th><th>Part</th><th>Depends on</th></tr>${DEPS.map(([i, p, d]) => `<tr><td>${i}</td><td><b>${esc(p)}</b></td><td>${esc(d)}</td></tr>`).join("")}</table></div></details>`;

const block = `<!--ARCH-START-->
${css}
<section id="arch">
  <h2>🏗️ Architecture</h2>
  <p class="sub2">How the pieces fit: you and Claude edit two source files, generators turn them into pages and media, GitHub Pages serves the site, Hyperframes renders the video, and your feedback loops back. Generated by <code>scripts/build-architecture.mjs</code>.</p>
  <div class="scroll">${svg}</div>
  ${legend}
  ${table}
</section>
<!--ARCH-END-->`;

const p = `${root}/index.html`;
let html = readFileSync(p, "utf8");
if (!html.includes("<!--ARCH-START-->")) {
  // first run: put the block right after the subtitle paragraph
  html = html.replace(/(<p class="sub">[\s\S]*?<\/p>\n)/, `$1  <!--ARCH-START--><!--ARCH-END-->\n`);
}
html = html.replace(/<!--ARCH-START-->[\s\S]*?<!--ARCH-END-->/, block.replace(/\$/g, "$$$$"));
writeFileSync(p, html);
console.log(`wrote architecture into index.html (${Object.keys(NODES).length} nodes, ${EDGES.length} edges, ${DEPS.length} dependency rows)`);
