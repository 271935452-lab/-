# -*- coding: utf-8 -*-
"""Assemble 海外对接组产品部全文 PRD from current booklets. Run from this folder."""
from __future__ import annotations

import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "海外对接组-需求PRD-产品部全文.html"

CHAPTERS = [
    {
        "id": "ch-master",
        "prefix": "master-",
        "file": "海外对接组-主单跟进-MVP-PRD.html",
        "title": "第 1 章 · 主单跟进",
        "hint": "货柜类型多选、跳转尾单/卡派。只写本期改 / 新。",
        "proto": [("海外对接组-主单跟进-MVP.html", "主单跟进")],
    },
    {
        "id": "ch-card",
        "prefix": "card-",
        "file": "海外对接组-卡派跟进新-MVP-PRD.html",
        "title": "第 2 章 · 卡派跟进(新)",
        "hint": "两维超时单独计分；异常件看工单流程；约仓回写尾单。",
        "proto": [("海外对接组-卡派跟进新-MVP.html", "卡派跟进")],
    },
    {
        "id": "ch-ex",
        "prefix": "ex-",
        "file": "海外对接组-尾程快递件-MVP-PRD.html",
        "title": "第 3 章 · 尾程快递件",
        "hint": "页签只留全部 / UPS派 / FEDEX派 / 快递。异常件登记。",
        "proto": [("海外对接组-尾程快递件-MVP.html", "尾程快递件")],
    },
    {
        "id": "ch-pu",
        "prefix": "pu-",
        "file": "海外对接组-海外卡派自提件-MVP-PRD.html",
        "title": "第 4 章 · 海外卡派自提件",
        "hint": "页签全部 / 自提。仓储费天数只算本页。",
        "proto": [("海外对接组-海外卡派自提件-MVP.html", "自提件")],
    },
    {
        "id": "ch-ds",
        "prefix": "ds-",
        "file": "海外对接组-一件代发-MVP-PRD.html",
        "title": "第 5 章 · 一件代发",
        "hint": "页签全部 / 待入库 / 已入库。到海外仓即完结。一件代发入库写 TD00103。",
        "proto": [("海外对接组-一件代发-MVP.html", "一件代发")],
    },
    {
        "id": "ch-fcl",
        "prefix": "fcl-",
        "file": "海外对接组-整柜尾端派送-MVP-PRD.html",
        "title": "第 6 章 · 整柜尾端派送",
        "hint": "七模式尾端。约仓登记；页签含未约仓 / 已约仓。从 V3.0 拧出。",
        "proto": [("海外对接组-整柜尾端派送-MVP.html", "整柜尾端")],
    },
    {
        "id": "ch-tail",
        "prefix": "tail-",
        "file": "海外对接组-港后-尾单单票跟踪-原型-PRD.html",
        "title": "第 7 章 · 港后 · 尾单单票跟踪",
        "hint": "客户类型、拆柜时间、费用登记 ·水单、轨迹维护、约仓同步。",
        "proto": [("海外对接组-港后-尾单单票跟踪-原型.html", "尾单跟踪")],
    },
    {
        "id": "ch-sla",
        "prefix": "sla-",
        "file": "海外对接组-时效表-提柜私卡快递FBA-MVP-PRD.html",
        "title": "第 8 章 · 时效表 · 提柜 / 私卡 / 快递 / FBA",
        "hint": "周报。私卡含出库→签收 = 签收时间 − 出库时间。无月度签收页。",
        "proto": [("海外对接组-时效表-提柜私卡快递FBA-MVP.html", "时效表")],
    },
    {
        "id": "ch-strip",
        "prefix": "strip-",
        "file": "海外对接组-提柜拆柜时效-MVP-PRD.html",
        "title": "第 9 章 · 提柜拆柜时效",
        "hint": "按柜：提柜时效 / 等拆 / 拆柜耗时。货型按提单号分 FBA/私卡/自提/快递。",
        "proto": [("海外对接组-提柜拆柜时效-MVP.html", "提柜拆柜时效")],
    },
]

