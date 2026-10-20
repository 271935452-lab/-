/**
 * 报价 V2 原型：橙色编号 + 点击说明（对齐 RISK-006 risk006-review-bridge）
 */
(function () {
  var inIframe = window.parent !== window;
  var labels = ["为啥做", "页面上", "系统里"];
  var scriptEl = document.currentScript;
  function detectQuoteV2Page() {
    var p = location.pathname || "";
    var t = document.title || "";
    if (/报价时效统计看板/.test(p)) return 7;
    if (/卡派跟进/.test(p)) return 6;
    if (/地址库管理/.test(p)) return 5;
    if (/ESS散货询价方案详情/.test(p)) return 4;
    if (/ESS我的报价-列表/.test(p)) return 3;
    if (/ESS散货询价详情/.test(p)) return 2;
    if (/询价编辑-APP/.test(p) || (/APP/.test(t) && /询价/.test(t))) return 1;
    if (/ESS询价编辑-MVP/.test(p)) return 0;
    return 0;
  }
  var page = 0;
  if (scriptEl && scriptEl.getAttribute("data-page") !== null) {
    page = Number(scriptEl.getAttribute("data-page")) || 0;
  } else {
    page = detectQuoteV2Page();
  }
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
    if (document.getElementById("quotev2-review-style")) return;
    var st = document.createElement("style");
    st.id = "quotev2-review-style";
    st.textContent =
      ".review-pin{display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:20px;height:20px;max-height:20px;padding:0 5px;margin-left:6px;" +
      "border:none;border-radius:50%;background:#ff8a00;color:#fff;" +
      "font-size:11px;font-weight:700;line-height:1;cursor:pointer;" +
      "vertical-align:middle;box-shadow:0 1px 4px rgba(0,0,0,.15);flex:none;flex-shrink:0;" +
      "width:auto;max-width:32px;box-sizing:border-box;}"
      ".review-pin-floating{width:20px;min-width:20px;max-width:20px;padding:0;}" +
      ".review-pin:hover{filter:brightness(1.06);}" +
      ".review-pin-wrap{position:relative;display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px;}" +
      ".quotev2-pin-host{display:inline-flex;align-items:center;min-height:28px;vertical-align:middle;}" +
      ".toolbar .review-pin,.toolbar .quotev2-pin-host .review-pin{position:relative;z-index:2;}" +
      ".review-pin-floating{position:fixed;z-index:99990;margin:0;}" +
      "body[data-review=\"1\"] .panel-hd .review-pin," +
      "body[data-review=\"1\"] .sec-title .review-pin{margin-left:8px;}" +
      "#quotev2PointDialog{border:0;border-radius:10px;padding:0;width:min(520px,92vw);" +
      "max-height:min(80vh,640px);box-shadow:0 16px 60px #0003;margin:auto;" +
      "background:#fff;color:#111;font-family:\"Microsoft YaHei\",\"PingFang SC\",sans-serif;}" +
      "#quotev2PointDialog::backdrop{background:rgba(15,23,42,.35);}" +
      ".quotev2-point-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;" +
      "padding:16px 18px 12px;border-bottom:1px solid #e2e8f0;}" +
      ".quotev2-point-hd h2{margin:0;font-size:17px;line-height:1.4;flex:1;}" +
      "#quotev2PointClose{" +
      "flex-shrink:0;padding:7px 12px;margin:0;border:1px solid #2a6bbd;border-radius:4px;" +
      "background:#fff;color:#2a6bbd;font:inherit;font-size:14px;line-height:1.2;cursor:pointer;}" +
      "#quotev2PointClose:hover{background:#eff6ff;}" +
      ".quotev2-point-bd{padding:12px 18px 18px;overflow:auto;max-height:calc(80vh - 72px);}" +
      ".quotev2-pin-no{display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:22px;height:22px;border-radius:50%;background:#ff8a00;color:#fff;" +
      "font-size:12px;font-weight:700;margin-right:8px;vertical-align:middle;}" +
      ".quotev2-kind{color:#2a6bbd;background:#eff6ff;padding:4px 8px;display:inline-block;" +
      "border-radius:4px;font-size:11px;margin-bottom:8px;}" +
      ".quotev2-sum{margin:0 0 10px;font-size:13px;color:#475569;line-height:1.6;}" +
      ".quotev2-detail{display:grid;grid-template-columns:48px 1fr;gap:4px 8px;margin:6px 0;" +
      "font-size:13px;line-height:1.65;}" +
      ".quotev2-detail b{color:#64748b;font-weight:600;}" +
      ".quotev2-detail p{margin:0;}";
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
    return "<div class=\"quotev2-kind\">" + (p.kind || "") + "</div>" +
      "<p class=\"quotev2-sum\">" + (p.summary || "") + "</p>" +
      labels.map(function (k, i) {
        return "<div class=\"quotev2-detail\"><b>" + k + "</b><p>" + (p.body[i] || "—") + "</p></div>";
      }).join("");
  }

  function closeLocalDialog() {
    var dlg = document.getElementById("quotev2PointDialog");
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  function ensureLocalDialog() {
    var dlg = document.getElementById("quotev2PointDialog");
    if (dlg && (document.getElementById("quotev2PointOk") || !document.getElementById("quotev2PointClose"))) {
      dlg.remove();
      dlg = null;
    }
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "quotev2PointDialog";
    dlg.setAttribute("aria-labelledby", "quotev2PointTitle");
    dlg.innerHTML =
      "<div class=\"quotev2-point-hd\">" +
      "<h2 id=\"quotev2PointTitle\"></h2>" +
      "<button type=\"button\" id=\"quotev2PointClose\">关闭</button>" +
      "</div>" +
      "<div class=\"quotev2-point-bd\" id=\"quotev2PointBody\"></div>";
    document.body.appendChild(dlg);
    dlg.addEventListener("cancel", function (e) {
      e.preventDefault();
      closeLocalDialog();
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) closeLocalDialog();
    });
    document.getElementById("quotev2PointClose").addEventListener("click", closeLocalDialog);
    return dlg;
  }

  function openNote(anchorId) {
    if (inIframe) {
      window.parent.postMessage({ type: "quotev2-note", id: anchorId, page: page }, "*");
      return;
    }
    var points = window.QUOTE_V2_REVIEW_POINTS || [];
    var p = findPoint(points, anchorId);
    if (!p) return;
    var dlg = ensureLocalDialog();
    var title = (p.title || "").replace(/^[①②③④⑤⑥⑦⑧]\s*/, "");
    document.getElementById("quotev2PointTitle").innerHTML =
      "<span class=\"quotev2-pin-no\" aria-hidden=\"true\">" + p.pin + "</span>" + title;
    document.getElementById("quotev2PointBody").innerHTML = renderPointBody(p);
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  function placeFloatingPin(btn, el) {
    btn.classList.add("review-pin-floating");
    function place() {
      var r = el.getBoundingClientRect();
      btn.style.left = Math.max(4, r.right - 12) + "px";
      btn.style.top = Math.max(4, r.top - 10) + "px";
    }
    place();
    window.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
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
    btn.setAttribute("aria-label", btn.title);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      e.preventDefault();
      openNote(meta.id);
    });

    if (el.classList.contains("quotev2-pin-host") || el.classList.contains("panel-hd") || el.classList.contains("sec-title")) {
      el.appendChild(btn);
      return;
    }
    if (el.classList.contains("kpi-row")) {
      placeFloatingPin(btn, el);
      return;
    }
    var tag = (el.tagName || "").toLowerCase();
    if (tag === "th" || tag === "tr" || tag === "tbody" || el.classList.contains("search-bar") ||
        el.classList.contains("addr-dest-fields") || el.classList.contains("full")) {
      placeFloatingPin(btn, el);
      return;
    }
    if (tag === "button" || tag === "input" || tag === "select") {
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
    el.appendChild(btn);
  }

  function run() {
    injectStyle();
    document.body.setAttribute("data-review", "1");
    var points = window.QUOTE_V2_REVIEW_POINTS || [];
    var pinIds = window.QUOTE_V2_REVIEW_PIN_IDS || {};
    var ids = pinIds[page] || [];
    var byId = {};
    points.forEach(function (p) {
      if (p.page === page) byId[p.id] = p;
    });
    ids.forEach(function (id, i) {
      var el = document.getElementById(id);
      var meta = byId[id];
      if (!meta) return;
      if (el) {
        attachPin(el, {
          id: meta.id, pin: i + 1, title: meta.title,
          kind: meta.kind, summary: meta.summary, body: meta.body
        });
      }
    });
    if (inIframe) {
      window.parent.postMessage({ type: "quotev2-review-ready", page: page }, "*");
    }
  }

  window.quoteV2AttachReviewPins = run;

  function boot() {
    if (window.QUOTE_V2_REVIEW_POINTS) {
      run();
    } else {
      loadScript("quote-v2-review-points.js", run);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
