"""根据导出页员工名称/昵称，匹配并回填导入数据的员工工号。"""
import pandas as pd

FILE_IMPORT = r"d:\Cursor\头程项目\提成管理\导入数据_已调整_v2.xlsx"
FILE_EXPORT = r"d:\Cursor\头程项目\提成管理\导出当前页 (5).xlsx"
FILE_OUT = FILE_IMPORT


def normalize_name(series: pd.Series) -> pd.Series:
    return (
        series.astype(str)
        .str.strip()
        .str.replace("\u3000", "", regex=False)
        .str.replace(" ", "", regex=False)
        .replace({"nan": "", "None": "", "NaT": ""})
    )


def build_maps(df_export: pd.DataFrame) -> tuple[pd.Series, pd.Series]:
    name_map = (
        df_export[["员工编号", "员工名称"]]
        .dropna(subset=["员工名称"])
        .assign(员工名称=lambda d: normalize_name(d["员工名称"]))
        .query('员工名称 != ""')
        .drop_duplicates(subset=["员工名称"], keep="first")
        .set_index("员工名称")["员工编号"]
    )
    nick_map = (
        df_export[["员工编号", "员工昵称"]]
        .dropna(subset=["员工昵称"])
        .assign(员工昵称=lambda d: normalize_name(d["员工昵称"]))
        .query('员工昵称 != ""')
        .drop_duplicates(subset=["员工昵称"], keep="first")
        .set_index("员工昵称")["员工编号"]
    )
    return name_map, nick_map


def match_employee_ids(df_main: pd.DataFrame, name_map: pd.Series, nick_map: pd.Series) -> pd.Series:
    name_col = df_main.columns[9]
    nick_col = df_main.columns[8]
    names = normalize_name(df_main[name_col])
    nicks = normalize_name(df_main[nick_col])

    result = pd.Series([pd.NA] * len(df_main), index=df_main.index, dtype="object")
    for src in (names, nicks):
        for mapping in (name_map, nick_map):
            hit = src.map(mapping)
            result = result.fillna(hit)
    return result


def main():
    xl = pd.ExcelFile(FILE_IMPORT)
    header_code_row = pd.read_excel(FILE_IMPORT, sheet_name="Sheet1", header=None, nrows=1)
    df_main = pd.read_excel(FILE_IMPORT, sheet_name="Sheet1", header=1)
    df_export = pd.read_excel(FILE_EXPORT, sheet_name="数据", header=0)

    id_col = df_main.columns[10]
    name_map, nick_map = build_maps(df_export)
    matched_ids = match_employee_ids(df_main, name_map, nick_map)

    before = int(df_main[id_col].notna().sum())
    df_main[id_col] = matched_ids
    after = int(df_main[id_col].notna().sum())

    out_path = FILE_OUT
    try:
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            header_code_row.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=0)
            df_main.to_excel(writer, sheet_name="Sheet1", index=False, startrow=1)
            if len(xl.sheet_names) > 1:
                sheet2 = xl.sheet_names[1]
                try:
                    df_sheet2 = pd.read_excel(FILE_IMPORT, sheet_name=sheet2, header=None)
                    df_sheet2.to_excel(writer, sheet_name=sheet2, index=False, header=False)
                except Exception:
                    pd.DataFrame().to_excel(writer, sheet_name=sheet2, index=False, header=False)
    except PermissionError:
        out_path = FILE_IMPORT.replace(".xlsx", "_工号已匹配.xlsx")
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            header_code_row.to_excel(writer, sheet_name="Sheet1", index=False, header=False, startrow=0)
            df_main.to_excel(writer, sheet_name="Sheet1", index=False, startrow=1)
            if len(xl.sheet_names) > 1:
                sheet2 = xl.sheet_names[1]
                try:
                    df_sheet2 = pd.read_excel(FILE_IMPORT, sheet_name=sheet2, header=None)
                    df_sheet2.to_excel(writer, sheet_name=sheet2, index=False, header=False)
                except Exception:
                    pd.DataFrame().to_excel(writer, sheet_name=sheet2, index=False, header=False)

    names = normalize_name(df_main[df_main.columns[9]])
    unmatched = sorted(names[matched_ids.isna()].unique())
    print(f"导出员工表：{len(df_export)} 行，员工名称 {len(name_map)} 个，员工昵称 {len(nick_map)} 个")
    print(f"完成：{after}/{len(df_main)} 行已匹配员工编号（原 {before} 行，新增 {after - before} 行）")
    print(f"未匹配员工名称 {len(unmatched)} 个")
    if unmatched:
        print("未匹配示例：", "、".join(unmatched[:15]))
    print(f"输出文件：{out_path}")


if __name__ == "__main__":
    main()