STUBS = [
    {
        "id": "ch-estbl",
        "title": "第 10 章 · 提单主单预估费用",
        "hint": "旧稿，未改三段。柜维预估。细则仍看分册，不拼进正文。",
        "booklet": "海外对接组-提单主单预估费用表-PRD.html",
        "proto": [("海外对接组-提单主单预估费用表-MVP.html", "主单预估")],
    },
    {
        "id": "ch-estawb",
        "title": "第 11 章 · 尾程预估（运单维）",
        "hint": "旧稿，未改三段。运单维预估。细则仍看分册，不拼进正文。",
        "booklet": "海外对接组-尾程预估-运单维-PRD.html",
        "proto": [("海外对接组-尾程预估费用表-MVP.html", "尾程预估")],
    },
]

PRD_TO_CHAPTER = {c["file"]: c["id"] for c in CHAPTERS}
PRD_TO_PREFIX = {c["file"]: c["prefix"] for c in CHAPTERS}


def extract_cards(html: str) -> str:
    m = re.search(r'<div class="page"[^>]*>(.*)</div>\s*</body>', html, re.S)
    if not m:
        raise ValueError("no .page")
    body = m.group(1)
    body = re.sub(r'<section class="hero"[^>]*>.*?</section>', "", body, count=1, flags=re.S)
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
        name = Path(file.replace("\\", "/")).name
        if name not in PRD_TO_CHAPTER:
            return m.group(0)
        if frag:
            return f'href="#{PRD_TO_PREFIX[name]}{frag[1:]}"'
        return f'href="#{PRD_TO_CHAPTER[name]}"'

    return re.sub(r'href="([^"#]+?-PRD\.html)(#[^"]+)?"', repl, html)


def proto_links(items: list[tuple[str, str]]) -> str:
    parts = []
    for href, label in items:
        parts.append(f'<a href="{href}">打开原型 · {label} →</a>')
    return "\n        ".join(parts)


def chapter_banner(ch: dict) -> str:
    booklet = ch.get("booklet") or ch["file"]
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
    for st in STUBS:
        chunks.append(
            chapter_banner(st)
            + "\n    <section class=\"card\">\n      <p>"
            + st["hint"]
            + "　<a href=\""
            + st["booklet"]
            + "\">打开分册</a></p>\n    </section>\n"
        )
    return "\n\n".join(chunks)


