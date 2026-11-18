// Editing layer for the storyboard. Copied to storyboard/editor.js by build-storyboard.mjs.
// Edits and notes persist in this browser (localStorage); "Copy feedback" produces text to paste to Claude.
(function () {
  var KEY = "storyboard-feedback-v1";
  var saved = {};
  try { saved = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
  var persist = function () { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} };

  var panels = Array.prototype.slice.call(document.querySelectorAll("article.panel"));
  var general = document.getElementById("general");

  // Remember the original text of every editable field, then restore saved edits.
  panels.forEach(function (p) {
    var s = saved[p.dataset.id] || {};
    p.querySelectorAll("[data-f]").forEach(function (el) {
      var f = el.dataset.f;
      if (el.tagName === "TEXTAREA") { el.value = s[f] || ""; return; }
      el.dataset.orig = el.textContent;
      if (s[f] != null) el.textContent = s[f];
      el.addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); el.blur(); } });
    });
  });
  if (saved.__general) general.value = saved.__general;

  function mark(el) { el.classList.toggle("changed", el.dataset.orig != null && el.textContent !== el.dataset.orig); }
  panels.forEach(function (p) { p.querySelectorAll("[contenteditable]").forEach(mark); });

  document.addEventListener("input", function (e) {
    var el = e.target;
    if (el === general) { saved.__general = general.value; persist(); return; }
    var p = el.closest && el.closest("article.panel");
    if (!p || !el.dataset.f) return;
    var s = saved[p.dataset.id] = saved[p.dataset.id] || {};
    s[el.dataset.f] = el.tagName === "TEXTAREA" ? el.value : el.textContent;
    mark(el); persist(); count();
  });

  var LABEL = { vo: "Voiceover text", o0: "Headline overlay", o1: "Overlay line 2", o2: "Overlay line 3", o3: "Overlay line 4", o4: "Overlay line 5" };

  function build() {
    var out = [];
    panels.forEach(function (p) {
      var lines = [];
      p.querySelectorAll("[contenteditable]").forEach(function (el) {
        if (el.textContent !== el.dataset.orig) {
          lines.push("- " + (LABEL[el.dataset.f] || el.dataset.f) + ': "' + el.dataset.orig + '" -> "' + el.textContent + '"');
        }
      });
      var fb = p.querySelector("textarea");
      if (fb && fb.value.trim()) lines.push("- Feedback: " + fb.value.trim());
      if (lines.length) out.push("## " + p.dataset.title + "\n" + lines.join("\n"));
    });
    if (general.value.trim()) out.push("## General\n" + general.value.trim());
    var i = window.SITE_INFO || {};
    return out.length ? "Storyboard feedback (page v" + (i.version || "?") + ", site v" + (i.site || "?") + "):\n\n" + out.join("\n\n") : "";
  }

  var countEl = document.getElementById("count");
  function count() {
    var t = build();
    countEl.textContent = t ? (t.split("\n## ").length - 1) + " section(s) with changes" : "No changes yet";
  }
  count();

  var btn = document.getElementById("copy");
  btn.onclick = function () {
    var t = build();
    if (!t) { btn.textContent = "Nothing to copy yet"; return setTimeout(function () { btn.textContent = "Copy feedback for Claude"; }, 1600); }
    var done = function (ok) {
      btn.textContent = ok ? "Copied. Paste it in the chat" : "Copy failed: select the text below";
      if (!ok) { var ta = document.getElementById("fallback"); ta.hidden = false; ta.value = t; ta.select(); }
      setTimeout(function () { btn.textContent = "Copy feedback for Claude"; }, 2500);
    };
    if (navigator.clipboard) navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(false); });
    else done(false);
  };

  document.getElementById("reset").onclick = function () {
    if (!confirm("Discard all edits and notes?")) return;
    saved = {}; persist(); location.reload();
  };
})();
