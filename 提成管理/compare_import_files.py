"""逐行对比「终」与「已过滤」两份导入数据。"""
import pandas as pd
import numpy as np

FILE_A = r"d:\Cursor\头程项目\提成管理\导入数据_已调整_v2---终.xlsx"
FILE_B = r"d:\Cursor\头程项目\提成管理\导入数据_已调整_v2_已过滤.xlsx"
REPORT = r"d:\Cursor\头程项目\提成管理\两文件对比报告.xlsx"

# 按列名对齐（两边语义相同的字段）
COMMON_COLS = [
    "序号", "标准回款率", "实际回款率", "结算状态", "发放状态", "会计期间",
    "员工工号", "提成角色", "收货件数", "收货计费重量", "应收合计", "已核销应收",
    "操作费", "内陆费", "业务员毛利调整", "表外毛利扣减", "净利润", "提成系数",
    "应发提成", "管理费用扣减", "财税扣减", "实发金额", "业务员毛利",
]

# 列名不完全一致时的映射：终列名 -> 已过滤列名
RENAME_B = {
    "员工在职状态": "员工状态",
    "应发提成.1": "应发提成",  # 已过滤有两个应发提成，终用应发提成.1
}


def norm(val):
    if pd.isna(val):
        return np.nan
    if isinstance(val, float) and np.isnan(val):
        return np.nan
    s = str(val).strip()
    return np.nan if s.lower() in ("", "nan", "none") else s


def num_close(a, b, tol=0.01):
    try:
        fa, fb = float(a), float(b)
        if np.isnan(fa) and np.isnan(fb):
            return True
        if np.isnan(fa) or np.isnan(fb):
            return False
        return abs(fa - fb) <= tol
    except (TypeError, ValueError):
        return norm(a) == norm(b)


def values_equal(a, b):
    if pd.isna(a) and pd.isna(b):
        return True
    if isinstance(a, (int, float)) or isinstance(b, (int, float)):
        return num_close(a, b)
    return norm(a) == norm(b)


def load_files():
    df_a = pd.read_excel(FILE_A, header=0)
    df_b = pd.read_excel(FILE_B, header=0)
    # 已过滤的第二个「应发提成」列在终里叫「应发提成.1」
    b_cols = list(df_b.columns)
    if b_cols.count("应发提成") >= 2:
        idx = [i for i, c in enumerate(b_cols) if c == "应发提成"][-1]
        b_cols[idx] = "应发提成.1"
        df_b.columns = b_cols
    return df_a, df_b


def build_compare_cols(df_a, df_b):
    pairs = []
    for col in COMMON_COLS:
        col_b = RENAME_B.get(col, col)
        if col in df_a.columns and col_b in df_b.columns:
            pairs.append((col, col_b))
        elif col == "应发提成.1" and col in df_a.columns and "应发提成.1" in df_b.columns:
            pairs.append(("应发提成.1", "应发提成.1"))
    return pairs


def match_rows(df_a, df_b):
    """按行号优先，同时用 期间+姓名 校验。"""
    period_a, name_a = df_a.columns[6], df_a.columns[7]
    period_b = df_b.columns[6]
    name_b, nick_b = df_b.columns[9], df_b.columns[8]

    rows = []
    n = max(len(df_a), len(df_b))
    for i in range(n):
        ra = df_a.iloc[i] if i < len(df_a) else None
        rb = df_b.iloc[i] if i < len(df_b) else None
        if ra is not None and rb is not None:
            pa, na = norm(ra[period_a]), norm(ra[name_a])
            pb = norm(rb[period_b])
            nb, nk = norm(rb[name_b]), norm(rb[nick_b])
            key_ok = (pa == pb) and (na == nb or na == nk or nk == na)
        else:
            key_ok = False
            pa = na = pb = nb = nk = np.nan
        rows.append({
            "行号": i + 2,  # Excel 行（含表头）
            "终_会计期间": pa,
            "终_员工名称": na,
            "过滤_会计期间": pb,
            "过滤_员工名称": nb,
            "过滤_对应业务员昵称": nk,
            "键是否一致": key_ok,
            "终有数据": ra is not None,
            "过滤有数据": rb is not None,
        })
    return pd.DataFrame(rows), df_a, df_b


def compare_values(df_a, df_b, pairs):
    diffs = []
    period_a, name_a = df_a.columns[6], df_a.columns[7]
    period_b = df_b.columns[6]
    name_b, nick_b = df_b.columns[9], df_b.columns[8]

    for i in range(min(len(df_a), len(df_b))):
        ra, rb = df_a.iloc[i], df_b.iloc[i]
        pa, na = norm(ra[period_a]), norm(ra[name_a])
        pb = norm(rb[period_b])
        nb, nk = norm(rb[name_b]), norm(rb[nick_b])

        # 跳过终的空行
        if pd.isna(na) or na is np.nan or str(na) == "nan":
            continue

        if not ((pa == pb) and (na == nb or na == nk)):
            diffs.append({
                "行号": i + 2,
                "问题类型": "键不一致",
                "字段": "会计期间/员工名称",
                "终值": f"{pa}|{na}",
                "过滤值": f"{pb}|{nb}/{nk}",
            })
            continue

        for col_a, col_b in pairs:
            va, vb = ra[col_a], rb[col_b]
            if not values_equal(va, vb):
                diffs.append({
                    "行号": i + 2,
                    "问题类型": "数值/内容不一致",
                    "字段": col_a,
                    "终值": va,
                    "过滤值": vb,
                })
    return pd.DataFrame(diffs)


