/**
 * 进口商新增/编辑弹窗（列表页内嵌）
 * 收件人信息（抬头/邮箱/密码 + 通知人同收件人）+ 发件人库维护与绑定
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

  var RECORDS = {
    "IMP-US-2024-018": {
      code: "IMP-US-2024-018",
      name: "Pacific Trade Logistics LLC",
      limit: 500000,
      regCompany: "腾信物流（深圳）有限公司",
      regDate: "2024-03-15",
      poaAuth: "已授权",
      consigneeHeader: "Pacific Trade Logistics LLC",
      consigneeEmail: "consignee@pacifictrade.example.com",
      consigneePwd: "Pt#2024login",
      notifySameAsConsignee: true,
      shipperIds: ["SHP001", "SHP002"],
      bondType: "收货人",
      bondInsCode: "054",
      bondDate: "2024-03-18",
      bondExpireDate: "2025-03-18",
      bondNo: "SUR-TE-88421",
      bondFace: 50000,
      bondUsed: 48,
      bondTimesLimit: 250,
      legalName: "Michael Chen",
      passport: "E12345678",
      nationality: "美国",
      email: "m.chen@pacifictrade.example.com",
      phone: "+1 310-555-0188",
      status: "active",
      reason: "",
    },
    "IMP-US-2023-006": {
      code: "IMP-US-2023-006",
      name: "East Coast Import Co.",
      limit: 200000,
      regCompany: "腾信物流（上海）有限公司",
      regDate: "2023-08-02",
      poaAuth: "已授权",
      consigneeHeader: "East Coast Import Co.",
      consigneeEmail: "recv@eastcoast.example.com",
      consigneePwd: "",
      notifySameAsConsignee: true,
      shipperIds: ["SHP003"],
      bondType: "发货人",
      bondInsCode: "856",
      bondDate: "2025-01-10",
      bondExpireDate: "2025-04-10",
      bondNo: "",
      bondFace: 50000,
      bondUsed: 228,
      bondTimesLimit: 250,
      legalName: "Lisa Wang",
      passport: "G98765432",
      nationality: "中国",
      email: "lisa.wang@eastcoast.example.com",
      phone: "+1 212-555-2200",
      status: "watch",
      reason: "近30天查验率偏高，维持观察",
    },
    "IMP-US-2022-001": {
      code: "IMP-US-2022-001",
      name: "Legacy Harbor Inc.",
      limit: 0,
      regCompany: "外部合作方 A",
      regDate: "2022-01-20",
      poaAuth: "未授权",
      consigneeHeader: "Legacy Harbor Inc.",
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
      passport: "P55443322",
      nationality: "美国",
      email: "",
      phone: "",
      status: "disabled",
      reason: "Bond过期未续",
    },
    "IMP-US-2025-003": {
      code: "IMP-US-2025-003",
      name: "Sunrise Global LLC",
      limit: 350000,
      regCompany: "腾信物流（深圳）有限公司",
      regDate: "2025-02-01",
      poaAuth: "未授权",
      consigneeHeader: "Sunrise Global LLC",
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
      passport: "M11223344",
      nationality: "韩国",
      email: "d.kim@sunriseglobal.example.com",
      phone: "+1 424-555-9901",
      status: "inactive",
      reason: "",
    },
  };

  var BOND_MONTHS = 12;
  var modal;
  var expiryManualOverride = false;
  var suggestedStatus = null;
  var suggestedReason = "";
  var boundShipperIds = [];

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
        $("dlgExpireManualTag").hidden = true;
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

  function fillForm(rec) {
    $("dlgCode").value = rec.code || "";
    $("dlgCode").readOnly = !!rec.code;
    $("dlgName").value = rec.name || "";
    $("dlgLimit").value = rec.limit === 0 || rec.limit ? rec.limit : "";
    $("dlgRegCompany").value = rec.regCompany || "";
    $("dlgRegDate").value = rec.regDate || "";
    $("dlgPoaAuth").value = rec.poaAuth || "";
    var consignee =
      rec.consigneeHeader ||
      rec.shipperHeader ||
      rec.name ||
      "";
    $("dlgConsigneeHeader").value = consignee;
    if ($("dlgConsigneeEmail")) $("dlgConsigneeEmail").value = rec.consigneeEmail || "";
    if ($("dlgConsigneePwd")) {
      $("dlgConsigneePwd").value = rec.consigneePwd || "";
      $("dlgConsigneePwd").type = "password";
      if ($("dlgToggleConsigneePwd")) $("dlgToggleConsigneePwd").textContent = "显示";
    }
    if ($("dlgNotifySameAsConsignee")) {
      $("dlgNotifySameAsConsignee").checked =
        rec.notifySameAsConsignee !== false;
    }
    boundShipperIds = (rec.shipperIds || []).slice();
    renderBoundShippers();
    $("dlgShipperEditor").hidden = true;
    $("dlgBondType").value = rec.bondType || "收货人";
    $("dlgBondInsCode").value = rec.bondInsCode || "054";
    $("dlgBondDate").value = rec.bondDate || "";
    $("dlgBondExpireDate").value = rec.bondExpireDate || "";
    $("dlgBondNo").value = rec.bondNo || "";
    if ($("dlgBondFace")) $("dlgBondFace").value = rec.bondFace != null ? rec.bondFace : 50000;
    if ($("dlgBondUsed")) $("dlgBondUsed").value = rec.bondUsed != null ? rec.bondUsed : 0;
    if ($("dlgBondTimesLimit")) $("dlgBondTimesLimit").value = rec.bondTimesLimit != null ? rec.bondTimesLimit : 250;
    $("dlgLegalName").value = rec.legalName || "";
    $("dlgPassport").value = rec.passport || "";
    $("dlgNationality").value = rec.nationality || "美国";
    $("dlgEmail").value = rec.email || "";
    $("dlgPhone").value = rec.phone || "";
    $("dlgStatus").value = rec.status || "inactive";
    $("dlgReason").value = rec.reason || "";
    expiryManualOverride = false;
    $("dlgExpireManualTag").hidden = true;
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
      consigneeEmail: "",
      consigneePwd: "",
      notifySameAsConsignee: true,
      shipperIds: [],
      bondType: "收货人",
      bondInsCode: "054",
      bondDate: "",
      bondExpireDate: "",
      bondNo: "",
      bondFace: 50000,
      bondUsed: 0,
      bondTimesLimit: 250,
      legalName: "",
      passport: "",
      nationality: "美国",
      email: "",
      phone: "",
      status: "inactive",
      reason: "",
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
      mode === "create" ? "填写主数据后保存 · 收件人信息 + 发件人绑定" : code || "";
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
    if (!$("dlgConsigneeHeader").value.trim()) {
      alert("请填写收件人抬头");
      return;
    }
    if ($("dlgConsigneeEmail") && !$("dlgConsigneeEmail").value.trim()) {
      alert("请填写收件人邮箱");
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
    RECORDS[code].consigneeHeader = $("dlgConsigneeHeader").value.trim();
    if ($("dlgConsigneeEmail")) RECORDS[code].consigneeEmail = $("dlgConsigneeEmail").value.trim();
    if ($("dlgConsigneePwd")) RECORDS[code].consigneePwd = $("dlgConsigneePwd").value;
    if ($("dlgNotifySameAsConsignee")) {
      RECORDS[code].notifySameAsConsignee = $("dlgNotifySameAsConsignee").checked;
    }
    RECORDS[code].shipperIds = boundShipperIds.slice();
    RECORDS[code].name = $("dlgName").value.trim();
    alert(
      "原型演示：已保存\n收件人：" +
        RECORDS[code].consigneeHeader +
        "\n收件人邮箱：" +
        (RECORDS[code].consigneeEmail || "—") +
        "\n收件人密码：" +
        (RECORDS[code].consigneePwd ? "已维护" : "未维护") +
        "\n通知人：" +
        (RECORDS[code].notifySameAsConsignee !== false ? "同收件人" : "另行指定") +
        "\n绑定发件人：" +
        (boundShipperIds.length
          ? boundShipperIds
              .map(function (id) {
                return (SHIPPERS[id] && SHIPPERS[id].shortName) || id;
              })
              .join("、")
          : "无")
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
      $("dlgExpireManualTag").hidden = false;
      evalBond();
    });
    $("dlgLinkRecalcExpire").addEventListener("click", function (e) {
      e.preventDefault();
      recalcExpireFromPurchase(true);
      evalBond();
    });
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

    $("dlgShipperBoundList").addEventListener("click", function (e) {
      var btn = e.target.closest("[data-unbind]");
      if (!btn) return;
      var id = btn.getAttribute("data-unbind");
      boundShipperIds = boundShipperIds.filter(function (x) {
        return x !== id;
      });
      renderBoundShippers();
    });

    $("dlgBtnBindShipper").addEventListener("click", function () {
      var id = $("dlgShipperPick").value;
      if (!id) {
        alert("请选择发件人");
        return;
      }
      if (boundShipperIds.indexOf(id) < 0) boundShipperIds.push(id);
      renderBoundShippers();
    });

    $("dlgBtnNewShipper").addEventListener("click", function () {
      $("dlgShipperEditor").hidden = false;
      $("dlgShName").focus();
    });
    $("dlgBtnCancelShipper").addEventListener("click", function () {
      $("dlgShipperEditor").hidden = true;
    });
    $("dlgBtnSaveShipper").addEventListener("click", function () {
      var name = $("dlgShName").value.trim();
      if (!name) {
        alert("请填写发件人名称");
        return;
      }
      var id = "SHP" + String(Object.keys(SHIPPERS).length + 101);
      SHIPPERS[id] = {
        id: id,
        name: name,
        shortName: $("dlgShShort").value.trim() || name.slice(0, 12),
        addr: $("dlgShAddr").value.trim(),
        contact: $("dlgShContact").value.trim(),
        phone: $("dlgShPhone").value.trim(),
        email: $("dlgShEmail").value.trim(),
        country: $("dlgShCountry").value,
      };
      if (boundShipperIds.indexOf(id) < 0) boundShipperIds.push(id);
      $("dlgShipperEditor").hidden = true;
      ["dlgShName", "dlgShShort", "dlgShAddr", "dlgShContact", "dlgShPhone", "dlgShEmail"].forEach(
        function (fid) {
          $(fid).value = "";
        }
      );
      renderBoundShippers();
      alert("已新增发件人并绑定到当前进口商（原型）");
    });

    // 名称变更时若收件人空则带出
    $("dlgName").addEventListener("blur", function () {
      if (!$("dlgConsigneeHeader").value.trim() && $("dlgName").value.trim()) {
        $("dlgConsigneeHeader").value = $("dlgName").value.trim();
      }
    });

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
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }
})();
