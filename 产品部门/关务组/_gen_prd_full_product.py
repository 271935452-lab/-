# -*- coding: utf-8 -*-
"""Assemble 关务组产品部全文 PRD from current booklets. Run from this folder."""
from __future__ import annotations

import os
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
OUT = ROOT / "关务组-需求PRD-产品部全文-20260826.html"
OUT_INDEX = ROOT / "关务组-需求PRD.html"
BROKER = ROOT.parents[1] / "报关行对接"

CHAPTERS = [
    {
        "id": "ch-pre",
        "prefix": "pre-",
        "file": ROOT / "关务组-签入即预报资料-MVP-PRD.html",
        "title": "第 1 章 · 预录工作台",
        "hint": "签入即做资料。只看报关件。资料岗作业：待上传 / 待推送 / 报关行处理中 / 预录待复审。报关编号=报关单号。",
        "proto": [
            ("关务组-签入即预报资料-MVP.html", "预录工作台"),
            ("关务组-预录工作台-报关单号母子表-MVP.html", "按报关编号选运单"),
        ],
        "booklet": "关务组-签入即预报资料-MVP-PRD.html",
    },
    {
        "id": "ch-exec",
        "prefix": "exec-",
        "file": BROKER / "报关管理-列表-MVP-PRD.html",
        "title": "第 2 章 · 报关执行列表",
        "hint": "报关岗：仅申报/放行。发舱单推海管家、下载舱单推代理。预录阶段页签已去掉。AMS/ISF 不在本页发。",
        "proto": [("../../报关行对接/报关管理-列表-MVP.html", "报关执行")],
        "booklet": "../../报关行对接/报关管理-列表-MVP-PRD.html",
    },
    {
        "id": "ch-review",
        "prefix": "review-",
        "file": BROKER / "报关管理-预录单审核详情-MVP-PRD.html",
        "title": "第 3 章 · 预录单审核详情",
        "hint": "结构化字段 + 沟通。#04 审附件。无结构信息时走预录单全文。",
        "proto": [("../../报关行对接/报关管理-预录单审核详情-MVP.html", "预录审核")],
        "booklet": "../../报关行对接/报关管理-预录单审核详情-MVP-PRD.html",
    },
    {
        "id": "ch-blc",
        "prefix": "blc-",
        "file": BROKER / "报关管理-预录审核详情-兼容-MVP-PRD.html",
        "title": "第 4 章 · 提单详情 · 清报关",
        "hint": "清报关 Tab：数据 / 做资料分票核准 / 清报关附件（#04）。",
        "proto": [("../../报关行对接/报关管理-预录审核详情-兼容-MVP.html?tab=customs", "清报关")],
        "booklet": "../../报关行对接/报关管理-预录审核详情-兼容-MVP-PRD.html",
    },
    {
        "id": "ch-split",
        "prefix": "split-",
        "file": BROKER / "报关管理-做资料分票核准-MVP-PRD.html",
        "title": "第 5 章 · 做资料分票核准",
        "hint": "报关件取预录；末票买单轧差。「已核准」是本页标记。点行看比对。无比对操作列、无差异处置、无打开预录附件、页头无进数来源卡。",
        "proto": [("../../报关行对接/报关管理-做资料分票核准-MVP.html", "做资料分票")],
        "booklet": "../../报关行对接/报关管理-做资料分票核准-MVP-PRD.html",
    },
    {
        "id": "ch-house",
        "prefix": "house-",
        "file": BROKER / "分单号规则配置-MVP-PRD.html",
        "title": "第 6 章 · 分单号规则配置",
        "hint": "船司×港口模板。生成节点=绑定提单之后。未绑主单不生成；终配舱落成本身不触发。",
        "proto": [("../../报关行对接/分单号规则配置-MVP.html", "分单号规则")],
        "booklet": "../../报关行对接/分单号规则配置-MVP-PRD.html",
    },
    {
        "id": "ch-api",
        "prefix": "api-",
        "file": BROKER / "报关行API配置-MVP-PRD.html",
        "title": "第 7 章 · 报关行 API 配置",
        "hint": "适配器、字段映射、本期能力。推送/回调主键=报关编号。不按分票号查委托。",
        "proto": [("../../报关行对接/报关行API配置-MVP.html", "API 配置")],
        "booklet": "../../报关行对接/报关行API配置-MVP-PRD.html",
    },
    {
        "id": "ch-vendor",
        "prefix": "vendor-",
        "file": BROKER / "报关管理-供应商上传审核-MVP-PRD.html",
        "title": "第 8 章 · 供应商上传审核",
        "hint": "未对接 API 的线下通道。确认后等同 #04 / #08。",
        "proto": [("../../报关行对接/报关管理-供应商上传审核-MVP.html", "上传审核")],
        "booklet": "../../报关行对接/报关管理-供应商上传审核-MVP-PRD.html",
    },
    {
        "id": "ch-vtask",
        "prefix": "vtask-",
        "file": BROKER / "报关供应商-上传任务列表-MVP-PRD.html",
        "title": "第 9 章 · 供应商上传任务",
        "hint": "协作链接任务列表。API 启用后停发链、旧链失效。",
        "proto": [("../../报关行对接/报关供应商-上传任务列表-MVP.html", "任务列表")],
        "booklet": "../../报关行对接/报关供应商-上传任务列表-MVP-PRD.html",
    },
    {
        "id": "ch-vup",
        "prefix": "vup-",
        "file": BROKER / "报关供应商-资料上传-MVP-PRD.html",
        "title": "第 10 章 · 供应商资料上传",
        "hint": "报关行侧上传页。等同 #04 线下通道。",
        "proto": [("../../报关行对接/报关供应商-资料上传-MVP.html", "资料上传")],
        "booklet": "../../报关行对接/报关供应商-资料上传-MVP-PRD.html",
    },
]

