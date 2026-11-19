/* 原型内 PRD 对照：橙色序号可点击查看对应需求说明。 */
(() => {
  const script = document.currentScript;
  const page = script && script.dataset.page;
  const configs = {
    bill: {
      prd: '回款核销-最新确认补充PRD.md',
      title: '请款单管理与回款申请｜PRD 对照说明',
      items: [
        ['回款申请', '发起回款申请', '§5 回款申请 / BR-RCP-014', '仅支持按已选请款单、按运单发起；按运单需唯一带出客户和待回款请款单。'],
        ['回款协同', '回款协同', '§7 回款协同右侧抽屉', '从右侧打开，不离开列表；可查看申请明细、待补资料、待放行、已核销。'],
        ['财务放行配置', '财务放行配置', '§4 工具栏 / §6 放行与日志', '仅维护两项独立规则：自动放行比例、确认金额上下调整幅度。具体字段说明见完整 PRD。']
      ]
    },
    exception: {
      prd: '财务异常工作台-回款核销-交互PRD.html',
      title: '回款处理工作台｜PRD 对照说明',
      items: [
        ['全部', '页签、筛选、列表与数据回显（通用）', '§3、§3.1 各状态的数据进入与流转、§4、§6、§7 BR-EXC-07～08', '<strong>状态流转：</strong>自动认领异常由真实流水无法唯一认领进入；已比对待核销由预核销提交后、账单已比对但未满足实际核销条件进入；已核销由系统或财务写入实际核销后进入；待业务补资料由财务退回或疑似重复进入。<br><strong>放行：</strong>待放行审批是跨主状态待办，不是平行页签；同意放行只更新放行状态，仍需实际核销后才进入已核销。<br><strong>回显与限制：</strong>列表、详情、收款管理、凭证管理和请款单“回款协同”展示同一结果；付款账号、付款时间、收款账号只读展示，不允许在异常页直接改写原始流水或水单。'],
        ['异常列表字段与状态', '异常列表：状态与逻辑字段', '§3.1 各状态的数据进入与流转、§3.2 列表状态字段与字典口径、§4.2 列表字段、§9 水单维度补充', '异常列表一行对应一张水单；状态、金额、账户、关联单据和处理信息均归属该水单，回款申请仅用于关联与汇总。'],
        ['字段与配置来源', '状态、字段和配置来源', '《回款核销-最新确认补充PRD》§4.4', '状态由系统状态机流转；异常类型来自规则字典；异常原因由原因模板和动态参数生成；匹配时间窗口、放行比例、金额调整幅度和币种精度来自配置。'],
        ['查询数据', '查询与筛选', '§4 筛选与列表字段', '按当前筛选条件刷新本页任务与页签条数；重置后恢复默认条件。页签条数按当前登录人数据权限与任务当前状态统计。'],
        ['查看水单', '查看水单', '§5 工具栏与弹窗', '打开业务上传水单、AI 识别原始值与业务确认值；只读查看，原始文件和识别结果不被后续处理覆盖。'],
        ['查看真实流水', '查看真实流水', '§5 工具栏与弹窗 / §7 BR-EXC-07', '打开同一真实流水的凭证金额、付款主体、付款账户、到账时间和关联结果；数据来自凭证/收款管理。'],
        ['重新匹配', '重新匹配', '§5 工具栏与弹窗 / §7 BR-EXC-02', '选中待处理记录后不弹窗、不选择范围，直接按完整匹配条件执行；开始后进入重新匹配中并写日志。'],
        ['指派处理人', '指派处理人', '§5 工具栏与弹窗', '仅可指派给有财务收款权限的人员；保存新处理人、指派人和时间，不改变原始流水与核销记录。'],
        ['退回业务补资料', '退回业务补资料', '§5 工具栏与弹窗 / §7 BR-EXC-05', '必须选择退回原因；任务转入“待业务补资料”，业务员在请款单管理的“回款协同”补传水单和付款备注后重新提交。'],
        ['人工确认认领', '人工确认认领', '§5 工具栏与弹窗 / §7 BR-EXC-02A', '财务可调整付款主体、付款账号、付款时间、收款账号、金额和币别；保存后重新执行自动认领与自动核销校验。'],
        ['人工确认核销', '人工确认核销', '§5 工具栏与弹窗 / §7 BR-EXC-03', '当前版本保留在回款处理工作台完成；仅处理“已比对待核销”记录，展示真实流水、关联账单和费用项，处理说明必填。是否迁移到收款管理列入评审项。'],
        ['审批客户放行', '审批客户放行', '§5 工具栏与弹窗 / §7 BR-EXC-04', '“待放行审批”是跨主状态的财务待办。可点击顶部“待放行审批”筛出后选中审批；审批只更新放行状态，记录保留在原主状态，直至实际核销完成。'],
        ['退回业务确认重复', '退回业务确认重复', '§5 工具栏与弹窗 / §8 AC-EXC-06', '疑似重复不再关闭记录；退回业务补资料池，由业务员撤销本次申请或补充资料后重新提交。原始流水、水单、关联关系和历史日志继续保留可查。'],
        ['导出', '导出', '§5 工具栏与弹窗', '按当前筛选结果与数据权限导出；不因导出改变任务状态、认领、核销或放行结论。'],
        ['操作日志', '操作日志', '§6 详情与操作日志 / §7 BR-EXC-07', '按异常任务、回款申请和真实流水聚合展示打回、认领、预核销、人工核销、审批放行、标记重复等日志；历史只追加不可覆盖。']
      ]
    }
  };
  const modalRuleDetails = {
    repayPrewriteoffMask: {
      '回款申请': '<h4>前端关注</h4><ul><li>这是独立弹窗编号，不继承请款单页面的编号；关闭、取消均不保存草稿。</li><li>按已选请款单、按运单两种方式切换时，关联单据和校验条件同步刷新。</li></ul><h4>后端关注</h4><ul><li>创建回款申请草稿时，保存发起方式、客户和关联请款单快照。</li></ul><h4>场景与结果</h4><ul><li>弹窗中的所有水单、确认值和操作仅属于本次回款申请。</li></ul>',
      '水单文件': '<h4>列表字段与交互</h4><ul><li>单次回款申请最多上传 10 张水单；本次已上传后再次添加也不得超过 10 张，超出整批拒绝并提示。</li><li>列表逐行展示并维护：勾选框、文件名、AI 识别金额（只读）、确认金额（默认等于识别金额、可编辑）、付款时间及来源（系统只读）、付款账户、我方收款账户、账户匹配结果和移除操作。</li><li>同一申请内，AI 识别金额和付款时间都相同的水单标记“疑似重复”；只提示业务核对，不拦截提交。</li><li>表头提供全选；提交预核销前必须勾选全部已上传水单，替代原“我已核对全部水单”的总复选框。</li><li>付款账户、我方收款账户均非必填；显示“已识别”时禁用输入框，不允许业务改写识别结果；显示“未识别”时允许手输，保存后立即重新匹配，匹配成功即切换为已识别并禁用。</li><li>付款时间不可手输或编辑；识别错误只能替换水单重新识别。水单列表下方不再展示“当前水单确认金额”“当前水单付款时间”或重复的账户合并区。</li></ul><h4>后端关注</h4><ul><li>每张水单保存文件 ID、版本、AI 原始金额、确认金额、付款时间和来源、付款/收款账户原值与匹配结果、勾选确认标记。</li><li>保存疑似重复标记及比对键（AI 识别金额、付款时间）。该标记不参与自动认领、自动核销和放行判断。</li><li>AI 原始值不可覆盖；确认金额、账户保存为业务确认值及前后值日志。付款时间只保存 AI 识别或系统上传来源；候选真实流水必须落在付款时间后 48 小时内。</li><li>账户为空可提交；付款主体和付款账户不匹配时不得自动认领。我方收款账户、付款时间或金额不满足时不得自动核销。</li><li>确认金额相对识别金额的绝对差值不得超过财务配置；校验按单张水单执行。</li></ul><h4>测试关注</h4><ul><li>上传 1、10、11 张及分批累计超过 10 张；移除后合计重算。</li><li>两张水单 AI 识别金额和付款时间相同时均显示疑似重复，仍可勾选并提交；仅金额或仅时间相同不得提示。</li><li>识别金额和付款时间只读；确认金额默认回填、范围内外修改；已识别账户禁用、未识别账户可编辑且匹配成功后立即禁用。</li><li>全选、取消全选、部分勾选均正确；部分勾选时提交被拦截。</li></ul>',
      '水单合计金额': '<h4>前端关注</h4><ul><li>只读展示各水单确认金额之和，不允许直接输入总额。</li></ul><h4>后端关注</h4><ul><li>保存单张金额和汇总金额；任一单张修改超过财务配置幅度时拒绝提交。</li></ul><h4>场景与结果</h4><ul><li>合计用于账单匹配和放行判断；不等于账单金额时不得自动核销。</li></ul>',
      '当前水单付款时间': '<h4>前端关注</h4><ul><li>该字段已从回款申请弹窗的编辑区移除；付款时间仅在水单列表只读展示，并同时展示来源。</li></ul><h4>后端关注</h4><ul><li>仅保存水单识别或系统上传时间来源；回款申请业务端不得写入业务确认时间。</li></ul><h4>场景与结果</h4><ul><li>水单无付款时间时由系统取该水单上传时间；识别错误时替换水单重新识别，不能手工改时间。</li></ul>',
      '当前水单付款账户': '<h4>前端关注</h4><ul><li>当前字段只维护当前水单；前四位和后四位命中客户付款账户时显示已匹配。</li></ul><h4>后端关注</h4><ul><li>按单张保存付款账户确认值和匹配结果；新增账户只回填当前水单。</li></ul><h4>场景与结果</h4><ul><li>多张水单中任一付款账户未匹配时，不可自动核销。</li></ul>',
      '当前水单我方收款账户': '<h4>前端关注</h4><ul><li>按当前水单显示并核对我方收款账户。</li></ul><h4>后端关注</h4><ul><li>按前四位和后四位匹配财务收款账户；匹配结果保存到对应水单。</li></ul><h4>场景与结果</h4><ul><li>任一水单我方收款账户未匹配时，进入待处理，不自动核销。</li></ul>',
      'AI 水单识别结果': '<h4>前端关注</h4><ul><li>展示当前水单的 AI 原始结果、时间来源和置信度；切换水单时同步切换。</li><li>付款时间为系统只读，不提供业务修改入口；识别错误时通过替换水单重新识别。</li></ul><h4>后端关注</h4><ul><li>AI 原始结果不可覆盖，确认金额和账户等业务编辑值另存并留痕；付款时间仅保存识别或系统上传来源。</li></ul><h4>场景与结果</h4><ul><li>识别缺失或不正确时，业务可修正确认金额、账户等字段；付款时间识别错误只能换水单。真实流水仅在该时间后 48 小时内参与自动认领。</li></ul>',
      '提交预核销': '<h4>前端关注</h4><ul><li>提交前校验同客户、当前用户客户权限、关联账单状态为待支付、至少一张水单、全部水单已勾选、每张确认金额在配置范围内。</li><li>付款备注随申请提交；账户允许为空或未识别，但页面必须明确展示无法自动匹配的结果。</li></ul><h4>后端关注</h4><ul><li>原子保存回款申请、关联待支付请款单快照、付款备注、每张水单确认值和操作日志，再触发自动认领、账单比对与自动核销。</li><li>自动认领和自动核销不得读取部分付款请款单；重复提交必须返回同一申请结果，不能创建重复水单或核销记录。</li></ul><h4>测试关注</h4><ul><li>全量条件满足时写已核销；账户未匹配、金额不等、请款单部分付款、跨客户或越权客户时均不得自动核销。</li><li>提交失败保留已输入付款备注、确认金额、账户和勾选状态，便于修正后重试。</li></ul>'
    }
  };
  /* 回款申请弹窗标题序号：集中说明关联请款单的带出、去重及提交后的流转。 */
  modalRuleDetails.repayPrewriteoffMask['回款申请'] += '<h4>带出请款单与去重</h4><ul><li><b>按已选请款单：</b>仅允许同一客户的多张请款单一起发起；跨客户禁止提交。</li><li><b>按客户：</b>选择客户后带出该客户已到期、可参与的请款单。</li><li><b>按运单：</b>支持输入多个运单，只带出输入运单对应费用项；带出多个客户时不能合并提交。</li><li><b>去重规则：</b>以“运单 + 费用项 + 金额 + 币种”完全一致判定重复。完全一致只展示最新一张、结算金额只累计一次；任一项不同则均带出，部分交叉不得误去重。</li></ul><h4>提交后的流转</h4><ul><li>切换发起方式、带出账单、上传/移除水单、编辑确认金额或账户均是草稿操作，不创建申请、不改变账单或客户状态。</li><li>点击<b>提交预核销</b>后，原子保存申请、去重账单快照和每张水单处理记录；先按付款主体和付款账户确认客户，不锁金额、不绑定真实流水。</li><li>客户无法唯一确认进入自动认领异常；客户已确认后，真实流水、金额、币种、账单与费用项由财务审核/核销阶段继续比对。</li><li>勾选申请放行时，按申请下全部水单确认金额合计与关联已到期未结算账单金额计算；达到比例自动放行，否则生成待放行审批。放行不等于核销。</li><li>取消、关闭或 Esc 且未提交时不保存、不写业务日志。</li></ul><p><b>完整 PRD：</b>5.1、5.1.1、5.2、5.4.1。</p>';
  const cfg = configs[page];
  if (!cfg) return;
  let nextPointNo = 1;
  const pointNos = new WeakMap();
  function pointNoFor(target) {
    if (!pointNos.has(target)) pointNos.set(target, nextPointNo++);
    return pointNos.get(target);
  }
  const guideDetails = {
    bill: {
      '回款申请': '<h4>发起、权限与关联账单</h4><ul><li><b>发起方式：</b>支持按已选请款单、按客户、按运单发起；按运单可输入多个运单号，系统只带出同一客户的请款单。</li><li><b>同客户校验：</b>同一次申请只能关联一个客户。多个运单或多张请款单带出不同客户时，禁止提交并说明冲突客户；同一客户的多张请款单允许一起申请。</li><li><b>数据权限：</b>业务员仅可选择本人业务员字段对应的客户，客服仅可选择本人客服字段对应的客户，结算员仅可选择本人结算员字段对应的客户；前端只做提示，后端必须按主页面客户数据权限再次校验。</li><li><b>可匹配账单：</b>自动认领和自动核销只取请款单状态为“待支付”的记录；“部分付款”和“已结清”不得带入申请、匹配或自动核销。</li></ul><h4>前端关注</h4><ul><li>关联请款单列表上方展示付款备注，可输入不超过 200 字；随申请提交并在申请明细、日志回显。</li><li>水单合计由每张水单的确认金额汇总，只读；“提交预核销”为必经动作，“是否申请放行”为可选动作。</li><li>提交时校验：已关联账单、同一客户、客户权限、至少一张水单、全部水单已在列表勾选、确认金额未超配置幅度。</li></ul><h4>后端关注</h4><ul><li>保存申请号、发起方式、客户、关联请款单快照、付款备注及数据权限校验结果；重复提交必须幂等。</li><li>账单去重按运单+费用项+金额+币种；自动认领、账单比对和自动核销均以“待支付”账单快照为准。</li></ul><h4>测试关注</h4><ul><li>多运单同客户可提交；多运单跨客户、跨权限客户、选中部分付款账单均被拦截。</li><li>同客户多请款单可提交；付款备注为空可提交、超过 200 字不可提交。</li><li>匹配成功写已核销；任一自动条件不满足只写预核销并进入相应处理状态，不能提前写实际核销。</li></ul>',
      '回款协同': '<h4>申请明细筛选</h4><ul><li><b>客户：</b>按客户简称模糊匹配；空值查询当前权限范围内全部申请。</li><li><b>运单号：</b>按申请关联运单号模糊匹配；通过申请—请款单—运单关系查询，不要求填写完整单号。</li><li><b>申请时间：</b>开始日期和结束日期均可为空；均填写时按申请创建时间（北京时间）闭区间过滤。</li><li>客户、运单号、申请时间与当前页签叠加生效；输入或变更条件后刷新列表和当前结果条数，不改变申请状态。</li></ul><h4>前端关注</h4><ul><li>从右侧抽屉打开，不离开请款单列表；展示申请明细、待补资料、待放行、已核销。</li><li>待补资料时展示退回原因、补传水单、付款备注及重新提交按钮；原水单和原识别结果可追溯。</li></ul><h4>后端关注</h4><ul><li>查询必须使用当前登录人客户数据权限；申请明细返回申请号、客户、关联请款单、关联运单、申请时间、付款备注、状态、退回原因和处理进度。</li><li>重新提交创建新处理批次并关联原退回记录，不能覆盖原水单或历史日志。</li></ul><h4>测试关注</h4><ul><li>三种筛选单独、组合、空结果、边界日期和无权限客户均正确。</li><li>待补资料、待放行、已核销页签与筛选条件组合后，列表、详情和数量一致。</li></ul>',
      '财务放行配置': '<h4>字段一：自动放行比例</h4><ul><li><b>含义：</b>水单确认金额 ÷ 到期未结算账单金额的最低通过比例。</li><li><b>配置：</b>财务维护，初始值 100%，取值 1～100 的整数。</li><li><b>结果：</b>比例达到或超过配置值时自动放行；比例低于配置值时进入待放行审批，由财务人工复核。</li></ul><h4>字段二：水单确认金额可上下调整幅度</h4><ul><li><b>含义：</b>确认金额相对 AI 识别金额允许向上或向下调整的最大金额。</li><li><b>配置：</b>财务按金额维护，最大绝对差值不得超过配置值。</li><li><b>结果：</b>识别金额只读，确认金额单独编辑；超出幅度时禁止提交并提示原因。</li></ul><h4>通用规则</h4><ul><li>两项配置分别生效，不能互相替代；配置变更需记录维护人、时间和前后值，历史申请保留当时的规则快照。</li><li>页面只展示配置入口和当前值，具体字段口径、计算公式、状态流转和验收条件以完整 PRD 为准。</li></ul>'
    },
    exception: {
      '全部': '<h4>状态数据怎么进来、怎么流转</h4><ul><li><b>自动认领异常：</b>真实流水到达后无法唯一认领至客户或回款申请，例如多候选、付款方缺失、账户不匹配；重新匹配/人工认领后继续账单比对。</li><li><b>已比对待核销：</b>预核销已提交、账单已比对但未满足实际核销条件时进入；财务人工核销后转已核销，退回后转待业务补资料。</li><li><b>待放行审批：</b>业务勾选申请放行但未达到门槛时生成，只是跨主状态待办；同意仅更新已放行，仍需满足实际核销条件。</li><li><b>已核销：</b>系统自动核销或财务人工确认核销成功后进入，回写请款单、收款管理、凭证管理和回款协同。</li><li><b>待业务补资料：</b>财务退回、资料不全或疑似重复时进入；业务补资料后创建新处理批次重新比对，原记录和日志保留。</li></ul><h4>前后端共用约束</h4><ul><li>全部只是汇总视图，不是状态；主页签按当前主状态互斥统计。</li><li>付款账号、付款时间、收款账号均来自真实流水，只读展示；付款账号按前四位+后四位匹配，我方收款账号按后四位匹配。</li><li>以回款申请号、真实流水号、请款单号、核销记录 ID 关联同一对象；不设置已关闭状态。</li></ul>',
      '异常列表字段与状态': '<h4>列表维度</h4><ul><li><b>一行一张水单：</b>水单是财务处理最小单元；列表新增水单编号。回款申请单只用于归集同一次申请下的多张水单、关联账单和处理进度。</li><li><b>一张水单与一笔流水：</b>默认一一对应；匹配前可无流水或有多个候选，最终确认后同一真实流水不能认领给其他水单。</li></ul><h4>状态字段</h4><ul><li><b>异常阶段：</b>当前水单主处理阶段，决定归属哪个主页签；系统枚举，不允许手工维护。</li><li><b>异常类型：</b>最近一次自动匹配或比对失败原因；系统规则枚举，不是财务可任选的普通字典。</li><li><b>放行状态：</b>未申请放行、未达放行条件、待放行审批、已放行；独立于核销状态，审批同意不等于已核销。</li><li><b>处理状态：</b>待处理、重新匹配中、待业务补资料、已处理，说明待办进度和责任人，不替代核销结果。</li></ul><h4>异常阶段怎么进入、怎么流转</h4><ul><li><b>自动认领异常：</b>当前水单无法唯一认领到真实流水/客户时进入，例如多候选、付款主体缺失、账户未识别。财务重新匹配或人工确认认领后，认领成功则继续账单比对；核销条件同时满足直接转<b>已核销</b>，否则转<b>已比对待核销</b>；无法确认则转<b>待业务补资料</b>。</li><li><b>已比对待核销：</b>当前水单已完成认领和账单/流水比对，但金额、币种、费用项分配等核销条件不满足时进入。财务人工分配费用项后，全部核销转<b>已核销</b>；资料不足转<b>待业务补资料</b>。该阶段不再做人工确认认领。</li><li><b>已核销：</b>当前水单自动核销成功，或财务完成费用项人工核销后进入；为实际核销完成结果，只读查看账单校验和完整日志。</li><li><b>待业务补资料：</b>财务退回、资料缺失或疑似重复时进入。业务在回款协同补传资料并重新提交后，必须新建该水单的处理批次，再重新走认领与比对；原批次保留可查。</li><li><b>待放行审批：</b>不是异常阶段或主页签。业务申请放行但未达门槛时，作为跨主状态财务待办出现；审批通过仅把放行状态改为<b>已放行</b>，当前水单仍停留原异常阶段，直到实际核销完成。</li></ul><h4>金额、账户与关联字段</h4><ul><li><b>真实流水号、付款主体、付款账号、付款时间、收款账号、币别、真实到账金额：</b>来自凭证/收款管理的真实流水，只读；付款账号按前四后四匹配客户账户，我方收款账号按后四位匹配。</li><li><b>关联账单金额、关联运单/请款单：</b>来自预核销和费用项关联。金额差异、多账单/费用项无法唯一分配时，不自动核销。</li><li><b>异常原因、建议处理：</b>系统按规则生成，财务处理时作为参考，不替代最终处理依据。</li></ul><h4>审计字段</h4><ul><li><b>处理人、创建时间：</b>来自异常任务和日志；重新匹配、退回、认领、核销、放行均追加日志，不覆盖原始流水、水单和历史处理记录。</li></ul>',
      '字段与配置来源': '<h4>状态来源</h4><ul><li>主处理状态由后端状态机流转；放行状态由放行申请和审批动作更新；“全部”只是汇总视图。</li><li>异常类型来自匹配规则编码；异常原因由原因模板和本次金额、币种、账户、候选数等动态参数生成；建议处理由类型与状态映射生成。</li></ul><h4>字段来源</h4><ul><li>回款编号来自回款申请；水单编号来自上传水单处理记录；真实流水、金额、账户和到账时间来自凭证/收款管理；请款单、运单、费用项来自账单数据。</li><li>原始值只读保存，财务人工调整值另存并写日志；处理说明不能覆盖系统异常原因。</li></ul><h4>配置项</h4><ul><li>48 小时匹配窗口、放行比例（初始 100%）、水单付款金额可调整幅度、币种精度由规则配置/字典维护。</li><li>异常类型、退回原因、重复确认原因和放行结论使用固定字典值；动态异常原因不由财务手工选择。</li></ul><h4>核销入口</h4><p>当前版本“人工确认核销”仍在回款处理工作台完成；是否迁移到收款管理列入评审项。</p>',
      '查询数据': '<h4>前端关注</h4><ul><li>按客户、申请号、流水号、运单、时间、处理状态、放行状态等条件组合查询；重置恢复默认。</li><li>查询后同步刷新当前列表和各主页签条数；无结果显示空态。</li></ul><h4>后端关注</h4><ul><li>查询必须按当前用户的数据权限过滤；分页、排序和条数使用同一筛选条件。</li></ul><h4>场景与结果</h4><ul><li>财务可按客户汇总已比对待核销水单，选择多笔进行后续核销。</li><li>业务员不能通过筛选看到非本人权限客户。</li></ul>',
      '查看水单': '<h4>前端关注</h4><ul><li>只读展示水单文件预览、AI 原始识别值、业务确认值及差异标记。</li><li>付款时间需同时展示时间值和来源：水单识别或上传时间。</li></ul><h4>后端关注</h4><ul><li>文件、AI 原始结果、人工确认值分开保存并带版本；后续处理不得覆盖原始值。</li></ul><h4>场景与结果</h4><ul><li>水单缺失、不清晰或确认值不足时，财务退回业务补资料。</li></ul>',
      '查看真实流水': '<h4>前端关注</h4><ul><li>只读展示真实到账金额、付款方/付款账号、我方收款账号、到账时间、摘要和流水号。</li><li>与业务水单的账户、金额、币种差异需明显标记。</li></ul><h4>后端关注</h4><ul><li>数据来源为凭证/收款管理；异常页不得修改银行原始流水。</li></ul><h4>场景与结果</h4><ul><li>流水不存在、账号不匹配或金额不匹配时，不能自动认领或自动核销。</li></ul>',
      '重新匹配': '<h4>前端关注</h4><ul><li>需先选中记录，再选择“按付款方+金额+币种”或“仅真实流水”重新匹配范围。</li><li>提交中禁用重复点击；完成后回显最新候选、状态和日志。</li></ul><h4>后端关注</h4><ul><li>重新匹配只读取原始流水和人工确认值；任务需幂等，避免重复生成核销记录。</li></ul><h4>场景与结果</h4><ul><li>财务人工确认账户或金额后触发重新匹配；全匹配则自动核销，否则继续保留在对应待办。</li></ul>',
      '指派处理人': '<h4>前端关注</h4><ul><li>仅显示具备财务收款权限的可指派人员；保存前展示当前处理人与新处理人。</li></ul><h4>后端关注</h4><ul><li>保存指派人、被指派人、时间和原因；只改变处理责任，不改变流水、放行或核销状态。</li></ul><h4>场景与结果</h4><ul><li>认领异常长期未处理或需出纳核验账户/金额时，指派指定财务继续处理。</li></ul>',
      '退回业务补资料': '<h4>前端关注</h4><ul><li>退回原因必选；支持水单不清晰、账户无法确认、金额差异、关联单据不完整、疑似重复等值。</li><li>提交后列表状态改为待业务补资料，处理人回显业务员。</li></ul><h4>后端关注</h4><ul><li>保存退回原因、退回人、时间和原处理批次；不删除流水、水单和日志。</li></ul><h4>场景与结果</h4><ul><li>业务补传水单和备注后创建新批次重新比对；业务不处理则一直保留在其待办池。</li></ul>',
      '人工确认认领': '<h4>前端关注</h4><ul><li>仅自动认领异常可操作；可调整付款主体、付款账号、付款时间、收款账号、金额和币别，保存时六项均必填。</li><li>保存后显示重新匹配结果：已核销、已比对待核销或仍待处理。</li></ul><h4>后端关注</h4><ul><li>原始流水、水单 AI 原始值、业务确认值不可覆盖；人工调整值、前后差异、原因、操作人和时间单独保存。</li><li>保存后复用自动认领与自动核销规则，处理过程需幂等，防止重复写入核销记录。</li></ul><h4>场景与结果</h4><ul><li>认领和核销均满足：系统自动写已核销并同步回写。</li><li>仅认领满足：进入已比对待核销；认领仍不满足：保留待处理。</li></ul>',
      '人工确认核销': '<h4>前端关注</h4><ul><li>仅已比对待核销记录可操作；展示待核销账单、拟核销金额、差异和费用项选择。</li><li>批量操作需先按客户筛选，并限制同客户、同币种的数据。</li></ul><h4>后端关注</h4><ul><li>支持多水单核销一账单、一码单核销多账单；金额分配、部分核销需原子保存并写日志。</li><li>无可匹配账单的到账款不得在此页核销，应进入客户余额并由指定票件收款处理。</li></ul><h4>场景与结果</h4><ul><li>客户多次付款累计满足账单后，财务可一次勾选多张水单和账单批次完成核销。</li></ul>',
      '审批客户放行': '<h4>前端关注</h4><ul><li>点击顶部待放行审批筛出跨主状态待办；选中记录后回显水单、真实流水和关联账单差异，并启用审批按钮。</li><li>审批弹窗展示实收、关联账单金额、实际核销状态；必须填写审批说明，并选择“同意放行”或“退回业务补资料”。</li></ul><h4>后端关注</h4><ul><li>同意放行仅更新放行状态、审批人和日志，不自动写实际核销。</li><li>退回时状态转待业务补资料、处理人改为业务员；必须校验记录仍为待放行审批，防止并发重复审批。</li></ul><h4>场景与结果</h4><ul><li>金额未达门槛但业务主动申请放行时，由财务审批；同意后记录仍保留原主页签，退回后进入业务员待办池。</li></ul>',
      '退回业务确认重复': '<h4>前端关注</h4><ul><li>选择疑似与已有申请重复或疑似与真实流水重复后，展示“退回业务确认”而非关闭。</li></ul><h4>后端关注</h4><ul><li>状态统一转待业务补资料，业务员可撤销申请或补充说明重提；不可删除原始资料和历史日志。</li></ul><h4>场景与结果</h4><ul><li>不设置已关闭或重开；业务未处理时记录一直挂在业务池，不再占财务待办。</li></ul>',
      '导出': '<h4>前端关注</h4><ul><li>导出当前筛选结果，提示数据范围和生成状态；无数据时不可提交。</li></ul><h4>后端关注</h4><ul><li>导出使用同一权限和筛选条件，不得因导出更新处理状态、核销或放行结果。</li></ul><h4>场景与结果</h4><ul><li>财务可导出某客户或某处理状态的待办，作为线下核验辅助材料。</li></ul>',
      '操作日志': '<h4>前端关注</h4><ul><li>按时间倒序展示操作时间、操作人/系统、动作、前后状态、原因/备注；只读。</li></ul><h4>后端关注</h4><ul><li>日志追加写入，不允许覆盖；关联申请、流水、请款单和核销记录。</li></ul><h4>场景与结果</h4><ul><li>需追溯上传、AI 识别确认、预核销、放行、认领、人工确认值、重新匹配、核销、退回和撤销。</li></ul>'
    }
  };
  if (page === 'bill') {
    guideDetails.bill['回款申请'] += '<h4>自动核销最新口径</h4><ul><li><b>账单集合：</b>当前客户全部状态为“待支付”的请款单；部分付款、已结清、作废账单必须排除。</li><li><b>金额判断：</b>水单确认金额大于或等于全部待支付请款单待结算金额，且其他自动条件满足时自动全核；超出部分自动转客户余额并留痕。金额小于待结算金额时进入已比对待核销，由财务人工核销。</li><li><b>凭证排除：</b>手工新增凭证不得进入自动认领、重新匹配或自动核销候选，只能在现网收款管理人工处理。</li></ul>';
    guideDetails.bill['回款协同'] += '<h4>状态展示</h4><ul><li>申请明细不再展示“主申请单状态”，改为并列的<b>预核销状态</b>和<b>放行状态</b>。</li><li>预核销状态来自水单处理结果汇总；放行状态来自申请单放行记录。两者可独立组合，例如“已比对待核销 + 待放行审批”。</li></ul>';
  }
  if (page === 'exception') {
    guideDetails.exception['全部'] += '<h4>核销场景：一张水单核销多个账单</h4><ol><li>先判断当前水单能否唯一认领到真实流水和客户；无法唯一认领才进入<b>自动认领异常</b>。</li><li>认领成功后，对比该流水金额与多个账单/费用项合计；水单确认金额大于或等于当前客户全部待支付请款单待结算金额且分配唯一时，系统自动核销并进入<b>已核销</b>。</li><li>金额小于待结算金额或无法唯一分配时，进入<b>已比对待核销</b>；财务在收款管理使用当前水单对应的真实流水进行人工分配。</li></ol><h4>统一限制</h4><ul><li>手工新增凭证不进入自动认领、重新匹配和自动核销候选池。</li><li>超出待结算金额的部分自动转客户余额；不可跨客户、付款主体或币种。</li></ul>';
    guideDetails.exception['异常列表字段与状态'] += '<h4>新增列表字段</h4><ul><li><b>业务员、客服：</b>来自回款申请关联客户主数据，只读回显。</li><li><b>提交人：</b>来自回款申请创建人，只读回显。</li></ul>';
    guideDetails.exception['指派处理人'] = '<h4>候选来源与权限</h4><ul><li>候选人取自<b>员工管理</b>，仅展示部门为<b>收入管理</b>的在职员工；离职、停用、其他部门员工不显示。</li><li>前端下拉仅用于展示；后端保存时必须以员工 ID 校验在职状态和部门，校验失败不得覆盖原处理人。</li></ul><h4>保存与测试</h4><ul><li>保存指派前后处理人、指派人、指派时间和回款编号到操作日志；不改变水单、流水、预核销或放行状态。</li><li>测试在职收入管理人员、非收入管理人员、离职人员、并发指派及无权限用户。</li></ul>';
  }
  const style = document.createElement('style');
  style.textContent = '.prd-pin{position:fixed!important;z-index:9991;display:inline-flex!important;align-items:center;justify-content:center;width:18px!important;height:18px!important;min-width:18px!important;border:0!important;border-radius:50%!important;background:#f08a00!important;color:#fff!important;font-size:10px!important;font-weight:800!important;line-height:1!important;padding:0!important;margin:0!important;cursor:pointer!important;box-shadow:0 1px 2px rgba(157,82,0,.3)!important}.prd-pin:focus{outline:2px solid #ffe0a6!important;outline-offset:2px}.prd-pin.prd-pin-disabled{background:#9aa5b1!important;color:#eef2f6!important;opacity:.5!important;cursor:not-allowed!important;box-shadow:none!important}.prd-guide{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(16,35,59,.45);padding:24px}.prd-guide.show{display:flex}.prd-guide-card{width:min(650px,calc(100vw - 32px));max-height:calc(100vh - 48px);overflow:auto;background:#fff;border-radius:12px;box-shadow:0 18px 48px rgba(0,0,0,.25)}.prd-guide-head{display:flex;align-items:center;gap:12px;padding:18px 22px;border-bottom:1px solid #edf0f4;font-size:20px;font-weight:800;color:#1e2e40}.prd-guide-close{margin-left:auto;border:1px solid #2d78cf;background:#fff;color:#2d78cf;border-radius:5px;padding:7px 14px;cursor:pointer}.prd-guide-body{padding:18px 28px 24px;color:#3d4a57;font-size:15px;line-height:1.75}.prd-guide-ref{display:inline-block;background:#edf5ff;color:#2875c6;border-radius:4px;padding:2px 9px;margin-bottom:10px;font-size:13px}.prd-guide-detail{margin-top:14px;padding-top:6px;border-top:1px solid #edf0f4}.prd-guide-detail h4{margin:12px 0 4px;color:#1762bd;font-size:14px}.prd-guide-detail ul{margin:4px 0 10px;padding-left:20px}.prd-guide-detail li{margin:3px 0}.prd-guide-body a{color:#2875c6;font-weight:700;text-decoration:none}.prd-guide-bar{position:fixed;right:18px;bottom:18px;z-index:9990;background:#fff5e5;border:1px solid #f4b34c;color:#9c5700;border-radius:6px;padding:7px 10px;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.12)}';
  document.head.appendChild(style);

  if (page === 'exception') {
    const counts = { '全部': 7, '自动认领异常': 2, '已比对待核销': 2, '已核销': 2, '待业务补资料': 1 };
    const status = document.querySelector('.status');
    if (status) [...status.children].forEach(tab => {
      const name = tab.textContent.trim();
      if (Object.prototype.hasOwnProperty.call(counts, name)) {
        tab.dataset.prdCount = counts[name];
        tab.classList.add('prd-tab-count');
      }
    });
    const countStyle = document.createElement('style');
    countStyle.textContent = '.status .prd-tab-count{white-space:nowrap}.status .prd-tab-count::after{content:attr(data-prd-count);display:inline-flex;align-items:center;justify-content:center;min-width:17px;height:17px;margin-left:5px;padding:0 4px;border-radius:10px;background:#e9f2ff;color:#1762bd;font-size:11px;font-weight:800;line-height:17px;vertical-align:middle}.status .prd-tab-count[style*="color: rgb(23, 98, 189)"]::after{background:#1762bd;color:#fff}';
    document.head.appendChild(countStyle);
  }

  const overlay = document.createElement('div');
  overlay.className = 'prd-guide';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = '<div class="prd-guide-card"><div class="prd-guide-head"><span class="prd-guide-name"></span><button type="button" class="prd-guide-close">关闭</button></div><div class="prd-guide-body"></div></div>';
  document.body.appendChild(overlay);
  const hint = document.createElement('div');
  hint.className = 'prd-guide-bar';
  hint.textContent = '橙色编号：点击查看 PRD 说明';
  document.body.appendChild(hint);
  const close = () => overlay.classList.remove('show');
  overlay.addEventListener('click', e => { if (e.target === overlay || e.target.closest('.prd-guide-close')) close(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });

  function openGuide(item, no) {
    overlay.querySelector('.prd-guide-name').textContent = item[1];
    const ownId = '统一清单：' + (page === 'bill' ? 'UI-BILL-' : 'UI-EXC-') + String(no).padStart(2, '0');
    const detail = guideDetails[page]?.[item[0]] || '<p>详细字段、数据来源、校验、状态流转和验收条件请查看完整 PRD。</p>';
    overlay.querySelector('.prd-guide-body').innerHTML = '<span class="prd-guide-ref">' + ownId + ' · PRD 位置：' + item[2] + '</span><div class="prd-guide-detail">' + detail + '</div><p style="margin:14px 0 0"><a href="' + cfg.prd + '" target="_blank">打开完整 PRD</a>' + (page === 'bill' ? '　<a href="请款单管理-回款申请-交互PRD.html" target="_blank">打开历史交互 PRD</a>' : '') + '</p>';
    overlay.classList.add('show');
    overlay.querySelector('.prd-guide-close').focus();
  }
  function textOf(el) { return el.textContent.trim().replace(/\s+/g, ' ').replace(/[＊*]/g, '').trim(); }
  function isVisible(root) {
    const style = window.getComputedStyle(root);
    const rect = root.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
  }
  const modalSpecialLabels = {
    repayPrewriteoffMask: ['水单文件', '提交预核销', '申请放行'],
    repayConfigMask: [],
    repayAccountAddMask: ['保存并匹配'],
    mask: ['确认处理'],
    repayCoordDrawerMask: ['重新提交']
  };
  function getModalTargets(root) {
    const header = root.querySelector('.modal-hd h3,.drawer-hd h3,.mh,#mtitle,.drawer-head h3');
    const special = modalSpecialLabels[root.id] || [];
    const targets = [...root.querySelectorAll('.form-row > label,.modal-bd > label,.drawer-body > label,.modal-ft button,.foot button,.drawer-body button')]
      .filter(el => special.some(label => textOf(el).includes(label)));
    return [header, ...targets].filter((el, index, list) => el && textOf(el) && list.indexOf(el) === index);
  }
  function openModalGuide(root, target, no) {
    const title = textOf(target);
    const ownId = '统一清单：UI-' + (page === 'bill' ? 'BILL-' : 'EXC-') + String(no).padStart(2, '0');
    const detail = modalRuleDetails[root.id]?.[title] || '<p style="margin:0;color:#667085">详细字段、数据来源、校验、状态流转和验收条件已整理到完整 PRD。</p>';
    overlay.querySelector('.prd-guide-name').textContent = title;
    overlay.querySelector('.prd-guide-body').innerHTML = '<span class="prd-guide-ref">' + ownId + ' · 弹窗说明</span>' + detail + '<p style="margin:14px 0 0"><a href="' + cfg.prd + '" target="_blank">打开完整 PRD</a>' + (page === 'bill' ? '　<a href="请款单管理-回款申请-交互PRD.html" target="_blank">打开历史交互 PRD</a>' : '') + '</p>';
    overlay.classList.add('show');
    overlay.querySelector('.prd-guide-close').focus();
  }
  function findTarget(label) {
    if (label === '异常列表字段与状态') {
      return document.querySelector('.page > .gridwrap');
    }
    return [...document.querySelectorAll('button,span,b,strong,label,.phead,.title,.status > *')].find(el => !el.closest('.mask,.drawer-mask,.repay-coord-mask,.prd-guide') && !el.dataset.prdPinned && el.textContent.trim().replace(/\s+/g, ' ').includes(label));
  }
  function layoutPins() {
    const modalOpen = [...document.querySelectorAll('.mask,.drawer-mask,.repay-coord-mask')].some(isVisible);
    document.body.classList.toggle('prd-modal-open', modalOpen);
    document.querySelectorAll('.prd-pin').forEach(pin => {
      const target = pin._prdTarget;
      if (!target || !target.isConnected) return;
      const isModalPin = pin.dataset.prdScope === 'modal';
      const root = pin._prdModal;
      const targetStyle = window.getComputedStyle(target);
      const targetVisible = targetStyle.display !== 'none' && targetStyle.visibility !== 'hidden' && target.getBoundingClientRect().width > 0;
      const isDisabledByModal = !isModalPin && modalOpen;
      pin.classList.toggle('prd-pin-disabled', isDisabledByModal);
      pin.disabled = isDisabledByModal;
      pin.style.pointerEvents = isDisabledByModal ? 'none' : 'auto';
      pin.style.zIndex = isDisabledByModal ? '4' : '9991';
      const rootOpen = root && (root.classList.contains('open') || root.classList.contains('show'));
      pin.style.display = (isModalPin && (!rootOpen || !isVisible(root) || !targetVisible)) ? 'none' : 'inline-flex';
      if (pin.style.display === 'none') return;
      const rect = target.getBoundingClientRect();
      const isDetailPanelAction = Boolean(target.closest('.phead'));
      const isListFieldGuide = pin.dataset.prdLabel === '异常列表字段与状态';
      const preferredLeft = isListFieldGuide ? rect.left - 10 : (isDetailPanelAction ? rect.left - 20 : rect.right + 2);
      pin.style.left = Math.max(2, Math.min(window.innerWidth - 20, preferredLeft)) + 'px';
      pin.style.top = Math.max(2, rect.top - 9) + 'px';
    });
  }
  function decorate() {
    cfg.items.forEach((item, index) => {
      if (document.querySelector('.prd-pin[data-prd-item="' + index + '"]')) return;
      const target = findTarget(item[0]);
      if (!target) return;
      target.dataset.prdPinned = '1';
      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'prd-pin';
      const no = pointNoFor(target);
      pin.textContent = no;
      pin.title = '查看“' + item[1] + '”PRD 说明';
      pin.setAttribute('aria-label', pin.title);
      pin.dataset.prdItem = index;
      pin.dataset.prdLabel = item[0];
      pin.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openGuide(item, no); });
      pin._prdTarget = target;
      document.body.appendChild(pin);
    });
    layoutPins();
  }
  function decorateModals() {
    document.querySelectorAll('.mask,.drawer-mask,.repay-coord-mask').forEach(root => {
      getModalTargets(root).forEach((target, index) => {
        if (target.dataset.prdModalPinned) return;
        const key = root.id + '-' + Date.now() + '-' + index;
        target.dataset.prdModalPinned = '1';
        const pin = document.createElement('button');
        pin.type = 'button';
        pin.className = 'prd-pin prd-modal-pin';
        const no = pointNoFor(target);
        pin.textContent = no;
        pin.title = '查看“' + textOf(target) + '”弹窗 PRD 说明';
        pin.setAttribute('aria-label', pin.title);
        pin.dataset.prdScope = 'modal';
        pin.dataset.prdModalItem = key;
        pin._prdTarget = target;
        pin._prdModal = root;
        pin.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); openModalGuide(root, target, no); });
        document.body.appendChild(pin);
      });
    });
    layoutPins();
  }
  decorate();
  decorateModals();
  /*
   * 编号仅是说明入口，不能监听整页 DOM 变化。
   * 之前的全局 MutationObserver 会在弹窗中动态渲染水单列表时反复排版，
   * 造成按钮点击延迟甚至像是失效。所有弹窗节点在本脚本加载前已创建，
   * 因此初始化一次，再在用户交互后的下一帧更新编号位置即可。
   */
  document.addEventListener('click', () => {
    window.requestAnimationFrame(layoutPins);
  }, true);
  document.addEventListener('input', () => {
    window.requestAnimationFrame(layoutPins);
  }, true);
  document.addEventListener('change', () => {
    window.requestAnimationFrame(layoutPins);
  }, true);
  window.addEventListener('resize', layoutPins);
  window.addEventListener('scroll', layoutPins, true);
})();
