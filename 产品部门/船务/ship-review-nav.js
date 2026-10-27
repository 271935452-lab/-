/** 评审期 · 船务侧栏（海派仓位 / 提单创建 / 提单管理 / 配仓） */
(function (global) {
  var ITEMS = [
    { type: "title", text: "订舱 · 仓位" },
    { type: "link", id: "cabin", href: "海派仓位表-MVP.html", label: "海派仓位表" },
    { type: "title", text: "提单（独立菜单）" },
    { type: "link", id: "bl-create", href: "船务组-提单创建批量-AI识别-MVP.html", label: "提单创建" },
    { type: "link", id: "bl-mgmt", href: "船务组-提单管理-按周分组与分配-MVP.html", label: "提单管理" },
    { type: "title", text: "仓库 · 装柜计划" },
    { type: "link", id: "wh-plan", href: "装柜计划-仓库视图-MVP.html", label: "装柜计划 · 仓库视图" },
    { type: "link", id: "wh-pda", href: "../../APP/装柜扫描-件数核对-MVP.html", label: "PDA · 装柜扫描" },
    { type: "title", text: "配仓" },
    { type: "link", id: "pre-stow", href: "船务组-待配仓-MVP.html", label: "待配仓 · 组合配仓" },
    { type: "link", id: "final-stow", href: "船务组-终配舱-MVP.html", label: "终配舱记录" },
    { type: "title", text: "参照" },
    { type: "link", id: "flow", href: "船务组-订舱仓位装柜-流程图.html", label: "流程图" },
    { type: "link", id: "hub", href: "船务组-订舱仓位装柜-评审导航.html", label: "评审导航" }
  ];

  function render(activeId, mountId) {
    var el = document.getElementById(mountId || "shipReviewSidebar");
    if (!el) return;
    var html = "";
    ITEMS.forEach(function (it) {
      if (it.type === "title") {
        html += '<div class="side-title">' + it.text + "</div>";
        return;
      }
      var cls = "side-item" + (it.id === activeId ? " active" : "");
      html += '<a class="' + cls + '" href="' + it.href + '">' + it.label + "</a>";
    });
    el.innerHTML = html;
  }

  global.renderShipReviewNav = render;
})(window);
