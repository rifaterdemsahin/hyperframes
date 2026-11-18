// Versioning for every page. Source of truth: versions.json.
//   node scripts/version.mjs                      re-stamp only (nav.js data, changelog.html, ?v= cache-busters)
//   node scripts/version.mjs bump minor|patch|major "what changed" [page ...]
//        bumps the site version, bumps the listed pages (default: all) by the same kind,
//        adds a changelog entry, then re-stamps.
// Page keys are the ones in versions.json, e.g. compare.html or storyboard/ .
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const vpath = `${root}/versions.json`;
const v = JSON.parse(readFileSync(vpath, "utf8"));

const inc = (ver, kind) => {
  const [a, b, c] = ver.split(".").map(Number);
  return kind === "major" ? `${a + 1}.0.0` : kind === "minor" ? `${a}.${b + 1}.0` : `${a}.${b}.${c + 1}`;
};

const [cmd, kind, msg, ...pages] = process.argv.slice(2);
if (cmd === "bump") {
  if (!["major", "minor", "patch"].includes(kind) || !msg) {
    console.error('usage: version.mjs bump major|minor|patch "message" [page ...]');
    process.exit(1);
  }
  const today = new Date().toISOString().slice(0, 10);
  const targets = pages.length ? pages : Object.keys(v.pages);
  for (const k of targets) {
    if (!v.pages[k]) { console.error(`unknown page: ${k}`); process.exit(1); }
    v.pages[k].version = inc(v.pages[k].version, kind);
    v.pages[k].date = today;
  }
  v.site = inc(v.site, kind);
  v.date = today;
  // the changelog page is itself a page: it changes with every release
  v.pages["changelog.html"].version = v.site;
  v.pages["changelog.html"].date = today;
  v.changelog.unshift({ version: v.site, date: today, pages: pages.length ? pages : ["all"], changes: [msg] });
  writeFileSync(vpath, JSON.stringify(v, null, 2) + "\n");
  console.log(`site -> ${v.site}`);
}

// 1. nav.js data block
const navPath = `${root}/nav.js`;
let nav = readFileSync(navPath, "utf8");
const pagesOut = Object.fromEntries(Object.entries(v.pages).map(([k, p]) => [k, { t: p.title, v: p.version, d: p.date }]));
const block = `/*VERSIONS-START*/ var VERSIONS = ${JSON.stringify({ site: v.site, date: v.date, pages: pagesOut })}; /*VERSIONS-END*/`;
nav = nav.replace(/\/\*VERSIONS-START\*\/[\s\S]*?\/\*VERSIONS-END\*\//, block);
writeFileSync(navPath, nav);

// 2. cache-busters: ?v=<site version> on nav.js in every page and in the page builders
const walk = (d) =>
  readdirSync(d).flatMap((f) => {
    const p = join(d, f);
    if (["node_modules", ".git", "video", "docs"].includes(f)) return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
let stamped = 0;
for (const f of walk(root).filter((p) => /\.(html|mjs)$/.test(p))) {
  const s = readFileSync(f, "utf8");
  const t = s.replace(/(src="(?:\.\.\/)?nav\.js)(\?v=[\w.]+)?"/g, `$1?v=${v.site}"`);
  if (t !== s) { writeFileSync(f, t); stamped++; }
}

// 3. changelog page
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const entries = v.changelog
  .map(
    (e) => `<section class="rel"><h2>v${esc(e.version)} <small>${esc(e.date)}${e.pages[0] === "all" ? " · all pages" : " · " + e.pages.map(esc).join(", ")}</small></h2><ul>${e.changes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></section>`
  )
  .join("\n");
const rows = Object.entries(v.pages)
  .map(([k, p]) => `<tr><td><a href="${k}">${esc(p.title)}</a></td><td>v${esc(p.version)}</td><td>${esc(p.date)}</td></tr>`)
  .join("");
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Changelog</title>
<link rel="stylesheet" href="site.css">
</head><body>
<script src="nav.js?v=${v.site}"></script>
<main>
  <h1>🕘 Changelog</h1>
  <p class="lead">Site version <b>v${esc(v.site)}</b>, updated ${esc(v.date)}. Every page shows its own version in its footer.</p>
  <h2>Page versions</h2>
  <div class="tw"><table><tr><th>Page</th><th>Version</th><th>Updated</th></tr>${rows}</table></div>
  <h2>Releases</h2>
${entries}
  <p class="note">How it works: <code>versions.json</code> is the source of truth. <code>node scripts/version.mjs bump minor "what changed" [page ...]</code> bumps the versions, adds an entry here and refreshes every page. Use patch for wording fixes, minor for new content or features, major for a restructure.</p>
</main>
</body></html>
`;
writeFileSync(`${root}/changelog.html`, html);
console.log(`stamped ${stamped} files, wrote changelog.html, nav.js data -> site v${v.site}`);
