/**
 * ESS 询价 · APP 原型页移动端壳层：手机外框预览 + 真机全屏 + 底部原型导航。
 */
(function () {
  if (window.__ESS_APP_MOBILE__) return;
  window.__ESS_APP_MOBILE__ = true;

  var APP_LINKS = [
    { file: "ESS询价报价-APP-列表-MVP.html", label: "列表" },
    { file: "ESS询价编辑-APP-整柜-MVP.html", label: "整柜编辑" },
    { file: "ESS整柜询价详情-APP-MVP.html", label: "整柜详情" },
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
    if (node.classList && node.classList.contains("ess-app-viewport")) return true;
    if (node.classList && node.classList.contains("ess-app-proto-dock")) return true;
    return false;
  }

  function buildProtoDock(active) {
    var dock = document.createElement("nav");
    dock.className = "ess-app-proto-dock";
    dock.setAttribute("aria-label", "APP 原型页切换");
    APP_LINKS.forEach(function (item) {
      var a = document.createElement("a");
      a.href = item.file;
      a.textContent = item.label;
      if (item.file === active || item.file.split("/").pop() === active) {
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

    nodes.forEach(function (node) {
      scroll.appendChild(node);
    });

    var footer = scroll.querySelector(":scope > .footer-bar, :scope > footer.footer-bar");
    if (footer) {
      scroll.removeChild(footer);
      footer.classList.add("ess-app-footer-pin");
      viewport.classList.add("ess-app-has-footer");
    }

    viewport.appendChild(statusbar);
    viewport.appendChild(scroll);
    if (footer) viewport.appendChild(footer);
    viewport.appendChild(home);
    document.body.insertBefore(viewport, document.body.firstChild);
    document.body.appendChild(buildProtoDock(currentFile()));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountShell);
  } else {
    mountShell();
  }
})();
