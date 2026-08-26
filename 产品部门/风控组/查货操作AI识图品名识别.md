# 查货操作 · AI识图 / 品名识别 — 风控后端评估（一期）

| 项 | 内容 |
|----|------|
| 文档类型 | 风控后端视角 · 需求拆解 + 工时评估 |
| 评估基准 | **1 名后端开发 × 5 个工作日**（约 40 人时） |
| 评估范围 | 一期可联调上线（后端交付 + 联调支持）；**不含前端页面开发** |
| 原型 | [查货操作 · AI识图/品名识别 To-Be](https://271935452-lab.github.io/-/%E4%BA%A7%E5%93%81%E9%83%A8%E9%97%A8/%E9%A3%8E%E6%8E%A7%E7%BB%84/%E9%A3%8E%E6%8E%A7%E7%BB%84-%E6%9F%A5%E8%B4%A7%E6%93%8D%E4%BD%9C-AI%E8%AF%86%E5%9B%BE%E5%93%81%E5%90%8D%E8%AF%86%E5%88%AB-%E5%8E%9F%E5%9E%8B.html) |
| 关联文档 | [设计文档](./设计文档.md)、[接口说明](./接口说明.md) |

---

## 1. 评估结论（给排期用）

| 维度 | 结论 |
|------|------|
| **总工时** | **5 人日**（后端 1 人） |
| **可交付节点** | 第 5 个工作日下班前完成：环境就绪、后端功能交付、主链路联调通过、接口文档可交付前端 |
| **前置依赖** | DBA 执行 SQL、AI 工具模板配置 Dashscope Key、测试环境部署 tx-oms |
| **不在 5 人日内** | 前端页面开发、企微真实私聊、品牌侵权授权查询、多模态模型升级 |

**工时构成概览：**

| 类别 | 人日 | 说明 |
|------|------|------|
| 环境配置与部署 | 0.5 | SQL、AI 模板、服务发布 |
| 核心功能开发 | 1.5 | 列表扩展、识图、确认、加费、附加服务、放行、通知 |
| 联调与缺陷修复 | 2.0 | 拍图→识图→确认→通知→加费→放行 |
| 权限 / 文档 / 验收 | 0.5 | 权限 SQL、Postman、验收用例 |
| 缓冲 | 0.5 | 模型效果调 Prompt、偶发问题 |
| **合计** | **5.0** | |

---

## 2. 业务背景

风控组「查货操作」是头程 OMS 核心页面，仓库 PDA/员工端拍图查货后，风控需在 OMS 核对品名、品牌、侵权与带电风险，并完成确认、扣件、加费、放行等操作。

**现网痛点：**

- 识图靠人工看图填品名，效率低
- 产品确认、附加服务、成本费用、放行、通知等能力分散，与 To-Be 原型不一致
- 关键操作后业务员/客服难以及时感知（缺少「我的通知」消息中心）

**本期目标（一期）：**

打通 **「拍图 → AI 识图回写 → 列表筛选 → 运单级确认 → 系统通知」** 主闭环，并补齐加费、附加服务差分、扣件放行、消息中心等配套后端能力。

---

## 3. 需求明细（风控后端视角）

### 3.1 模块 A：查货列表增强

#### 3.1.1 功能描述

在现有 `POST /bussOrderVerify/getPage`、`/getStatusCount` 上扩展字段与筛选，不改变原有状态页签语义（全部 / 查货中 / 查货扣件中 / 产品已确认 / 已退件）。

#### 3.1.2 新增列表字段

| 字段 | 类型/取值 | 来源 | 说明 |
|------|-----------|------|------|
| `aiStatus` | 未识别/识别中/已识别/识别失败 | `S_BUSS_ORDER_VERIFY.AI_STATUS` | AI 识图状态 |
| `aiSuggestName` | 文本 | `AI_SUGGEST_NAME` | AI 建议品名 |
| `aiBrand` | 文本 | `AI_BRAND` | AI 识别品牌 |
| `aiInfringement` | 是/否/待核实 | `AI_INFRINGEMENT` | 侵权判断 |
| `aiBattery` | 是/否/待核实 | `AI_BATTERY` | 带电判断 |
| `nameConfirmStatus` | 未识别/待人工确认/已确认采纳 | `NAME_CONFIRM_STATUS` | 品名确认状态 |
| `photoSeenFlag` | 0/1 | `PHOTO_SEEN_FLAG` | 照片是否已看完 |
| `riskNotice` | 文本 | `RISK_NOTICE` | 风险告知（多选拼接） |
| `costFeeStatus` | 未添加/已加业务成本/已加应收+成本 | `COST_FEE_STATUS` | 成本费用状态 |
| `mainTradeNameCount` | 数字 | 报关品名聚合 | 主品名数，>5 前端标红 |
| `guaranteeFlag` | 0/1 | 附件聚合 | 是否上传保函 |
| `authCnFlag` | 0/1 | 附件聚合 | 是否上传国内授权 |
| `authOverseasFlag` | 0/1 | 附件聚合 | 是否上传国外授权 |
| `aiFailReason` | 文本 | `AI_FAIL_REASON` | 识图失败原因（详情用） |
| `aiTraceId` | 文本 | `AI_TRACE_ID` | AI 调用追踪 |

#### 3.1.3 新增筛选条件

| 查询项 | queryNo | 字典 VALUE |
|--------|---------|------------|
| AI识别状态 | `StockChecking_aiStatus` | `INSPECTION_AI_STATUS` |
| 品名识别状态 | `StockChecking_nameConfirmStatus` | `INSPECTION_NAME_CONFIRM_STATUS` |
| AI建议品名 | `StockChecking_aiSuggestName` | （文本） |
| 照片已看完 | `StockChecking_photoSeenFlag` | `INSPECTION_PHOTO_SEEN_FLAG` |
| 成本费用 | `StockChecking_costFeeStatus` | `INSPECTION_COST_FEE_STATUS` |
| 是否侵权(AI) | `StockChecking_aiInfringement` | `INSPECTION_AI_INFRINGEMENT` |
| 是否带电(AI) | `StockChecking_aiBattery` | `INSPECTION_AI_BATTERY` |
| 风险告知 | `StockChecking_riskNoticeFlag` | `INSPECTION_RISK_NOTICE_FLAG` |

配置落在 `S_SYS_DICT` + `S_SYS_QUERY`（`dict-select`，`01_查货操作.sql`）。

#### 3.1.4 开发内容

- 扩展 `S_BUSS_ORDER_VERIFY` 表字段（`01_查货操作.sql`）
- 扩展 `BussOrderVerifyMapper.xml` 查询与 `OrderVerifyVo`
- 列表性能：新增字段走主表扩展，避免 JOIN 大 JSON

#### 3.1.5 工时预估

| 子项 | 人日 |
|------|------|
| SQL + Entity/Vo | 0.25 |
| Mapper 查询与筛选 | 0.25 |
| **小计** | **0.5** |

--- 

### 3.2 模块 B：AI 识图（异步）

#### 3.2.1 功能描述

仓库通过 `POST /bussOrderVerify/checkTheCargoFasteners` 上传查货记录时，若子单带有 `enclosureList`（附件类型「查货记录」），事务提交后**异步**触发 AI 识图，结果回写查货主表。

#### 3.2.2 触发条件

| 条件 | 是否触发 |
|------|----------|
| `checkTheCargoFasteners` 且本次请求含查货图 | 触发 |
| 仅保存标记/备注、无图 | 不触发 |
| 其他上传入口、未走查货扣件接口 | 不触发（一期接受） |
| 产品确认 / 加费 / 放行 | 不触发 |

#### 3.2.3 识图输入（userContent，OMS 拼装）

| 数据项 | 来源 |
|--------|------|
| 运单号、客户单号 | `S_BUSS_ORDER` |
| 销售产品、客户类型、货物类型 | `S_BUSS_ORDER` |
| 申报带电 | `CHARGED_FLAG` |
| 申报中文/英文品名、品牌、型号、材质 | `S_BUSS_ORDER_CUSTOMS`（最多 10 条去重） |
| 查货图片 URL | `SYS_ENCLOSURE`（类型「查货记录」，最多 20 张） |

#### 3.2.4 识图输出（AI 返回 JSON）

```json
{
  "suggestName": "建议中文报关品名",
  "brand": "识别品牌",
  "infringement": "是/否/待核实",
  "battery": "是/否/待核实"
}
```

落库后：`aiStatus=已识别`，`nameConfirmStatus=待人工确认`。

#### 3.2.5 提示词管理

| 层级 | 管理方式 |
|------|----------|
| 系统 Prompt（角色/规则/JSON 格式） | 「AI 工具模板」页面 → `THIRD_API_CONFIG`，`apiCode=INSPECTION_VISION` |
| 业务上下文 | OMS 拼装运单/申报/图片 URL 等事实数据 |
| 模型 / Key / 超时 | 同上，复用 Dashscope 配置 |

#### 3.2.6 失败与重试

- 无查货图：直接 `识别失败`，不重试
- 超时 / 5xx / 限流：最多 3 次，退避 1s→2s→4s
- 业务错误（AI 返回明确失败）：不重试
- 提供手动重新识图接口（按运单号触发）
- 「识别中」超过阈值（如 5 分钟）自动转「识别失败」

#### 3.2.7 技术方案

- 调用链：`tx-oms` → Feign → `tx-ai` `/ai/invoke` → Dashscope
- 异步：`afterCommit` + 后台任务（一期无 MQ）
- 图片 URL 写入 userContent（一期按文本方式调用，识图效果依赖模型与 Prompt）

#### 3.2.8 开发内容

- `InspectionAiRecognizeExecutor`：异步识图、重试、结果回写
- `03_AI工具模板.sql`：AI 工具模板初始化
- `POST /bussOrderVerify/retryAiRecognize`：手动重试（可选入参 `billNoList`）
- 识别中超时补偿逻辑

#### 3.2.9 工时预估

| 子项 | 人日 |
|------|------|
| 识图执行器 + Feign 调用 + 回写 | 0.5 |
| AI 模板 SQL + userContent 拼装 | 0.25 |
| 失败重试 + 手动重试 + 超时补偿 | 0.25 |
| **小计** | **1.0** |

---

### 3.3 模块 C：产品确认工作台（运单级）

#### 3.3.1 功能描述

运单级侧栏逐票确认，替代现网「按子单批量确认」交互。扩展 `POST /bussOrderVerify/productValidation`，支持 `billNoList` 入参。

#### 3.3.2 入参语义

```json
{
  "billNoList": ["运单号"],
  "inspectionSaveFlag": 0,
  "verifyRemark": "核对备注",
  "riskNotice": "涉证;扣货不赔",
  "adoptAiSuggestName": 1
}
```

| 参数 | 说明 |
|------|------|
| `billNoList` | 运单级入参；服务端自动展开已有「查货记录」子单 |
| `inspectionSaveFlag=0` | 正常确认 → 状态「产品已确认」 |
| `inspectionSaveFlag=1` | 侧栏扣件 → 状态保持「查货中」，生成操作查验问题件 |
| `adoptAiSuggestName=1` | 采纳 AI 建议品名，回写**第一条**报关中文品名 |
| `riskNotice` | 写入主表；非空时额外发「扣货风险告知」通知 |

#### 3.3.3 业务规则

| 规则 | 说明 |
|------|------|
| 须有查货记录才可确认 | 无查货记录则拒绝 |
| 须有查货图才可确认 | 无「查货记录」附件则拒绝 |
| 照片已看完 | 确认时置 `photoSeenFlag=1`；可提供独立 `markPhotoSeen` 接口 |
| AI 字段只读展示 | 前端控制展示；后端提供字段 |
| 主品名仅人工采纳后回写 | 须 `adoptAiSuggestName=1` 才更新报关品名 |

#### 3.3.4 开发内容

- 扩展 `productValidation` 支持 `billNoList`
- 确认前校验查货记录 + 查货图附件
- 采纳 AI 品名、风险告知写入、触发通知

#### 3.3.5 工时预估

| 子项 | 人日 |
|------|------|
| 运单级确认逻辑改造 | 0.25 |
| 有图校验 + 采纳品名 + 风险告知 | 0.25 |
| **小计** | **0.5** |

---

### 3.4 模块 D：添加成本费用

#### 3.4.1 功能描述

新增 `POST /bussOrderVerify/addInspectionCostFee`：查货场景加费编排，与附加服务解耦。

#### 3.4.2 规则

| 客户类型 | 落账 |
|----------|------|
| 直客 | 仅业务成本（`balancePayTheory/saveBatchBillPayTheory`） |
| 同行 | 成本 + 应收（`balanceCostDetail/saveBatch`） |

- 回写 `costFeeStatus`
- 触发「添加费用」系统通知
- **不写入**附加服务表
- 主品名数 >5：**不自动加费**，由人工选费用类型

#### 3.4.3 开发内容

- 新接口编排：按客户类型分流成本/应收
- 费用备注（`feeRemarkList`）拼接
- 操作后写通知

#### 3.4.4 工时预估

| 子项 | 人日 |
|------|------|
| 加费接口 + 落账编排 | 0.25 |
| **小计** | **0.25** |

---

### 3.5 模块 E：附加服务批量差分

#### 3.5.1 功能描述

| 接口 | 说明 |
|------|------|
| `POST /bussOrderAddService/getBatchEcho` | 多票回显 checked / half / unchecked |
| `POST /bussOrderAddService/updateBatch` | `addServiceList` + `removeServiceList` 差分增删 |

#### 3.5.2 规则

- ≥2 票：批量入口，半选未改则保持原样
- 1 票：单票修改，勾选增、取消勾选删
- 变更后发「附加服务变更」通知
- 服务编码需与业务确认（CPC附加、反倾销、产品附加费、多品名费等）

#### 3.5.3 开发内容

- 批量回显接口（全有/全无/半选）
- 差分增删写库
- 变更通知

#### 3.5.4 工时预估

| 子项 | 人日 |
|------|------|
| 回显 + 差分 + 通知 | 0.25 |
| **小计** | **0.25** |

---

### 3.6 模块 F：查货扣件放行

#### 3.6.1 功能描述

新增 `POST /bussOrderVerify/passInspectionFastener`：仅放行「问题件-操作查验」（`WTLX2503254725`），支持三类附件。

#### 3.6.2 规则

| 项 | 说明 |
|----|------|
| 范围 | 仅操作查验且未处理/处理中 |
| 附件类型 | 保函、国内授权、国外授权 |
| 放行后 | 若无其他未处理操作查验 → 状态「产品已确认」 |
| 列表标记 | `guaranteeFlag` / `authCnFlag` / `authOverseasFlag` |
| 通知 | 「查货扣件放行」 |

#### 3.6.3 开发内容

- 收窄问题件类型过滤
- 三类附件落库
- 状态回写 + 列表授权标记查询 + 通知

#### 3.6.4 工时预估

| 子项 | 人日 |
|------|------|
| 放行接口 + 附件 + 状态回写 | 0.25 |
| **小计** | **0.25** |

---

### 3.7 模块 G：我的通知（消息中心）

#### 3.7.1 功能描述

对齐「我的待办」交互，提供持久化通知列表（非仅 WS 弹窗）。

| 接口 | 说明 |
|------|------|
| `POST /bussInspectionNotify/getStatusCount` | 未读/已读/抄送数量 |
| `POST /bussInspectionNotify/getPage` | 分页列表 |
| `POST /bussInspectionNotify/getDetail` | 详情 |
| `POST /bussInspectionNotify/batchMarkRead` | 批量已读 |
| `POST /bussInspectionNotify/batchIgnore` | 批量忽略 |

#### 3.7.2 数据表

`S_BUSS_INSPECTION_NOTIFY`（`02_我的通知.sql`）

#### 3.7.3 写入场景

产品确认、查货扣件、扣货风险告知、添加费用、扣件放行、附加服务变更。

#### 3.7.4 收件规则

- 主送：所属业务员（`ccFlag=0`）
- 抄送：所属客服（与业务员不同时，`ccFlag=1`）
- 渠道展示：一期仅「系统消息」
- 实时提醒：同步 WebSocket 推送

#### 3.7.5 开发内容

- 通知表 + Entity/Mapper/Service/Controller
- 各操作点写入通知 + WS 推送
- 列表/详情/已读/忽略
- 权限 SQL（菜单、按钮、列表字段）

#### 3.7.6 工时预估

| 子项 | 人日 |
|------|------|
| 表 + CRUD 接口 | 0.5 |
| 操作点接入 + WS | 0.25 |
| 权限 SQL | 0.25 |
| **小计** | **1.0** |

---

### 3.8 模块 H：双通道通知（企微）

#### 3.8.1 原型要求

企微私聊 + 系统消息双通道。

#### 3.8.2 一期范围

| 通道 | 一期 |
|------|------|
| 系统消息（落库 + WS） | 包含 |
| 企微私聊真实发送 | **不包含**（需基建，单独立项） |

> 企微若强制要求，预估另需 3～5 人日（含基建调研与对接）。

---

## 4. 范围边界

### 4.1 一期包含

- 列表 AI/费用/授权字段与筛选
- 拍图自动识图 + 失败重试 + AI 工具模板
- 运单级产品确认 + 采纳品名 + 风险告知 + 有图校验
- 加费 / 附加服务差分 / 扣件放行
- 我的通知消息中心（系统通道）
- 环境 SQL + 配置 + 主链路联调验收

### 4.2 明确不做

| 项 | 原因 |
|----|------|
| 企微私聊真实发送 | 现网无发送基建 |
| 品牌侵权/授权查询完整流程 | 原型待定 |
| 主品名数 >5 自动加费 | 产品明确排除 |
| AI 未经确认自动覆盖主品名 | 风控要求人工确认 |
| 前端页面开发 | 后端交付，前端另排 |

### 4.3 二期 / 待定

- 客户咨询入口
- 品名库七类合规沉淀
- 真正多模态识图（换模型 / 改 tx-ai 策略）
- 识图任务 MQ 化、专用 Worker

---

## 5. 五日开发计划（建议排期）

假设 **1 名后端**，从 D1 开始：

### D1（1 人日）：环境与基础开发

| 时段 | 任务 | 产出 |
|------|------|------|
| 上午 | 执行 3 条 SQL；配置 `INSPECTION_VISION` 模板与 API_KEY | 测试库表结构就绪 |
| 下午 | 列表字段扩展；识图执行器骨架 | 列表可查新字段 |

### D2（1 人日）：核心业务开发

| 时段 | 任务 | 产出 |
|------|------|------|
| 上午 | AI 识图完整链路（异步、重试、回写、userContent） | 拍图可触发识图 |
| 下午 | 运单级产品确认 + 有图校验 + 采纳品名 | 确认链路可通 |

### D3（1 人日）：扩展能力与通知

| 时段 | 任务 | 产出 |
|------|------|------|
| 上午 | 加费 + 附加服务差分 + 扣件放行 | 旁路工具可用 |
| 下午 | 我的通知（表 + 接口 + 各操作点写入） | 通知中心可查询 |

### D4（1 人日）：联调与修复

| 场景 | 验证点 |
|------|--------|
| 拍图查货 | `aiStatus` 流转；字段回写 |
| 产品确认 | 状态、采纳品名、风险告知、通知 |
| 加费 | 直客/同行落账、`costFeeStatus` |
| 附加服务 | 回显、差分、通知 |
| 放行 | 仅操作查验、附件标记、通知 |

### D5（1 人日）：验收与交付

| 任务 | 说明 |
|------|------|
| 权限 SQL、Postman 用例 | 可交付前端联调 |
| 回归测试 | 按验收用例走一遍 |
| Prompt 调优 | 与产品一起看 3～5 票识图效果 |
| 文档整理 | 接口说明、对接清单 |

---

## 6. 环境与配置清单

### 6.1 数据库（按序执行）

```text
1. 01_查货操作.sql
2. 02_我的通知.sql
3. 03_AI工具模板.sql
```

### 6.2 AI 配置

| 项 | 操作 |
|----|------|
| AI 工具模板 | 新增/启用 `INSPECTION_VISION` |
| API_KEY | 配置有效 Dashscope Key |
| Prompt | 按识图效果在页面维护 |

### 6.3 服务部署

- 发布 **tx-oms**
- **tx-ai** 配置在库表，一般无需改代码

### 6.4 可选配置（Nacos / bootstrap）

```yaml
inspection:
  ai:
    api-code: INSPECTION_VISION
    retry:
      max-attempts: 3
      initial-backoff-ms: 1000
```

### 6.5 前端（另排期）

需对接：列表新字段/筛选、确认工作台、我的通知页、加费/附加服务/放行弹窗。参考 [接口说明](./接口说明.md)。

---

## 7. 风险与依赖

| 风险 | 影响 | 缓解 |
|------|------|------|
| AI 识图准确率不足 | 人工确认工作量大 | Prompt 调优；后续换多模态模型 |
| 图片 URL 模型访问不了 | 识图失败率高 | 确认 OSS 外链公网可达 |
| 费用类型编码未对齐 | 加费联调失败 | 开发前与财务确认 `costNo` 枚举 |
| 附加服务编码未对齐 | 差分联调失败 | 确认原型四项与服务编码映射 |
| 企微预期与交付不一致 | 验收争议 | 一期书面确认仅系统消息 |

---

## 8. 验收标准（后端可测）

| # | 用例 | 预期 |
|---|------|------|
| 1 | PDA 拍图保存查货记录 | 有图则触发识图；列表 `aiStatus` 最终为已识别或识别失败 |
| 2 | 识图成功 | 四字段有值；`nameConfirmStatus=待人工确认` |
| 3 | 产品确认且不采纳 | 主品名不变；状态产品已确认；通知落库 |
| 4 | 确认且 `adoptAiSuggestName=1` | 第一条报关中文品名被更新 |
| 5 | 侧栏扣件 | 生成操作查验问题件；通知类型「查货扣件」 |
| 6 | 直客加费 | 仅成本；`costFeeStatus=已加业务成本` |
| 7 | 同行加费 | 成本+应收；`costFeeStatus=已加应收+成本` |
| 8 | 附加服务差分 | 取消勾选后服务删除；通知「附加服务变更」 |
| 9 | 扣件放行 | 仅操作查验；三类附件列表有标记 |
| 10 | 我的通知 | 各操作均有记录；已读/忽略生效 |

---

## 9. 交付物清单

| 交付物 | 说明 |
|--------|------|
| 设计文档 | `docs/查货操作AI识图品名识别/设计文档.md` |
| 接口说明 | `docs/查货操作AI识图品名识别/接口说明.md` |
| 风控后端评估（本文） | `docs/查货操作AI识图品名识别/风控后端评估.md` |
| SQL 脚本 | `docs/查货操作AI识图品名识别/sql/*.sql` |
| 后端代码 | `tx-oms`、`tx-common-model` |
| Postman 用例 | 联调接口集合 |

---

## 10. 附录：接口一览

| 类型 | 路径 |
|------|------|
| 列表 | `POST /bussOrderVerify/getPage`、`/getStatusCount` |
| 拍图查货 | `POST /bussOrderVerify/checkTheCargoFasteners` |
| 产品确认 | `POST /bussOrderVerify/productValidation` |
| 识图重试 | `POST /bussOrderVerify/retryAiRecognize` |
| 加费 | `POST /bussOrderVerify/addInspectionCostFee` |
| 放行 | `POST /bussOrderVerify/passInspectionFastener` |
| 附加服务 | `POST /bussOrderAddService/getBatchEcho`、`/updateBatch` |
| 我的通知 | `POST /bussInspectionNotify/*` |
| AI 调用 | `POST /ai/invoke`（内部 Feign） |
| AI 模板管理 | `POST /ai/config/getPage` 等（tx-ai） |

---

*文档版本：v1.1 | 评估人日：5 | 更新日期：2026-08-24*
