/* 9810 拆分规则配置 · 功能说明 + 逐点说明（与原型橙色编号 1～8 一致） */
window.S9810_CFG_FEATURE_PAGES = [
  {
    page: 0,
    title: "9810 拆分规则配置",
    summary:
      "财务后台维护「导出 9810 账单」弹窗默认三行的<strong>税率 + 单价种子</strong>（报关行仅税率，单价取运单实际基数）。与 <a href=\"../PRD对照-9810费用拆分/请款单管理-PRD-交互稿.html\">请款单 PRD</a> 解耦：本页橙圈 <strong>1～8</strong>；请款导出橙圈见请款主稿。",
    bullets: [
      "<strong>通用配置</strong>：按方数、按计费重各一套；道路 / 港杂可配单价；报关<strong>不配单价</strong>。",
      "<strong>按销售产品配置</strong>：主数据销售产品 + 专配；空项可勾选「继承通用」；可标记「归入 T25 页签」（决定请款导出弹窗费用区 Tab，请款 <strong>pin 10</strong>）。",
      "保存后写配置表；已打开的导出弹窗不刷新，下次打开按最新配置带出。",
      "客户<strong>沉淀</strong>仍在请款导出弹窗写入，优先级高于本页配置（请款 pin 12）。"
    ]
  }
];

window.S9810_CFG_REVIEW_POINTS = [
  {
    page: 0,
    id: "cfgTabScope",
    pin: 1,
    title: "配置范围页签",
    kind: "页签 · NEW",
    summary: "「通用配置」维护全局回落种子；「按销售产品配置」为单个销售产品维护专配。",
    body: [
      "同一套默认三行结构，通用是兜底，专配覆盖部分单价/税率。",
      "切换页签不自动保存；未保存修改切换时按现网策略提示或丢弃草稿（以实现为准）。",
      "通用页签编辑 <code>#paneGeneral</code>；产品页签左侧列表 + 右侧专配表。"
    ]
  },
  {
    page: 0,
    id: "basisPick",
    pin: 2,
    title: "计费维度",
    kind: "工具条",
    summary: "按方数 / 按计费重；切换后表头单价单位、通用与专配表格重绘为对应维度的一套数。",
    body: [
      "与请款导出弹窗 pin 8「计费方式」同源两套种子，本页分别维护。",
      "切换下拉立即重绘当前页签表格；不自动点保存。",
      "单位提示：<code>#basisUnitHint</code> 元/方 或 元/KG。"
    ]
  },
  {
    page: 0,
    id: "paneGeneral",
    pin: 3,
    title: "通用配置 · 默认三行",
    kind: "配置表 · NEW",
    summary: "道路 9%、港杂 6%、报关 6% 为初值；道路/港杂填单价基数；报关行单价列固定「—」。",
    body: [
      "导出时无专配、且客户无沉淀时，财务在请款弹窗可选「通用配置」种子，读本表。",
      "税率 0～100；单价 ≥ 0；报关行只改税率。",
      "例：内陆 100 元/方、港杂 40 元/方（按方数维）；T25 专配常见 20 元/方写在产品页签。"
    ]
  },
  {
    page: 0,
    id: "btnSave",
    pin: 4,
    title: "保存",
    kind: "主操作",
    summary: "校验通过后写配置；通用与产品页签分别保存当前编辑范围。",
    body: [
      "失败：税率非法、单价负数等 → 提示，不落库。",
      "成功：记操作人、操作时间；toast 提示。",
      "请款侧下次打开「导出 9810」按最新配置带出（无沉淀、选对应种子时）。"
    ]
  },
  {
    page: 0,
    id: "btnAddProd",
    pin: 5,
    title: "新增销售产品",
    kind: "按产品页签 · NEW",
    summary: "绑定主数据销售产品编码与名称；新增后左侧选中，右侧维护专配。",
    body: [
      "本期原型用 prompt 演示；正式应对接销售产品主数据选择器。",
      "新产品默认继承通用、不归入 T25 页签。",
      "填完专配后点保存（pin 4）落库。"
    ]
  },
  {
    page: 0,
    id: "prodList",
    pin: 6,
    title: "销售产品列表",
    kind: "按产品页签 · NEW",
    summary: "选中一行后右侧编辑该产品的专配；列表可展示是否归入 T25 页签标记。",
    body: [
      "一行一销售产品；编码唯一。",
      "切换选中行：若右侧有未保存修改，按现网草稿策略处理。",
      "请款导出按运单销售产品命中本列表专配（请款 pin 9 种子选「拆分」时）。"
    ]
  },
  {
    page: 0,
    id: "prodProductMeta",
    pin: 7,
    title: "继承通用 · 归入 T25 页签",
    kind: "按产品页签 · NEW",
    summary: "「未填写继承通用」：专配空项回落通用配置；「归入 T25 页签」决定请款导出费用区归类。",
    body: [
      "继承开关变更后重绘专配表 placeholder（继承/空）。",
      "T25 标记与单价独立：只影响 Tab 展示与运单分区，不改变专配数值本身。",
      "对齐请款 PRD <a href=\"../PRD对照-9810费用拆分/请款单管理-PRD-交互稿.html#s-9810-prod-cfg\">§销售产品配置</a>、请款 pin 10。"
    ]
  },
  {
    page: 0,
    id: "prodEditPane",
    pin: 8,
    title: "销售产品 · 专配三行",
    kind: "配置表 · NEW",
    summary: "与通用表同结构；道路/港杂可只填部分字段；报关仍仅税率。",
    body: [
      "勾选继承且留空 → 导出读通用对应项。",
      "专配与通用维度一致（随 pin 2 切换方数/计费重）。",
      "报关基数始终请款导出时取运单实际，不在此配单价。"
    ]
  }
];

window.S9810_CFG_REVIEW_PIN_IDS = {
  0: [
    "cfgTabScope",
    "basisPick",
    "paneGeneral",
    "btnSave",
    "btnAddProd",
    "prodList",
    "prodProductMeta",
    "prodEditPane"
  ]
};

window.S9810_CFG_PAGE_LINKS = [
  { page: 0, title: "9810 配置 · PRD（橙色编号）", href: "../PRD对照-9810费用拆分/9810拆分规则配置-PRD-交互稿.html" },
  { page: 0, title: "配置页原型", href: "../收款/9810拆分规则配置-MVP.html" },
  { page: 0, title: "请款单 · PRD", href: "../PRD对照-9810费用拆分/请款单管理-PRD-交互稿.html" }
];
