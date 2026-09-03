# 报关单JSON数据结构说明


## 1. 结构概览
返回的数据为一个 JSON 对象，包含报关单表头信息、商品列表（表体）、集装箱信息及随附单证信息。

| 字段名                   | 类型     | 说明                         |
| :-------------------- | :----- | :------------------------- |
| **$**                 | String | 报关单表头基本信息（如合同号、提运单号等），详见下表 |
| **decMergeListVo**    | Array  | **商品表体列表**，包含具体的申报商品项      |
| **preDecContainerVo** | Array  | **集装箱列表**                  |
| **cusLicenseListVo**  | Array  | **随附单证列表**                 |

---

## 2. 字段详情

### 2.1 报关单表头 (Header)

| 字段 Key | 类型 | 中文名称/说明 |
| :--- | :--- | :--- |
| `customMaster` | String | 申报地海关_代码 |
| `customMasterName` | String | 申报地海关_名称 |
| `iEPort` | String | 出境/进境关别_代码 |
| `iEPortName` | String | 出境/进境关别_名称 |
| `contrNo` | String | **合同号** |
| `billNo` | String | **提单号** |
| `cnsnTradeScc` | String | 收发货人统一社会信用代码 |
| `cnsnTradeCode` | String | 收发货人海关十位代码 |
| `consignorCode` | String | 收发货人商检代码 |
| `consignorCname` | String | **境内收发货人名称** |
| `consigneeCode` | String | 境外收发货人代码 |
| `consigneeEname` | String | **境外收发货人名称** (英文) |
| `consigneeCname` | String | 境外收发货人名称 (中文) |
| `ownerScc` | String | 生产销售/消费使用单位统一社会信用代码 |
| `ownerCode` | String | 生产销售/消费使用单位海关十位代码 |
| `ownerCiqCode` | String | 生产销售/消费使用单位商检代码 |
| `ownerName` | String | **生产销售/消费使用单位名称** |
| `agentScc` | String | 申报单位统一社会信用代码 |
| `agentCode` | String | 申报单位海关十位代码 |
| `declRegNo` | String | 申报单位商检代码 |
| `agentName` | String | **申报单位名称** |
| `cusTrafMode` | String | 运输方式_代码 |
| `cusTrafModeName` | String | 运输方式_名称 |
| `trafName` | String | 运输工具名称 (船名/车牌) |
| `cusVoyageNo` | String | 航次号 |
| `supvModeCdde` | String | 监管方式_代码 |
| `supvModeCddeName` | String | 监管方式_名称 |
| `cutMode` | String | 征免性质_代码 |
| `cutModeName` | String | 征免性质_名称 |
| `licenseNo` | String | 许可证号 |
| `cusTradeCountry` | String | 运抵国(地区) / 启运国_代码 |
| `cusTradeCountryName` | String | 运抵国(地区) / 启运国_名称 |
| `distinatePort` | String | 指运港 / 经停港_代码 |
| `distinatePortName` | String | 指运港 / 经停港_名称 |
| `transMode` | String | 成交方式_代码  |
| `transModeName` | String | 成交方式_名称 (FOB/CIF等) |
| `feeMark` | String | 运费种类_代码 |
| `feeMarkName` | String | 运费种类_名称 |
| `feeRate` | String | 运费数量/费率 |
| `feeCurr` | String | 运费币制_代码 |
| `feeCurrName` | String | 运费币制_名称 |
| `insurMark` | String | 保费种类_代码 |
| `insurMarkName` | String | 保费种类_名称 |
| `insurRate` | String | 保费数量/费率 |
| `insurCurr` | String | 保费币制_代码 |
| `insurCurrName` | String | 保费币制_名称 |
| `otherMark` | String | 杂费种类_代码 |
| `otherMarkName` | String | 杂费种类_名称 |
| `otherRate` | String | 杂费数量/费率 |
| `otherCurr` | String | 杂费币制_代码 |
| `otherCurrName` | String | 杂费币制_名称 |
| `packNo` | String | **件数** |
| `wrapType` | String | 包装种类_代码 |
| `wrapTypeName` | String | 包装种类_名称 |
| `grossWt` | String | **毛重** |
| `netWt` | String | **净重** |
| `cusTradeNationCode` | String | 贸易国别(地区)_代码 |
| `cusTradeNationCodeName` | String | 贸易国别(地区)_名称 |
| `contaCount` | String | 集装箱累加数 |
| `goodsPlace` | String | 货物存放地 |
| `despPortCode` | String | 离境口岸 / 进境口岸_代码 |
| `despPortCodeName` | String | 离境口岸 / 进境口岸_名称 |
| `entryType` | String | 报关单类型_代码 |
| `entryTypeName` | String | 报关单类型_名称 |
| `noteS` | String | **备注** |
| `markNo` | String | **唛头** |
| `promiseItems` | String | 承诺事项 (特殊关系+价格影响+支付特许权使用费) |
| `cusRemark` | String | 业务事项 |

