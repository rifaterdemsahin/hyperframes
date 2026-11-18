// Shared top menu with sub menus. Include with <script src="nav.js"></script> (or ../nav.js from a subfolder) right after <body>.
// To add a page: add a row to MENU below. Every page picks it up.
(function () {
  var base = document.currentScript.src.replace(/nav\.js(\?.*)?$/, "");
  var G = "https://github.com/rifaterdemsahin/hyperframes";
  // Written by scripts/version.mjs from versions.json. Do not edit by hand.
  /*VERSIONS-START*/ var VERSIONS = {"site":"1.5.2","date":"2026-11-18","cleared":{"*":"2026-11-18T21:55:42.014Z","script.html":"2026-11-18T22:07:30.860Z"},"pages":{"index.html":{"t":"Home","v":"1.5.2","d":"2026-11-18"},"script.html":{"t":"Script","v":"1.3.0","d":"2026-11-18"},"storyboard/":{"t":"Storyboard","v":"1.3.0","d":"2026-11-18"},"kanban.html":{"t":"Kanban","v":"1.4.0","d":"2026-11-18"},"recommendations.html":{"t":"Recommendations","v":"1.4.0","d":"2026-11-18"},"hyperframes-guide/":{"t":"Hyperframes overview","v":"1.2.0","d":"2026-11-18"},"hyperframes-guide/rendering.html":{"t":"Rendering paths","v":"1.2.0","d":"2026-11-18"},"hyperframes-guide/speed.html":{"t":"Cloud vs local speed","v":"1.2.0","d":"2026-11-18"},"hyperframes-guide/cli.html":{"t":"CLI cheat sheet","v":"1.2.0","d":"2026-11-18"},"compare.html":{"t":"Hyperframes vs Remotion","v":"1.2.0","d":"2026-11-18"},"why-pay.html":{"t":"Why pay?","v":"1.2.0","d":"2026-11-18"},"changelog.html":{"t":"Changelog","v":"1.5.2","d":"2026-11-18"},"master-spec.html":{"t":"Master spec","v":"1.5.0","d":"2026-11-18"},"release-checklist.html":{"t":"Release checklist","v":"1.5.0","d":"2026-11-18"},"agents.html":{"t":"AGENTS.md","v":"1.5.0","d":"2026-11-18"},"reuse.html":{"t":"Reuse as template","v":"1.5.0","d":"2026-11-18"},"changes.html":{"t":"Changes","v":"1.5.0","d":"2026-11-18"},"publish.html":{"t":"Title, description, thumbnail","v":"1.5.1","d":"2026-11-18"},"hyperframes-guide/signin.html":{"t":"Hyperframes sign-in","v":"1.5.0","d":"2026-11-18"}}}; /*VERSIONS-END*/
  var MENU = [
    { label: "🏠 Home", href: "" },
    {
      label: "📝 Preprod",
      items: [
        ["📜 Script", "script.html"],
        ["🎞️ Storyboard", "storyboard/"],
        ["📋 Kanban", "kanban.html"],
        ["✅ Recommendations", "recommendations.html"],
      ],
    },
    {
      label: "🎬 Prod / Hyperframes",
      items: [
        ["🧩 Overview", "hyperframes-guide/"],
        ["🔐 Hyperframes sign-in", "hyperframes-guide/signin.html"],
        ["🌐 hyperframes.studio ↗", "https://hyperframes.studio/"],
        ["🛠️ Rendering paths", "hyperframes-guide/rendering.html"],
        ["⚡ Cloud vs local speed", "hyperframes-guide/speed.html"],
        ["⌨️ CLI cheat sheet", "hyperframes-guide/cli.html"],
        ["⚖️ Hyperframes vs Remotion", "compare.html"],
        ["💳 Why pay?", "why-pay.html"],
      ],
    },
    {
      label: "📦 Postprod",
      items: [
        ["📘 Master spec (template)", "master-spec.html"],
        ["🚀 Release checklist", "release-checklist.html"],
        ["📣 Title, description, thumbnail", "publish.html"],
        ["🔄 Changes", "changes.html"],
        ["🤖 AGENTS.md", "agents.html"],
        ["♻️ Reuse as template", "reuse.html"],
      ],
    },
    {
      label: "🔗 Project",
      items: [
        ["🕘 Changelog", "changelog.html"],
        ["📄 Design doc", G + "/blob/main/docs/superpowers/specs/2026-11-18-liquidation-video-design.md"],
        ["🐙 Repo", G],
      ],
    },
  ];

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
    "#site-nav .menu a{display:block}" +
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
    var active = m.items.some(function (it) { return isHere(it[1]); });
    html += '<div class="dd" data-i="' + i + '"><button class="top' + (active ? " on" : "") + '" aria-haspopup="true" aria-expanded="false">' + m.label + ' ▾</button><div class="menu">';
    m.items.forEach(function (it) {
      html += '<a href="' + url(it[1]) + '"' + (isHere(it[1]) ? ' class="on" aria-current="page"' : "") + ">" + it[0] + "</a>";
    });
    html += "</div></div>";
  });
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
    f.innerHTML = "📌 <b>" + pg.t + "</b> v" + pg.v + (pg.d ? " · updated " + pg.d : "") + " · site v" + VERSIONS.site + ' · <a href="' + base + 'changelog.html">Changelog</a>';
    var st = document.createElement("style");
    st.textContent = "#site-foot{max-width:860px;margin:0 auto;padding:16px;color:#8b95a5;font:13px system-ui,sans-serif;text-align:center}#site-foot a{color:#4cc3d9}";
    document.head.appendChild(st);
    document.body.appendChild(f);
    // Copy-feedback bar on every page (pages that bring their own set <body data-feedback="custom">)
    var s = document.createElement("script");
    s.src = base + "feedback.js?v=" + VERSIONS.site;
    document.head.appendChild(s);
  });
})();
