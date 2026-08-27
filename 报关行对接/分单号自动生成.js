/**
 * 分单号规则引擎（船司 × 港口）+ 终配舱后生成 + 货物/配舱调整整组重算
 * 分单号只给舱单用；报关行推送主键是报关编号，重算不触发 #03。
 * 规则口径对齐：产品部门/关务组/关务组-分单号规则表.html
 */
(function (global) {
  var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  function normCarrier(c) {
    c = (c || "").toUpperCase();
    if (/MATSON|美森|MATS/.test(c)) return "美森";
    if (/合德|HEDE/.test(c)) return "合德";
    if (/ZIM|以星/.test(c)) return "以星";
    if (/COSCO|OOCL|中远|东方海外/.test(c)) return /OOCL/.test(c) ? "OOCL" : "COSCO";
    if (/WHL|万海/.test(c)) return "WHL";
    if (/EMC|EVERGREEN|长荣|EGLV/.test(c)) return "EMC";
    if (/华南|SOUTH/.test(c)) return "华南";
    return c || "未知";
  }

  function normPort(p) {
    p = p || "";
    if (/上海|SHA|CNSHA/.test(p)) return "上海";
    if (/宁波|NGB|CNNGB/.test(p)) return "宁波";
    if (/厦门|XMN|CNXMN/.test(p)) return "厦门";
    if (/青岛|TAO|CNTAO/.test(p)) return "青岛";
    if (/华南|深圳|盐田|蛇口|YTN/.test(p)) return "华南";
    return p || "通用";
  }

  /**
   * @param {string} bl 提单号
   * @param {string} carrier
   * @param {string} port
   * @param {number} index 0-based 票序
   * @param {number} total 总票数
   * @returns {{ code: string, mode: 'auto'|'manual', rule: string, warn?: string, useCustNo?: boolean }}
   */
  function generateOne(bl, carrier, port, index, total) {
    var c = normCarrier(carrier);
    var p = normPort(port);
    var n = index + 1;
    bl = (bl || "").trim();

    if (c === "华南" || p === "华南") {
      return { code: "", mode: "auto", rule: "T7 客户单号为准", useCustNo: true };
    }

    // 美森
    if (c === "美森") {
      if (p === "上海") {
        var base = bl.slice(0, -1);
        var code = base + String(index);
        var warn = code.length !== bl.length ? "位数与提单不一致，请核对" : undefined;
        return { code: code, mode: "auto", rule: "删末位 + 0/1/2…（位数不变）", warn: warn };
      }
      if (p === "宁波") {
        if (index >= 26) {
          return { code: "", mode: "manual", rule: "后缀 A–Z，超 26 票需人工确认", warn: "超出 26 票，阻断自动" };
        }
        return { code: bl + LETTERS[index], mode: "auto", rule: "提单号 + A/B/C…" };
      }
    }

    // 合德
    if (c === "合德") {
      if (index === 0) return { code: bl, mode: "auto", rule: "第1票=主单" };
      return { code: bl + LETTERS[index - 1], mode: "auto", rule: "第2票起 +A/B/C…" };
    }

    // 以星
    if (c === "以星") {
      if (p === "上海") {
        return { code: "", mode: "manual", rule: "上海需单独申请（放舱时）", warn: "请从申请池录入或借用他票" };
      }
      if (p === "宁波") {
        return { code: bl + LETTERS[index], mode: "auto", rule: "提单号 + A/B/C…" };
      }
    }

    // COSCO / OOCL
    if (c === "COSCO" || c === "OOCL") {
      if (p === "上海") {
        if (index === 0) return { code: bl, mode: "auto", rule: "第1票=主单" };
        var suf = String(index).padStart(2, "0");
        return { code: bl + suf, mode: "auto", rule: "第2票起 +01/02…" };
      }
      if (p === "宁波" || p === "厦门") {
        if (n === total) return { code: bl + "Z", mode: "auto", rule: "最后一票强制 Z" };
        return { code: bl + LETTERS[index], mode: "auto", rule: "中间票 +A/B/C…；末票 Z" };
      }
      if (p === "青岛" && c === "COSCO") {
        if (!/0$/.test(bl)) {
          return { code: "", mode: "manual", rule: "青岛：去末位0再+1/2/3", warn: "提单末位非0，请手填" };
        }
        return { code: bl.slice(0, -1) + String(n), mode: "auto", rule: "去末位0 + 1/2/3…" };
      }
    }

    // WHL
    if (c === "WHL") {
      if (p === "上海") {
        return { code: "", mode: "manual", rule: "上海需单独申请", warn: "手填/申请后录入" };
      }
      if (p === "宁波" || p === "厦门") {
        return { code: bl + LETTERS[index], mode: "auto", rule: "提单号 + A/B/C…" };
      }
    }

    // EMC
    if (c === "EMC") {
      if (p === "上海") {
        if (index === 0) return { code: bl, mode: "auto", rule: "第1票=主单" };
        var stripped = bl.replace(/GLV/i, "");
        var a = "A" + String(index).padStart(2, "0");
        return { code: stripped + a, mode: "auto", rule: "去 GLV + A01/A02…" };
      }
      if (p === "宁波") {
        return { code: bl + LETTERS[index], mode: "auto", rule: "提单号 + A/B/C…" };
      }
      if (p === "青岛") {
        var base2 = bl.replace(/^EGLV/i, "");
        return { code: base2 + LETTERS[index], mode: "auto", rule: "去前缀 EGLV + A/B/C…" };
      }
    }

    // fallback: 字母后缀
    return {
      code: bl + (index === 0 ? "" : LETTERS[index - 1] || String(index)),
      mode: "auto",
      rule: "未匹配专用规则，暂用通用后缀（请核对规则表）",
      warn: "船司/港口规则未命中，请人工复核",
    };
  }

  /** 对货物列表按当前顺序批量生成 */
  function generateAll(bl, carrier, port, goods) {
    var total = goods.length;
    return goods.map(function (g, i) {
      var r = generateOne(bl, carrier, port, i, total);
      return Object.assign({}, g, {
        houseNo: r.code || (r.useCustNo ? g.custNo || "" : g.houseNo || ""),
        genMode: r.mode,
        genRule: r.rule,
        genWarn: r.warn || "",
        seq: i + 1,
      });
    });
  }

  /**
   * 货物/配舱调整后重算：增删改序 → 整组按新序重算
   * 已生成过分单号时打 dirty（待重算写入舱单），不触发报关行 #03
   */
  function afterGoodsChange(state, action) {
    var goods = state.goods.slice();
    if (action.type === "add") {
      goods.push(
        action.item || {
          custNo: "NEW-" + Date.now().toString().slice(-4),
          name: "新品名",
          pcs: 1,
          pushedHouseNo: "",
        }
      );
    } else if (action.type === "remove") {
      goods = goods.filter(function (_, i) {
        return i !== action.index;
      });
    } else if (action.type === "move") {
      var from = action.from;
      var to = action.to;
      if (from >= 0 && to >= 0 && from < goods.length && to < goods.length) {
        var item = goods.splice(from, 1)[0];
        goods.splice(to, 0, item);
      }
    } else if (action.type === "replace") {
      goods = action.goods || goods;
    }

    var next = generateAll(state.bl, state.carrier, state.port, goods);
    var wasPushed = !!state.pushedToBroker;
    var changed = next.some(function (g, i) {
      var old = goods[i];
      // compare with previously confirmed house nos
      var prev = (state.goods[i] && state.goods[i].houseNo) || "";
      // after regen, any difference vs last pushed snapshot
      var pushed = g.pushedHouseNo || (state.goods.find(function (x) {
        return x.custNo === g.custNo;
      }) || {}).pushedHouseNo || "";
      return wasPushed && g.houseNo && pushed && g.houseNo !== pushed;
    });
    // simpler dirty: any goods change while pushed
    var dirty = wasPushed;

    // preserve pushedHouseNo snapshot per custNo
    var pushedMap = {};
    state.goods.forEach(function (g) {
      if (g.pushedHouseNo) pushedMap[g.custNo] = g.pushedHouseNo;
    });
    next.forEach(function (g) {
      g.pushedHouseNo = pushedMap[g.custNo] || g.pushedHouseNo || "";
      g.sync =
        !state.pushedToBroker
          ? "未生成"
          : g.houseNo && g.pushedHouseNo && g.houseNo === g.pushedHouseNo
            ? "已生成"
            : "待重算";
    });

    return Object.assign({}, state, {
      goods: next,
      dirty: dirty,
      lastAction: action.type,
      needRepush: dirty,
    });
  }

  function markPushed(state) {
    var goods = state.goods.map(function (g) {
      return Object.assign({}, g, {
        pushedHouseNo: g.houseNo,
        sync: "已生成",
      });
    });
    return Object.assign({}, state, {
      goods: goods,
      pushedToBroker: true,
      dirty: false,
      needRepush: false,
      lastPushAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
  }

  /** Demo state for COSCO 青岛 / EMC 青岛 etc. */
  function demoState(key) {
    if (key === "emc") {
      return {
        bl: "EGLV2026060601",
        carrier: "EMC",
        port: "青岛",
        broker: "青岛港兴报关行",
        pushedToBroker: false,
        dirty: false,
        needRepush: false,
        goods: [
          { custNo: "YW-0606-01", name: "家纺", pcs: 100 },
          { custNo: "YW-0606-02", name: "毛巾", pcs: 80 },
          { custNo: "YW-0606-03", name: "拖鞋", pcs: 100 },
        ],
      };
    }
    // COSCO 上海 多票（与列表 COSU 行呼应）
    return {
      bl: "COSU6502971850",
      carrier: "COSCO",
      port: "上海",
      broker: "青岛港兴报关行",
      pushedToBroker: true,
      dirty: false,
      needRepush: false,
      lastPushAt: "2026-06-08 09:12",
      goods: [
        { custNo: "LH0608-64", name: "帽子", pcs: 64, houseNo: "COSU6502971850", pushedHouseNo: "COSU6502971850" },
        { custNo: "FBA19FJZJD9H", name: "服装", pcs: 1400, houseNo: "COSU650297185001", pushedHouseNo: "COSU650297185001" },
        { custNo: "HZ-0608-12", name: "包装袋", pcs: 40, houseNo: "COSU650297185002", pushedHouseNo: "COSU650297185002" },
      ],
    };
  }

  global.HouseBillEngine = {
    generateOne: generateOne,
    generateAll: generateAll,
    afterGoodsChange: afterGoodsChange,
    markPushed: markPushed,
    demoState: demoState,
    normCarrier: normCarrier,
    normPort: normPort,
  };
})(window);
