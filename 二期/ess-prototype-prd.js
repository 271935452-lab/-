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

    "船务组-提单管理-按周分组与分配-MVP.html": "m4",

    "仓位管理-订舱完善提单-整合-MVP.html": "s-filter",

    "报关管理-列表-MVP.html": "s-filter"

  };

  /** 旁支计划一：?plan1= 功能 id → 侧栏只展示本分册片段；全量 PRD 见总册 §二 */
  var BRANCH_PLAN_ONE = {
    f1: { proto: "船务组-提单管理-按周分组与分配-MVP.html", prd: "船务组-提单管理-按周分组与分配-MVP-PRD.html", scope: "m-dlg", row: "退运", chip: "PRD · #1 提单退运" },
    "f1-wh": { proto: "仓位管理-订舱完善提单-整合-MVP.html", prd: "仓位管理-订舱完善提单-整合-MVP-PRD.html", scope: "m-bar", row: "退运", chip: "PRD · #1 仓位退运" },
    f2: { proto: "报关管理-列表-MVP.html", prd: "报关管理-列表-MVP-PRD.html", scope: "m-fee", row: "费用登记", chip: "PRD · #2 报关费用" },
    f3: { proto: "报关管理-做资料分票核准-MVP.html", prd: "报关管理-做资料分票核准-MVP-PRD.html", chip: "PRD · #3 取消核准改单" },
    f5: { proto: "船务组-提单管理-按周分组与分配-MVP.html", prd: "船务组-提单管理-按周分组与分配-MVP-PRD.html", scope: "m-dlg", row: "分配抽屉", chip: "PRD · #5 工厂地址" },
    f7: { proto: "业务数据统计-尾端派送费-MVP.html", prd: "业务数据统计-尾端派送费-MVP-PRD.html", chip: "PRD · #7 私卡尾端费" },
    "f7-hd": { proto: "海外对接组-主单跟进-MVP.html", prd: "海外对接组-主单跟进-MVP-PRD.html", anchor: "s-fee", chip: "PRD · #7 主单尾端费" },
    f9a: { proto: "报关管理-列表-MVP.html", prd: "报关管理-列表-MVP-PRD.html", scope: "m-dlg", row: "买单/单证", chip: "PRD · #9a 买单/单证" },
    f9b: { proto: "报关管理-列表-MVP.html", prd: "报关管理-列表-MVP-PRD.html", scope: "m-dlg", row: "退运运单", chip: "PRD · #9b 退运运单" },
    f10: { proto: "船务组-提单管理-按周分组与分配-MVP.html", prd: "船务组-提单管理-按周分组与分配-MVP-PRD.html", scope: "m-dlg", row: "提货地点", chip: "PRD · #10 提还箱字典" },
    f11: { proto: "清关管理-MVP.html", prd: "清关管理-MVP-PRD.html", anchor: "m-bg", chip: "PRD · #11 清关退运" },
    f12: { proto: "船务组-主单基础费用-批量维护-MVP.html", prd: "船务组-主单基础费用-批量维护-MVP-PRD.html", chip: "PRD · #12 批量维护" },
    "f-r2": { proto: "风控组-操作查货率报表-MVP.html", prd: "风控组-操作查货率报表-MVP-PRD.html", anchor: "s1", chip: "PRD · 二 查货报表" },
    "f-r3": { proto: "关务组-查验报表-提单运单维度-MVP.html", prd: "关务组-查验报表-提单运单维度-MVP-PRD.html", anchor: "s-week-outcome", chip: "PRD · 三 查验报表" },
    "f-r4": { proto: "海外对接组-提柜拆柜时效-MVP.html", prd: "海外对接组-提柜拆柜时效-MVP-PRD.html", anchor: "s-logic", chip: "PRD · 四 提柜拆柜" },
    "f-r5": { proto: "海外对接组-主单实际费用-MVP.html", prd: "海外对接组-主单实际费用-MVP-PRD.html", anchor: "s-logic", chip: "PRD · 五 实际费用" }
  };

  function plan1Id() {
    try { return new URLSearchParams(location.search).get("plan1"); } catch (e) { return null; }
  }

  function applyPlan1(source, href, anchor) {
    var id = plan1Id();
    if (!id || !BRANCH_PLAN_ONE[id]) return { href: href, anchor: anchor, chip: null, autoOpen: false };
    var c = BRANCH_PLAN_ONE[id];
    var page = pageFileName();
    if (c.proto && c.proto !== page) return { href: href, anchor: anchor, chip: null, autoOpen: false };
    var h = c.prd || href;
    var a = c.anchor || c.scope || anchor;
    var qs = [];
    if (c.scope) qs.push("scope=" + encodeURIComponent(c.scope));
    if (c.row) qs.push("row=" + encodeURIComponent(c.row));
    if (qs.length) h += (h.indexOf("?") >= 0 ? "&" : "?") + qs.join("&");
    return { href: h, anchor: a, chip: c.chip, autoOpen: true };
  }



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

    var plan = applyPlan1(source, href, anchor);

    href = plan.href;

    anchor = plan.anchor;

    var frameSrc = buildHref(href, anchor);

    var closeBtn = '<button type="button" class="ess-prd-close" id="essPrdClose" aria-label="关闭 PRD">×</button>';

    var aside = document.createElement("aside");

    aside.className = "ess-prd-side";

    aside.id = "essPrdSide";

    aside.setAttribute("aria-label", "PRD 说明");

    var frame = null;

    if (href) {

      var chip = source.querySelector(".ess-prd-chip");

      if (plan.chip) {

        chip = document.createElement("span");

        chip.className = "ess-prd-chip";

        chip.textContent = plan.chip;

      }

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

    if (plan.autoOpen) setOpen(true);

  }



  if (document.readyState === "loading") {

    document.addEventListener("DOMContentLoaded", init);

  } else {

    init();

  }

})();