PRD_TO_CHAPTER = {c["file"].name: c["id"] for c in CHAPTERS}
PRD_TO_PREFIX = {c["file"].name: c["prefix"] for c in CHAPTERS}


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
        path = m.group(1)
        frag = m.group(2) or ""
        name = Path(path.replace("\\", "/")).name
        if name not in PRD_TO_CHAPTER:
            return m.group(0)
        if frag:
            return f'href="#{PRD_TO_PREFIX[name]}{frag[1:]}"'
        return f'href="#{PRD_TO_CHAPTER[name]}"'

    return re.sub(r'href="([^"#]+?-PRD\.html)(#[^"]+)?"', repl, html)


def split_href(href: str) -> tuple[str, str, str]:
    hashpart = ""
    query = ""
    if "#" in href:
        href, hashpart = href.split("#", 1)
        hashpart = "#" + hashpart
    if "?" in href:
        href, query = href.split("?", 1)
        query = "?" + query
    return href, query, hashpart


def rewrite_local_hrefs(html: str, src_file: Path) -> str:
    src_dir = src_file.parent

    def repl(m: re.Match) -> str:
        href = m.group(1)
        if href.startswith(("#", "http://", "https://", "mailto:", "javascript:")):
            return m.group(0)
        path, query, hashpart = split_href(href)
        if not path:
            return m.group(0)
        target = (src_dir / path).resolve()
        rel = Path(os.path.relpath(target, ROOT)).as_posix()
        return f'href="{rel}{query}{hashpart}"'

    return re.sub(r'\bhref="([^"]+)"', repl, html)


def proto_links(items: list[tuple[str, str]]) -> str:
    parts = []
    for href, label in items:
        parts.append(f'<a href="{href}">打开原型 · {label} →</a>')
    return "\n        ".join(parts)


