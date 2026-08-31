# -*- coding: utf-8 -*-
"""Generate per-group flowcharts (HTML + Mermaid mmd) from full L0/L1 split."""
from pathlib import Path

ROOT = Path(r"d:\Cursor\头程项目\产品部门\各组sop\流程图")
MMD = ROOT / "drawio-mmd"
MMD.mkdir(parents=True, exist_ok=True)

GROUPS = [
  {
    "id": "bj", "file": "G1-私卡报价-组流程图", "mmd": "G1-私卡报价-组流程.mmd",
    "title": "私卡报价组 · 组流程图",
    "cls": "bj",
    "scope": "S1 询价报价 · 绑运单（船务下发头程运价）",
    "handoffs": "H1←船务头程运价接到散货算价 · 报完价→船务安排订舱 · 尾端费快照→海外",
    "parallel": "算价起分轨：整柜人工报价 ∥ 散货 AI/规则算价",
    "desc": "全流程拆组：从<strong>客户询价</strong>开始 → <b>整柜手报价后直接生效（无人工复核）</b> / 散货算价接入船务<strong>头程运价</strong>（H1）：单价 = <strong>头程单价 + 尾端派送费 ÷ 询价计费重</strong>，需人工复核 → 有效期（7 天，遇 15/30 截断）→ 绑运单。多渠道各 1 价，只选 1 条给业务员。内州 = 距离 ≤150 迈。绑运单后挂尾端费交海外；<b>报完价后交船务安排订舱</b>。节点第二行「页」= 原型页面，第三行「功」= 页面功能。",
    "refs": [
      ("../../报价组/私卡报价-0731-AI报价有效期运单绑定-大致方案.html", "0731 方案"),
      ("../../报价组/10-L2-S1-私卡询价报价.mmd", "L2-S1 mmd"),
      ("G3-船务-组流程图.html", "船务组 · 订舱配舱"),
      ("../../产品部门-对开发-流程节点页面功能对照.html", "对开发 · 节点对照"),
    ],
    "after_mermaid": r'''    <div class="node-map-wrap">
      <h2>节点 × 页面 × 功能</h2>
      <p class="desc">与上图节点一一对应，可点进原型。报价组页面在 <code>产品部门/报价组/</code>。</p>
      <table class="node-map">
        <thead><tr><th>节点</th><th>对应页面</th><th>功能</th></tr></thead>
        <tbody>
          <tr><td class="id">START 客户询价</td><td class="page"><a href="../../报价组/ESS询价编辑-MVP.html">询价编辑</a><a href="../../报价组/ESS询价编辑-APP-散货-MVP.html">APP 散货</a><a href="../../报价组/ESS我的报价-列表-MVP.html">我的询价</a></td><td>选销售产品带出仓址邮编；收货邮编/城市/州（州与邮编校验）；测距；地址类型</td></tr>
          <tr><td class="id">A 报价员列表</td><td class="page"><a href="../../报价组/ESS询价报价-报价员列表-MVP.html">报价员列表</a></td><td>待报价 · AI待确认（不回业务员） · 人工已报价 · 待绑运单</td></tr>
          <tr><td class="id">TYPE 整柜/散货</td><td class="page"><a href="../../报价组/ESS询价报价-报价员列表-MVP.html">报价员列表</a></td><td>散货 LCL / 整柜 FCL 分轨</td></tr>
          <tr><td class="id">BF 整柜手报价</td><td class="page"><a href="../../报价组/ESS整柜报价编辑-MVP.html">整柜报价编辑</a><a href="../../报价组/ESS整柜询价详情-MVP.html">整柜询价详情</a></td><td>手报价直接生效，无 AI 复核</td></tr>
          <tr><td class="id">BL 散货 AI 算价</td><td class="page"><a href="../../报价组/私卡报价-AI报价规则配置-MVP.html">AI 规则配置</a></td><td>AI 规则 → 尾端派送费；头程 → 头程单价；业务员单价 = 头程单价 + 尾端派送费 ÷ 询价计费重（个位 USD/KG）</td></tr>
          <tr><td class="id">H1 头程运价</td><td class="page"><a href="../../船务/船务组-运价管理-我司与代理订舱-MVP.html">运价管理</a></td><td>接到散货算价节点（虚线）；与 AI 规则合计后再 ÷ 计费重得单价。非整柜询价入口</td></tr>
          <tr><td class="id">RULE 规则维护</td><td class="page"><a href="../../报价组/私卡报价-AI报价规则配置-MVP.html">AI 规则配置</a></td><td>草稿；填生效时间；到点前走旧版，到点后新询价走新版</td></tr>
          <tr><td class="id">CL AI待确认</td><td class="page"><a href="../../报价组/ESS散货询价方案详情-MVP.html">报价员详情</a></td><td>AI 出账不回业务员；仅报价员核对</td></tr>
          <tr><td class="id">DF/DL 人工已报价</td><td class="page"><a href="../../报价组/ESS散货询价方案详情-MVP.html">核对确认</a><a href="../../报价组/ESS整柜报价编辑-MVP.html">整柜手报价生效</a></td><td>确认后才回业务员 1 条单价；写有效期</td></tr>
          <tr><td class="id">EF/EL 有效期内</td><td class="page"><a href="../../报价组/ESS询价报价-报价员列表-MVP.html">报价员列表 · 绑运单</a></td><td>期内可绑；过期禁绑，须重算</td></tr>
          <tr><td class="id">R1 回退重算</td><td class="page"><a href="../../报价组/ESS散货询价方案详情-MVP.html">详情重算</a><a href="../../报价组/ESS整柜报价编辑-MVP.html">整柜重报</a></td><td>过期须重算，不可改期续命</td></tr>
          <tr><td class="id">G1 整柜单绑</td><td class="page"><a href="../../报价组/ESS询价报价-报价员列表-MVP.html">绑定运单弹窗</a></td><td>港+柜型；符合 N 票</td></tr>
          <tr><td class="id">G2 散货多绑</td><td class="page"><a href="../../报价组/ESS询价报价-报价员列表-MVP.html">绑定运单弹窗</a></td><td>国+邮编+交货仓；每小时匹配</td></tr>
          <tr><td class="id">H 挂尾端派送费</td><td class="page"><a href="../../报价组/ESS询价报价-报价员列表-MVP.html">绑定运单弹窗</a></td><td>尾端费取整挂运单；绑后锁定</td></tr>
          <tr><td class="id">HW 海外尾端费</td><td class="page"><a href="../海外对接组-尾程预估费用表-MVP.html">尾程预估费用表</a></td><td>取整数派送费快照交海外</td></tr>
          <tr><td class="id">HX 船务订舱</td><td class="page"><a href="../../船务/船务组-提单管理-按周分组与分配-MVP.html">提单管理</a></td><td>报完价交船务安排订舱</td></tr>
        </tbody>
      </table>
    </div>
''',
    "mermaid": r'''flowchart TB
  START(["开始 · 客户询价<br/>页：询价编辑 / 我的询价 / APP<br/>功：选产品带仓址邮编 · 收货邮编城市州 · 测距 · 地址类型"])
  START --> A["进入报价员列表<br/>页：询价报价-报价员列表<br/>功：待报价 · AI待确认（不回业务员） · 已完结 · 待绑运单"]
  A --> TYPE{"整柜 / 散货？<br/>页：报价员列表"}
  TYPE -->|整柜| BF["人工报价 · 整柜<br/>页：整柜报价编辑 / 询价详情<br/>功：手报价直接生效 · 无 AI 复核"]
  TYPE -->|散货| BL
  subgraph LCLFEED["散货算价输入"]
    direction LR
    H1{{"H1 ← 船务<br/>页：运价管理<br/>功：下发头程运价"}}
    BL["AI / 规则算价 · 散货<br/>页：AI规则配置<br/>功：单价=头程单价+尾端派送费÷询价计费重"]
    RULE["规则维护（旁路）<br/>页：AI报价规则配置<br/>功：草稿 · 填生效时间 · 到点切新版"]
  end
  H1 -.-> BL
  RULE -.-> BL
  BF --> DF["报价生效 · 写有效期<br/>页：整柜手报价生效<br/>功：7天含当日 · 遇15/30截断 · 不可改期"]
  BL --> CL{"AI待确认？<br/>页：报价员详情<br/>功：不返回业务员"}
  CL -->|否| BL
  CL -->|是| DL["核对确认 · 已完结<br/>页：核对确认<br/>功：确认后才回业务员 1 条单价 · 写有效期"]
  DF --> EF{"有效期内？<br/>页：报价员列表 · 绑运单"}
  DL --> EL{"有效期内？<br/>页：报价员列表 · 绑运单"}
  EF -->|否| R1F["回退 R1 · 重算<br/>页：整柜报价编辑<br/>功：过期须重算 · 不可改期续命"]
  EL -->|否| R1L["回退 R1 · 重算<br/>页：报价员详情 · 重算<br/>功：过期须重算 · 不可改期续命"]
  R1F --> BF
  R1L --> BL
  EF -->|是| G1["整柜单绑运单<br/>页：报价员列表 · 绑定运单<br/>功：港+柜型 · 符合N票"]
  EL -->|是| G2["散货多绑运单<br/>页：报价员列表 · 绑定运单<br/>功：国+邮编+交货仓 · 每小时匹配"]
  G1 --> H["确认绑定 + 挂尾端派送费<br/>页：绑定运单弹窗<br/>功：尾端费取整挂运单 · 绑后锁定"]
  G2 --> H
  H -.-> HW["交叉 → 海外<br/>页：尾程预估费用表<br/>功：取整数派送费快照"]
  H --> HX{{"→ 船务安排订舱<br/>页：船务提单管理<br/>功：报完价交订舱"}}
  HX --> END(["结束 · 交船务安排"])

  classDef step fill:#FFF3E0,stroke:#E65100,color:#BF360C
  classDef dec fill:#FFFDE7,stroke:#F9A825,color:#F57F17
  classDef cross fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
  classDef back fill:#FFEBEE,stroke:#C62828,color:#B71C1C,stroke-dasharray: 5 4
  classDef para fill:#E3F2FD,stroke:#1976D2,color:#0D47A1,stroke-dasharray: 5 3
  classDef endn fill:#ECEFF1,stroke:#78909C,color:#37474F
  class A,BF,BL,DF,DL,H step
  class TYPE,CL,EF,EL dec
  class G1,G2,RULE para
  class H1,HW,HX cross
  class R1F,R1L back
  class START,END endn
  style LCLFEED fill:#F8FAFC,stroke:#90CAF9,stroke-dasharray:4 3,color:#64748b'''
  },
  {
    "id": "fk", "file": "G2-风控-组流程图", "mmd": "G2-风控-组流程.mmd",
    "title": "风控组 · 组流程图",
    "cls": "fk",
    "scope": "S5 查货合规（组内：看图/AI/扣件放行；待配舱旁路推送）",
    "handoffs": "结束时 H2→关务（已放行可执行）",
    "parallel": "待配舱旁路：仅推未扣件资料；再次扣件时在旁路拦截",
    "desc": "全流程拆组：看图/AI 是风控组内步骤。<b>侵权是扣件的一类</b>，另有其他扣件类型；解除后放行 → 终配舱。<b>旁路在待配舱</b>：只推送未扣件资料给报关行；若再次扣件，<b>拦截发生在这条旁分支</b>（不是出单核准、不是跨组 H）。",
    "refs": [
      ("../风控组-0729-查货管理-大致方案.html", "0729 方案"),
      ("../风控组-查货操作-AI识图品名识别-原型.html", "AI 识图原型"),
      ("drawio-mmd/14-L2-S5-查货查验.mmd", "L2-S5 mmd"),
    ],
    "mermaid": r'''flowchart TB
  START(["开始 · 到仓"]) --> A["已看图卡点"]
  A --> B["AI 识品牌 / 品名"]
  B --> C["七类合规标记<br/>0税·DOT·FDA·EPA·GCC·CPC·反倾销"]
  C --> D{"附加费 / 扣件？"}
  D -->|附加费| E["只加成本 · 入账"]
  D -->|扣件| HOLD["扣件<br/>侵权是一类 · 另有其他类型"]
  D -->|否| H["查货完结"]
  E --> H
  HOLD --> TYP{"扣件类型"}
  TYP -->|侵权| AUTH["授权一致 或 罚款"]
  TYP -->|其他类型| OTH["按该类型处置"]
  AUTH --> REL{"已解除？"}
  OTH --> REL
  REL -->|否| WAIT["扣件中 · 未放行"]
  WAIT --> REL
  REL -->|是 · 放行| GO["放行 → 终配舱"]
  GO --> H
  H --> CABIN["待配舱"]
  CABIN --> H2{{"H2 → 关务/业务<br/>已放行 · 关务可执行"}}
  CABIN -.-> PARA["∥ 旁路 · 待配舱<br/>只推未扣件资料给报关行"]
  PARA --> REHIT{"再次扣件？"}
  REHIT -->|是| STOP["拦截已推资料"]
  REHIT -->|否| KEEP["资料保持已推"]
  H2 --> END(["结束 · 已终配舱，关务可执行"])

  classDef step fill:#FFF3E0,stroke:#E65100,color:#BF360C
  classDef dec fill:#FFFDE7,stroke:#F9A825,color:#F57F17
  classDef cross fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C,stroke-width:2px
  classDef back fill:#FFEBEE,stroke:#C62828,color:#B71C1C,stroke-dasharray: 5 4
  classDef para fill:#E3F2FD,stroke:#1976D2,color:#0D47A1,stroke-dasharray: 5 3
  classDef endn fill:#ECEFF1,stroke:#78909C,color:#37474F
  class A,B,C,E,HOLD,AUTH,OTH,GO,H,CABIN,KEEP step
  class D,TYP,REL,REHIT dec
  class H2 cross
  class PARA para
  class WAIT,STOP back
  class START,END endn'''
  },
  {
    "id": "cw", "file": "G3-船务-组流程图", "mmd": "G3-船务-组流程.mmd",
    "title": "船务组 · 组流程图",
    "cls": "cw",
    "scope": "S3 提单 · S4 配舱 · S6 进港→离港 · 无需报价·价格表自动出价",
    "handoffs": "私卡报完价回接→船务安排订舱 · 无需报价入口←改配/其他价格表渠道 · H3→关务清关 · H4→海外 · H5←关务舱单/放行只读",
    "parallel": "私卡报价轨 ∥ 无需报价·价格表自动出价 · P1：订舱配舱 ∥ 关务推送资料",
    "desc": "全流程拆组：<b>私卡报完价后船务安排订舱/配舱</b>。<b>并行：无需报价分支</b>（入口=改配、其他价格表出价渠道）→ 仅系统按价格表自动出价 → <b>同样直接船务安排</b>。之后提单/放行盯控 → 进港 → 离港。改配由船务发起并安排配舱/船期。<b>本期不含运价管理 / 合约价确认 / 船公司提单号规则 / 进港落库（落箱触发·H4）</b>。",
    "refs": [
      ("../船务/船务组-0730-费用节点提单配仓-大致方案.html", "0730 方案"),
      ("../船务/船务组-提单管理-按周分组与分配-MVP.html", "提单管理"),
      ("../船务/船务组-待配仓-MVP.html", "待配仓"),
    ],
    "mermaid": r'''flowchart TB
  H1B{{"← 私卡报完价<br/>绑运单完成"}} --> P1A["船务安排<br/>∥ P1 订舱配舱提单"]
  GAI["改配"] --> AUTO["无需报价<br/>仅系统按价格表自动出价"]
  OTH["其他价格表出价渠道"] --> AUTO
  AUTO --> P1A
  P1B["∥ P1 关务推送资料<br/>旁路 · 不等排柜"]
  P1A -.-> P1B
  P1A --> B["列表按周 · 同船聚合"]
  B --> C["装完色标 / 业务标记<br/>整柜客户装柜 · 仓内少量可入仓"]
  C --> TR{"是否火车？"}
  TR -->|否 · 非火车无此步| E["截单预警 / 开船盯控<br/>优先码头实际开船<br/>ETD 仅参考不强"]
  TR -->|是 · 火车才有| D{"取消 IT？"}
  D -->|是| H3{{"H3 → 关务<br/>清关待办提醒<br/>仅火车"}}
  D -->|否| E
  H3 --> E
  H5{{"H5 ← 关务<br/>舱单/放行只读订阅"}} --> F["拉数比对放行状态"]
  E --> F
  F --> G{"已放行？"}
  G -->|否| R6["R6 未放行自环<br/>标红 · 通知船务盯控<br/>须通知客户"]
  R6 --> F
  G -->|是| FT{"进港 · 飞驼能否抓<br/>进港时间？"}
  FT -->|能| PULL["飞驼拉进港时间"]
  FT -->|不能 / 未覆盖| MAN["人工确认 · 码头补录"]
  PULL --> ARR{"已进港？"}
  MAN --> ARR
  ARR -->|否| R7["未进港预警<br/>标红盯控 · 通知船务"]
  R7 --> ARR
  ARR -->|是| H["进港时间落库<br/>触发落箱等节点"]
  H --> SAIL["离港<br/>优先码头实际开船 · ETD仅参考"]
  SAIL --> H4{{"H4 → 海外<br/>离港 / 到港承接"}}
  GAI --> RECV["船务安排<br/>配舱/船期 · R4"]
  RECV --> P1A
  H4 --> END(["结束 · 交海外港前"])

  classDef step fill:#E3F2FD,stroke:#1565C0,color:#0D47A1
  classDef dec fill:#FFFDE7,stroke:#F9A825,color:#F57F17
  classDef cross fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
  classDef back fill:#FFEBEE,stroke:#C62828,color:#B71C1C,stroke-dasharray: 5 4
  classDef para fill:#E3F2FD,stroke:#1976D2,color:#0D47A1,stroke-dasharray: 5 3
  classDef endn fill:#ECEFF1,stroke:#78909C,color:#37474F
  class B,C,E,F,H,RECV,PULL,MAN,GAI,OTH,SAIL step
  class TR,D,G,FT,ARR dec
  class H1B,H3,H4,H5 cross
  class P1A,P1B,AUTO para
  class R6,R7 back
  class END endn'''
  },
  {
    "id": "gw", "file": "G4-关务-组流程图", "mmd": "G4-关务-组流程.mmd",
    "title": "关务组 · 组流程图",
    "cls": "gw",
    "scope": "S4 报关四切片 · S5 查验 · 目的港清关（关务分支）",
    "handoffs": "起点：客户已上传报关资料 · H7←报关行预录（核准时）· H5↔船务 · H3←船务 · H4→海外",
    "parallel": "P2 查货∥推送资料给报关行（有问题可拦截）· P3 发舱单∥报关 · 改配由船务发起",
    "desc": "全流程拆组：<b>起点是客户已上传报关资料</b>（不是报关行预录回传）→ 有资料即推/到仓出单 → <b>终配舱后</b>自动分单号+双通道核准（<b>散货必分票 · 整柜看情况分票</b>；报关行预录在核准时接入）→ P3舱单∥报关 → 改单 → 查验改配（<b>改配由船务发起</b>）→ 目的港清关。",
    "refs": [
      ("../关务组-流程图汇总.html", "关务流程图汇总"),
      ("../关务组-部门问题方案汇总-流程与原型.html#amend", "⑤改单"),
      ("../关务组-改配三类场景-轨迹与同步.html", "改配三类"),
      ("drawio-mmd/13-L2-S4-报关四切片.mmd", "L2-S4 mmd"),
    ],
    "mermaid": r'''flowchart TB
  UP["客户已上传报关资料"] --> A["有资料即推 / 到仓出单"]
  A --> GATE{"终配舱完成？"}
  GATE -->|否| WAIT["等终配舱<br/>船务/仓协同"]
  WAIT --> GATE
  RISK["∥ 风控查货（组内）<br/>待配舱只推未扣件资料"]
  A -.-> RISK
  GATE -->|是 · 终配舱后<br/>关务已可执行| B["自动分单号<br/>散货必分票 · 整柜看情况"]
  B --> C["双通道核准比对"]
  H7{{"H7 ← 报关行<br/>预录回传"}} --> C
  C --> D{"核准通过？"}
  D -->|否| R3["回退 R3<br/>退客户改资料 / 报关行改预录"]
  R3 --> C
  D -->|是| JOIN["P2 汇合 · 门禁打开"]
  RISK -.->|查货完结 · 已可执行| JOIN
  JOIN --> P3A["∥ P3 同岗直发舱单 / AMS / ISF"]
  JOIN --> P3B["∥ P3 报关申报 · 放行查验"]
  H5{{"H5 · 船务只读订阅<br/>砍跨组对单"}}
  P3A --> H5
  FIX["To-Be：核准后关务闭环直发，不等船务"]
  P3A --> FIX
  P3A --> AMD{"需改单？"}
  P3B --> AMD
  AMD -->|否| INSP
  AMD -->|是| WHERE{"错误落在哪？"}
  WHERE -->|截单资料| AMD1["改单工作台 · 保函"]
  WHERE -->|港区运抵| AMD2["改运抵 · 卡截关期"]
  WHERE -->|舱单| AMD3["先通知报关行勿报关<br/>→ 改舱单 → 再放行报关"]
  AMD1 --> INSP
  AMD2 --> INSP
  AMD3 --> INSP
  INSP["查验登记 · 一键通知客户"] --> GAI{"需改配？"}
  GAI -->|否| CLR
  GAI -->|是| SC["需改配 · 交船务发起"]
  SC --> H5B{{"H5 → 船务<br/>改配由船务发起 · R4"}}
  H5B --> CLR
  H3{{"H3 ← 船务<br/>取消IT→清关待办<br/>仅火车 · 非火车无"}} -.-> CLR
  CLR["目的港清关 · 放行查验<br/>资料·税金·通知清关行"] --> OK["清关放行"]
  OK --> H4{{"H4 → 海外<br/>可港前 / 派送"}}
  H4 --> END(["结束 · 交海外"])

  classDef step fill:#E0F7FA,stroke:#00838F,color:#006064
  classDef dec fill:#FFFDE7,stroke:#F9A825,color:#F57F17
  classDef cross fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
  classDef back fill:#FFEBEE,stroke:#C62828,color:#B71C1C,stroke-dasharray: 5 4
  classDef para fill:#E3F2FD,stroke:#1976D2,color:#0D47A1,stroke-dasharray: 5 3
  classDef fix fill:#F6FFED,stroke:#52C41A,color:#135200
  classDef endn fill:#ECEFF1,stroke:#78909C,color:#37474F
  class UP,A,B,C,JOIN,INSP,SC,CLR,OK,AMD1,AMD2,AMD3,WAIT step
  class GATE,D,AMD,WHERE,GAI dec
  class H7,H5,H5B,H3,H4 cross
  class RISK,P3A,P3B para
  class R3 back
  class FIX fix
  class END endn'''
  },
  {
    "id": "hw", "file": "G5-海外对接-组流程图", "mmd": "G5-海外对接-组流程.mmd",
    "title": "海外对接组 · 组流程图",
    "cls": "hw",
    "scope": "S6 接进港 · S7 预估/尾单 · S8 工单边界",
    "handoffs": "H4←船务/关务清关放行 · H6→工单 · 尾端费←私卡",
    "parallel": "HOLD优先于放行 · 码头可提可抓才提拆 · 散货四轨 ∥ 整柜四模式+仅清关",
    "desc": "全流程拆组：订阅关务清关放行后到港→港前 DO/AN→HOLD优先→码头可提→提拆→港后派送。<b>散货</b>卡派/快递/自提/一件代发（<b>四轨均经拆柜</b>；一件代发：渠道标记、只跟轨迹）；<b>整柜</b>到港自提 / 海外仓自提 / 整柜直送 / 整柜拆送 / <b>仅清关 PK2548</b>（无订舱无派送，清关放行结案；仅拆送经拆柜；到港自提无卡派）。清关属关务。",
    "refs": [
      ("../海外对接组-0804-港前港后整柜价格-大致方案.html", "0804 方案"),
      ("../海外对接组-卡派跟进新-MVP.html", "卡派跟进"),
      ("../海外对接组-港后-尾单单票跟踪-原型.html", "尾单 · 一件代发标签"),
      ("../../产品部门-各组需求清单-评审版.html#HW013", "HW013 一件代发"),
      ("../../整柜下单/整柜配送模式-业务流程图-MVP.html", "整柜四模式"),
      ("../海外对接组-整柜尾端派送-MVP.html", "整柜尾端派送"),
      ("drawio-mmd/16-L2-S7-预估尾单.mmd", "L2-S7 mmd"),
      ("drawio-mmd/17-L2-S8-工单边界.mmd", "L2-S8 mmd"),
    ],
    "mermaid": r'''flowchart TB
  H4{{"H4 ← 船务进港<br/>+ 关务清关放行订阅"}} --> A["到港"]
  NOTE["清关 = 关务分支<br/>本组不负责清关作业"]
  H4 -.-> NOTE
  A --> B["柜子计划 / 主单预估"]
  FEE{{"交叉 ← 私卡<br/>尾端费快照"}} --> B
  B --> C["DO / AN 上传推仓"]
  C --> HD{"目的港码头 HOLD<br/>状态能否抓取？"}
  HD -->|能抓| D{"是否 HOLD？"}
  HD -->|抓不到| HDM["标红预警<br/>人工盯 HOLD"]
  HDM --> D
  D -->|是 HOLD| HP{"HOLD 能否处理掉？"}
  HP -->|处理不掉| MARK["必须标记异常 HOLD<br/>回退 · 港前任务重开"]
  MARK --> C
  HP -->|已解除| REL
  D -->|否 无HOLD| REL{"已标放行？"}
  REL -->|否| WAIT["放行处理靠后<br/>暂不预约入仓"]
  WAIT --> C
  REL -->|是| PU{"码头可提状态<br/>能否抓取？"}
  PU -->|能抓且可提| E["预约入仓 / 提拆柜"]
  PU -->|抓不到| WARN["标红预警<br/>人工确认可提后再进"]
  WARN --> E
  PU -->|能抓但未可提| WAIT2["等码头可提"]
  WAIT2 --> PU
  E --> F["收货 · 分配代理"]
  F --> MOD{"散货 / 整柜？"}
  MOD -->|散货 · 卡车| S1["拆柜"] --> P1["∥ 卡车派送"]
  MOD -->|散货 · 快递| S2["拆柜"] --> P2["∥ 快递派送"]
  MOD -->|散货 · 自提| S3["拆柜"] --> P3["∥ 客户自提"]
  MOD -->|散货 · 一件代发| S4["拆柜"] --> P4["∥ 一件代发<br/>渠道标记 · 只跟轨迹"]
  MOD -->|整柜 · 到港自提| F1["到港自提 PK2553<br/>无卡派 · 码头自提结案"]
  MOD -->|整柜 · 海外仓自提| F2["海外仓自提 PK2554<br/>入仓后客户自提"]
  MOD -->|整柜 · 直送| F3["整柜直送 PK2551"]
  MOD -->|整柜 · 拆送| FSTRIP["拆柜"] --> F4["整柜拆送 PK2552"]
  MOD -->|整柜 · 仅清关| F0["仅清关 PK2548<br/>无订舱·无派送 · 清关放行结案"]
  P1 --> H1["卡派跟进 · 轨迹"]
  P2 --> H2["快递跟进 · 轨迹"]
  P3 --> H3["自提闭环"]
  P4 --> Hdrop["一件代发 · 轨迹清单<br/>减群对单 · HW013 上架抓取"]
  F1 --> I
  F2 --> H1
  F3 --> H1
  F4 --> H1
  F0 --> END
  H1 --> I{"异常 / 改派送？"}
  H2 --> I
  H3 --> I
  Hdrop --> I
  I -->|是| H6{{"H6 → 工单<br/>轨迹回写 · 不重走头程"}}
  I -->|否| END(["结束 · 派送闭环"])
  H6 --> END

  classDef step fill:#FFEBEE,stroke:#C62828,color:#B71C1C
  classDef dec fill:#FFFDE7,stroke:#F9A825,color:#F57F17
  classDef cross fill:#F3E5F5,stroke:#6A1B9A,color:#4A148C
  classDef back fill:#FFEBEE,stroke:#C62828,color:#B71C1C,stroke-dasharray: 5 4
  classDef para fill:#E3F2FD,stroke:#1976D2,color:#0D47A1,stroke-dasharray: 5 3
  classDef tip fill:#FAFAFA,stroke:#9E9E9E,stroke-dasharray: 5 3,color:#616161
  classDef endn fill:#ECEFF1,stroke:#78909C,color:#37474F
  class A,B,C,E,F,H1,H2,H3,Hdrop,WARN,HDM,F0,F1,F2,F3,F4,FSTRIP,S1,S2,S3,S4 step
  class HD,D,HP,REL,PU,I,MOD dec
  class H4,FEE,H6 cross
  class P1,P2,P3,P4 para
  class MARK,WAIT,WAIT2 back
  class NOTE tip
  class END endn'''
  },
]

