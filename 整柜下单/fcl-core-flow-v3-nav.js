/**
 * 整柜流程V3.0 · 尾端派送 + 岗位权限 · 专用左侧菜单
 */
(function () {
  if (window.__FCL_CORE_FLOW_V3_NAV__) return;
  window.__FCL_CORE_FLOW_V3_NAV__ = true;

  var LINKS = [
    { file: "整柜流程V3.0-原型导航.html", label: "整柜流程V3.0 · 导航首页", icon: "⌂" },
    { file: "整柜询价与报价绑定-MVP.html", label: "询价与报价绑定", icon: "1" },
    { file: "整柜尾端派送-MVP.html", label: "整柜尾端派送", icon: "2" },
    { file: "整柜客户岗位绑定-MVP.html", label: "整柜客户岗位绑定", icon: "3" },
    { file: "员工管理-整柜岗位与客户默认-MVP.html", label: "员工管理 · 整柜岗位", icon: "4" },
    { file: "客户管理-编辑-权限配置-MVP.html", label: "客户管理 · 权限配置", icon: "5" },
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
    aside.className = "ess-nav-sidenav fcl-core-flow-nav fcl-core-flow-v3-nav";
    aside.setAttribute("aria-label", "整柜流程V3.0 · 原型导航");

    var brand = document.createElement("div");
    brand.className = "ess-nav-brand";
    brand.innerHTML =
      "<h1>整柜流程V3.0</h1>" +
      "<p>询价报价绑定 · 尾端派送 · 岗位权限。本组为流程扩展，<strong>V2.0 订舱侧栏不含询价绑定区块</strong>。</p>";
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
      { file: "整柜流程V2.0-原型导航.html", label: "整柜流程V2.0 · 主链路" },
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
    if (document.body && document.body.getAttribute("data-fcl-nav") !== "core-flow-v3") return;
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
        if (tag === "SCRIPT" && /fcl-core-flow-v3-nav\.js/i.test(node.getAttribute("src") || "")) return;
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
