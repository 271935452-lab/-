# 人员映射表 & 订单底表 — 开发 PRD（详版）

> 文档目的：给开发、测试、数据同学一份可落地的需求说明，覆盖常见与边界场景。  
> 范围：人员映射（主数据与导入）、订单底表（事实层）、与规则中心/表外成本/试算的衔接说明（规则中心未上线时的降级策略一并写明）。

---

## 0. 名词与分层

| 名词 | 含义 |
|------|------|
| 人员映射 | 将「系统账号 / 员工」与「提成角色、服务场景、组织、生效区间」绑定，供归因与规则匹配使用。 |
| 订单底表 | 按月（或按业务口径）沉淀的提成计算事实表：金额、成本、回款、归属人、数据质量标记等。**不承载最终提成发放结果**（结果由试算/发放任务产出）。 |
| 业绩归属日 | 用于判断「取哪一条人员映射」的日期：默认取配置（如核销月、到货月、回款截止日所在日），需产品配置项。 |
| service_mode | 客服场景：`有业务员客服` / `无业务员客服` / `全部场景`。 |
| 互斥组 | 规则中心概念，**不在**人员映射表维护。 |

**分层原则**：人员映射 = 谁；订单底表 = 什么单、多少钱、归谁；规则中心 = 怎么算（可二期上线）。

---

# 第一部分：人员映射表

## 1. 背景与目标

### 1.1 背景

- 订单底表存在「业务员」「客服」等展示字段，需稳定映射到系统员工与提成角色。  
- 同一员工存在调岗、兼岗、客服多场景、离职结算等，需时间轴可追溯。  
- 财务可能以 Excel 批量维护，需与系统主数据对齐。

### 1.2 目标

- 任意业务日 \(T\) 上，可唯一确定（或在冲突时明确报错）：该员工在某 `commission_role` + `service_mode` 下是否有效、组织信息快照。  
- 支持列表查询、单条新增/编辑、批量导入、变更审计。  
- 与订单底表归因、后续规则匹配解耦：**映射表不绑 `rule_id`**（可选「方案编码」对接规则包，见 4.3）。

### 1.3 非目标（本期可不实现）

- 在映射表内配置阶梯、比例（属规则中心）。  
- 在映射表内维护互斥组（属规则中心）。

---

## 2. 角色与权限（建议）

| 角色 | 权限 |
|------|------|
| 系统管理员 | 全量 CRUD、导入、停用、导出。 |
| HR/人事 | 维护员工基础字段同步只读；是否可改映射由项目定。 |
| 财务 | 批量导入、导出、查看；是否可改单条由项目定。 |
| 业务主管 | 通常只读或仅查看本部门。 |

---

## 3. 数据模型（逻辑表：`commission_personnel_mapping`）

### 3.1 字段清单（建议）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | bigint | 是 | 主键。 |
| `employee_id` | varchar(64) | 是 | 员工主数据唯一 ID（**禁止仅用姓名做主键**）。 |
| `account_id` | varchar(64) | 否 | 系统账号 ID；与登录体系一致时强烈建议必填。 |
| `account_name` / `login_name` | varchar(128) | 条件 | 展示与检索；改名时需保留 `account_id` 稳定关联。 |
| `employee_name` | varchar(64) | 是 | 姓名快照，用于展示与导入校验。 |
| `dept_id` | varchar(64) | 否 | 部门 ID。 |
| `dept_name` | varchar(128) | 否 | 部门名称快照。 |
| `group_name` | varchar(128) | 否 | 小组（若财务表有）。 |
| `company_code` | varchar(64) | 否 | 所属公司编码。 |
| `commission_role` | varchar(64) | 是 | 提成岗位枚举：直客业务员、直客主管、直客客服等。 |
| `service_mode` | varchar(32) | 条件 | **客服类角色必填**；非客服可填「全部场景」或系统默认。 |
| `mapping_effective_start` | date | 是 | **映射生效起始**（配置何时开始认这条关系）。 |
| `mapping_effective_end` | date | 否 | 映射失效日；空表示长期有效（与产品约定上限如 2099-12-31 二选一）。 |
| `commission_calc_start` | date | 否 | 财务口径：提成计算开始（与映射生效可不同）。 |
| `commission_calc_end` | date | 否 | 财务口径：提成计算结束。 |
| `revenue_attribution_start` | date | 否 | 收入/业绩归属统计窗口起（若与提成周期不同）。 |
| `revenue_attribution_end` | date | 否 | 收入/业绩归属统计窗口止。 |
| `hire_date` | date | 否 | 入职日期（规则条件用）。 |
| `regular_date` | date | 否 | 转正日期。 |
| `leave_date` | date | 否 | 离职日期。 |
| `employee_status` | varchar(16) | 是 | 在职 / 离职等。 |
| `is_enabled` | tinyint | 是 | 1 启用 0 停用（临时下线映射不改区间）。 |
| `commission_scheme_code` | varchar(64) | 否 | 财务「提成方式」对应字典编码，对接规则包/方案，**非 rule_id**。 |
| `calc_personal_mode` | varchar(16) | 否 | 如：是否内算个人模式（枚举，与财务表对齐）。 |
| `special_clause` | varchar(512) | 否 | 特殊条款文本；后续可规则化。 |
| `guarantee_note` | varchar(512) | 否 | 保障上限、计入月份等说明。 |
| `remark` | varchar(512) | 否 | 备注。 |
| `created_at` / `created_by` / `updated_at` / `updated_by` | — | 是 | 审计。 |

