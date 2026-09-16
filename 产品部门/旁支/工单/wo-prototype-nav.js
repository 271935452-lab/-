/**
 * 工单模块原型侧栏：自动注入到 旁支/工单/ 下各 HTML 页。
 * 返回旁支计划二：左下角浮钮由 ../../ess-branch-back.js 注入；侧栏「返回」组同步入口。
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
        { file: "工单工作台-MVP.html", label: "履约工作台" },
        { file: "一期基础履约统计-MVP.html", label: "一期基础履约统计" },
        { file: "新建工单-MVP.html", label: "新建统一工单" },
        { file: "工单详情-MVP.html", label: "工单详情" },
      ],
    },
    {
      label: "可选登记",
      links: [
        { file: "登记-快递异常件-MVP.html", label: "快递异常件（可选）" },
      ],
    },
    {
      label: "配置与主数据",
      links: [
        { file: "SLA数据维护-MVP.html", label: "工单配置中心 · 场景配置" },
        { file: "状态流模板配置-MVP.html", label: "状态流模板 · 画布" },
        { file: "状态流模板配置-V2.html", label: "状态流模板 · 功能流转" },
        { file: "编辑角色-腾信布局融合-MVP.html", label: "编辑角色 · 腾信布局融合" },
        { file: "分派规则-工单池路由-MVP.html", label: "分派规则（客户优先）" },
        { file: "交接催办升级-MVP.html", label: "交接 · 催办 · 升级" },
        { file: "编辑角色-岗位与数据权限-MVP.html", label: "编辑角色 · 岗位与数据权限" },
      ],
    },
    {
      label: "返回",
      links: [
        { file: "../计划二/05-工单/模块导航.html", label: "← 计划二 · 工单模块入口" },
        { file: "../计划二/旁支计划二-模块导航.html", label: "← 计划二 · 五大模块导航" },
        { file: "../../产品部门-导航.html#s-branch-connect", label: "← 旁支计划二导航" },
        { file: "../../产品部门-旁支计划二-PRD.html", label: "旁支计划二总册" },
        { file: "../计划二/05-工单/工单系统-旁支计划二-PRD.html", label: "工单 · 计划二分册" },
        { file: "../../产品部门-导航.html#s-branch", label: "旁支总览" },
        { file: "../../../index.html", label: "项目导航首页" },
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
    aside.className = "wo-nav-sidenav";
    aside.setAttribute("aria-label", "工单模块 · 原型导航");

    var brand = document.createElement("div");
    brand.className = "wo-nav-brand";
    brand.innerHTML =
      "<h1>工单模块</h1>" +
      "<p>登记台保留；要人办进<strong>统一工单</strong>。<code style=\"font-size:11px\">旁支/工单/</code></p>";
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
        var base = (item.file.split("#")[0].split("?")[0].split("/").pop()) || "";
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
        // 左下角返回浮钮保持在 body 根上，不被壳层吃掉
        if (node.classList && node.classList.contains("ess-branch-back-wrap")) return;
        if (node.id === "essPlan2Back") return;
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
