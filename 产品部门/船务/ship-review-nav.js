/** 评审期 · 船务侧栏（对齐 test.txfba ESS：一级图标栏 + 二级菜单 + 顶栏页签） */
(function (global) {
  // 参照 ESS 一级模块：操作 / 产品；方案文档另挂一级「方案」（文件在 义乌智能仓-方案/）
  var PARENTS = [
    { id: "ops", label: "操作", icon: "操" },
    { id: "prod", label: "产品", icon: "产" },
    { id: "scheme", label: "方案", icon: "方" }
  ];

  var ITEMS = [
    // 操作 · 仓库相关
    { type: "link", parent: "ops", id: "wh-plan", href: "装柜计划-仓库视图-MVP.html", label: "装柜计划 · 仓库视图" },
    { type: "link", parent: "ops", id: "wh-pda", href: "../../APP/装柜扫描-件数核对-MVP.html", label: "PDA · 装柜扫描" },
    { type: "link", parent: "ops", id: "pre-stow", href: "船务组-待配仓-MVP.html", label: "待配仓 · 组合配仓" },
    { type: "link", parent: "ops", id: "final-stow", href: "船务组-终配舱-MVP.html", label: "终配舱登记" },
    { type: "link", parent: "ops", id: "stow-log", href: "义乌智能仓-自动配舱-任务日志-MVP.html", label: "自动配舱日志" },

    // 产品 · 作业原型
    { type: "link", parent: "prod", id: "cabin", href: "海派仓位表-MVP.html", label: "海派仓位表" },
    { type: "link", parent: "prod", id: "bl-create", href: "船务组-提单创建批量-AI识别-MVP.html", label: "提单创建" },
    { type: "link", parent: "prod", id: "bl-mgmt", href: "船务组-提单管理-按周分组与分配-MVP.html", label: "提单管理" },
    { type: "link", parent: "prod", id: "stow-rule", href: "义乌智能仓-配舱规则配置-MVP.html", label: "配舱规则" },
    { type: "link", parent: "prod", id: "hub", href: "船务组-订舱仓位装柜-评审导航.html", label: "评审导航" },
    { type: "link", parent: "prod", id: "v2", href: "船务v2/船务v2-导航.html", label: "船务 v2 目录" },

    // 方案 · 义乌智能仓-方案/
    { type: "link", parent: "scheme", id: "stow-scheme", href: "义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html", label: "自动配舱方案" },
    { type: "link", parent: "scheme", id: "stow-prd-cabin", href: "义乌智能仓-方案/仓位拆分-海派仓位表-PRD-交互稿.html", label: "PRD · 海派仓位表" },
    { type: "link", parent: "scheme", id: "stow-prd-wh", href: "义乌智能仓-方案/仓位拆分-仓库视图-PRD-交互稿.html", label: "PRD · 仓库视图" },
    { type: "link", parent: "scheme", id: "stow-prd-bl", href: "义乌智能仓-方案/仓位拆分-提单管理-PRD-交互稿.html", label: "PRD · 提单管理" },
    { type: "link", parent: "scheme", id: "stow-prd-pre", href: "义乌智能仓-方案/仓位拆分-待配仓-PRD-交互稿.html", label: "PRD · 待配仓" },
    { type: "link", parent: "scheme", id: "stow-prd-final", href: "义乌智能仓-方案/仓位拆分-终配舱-PRD-交互稿.html", label: "PRD · 终配舱" },
    { type: "link", parent: "scheme", id: "stow-prd-rule", href: "义乌智能仓-方案/仓位拆分-配舱规则配置-PRD-交互稿.html", label: "PRD · 规则配置" },
    { type: "link", parent: "scheme", id: "stow-prd", href: "义乌智能仓-方案/船务组-仓位拆分智能配舱-MVP-PRD-交互稿.html", label: "PRD · 分册索引（可选）" },
    { type: "link", parent: "scheme", id: "stow-prd-table", href: "义乌智能仓-方案/船务组-仓位拆分智能配舱-MVP-PRD.html", label: "PRD · 功能点表（可选）" },
    { type: "link", parent: "scheme", id: "flow", href: "义乌智能仓-方案/船务组-订舱仓位装柜-流程图.html", label: "订舱仓位装柜 · 流程图" },
    { type: "link", parent: "scheme", id: "stow-scene", href: "义乌智能仓-方案/义乌智能仓-自动配舱-场景.html", label: "自动配舱场景" },
    { type: "link", parent: "scheme", id: "stow-open", href: "义乌智能仓-方案/义乌智能仓-自动配舱-待确认.html", label: "自动配舱待确认" },
    { type: "link", parent: "scheme", id: "stow-seal-gw", href: "义乌智能仓-方案/义乌智能仓-封门留货-关务对接确认.html", label: "封门留货 · 关务对接" },
    { type: "link", parent: "scheme", id: "swim", href: "义乌智能仓-方案/义乌智能仓-规则到海外仓-泳道图.html", label: "规则到海外仓 · 泳道图" }
  ];

  var TAB_LINKS = [
    { id: "final-stow", href: "船务组-终配舱-MVP.html", label: "终配舱登记" },
    { id: "stow-rule", href: "义乌智能仓-配舱规则配置-MVP.html", label: "配舱规则" },
    { id: "pre-stow", href: "船务组-待配仓-MVP.html", label: "待配仓" },
    { id: "cabin", href: "海派仓位表-MVP.html", label: "海派仓位表" }
  ];

  function findItem(activeId) {
    for (var i = 0; i < ITEMS.length; i++) {
      if (ITEMS[i].id === activeId) return ITEMS[i];
    }
    return null;
  }

  function currentPath() {
    try {
      return decodeURIComponent((location.pathname || "").replace(/\\/g, "/"));
    } catch (e) {
      return (location.pathname || "").replace(/\\/g, "/");
    }
  }

  /** 相对「船务/」根再深一层：船务v2/、义乌智能仓-方案/ */
  function nestDepth() {
    var path = currentPath();
    if (/\/船务v2\//.test(path) || /\/义乌智能仓-方案\//.test(path)) return 1;
    return 0;
  }

  function fixHref(href) {
    if (!href || href.indexOf("http") === 0 || href.indexOf("mailto:") === 0) return href;
    if (href.charAt(0) === "#") return href;
    var path = currentPath();
    var depth = nestDepth();

    // 已在子目录：本模块内链去掉前缀
    if (/\/义乌智能仓-方案\//.test(path) && href.indexOf("义乌智能仓-方案/") === 0) {
      return href.replace(/^义乌智能仓-方案\//, "");
    }
    if (/\/船务v2\//.test(path) && href.indexOf("船务v2/") === 0) {
      return href.replace(/^船务v2\//, "");
    }

    if (depth === 0) return href;

    // 子目录页：相对「船务/」的链接一律再上跳一层（含已有 ../）
    if (href.indexOf("../") === 0) return "../" + href;
    return "../" + href;
  }

  function ensureShell() {
    if (document.getElementById("essShipShell")) return document.getElementById("essShipShell");

    var oldHeader = document.querySelector(".top-header");
    var oldWrap = document.querySelector(".body-wrap");
    var oldApp = document.querySelector("body > .app");
    var main =
      document.querySelector(".body-wrap > .main") ||
      document.querySelector(".app > .body-wrap > .main") ||
      document.querySelector("main.main") ||
      document.querySelector(".main") ||
      document.querySelector("main.hub") ||
      document.querySelector("main") ||
      document.querySelector(".page");
    var pageTitle = "";
    if (oldHeader) {
      var tab = oldHeader.querySelector(".nav-tab");
      pageTitle = tab ? tab.textContent.trim() : "";
    }
    if (!pageTitle) {
      var h1 = document.querySelector("h1");
      if (h1) pageTitle = h1.textContent.replace(/\s+/g, " ").trim().slice(0, 24);
    }

    var shell = document.createElement("div");
    shell.id = "essShipShell";
    shell.className = "ess-ship-shell";

    var rail = document.createElement("aside");
    rail.className = "ess-ship-rail";
    rail.id = "essShipRail";
    shell.appendChild(rail);

    var children = document.createElement("aside");
    children.className = "ess-ship-children";
    children.id = "essShipChildren";
    shell.appendChild(children);

    var content = document.createElement("div");
    content.className = "ess-ship-content";

    var top = document.createElement("header");
    top.className = "ess-ship-top";
    top.id = "essShipTop";
    content.appendChild(top);

    var page = document.createElement("div");
    page.className = "ess-ship-page";
    page.id = "essShipPage";

    if (main) {
      page.appendChild(main);
    }

    content.appendChild(page);
    shell.appendChild(content);

    // remove legacy chrome wrappers after moving main out
    if (oldHeader && oldHeader.parentNode) oldHeader.parentNode.removeChild(oldHeader);
    var side = document.getElementById("shipReviewSidebar");
    if (side && side.parentNode) side.parentNode.removeChild(side);
    if (oldWrap && oldWrap.parentNode) oldWrap.parentNode.removeChild(oldWrap);
    if (oldApp && oldApp.parentNode && !oldApp.querySelector(".main")) {
      // keep proto-banner etc. if any were inside app — move leftover nodes out first
      while (oldApp.firstChild) {
        document.body.insertBefore(oldApp.firstChild, oldApp);
      }
      oldApp.parentNode.removeChild(oldApp);
    }

    var banner = document.querySelector(".proto-banner");
    if (banner && banner.parentNode === document.body) {
      if (banner.nextSibling) document.body.insertBefore(shell, banner.nextSibling);
      else document.body.appendChild(shell);
    } else {
      document.body.insertBefore(shell, document.body.firstChild);
    }

    shell.setAttribute("data-page-title", pageTitle || document.title || "");
    return shell;
  }

  function renderRail(activeParent) {
    var rail = document.getElementById("essShipRail");
    if (!rail) return;
    var html = '<div class="ess-ship-brand" title="腾信物流">TX</div>';
    PARENTS.forEach(function (p) {
      var on = p.id === activeParent ? " on" : "";
      html +=
        '<button type="button" class="ess-ship-rail-item' + on + '" data-parent="' + p.id + '">' +
        '<span class="ico">' + p.icon + "</span>" +
        "<span class=\"lab\">" + p.label + "</span>" +
        "</button>";
    });
    rail.innerHTML = html;
  }

  function renderChildren(activeParent, activeId) {
    var box = document.getElementById("essShipChildren");
    if (!box) return;
    var parent = PARENTS.filter(function (p) { return p.id === activeParent; })[0];
    var links = ITEMS.filter(function (it) { return it.parent === activeParent; });
    var html =
      '<div class="ess-ship-children-hd">' +
      "<span>" + (parent ? parent.label : "") + "</span>" +
      "</div>" +
      '<nav class="ess-ship-children-bd">';
    links.forEach(function (it) {
      var on = it.id === activeId ? " on" : "";
      html +=
        '<a class="ess-ship-child' + on + '" href="' + fixHref(it.href) + '">' + it.label + "</a>";
    });
    html += "</nav>";
    box.innerHTML = html;
  }

  function renderTop(activeId) {
    var top = document.getElementById("essShipTop");
    if (!top) return;
    var shell = document.getElementById("essShipShell");
    var pageTitle = (shell && shell.getAttribute("data-page-title")) || "";
    var activeItem = findItem(activeId);
    var currentLabel = (activeItem && activeItem.label) || pageTitle || "控制台";

    var tabs = [{ id: "_home", href: fixHref("船务组-订舱仓位装柜-评审导航.html"), label: "控制台" }];
    var seen = { _home: 1 };
    TAB_LINKS.forEach(function (t) {
      seen[t.id] = 1;
      tabs.push({ id: t.id, href: fixHref(t.href), label: t.label });
    });
    if (activeItem && !seen[activeItem.id]) {
      tabs.push({ id: activeItem.id, href: fixHref(activeItem.href), label: activeItem.label });
    }

    var html = '<div class="ess-ship-tabs">';
    tabs.forEach(function (t) {
      var on = t.id === activeId || (t.id !== "_home" && t.label === currentLabel) ? " on" : "";
      if (t.id === "_home" && !activeId) on = " on";
      if (activeItem && t.id === activeItem.id) on = " on";
      html += '<a class="ess-ship-tab' + on + '" href="' + t.href + '">' + t.label + "</a>";
    });
    html +=
      "</div>" +
      '<div class="ess-ship-top-right">' +
      '<input class="ess-ship-search" type="search" placeholder="菜单搜索" readonly />' +
      '<span class="ess-ship-user">评审账号</span>' +
      "</div>";
    top.innerHTML = html;
  }

  function scrollBox() {
    return (
      document.querySelector(".ess-ship-page > .main") ||
      document.querySelector(".ess-ship-page > .hub") ||
      document.querySelector(".ess-ship-page > .page") ||
      document.querySelector(".ess-ship-page") ||
      null
    );
  }

  function scrollToHash() {
    var id = (location.hash || "").replace(/^#/, "");
    if (!id) return;
    var el = document.getElementById(id);
    if (!el) return;
    var box = scrollBox();
    if (box && box.contains(el)) {
      var top = el.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 12;
      box.scrollTop = top < 0 ? 0 : top;
    } else {
      el.scrollIntoView({ block: "start", behavior: "auto" });
    }
  }

  function bindHashNav() {
    if (document.documentElement.__essHashBound) return;
    document.documentElement.__essHashBound = true;
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a[href^='#']");
      if (!a) return;
      var href = a.getAttribute("href") || "";
      if (!href || href === "#") return;
      var id = href.slice(1);
      if (!document.getElementById(id)) return;
      e.preventDefault();
      if (history.pushState) history.pushState(null, "", href);
      else location.hash = href;
      scrollToHash();
    });
    window.addEventListener("hashchange", scrollToHash);
  }

  function render(activeId) {
    var item = findItem(activeId);
    var activeParent = (item && item.parent) || "prod";
    ensureShell();
    renderRail(activeParent);
    renderChildren(activeParent, activeId);
    renderTop(activeId);
    bindHashNav();

    var rail = document.getElementById("essShipRail");
    if (rail && !rail.__bound) {
      rail.__bound = true;
      rail.addEventListener("click", function (e) {
        var btn = e.target.closest("[data-parent]");
        if (!btn) return;
        var pid = btn.getAttribute("data-parent");
        renderRail(pid);
        renderChildren(pid, activeId);
      });
    }

    document.body.classList.add("ess-ship-ready");
    setTimeout(scrollToHash, 0);
  }

  global.renderShipReviewNav = render;
})(window);
