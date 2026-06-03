/**
 * 进口商新增/编辑弹窗（列表页内嵌，非 iframe）
 */
(function () {
  var RECORDS = {
    "IMP-US-2024-018": {
      code: "IMP-US-2024-018",
      name: "Pacific Trade Logistics LLC",
      limit: 500000,
      regCompany: "腾信物流（深圳）有限公司",
      regDate: "2024-03-15",
      poaAuth: "已授权",
      shipperHeader: "Pacific Trade Logistics Inc.",
      bondType: "收货人",
      bondInsCode: "054",
      bondDate: "2024-03-18",
      bondExpireDate: "2025-03-18",
      bondNo: "SUR-TE-88421",
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
      shipperHeader: "East Coast Logistics LLC",
      bondType: "发货人",
      bondInsCode: "856",
      bondDate: "2025-01-10",
      bondExpireDate: "2025-04-10",
      bondNo: "",
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
      shipperHeader: "",
      bondType: "收货人",
      bondInsCode: "036",
      bondDate: "2022-02-01",
      bondExpireDate: "2023-02-01",
      bondNo: "",
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
      shipperHeader: "Sunrise Global Trading Co.",
      bondType: "发货人",
      bondInsCode: "054",
      bondDate: "2025-02-05",
      bondExpireDate: "2026-02-05",
      bondNo: "",
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

  function evalBond() {
    var bondDateEl = $("dlgBondDate");
    var bondExpireDateEl = $("dlgBondExpireDate");
    var bondAlert = $("dlgBondAlert");
    var bondAlertText = $("dlgBondAlertText");
    var btnApplyBondStatus = $("dlgBtnApplyBondStatus");
    var statusEl = $("dlgStatus");
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
        "Bond 将在 " +
        daysLeft +
        " 天后失效（" +
        expiryStr +
        "）。建议改为「临期」或「停用待观察」。";
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

  function fillForm(rec) {
    $("dlgCode").value = rec.code || "";
    $("dlgCode").readOnly = !!rec.code;
    $("dlgName").value = rec.name || "";
    $("dlgLimit").value = rec.limit === 0 || rec.limit ? rec.limit : "";
    $("dlgRegCompany").value = rec.regCompany || "";
    $("dlgRegDate").value = rec.regDate || "";
    $("dlgPoaAuth").value = rec.poaAuth || "";
    $("dlgShipperHeader").value = rec.shipperHeader || "";
    $("dlgBondType").value = rec.bondType || "收货人";
    $("dlgBondInsCode").value = rec.bondInsCode || "054";
    $("dlgBondDate").value = rec.bondDate || "";
    $("dlgBondExpireDate").value = rec.bondExpireDate || "";
    $("dlgBondNo").value = rec.bondNo || "";
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
  }

  function emptyForm() {
    fillForm({
      code: "",
      name: "",
      limit: "",
      regCompany: "",
      regDate: "",
      poaAuth: "",
      shipperHeader: "",
      bondType: "收货人",
      bondInsCode: "054",
      bondDate: "",
      bondExpireDate: "",
      bondNo: "",
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
      mode === "create" ? "填写主数据后保存" : code || "";
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
    alert("原型演示：已保存进口商主数据（未接后端）");
    close();
  }

  function bindEvents() {
    modal = document.getElementById("importerFormModal");
    if (!modal) return;

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
    $("importerFormModalClose").addEventListener("click", close);
    $("importerFormModalCancel").addEventListener("click", close);
    $("importerFormModalSave").addEventListener("click", save);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });

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

  window.ImpImporterFormDlg = { open: open, close: close, RECORDS: RECORDS };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindEvents);
  } else {
    bindEvents();
  }
})();
