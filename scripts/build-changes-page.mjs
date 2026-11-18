// Builds changes.html: what is changing, from git history and the working tree.
//   node scripts/build-changes-page.mjs
// Run it AFTER `version.mjs bump` and BEFORE `git commit`: "Latest release" compares HEAD with the working tree.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const git = (...a) => execFileSync("git", a, { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });
const tryGit = (...a) => { try { return git(...a); } catch { return null; } };
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const REPO = "https://github.com/rifaterdemsahin/hyperframes";

const V = JSON.parse(readFileSync(`${root}/versions.json`, "utf8"));
const nowScenes = JSON.parse(readFileSync(`${root}/script/scenes.json`, "utf8"));
const showJson = (rev, path) => { const t = tryGit("show", `${rev}:${path}`); try { return t ? JSON.parse(t) : null; } catch { return null; } };

// ---- word-level diff (longest common subsequence)
function wordDiff(a, b) {
  const x = String(a || "").split(/\s+/).filter(Boolean), y = String(b || "").split(/\s+/).filter(Boolean);
  const n = x.length, m = y.length;
  const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const out = []; let i = 0, j = 0;
  while (i < n && j < m) {
    if (x[i] === y[j]) { out.push(esc(x[i])); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) out.push(`<del>${esc(x[i++])}</del>`);
    else out.push(`<ins>${esc(y[j++])}</ins>`);
  }
  while (i < n) out.push(`<del>${esc(x[i++])}</del>`);
  while (j < m) out.push(`<ins>${esc(y[j++])}</ins>`);
  return out.join(" ");
}

// ---- compare two scenes files; returns html or "" when the text did not change
function sceneChanges(before, after) {
  if (!before || !after) return "";
  const prev = Object.fromEntries(before.scenes.map((s) => [s.id, s]));
  const rows = [];
  for (const s of after.scenes) {
    const p = prev[s.id];
    if (!p) { rows.push(`<div class="chg"><h3>${esc(s.title)} <small>new scene</small></h3><p class="vo">${esc(s.vo)}</p></div>`); continue; }
    const bits = [];
    if (p.vo !== s.vo) bits.push(`<p class="vo">${wordDiff(p.vo, s.vo)}</p>`);
    if (p.title !== s.title) bits.push(`<p class="meta">Title: <del>${esc(p.title)}</del> <ins>${esc(s.title)}</ins></p>`);
    if (JSON.stringify(p.overlay) !== JSON.stringify(s.overlay)) {
      const a = (p.overlay || []).join(" / "), b = (s.overlay || []).join(" / ");
      bits.push(`<p class="meta">On screen: ${wordDiff(a, b)}</p>`);
    }
    if (p.broll !== s.broll) bits.push(`<p class="meta">B-roll: ${wordDiff(p.broll, s.broll)}</p>`);
    if (p.duration !== s.duration) bits.push(`<p class="meta">Slot: <del>${p.duration} s</del> <ins>${s.duration} s</ins></p>`);
    const textChanged = p.vo !== s.vo || p.title !== s.title || JSON.stringify(p.overlay) !== JSON.stringify(s.overlay) || p.broll !== s.broll;
    if (bits.length && textChanged) rows.push(`<div class="chg"><h3>${esc(s.title)}</h3>${bits.join("")}</div>`);
  }
  const gone = before.scenes.filter((p) => !after.scenes.find((s) => s.id === p.id));
  gone.forEach((p) => rows.push(`<div class="chg"><h3>${esc(p.title)} <small>removed</small></h3></div>`));
  const titleChange = before.title !== after.title ? `<p class="meta">Video title: <del>${esc(before.title)}</del> <ins>${esc(after.title)}</ins></p>` : "";
  return rows.length || titleChange ? titleChange + rows.join("\n") : "";
}

// ---- latest release: HEAD vs working tree
const headScenes = showJson("HEAD", "script/scenes.json");
const latestScript = sceneChanges(headScenes, nowScenes);
const headV = showJson("HEAD", "versions.json");
const bumped = headV
  ? Object.entries(V.pages).filter(([k, p]) => !headV.pages[k] || headV.pages[k].version !== p.version)
      .map(([k, p]) => `<tr><td><a href="${esc(k)}">${esc(p.title)}</a></td><td>${headV.pages[k] ? "v" + esc(headV.pages[k].version) : "new"}</td><td>v${esc(p.version)}</td></tr>`)
  : [];
