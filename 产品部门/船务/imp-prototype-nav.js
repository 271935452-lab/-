/**
 * 进口商模块原型侧栏：自动注入到各进口商相关 HTML 页。
 */
(function () {
  if (window.__IMP_PROTOTYPE_NAV__) return;
  window.__IMP_PROTOTYPE_NAV__ = true;

  var GROUPS = [
    {
      label: "导航",
      links: [
        { file: "船务组-导航.html", label: "船务组导航" },
        { file: "原型导航-进口商模块.html", label: "模块导航" },
      ],
    },
    {
      label: "进口商",
      links: [
        { file: "进口商管理-MVP.html", label: "进口商管理（信息管理）" },
        { file: "进口商管理-MVP.html#usage", label: "进口商管理（使用管理）" },
        { file: "进口商管理-MVP.html?action=create", label: "新增进口商（弹窗）" },
        { file: "进口商管理-MVP.html?action=edit&code=IMP-US-2024-018", label: "编辑进口商（弹窗）" },
        { file: "进口商-清关行港口配置-MVP.html", label: "清关行·港口配置" },
      ],
    },
    {
      label: "柜子关联",
      links: [
        { file: "柜子编辑-绑定进口商-MVP.html", label: "柜子编辑 · 绑定进口商" },
      ],
    },
    {
      label: "返回",
      links: [{ file: "../../index.html", label: "项目导航首页" }],
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

  function shouldSkipNav() {
    if (document.body && document.body.getAttribute("data-imp-nav") === "off") return true;
    if (new URLSearchParams(location.search).get("embed") === "1") return true;
    try {
      if (window.self !== window.top) return true;
    } catch (_) {
      return true;
    }
    return false;
  }

  function parseLinkHref(href) {
    var hashIdx = href.indexOf("#");
    var beforeHash = hashIdx >= 0 ? href.slice(0, hashIdx) : href;
    var linkHash = hashIdx >= 0 ? href.slice(hashIdx) : "";
    var qIdx = beforeHash.indexOf("?");
    return {
      file: qIdx >= 0 ? beforeHash.slice(0, qIdx) : beforeHash,
      search: qIdx >= 0 ? beforeHash.slice(qIdx) : "",
      hash: linkHash,
    };
  }

  function isLinkActive(itemFile) {
    var link = parseLinkHref(itemFile);
    var curFile = currentFile();
    var curHash = location.hash || "";
    var curSearch = location.search || "";
    if (link.file !== curFile) return false;
    if (link.hash) return curHash === link.hash;
    if (link.search) return curSearch === link.search;
    return !curHash && !curSearch;
  }

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function buildAside() {
    var aside = document.createElement("aside");
    aside.className = "imp-nav-sidenav";
    aside.setAttribute("aria-label", "进口商模块 · 原型导航");

    var brand = document.createElement("div");
    brand.className = "imp-nav-brand";
    brand.innerHTML =
      "<h1>进口商管理</h1>" +
      "<p>信息维护、使用监控（查验率 / 备注）、柜子绑定；关联维度为<strong>柜子</strong>（非订单）。</p>";
    aside.appendChild(brand);

    var scroll = document.createElement("nav");
    scroll.className = "imp-nav-scroll";

    var phase = document.createElement("div");
    phase.className = "imp-nav-phase";
    phase.textContent = "页面菜单";
    scroll.appendChild(phase);

    GROUPS.forEach(function (g) {
      var gl = document.createElement("div");
      gl.className = "imp-nav-group-label";
      gl.textContent = g.label;
      scroll.appendChild(gl);
      g.links.forEach(function (item) {
        var a = document.createElement("a");
        a.className = "imp-nav-link";
        a.href = item.file;
        a.textContent = item.label;
        if (isLinkActive(item.file)) {
          a.classList.add("is-active");
          a.setAttribute("aria-current", "page");
        }
        scroll.appendChild(a);
      });
    });

    aside.appendChild(scroll);
    return aside;
  }

  function activateUsageTabIfNeeded() {
    if (location.hash !== "#usage") return;
    var tab = document.querySelector('.tab[data-tab="usage"]');
    if (!tab || tab.classList.contains("active")) return;
    tab.click();
    var usageSummary = document.getElementById("usageSummaryGroup");
    if (usageSummary) usageSummary.hidden = false;
  }

  function mount() {
    if (shouldSkipNav()) return;
    if (document.querySelector(".imp-nav-sidenav")) return;

    var shell = document.createElement("div");
    shell.className = "imp-app-shell";
    var mainWrap = document.createElement("div");
    mainWrap.className = "imp-main-wrap";
    var aside = buildAside();

    Array.prototype.slice.call(document.body.childNodes).forEach(function (node) {
      if (node.nodeType === 1) {
        var tag = node.tagName;
        if (tag === "SCRIPT" && /imp-prototype-nav\.js/i.test(node.getAttribute("src") || "")) return;
        if (tag === "LINK" && /imp-prototype-nav\.css/i.test(node.getAttribute("href") || "")) return;
      }
      if (node.nodeType === 3 && !String(node.textContent || "").trim()) return;
      mainWrap.appendChild(node);
    });
    shell.appendChild(aside);
    shell.appendChild(mainWrap);
    document.body.appendChild(shell);
    activateUsageTabIfNeeded();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