def chapter_banner(ch: dict) -> str:
    jumps = proto_links(ch["proto"])
    return f'''    <section class="ch-banner" id="{ch["id"]}">
      <h2>{ch["title"]}</h2>
      <p>{ch["hint"]}</p>
      <div class="proto-jumps">
        {jumps}
        <a href="{ch["booklet"]}">分册 PRD</a>
      </div>
    </section>
'''


def assemble_chapters() -> str:
    chunks = []
    for ch in CHAPTERS:
        src = ch["file"].read_text(encoding="utf-8")
        body = extract_cards(src)
        body = rewrite_local_hrefs(body, ch["file"])
        body = rewrite_prd_links(prefix_ids(body, ch["prefix"]))
        chunks.append(chapter_banner(ch) + "\n" + body)
    return "\n\n".join(chunks)


COVER = r'''    <section class="hero">
      <h1>关务组 · 需求 PRD · 产品部全文</h1>
      <p>2026-08-26。本期功能点全文：每章内嵌对应分册细则，每条说明带原型跳转。<strong>开发/测试验收用本文。</strong>分册是维护源，改分册后重生成；细则冲突以分册为准。跨页索引只看联动和配置数。 <strong>不做提前报关。报关执行不回预录阶段页签。AMS/ISF 在船务提单管理发送。舱单在报关执行。</strong>
      　<a href="关务组-导航.html" style="color:#fff">导航</a>
      　<a href="关务组-需求PRD.html" style="color:#fff">跨页索引</a>
      　<a href="G4-关务-组流程图.html" style="color:#fff">G4 流程</a></p>
    </section>
    <nav class="toc">
      <a href="#m-scope">本期范围</a>
      <a href="#m-skip">本期不做</a>
      <a href="#m-bg">背景</a>
      <a href="#m-map">页面对照</a>
      <a href="#m1-link">跨页联动</a>
      <a href="#ch-pre">1 预录工作台</a>
      <a href="#ch-exec">2 报关执行</a>
      <a href="#ch-review">3 预录审核</a>
      <a href="#ch-blc">4 清报关</a>
      <a href="#ch-split">5 做资料分票</a>
      <a href="#ch-house">6 分单号</a>
      <a href="#ch-api">7 API 配置</a>
      <a href="#ch-vendor">8 上传审核</a>
      <a href="#ch-vtask">9 上传任务</a>
      <a href="#ch-vup">10 资料上传</a>
      <a href="#m8">配置数</a>
      <a href="#m9">二期 / 待定</a>
    </nav>

    <section class="card" id="m-scope">
      <h2>本期做（对着原型评审）</h2>
      <p>下列页面本期交付。点「打开原型」进交互；细则在后文章节。岗：资料岗=预录工作台；报关岗=报关执行（仅申报/放行）。</p>
      <table>
        <thead><tr><th>页</th><th>本期要点</th><th class="proto">原型</th><th class="proto">本章</th></tr></thead>
        <tbody>
          <tr><td>预录工作台</td><td>只看报关件。委托三值。报关编号=报关单号。按报关编号选运单</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">工作台</a> · <a href="关务组-预录工作台-报关单号母子表-MVP.html">母子表</a></td><td class="proto"><a href="#ch-pre">第 1 章</a></td></tr>
          <tr><td>报关执行列表</td><td>待放行/查验/放行。发舱单、下载舱单。无预录页签。已核准不在本页</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">打开</a></td><td class="proto"><a href="#ch-exec">第 2 章</a></td></tr>
          <tr><td>预录单审核详情</td><td>结构化 + 沟通；#04 附件</td><td class="proto"><a href="../../报关行对接/报关管理-预录单审核详情-MVP.html">打开</a></td><td class="proto"><a href="#ch-review">第 3 章</a></td></tr>
          <tr><td>提单详情 · 清报关</td><td>清报关数据 / 做资料入口 / 附件</td><td class="proto"><a href="../../报关行对接/报关管理-预录审核详情-兼容-MVP.html?tab=customs">打开</a></td><td class="proto"><a href="#ch-blc">第 4 章</a></td></tr>
          <tr><td>做资料分票核准</td><td>买单轧差。点行比对。「已核准」本页写入</td><td class="proto"><a href="../../报关行对接/报关管理-做资料分票核准-MVP.html">打开</a></td><td class="proto"><a href="#ch-split">第 5 章</a></td></tr>
          <tr><td>分单号规则</td><td>船司×港口模板。绑提单之后生成</td><td class="proto"><a href="../../报关行对接/分单号规则配置-MVP.html">打开</a></td><td class="proto"><a href="#ch-house">第 6 章</a></td></tr>
          <tr><td>报关行 API</td><td>#01 #04 #08 #09 #10 #12。主键报关编号</td><td class="proto"><a href="../../报关行对接/报关行API配置-MVP.html">打开</a></td><td class="proto"><a href="#ch-api">第 7 章</a></td></tr>
          <tr><td>供应商上传（未对接）</td><td>审核 / 任务 / 上传，等同 #04 #08</td><td class="proto"><a href="../../报关行对接/报关管理-供应商上传审核-MVP.html">审核</a></td><td class="proto"><a href="#ch-vendor">第 8 章</a></td></tr>
          <tr><td>清关管理</td><td>取消IT只读展示。查验通知 FYI，不发邮件</td><td class="proto"><a href="../../清关管理-MVP.html">打开</a></td><td class="proto">见第 2 章查验口径</td></tr>
          <tr><td>查验报表</td><td>国内/国外周分析（示意）</td><td class="proto"><a href="关务组-查验报表-提单运单维度-MVP.html">打开</a></td><td class="proto">—</td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m-skip">
      <h2>本期不做 / 二期范围外（不得开发验收）</h2>
      <table>
        <thead><tr><th>项</th><th>口径</th><th class="proto">原型（仅对照，不验收）</th></tr></thead>
        <tbody>
          <tr><td>提前报关</td><td>整段不做、不验收、不回页面</td><td class="proto">—</td></tr>
          <tr><td>报关执行预录阶段页签</td><td>待上传 / 待推送 / 报关行处理中 / 预录待复审只在预录工作台。本页不挂预录工作台入口</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">报关执行</a></td></tr>
          <tr><td>发 AMS / 发 ISF</td><td>改由船务提单管理装柜前发送。报关执行只读展示已发标</td><td class="proto"><a href="../船务/船务组-提单管理-按周分组与分配-MVP.html">船务提单管理</a></td></tr>
          <tr><td>按分票号查委托</td><td>已对接报关行不按分票号查询委托。报关行自行匹配电子委托书</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">报关执行</a></td></tr>
          <tr><td>待放行及之后改报关行</td><td>待放行、已放行不可改。改单已撤销后可改再重发</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">预录工作台</a></td></tr>
          <tr><td>清关查验通知邮件 / 站内待办</td><td>FYI only。客户与业务员无需操作/补资料/回复。不做邮件、不转客户待办</td><td class="proto"><a href="../../清关管理-MVP.html">清关管理</a></td></tr>
          <tr><td>已核准作为报关执行状态</td><td>「已核准」只在做资料分票页内标记。执行侧仅入口</td><td class="proto"><a href="../../报关行对接/报关管理-做资料分票核准-MVP.html">做资料分票</a></td></tr>
          <tr><td>做资料「比对」操作列 / 差异处置 / 打开预录附件 #04 / 页头进数来源卡</td><td>已从原型去掉，规则在分册。点行看比对。#04 走通道①列表或清报关附件</td><td class="proto"><a href="../../报关行对接/报关管理-做资料分票核准-MVP.html">做资料分票</a></td></tr>
          <tr><td>预录工作台催办态</td><td>委托标记仅 无标记 / 未委托 / 已委托。不做已催办、已标记·催客户</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">预录工作台</a></td></tr>
          <tr><td>#02 #05 #11</td><td>本期不对接。查验（#11）模块保留，手动维护</td><td class="proto"><a href="../../报关行对接/报关行API配置-MVP.html">API 配置</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m-bg">
      <h2>背景</h2>
      <p>关务两条岗并行：资料岗签入即预报（推送/预录/确认），报关岗排柜后申报放行（舱单/抓取/查验）。分单号给舱单，报关行接口走报关编号。</p>
      <table>
        <thead><tr><th>痛点</th><th>本期做</th></tr></thead>
        <tbody>
          <tr><td>预录和报关执行混在一页</td><td>预录工作台独立；报关执行只留申报/放行</td></tr>
          <tr><td>报关件和买单混、确认口径不清</td><td>只看报关件；确认可改回，放行后锁定</td></tr>
          <tr><td>舱单/AMS/ISF 岗责糊</td><td>舱单在报关执行直推海管家；AMS/ISF 在船务提单管理</td></tr>
          <tr><td>分单号何时出、报关单号是哪个</td><td>绑提单之后出分单号。报关单号=报关编号=运单号-序号(件数)</td></tr>
          <tr><td>做资料页说明卡、操作列过载</td><td>规则进 PRD。点行比对。已核准在分票页内写</td></tr>
        </tbody>
      </table>
      <p class="note">口径：<a href="G4-关务-组流程图.html">G4</a> · 张珊珊 8/15、8/20 · 卢慧恒 8/20。跨页索引见 <a href="关务组-需求PRD.html">关务组 · 需求 PRD</a>。</p>
    </section>

    <section class="card" id="m-map">
      <h2>页面对照（评审从这里点）</h2>
      <table>
        <thead><tr><th>页</th><th>本章 / 分册</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>预录工作台</td><td><a href="#ch-pre">第 1 章</a> · <a href="关务组-签入即预报资料-MVP-PRD.html">分册</a></td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">工作台</a> · <a href="关务组-预录工作台-报关单号母子表-MVP.html">母子表</a></td></tr>
          <tr><td>报关执行列表</td><td><a href="#ch-exec">第 2 章</a> · <a href="../../报关行对接/报关管理-列表-MVP-PRD.html">分册</a></td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">打开</a></td></tr>
          <tr><td>预录单审核详情</td><td><a href="#ch-review">第 3 章</a> · <a href="../../报关行对接/报关管理-预录单审核详情-MVP-PRD.html">分册</a></td><td class="proto"><a href="../../报关行对接/报关管理-预录单审核详情-MVP.html">打开</a></td></tr>
          <tr><td>提单详情 · 清报关</td><td><a href="#ch-blc">第 4 章</a> · <a href="../../报关行对接/报关管理-预录审核详情-兼容-MVP-PRD.html">分册</a></td><td class="proto"><a href="../../报关行对接/报关管理-预录审核详情-兼容-MVP.html?tab=customs">打开</a></td></tr>
          <tr><td>做资料分票核准</td><td><a href="#ch-split">第 5 章</a> · <a href="../../报关行对接/报关管理-做资料分票核准-MVP-PRD.html">分册</a></td><td class="proto"><a href="../../报关行对接/报关管理-做资料分票核准-MVP.html">打开</a></td></tr>
          <tr><td>分单号规则</td><td><a href="#ch-house">第 6 章</a> · <a href="../../报关行对接/分单号规则配置-MVP-PRD.html">分册</a></td><td class="proto"><a href="../../报关行对接/分单号规则配置-MVP.html">打开</a></td></tr>
          <tr><td>报关行 API</td><td><a href="#ch-api">第 7 章</a> · <a href="../../报关行对接/报关行API配置-MVP-PRD.html">分册</a></td><td class="proto"><a href="../../报关行对接/报关行API配置-MVP.html">打开</a></td></tr>
          <tr><td>供应商上传审核</td><td><a href="#ch-vendor">第 8 章</a> · <a href="../../报关行对接/报关管理-供应商上传审核-MVP-PRD.html">分册</a></td><td class="proto"><a href="../../报关行对接/报关管理-供应商上传审核-MVP.html">打开</a></td></tr>
          <tr><td>供应商上传任务</td><td><a href="#ch-vtask">第 9 章</a> · <a href="../../报关行对接/报关供应商-上传任务列表-MVP-PRD.html">分册</a></td><td class="proto"><a href="../../报关行对接/报关供应商-上传任务列表-MVP.html">打开</a></td></tr>
          <tr><td>供应商资料上传</td><td><a href="#ch-vup">第 10 章</a> · <a href="../../报关行对接/报关供应商-资料上传-MVP-PRD.html">分册</a></td><td class="proto"><a href="../../报关行对接/报关供应商-资料上传-MVP.html">打开</a></td></tr>
          <tr><td>清关管理</td><td><a href="#m-skip">查验通知本期口径</a></td><td class="proto"><a href="../../清关管理-MVP.html">打开</a></td></tr>
          <tr><td>组流程</td><td>—</td><td class="proto"><a href="G4-关务-组流程图.html">G4</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m1">
      <h2>交接与跨页联动</h2>
      <p>上游：签入成功 → 报关件进预录工作台。船务绑提单后出分单号；终配舱后沿用已推送进度，不重推报关行。下游：收取正式件 → 报关执行待放行；#10 抓放行 → 报关放行。H5 海放/码放回写船务只读。</p>
      <h3 id="m1-link">跨页联动</h3>
      <table>
        <thead><tr><th>动作</th><th>读 / 写 / 要点</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>签入成功</td><td>报关件进预录工作台。非报关件不进、不催</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">预录工作台</a></td></tr>
          <tr><td>推送报关行 #01</td><td>主键报关编号。客户单号辅键。分单号不进 #01。未排柜在工作台推；排柜后不重推</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">预录工作台</a></td></tr>
          <tr><td>预录回传 #04</td><td>附件+结构化。按报关编号匹配。工作台「预录审核」进详情</td><td class="proto"><a href="../../报关行对接/报关管理-预录单审核详情-MVP.html">预录审核</a></td></tr>
          <tr><td>预录确认</td><td>关务手勾，可改回。上传放行单后锁定。运单明细同步「预录单已确认」</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">预录工作台</a></td></tr>
          <tr><td>收取正式件 #08</td><td>工作台完成确认 / #08 后进入报关执行「待放行」</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">报关执行</a></td></tr>
          <tr><td>做资料核准</td><td>本页写「已核准」并锁定分票。报关执行只入口，不展示核准状态</td><td class="proto"><a href="../../报关行对接/报关管理-做资料分票核准-MVP.html">做资料分票</a></td></tr>
          <tr><td>绑提单</td><td>绑主单成功后按规则生成分单号。未绑不生成。终配舱落成本身不触发</td><td class="proto"><a href="../../报关行对接/分单号规则配置-MVP.html">分单号</a></td></tr>
          <tr><td>发舱单</td><td>报关执行勾一票推海管家。预填：提单管理 + 进口商 + 终配舱。发送成功打「舱单」标。弹窗不展示来源卡</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">报关执行</a></td></tr>
          <tr><td>下载舱单 / 已发代理</td><td>推代理=下载表格。下载不打标。系统直发成功自动打「已发代理」</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">报关执行</a></td></tr>
          <tr><td>发 AMS / ISF</td><td>船务提单管理装柜前发。关务列表只读已发标</td><td class="proto"><a href="../船务/船务组-提单管理-按周分组与分配-MVP.html">船务提单管理</a></td></tr>
          <tr><td>放行抓取 #10</td><td>主键报关编号。抓齐后自动「报关放行」（未布控）</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">报关执行</a></td></tr>
          <tr><td>报关查验 #11</td><td>本期不对接，手登。一键通知客户 / 查验处置。与清关查验通知口径分开：出口报关查验可通知；清关查验 FYI</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html?tab=check">报关查验</a></td></tr>
          <tr><td>清关查验通知</td><td>FYI。不发邮件、不建客户待办。接收人：业务员+客服 / 仅业务员 / 仅客服</td><td class="proto"><a href="../../清关管理-MVP.html">清关管理</a></td></tr>
          <tr><td>电子委托 #12</td><td>不按分票号查。已对接自行匹配回传；未对接三值标记+截图</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">预录工作台</a></td></tr>
          <tr><td>改报关行</td><td>待放行及之后不可改（含已放行）。改单已撤销仍可改再重发</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">预录工作台</a></td></tr>
          <tr><td>海放 / 码放</td><td>订阅回写船务业务标记。关务仍用清关放行粗状态</td><td class="proto"><a href="../船务/船务组-提单管理-按周分组与分配-MVP.html">船务列表</a></td></tr>
        </tbody>
      </table>
    </section>
'''

