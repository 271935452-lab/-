/**
 * PRD 嵌入侧栏：?scope=章节id&row=首列关键字 时只展示对应段落/表格行。
 * 由 ess-prototype-prd.js 在 iframe URL 上附带；全量 PRD 直连不带参数。
 */
(function () {
  if (window.self === window.top) return;

  var q = new URLSearchParams(location.search);
  var scope = q.get("scope");
  var row = q.get("row");
  if (!scope && !row) return;

  function hide(el) {
    if (el) el.style.display = "none";
  }

  function apply() {
    hide(document.querySelector(".hero"));
    hide(document.querySelector(".toc"));
    hide(document.querySelector(".foot"));
    document.querySelectorAll("section.card").forEach(function (c) {
      c.style.display = "none";
    });

    var target = document.getElementById(scope);
    if (target) {
      var card = target.closest("section.card");
      if (card) {
        card.style.display = "block";
        hide(card.querySelector(":scope > h2"));
        if (target.tagName === "H3") {
          var show = false;
          Array.prototype.forEach.call(card.children, function (el) {
            if (el.tagName === "H3") {
              if (el === target) show = true;
              else if (show) show = false;
            }
            if (el.tagName === "H3" || el.tagName === "TABLE" || el.tagName === "P") {
              el.style.display = show ? "" : "none";
            }
          });
        }
      } else if (target.classList && target.classList.contains("card")) {
        target.style.display = "block";
      }
    }

    if (row) {
      document.querySelectorAll("table tbody tr").forEach(function (tr) {
        var first = tr.querySelector("td");
        if (!first) return;
        if (first.textContent.indexOf(row) < 0) tr.style.display = "none";
      });
    }

    document.documentElement.classList.add("ess-prd-scoped");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", apply);
  } else {
    apply();
  }
})();
