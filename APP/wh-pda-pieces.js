/**
 * 仓库 PDA · 托上件数演示存储与核对
 * 业务规则：每次操作输入当前托盘件数；以最后一次成功操作为基准（见各页 PRD）
 */
(function (global) {
  var STORAGE_KEY = "wh_pda_pallet_pieces_v1";

  function readAll() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (_) {
      return {};
    }
  }

  function writeAll(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function normPallet(code) {
    return String(code || "").trim().toUpperCase();
  }

  var WH_PDA = {
    /** 签入上托：登记托上件数 */
    registerPieces: function (palletNo, pieces, meta) {
      var key = normPallet(palletNo);
      if (!key) return false;
      var n = parseInt(pieces, 10);
      if (!n || n < 1) return false;
      var all = readAll();
      all[key] = {
        pieces: n,
        registeredAt: new Date().toISOString(),
        serviceNo: (meta && meta.serviceNo) || "",
        area: (meta && meta.area) || ""
      };
      writeAll(all);
      return true;
    },

    /** 获取签入登记的件数 */
    getRegisteredPieces: function (palletNo) {
      var rec = readAll()[normPallet(palletNo)];
      return rec ? rec.pieces : null;
    },

    /** 核对件数是否与签入一致 */
    verifyPieces: function (palletNo, inputPieces) {
      var expected = this.getRegisteredPieces(palletNo);
      var actual = parseInt(inputPieces, 10);
      if (!expected) {
        return { ok: false, reason: "no_register", expected: null, actual: actual };
      }
      if (!actual || actual < 1) {
        return { ok: false, reason: "empty", expected: expected, actual: actual };
      }
      if (actual !== expected) {
        return { ok: false, reason: "mismatch", expected: expected, actual: actual };
      }
      return { ok: true, expected: expected, actual: actual };
    },

    seedDemo: function () {
      this.registerPieces("TP260811001", 43, { serviceNo: "SV20260811001", area: "A区-03" });
      this.registerPieces("TP260811002", 13, { serviceNo: "SV20260811002", area: "B区-12" });
    },

    clearAll: function () {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  global.WH_PDA = WH_PDA;
})(window);
