/**
 * RISK-006 原型页内：逐点开发说明 + 功能说明（挂在列表功能区 / 配置页标题栏，非顶导航）
 */
(function () {
  var PAGE = /规则配置/.test(location.pathname || "") || /规则配置/.test(document.title || "")
    ? 1 : 0;
  var scriptEl = document.currentScript;
  if (scriptEl && scriptEl.getAttribute("data-page") !== null) {
    PAGE = Number(scriptEl.getAttribute("data-page")) || PAGE;
  }

  var labels = ["为啥做", "页面上", "系统里"];

  function injectStyle() {
    if (document.getElementById("risk006-doc-bar-style")) return;
    var st = document.createElement("style");
    st.id = "risk006-doc-bar-style";
    st.textContent =
      ".risk006-doc-toolbar{display:inline-flex;align-items:center;gap:8px;flex-wrap:wrap;}" +
      ".risk006-doc-toolbar .btn-doc{" +
      "height:28px;padding:0 14px;border:1px solid #1890ff;background:#fff;color:#1890ff;" +
      "border-radius:2px;font:12px \"Microsoft YaHei\",sans-serif;cursor:pointer;" +
      "}" +
      ".risk006-doc-bar .btn-doc:hover{background:#e6f7ff;}" +
      "#risk006DocDialog{border:0;border-radius:4px;padding:0;width:min(640px,94vw);" +
      "max-height:min(85vh,720px);box-shadow:0 8px 32px rgba(0,0,0,.18);}" +
      "#risk006DocDialog::backdrop{background:rgba(0,0,0,.35);}" +
      ".risk006-doc-hd{display:flex;align-items:center;justify-content:space-between;gap:12px;" +
      "padding:12px 16px;border-bottom:1px solid #e8e8e8;background:#fafafa;}" +
      ".risk006-doc-hd h2{margin:0;font-size:15px;font-weight:700;}" +
      ".risk006-doc-bd{padding:12px 16px 16px;overflow:auto;max-height:calc(85vh - 52px);font-size:13px;line-height:1.65;}" +
      ".risk006-doc-feat{margin:0 0 12px;padding-bottom:12px;border-bottom:1px solid #f0f0f0;}" +
      ".risk006-doc-feat h3{margin:0 0 6px;font-size:14px;}" +
      ".risk006-doc-feat ul{margin:8px 0 0;padding-left:1.25em;}" +
      ".risk006-doc-point{border:1px solid #e8e8e8;border-radius:4px;padding:10px 12px;margin:0 0 8px;}" +
      ".risk006-doc-point h4{margin:0 0 6px;font-size:13px;display:flex;align-items:center;gap:8px;}" +
      ".risk006-doc-pin{display:inline-flex;align-items:center;justify-content:center;" +
      "min-width:20px;height:20px;border-radius:50%;background:#ff8a00;color:#fff;" +
      "font-size:11px;font-weight:700;}" +
      ".risk006-doc-kind{font-size:11px;color:#1890ff;background:#e6f7ff;padding:2px 6px;border-radius:2px;display:inline-block;margin-bottom:6px;}" +
      ".risk006-doc-sum{margin:0 0 8px;color:#64748b;font-size:12px;}" +
      ".risk006-doc-detail{display:grid;grid-template-columns:52px 1fr;gap:4px 8px;margin:4px 0;font-size:12px;}" +
      ".risk006-doc-detail b{color:#8c8c8c;font-weight:600;}" +
      ".risk006-doc-detail p{margin:0;}";
    document.head.appendChild(st);
  }

  function ensureDialog() {
    var dlg = document.getElementById("risk006DocDialog");
    if (dlg) return dlg;
    dlg = document.createElement("dialog");
    dlg.id = "risk006DocDialog";
    dlg.innerHTML =
      "<div class=\"risk006-doc-hd\">" +
      "<h2 id=\"risk006DocTitle\"></h2>" +
      "<button type=\"button\" class=\"btn-doc\" id=\"risk006DocClose\">关闭</button>" +
      "</div>" +
      "<div class=\"risk006-doc-bd\" id=\"risk006DocBody\"></div>";
    document.body.appendChild(dlg);
    document.getElementById("risk006DocClose").addEventListener("click", function () {
      dlg.close();
    });
    return dlg;
  }

  function renderPointBlock(p) {
    return "<div class=\"risk006-doc-point\">" +
      "<h4><span class=\"risk006-doc-pin\">" + p.pin + "</span>" + (p.title || "") + "</h4>" +
      "<span class=\"risk006-doc-kind\">" + (p.kind || "") + "</span>" +
      "<p class=\"risk006-doc-sum\">" + (p.summary || "") + "</p>" +
      labels.map(function (k, i) {
        return "<div class=\"risk006-doc-detail\"><b>" + k + "</b><p>" + (p.body[i] || "—") + "</p></div>";
      }).join("") +
      "</div>";
  }

  function openFeature() {
    var feat = (window.RISK006_FEATURE_PAGES || []).filter(function (f) {
      return f.page === PAGE;
    })[0];
    var dlg = ensureDialog();
    document.getElementById("risk006DocTitle").textContent = "功能说明";
    if (!feat) {
      document.getElementById("risk006DocBody").innerHTML = "<p>暂无说明。</p>";
    } else {
      document.getElementById("risk006DocBody").innerHTML =
        "<div class=\"risk006-doc-feat\">" +
        "<h3>" + feat.title + "</h3>" +
        "<p style=\"margin:0 0 8px;color:#595959\">" + feat.summary + "</p>" +
        "<ul>" + (feat.bullets || []).map(function (b) { return "<li>" + b + "</li>"; }).join("") + "</ul>" +
        "</div>";
    }
    dlg.showModal();
  }

  function openPoints() {
    var points = window.RISK006_REVIEW_POINTS || [];
    var pinIds = (window.RISK006_REVIEW_PIN_IDS || {})[PAGE] || [];
    var byId = {};
    points.forEach(function (p) {
      if (p.page === PAGE) byId[p.id] = p;
    });
    var dlg = ensureDialog();
    document.getElementById("risk006DocTitle").textContent = "逐点开发说明";
    document.getElementById("risk006DocBody").innerHTML =
      "<p style=\"margin:0 0 10px;font-size:12px;color:#8c8c8c\">编号与页面上橙色圆圈一致。</p>" +
      pinIds.map(function (id) {
        var p = byId[id];
        return p ? renderPointBlock(p) : "";
      }).join("");
    dlg.showModal();
  }

  function mountBar() {
    if (document.getElementById("risk006DocBar")) return;
    var bar = document.createElement("span");
    bar.className = "risk006-doc-toolbar";
    bar.id = "risk006DocBar";
    bar.innerHTML =
      "<button type=\"button\" class=\"btn-doc\" id=\"risk006BtnPoints\">逐点开发说明</button>" +
      "<button type=\"button\" class=\"btn-doc\" id=\"risk006BtnFeature\">功能说明</button>";

    var mount = document.getElementById("risk006DocMount");
    if (mount) {
      mount.appendChild(bar);
    } else {
      var actions = document.querySelector(".page-hd .page-hd-actions");
      if (actions) {
        actions.insertBefore(bar, actions.firstChild);
      } else {
        var hdRow = document.querySelector(".page-hd .hd-row");
        if (hdRow) hdRow.appendChild(bar);
        else {
          var pageHd = document.querySelector(".page-hd");
          if (pageHd) pageHd.appendChild(bar);
        }
      }
    }

    document.getElementById("risk006BtnPoints").addEventListener("click", openPoints);
    document.getElementById("risk006BtnFeature").addEventListener("click", openFeature);
  }

  function boot() {
    injectStyle();
    mountBar();
  }

  function loadScript(src, cb) {
    var s = document.createElement("script");
    s.src = src;
    s.onload = cb;
    s.onerror = cb;
    document.head.appendChild(s);
  }

  if (window.RISK006_REVIEW_POINTS) {
    boot();
  } else {
    loadScript("risk006-review-points.js", boot);
  }
})();
