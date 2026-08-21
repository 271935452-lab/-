"""H/I 不一致行：用 I 列匹配导出表员工昵称，回填单独工号列。"""
import pandas as pd

FILE_IMPORT = r"d:\Cursor\头程项目\提成管理\导入数据_已调整_v2---终.xlsx"
FILE_EXPORT = r"d:\Cursor\头程项目\提成管理\导出当前页 (5).xlsx"
FILE_OUT = FILE_IMPORT
NEW_COL = "I列昵称匹配工号"


def normalize_name(series: pd.Series) -> pd.Series:
    return (
        series.astype(str)
        .str.strip()
        .str.replace("\u3000", "", regex=False)
        .str.replace(" ", "", regex=False)
        .replace({"nan": "", "None": "", "NaT": ""})
    )


def build_nick_map(df_export: pd.DataFrame) -> pd.Series:
    return (
        df_export[["员工编号", "员工昵称"]]
        .dropna(subset=["员工昵称"])
        .assign(员工昵称=lambda d: normalize_name(d["员工昵称"]))
        .query('员工昵称 != ""')
        .drop_duplicates(subset=["员工昵称"], keep="first")
        .set_index("员工昵称")["员工编号"]
    )


def main():
    xl = pd.ExcelFile(FILE_IMPORT)
    header_code_row = pd.read_excel(FILE_IMPORT, sheet_name="Sheet1", header=None, nrows=1)
    header_blank_row = pd.read_excel(FILE_IMPORT, sheet_name="Sheet1", header=None, skiprows=1, nrows=1)
    df_main = pd.read_excel(FILE_IMPORT, sheet_name="Sheet1", header=2)
    df_export = pd.read_excel(FILE_EXPORT, sheet_name="数据", header=0)

    h_col = df_main.columns[7]
    i_col = df_main.columns[8]
    nick_map = build_nick_map(df_export)

    h = normalize_name(df_main[h_col])
    i = normalize_name(df_main[i_col])
    hi_mismatch = (h != i) & (h != "") & (i != "")

    if NEW_COL in df_main.columns:
        df_main = df_main.drop(columns=[NEW_COL])

    df_main[NEW_COL] = ""
    df_main.loc[hi_mismatch, NEW_COL] = i[hi_mismatch].map(nick_map).fillna("")

    matched_rows = int((hi_mismatch & (df_main[NEW_COL] != "")).sum())
    mismatch_rows = int(hi_mismatch.sum())
    not_found = sorted(i[hi_mismatch & (df_main[NEW_COL] == "")].unique())

    # 写回：保留第 1 行编码、第 2 行空行、第 3 行表头
    out_path = FILE_OUT
    try:
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            header_code_row.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=0)
            header_blank_row.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=1)
            df_main.to_excel(writer, sheet_name="Sheet1", index=False, startrow=2)
            if len(xl.sheet_names) > 1:
                sheet2 = xl.sheet_names[1]
                try:
                    df_sheet2 = pd.read_excel(FILE_IMPORT, sheet_name=sheet2, header=None)
                    df_sheet2.to_excel(writer, sheet_name=sheet2, index=False, header=False)
                except Exception:
                    pass
    except PermissionError:
        out_path = FILE_IMPORT.replace(".xlsx", "_昵称工号已标记.xlsx")
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            header_code_row.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=0)
            header_blank_row.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=1)
            df_main.to_excel(writer, sheet_name="Sheet1", index=False, startrow=2)
            if len(xl.sheet_names) > 1:
                sheet2 = xl.sheet_names[1]
                try:
                    df_sheet2 = pd.read_excel(FILE_IMPORT, sheet_name=sheet2, header=None)
                    df_sheet2.to_excel(writer, sheet_name=sheet2, index=False, header=False)
                except Exception:
                    pass

    print(f"H/I 不一致行：{mismatch_rows} 行")
    print(f"新增列「{NEW_COL}」：{matched_rows} 行匹配到工号")
    if not_found:
        print(f"未在导出表员工昵称中找到：{len(not_found)} 个 → " + "、".join(not_found))
    print(f"输出文件：{out_path}")


if __name__ == "__main__":
    main()
