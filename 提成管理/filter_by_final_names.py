"""按「终」版对齐过滤 v2：员工名称或对应业务员昵称匹配，条数与终一致。"""
import pandas as pd

FILE_V2 = r"d:\Cursor\头程项目\提成管理\导入数据_已调整_v2.xlsx"
FILE_REF = r"d:\Cursor\头程项目\提成管理\导入数据_已调整_v2---终.xlsx"
FILE_OUT = r"d:\Cursor\头程项目\提成管理\导入数据_已调整_v2_已过滤.xlsx"


def norm(val) -> str:
    if pd.isna(val):
        return ""
    return str(val).strip()


def main():
    xl = pd.ExcelFile(FILE_V2)
    df_v2 = pd.read_excel(FILE_V2, sheet_name="Sheet1", header=0)
    df_ref = pd.read_excel(FILE_REF, sheet_name="Sheet1", header=0)

    nick_col = df_v2.columns[8]
    name_col = df_v2.columns[9]
    period_col = df_v2.columns[6]
    ref_name_col = df_ref.columns[7]
    ref_period_col = df_ref.columns[6]

    ref_names = {norm(x) for x in df_ref[ref_name_col] if norm(x)}
    used_idx = set()
    out_rows = []
    matched = 0
    blank = 0
    missed = []

    blank_row = pd.Series({c: pd.NA for c in df_v2.columns})

    for _, ref_row in df_ref.iterrows():
        ref_name = norm(ref_row[ref_name_col])
        ref_period = norm(ref_row[ref_period_col])

        if not ref_name:
            out_rows.append(blank_row.copy())
            blank += 1
            continue

        candidates = df_v2[
            (df_v2[period_col].astype(str).str.strip() == ref_period)
            & (
                (df_v2[name_col].astype(str).str.strip() == ref_name)
                | (df_v2[nick_col].astype(str).str.strip() == ref_name)
            )
        ]
        candidates = candidates[~candidates.index.isin(used_idx)]

        if len(candidates):
            out_rows.append(candidates.iloc[0].copy())
            used_idx.add(candidates.index[0])
            matched += 1
        else:
            missed.append(f"{ref_period}|{ref_name}")
            out_rows.append(blank_row.copy())

    df_out = pd.DataFrame(out_rows).reset_index(drop=True)

    # 简单校验：姓名/昵称不在终中的 v2 原始行应未被使用
    s_name = df_v2[name_col].astype(str).str.strip()
    s_nick = df_v2[nick_col].astype(str).str.strip()
    removable = df_v2[
        ~((s_name.isin(ref_names)) | (s_nick.isin(ref_names)))
        & ~df_v2.index.isin(used_idx)
    ]

    out_path = FILE_OUT
    try:
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            df_out.to_excel(writer, sheet_name="Sheet1", index=False)
            if len(xl.sheet_names) > 1:
                sheet2 = xl.sheet_names[1]
                try:
                    df_sheet2 = pd.read_excel(FILE_V2, sheet_name=sheet2, header=None)
                    df_sheet2.to_excel(writer, sheet_name=sheet2, index=False, header=False)
                except Exception:
                    pass
    except PermissionError:
        out_path = FILE_OUT.replace(".xlsx", "_new.xlsx")
        with pd.ExcelWriter(out_path, engine="openpyxl") as writer:
            df_out.to_excel(writer, sheet_name="Sheet1", index=False)

    print(f"原 v2 行数：{len(df_v2)}")
    print(f"参考「终」行数：{len(df_ref)}")
    print(f"输出文件行数：{len(df_out)}")
    print(f"有效匹配行：{matched}，空行占位：{blank}")
    print(f"条数是否与「终」一致：{'是' if len(df_out) == len(df_ref) else '否'}")
    print(f"有效数据行是否与「终」一致：{'是' if matched == len(df_ref) - blank else '否'}")
    if len(removable):
        removed_names = sorted(set(s_name.loc[removable.index].tolist()))
        print(f"已排除不在「终」中的员工 {len(removed_names)} 人，共 {len(removable)} 行")
        print("排除员工：" + "、".join(removed_names))
    if missed:
        print(f"未匹配到 v2 数据的「终」行：{len(missed)}")
        for item in missed[:10]:
            print(f"  - {item}")
    print(f"输出文件：{out_path}")


if __name__ == "__main__":
    main()
