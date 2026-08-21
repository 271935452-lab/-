# -*- coding: utf-8 -*-
"""5月账期归档表：G列业务员 → 导出表C列员工昵称 → 匹配员工编号，新增「员工工号」列。"""
from __future__ import annotations

from pathlib import Path

import pandas as pd

BASE = Path(r"d:\Cursor\头程项目\提成管理")
FILE_EXPORT = BASE / "导出当前页 (5).xlsx"
ARCHIVE_DIR = BASE / "5月账期归档表"
NEW_COL = "员工工号"
SALES_COL = "业务员"
MANUAL_NICK_MAP = {
    "黑猫警长-深圳业务员": "BT0005-BT",
}


def normalize_name(series: pd.Series) -> pd.Series:
    return (
        series.astype(str)
        .str.strip()
        .str.replace("\u3000", "", regex=False)
        .str.replace(" ", "", regex=False)
        .replace({"nan": "", "None": "", "NaT": ""})
    )


def build_nick_map(df_export: pd.DataFrame) -> pd.Series:
    nick_col = df_export.columns[2]  # C列 员工昵称
    id_col = df_export.columns[1]  # B列 员工编号
    return (
        df_export[[id_col, nick_col]]
        .dropna(subset=[nick_col])
        .assign(**{nick_col: lambda d: normalize_name(d[nick_col])})
        .query(f'`{nick_col}` != ""')
        .drop_duplicates(subset=[nick_col], keep="first")
        .set_index(nick_col)[id_col]
    )


def insert_employee_id(df: pd.DataFrame, nick_map: pd.Series) -> tuple[pd.DataFrame, int, list[str]]:
    if SALES_COL not in df.columns:
        raise ValueError(f"未找到「{SALES_COL}」列，当前列：{list(df.columns)}")

    sales = normalize_name(df[SALES_COL])
    full_map = {**nick_map.to_dict(), **MANUAL_NICK_MAP}
    matched = sales.map(full_map)

    out = df.copy()
    if NEW_COL in out.columns:
        out = out.drop(columns=[NEW_COL])

    insert_at = out.columns.get_loc(SALES_COL) + 1
    out.insert(insert_at, NEW_COL, matched)

    matched_count = int(matched.notna().sum())
    unmatched = sorted(
        str(x) for x in sales[matched.isna() & (sales != "")].unique()
    )
    return out, matched_count, unmatched


def process_file(path: Path, nick_map: pd.Series) -> dict:
    xl = pd.ExcelFile(path)
    sheet = xl.sheet_names[0]
    df = pd.read_excel(path, sheet_name=sheet, header=0)
    out_df, matched_count, unmatched = insert_employee_id(df, nick_map)

    out_path = path
    try:
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            out_df.to_excel(writer, sheet_name=sheet, index=False)
    except PermissionError:
        out_path = path.with_name(path.stem + "_工号已匹配.xlsx")
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            out_df.to_excel(writer, sheet_name=sheet, index=False)

    return {
        "file": str(path.relative_to(BASE)),
        "rows": len(df),
        "matched": matched_count,
        "unmatched": unmatched,
        "out": str(out_path.relative_to(BASE)),
    }


def main():
    sheet_name = pd.ExcelFile(FILE_EXPORT).sheet_names[0]
    df_export = pd.read_excel(FILE_EXPORT, sheet_name=sheet_name, header=0)
    nick_map = build_nick_map(df_export)

    files = sorted(
        p
        for p in ARCHIVE_DIR.rglob("*.xlsx")
        if not p.name.startswith("~$")
    )
    if not files:
        raise SystemExit(f"未找到归档文件：{ARCHIVE_DIR}")

    all_unmatched: dict[str, int] = {}
    print(f"员工昵称映射：{len(nick_map)} 条")
    print(f"待处理文件：{len(files)} 个\n")

    for path in files:
        result = process_file(path, nick_map)
        print(
            f"{result['file']}：{result['matched']}/{result['rows']} 行已匹配"
            + (f" → {result['out']}" if result["out"] != result["file"] else "")
        )
        for name in result["unmatched"]:
            all_unmatched[name] = all_unmatched.get(name, 0) + 1

    if all_unmatched:
        print(f"\n未匹配业务员昵称 {len(all_unmatched)} 个：")
        for name, cnt in sorted(all_unmatched.items(), key=lambda x: -x[1]):
            print(f"  · {name}（{cnt} 行）")
    else:
        print("\n全部业务员均已匹配到员工工号。")


if __name__ == "__main__":
    main()
