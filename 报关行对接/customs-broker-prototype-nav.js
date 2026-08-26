/**
 * 报关行对接模块原型侧栏：自动注入到 报关行对接/ 下各 HTML 页。
 */
(function () {
  if (window.__CB_PROTOTYPE_NAV__) return;
  window.__CB_PROTOTYPE_NAV__ = true;

  var GROUPS = [
    {
      label: "导航",
      links: [{ file: "../index.html", label: "项目导航首页" }],
    },
    {
      label: "报关管理",
      links: [
        { file: "报关管理-列表-MVP.html", label: "报关执行列表（已排柜）" },
        { file: "报关管理-列表-MVP.html?tab=unbound", label: "未绑分单号" },
        { file: "报关管理-列表-MVP.html?tab=push", label: "分单号规则（待推送）" },
        { file: "分单号规则配置-MVP.html", label: "分单号规则配置" },
        { file: "报关管理-做资料分票核准-MVP.html", label: "做资料分票核准（买单·双通道）" },
        { file: "报关管理-供应商上传审核-MVP.html", label: "供应商上传审核" },
      ],
    },
    {
      label: "报关行链接协作",
      links: [
        { file: "报关供应商-上传任务列表-MVP.html?token=ws-demo-qdgx-7d&scope=workspace", label: "待办任务（工作台链接）" },
        { file: "报关供应商-资料上传-MVP.html?token=tk-1-material&scope=task&task=material&taskId=1", label: "资料上传（任务链接）" },
        { file: "报关供应商-链接失效-MVP.html", label: "链接失效（示意）" },
      ],
    },
    {
      label: "预录审核",
      links: [
        { file: "报关管理-预录单审核详情-MVP.html", label: "预录单结构化 + 沟通" },
        { file: "报关管理-预录审核详情-兼容-MVP.html", label: "提单详情（含清报关）" },
        { file: "../产品部门/关务组/关务组-签入即预报资料-MVP.html", label: "预录工作台" },
        { file: "../产品部门/关务组/关务组-导航.html", label: "关务组导航" },
      ],
    },
    {
      label: "配置",
      links: [
        { file: "报关行API配置-MVP.html", label: "报关行 API 配置" },
        { file: "服务商模版匹配-系统模版-MVP.html", label: "服务商模版 ↔ 系统模版匹配" },
      ],
    },
    {
      label: "参考文档",
      links: [
        { file: "报关管理-流程图-MVP.html", label: "业务流程图" },
        { file: "接收预录单和沟通API.markdown", label: "接收预录单和沟通 API" },
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

  function shouldSkipNav() {
    if (document.body && document.body.getAttribute("data-cb-nav") === "off") return true;
    if (new URLSearchParams(location.search).get("embed") === "1") return true;
    try {
      if (window.self !== window.top) return true;
    } catch (_) {
      return true;
    }
    return false;
  }

  function isLinkActive(itemFile) {
    var cur = currentFile();
    var base = itemFile.split("/").pop().split("?")[0].split("#")[0];
    return base === cur;
  }

  function buildAside() {
    var aside = document.createElement("aside");
    aside.className = "cb-nav-sidenav";
    aside.setAttribute("aria-label", "报关行对接 · 原型导航");

    var brand = document.createElement("div");
    brand.className = "cb-nav-brand";
    brand.innerHTML =
      "<h1>报关行对接</h1>" +
      "<p>多报关行 API 对接 · 报关管理列表、预录审核与 API 配置原型页。</p>";
    aside.appendChild(brand);

    var scroll = document.createElement("nav");
    scroll.className = "cb-nav-scroll";

    var phase = document.createElement("div");
    phase.className = "cb-nav-phase";
    phase.textContent = "页面菜单";
    scroll.appendChild(phase);

    GROUPS.forEach(function (g) {
      var gl = document.createElement("div");
      gl.className = "cb-nav-group-label";
      gl.textContent = g.label;
      scroll.appendChild(gl);
      g.links.forEach(function (item) {
        var a = document.createElement("a");
        a.className = "cb-nav-link";
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

  function mount() {
    if (shouldSkipNav()) return;
    if (document.querySelector(".cb-nav-sidenav")) return;

    var shell = document.createElement("div");
    shell.className = "cb-app-shell";
    var mainWrap = document.createElement("div");
    mainWrap.className = "cb-main-wrap";
    var aside = buildAside();

    Array.prototype.slice.call(document.body.childNodes).forEach(function (node) {
      if (node.nodeType === 1) {
        var tag = node.tagName;
        if (tag === "SCRIPT" && /customs-broker-prototype-nav\.js/i.test(node.getAttribute("src") || "")) {
          return;
        }
        if (tag === "LINK" && /customs-broker-prototype-nav\.css/i.test(node.getAttribute("href") || "")) {
          return;
        }
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
