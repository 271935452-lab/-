"""关联毛利调整明细，按系统名+月份计算「调整直客业务员毛利」列。"""
import pandas as pd

FILE_MAIN = r"d:\Cursor\头程项目\提成管理\提成已发放明细2025.10-2026.05（直客毛利净利润提成）(1)_已调整_v2.xlsx"
FILE_ADJ = r"d:\Cursor\头程项目\提成管理\毛利调整明细2025.10-2026.05.xlsx"
FILE_OUT = FILE_MAIN

# 1. 读取调整明细，按 系统名 + B列期间 汇总 E + F
df_adj = pd.read_excel(FILE_ADJ, sheet_name="Sheet1")
b_col = df_adj.columns[1]   # B 列：期间
c_col = df_adj.columns[2]   # C 列：系统名
e_col = df_adj.columns[4]   # E 列
f_col = df_adj.columns[5]   # F 列

for col in [e_col, f_col]:
    df_adj[col] = pd.to_numeric(df_adj[col], errors="coerce").fillna(0)

adj_sum = (
    df_adj.groupby([c_col, b_col], as_index=False)[[e_col, f_col]]
    .sum()
    .assign(_adj_ef=lambda d: d[e_col] + d[f_col])
)

# 2. 读取已发放明细（保留前 2 行表头及 Sheet2）
xl = pd.ExcelFile(FILE_MAIN)
header_rows = pd.read_excel(FILE_MAIN, sheet_name="Sheet1", header=None, nrows=2)
df_main = pd.read_excel(FILE_MAIN, sheet_name="Sheet1", header=2)
df_sheet2 = (
    pd.read_excel(FILE_MAIN, sheet_name="Sheet2", header=None)
    if "Sheet2" in xl.sheet_names
    else None
)

w_col = df_main.columns[22]   # W 列：期间
z_col = df_main.columns[25]   # Z 列：系统名
au_col = df_main.columns[46]  # AU 列：直客业务员毛利

# 3. 按 系统名 + 月份 关联，计算/覆盖新列
base = df_main.drop(columns=["调整直客业务员毛利"], errors="ignore")
merged = base.merge(
    adj_sum[[c_col, b_col, "_adj_ef"]],
    left_on=[z_col, w_col],
    right_on=[c_col, b_col],
    how="left",
)

merged["调整直客业务员毛利"] = (
    pd.to_numeric(merged[au_col], errors="coerce").fillna(0)
    + merged["_adj_ef"].fillna(0)
)

df_out = merged.drop(columns=[c for c in [c_col, b_col, "_adj_ef"] if c in merged.columns])

# 4. 写回 Excel
out_path = FILE_OUT
try:
    with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
        header_rows.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=0)
        df_out.to_excel(writer, sheet_name="Sheet1", index=False, startrow=2)
        if df_sheet2 is not None:
            df_sheet2.to_excel(writer, sheet_name="Sheet2", index=False, header=False)
except PermissionError:
    out_path = FILE_MAIN.replace(".xlsx", "_v3.xlsx")
    with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
        header_rows.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=0)
        df_out.to_excel(writer, sheet_name="Sheet1", index=False, startrow=2)
        if df_sheet2 is not None:
            df_sheet2.to_excel(writer, sheet_name="Sheet2", index=False, header=False)

matched = int(merged["_adj_ef"].notna().sum())
changed = int(
    (merged["调整直客业务员毛利"] != pd.to_numeric(merged[au_col], errors="coerce").fillna(0)).sum()
)
print(f"完成：共 {len(df_out)} 行，{matched} 行按「系统名+月份」匹配到调整数据")
print(f"其中 {changed} 行 E+F 调整金额不为 0")
print(f"输出文件：{out_path}")
