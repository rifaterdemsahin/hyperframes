// Shared top menu with sub menus. Include with <script src="nav.js"></script> (or ../nav.js from a subfolder) right after <body>.
// To add a page: add a row to MENU below. Every page picks it up.
(function () {
  // Smart redirect to Fly.io backend with Azure Key Vault live support
  if (location.hostname === "rifaterdemsahin.github.io" && !location.search.includes("noredirect=1")) {
    var flyHost = "https://hyperframes-review.fly.dev";
    var flyPath = location.pathname.replace(/^\/hyperframes/, "");
    if (!flyPath || flyPath === "/") flyPath = "/";
    location.replace(flyHost + flyPath + location.search + location.hash);
    return;
  }

  var base = document.currentScript.src.replace(/nav\.js(\?.*)?$/, "");
  var G = "https://github.com/rifaterdemsahin/hyperframes";
  // Written by scripts/version.mjs from versions.json. Do not edit by hand.
  /*VERSIONS-START*/ var VERSIONS = {"site":"1.40.0","date":"2026-11-20","cleared":{"*":"2026-11-18T21:55:42.014Z","script.html":"2026-11-18T22:07:30.860Z","publish.html":"2026-11-18T22:18:45.249Z","review.html":"2026-11-20T19:51:13.923Z"},"pages":{"index.html":{"t":"Home","v":"1.12.0","d":"2026-11-20","deps":["scripts/build-architecture.mjs"]},"script.html":{"t":"Script","v":"1.13.0","d":"2026-11-20","deps":["script/scenes.json","scripts/build-script-page.mjs"]},"storyboard/":{"t":"Storyboard","v":"1.13.0","d":"2026-11-20","deps":["script/scenes.json","scripts/build-storyboard.mjs","scripts/storyboard-editor.js","video/assets/bg/","video/assets/vo/"]},"kanban.html":{"t":"Kanban","v":"1.10.0","d":"2026-11-20","deps":[]},"recommendations.html":{"t":"Recommendations","v":"1.10.0","d":"2026-11-20","deps":["script/scenes.json","first-draft.html","publish.html","draft/versions.json","spec/gaps.json","spec/project.json"]},"hyperframes-guide/":{"t":"Hyperframes overview","v":"1.5.0","d":"2026-11-18","deps":["https://hyperframes.heygen.com/introduction.md","video/CLAUDE.md"]},"hyperframes-guide/rendering.html":{"t":"Rendering paths","v":"1.4.0","d":"2026-11-18","deps":["https://hyperframes.heygen.com/deploy/overview.md","https://hyperframes.heygen.com/guides/rendering.md"]},"hyperframes-guide/speed.html":{"t":"Cloud vs local speed","v":"1.5.0","d":"2026-11-18","deps":["spec/performance.json","performance.html","https://hyperframes.heygen.com/deploy/aws-lambda.md"]},"hyperframes-guide/cli.html":{"t":"CLI cheat sheet","v":"1.4.0","d":"2026-11-18","deps":["video/CLAUDE.md","https://hyperframes.heygen.com/packages/cli.md"]},"compare.html":{"t":"Hyperframes vs Remotion","v":"1.4.0","d":"2026-11-18","deps":["https://hyperframes.heygen.com/guides/hyperframes-vs-remotion.md","https://www.remotion.pro/pricing","https://github.com/heygen-com/hyperframes","https://github.com/remotion-dev/remotion","https://www.npmjs.com/package/hyperframes"]},"why-pay.html":{"t":"Why pay?","v":"1.4.0","d":"2026-11-18","deps":["https://hyperframes.studio/pricing","https://hyperframes.heygen.com/faq.md","https://hyperframes.heygen.com/guides/free-agents.md"]},"changelog.html":{"t":"Changelog","v":"1.40.0","d":"2026-11-20","deps":["versions.json","scripts/version.mjs"]},"master-spec.html":{"t":"Master spec","v":"1.15.0","d":"2026-11-20","deps":["spec/project.json","script/scenes.json","scripts/build-master-spec.mjs"]},"release-checklist.html":{"t":"Release checklist","v":"1.7.0","d":"2026-11-18","deps":["spec/project.json","spec/publish.json","script/scenes.json","scripts/build-master-spec.mjs"]},"agents.html":{"t":"AGENTS.md","v":"1.14.0","d":"2026-11-20","deps":["AGENTS.md","scripts/build-agents-page.mjs"]},"costs.html":{"t":"Costs & estimates","v":"1.3.1","d":"2026-11-20","deps":["draft/versions.json","spec/performance.json","script/scenes.json"]},"video-releases.html":{"t":"Video releases & limits","v":"1.3.0","d":"2026-11-20","deps":["draft/versions.json","video/renders/","scripts/publish-release.mjs"]},"reuse.html":{"t":"Reuse as template","v":"1.7.0","d":"2026-11-18","deps":["templates/README.md","AGENTS.md","templates/"]},"changes.html":{"t":"Changes","v":"1.19.0","d":"2026-11-20","deps":["versions.json","script/scenes.json","scripts/build-changes-page.mjs","https://github.com/rifaterdemsahin/hyperframes/commits/main"]},"publish.html":{"t":"Title, description, thumbnail","v":"1.9.0","d":"2026-11-18","deps":["spec/publish.json","script/scenes.json","spec/project.json","thumbnails/thumb-a.html","thumbnails/thumb-b.html","scripts/build-publish-page.mjs","scripts/build-thumbnails.sh"]},"hyperframes-guide/signin.html":{"t":"Hyperframes sign-in","v":"1.7.0","d":"2026-11-18","deps":["https://hyperframes.heygen.com/guides/authentication.md","https://hyperframes.studio/"]},"renders.html":{"t":"Renders & State","v":"1.5.0","d":"2026-11-20","deps":["draft/versions.json","spec/performance.json","script/scenes.json","scripts/build-renders-page.mjs"]},"first-draft.html":{"t":"Draft video","v":"1.20.0","d":"2026-11-20","deps":["draft/versions.json","draft/","script/scenes.json","video/","scripts/render-draft.mjs","scripts/build-first-draft-page.mjs"]},"review.html":{"t":"Review","v":"1.33.0","d":"2026-11-20","deps":["draft/versions.json","script/scenes.json","spec/publish.json","first-draft.html","scripts/build-review-page.mjs"]},"performance.html":{"t":"Performance","v":"1.15.0","d":"2026-11-20","deps":["spec/performance.json","scripts/render-draft.mjs","scripts/build-performance-page.mjs","https://docs.github.com/en/rest/pages/pages"]},"hyperframes-guide/app-and-players.html":{"t":"Desktop app and players","v":"1.9.0","d":"2026-11-18","deps":["https://hyperframes.heygen.com/studio-app/index.md","https://hyperframes.heygen.com/packages/player.md","https://www.remotion.dev/docs/player","https://www.remotion.dev/docs/studio"]},"gaps.html":{"t":"Gaps","v":"1.11.0","d":"2026-11-20","deps":["kanban.html","spec/gaps.json","scripts/build-gaps-page.mjs","first-draft.html","publish.html"]},"compare-drafts.html":{"t":"Compare drafts","v":"1.3.0","d":"2026-11-20","deps":["review.html","renders.html","draft/versions.json","script/scenes.json","scripts/build-compare-drafts-page.mjs","draft/scores.json"]}}}; /*VERSIONS-END*/
  // Written by scripts/build-menu.mjs from spec/menu.json. Do not edit by hand.
  /*MENU-START*/ var MENU = [{"label": "🏠 Home","href": ""},{"label": "📋 1 Plan","items": [["📘 Master spec","master-spec.html"],["📜 Script","script.html"],["🎞️ Storyboard","storyboard/"],["✅ Recommendations","recommendations.html"]]},{"label": "🎬 2 Build","items": [["🎬 Renders & State","renders.html"],["🎞️ Draft video","first-draft.html"],["⏱️ Performance","performance.html"],{"h": "Hyperframes: how it works"},["🧩 Overview","hyperframes-guide/"],["🛠️ Rendering paths","hyperframes-guide/rendering.html"],["⚡ Cloud vs local speed","hyperframes-guide/speed.html"],["⌨️ CLI cheat sheet","hyperframes-guide/cli.html"],["🖥️ Desktop app & players","hyperframes-guide/app-and-players.html"],["🔐 Hyperframes sign-in","hyperframes-guide/signin.html"],["🌐 hyperframes.studio ↗","https://hyperframes.studio/"],{"h": "Choosing the tool"},["⚖️ Hyperframes vs Remotion","compare.html"],["💳 Why pay?","why-pay.html"]]},{"label": "🔍 3 Review","items": [["📝 Review","review.html"],["🆚 Compare drafts","compare-drafts.html"],["🧩 Gaps (waiting on you)","gaps.html"],["📋 Kanban","kanban.html"],["🔄 Changes","changes.html"]]},{"label": "🚀 4 Publish","items": [["📣 Title, description, thumbnail","publish.html"],["🚀 Release checklist","release-checklist.html"]]},{"label": "⚙️ 5 Project","items": [["💰 Costs & estimates","costs.html"],["📦 Video releases & limits","video-releases.html"],["📋 Review spec (portable)","https://github.com/rifaterdemsahin/hyperframes/blob/main/docs/REVIEW-SPEC.md"],["♻️ Reuse as template","reuse.html"],["🤖 AGENTS.md","agents.html"],["🕘 Changelog","changelog.html"],["📄 Design doc","https://github.com/rifaterdemsahin/hyperframes/blob/main/docs/superpowers/specs/2026-11-18-liquidation-video-design.md"],["🐙 Repo","https://github.com/rifaterdemsahin/hyperframes"]]}]; /*MENU-END*/

  var url = function (h) { return /^https?:/.test(h) ? h : base + h; };
  var norm = function (u) { return u.split("#")[0].split("?")[0].replace(/index\.html$/, ""); };
  var here = norm(location.href);
  var isHere = function (h) { return norm(url(h)) === here; };

  var css = document.createElement("style");
  css.textContent =
    "#site-nav{position:sticky;top:0;z-index:1000;display:flex;gap:2px;align-items:center;flex-wrap:wrap;padding:6px 12px;" +
    "background:#0e1116;border-bottom:1px solid #232a35;font:14px system-ui,sans-serif}" +
    "#site-nav .brand{color:#e8ecf1;font-weight:700;margin-right:10px}" +
    "#site-nav a,#site-nav button.top{color:#8b95a5;text-decoration:none;padding:6px 10px;border-radius:6px;background:none;border:0;font:inherit;cursor:pointer;white-space:nowrap}" +
    "#site-nav a:hover,#site-nav button.top:hover,#site-nav .dd.open>button.top{color:#e8ecf1;background:#171b22}" +
    "#site-nav .on{color:#04222a!important;background:#4cc3d9!important;font-weight:600}" +
    "#site-nav .dd{position:relative}" +
    "#site-nav .menu{display:none;position:absolute;top:100%;left:0;min-width:240px;padding:4px;background:#171b22;border:1px solid #232a35;border-radius:8px;box-shadow:0 8px 24px #0008;z-index:1001}" +
    "#site-nav .dd.open .menu{display:block}" +
    "@media(hover:hover){#site-nav .dd:hover .menu{display:block}}" +
    "#site-nav .menu a{display:block}#site-nav .mh{padding:8px 10px 2px;color:#8b95a5;font-size:11px;text-transform:uppercase;letter-spacing:.06em}" +
    "@media(max-width:600px){#site-nav .menu{position:static;box-shadow:none;min-width:0}}";
  document.head.appendChild(css);

  var nav = document.createElement("nav");
  nav.id = "site-nav";
  nav.setAttribute("aria-label", "Site");
  var html = '<span class="brand">🎬 Liquidation Part 1</span>';
  MENU.forEach(function (m, i) {
    if (!m.items) {
      html += '<a href="' + url(m.href) + '"' + (isHere(m.href) ? ' class="on"' : "") + ">" + m.label + "</a>";
      return;
    }
    var active = m.items.some(function (it) { return !it.h && isHere(it[1]); });
    html += '<div class="dd" data-i="' + i + '"><button class="top' + (active ? " on" : "") + '" aria-haspopup="true" aria-expanded="false">' + m.label + ' ▾</button><div class="menu">';
    m.items.forEach(function (it) {
      if (it.h) { html += '<div class="mh">' + it.h + "</div>"; return; }
      html += '<a href="' + url(it[1]) + '"' + (isHere(it[1]) ? ' class="on" aria-current="page"' : "") + ">" + it[0] + "</a>";
    });
    html += "</div></div>";
  });
  html += '<a href="https://hyperframes-review.fly.dev/review.html" target="_blank" style="margin-left:auto;font-size:11.5px;color:#2f855a;background:rgba(47,133,90,0.15);padding:3px 8px;border-radius:6px;border:1px solid rgba(47,133,90,0.3);text-decoration:none;font-weight:700">🚀 Fly.io Live</a>';
  nav.innerHTML = html;
  document.body.insertBefore(nav, document.body.firstChild);

  var closeAll = function () {
    nav.querySelectorAll(".dd.open").forEach(function (d) {
      d.classList.remove("open");
      d.querySelector("button").setAttribute("aria-expanded", "false");
    });
  };
  nav.addEventListener("click", function (e) {
    var b = e.target.closest("button.top");
    if (!b) return;
    var dd = b.parentNode, was = dd.classList.contains("open");
    closeAll();
    if (!was) { dd.classList.add("open"); b.setAttribute("aria-expanded", "true"); }
  });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) closeAll(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(); });

  // ---- Versioning: which page is this, and what version is it? ----
  var rel = location.href.split("#")[0].split("?")[0];
  rel = rel.indexOf(base) === 0 ? rel.slice(base.length) : rel;
  rel = rel.replace(/index\.html$/, "");
  var key = rel === "" ? "index.html" : rel;
  var pg = (VERSIONS.pages || {})[key] || { t: document.title, v: "?", d: "" };
  window.SITE_INFO = { site: VERSIONS.site, siteDate: VERSIONS.date, clearedAt: (function () { var c = VERSIONS.cleared || {}; var a = c[key] || "", b = c["*"] || ""; return a > b ? a : b; })(), key: key, title: pg.t, version: pg.v, date: pg.d, url: location.origin + location.pathname };

  var ready = function (fn) { document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn(); };
  ready(function () {
    var f = document.createElement("footer");
    f.id = "site-foot";
    // dependencies: pages link to pages, repo paths to GitHub, http links stay as they are
    var depLink = function (d) {
      if (/^https?:/.test(d)) return { h: d, l: d.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "").slice(0, 44), i: "🔗" };
      var pg = (VERSIONS.pages || {})[d];
      if (pg) return { h: url(d), l: pg.t, i: "🌐" };
      var dir = /\/$/.test(d), ext = (d.match(/\.([a-z0-9]+)$/) || [])[1] || "";
      var ic = dir ? "📁" : ({ json: "📄", mjs: "⚙️", js: "⚙️", sh: "⚙️", css: "🎨", md: "📝", html: "🧱", mp4: "🎞️", jpg: "🖼️" })[ext] || "📄";
      return { h: G + (dir ? "/tree/main/" : "/blob/main/") + d, l: d, i: ic };
    };
    var chips = function (list, cls) { return list.map(function (d) { var x = depLink(d); return '<a class="dep ' + (cls || "") + '" href="' + x.h + '">' + x.i + " " + x.l + "</a>"; }).join(""); };
    var own = pg.deps || [], shared = ["nav.js", "feedback.js", "versions.json"].filter(function (d) { return own.indexOf(d) < 0; });
    f.innerHTML = "📌 <b>" + pg.t + "</b> v" + pg.v + (pg.d ? " · updated " + pg.d : "") + " · site v" + VERSIONS.site + ' · <a href="' + base + 'changelog.html">Changelog</a>' +
      '<div class="deps"><b>🔗 Depends on</b>' + (own.length ? chips(own) : '<span class="none">nothing but the shared files</span>') + '<span class="shared">shared: ' + chips(shared, "s") + "</span></div>";
    var st = document.createElement("style");
    st.textContent = "#site-foot{max-width:860px;margin:0 auto;padding:16px;color:var(--mute,#8b95a5);font:13px system-ui,sans-serif;text-align:center}#site-foot a{color:var(--accent,#4cc3d9)}" +
      "#site-foot .deps{margin-top:10px;display:flex;flex-wrap:wrap;gap:6px;justify-content:center;align-items:center}#site-foot .deps b{margin-right:4px;color:var(--ink,#e8ecf1)}" +
      "#site-foot a.dep{background:var(--card,#171b22);border:1px solid var(--line,#232a35);border-radius:999px;padding:3px 10px;text-decoration:none;color:var(--accent,#4cc3d9)}#site-foot a.dep:hover{border-color:var(--accent,#4cc3d9)}" +
      "#site-foot a.dep.s{color:var(--mute,#8b95a5)}#site-foot .none,#site-foot .shared{color:var(--mute,#8b95a5)}#site-foot .shared{display:inline-flex;flex-wrap:wrap;gap:6px;align-items:center;margin-left:6px}";
    document.head.appendChild(st);
    document.body.appendChild(f);
    // Copy-feedback bar on every page (pages that bring their own set <body data-feedback="custom">)
    var s = document.createElement("script");
    s.src = base + "feedback.js?v=" + VERSIONS.site;
    document.head.appendChild(s);
  });
})();
