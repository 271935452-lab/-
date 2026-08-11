/**
 * 仓库 PDA · 原型页底栏导航（工作台各子页共用）
 */
(function () {
  if (window.__WH_PDA_NAV__) return;
  window.__WH_PDA_NAV__ = true;

  var HOME = "仓库PDA-首页-MVP.html";
  var NAV = "仓库作业-导航-MVP.html";

  var PAGES = [
    { file: HOME, label: "首页" },
    { file: "签入上托-托上件数-MVP.html", label: "签入上托" },
    { file: "下托-件数核对-MVP.html", label: "下托" },
    { file: "正常上托-件数核对-MVP.html", label: "正常上托" },
    { file: "换托-件数核对-MVP.html", label: "换托" },
    { file: "找货核对扫描-件数核对-MVP.html", label: "找货扫描" },
    { file: "装柜扫描-件数核对-MVP.html", label: "装柜扫描" },
    { file: NAV, label: "流程说明" }
  ];

  function currentFile() {
    var parts = location.pathname.replace(/\\/g, "/").split("/");
    try {
      return decodeURIComponent(parts[parts.length - 1] || "");
    } catch (_) {
      return parts[parts.length - 1] || "";
    }
  }

  function mountDock() {
    if (document.querySelector(".proto-dock")) return;
    var active = currentFile();
    var dock = document.createElement("nav");
    dock.className = "proto-dock";
    dock.setAttribute("aria-label", "仓库 PDA 原型导航");
    PAGES.forEach(function (p) {
      var a = document.createElement("a");
      a.href = p.file;
      a.textContent = p.label;
      if (p.file === active || (p.file === HOME && active === "仓库作业-导航-MVP.html")) {
        a.classList.add("is-active");
      }
      dock.appendChild(a);
    });
    document.body.classList.add("has-proto-dock");
    document.body.appendChild(dock);
  }

  function bindPhoneTabbar() {
    document.querySelectorAll(".pda-tab[data-href]").forEach(function (tab) {
      tab.addEventListener("click", function () {
        var href = tab.getAttribute("data-href");
        if (href) location.href = href;
      });
    });
  }

  function toast(msg) {
    if (window.WH_PDA && WH_PDA.toast) WH_PDA.toast(msg);
    else alert(msg);
  }

  document.querySelectorAll("[data-wh-pda-stub]").forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
      toast("【MVP演示】" + (el.getAttribute("data-wh-pda-stub") || "功能") + " · 原型未实现");
    });
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      mountDock();
      bindPhoneTabbar();
    });
  } else {
    mountDock();
    bindPhoneTabbar();
  }

  window.WH_PDA_NAV = { home: HOME, nav: NAV };
})();
