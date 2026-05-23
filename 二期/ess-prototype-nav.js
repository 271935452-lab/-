/**
 * ESS 询价模块原型侧栏：自动注入到 二期/ 下各 ESS 询价 HTML 页。
 */
(function () {
  if (window.__ESS_PROTOTYPE_NAV__) return;
  window.__ESS_PROTOTYPE_NAV__ = true;

  var GROUPS = [
    {
      label: "导航",
      links: [
        { file: "ESS原型导航-询价模块.html", label: "询价模块 · 原型导航" },
      ],
    },
    {
      label: "列表",
      links: [
        { file: "ESS我的报价-列表-MVP.html", label: "我的报价（业务员）" },
        { file: "ESS询价报价-报价员列表-MVP.html", label: "询价报价（报价员）" },
      ],
    },
    {
      label: "询价",
      links: [
        { file: "ESS询价编辑-MVP.html", label: "询价编辑（散货 / 整柜）" },
      ],
    },
    {
      label: "详情",
      links: [
        { file: "ESS整柜询价详情-MVP.html", label: "整柜 · 询价方案详情" },
        { file: "ESS整柜报价详情-MVP.html", label: "整柜 · 报价详情" },
      ],
    },
    {
      label: "报价",
      links: [
        { file: "ESS整柜报价编辑-MVP.html", label: "整柜 · 报价编辑" },
      ],
    },
    {
      label: "返回",
      links: [
        { file: "../index.html", label: "项目导航首页" },
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

  function buildAside(active) {
    var aside = document.createElement("aside");
    aside.className = "ess-nav-sidenav";
    aside.setAttribute("aria-label", "ESS 询价模块 · 原型导航");

    var brand = document.createElement("div");
    brand.className = "ess-nav-brand";
    brand.innerHTML =
      "<h1>ESS 询价模块</h1>" +
      "<p>散货 / 整柜 · 业务员列表、报价员列表、询价编辑、详情与报价编辑原型页，均在 <code style=\"font-size:11px\">二期/</code>。</p>";
    aside.appendChild(brand);

    var scroll = document.createElement("nav");
    scroll.className = "ess-nav-scroll";

    var phase = document.createElement("div");
    phase.className = "ess-nav-phase";
    phase.textContent = "页面菜单";
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
        var base = item.file.split("/").pop();
        if (base === active || item.file === active) {
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
    if (document.body && document.body.getAttribute("data-ess-nav") === "off") return;
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
        if (tag === "SCRIPT" && /ess-prototype-nav\.js/i.test(node.getAttribute("src") || "")) return;
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
