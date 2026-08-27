# -*- coding: utf-8 -*-
"""Assemble 船务组产品部全文 PRD from current booklets. Run from this folder."""
from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "船务组-需求PRD-产品部全文-20260826.html"

CHAPTERS = [
    {
        "id": "ch-create",
        "prefix": "create-",
        "file": "船务组-提单创建批量-AI识别-MVP-PRD.html",
        "title": "第 1 章 · 提单创建 / 批量 / AI",
        "hint": "单票、Excel、AI 识别；海运费与两免用箱回写预估。提单号手填或空着，不套船司前缀。",
        "proto": [
            ("船务组-提单创建批量-AI识别-MVP.html", "批量"),
            ("船务组-提单创建批量-AI识别-MVP.html?mode=single", "单票"),
        ],
    },
    {
        "id": "ch-bl",
        "prefix": "bl-",
        "file": "船务组-提单管理-按周分组与分配-MVP-PRD.html",
        "title": "第 2 章 · 提单管理",
        "hint": "筛选、列表、工具栏、分配、舱位播报、取消 IT、绑定进口商、换柜换船、费用·水单、操作日志、预警。",
        "proto": [("船务组-提单管理-按周分组与分配-MVP.html", "提单管理")],
    },
    {
        "id": "ch-wait",
        "prefix": "wait-",
        "file": "船务组-待配仓-MVP-PRD.html",
        "title": "第 3 章 · 待配仓",
        "hint": "按行勾选、改预配舱号、合并报关标。自动配舱规则与出号见终配舱记录。",
        "proto": [("船务组-待配仓-MVP.html", "待配仓")],
    },
    {
        "id": "ch-final",
        "prefix": "final-",
        "file": "船务组-终配舱-MVP-PRD.html",
        "title": "第 4 章 · 终配舱记录",
        "hint": "自动配舱规则（无配置页）、出号、自动配舱标、合并报关拆舱打「分不同配舱」。",
        "proto": [("船务组-终配舱-MVP.html", "终配舱")],
    },
    {
        "id": "ch-proto",
        "prefix": "price-",
        "file": "船务组-客户协议价格维护-原型-PRD.html",
        "title": "第 5 章 · 客户协议价格",
        "hint": "向导三步、同步对象、折扣/减额、返回结构、发布与撞车删除、下单取价、运单对照。改重量段后按 Excel 填格子；旧全量重填模式不做。",
        "proto": [("船务组-客户协议价格维护-原型.html", "协议价")],
    },
    {
        "id": "ch-prod",
        "prefix": "prod-",
        "file": "船务组-产品库-出货要求与收费标准-MVP-PRD.html",
        "title": "第 6 章 · 产品库 · 出货要求",
        "hint": "品名出货规则、五仓、附加服务引用；查货侧栏入账。不建附加服务、不改价。",
        "proto": [("船务组-产品库-出货要求与收费标准-MVP.html", "产品库")],
    },
    {
        "id": "ch-fba",
        "prefix": "fba-",
        "file": "船务组-下单-FBA录入-合规策略-MVP-PRD.html",
        "title": "第 7 章 · FBA 录入 · 合规提示",
        "hint": "中文品名命中产品库；五仓一致按条拦/提示，不一致只文字提示。ESS 与客户端同口径。",
        "proto": [("船务组-下单-FBA录入-合规策略-MVP.html", "FBA 录入")],
    },
    {
        "id": "ch-imp",
        "prefix": "imp-",
        "file": "进口商管理-MVP-PRD.html",
        "title": "第 8 章 · 进口商管理",
        "hint": "信息 / 使用两页签；谁能新绑、Bond、查验率。清关行不在本弹窗分配。",
        "proto": [
            ("进口商管理-MVP.html", "进口商列表"),
            ("进口商编辑-MVP.html", "进口商编辑"),
        ],
    },
    {
        "id": "ch-broker",
        "prefix": "broker-",
        "file": "进口商-清关行港口配置-MVP-PRD.html",
        "title": "第 9 章 · 清关行 × 港口授权",
        "hint": "授权矩阵。绑定时下拉只出「授权」。",
        "proto": [("进口商-清关行港口配置-MVP.html", "授权配置")],
    },
    {
        "id": "ch-bind",
        "prefix": "bind-",
        "file": "柜子编辑-绑定进口商-MVP-PRD.html",
        "title": "第 10 章 · 柜子绑定进口商",
        "hint": "柜子新增/编辑绑定。提单侧另加同船同装柜日 ≤5。",
        "proto": [("柜子编辑-绑定进口商-MVP.html", "绑柜")],
    },
]

