/**
 * 进口商新增/编辑弹窗（列表页内嵌）
 * 进口商/收件人：同一套资料，一块维护（含法人字段），不从库勾选
 * 发货人：字段平铺维护（公司名/地址/邮编/电话/USCI），不从库勾选
 * 清关行授权在「清关行·港口配置」维护，本弹窗不分。
 */
(function () {
  var SHIPPERS = {
    SHP001: {
      id: "SHP001",
      name: "Shenzhen XX Export Co., Ltd.",
      shortName: "深圳XX出口",
      addr: "Baoan District, Shenzhen, China",
      contact: "Zhang Wei",
      phone: "+86 755-8888-0001",
      email: "export@xx.example.com",
      country: "中国",
    },
    SHP002: {
      id: "SHP002",
      name: "Guangzhou YY Trading Co.",
      shortName: "广州YY外贸",
      addr: "Tianhe, Guangzhou, China",
      contact: "Li Na",
      phone: "+86 20-6666-0002",
      email: "ops@yy.example.com",
      country: "中国",
    },
    SHP003: {
      id: "SHP003",
      name: "Shanghai AA Supply Chain",
      shortName: "上海AA供应链",
      addr: "Pudong, Shanghai, China",
      contact: "Wang Lei",
      phone: "+86 21-5555-0003",
      email: "aa@supply.example.com",
      country: "中国",
    },
  };

  var CONSIGNORS = {
    CNS001: {
      id: "CNS001",
      name: "Shenzhen XX Export Co., Ltd.",
      addr: "Baoan District, Shenzhen, Guangdong, China",
      zip: "518100",
      phone: "+86 755-8888-0001",
      usci: "91440300MA5DXX001",
    },
    CNS002: {
      id: "CNS002",
      name: "Guangzhou YY Trading Co.",
      addr: "Tianhe, Guangzhou, Guangdong, China",
      zip: "510630",
      phone: "+86 20-6666-0002",
      usci: "91440101MA5DYY002",
    },
    CNS003: {
      id: "CNS003",
      name: "Ningbo Bright Logistics Co.",
      addr: "Beilun, Ningbo, Zhejiang, China",
      zip: "315800",
      phone: "+86 574-7777-0003",
      usci: "91330206MA5DNB003",
    },
  };

  function idTypesFor(nationality) {
    if (nationality === "美国") return ["护照", "驾照", "身份识别卡"];
    return ["护照"];
  }

  var RECORDS = {
    "IMP-US-2024-018": {
      code: "IMP-US-2024-018",
      name: "Pacific Trade Logistics LLC",
      limit: 500000,
      regCompany: "腾信物流（深圳）有限公司",
      regDate: "2024-03-15",
      poaAuth: "已授权",
      consigneeHeader: "Pacific Trade Logistics LLC",
      shipperShort: "Pacific",
      shipperCountry: "美国",
      shipperContact: "Michael Chen",
      consigneeEmail: "consignee@pacifictrade.example.com",
      consigneePwd: "Pt#2024login",
      notifySameAsConsignee: true,
      consigneeRemark: "可配合视频验证",
      shipperIds: [],
      bondType: "收货人",
      bondInsCode: "846",
      bondDate: "2024-03-18",
      bondExpireDate: "2025-03-18",
      bondNo: "SUR-TE-88421",
      bondFace: 50000,
      bondUsed: 48,
      bondTimesLimit: 250,
      legalName: "Michael Chen",
      birth: "1988-05-12",
      idType: "驾照",
      passport: "D12345678",
      nationality: "美国",
      legalPwd: "Mc#legal88",
      hasSeal: "是",
      addrType: "真实地址",
      address: "1200 Figueroa St, Los Angeles, CA 90015",
      assignType: "散货专用",
      useChannel: "海运与空运共用",
      consignorIds: [],
      consignorName: "Shenzhen XX Export Co., Ltd.",
      consignorAddr: "Baoan District, Shenzhen, Guangdong, China",
      consignorZip: "518100",
      consignorPhone: "+86 755-8888-0001",
      consignorUsci: "91440300MA5DXX001",
      email: "m.chen@pacifictrade.example.com",
      phone: "+1 310-555-0188",
      status: "active",
      reason: "",
      brokerAuth: ["精准", "02B"],
      brokerRefuse: [],
    },
    "IMP-US-2023-006": {
      code: "IMP-US-2023-006",
      name: "East Coast Import Co.",
      limit: 200000,
      regCompany: "腾信物流（上海）有限公司",
      regDate: "2023-08-02",
      poaAuth: "已授权",
      consigneeHeader: "East Coast Import Co.",
      shipperShort: "East Coast",
      shipperCountry: "美国",
      shipperContact: "Lisa Wang",
      consigneeEmail: "recv@eastcoast.example.com",
      consigneePwd: "",
      notifySameAsConsignee: true,
      shipperIds: [],
      bondType: "发货人",
      bondInsCode: "856",
      bondDate: "2025-01-10",
      bondExpireDate: "2025-04-10",
      bondNo: "",
      bondFace: 50000,
      bondUsed: 228,
      bondTimesLimit: 250,
      legalName: "Lisa Wang",
      birth: "1991-08-20",
      idType: "护照",
      passport: "G98765432",
      nationality: "中国",
      legalPwd: "",
      hasSeal: "否",
      addrType: "虚拟地址",
      address: "221B Virtual Ave, Suite 800, New York, NY 10001",
      assignType: "苏州整柜专用",
      useChannel: "海运",
      consignorIds: [],
      consignorName: "Guangzhou YY Trading Co.",
      consignorAddr: "Tianhe, Guangzhou, Guangdong, China",
      consignorZip: "510630",
      consignorPhone: "+86 20-6666-0002",
      consignorUsci: "91440101MA5DYY002",
      email: "lisa.wang@eastcoast.example.com",
      phone: "+1 212-555-2200",
      status: "watch",
      reason: "近30天查验率偏高，维持观察",
      brokerAuth: ["精准", "关关通"],
      brokerRefuse: ["02B"],
    },
    "IMP-US-2022-001": {
      code: "IMP-US-2022-001",
      name: "Legacy Harbor Inc.",
      limit: 0,
      regCompany: "外部合作方 A",
      regDate: "2022-01-20",
      poaAuth: "未授权",
      consigneeHeader: "Legacy Harbor Inc.",
      shipperShort: "Legacy",
      shipperCountry: "美国",
      shipperContact: "John Smith",
      consigneeEmail: "",
      consigneePwd: "",
      notifySameAsConsignee: true,
      shipperIds: [],
      bondType: "收货人",
      bondInsCode: "036",
      bondDate: "2022-02-01",
      bondExpireDate: "2023-02-01",
      bondNo: "",
      bondFace: 50000,
      bondUsed: 250,
      bondTimesLimit: 250,
      legalName: "John Smith",
      birth: "1975-01-09",
      idType: "身份识别卡",
      passport: "P55443322",
      nationality: "美国",
      legalPwd: "",
      hasSeal: "否",
      addrType: "真实地址",
      address: "88 Harbor Blvd, Long Beach, CA 90802",
      assignType: "散货专用",
      useChannel: "海运",
      consignorIds: [],
      consignorName: "",
      consignorAddr: "",
      consignorZip: "",
      consignorPhone: "",
      consignorUsci: "",
      email: "",
      phone: "",
      status: "disabled",
      reason: "Bond过期未续",
      brokerAuth: [],
      brokerRefuse: [],
    },
    "IMP-US-2025-003": {
      code: "IMP-US-2025-003",
      name: "Sunrise Global LLC",
      limit: 350000,
      regCompany: "腾信物流（深圳）有限公司",
      regDate: "2025-02-01",
      poaAuth: "未授权",
      consigneeHeader: "Sunrise Global LLC",
      shipperShort: "Sunrise",
      shipperCountry: "美国",
      shipperContact: "David Kim",
      consigneeEmail: "recv@sunriseglobal.example.com",
      consigneePwd: "Sg#sunrise25",
      notifySameAsConsignee: true,
      shipperIds: [],
      bondType: "发货人",
      bondInsCode: "054",
      bondDate: "2025-02-05",
      bondExpireDate: "2026-02-05",
      bondNo: "",
      bondFace: 50000,
      bondUsed: 0,
      bondTimesLimit: 250,
      legalName: "David Kim",
      birth: "1996-11-03",
      idType: "护照",
      passport: "M11223344",
      nationality: "韩国",
      legalPwd: "Sg#legal25",
      hasSeal: "否",
      addrType: "虚拟地址",
      address: "900 Virtual Park, Irvine, CA 92614",
      assignType: "散货专用",
      useChannel: "空运",
      consignorIds: [],
      consignorName: "",
      consignorAddr: "",
      consignorZip: "",
      consignorPhone: "",
      consignorUsci: "",
      email: "d.kim@sunriseglobal.example.com",
      phone: "+1 424-555-9901",
      status: "inactive",
      reason: "",
      brokerAuth: [],
      brokerRefuse: [],
    },
  };

  var BROKER_CFG = [
    { key: "精准", ports: "Detroit / Seattle / Houston 等不接" },
    { key: "02B", ports: "Detroit / Oakland / Houston 等不接" },
    { key: "赛因", ports: "全美可接，达拉斯不建议" },
    { key: "关关通", ports: "Detroit / Seattle / Charleston 等不接（中转也不行）" },
    { key: "人人数智", ports: "Detroit / Dallas 等不接" },
    { key: "帝成", ports: "Detroit / 小港口和内陆港不接" },
  ];

  var BOND_MONTHS = 12;
  var modal;
  var expiryManualOverride = false;
  var suggestedStatus = null;
  var suggestedReason = "";
  var boundShipperIds = [];
  var boundConsignorIds = [];

  function $(id) {
    return document.getElementById(id);
  }

  function formatDate(d) {
    if (!d) return "";
    if (typeof d === "string") return d;
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function parseDate(str) {
    if (!str) return null;
    return new Date(str + "T12:00:00");
  }

  function daysBetween(a, b) {
    return Math.floor((b - a) / (24 * 60 * 60 * 1000));
  }

  function calcExpireFromPurchase(purchase) {
    if (!purchase) return "";
    var d = new Date(purchase + "T12:00:00");
    d.setMonth(d.getMonth() + BOND_MONTHS);
    return formatDate(d);
  }

  function syncReason() {
    var v = $("dlgStatus").value;
    $("dlgReasonBlock").hidden = v === "inactive" || v === "active";
  }

  function recalcExpireFromPurchase(force) {
    var purchase = $("dlgBondDate").value;
    if (!purchase) return;
    if (force || !expiryManualOverride) {
      $("dlgBondExpireDate").value = calcExpireFromPurchase(purchase);
      if (force) {
        expiryManualOverride = false;
        if ($("dlgExpireManualTag")) $("dlgExpireManualTag").hidden = true;
      }
    }
  }

  function evalQuota() {
    var usedEl = $("dlgBondUsed");
    var limitEl = $("dlgBondTimesLimit");
    var faceEl = $("dlgBondFace");
    var alertEl = $("dlgQuotaAlert");
    var textEl = $("dlgQuotaAlertText");
    if (!usedEl || !limitEl || !alertEl || !textEl) return { level: "ok" };
    var used = Number(usedEl.value || 0);
    var limit = Number(limitEl.value || 250);
    var face = Number(faceEl && faceEl.value ? faceEl.value : 50000);
    if (!limit || limit < 1) limit = 250;
    var remain = Math.max(0, limit - used);
    var level = "ok";
    var msg = "";
    if (used >= limit) {
      level = "out";
      msg =
        "额度已用尽：已用 " +
        used +
        " / " +
        limit +
        " 次（面额 USD " +
        face.toLocaleString() +
        "）。须提额或换证后才能继续绑柜。";
    } else if (used >= 240) {
      level = "danger";
      msg =
        "额度紧急：已用 " +
        used +
        " / " +
        limit +
        " 次，仅剩 " +
        remain +
        " 次。请立即提额。";
    } else if (used >= 200) {
      level = "warn";
      msg =
        "额度预警：已用 " +
        used +
        " / " +
        limit +
        " 次，剩余 " +
        remain +
        " 次（规则：5万可用250次）。建议安排提额。";
    } else {
      level = "ok";
      msg =
        "额度正常：已用 " +
        used +
        " / " +
        limit +
        " 次，剩余 " +
        remain +
        " 次 · 面额 USD " +
        face.toLocaleString() +
        "。";
    }
    alertEl.hidden = false;
    alertEl.className =
      "dlg-bond-alert " +
      (level === "ok" ? "ok" : level === "warn" ? "warn" : "danger");
    textEl.textContent = msg;
    return { level: level, used: used, limit: limit, remain: remain };
  }

  function evalBond() {
    var bondDateEl = $("dlgBondDate");
    var bondExpireDateEl = $("dlgBondExpireDate");
    var bondAlert = $("dlgBondAlert");
    var bondAlertText = $("dlgBondAlertText");
    var btnApplyBondStatus = $("dlgBtnApplyBondStatus");
    var purchase = bondDateEl.value;
    var expiryStr = bondExpireDateEl.value;

    if (!purchase && !expiryStr) {
      bondAlert.hidden = true;
      suggestedStatus = null;
      return { level: "none" };
    }

    if (purchase && !expiryStr && !expiryManualOverride) {
      recalcExpireFromPurchase(false);
      expiryStr = bondExpireDateEl.value;
    }

    if (!expiryStr) {
      bondAlert.hidden = true;
      return { level: "none" };
    }

    var expiry = parseDate(expiryStr);
    var today = new Date();
    today.setHours(12, 0, 0, 0);
    var daysLeft = daysBetween(today, expiry);

    suggestedStatus = null;
    suggestedReason = "";
    btnApplyBondStatus.hidden = true;
    bondExpireDateEl.style.borderColor = "";

    if (daysLeft < 0) {
      bondExpireDateEl.style.borderColor = "#f87171";
      suggestedStatus = "disabled";
      suggestedReason =
        "Bond 已失效（失效时间 " + expiryStr + "），请续购后更新购买/失效时间";
      bondAlert.className = "dlg-bond-alert danger";
      bondAlertText.textContent =
        "Bond 已于 " + expiryStr + " 失效。进口商状态不应为「已启用」，建议改为「已停用」。";
      btnApplyBondStatus.hidden = false;
      btnApplyBondStatus.textContent = "改为已停用并填入原因";
      bondAlert.hidden = false;
      return { level: "expired", expiryStr: expiryStr };
    }

    if (daysLeft <= 30) {
      bondExpireDateEl.style.borderColor = "#fbbf24";
      suggestedStatus = "soon";
      suggestedReason =
        "Bond 将于 " + expiryStr + " 失效（剩余 " + daysLeft + " 天），请安排续购";
      bondAlert.className = "dlg-bond-alert warn";
      bondAlertText.textContent =
        "Bond 将在 " + daysLeft + " 天后失效（" + expiryStr + "）。建议改为「临期」或「停用待观察」。";
      btnApplyBondStatus.hidden = false;
      btnApplyBondStatus.textContent = "改为临期并填入原因";
      bondAlert.hidden = false;
      return { level: "soon", daysLeft: daysLeft, expiryStr: expiryStr };
    }

    bondAlert.className = "dlg-bond-alert ok";
    bondAlertText.textContent =
      "Bond 有效（失效时间 " + expiryStr + "，剩余 " + daysLeft + " 天），可保持「已启用」。";
    bondAlert.hidden = false;
    return { level: "ok", daysLeft: daysLeft, expiryStr: expiryStr };
  }

  function applyBondSuggestion() {
    if (!suggestedStatus) return;
    $("dlgStatus").value = suggestedStatus;
    $("dlgReason").value = suggestedReason;
    syncReason();
    evalBond();
  }

  function syncIdTypeOptions(preferred) {
    var natEl = $("dlgNationality");
    var typeEl = $("dlgIdType");
    if (!natEl || !typeEl) return;
    var types = idTypesFor(natEl.value);
    var cur = preferred || typeEl.value;
    typeEl.innerHTML = types
      .map(function (t) {
        return "<option" + (t === cur ? " selected" : "") + ">" + t + "</option>";
      })
      .join("");
    if (types.indexOf(cur) < 0) typeEl.value = types[0];
  }

  function refreshConsignorPick() {
    var sel = $("dlgConsignorPick");
    if (!sel) return;
    var opts = '<option value="">请选择发货人</option>';
    Object.keys(CONSIGNORS).forEach(function (id) {
      if (boundConsignorIds.indexOf(id) >= 0) return;
      var s = CONSIGNORS[id];
      opts += '<option value="' + id + '">' + s.name + " · " + (s.usci || "无USCI") + "</option>";
    });
    sel.innerHTML = opts;
  }

  function renderBoundConsignors() {
    var box = $("dlgConsignorBoundList");
    if (!box) return;
    if (!boundConsignorIds.length) {
      box.innerHTML = '<span style="color:#94a3b8;font-size:12px">尚未匹配发货人</span>';
      refreshConsignorPick();
      return;
    }
    box.innerHTML = boundConsignorIds
      .map(function (id) {
        var s = CONSIGNORS[id];
        if (!s) return "";
        return (
          '<span class="shipper-chip" data-id="' +
          id +
          '"><b>' +
          s.name +
          '</b><span class="sub">' +
          (s.usci || "") +
          (s.zip ? " · " + s.zip : "") +
          '</span><button type="button" title="解除匹配" data-unbind-cn="' +
          id +
          '">×</button></span>'
        );
      })
      .join("");
    refreshConsignorPick();
  }

  function refreshShipperPick() {
    var sel = $("dlgShipperPick");
    if (!sel) return;
    var opts = '<option value="">请选择发件人</option>';
    Object.keys(SHIPPERS).forEach(function (id) {
      if (boundShipperIds.indexOf(id) >= 0) return;
      var s = SHIPPERS[id];
      opts +=
        '<option value="' +
        id +
        '">' +
        (s.shortName || s.name) +
        " · " +
        s.name +
        "</option>";
    });
    sel.innerHTML = opts;
  }

  function renderBoundShippers() {
    var box = $("dlgShipperBoundList");
    if (!box) return;
    if (!boundShipperIds.length) {
      box.innerHTML = '<span style="color:#94a3b8;font-size:12px">尚未绑定发件人</span>';
      refreshShipperPick();
      return;
    }
    box.innerHTML = boundShipperIds
      .map(function (id) {
        var s = SHIPPERS[id];
        if (!s) return "";
        return (
          '<span class="shipper-chip" data-id="' +
          id +
          '"><b>' +
          (s.shortName || s.name) +
          '</b><span class="sub">' +
          s.name +
          '</span><button type="button" title="解绑" data-unbind="' +
          id +
          '">×</button></span>'
        );
      })
      .join("");
    refreshShipperPick();
  }

  function formatBrokerCell(auth, refuse) {
    if (!auth.length && !refuse.length) return "未分配";
    return auth.length ? auth.join(" · ") : "未分配";
  }

  function formatBrokerTitle(auth, refuse) {
    var parts = [];
    if (auth.length) parts.push("授权：" + auth.join("、"));
    if (refuse.length) parts.push("禁接：" + refuse.join("、"));
    return parts.join("；") || "未分配清关行";
  }

  function syncListBrokerCell(code, auth, refuse) {
    var btn = document.querySelector(
      '.js-open-importer-form[data-code="' + code + '"]'
    );
    if (!btn) return;
    var row = btn.closest("tr");
    if (!row) return;
    var cell = row.querySelector("[data-broker-cell]");
    if (!cell) return;
    cell.textContent = formatBrokerCell(auth, refuse);
    cell.title = formatBrokerTitle(auth, refuse);
  }

  function fillForm(rec) {
    $("dlgCode").value = rec.code || "";
    $("dlgCode").readOnly = !!rec.code;
    $("dlgName").value = rec.name || rec.consigneeHeader || rec.shipperHeader || "";
    $("dlgLimit").value = rec.limit === 0 || rec.limit ? rec.limit : "";
    $("dlgRegCompany").value = rec.regCompany || "";
    $("dlgRegDate").value = rec.regDate || "";
    $("dlgPoaAuth").value = rec.poaAuth || "";
    if ($("dlgShShort")) $("dlgShShort").value = rec.shipperShort || "";
    if ($("dlgShCountry")) $("dlgShCountry").value = rec.shipperCountry || "美国";
    if ($("dlgShContact")) $("dlgShContact").value = rec.shipperContact || rec.legalName || "";
    if ($("dlgConsigneeEmail")) $("dlgConsigneeEmail").value = rec.consigneeEmail || rec.email || "";
    if ($("dlgConsigneePwd")) {
      $("dlgConsigneePwd").value = rec.consigneePwd || rec.legalPwd || "";
      $("dlgConsigneePwd").type = "password";
      if ($("dlgToggleConsigneePwd")) $("dlgToggleConsigneePwd").textContent = "显示";
    }
    if ($("dlgNotifySameAsConsignee")) {
      $("dlgNotifySameAsConsignee").checked =
        rec.notifySameAsConsignee !== false;
    }
    if ($("dlgConsigneeRemark")) $("dlgConsigneeRemark").value = rec.consigneeRemark || "";
    boundShipperIds = [];
    if ($("dlgShipperBoundList")) renderBoundShippers();
    if ($("dlgShipperEditor")) $("dlgShipperEditor").hidden = true;
    boundConsignorIds = [];
    if ($("dlgCnName")) $("dlgCnName").value = rec.consignorName || "";
    if ($("dlgCnAddr")) $("dlgCnAddr").value = rec.consignorAddr || "";
    if ($("dlgCnZip")) $("dlgCnZip").value = rec.consignorZip || "";
    if ($("dlgCnPhone")) $("dlgCnPhone").value = rec.consignorPhone || "";
    if ($("dlgCnUsci")) $("dlgCnUsci").value = rec.consignorUsci || "";
    if ($("dlgConsignorBoundList")) renderBoundConsignors();
    if ($("dlgConsignorEditor")) $("dlgConsignorEditor").hidden = true;
    $("dlgBondType").value = rec.bondType || "收货人";
    $("dlgBondInsCode").value = rec.bondInsCode || "054";
    $("dlgBondDate").value = rec.bondDate || "";
    $("dlgBondExpireDate").value = rec.bondExpireDate || "";
    $("dlgBondNo").value = rec.bondNo || "";
    if ($("dlgBondFace")) $("dlgBondFace").value = rec.bondFace != null ? rec.bondFace : 50000;
    if ($("dlgBondUsed")) $("dlgBondUsed").value = rec.bondUsed != null ? rec.bondUsed : 0;
    if ($("dlgBondTimesLimit")) $("dlgBondTimesLimit").value = rec.bondTimesLimit != null ? rec.bondTimesLimit : 250;
    $("dlgLegalName").value = rec.legalName || "";
    if ($("dlgBirth")) $("dlgBirth").value = rec.birth || "";
    $("dlgNationality").value = rec.nationality || "美国";
    syncIdTypeOptions(rec.idType || "护照");
    $("dlgPassport").value = rec.passport || "";
    if ($("dlgHasSeal")) $("dlgHasSeal").value = rec.hasSeal || "否";
    if ($("dlgAddrType")) $("dlgAddrType").value = rec.addrType || "真实地址";
    if ($("dlgAddress")) $("dlgAddress").value = rec.address || "";
    if ($("dlgAssignType")) $("dlgAssignType").value = rec.assignType || "散货专用";
    if ($("dlgUseChannel")) $("dlgUseChannel").value = rec.useChannel || "海运";
    $("dlgPhone").value = rec.phone || "";
    $("dlgStatus").value = rec.status || "inactive";
    $("dlgReason").value = rec.reason || "";
    expiryManualOverride = false;
    if ($("dlgExpireManualTag")) $("dlgExpireManualTag").hidden = true;
    syncReason();
    evalBond();
    evalQuota();
  }

  function emptyForm() {
    fillForm({
      code: "",
      name: "",
      limit: "",
      regCompany: "",
      regDate: "",
      poaAuth: "",
      consigneeHeader: "",
      shipperShort: "",
      shipperCountry: "美国",
      shipperContact: "",
      consigneeEmail: "",
      consigneePwd: "",
      notifySameAsConsignee: true,
      consigneeRemark: "",
      shipperIds: [],
      consignorIds: [],
      consignorName: "",
      consignorAddr: "",
      consignorZip: "",
      consignorPhone: "",
      consignorUsci: "",
      bondType: "收货人",
      bondInsCode: "054",
      bondDate: "",
      bondExpireDate: "",
      bondNo: "",
      bondFace: 50000,
      bondUsed: 0,
      bondTimesLimit: 250,
      legalName: "",
      birth: "",
      idType: "护照",
      passport: "",
      nationality: "美国",
      legalPwd: "",
      hasSeal: "否",
      addrType: "真实地址",
      address: "",
      assignType: "散货专用",
      useChannel: "海运",
      email: "",
      phone: "",
      status: "inactive",
      reason: "",
      brokerAuth: [],
      brokerRefuse: [],
    });
    $("dlgCode").readOnly = false;
  }

  function setModalLock(on) {
    document.body.classList.toggle("modal-open", on);
  }

  function close() {
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    if (typeof window.impSyncModalLock === "function") {
      window.impSyncModalLock();
    } else {
      setModalLock(false);
    }
  }

  function open(mode, code) {
    if (!modal) return;
    var title = mode === "create" ? "新增进口商" : "编辑进口商";
    $("importerFormModalTitle").textContent = title;
    $("importerFormModalSub").textContent =
      mode === "create" ? "填写主数据后保存 · 进口商/收件人 + 发货人" : code || "";
    if (mode === "create") {
      emptyForm();
    } else {
      var rec = RECORDS[code] || RECORDS["IMP-US-2024-018"];
      fillForm(rec);
      $("importerFormModalSub").textContent = rec.code + " · " + rec.name;
    }
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    if (typeof window.impSyncModalLock === "function") {
      window.impSyncModalLock();
    } else {
      setModalLock(true);
    }
  }

  function save() {
    if (!$("dlgName").value.trim()) {
      alert("请填写进口商名称");
      return;
    }
    if ($("dlgConsigneeEmail") && !$("dlgConsigneeEmail").value.trim()) {
      alert("请填写邮箱");
      return;
    }
    if (!$("dlgBondExpireDate").value) {
      alert("请填写 Bond 失效时间");
      return;
    }
    var bond = evalBond();
    var status = $("dlgStatus").value;
    if (bond.level === "expired" && status === "active") {
      alert(
        "无法保存：Bond 已失效，状态不能为「已启用」。请续保并更新失效时间，或改为「已停用」。"
      );
      return;
    }
    if (bond.level === "soon" && status === "active") {
      if (!confirm("Bond 将在 30 天内失效，当前仍为「已启用」。确定继续保存？")) return;
    }
    var quota = evalQuota();
    if (quota.level === "out") {
      if (
        !confirm(
          "Bond 额度已用尽（" +
            quota.used +
            "/" +
            quota.limit +
            " 次，面额规则 5万/250次）。确定仍保存？正式版应强制提额。"
        )
      )
        return;
    } else if (quota.level === "danger" || quota.level === "warn") {
      if (
        !confirm(
          "Bond 额度已达预警（已用 " +
            quota.used +
            "/" +
            quota.limit +
            "，剩余 " +
            quota.remain +
            " 次）。建议提额，是否继续保存？"
        )
      )
        return;
    }
    var code = $("dlgCode").value.trim() || "IMP-NEW";
    if (!RECORDS[code]) {
      RECORDS[code] = { code: code };
    }
    RECORDS[code].name = $("dlgName").value.trim();
    RECORDS[code].consigneeHeader = RECORDS[code].name;
    if ($("dlgShShort")) RECORDS[code].shipperShort = $("dlgShShort").value.trim();
    if ($("dlgShCountry")) RECORDS[code].shipperCountry = $("dlgShCountry").value;
    if ($("dlgShContact")) RECORDS[code].shipperContact = $("dlgShContact").value.trim();
    if ($("dlgConsigneeEmail")) {
      RECORDS[code].consigneeEmail = $("dlgConsigneeEmail").value.trim();
      RECORDS[code].email = RECORDS[code].consigneeEmail;
    }
    if ($("dlgConsigneePwd")) {
      RECORDS[code].consigneePwd = $("dlgConsigneePwd").value;
      RECORDS[code].legalPwd = RECORDS[code].consigneePwd;
    }
    if ($("dlgNotifySameAsConsignee")) {
      RECORDS[code].notifySameAsConsignee = $("dlgNotifySameAsConsignee").checked;
    }
    if ($("dlgConsigneeRemark")) RECORDS[code].consigneeRemark = $("dlgConsigneeRemark").value.trim();
    RECORDS[code].shipperIds = [];
    RECORDS[code].consignorIds = [];
    if ($("dlgCnName")) RECORDS[code].consignorName = $("dlgCnName").value.trim();
    if ($("dlgCnAddr")) RECORDS[code].consignorAddr = $("dlgCnAddr").value.trim();
    if ($("dlgCnZip")) RECORDS[code].consignorZip = $("dlgCnZip").value.trim();
    if ($("dlgCnPhone")) RECORDS[code].consignorPhone = $("dlgCnPhone").value.trim();
    if ($("dlgCnUsci")) RECORDS[code].consignorUsci = $("dlgCnUsci").value.trim();
    RECORDS[code].name = $("dlgName").value.trim();
    if ($("dlgBirth")) RECORDS[code].birth = $("dlgBirth").value;
    if ($("dlgIdType")) RECORDS[code].idType = $("dlgIdType").value;
    if ($("dlgNationality")) RECORDS[code].nationality = $("dlgNationality").value;
    if ($("dlgPassport")) RECORDS[code].passport = $("dlgPassport").value.trim();
    if ($("dlgHasSeal")) RECORDS[code].hasSeal = $("dlgHasSeal").value;
    if ($("dlgAddrType")) RECORDS[code].addrType = $("dlgAddrType").value;
    if ($("dlgAddress")) RECORDS[code].address = $("dlgAddress").value.trim();
    if ($("dlgAssignType")) RECORDS[code].assignType = $("dlgAssignType").value;
    if ($("dlgUseChannel")) RECORDS[code].useChannel = $("dlgUseChannel").value;
    if ($("dlgBondInsCode")) RECORDS[code].bondInsCode = $("dlgBondInsCode").value;
    alert(
      "已保存\n进口商：" +
        RECORDS[code].name +
        "\n证件：" +
        (RECORDS[code].nationality || "") +
        " " +
        (RECORDS[code].idType || "护照") +
        "\n密码：" +
        (RECORDS[code].consigneePwd ? "已维护" : "未维护") +
        "\n地址：" +
        (RECORDS[code].addrType || "") +
        "\nBond 分配：" +
        (RECORDS[code].assignType || "—") +
        "\n使用渠道：" +
        (RECORDS[code].useChannel || "—") +
        "\n发货人：" +
        (RECORDS[code].consignorName || "未填")
    );
    close();
  }

  function bindEvents() {
    modal = document.getElementById("importerFormModal");
    if (!modal) return;

    // migrate old id if present
    if (!$("dlgConsigneeHeader") && $("dlgShipperHeader")) {
      $("dlgShipperHeader").id = "dlgConsigneeHeader";
    }

    $("dlgStatus").addEventListener("change", function () {
      syncReason();
      var bond = evalBond();
      if (bond.level === "expired" && $("dlgStatus").value === "active") {
        $("dlgBondAlert").className = "dlg-bond-alert danger";
        $("dlgBondAlertText").textContent =
          "当前 Bond 已失效，「已启用」与 Bond 冲突，请改为已停用或更新失效时间。";
        $("dlgBondAlert").hidden = false;
      }
    });
    $("dlgBondType").addEventListener("change", function () {
      if (!expiryManualOverride) recalcExpireFromPurchase(false);
      evalBond();
    });
    $("dlgBondDate").addEventListener("change", function () {
      if (!expiryManualOverride) recalcExpireFromPurchase(false);
      evalBond();
    });
    $("dlgBondExpireDate").addEventListener("change", function () {
      expiryManualOverride = true;
      if ($("dlgExpireManualTag")) $("dlgExpireManualTag").hidden = false;
      evalBond();
    });
    if ($("dlgLinkRecalcExpire")) {
      $("dlgLinkRecalcExpire").addEventListener("click", function (e) {
        e.preventDefault();
        recalcExpireFromPurchase(true);
        evalBond();
      });
    }
    $("dlgBtnApplyBondStatus").addEventListener("click", applyBondSuggestion);
    ["dlgBondFace", "dlgBondUsed", "dlgBondTimesLimit"].forEach(function (id) {
      var el = $(id);
      if (!el) return;
      el.addEventListener("input", evalQuota);
      el.addEventListener("change", evalQuota);
    });
    $("importerFormModalClose").addEventListener("click", close);
    $("importerFormModalCancel").addEventListener("click", close);
    $("importerFormModalSave").addEventListener("click", save);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });

    if ($("dlgShipperBoundList")) {
      $("dlgShipperBoundList").addEventListener("click", function (e) {
        var btn = e.target.closest("[data-unbind]");
        if (!btn) return;
        var id = btn.getAttribute("data-unbind");
        boundShipperIds = boundShipperIds.filter(function (x) {
          return x !== id;
        });
        renderBoundShippers();
      });
    }


    var pwdBtn = $("dlgToggleConsigneePwd");
    if (pwdBtn) {
      pwdBtn.addEventListener("click", function () {
        var inp = $("dlgConsigneePwd");
        if (!inp) return;
        var show = inp.type === "password";
        inp.type = show ? "text" : "password";
        pwdBtn.textContent = show ? "隐藏" : "显示";
      });
    }
    var legalPwdBtn = $("dlgToggleLegalPwd");
    if (legalPwdBtn) {
      legalPwdBtn.addEventListener("click", function () {
        var inp = $("dlgLegalPwd");
        if (!inp) return;
        var show = inp.type === "password";
        inp.type = show ? "text" : "password";
        legalPwdBtn.textContent = show ? "隐藏" : "显示";
      });
    }
    if ($("dlgNationality")) {
      $("dlgNationality").addEventListener("change", function () {
        syncIdTypeOptions();
      });
    }

    document.querySelectorAll(".js-open-importer-form").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.getAttribute("data-mode") || "edit";
        var code = btn.getAttribute("data-code") || "";
        open(mode, code);
      });
    });

    var params = new URLSearchParams(location.search);
    var action = params.get("action");
    var code = params.get("code");
    if (action === "create") open("create");
    else if (action === "edit") open("edit", code || "IMP-US-2024-018");
  }

  window.ImpImporterFormDlg = {
    open: open,
    close: close,
    RECORDS: RECORDS,
    SHIPPERS: SHIPPERS,
    CONSIGNORS: CONSIGNORS,
    BROKER_CFG: BROKER_CFG,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }
})();