/** 提单 AI 收起后跨页悬浮条：点展开回到原创建页弹窗 */
(function () {
  var KEY = "ess-ai-scan-dock";
  function load() {
    try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) { return null; }
  }
  function goOpen(st) {
    var href = (st && st.returnHref) || "";
    if (!href) return;
    href = href.replace(/[?&]ai=open\b/, "");
    href += (href.indexOf("?") >= 0 ? "&" : "?") + "ai=open";
    location.href = href;
  }
  function mount() {
    var st = load();
    if (!st || !st.collapsed) return;
    if (document.getElementById("aiDock")) return;
    if (document.getElementById("essAiGuestDock")) return;
    if (!document.getElementById("essAiGuestDockCss")) {
      var css = document.createElement("style");
      css.id = "essAiGuestDockCss";
      css.textContent =
        ".ess-ai-guest-dock{display:flex;position:fixed;right:20px;bottom:20px;z-index:1250;align-items:center;gap:10px;min-width:280px;max-width:420px;padding:10px 12px;background:#fff;border:1px solid #ffa39e;border-radius:8px;box-shadow:0 8px 24px rgba(207,19,34,.18);font-family:Microsoft YaHei,PingFang SC,Segoe UI,sans-serif;cursor:pointer}" +
        ".ess-ai-guest-dock .mk{flex-shrink:0;width:32px;height:32px;border-radius:50%;background:linear-gradient(145deg,#ff4d4f,#cf1322);color:#fff;font-size:11px;font-weight:800;display:flex;align-items:center;justify-content:center}" +
        ".ess-ai-guest-dock .bd{flex:1;min-width:0}.ess-ai-guest-dock .bd strong{display:block;font-size:12px;color:#cf1322}" +
        ".ess-ai-guest-dock .bd span{display:block;font-size:11px;color:#8c8c8c;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
        ".ess-ai-guest-dock button{height:28px;padding:0 12px;border:1px solid #d9d9d9;border-radius:2px;background:#fff;cursor:pointer;font-size:12px}";
      document.head.appendChild(css);
    }
    var dock = document.createElement("div");
    dock.id = "essAiGuestDock";
    dock.className = "ess-ai-guest-dock";
    dock.setAttribute("role", "status");
    dock.innerHTML =
      '<span class="mk">AI</span><div class="bd"><strong>AI 识别已收起</strong><span></span></div><button type="button">展开</button>';
    dock.querySelector(".bd span").textContent = st.text || "点展开继续";
    function open() { goOpen(st); }
    dock.addEventListener("click", function (e) {
      if (e.target && e.target.closest("button")) return;
      open();
    });
    dock.querySelector("button").addEventListener("click", function (e) {
      e.stopPropagation();
      open();
    });
    document.body.appendChild(dock);
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();