PRD_TO_CHAPTER = {c["file"]: c["id"] for c in CHAPTERS}
PRD_TO_PREFIX = {c["file"]: c["prefix"] for c in CHAPTERS}


def extract_cards(html: str) -> str:
    m = re.search(r'<div class="page">(.*)</div>\s*</body>', html, re.S)
    if not m:
        raise ValueError("no .page")
    body = m.group(1)
    body = re.sub(r'<section class="hero">.*?</section>', "", body, count=1, flags=re.S)
    body = re.sub(r'<nav class="toc">.*?</nav>', "", body, count=1, flags=re.S)
    body = re.sub(r'<p class="foot">.*?</p>', "", body, flags=re.S)
    return body.strip()


def prefix_ids(html: str, prefix: str) -> str:
    def id_repl(m: re.Match) -> str:
        i = m.group(1)
        if i.startswith(prefix):
            return m.group(0)
        return f'id="{prefix}{i}"'

    html = re.sub(r'\bid="([^"]+)"', id_repl, html)

    def href_repl(m: re.Match) -> str:
        h = m.group(1)
        if h.startswith("#"):
            aid = h[1:]
            if aid.startswith(prefix):
                return m.group(0)
            return f'href="#{prefix}{aid}"'
        return m.group(0)

    return re.sub(r'\bhref="([^"]+)"', href_repl, html)


def rewrite_prd_links(html: str) -> str:
    def repl(m: re.Match) -> str:
        file = m.group(1)
        frag = m.group(2) or ""
        if file not in PRD_TO_CHAPTER:
            return m.group(0)
        if frag:
            aid = frag[1:]
            return f'href="#{PRD_TO_PREFIX[file]}{aid}"'
        return f'href="#{PRD_TO_CHAPTER[file]}"'

    return re.sub(r'href="([^"#]+?-PRD\.html)(#[^"]+)?"', repl, html)


def proto_links(items: list[tuple[str, str]]) -> str:
    parts = []
    for href, label in items:
        parts.append(f'<a href="{href}">打开原型 · {label} →</a>')
    return "\n        ".join(parts)


def chapter_banner(ch: dict) -> str:
    booklet = ch["file"]
    jumps = proto_links(ch["proto"])
    return f'''    <section class="ch-banner" id="{ch["id"]}">
      <h2>{ch["title"]}</h2>
      <p>{ch["hint"]}</p>
      <div class="proto-jumps">
        {jumps}
        <a href="{booklet}">分册 PRD</a>
      </div>
    </section>
'''


def assemble_chapters() -> str:
    chunks = []
    for ch in CHAPTERS:
        src = (ROOT / ch["file"]).read_text(encoding="utf-8")
        body = rewrite_prd_links(prefix_ids(extract_cards(src), ch["prefix"]))
        chunks.append(chapter_banner(ch) + "\n" + body)
    return "\n\n".join(chunks)