def main():
    df_a, df_b = load_files()
    pairs = build_compare_cols(df_a, df_b)
    key_df, df_a, df_b = match_rows(df_a, df_b)

    print("=" * 50)
    print(f"「终」行数：{len(df_a)}，列数：{len(df_a.columns)}")
    print(f"「已过滤」行数：{len(df_b)}，列数：{len(df_b.columns)}")
    print(f"可比公共字段：{len(pairs)} 个")

    # 终的有效数据行（非空员工名称）
    valid_a = df_a[df_a.iloc[:, 7].notna() & (df_a.iloc[:, 7].astype(str).str.strip() != "")]
    blank_a = len(df_a) - len(valid_a)
    print(f"「终」有效数据行：{len(valid_a)}，空行：{blank_a}")

    # 按行号对比（前 min 行）
    n_compare = min(len(df_a), len(df_b))
    key_ok_count = 0
    for i in range(n_compare):
        pa = norm(df_a.iloc[i, 6])
        na = norm(df_a.iloc[i, 7])
        if pd.isna(na):
            continue
        pb = norm(df_b.iloc[i, 6])
        nb = norm(df_b.iloc[i, 9])
        nk = norm(df_b.iloc[i, 8])
        if pa == pb and (na == nb or na == nk):
            key_ok_count += 1

    diff_df = compare_values(df_a, df_b, pairs)

    print(f"\n按行号+期间/姓名，键一致的有效行：{key_ok_count}")
    print(f"字段内容不一致：{len(diff_df[diff_df['问题类型']=='数值/内容不一致']) if len(diff_df) else 0} 处")
    print(f"键不一致：{len(diff_df[diff_df['问题类型']=='键不一致']) if len(diff_df) else 0} 处")

    if len(df_a) != len(df_b):
        print(f"\n⚠ 行数不同：差 {abs(len(df_a)-len(df_b))} 行（「终」含 {blank_a} 行空行占位）")

    if len(diff_df) == 0 and key_ok_count == len(valid_a) and len(valid_a) == len(df_b):
        print("\n结论：有效数据行全部对得上 ✓")
    elif len(diff_df) == 0 and key_ok_count == len(df_b):
        print(f"\n结论：{len(df_b)} 行有效数据字段全部一致；「终」额外有 {blank_a} 行空行")
    else:
        print("\n结论：存在不一致，详见报告")

    # 额外：用 期间+姓名 在已过滤中找终的每一有效行
    unmatched_in_b = []
    period_b, name_b, nick_b = df_b.columns[6], df_b.columns[9], df_b.columns[8]
    for i, ra in valid_a.iterrows():
        pa, na = norm(ra[df_a.columns[6]]), norm(ra[df_a.columns[7]])
        hit = df_b[
            (df_b[period_b].astype(str).str.strip() == str(pa))
            & ((df_b[name_b].astype(str).str.strip() == str(na)) | (df_b[nick_b].astype(str).str.strip() == str(na)))
        ]
        if len(hit) == 0:
            unmatched_in_b.append({"行号": i + 2, "会计期间": pa, "员工名称": na})

    only_in_b = len(df_b) - key_ok_count if len(df_b) > key_ok_count else 0

    summary = pd.DataFrame([
        {"项目": "终 总行数", "值": len(df_a)},
        {"项目": "已过滤 总行数", "值": len(df_b)},
        {"项目": "终 空行数", "值": blank_a},
        {"项目": "终 有效数据行", "值": len(valid_a)},
        {"项目": "按行号键一致行数", "值": key_ok_count},
        {"项目": "字段不一致处数", "值": len(diff_df[diff_df['问题类型']=='数值/内容不一致']) if len(diff_df) else 0},
        {"项目": "键不一致处数", "值": len(diff_df[diff_df['问题类型']=='键不一致']) if len(diff_df) else 0},
        {"项目": "终有效行在已过滤中找不到", "值": len(unmatched_in_b)},
    ])

    with pd.ExcelWriter(REPORT, engine="openpyxl") as w:
        summary.to_excel(w, sheet_name="汇总", index=False)
        if len(diff_df):
            diff_df.to_excel(w, sheet_name="不一致明细", index=False)
        if unmatched_in_b:
            pd.DataFrame(unmatched_in_b).to_excel(w, sheet_name="终有已过滤无", index=False)
        key_df.head(1200).to_excel(w, sheet_name="行号键对照", index=False)

    print(f"\n报告已保存：{REPORT}")
    if len(diff_df):
        print("\n不一致样例（前10）：")
        print(diff_df.head(10).to_string(index=False))


if __name__ == "__main__":
    main()
