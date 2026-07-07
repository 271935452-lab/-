/**
 * 整柜订舱子模块原型侧栏：订舱、放舱、报价绑定相关页共用。
 */
(function () {
  if (window.__FCL_BOOKING_PROTOTYPE_NAV__) return;
  window.__FCL_BOOKING_PROTOTYPE_NAV__ = true;

  var ERQI = "../二期/";

  var GROUPS = [
    {
      label: "导航",
      links: [
        { file: "整柜订舱-原型导航.html", label: "整柜订舱 · 原型导航" },
        { file: "整柜本次更新-MVP.html", label: "本次更新 · 2026-06-22" },
        { file: "整柜原型导航.html", label: "整柜模块 · 全部入口" },
      ],
    },
    {
      label: "订舱主流程",
      links: [
        { file: "整柜舱位-业务流程泳道图-MVP.html", label: "舱位 · 业务流程泳道图" },
        { file: "整柜配送模式-业务流程图-MVP.html", label: "配送模式 · 七种主流程图" },
        { file: "传统订单管理-MVP.html", label: "传统订单管理 · 列表" },
        { file: "整柜下单-订单录入-MVP.html", label: "整柜下单 · 订单录入" },
        { file: "仓位管理-订舱完善提单-整合-MVP.html", label: "仓位管理 · 订舱与提单" },
      ],
    },
    {
      label: "报价 → 订舱",
      links: [
        { file: ERQI + "ESS我的报价-列表-MVP.html", label: "我的询价（业务员）" },
        { file: ERQI + "ESS询价报价-报价员列表-MVP.html", label: "询价报价（报价员）" },
        { file: "ESS整柜询价详情-MVP.html", label: "整柜 · 询价详情" },
        { file: "ESS整柜报价编辑-MVP.html", label: "报价编辑 · 分段" },
        { file: "ESS整柜报价编辑-一口价-MVP.html", label: "报价编辑 · 一口价" },
        { file: "ESS整柜报价详情-MVP.html", label: "报价详情 · 混合" },
      ],
    },
    {
      label: "岗位 · 订舱岗",
      links: [
        { file: "整柜客户岗位绑定-MVP.html", label: "整柜客户岗位绑定" },
        { file: "员工管理-整柜岗位与客户默认-MVP.html", label: "员工管理 · 整柜岗位" },
        { file: ERQI + "报价员配置-MVP.html", label: "报价员配置" },
      ],
    },
    {
      label: "返回",
      links: [
        { file: "../index.html", label: "项目导航首页" },
        { file: ERQI + "ESS原型导航-询价模块.html", label: "ESS 询价模块（散货）" },
      ],
    },
  ];

  function currentFile() {
    var href = location.href.split("#")[0].split("?")[0];
    var parts = href.replace(/\\/g, "/").split("/");
    try {
      return decodeURIComponent(parts[parts.length - 1] || "");
    } catch (_) {
      return parts[parts.length - 1] || "";
    }
  }

  function isActive(item, active) {
    var base = item.file.split("/").pop().split("#")[0];
    var activeBase = active.split("#")[0];
    return base === activeBase || item.file === active;
  }

  function buildAside(active) {
    var aside = document.createElement("aside");
    aside.className = "ess-nav-sidenav";
    aside.setAttribute("aria-label", "整柜订舱 · 原型导航");

    var brand = document.createElement("div");
    brand.className = "ess-nav-brand";
    brand.innerHTML =
      "<h1>整柜订舱</h1>" +
      "<p>流程 7.2 · 四、报价 &amp; 订舱：报价绑定运单 → 放舱（签入）→ 导出 BC / 预报。核心页在 <code style=\"font-size:11px\">整柜下单/</code>。</p>";
    aside.appendChild(brand);

    var scroll = document.createElement("nav");
    scroll.className = "ess-nav-scroll";

    var phase = document.createElement("div");
    phase.className = "ess-nav-phase";
    phase.textContent = "订舱相关页面";
    scroll.appendChild(phase);

    GROUPS.forEach(function (g) {
      var gl = document.createElement("div");
      gl.className = "ess-nav-group-label";
      gl.textContent = g.label;
      scroll.appendChild(gl);
      g.links.forEach(function (item) {
        var a = document.createElement("a");
        a.className = "ess-nav-link";
        a.href = item.file;
        a.textContent = item.label;
        if (isActive(item, active)) {
          a.classList.add("is-active");
          a.setAttribute("aria-current", "page");
        }
        scroll.appendChild(a);
      });
    });

    aside.appendChild(scroll);
    return aside;
  }

  function mount() {
    if (document.documentElement.getAttribute("data-ess-app") === "mobile") return;
    if (document.body && document.body.getAttribute("data-ess-nav") === "off") return;
    if (/-APP-/i.test(currentFile())) return;
    if (document.querySelector(".ess-nav-sidenav")) return;

    var active = currentFile();
    var shell = document.createElement("div");
    shell.className = "ess-app-shell";
    var mainWrap = document.createElement("div");
    mainWrap.className = "ess-main-wrap";
    var aside = buildAside(active);

    Array.prototype.slice.call(document.body.childNodes).forEach(function (node) {
      if (node.nodeType === 1) {
        var tag = node.tagName;
        if (tag === "SCRIPT" && /fcl-booking-prototype-nav\.js/i.test(node.getAttribute("src") || "")) return;
        if (tag === "LINK" && /ess-prototype-nav\.css/i.test(node.getAttribute("href") || "")) return;
      }
      if (node.nodeType === 3 && !String(node.textContent || "").trim()) return;
      mainWrap.appendChild(node);
    });
    shell.appendChild(aside);
    shell.appendChild(mainWrap);
    document.body.appendChild(shell);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