COVER = r'''    <section class="hero">
      <h1>船务组 · 需求 PRD · 产品部全文</h1>
      <p>2026-08-26。本期功能点全文：每章内嵌对应分册的筛选 / 字段 / 逻辑，每条说明带原型跳转。<strong>开发/测试验收用本文。</strong>分册是维护源，改分册后重生成；细则冲突以分册为准。跨页索引只看联动和配置数。 <strong>运价本期不做。船公司提单号规则、进港落库（落箱触发 / H4）二期、范围外。</strong>
      　<a href="船务组-导航.html" style="color:#fff">导航</a>
      　<a href="船务组-需求PRD.html" style="color:#fff">跨页索引</a>
      　<a href="G3-船务-组流程图.html" style="color:#fff">G3 流程</a></p>
    </section>
    <nav class="toc">
      <a href="#m-scope">本期范围</a>
      <a href="#m-skip">本期不做</a>
      <a href="#m-bg">背景</a>
      <a href="#m-map">页面对照</a>
      <a href="#m1-link">跨页联动</a>
      <a href="#ch-create">1 创建</a>
      <a href="#ch-bl">2 提单管理</a>
      <a href="#ch-wait">3 待配仓</a>
      <a href="#ch-final">4 终配舱</a>
      <a href="#ch-proto">5 协议价</a>
      <a href="#ch-prod">6 产品库</a>
      <a href="#ch-fba">7 FBA</a>
      <a href="#ch-imp">8 进口商</a>
      <a href="#ch-broker">9 清关行</a>
      <a href="#ch-bind">10 绑柜</a>
      <a href="#m8">配置数</a>
      <a href="#m9">二期 / 待定</a>
    </nav>

    <section class="card" id="m-scope">
      <h2>本期做（对着原型评审）</h2>
      <p>下列页面本期交付。点「打开原型」进交互；细则在后文章节，功能点行末「原型」列可跳到具体控件。</p>
      <table>
        <thead><tr><th>页</th><th>本期要点</th><th class="proto">原型</th><th class="proto">本章</th></tr></thead>
        <tbody>
          <tr><td>提单创建 / 批量 / AI</td><td>AI/Excel、海运费+两免用箱回写预估。提单号手填或空着</td><td class="proto"><a href="船务组-提单创建批量-AI识别-MVP.html">批量</a> · <a href="船务组-提单创建批量-AI识别-MVP.html?mode=single">单票</a></td><td class="proto"><a href="#ch-create">第 1 章</a></td></tr>
          <tr><td>提单管理</td><td>收敛工具栏；分配 / 播报 / 取消IT / 绑定 / 换柜换船 / 费用·水单 / 日志；预警单独筛；未进港预警</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">打开</a></td><td class="proto"><a href="#ch-bl">第 2 章</a></td></tr>
          <tr><td>待配仓</td><td>按行勾选、改预配舱号、合并报关标</td><td class="proto"><a href="船务组-待配仓-MVP.html">打开</a></td><td class="proto"><a href="#ch-wait">第 3 章</a></td></tr>
          <tr><td>终配舱记录</td><td>自动配舱规则、出号、自动配舱标、分不同配舱</td><td class="proto"><a href="船务组-终配舱-MVP.html">打开</a></td><td class="proto"><a href="#ch-final">第 4 章</a></td></tr>
          <tr><td>客户协议价</td><td>向导、同步对象、折扣/减额、发布撞车、运单对照</td><td class="proto"><a href="船务组-客户协议价格维护-原型.html">打开</a></td><td class="proto"><a href="#ch-proto">第 5 章</a></td></tr>
          <tr><td>产品库出货</td><td>出货规则、五仓、查货确认入账</td><td class="proto"><a href="船务组-产品库-出货要求与收费标准-MVP.html">打开</a></td><td class="proto"><a href="#ch-prod">第 6 章</a></td></tr>
          <tr><td>FBA 录入提示</td><td>品名命中、五仓一致/不一致口径。ESS 与客户端同口径</td><td class="proto"><a href="船务组-下单-FBA录入-合规策略-MVP.html">打开</a></td><td class="proto"><a href="#ch-fba">第 7 章</a></td></tr>
          <tr><td>进口商</td><td>信息/使用、谁能新绑、Bond、查验率</td><td class="proto"><a href="进口商管理-MVP.html">列表</a> · <a href="进口商编辑-MVP.html">编辑</a></td><td class="proto"><a href="#ch-imp">第 8 章</a></td></tr>
          <tr><td>清关行 × 港口</td><td>授权矩阵，绑定时只出授权</td><td class="proto"><a href="进口商-清关行港口配置-MVP.html">打开</a></td><td class="proto"><a href="#ch-broker">第 9 章</a></td></tr>
          <tr><td>柜子绑定进口商</td><td>柜子侧绑定；提单侧同船同日 ≤5</td><td class="proto"><a href="柜子编辑-绑定进口商-MVP.html">打开</a></td><td class="proto"><a href="#ch-bind">第 10 章</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m-skip">
      <h2>本期不做 / 二期范围外（不得开发验收）</h2>
      <table>
        <thead><tr><th>项</th><th>口径</th><th class="proto">原型（仅对照，不验收）</th></tr></thead>
        <tbody>
          <tr><td>运价管理</td><td>本期不做</td><td class="proto"><a href="船务组-运价管理-我司与代理订舱-MVP.html">打开</a></td></tr>
          <tr><td>船公司提单号规则</td><td>二期、范围外。创建手填或空着，不套前缀</td><td class="proto"><a href="数据字典-船公司航运-提单号规则-MVP.html">字典</a></td></tr>
          <tr><td>进港落库</td><td>飞驼自动抓取本期先调研。能抓则回写、抓不到手录。落箱费自动出、H4 交海外：二期。列表进港时间列、未进港预警本期仍做；落箱费只手登</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">列表</a></td></tr>
          <tr><td>协议价旧全量重填模式</td><td>整表统一价那种不做。改重量段后按 Excel 交互填格子要做。不按比重分档、不推报价组、不做特价仓</td><td class="proto"><a href="船务组-客户协议价格维护-原型.html">协议价</a></td></tr>
          <tr><td>提单管理工具栏已去掉</td><td>查验挂票、改单手打、进港代码、公告。查验换船并入换柜换船三类。发 AMS / 发 ISF 在本页装柜前发送</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">工具栏</a></td></tr>
          <tr><td>舱位播报推群</td><td>飞驼开航/截单/到达/下一水只读；下方 Excel 可手改；本期做一键复制（复制表格）。不做推群。范围（周）1–8</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">播报</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m-bg">
      <h2>背景</h2>
      <p>船务是头程枢纽：订舱/提单 → 分配装柜 → 配舱 → 进港 → H4 海外；并行 H3 取消 IT、H5 海放/码放只读回写。</p>
      <table>
        <thead><tr><th>痛点</th><th>本期做</th></tr></thead>
        <tbody>
          <tr><td>录入慢、免用箱与预估不同源</td><td>创建 AI/Excel、海运费+两免用箱回写预估、装柜时间进列表。船司前缀字典二期</td></tr>
          <tr><td>工具栏过载，船务/关务边界糊</td><td>收敛工具栏；本页去掉查验挂票/改单手打、进港代码按钮。发 AMS / 发 ISF 在本页。查验换船并入换柜换船三类</td></tr>
          <tr><td>配舱/标记口头约定多</td><td>终配舱写入自动配舱规则、待配仓按行勾选、终配舱打标/分舱、IT/海放/码放口径写死</td></tr>
          <tr><td>进港预警滞后</td><td>未进港必预警（与飞驼能否抓无关）；滞箱滞港按提还柜/进港提示天数；费用/水单手登。进港落库触发落箱/H4 二期</td></tr>
        </tbody>
      </table>
      <p class="note">口径：<a href="G3-船务-组流程图.html">G3</a> · <a href="船务组-0730-费用节点提单配仓-大致方案.html">0730</a> · 卢慧恒/张亚晨 舱位播报（仓→港→船；飞驼时间只读；预警单独筛不叠用）。08/20 下午业务、08/24 上午内部收口。跨页索引见 <a href="船务组-需求PRD.html">船务组 · 需求 PRD</a>。</p>
    </section>

    <section class="card" id="m-map">
      <h2>页面对照（评审从这里点）</h2>
      <table>
        <thead><tr><th>页</th><th>本章 / 分册</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>提单创建 / 批量 / AI</td><td><a href="#ch-create">第 1 章</a> · <a href="船务组-提单创建批量-AI识别-MVP-PRD.html">分册</a></td><td class="proto"><a href="船务组-提单创建批量-AI识别-MVP.html">批量</a> · <a href="船务组-提单创建批量-AI识别-MVP.html?mode=single">单票</a></td></tr>
          <tr><td>船公司提单号规则</td><td><a href="#m9">二期 · 范围外</a> · <a href="数据字典-船公司航运-提单号规则-MVP-PRD.html">分册</a></td><td class="proto"><a href="数据字典-船公司航运-提单号规则-MVP.html">打开</a></td></tr>
          <tr><td>提单管理（含分配/播报/费用/IT/绑定/换柜换船/日志/预警）</td><td><a href="#ch-bl">第 2 章</a> · <a href="船务组-提单管理-按周分组与分配-MVP-PRD.html">分册</a></td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">打开</a></td></tr>
          <tr><td>待配仓（勾选、改号、合并报关标）</td><td><a href="#ch-wait">第 3 章</a> · <a href="船务组-待配仓-MVP-PRD.html">分册</a></td><td class="proto"><a href="船务组-待配仓-MVP.html">打开</a></td></tr>
          <tr><td>终配舱记录（含自动配舱规则、出号）</td><td><a href="#ch-final">第 4 章</a> · <a href="船务组-终配舱-MVP-PRD.html">分册</a></td><td class="proto"><a href="船务组-终配舱-MVP.html">打开</a></td></tr>
          <tr><td>客户协议价</td><td><a href="#ch-proto">第 5 章</a> · <a href="船务组-客户协议价格维护-原型-PRD.html">分册</a></td><td class="proto"><a href="船务组-客户协议价格维护-原型.html">打开</a></td></tr>
          <tr><td>产品库出货</td><td><a href="#ch-prod">第 6 章</a> · <a href="船务组-产品库-出货要求与收费标准-MVP-PRD.html">分册</a></td><td class="proto"><a href="船务组-产品库-出货要求与收费标准-MVP.html">打开</a></td></tr>
          <tr><td>FBA 录入提示</td><td><a href="#ch-fba">第 7 章</a> · <a href="船务组-下单-FBA录入-合规策略-MVP-PRD.html">分册</a></td><td class="proto"><a href="船务组-下单-FBA录入-合规策略-MVP.html">打开</a></td></tr>
          <tr><td>进口商</td><td><a href="#ch-imp">第 8 章</a> · <a href="进口商管理-MVP-PRD.html">分册</a></td><td class="proto"><a href="进口商管理-MVP.html">列表</a> · <a href="进口商编辑-MVP.html">编辑</a></td></tr>
          <tr><td>清关行 × 港口</td><td><a href="#ch-broker">第 9 章</a> · <a href="进口商-清关行港口配置-MVP-PRD.html">分册</a></td><td class="proto"><a href="进口商-清关行港口配置-MVP.html">打开</a></td></tr>
          <tr><td>柜子绑定进口商</td><td><a href="#ch-bind">第 10 章</a> · <a href="柜子编辑-绑定进口商-MVP-PRD.html">分册</a></td><td class="proto"><a href="柜子编辑-绑定进口商-MVP.html">打开</a></td></tr>
          <tr><td>运价</td><td><a href="#m-skip">本期不做</a> · <a href="船务组-运价管理-我司与代理订舱-MVP-PRD.html">分册</a></td><td class="proto"><a href="船务组-运价管理-我司与代理订舱-MVP.html">打开</a></td></tr>
          <tr><td>组流程</td><td>—</td><td class="proto"><a href="G3-船务-组流程图.html">G3</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m1">
      <h2>交接与跨页联动</h2>
      <p>上游：改配/其他价格表渠道自动出价进订舱配舱（不经舱位表）。下游 H1 报完价回接订舱；H3 取消IT；H5 关务放行→本页海放/码放只读。<strong>H4 进港落库→落箱/交海外本期不做</strong>。依赖进口商+授权矩阵、仓库装完回写。飞驼自动抓取本期先调研；能抓则回写，抓不到手录。</p>
      <h3 id="m1-link">跨页联动</h3>
      <table>
        <thead><tr><th>动作</th><th>读 / 写 / 要点</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>创建保存</td><td>读基础资料。写提单+财务预估（海运费、两免用箱）。无配置不臆造。不读船司提单号前缀（规则二期）。</td><td class="proto"><a href="船务组-提单创建批量-AI识别-MVP.html">创建</a></td></tr>
          <tr><td>改提单号规则</td><td>二期、范围外，不得开发。创建提单号手填或空着。</td><td class="proto"><a href="数据字典-船公司航运-提单号规则-MVP.html">字典</a></td></tr>
          <tr><td>分配确定</td><td>写拖车/地址/装柜时间/按装柜时间带出周并落入周页签/待装柜+日志。不对接到企微群。</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html#asMask">分配</a></td></tr>
          <tr><td>操作日志</td><td>挂提单行（号+柜）。本页手操提交成功才写；仓库/关务/飞驼回写也进同一抽屉。不记查询、导出、播报复制。发 AMS / 发 ISF 成功要记。细则见<a href="#bl-m-log">提单管理 3.4</a>。</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html#logMask">日志</a></td></tr>
          <tr><td>仓库装完</td><td>写绿/橙底；装完缺柜铅封才预警。</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">列表</a></td></tr>
          <tr><td>取消 IT</td><td>只存无 / 已取消IT。本期不对接有IT接口，人工判断，已取消不能改回。关务展示已取消IT。默认可增加一笔取消IT费挂财务预估。</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html#itMask">取消IT</a></td></tr>
          <tr><td>海放/码放</td><td>关务订阅回写业务标记。8 值筛选只在船务；关务仍用清关放行粗状态。</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">列表</a></td></tr>
          <tr><td>费用登记</td><td>落业务数据统计。无同步对象。一笔只能挂提单 / 柜 / 运单其中一个。加载加费挂提单并留柜号。无费用节点。</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html#feeMask">费用</a></td></tr>
          <tr><td>飞驼进港 / 进港落库</td><td>飞驼自动抓取本期先调研。未进港预警本期做。进港代码/时间能抓则回写，抓不到手录。落库触发落箱费、H4：<strong>二期、范围外</strong>。落箱费只手登。</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">列表</a></td></tr>
          <tr><td>绑进口商</td><td>下拉已启用/停用待观察。清关行只出授权。列表不展示清关行。同船同装柜日 ≤5 可强制留痕。</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html#impMask">绑定</a></td></tr>
          <tr><td>待配仓 / 终配</td><td>运单只走待配舱或终配舱，禁止「待终配舱」。同渠道装填+反倾销（不占装填档）。一柜方数 &lt; 68、重量 &lt; 20 吨。自动终配打标。合并报关拆到 ≥2 舱打「分不同配舱」并列另舱号；拆组在待配仓改号时提醒。</td><td class="proto"><a href="船务组-待配仓-MVP.html">待配仓</a> · <a href="船务组-终配舱-MVP.html">终配舱</a></td></tr>
          <tr><td>协议价发布</td><td>确定才落库。撞车已启用作废。下单命中客户+产品+分公司+有效期取协议价。</td><td class="proto"><a href="船务组-客户协议价格维护-原型.html#btnEnable">启用</a></td></tr>
          <tr><td>销售报价改价</td><td>折扣/减额（含不返回结构）跟着变。旧全量重填模式不做；改重量段后按 Excel 填格子。</td><td class="proto"><a href="船务组-客户协议价格维护-原型.html">协议价</a></td></tr>
          <tr><td>产品库保存</td><td>一个品名只绑 1 项附加服务名称。报关用报关 HS，清关用清关 HS。</td><td class="proto"><a href="船务组-产品库-出货要求与收费标准-MVP.html">产品库</a></td></tr>
          <tr><td>下单选品名</td><td>看五仓是否一致：一致按该条拦/提示；不一致只文字提示。<strong>ESS 与客户端同口径</strong>。ESS 提示在总箱数右侧。</td><td class="proto"><a href="船务组-下单-FBA录入-合规策略-MVP.html">FBA</a></td></tr>
          <tr><td>查货确认</td><td>以侧栏勾选入账。官方只读不回写。不接已进仓只红字提示，不自动扣。</td><td class="proto"><a href="船务组-产品库-出货要求与收费标准-MVP.html#btnInspect">模拟查货</a></td></tr>
        </tbody>
      </table>
    </section>
'''

