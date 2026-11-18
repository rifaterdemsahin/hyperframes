// Builds the site menu (into nav.js) and the pipeline overview (into index.html) from spec/menu.json.
//   node scripts/build-menu.mjs
// Stages run in production order: Plan, Build, Review, Publish, Project. The intro shows live status per stage.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const J = (p) => JSON.parse(readFileSync(`${root}/${p}`, "utf8"));
const M = J("spec/menu.json"), S = J("script/scenes.json"), P = J("spec/project.json"), V = J("versions.json"), PUB = J("spec/publish.json"), GAPS = J("spec/gaps.json"), D = J("draft/versions.json");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const tc = (s) => `${Math.floor(s / 60)}:${String(Math.round(s) % 60).padStart(2, "0")}`;
const total = S.scenes[S.scenes.length - 1].start + S.scenes[S.scenes.length - 1].duration;

// ---------- 1. nav.js: the MENU array
const MENU = [{ label: "🏠 Home", href: "" }].concat(
  M.stages.map((st) => ({ label: `${st.icon} ${st.n} ${st.label}`, items: st.items.map((it) => (it.heading ? { h: it.heading } : [it.label, it.href])) }))
);
const navPath = `${root}/nav.js`;
let nav = readFileSync(navPath, "utf8");
const block = `/*MENU-START*/ var MENU = ${JSON.stringify(MENU, null, 2).replace(/\n\s*/g, "")}; /*MENU-END*/`;
if (!nav.includes("/*MENU-START*/")) throw new Error("nav.js has no MENU markers: run the one-time migration first");
nav = nav.replace(/\/\*MENU-START\*\/[\s\S]*?\/\*MENU-END\*\//, block.replace(/\$/g, "$$$$"));
writeFileSync(navPath, nav);

// ---------- 2. live status per stage (from the same data files the pages use)
const k = readFileSync(`${root}/kanban.html`, "utf8");
const a = k.indexOf("const TASKS=[") + "const TASKS=".length, b = k.indexOf("];\nconst KEY", a) + 1;
const waiting = new Function(`return ${k.slice(a, b)}`)().filter((t) => t.col === "input");
const grp = (t) => (GAPS.items[t.id] || {}).group;
const nRender = waiting.filter((t) => grp(t) === "render").length, nPublish = waiting.filter((t) => grp(t) === "publish").length;
const openDecisions = P.decisions.filter((d) => !/^decided/i.test(d.status)).length;
const meta = existsSync(`${root}/draft/v${D.latest}/meta.json`) ? J(`draft/v${D.latest}/meta.json`) : null;
const chosen = PUB.titles.some((t) => t.selected) && PUB.thumbnails.some((t) => t.selected);
const STATUS = {
  plan: `${S.scenes.length} scenes · ${tc(total)}${openDecisions ? ` · ${openDecisions} open decisions` : " · no open decisions"}`,
  build: `Draft v${D.latest}${meta ? ` · ${tc(meta.duration)} · check: ${meta.check}` : ""}`,
  review: `${waiting.length} things waiting on you · ${nRender} block the final video`,
  publish: `${chosen ? "Title and thumbnail chosen" : "Title and thumbnail not chosen yet"} · ${nPublish} blockers`,
  project: `site v${V.site} · ${Object.keys(V.pages).length} pages`,
};

// ---------- 3. index.html: the pipeline
const url = (h) => h;
const card = (st) => {
  const hub = st.items.filter((i) => i.hub && i.href), more = st.items.filter((i) => i.href).length - hub.length;
  return `<li class="stg" id="stage-${st.id}">
    <div class="sh"><span class="n">${st.n}</span><span class="ic">${st.icon}</span><b>${esc(st.label)}</b><small>${esc(st.alias)}</small></div>
    <p class="purpose">${esc(st.purpose)}</p>
    <p class="status">📊 ${esc(STATUS[st.id])}</p>
    <ul>${hub.map((i) => `<li><a href="${url(i.href)}">${esc(i.label)}</a>${i.desc ? ` <span>${esc(i.desc)}</span>` : ""}</li>`).join("")}</ul>
    ${more > 0 ? `<p class="more">+ ${more} more in the menu</p>` : ""}
  </li>`;
};
const css = `<style>
#pipeline{margin:22px 0 8px}#pipeline h2{margin:0 0 4px;font-size:20px}#pipeline .sub2{color:var(--mute);margin:0 0 14px;font-size:14px}
#pipeline ol.stages{list-style:none;padding:0;margin:0;display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr))}
#pipeline .stg{position:relative;background:var(--card);border:1px solid var(--line);border-top:4px solid var(--accent);border-radius:12px;padding:12px 14px;margin:0;color:var(--ink)}
#pipeline .sh{display:flex;align-items:center;gap:8px;flex-wrap:wrap}#pipeline .n{background:var(--accent);color:#04222a;font-weight:800;border-radius:50%;width:24px;height:24px;display:inline-flex;align-items:center;justify-content:center;font-size:13px}
#pipeline .ic{font-size:20px}#pipeline .sh b{font-size:17px}#pipeline .sh small{color:var(--mute);margin-left:auto}
#pipeline .purpose{margin:8px 0 4px;color:var(--mute);font-size:14px}#pipeline .status{margin:4px 0 8px;font-size:13px;font-weight:600;color:var(--accent)}
#pipeline ul{list-style:none;padding:0;margin:0}#pipeline ul li{margin:6px 0;font-size:14px;color:var(--ink)}#pipeline ul a{color:var(--accent);font-weight:600;text-decoration:none}#pipeline ul a:hover{text-decoration:underline}#pipeline ul span{display:block;color:var(--mute);font-size:12.5px}
#pipeline .more{margin:6px 0 0;color:var(--mute);font-size:12.5px}
@media(min-width:1100px){#pipeline .stg+.stg:before{content:"→";position:absolute;left:-13px;top:50%;transform:translateY(-50%);color:var(--mute);font-size:16px}}
</style>`;
const pipeline = `<!--PIPELINE-START-->
${css}
<section id="pipeline">
  <h2>🧭 The pipeline</h2>
  <p class="sub2">Five stages, in production order. The menu at the top has the same stages in the same order. Each card shows where that stage stands right now.</p>
  <ol class="stages">${M.stages.map(card).join("")}</ol>
</section>
<!--PIPELINE-END-->`;
const ip = `${root}/index.html`;
let html = readFileSync(ip, "utf8");
if (!html.includes("<!--PIPELINE-START-->")) html = html.replace(/(<p class="sub">[\s\S]*?<\/p>\n)/, `$1  <!--PIPELINE-START--><!--PIPELINE-END-->\n`);
html = html.replace(/<!--PIPELINE-START-->[\s\S]*?<!--PIPELINE-END-->/, pipeline.replace(/\$/g, "$$$$"));
// the intro's one-line description comes from the data too (it used to go stale)
html = html.replace(/<p class="sub">[\s\S]*?<\/p>/, `<p class="sub">How I used AI to get through the red tape of closing a UK company: ${esc(`${tc(total)}`)} film, ${S.scenes.length} scenes, built in Hyperframes. Draft v${D.latest} is the latest cut.</p>`);
// the old card grid and the old "Stages" list are replaced by the pipeline above
html = html.replace(/  <div class="grid">[\s\S]*?  <\/div>\n(?=  <h2>Stages<\/h2>)/, "").replace(/  <h2>Stages<\/h2>\n  <ol>[\s\S]*?<\/ol>\n/, "");
writeFileSync(ip, html);
console.log(`menu: ${MENU.length - 1} stages written to nav.js; pipeline written to index.html (${Object.values(STATUS).join(" | ")})`);
