/**

 * ESS 询价模块 · PRD 说明：右侧栏，默认收起，点 PRD 展开

 * 页面内放置 .ess-prd-source（hidden）即可自动挂载。

 * 可加 data-prd-href 指向独立 PRD 页，侧栏用 iframe 载入全文。

 * 可加 data-prd-anchor 指定 PRD 内模块 id；未写则按当前页面文件名自动匹配。

 */

(function () {

  if (window.__ESS_PROTOTYPE_PRD__) return;

  window.__ESS_PROTOTYPE_PRD__ = true;



  var WIDE_MQ = window.matchMedia("(min-width: 1680px)");



  /** 共享总 PRD：按原型页文件名 → 章节 id */

  var PAGE_ANCHORS = {

    "ESS询价编辑-MVP.html": "m2",

    "ESS询价编辑-APP-散货-MVP.html": "m2",

    "ESS我的报价-列表-MVP.html": "m2b",

    "ESS询价报价-报价员列表-MVP.html": "m3",

    "ESS散货询价方案详情-MVP.html": "m6-detail",

    "船务组-运价管理-我司与代理订舱-MVP.html": "m2",

    "船务组-提单创建批量-AI识别-MVP.html": "m3",

    "数据字典-船公司航运-提单号规则-MVP.html": "m3-bl",

    "船务组-提单管理-按周分组与分配-MVP.html": "m4"

  };



  function pageFileName() {

    var p = location.pathname || location.href || "";

    try {

      p = decodeURIComponent(p.split("?")[0].split("#")[0]);

    } catch (e) {}

    return p.split("/").pop() || "";

  }



  function resolveAnchor(source, href) {

    if (source) {

      var explicit = source.getAttribute("data-prd-anchor");

      if (explicit) return explicit.replace(/^#/, "");

    }

    var page = pageFileName();

    if (PAGE_ANCHORS[page]) return PAGE_ANCHORS[page];

    if (href && page) {

      var stem = page.replace(/\.html$/i, "");

      var base = href.split("#")[0].split("?")[0].split("/").pop() || href;

      if (base === stem + "-PRD.html" || base.indexOf(stem) === 0) return "prd-body";

    }

    return "prd-body";

  }



  function buildHref(href, anchor) {

    if (!href) return href;

    var base = href.split("#")[0];

    return anchor ? base + "#" + anchor : base;

  }



  function scrollFrameToAnchor(frame, anchor) {

    if (!frame || !anchor) return;

    function go() {

      try {

        var doc = frame.contentDocument;

        var win = frame.contentWindow;

        if (!doc || !win) return;

        var el = doc.getElementById(anchor);

        if (!el) el = doc.querySelector(".card[id], section.card, .card");

        if (!el) return;

        if (win.location.hash !== "#" + anchor) {

          try { win.location.hash = anchor; } catch (e2) {}

        }

        el.scrollIntoView({ block: "start", behavior: "auto" });

      } catch (err) {}

    }

    if (frame.contentDocument && frame.contentDocument.readyState === "complete") {

      setTimeout(go, 0);

    } else {

      frame.addEventListener("load", function () { setTimeout(go, 0); }, { once: true });

    }

  }



  function init() {

    var source = document.querySelector(".ess-prd-source");

    if (!source) return;



    var body = document.body;

    body.classList.add("ess-prd-page");

    body.classList.remove("ess-prd-open", "ess-prd-collapsed");



    var href = source.getAttribute("data-prd-href");

    var anchor = resolveAnchor(source, href);

    var frameSrc = buildHref(href, anchor);

    var closeBtn = '<button type="button" class="ess-prd-close" id="essPrdClose" aria-label="关闭 PRD">×</button>';

    var aside = document.createElement("aside");

    aside.className = "ess-prd-side";

    aside.id = "essPrdSide";

    aside.setAttribute("aria-label", "PRD 说明");

    var frame = null;

    if (href) {

      var chip = source.querySelector(".ess-prd-chip");

      aside.innerHTML = closeBtn + (chip ? chip.outerHTML : "") +

        '<iframe class="ess-prd-frame" src="' + frameSrc + '" title="PRD"></iframe>';

      frame = aside.querySelector(".ess-prd-frame");

    } else {

      aside.innerHTML = closeBtn + source.innerHTML;

    }

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

      return body.classList.contains("ess-prd-open");

    }



    function syncUi() {

      var open = isOpen();

      btn.setAttribute("aria-expanded", open ? "true" : "false");

      btn.textContent = open ? "收起" : "PRD";

      backdrop.setAttribute("aria-hidden", open && !isWide() ? "false" : "true");

    }



    function setOpen(open) {

      body.classList.toggle("ess-prd-open", !!open);

      syncUi();

      if (open && frame) scrollFrameToAnchor(frame, anchor);

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

    WIDE_MQ.addEventListener("change", syncUi);



    syncUi();

  }



  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", init);

  } else {

    init();

  }

})();