### 3.2 唯一性与索引（建议）

- 业务唯一（示例，可按产品收紧/放宽）：  
  `(employee_id, commission_role, service_mode, mapping_effective_start)`  
  若允许同一组合多条历史，则用 `id` 区分，另加**重叠检测**（见 5.2）。  
- 索引：`(employee_id, mapping_effective_start)`、`(account_id)`、`(commission_role, service_mode)`、`(is_enabled)`。

---

## 4. 功能需求

### 4.1 列表页

- 筛选：系统账号、姓名、部门、**映射生效区间**、提成角色、`service_mode`、在职状态、是否启用。  
- 操作：新增、编辑、停用/启用、导出、批量导入、下载模板。  
- 列表展示：姓名、账号、部门、角色、`service_mode`、生效区间、状态、最近修改人/时间。

### 4.2 新增 / 编辑

- 选择员工：优先选 `employee_id`（选人组件），自动带出姓名、部门、状态；允许手工修正部门快照需留痕。  
- 选择提成角色后：若为客服类，**强制 `service_mode`**。  
- 校验：`mapping_effective_start <= mapping_effective_end`（若 end 非空）。  
- 与 `leave_date`：若状态为离职，保存时预警或阻断「生效结束晚于离职后 X 月」按产品规则。

### 4.3 与规则的关系

- **默认不存 `rule_id`**。  
- 若财务表有「提成方式」：映射表存 `commission_scheme_code`，规则中心（或配置表）维护 `scheme_code → 默认规则包`。  
- **例外**：若存在极少数「指定人走指定规则」白名单，可增加可选字段 `assigned_rule_id`（可空）；命中逻辑为「白名单优先，否则按 scheme + 条件匹配」。

### 4.4 批量导入

- 模板列：至少包含 `employee_id`（或 `account_id`）、`employee_name`、`dept_name`、`commission_role`、`service_mode`（如适用）、`mapping_effective_start`、`mapping_effective_end`。  
- 识别策略：**先 ID 强匹配**，姓名+部门弱匹配；不唯一则失败行进入失败明细。  
- 重复策略：阻断 / 覆盖 / 跳过（与人员映射导入页一致）。  
- 导入结果：成功数、失败数、失败文件下载。

---

## 5. 业务规则与场景（开发必测）

### 5.1 时间轴：如何用生效时间

- **映射生效区间**：回答「配置层面这条映射何时有效」。  
- **提成计算起止 / 收入归属起止**（若有）：回答「财务口径下哪段参与算提成/算业绩」。  
- 归因时：先取订单的「业绩归属日」\(T\)（见第二部分），再取满足  
  `mapping_effective_start <= T <= mapping_effective_end` 且 `is_enabled=1` 的映射行。

### 5.2 重叠与冲突

- **同一 `employee_id + commission_role + service_mode` 下，映射生效区间不得重叠**（默认阻断）；若产品允许重叠，必须定义优先级来源（不推荐）。  
- **同一账号绑定多员工**：导入时阻断。  
- **客服 `service_mode` 为「全部场景」**：与「有业务员」「无业务员」两条是否可同时存在由产品定：建议「全部场景」与细分场景**互斥**，避免双计。

### 5.3 调岗

- 旧映射 `mapping_effective_end` 截断到新岗生效日前一日；新映射从新岗生效日开始。  
- 历史月重算：必须用**该月业务归属日**对应的映射，不能用当前映射覆盖过去（除非产品明确「全量按当前映射重算」）。

