/**
 * 仓位拆分 · 智能配舱：功能说明 + 逐点开发说明（挂工具条）
 */
(function () {
  var scriptEl = document.currentScript;
  var PAGE = 0;
  if (scriptEl && scriptEl.getAttribute("data-page") !== null) {
    PAGE = Number(scriptEl.getAttribute("data-page")) || 0;
  } else {
    var p = location.pathname || "";
    if (/装柜计划-仓库视图/.test(p)) PAGE = 1;
    else if (/待配仓/.test(p)) PAGE = 2;
    else if (/终配舱/.test(p)) PAGE = 3;
    else if (/配舱规则配置/.test(p)) PAGE = 4;
    else if (/提单管理/.test(p)) PAGE = 5;
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
    if (document.getElementById("ship-stow-doc-bar-style")) return;
    var st = document.createElement("style");
    st.id = "ship-stow-doc-bar-style";
    st.textContent =
      ".ship-stow-doc-toolbar{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;margin-left:8px;}" +
      ".ship-stow-doc-toolbar .btn-doc{" +
      "height:28px;padding:0 12px;border:1px solid #0f766e;background:#fff;color:#0f766e;" +
      "border-radius:2px;font:12px \"Microsoft YaHei\",sans-serif;cursor:pointer;}" +
      ".ship-stow-doc-toolbar .btn-doc:hover{background:#ecfdf5;}" +
      ".ship-stow-doc-toolbar a.btn-doc{display:inline-flex;align-items:center;text-decoration:none;}" +
      "#shipStowDocDialog{border:0;border-radius:10px;padding:0;width:min(640px,94vw);" +
      "max-height:min(85vh,720px);box-shadow:0 16px 60px #0003;margin:auto;background:#fff;}" +
      "#shipStowDocDialog::backdrop{background:rgba(15,23,42,.35);}" +
      ".ship-stow-doc-hd{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;" +
      "padding:16px 18px 12px;border-bottom:1px solid #e2e8f0;}" +
      ".ship-stow-doc-hd h2{margin:0;font-size:17px;font-weight:700;line-height:1.4;flex:1;}" +
      "#shipStowDocClose{flex-shrink:0;padding:7px 12px;border:1px solid #2a6bbd;border-radius:4px;" +
      "background:#fff;color:#2a6bbd;font:inherit;font-size:14px;cursor:pointer;}" +
      ".ship-stow-doc-bd{padding:12px 18px 18px;overflow:auto;max-height:calc(85vh - 72px);" +
      "font-size:13px;line-height:1.65;}" +
      ".ship-stow-doc-feat{margin:0 0 12px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;}" +
      ".ship-stow-doc-feat h3{margin:0 0 6px;font-size:14px;}" +
      ".ship-stow-doc-feat ul{margin:8px 0 0;padding-left:1.25em;}" +
      ".ship-stow-doc-point{border:1px solid #e8e8e8;border-radius:4px;padding:10px 12px;margin:0 0 8px;}" +
      ".ship-stow-doc-point h4{margin:0 0 6px;font-size:13px;display:flex;align-items:center;gap:8px;}" +
      ".ship-stow-doc-pin{display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:20px;height:20px;border-radius:50%;background:#ff8a00;color:#fff;" +
      "font-size:11px;font-weight:700;}" +
      ".ship-stow-doc-kind{font-size:11px;color:#2a6bbd;background:#eff6ff;padding:4px 8px;border-radius:4px;display:inline-block;margin-bottom:6px;}" +
      ".ship-stow-doc-sum{margin:0 0 8px;color:#64748b;font-size:12px;}" +
      ".ship-stow-doc-detail{display:grid;grid-template-columns:52px 1fr;gap:4px 8px;margin:4px 0;font-size:12px;}" +
      ".ship-stow-doc-detail b{color:#8c8c8c;font-weight:600;}" +
      ".ship-stow-doc-detail p{margin:0;}";
    document.head.appendChild(st);
  }

  function closeDocDialog() {
    var dlg = document.getElementById("shipStowDocDialog");
    if (!dlg) return;
    if (typeof dlg.close === "function") dlg.close();
    else dlg.removeAttribute("open");
  }

  function ensureDialog() {
    var dlg = document.getElementById("shipStowDocDialog");
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "shipStowDocDialog";
    dlg.innerHTML =
      '<div class="ship-stow-doc-hd"><h2 id="shipStowDocTitle"></h2>' +
      '<button type="button" id="shipStowDocClose">关闭</button></div>' +
      '<div class="ship-stow-doc-bd" id="shipStowDocBody"></div>';
    document.body.appendChild(dlg);
    dlg.addEventListener("cancel", function (e) { e.preventDefault(); closeDocDialog(); });
    dlg.addEventListener("click", function (e) { if (e.target === dlg) closeDocDialog(); });
    document.getElementById("shipStowDocClose").addEventListener("click", closeDocDialog);
    return dlg;
  }

  function renderPointBlock(p) {
    return '<div class="ship-stow-doc-point">' +
      '<h4><span class="ship-stow-doc-pin">' + p.pin + "</span>" + (p.title || "") + "</h4>" +
      '<span class="ship-stow-doc-kind">' + (p.kind || "") + "</span>" +
      '<p class="ship-stow-doc-sum">' + (p.summary || "") + "</p>" +
      labels.map(function (k, i) {
        return '<div class="ship-stow-doc-detail"><b>' + k + "</b><p>" + ((p.body && p.body[i]) || "—") + "</p></div>";
      }).join("") +
      "</div>";
  }

  function openFeature() {
    var feat = (window.SHIP_STOW_FEATURE_PAGES || []).filter(function (f) { return f.page === PAGE; })[0];
    var dlg = ensureDialog();
    document.getElementById("shipStowDocTitle").textContent = "功能说明";
    if (!feat) {
      document.getElementById("shipStowDocBody").innerHTML = "<p>暂无说明。</p>";
    } else {
      document.getElementById("shipStowDocBody").innerHTML =
        '<div class="ship-stow-doc-feat"><h3>' + feat.title + "</h3>" +
        '<p style="margin:0 0 8px;color:#595959">' + feat.summary + "</p><ul>" +
        (feat.bullets || []).map(function (b) { return "<li>" + b + "</li>"; }).join("") +
        "</ul></div>";
    }
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  function openPoints() {
    var pinIds = (window.SHIP_STOW_REVIEW_PIN_IDS || {})[PAGE] || [];
    var byId = {};
    (window.SHIP_STOW_REVIEW_POINTS || []).forEach(function (p) {
      if (p.page === PAGE) byId[p.id] = p;
    });
    var dlg = ensureDialog();
    document.getElementById("shipStowDocTitle").textContent = "逐点开发说明";
    document.getElementById("shipStowDocBody").innerHTML =
      '<p style="margin:0 0 10px;font-size:12px;color:#8c8c8c">编号与本页橙色圆圈一致。</p>' +
      pinIds.map(function (id) {
        var p = byId[id];
        return p ? renderPointBlock(p) : "";
      }).join("");
    if (typeof dlg.showModal === "function") dlg.showModal();
    else dlg.setAttribute("open", "open");
  }

  /** 本页交互详情（功能说明+逐点），不进分册总览列表 */
  function prdHref() {
    var links = window.SHIP_STOW_PAGE_LINKS || [];
    var cur = links.filter(function (l) { return Number(l.page) === Number(PAGE); })[0];
    var fallbackByPage = {
      0: "仓位拆分-海派仓位表-PRD-交互稿.html",
      1: "仓位拆分-仓库视图-PRD-交互稿.html",
      2: "仓位拆分-待配仓-PRD-交互稿.html",
      3: "仓位拆分-终配舱-PRD-交互稿.html",
      4: "仓位拆分-配舱规则配置-PRD-交互稿.html",
      5: "仓位拆分-提单管理-PRD-交互稿.html"
    };
    var name = (cur && cur.prd) ? cur.prd : fallbackByPage[PAGE];
    if (!name) name = fallbackByPage[0];
    if (name.indexOf("义乌智能仓-方案/") === 0 || name.indexOf("../") === 0 || name.indexOf("http") === 0) return name;
    return "义乌智能仓-方案/" + name.replace(/^.*\//, "");
  }

  function mountBar() {
    if (document.getElementById("shipStowDocBar")) return;
    var bar = document.createElement("span");
    bar.className = "ship-stow-doc-toolbar";
    bar.id = "shipStowDocBar";
    bar.innerHTML =
      '<button type="button" class="btn-doc" id="shipStowBtnFeature">功能说明</button>' +
      '<button type="button" class="btn-doc" id="shipStowBtnPoints">逐点开发说明</button>' +
      '<a class="btn-doc" id="shipStowBtnPrd" href="' + prdHref() + '" target="_blank" rel="noopener">本页 PRD</a>';

    var mount = document.getElementById("shipStowDocMount");
    var toolbar = document.querySelector(".toolbar");
    if (mount) mount.appendChild(bar);
    else if (toolbar) toolbar.appendChild(bar);
    else document.body.insertBefore(bar, document.body.firstChild);

    document.getElementById("shipStowBtnFeature").addEventListener("click", openFeature);
    document.getElementById("shipStowBtnPoints").addEventListener("click", openPoints);
    var prdA = document.getElementById("shipStowBtnPrd");
    if (prdA) {
      prdA.addEventListener("click", function (e) {
        /* 点击时再算一次，确保进本页详情而非总览列表 */
        prdA.setAttribute("href", prdHref());
      });
    }
  }

  function boot() {
    injectStyle();
    mountBar();
  }

  if (window.SHIP_STOW_REVIEW_POINTS) boot();
  else loadScript("ship-stow-review-points.js", boot);
})();