TAIL = r'''    <section class="card" id="m8">
      <h2>配置数 / 写死口径（本期无新字典页）</h2>
      <table>
        <thead><tr><th>项</th><th>默认</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>报关编号 / 报关单号</td><td>同一字段：<code>运单号-序号(件数)</code>。例 WY260820001-1(8)。母子表只这一列</td><td class="proto"><a href="关务组-预录工作台-报关单号母子表-MVP.html">母子表</a></td></tr>
          <tr><td>推送 / 放行抓取主键</td><td>报关编号。客户单号辅键。分单号不进接口</td><td class="proto"><a href="../../报关行对接/报关行API配置-MVP.html">API</a></td></tr>
          <tr><td>分单号生成节点</td><td>绑定提单之后。未绑主单不生成。终配舱落成本身不触发</td><td class="proto"><a href="../../报关行对接/分单号规则配置-MVP.html">分单号</a></td></tr>
          <tr><td>委托标记</td><td>无标记 / 未委托 / 已委托。无催办态</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">预录工作台</a></td></tr>
          <tr><td>改报关行窗口</td><td>待放行之前可改。待放行及之后不可改。改单已撤销可改再重发</td><td class="proto"><a href="关务组-签入即预报资料-MVP.html">预录工作台</a></td></tr>
          <tr><td>舱单预填</td><td>①提单管理 ②进口商收发货人 ③终配舱件毛体。字段可改，不回写来源主档</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">发舱单</a></td></tr>
          <tr><td>AMS/ISF 预填（发送在船务）</td><td>①装柜表+进口商 ②车队/代理 ③仓库数据表</td><td class="proto"><a href="../船务/船务组-提单管理-按周分组与分配-MVP.html">船务</a></td></tr>
          <tr><td>本期对接</td><td>#01 推送 · #04 预录附件 · #08 正式件 · #09 报关编号回传 · #10 放行 · #12 委托。#11 查验手登</td><td class="proto"><a href="../../报关行对接/报关行API配置-MVP.html">API</a></td></tr>
          <tr><td>买单轧差</td><td>末票 = 终配合计 − Σ报关件。轧差为负不可核准</td><td class="proto"><a href="../../报关行对接/报关管理-做资料分票核准-MVP.html">做资料</a></td></tr>
        </tbody>
      </table>
    </section>

    <section class="card" id="m9">
      <h2>待定 / 二期 / 范围外</h2>
      <table>
        <thead><tr><th>标记</th><th>项</th><th>说明</th><th class="proto">原型</th></tr></thead>
        <tbody>
          <tr><td>范围外</td><td>提前报关</td><td>不开发、不验收、不回页面</td><td class="proto">—</td></tr>
          <tr><td>范围外</td><td>正式连报文网关拍板前的直连细节</td><td>本期发舱单/AMS/ISF 打业务标记。预录待复审可预填核对，正式连网关需核准后</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html">发舱单</a></td></tr>
          <tr><td>二期</td><td>删除舱单作业台</td><td>报关行材料校验→海管家删单留痕</td><td class="proto">—</td></tr>
          <tr><td>二期</td><td>#02 #05 结构化预录全量对接</td><td>无结构时仍审 #04 附件</td><td class="proto"><a href="../../报关行对接/报关管理-预录单审核详情-MVP.html">预录审核</a></td></tr>
          <tr><td>二期</td><td>查验 #11 API</td><td>本期手登。模块保留</td><td class="proto"><a href="../../报关行对接/报关管理-列表-MVP.html?tab=check">报关查验</a></td></tr>
          <tr><td>待定</td><td>查货授权同步</td><td>做资料核准不硬卡授权。查货侧提前确认侵权</td><td class="proto"><a href="../../报关行对接/报关管理-做资料分票核准-MVP.html">做资料</a></td></tr>
        </tbody>
      </table>
    </section>
    <p class="foot">关务组 · 产品部全文 2026-08-26 · 开发/测试用本文 · 分册为维护源</p>
'''