HTML_TMPL = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
  <link rel="stylesheet" href="group-flow-common.css" />
</head>
<body>
  <div class="page">
    <header class="bar">
      <a href="G0-各组流程图-索引.html">← 各组流程图索引</a>
      <span>全流程拆组 · {title_short}</span>
      <a href="../产品部门-全流程-大图包小图-评审版.html">全流程大图</a>
    </header>

    <nav class="g-tabs">
      <a class="bj {on_bj}" href="G1-私卡报价-组流程图.html">私卡报价</a>
      <a class="fk {on_fk}" href="G2-风控-组流程图.html">风控</a>
      <a class="cw {on_cw}" href="G3-船务-组流程图.html">船务</a>
      <a class="gw {on_gw}" href="G4-关务-组流程图.html">关务</a>
      <a class="hw {on_hw}" href="G5-海外对接-组流程图.html">海外对接</a>
    </nav>

    <h1>{title}</h1>
    <p class="desc">{desc}</p>

    <div class="scope">
      <span><b>覆盖阶段：</b></span>
      <span class="chip s">{scope}</span>
      <span><b>交接：</b></span>
      <span class="chip h">{handoffs}</span>
      <span><b>并行：</b></span>
      <span class="chip p">{parallel}</span>
    </div>

    <div class="lg-row">
      <span><i class="dot step"></i>步骤</span>
      <span><i class="dot dec"></i>判断</span>
      <span><i class="dot para"></i>并行 / 旁路</span>
      <span><i class="dot cross"></i>跨组 Hn</span>
      <span><i class="dot back"></i>回退</span>
      <span><i class="dot fix"></i>To-Be</span>
    </div>

    <div class="note">
      画法对齐全流程评审口径：主干折角可读（Mermaid TB）；跨组用紫色 H 节点，不在组内画蜘蛛网斜线。
      draw.io 可导入同目录 <code>drawio-mmd/{mmd}</code>。
    </div>

    <div class="mermaid-wrap"><pre class="mermaid">
{mermaid}
    </pre></div>
{after_mermaid}
    <div class="refs">
      {refs}
    </div>
  </div>
  <script>
    mermaid.initialize({{
      startOnLoad: true,
      theme: "base",
      flowchart: {{ curve: "stepAfter", htmlLabels: true, padding: 12 }},
      themeVariables: {{ fontFamily: "Microsoft YaHei, PingFang SC, sans-serif", fontSize: "13px" }}
    }});
  </script>