COVER = r'''    <section class="hero">
      <h1>海外对接组 · 需求 PRD · 产品部全文</h1>
      <p>2026-08-31。本期功能点全文：上方是跨页索引，下方各章内嵌对应分册的筛选 / 字段 / 逻辑，每条说明带原型跳转。<strong>开发/测试验收用本文。</strong>分册是维护源，改分册后重生成；细则冲突以分册为准。跨页索引只看联动和配置数。 DW / 佳成 Fist / 客户协议价本期不做。无月度签收货物报表。
      　<a href="海外对接组-导航.html" style="color:#fff">导航</a>
      　<a href="海外对接组-需求PRD.html" style="color:#fff">跨页索引</a>
      　<a href="流程图/G5-海外对接-组流程图.html" style="color:#fff">G5 流程</a>
      　<a href="../船务/船务组-需求PRD-产品部全文-20260826.html" style="color:#fff">船务全文（对照）</a></p>
    </section>
    <nav class="toc">
      <a href="#m-scope">本期范围</a>
      <a href="#m-skip">本期不做</a>
      <a href="#m-bg">背景</a>
      <a href="#m0">约定</a>
      <a href="#m-map">页面对照</a>
      <a href="#m1-link">跨页联动</a>
      <a href="#ch-master">1 主单</a>
      <a href="#ch-card">2 卡派</a>
      <a href="#ch-ex">3 快递</a>
      <a href="#ch-pu">4 自提</a>
      <a href="#ch-ds">5 一件代发</a>
      <a href="#ch-fcl">6 整柜尾端</a>
      <a href="#ch-tail">7 尾单</a>
      <a href="#ch-sla">8 时效表</a>
      <a href="#ch-strip">9 提柜拆柜</a>
      <a href="#ch-estbl">10 主单预估</a>
      <a href="#ch-estawb">11 尾程预估</a>
      <a href="#m8">配置数</a>
      <a href="#m9">二期 / 待定</a>
    </nav>

    <section class="card" id="m-scope">
      <h2>本期做（对着原型评审）</h2>
      <p>下列页面本期交付。点「打开原型」进交互；细则在后文章节。</p>
      <table>
        <thead><tr><th>页</th><th>本期要点</th><th class="proto">原型</th><th class="proto">本章</th></tr></thead>
        <tbody>
          <tr><td>主单跟进</td><td>货柜类型多选；跳转尾单 / 卡派</td><td class="proto"><a href="海外对接组-主单跟进-MVP.html">打开</a></td><td class="proto"><a href="#ch-master">第 1 章</a></td></tr>
          <tr><td>卡派跟进(新)</td><td>两维超时单独计分；异常件看工单；约仓回写尾单</td><td class="proto"><a href="海外对接组-卡派跟进新-MVP.html">打开</a></td><td class="proto"><a href="#ch-card">第 2 章</a></td></tr>
          <tr><td>尾程快递件</td><td>页签全部 / UPS派 / FEDEX派 / 快递；异常件登记</td><td class="proto"><a href="海外对接组-尾程快递件-MVP.html">打开</a></td><td class="proto"><a href="#ch-ex">第 3 章</a></td></tr>
          <tr><td>海外卡派自提件</td><td>页签全部 / 自提；仓储费天数只算本页</td><td class="proto"><a href="海外对接组-海外卡派自提件-MVP.html">打开</a></td><td class="proto"><a href="#ch-pu">第 4 章</a></td></tr>
          <tr><td>一件代发</td><td>待入库 / 已入库；到仓即完结；一件代发入库 TD00103</td><td class="proto"><a href="海外对接组-一件代发-MVP.html">打开</a></td><td class="proto"><a href="#ch-ds">第 5 章</a></td></tr>
          <tr><td>整柜尾端派送</td><td>七模式尾端；约仓登记；未约仓 / 已约仓页签</td><td class="proto"><a href="海外对接组-整柜尾端派送-MVP.html">打开</a></td><td class="proto"><a href="#ch-fcl">第 6 章</a></td></tr>
          <tr><td>港后 · 尾单单票跟踪</td><td>客户类型、拆柜时间、费用 ·水单、轨迹维护</td><td class="proto"><a href="海外对接组-港后-尾单单票跟踪-原型.html">打开</a></td><td class="proto"><a href="#ch-tail">第 7 章</a></td></tr>
          <tr><td>时效表（派送 · 周）</td><td>私卡 / 快递 / FBA / 付雪提柜。私卡出库→签收</td><td class="proto"><a href="海外对接组-时效表-提柜私卡快递FBA-MVP.html">打开</a></td><td class="proto"><a href="#ch-sla">第 8 章</a></td></tr>
          <tr><td>提柜拆柜时效</td><td>到仓−到港；等拆；美库拆结−开拆</td><td class="proto"><a href="海外对接组-提柜拆柜时效-MVP.html">打开</a></td><td class="proto"><a href="#ch-strip">第 9 章</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m-skip">
      <h2>本期不做 / 二期范围外（不得开发验收）</h2>
      <table>
        <thead><tr><th>项</th><th>口径</th><th class="proto">原型（仅对照，不验收）</th></tr></thead>
        <tbody>
          <tr><td>月度签收货物报表</td><td>本期不做。周报走时效表。尾单不挂「导出月度签收报表」</td><td class="proto">—</td></tr>
          <tr><td>DW 预警 / SR 转仓</td><td>本期不做</td><td class="proto"><a href="海外对接组-DW预警自查和修正-SR智能转仓-MVP.html">打开</a></td></tr>
          <tr><td>佳成 Fist</td><td>本期不做</td><td class="proto"><a href="佳成Fist对接-给开发.html">打开</a></td></tr>
          <tr><td>客户协议价格维护</td><td>在船务验收，不进海外本期导航</td><td class="proto"><a href="../船务/船务组-客户协议价格维护-原型.html">船务</a></td></tr>
          <tr><td>海外仓预估费用规则 / 部门进仓数据</td><td>旁支，不进本期</td><td class="proto"><a href="../产品部门-导航.html#s-branch">产品部门 · 旁支</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m-bg">
      <h2>背景</h2>
      <p>海外对接是港后枢纽：主单到港/提柜 → 卡派/快递/自提/一件代发分流 → 尾程预估与跟踪。0804 港前港后价格、15 天改快递、仓储费天数落在各分册。</p>
      <table>
        <thead><tr><th>痛点</th><th>本期做</th></tr></thead>
        <tbody>
          <tr><td>主单、卡派、快递、自提、一件代发挤在一张尾程轨迹</td><td>拆工作台：主单跟进 / 卡派跟进(新) / 尾程快递件 / 海外卡派自提件 / 一件代发</td></tr>
          <tr><td>货柜类型口头筛</td><td>主单跟进货柜类型多选（含任一）</td></tr>
          <tr><td>自提仓储天数手算</td><td>仓储费天数列：占用−免计（同行 10 / 直客美库 15 / 外港 2）</td></tr>
          <tr><td>快递异常靠备注</td><td>登记快递异常件，写回列并标红</td></tr>
        </tbody>
      </table>
      <p class="note">口径：<a href="流程图/G5-海外对接-组流程图.html">G5</a> · <a href="海外对接组-0804-港前港后整柜价格-大致方案.html">0804</a>。进行中 · 08/28 下午业务 · 08/31 上午内部收口。跨页索引见 <a href="海外对接组-需求PRD.html">海外对接组 · 需求 PRD</a>。</p>
    </section>

    <section class="card" id="m0">
      <h2>〇、约定</h2>
      <table>
        <thead><tr><th>点</th><th>规则</th></tr></thead>
        <tbody>
          <tr><td>谁说了算</td><td>规则以<strong>分册 PRD</strong>为准（验收）。开发/测试入口是<strong>产品部全文</strong>。跨页索引只做联动+配置数+二期。冲突时以分册为准。原型演示数据不是接口真值。</td></tr>
          <tr><td>分册骨架</td><td>与船务相同。一页三段：<strong>筛选条件</strong> → <strong>列表字段</strong> → <strong>功能逻辑说明</strong>。每条说明带原型链接，末句「测：…」。分册<strong>只写本期改动和新增</strong>，现网筛/列/按钮不复述。某段本期没有改写「本期无改」，不删段。</td></tr>
          <tr><td>原型</td><td>只展示怎么点。不放长说明。点遮罩不关。结果 toast。危险确认框。侧栏 PRD 芯片嵌分册。</td></tr>
          <tr><td>标记</td><td>NEW=新；改=相对现网；待定/二期=不得开发验收。</td></tr>
          <tr><td>勾选</td><td>改类型/备注/异常登记/自提作业/约仓登记/一件代发渠道标记、上架抓取、轨迹维护、一件代发入库 ≥1；跳转不用勾。</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m-map">
      <h2>页面对照（评审从这里点）</h2>
      <table>
        <thead><tr><th>页</th><th>本章 / 分册</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>主单跟进</td><td><a href="#ch-master">第 1 章</a> · <a href="海外对接组-主单跟进-MVP-PRD.html">分册</a></td><td class="proto"><a href="海外对接组-主单跟进-MVP.html">打开</a></td></tr>
          <tr><td>卡派跟进(新)</td><td><a href="#ch-card">第 2 章</a> · <a href="海外对接组-卡派跟进新-MVP-PRD.html">分册</a></td><td class="proto"><a href="海外对接组-卡派跟进新-MVP.html">打开</a></td></tr>
          <tr><td>尾程快递件</td><td><a href="#ch-ex">第 3 章</a> · <a href="海外对接组-尾程快递件-MVP-PRD.html">分册</a></td><td class="proto"><a href="海外对接组-尾程快递件-MVP.html">打开</a></td></tr>
          <tr><td>海外卡派自提件</td><td><a href="#ch-pu">第 4 章</a> · <a href="海外对接组-海外卡派自提件-MVP-PRD.html">分册</a></td><td class="proto"><a href="海外对接组-海外卡派自提件-MVP.html">打开</a></td></tr>
          <tr><td>一件代发</td><td><a href="#ch-ds">第 5 章</a> · <a href="海外对接组-一件代发-MVP-PRD.html">分册</a></td><td class="proto"><a href="海外对接组-一件代发-MVP.html">打开</a></td></tr>
          <tr><td>整柜尾端派送</td><td><a href="#ch-fcl">第 6 章</a> · <a href="海外对接组-整柜尾端派送-MVP-PRD.html">分册</a></td><td class="proto"><a href="海外对接组-整柜尾端派送-MVP.html">打开</a></td></tr>
          <tr><td>港后 · 尾单单票跟踪</td><td><a href="#ch-tail">第 7 章</a> · <a href="海外对接组-港后-尾单单票跟踪-原型-PRD.html">分册</a></td><td class="proto"><a href="海外对接组-港后-尾单单票跟踪-原型.html">打开</a></td></tr>
          <tr><td>时效表（派送 · 周）</td><td><a href="#ch-sla">第 8 章</a> · <a href="海外对接组-时效表-提柜私卡快递FBA-MVP-PRD.html">分册</a></td><td class="proto"><a href="海外对接组-时效表-提柜私卡快递FBA-MVP.html">打开</a></td></tr>
          <tr><td>提柜拆柜时效</td><td><a href="#ch-strip">第 9 章</a> · <a href="海外对接组-提柜拆柜时效-MVP-PRD.html">分册</a></td><td class="proto"><a href="海外对接组-提柜拆柜时效-MVP.html">打开</a></td></tr>
          <tr><td>提单主单预估费用</td><td><a href="#ch-estbl">第 10 章</a> · <a href="海外对接组-提单主单预估费用表-PRD.html">旧稿</a></td><td class="proto"><a href="海外对接组-提单主单预估费用表-MVP.html">打开</a></td></tr>
          <tr><td>尾程预估（运单维）</td><td><a href="#ch-estawb">第 11 章</a> · <a href="海外对接组-尾程预估-运单维-PRD.html">旧稿</a></td><td class="proto"><a href="海外对接组-尾程预估费用表-MVP.html">打开</a></td></tr>
          <tr><td>组流程</td><td>—</td><td class="proto"><a href="流程图/G5-海外对接-组流程图.html">G5</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m1">
      <h2>一、交接与跨页联动</h2>
      <p>上游：船务进港 / H4 交海外。本页拆工作台跟港后票。预估旧稿未改三段。</p>
      <h3 id="m1-link">跨页联动</h3>
      <table>
        <thead><tr><th>动作</th><th>读 / 写 / 要点</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>主单 → 尾单 / 卡派</td><td>跳转不改本页数据。货柜类型筛只作用主单列表。</td><td class="proto"><a href="海外对接组-主单跟进-MVP.html#btnJumpTail">主单</a></td></tr>
          <tr><td>卡派 → 尾单</td><td>备注与尾单特殊要求同票联动（演示）。轨迹维护只写卡派「最新轨迹」。约仓登记/取消约仓后，卡派「约仓时间」同票回写尾单（快递现网已同步，本期补卡派）。</td><td class="proto"><a href="海外对接组-卡派跟进新-MVP.html#btnJumpTail">卡派</a></td></tr>
          <tr><td>快递 / 自提 / 一件代发分流</td><td>私卡派、卡车派送不在快递件、自提件页签。卡派走卡派跟进；自提走自提件；一件代发走一件代发页（渠道标记 · 只跟轨迹 · 上架抓取 · 一件代发入库）。</td><td class="proto"><a href="海外对接组-一件代发-MVP.html">一件代发</a></td></tr>
          <tr><td>整柜七模式尾端</td><td>整柜清关直送/拆送/直送/拆送/到港自提/海外仓自提/仅清关。从 V3.0 拧出，与卡派跟进并列。</td><td class="proto"><a href="海外对接组-整柜尾端派送-MVP.html">整柜尾端</a></td></tr>
          <tr><td>自提仓储费天数</td><td>只算本页。占用=提柜→签收（未完成按当天）。不回写财务预估（预估见尾程预估旧稿）。</td><td class="proto"><a href="海外对接组-海外卡派自提件-MVP.html">自提件</a></td></tr>
          <tr><td>主单预估 / 尾程预估</td><td>柜维 vs 运单维。细则仍看旧稿 PRD，后续再改三段骨架。</td><td class="proto"><a href="海外对接组-提单主单预估费用表-MVP.html">主单预估</a></td></tr>
          <tr><td>提柜拆柜时效</td><td>按柜：提柜时效=到仓−到港；等拆=拆柜日−到仓；拆柜耗时=美库拆结−开拆。货型件数按提单号从运单管理分 FBA/私卡/自提/快递。</td><td class="proto"><a href="海外对接组-提柜拆柜时效-MVP.html">提柜拆柜时效</a></td></tr>
          <tr><td>尾单 · 费用登记</td><td>与提单管理「费用登记 ·水单」同一套字段与费用类型。本页默认挂运单。</td><td class="proto"><a href="海外对接组-港后-尾单单票跟踪-原型.html#btnFee">尾单费用</a></td></tr>
        </tbody>
      </table>
    </section>
'''

