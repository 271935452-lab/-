/**
 * 请款单管理：标题栏「功能说明 / 逐点说明」（同源 请款单-review-points.js）
 */
(function () {
  var scriptEl = document.currentScript;
  var PAGE = 0;
  if (scriptEl && scriptEl.getAttribute("data-page") !== null) {
    PAGE = Number(scriptEl.getAttribute("data-page")) || 0;
  }
  var labels = ["为啥做", "页面上", "系统里"];
  var scriptBase = (function () {
    if (!scriptEl || !scriptEl.src) return "";
    return scriptEl.src.replace(/[^/]+$/, "");
  })();
  function scriptUrl(name) {
    if (!scriptBase || /^https?:/i.test(name) || name.indexOf("/") >= 0) return name;
    return scriptBase + name;
  }

  function injectStyle() {
    if (document.getElementById("qk-doc-bar-style")) return;
    var st = document.createElement("style");
    st.id = "qk-doc-bar-style";
    st.textContent =
      ".qk-doc-toolbar{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;}" +
      ".qk-doc-toolbar .btn-doc{" +
      "height:28px;padding:0 12px;border:1px solid #d97706;background:#fff;color:#b45309;" +
      "border-radius:2px;font:12px \"Microsoft YaHei\",sans-serif;cursor:pointer;}" +
      ".qk-doc-toolbar .btn-doc:hover{background:#fff7ed;}" +
      "#qkDocDialog{border:0;border-radius:10px;padding:0;width:min(640px,94vw);" +
      "max-height:min(85vh,720px);box-shadow:0 16px 60px #0003;margin:auto;background:#fff;}" +
      "#qkDocDialog::backdrop{background:rgba(15,23,42,.35);}" +
      ".qk-doc-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;" +
      "padding:16px 18px 12px;border-bottom:1px solid #e2e8f0;}" +
      ".qk-doc-hd h2{margin:0;font-size:17px;font-weight:700;line-height:1.4;flex:1;}" +
      "#qkDocClose{flex-shrink:0;padding:7px 12px;margin:0;border:1px solid #2a6bbd;border-radius:4px;" +
      "background:#fff;color:#2a6bbd;font:inherit;font-size:14px;cursor:pointer;}" +
      "#qkDocClose:hover{background:#eff6ff;}" +
      ".qk-doc-bd{padding:12px 18px 18px;overflow:auto;max-height:calc(85vh - 72px);" +
      "font-size:13px;line-height:1.65;}" +
      ".qk-doc-feat{margin:0 0 12px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;}" +
      ".qk-doc-feat h3{margin:0 0 6px;font-size:14px;}" +
      ".qk-doc-feat ul{margin:8px 0 0;padding-left:1.25em;}" +
      ".qk-doc-point{border:1px solid #e8e8e8;border-radius:4px;padding:10px 12px;margin:0 0 8px;}" +
      ".qk-doc-point h4{margin:0 0 6px;font-size:13px;display:flex;align-items:center;gap:8px;}" +
      ".qk-doc-pin{display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:20px;height:20px;border-radius:50%;background:#ff8a00;color:#fff;" +
      "font-size:11px;font-weight:700;}" +
      ".qk-doc-kind{font-size:11px;color:#2a6bbd;background:#eff6ff;padding:4px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;}" +
      ".qk-doc-sum{margin:0 0 8px;color:#64748b;font-size:12px;}" +
      ".qk-doc-detail{display:grid;grid-template-columns:52px 1fr;gap:4px 8px;margin:4px 0;font-size:12px;}" +
      ".qk-doc-detail b{color:#8c8c8c;font-weight:600;}" +
      ".qk-doc-detail p{margin:0;}";
    document.head.appendChild(st);
  }

  function closeDocDialog() {
    var dlg = document.getElementById("qkDocDialog");
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  function ensureDialog() {
    var dlg = document.getElementById("qkDocDialog");
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "qkDocDialog";
    dlg.innerHTML =
      "<div class=\"qk-doc-hd\">" +
      "<h2 id=\"qkDocTitle\"></h2>" +
      "<button type=\"button\" id=\"qkDocClose\">关闭</button>" +
      "</div>" +
      "<div class=\"qk-doc-bd\" id=\"qkDocBody\"></div>";
    document.body.appendChild(dlg);
    dlg.addEventListener("cancel", function (e) {
      e.preventDefault();
      closeDocDialog();
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) closeDocDialog();
    });
    document.getElementById("qkDocClose").addEventListener("click", closeDocDialog);
    return dlg;
  }

  function openFeature() {
    var pages = window.QK_FEATURE_PAGES || [];
    var feat = pages.filter(function (f) { return f.page === PAGE; })[0] || pages[0];
    if (!feat) return;
    var dlg = ensureDialog();
    document.getElementById("qkDocTitle").textContent = "功能说明 · " + (feat.title || "");
    var html = "<div class=\"qk-doc-feat\"><p style=\"margin:0 0 8px;color:#64748b\">" +
      (feat.summary || "") + "</p><ul>" +
      (feat.bullets || []).map(function (b) { return "<li>" + b + "</li>"; }).join("") +
      "</ul></div>" +
      "<p style=\"margin:0;font-size:12px;color:#8c8c8c\">页面橙色编号与「逐点说明」一致；点数字可看单条。</p>";
    document.getElementById("qkDocBody").innerHTML = html;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  function openPoints() {
    var points = (window.QK_REVIEW_POINTS || []).filter(function (p) { return p.page === PAGE; });
    var pinIds = (window.QK_REVIEW_PIN_IDS || {})[PAGE] || [];
    var byId = {};
    points.forEach(function (p) { byId[p.id] = p; });
    var ordered = pinIds.map(function (id) { return byId[id]; }).filter(Boolean);
    if (!ordered.length) ordered = points;
    var dlg = ensureDialog();
    document.getElementById("qkDocTitle").textContent = "逐点开发说明";
    var html = "<p style=\"margin:0 0 10px;font-size:12px;color:#8c8c8c\">编号与页面上橙色圆圈一致。</p>" +
      ordered.map(function (p) {
        return "<div class=\"qk-doc-point\">" +
          "<h4><span class=\"qk-doc-pin\">" + p.pin + "</span>" + (p.title || "") + "</h4>" +
          "<div class=\"qk-doc-kind\">" + (p.kind || "") + "</div>" +
          "<p class=\"qk-doc-sum\">" + (p.summary || "") + "</p>" +
          labels.map(function (k, i) {
            return "<div class=\"qk-doc-detail\"><b>" + k + "</b><p>" + ((p.body && p.body[i]) || "—") + "</p></div>";
          }).join("") +
          "</div>";
      }).join("");
    document.getElementById("qkDocBody").innerHTML = html;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  function mount() {
    injectStyle();
    var host = document.getElementById("qkDocMount");
    if (!host) return;
    host.innerHTML =
      "<span class=\"qk-doc-toolbar\">" +
      "<button type=\"button\" class=\"btn-doc\" id=\"qkBtnFeature\">功能说明</button>" +
      "<button type=\"button\" class=\"btn-doc\" id=\"qkBtnPoints\">逐点说明</button>" +
      "</span>";
    document.getElementById("qkBtnFeature").addEventListener("click", openFeature);
    document.getElementById("qkBtnPoints").addEventListener("click", openPoints);
  }

  function boot() {
    function go() { mount(); }
    if (window.QK_REVIEW_POINTS) go();
    else {
      var s = document.createElement("script");
      s.src = scriptUrl("请款单-review-points.js");
      s.onload = go;
      s.onerror = go;
      document.head.appendChild(s);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
