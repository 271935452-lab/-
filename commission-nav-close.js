/**
 * 提成管理 HTML 原型：统一「关闭 / 返回上一步」行为。
 * 优先：window.opener 则尝试关闭弹窗；否则若存在同源 referrer 或 history.length>1 则 history.back()；
 * 否则跳转到《提成试算表》内「试算步骤矩阵（开发参考）」锚点。
 *
 * 用法：
 * 1) 在页面引入（根目录页面）：<script src="commission-nav-close.js"></script>
 *    二期子目录：<script src="../commission-nav-close.js"></script>
 * 2) 任意元素加 data-commission-leave：点击时触发（自动 preventDefault）
 * 3) 脚本内直接调用：commissionBackOrLog()
 * 4) 自动为 .sidenav-link 标记当前页 .active（按文件名 + 可选 URL hash；可再调 window.commissionSidenavMarkActive()）
 */
(function () {
  function trialLogHref() {
    var href = String(window.location.href || "").replace(/\\/g, "/");
    var anchor = "#dev-trial-log-matrix";
    if (/\/二期\//.test(href) || href.indexOf("/二期/") !== -1) {
      return "../提成试算表-直客与同行-MVP.html" + anchor;
    }
    return "提成试算表-直客与同行-MVP.html" + anchor;
  }

  function commissionBackOrLog() {
    if (window.opener) {
      try {
        window.close();
        return;
      } catch (e) {}
    }
    var ref = document.referrer || "";
    try {
      if (ref && new URL(ref).origin === window.location.origin) {
        window.history.back();
        return;
      }
    } catch (e2) {}
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    window.location.href = trialLogHref();
  }

  window.commissionTrialLogHref = trialLogHref;
  window.commissionBackOrLog = commissionBackOrLog;

  document.addEventListener(
    "click",
    function (e) {
      var t = e.target && e.target.closest ? e.target.closest("[data-commission-leave]") : null;
      if (!t) return;
      e.preventDefault();
      commissionBackOrLog();
    },
    false
  );
})();

/**
 * 左侧 .sidenav-link 当前页高亮：按「同文件名 + 可选 hash」匹配，
 * 避免「试算步骤矩阵（开发）」与「提成试算表」同页不同锚点时高亮错乱。
 */
(function () {
  function currentHtmlBasename() {
    var path = (location.pathname || "").replace(/\\/g, "/");
    var file = path.split("/").pop() || "";
    if (file && /\.html$/i.test(file)) return file;
    var m = /[/\\]([^/?#]+\.html)/i.exec(location.href || "");
    return m ? m[1] : "";
  }

  function commissionSidenavMarkActive() {
    var lower = (currentHtmlBasename() || "").toLowerCase();
    var hash = (location.hash || "").toLowerCase();
    document.querySelectorAll(".sidenav-link").forEach(function (a) {
      a.classList.remove("active");
    });
    if (!lower) return;
    document.querySelectorAll(".sidenav-link").forEach(function (a) {
      var raw = (a.getAttribute("href") || "").trim();
      if (!raw || raw.charAt(0) === "#" || /^javascript:/i.test(raw)) return;
      var noQuery = raw.split("?")[0];
      var hashIdx = noQuery.indexOf("#");
      var linkPath = hashIdx >= 0 ? noQuery.slice(0, hashIdx) : noQuery;
      var linkHash = hashIdx >= 0 ? noQuery.slice(hashIdx).toLowerCase() : "";
      var linkFile = (linkPath.split("/").pop() || "").toLowerCase();
      if (!linkFile || linkFile !== lower) return;
      if (linkHash) {
        if (hash === linkHash) a.classList.add("active");
      } else {
        if (!hash) a.classList.add("active");
      }
    });
  }

  window.commissionSidenavMarkActive = commissionSidenavMarkActive;

  function run() {
    commissionSidenavMarkActive();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, false);
  } else {
    run();
  }
  window.addEventListener("hashchange", commissionSidenavMarkActive, false);
})();
