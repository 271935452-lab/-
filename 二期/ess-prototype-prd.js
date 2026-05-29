/**
 * ESS 询价模块 · PRD 说明：右侧点击展开/收起
 * 页面内放置 .ess-prd-source（hidden）即可自动挂载侧栏。
 */
(function () {
  if (window.__ESS_PROTOTYPE_PRD__) return;
  window.__ESS_PROTOTYPE_PRD__ = true;

  var WIDE_MQ = window.matchMedia("(min-width: 1680px)");

  function init() {
    var source = document.querySelector(".ess-prd-source");
    if (!source) return;

    var body = document.body;
    body.classList.add("ess-prd-page", "ess-prd-collapsed");

    var aside = document.createElement("aside");
    aside.className = "ess-prd-side";
    aside.id = "essPrdSide";
    aside.setAttribute("aria-label", "PRD 说明");
    aside.innerHTML =
      '<button type="button" class="ess-prd-close" id="essPrdClose" aria-label="关闭 PRD">×</button>' +
      source.innerHTML;
    source.remove();

    var backdrop = document.createElement("div");
    backdrop.className = "ess-prd-backdrop";
    backdrop.id = "essPrdBackdrop";
    backdrop.setAttribute("aria-hidden", "true");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "ess-prd-fab";
    btn.id = "essPrdToggle";
    btn.setAttribute("aria-controls", "essPrdSide");
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "PRD";

    body.appendChild(aside);
    body.appendChild(backdrop);
    body.appendChild(btn);

    function isWide() {
      return WIDE_MQ.matches;
    }

    function isOpen() {
      return isWide()
        ? !body.classList.contains("ess-prd-collapsed")
        : body.classList.contains("ess-prd-open");
    }

    function syncUi() {
      var open = isOpen();
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "收起" : "PRD";
      backdrop.setAttribute("aria-hidden", open && !isWide() ? "false" : "true");
    }

    function setOpen(open) {
      if (isWide()) {
        body.classList.toggle("ess-prd-collapsed", !open);
        body.classList.remove("ess-prd-open");
      } else {
        body.classList.toggle("ess-prd-open", open);
      }
      syncUi();
    }

    btn.addEventListener("click", function () {
      setOpen(!isOpen());
    });

    aside.querySelector("#essPrdClose").addEventListener("click", function () {
      setOpen(false);
    });

    backdrop.addEventListener("click", function () {
      if (!isWide()) setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) setOpen(false);
    });

    WIDE_MQ.addEventListener("change", function () {
      body.classList.remove("ess-prd-open");
      if (isWide()) {
        /* 切到宽屏时保持当前折叠态 */
      } else {
        body.classList.add("ess-prd-collapsed");
      }
      syncUi();
    });

    syncUi();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
