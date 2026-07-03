/**
 * 整柜 · 喜好船司 / 报价船司（数据字典 · 扩展字段=海运）
 */
(function (root) {
  var list = [
    { code: "MATS", label: "MATS美森" },
    { code: "KMTC", label: "KMTC高丽海运" },
    { code: "HPL", label: "HPL赫伯罗特" },
    { code: "YML", label: "YML 阳明海运" },
    { code: "MSK", label: "MSK马士基" },
    { code: "OOCL", label: "OOCL东方海外" },
    { code: "CMA", label: "CMA达飞" },
    { code: "EMC", label: "EMC长荣" },
    { code: "HEDE", label: "HEDE合德" },
    { code: "SML", label: "SML森罗" },
    { code: "CUL", label: "中联航运" },
    { code: "ONE", label: "ONE" },
    { code: "WHL", label: "WHL万海" },
    { code: "ZIM", label: "ZIM以星" },
    { code: "COSCO", label: "COSCO中远海运" },
    { code: "MSC", label: "MSC地中海" },
    { code: "SLS", label: "SLS海领" },
    { code: "HMM", label: "HMM韩国现代" }
  ];

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
      return upper.indexOf(c.code) >= 0 || upper.indexOf(c.label.toUpperCase()) >= 0;
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
      panelClass: opts.panelClass,
      placeholder: opts.placeholder || "请选择船司（可多选）",
      searchPlaceholder: "搜索船司代码或名称",
      emptyText: "无匹配船司",
      sheetTitle: opts.sheetTitle || "喜好船司",
      limitTip: opts.limitTip || "喜好船司最多选择 2 项",
      onChange: opts.onChange,
      getSearchText: function (c) {
        return (c.code + " " + c.label).toUpperCase();
      },
      getLabelHtml: function (c) {
        return c.code + " · " + c.label;
      }
    });
  }

  root.ESS_FCL_CARRIERS = list;
  root.essFclCarrierOptionHtml = optionHtml;
  root.essFclCarriersFromText = matchText;
  root.essFclCarrierMultiselect = { mount: mount };
})(window);