### 5.4 兼岗

- 同一 `employee_id` 可有多行，**不同 `commission_role`**（或同角色不同 `service_mode` 若业务允许）。  
- 订单归因时：订单上业务员字段 → 映射到 `commission_role=业务员`；客服字段 → 映射到客服行；**不得把同一笔业绩同时记给两个角色除非业务定义了分摊**（分摊在结果层，不在映射表重复绑人）。

### 5.5 离职

- `employee_status=离职`：允许映射 `mapping_effective_end` 落在离职后某月用于历史提成补发（按财务政策）。  
- 导入时：离职人员新增「长期有效」映射 → 预警或阻断。

### 5.6 与订单底表联动

- 底表同步或计算时若找不到映射：`is_valid=0`，`invalid_reason=人员映射缺失或不唯一`。  
- 映射从「启用」改为「停用」：不删除历史；是否触发该月重算由任务配置决定。

### 5.7 审计

- 所有变更写操作日志：旧值/新值、操作人、时间、来源（页面/导入批次号）。

---

## 6. 接口建议（REST 示例）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/commission/personnel-mappings` | 分页列表 + 筛选。 |
| GET | `/api/v1/commission/personnel-mappings/{id}` | 详情。 |
| POST | `/api/v1/commission/personnel-mappings` | 新增。 |
| PUT | `/api/v1/commission/personnel-mappings/{id}` | 更新。 |
| POST | `/api/v1/commission/personnel-mappings/{id}/disable` | 停用。 |
| POST | `/api/v1/commission/personnel-mappings/import` | 上传导入文件。 |
| GET | `/api/v1/commission/personnel-mappings/import/{batchId}` | 导入批次状态与失败明细。 |
| GET | `/api/v1/commission/personnel-mappings/resolve` | 入参 `employee_id` + `as_of_date` + `role` + `service_mode`，返回命中映射（供调试）。 |

---

## 7. 非功能需求

- 列表查询 P95 < 500ms（数据量 10w 级前提下需合适索引）。  
- 导入 5k 行异步任务 + 进度查询。  
- 敏感字段按公司权限脱敏（若有）。

---

## 8. 测试用例清单（人员映射）

1. 新增客服映射不填 `service_mode` → 阻断。  
2. 同一员工同角色同场景区间重叠 → 阻断。  
3. 调岗截断旧区间 + 新区间无缝衔接。  
4. 导入仅姓名无 ID → 失败或进入待人工确认队列（按策略）。  
5. `as_of_date` 落在区间边界当天 → 包含边界。  
6. 停用映射后订单归因 → 失败原因正确。  
7. `commission_scheme_code` 有值但规则中心未上线 → 不报错，仅写入；试算时提示未配置方案（若试算已做）。

---

# 第二部分：订单底表

## 9. 背景与目标

### 9.1 背景

- 提成计算需要统一事实：应收、实收、回款率、成本、毛利、归属业务员/客服、客户类型、部门、产品维度等。  
- 表外成本以**明细台账**导入，**汇总回写**底表字段。  
- 规则中心可能分期上线：底表需支持「先沉淀事实、后接规则」。

### 9.2 目标

- 每条底表记录在明确粒度下可参与或排除计提（`is_valid` + 原因）。  
- 支持回款率等**发放门槛**所需字段。  
- 与人员映射、表外导入、后续试算任务衔接清晰。

### 9.3 非目标

- 底表不存最终「应发提成」「实发提成」作为权威结果时，应以独立**提成结果表**为准；底表可留空或仅跑批临时写字段（见 11.4）。

---

## 10. 数据模型（逻辑表：`commission_order_base`）

### 10.1 粒度（必须产品确认后写死）

**推荐粒度**：  
`biz_month` + `order_no`（或 `waybill_no` 若一单多运单拆行） + `owner_employee_id` + `commission_role` + `service_mode`  

若 MVP 仅「一行一单一个业务员」：可简化为 `biz_month + waybill_no`，但需在文档中声明**不支持一单多角色分账**。

### 10.2 字段清单（建议）

#### A. 标识与业务月

| 字段 | 说明 |
|------|------|
| `id` | 主键。 |
| `biz_month` | 提成归属月 `YYYY-MM`（与财务核销月/到货月关系见 12.2）。 |
| `order_no` | 订单号（强烈建议有，便于与财务、表外导入对齐）。 |
| `waybill_no` | 运单号。 |
| `biz_line` / `customer_type` | 直客/同行/渠道或与客户类型映射一致。 |

