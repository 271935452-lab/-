# -*- coding: utf-8 -*-
from pathlib import Path

html = r'''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>订舱 · 海派仓位 · 提单装柜 · 评审导航</title>
  <style>
    :root {
      --bg: #f5f7fb; --card: #fff; --line: #e5e7eb; --text: #111827; --sub: #6b7280; --primary: #1a6bb5;
    }
    * { box-sizing: border-box; }
    body { margin: 0; background: var(--bg); color: var(--text); font-family: "Microsoft YaHei","PingFang SC",Arial,sans-serif; font-size: 14px; }
    .hub { max-width: 920px; margin: 0 auto; padding: 24px 16px 48px; }
    .hero {
      background: linear-gradient(135deg, #531dab, #1890ff); color: #fff; border-radius: 12px;
      padding: 16px 18px; margin-bottom: 14px;
    }
    .hero h1 { margin: 0 0 8px; font-size: 20px; }
    .hero p { margin: 0; font-size: 13px; line-height: 1.65; opacity: .95; }
    .card {
      background: var(--card); border: 1px solid var(--line); border-radius: 12px;
      padding: 14px 16px; margin-bottom: 12px;
    }
    .card h2 { margin: 0 0 8px; font-size: 15px; border-bottom: 1px solid var(--line); padding-bottom: 8px; }
    .card p.hint { margin: 0 0 10px; font-size: 12px; color: var(--sub); line-height: 1.6; }
    .links a {
      display: block; color: var(--primary); text-decoration: none; padding: 8px 0;
      border-bottom: 1px dashed #bae0ff; font-size: 14px;
    }
    .links a:hover { text-decoration: underline; }
    .tag { display: inline-block; margin-left: 6px; font-size: 11px; padding: 1px 6px; border-radius: 999px; vertical-align: middle; }
    .tag.rev { color: #531dab; background: #f9f0ff; border: 1px solid #d3adf7; }
    .tag.ok { color: #389e0d; background: #f6ffed; border: 1px solid #b7eb8f; }
    .tag.new { color: #0958d9; background: #e6f4ff; border: 1px solid #91caff; }
    .flow {
      font-size: 13px; line-height: 1.75; color: #475569; padding: 10px 12px; background: #f8fafc;
      border-radius: 8px; border: 1px solid var(--line);
    }
    .stow-flow {
      margin: 10px 0 12px; padding: 12px;
      border-radius: 10px; background: #f0f7ff; border: 1px solid #bae0ff;
    }
    .stow-flow .sf-title { margin: 0 0 8px; font-size: 12px; font-weight: 700; color: #0958d9; }
    .stow-flow .sf-row { display: flex; flex-wrap: wrap; align-items: stretch; justify-content: center; }
    .stow-flow .sf-node {
      flex: 1 1 96px; max-width: 140px; min-width: 88px;
      margin: 4px; padding: 8px 8px 7px; border-radius: 8px;
      background: #fff; border: 1px solid #91caff; text-align: center;
      text-decoration: none; color: inherit; display: block;
    }
    .stow-flow .sf-node:hover { border-color: #1677ff; text-decoration: none; }
    .stow-flow .sf-node .n {
      display: inline-block; width: 18px; height: 18px; line-height: 18px;
      border-radius: 99px; background: #1677ff; color: #fff;
      font-size: 11px; font-weight: 700; margin-bottom: 4px;
    }
    .stow-flow .sf-node .t { display: block; font-size: 12px; font-weight: 700; color: #0958d9; line-height: 1.3; }
    .stow-flow .sf-node .d { display: block; margin-top: 3px; font-size: 10px; color: #64748b; line-height: 1.35; }
    .stow-flow .sf-node.end { border-color: #86efac; background: #f0fdf4; }
    .stow-flow .sf-node.end .n { background: #16a34a; }
    .stow-flow .sf-node.end .t { color: #166534; }
    .stow-flow .sf-arrow { flex: none; align-self: center; color: #1677ff; font-size: 16px; font-weight: 700; padding: 0 2px; }
    .stow-flow .sf-branches { margin: 10px 0 0; display: grid; gap: 6px; }
    .stow-flow .sf-branches a {
      display: block; padding: 6px 8px; border-radius: 6px; background: #fff;
      border: 1px solid #e5e7eb; color: #334155; text-decoration: none; font-size: 12px; line-height: 1.45;
    }
    .stow-flow .sf-branches a:hover { border-color: #91caff; }
    .stow-flow .sf-branches b { color: #0958d9; font-weight: 700; }
    @media (max-width: 700px) {
      .stow-flow .sf-arrow { display: none; }
      .stow-flow .sf-node { max-width: none; flex: 1 1 calc(50% - 12px); }
    }
    ol.q { margin: 0; padding-left: 20px; line-height: 1.75; color: #334155; }
    ol.q li { margin-bottom: 10px; }
    ol.q b { color: #111; }
    .dec { margin-top: 6px; font-size: 12px; color: var(--sub); }
    .dec strong { color: #389e0d; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px; }
    th, td { border: 1px solid var(--line); padding: 8px 10px; text-align: left; vertical-align: top; }
    th { background: #f8fafc; width: 28%; }
    .footer { text-align: center; font-size: 11px; color: var(--sub); margin-top: 8px; }
  </style>
</head>
<body>
  <main class="hub">
    <section class="hero">
      <h1>订舱 · 海派仓位 · 提单装柜 · 评审导航</h1>
      <p>仅原型与待确认问题，<b>不含 PRD</b>。已确认：无号只在海派仓位；提单管理替代装柜计划表；配舱状态单列预配/待配/终配；关务资料出口不在装柜范围。侧栏一级：操作 / 产品 / 方案。</p>
    </section>

    <section class="card">
      <h2>原型入口</h2>
      <p class="hint">各原型壳对齐 test.txfba（一级图标栏 + 二级菜单 + 顶栏页签），由 <code>ship-review-nav.js</code> 注入：<strong>提单创建 / 提单管理</strong> 分开展示（<strong>不设提单汇总页</strong>）。
        <strong>装柜计划字段加在原「提单管理」列表上</strong>（橙底表头），不另开第二页，避免误导。方案文档挂侧栏一级「方案」。</p>
      <div class="links">
        <a href="海派仓位表-MVP.html">① 海派仓位表<span class="tag rev">评审</span></a>
        <a href="船务组-提单创建批量-AI识别-MVP.html">② 提单创建（独立菜单）<span class="tag ok">已有</span></a>
        <a href="船务组-提单管理-按周分组与分配-MVP.html">③ 提单管理（原页 + 装柜计划字段）<span class="tag rev">评审</span></a>
        <a href="装柜计划-仓库视图-MVP.html">③b 装柜计划 · 仓库视图（PC）<span class="tag rev">评审</span></a>
        <a href="../../APP/装柜扫描-件数核对-MVP.html">③c PDA · 装柜扫描<span class="tag ok">已有</span></a>
        <a href="船务组-待配仓-MVP.html">④ 待配仓 · 组合配仓<span class="tag ok">已有</span></a>
        <a href="船务组-终配舱-MVP.html">⑤ 终配舱记录<span class="tag ok">已有</span></a>
        <a href="义乌智能仓-配舱规则配置-MVP.html">⑤b 配舱规则配置（终配舱/智能仓同一套）<span class="tag rev">MVP</span></a>
        <a href="义乌智能仓-方案/船务组-仓位拆分智能配舱-MVP-PRD-交互稿.html">⑤c 仓位拆分 · 智能配舱 · 橙色交互 PRD<span class="tag rev">v1</span></a>
        <a href="../../整柜下单/仓位管理-订舱完善提单-整合-MVP.html">⑥ 整柜 · 舱位管理<span class="tag ok">已有</span></a>
        <a href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html">⑦ 义乌智能仓 · 自动配舱方案<span class="tag rev">待确认</span></a>
        <a href="义乌智能仓-方案/义乌智能仓-自动配舱-场景.html">↳ 场景</a>
        <a href="义乌智能仓-方案/义乌智能仓-自动配舱-待确认.html">↳ 待确认</a>
        <a href="义乌智能仓-方案/义乌智能仓-封门留货-关务对接确认.html">↳ 封门留货 · 关务对接<span class="tag rev">待确认</span></a>
        <a href="义乌智能仓-自动配舱-任务日志-MVP.html">↳ 自动配舱日志<span class="tag rev">MVP</span></a>
        <a href="船务组-导航.html">船务组 · 开发测试导航</a>
        <a href="船务v2/船务v2-导航.html">船务 v2 · 仓位表 / 自动配舱<span class="tag rev">NEW</span></a>
      </div>
    </section>

    <section class="card" id="s-smart-stow">
      <h2>义乌智能仓自动配舱</h2>
      <p class="hint">和上面的仓位拆分页同一套导航。仅智能仓。运输状态：待出仓 / 已分配 / 可出仓 / 已出仓（去掉配舱中、已配舱）。自动配舱进配中 → 已分配。配舱状态：待配 / 配中 / 终配。</p>
      <div class="stow-flow" id="stowFlow">
        <p class="sf-title">主流程</p>
        <div class="sf-row">
          <a class="sf-node" href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-scope">
            <span class="n">1</span>
            <span class="t">入池切开</span>
            <span class="d">智能仓 · 非扣件<br>按渠道分开</span>
          </a>
          <span class="sf-arrow" aria-hidden="true">→</span>
          <a class="sf-node" href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-cap">
            <span class="n">2</span>
            <span class="t">生成待配</span>
            <span class="d">40HQ · 70方<br>1100箱</span>
          </a>
          <span class="sf-arrow" aria-hidden="true">→</span>
          <a class="sf-node" href="船务组-终配舱-MVP.html">
            <span class="n">3</span>
            <span class="t">打标或待办</span>
            <span class="d">选用，或等人确认</span>
          </a>
          <span class="sf-arrow" aria-hidden="true">→</span>
          <a class="sf-node end" href="船务组-终配舱-MVP.html">
            <span class="n">4</span>
            <span class="t">终配</span>
            <span class="d">硬条件满额<br>可直接落成</span>
          </a>
          <span class="sf-arrow" aria-hidden="true">→</span>
          <a class="sf-node" href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-slot">
            <span class="n">5</span>
            <span class="t">对仓位</span>
            <span class="d">人工选未过期仓位<br>未满现场补普货</span>
          </a>
        </div>
        <div class="sf-branches">
          <a href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-flow"><b>直接终配</b>　硬条件都满足，不用再确认</a>
          <a href="船务组-终配舱-MVP.html"><b>只打标</b>　地址 SKU 超 15、未满、超方或超箱。仍出方案，停在待配，不推待办</a>
          <a href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-wt"><b>重量待审</b>　整柜 19.5～25.9 吨，待办黄少飞。不看单票重，不退回重配</a>
          <a href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-human"><b>超重或服装超方</b>　大于 25.9 吨，或服装超过 40 方。方案留下，待办配舱同事</a>
          <a href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-human"><b>不出方案</b>　合并报关组跨渠道。只列人货，待办配舱同事</a>
          <a href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-mark"><b>合并扣件</b>　组内有扣件：等放行后再整组自动配</a>
          <a href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-mark"><b>两组合并超柜</b>　自动拆开，打「合并单多舱」</a>
          <a href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-swap"><b>装前换柜 / 两柜对调</b>　配舱同事（终配舱）与义乌仓（仓库视图）都可做。同渠道、同柜型、两柜都到现场且未开装。只对调绑定</a>
          <a href="义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html#s-osmark"><b>海外接柜预判</b>　重货 / 多SKU / 超限 / 合并多舱，装完推主单跟进，到港前海外可见</a>
        </div>
      </div>
    </section>

    <section class="card">
      <h2>业务要求（评审新增 · 已写入原型）</h2>
      <table>
        <tr>
          <th>菜单拆分</th>
          <td><strong>提单创建</strong>在导航/菜单上<strong>单独列出</strong>，不与提单管理混为一页；提单管理页<strong>不提供「提单创建」主按钮</strong>。<strong>不设「提单汇总」独立页</strong>，汇总查看走提单管理筛选/导出。</td>
        </tr>
        <tr>
          <th>线下表对齐</th>
          <td>提单管理列表的<strong>列顺序与字段命名</strong>对齐当前线下装柜计划表（资料员 → … → 实际离场；含「代理+报关+拖车」合并列名）。</td>
        </tr>
        <tr>
          <th>色标一致</th>
          <td>提单管理/创建相关页：<strong>行底绿=已装完、行底橙=未装完</strong>（仓库可识读）；<strong>预配蓝 / 待配橙 / 终配绿</strong> 与船务待配仓、终配舱口径一致，不另搞一套色。</td>
        </tr>
        <tr>
          <th>组合/终配入口</th>
          <td>「需组合配舱号」链<strong>待配仓</strong>；「最终配舱号」链<strong>终配舱记录</strong>；工具栏显式入口，避免字段名与配仓模块打架。</td>
        </tr>
        <tr>
          <th>仓库也用装柜计划表</th>
          <td><strong>As-Is：</strong>线下华南/华东装柜计划表船务排柜、<strong>仓库同样要看/要改</strong>（顺序、地址、到柜/离场、贴单监装打单等）。<strong>To-Be：</strong>线上<strong>同一套装柜计划数据</strong>，不单建第二套 Excel；仓库侧用<strong>「装柜计划 / 仓库视图」</strong>（独立菜单或提单管理的仓库角色视图），列与线下表一致、可编辑字段按角色限制；PDA 装柜扫描回写同一行。</td>
        </tr>
      </table>
    </section>

    <section class="card">
      <h2>流程图 / 泳道图</h2>
      <p class="hint">总览 + 提单状态色标；智能仓规则配置到海外仓泳道。</p>
      <div class="links">
        <a href="义乌智能仓-方案/船务组-订舱仓位装柜-流程图.html">订舱 · 仓位 · 提单 · 装柜 · 配仓 — 流程图<span class="tag rev">评审</span></a>
        <a href="义乌智能仓-方案/义乌智能仓-规则到海外仓-泳道图.html">规则配置 → 装柜完成 → 海外仓 · 泳道图<span class="tag new">新</span></a>
      </div>
    </section>

    <section class="card">
      <h2>主链路（评审口径）</h2>
      <div class="flow">
        海派仓位（可无提单号）→ <b>放舱出号（同时自动生成提单，必有号）</b> → 提单管理待分配 → 装柜排程字段（预配/待配/终配）→ 分配 → 待装柜 → …<br/>
        整柜：仍从「舱位管理」进入，本期不合并订舱中心。
      </div>
    </section>

    <section class="card">
      <h2>已拍板（会上不必重复争）</h2>
      <table>
        <tr><th>无提单号</th><td>方案甲：仅海派仓位；提单管理待分配默认均有正式提单号。</td></tr>
        <tr><th>放舱与提单</th><td><strong>放舱出号确认后自动创建提单（待分配）</strong>，不设单独「同步提单」主按钮。海派仓位表<strong>去掉</strong>「打开提单 · 待分配」「舱位播报」；播报仍在提单管理。</td></tr>
        <tr><th>装柜计划表</th><td>字段加在<strong>原提单管理</strong>列表（不另开第二页）；仓库用仓库视图，不单独第三个船务菜单。</td></tr>
        <tr><th>配舱状态</th><td>终配舱页签：<strong>待配 / 配中 / 终配</strong>。运输页签：待出仓 / <strong>已分配</strong> / 可出仓 / 已出仓（不再放配舱中、已配舱）。自动配舱进配中 → 已分配。</td></tr>
        <tr><th>关务</th><td>下载报关资料、发报关行不在本次装柜/提单扩展范围。</td></tr>
        <tr><th>入口</th><td>海派新仓位入口；整柜继续舱位管理；订舱中心合并评审后再定。</td></tr>
      </table>
    </section>

    <section class="card">
      <h2>待业务确认（评审清单）</h2>
      <ol class="q">
        <li><del style="color:#999">「同步提单」触发点</del> <strong style="color:#389e0d">已确认：放舱出号即自动建提单。</strong> 仍待 IT：重复号/接口失败是否仅「同步失败·重推」、是否阻断出号？</li>
        <li><b>预配 → 待配 → 终配</b>：谁有权改状态？是否必须终配才能点「分配」/导出装柜计划？待配能否下载内部排班表？</li>
        <li><b>需组合配舱号</b>：长文本预配明细是否还要维护，还是终配后只保留「最终配舱号」？与现网「配舱单号」是否合并为一字段展示？</li>
        <li><b>渠道</b>：装柜表「渠道」与运单/产品渠道是否同一字段？若不同，以哪个为准做统计？</li>
        <li><b>清关行分配</b>：与「绑定进口商」里的清关行不一致时，以哪个驱动报关？列表是否两列都展示？</li>
        <li><b>代理+报关+拖车</b>：是否必须拆三字段且与费用/供应商台账关联？还是保持一段文本+可选结构化？</li>
        <li><b>装柜日「顺序」</b>：是否按自然日 0 点切块（对齐 xls 每日表头）？跨日改装柜时间顺序是否重算？</li>
        <li><b>资料员</b>：是否等于关务资料员账号？变更是否通知？能否一单多人？</li>
        <li><b>仓库装柜计划视图</b>：原型已独立菜单 <a href="装柜计划-仓库视图-MVP.html">装柜计划 · 仓库视图</a>。待确认：权限是否仅本仓、船务字段只读范围是否足够？</li>
        <li><b>现场字段</b>（装柜费/团队/贴单/监装/到离柜）：仓库可改哪些、船务可改哪些？与 PDA「装柜完成」、行色绿/橙谁为准？</li>
        <li><b>进港代码</b>：需求清单写「排装柜计划时登记、可导出」——导出模板是否沿用现 xls？必填还是可选？</li>
        <li><b>华南 / 华东</b>：线下两表结构相同；系统是否仅「预配/终配」分工 + 权限，不再做双 Sheet？</li>
        <li><b>待配仓 / 终配舱</b>：原型已<strong>并存</strong>（链式跳转 + 侧栏入口）。待确认：终配落成后是否强制回写「最终配舱号」到提单管理？自动配舱标是否只在终配舱页展示？</li>
        <li><b>整柜与海派</b>：同一客户既有 FCL 又有海派时，进口商/配舱号是否跨模块可见？</li>
      </ol>
      <p class="dec"><strong>建议评审输出：</strong>每题负责角色（船务/关务/仓库/IT）+ P0 必答 / P1 可后补标记。</p>
    </section>

    <section class="card">
      <h2>线下表核对说明</h2>
      <p class="hint">已用装柜计划表 xls（Sheet 华东/华南）与海派仓位表对字段。当前装柜计划 xls 两 Sheet 内容一致；扩展列见提单装柜原型橙底表头。</p>
    </section>

    <p class="footer">船务组 · 评审导航 · 原型先行 · 方案在侧栏「方案」</p>
  </main>
</body>
</html>
'''

out = Path(r"d:/Cursor/头程项目/产品部门/船务/船务组-订舱仓位装柜-评审导航.html")
out.write_text(html, encoding="utf-8", newline="\n")
print("wrote", out, "bytes", out.stat().st_size)
t = out.read_text(encoding="utf-8")
assert "原型入口" in t
assert "义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html" in t
assert "stowFlow" in t
print("ok")
