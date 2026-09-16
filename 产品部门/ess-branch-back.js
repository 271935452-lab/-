/**
 * 旁支原型页返回入口：
 * - 旁支计划二页 → 产品部门-导航.html#s-branch-connect（+ 总册）
 * - 其他旁支页 → 产品部门-导航.html#s-branch
 */
(function () {
  if (window.__ESS_BRANCH_BACK__) return;
  window.__ESS_BRANCH_BACK__ = true;

  var PLAN2_PAGES = {
    "业务数据统计-尾端派送费-MVP.html": 1,
    "整柜下单-订单录入-MVP.html": 1,
    "传统订单管理-MVP.html": 1,
    "仓位管理-订舱完善提单-整合-MVP.html": 1,
    "客户管理-编辑-权限配置-MVP.html": 1,
    "整柜客户岗位绑定-MVP.html": 1,
    "员工管理-整柜岗位与客户默认-MVP.html": 1,
    "报关管理-列表-MVP.html": 1,
    "海外对接组-0804-港前港后整柜价格-大致方案.html": 1,
    "海外对接组-主单跟进-MVP.html": 1,
    "海外对接组-卡派跟进新-MVP.html": 1,
    "旁支计划二-外部对接-PRD.html": 1,
    "旁支计划二-模块导航.html": 1,
    "模块导航.html": 1,
    "整柜增强-旁支计划二-PRD.html": 1,
    "新建工单-MVP.html": 1,
    "工单提交-入口-MVP.html": 1,
    "登记-海外跟进-MVP.html": 1,
    "登记-海外改派重出-MVP.html": 1,
    "工单详情-MVP.html": 1,
    "登记-快递异常件-MVP.html": 1,
    "SLA数据维护-MVP.html": 1,
    "工单工作台-MVP.html": 1,
    "原型导航-工单模块.html": 1,
    "海外异常统一工单-流程与页面原型.html": 1,
    "工单系统-旁支计划二-PRD.html": 1,
    "工单场景流程-MVP.html": 1,
    "产品部门-旁支计划二-PRD.html": 1
  };

  function pathParts() {
    var path = location.pathname || "";
    try {
      path = decodeURIComponent(path);
    } catch (_) {}
    return path.replace(/\\/g, "/").split("/").filter(Boolean);
  }

  function pageName() {
    var parts = pathParts();
    return parts.length ? parts[parts.length - 1] : "";
  }

  function plan2Query() {
    try {
      return new URLSearchParams(location.search).get("plan2");
    } catch (e) {
      return null;
    }
  }

  function isPlan2() {
    if (plan2Query()) return true;
    if (PLAN2_PAGES[pageName()]) return true;
    var parts = pathParts();
    var joined = "/" + parts.join("/") + "/";
    if (/\/产品部门\/旁支\/工单\//.test(joined)) return true;
    if (/\/产品部门\/旁支\/计划二\//.test(joined)) return true;
    if (/\/产品部门\/旁支\//.test(joined) && /旁支计划二|信号旗|DrayEasy|17TRACK/i.test(pageName())) return true;
    return false;
  }

  function hrefUnderProduct(fileAndHash) {
    var parts = pathParts();
    if (parts.length) parts.pop();
    var idx = -1;
    var i;
    for (i = 0; i < parts.length; i++) {
      if (parts[i] === "产品部门") {
        idx = i;
        break;
      }
    }
    var rel = "";
    var j;
    if (idx >= 0) {
      for (j = 0; j < parts.length - idx - 1; j++) rel += "../";
      return rel + fileAndHash;
    }
    for (j = 0; j < parts.length; j++) rel += "../";
    return rel + "产品部门/" + fileAndHash;
  }

  function injectStyle() {
    if (document.getElementById("ess-branch-back-style")) return;
    var css = document.createElement("style");
    css.id = "ess-branch-back-style";
    css.textContent =
      ".ess-branch-back-wrap{position:fixed;left:12px;bottom:12px;z-index:1180;" +
      "display:flex;flex-wrap:wrap;align-items:center;gap:8px;" +
      "font:600 13px/1.3 Microsoft YaHei,PingFang SC,sans-serif}" +
      ".ess-branch-back{display:inline-flex;align-items:center;gap:4px;padding:8px 14px;" +
      "border-radius:999px;background:#1d4ed8;color:#fff!important;" +
      "text-decoration:none!important;box-shadow:0 2px 10px rgba(29,78,216,.35);" +
      "border:1px solid #1e40af}" +
      ".ess-branch-back:hover{background:#1e40af}" +
      ".ess-branch-back.is-plan2{background:#0f766e;border-color:#0d9488;" +
      "box-shadow:0 2px 10px rgba(15,118,110,.35)}" +
      ".ess-branch-back.is-plan2:hover{background:#0d9488}" +
      ".ess-branch-back-sub{display:inline-flex;align-items:center;padding:6px 12px;" +
      "border-radius:999px;background:#fff;color:#0f766e!important;font-weight:600;" +
      "text-decoration:none!important;border:1px solid #99f6e4;" +
      "box-shadow:0 2px 8px rgba(15,23,42,.08)}" +
      ".ess-branch-back-sub:hover{background:#f0fdfa}" +
      "body[data-ess-app=mobile] .ess-branch-back-wrap{left:16px;bottom:auto;top:16px}";
    document.head.appendChild(css);
  }

  function mount() {
    if (document.querySelector(".ess-branch-back-wrap") || document.querySelector("a.ess-branch-back")) return;
    if (document.documentElement.classList.contains("ess-prd-embed")) return;
    // 总册 / 分册自身已有返回链，不再叠浮钮
    if (pageName() === "产品部门-旁支计划二-PRD.html") return;
    if (pageName() === "工单系统-旁支计划二-PRD.html") return;
    if (pageName() === "旁支计划二-模块导航.html") return;
    if (pageName() === "模块导航.html" && /\/计划二\//.test("/" + pathParts().join("/") + "/")) return;

    injectStyle();
    var wrap = document.createElement("div");
    wrap.className = "ess-branch-back-wrap";
    wrap.setAttribute("role", "navigation");

    var a = document.createElement("a");
    a.className = "ess-branch-back";
    if (isPlan2()) {
      a.classList.add("is-plan2");
      a.href = hrefUnderProduct("产品部门-导航.html#s-branch-connect");
      a.textContent = "← 旁支计划二导航";
      a.setAttribute("title", "返回产品部门 · 计划二入口");
      wrap.setAttribute("aria-label", "旁支计划二导航");
      var book = document.createElement("a");
      book.className = "ess-branch-back-sub";
      book.href = hrefUnderProduct("产品部门-旁支计划二-PRD.html");
      book.textContent = "计划二总册";
      wrap.appendChild(a);
      wrap.appendChild(book);
    } else {
      a.href = hrefUnderProduct("产品部门-导航.html#s-branch");
      a.textContent = "← 旁支导航";
      a.setAttribute("title", "返回产品部门旁支导航");
      wrap.setAttribute("aria-label", "旁支导航");
      wrap.appendChild(a);
    }
    document.body.appendChild(wrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
