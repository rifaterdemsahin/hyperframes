// Builds agents.html from AGENTS.md (small Markdown converter: headings, lists, tables, code, bold, links).
// Run: node scripts/build-agents-page.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const md = readFileSync(`${root}/AGENTS.md`, "utf8");
const V = JSON.parse(readFileSync(`${root}/versions.json`, "utf8"));
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const inline = (s) =>
  esc(s)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

const lines = md.split("\n");
const out = [];
let i = 0;
while (i < lines.length) {
  const l = lines[i];
  if (l.startsWith("```")) {
    const buf = []; i++;
    while (i < lines.length && !lines[i].startsWith("```")) buf.push(lines[i++]);
    i++; out.push(`<pre>${esc(buf.join("\n"))}</pre>`); continue;
  }
  if (/^#{1,3} /.test(l)) {
    const n = l.match(/^#+/)[0].length; out.push(`<h${n}>${inline(l.replace(/^#+ /, ""))}</h${n}>`); i++; continue;
  }
  if (l.startsWith("|")) {
    const rows = [];
    while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++]);
    const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const [head, , ...body] = rows;
    out.push(`<div class="tw"><table><tr>${cells(head).map((c) => `<th>${inline(c)}</th>`).join("")}</tr>${body.map((r) => `<tr>${cells(r).map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</table></div>`);
    continue;
  }
  if (/^\d+\. /.test(l)) {
    const items = [];
    while (i < lines.length && /^\d+\. /.test(lines[i])) items.push(lines[i++].replace(/^\d+\. /, ""));
    out.push(`<ol>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</ol>`); continue;
  }
  if (/^- /.test(l)) {
    const items = [];
    while (i < lines.length && /^- /.test(lines[i])) items.push(lines[i++].slice(2));
    out.push(`<ul>${items.map((t) => `<li>${inline(t)}</li>`).join("")}</ul>`); continue;
  }
  if (l.trim() === "") { i++; continue; }
  const para = [];
  while (i < lines.length && lines[i].trim() !== "" && !/^(#|```|\||- |\d+\. )/.test(lines[i])) para.push(lines[i++]);
  out.push(`<p>${inline(para.join(" "))}</p>`);
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>AGENTS.md</title>
<link rel="stylesheet" href="site.css">
</head><body>
<script src="nav.js?v=${V.site}"></script>
<main>
  <p class="note">This page is generated from <a href="https://github.com/rifaterdemsahin/hyperframes/blob/main/AGENTS.md"><code>AGENTS.md</code></a> in the repo root, the instructions any AI coding agent reads first. It is part of the reusable template: see <a href="reuse.html">Reuse as template</a>. To change it, edit <code>AGENTS.md</code> and run <code>node scripts/build-agents-page.mjs</code>.</p>
${out.join("\n")}
</main></body></html>
`;
writeFileSync(`${root}/agents.html`, html);
console.log("wrote agents.html");
