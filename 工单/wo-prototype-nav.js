/**
 * 工单模块原型侧栏：自动注入到 工单/ 下各 HTML 页（导航页自身亦使用同一配置）。
 */
(function () {
  if (window.__WO_PROTOTYPE_NAV__) return;
  window.__WO_PROTOTYPE_NAV__ = true;

  var GROUPS = [
    {
      label: "主链路",
      links: [
        { file: "原型导航-工单模块.html", label: "本导航页" },
        { file: "工单提交-入口-MVP.html", label: "工单提交 · 分类入口" },
        { file: "工单场景流程-MVP.html", label: "工单场景流程图" },
        { file: "工单工作台-MVP.html", label: "工单工作台" },
        { file: "新建工单-MVP.html", label: "新建工单" },
        { file: "工单详情-MVP.html", label: "工单详情" },
      ],
    },
    {
      label: "配置与主数据",
      links: [
        { file: "SLA数据维护-MVP.html", label: "场景配置维护（SLA · 业务联动）" },
        { file: "编辑角色-腾信布局融合-MVP.html", label: "编辑角色 · 腾信布局融合" },
        { file: "分派规则-工单池路由-MVP.html", label: "分派规则（工单池路由）" },
        { file: "编辑角色-岗位与数据权限-MVP.html", label: "编辑角色 · 岗位与数据权限" },
      ],
    },
    {
      label: "返回",
      links: [
        { file: "../index.html", label: "项目导航首页" },
        { file: "../原型导航-一期二期全量.html", label: "提成管理 · 全量菜单" },
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

  function esc(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/"/g, "&quot;");
  }

  function buildAside(active) {
    var aside = document.createElement("aside");
    aside.className = "wo-nav-sidenav";
    aside.setAttribute("aria-label", "工单模块 · 原型导航");

    var brand = document.createElement("div");
    brand.className = "wo-nav-brand";
    brand.innerHTML =
      "<h1>工单模块</h1>" +
      "<p>与<strong>提成管理</strong>分离；页面均在 <code style=\"font-size:11px\">工单/</code>。港前 · 港后 · 尾端 · 配置。</p>";
    aside.appendChild(brand);

    var scroll = document.createElement("nav");
    scroll.className = "wo-nav-scroll";

    var phase = document.createElement("div");
    phase.className = "wo-nav-phase";
    phase.textContent = "页面";
    scroll.appendChild(phase);

    GROUPS.forEach(function (g) {
      var gl = document.createElement("div");
      gl.className = "wo-nav-group-label";
      gl.textContent = g.label;
      scroll.appendChild(gl);
      g.links.forEach(function (item) {
        var a = document.createElement("a");
        a.className = "wo-nav-link";
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
    if (document.body && document.body.getAttribute("data-wo-nav") === "off") return;

    var active = currentFile();
    var legacyAside = document.querySelector(".nav-sidenav");
    if (legacyAside && legacyAside.closest(".app-shell")) {
      legacyAside.replaceWith(buildAside(active));
      return;
    }
    if (document.querySelector(".wo-nav-sidenav")) return;

    var shell = document.createElement("div");
    shell.className = "wo-app-shell";
    var mainWrap = document.createElement("div");
    mainWrap.className = "wo-main-wrap";
    var aside = buildAside(active);

    Array.prototype.slice.call(document.body.childNodes).forEach(function (node) {
      if (node.nodeType === 1) {
        var tag = node.tagName;
        if (tag === "SCRIPT" && /wo-prototype-nav\.js/i.test(node.getAttribute("src") || "")) return;
        if (tag === "LINK" && /wo-prototype-nav\.css/i.test(node.getAttribute("href") || "")) return;
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
