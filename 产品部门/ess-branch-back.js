/**
 * 旁支原型页：固定「← 旁支导航」回到 产品部门-导航.html#s-branch。
 */
(function () {
  if (window.__ESS_BRANCH_BACK__) return;
  window.__ESS_BRANCH_BACK__ = true;

  function pathParts() {
    var path = location.pathname || "";
    try {
      path = decodeURIComponent(path);
    } catch (_) {}
    return path.replace(/\\/g, "/").split("/").filter(Boolean);
  }

  function branchNavHref() {
    var parts = pathParts();
    if (parts.length) parts.pop();
    var idx = -1;
    for (var i = 0; i < parts.length; i++) {
      if (parts[i] === "产品部门") {
        idx = i;
        break;
      }
    }
    var rel = "";
    var j;
    if (idx >= 0) {
      for (j = 0; j < parts.length - idx - 1; j++) rel += "../";
      return rel + "产品部门-导航.html#s-branch";
    }
    for (j = 0; j < parts.length; j++) rel += "../";
    return rel + "产品部门/产品部门-导航.html#s-branch";
  }

  function injectStyle() {
    if (document.getElementById("ess-branch-back-style")) return;
    var css = document.createElement("style");
    css.id = "ess-branch-back-style";
    css.textContent =
      ".ess-branch-back{position:fixed;left:12px;bottom:12px;z-index:1180;" +
      "display:inline-flex;align-items:center;gap:4px;padding:8px 14px;" +
      "border-radius:999px;background:#1d4ed8;color:#fff!important;" +
      "font:600 13px/1.3 Microsoft YaHei,PingFang SC,sans-serif;" +
      "text-decoration:none!important;box-shadow:0 2px 10px rgba(29,78,216,.35);" +
      "border:1px solid #1e40af}" +
      ".ess-branch-back:hover{background:#1e40af}" +
      "body[data-ess-app=mobile] .ess-branch-back{left:16px;bottom:auto;top:16px}";
    document.head.appendChild(css);
  }

  function mount() {
    if (document.querySelector("a.ess-branch-back")) return;
    if (document.querySelector(".wo-nav-sidenav")) return;
    injectStyle();
    var a = document.createElement("a");
    a.className = "ess-branch-back";
    a.href = branchNavHref();
    a.textContent = "← 旁支导航";
    a.setAttribute("title", "返回产品部门旁支导航");
    document.body.appendChild(a);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