#### B. 物流与产品

| 字段 | 说明 |
|------|------|
| `arrival_month` / `writeoff_month` | 到货月、核销月。 |
| `chargeable_weight` / `piece_count` | 计费重、件数。 |
| `bl_no` / `container_no` | 提单号、柜号。 |
| `route` | 运线。 |
| `sales_product` / `product_line` | 销售产品、产品线。 |
| `dept_id` / `dept_name` | 所属部门。 |

#### C. 金额与利润

| 字段 | 说明 |
|------|------|
| `receivable_amount` | 应收。 |
| `sales_cost` / `system_cost_total` | 业务员成本/系统成本（命名与源系统对齐）。 |
| `gross_profit` | 毛利；建议系统可重算校验：`receivable - costs`。 |
| `net_profit` | 净利润；**规则中心未上线或本单不适用时可 NULL**，见 12.4。 |
| `offbook_cost_total` | 表外成本合计（由明细汇总回写）。 |
| `offbook_finance_adjust` 等 | 表外拆分字段（可选 MVP）。 |
| `commission_base_preview` | 可选：仅试算预览用，非权威。 |

#### D. 回款与发放门槛

| 字段 | 说明 |
|------|------|
| `received_amount` | 实收。 |
| `receipt_rate` | 回款率；建议落库：`received_amount / receivable_amount`（分母为 0 时 NULL + 标记异常）。 |
| `receipt_cutoff_time` | 回款截止核算时间。 |

#### E. 人员归属（与映射表衔接）

| 字段 | 说明 |
|------|------|
| `salesperson_name` / `cs_name` | 源表展示字段（快照）。 |
| `owner_employee_id` | 归因后的业务员员工 ID（强关联）。 |
| `cs_employee_id` | 客服员工 ID（若客服也计提）。 |
| `commission_role` | 本行业绩对应的提成角色（业务员/客服等）。 |
| `service_mode` | 由「客服是否有业务员」映射而来：有/无/全部。 |
| `cs_has_salesperson_flag` | 原始布尔或枚举，便于审计。 |

#### F. 数据质量与试算辅助

| 字段 | 说明 |
|------|------|
| `is_valid` | 1 正常参与；0 异常排除。 |
| `invalid_reason` | 枚举+文案：映射缺失、互斥冲突、回款率分母为 0、单号重复等。 |
| `data_source` / `source_record_id` | 溯源。 |
| `created_at` / `updated_at` / `updated_by` | 审计。 |

#### G. 规则命中留痕（规则中心上线后）

| 字段 | 说明 |
|------|------|
| `rule_code` / `rule_version` | 命中规则编码与版本（跑批后回写）。 |
| `need_commission_flag` | 是否需要核算提成（规则+回款门槛综合结果）。 |

> **说明**：截图中的「是否计算提成、计算提成值、提成分摊、最终结果」若保留在底表，建议仅作**跑批临时字段**或迁移到 `commission_calc_result` / `_detail`；权威结果以结果表为准。

---

## 11. 功能需求

### 11.1 底表生成任务

- 从 OMS/TMS/财务中台同步订单事实 → 标准化写入 `commission_order_base`。  
- 支持按 `biz_month` 全量重刷、增量同步。  
- 同步后触发：**人员归因** → **表外成本汇总回写** →（可选）**试算重算**。

### 11.2 人员归因逻辑

输入：底表行上的 `salesperson_name`、`cs_name`、`biz_month`、业务归属日 \(T\)、`customer_type`、`cs_has_salesperson_flag`。  
步骤：

1. 将 `cs_has_salesperson_flag` 映射为 `service_mode`。  
2. 用 \(T\) 在 `commission_personnel_mapping` 中匹配 `commission_role` 与 `service_mode`；得到 `owner_employee_id` / `cs_employee_id`。  
3. 匹配 0 条 → `is_valid=0`，`invalid_reason=人员映射缺失`。  
4. 匹配多条 → `is_valid=0`，`invalid_reason=人员映射不唯一`。  
5. 匹配成功 → 写入 `owner_employee_id` 等，`is_valid=1`（若金额等仍有问题可再置 0）。

### 11.3 表外成本回写

- 明细在 `offbook_cost_import_detail`；按 `biz_month + order_no (+ waybill_no)` 聚合。  
- 更新 `offbook_cost_total` 及拆分列；记录 `offbook_import_batch_no`。  
- 回写后重算：`gross_profit`、`receipt_rate` 等依赖字段。

