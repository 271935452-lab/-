"""根据毛利/提成调整数据，生成 Sheet2「每月毛利调整明细」账期汇总表。"""
import pandas as pd

FILE_MAIN = r"d:\Cursor\头程项目\提成管理\提成已发放明细2025.10-2026.05（直客毛利净利润提成）(1)_已调整_v2.xlsx"
FILE_GP = r"d:\Cursor\头程项目\提成管理\毛利调整明细2025.10-2026.05.xlsx"
FILE_COMM = r"d:\Cursor\头程项目\提成管理\新毛利调整明细2025.10-2026.05(1).xlsx"
FILE_OUT = FILE_MAIN

SHEET2_COLUMNS = [
    "系统名",
    "职员",
    "行类型",
    "单号",
    "月份",
    "归档净利润",
    "当前净利润",
    "毛利调整±",
    "归档提成系数",
    "调整后提成系数",
    "归档应发",
    "调整后应发",
    "本期提成调整±",
    "客户单号",
    "客户单号-归档净利润",
    "客户单号-当前净利润",
    "客户单号-毛利调整±",
    "客户单号-归档应发",
    "客户单号-调整后应发",
    "客户单号-本期提成调整±",
]


def fmt_rate(val):
    x = pd.to_numeric(val, errors="coerce")
    if pd.isna(x):
        return ""
    if abs(x) <= 1:
        x *= 100
    return f"{x:.2f}%".rstrip("0").rstrip(".").replace(".0%", "%")


def calc_adj_rate(archived_net, adj_net, archived_pay, adj_pay, archived_rate):
    net = pd.to_numeric(adj_net, errors="coerce")
    pay = pd.to_numeric(adj_pay, errors="coerce")
    if pd.notna(net) and pd.notna(pay) and abs(net) > 0.01:
        return fmt_rate(pay / net)
    return fmt_rate(archived_rate)


