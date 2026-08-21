/**
 * 整柜 · 船司 / 箱型 多选（PC 下拉 · APP 底部弹层）
 */
(function (root) {
  function mountFclMultiselect(host, opts) {
    if (!host) return null;
    opts = opts || {};
    var items = opts.items || [];
    var maxSelect = typeof opts.maxSelect === "number" ? opts.maxSelect : 2;
    var selected = (opts.defaultSelected || []).slice(0, maxSelect);
    var draft = selected.slice();
    var appMode = !!opts.appMode;
    var sheetTitle = opts.sheetTitle || "请选择";
    var placeholder = opts.placeholder || "请选择";
    var searchPlaceholder = opts.searchPlaceholder || "搜索";
    var emptyText = opts.emptyText || "无匹配项";
    var limitTip = opts.limitTip || ("最多选择 " + maxSelect + " 项");
    var panelClass = opts.panelClass || "";
    var getSearchText =
      opts.getSearchText ||
      function (c) {
        return (c.code + " " + c.label).toUpperCase();
      };
    var getLabelHtml =
      opts.getLabelHtml ||
      function (c) {
        return c.code + " · " + c.label;
      };

    host.className = (host.className + " fcl-ms" + (appMode ? " fcl-ms-app-sheet" : "")).trim();

    if (appMode) {
      host.innerHTML =
        '<button type="button" class="fcl-ms-trigger" aria-haspopup="dialog" aria-expanded="false">' +
          '<span class="fcl-ms-value"></span>' +
          '<span class="fcl-ms-chevron" aria-hidden="true">›</span>' +
        "</button>" +
        '<div class="fcl-ms-sheet" hidden aria-hidden="true">' +
          '<div class="fcl-ms-mask"></div>' +
          '<div class="fcl-ms-sheet-panel" role="dialog" aria-modal="true">' +
            '<div class="fcl-ms-sheet-hd">' +
              '<button type="button" class="fcl-ms-sheet-cancel">取消</button>' +
              '<span class="fcl-ms-sheet-title"></span>' +
              '<button type="button" class="fcl-ms-sheet-ok">确定</button>' +
            "</div>" +
            '<p class="fcl-ms-sheet-tip"></p>' +
            '<input type="search" class="fcl-ms-search" autocomplete="off" />' +
            '<div class="fcl-ms-list" role="listbox" aria-multiselectable="true"></div>' +
          "</div>" +
        "</div>";
    } else {
      host.innerHTML =
        '<button type="button" class="fcl-ms-trigger" aria-haspopup="listbox" aria-expanded="false">' +
          '<span class="fcl-ms-value"></span>' +
          '<span class="fcl-ms-arrow" aria-hidden="true">▾</span>' +
        "</button>" +
        '<div class="fcl-ms-panel' +
        (panelClass ? " " + panelClass : "") +
        '" hidden>' +
        '<input type="search" class="fcl-ms-search" autocomplete="off" />' +
        '<div class="fcl-ms-list" role="listbox" aria-multiselectable="true"></div>' +
      "</div>";
    }

    var trigger = host.querySelector(".fcl-ms-trigger");
    var panel = appMode ? host.querySelector(".fcl-ms-sheet") : host.querySelector(".fcl-ms-panel");
    var valueEl = host.querySelector(".fcl-ms-value");
    var search = host.querySelector(".fcl-ms-search");
    var listEl = host.querySelector(".fcl-ms-list");
    var optionEls = [];

    if (appMode) {
      host.querySelector(".fcl-ms-sheet-title").textContent = sheetTitle;
      host.querySelector(".fcl-ms-sheet-tip").textContent = limitTip;
      search.placeholder = searchPlaceholder;
    } else {
      search.placeholder = searchPlaceholder;
    }

    function workingSelected() {
      return appMode ? draft : selected;
    }

    function updateOptionStates() {
      var working = workingSelected();
      var atMax = working.length >= maxSelect;
      optionEls.forEach(function (row) {
        var code = row.getAttribute("data-code");
        var on = working.indexOf(code) >= 0;
        var input = row.querySelector("input");
        input.disabled = atMax && !on;
        row.classList.toggle("is-disabled", atMax && !on);
      });
    }

    function syncCheckboxes() {
      var working = workingSelected();
      optionEls.forEach(function (row) {
        var code = row.getAttribute("data-code");
        var on = working.indexOf(code) >= 0;
        row.querySelector("input").checked = on;
        row.setAttribute("aria-selected", on ? "true" : "false");
      });
      updateOptionStates();
    }

    function updateTrigger() {
      if (!selected.length) {
        valueEl.textContent = placeholder;
        valueEl.classList.add("is-placeholder");
      } else {
        var text =
          typeof opts.formatValue === "function"
            ? opts.formatValue(selected.slice())
            : selected.join("、");
        valueEl.textContent = text || placeholder;
        valueEl.classList.toggle("is-placeholder", !text);
      }
    }

    function renderList(filter) {
      var keyword = (filter || "").trim().toUpperCase();
      var visible = 0;
      optionEls.forEach(function (row) {
        var text = row.getAttribute("data-text") || "";
        var show = !keyword || text.indexOf(keyword) >= 0;
        row.classList.toggle("is-hidden", !show);
        if (show) visible += 1;
      });
      var empty = listEl.querySelector(".fcl-ms-empty");
      if (!visible) {
        if (!empty) {
          empty = document.createElement("div");
          empty.className = "fcl-ms-empty";
          empty.textContent = emptyText;
          listEl.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    }

    function onSelectionChange() {
      if (!appMode && typeof opts.onChange === "function") {
        opts.onChange(selected.slice());
      }
    }

    function handleToggle(code, checked) {
      var working = workingSelected();
      var idx = working.indexOf(code);
      if (checked && idx < 0) {
        if (working.length >= maxSelect) {
          alert(limitTip);
          return false;
        }
        working.push(code);
      }
      if (!checked && idx >= 0) {
        working.splice(idx, 1);
      }
      if (!appMode) {
        updateTrigger();
        onSelectionChange();
      }
      syncCheckboxes();
      return true;
    }

    function openPanel() {
      if (appMode) {
        draft = selected.slice();
      }
      syncCheckboxes();
      search.value = "";
      renderList("");
      panel.hidden = false;
      if (appMode) {
        panel.setAttribute("aria-hidden", "false");
      }
      host.classList.add("open");
      trigger.setAttribute("aria-expanded", "true");
      document.body.classList.add("fcl-ms-sheet-open");
      search.focus();
    }

    function closePanel(revertDraft) {
      if (appMode && revertDraft) {
        draft = selected.slice();
      }
      panel.hidden = true;
      if (appMode) {
        panel.setAttribute("aria-hidden", "true");
      }
      host.classList.remove("open");
      trigger.setAttribute("aria-expanded", "false");
      document.body.classList.remove("fcl-ms-sheet-open");
    }

    function commitSheet() {
      selected = draft.slice(0, maxSelect);
      updateTrigger();
      closePanel(false);
      if (typeof opts.onChange === "function") {
        opts.onChange(selected.slice());
      }
    }

    items.forEach(function (c) {
      var row = document.createElement("label");
      row.className = "fcl-ms-option";
      row.setAttribute("data-code", c.code);
      row.setAttribute("data-text", getSearchText(c));
      row.setAttribute("role", "option");
      row.innerHTML = '<input type="checkbox" value="' + c.code + '" />' + getLabelHtml(c);
      row.querySelector("input").addEventListener("change", function () {
        if (!handleToggle(c.code, this.checked)) {
          this.checked = !this.checked;
        }
      });
      listEl.appendChild(row);
      optionEls.push(row);
    });

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (host.classList.contains("open")) {
        closePanel(appMode);
      } else {
        openPanel();
      }
    });

    search.addEventListener("input", function () {
      renderList(this.value);
    });

    search.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    if (appMode) {
      host.querySelector(".fcl-ms-mask").addEventListener("click", function () {
        closePanel(true);
      });
      host.querySelector(".fcl-ms-sheet-cancel").addEventListener("click", function () {
        closePanel(true);
      });
      host.querySelector(".fcl-ms-sheet-ok").addEventListener("click", function () {
        commitSheet();
      });
      panel.querySelector(".fcl-ms-sheet-panel").addEventListener("click", function (e) {
        e.stopPropagation();
      });
    } else {
      panel.addEventListener("click", function (e) {
        e.stopPropagation();
      });
      document.addEventListener("click", function () {
        closePanel(false);
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && host.classList.contains("open")) {
        closePanel(appMode);
      }
    });

    syncCheckboxes();
    updateTrigger();

    return {
      getSelected: function () {
        return selected.slice();
      },
      setSelected: function (codes) {
        selected = (codes || []).slice(0, maxSelect);
        draft = selected.slice();
        syncCheckboxes();
        updateTrigger();
      },
      close: function () {
        closePanel(appMode);
      }
    };
  }

  root.mountFclMultiselect = mountFclMultiselect;
})(window);