### 11.4 与规则中心 / 试算

- 规则中心未上线：`rule_code` 等留空；`need_commission_flag` 可按**简单配置**（如回款率阈值写死在配置中心）或留空。  
- 试算上线后：试算任务读取底表 + 映射 + 规则 → 写**提成结果表**；底表可选回写 `rule_code` 便于对账。

---

## 12. 业务规则与场景（订单底表）

### 12.1 归属月 `biz_month` 取值

- 必须与财务口径一致：按「到货月 / 核销月 / 回款截止所在月」之一，**全局配置**不可混用。  
- 若一单跨月：按产品规则拆行或归主月（需唯一说明）。

### 12.2 一单多运单 / 多柜

- 若底表按运单行：每行独立 `waybill_no`；表外导入需对齐维度。  
- 若底表按订单行：需 `waybill_list` 或子表；MVP 建议按运单行降低复杂度。

### 12.3 回款率

- `receipt_rate = received_amount / receivable_amount`；`receivable_amount=0` → `receipt_rate` NULL，`is_valid=0` 或 `invalid_reason=应收为0`（按产品：可能仍要计提成则改为不校验）。  
- **是否发放提成**：阈值在规则或配置中心；底表只存事实与率。

### 12.4 净利润

- 非净利润核算业务线：`net_profit` 可为 NULL；增加 `calc_basis_type`（`GP` / `REVENUE` / `NET_PROFIT`）标记本行适用基数类型。  
- 规则中心未上线：不强制算 `net_profit`。

### 12.5 负毛利、结转

- 底表保留毛利事实即可；**负毛利策略与结转台账**在计算层/结果层处理；底表可记 `gross_profit` 供策略判断。

### 12.6 重算与差异

- 底表字段变更应生成**变更事件**（可选表），试算任务据此做 `recalc_diff`；底表本身可不存差额（存结果表）。

### 12.7 与财务 Excel 头对齐

- 已有列：运单号、到货月、核销月、计费重、件数、提单号、柜号、客户类型、业务员、客服、应收、业务员成本、毛利、实收、回款率、回款截止核算时间、是否核算、提成相关列、规则编码、销售产品、产品线、部门、客服是否有业务员。  
- **建议补**：`order_no`、`biz_month`、`owner_employee_id`、`cs_employee_id`、`service_mode`、`offbook_cost_total`、`is_valid`、`invalid_reason`、`employee_id` 类主数据键。

---

## 13. 接口建议（订单底表）

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/v1/commission/order-base` | 分页筛选：月、部门、客户类型、是否有效、员工。 |
| GET | `/api/v1/commission/order-base/{id}` | 详情。 |
| POST | `/api/v1/commission/order-base/sync` | 触发同步任务（按月）。 |
| POST | `/api/v1/commission/order-base/{id}/re-attribute` | 单条重新归因（管理员）。 |
| GET | `/api/v1/commission/order-base/export` | 导出对账。 |

---

## 14. 测试用例清单（订单底表）

1. 有业务员姓名无映射 → `is_valid=0`。  
2. 映射唯一 → 写入 `owner_employee_id`。  
3. 两条映射重叠 → `is_valid=0`。  
4. 表外导入后毛利减少 → 数值与批次一致。  
5. 回款率边界：实收=应收=100%。  
6. 应收=0 → 按规则标记异常或跳过率。  
7. `service_mode` 与「客服是否有业务员」不一致时以映射规则为准并记日志（或阻断导入）。  
8. 规则中心未上线时同步任务不崩溃，`rule_code` 为空。

---

## 15. 文档修订记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v1.0 | 2026-04-18 | 初稿：人员映射 + 订单底表详版 PRD。 |

---

## 附录 A：财务导入人员 — 匹配策略（摘要）

1. 行内 `employee_id`（或系统 ID）存在 → 调主数据 API 校验存在且在职状态一致。  
2. 否则 `account_id` / 登录名匹配。  
3. 否则 `姓名 + 部门 + 入职日期` 模糊匹配：0 或 >1 均失败。  
4. 匹配成功后写入映射表；`employee_name` 以主数据为准覆盖或预警不一致。

---

## 附录 B：与互斥组、规则 id 的边界

- **互斥组**：只出现在规则配置；底表不写互斥组。  
- **规则编码**：可在跑批后写入底表便于对账；**人员映射不强制绑 rule_id**，避免版本升级大面积改人。
