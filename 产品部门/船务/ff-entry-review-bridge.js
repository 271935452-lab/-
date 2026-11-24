/**
 * 全程履约 · 点青色 F 序号直接弹出 PRD 说明
 * 只绑 .ff-no，不改船务 v2 橙色 review-pin。
 */
(function () {
  var labels = ["为啥做", "页面上", "系统里"];
  var scriptEl = document.currentScript;
  var scriptBase = (function () {
    if (!scriptEl || !scriptEl.src) return "";
    return scriptEl.src.replace(/[^/]+$/, "");
  })();

  function injectStyle() {
    if (document.getElementById("ff-entry-review-style")) return;
    var st = document.createElement("style");
    st.id = "ff-entry-review-style";
    st.textContent =
      ".ff-no{cursor:pointer!important;user-select:none;}" +
      ".ff-no:hover{filter:brightness(1.1);box-shadow:0 0 0 2px rgba(15,118,110,.25);}" +
      ".ff-no:focus{outline:2px solid #0f766e;outline-offset:1px;}" +
      "#ffEntryPointDialog{border:0;border-radius:10px;padding:0;width:min(520px,92vw);" +
      "max-height:min(80vh,640px);box-shadow:0 16px 60px #0003;margin:auto;background:#fff;color:#111;" +
      "font-family:\"Microsoft YaHei\",\"PingFang SC\",sans-serif;}" +
      "#ffEntryPointDialog::backdrop{background:rgba(15,23,42,.35);}" +
      ".ff-entry-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;" +
      "padding:16px 18px 12px;border-bottom:1px solid #99f6e4;background:#f0fdfa;}" +
      ".ff-entry-hd h2{margin:0;font-size:17px;line-height:1.4;flex:1;color:#115e59;}" +
      "#ffEntryPointClose{flex-shrink:0;padding:7px 12px;border:1px solid #0f766e;border-radius:4px;" +
      "background:#fff;color:#0f766e;font:inherit;cursor:pointer;}" +
      ".ff-entry-bd{padding:12px 18px 18px;overflow:auto;max-height:calc(80vh - 72px);}" +
      ".ff-entry-pin{display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:28px;height:18px;padding:0 6px;border-radius:3px;background:#0f766e;color:#fff;" +
      "font-size:11px;font-weight:700;margin-right:8px;vertical-align:middle;}" +
      ".ff-entry-kind{color:#0f766e;background:#ccfbf1;padding:4px 8px;display:inline-block;" +
      "border-radius:4px;font-size:11px;margin-bottom:8px;}" +
      ".ff-entry-sum{margin:0 0 10px;font-size:13px;color:#475569;line-height:1.6;}" +
      ".ff-entry-detail{display:grid;grid-template-columns:48px 1fr;gap:4px 8px;margin:6px 0;font-size:13px;}" +
      ".ff-entry-detail b{color:#64748b;}" +
      ".ff-entry-detail p{margin:0;}";
    document.head.appendChild(st);
  }

  function codeFromEl(el) {
    if (!el) return "";
    var raw = ((el.getAttribute("data-ff") || el.textContent || "") + "").trim().toUpperCase();
    var m = raw.match(/F\d+/);
    return m ? m[0] : "";
  }

  function decorate(el) {
    if (!el || el.nodeType !== 1) return;
    var code = codeFromEl(el);
    if (!code || !(window.FF_ENTRY_POINTS || {})[code]) return;
    el.setAttribute("role", "button");
    el.setAttribute("tabindex", "0");
    el.setAttribute("data-ff", code);
    var tip = (window.FF_ENTRY_POINTS[code].summary || "");
    el.setAttribute("title", code + " · 点击查看说明" + (tip ? "：" + tip : ""));
  }

  function decorateAll(root) {
    (root || document).querySelectorAll(".ff-no").forEach(decorate);
  }

  function ensureDialog() {
    var dlg = document.getElementById("ffEntryPointDialog");
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "ffEntryPointDialog";
    dlg.innerHTML =
      "<div class=\"ff-entry-hd\"><h2 id=\"ffEntryPointTitle\"></h2>" +
      "<button type=\"button\" id=\"ffEntryPointClose\">关闭</button></div>" +
      "<div class=\"ff-entry-bd\" id=\"ffEntryPointBody\"></div>";
    document.body.appendChild(dlg);
    document.getElementById("ffEntryPointClose").onclick = function () { dlg.close(); };
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) dlg.close();
    });
    return dlg;
  }

  function openPoint(code) {
    var map = window.FF_ENTRY_POINTS || {};
    var p = map[code];
    if (!p) return false;
    injectStyle();
    var dlg = ensureDialog();
    document.getElementById("ffEntryPointTitle").innerHTML =
      "<span class=\"ff-entry-pin\">" + p.code + "</span>" + (p.title || "");
    var lock = window.FF_ENTRY_GLOBAL
      ? "<p class=\"ff-entry-sum\" style=\"margin-top:10px;padding:8px 10px;background:#f0fdfa;border-left:3px solid #0f766e\">" +
        window.FF_ENTRY_GLOBAL + "</p>"
      : "";
    document.getElementById("ffEntryPointBody").innerHTML =
      "<div class=\"ff-entry-kind\">全程履约 · " + (p.page || "") + "</div>" +
      "<p class=\"ff-entry-sum\">" + (p.summary || "") + "</p>" +
      labels.map(function (k, i) {
        return "<div class=\"ff-entry-detail\"><b>" + k + "</b><p>" +
          ((p.body && p.body[i]) || "—") + "</p></div>";
      }).join("") + lock;
    if (typeof dlg.showModal === "function") {
      if (!dlg.open) dlg.showModal();
    } else {
      dlg.setAttribute("open", "");
    }
    return true;
  }

  function onActivate(e) {
    var el = e.target && e.target.closest ? e.target.closest(".ff-no") : null;
    if (!el) return;
    var code = codeFromEl(el);
    if (!code || !(window.FF_ENTRY_POINTS || {})[code]) return;
    e.preventDefault();
    e.stopPropagation();
    openPoint(code);
  }

  function bind() {
    injectStyle();
    decorateAll(document);
    document.addEventListener("click", onActivate, true);
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var el = e.target && e.target.closest ? e.target.closest(".ff-no") : null;
      if (!el) return;
      onActivate(e);
    }, true);
    if (window.MutationObserver) {
      var mo = new MutationObserver(function (muts) {
        muts.forEach(function (m) {
          m.addedNodes && m.addedNodes.forEach(function (n) {
            if (n.nodeType !== 1) return;
            if (n.classList && n.classList.contains("ff-no")) decorate(n);
            else if (n.querySelectorAll) decorateAll(n);
          });
        });
      });
      mo.observe(document.documentElement, { childList: true, subtree: true });
    }
    window.openFfEntryPoint = openPoint;
    window.ffRefreshEntryPins = function () { decorateAll(document); };
  }

  function loadPoints(cb) {
    if (window.FF_ENTRY_POINTS) { cb(); return; }
    var s = document.createElement("script");
    s.src = scriptBase + "ff-entry-review-points.js";
    s.onload = cb;
    s.onerror = function () { console.warn("[ff-entry] points load failed"); cb(); };
    document.head.appendChild(s);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { loadPoints(bind); });
  } else {
    loadPoints(bind);
  }
})();