HEAD = '''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>关务组 · 需求 PRD · 产品部全文 · 20260826</title>
  <link rel="stylesheet" href="ess-customs-prd.css" />
  <style>
    .page { max-width: 1120px; }
    .ch-banner {
      background: linear-gradient(135deg, #0a6b6b, #14b8a6);
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

INDEX_HERO = r'''    <section class="hero">
      <h1>关务组 · 需求 PRD</h1>
      <p>2026-08-26。跨页索引 + 配置数 + 二期。开发测试主文档是<a href="关务组-需求PRD-产品部全文-20260826.html" style="color:#fff">本期全文</a>（从分册拼出）。验收看分册。本文只看跨页联动和配置数。三份打架以分册为准。不做提前报关。AMS/ISF 在船务发。舱单在报关执行。　<a href="关务组-导航.html" style="color:#fff">导航</a>　<a href="G4-关务-组流程图.html" style="color:#fff">G4 流程</a></p>
    </section>
    <nav class="toc">
      <a href="#m-scope">本期范围</a>
      <a href="#m-skip">本期不做</a>
      <a href="#m-bg">背景</a>
      <a href="#m-map">页面对照</a>
      <a href="#m1-link">跨页联动</a>
      <a href="#m8">配置数</a>
      <a href="#m9">二期 / 待定</a>
    </nav>
