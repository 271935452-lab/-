/**
 * 整柜流程V2.0 主链路 + 配送模式配置 · 专用左侧菜单
 */
(function () {
  if (window.__FCL_CORE_FLOW_NAV__) return;
  window.__FCL_CORE_FLOW_NAV__ = true;

  var LINKS = [
    { file: "整柜流程V2.0-原型导航.html", label: "整柜流程V2.0 · 导航首页", icon: "⌂" },
    { file: "整柜流程V2.0-原型导航.html#changelog", label: "本次更新 · 2026-07-10", icon: "◎" },
    { file: "传统订单管理-MVP.html", label: "传统订单管理", icon: "1" },
    { file: "整柜下单-订单录入-MVP.html", label: "整柜下单", icon: "2" },
    { file: "仓位管理-订舱完善提单-整合-MVP.html", label: "舱位管理", icon: "3" },
    { file: "整柜配送模式-业务流程图-MVP.html", label: "配送模式 · 七种流程图", icon: "4" },
    { file: "整柜配送模式-结算节点-MVP.html", label: "配送模式 · 结算节点", icon: "5" },
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
    var hash = (item.file.split("#")[1] || "");
    var activeHash = (active.indexOf("#") > -1 ? active.split("#")[1] : location.hash.replace("#", ""));
    if (hash) {
      return base === activeBase && hash === activeHash;
    }
    return (base === activeBase || item.file === active) && !activeHash;
  }

  function buildAside(active) {
    var aside = document.createElement("aside");
    aside.className = "ess-nav-sidenav fcl-core-flow-nav";
    aside.setAttribute("aria-label", "整柜流程V2.0 · 原型导航");

    var brand = document.createElement("div");
    brand.className = "ess-nav-brand";
    brand.innerHTML =
      "<h1>整柜流程V2.0</h1>" +
      "<p>下单 → 订舱 → 清关 → 配送模式配置。尾端派送与岗位权限见 <strong>V3.0</strong> 导航。</p>";
    aside.appendChild(brand);

    var scroll = document.createElement("nav");
    scroll.className = "ess-nav-scroll";

    var phase = document.createElement("div");
    phase.className = "ess-nav-phase";
    phase.textContent = "页面菜单";
    scroll.appendChild(phase);

    LINKS.forEach(function (item) {
      var a = document.createElement("a");
      a.className = "ess-nav-link";
      a.href = item.file;
      a.innerHTML = "<span class=\"fcl-nav-idx\">" + item.icon + "</span> " + item.label;
      if (isActive(item, active)) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
      }
      scroll.appendChild(a);
    });

    var back = document.createElement("div");
    back.className = "ess-nav-group-label";
    back.textContent = "返回";
    scroll.appendChild(back);

    [
      { file: "整柜流程V3.0-原型导航.html", label: "整柜流程V3.0 · 尾端与岗位" },
      { file: "整柜原型导航.html", label: "整柜模块 · 全部入口" },
      { file: "../index.html", label: "项目导航首页" },
    ].forEach(function (item) {
      var a = document.createElement("a");
      a.className = "ess-nav-link";
      a.href = item.file;
      a.textContent = item.label;
      scroll.appendChild(a);
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
        if (tag === "SCRIPT" && /fcl-core-flow-nav\.js/i.test(node.getAttribute("src") || "")) return;
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
