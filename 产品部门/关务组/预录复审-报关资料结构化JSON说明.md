# 预录复审 · 报关资料结构化 JSON 说明

> 预录复审 / 做资料核准用。  
> **必填仅 7 项**（§1）；报关单其余字段**有则填、非必填**（§2–§3）。  
> Key 尽量对齐报关单版式；与海关报文全量 Key 对照见 [报关单JSON数据结构说明(1).md](报关单JSON数据结构说明(1).md)。  
> 样例：[预录复审-报关资料结构化.json](预录复审-报关资料结构化.json)

匹配主键：**报关编号 `declNo`**。

---

## 1. 必填（7 项）

与核准比对一致：**不含抬头**；买单行不比对预录。缺一 → 资料不齐。

| 中文 | Key | 说明 |
| :--- | :--- | :--- |
| **品名** | `decMergeList[].gName` | 每行必填。多行展示可用英文逗号拼接，如 `充电宝,充电宝` |
| **HS** | `decMergeList[].hsCode` | 每行必填（商品编号） |
| **件数** | `pcs` | 票级（报关单「件数」） |
| **毛重(KG)** | `grossWt` | 票级 |
| **方数** | `cbm` | 票级 m³（报关单表头无此格，ESS 扩展） |
| **申报金额** | `amount` | 票合计；行见 `decMergeList[].amount` |
| **报关方式** | `supvMode` / `supvModeName` | **即报关单「监管方式」**（同一字段）。如 `0110`/一般贸易、`9810`/跨境电商出口海外仓 |

---

## 2. 票级 / 表头（报关单有则填 · 非必填）

| Key | 中文（报关单） | 必填 | 说明 |
| :--- | :--- | :---: | :--- |
| `declNo` | — | ✓ | ESS 报关编号（匹配主键） |
| `preEntryNo` | 预录入编号 | | |
| `customsNo` | 海关编号 | | |
| `pageNo` | 页码/页数 | | 如 `1/1` |
| `customMaster` / `customMasterName` | 申报地海关 | | 代码 / 名称 |
| `consignorScc` | 境内收发货人信用代码 | | |
| `consignorCname` | 境内收发货人 | | |
| `iEPort` / `iEPortName` | 出境关别 | | |
| `exportDate` | 出口日期 | | |
| `declareDate` | 申报日期 | | |
| `manualNo` | 备案号 | | |
| `consigneeEname` | 境外收货人 | | |
| `consigneeCname` | 境外收货人（中文） | | |
| `trafMode` / `trafModeName` | 运输方式 | | 如 `2` / 水路运输 |
| `trafName` | 运输工具名称 | | |
| `voyageNo` | 航次号 | | |
| `billNo` | 提运单号 | | |
| `ownerScc` / `ownerName` | 生产销售单位 | | |
| `supvMode` / `supvModeName` | 监管方式（=报关方式） | **✓** | 核准比对「报关方式」取此字段；← 报文 `supvModeCdde` |
| `cutMode` / `cutModeName` | 征免性质 | | 如 `101` / 一般征税 |
| `licenseNo` | 许可证号 | | |
| `contrNo` | 合同协议号 | | |
| `tradeNation` / `tradeNationName` | 贸易国(地区) | | |
| `destCountry` / `destCountryName` | 运抵国(地区) | | |
| `distinatePort` / `distinatePortName` | 指运港 | | |
| `despPort` / `despPortName` | 离境口岸 | | |
| `wrapType` / `wrapTypeName` | 包装种类 | | |
| `pcs` | 件数 | **✓** | |
| `grossWt` | 毛重(千克) | **✓** | |
| `netWt` | 净重(千克) | | |
| `cbm` | 方数 | **✓** | ESS |
| `amount` | 申报金额（总价） | **✓** | |
| `currency` | 币制 | | 如 USD |
| `transMode` / `transModeName` | 成交方式 | | 如 `3` / FOB |
| `fee` | 运费 | | 有则写数量/币制说明 |
| `insur` | 保费 | | |
| `other` | 杂费 | | |
| `attaDocs` | 随附单证及编号 | | 如 `装箱单;发票;合同` |
| `markNo` | 标记唛码 | | |
| `noteS` | 备注 | | |
| `promiseItems` | 特殊关系/价格影响/特许权等确认 | | 可拼字符串或对象 |
| `selfPay` | 自报自缴 | | 是 / 否 |
| `agentScc` / `agentName` | 申报单位 | | |
| `hasStruct` | — | | 无结构则只审附件 |

