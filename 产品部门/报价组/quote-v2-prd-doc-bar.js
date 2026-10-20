/**
 * 报价 V2：逐点开发说明 + 功能说明（挂页面标题栏，同源 quote-v2-review-points.js）
 */
(function () {
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
  var PAGE = 0;
  if (scriptEl && scriptEl.getAttribute("data-page") !== null) {
    PAGE = Number(scriptEl.getAttribute("data-page")) || 0;
  } else {
    PAGE = detectQuoteV2Page();
  }
  var scriptBase = (function () {
    if (!scriptEl || !scriptEl.src) return "";
    return scriptEl.src.replace(/[^/]+$/, "");
  })();
  function scriptUrl(name) {
    if (!scriptBase || /^https?:/i.test(name) || name.indexOf("/") >= 0) return name;
    return scriptBase + name;
  }

  var labels = ["为啥做", "页面上", "系统里"];

  function injectStyle() {
    if (document.getElementById("quotev2-doc-bar-style")) return;
    var st = document.createElement("style");
    st.id = "quotev2-doc-bar-style";
    st.textContent =
      ".quotev2-doc-toolbar{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;}" +
      ".quotev2-doc-toolbar .btn-doc{" +
      "height:28px;padding:0 14px;border:1px solid #059669;background:#fff;color:#047857;" +
      "border-radius:2px;font:12px \"Microsoft YaHei\",sans-serif;cursor:pointer;" +
      "}" +
      ".quotev2-doc-toolbar .btn-doc:hover{background:#ecfdf5;}" +
      "#quotev2DocDialog{border:0;border-radius:10px;padding:0;width:min(640px,94vw);" +
      "max-height:min(85vh,720px);box-shadow:0 16px 60px #0003;margin:auto;background:#fff;}" +
      "#quotev2DocDialog::backdrop{background:rgba(15,23,42,.35);}" +
      ".quotev2-doc-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;" +
      "padding:16px 18px 12px;border-bottom:1px solid #e2e8f0;}" +
      ".quotev2-doc-hd h2{margin:0;font-size:17px;font-weight:700;line-height:1.4;flex:1;}" +
      "#quotev2DocClose{" +
      "flex-shrink:0;padding:7px 12px;margin:0;border:1px solid #2a6bbd;border-radius:4px;" +
      "background:#fff;color:#2a6bbd;font:inherit;font-size:14px;cursor:pointer;}" +
      "#quotev2DocClose:hover{background:#eff6ff;}" +
      ".quotev2-doc-bd{padding:12px 18px 18px;overflow:auto;max-height:calc(85vh - 72px);" +
      "font-size:13px;line-height:1.65;}" +
      ".quotev2-doc-feat{margin:0 0 12px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;}" +
      ".quotev2-doc-feat h3{margin:0 0 6px;font-size:14px;}" +
      ".quotev2-doc-feat ul{margin:8px 0 0;padding-left:1.25em;}" +
      ".quotev2-doc-point{border:1px solid #e8e8e8;border-radius:4px;padding:10px 12px;margin:0 0 8px;}" +
      ".quotev2-doc-point h4{margin:0 0 6px;font-size:13px;display:flex;align-items:center;gap:8px;}" +
      ".quotev2-doc-pin{display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:20px;height:20px;border-radius:50%;background:#ff8a00;color:#fff;" +
      "font-size:11px;font-weight:700;}" +
      ".quotev2-doc-kind{font-size:11px;color:#2a6bbd;background:#eff6ff;padding:4px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;}" +
      ".quotev2-doc-sum{margin:0 0 8px;color:#64748b;font-size:12px;}" +
      ".quotev2-doc-detail{display:grid;grid-template-columns:52px 1fr;gap:4px 8px;margin:4px 0;font-size:12px;}" +
      ".quotev2-doc-detail b{color:#8c8c8c;font-weight:600;}" +
      ".quotev2-doc-detail p{margin:0;}";
    document.head.appendChild(st);
  }

  function closeDocDialog() {
    var dlg = document.getElementById("quotev2DocDialog");
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  function ensureDialog() {
    var dlg = document.getElementById("quotev2DocDialog");
    if (dlg && (document.getElementById("quotev2DocOk") || !document.getElementById("quotev2DocClose"))) {
      dlg.remove();
      dlg = null;
    }
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "quotev2DocDialog";
    dlg.innerHTML =
      "<div class=\"quotev2-doc-hd\">" +
      "<h2 id=\"quotev2DocTitle\"></h2>" +
      "<button type=\"button\" id=\"quotev2DocClose\">关闭</button>" +
      "</div>" +
      "<div class=\"quotev2-doc-bd\" id=\"quotev2DocBody\"></div>";
    document.body.appendChild(dlg);
    dlg.addEventListener("cancel", function (e) {
      e.preventDefault();
      closeDocDialog();
    });
    dlg.addEventListener("click", function (e) {
      if (e.target === dlg) closeDocDialog();
    });
    document.getElementById("quotev2DocClose").addEventListener("click", closeDocDialog);
    return dlg;
  }

  function renderPointBlock(p) {
    return "<div class=\"quotev2-doc-point\">" +
      "<h4><span class=\"quotev2-doc-pin\">" + p.pin + "</span>" + (p.title || "") + "</h4>" +
      "<span class=\"quotev2-doc-kind\">" + (p.kind || "") + "</span>" +
      "<p class=\"quotev2-doc-sum\">" + (p.summary || "") + "</p>" +
      labels.map(function (k, i) {
        return "<div class=\"quotev2-doc-detail\"><b>" + k + "</b><p>" + (p.body[i] || "—") + "</p></div>";
      }).join("") +
      "</div>";
  }

  function openFeature() {
    var feat = (window.QUOTE_V2_FEATURE_PAGES || []).filter(function (f) {
      return f.page === PAGE;
    })[0];
    var dlg = ensureDialog();
    document.getElementById("quotev2DocTitle").textContent = "功能说明";
    if (!feat) {
      document.getElementById("quotev2DocBody").innerHTML = "<p>暂无说明。</p>";
    } else {
      document.getElementById("quotev2DocBody").innerHTML =
        "<div class=\"quotev2-doc-feat\">" +
        "<h3>" + feat.title + "</h3>" +
        "<p style=\"margin:0 0 8px;color:#595959\">" + feat.summary + "</p>" +
        "<ul>" + (feat.bullets || []).map(function (b) { return "<li>" + b + "</li>"; }).join("") + "</ul>" +
        "</div>";
    }
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  function openPoints() {
    var points = window.QUOTE_V2_REVIEW_POINTS || [];
    var pinIds = (window.QUOTE_V2_REVIEW_PIN_IDS || {})[PAGE] || [];
    var byId = {};
    points.forEach(function (p) {
      if (p.page === PAGE) byId[p.id] = p;
    });
    var dlg = ensureDialog();
    document.getElementById("quotev2DocTitle").textContent = "逐点开发说明";
    document.getElementById("quotev2DocBody").innerHTML =
      "<p style=\"margin:0 0 10px;font-size:12px;color:#8c8c8c\">编号与页面上橙色圆圈一致。</p>" +
      pinIds.map(function (id) {
        var p = byId[id];
        return p ? renderPointBlock(p) : "";
      }).join("");
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  function mountBar() {
    if (document.getElementById("quotev2DocBar")) return;
    var bar = document.createElement("span");
    bar.className = "quotev2-doc-toolbar";
    bar.id = "quotev2DocBar";
    bar.innerHTML =
      "<button type=\"button\" class=\"btn-doc\" id=\"quotev2BtnPoints\">逐点开发说明</button>" +
      "<button type=\"button\" class=\"btn-doc\" id=\"quotev2BtnFeature\">功能说明</button>";

    var mount = document.getElementById("quoteV2DocMount");
    if (mount) {
      mount.appendChild(bar);
    } else {
      var hd = document.querySelector(".page-hd");
      if (hd) hd.appendChild(bar);
    }

    document.getElementById("quotev2BtnPoints").addEventListener("click", openPoints);
    document.getElementById("quotev2BtnFeature").addEventListener("click", openFeature);
  }

  function boot() {
    injectStyle();
    mountBar();
  }

  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = scriptUrl(src);
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  if (window.QUOTE_V2_REVIEW_POINTS) {
    boot();
  } else {
    loadScript("quote-v2-review-points.js", boot);
  }
})();
