/* 原型内 PRD 对照：橙色序号可点击查看对应需求说明。 */
(() => {
  const script = document.currentScript;
  const page = script && script.dataset.page;
  const configs = {
    bill: {
      prd: '请款单管理-回款申请-交互PRD.html',
      title: '请款单管理与回款申请｜PRD 对照说明',
      items: [
        ['回款申请', '发起回款申请', '§5 回款申请 / BR-RCP-014', '仅支持按已选请款单、按运单发起；按运单需唯一带出客户和待回款请款单。'],
        ['回款协调', '回款协调', '§7 回款协调右侧抽屉', '从右侧打开，不离开列表；可查看申请明细、待补资料、待放行、已核销。'],
        ['财务放行配置', '财务放行配置', '§4 工具栏 / §6 放行与日志', '由财务配置预核销放行比例和水单付款金额可修改幅度。']
      ]
    },
    exception: {
      prd: '财务异常工作台-回款核销-交互PRD.html',
      title: '财务异常工作台｜PRD 对照说明',
      items: [
        ['全部', '页签、筛选、列表与数据回显（通用）', '§3 页签与状态、§4 筛选与列表字段、§6 详情、§7 BR-EXC-07～08', '<strong>页签：</strong>各页签条数按当前权限和任务当前状态统计；同一任务只归属一个处理页签，退回补资料后不再计入“已比对待核销”。<br><strong>筛选与列表：</strong>筛选仅过滤当前权限范围；客户、付款主体、币别、回款申请、真实流水、关联请款单/运单、金额、处理人和时间均来自同一回款业务对象。<br><strong>回显与限制：</strong>列表、详情、收款管理、凭证管理和请款单“回款协调”展示同一处理结果；字段默认只读，不允许在异常页直接改写原始流水或水单。'],
        ['查询数据', '查询与筛选', '§4 筛选与列表字段', '按当前筛选条件刷新本页任务与页签条数；重置后恢复默认条件。页签条数按当前登录人数据权限与任务当前状态统计。'],
        ['查看水单', '查看水单', '§5 工具栏与弹窗', '打开业务上传水单、AI 识别原始值与业务确认值；只读查看，原始文件和识别结果不被后续处理覆盖。'],
        ['查看真实流水', '查看真实流水', '§5 工具栏与弹窗 / §7 BR-EXC-07', '打开同一真实流水的凭证金额、付款主体、付款账户、到账时间和关联结果；数据来自凭证/收款管理。'],
        ['重新匹配', '重新匹配', '§5 工具栏与弹窗 / §7 BR-EXC-02', '选中待处理记录后，可按“付款方+金额+币种重新匹配”或“仅重新匹配真实流水”处理；开始后进入重新匹配中并写日志。'],
        ['指派处理人', '指派处理人', '§5 工具栏与弹窗', '仅可指派给有财务收款权限的人员；保存新处理人、指派人和时间，不改变原始流水与核销记录。'],
        ['退回业务补资料', '退回业务补资料', '§5 工具栏与弹窗 / §7 BR-EXC-05', '必须选择退回原因；任务转入“待业务补资料”，业务员在请款单管理的“回款协调”补传水单和付款备注后重新提交。'],
        ['人工确认认领', '人工确认认领', '§5 工具栏与弹窗', '用于真实流水无法唯一认领；处理说明必填，确认后写入认领结论并同步收款管理、请款单和操作日志。'],
        ['人工确认核销', '人工确认核销', '§5 工具栏与弹窗 / §7 BR-EXC-03', '仅处理“已比对待核销”中已满足放行、但仍未满足实际核销条件的记录；展示关联账单和拟核销金额，处理说明必填。确认后写入实际核销结果。'],
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
      '水单文件': '<h4>前端关注</h4><ul><li>支持一次或分批选择多张水单；逐张显示金额、付款时间来源、账户匹配和核对状态。</li><li>点击“查看/核对”只切换当前水单，不覆盖其他水单。</li></ul><h4>后端关注</h4><ul><li>每张水单保存文件 ID、版本、AI 原始值、业务确认值和确认状态。</li></ul><h4>场景与结果</h4><ul><li>移除未提交水单后重算合计；提交后如需修改，必须退回补资料并创建新处理批次。</li></ul>',
      '水单合计金额': '<h4>前端关注</h4><ul><li>只读展示各水单确认金额之和，不允许直接输入总额。</li></ul><h4>后端关注</h4><ul><li>保存单张金额和汇总金额；任一单张修改超过财务配置幅度时拒绝提交。</li></ul><h4>场景与结果</h4><ul><li>合计用于账单匹配和放行判断；不等于账单金额时不得自动核销。</li></ul>',
      '当前水单付款时间': '<h4>前端关注</h4><ul><li>当前字段只编辑当前查看的水单，并展示时间来源。</li></ul><h4>后端关注</h4><ul><li>时间来源分别保存：水单识别、上传时间、业务确认。</li></ul><h4>场景与结果</h4><ul><li>水单无付款时间时取该水单上传时间；业务修改后标记为业务确认。</li></ul>',
      '当前水单付款账户': '<h4>前端关注</h4><ul><li>当前字段只维护当前水单；前四位和后四位命中客户付款账户时显示已匹配。</li></ul><h4>后端关注</h4><ul><li>按单张保存付款账户确认值和匹配结果；新增账户只回填当前水单。</li></ul><h4>场景与结果</h4><ul><li>多张水单中任一付款账户未匹配时，不可自动核销。</li></ul>',
      '当前水单我方收款账户': '<h4>前端关注</h4><ul><li>按当前水单显示并核对我方收款账户。</li></ul><h4>后端关注</h4><ul><li>按前四位和后四位匹配财务收款账户；匹配结果保存到对应水单。</li></ul><h4>场景与结果</h4><ul><li>任一水单我方收款账户未匹配时，进入待处理，不自动核销。</li></ul>',
      'AI 水单识别结果': '<h4>前端关注</h4><ul><li>展示当前水单的 AI 原始结果、时间来源和置信度；切换水单时同步切换。</li></ul><h4>后端关注</h4><ul><li>AI 原始结果不可覆盖，业务编辑值另存为确认值并留痕。</li></ul><h4>场景与结果</h4><ul><li>识别缺失或不正确时，业务修正后逐张确认；未确认不能提交。</li></ul>',
      '提交预核销': '<h4>前端关注</h4><ul><li>任一水单未核对、金额修改超限或必填信息缺失时禁止提交并提示原因。</li></ul><h4>后端关注</h4><ul><li>写预核销、每张水单快照和操作日志；实际核销须再校验真实流水、每张账户、金额、币种和账单。</li></ul><h4>场景与结果</h4><ul><li>合计对账但有任一水单账户未匹配时，进入已比对待核销/异常处理，不写实际核销。</li></ul>'
    }
  };
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
      '回款申请': '<h4>前端关注</h4><ul><li>仅提供按已选请款单、按运单两种发起方式；客户由关联单据只读带出。</li><li>支持一次或分批上传多张水单；列表逐张展示金额、付款时间及来源、付款/收款账户匹配和单张核对状态。“查看/核对”只切换当前水单，不覆盖其他水单。</li><li>合计金额由单张确认金额汇总；任一水单未核对或单张金额修改超限，不得提交。每张账户均匹配、合计金额匹配账单后才可自动核销。</li><li>“提交预核销”和“申请放行”分开显示：前者必经，后者仅业务主动勾选时可用。</li></ul><h4>后端关注</h4><ul><li>保存回款申请、水单版本、识别原始值、确认值、付款时间及时间来源；原始值不可覆盖。</li><li>请款单去重按运单+费用项+金额+币种；无可匹配账单的到账款进入客户余额，由指定票件收款页面处理。</li></ul><h4>场景与结果</h4><ul><li>全匹配：真实流水、账户、金额、币种、账单均一致，系统直接写已核销和日志。</li><li>未全匹配：写预核销/比对记录，进入自动认领异常或已比对待核销；不会提前写实际核销。</li></ul>',
      '回款协调': '<h4>前端关注</h4><ul><li>从右侧抽屉打开，不离开请款单列表；展示申请明细、待补资料、待放行、已核销。</li><li>待补资料时展示退回原因、补传水单、付款备注及重新提交按钮。</li></ul><h4>后端关注</h4><ul><li>按回款申请号读取同一申请的状态、退回原因、放行结论和日志；不复制独立数据。</li><li>重新提交必须新建处理批次，并关联原退回记录，不能覆盖原水单或历史日志。</li></ul><h4>场景与结果</h4><ul><li>资料不全或疑似重复：留在业务员待办池，业务补充后重提，或撤销本次申请。</li><li>未处理时不自动回流财务待办；财务只看到当前可处理批次。</li></ul>',
      '财务放行配置': '<h4>前端关注</h4><ul><li>仅财务配置权限可编辑放行比例和水单金额修改幅度；保存时校验比例为 1~100、幅度不小于 0。</li><li>页面展示当前生效配置；业务发起申请时只读使用，不可自行修改。</li></ul><h4>后端关注</h4><ul><li>配置变更需保存维护人、时间和前后值；后续申请按新配置判断，历史申请保留原判断快照。</li><li>放行门槛=客户已到账期且未结算请款单的去重金额×放行比例。</li></ul><h4>场景与结果</h4><ul><li>金额达到门槛且业务申请放行：系统自动放行。</li><li>未达到门槛：仅业务主动申请时才创建财务放行待办。</li></ul>'
    },
    exception: {
      '全部': '<h4>前端关注</h4><ul><li>主页签按实际处理阶段互斥展示，并显示当前权限范围内的条数；放行状态仅作字段和筛选。</li><li>列表、详情和跨页面回显均为只读，避免在异常页直接改原始流水或水单。</li></ul><h4>后端关注</h4><ul><li>以回款申请号、真实流水号、请款单号、核销记录 ID 关联同一对象；收款管理、请款单和异常页读同一结果。</li><li>不设置“已关闭”状态：资料错误和疑似重复均退回待业务补资料。</li></ul><h4>场景与结果</h4><ul><li>自动认领异常、已比对待核销、已核销、待业务补资料分别只承接当前状态的记录。</li><li>放行审批可跨主状态筛选，但审批不改变实际核销状态。</li></ul>',
      '查询数据': '<h4>前端关注</h4><ul><li>按客户、申请号、流水号、运单、时间、处理状态、放行状态等条件组合查询；重置恢复默认。</li><li>查询后同步刷新当前列表和各主页签条数；无结果显示空态。</li></ul><h4>后端关注</h4><ul><li>查询必须按当前用户的数据权限过滤；分页、排序和条数使用同一筛选条件。</li></ul><h4>场景与结果</h4><ul><li>财务可按客户汇总已比对待核销水单，选择多笔进行后续核销。</li><li>业务员不能通过筛选看到非本人权限客户。</li></ul>',
      '查看水单': '<h4>前端关注</h4><ul><li>只读展示水单文件预览、AI 原始识别值、业务确认值及差异标记。</li><li>付款时间需同时展示时间值和来源：水单识别或上传时间。</li></ul><h4>后端关注</h4><ul><li>文件、AI 原始结果、人工确认值分开保存并带版本；后续处理不得覆盖原始值。</li></ul><h4>场景与结果</h4><ul><li>水单缺失、不清晰或确认值不足时，财务退回业务补资料。</li></ul>',
      '查看真实流水': '<h4>前端关注</h4><ul><li>只读展示真实到账金额、付款方/付款账号、我方收款账号、到账时间、摘要和流水号。</li><li>与业务水单的账户、金额、币种差异需明显标记。</li></ul><h4>后端关注</h4><ul><li>数据来源为凭证/收款管理；异常页不得修改银行原始流水。</li></ul><h4>场景与结果</h4><ul><li>流水不存在、账号不匹配或金额不匹配时，不能自动认领或自动核销。</li></ul>',
      '重新匹配': '<h4>前端关注</h4><ul><li>需先选中记录，再选择“按付款方+金额+币种”或“仅真实流水”重新匹配范围。</li><li>提交中禁用重复点击；完成后回显最新候选、状态和日志。</li></ul><h4>后端关注</h4><ul><li>重新匹配只读取原始流水和人工确认值；任务需幂等，避免重复生成核销记录。</li></ul><h4>场景与结果</h4><ul><li>财务人工确认账户或金额后触发重新匹配；全匹配则自动核销，否则继续保留在对应待办。</li></ul>',
      '指派处理人': '<h4>前端关注</h4><ul><li>仅显示具备财务收款权限的可指派人员；保存前展示当前处理人与新处理人。</li></ul><h4>后端关注</h4><ul><li>保存指派人、被指派人、时间和原因；只改变处理责任，不改变流水、放行或核销状态。</li></ul><h4>场景与结果</h4><ul><li>认领异常长期未处理或需出纳核验账户/金额时，指派指定财务继续处理。</li></ul>',
      '退回业务补资料': '<h4>前端关注</h4><ul><li>退回原因必选；支持水单不清晰、账户无法确认、金额差异、关联单据不完整、疑似重复等值。</li><li>提交后列表状态改为待业务补资料，处理人回显业务员。</li></ul><h4>后端关注</h4><ul><li>保存退回原因、退回人、时间和原处理批次；不删除流水、水单和日志。</li></ul><h4>场景与结果</h4><ul><li>业务补传水单和备注后创建新批次重新比对；业务不处理则一直保留在其待办池。</li></ul>',
      '人工确认认领': '<h4>前端关注</h4><ul><li>仅自动认领异常可操作；处理说明必填，展示候选客户、账户与水单依据。</li></ul><h4>后端关注</h4><ul><li>原候选不可覆盖；新增人工确认值、原因、操作人和时间后重新触发匹配。</li></ul><h4>场景与结果</h4><ul><li>微信缺付款方、支付宝/银行账号或金额不匹配时，由财务人工认领。</li></ul>',
      '人工确认核销': '<h4>前端关注</h4><ul><li>仅已比对待核销记录可操作；展示待核销账单、拟核销金额、差异和费用项选择。</li><li>批量操作需先按客户筛选，并限制同客户、同币种的数据。</li></ul><h4>后端关注</h4><ul><li>支持多水单核销一账单、一码单核销多账单；金额分配、部分核销需原子保存并写日志。</li><li>无可匹配账单的到账款不得在此页核销，应进入客户余额并由指定票件收款处理。</li></ul><h4>场景与结果</h4><ul><li>客户多次付款累计满足账单后，财务可一次勾选多张水单和账单批次完成核销。</li></ul>',
      '审批客户放行': '<h4>前端关注</h4><ul><li>点击顶部待放行审批筛出跨主状态待办；选中记录后回显水单、真实流水和关联账单差异，并启用审批按钮。</li><li>审批弹窗展示实收、关联账单金额、实际核销状态；必须填写审批说明，并选择“同意放行”或“退回业务补资料”。</li></ul><h4>后端关注</h4><ul><li>同意放行仅更新放行状态、审批人和日志，不自动写实际核销。</li><li>退回时状态转待业务补资料、处理人改为业务员；必须校验记录仍为待放行审批，防止并发重复审批。</li></ul><h4>场景与结果</h4><ul><li>金额未达门槛但业务主动申请放行时，由财务审批；同意后记录仍保留原主页签，退回后进入业务员待办池。</li></ul>',
      '退回业务确认重复': '<h4>前端关注</h4><ul><li>选择疑似与已有申请重复或疑似与真实流水重复后，展示“退回业务确认”而非关闭。</li></ul><h4>后端关注</h4><ul><li>状态统一转待业务补资料，业务员可撤销申请或补充说明重提；不可删除原始资料和历史日志。</li></ul><h4>场景与结果</h4><ul><li>不设置已关闭或重开；业务未处理时记录一直挂在业务池，不再占财务待办。</li></ul>',
      '导出': '<h4>前端关注</h4><ul><li>导出当前筛选结果，提示数据范围和生成状态；无数据时不可提交。</li></ul><h4>后端关注</h4><ul><li>导出使用同一权限和筛选条件，不得因导出更新处理状态、核销或放行结果。</li></ul><h4>场景与结果</h4><ul><li>财务可导出某客户或某处理状态的待办，作为线下核验辅助材料。</li></ul>',
      '操作日志': '<h4>前端关注</h4><ul><li>按时间倒序展示操作时间、操作人/系统、动作、前后状态、原因/备注；只读。</li></ul><h4>后端关注</h4><ul><li>日志追加写入，不允许覆盖；关联申请、流水、请款单和核销记录。</li></ul><h4>场景与结果</h4><ul><li>需追溯上传、AI 识别确认、预核销、放行、认领、人工确认值、重新匹配、核销、退回和撤销。</li></ul>'
    }
  };
  const style = document.createElement('style');
  style.textContent = '.prd-pin{position:fixed!important;z-index:9991;display:inline-flex!important;align-items:center;justify-content:center;width:18px!important;height:18px!important;min-width:18px!important;border:0!important;border-radius:50%!important;background:#f08a00!important;color:#fff!important;font-size:10px!important;font-weight:800!important;line-height:1!important;padding:0!important;margin:0!important;cursor:pointer!important;box-shadow:0 1px 2px rgba(157,82,0,.3)!important}.prd-pin:focus{outline:2px solid #ffe0a6!important;outline-offset:2px}.prd-guide{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;background:rgba(16,35,59,.45);padding:24px}.prd-guide.show{display:flex}.prd-guide-card{width:min(650px,calc(100vw - 32px));max-height:calc(100vh - 48px);overflow:auto;background:#fff;border-radius:12px;box-shadow:0 18px 48px rgba(0,0,0,.25)}.prd-guide-head{display:flex;align-items:center;gap:12px;padding:18px 22px;border-bottom:1px solid #edf0f4;font-size:20px;font-weight:800;color:#1e2e40}.prd-guide-close{margin-left:auto;border:1px solid #2d78cf;background:#fff;color:#2d78cf;border-radius:5px;padding:7px 14px;cursor:pointer}.prd-guide-body{padding:18px 28px 24px;color:#3d4a57;font-size:15px;line-height:1.75}.prd-guide-ref{display:inline-block;background:#edf5ff;color:#2875c6;border-radius:4px;padding:2px 9px;margin-bottom:10px;font-size:13px}.prd-guide-detail{margin-top:14px;padding-top:6px;border-top:1px solid #edf0f4}.prd-guide-detail h4{margin:12px 0 4px;color:#1762bd;font-size:14px}.prd-guide-detail ul{margin:4px 0 10px;padding-left:20px}.prd-guide-detail li{margin:3px 0}.prd-guide-body a{color:#2875c6;font-weight:700;text-decoration:none}.prd-guide-bar{position:fixed;right:18px;bottom:18px;z-index:9990;background:#fff5e5;border:1px solid #f4b34c;color:#9c5700;border-radius:6px;padding:7px 10px;font-size:12px;box-shadow:0 2px 8px rgba(0,0,0,.12)}';
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
    const detail = guideDetails[page]?.[item[0]] || '<h4>前端关注</h4><p>按当前页面展示、校验、权限和交互执行。</p><h4>后端关注</h4><p>保存业务对象、状态和日志，保证与关联页面数据一致。</p><h4>场景与结果</h4><p>按当前状态执行，不满足前置条件时阻止提交并提示原因。</p>';
    overlay.querySelector('.prd-guide-body').innerHTML = '<span class="prd-guide-ref">' + ownId + ' · PRD 位置：' + item[2] + '</span><div>' + item[3] + '</div><section class="prd-guide-detail">' + detail + '</section><p style="margin:14px 0 0"><a href="' + cfg.prd + '" target="_blank">打开完整 PRD</a></p>';
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
    repayConfigMask: ['保存配置'],
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
    const detail = modalRuleDetails[root.id]?.[title] || '<h4>前端关注</h4><ul><li>该编号仅在“' + textOf(root.querySelector('.modal-hd h3,.drawer-hd h3,.mh,#mtitle,.drawer-head h3') || root) + '”中有效，不与页面编号共用。</li><li>按当前字段的必填、只读、校验和按钮可用条件展示；关闭弹窗不改变页面数据。</li></ul><h4>后端关注</h4><ul><li>保存本弹窗涉及的业务对象、操作人、操作时间和前后值；失败时不产生半条结果。</li></ul><h4>场景与结果</h4><ul><li>不满足前置条件时阻止提交并提示具体原因；成功后刷新弹窗和页面关联数据。</li></ul>';
    overlay.querySelector('.prd-guide-name').textContent = title;
    overlay.querySelector('.prd-guide-body').innerHTML = '<span class="prd-guide-ref">' + ownId + ' · 弹窗说明</span><section class="prd-guide-detail">' + detail + '</section><p style="margin:14px 0 0"><a href="' + cfg.prd + '" target="_blank">打开完整 PRD</a></p>';
    overlay.classList.add('show');
    overlay.querySelector('.prd-guide-close').focus();
  }
  function findTarget(label) {
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
      pin.style.display = (!isModalPin && modalOpen) || (isModalPin && (!root || !isVisible(root) || !targetVisible)) ? 'none' : 'inline-flex';
      if (pin.style.display === 'none') return;
      const rect = target.getBoundingClientRect();
      const isDetailPanelAction = Boolean(target.closest('.phead'));
      const preferredLeft = isDetailPanelAction ? rect.left - 20 : rect.right + 2;
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
  function observeModalState() {
    document.querySelectorAll('.mask,.drawer-mask,.repay-coord-mask').forEach(root => {
      if (root.dataset.prdModalObserved) return;
      root.dataset.prdModalObserved = '1';
      new MutationObserver(layoutPins).observe(root, { attributes: true, attributeFilter: ['style', 'class'] });
    });
  }
  observeModalState();
  new MutationObserver(() => { decorate(); decorateModals(); observeModalState(); layoutPins(); }).observe(document.body, { childList: true, subtree: true });
  window.addEventListener('resize', layoutPins);
  window.addEventListener('scroll', layoutPins, true);
})();
