/** 仓位拆分交互稿：按 page 渲染功能说明 + 逐点（点击展开） */
window.shipStowRenderInteractivePrd = function (opts) {
  var PAGE = opts.page != null ? Number(opts.page) : 0;
  var featId = opts.featureMountId || "featurePages";
  var pointsId = opts.pointsMountId || "devPoints";
  var labels = ["为啥做", "页面上", "系统里"];
  var points = window.SHIP_STOW_REVIEW_POINTS || [];
  var pageLinks = window.SHIP_STOW_PAGE_LINKS || [];
  var cur = pageLinks.filter(function (l) { return l.page === PAGE; })[0];

  function renderFeatures() {
    var box = document.getElementById(featId);
    if (!box) return;
    box.innerHTML = (window.SHIP_STOW_FEATURE_PAGES || [])
      .filter(function (f) { return f.page === PAGE; })
      .map(function (f) {
        return '<div class="feat-page"><h4>' + f.title + "</h4>" +
          '<p class="sum">' + (f.summary || "") + "</p><ul>" +
          (f.bullets || []).map(function (b) { return "<li>" + b + "</li>"; }).join("") +
          "</ul></div>";
      }).join("");
  }

  function renderPoints() {
    var box = document.getElementById(pointsId);
    if (!box) return;
    var pinIds = (window.SHIP_STOW_REVIEW_PIN_IDS || {})[PAGE] || [];
    var byId = {};
    points.forEach(function (p) { if (p.page === PAGE) byId[p.id] = p; });
    box.innerHTML = pinIds.map(function (id) {
      var p = byId[id];
      if (!p) return "";
      return '<div class="point" id="note-' + p.id + '">' +
        '<h3><span class="pin-no">' + p.pin + "</span>" + p.title + "</h3>" +
        '<div class="kind">' + (p.kind || "") + "</div>" +
        '<p class="sum">' + (p.summary || "") + "</p>" +
        '<div class="detail-wrap">' +
        labels.map(function (k, i) {
          return '<div class="detail"><b>' + k + "</b><p>" + ((p.body && p.body[i]) || "—") + "</p></div>";
        }).join("") +
        '<p style="margin:8px 0 0;font-size:11px;color:#94a3b8">原型锚点 <code>' + p.id + "</code></p>" +
        "</div></div>";
    }).join("");
    box.querySelectorAll(".point").forEach(function (el) {
      el.addEventListener("click", function () { el.classList.toggle("is-open"); });
    });
  }

  function renderProtoLink() {
    var el = document.getElementById("protoLink");
    if (!el || !cur) return;
    el.innerHTML = '原型：<a href="' + cur.proto + '">' + cur.label + "</a>";
  }

  renderFeatures();
  renderPoints();
  renderProtoLink();
  if (location.hash) {
    var t = document.querySelector(location.hash);
    if (t) { t.classList.add("is-open"); t.scrollIntoView({ block: "start" }); }
  }
};
