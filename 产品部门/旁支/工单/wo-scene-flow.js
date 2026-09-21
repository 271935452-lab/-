/**
 * 演示场景记录。横轴=配置状态，纵轴=阶段+场景。
 * 同一份 localStorage：业务客服工作台写入后，履约工作台海外客服看到同一条并继续。
 */
(function () {
  var KEY = "wo-scene-records-v1";
  var SCENES = [
    {
      id: "preload-label",
      stage: "装柜完成前",
      name: "贴标",
      path: ["draft", "start", "exec", "push", "wh", "accept"],
      pushText: "推送到工单履约 PDA",
      whMode: "pda",
      feeText: "确认后写入预估（发起确认）和应付（国内仓返回的费用）",
      note: "",
      entry: { refLabel: "柜号 / 运单号", ask: "贴标范围、时限", showLabel: true }
    },
    {
      id: "pre-meiku",
      stage: "港前",
      name: "美库拦截",
      path: ["draft", "start", "exec", "push", "wh", "accept"],
      pushText: "自动修改柜子计划配置的数据后再推送",
      whMode: "meiku",
      feeText: "确认后写入预估（发起确认）和应付（海外仓返回的费用）",
      note: "验收驳回退回仓库重做，不自动新开美库单（表内未定）",
      entry: { refLabel: "柜号", ask: "拦截说明" }
    },
    {
      id: "pre-private",
      stage: "港前",
      name: "私仓拦截",
      path: ["draft", "start", "exec", "push", "wh"],
      pushText: "手动修改，不自动推美库",
      whMode: "manual",
      feeText: "",
      note: "验收格为空，手动上传后结束。表内未定是否卡出发登记",
      entry: { refLabel: "柜号", ask: "拦截说明。仓库侧是手动处理并上传附件" }
    },
    {
      id: "post-meiku",
      stage: "港后",
      name: "美库拦截",
      path: ["draft", "start", "whAsk", "approve", "exec", "push", "wh", "accept"],
      pushText: "自动修改柜子计划配置的数据后再推送",
      whMode: "meiku",
      feeText: "确认后写入预估（发起确认）和应付（海外仓返回的费用）",
      note: "先由港后客服确认能否拦截；可拦截才引用审批流。验收驳回不新开单",
      entry: { refLabel: "单号 / 柜号", ask: "客户诉求。拦截原因和费用在履约确认可拦截时再填" }
    },
    {
      id: "post-private",
      stage: "港后",
      name: "私仓拦截",
      path: ["draft", "start", "exec", "push", "wh", "accept"],
      pushText: "手动修改，不自动推美库",
      whMode: "manual",
      feeText: "确认后写入预估（发起确认）和应付（海外仓返回的费用）",
      note: "",
      entry: { refLabel: "单号 / 柜号", ask: "拦截说明。仓库侧是手动处理并上传附件" }
    },
    {
      id: "reissue",
      stage: "尾程",
      name: "重出",
      path: ["draft", "start", "exec", "label", "push", "wh", "accept"],
      execMode: "reissue",
      pushText: "将面单信息、单号全部传到美库推送",
      whMode: "meiku",
      feeText: "确认后写入预估（发起确认）和应付（海外仓返回的费用）",
      note: "",
      entry: { refLabel: "根运单号", ask: "重出原因", needSub: true, showAddr: true }
    }
  ];

  var STATUS_NAME = {
    draft: "保存草稿",
    start: "发起",
    rework: "发起 · 待修改",
    whAsk: "待海外仓确认",
    approve: "上级确认（引用审批流）",
    exec: "工单确认执行",
    label: "业务客服确认面单",
    push: "推送国内仓/海外仓",
    wh: "仓库状态",
    accept: "业务客服验收确认",
    done: "已验收",
    closed: "已关闭"
  };

  function sceneById(id) {
    for (var i = 0; i < SCENES.length; i++) if (SCENES[i].id === id) return SCENES[i];
    return SCENES[0];
  }

  function nextStatus(scene, from) {
    var i = scene.path.indexOf(from);
    if (i < 0) return scene.path[0];
    return scene.path[i + 1] || "done";
  }

  function now() {
    var d = new Date();
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
  }

  function demoSeed(id, sceneId, status, refNo, note, extra) {
    extra = extra || {};
    var scene = sceneById(sceneId);
    return {
      id: id,
      sceneId: scene.id,
      stage: scene.stage,
      scene: scene.name,
      refNo: refNo,
      note: note,
      subNo: extra.subNo || "",
      status: status,
      prev: extra.prev || "",
      whSub: "",
      closeOnly: !!extra.closeOnly,
      returnTo: extra.returnTo || "",
      interceptReason: "",
      fee: "",
      address: extra.address || "",
      newNo: extra.newNo || "",
      whReturn: extra.whReturn || "",
      whFee: extra.whFee || "",
      logs: extra.logs || [],
      createdAt: extra.createdAt || "09-20 09:00",
      updatedAt: extra.updatedAt || "09-20 09:12"
    };
  }

  function load() {
    var list;
    try { list = JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    var have = {};
    list.forEach(function (r) { if (r && r.id) have[r.id] = 1; });
    var seeds = [
      demoSeed("SC-DEMO-DRAFT", "preload-label", "draft", "EMSU-LB-1001", "外箱正唛，未提交", {
        logs: [{ t: "09-20 09:00", text: "保存草稿 · 装柜完成前 · 贴标" }]
      }),
      demoSeed("SC-DEMO-DRAFT2", "pre-private", "draft", "EMSU-PV-1008", "私仓拦截说明还没写完", {
        logs: [{ t: "09-20 09:02", text: "保存草稿 · 港前 · 私仓拦截" }]
      }),
      demoSeed("SC-DEMO-REWORK", "pre-meiku", "rework", "EMSU-MK-2002", "拦截说明不完整，履约已打回", {
        prev: "exec",
        returnTo: "exec",
        logs: [{ t: "09-20 09:06", text: "履约工作台驳回：拦截说明不完整" }]
      }),
      demoSeed("SC-DEMO-REWORK2", "post-meiku", "rework", "FBA-US-8841", "仓确认不可拦截，只能关闭", {
        prev: "whAsk",
        closeOnly: true,
        logs: [{ t: "09-20 09:08", text: "确认不可拦截：货已出库 · 交业务客服关闭" }]
      }),
      demoSeed("SC-DEMO-ACCEPT", "post-private", "accept", "EMSU-PV-3003", "私仓已上传处理结果", {
        prev: "wh",
        whReturn: "已拦截，照片已传",
        logs: [{ t: "09-20 09:10", text: "手动处理并上传附件 · 进入业务客服验收" }]
      }),
      demoSeed("SC-DEMO-ACCEPT2", "reissue", "accept", "WB-99021", "重出面单已回传", {
        prev: "wh",
        subNo: "PKG-SUB-3391",
        newNo: "PKG-NEW-7720",
        whReturn: "新面单已贴，待验收",
        whFee: "12.00",
        logs: [{ t: "09-20 09:11", text: "仓库确认回传：新面单已贴 · 费用 12.00 · 进入业务客服验收" }]
      })
    ];
    var added = false;
    seeds.forEach(function (s) {
      if (have[s.id]) return;
      list.push(s);
      added = true;
    });
    if (added) save(list);
    return list;
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function ownerOf(rec) {
    var scene = sceneById(rec.sceneId);
    if (rec.status === "wh" && scene.whMode === "pda") return "pda";
    if (rec.status === "draft" || rec.status === "rework" || rec.status === "label" || rec.status === "accept") return "cs";
    if (rec.status === "push" || rec.status === "wh") return "sys";
    if (rec.status === "whAsk" || rec.status === "approve" || rec.status === "exec") return "ops";
    return "none";
  }

  function canWithdraw(rec) {
    if (rec.status === "approve" || rec.status === "exec" || rec.status === "label" || rec.status === "push") return !!rec.prev;
    if (rec.status === "wh" && (rec.whSub === "recv" || !rec.whSub)) return !!rec.prev;
    return false;
  }

  function find(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function log(rec, text) {
    rec.logs.unshift({ t: now(), text: text });
    rec.updatedAt = now();
  }

  function go(rec, status, prev) {
    rec.prev = prev || rec.status;
    rec.status = status;
    rec.closeOnly = false;
  }

  function act(id, action, extra) {
    extra = extra || {};
    var list = load();
    var rec = find(list, id);
    if (!rec) return;
    var scene = sceneById(rec.sceneId);
    if (action === "submit" || action === "resubmit") {
      if (extra.refNo) rec.refNo = extra.refNo;
      if (extra.note != null) rec.note = extra.note;
      if (extra.subNo != null) rec.subNo = extra.subNo;
      if (extra.address != null) rec.address = extra.address;
      var dest = action === "resubmit" && rec.returnTo ? rec.returnTo : nextStatus(scene, "start");
      rec.returnTo = "";
      go(rec, dest, "draft");
      log(rec, (action === "resubmit" ? "修改确认重新提交" : "发起") + " · " + rec.refNo + (rec.note ? " · " + rec.note : "") + " · 交给履约工作台");
    } else if (action === "close") {
      go(rec, "closed", rec.status);
      log(rec, "业务客服关闭" + (extra.reason ? "：" + extra.reason : ""));
    } else if (action === "execOk") {
      var feas = extra.feas || [];
      var ready = extra.ready || [];
      if (!Array.isArray(feas)) feas = feas ? [feas] : [];
      if (!Array.isArray(ready)) ready = ready ? [ready] : [];
      if (feas.length < 4 || ready.length < 4) return "确认执行要勾选全部可行性与执行准备（接单已并入此步）";
      rec.execConfirm = { feas: feas, ready: ready };
      go(rec, nextStatus(scene, "exec"), "exec");
      log(rec, "履约工作台确认执行（含接单）· 可行性 " + feas.join("、") + "；执行准备 " + ready.join("、"));
    } else if (action === "execNo") {
      rec.prev = "exec";
      rec.returnTo = "exec";
      rec.status = "rework";
      rec.closeOnly = false;
      log(rec, "履约工作台驳回" + (extra.reason ? "：" + extra.reason : ""));
    } else if (action === "makeWb" || (action === "remake" && scene && scene.execMode === "reissue")) {
      var feas = extra.feas || [];
      var ready = extra.ready || [];
      if (!Array.isArray(feas)) feas = feas ? [feas] : [];
      if (!Array.isArray(ready)) ready = ready ? [ready] : [];
      if (feas.length < 4 || ready.length < 4) return "重出制单要按确认执行勾选全部可行性与执行准备";
      rec.execConfirm = { feas: feas, ready: ready };
      if (action === "remake") {
        rec.address = extra.address || rec.address;
        rec.newNo = extra.newNo || rec.newNo;
        go(rec, "label", "exec");
        log(rec, "修改地址重新制单" + (rec.address ? " · " + rec.address : "") + " · 参考确认执行：可行性 " + feas.join("、") + "；执行准备 " + ready.join("、"));
      } else {
        rec.newNo = extra.newNo || rec.newNo;
        go(rec, "label", "exec");
        log(rec, "重出制单完成" + (rec.newNo ? " · 新单号 " + rec.newNo : "") + " · 参考确认执行：可行性 " + feas.join("、") + "；执行准备 " + ready.join("、"));
      }
    } else if (action === "remake") {
      rec.address = extra.address || rec.address;
      rec.newNo = extra.newNo || rec.newNo;
      go(rec, "label", "exec");
      log(rec, "修改地址重新制单" + (rec.address ? " · " + rec.address : ""));
    } else if (action === "canHold") {
      rec.interceptReason = extra.reason || "";
      rec.fee = extra.fee || "";
      go(rec, "approve", "whAsk");
      log(rec, "确认可拦截 · 单号 " + rec.refNo + " · 原因 " + (rec.interceptReason || "—") + " · 费用 " + (rec.fee || "—") + " · 转入引用审批流");
    } else if (action === "cannotHold") {
      rec.prev = "whAsk";
      rec.status = "rework";
      rec.closeOnly = true;
      log(rec, "确认不可拦截" + (extra.reason ? "：" + extra.reason : "") + " · 交业务客服关闭");
    } else if (action === "apvOk") {
      go(rec, nextStatus(scene, "approve"), "approve");
      log(rec, "审批完成，进入下一节点 · 已带入单号/拦截原因/费用（引用现网审批流，不在工单内走审批节点）");
    } else if (action === "apvNo") {
      rec.status = rec.prev || "whAsk";
      log(rec, "审批驳回，退回上一节点");
    } else if (action === "labelOk") {
      go(rec, nextStatus(scene, "label"), "label");
      log(rec, "业务客服确认面单信息");
    } else if (action === "labelNo") {
      rec.status = "exec";
      rec.prev = "label";
      log(rec, "面单驳回，退回重出制单");
    } else if (action === "push") {
      go(rec, "wh", "push");
      rec.whSub = "recv";
      log(rec, "系统推送：" + scene.pushText);
    } else if (action === "whRecv") {
      rec.whSub = "recv";
      log(rec, "仓库待接收（此状态可撤回）");
    } else if (action === "whDoing") {
      rec.whSub = "doing";
      log(rec, "仓库受理中（不可撤回）");
    } else if (action === "whCannot") {
      rec.whSub = "cannot";
      log(rec, "仓库处理不了" + (extra.reason ? "：" + extra.reason : "") + "（不可撤回）");
    } else if (action === "whOk") {
      rec.whReturn = extra.note || rec.whReturn || "";
      rec.whFee = extra.fee || "";
      go(rec, "accept", "wh");
      rec.whSub = "confirmed";
      log(rec, (scene.whMode === "pda" ? "国内仓 PDA 回传" : "仓库确认回传") + (rec.whReturn ? "：" + rec.whReturn : "") + (rec.whFee ? " · 费用 " + rec.whFee : "") + " · 进入业务客服验收");
    } else if (action === "manualOk") {
      rec.whReturn = extra.note || "已上传附件";
      var afterWh = nextStatus(scene, "wh");
      go(rec, afterWh, "wh");
      log(rec, "手动处理并上传附件" + (extra.note ? "：" + extra.note : "") + (afterWh === "accept" ? " · 进入业务客服验收" : " · 验收格为空，流程结束"));
    } else if (action === "acceptOk") {
      if ((extra.result || "") !== "客户已知晓" || !(extra.feedback || "").trim()) return;
      go(rec, "done", "accept");
      log(rec, "客户反馈：" + extra.result + " · " + extra.feedback + " · 业务客服验收通过 · " + scene.feeText);
    } else if (action === "acceptNo") {
      rec.status = "wh";
      rec.whSub = "doing";
      rec.prev = "accept";
      log(rec, "验收驳回，退回" + (scene.whMode === "pda" ? "国内仓 PDA" : "仓库") + "重做，不新开单" + (extra.reason ? "：" + extra.reason : ""));
    } else if (action === "withdraw") {
      if (!canWithdraw(rec)) return;
      var back = rec.prev === "start" ? "draft" : rec.prev;
      log(rec, "撤回，退回「" + (STATUS_NAME[back] || back) + "」");
      rec.status = back || "draft";
      if (rec.status === "wh") rec.whSub = "recv";
    }
    save(list);
    render();
  }

  function createRecord(sceneId, refNo, note, asDraft, extra) {
    extra = extra || {};
    var scene = sceneById(sceneId);
    var rec = {
      id: "SC" + String(Date.now()).slice(-6),
      sceneId: scene.id,
      stage: scene.stage,
      scene: scene.name,
      refNo: (refNo || "").trim() || "未填单号",
      note: (note || "").trim(),
      subNo: (extra.subNo || "").trim(),
      status: "draft",
      prev: "",
      whSub: "",
      closeOnly: false,
      returnTo: "",
      interceptReason: "",
      fee: "",
      address: (extra.address || "").trim(),
      newNo: "",
      whReturn: "",
      whFee: "",
      logs: [],
      createdAt: now(),
      updatedAt: now()
    };
    log(rec, "保存草稿 · 新建工单 · " + scene.stage + " · " + scene.name);
    if (extra.fileName) log(rec, "已选附件：" + extra.fileName);
    if (!asDraft) {
      go(rec, nextStatus(scene, "start"), "draft");
      log(rec, "发起 · 交给履约工作台");
    }
    var list = load();
    list.unshift(rec);
    save(list);
    render();
    return rec.id;
  }

  function esc(s) {
    return String(s || "").replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  var EXEC_CONFIRM_FEAS = ["海外仓可处理", "货物未出发，或仍可拦截", "时效可满足", "本单不需要经理确认"];
  var EXEC_CONFIRM_READY = ["费用已确认", "标签、地址、指令附件齐全", "港前数据已更新，或无需更新", "具备美库推送条件，或走线下执行指令"];

  function checksHtml(name, label, options) {
    var boxes = options.map(function (o) {
      return '<label style="display:flex;gap:6px;align-items:flex-start;font-size:12px;margin:2px 0"><input type="checkbox" data-field="' + name + '" value="' + esc(o) + '" /> ' + esc(o) + "</label>";
    }).join("");
    return '<div style="margin:6px 0"><div style="font-size:12px;font-weight:600">' + esc(label) + "</div>" + boxes + "</div>";
  }

  function field(name, placeholder, value) {
    return '<input class="scene-in" data-field="' + name + '" placeholder="' + placeholder + '" value="' + esc(value || "") + '" />';
  }

  function btn(id, action, label, primary) {
    return '<button type="button" class="btn ' + (primary ? "btn-primary" : "") + '" data-scene-act="' + action + '" data-id="' + id + '">' + label + "</button>";
  }

  function actionsHtml(rec, desk) {
    var scene = sceneById(rec.sceneId);
    var owner = ownerOf(rec);
    var html = "";
    if (owner === "none") return "<span class=\"scene-wait\">流程结束</span>";
    if (owner === "cs" && desk !== "cs") return "<span class=\"scene-wait\">待业务客服工作台</span>";
    if (owner === "ops" && desk !== "ops") return "<span class=\"scene-wait\">待履约工作台 · 海外客服</span>";
    if (rec.status === "draft") {
      html += btn(rec.id, "submit", "发起", true);
    } else if (rec.status === "rework") {
      if (!rec.closeOnly) html += btn(rec.id, "resubmit", "修改确认重新提交", true);
      html += btn(rec.id, "close", "关闭", false);
    } else if (rec.status === "whAsk") {
      html += field("reason", "拦截原因", rec.interceptReason) + field("fee", "费用", rec.fee);
      html += btn(rec.id, "canHold", "确认可拦截", true);
      html += btn(rec.id, "cannotHold", "确认不可拦截", false);
    } else if (rec.status === "approve") {
      html += "<span class=\"scene-wait\">引用现网审批流 · 单号 " + esc(rec.refNo) + " · " + esc(rec.interceptReason || "—") + " · " + esc(rec.fee || "—") + "</span>";
      html += btn(rec.id, "apvOk", "审批完成", true);
      html += btn(rec.id, "apvNo", "驳回上一节点", false);
    } else if (rec.status === "exec" && scene.execMode === "reissue") {
      html += checksHtml("feas", "可行性（同确认执行）", EXEC_CONFIRM_FEAS);
      html += checksHtml("ready", "执行准备（同确认执行）", EXEC_CONFIRM_READY);
      html += field("newNo", "新单号", rec.newNo) + field("address", "修改后的地址", rec.address);
      html += btn(rec.id, "makeWb", "完成运单制单", true);
      html += btn(rec.id, "remake", "修改地址重新制单", false);
    } else if (rec.status === "exec") {
      html += checksHtml("feas", "可行性（同确认执行）", EXEC_CONFIRM_FEAS);
      html += checksHtml("ready", "执行准备（同确认执行）", EXEC_CONFIRM_READY);
      html += field("reason", "驳回原因", "");
      html += btn(rec.id, "execOk", "确认执行", true);
      html += btn(rec.id, "execNo", "打回", false);
    } else if (rec.status === "label") {
      html += btn(rec.id, "labelOk", "确认面单信息", true);
      html += btn(rec.id, "labelNo", "驳回", false);
    } else if (rec.status === "push") {
      html += btn(rec.id, "push", "系统推送", true);
    } else if (rec.status === "wh" && scene.whMode === "pda") {
      html += "<span class=\"scene-wait\">国内仓操作在 PDA，不在工作台回传</span>";
    } else if (rec.status === "wh" && scene.whMode === "manual") {
      html += field("note", "附件说明", rec.whReturn);
      html += btn(rec.id, "manualOk", "手动处理并上传附件", true);
    } else if (rec.status === "wh") {
      html += field("note", "回传信息", rec.whReturn) + field("fee", "回传费用", rec.whFee);
      html += btn(rec.id, "whRecv", "待接收", false);
      html += btn(rec.id, "whDoing", "受理中", false);
      html += btn(rec.id, "whCannot", "处理不了", false);
      html += btn(rec.id, "whOk", "确认回传", true);
    } else if (rec.status === "accept") {
      html += "<span class=\"scene-wait\">回传：" + esc(rec.whReturn || "—") + (rec.whFee ? " · 费用 " + esc(rec.whFee) : "") + "。先填客户反馈，客户已知晓才能验收。</span>";
    }
    if (canWithdraw(rec)) html += btn(rec.id, "withdraw", "撤回", false);
    return html;
  }

  function whLabel(rec) {
    if (rec.status !== "wh") return "";
    var map = { recv: "待接收", doing: "受理中", cannot: "处理不了", confirmed: "已确认" };
    return map[rec.whSub] ? " · " + map[rec.whSub] : "";
  }

  var portal = "ops";
  var bound = false;

  function startFields(rec) {
    var scene = sceneById(rec.sceneId);
    var entry = scene.entry || {};
    var fields = [
      { key: "refNo", label: entry.refLabel || "单号", value: rec.refNo, required: true },
      { key: "note", label: entry.ask || "说明", value: rec.note, type: "textarea" }
    ];
    if (entry.needSub) fields.push({ key: "subNo", label: "子单号", value: rec.subNo });
    if (entry.showAddr) fields.push({ key: "address", label: "要修改的地址", value: rec.address });
    return fields;
  }

  function choice(action, label, extra) {
    extra = extra || {};
    return { action: action, label: label, reason: extra.reason || "", fields: extra.fields || [] };
  }

  function fnSpec(rec) {
    var scene = sceneById(rec.sceneId);
    var spec = { name: "处理", guide: "", bar: "", choices: [] };
    spec.bar = rec.id + " · " + rec.stage + " · " + rec.scene + " · 单号 " + rec.refNo + (rec.note ? " · " + rec.note : "");
    if (rec.status === "draft") {
      spec.name = "发起";
      spec.guide = "可改单号和说明，确认后交给履约工作台。";
      spec.choices = [choice("submit", "确认发起", { fields: startFields(rec) })];
    } else if (rec.status === "rework") {
      spec.name = rec.closeOnly ? "关闭" : "修改确认";
      spec.guide = rec.closeOnly ? "确认不可拦截后，只能关闭。" : "可改单号和说明，确认后重新交给履约；也可以关闭。";
      if (!rec.closeOnly) spec.choices.push(choice("resubmit", "修改确认重新提交", { fields: startFields(rec) }));
      spec.choices.push(choice("close", "关闭", { reason: "关闭说明" }));
    } else if (rec.status === "whAsk") {
      spec.name = "确认是否可拦截";
      spec.guide = "可拦截须填写拦截原因和费用，再转入引用审批流。不可拦截则交业务客服关闭。";
      spec.choices = [
        choice("canHold", "确认可拦截", { fields: [{ key: "reason", label: "拦截原因" }, { key: "fee", label: "费用" }] }),
        choice("cannotHold", "确认不可拦截", { reason: "原因" })
      ];
    } else if (rec.status === "approve") {
      spec.name = "上级确认";
      spec.guide = "引用现网审批流。完成进入下一节点，驳回退回上一节点。";
      spec.choices = [choice("apvOk", "审批完成"), choice("apvNo", "驳回上一节点")];
    } else if (rec.status === "exec" && scene.execMode === "reissue") {
      spec.name = "运单制单";
      spec.guide = "重出制单参考确认执行弹窗：可行性、执行准备都要勾全才能制单。根运单号、重出原因、子单号、地址见上方。";
      var reissueChecks = [
        { key: "feas", label: "可行性（同确认执行）", type: "checks", options: EXEC_CONFIRM_FEAS },
        { key: "ready", label: "执行准备（同确认执行）", type: "checks", options: EXEC_CONFIRM_READY }
      ];
      spec.choices = [
        choice("makeWb", "完成运单制单", { fields: reissueChecks.concat([{ key: "newNo", label: "新单号", value: rec.newNo, required: true }]) }),
        choice("remake", "修改地址重新制单", { fields: reissueChecks.concat([{ key: "newNo", label: "新单号", value: rec.newNo, required: true }, { key: "address", label: "修改后的地址", value: rec.address, required: true }]) })
      ];
    } else if (rec.status === "exec") {
      spec.name = "确认执行";
      spec.guide = "接单与确认执行准备合并。可行性、执行准备都要勾全。打回退回业务客服修改。";
      spec.choices = [
        choice("execOk", "确认执行", { fields: [
          { key: "feas", label: "可行性", type: "checks", options: EXEC_CONFIRM_FEAS },
          { key: "ready", label: "执行准备", type: "checks", options: EXEC_CONFIRM_READY }
        ] }),
        choice("execNo", "打回", { reason: "打回原因" })
      ];
    } else if (rec.status === "label") {
      spec.name = "确认面单";
      spec.guide = "确认面单后推送。驳回则退回重出制单。";
      spec.choices = [choice("labelOk", "确认面单信息"), choice("labelNo", "驳回", { reason: "驳回原因" })];
    } else if (rec.status === "push") {
      spec.name = "推送";
      spec.guide = scene.pushText || "按场景配置推送到仓库。";
      spec.choices = [choice("push", "系统推送")];
    } else if (rec.status === "wh" && scene.whMode === "pda") {
      spec.name = "国内仓 PDA";
      spec.guide = "国内仓操作在 PDA 端。履约工作台只负责推送，不在这里回传。";
      spec.pda = true;
      spec.choices = [];
    } else if (rec.status === "wh" && scene.whMode === "manual") {
      spec.name = "上传处理结果";
      spec.guide = "手动处理并上传附件。";
      spec.choices = [choice("manualOk", "手动处理并上传附件", { fields: [{ key: "note", label: "附件说明", value: rec.whReturn }] })];
    } else if (rec.status === "wh") {
      spec.name = "仓库回传";
      spec.guide = "待接收可撤回；受理中、处理不了、已回传不可撤回。";
      spec.choices = [
        choice("whRecv", "待接收"),
        choice("whDoing", "受理中"),
        choice("whCannot", "处理不了", { reason: "原因" }),
        choice("whOk", "确认回传", { fields: [{ key: "note", label: "回传信息", value: rec.whReturn }, { key: "fee", label: "回传费用", value: rec.whFee }] })
      ];
    } else if (rec.status === "accept") {
      spec.name = "验收";
      spec.guide = "先填客户反馈。客户已知晓才能验收通过；客户要求继续处理不能验收。打回退回仓库重做，不新开单。";
      spec.choices = [
        choice("acceptOk", "验收通过", { fields: [
          { key: "result", label: "反馈结论", type: "radio", required: true, options: ["客户已知晓", "客户要求继续处理"] },
          { key: "feedback", label: "反馈内容", type: "textarea", required: true }
        ] }),
        choice("acceptNo", "打回", { reason: "打回原因" })
      ];
    }
    if (canWithdraw(rec)) spec.choices.push(choice("withdraw", "撤回"));
    return spec;
  }

  function roleOfScene(scene) {
    if (scene.stage === "港后") return "after";
    if (scene.stage === "尾程") return "express";
    return "fu";
  }

  function todoKindOf(rec) {
    if (rec.status === "wh" && sceneById(rec.sceneId).whMode === "pda") return "pda";
    if (rec.status === "push" || rec.status === "wh") return "upload";
    if (rec.status === "approve") return "approve";
    if (rec.status === "accept" || rec.status === "label") return "accept_cs";
    if (rec.status === "draft") return "draft";
    if (rec.status === "rework") return "rework";
    return "accept";
  }

  function onDesk(rec, desk) {
    if (rec.status === "done" || rec.status === "closed") return false;
    var owner = ownerOf(rec);
    if (desk === "cs") return owner === "cs";
    if (owner === "pda") return desk === "ops";
    return owner === "ops" || owner === "sys";
  }

  function tableRows(desk) {
    desk = desk === "cs" ? "cs" : "ops";
    return load().filter(function (r) { return onDesk(r, desk); }).map(function (r) {
      var scene = sceneById(r.sceneId);
      var spec = fnSpec(r);
      return {
        id: r.id,
        kind: "scene",
        title: (r.note || r.refNo || scene.name),
        scene: r.scene,
        stage: r.stage,
        status: (r.status === "wh" && scene.whMode === "pda") ? "待国内仓 PDA" : ((STATUS_NAME[r.status] || r.status) + whLabel(r)),
        node: spec.name,
        starter: "业务客服",
        handler: ownerOf(r) === "cs" ? "业务客服" : ownerOf(r) === "pda" ? "国内仓" : "海外客服",
        pda: !!spec.pda,
        sla: "—",
        updated: r.updatedAt || "—",
        role: roleOfScene(scene),
        todoKind: todoKindOf(r),
        fnName: spec.name,
        relatedWo: "—",
        whTaskNo: "—",
        history: (r.logs || []).map(function (x) { return { time: x.t, actor: "演示", action: x.text, detail: "" }; })
      };
    });
  }

  function render() {
    var board = document.getElementById("sceneFlowBoard");
    if (!board) return;
    var desk = portal === "cs" ? "cs" : "ops";
    var hint = document.getElementById("sceneFlowHint");
    if (hint) {
      hint.textContent = desk === "cs"
        ? "未提交的在「草稿」，履约打回的在「打回」。点操作列里的功能再处理，不在这里铺确认和打回。"
        : "记录在下方待办里。点操作列的功能处理。待受理点确认执行即完成接单与执行准备；也可打回并填写原因。国内仓操作在 PDA，不在本工作台回传。";
    }
    var create = document.getElementById("sceneFlowCreate");
    if (create) {
      create.hidden = desk !== "cs";
      if (desk === "cs" && !create.dataset.ready) {
        create.innerHTML =
          '<a class="btn btn-primary" href="新建工单-MVP.html">新建工单 · 先选场景再录入</a>';
        create.dataset.ready = "1";
      }
    }
    var host = document.getElementById("sceneFlowList");
    if (host) host.innerHTML = "";
    try { window.dispatchEvent(new Event("wo-scene-changed")); } catch (e) {}
  }

  function readFields(card) {
    var extra = {};
    if (!card) return extra;
    card.querySelectorAll("[data-field]").forEach(function (el) {
      var key = el.getAttribute("data-field");
      if (el.type === "checkbox") {
        if (!Array.isArray(extra[key])) extra[key] = [];
        if (el.checked) extra[key].push(el.value);
        return;
      }
      extra[key] = el.value.trim();
    });
    return extra;
  }

  function bind() {
    if (bound) return;
    bound = true;
    var board = document.getElementById("sceneFlowBoard");
    if (!board) return;
    board.addEventListener("click", function (e) {
      var draft = e.target.closest("#sceneDraft");
      var submit = e.target.closest("#sceneSubmit");
      if (draft || submit) {
        createRecord(
          document.getElementById("scenePick").value,
          document.getElementById("sceneRef").value,
          document.getElementById("sceneNote").value,
          !!draft
        );
        return;
      }
      var b = e.target.closest("[data-scene-act]");
      if (!b) return;
      var card = b.closest(".scene-card");
      var err = act(b.getAttribute("data-id"), b.getAttribute("data-scene-act"), readFields(card));
      if (err) alert(err);
    });
    window.addEventListener("storage", function (e) {
      if (e.key === KEY) render();
    });
    window.addEventListener("focus", render);
  }

  window.WoSceneFlow = {
    scenes: function () { return SCENES; },
    statusName: STATUS_NAME,
    fnSpec: function (id) {
      var rec = find(load(), id);
      return rec ? fnSpec(rec) : null;
    },
    tableRows: tableRows,
    pdaTodos: function () {
      return load().filter(function (r) {
        return r.status === "wh" && sceneById(r.sceneId).whMode === "pda";
      });
    },
    act: act,
    create: function (opts) {
      opts = opts || {};
      return createRecord(opts.sceneId, opts.refNo, opts.note, !!opts.asDraft, opts);
    },
    mount: function (p) {
      portal = p === "cs" ? "cs" : "ops";
      bind();
      render();
    }
  };
})();
