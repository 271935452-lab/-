# -*- coding: utf-8 -*-
"""
从「数据映射与逻辑加工表.xls」→「人员映射表」读取全部数据行（含示例行），
为每一行生成：
  1）手工万能调整池：至少 1 条（与该行系统账号、员工姓名、备注对齐）；
  2）运单底表：至少 1 条（业务员/客服系统账号按提成岗位拆分，便于覆盖全场景）。

输出：
  测试数据_手工万能调整池_人员映射全量.xlsx
  测试数据_运单底表_人员映射全量.xlsx
"""
from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Tuple

import xlrd
from openpyxl import Workbook

ROOT = Path(__file__).resolve().parent
XLS_PATH = ROOT / "数据映射与逻辑加工表.xls"
SHEET_NAME = "人员映射表"

MONTH = "2026-03"
ARR_MONTH = "2026-03"
BATCH = "ARCH_202603_01"

FEE_GP = [
    "律师费费用成本",
    "内陆费",
    "操作费",
    "报销费",
    "仓储收费",
    "中信保买保险业务员毛利承担",
    "渠道提成附件",
]
FEE_COMM = [
    "业务客服工资",
    "资金成本占用费用",
    "师傅提成扣",
    "拼箱分箱物料明细",
    "未转正扣",
    "深圳提成补贴",
]

PRODUCTS = ["海运拼箱", "海运整柜", "空运标准", "渠道专线产品", "空运电商"]


def _cell_str(sh: xlrd.sheet.Sheet, rx: int, cx: int) -> str:
    v = sh.cell_value(rx, cx)
    if v is None:
        return ""
    if isinstance(v, float) and v == int(v):
        return str(int(v))
    return str(v).strip()


def load_rows() -> List[Dict[str, Any]]:
    wb = xlrd.open_workbook(str(XLS_PATH))
    sh = wb.sheet_by_name(SHEET_NAME)
    out: List[Dict[str, Any]] = []
    for rx in range(2, sh.nrows):
        acc = _cell_str(sh, rx, 1)
        if not acc:
            continue
        rule_pkg = _cell_str(sh, rx, 15) if sh.ncols > 15 else ""
        out.append(
            {
                "rx": rx,
                "remark": _cell_str(sh, rx, 0),
                "account": acc,
                "emp_name": _cell_str(sh, rx, 2),
                "branch": _cell_str(sh, rx, 3),
                "dept": _cell_str(sh, rx, 4),
                "group": _cell_str(sh, rx, 5),
                "role": _cell_str(sh, rx, 14),
                "rule_pkg": rule_pkg,
            }
        )
    return out


def pick_sales_cs(row: Dict[str, Any]) -> Tuple[str, str, str]:
    role = (row.get("role") or "").strip()
    account = row["account"]
    rx = row["rx"]

    if role == "渠道客服":
        return account, "渠道部客服", "有业务员"

    if role in ("同行客服", "分公司直客客服", "总部直客客服"):
        pool = ["同行业务员1", "坂田直客业务员1", "总部直客业务员1", "龙门直客业务员"]
        return pool[rx % len(pool)], account, "有业务员"

    if role == "客服主管":
        return "总部直客业务员1", account, "有业务员"

    if role in ("同行业务员", "同行经理"):
        return account, "无业务员客服", "无业务员"

    if role == "直客业务员主管":
        return account, "分公司直客客服", "有业务员"

    if role == "直客业务员":
        return account, "总部直客业务客服", "有业务员"

    return account, "总部直客业务客服", "有业务员"


def pick_customer_type(role: str) -> str:
    role = (role or "").strip()
    if role == "渠道客服":
        return "渠道"
    if role in ("同行业务员", "同行经理", "同行客服"):
        return "同行"
    return "直客"


def pick_rule_code(role: str, rx: int) -> str:
    role = (role or "").strip()
    if role == "渠道客服":
        return "CHANNEL_MANAGER_SETTLE"
    if role == "同行经理":
        return "PEER_MANAGER_CONTAINER_TIER"
    if role == "同行业务员":
        return "PEER_SALES_VOLUME_TIER"
    if role in ("同行客服", "分公司直客客服", "总部直客客服"):
        return "CS_WITH_SALES_RATE" if rx % 2 == 0 else "CS_NO_SALES_RATE"
    if role == "直客业务员主管":
        return "DIRECT_MANAGER_REVENUE_RATE"
    return "DIRECT_SALES_GP_TIER"


def build_waybill_id(rx: int) -> str:
    return "WB-MAP202603-%03d" % rx


