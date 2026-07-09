/**
 * 整柜核心三页共用：模块跳转、Toast、确认弹窗、列表行交互、筛选演示。
 */
(function () {
  if (window.__FCL_CORE__) return;
  window.__FCL_CORE__ = true;

  var PAGES = {
    traditional: { file: "传统订单管理-MVP.html", label: "传统订单列表" },
    order: { file: "整柜下单-订单录入-MVP.html", label: "整柜下单" },
    booking: { file: "仓位管理-订舱完善提单-整合-MVP.html", label: "仓位管理" },
  };

  function injectStyles() {
    if (document.getElementById("fcl-core-styles")) return;
    var style = document.createElement("style");
    style.id = "fcl-core-styles";
    style.textContent =
      ".fcl-module-tabs{display:flex;align-items:stretch;background:#fff;border-bottom:1px solid #e8e8e8;padding:0 12px;gap:2px;flex-shrink:0}" +
      ".fcl-module-tabs a{display:flex;align-items:center;padding:0 16px;height:36px;font-size:13px;color:rgba(0,0,0,.65);text-decoration:none;border-bottom:2px solid transparent;margin-bottom:-1px;white-space:nowrap}" +
      ".fcl-module-tabs a:hover{color:#1890ff}" +
      ".fcl-module-tabs a.is-active{color:#1890ff;border-bottom-color:#1890ff;font-weight:600}" +
      ".fcl-toast-host{position:fixed;top:16px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;gap:8px;pointer-events:none}" +
      ".fcl-toast{padding:10px 16px;border-radius:4px;background:#fff;box-shadow:0 4px 16px rgba(0,0,0,.15);font-size:13px;color:rgba(0,0,0,.85);border:1px solid #e8e8e8;animation:fclToastIn .25s ease}" +
      ".fcl-toast.ok{border-color:#b7eb8f;background:#f6ffed;color:#389e0d}" +
      ".fcl-toast.warn{border-color:#ffe58f;background:#fffbe6;color:#ad6800}" +
      "@keyframes fclToastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}" +
      ".fcl-dialog-mask{position:fixed;inset:0;background:rgba(0,0,0,.45);z-index:9900;display:none;align-items:center;justify-content:center;padding:16px}" +
      ".fcl-dialog-mask.open{display:flex}" +
      ".fcl-dialog{background:#fff;border-radius:4px;min-width:min(420px,92vw);max-width:520px;box-shadow:0 8px 24px rgba(0,0,0,.15)}" +
      ".fcl-dialog-hd{padding:14px 16px;border-bottom:1px solid #e8e8e8;font-size:15px;font-weight:600;display:flex;justify-content:space-between;align-items:center}" +
      ".fcl-dialog-bd{padding:14px 16px;font-size:13px;line-height:1.6;color:rgba(0,0,0,.85)}" +
      ".fcl-dialog-ft{padding:10px 16px;border-top:1px solid #e8e8e8;display:flex;justify-content:flex-end;gap:8px}" +
      ".fcl-dialog-ft .btn{height:32px;padding:0 14px;border:1px solid #d9d9d9;border-radius:2px;background:#fff;cursor:pointer;font-size:13px}" +
      ".fcl-dialog-ft .btn-primary{background:#1890ff;border-color:#1890ff;color:#fff}" +
      ".fcl-dialog-close{border:none;background:none;font-size:20px;color:rgba(0,0,0,.45);cursor:pointer;line-height:1;padding:0}";
    document.head.appendChild(style);
  }

  function toast(msg, type) {
    var host = document.querySelector(".fcl-toast-host");
    if (!host) {
      host = document.createElement("div");
      host.className = "fcl-toast-host";
      document.body.appendChild(host);
    }
    var el = document.createElement("div");
    el.className = "fcl-toast" + (type ? " " + type : "");
    el.textContent = msg;
    host.appendChild(el);
    setTimeout(function () {
      el.style.opacity = "0";
      el.style.transition = "opacity .2s";
      setTimeout(function () { el.remove(); }, 220);
    }, 2400);
  }

  function confirmDialog(title, message, onOk, okLabel) {
    var mask = document.createElement("div");
    mask.className = "fcl-dialog-mask open";
    mask.innerHTML =
      '<div class="fcl-dialog" role="dialog">' +
      '<div class="fcl-dialog-hd"><span>' + title + '</span><button type="button" class="fcl-dialog-close" aria-label="关闭">×</button></div>' +
      '<div class="fcl-dialog-bd">' + message + "</div>" +
      '<footer class="fcl-dialog-ft">' +
      '<button type="button" class="btn" data-act="cancel">取消</button>' +
      '<button type="button" class="btn btn-primary" data-act="ok">' + (okLabel || "确定") + "</button>" +
      "</footer></div>";
    document.body.appendChild(mask);
    function close() { mask.remove(); }
    mask.querySelector('[data-act="cancel"]').addEventListener("click", close);
    mask.querySelector(".fcl-dialog-close").addEventListener("click", close);
    mask.addEventListener("click", function (e) { if (e.target === mask) close(); });
    mask.querySelector('[data-act="ok"]').addEventListener("click", function () {
      close();
      if (onOk) onOk();
    });
  }

  function infoDialog(title, html) {
    var mask = document.createElement("div");
    mask.className = "fcl-dialog-mask open";
    mask.innerHTML =
      '<div class="fcl-dialog" role="dialog">' +
      '<div class="fcl-dialog-hd"><span>' + title + '</span><button type="button" class="fcl-dialog-close" aria-label="关闭">×</button></div>' +
      '<div class="fcl-dialog-bd">' + html + "</div>" +
      '<footer class="fcl-dialog-ft"><button type="button" class="btn btn-primary" data-act="ok">知道了</button></footer></div>';
    document.body.appendChild(mask);
    function close() { mask.remove(); }
    mask.querySelector('[data-act="ok"]').addEventListener("click", close);
    mask.querySelector(".fcl-dialog-close").addEventListener("click", close);
    mask.addEventListener("click", function (e) { if (e.target === mask) close(); });
  }

  function detectPage() {
    var file = location.pathname.split("/").pop() || "";
    try { file = decodeURIComponent(file); } catch (_) {}
    if (/传统订单/.test(file)) return "traditional";
    if (/整柜下单/.test(file)) return "order";
    if (/仓位管理/.test(file)) return "booking";
    return "";
  }

  function mountModuleTabs() {
    if (document.body.getAttribute("data-fcl-nav") === "core-flow") return;
    if (document.body.getAttribute("data-fcl-nav") === "core-flow-v3") return;
    if (document.querySelector(".fcl-module-tabs")) return;
    var page = document.body.getAttribute("data-fcl-page") || detectPage();
    if (!page || !PAGES[page]) return;
    var nav = document.createElement("nav");
    nav.className = "fcl-module-tabs";
    nav.setAttribute("aria-label", "整柜主流程");
    Object.keys(PAGES).forEach(function (key) {
      var a = document.createElement("a");
      a.href = PAGES[key].file;
      a.textContent = PAGES[key].label;
      if (key === page) a.classList.add("is-active");
      nav.appendChild(a);
    });
    var app = document.querySelector(".app");
    var demoBar = document.querySelector(".demo-bar");
    if (demoBar && demoBar.parentNode === app) {
      demoBar.insertAdjacentElement("afterend", nav);
    } else if (app) {
      app.insertBefore(nav, app.firstChild);
    } else {
      document.body.insertBefore(nav, document.body.firstChild);
    }
  }

  function setupTable(table) {
    if (!table || table.getAttribute("data-fcl-table") === "1") return;
    table.setAttribute("data-fcl-table", "1");
    var tbody = table.querySelector("tbody");
    if (!tbody) return;
    var headCb = table.querySelector("thead input[type=checkbox]");

    function syncSelected(tr) {
      tbody.querySelectorAll("tr").forEach(function (r) { r.classList.remove("selected"); });
      if (tr) tr.classList.add("selected");
    }

    tbody.addEventListener("click", function (e) {
      if (e.target.closest("a, button, input, select, textarea, .link[data-open-drawer]")) return;
      var tr = e.target.closest("tr");
      if (!tr) return;
      syncSelected(tr);
      var cb = tr.querySelector('input[type=checkbox]');
      if (cb && e.target !== cb) cb.checked = true;
    });

    if (headCb) {
      headCb.addEventListener("change", function () {
        tbody.querySelectorAll('input[type=checkbox]').forEach(function (cb) {
          cb.checked = headCb.checked;
        });
      });
    }
  }

  function getCheckedRows(table) {
    if (!table) return [];
    var rows = Array.prototype.filter.call(
      table.querySelectorAll("tbody input[type=checkbox]"),
      function (cb) { return cb.checked; }
    ).map(function (cb) { return cb.closest("tr"); }).filter(Boolean);
    if (rows.length) return rows;
    var selected = table.querySelector("tbody tr.selected");
    return selected ? [selected] : [];
  }

  function setupStatusFilter(barSelector, tableSelector, attr) {
    var bar = document.querySelector(barSelector);
    var table = document.querySelector(tableSelector);
    if (!bar || !table) return;
    var tabs = bar.querySelectorAll(".status-tab");
    tabs.forEach(function (tab, idx) {
      if (!tab.getAttribute("data-filter")) {
        var filters = ["all", "unreleased", "freight", "cutoff", "released"];
        if (attr === "data-status") {
          filters = ["all", "pending-booking", "pending-loading", "pending-customs", "pending-sign", "completed", "returned"];
        }
        tab.setAttribute("data-filter", filters[idx] || "all");
      }
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        var f = tab.getAttribute("data-filter") || "all";
        var rows = table.querySelectorAll("tbody tr");
        var shown = 0;
        rows.forEach(function (tr) {
          var match = f === "all" || tr.getAttribute(attr) === f ||
            (f === "freight" && tr.getAttribute("data-freight") === "expired") ||
            (f === "cutoff" && tr.getAttribute("data-cutoff") === "near");
          tr.hidden = !match;
          if (match) shown++;
        });
        toast("已切换至「" + tab.textContent.trim() + "」，显示 " + shown + " 条（原型演示）");
      });
    });
  }

  function setupFilterPanel(panelSelector, onQuery) {
    var panel = document.querySelector(panelSelector);
    if (!panel) return;
    var queryBtn = panel.querySelector('[data-fcl-query], .btn-primary, .filter-actions .btn-primary, .filter-extra .btn-primary');
    var resetBtn = panel.querySelector('[data-fcl-reset], .filter-actions .btn:not(.btn-primary), .filter-extra .btn:not(.btn-primary):not([data-fcl-query])');
    var actions = panel.querySelector(".filter-actions") || panel.querySelector(".filter-extra");
    if (actions) {
      var btns = actions.querySelectorAll(".btn");
      btns.forEach(function (btn) {
        if (btn.classList.contains("btn-primary") && !btn.id) btn.setAttribute("data-fcl-query", "1");
        if (!btn.classList.contains("btn-primary") && btn.textContent.indexOf("重置") !== -1) {
          btn.setAttribute("data-fcl-reset", "1");
        }
      });
      queryBtn = actions.querySelector("[data-fcl-query], .btn-primary");
      resetBtn = actions.querySelector("[data-fcl-reset]");
    }
    if (queryBtn && !queryBtn.getAttribute("data-fcl-bound")) {
      queryBtn.setAttribute("data-fcl-bound", "1");
      queryBtn.addEventListener("click", function () {
        if (onQuery) onQuery();
        else toast("查询完成（原型演示）", "ok");
      });
    }
    if (resetBtn && !resetBtn.getAttribute("data-fcl-bound")) {
      resetBtn.setAttribute("data-fcl-bound", "1");
      resetBtn.addEventListener("click", function () {
        panel.querySelectorAll("input:not([type=checkbox]), select").forEach(function (el) {
          if (el.tagName === "SELECT") el.selectedIndex = 0;
          else el.value = "";
        });
        toast("筛选条件已重置");
      });
    }
  }

  function initBooking() {
    var table = document.querySelector('table[aria-label="舱位列表"]');
    setupTable(table);
    setupStatusFilter(".status-bar", 'table[aria-label="舱位列表"]', "data-release");
    setupFilterPanel(".filter-panel");

    var sidebar = document.querySelector(".sidebar");
    if (sidebar) {
      var map = {
        "运单管理": PAGES.traditional.file,
        "整柜下单": PAGES.order.file,
        "仓位管理": PAGES.booking.file,
      };
      sidebar.querySelectorAll(".side-item").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var label = btn.textContent.trim();
          if (map[label]) {
            location.href = map[label];
            return;
          }
          toast("「" + label + "」为演示菜单（原型）", "warn");
        });
      });
    }

    var toolbar = document.querySelector(".toolbar");
    if (toolbar) {
      toolbar.querySelectorAll(".btn").forEach(function (btn) {
        if (btn.id === "btnAdd" || btn.id === "btnEdit" || btn.id === "btnRollover" || btn.id === "btnExportRolloverBc") return;
        if (btn.getAttribute("data-fcl-toolbar")) return;
        btn.setAttribute("data-fcl-toolbar", "1");
        btn.addEventListener("click", function () {
          var label = btn.textContent.trim();
          if (label.indexOf("删除") !== -1) {
            var rows = getCheckedRows(table);
            if (!rows.length) {
              toast("请先勾选需要操作的舱位记录", "warn");
              return;
            }
            confirmDialog("批量删除", "确认删除选中的 " + rows.length + " 条舱位记录？此操作不可恢复（原型演示）。", function () {
              toast("已删除 " + rows.length + " 条（原型演示）", "ok");
            }, "确认删除");
            return;
          }
          if (label.indexOf("备注") !== -1) {
            var n = getCheckedRows(table).length;
            if (!n) { toast("请先勾选需要编辑备注的记录", "warn"); return; }
            infoDialog("编辑备注", "已选 <strong>" + n + "</strong> 条 · 备注保存后将同步至列表（原型演示）。");
            return;
          }
          toast(label + " · 任务已提交（原型演示）", "ok");
        });
      });
    }

    var btnEdit = document.getElementById("btnEdit");
    if (btnEdit && !btnEdit.getAttribute("data-fcl-enhanced")) {
      btnEdit.setAttribute("data-fcl-enhanced", "1");
      btnEdit.addEventListener("click", function (e) {
        var rows = getCheckedRows(table);
        if (!rows.length) {
          e.stopImmediatePropagation();
          toast("请先勾选或点击列表行，再完善提单", "warn");
        }
      }, true);
    }

    var params = new URLSearchParams(location.search);
    var bl = params.get("bl");
    if (bl) {
      setTimeout(function () {
        document.querySelectorAll("[data-open-drawer]").forEach(function (el) {
          if (el.textContent.trim() === bl) el.click();
        });
        if (!document.getElementById("drawer").classList.contains("open")) {
          var btnAdd = document.getElementById("btnAdd");
          if (btnAdd) btnAdd.click();
        }
        toast("已打开提单「" + bl + "」订舱侧栏", "ok");
      }, 400);
    }
  }

  function initOrder() {
    setupTable(document.querySelector(".cargo-table"));

    var navTabs = document.querySelector(".nav-tabs");
    if (navTabs) {
      navTabs.querySelectorAll(".nav-tab").forEach(function (tab) {
        if (tab.tagName === "A") return;
        var text = tab.textContent.trim();
        if (text === "传统订单管理") {
          tab.outerHTML = '<a class="nav-tab" href="' + PAGES.traditional.file + '" style="text-decoration:none;color:inherit;">传统订单管理</a>';
        } else if (text === "运单管理") {
          tab.addEventListener("click", function () { location.href = PAGES.traditional.file; });
        } else if (text === "首页") {
          tab.addEventListener("click", function () { toast("首页为演示入口（原型）"); });
        }
      });
    }

    var btnCancel = document.getElementById("btnOrderCancel");
    var btnDraft = document.getElementById("btnOrderDraft");
    var btnSubmit = document.getElementById("btnOrderSubmit");

    if (btnCancel) {
      btnCancel.addEventListener("click", function () {
        confirmDialog("取消录入", "未保存的内容将丢失，确认返回传统订单列表？", function () {
          location.href = PAGES.traditional.file;
        }, "确认离开");
      });
    }
    if (btnDraft) {
      btnDraft.addEventListener("click", function () {
        toast("草稿已保存（原型演示）", "ok");
      });
    }
    if (btnSubmit) {
      btnSubmit.addEventListener("click", function () {
        confirmDialog("提交预报", "确认提交预报？提交后将生成运单并进入「已预报」状态。", function () {
          toast("提交成功 · 运单 RC266506 已生成", "ok");
          setTimeout(function () { location.href = PAGES.traditional.file; }, 1200);
        }, "确认提交");
      });
    }

    document.querySelectorAll(".upload-box a").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        toast("文件上传成功（原型演示）", "ok");
      });
    });

    document.querySelectorAll(".col-photo").forEach(function (cell) {
      cell.style.cursor = "pointer";
      cell.addEventListener("click", function () {
        toast("图片上传成功（原型演示）", "ok");
      });
    });
  }

  function initTraditional() {
    var table = document.querySelector(".data-grid");
    setupTable(table);
    setupStatusFilter(".status-bar", ".data-grid", "data-status");
    setupFilterPanel(".page-hd");

    document.querySelectorAll(".data-grid tbody tr").forEach(function (tr) {
      var waybillEl = tr.querySelector("[data-waybill]");
      if (!waybillEl) {
        var link = tr.cells[1] && tr.cells[1].querySelector(".link");
        if (link) {
          link.setAttribute("data-waybill", link.textContent.trim());
          waybillEl = link;
        }
      }
      if (waybillEl) {
        waybillEl.addEventListener("click", function () {
          var wb = waybillEl.getAttribute("data-waybill") || waybillEl.textContent.trim();
          var status = tr.cells[7] ? tr.cells[7].textContent.trim() : "";
          var bl = tr.cells[9] ? tr.cells[9].textContent.trim() : "";
          infoDialog(
            "运单详情 · " + wb,
            "<p style='margin:0 0 8px'>运单号：<strong>" + wb + "</strong></p>" +
            "<p style='margin:0 0 8px'>运单状态：" + status + "</p>" +
            "<p style='margin:0 0 8px'>提单号：" + (bl || "—") + "</p>" +
            "<p style='margin:0;color:rgba(0,0,0,.45);font-size:12px'>可跳转整柜下单编辑或绑定仓位继续流程（原型演示）。</p>"
          );
        });
      }

      var blCell = tr.cells[9];
      if (blCell && blCell.textContent.trim() && blCell.textContent.trim() !== "—") {
        var bl = blCell.textContent.trim();
        blCell.innerHTML = '<a class="link" href="' + PAGES.booking.file + "?bl=" + encodeURIComponent(bl) + '">' + bl + "</a>";
      }
    });

    var bindConfirm = document.getElementById("bindConfirm");
    if (bindConfirm) {
      bindConfirm.addEventListener("click", function () {
        confirmDialog("确认绑定仓位", "绑定成功后将写入仓位列表，并同步海运费与合约有效期。", function () {
          document.getElementById("bindMask").classList.remove("open");
          document.getElementById("bindDrawer").classList.remove("open");
          toast("绑定成功 · 已同步至仓位管理", "ok");
          setTimeout(function () {
            location.href = PAGES.booking.file + "?bl=TXZG00000000052";
          }, 1000);
        }, "确认绑定");
      });
    }

    var btnBind = document.getElementById("btnBindSpace");
    if (btnBind) {
      var orig = btnBind.onclick;
      btnBind.addEventListener("click", function () {
        var rows = getCheckedRows(table);
        if (!rows.length) {
          toast("已打开演示数据 RC266502 的绑定仓位抽屉", "warn");
        } else {
          var wb = rows[0].cells[1].textContent.trim();
          document.querySelector("#bindDrawer .drawer-hd").textContent = "绑定仓位 · " + wb;
        }
      });
    }

    document.querySelectorAll(".toolbar .btn").forEach(function (btn) {
      if (btn.id || btn.getAttribute("href")) return;
      if (btn.getAttribute("data-fcl-toolbar")) return;
      btn.setAttribute("data-fcl-toolbar", "1");
      var label = btn.textContent.replace(/\s+/g, " ").trim();
      btn.addEventListener("click", function () {
        var rows = getCheckedRows(table);
        if (label.indexOf("查询数据") !== -1) {
          toast("列表已刷新（原型演示）", "ok");
          return;
        }
        if (label.indexOf("取消订单") !== -1) {
          if (!rows.length) { toast("请先勾选需要取消的运单", "warn"); return; }
          confirmDialog("取消订单", "确认取消选中的 " + rows.length + " 单？取消后不可恢复（原型演示）。", function () {
            toast("订单已取消（原型演示）", "ok");
          }, "确认取消");
          return;
        }
        if (label.indexOf("装柜完成") !== -1) {
          if (!rows.length) { toast("请先勾选运单", "warn"); return; }
          confirmDialog("装柜完成", "确认标记 " + rows.length + " 单为装柜完成？签出时将校验海运费有效期。", function () {
            toast("装柜完成状态已更新（原型演示）", "ok");
          }, "确认");
          return;
        }
        if (!rows.length) {
          toast("请先勾选运单后再操作「" + label + "」", "warn");
          return;
        }
        toast("「" + label + "」已提交（原型演示 · " + rows.length + " 单）", "ok");
      });
    });

    document.querySelectorAll(".tab-bar a").forEach(function (a) {
      if (a.getAttribute("href") === "#") {
        a.addEventListener("click", function (e) {
          e.preventDefault();
          toast("控制台为演示入口（原型）");
        });
      }
    });
  }

  function init() {
    injectStyles();
    mountModuleTabs();
    document.querySelectorAll("table").forEach(setupTable);
    var page = document.body.getAttribute("data-fcl-page") || detectPage();
    if (page === "booking") initBooking();
    else if (page === "order") initOrder();
    else if (page === "traditional") initTraditional();
  }

  window.FclCore = { toast: toast, confirm: confirmDialog, info: infoDialog, PAGES: PAGES };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