TAIL = r'''    <section class="card" id="m8">
      <h2>配置数</h2>
      <table>
        <thead><tr><th>项</th><th>数</th><th>说明</th></tr></thead>
        <tbody>
          <tr><td>货柜类型选项</td><td>7</td><td>UPS / FEDEX / 自提 / 卡车派送 / 私卡派 / 整柜 / 一件代发</td></tr>
          <tr><td>自提仓储免计</td><td>3 档</td><td>同行 10 天；直客·美库 15 天；外港 2 天</td></tr>
          <tr><td>卡派超时</td><td>2 维</td><td>提柜后未约 &gt;15 天；入仓后未签收/未 POD &gt;2 天。单独计分</td></tr>
          <tr><td>快递页签</td><td>4</td><td>全部 / UPS派 / FEDEX派 / 快递</td></tr>
          <tr><td>自提页签</td><td>2</td><td>全部 / 自提</td></tr>
          <tr><td>一件代发页签</td><td>3</td><td>全部 / 待入库 / 已入库（到仓即完结，无已出库）</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m9">
      <h2>二期 / 待定（不得开发验收）</h2>
      <table>
        <thead><tr><th>项</th><th>口径</th><th class="proto">原型（仅对照）</th></tr></thead>
        <tbody>
          <tr><td>DW 预警 / SR 转仓</td><td>本期不做</td><td class="proto"><a href="海外对接组-DW预警自查和修正-SR智能转仓-MVP.html">打开</a></td></tr>
          <tr><td>佳成 Fist</td><td>本期不做</td><td class="proto"><a href="佳成Fist对接-给开发.html">打开</a></td></tr>
          <tr><td>客户协议价格维护</td><td>在船务验收，不进海外本期导航</td><td class="proto"><a href="../船务/船务组-客户协议价格维护-原型.html">船务</a></td></tr>
          <tr><td>海外仓预估费用规则 / 部门进仓数据</td><td>旁支，不进本期。入口和 PRD 在产品部门旁支</td><td class="proto"><a href="../产品部门-导航.html#s-branch">产品部门 · 旁支</a></td></tr>
        </tbody>
      </table>
    </section>
    <p class="foot">海外对接组 · 产品部全文 2026-08-31 · 开发/测试用本文 · 分册为维护源</p>
'''

HEAD = '''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>海外对接组 · 需求 PRD · 产品部全文</title>
  <link rel="stylesheet" href="ess-overseas-prd.css" />
  <style>
    .page { max-width: 1120px; }
    .ch-banner {
      background: linear-gradient(135deg, #8e1b1b, #e53935);
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
