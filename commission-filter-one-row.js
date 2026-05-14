/**
 * 列表页查询区：默认只显示第一行（按当前 CSS 网格列数或 flex 下每行字段数），其余折叠，点「展开条件」显示。
 * 配套 commission-filter-one-row.css（按钮与标题行排版；折叠态亦可仅靠本脚本 display）。
 */
(function () {
  var DONE = "data-filter-one-row-done";

  function elChildren(el) {
    return Array.prototype.filter.call(el.childNodes, function (n) {
      return n.nodeType === 1;
    });
  }

  /**
   * 拆成首行 + 折叠行。若最后一格为带 button 的 .field（常见「查询」），首行占满 cols 格：
   * 前 cols-1 个数据格 + 末格按钮，避免查询被折进「更多」。
   */
  function partitionGridItems(items, cols) {
    if (items.length <= cols) {
      return { row1: items.slice(), more: [] };
    }
    var last = items[items.length - 1];
    var isBtnField =
      last.classList &&
      last.classList.contains("field") &&
      last.querySelector("button");
    if (isBtnField) {
      var n = Math.max(1, cols - 1);
      var row1 = items.slice(0, n).concat([last]);
      var more = items.slice(n, items.length - 1);
      return { row1: row1, more: more };
    }
    return {
      row1: items.slice(0, cols),
      more: items.slice(cols),
    };
  }

  function isDone(el) {
    return el.getAttribute(DONE) === "1";
  }

  function setDone(el) {
    el.setAttribute(DONE, "1");
  }

  /** 已有完整折叠 UI 的财务流水筛选条 */
  function hasNativeCollapse(el) {
    if (el.id === "filterBar") return true;
    if (
      el.matches(".filter-bar") &&
      el.querySelector(".filter-toolbar, .btn-filter-toggle, .filter-body-wrap")
    ) {
      return true;
    }
    return false;
  }

  function parseColsAttr(el) {
    var v = el.getAttribute("data-filter-cols");
    if (v != null && v !== "") {
      var n = parseInt(v, 10);
      if (!isNaN(n) && n > 0) return n;
    }
    var p = el.closest("[data-filter-cols]");
    if (p) {
      var n2 = parseInt(p.getAttribute("data-filter-cols"), 10);
      if (!isNaN(n2) && n2 > 0) return n2;
    }
    return 0;
  }

  function colCountGrid(el) {
    var pre = parseColsAttr(el);
    if (pre > 0) return pre;
    var s = window.getComputedStyle(el).gridTemplateColumns;
    if (!s || s === "none" || s === "auto") return 0;
    var parts = String(s).trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return 0;
    return Math.max(1, parts.length);
  }

  function defaultFlexCols() {
    return 4;
  }

  function makeToggleButton() {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn-filter-one-row-toggle";
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = "展开条件";
    return btn;
  }

  function wireToggle(btn, rowMore, displayWhenOpen) {
    function sync() {
      var open = !rowMore.classList.contains("is-collapsed");
      rowMore.style.display = open ? displayWhenOpen : "none";
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "收起条件" : "展开条件";
    }
    btn.addEventListener("click", function () {
      rowMore.classList.toggle("is-collapsed");
      sync();
    });
    sync();
  }

  function enhanceCardFilterGrid(card) {
    if (isDone(card) || hasNativeCollapse(card)) return;
    var grid =
      card.querySelector(":scope > .filter-grid") ||
      (function () {
        var g = card.querySelector(":scope > .grid");
        if (g && window.getComputedStyle(g).display === "grid") return g;
        return null;
      })();
    if (!grid) return;
    var items = elChildren(grid);
    var cols = colCountGrid(grid);
    if (!cols) cols = defaultFlexCols();
    var part = partitionGridItems(items, cols);
    if (!part.more.length) return;
    setDone(card);

    var cs = window.getComputedStyle(grid);
    function rowDiv(extra) {
      var d = document.createElement("div");
      d.className = grid.className + " " + extra;
      d.style.display = "grid";
      d.style.gap = cs.gap || "12px";
      d.style.gridTemplateColumns = cs.gridTemplateColumns;
      d.style.marginBottom = cs.marginBottom || "";
      d.style.alignItems = cs.alignItems || "";
      return d;
    }
    var row1 = rowDiv("filter-grid--primary");
    var rowMore = rowDiv("filter-grid--more is-collapsed");

    part.row1.forEach(function (node) {
      row1.appendChild(node);
    });
    part.more.forEach(function (node) {
      rowMore.appendChild(node);
    });

    grid.replaceWith(row1);
    row1.insertAdjacentElement("afterend", rowMore);

    var btn = makeToggleButton();
    var title = card.querySelector(":scope > .filter-title");
    if (title) {
      var wrap = document.createElement("div");
      wrap.className = "filter-title-with-toggle";
      title.parentNode.insertBefore(wrap, title);
      wrap.appendChild(title);
      var slot = document.createElement("div");
      slot.className = "filter-title-toggle-slot";
      slot.appendChild(btn);
      wrap.appendChild(slot);
    } else {
      var bar = document.createElement("div");
      bar.className = "filter-one-row-toolbar";
      bar.appendChild(btn);
      card.insertBefore(bar, row1);
    }
    wireToggle(btn, rowMore, "grid");
  }

  /** 替换掉原 .filter 节点时，把分隔线/底色等一并带到外层，避免丢样式 */
  function decorateOuterLikeFilter(outer, fromEl) {
    if (fromEl.hasAttribute("style")) {
      outer.setAttribute("style", fromEl.getAttribute("style"));
      return;
    }
    var cs = window.getComputedStyle(fromEl);
    outer.style.padding = cs.padding;
    outer.style.borderBottom = cs.borderBottom;
    outer.style.borderTop = cs.borderTop;
    outer.style.background = cs.background;
    outer.style.backgroundColor = cs.backgroundColor;
  }

  function enhanceGridFilter(el) {
    if (isDone(el) || hasNativeCollapse(el)) return;
    if (el.matches(".card.filter")) return;
    var display = window.getComputedStyle(el).display;
    if (display !== "grid") return;
    var kids = elChildren(el);
    var cols = colCountGrid(el);
    if (!cols) cols = defaultFlexCols();
    var part = partitionGridItems(kids, cols);
    if (!part.more.length) return;
    setDone(el);

    var parent = el.parentNode;
    var cs = window.getComputedStyle(el);
    var btn = makeToggleButton();

    var outer = document.createElement("div");
    outer.className = "filter-one-row-outer";
    decorateOuterLikeFilter(outer, el);

    var row1 = document.createElement("div");
    row1.className = "filter-row-split filter-row-split--primary";
    row1.style.display = "grid";
    row1.style.gridTemplateColumns = cs.gridTemplateColumns;
    row1.style.gap = cs.gap || "10px";
    row1.style.alignItems = cs.alignItems || "end";
    row1.style.padding = "0";
    row1.style.margin = "0";

    var rowMore = document.createElement("div");
    rowMore.className = "filter-row-split filter-row-split--more is-collapsed";
    rowMore.style.display = "grid";
    rowMore.style.gridTemplateColumns = cs.gridTemplateColumns;
    rowMore.style.gap = cs.gap || "10px";
    rowMore.style.alignItems = cs.alignItems || "end";
    rowMore.style.padding = "0";
    rowMore.style.margin = "0";

    part.row1.forEach(function (node) {
      row1.appendChild(node);
    });
    part.more.forEach(function (node) {
      rowMore.appendChild(node);
    });

    var bar = document.createElement("div");
    bar.className = "filter-one-row-toolbar";
    bar.appendChild(btn);

    outer.appendChild(bar);
    outer.appendChild(row1);
    outer.appendChild(rowMore);

    parent.replaceChild(outer, el);

    wireToggle(btn, rowMore, "grid");
  }

  function isActionNode(c) {
    return (
      c.tagName === "BUTTON" ||
      (c.classList && c.classList.contains("btn"))
    );
  }

  function enhanceFlexFilter(el) {
    if (isDone(el) || hasNativeCollapse(el)) return;
    if (el.matches(".card.filter")) return;
    var display = window.getComputedStyle(el).display;
    if (display !== "flex" && display !== "inline-flex") return;
    var kids = elChildren(el);
    if (!kids.length) return;

    var trailingActions = [];
    var stack = kids.slice();
    while (stack.length && isActionNode(stack[stack.length - 1])) {
      trailingActions.unshift(stack.pop());
    }
    var coreKids = stack;

    var cols = parseColsAttr(el) || defaultFlexCols();
    var fields = kids.filter(function (c) {
      return c.classList && c.classList.contains("field");
    });
    var nonFieldNonAction = kids.filter(function (c) {
      return (
        !(c.classList && c.classList.contains("field")) && !isActionNode(c)
      );
    });
    var useFieldMode = fields.length > cols && nonFieldNonAction.length === 0;

    var primaryUnits = [];
    var moreUnits = [];

    if (useFieldMode) {
      if (fields.length <= cols) return;
      var primaryFields = fields.slice(0, cols);
      var moreFields = fields.slice(cols);
      primaryUnits = primaryFields.concat(trailingActions);
      moreUnits = moreFields;
    } else {
      if (coreKids.length <= cols) return;
      primaryUnits = coreKids.slice(0, cols).concat(trailingActions);
      moreUnits = coreKids.slice(cols);
    }

    if (!moreUnits.length) return;
    setDone(el);

    var parent = el.parentNode;
    var cs = window.getComputedStyle(el);

    var outer = document.createElement("div");
    outer.className = "filter-one-row-outer";
    decorateOuterLikeFilter(outer, el);

    var row1 = document.createElement("div");
    row1.className = "filter-flex-split filter-flex-split--primary";
    row1.style.display = display;
    row1.style.flexWrap = cs.flexWrap || "wrap";
    row1.style.gap = cs.gap || "12px";
    row1.style.alignItems = cs.alignItems || "flex-end";
    row1.style.padding = "0";
    row1.style.margin = "0";

    var rowMore = document.createElement("div");
    rowMore.className = "filter-flex-split filter-flex-split--more is-collapsed";
    rowMore.style.display = display;
    rowMore.style.flexWrap = cs.flexWrap || "wrap";
    rowMore.style.gap = cs.gap || "12px";
    rowMore.style.alignItems = cs.alignItems || "flex-end";
    rowMore.style.padding = "0";
    rowMore.style.margin = "0";

    primaryUnits.forEach(function (n) {
      row1.appendChild(n);
    });
    moreUnits.forEach(function (n) {
      rowMore.appendChild(n);
    });

    var bar = document.createElement("div");
    bar.className = "filter-one-row-toolbar";
    var btn = makeToggleButton();
    bar.appendChild(btn);

    outer.appendChild(bar);
    outer.appendChild(row1);
    outer.appendChild(rowMore);
    parent.replaceChild(outer, el);

    wireToggle(btn, rowMore, display);
  }

  function enhanceFiltersAndBars() {
    document.querySelectorAll(".filters, .filter-bar").forEach(function (el) {
      if (isDone(el) || hasNativeCollapse(el)) return;
      var d = window.getComputedStyle(el).display;
      if (d === "flex" || d === "inline-flex") {
        enhanceFlexFilter(el);
      } else if (d === "grid") {
        enhanceGridFilter(el);
      }
    });
  }

  function enhanceCardFilters() {
    document.querySelectorAll(".card.filter").forEach(enhanceCardFilterGrid);
  }

  function enhanceStandaloneFilters() {
    document.querySelectorAll(".filter").forEach(function (el) {
      if (isDone(el) || hasNativeCollapse(el)) return;
      if (el.closest(".filter-one-row-outer")) return;
      if (el.matches(".card.filter")) return;
      if (
        el.matches(
          ".filter-row-split--primary, .filter-row-split--more, .filter-flex-split--primary, .filter-flex-split--more"
        )
      ) {
        return;
      }
      var d = window.getComputedStyle(el).display;
      if (d === "grid") {
        enhanceGridFilter(el);
      } else if (d === "flex" || d === "inline-flex") {
        enhanceFlexFilter(el);
      }
    });
  }

  function run() {
    enhanceCardFilters();
    enhanceStandaloneFilters();
    enhanceFiltersAndBars();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
