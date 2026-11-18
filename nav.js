// Shared top menu. Include with <script src="nav.js"></script> (or ../nav.js from a subfolder) right after <body>.
(function () {
  var base = document.currentScript.src.replace(/nav\.js(\?.*)?$/, "");
  var links = [
    ["Home", base],
    ["Kanban", base + "kanban.html"],
    ["Storyboard", base + "storyboard/"],
    ["Repo", "https://github.com/rifaterdemsahin/hyperframes"],
  ];
  var here = location.href.split("#")[0].replace(/index\.html$/, "");
  var css = document.createElement("style");
  css.textContent =
    "#site-nav{position:sticky;top:0;z-index:100;display:flex;gap:4px;align-items:center;flex-wrap:wrap;padding:8px 16px;" +
    "background:#0e1116;border-bottom:1px solid #232a35;font:14px system-ui,sans-serif}" +
    "#site-nav b{color:#e8ecf1;margin-right:12px}#site-nav a{color:#8b95a5;text-decoration:none;padding:5px 10px;border-radius:6px}" +
    "#site-nav a:hover{color:#e8ecf1;background:#171b22}#site-nav a.on{color:#04222a;background:#4cc3d9;font-weight:600}";
  document.head.appendChild(css);
  var nav = document.createElement("nav");
  nav.id = "site-nav";
  nav.innerHTML =
    "<b>Liquidation Part 1</b>" +
    links
      .map(function (l) {
        return '<a href="' + l[1] + '"' + (here === l[1] ? ' class="on"' : "") + ">" + l[0] + "</a>";
      })
      .join("");
  document.body.insertBefore(nav, document.body.firstChild);
})();