</body>
</html>
"""

INDEX = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>产品部门 · 各组流程图索引（全流程拆组）</title>
  <link rel="stylesheet" href="group-flow-common.css" />
  <style>
    .cards {{ display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }}
    .card {{
      background: #fff; border: 1px solid var(--line); border-radius: 8px;
      padding: 14px 16px; border-left: 4px solid #1890ff;
    }}
    .card.bj {{ border-left-color: #e07a2f; }}
    .card.fk {{ border-left-color: #7b3fa0; }}
    .card.cw {{ border-left-color: #1a6bb5; }}
    .card.gw {{ border-left-color: #0d8a8a; }}
    .card.hw {{ border-left-color: #c62828; }}
    .card h2 {{ margin: 0 0 6px; font-size: 15px; }}
    .card p {{ margin: 0 0 10px; font-size: 12px; color: var(--sub); line-height: 1.55; }}
    .card a.btn {{
      display: inline-block; padding: 5px 12px; background: #0b1f3a; color: #fff;
      border-radius: 4px; font-size: 12px; font-weight: 600;
    }}
    .card a.btn:hover {{ text-decoration: none; opacity: .92; }}
    .map {{
      margin: 14px 0; padding: 12px; background: #fff; border: 1px solid var(--line);
      border-radius: 8px; font-size: 12px; line-height: 1.7; color: var(--sub);
    }}
    .map b {{ color: var(--text); }}
  </style>
</head>
<body>
  <div class="page">
    <header class="bar">
      <a href="../../产品部门-导航.html">← 产品部门导航</a>
      <span>全流程拆组 · 各组流程图</span>
      <a href="../../产品部门-对开发-流程节点页面功能对照.html">对开发 · 页面对照</a>
    </header>

    <h1>各组流程图 · 全流程拆组版</h1>
    <p class="desc">
      把 L0 主链（S1～S8）按<strong>责任组</strong>拆开：每组一张竖向流程图（步骤 / 判断 / 并行虚线 / 跨组 H / 回退）。
      风格对齐关务流程图页 + 痛点细图口径（P1/P2/P3、清关属关务、改配船务发起）。
      开发排期请看 <a href="../../产品部门-对开发-流程节点页面功能对照.html">流程节点 × 页面功能 × 修改状态</a>。
    </p>

    <div class="map">
      <b>横向预览：</b><a href="G0-横向泳道-大环节预览.html">散货/整柜 × 八个大环节泳道</a>　｜
      <b>对开发：</b><a href="../../产品部门-对开发-流程节点页面功能对照.html">流程节点 × 页面功能 × 修改状态</a><br/>
      <b>拆组对照：</b><br/>
      私卡 → S1（船务下发头程运价）　｜　风控 → S5 查货　｜　船务 → S3提单·S4配舱·S6进港→离港　｜　
      关务 → S4报关链·S5查验·目的港清关　｜　海外 → S6接进港·S7尾单·S8工单<br/>
      <b>并行口诀：</b>P1 订舱∥推送 · P2 查货∥推送资料给报关行（有问题可拦截）· P3 发舱单∥报关 · 清关∥到港（清关=关务 / 到港=海外）
    </div>

    <div class="cards">
{cards}
    </div>

    <div class="note" style="margin-top:16px">
      draw.io：各页对应 <code>drawio-mmd/G1～G5-*-组流程.mmd</code>，排列 → 插入 → 高级 → Mermaid 粘贴即可。
      痛点细泳道（回退+交叉板）见
      <a href="../产品部门-各组痛点流程图-回退与交叉.html">各组痛点泳道图</a>。
    </div>
  </div>
</body>
</html>
"""