def build_sheet2(df_main, df_gp, df_comm):
    z_col = df_main.columns[25]
    staff_col = df_main.columns[26]
    month_col = df_main.columns[22]
    au_col = df_main.columns[46]
    bj_col = df_main.columns[61]
    rate_col = df_main.columns[56]
    adj_au_col = df_main.columns[76]
    adj_bj_col = df_main.columns[75]

    gp_month = df_gp.columns[1]
    gp_sys = df_gp.columns[2]
    gp_e, gp_f = df_gp.columns[4], df_gp.columns[5]
    cm_month = df_comm.columns[1]
    cm_sys = df_comm.columns[2]
    cm_i = df_comm.columns[8]

    for col in [gp_e, gp_f]:
        df_gp[col] = pd.to_numeric(df_gp[col], errors="coerce")
    df_comm[cm_i] = pd.to_numeric(df_comm[cm_i], errors="coerce")

    gp_agg = (
        df_gp.groupby([gp_sys, gp_month], as_index=False)[[gp_e, gp_f]]
        .sum()
        .rename(columns={gp_sys: "系统名", gp_month: "月份", gp_e: "_gp_e", gp_f: "_gp_f"})
    )
    gp_agg["_gp_adj"] = gp_agg["_gp_e"].fillna(0) + gp_agg["_gp_f"].fillna(0)

    cm_agg = (
        df_comm.groupby([cm_sys, cm_month], as_index=False)[cm_i]
        .sum()
        .rename(columns={cm_sys: "系统名", cm_month: "月份", cm_i: "_comm_adj"})
    )

    keys = pd.concat([
        gp_agg[["系统名", "月份"]],
        cm_agg[["系统名", "月份"]],
    ]).drop_duplicates()

    main_cols = [z_col, staff_col, month_col, au_col, bj_col, rate_col, adj_au_col, adj_bj_col]
    main_view = df_main[main_cols].rename(columns={
        z_col: "系统名",
        staff_col: "职员",
        month_col: "月份",
        au_col: "_archived_net",
        bj_col: "_archived_pay",
        rate_col: "_archived_rate",
        adj_au_col: "_current_net",
        adj_bj_col: "_adj_pay",
    })

    detail = keys.merge(main_view, on=["系统名", "月份"], how="left")
    detail = detail.merge(gp_agg[["系统名", "月份", "_gp_adj"]], on=["系统名", "月份"], how="left")
    detail = detail.merge(cm_agg, on=["系统名", "月份"], how="left")

    detail["_archived_net"] = pd.to_numeric(detail["_archived_net"], errors="coerce").fillna(0)
    detail["_current_net"] = pd.to_numeric(detail["_current_net"], errors="coerce").fillna(0)
    detail["_archived_pay"] = pd.to_numeric(detail["_archived_pay"], errors="coerce").fillna(0)
    detail["_adj_pay"] = pd.to_numeric(detail["_adj_pay"], errors="coerce").fillna(0)
    detail["_gp_adj"] = pd.to_numeric(detail["_gp_adj"], errors="coerce").fillna(0)
    detail["_comm_adj"] = pd.to_numeric(detail["_comm_adj"], errors="coerce").fillna(0)

    # 无匹配主表时，用归档值 + 调整额回推
    mask_no_current = detail["_current_net"].abs() < 1e-9
    detail.loc[mask_no_current, "_current_net"] = (
        detail.loc[mask_no_current, "_archived_net"] + detail.loc[mask_no_current, "_gp_adj"]
    )
    mask_no_adj_pay = detail["_adj_pay"].abs() < 1e-9
    detail.loc[mask_no_adj_pay, "_adj_pay"] = (
        detail.loc[mask_no_adj_pay, "_archived_pay"] + detail.loc[mask_no_adj_pay, "_comm_adj"]
    )

    detail = detail[
        (detail["_gp_adj"].abs() > 1e-9) | (detail["_comm_adj"].abs() > 1e-9)
    ].copy()

    detail.sort_values(["系统名", "月份"], inplace=True)

    rows = []
    for sys_name, grp in detail.groupby("系统名", sort=False):
        staff = grp["职员"].dropna().iloc[0] if grp["职员"].notna().any() else sys_name
        for _, r in grp.iterrows():
            archived_rate = fmt_rate(r["_archived_rate"])
            adj_rate = calc_adj_rate(
                r["_archived_net"], r["_current_net"],
                r["_archived_pay"], r["_adj_pay"], r["_archived_rate"],
            )
            rows.append({
                "系统名": sys_name,
                "职员": staff,
                "行类型": "账期汇总",
                "单号": "",
                "月份": r["月份"],
                "归档净利润": round(r["_archived_net"], 2),
                "当前净利润": round(r["_current_net"], 2),
                "毛利调整±": round(r["_current_net"] - r["_archived_net"], 2),
                "归档提成系数": archived_rate,
                "调整后提成系数": adj_rate,
                "归档应发": round(r["_archived_pay"], 2),
                "调整后应发": round(r["_adj_pay"], 2),
                "本期提成调整±": round(r["_adj_pay"] - r["_archived_pay"], 2),
                "客户单号": "",
                "客户单号-归档净利润": "",
                "客户单号-当前净利润": "",
                "客户单号-毛利调整±": "",
                "客户单号-归档应发": "",
                "客户单号-调整后应发": "",
                "客户单号-本期提成调整±": "",
            })

        rows.append({
            "系统名": sys_name,
            "职员": staff,
            "行类型": "合计",
            "单号": "",
            "月份": "合计",
            "归档净利润": round(grp["_archived_net"].sum(), 2),
            "当前净利润": round(grp["_current_net"].sum(), 2),
            "毛利调整±": round((grp["_current_net"] - grp["_archived_net"]).sum(), 2),
            "归档提成系数": "—",
            "调整后提成系数": "—",
            "归档应发": round(grp["_archived_pay"].sum(), 2),
            "调整后应发": round(grp["_adj_pay"].sum(), 2),
            "本期提成调整±": round((grp["_adj_pay"] - grp["_archived_pay"]).sum(), 2),
            "客户单号": "",
            "客户单号-归档净利润": "",
            "客户单号-当前净利润": "",
            "客户单号-毛利调整±": "",
            "客户单号-归档应发": "",
            "客户单号-调整后应发": "",
            "客户单号-本期提成调整±": "",
        })

    out = pd.DataFrame(rows, columns=SHEET2_COLUMNS)

    title = pd.DataFrame([{
        "系统名": "每月毛利调整明细（账期汇总；客户单号/运单明细暂无，留空）",
        **{c: "" for c in SHEET2_COLUMNS[1:]},
    }])
    header_hint = pd.DataFrame([{
        "系统名": "对应页面：每月毛利调整明细表-MVP.html · 账期汇总区",
        **{c: "" for c in SHEET2_COLUMNS[1:]},
    }])
    return pd.concat([title, header_hint, out], ignore_index=True)


def main():
    xl = pd.ExcelFile(FILE_MAIN)
    header_rows = pd.read_excel(FILE_MAIN, sheet_name="Sheet1", header=None, nrows=2)
    df_main = pd.read_excel(FILE_MAIN, sheet_name="Sheet1", header=2)
    df_gp = pd.read_excel(FILE_GP)
    df_comm = pd.read_excel(FILE_COMM)

    sheet2 = build_sheet2(df_main, df_gp, df_comm)

    out_path = FILE_OUT
    try:
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            header_rows.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=0)
            df_main.to_excel(writer, sheet_name="Sheet1", index=False, startrow=2)
            sheet2.to_excel(writer, sheet_name="Sheet2", index=False)
    except PermissionError:
        out_path = FILE_OUT.replace(".xlsx", "_v3.xlsx")
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            header_rows.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=0)
            df_main.to_excel(writer, sheet_name="Sheet1", index=False, startrow=2)
            sheet2.to_excel(writer, sheet_name="Sheet2", index=False)

    month_rows = (sheet2["行类型"] == "账期汇总").sum()
    persons = sheet2.loc[sheet2["行类型"] == "合计", "系统名"].nunique()
    print(f"完成：Sheet2 已生成 {persons} 人、{month_rows} 条账期汇总行（运单明细留空）")
    print(f"输出文件：{out_path}")


if __name__ == "__main__":
    main()