---

### 2.2 商品表体 (decMergeListVo)

包含报关单中的多行商品信息。

| 字段 Key | 类型 | 中文名称/说明 |
| :--- | :--- | :--- |
| `gNo` | String | **品名序号** |
| `contrItem` | String | 手册项号 |
| `codeTs` | String | **HS编码** (商品编码) |
| `ciqCode` | String | 商检(CIQ)编码 |
| `ciqName` | String | 商检(CIQ)名称 |
| `gName` | String | **中文品名** |
| `declGoodsEname` | String | 英文品名 |
| `gModel` | String | **申报要素** (以 `|` 分隔的字符串) |
| `gQty` | String | **成交数量** |
| `gUnit` | String | 成交单位_代码 |
| `gUnitName` | String | 成交单位_名称 |
| `declPrice` | String | **成交单价** |
| `declTotal` | String | **成交总价** |
| `tradeCurr` | String | 币制_代码 |
| `tradeCurrName` | String | 币制_名称 |
| `qty1` | String | 法定第一数量 |
| `unit1` | String | 法定第一单位_代码 |
| `unit1Name` | String | 法定第一单位_名称 |
| `qty2` | String | 法定第二数量 |
| `unit2` | String | 法定第二单位_代码 |
| `unit2Name` | String | 法定第二单位_名称 |
| `exgVersion` | String | 加工成品单耗版本号 |
| `exgNo` | String | 货号 |
| `destinationCountry` | String | 最终目的国_代码 |
| `destinationCountryName` | String | 最终目的国_名称 |
| `cusOriginCountry` | String | 原产国_代码 |
| `cusOriginCountryName` | String | 原产国_名称 |
| `districtCode` | String | 境内货源地_代码 |
| `districtCodeName` | String | 境内货源地_名称 |
| `ciqDestCode` | String | 产地_代码 |
| `ciqDestCodeName` | String | 产地_名称 |
| `dutyMode` | String | 征免_代码 |
| `dutyModeName` | String | 征免_名称 |
| `noDangFlag` | String | 非危险化学品_代码 |
| `noDangFlagName` | String | 非危险化学品_名称 |
| `unCode` | String | 危险品 UN编码 |
| `dangName` | String | 危险货物名称 |
| `packType` | String | 危包类别_代码 |
| `packTypeName` | String | 危包类别_名称 |
| `packSpec` | String | 危包规格 |
| `engManEntCnm` | String | 境外生产企业 |
| `goodsAttr` | String | 货物属性代码 |
| `goodsAttrName` | String | 货物属性名称 |
| `goodsBrand` | String | 货物品牌 |
| `goodsModel` | String | 货物型号 |
| `goodsSpec` | String | 货物规格 |
| `stuff` | String | 成分/原料/组分 |
| `origPlaceCode` | String | 原产地区 |
| `prodBatchNo` | String | 生产批次 |
| `mnufctrRegNo` | String | 生产单位代码 |
| `prodQgp` | String | 保质期(天) |
| `prodValidDt` | String | 产品有效期 |
| `produceDate` | String | 生产日期 |
| `purpose` | String | 用途 |



