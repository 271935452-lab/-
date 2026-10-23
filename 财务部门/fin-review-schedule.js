/**
 * 财务需求评审排期：设计天数按条数拉开差距（非每场 2～3 天封顶）。
 * 默认 designDays = ceil(条数 / ITEMS_PER_DESIGN_DAY)，仅设单场下限 1；可 per-phase 覆盖。
 * 总盘：结论 9 内部评审结束锚定 ANCHOR_LAST_INTERNAL_END（默认 2027-01-15，可延到 1 月内），
 * 若链式排期超过锚点则自动略提高 ITEMS_PER_DESIGN_DAY 直至不晚于锚点。
 */
(function (global) {
  var ITEMS_PER_DESIGN_DAY = 4;
  var MIN_DESIGN_DAYS = 1;
  var ANCHOR_LAST_INTERNAL_END = "2027-01-15";

  function parseYmd(s) {
    if (!s) return null;
    var p = String(s).split("-");
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function isWorkday(d) {
    var w = d.getDay();
    return w !== 0 && w !== 6;
  }

  function addWorkdays(d, n) {
    if (!d || n === 0) return d;
    var step = n > 0 ? 1 : -1;
    var left = Math.abs(n);
    var cur = new Date(d.getTime());
    while (left) {
      cur.setDate(cur.getDate() + step);
      if (isWorkday(cur)) left--;
    }
    return cur;
  }

  function designDaysFor(phase, ipp) {
    var rate = ipp != null ? ipp : ITEMS_PER_DESIGN_DAY;
    if (phase.designDays != null && phase.designDays > 0) {
      return Math.max(MIN_DESIGN_DAYS, phase.designDays);
    }
    var n = phase.count || 0;
    return Math.max(MIN_DESIGN_DAYS, Math.ceil(n / rate));
  }

  function formatCell(d) {
    if (!d) return "—";
    var wd = "日一二三四五六"[d.getDay()];
    return (d.getMonth() + 1) + "/" + String(d.getDate()).padStart(2, "0") + " " + wd;
  }

  function formatRange(s, e) {
    if (!s) return "—";
    if (!e || s.getTime() === e.getTime()) return formatCell(s);
    return (s.getMonth() + 1) + "/" + String(s.getDate()).padStart(2, "0") +
      "–" + (e.getMonth() + 1) + "/" + String(e.getDate()).padStart(2, "0");
  }

  /** 原设计 N 天：前 N-1 天为设计完成，第 N 天为业务签字；财务评审与业务签字同日（总日历与旧版一致） */
  function splitDesignBizFinance(designStart, scheduledDays) {
    var dd = Math.max(1, scheduledDays);
    var designEnd;
    var bizSign;
    if (dd <= 1) {
      designEnd = designStart;
      bizSign = designStart;
    } else {
      designEnd = addWorkdays(designStart, dd - 2);
      bizSign = addWorkdays(designEnd, 1);
    }
    var financeReview = bizSign;
    return { designEnd: designEnd, bizSign: bizSign, financeReview: financeReview };
  }

  var PHASES = [
    {
      id: "0",
      count: 6,
      locked: true,
      designStartLabel: "已完成",
      designEnd: "2026-10-12",
      internalLabel: "已完成"
    },
    {
      id: "1",
      count: 8,
      locked: true,
      designStart: "2026-10-13",
      designEnd: "2026-10-15",
      internalLabel: "已完成"
    },
    {
      id: "1.1",
      count: 1,
      designDays: 1,
      internalStart: "2026-10-23",
      internalEnd: "2026-10-26",
      internalNote: "内部评审 10/23–10/26 完成（跨周末，仅工作日开会）"
    },
    { id: "1.2", count: 1, designDays: 2, designDaysNote: "整柜方案/原型偏重" },
    { id: "2", count: 15 },
    { id: "3", count: 21 },
    { id: "4", count: 32, designDays: 7, designDaysNote: "提成管理 · 较 ⌈32÷4⌉ 少 1 天，挪给结论 5 成本" },
    { id: "5", count: 18, designDays: 5, designDaysNote: "成本对账/应付 · 较 ⌈18÷4⌉ 多 1 天（来自结论 4）" },
    { id: "6", count: 2, designDays: 2, designDaysNote: "合同调整与中信保同屏，固定 2 天" },
    { id: "7", count: 14 },
    { id: "8", count: 29 },
    { id: "9", count: 19 }
  ];

  function computeForward(ipp) {
    var out = {};
    var prevInternalEnd = null;

    PHASES.forEach(function (phase) {
      if (phase.locked) {
        var de = phase.designEnd ? parseYmd(phase.designEnd) : null;
        var ds = phase.designStart ? parseYmd(phase.designStart) : null;
        var split = null;
        if (de && ds) {
          var span = 1;
          var t = new Date(ds.getTime());
          while (t.getTime() < de.getTime()) {
            t = addWorkdays(t, 1);
            span++;
          }
          split = splitDesignBizFinance(ds, span);
        } else if (de) {
          split = {
            designEnd: addWorkdays(de, -1),
            bizSign: de,
            financeReview: de
          };
        }
        out[phase.id] = {
          designStart: ds,
          designEnd: split ? split.designEnd : de,
          designStartLabel: phase.designStartLabel || (ds ? formatCell(ds) : "已完成"),
          designEndLabel: split ? formatCell(split.designEnd) : (de ? formatCell(de) : "—"),
          signFinLabel: phase.signFinLabel || (split ? formatCell(split.financeReview) : (de ? formatCell(de) : "—")),
          bizSignLabel: phase.bizSignLabel || (split ? formatCell(split.bizSign) : "—"),
          financeReviewLabel: phase.financeReviewLabel || (split ? formatCell(split.financeReview) : (de ? formatCell(de) : "—")),
          internalLabel: phase.internalLabel || "—",
          internalEnd: null,
          designDays: null,
          count: phase.count
        };
        if (de && phase.internalLabel === "已完成") {
          var gate = split ? split.financeReview : de;
          var intS2 = addWorkdays(gate, 1);
          prevInternalEnd = addWorkdays(intS2, 1);
          out[phase.id].internalEnd = prevInternalEnd;
        }
        return;
      }

      var dd = designDaysFor(phase, ipp);
      var designStart = addWorkdays(prevInternalEnd, 1);
      var split = splitDesignBizFinance(designStart, dd);
      var intStart = addWorkdays(split.financeReview, 1);
      var intEnd = addWorkdays(intStart, 1);
      if (phase.internalStart && phase.internalEnd) {
        intStart = parseYmd(phase.internalStart);
        intEnd = parseYmd(phase.internalEnd);
      }
      prevInternalEnd = intEnd;

      out[phase.id] = {
        designStart: designStart,
        designEnd: split.designEnd,
        designStartLabel: formatCell(designStart),
        designEndLabel: formatCell(split.designEnd),
        signFinLabel: formatCell(split.financeReview),
        bizSignLabel: formatCell(split.bizSign),
        financeReviewLabel: formatCell(split.financeReview),
        internalLabel: formatRange(intStart, intEnd),
        internalEnd: intEnd,
        designDays: dd,
        count: phase.count,
        designDaysNote: phase.designDaysNote || null,
        internalNote: phase.internalNote || null
      };
    });

    return out;
  }

  function lastInternalEnd(map) {
    var last = null;
    PHASES.forEach(function (p) {
      var row = map[p.id];
      if (row && row.internalEnd) last = row.internalEnd;
    });
    return last;
  }

  function computeAll() {
    var anchor = parseYmd(ANCHOR_LAST_INTERNAL_END);
    var ipp = ITEMS_PER_DESIGN_DAY;
    var map = computeForward(ipp);
    var guard = 0;
    while (anchor && lastInternalEnd(map) && lastInternalEnd(map).getTime() > anchor.getTime() && guard < 20) {
      ipp += 0.5;
      ipp = Math.round(ipp * 10) / 10;
      map = computeForward(ipp);
      guard++;
    }
    map._meta = {
      itemsPerDesignDay: ipp,
      anchorInternalEnd: ANCHOR_LAST_INTERNAL_END,
      lastInternalEnd: lastInternalEnd(map)
    };
    return map;
  }

  function applyToReviewPlanTable() {
    var map = computeAll();
    var meta = map._meta || {};
    var ipp = meta.itemsPerDesignDay || ITEMS_PER_DESIGN_DAY;
    document.querySelectorAll("tr[data-phase-id]").forEach(function (tr) {
      var id = tr.getAttribute("data-phase-id");
      var row = map[id];
      if (!row) return;
      var elStart = tr.querySelector(".js-design-start");
      var elEnd = tr.querySelector(".js-design-end");
      var elSignFin = tr.querySelector(".js-sign-fin");
      var elInt = tr.querySelector(".js-internal");
      if (elStart) {
        elStart.textContent = row.designStartLabel || "—";
        if (row.designDays != null) {
          if (row.designDaysNote) {
            elStart.title = row.count + " 条 · 设计 " + row.designDays + " 天 · " + row.designDaysNote;
          }
        }
      }
      if (elEnd) elEnd.textContent = row.designEndLabel || "—";
      if (elSignFin) {
        elSignFin.textContent = row.signFinLabel || row.financeReviewLabel || row.bizSignLabel || "—";
      }
      if (elInt) {
        elInt.textContent = row.internalLabel || "—";
        if (row.internalNote) elInt.title = row.internalNote;
      }
    });
  }

  global.FIN_REVIEW_SCHEDULE = {
    ITEMS_PER_DESIGN_DAY: ITEMS_PER_DESIGN_DAY,
    ANCHOR_LAST_INTERNAL_END: ANCHOR_LAST_INTERNAL_END,
    PHASES: PHASES,
    computeAll: computeAll,
    formatCell: formatCell,
    formatRange: formatRange,
    applyToReviewPlanTable: applyToReviewPlanTable
  };
})(typeof window !== "undefined" ? window : global);
