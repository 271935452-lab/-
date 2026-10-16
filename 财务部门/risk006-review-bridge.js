/**
 * RISK-006 原型：在控件旁显示 PRD 编号；点击弹出说明（外壳 iframe 或本页弹窗）。
 */
(function () {
  var inIframe = window.parent !== window;
  var scriptEl = document.currentScript;
  var page = /规则配置/.test(location.pathname || "") || /规则配置/.test(document.title || "")
    ? 1 : 0;
  if (scriptEl && scriptEl.getAttribute("data-page") !== null) {
    page = Number(scriptEl.getAttribute("data-page")) || 0;
  }
  var labels = ["为啥做", "页面上", "系统里"];

  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  function injectStyle() {
    if (document.getElementById("risk006-review-style")) return;
    var st = document.createElement("style");
    st.id = "risk006-review-style";
    st.textContent =
      ".review-pin{" +
      "display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:20px;height:20px;padding:0 5px;margin-left:6px;" +
      "border:none;border-radius:50%;background:#ff8a00;color:#fff;" +
      "font-size:11px;font-weight:700;line-height:1;cursor:pointer;" +
      "vertical-align:middle;box-shadow:0 1px 4px rgba(0,0,0,.15);flex:none;" +
      "}" +
      ".review-pin:hover{filter:brightness(1.06);}" +
      ".review-pin-wrap{position:relative;display:inline-flex;align-items:center;flex-wrap:wrap;gap:4px;}" +
      ".review-pin-floating{position:fixed;z-index:99990;margin:0;}" +
      "body[data-review=\"1\"] .panel-hd .review-pin{margin-left:8px;}" +
      "#risk006PointDialog{border:0;border-radius:10px;padding:0;width:min(520px,92vw);" +
      "max-height:min(80vh,640px);box-shadow:0 16px 60px #0003;}" +
      "#risk006PointDialog::backdrop{background:rgba(15,23,42,.35);}" +
      ".risk006-point-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;" +
      "padding:16px 18px 12px;border-bottom:1px solid #e2e8f0;}" +
      ".risk006-point-hd h2{margin:0;font-size:17px;line-height:1.4;flex:1;}" +
      ".risk006-point-bd{padding:12px 18px 18px;overflow:auto;max-height:calc(80vh - 72px);}" +
      ".risk006-pin-no{display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:22px;height:22px;border-radius:50%;background:#ff8a00;color:#fff;" +
      "font-size:12px;font-weight:700;margin-right:8px;vertical-align:middle;}" +
      ".risk006-kind{color:#2a6bbd;background:#eff6ff;padding:4px 8px;display:inline-block;" +
      "border-radius:4px;font-size:11px;margin-bottom:8px;}" +
      ".risk006-sum{margin:0 0 10px;font-size:13px;color:#475569;line-height:1.6;}" +
      ".risk006-detail{display:grid;grid-template-columns:48px 1fr;gap:4px 8px;margin:6px 0;" +
      "font-size:13px;line-height:1.65;}" +
      ".risk006-detail b{color:#64748b;font-weight:600;}" +
      ".risk006-detail p{margin:0;}";
    document.head.appendChild(st);
  }

  function findPoint(points, anchorId) {
    for (var i = 0; i < points.length; i++) {
      if (points[i].id === anchorId) return points[i];
    }
    return null;
  }

  function renderPointBody(p) {
    return "<div class=\"risk006-kind\">" + (p.kind || "") + "</div>" +
      "<p class=\"risk006-sum\">" + (p.summary || "") + "</p>" +
      labels.map(function (k, i) {
        return "<div class=\"risk006-detail\"><b>" + k + "</b><p>" + (p.body[i] || "—") + "</p></div>";
      }).join("");
  }

  function ensureLocalDialog() {
    var dlg = document.getElementById("risk006PointDialog");
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "risk006PointDialog";
    dlg.setAttribute("aria-labelledby", "risk006PointTitle");
    dlg.innerHTML =
      "<div class=\"risk006-point-hd\">" +
      "<h2 id=\"risk006PointTitle\"></h2>" +
      "<button type=\"button\" id=\"risk006PointClose\">关闭</button>" +
      "</div>" +
      "<div class=\"risk006-point-bd\" id=\"risk006PointBody\"></div>";
    document.body.appendChild(dlg);
    document.getElementById("risk006PointClose").addEventListener("click", function () {
      dlg.close();
    });
    return dlg;
  }

  function openNote(anchorId) {
    if (inIframe) {
      window.parent.postMessage({ type: "note", id: anchorId }, "*");
      return;
    }
    var points = window.RISK006_REVIEW_POINTS || [];
    var p = findPoint(points, anchorId);
    if (!p) return;
    var dlg = ensureLocalDialog();
    var title = (p.title || "").replace(/^[①②③④⑤⑥⑦⑧]\s*/, "");
    document.getElementById("risk006PointTitle").innerHTML =
      "<span class=\"risk006-pin-no\" aria-hidden=\"true\">" + p.pin + "</span>" + title;
    document.getElementById("risk006PointBody").innerHTML = renderPointBody(p);
    dlg.showModal();
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
    if (!el || el.querySelector(".review-pin[data-for=\"" + meta.id + "\"]")) return;
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

    var tag = (el.tagName || "").toLowerCase();
    if (el.classList.contains("panel-hd")) {
      el.appendChild(btn);
      return;
    }
    if (tag === "th" || tag === "tr" || tag === "tbody" || el.classList.contains("search-bar") ||
        el.classList.contains("status-toolbar") || el.classList.contains("log")) {
      placeFloatingPin(btn, el);
      return;
    }
    if (el.classList.contains("row") && el.id) {
      el.appendChild(btn);
      return;
    }
    if (tag === "button" || tag === "input" || tag === "select") {
      var wrap = el.parentElement;
      if (wrap && wrap.classList.contains("review-pin-wrap")) {
        wrap.appendChild(btn);
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
    var points = window.RISK006_REVIEW_POINTS || [];
    var pinIds = window.RISK006_REVIEW_PIN_IDS || {};
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
        attachPin(el, { id: meta.id, pin: i + 1, title: meta.title, kind: meta.kind, summary: meta.summary, body: meta.body });
      }
    });
    if (inIframe) {
      window.parent.postMessage({ type: "review-ready", page: page }, "*");
    }
  }

  window.risk006AttachReviewPins = run;

  function boot() {
    if (window.RISK006_REVIEW_POINTS) {
      run();
    } else {
      loadScript("risk006-review-points.js", run);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
