/**
 * 整柜 · 箱型（数据字典 · 启用项；40HC 已禁用未纳入）
 */
(function (root) {
  var list = [
    { code: "40HQ", label: "40HQ" },
    { code: "22G0", label: "20尺高箱", alias: ["20HC"] },
    { code: "40OT", label: "40OT" },
    { code: "45HC", label: "45HC" },
    { code: "20OS", label: "20OS" },
    { code: "20OT", label: "20OT" },
    { code: "40FR", label: "40FR" },
    { code: "20HQ", label: "20HQ" },
    { code: "40GP", label: "40GP" },
    { code: "45HQ", label: "45HQ" },
    { code: "40NOR", label: "40NOR" },
    { code: "20GP", label: "20GP" }
  ];

  function searchText(c) {
    var parts = [c.code, c.label];
    if (c.alias) parts = parts.concat(c.alias);
    return parts.join(" ").toUpperCase();
  }

  function optionHtml(selectedCode) {
    return list.map(function (c) {
      var sel = c.code === selectedCode ? " selected" : "";
      return '<option value="' + c.code + '"' + sel + ">" + c.code + " · " + c.label + "</option>";
    }).join("");
  }

  function matchText(text) {
    if (!text) return [];
    var upper = String(text).toUpperCase();
    return list.filter(function (c) {
      if (upper.indexOf(c.code) >= 0) return true;
      if (upper.indexOf(c.label.toUpperCase()) >= 0) return true;
      if (c.alias) {
        for (var i = 0; i < c.alias.length; i++) {
          if (upper.indexOf(c.alias[i].toUpperCase()) >= 0) return true;
        }
      }
      return false;
    }).map(function (c) {
      return c.code;
    });
  }

  function mount(host, opts) {
    if (!host || !root.mountFclMultiselect) return null;
    opts = opts || {};
    return root.mountFclMultiselect(host, {
      items: list,
      maxSelect: opts.maxSelect,
      defaultSelected: opts.defaultSelected,
      appMode: opts.appMode,
      placeholder: opts.placeholder || "请选择箱型（可多选）",
      searchPlaceholder: "搜索箱型代码或名称",
      emptyText: "无匹配箱型",
      sheetTitle: opts.sheetTitle || "箱型",
      limitTip: opts.limitTip || "箱型最多选择 2 项",
      onChange: opts.onChange,
      getSearchText: searchText,
      getLabelHtml: function (c) {
        return c.code + " · " + c.label;
      }
    });
  }

  root.ESS_FCL_CONTAINER_TYPES = list;
  root.essFclContainerOptionHtml = optionHtml;
  root.essFclContainersFromText = matchText;
  root.essFclContainerMultiselect = { mount: mount };
})(window);
