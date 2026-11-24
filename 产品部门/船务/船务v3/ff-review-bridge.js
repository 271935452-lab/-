/**
 * 全程履约：橙色编号挂在控件上；标题栏打开「逐点清单 / 功能说明」。
 * 清单不平铺在页面上。数据同源 ff-review-points.js。
 */
(function () {
  var labels = ["为啥做", "页面上", "系统里"];

  function injectStyle() {
    if (document.getElementById("ff-review-style")) return;
    var st = document.createElement("style");
    st.id = "ff-review-style";
    st.textContent =
      ".ff-pin,button.ff-pin{display:inline-flex!important;align-items:center;justify-content:center;min-width:20px;width:20px;height:20px;margin:0 0 0 6px;padding:0!important;border:0!important;border-radius:50%!important;background:#ff8a00!important;color:#fff!important;font-size:11px!important;font-weight:700;line-height:1;cursor:pointer;vertical-align:middle;box-shadow:0 1px 3px rgba(0,0,0,.18);}" +
      ".ff-pin:hover,button.ff-pin:hover{filter:brightness(1.06);color:#fff!important;}" +
      ".ff-pin-wrap{display:inline-flex;align-items:center;gap:4px;vertical-align:middle;}" +
      ".ff-num{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;margin-right:8px;border-radius:50%;background:#ff8a00;color:#fff;font-size:11px;font-weight:700;}" +
      ".ff-doc-toolbar{display:inline-flex;align-items:center;gap:8px;margin-left:8px;}" +
      ".ff-doc-toolbar .btn-doc{height:28px;padding:0 12px;border:1px solid #ea580c;background:#fff;color:#c2410c;border-radius:4px;font:12px \"Microsoft YaHei\",sans-serif;cursor:pointer;}" +
      ".ff-doc-toolbar .btn-doc:hover{background:#fff7ed;}" +
      "#ffDocDialog{border:0;border-radius:10px;padding:0;width:min(640px,94vw);max-height:min(85vh,720px);box-shadow:0 16px 60px #0003;margin:auto;background:#fff;color:#0f172a;}" +
      "#ffDocDialog::backdrop{background:rgba(15,23,42,.35);}" +
      ".ff-doc-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px 12px;border-bottom:1px solid #e2e8f0;}" +
      ".ff-doc-hd h2{margin:0;font-size:17px;line-height:1.4;flex:1;}" +
      "#ffDocClose{flex-shrink:0;padding:7px 12px;border:1px solid #2a6bbd;border-radius:4px;background:#fff;color:#2a6bbd;font:inherit;font-size:14px;cursor:pointer;}" +
      ".ff-doc-bd{padding:12px 18px 18px;overflow:auto;max-height:calc(85vh - 72px);font-size:13px;line-height:1.65;}" +
      ".ff-doc-feat ul{margin:8px 0 0;padding-left:1.25em;}" +
      ".ff-doc-point{border:1px solid #e8e8e8;border-radius:8px;padding:10px 12px;margin:0 0 8px;cursor:pointer;}" +
      ".ff-doc-point h4{margin:0 0 6px;font-size:14px;display:flex;align-items:center;gap:8px;}" +
      ".ff-kind{font-size:11px;color:#2a6bbd;background:#eff6ff;padding:3px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;}" +
      ".ff-sum{margin:0 0 8px;color:#64748b;}" +
      ".ff-detail{display:grid;grid-template-columns:52px 1fr;gap:4px 8px;margin:4px 0;}" +
      ".ff-detail b{color:#64748b;font-weight:600;}" +
      ".ff-detail p{margin:0;}";
    document.head.appendChild(st);
  }

  function activePage() {
    var view = document.querySelector(".view.active");
    return view ? view.id : "products";
  }

  function pointsOf(page) {
    return (window.FF_REVIEW_POINTS || []).filter(function (p) { return p.page === page; });
  }

  function findPoint(page, id) {
    var list = pointsOf(page);
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function detailHtml(p) {
    return labels.map(function (k, i) {
      return "<div class=\"ff-detail\"><b>" + k + "</b><p>" + ((p.body && p.body[i]) || "—") + "</p></div>";
    }).join("");
  }

  function closeDoc() {
    var dlg = document.getElementById("ffDocDialog");
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  function ensureDialog() {
    var dlg = document.getElementById("ffDocDialog");
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "ffDocDialog";
    dlg.innerHTML = "<div class=\"ff-doc-hd\"><h2 id=\"ffDocTitle\"></h2><button type=\"button\" id=\"ffDocClose\">关闭</button></div><div class=\"ff-doc-bd\" id=\"ffDocBody\"></div>";
    document.body.appendChild(dlg);
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeDoc(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDoc(); });
    document.getElementById("ffDocClose").addEventListener("click", closeDoc);
    return dlg;
  }

  function openDialog(title, html) {
    var dlg = ensureDialog();
    document.getElementById("ffDocTitle").textContent = title;
    document.getElementById("ffDocBody").innerHTML = html;
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  function openFeature() {
    var page = activePage();
    var feat = (window.FF_FEATURE_PAGES || []).filter(function (f) { return f.page === page; })[0];
    if (!feat) { openDialog("功能说明", "<p>这一页没有功能说明。</p>"); return; }
    openDialog("功能说明", "<h3 style=\"margin:0 0 8px;font-size:15px\">" + feat.title + "</h3><p class=\"ff-sum\">" + feat.summary + "</p><ul>" + (feat.bullets || []).map(function (b) { return "<li>" + b + "</li>"; }).join("") + "</ul>");
  }

  function openPoints() {
    var page = activePage();
    var ids = (window.FF_REVIEW_PIN_IDS || {})[page] || [];
    var html = "<p class=\"ff-sum\">编号和页面上的橙色圆圈一致。点一条看为啥做、页面上、系统里。</p>" + ids.map(function (id) {
      var p = findPoint(page, id);
      if (!p) return "";
      return "<div class=\"ff-doc-point\"><h4><span class=\"ff-num\">" + p.pin + "</span>" + p.title + "</h4><span class=\"ff-kind\">" + (p.kind || "") + "</span><p class=\"ff-sum\">" + (p.summary || "") + "</p>" + detailHtml(p) + "</div>";
    }).join("");
    openDialog("逐点清单", html || "<p>这一页没有逐点清单。</p>");
  }

  function openNote(id) {
    var p = findPoint(activePage(), id);
    if (!p) return;
    openDialog(p.title, "<span class=\"ff-kind\">" + (p.kind || "") + "</span><p class=\"ff-sum\">" + (p.summary || "") + "</p>" + detailHtml(p));
    var title = document.getElementById("ffDocTitle");
    if (title) title.innerHTML = "<span class=\"ff-num\">" + p.pin + "</span>" + p.title;
  }

  function attachPin(el, meta) {
    if (!el || document.querySelector(".ff-pin[data-for=\"" + meta.id + "\"]")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ff-pin";
    btn.setAttribute("data-for", meta.id);
    btn.textContent = String(meta.pin);
    btn.title = "查看说明：" + (meta.title || "");
    btn.setAttribute("aria-label", btn.title);
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      openNote(meta.id);
    });
    var tag = (el.tagName || "").toLowerCase();
    if (tag === "button" || tag === "input" || tag === "select" || tag === "a") {
      var parent = el.parentElement;
      if (parent && parent.classList.contains("ff-pin-wrap")) parent.appendChild(btn);
      else if (parent) {
        var wrap = document.createElement("span");
        wrap.className = "ff-pin-wrap";
        parent.insertBefore(wrap, el);
        wrap.appendChild(el);
        wrap.appendChild(btn);
      }
      return;
    }
    el.appendChild(btn);
  }

  function clearPins() {
    document.querySelectorAll(".ff-pin").forEach(function (el) { el.remove(); });
  }

  function refreshPins() {
    clearPins();
    var page = activePage();
    var ids = (window.FF_REVIEW_PIN_IDS || {})[page] || [];
    var prd = (window.FF_PAGE_PRD || {})[page];
    var link = document.getElementById("ffPrdLink");
    if (link && prd) link.href = prd;
    ids.forEach(function (id) {
      var meta = findPoint(page, id);
      var el = document.getElementById(id);
      if (!meta || !el) return;
      if (el.closest && el.closest(".view") && !el.closest(".view").classList.contains("active") && !el.closest("#modalMask")) return;
      attachPin(el, meta);
    });
  }
  window.ffRefreshPins = refreshPins;

  function mountBar() {
    if (document.getElementById("ffDocBar")) return;
    var bar = document.createElement("span");
    bar.className = "ff-doc-toolbar";
    bar.id = "ffDocBar";
    bar.innerHTML = "<button type=\"button\" class=\"btn-doc\" id=\"ffBtnPoints\">逐点清单</button><button type=\"button\" class=\"btn-doc\" id=\"ffBtnFeature\">功能说明</button>";
    var mount = document.getElementById("ffDocMount") || document.querySelector(".workspace-switch");
    if (mount) mount.appendChild(bar);
    document.getElementById("ffBtnPoints").addEventListener("click", openPoints);
    document.getElementById("ffBtnFeature").addEventListener("click", openFeature);
  }

  function boot() {
    injectStyle();
    mountBar();
    refreshPins();
    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-view],[data-sla-sec],[data-template],[data-node],#addNode,#addTemplate,#copyTemplate,#publishVersion")) {
        setTimeout(refreshPins, 80);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
