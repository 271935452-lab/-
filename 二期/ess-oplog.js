/**
 * ESS 通用操作日志（右侧抽屉）
 *
 * 用法：
 *   <link rel="stylesheet" href=".../二期/ess-oplog.css" />
 *   <script src=".../二期/ess-oplog.js"></script>
 *   ESSOpLog.mount({ operator: "王敏", toast: toastFn });
 *   ESSOpLog.write({ key, type, text, user?, sys?, at?, meta? });
 *   ESSOpLog.open(key, meta);  // meta 展示在顶栏，如 { 报关编号, 运单 }
 *
 * 口径：业务提交成功才写；查询 / 导出 / 打开本抽屉不写。
 * 列固定：时间、操作人、类型、内容。新的在上。系统回写操作人=系统（灰字）。
 */
(function (global) {
  if (global.ESSOpLog) return;

  var store = [];
  var currentKey = "";
  var currentMeta = {};
  var opts = {
    title: "操作日志",
    operator: "当前用户",
    toast: null
  };

  function pad(n) { return n < 10 ? "0" + n : "" + n; }
  function nowStr() {
    var d = new Date();
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate()) +
      " " + pad(d.getHours()) + ":" + pad(d.getMinutes()) + ":" + pad(d.getSeconds());
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function say(msg) {
    if (typeof opts.toast === "function") opts.toast(msg);
  }

  function ensureDom() {
    if (document.getElementById("essOplogMask")) return;
    var mask = document.createElement("div");
    mask.id = "essOplogMask";
    mask.className = "ess-oplog-mask";
    mask.setAttribute("aria-hidden", "true");
    mask.innerHTML =
      '<div class="ess-oplog-drawer" role="dialog" aria-labelledby="essOplogTitle">' +
        '<div class="ess-oplog-hd">' +
          '<h3 id="essOplogTitle">' + esc(opts.title) + "</h3>" +
          '<button type="button" class="ess-oplog-close" id="essOplogClose">关闭</button>' +
        "</div>" +
        '<div class="ess-oplog-sum" id="essOplogSum"></div>' +
        '<div class="ess-oplog-filter"><select id="essOplogType"><option value="">全部类型</option></select></div>' +
        '<div class="ess-oplog-bd"><table class="ess-oplog-tbl">' +
          "<thead><tr><th style='width:150px'>时间</th><th style='width:72px'>操作人</th>" +
          "<th style='width:96px'>类型</th><th>内容</th></tr></thead>" +
          '<tbody id="essOplogBody"></tbody>' +
        "</table></div>" +
      "</div>";
    document.body.appendChild(mask);
    mask.addEventListener("click", function (e) {
      if (e.target === mask) api.close();
    });
    document.getElementById("essOplogClose").addEventListener("click", api.close);
    document.getElementById("essOplogType").addEventListener("change", renderTable);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && mask.classList.contains("open")) api.close();
    });
  }

  function listFor(key) {
    return store.filter(function (e) { return e.key === key; });
  }

  function renderTable() {
    var body = document.getElementById("essOplogBody");
    var sel = document.getElementById("essOplogType");
    if (!body || !sel) return;
    var all = listFor(currentKey);
    var types = {};
    all.forEach(function (e) { types[e.type] = true; });
    var keep = sel.value;
    sel.innerHTML = '<option value="">全部类型</option>' +
      Object.keys(types).map(function (t) {
        return '<option value="' + esc(t) + '"' + (t === keep ? " selected" : "") + ">" + esc(t) + "</option>";
      }).join("");
    var typeF = sel.value;
    var list = all.filter(function (e) { return !typeF || e.type === typeF; })
      .slice().sort(function (a, b) { return a.at < b.at ? 1 : (a.at > b.at ? -1 : 0); });
    body.innerHTML = list.length
      ? list.map(function (e) {
          return "<tr>" +
            "<td>" + esc(e.at) + "</td>" +
            "<td" + (e.sys ? ' class="ess-oplog-sys"' : "") + ">" + esc(e.user) + "</td>" +
            "<td>" + esc(e.type) + "</td>" +
            '<td class="ess-oplog-text">' + esc(e.text) + "</td>" +
            "</tr>";
        }).join("")
      : '<tr><td colspan="4" class="ess-oplog-empty">暂无操作日志</td></tr>';
  }

  function renderHeader() {
    var el = document.getElementById("essOplogSum");
    if (!el) return;
    var meta = currentMeta || {};
    var keys = Object.keys(meta);
    el.innerHTML = keys.length
      ? keys.map(function (k) {
          return "<b>" + esc(k) + ": " + esc(meta[k] == null || meta[k] === "" ? "—" : meta[k]) + "</b>";
        }).join("")
      : "<b>对象: " + esc(currentKey || "—") + "</b>";
  }

  var api = {
    mount: function (o) {
      if (o) {
        if (o.title) opts.title = o.title;
        if (o.operator) opts.operator = o.operator;
        if (o.toast) opts.toast = o.toast;
      }
      ensureDom();
      var t = document.getElementById("essOplogTitle");
      if (t) t.textContent = opts.title;
    },
    write: function (entry) {
      if (!entry || !entry.key || !entry.type) return;
      store.unshift({
        key: String(entry.key),
        type: String(entry.type),
        text: entry.text == null ? "" : String(entry.text),
        user: entry.user || (entry.sys ? "系统" : opts.operator),
        sys: !!entry.sys,
        at: entry.at || nowStr(),
        meta: entry.meta || {}
      });
      var mask = document.getElementById("essOplogMask");
      if (mask && mask.classList.contains("open") && currentKey === String(entry.key)) renderTable();
    },
    seed: function (list) {
      (list || []).forEach(function (e) { api.write(e); });
    },
    clear: function () { store = []; },
    open: function (key, meta) {
      if (!key) { say("无法打开操作日志：缺少对象"); return; }
      ensureDom();
      currentKey = String(key);
      currentMeta = meta || {};
      var sel = document.getElementById("essOplogType");
      if (sel) sel.value = "";
      renderHeader();
      renderTable();
      var mask = document.getElementById("essOplogMask");
      mask.classList.add("open");
      mask.setAttribute("aria-hidden", "false");
    },
    close: function () {
      var mask = document.getElementById("essOplogMask");
      if (!mask) return;
      mask.classList.remove("open");
      mask.setAttribute("aria-hidden", "true");
      currentKey = "";
    },
    list: function (key) { return listFor(key); }
  };

  global.ESSOpLog = api;
})(window);