def write_adjustment_pool(rows: List[Dict[str, Any]]) -> Path:
    wb = Workbook()
    ws = wb.active
    ws.title = "手工万能调整池"
    headers = (
        "*系统账户名称",
        "*员工姓名",
        "*月度",
        "运单号",
        "*费用性质",
        "*费用类型",
        "*成本金额",
        "*币种",
        "*调整类型",
        "客户名称",
        "对应客服",
        "备注",
        "运单号非必填",
    )
    ws.append(headers)

    for i, row in enumerate(rows):
        rx = row["rx"]
        wid = build_waybill_id(rx)
        use_comm = i % 2 == 1
        if use_comm:
            fee_nat = "扣提成"
            fee_type = FEE_COMM[i % len(FEE_COMM)]
            amt = 80 + (rx % 29) * 63
            adj = "减项"
        else:
            fee_nat = "扣毛利"
            fee_type = FEE_GP[i % len(FEE_GP)]
            amt = 120 + (rx % 23) * 47
            adj = "加项"

        remark_tail = (row["remark"] or "").replace("\n", " ")[:120]
        note = "映射表行号%d｜提成岗位:%s｜备注摘要:%s" % (
            rx + 1,
            row["role"] or "-",
            remark_tail + ("…" if len(row.get("remark") or "") > 120 else ""),
        )

        ws.append(
            [
                row["account"],
                row["emp_name"] or row["account"],
                MONTH,
                wid,
                fee_nat,
                fee_type,
                amt,
                "CNY",
                adj,
                row["branch"] + "-测试客户",
                "",
                note,
                "",
            ]
        )

    _autosize(ws)
    out = ROOT / "测试数据_手工万能调整池_人员映射全量.xlsx"
    wb.save(out)
    return out


def write_waybill_detail(rows: List[Dict[str, Any]], adjustments_meta: List[Dict[str, Any]]) -> Path:
    """adjustments_meta: parallel list with keys gp_amt, comm_amt per row index"""
    wb = Workbook()
    ws = wb.active
    ws.title = "运单底表明细"
    headers = (
        "映射表行号",
        "运单号",
        "到货月份",
        "计费重(kg)",
        "整柜数",
        "票数",
        "提单号",
        "柜号",
        "客户类型",
        "业务员系统账号",
        "客服系统账号",
        "应收",
        "业务员成本",
        "毛利",
        "销售产品",
        "产品组",
        "所属分公司",
        "实收",
        "回款率",
        "回款截止核算时间",
        "表外毛利扣汇总",
        "表外提成扣汇总",
        "计算净利润",
        "规则编码_演示",
        "客服是否有业务员",
        "归档批次号",
        "关联备注摘要",
    )
    ws.append(headers)

    for i, row in enumerate(rows):
        rx = row["rx"]
        wid = build_waybill_id(rx)
        sales_acc, cs_acc, cs_mode = pick_sales_cs(row)
        ctype = pick_customer_type(row["role"])

        base_ar = 32000 + rx * 919 + (i % 7) * 211
        cost = int(base_ar * 0.73) + rx * 31
        gp = base_ar - cost

        meta = adjustments_meta[i]
        sum_gp_d = meta["gp_deduct"]
        sum_comm_d = meta["comm_deduct"]
        calc_net = gp - sum_gp_d

        wt_kg = 1200 + rx * 137 + (i % 5) * 400
        teu = (rx % 4) if ctype != "渠道" else 0
        tickets = 5 + (rx % 40)

        ws.append(
            [
                rx + 1,
                wid,
                ARR_MONTH,
                wt_kg,
                teu,
                tickets,
                "HBL-AUTO-%05d" % rx,
                ("OOLU%07d" % (8800000 + rx)) if teu else "",
                ctype,
                sales_acc,
                cs_acc,
                base_ar,
                cost,
                gp,
                PRODUCTS[i % len(PRODUCTS)],
                (row["dept"] or "默认组")[:12],
                row["branch"] or "义乌总部",
                int(base_ar * 0.97),
                "97%",
                "2026-04-%02d 18:00" % (8 + (rx % 12)),
                sum_gp_d,
                sum_comm_d,
                calc_net,
                pick_rule_code(row["role"], rx),
                cs_mode,
                BATCH,
                (row["remark"] or "")[:200],
            ]
        )

    _autosize(ws)
    out = ROOT / "测试数据_运单底表_人员映射全量.xlsx"
    wb.save(out)
    return out


def _autosize(ws):
    for col in ws.columns:
        m = 10
        for cell in col:
            if cell.value is None:
                continue
            m = max(m, min(45, len(str(cell.value)) + 2))
        ws.column_dimensions[col[0].column_letter].width = m


def main():
    rows = load_rows()
    if not rows:
        raise SystemExit("未读取到人员映射行，请确认路径: %s" % XLS_PATH)

    # 与调整池金额对齐：奇数行扣提成金额写入 comm_deduct；偶数行扣毛利写入 gp_deduct
    meta: List[Dict[str, int]] = []
    for i, row in enumerate(rows):
        rx = row["rx"]
        use_comm = i % 2 == 1
        if use_comm:
            comm_amt = 80 + (rx % 29) * 63
            gp_amt = 0
        else:
            gp_amt = 120 + (rx % 23) * 47
            comm_amt = 0
        meta.append({"gp_deduct": gp_amt, "comm_deduct": comm_amt})

    adj_path = write_adjustment_pool(rows)
    wb_path = write_waybill_detail(rows, meta)
    print("人员映射行数:", len(rows))
    print("万能调整池:", adj_path)
    print("运单底表:", wb_path)


if __name__ == "__main__":
    main()