## 3.报关单JSON样例
```json
{"extendField":"0001101","cusRemark":"000000000000000","additionInfo":"","isCopPromise":"0","customMaster":"2231","customMasterName":"洋山市内","iEPort":"2248","iEPortName":"洋山港区","manualNo":"","contrNo":"PI-211185","cnsnTradeScc":"91330400763937539K","cnsnTradeCode":"3304931302","consignorCode":"3307006687","consignorCname":"禾欣可乐丽超纤皮（嘉兴）有限公司","consigneeCode":"","consigneeEname":"MR. YOSHIO KIMURA","ownerScc":"91330400763937539K","ownerCode":"3304931302","ownerCiqCode":"3307006687","ownerName":"禾欣可乐丽超纤皮（嘉兴）有限公司","agentScc":"913302043169258512","agentCode":"3302980369","declRegNo":"3800510042","agentName":"宁波乾恩报关有限公司","cusTrafMode":"2","cusTrafModeName":"水路运输","trafName":"MSC BREMEN","cusVoyageNo":"UX146A","billNo":"177PPNPNS26136","supvModeCdde":"0110","supvModeCddeName":"一般贸易","cutMode":"101","cutModeName":"一般征税","licenseNo":"","cusTradeCountry":"USA","cusTradeCountryName":"美国","distinatePort":"USA309","distinatePortName":"纽约（美国）","transMode":"3","transModeName":"FOB","feeMark":"","feeCurr":"","insurMark":"","insurCurr":"","otherMark":"","otherMarkName":"","otherRate":"","otherCurr":"","otherCurrName":"","packNo":"71","wrapType":"99","wrapTypeName":"其他包装","decOtherPacksVo":"[]","grossWt":"13845.6","netWt":"13561.6","cusTradeNationCode":"USA","cusTradeNationCodeName":"美国","contaCount":"2","attaDocuCdstr":"B,1","goodsPlace":"","despPortCode":"311002","despPortCodeName":"洋山港","entryType":"M","entryTypeName":"通关无纸化","noteS":"G1 38021.2 平方米","promiseItems":"00099","markNo":"N/M","orgCode":"","orgCodeName":"","entQualifTypeCodeS":"","entQualifTypeCodeSName":"","preDecEntQualifListVo":"[]","vsaOrgCode":"","vsaOrgCodeName":"","inspOrgCode":"","inspOrgCodeName":"","purpOrgCode":"","purpOrgCodeName":"","correlationDeclNo":"","correlationReasonFlag":"","correlationReasonFlagName":"","specDeclFlag":"0000","specPassFlag":"000","applCopyQuan":"","applOri":"","appCertCode":"","appCertName":"","preDecRequCertList":"[]","relativeId":"","relmanNo":"","bonNo":"","customsField":"","customsFieldName":"","priUseGoodsType":"","priUseGoodsTypeName":"","consignorEname":"","consigneeCname":"","declGoodsEnames":"","cusIEFlag":"E","dclTrnRelFlag":"0","decMergeListVo":"[{\"gNo\":\"1\",\"contrItem\":\"\",\"codeTs\":\"5603941000\",\"hsCodeDesc\":\"\",\"ciqCode\":\"\",\"ciqName\":\"\",\"gName\":\"超纤无纺布\",\"gModel\":\"4|2|针刺|浸渍|约306克/平方米(HKQ9606FRW-0000)等|60%尼龙PA, 40%聚氨酯PU|运动材料|禾欣可乐丽超纤皮(嘉兴)有限公司\",\"gQty\":\"27158\",\"gUnit\":\"030\",\"gUnitName\":\"米\",\"declPrice\":\"6.1985\",\"declTotal\":\"168339.28\",\"tradeCurr\":\"USD\",\"tradeCurrName\":\"美元\",\"qty1\":\"13561.6\",\"unit1\":\"035\",\"unit1Name\":\"千克\",\"exgVersion\":\"\",\"exgNo\":\"\",\"destinationCountry\":\"USA\",\"destinationCountryName\":\"美国\",\"qty2\":\"\",\"unit2\":\"\",\"unit2Name\":\"\",\"cusOriginCountry\":\"CHN\",\"cusOriginCountryName\":\"中国\",\"rcepOrigPlaceCode\":\"\",\"rcepOrigPlaceCodeName\":\"\",\"districtCode\":\"33049\",\"districtCodeName\":\"嘉兴\",\"ciqDestCode\":\"\",\"ciqDestCodeName\":\"\",\"dutyMode\":\"1\",\"dutyModeName\":\"照章征税\",\"cusSupvDmd\":\"\",\"supvDmd\":\"\",\"goodsTargetInput\":\"\",\"goodsAttr\":\"\",\"goodsAttrName\":\"\",\"purpose\":\"\",\"purposeName\":\"\",\"preDecCiqGoodsLimit\":\"[]\",\"preDecCiqGoodsCont\":\"\",\"preDecCiqXiangHui\":\"\",\"dangerFlag\":\"\",\"noDangFlag\":\"\",\"noDangFlagName\":\"\",\"unCode\":\"\",\"dangName\":\"\",\"packType\":\"\",\"packTypeName\":\"\",\"packSpec\":\"\",\"stuff\":\"\",\"prodValidDt\":\"\",\"prodQgp\":\"\",\"engManEntCnm\":\"\",\"goodsSpec\":\"\",\"goodsModel\":\"\",\"goodsBrand\":\"\",\"produceDate\":\"\",\"prodBatchNo\":\"\",\"mnufctrRegNo\":\"\",\"ciqCurr\":\"USD\",\"cusCiqNo\":\"E20210000747040029\",\"goodsTotalVal\":\"168339.28\",\"updateTime\":\"2021-11-23 14:30:31\",\"supList\":[],\"ciqDomeOriginCode\":\"\",\"createUser\":\"2000040011127\",\"codeTsName\":\"其他材料制无纺织物(浸渍、涂布、包覆或压层，每平米重>150克)\",\"indbTime\":\"2021-11-23 14:30:31\",\"updateUser\":\"2000040011127\",\"ciqWtMeasUnit\":\"035\",\"ciqWtMeasUnitName\":\"千克\",\"goodsLegalInspectionMark\":\"00\",\"ciqOriginCountry\":\"CHN\",\"stdWeightUnitCode\":\"1\",\"ciqCurrName\":\"美元\",\"ciqWeight\":\"13561.6\"}]",}
```