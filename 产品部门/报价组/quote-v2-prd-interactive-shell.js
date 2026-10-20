/** 报价 V2 交互稿页：渲染功能说明 + 逐点列表（按 page） */
window.quoteV2RenderInteractivePrd = function (opts) {
  var PAGE = opts.page != null ? Number(opts.page) : 0;
  var featId = opts.featureMountId || "featurePages";
  var pointsId = opts.pointsMountId || "devPoints";
  var labels = ["为啥做", "页面上", "系统里"];
  var points = window.QUOTE_V2_REVIEW_POINTS || [];

  function renderFeatures() {
    var box = document.getElementById(featId);
    if (!box) return;
    var pages = window.QUOTE_V2_FEATURE_PAGES || [];
    box.innerHTML = pages
      .filter(function (f) {
        return f.page === PAGE;
      })
      .map(function (f) {
        return (
          '<div class="feat-page" id="feature-page-' +
          f.page +
          '">' +
          "<h4>" +
          f.title +
          "</h4>" +
          '<p class="sum">' +
          (f.summary || "") +
          "</p>" +
          "<ul>" +
          (f.bullets || [])
            .map(function (b) {
              return "<li>" + b + "</li>";
            })
            .join("") +
          "</ul></div>"
        );
      })
      .join("");
  }

  function renderPoints() {
    var box = document.getElementById(pointsId);
    if (!box) return;
    var pinIds = (window.QUOTE_V2_REVIEW_PIN_IDS || {})[PAGE] || [];
    var byId = {};
    points.forEach(function (p) {
      if (p.page === PAGE) byId[p.id] = p;
    });
    box.innerHTML = pinIds
      .map(function (id) {
        var p = byId[id];
        if (!p) return "";
        var title = (p.title || "").replace(/^[①②③④⑤⑥⑦⑧]\s*/, "");
        return (
          '<article class="point" id="note-' +
          p.id +
          '" tabindex="0">' +
          "<h3><span class=\"pin-no\">" +
          p.pin +
          "</span>" +
          title +
          "</h3>" +
          '<div class="kind">' +
          (p.kind || "") +
          "</div>" +
          '<p class="sum">' +
          (p.summary || "") +
          "</p>" +
          '<div class="detail-wrap">' +
          labels
            .map(function (k, i) {
              return (
                '<div class="detail"><b>' +
                k +
                "</b><p>" +
                (p.body[i] || "—") +
                "</p></div>"
              );
            })
            .join("") +
          '<p style="margin:8px 0 0;font-size:11px;color:#94a3b8">原型锚点 id：<code>' +
          p.id +
          "</code></p>" +
          "</div></article>"
        );
      })
      .join("");
  }

  function openPoint(id, scroll) {
    document.querySelectorAll(".point").forEach(function (p) {
      var on = p.id === "note-" + id;
      p.classList.toggle("is-open", on);
      p.classList.toggle("is-active", on);
    });
    if (scroll) {
      var el = document.getElementById("note-" + id);
      if (el) el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }

  function bindClick(container) {
    container.addEventListener("click", function (e) {
      var art = e.target.closest(".point");
      if (!art) return;
      var id = art.id.replace(/^note-/, "");
      var wasOpen = art.classList.contains("is-open");
      document.querySelectorAll(".point").forEach(function (p) {
        p.classList.remove("is-open", "is-active");
      });
      if (!wasOpen) openPoint(id, false);
      history.replaceState(null, "", "#note-" + id);
    });
  }

  renderFeatures();
  renderPoints();
  var box = document.getElementById(pointsId);
  if (box) bindClick(box);

  function fromHash() {
    var h = (location.hash || "").replace(/^#/, "");
    if (h.indexOf("note-") === 0) openPoint(h.slice(5), true);
  }
  fromHash();
  window.addEventListener("hashchange", fromHash);
};