const clearedNow = Object.entries(V.feedbackCleared || {}).filter(([k, t]) => !headV || !(headV.feedbackCleared || {})[k] || (headV.feedbackCleared || {})[k] !== t).map(([k]) => (k === "*" ? "all pages" : (V.pages[k] || {}).title || k));
const rel = V.changelog[0];

// ---- script changes by past release (commits that touched scenes.json), newest first
const log = git("log", "--reverse", "--format=%H%x09%ad%x09%s", "--date=format:%Y-%m-%d %H:%M", "--", "script/scenes.json").trim().split("\n").filter(Boolean).map((l) => { const [h, d, ...s] = l.split("\t"); return { h, d, s: s.join("\t") }; });
const history = [];
for (let i = 1; i < log.length; i++) {
  const a = showJson(log[i - 1].h, "script/scenes.json"), b = showJson(log[i].h, "script/scenes.json");
  const html = sceneChanges(a, b);
  if (html) history.push({ ...log[i], html });
}
history.reverse();

// ---- recent commits
const commits = git("log", "-n", "20", "--format=%h%x09%ad%x09%s", "--date=format:%Y-%m-%d %H:%M").trim().split("\n").map((l) => { const [h, d, ...s] = l.split("\t"); return { h, d, s: s.join("\t") }; });

const page = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Changes</title>
<link rel="stylesheet" href="site.css">
<style>
ins{background:#2f855a33;color:var(--ok);text-decoration:none;border-radius:3px;padding:0 2px}del{background:#c5303033;color:#ff6b6b;border-radius:3px;padding:0 2px}
.chg{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:12px 16px;margin:12px 0}.chg h3{margin:0 0 6px}.chg h3 small{color:var(--mute);font-weight:400}
.vo{font-size:16px;margin:8px 0}.meta{font-size:13.5px;color:var(--mute);margin:4px 0}.rel{margin:22px 0}.rel>h3{margin:0 0 4px;font-size:17px}.rel>h3 small{color:var(--mute);font-weight:400}
.legend ins,.legend del{margin-right:8px}
</style></head><body>
<script src="nav.js?v=${V.site}"></script>
<main>
  <h1>🔄 Changes</h1>
  <p class="lead">What is changing in this project: the latest release, how the script changed word by word, which pages moved version, and recent commits. Generated from git by <code>scripts/build-changes-page.mjs</code>.</p>
  <p class="legend"><small><ins>added</ins> <del>removed</del> &nbsp; Version history and the per-page version table are on the <a href="changelog.html">Changelog</a>.</small></p>

  <h2>Latest release: v${esc(rel.version)} <small>${esc(rel.date)}</small></h2>
  <div class="card"><ul>${rel.changes.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div>
  ${clearedNow.length ? `<p><small>Feedback notes cleared on: <b>${clearedNow.map(esc).join(", ")}</b>. The version is the only record kept.</small></p>` : ""}

  <h2>Page versions that moved</h2>
  ${bumped.length ? `<div class="tw"><table><tr><th>Page</th><th>From</th><th>To</th></tr>${bumped.join("")}</table></div>` : "<p>No page versions changed since the last commit.</p>"}

  <h2>Script changes in this release</h2>
  ${latestScript || "<p>No script wording changed since the last commit.</p>"}

  <h2>Script changes in earlier releases</h2>
  ${history.length ? history.map((h) => `<div class="rel"><h3>${esc(h.s)} <small>${esc(h.d)} · <a href="${REPO}/commit/${h.h}">${h.h.slice(0, 7)}</a></small></h3>${h.html}</div>`).join("\n") : "<p>No earlier script rewrites recorded.</p>"}

  <h2>Recent commits</h2>
  <div class="tw"><table><tr><th>Commit</th><th>When</th><th>What</th></tr>${commits.map((c) => `<tr><td><a href="${REPO}/commit/${c.h}">${esc(c.h)}</a></td><td>${esc(c.d)}</td><td>${esc(c.s)}</td></tr>`).join("")}</table></div>
  <p><small>The release in progress is not a commit yet, so it appears above under Latest release and here after the next build.</small></p>
</main></body></html>
`;
writeFileSync(`${root}/changes.html`, page);
console.log(`wrote changes.html (${history.length} earlier script releases, ${bumped.length} pages moved, latest script diff ${latestScript ? "yes" : "none"})`);