TAIL = r'''    <section class="card" id="m8">
      <h2>配置数（本期写死，无配置页、无字典）</h2>
      <table>
        <thead><tr><th>项</th><th>默认</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>一水绑柜</td><td>同一进口商+同一船+预计装柜同一天 ≤ <strong>5</strong>。未填装柜日单独一组。不同日不累计。</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html#impMask">绑定</a></td></tr>
          <tr><td>在途未清关</td><td>已绑且清关没完的柜数 &gt; <strong>5</strong> 标一下（数柜，不是数天）</td><td class="proto"><a href="进口商管理-MVP.html">使用管理</a></td></tr>
          <tr><td>临近截单</td><td>提前 <strong>24</strong> 小时</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">列表</a></td></tr>
          <tr><td>临近未海放/未码放</td><td>以<strong>预计开船时间</strong>（列表「预计出发时间」）为基准，今日～+<strong>3</strong> 天且未放行。不用计划出发 / 截单 / 实际开船</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">列表</a></td></tr>
          <tr><td>Bond</td><td>面额 5 万、上限 250；≥200 黄、≥240 红、≥250 用尽</td><td class="proto"><a href="进口商管理-MVP.html">进口商</a></td></tr>
          <tr><td>查验率异常</td><td>≥10%</td><td class="proto"><a href="进口商管理-MVP.html">进口商</a></td></tr>
          <tr><td>费用类型</td><td>费用类型菜单 · 销售费用（与应付添加费用同一源）。现有类型新增「国内」「国外」</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html#feeMask">费用</a></td></tr>
          <tr><td>提单号前缀</td><td>二期、范围外。本期创建手填或空着，不套船司字典前缀</td><td class="proto"><a href="数据字典-船公司航运-提单号规则-MVP.html">字典</a></td></tr>
          <tr><td>配舱档</td><td>合并报关→服装→托盘→报关件→买单补位。反倾销不占装填档。服装词表见<a href="#final-m-stow">终配舱 · 自动配舱</a></td><td class="proto"><a href="船务组-终配舱-MVP.html#btnStowRule">规则说明</a></td></tr>
          <tr><td>配仓上限</td><td>一柜方数 &lt; <strong>68</strong>、重量 &lt; <strong>20</strong> 吨（&lt; 20000 kg）。达到即开新柜；保存时 ≥68 方或 ≥20 吨硬拦。本期写死，无配置页</td><td class="proto"><a href="船务组-终配舱-MVP.html#btnStowRule">规则说明</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m9">
      <h2>待定 / 二期 / 范围外</h2>
      <table>
        <thead><tr><th>标记</th><th>项</th><th>说明</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>范围外</td><td>整柜签入</td><td>整柜客服承接，不改</td><td class="proto">—</td></tr>
          <tr><td>二期 · 范围外</td><td>船公司提单号规则</td><td>字典加列、创建/AI 自动带前缀。本期手填或空着。不得开发</td><td class="proto"><a href="数据字典-船公司航运-提单号规则-MVP.html">字典</a></td></tr>
          <tr><td>二期 · 范围外</td><td>进港落库</td><td>进港时间写入后触发落箱费、H4 交海外。飞驼自动抓取先调研。列表展示与未进港预警本期仍做；落箱费只手登。不得开发</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">列表</a></td></tr>
          <tr><td>二期</td><td>舱位表独立线上化、登记时效提醒</td><td>—</td><td class="proto">—</td></tr>
          <tr><td>二期</td><td>配舱作业台可视化、终配 10～20s 性能</td><td>规则按终配舱记录执行</td><td class="proto"><a href="船务组-终配舱-MVP.html">终配舱</a></td></tr>
          <tr><td>二期</td><td>删除舱单作业台</td><td>报关行材料校验→海管家删单留痕</td><td class="proto">—</td></tr>
          <tr><td>二期</td><td>智能甩柜完整链路</td><td>开船未报完→更轨迹·通知客服业务</td><td class="proto">—</td></tr>
          <tr><td>待定</td><td>删除提单后费用清不清（CW016）</td><td>A 删除清费用 / B 只删提单费用留 / C 有费用须先清再删。不得开发</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html">列表</a></td></tr>
          <tr><td>待定</td><td>飞驼覆盖港口清单谁维护</td><td>—</td><td class="proto">—</td></tr>
          <tr><td>待定</td><td>产品库需资料无附件仍确认后的扣件类型</td><td>先做到进扣件；勾哪种 8 项不定、不验</td><td class="proto"><a href="船务组-下单-FBA录入-合规策略-MVP.html">FBA</a></td></tr>
          <tr><td>拆并</td><td>AN / DO / 临近 LFD 不另开提单栏目</td><td>AN 杂费进费用登记；取消IT 后 AN 审查随关务待办。DO/LFD 归海外</td><td class="proto"><a href="船务组-提单管理-按周分组与分配-MVP.html#feeMask">费用</a></td></tr>
        </tbody>
      </table>
    </section>
    <p class="foot">船务组 · 产品部全文 2026-08-26 · 开发/测试用本文 · 分册为维护源</p>
'''

