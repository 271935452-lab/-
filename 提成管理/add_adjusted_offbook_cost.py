"""Q列业务员毛利调整 + R列表外毛利扣减，新增「调整表外成本扣减」列。"""
import pandas as pd

FILE = r"d:\Cursor\头程项目\提成管理\导入数据_已调整_v2---终.xlsx"
NEW_COL = "调整表外成本扣减"


def main():
    df = pd.read_excel(FILE, header=0)
    q_col = df.columns[16]  # Q 列：业务员毛利调整
    r_col = df.columns[17]  # R 列：表外毛利扣减

    q = pd.to_numeric(df[q_col], errors="coerce").fillna(0)
    r = pd.to_numeric(df[r_col], errors="coerce").fillna(0)

    if NEW_COL in df.columns:
        df = df.drop(columns=[NEW_COL])

    df[NEW_COL] = (q + r).round(2)

    out_path = FILE
    try:
        df.to_excel(out_path, index=False)
    except PermissionError:
        out_path = FILE.replace(".xlsx", "_表外成本已调整.xlsx")
        df.to_excel(out_path, index=False)

    nonzero = int((df[NEW_COL] != 0).sum())
    print(f"完成：新增列「{NEW_COL}」= {q_col} + {r_col}")
    print(f"共 {len(df)} 行，其中 {nonzero} 行合计不为 0")
    print(f"输出文件：{out_path}")


if __name__ == "__main__":
    main()