def main():
  cards = []
  for g in GROUPS:
    ons = {f"on_{x}": ("on" if x == g["id"] else "") for x in ("bj", "fk", "cw", "gw", "hw")}
    refs = "\n      ".join(f'<a href="{h}">{t}</a>' for h, t in g["refs"])
    html = HTML_TMPL.format(
      title=g["title"],
      title_short=g["title"].split("·")[0].strip(),
      desc=g["desc"],
      scope=g["scope"],
      handoffs=g["handoffs"],
      parallel=g["parallel"],
      mermaid=g["mermaid"].strip(),
      mmd=g["mmd"],
      refs=refs,
      after_mermaid=g.get("after_mermaid", ""),
      **ons,
    )
    (ROOT / f"{g['file']}.html").write_text(html, encoding="utf-8")

    mmd_body = (
      f"%% {g['title']} · 全流程按组拆分\n"
      f"%% 覆盖：{g['scope']}\n"
      f"%% 交接：{g['handoffs']}\n"
      f"%% draw.io：排列 → 插入 → 高级 → Mermaid…\n\n"
      + g["mermaid"].strip()
      + "\n"
    )
    (MMD / g["mmd"]).write_text(mmd_body, encoding="utf-8")

    cards.append(
      f'''      <div class="card {g['id']}">
        <h2>{g['title'].split("·")[0].strip()}</h2>
        <p>{g['scope']}<br/>{g['handoffs']}</p>
        <a class="btn" href="{g['file']}.html">打开组流程图</a>
      </div>'''
    )

  (ROOT / "G0-各组流程图-索引.html").write_text(
    INDEX.format(cards="\n".join(cards)), encoding="utf-8"
  )
  print("ok", len(GROUPS), "groups + index")


if __name__ == "__main__":
  main()