HEAD = '''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>船务组 · 需求 PRD · 产品部全文 · 20260826</title>
  <link rel="stylesheet" href="ess-shipping-prd.css" />
  <style>
    .page { max-width: 1120px; }
    .ch-banner {
      background: linear-gradient(135deg, #0d4a80, #1890ff);
      color: #fff;
      border-radius: 12px;
      padding: 14px 18px;
      margin: 28px 0 12px;
    }
    .ch-banner h2 {
      margin: 0 0 6px;
      font-size: 18px;
      border: 0;
      padding: 0;
      color: #fff;
    }
    .ch-banner p { margin: 0 0 10px; font-size: 13px; line-height: 1.65; opacity: .95; }
    .proto-jumps { display: flex; flex-wrap: wrap; gap: 8px; }
    .proto-jumps a {
      color: #fff;
      background: rgba(255,255,255,.2);
      padding: 4px 12px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 13px;
      font-weight: 600;
    }
    .proto-jumps a:hover { background: rgba(255,255,255,.32); }
  </style>
</head>
<body>
  <script>
    if (window.self !== window.top) document.documentElement.classList.add("ess-prd-embed");
    (function () {
      function scrollToHash() {
        var id = (location.hash || "").replace(/^#/, "");
        if (!id) return;
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: "start", behavior: "auto" });
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scrollToHash);
      else scrollToHash();
      window.addEventListener("hashchange", scrollToHash);
    })();
  </script>
  <div class="page">
'''


def main() -> None:
    body = COVER + "\n" + assemble_chapters() + "\n" + TAIL
    html = HEAD + body + "\n  </div>\n</body>\n</html>\n"
    ids = re.findall(r'\bid="([^"]+)"', html)
    dups = [i for i, c in Counter(ids).items() if c > 1]
    proto_cells = len(re.findall(r'class="proto"', html))
    OUT.write_text(html, encoding="utf-8")
    print(f"wrote {OUT.name}  bytes={OUT.stat().st_size}  ids={len(ids)}  proto_cells={proto_cells}")
    if dups:
        print("DUPLICATE IDS:", dups)
        raise SystemExit(1)


if __name__ == "__main__":
    main()
