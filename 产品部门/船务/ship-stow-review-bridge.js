/**
 * 仓位拆分 · 智能配舱：原型橙色编号 + 点击说明（对齐 9810cfg-review-bridge）
 * 序号钉在控件旁，点开弹窗；不另做「说明序号」条。
 */
(function () {
  var inIframe = window.parent !== window;
  var scriptEl = document.currentScript;
  var page = 0;
  if (scriptEl && scriptEl.getAttribute("data-page") !== null) {
    page = Number(scriptEl.getAttribute("data-page")) || 0;
  } else {
    var p = location.pathname || "";
    if (/装柜计划-仓库视图/.test(p)) page = 1;
    else if (/待配仓/.test(p)) page = 2;
    else if (/终配舱/.test(p)) page = 3;
    else if (/配舱规则配置/.test(p)) page = 4;
    else if (/提单管理/.test(p)) page = 5;
    else page = 0;
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

  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = scriptUrl(src);
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  function injectStyle() {
    if (document.getElementById("ship-stow-review-style")) return;
    var st = document.createElement("style");
    st.id = "ship-stow-review-style";
    st.textContent =
      ".review-pin{display:inline-flex!important;align-items:center;justify-content:center;" +
      "min-width:20px!important;width:20px!important;height:20px!important;max-height:20px!important;" +
      "padding:0!important;margin:0 0 0 6px!important;" +
      "border:none!important;border-radius:50%!important;" +
      "background:#ff8a00!important;color:#fff!important;" +
      "font-size:11px!important;font-weight:700!important;line-height:1!important;cursor:pointer;" +
      "vertical-align:middle;box-shadow:0 1px 4px rgba(0,0,0,.15);flex:none!important;" +
      "position:relative;z-index:6;}" +
      ".review-pin:hover{filter:brightness(1.06);}" +
      ".review-pin-wrap{position:relative;display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px;}" +
      ".review-pin-floating{position:fixed;z-index:99990;margin:0;width:20px;min-width:20px;padding:0;}" +
      "th .review-pin,td .review-pin{margin-left:4px!important;}" +
      "th.col-plan,th.wh-col,th[id^=\"thPlan\"],th[id^=\"thWh\"]{overflow:visible!important;}" +
      ".mark-legend{display:inline-block;margin-left:10px;padding:2px 8px;border-radius:4px;" +
      "background:#fff7ed;color:#c2410c;font-size:12px;font-weight:600;}" +
      "#shipStowPointDialog{border:0;border-radius:10px;padding:0;width:min(520px,92vw);" +
      "max-height:min(80vh,640px);box-shadow:0 16px 60px #0003;margin:auto;background:#fff;color:#111;" +
      "font-family:\"Microsoft YaHei\",\"PingFang SC\",sans-serif;}" +
      "#shipStowPointDialog::backdrop{background:rgba(15,23,42,.35);}" +
      ".ship-stow-point-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;" +
      "padding:16px 18px 12px;border-bottom:1px solid #e2e8f0;}" +
      ".ship-stow-point-hd h2{margin:0;font-size:17px;line-height:1.4;flex:1;}" +
      "#shipStowPointClose{flex-shrink:0;padding:7px 12px;border:1px solid #2a6bbd;border-radius:4px;" +
      "background:#fff;color:#2a6bbd;font:inherit;cursor:pointer;}" +
      ".ship-stow-point-bd{padding:12px 18px 18px;overflow:auto;max-height:calc(80vh - 72px);}" +
      ".ship-stow-pin-no{display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:22px;height:22px;border-radius:50%;background:#ff8a00;color:#fff;" +
      "font-size:12px;font-weight:700;margin-right:8px;}" +
      ".ship-stow-kind{color:#2a6bbd;background:#eff6ff;padding:4px 8px;display:inline-block;" +
      "border-radius:4px;font-size:11px;margin-bottom:8px;}" +
      ".ship-stow-sum{margin:0 0 10px;font-size:13px;color:#475569;line-height:1.6;}" +
      ".ship-stow-detail{display:grid;grid-template-columns:48px 1fr;gap:4px 8px;margin:6px 0;font-size:13px;}" +
      ".ship-stow-detail b{color:#64748b;}" +
      ".ship-stow-detail p{margin:0;}";
    document.head.appendChild(st);
  }

  function findPoint(points, anchorId) {
    for (var i = 0; i < points.length; i++) {
      if (points[i].page === page && points[i].id === anchorId) return points[i];
    }
    for (var j = 0; j < points.length; j++) {
      if (points[j].id === anchorId) return points[j];
    }
    return null;
  }

  function renderPointBody(p) {
    return "<div class=\"ship-stow-kind\">" + (p.kind || "") + "</div>" +
      "<p class=\"ship-stow-sum\">" + (p.summary || "") + "</p>" +
      labels.map(function (k, i) {
        return "<div class=\"ship-stow-detail\"><b>" + k + "</b><p>" + ((p.body && p.body[i]) || "—") + "</p></div>";
      }).join("");
  }

  function closeLocalDialog() {
    var dlg = document.getElementById("shipStowPointDialog");
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  function ensureLocalDialog() {
    var dlg = document.getElementById("shipStowPointDialog");
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "shipStowPointDialog";
    dlg.innerHTML =
      "<div class=\"ship-stow-point-hd\"><h2 id=\"shipStowPointTitle\"></h2>" +
      "<button type=\"button\" id=\"shipStowPointClose\">关闭</button></div>" +
      "<div class=\"ship-stow-point-bd\" id=\"shipStowPointBody\"></div>";
    document.body.appendChild(dlg);
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeLocalDialog(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeLocalDialog(); });
    document.getElementById("shipStowPointClose").addEventListener("click", closeLocalDialog);
    return dlg;
  }

  function openNote(anchorId) {
    if (inIframe) {
      window.parent.postMessage({ type: "ship-stow-note", id: anchorId, page: page }, "*");
      return;
    }
    var points = window.SHIP_STOW_REVIEW_POINTS || [];
    var p = findPoint(points, anchorId);
    if (!p) return;
    var dlg = ensureLocalDialog();
    document.getElementById("shipStowPointTitle").innerHTML =
      "<span class=\"ship-stow-pin-no\" aria-hidden=\"true\">" + p.pin + "</span>" + (p.title || "");
    document.getElementById("shipStowPointBody").innerHTML = renderPointBody(p);
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  function placeFloatingPin(btn, el) {
    btn.classList.add("review-pin-floating");
    function place() {
      var r = el.getBoundingClientRect();
      if (r.width < 2 && r.height < 2) { btn.style.display = "none"; return; }
      btn.style.display = "";
      btn.style.left = Math.max(4, r.right - 12) + "px";
      btn.style.top = Math.max(4, r.top - 10) + "px";
    }
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    var wrap = el.closest ? el.closest(".table-wrap") : null;
    if (wrap) wrap.addEventListener("scroll", place, { passive: true });
    document.body.appendChild(btn);
  }

  function attachPin(el, meta) {
    if (!el || document.querySelector(".review-pin[data-for=\"" + meta.id + "\"]")) return;
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "review-pin";
    btn.setAttribute("data-for", meta.id);
    btn.textContent = String(meta.pin);
    btn.title = "查看说明：" + (meta.title || meta.id);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      openNote(meta.id);
    });

    var tag = (el.tagName || "").toLowerCase();
    if (tag === "button" || tag === "select" || tag === "label" || tag === "input") {
      var wrap = el.parentElement;
      if (wrap && wrap.classList.contains("review-pin-wrap")) {
        if (!wrap.querySelector(".review-pin[data-for=\"" + meta.id + "\"]")) wrap.appendChild(btn);
      } else if (wrap) {
        var w = document.createElement("span");
        w.className = "review-pin-wrap";
        wrap.insertBefore(w, el);
        w.appendChild(el);
        w.appendChild(btn);
      } else {
        placeFloatingPin(btn, el);
      }
      return;
    }
    /* 表头 / 区块：序号钉在元素上（同 9810） */
    el.appendChild(btn);
  }

  function run() {
    injectStyle();
    document.body.setAttribute("data-review", "1");
    /* 去掉旧「说明序号」条 */
    var oldStrip = document.getElementById("shipStowPinStrip");
    if (oldStrip && oldStrip.parentNode) oldStrip.parentNode.removeChild(oldStrip);

    var points = window.SHIP_STOW_REVIEW_POINTS || [];
    var pinIds = window.SHIP_STOW_REVIEW_PIN_IDS || {};
    var ids = pinIds[page] || [];
    var byId = {};
    points.forEach(function (p) {
      if (p.page === page) byId[p.id] = p;
    });
    ids.forEach(function (id, i) {
      var el = document.getElementById(id);
      var meta = byId[id];
      if (!meta || !el) return;
      attachPin(el, {
        id: meta.id,
        pin: meta.pin != null ? meta.pin : i + 1,
        title: meta.title
      });
    });
  }

  window.shipStowAttachReviewPins = run;

  function boot() {
    function go() {
      if (window.SHIP_STOW_REVIEW_POINTS) {
        run();
        setTimeout(run, 100);
        setTimeout(run, 400);
      } else {
        loadScript("ship-stow-review-points.js", function () {
          run();
          setTimeout(run, 100);
          setTimeout(run, 400);
        });
      }
    }
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", go);
    } else {
      go();
    }
  }

  boot();
})();
