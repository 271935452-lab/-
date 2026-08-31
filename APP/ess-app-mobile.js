/**
 * ESS 询价 · APP 原型页移动端壳层：手机外框预览 + 真机全屏 + 底部原型导航。
 */
(function () {
  if (window.__ESS_APP_MOBILE__) return;
  window.__ESS_APP_MOBILE__ = true;

  var LCL_EDIT = "ESS询价编辑-APP-散货-MVP.html";

  function isInQuoteGroup() {
    var path = (location.pathname || location.href || "").replace(/\\/g, "/");
    try { path = decodeURIComponent(path); } catch (_) {}
    return /\/报价组\//.test(path);
  }

  function resolveAppPage(key) {
    var inQg = isInQuoteGroup();
    switch (key) {
      case "list":
        return inQg ? "../../APP/ESS询价报价-APP-列表-MVP.html" : "ESS询价报价-APP-列表-MVP.html";
      case "lcl":
        return inQg ? LCL_EDIT + "#lcl" : "../产品部门/报价组/" + LCL_EDIT + "#lcl";
      case "fcl":
        return inQg ? "../../APP/ESS询价编辑-APP-整柜-MVP.html" : "ESS询价编辑-APP-整柜-MVP.html";
      case "lclDetail":
        return inQg ? "../../APP/ESS散货询价详情-APP-MVP.html" : "ESS散货询价详情-APP-MVP.html";
      case "fclDetail":
        return inQg ? "../../APP/ESS整柜询价详情-APP-MVP.html" : "ESS整柜询价详情-APP-MVP.html";
      case "compare":
        return inQg ? "../../APP/ESS询价-APP与Web对照.html" : "ESS询价-APP与Web对照.html";
      default:
        return key;
    }
  }

  function getAppLinks() {
    return [
      { key: "list", label: "列表" },
      { key: "lcl", label: "散货编辑" },
      { key: "lclDetail", label: "散货详情" },
      { key: "fcl", label: "整柜编辑" },
      { key: "fclDetail", label: "整柜详情" },
      { key: "compare", label: "Web对照" }
    ].map(function (item) {
      return { key: item.key, label: item.label, file: resolveAppPage(item.key) };
    });
  }

  function currentFile() {
    var href = location.href.split("#")[0].split("?")[0];
    var parts = href.replace(/\\/g, "/").split("/");
    try {
      return decodeURIComponent(parts[parts.length - 1] || "");
    } catch (_) {
      return parts[parts.length - 1] || "";
    }
  }

  function linkIsActive(key, active) {
    var base = active.split("#")[0];
    if (key === "lcl") return base === LCL_EDIT;
    if (key === "lclDetail") return base === "ESS散货询价详情-APP-MVP.html";
    if (key === "fcl") return base === "ESS询价编辑-APP-整柜-MVP.html";
    if (key === "fclDetail") return base === "ESS整柜询价详情-APP-MVP.html";
    if (key === "list") return base === "ESS询价报价-APP-列表-MVP.html";
    if (key === "compare") return base === "ESS询价-APP与Web对照.html";
    return false;
  }

  function isAppPage() {
    if (document.documentElement.getAttribute("data-ess-app") === "mobile") return true;
    return /-APP-/i.test(currentFile());
  }

  function shouldSkipNode(node) {
    if (node.nodeType !== 1) return false;
    var tag = node.tagName;
    if (tag === "SCRIPT") return true;
    if (tag === "LINK") {
      var href = node.getAttribute("href") || "";
      if (/ess-prototype-nav\.css/i.test(href)) return true;
    }
    if (!node.classList) return false;
    if (node.classList.contains("ess-app-viewport")) return true;
    if (node.classList.contains("ess-app-proto-dock")) return true;
    if (node.classList.contains("ess-prd-side")) return true;
    if (node.classList.contains("ess-prd-backdrop")) return true;
    if (node.classList.contains("ess-prd-fab")) return true;
    if (node.classList.contains("ess-prd-source")) return true;
    return false;
  }

  function buildProtoDock(active) {
    var dock = document.createElement("nav");
    dock.className = "ess-app-proto-dock";
    dock.setAttribute("aria-label", "APP 原型页切换");
    getAppLinks().forEach(function (item) {
      var a = document.createElement("a");
      a.href = item.file;
      a.textContent = item.label;
      if (linkIsActive(item.key, active)) {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
      }
      dock.appendChild(a);
    });
    return dock;
  }

  function mountShell() {
    if (!isAppPage()) return;
    if (document.querySelector(".ess-app-viewport")) return;

    document.documentElement.setAttribute("data-ess-app", "mobile");
    document.documentElement.classList.add("ess-app-root");
    document.body.classList.add("ess-app-body", "ess-app-has-dock");
    document.body.setAttribute("data-ess-nav", "off");

    var viewport = document.createElement("div");
    viewport.className = "ess-app-viewport";

    var statusbar = document.createElement("div");
    statusbar.className = "ess-app-statusbar";
    statusbar.innerHTML =
      '<span class="time">9:41</span>' +
      '<span class="title">ESS 询价 · APP</span>' +
      '<span class="icons">●●●</span>';

    var scroll = document.createElement("div");
    scroll.className = "ess-app-scroll";

    var home = document.createElement("div");
    home.className = "ess-app-home-indicator";

    var nodes = [];
    Array.prototype.slice.call(document.body.childNodes).forEach(function (node) {
      if (node.nodeType === 3 && !String(node.textContent || "").trim()) return;
      if (shouldSkipNode(node)) return;
      nodes.push(node);
    });

    viewport.appendChild(statusbar);
    viewport.appendChild(scroll);
    viewport.appendChild(home);
    document.body.insertBefore(viewport, document.body.firstChild);

    nodes.forEach(function (node) {
      scroll.appendChild(node);
    });

    var footer = scroll.querySelector(":scope > .footer-bar, :scope > footer.footer-bar");
    if (footer) {
      scroll.removeChild(footer);
      footer.classList.add("ess-app-footer-pin");
      viewport.classList.add("ess-app-has-footer");
      viewport.insertBefore(footer, home);
    }

    document.body.appendChild(buildProtoDock(currentFile()));
    window.dispatchEvent(new CustomEvent("ess-app-shell-ready"));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountShell);
  } else {
    mountShell();
  }
})();