'''

INDEX_HEAD = '''<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>关务组 · 需求 PRD</title>
  <link rel="stylesheet" href="ess-customs-prd.css" />
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


def cover_for_index() -> str:
    body = COVER
    body = re.sub(r'<section class="hero">.*?</nav>', "", body, count=1, flags=re.S)
    body = body.replace('href="#ch-', 'href="关务组-需求PRD-产品部全文-20260826.html#ch-')
    return INDEX_HERO + body


def write_html(path: Path, head: str, body: str) -> None:
    html = head + body + "\n  </div>\n</body>\n</html>\n"
    ids = re.findall(r'\bid="([^"]+)"', html)
    dups = [i for i, c in Counter(ids).items() if c > 1]
    path.write_text(html, encoding="utf-8")
    proto_cells = len(re.findall(r'class="proto"', html))
    print(f"wrote {path.name}  bytes={path.stat().st_size}  ids={len(ids)}  proto_cells={proto_cells}")
    if dups:
        print("DUPLICATE IDS:", dups)
        raise SystemExit(1)


def main() -> None:
    write_html(OUT, HEAD, COVER + "\n" + assemble_chapters() + "\n" + TAIL)
    index_tail = TAIL.replace(
        "关务组 · 产品部全文 2026-08-26 · 开发/测试用本文 · 分册为维护源",
        "关务组 · 需求 PRD 2026-08-26 · 索引 · 全文见 关务组-需求PRD-产品部全文-20260826.html",
    )
    write_html(OUT_INDEX, INDEX_HEAD, cover_for_index() + "\n" + index_tail)


if __name__ == "__main__":
    main()
