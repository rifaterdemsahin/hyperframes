// Builds gaps.html: everything that is waiting on the owner. The list is the kanban's "Needs your input" column;
// spec/gaps.json adds what each item blocks, how to deliver it and where it matters.  Run: node scripts/build-gaps-page.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const V = JSON.parse(readFileSync(`${root}/versions.json`, "utf8"));
const G = JSON.parse(readFileSync(`${root}/spec/gaps.json`, "utf8"));
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// the kanban holds its tasks as a JS array: read it from the page itself so there is one list
const k = readFileSync(`${root}/kanban.html`, "utf8");
const a = k.indexOf("const TASKS=[") + "const TASKS=".length, b = k.indexOf("];\nconst KEY", a) + 1;
const tasks = new Function(`return ${k.slice(a, b)}`)();
const waiting = tasks.filter((t) => t.col === "input");

const items = waiting.map((t) => ({ ...t, meta: G.items[t.id] || { group: "approval", how: "Tell me in the chat.", link: "kanban.html", linkLabel: "Open the kanban" } }));
const groups = G.groups.map((g) => ({ ...g, items: items.filter((i) => i.meta.group === g.id) })).filter((g) => g.items.length);

const card = (i) => `<div class="gap" id="${esc(i.id)}">
  <h3>⏳ ${esc(i.title)}</h3>
  <p>${esc(i.desc)}</p>
  ${i.meta.blocks ? `<p class="blk"><b>Blocks:</b> ${esc(i.meta.blocks)}</p>` : ""}
  <p class="how"><b>How to deliver it:</b> ${esc(i.meta.how)}</p>
  <p><a class="go" href="${esc(i.meta.link)}">${esc(i.meta.linkLabel || "Open")} &rarr;</a> <span class="st">Not delivered</span></p>
</div>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Gaps</title>
<link rel="stylesheet" href="site.css">
<style>
.pills{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.pills a{text-decoration:none;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:999px;padding:5px 14px;font-size:14px}.pills a:hover{border-color:var(--accent)}.pills b{color:var(--accent)}
.gap{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--warn);border-radius:12px;padding:12px 16px;margin:12px 0}.gap h3{margin:0 0 4px}.gap p{margin:5px 0}.blk{color:var(--mute);font-size:14px}.how{font-size:15px}
a.go{display:inline-block;background:var(--accent);color:#04222a;font-weight:700;text-decoration:none;border-radius:8px;padding:6px 14px}.st{margin-left:10px;color:var(--warn);font-size:13px;font-weight:700}
</style></head><body>
<script src="nav.js?v=${V.site}"></script>
<main>
  <div class="crumbs">📝 Preprod</div>
  <h1>🧩 Gaps</h1>
  <p class="lead"><b>${waiting.length} things are waiting on you</b> before this video can be finished and published. None of them has been delivered yet.</p>
  <div class="pills">${groups.map((g) => `<a href="#g-${esc(g.id)}">${esc(g.title)} <b>${g.items.length}</b></a>`).join("")}</div>
  <p class="note">The list is the <a href="kanban.html">kanban</a>'s "Needs your input" column. When you deliver something, tell me and I move it to Done, and it disappears from here. Every card says how to deliver it and links to where it matters.</p>
${groups.map((g) => `  <h2 id="g-${esc(g.id)}">${esc(g.title)} <small>${g.items.length}</small></h2>\n${g.items.map(card).join("\n")}`).join("\n")}
</main>
</body></html>
`;
writeFileSync(`${root}/gaps.html`, html);
console.log(`wrote gaps.html (${waiting.length} gaps in ${groups.length} groups)`);