---

## 3. 商品行 `decMergeList[]`（报关单表体）

| Key | 中文 | 必填 | 说明 |
| :--- | :--- | :---: | :--- |
| `gNo` | 项号 | | |
| `hsCode` | 商品编号 | **✓** | ← 报文 `codeTs` |
| `gName` | 品名 | **✓** | |
| `gModel` | 规格型号 / 申报要素 | | 可用 `\|` 分隔 |
| `qty` | 成交数量 | | |
| `unit` | 成交单位 | | |
| `qty1` / `unit1` | 法定第一数量/单位 | | |
| `qty2` / `unit2` | 法定第二数量/单位 | | |
| `price` | 单价 | | |
| `amount` | 总价 | **✓** | 行申报金额 |
| `currency` | 币制 | | |
| `originCountry` / `originCountryName` | 原产国(地区) | | |
| `destCountry` / `destCountryName` | 最终目的国(地区) | | |
| `districtCode` / `districtName` | 境内货源地 | | |
| `dutyMode` / `dutyModeName` | 征免 | | |

---

## 4. 样例（对齐出口报关单版式）

完整见 `预录复审-报关资料结构化.json`。结构示意：

```json
{
  "declNo": "ICBU00001117068",
  "preEntryNo": "",
  "customsNo": "",
  "pageNo": "1/1",
  "hasStruct": true,
  "pcs": "35",
  "grossWt": "580.66",
  "netWt": "516.4",
  "cbm": "2.40",
  "amount": "9037.00",
  "currency": "USD",
  "consignorScc": "91440300MA5FXKMD0M",
  "consignorCname": "深圳市宝焰科技有限公司",
  "consigneeEname": "Feng - Lily",
  "iEPort": "2225",
  "iEPortName": "外港海关",
  "trafMode": "2",
  "trafModeName": "水路运输",
  "billNo": "MX260823",
  "ownerName": "深圳市宝焰科技有限公司",
  "supvMode": "9810",
  "supvModeName": "跨境电商出口海外仓",
  "cutMode": "101",
  "cutModeName": "一般征税",
  "contrNo": "MX260823",
  "tradeNationName": "美国",
  "destCountryName": "美国",
  "distinatePortName": "美国",
  "despPortName": "外高桥",
  "wrapTypeName": "纸制或纤维板制盒/箱",
  "transMode": "3",
  "transModeName": "FOB",
  "attaDocs": "装箱单;发票;合同",
  "markNo": "N/M",
  "noteS": "",
  "selfPay": "否",
  "agentName": "义乌市欣扬报关代理有限公司",
  "decMergeList": [
    {
      "gNo": "1",
      "hsCode": "8507600090",
      "gName": "充电宝",
      "gModel": "3|0|3C产品|锂离子|37Wh|LADAPU|PB002|10000|不含|5V",
      "qty": "677",
      "unit": "个",
      "qty1": "135.4",
      "unit1": "千克",
      "price": "3.5000",
      "amount": "2369.50",
      "currency": "USD",
      "originCountryName": "中国",
      "destCountryName": "美国",
      "districtName": "深圳特区",
      "dutyModeName": "照章征税"
    }
  ]
}
```

---

## 5. 与海关全量报文

报关行回传全量时：入库可存全量；复审 / 核准**必校验 §1 七项**，其余表头表体按 §2–§3 选填展示。映射：`hsCode`←`codeTs`，`pcs`←`packNo`，`trafMode`←`cusTrafMode`，`supvMode`←`supvModeCdde`（**报关方式=监管方式**），`amount`←各行 `declTotal` 合计等，详见源说明。

---

*产品部门 · 关务组 · 2026-09-03*
