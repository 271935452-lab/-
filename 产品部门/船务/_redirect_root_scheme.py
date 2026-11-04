# -*- coding: utf-8 -*-
"""Replace root leftover scheme HTML with redirects into 义乌智能仓-方案/."""
from pathlib import Path

ROOT = Path(r"d:/Cursor/头程项目/产品部门/船务")
FOLDER = "义乌智能仓-方案"
files = [
    "义乌智能仓-自动配舱-方案确认.html",
    "义乌智能仓-封门留货-关务对接确认.html",
    "义乌智能仓-规则到海外仓-泳道图.html",
]

tpl = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="refresh" content="0; url={target}" />
  <title>已迁移 · {name}</title>
  <script>location.replace({js});</script>
</head>
<body>
  <p>方案文件已迁至 <a href="{target}">{folder}/{name}</a>。</p>
</body>
</html>
"""

for name in files:
    target = f"{FOLDER}/{name}"
    path = ROOT / name
    js = repr(target)
    path.write_text(
        tpl.format(target=target, name=name, folder=FOLDER, js=js),
        encoding="utf-8",
        newline="\n",
    )
    print("redirect", name, "->", target)

# Also fix any remaining bare links outside folder (except redirects we just wrote)
import re

SCHEME = [
    "义乌智能仓-自动配舱-方案确认.html",
    "义乌智能仓-自动配舱-场景.html",
    "义乌智能仓-自动配舱-待确认.html",
    "义乌智能仓-封门留货-关务对接确认.html",
    "义乌智能仓-规则到海外仓-泳道图.html",
    "义乌智能仓配舱规则.xlsx",
]

def fix(text: str) -> str:
    out = text
    for name in SCHEME:
        # href="name" or href='name' or href="../name"
        out = re.sub(
            rf'(href=["\'])(?!{re.escape(FOLDER)}/)({re.escape(name)})',
            rf'\1{FOLDER}/\2',
            out,
        )
        out = re.sub(
            rf'(href=["\'])(\.\./)(?!{re.escape(FOLDER)}/)({re.escape(name)})',
            rf'\1\2{FOLDER}/\3',
            out,
        )
    out = out.replace(f"{FOLDER}/{FOLDER}/", f"{FOLDER}/")
    return out

changed = []
for path in ROOT.rglob("*"):
    if not path.is_file():
        continue
    if path.suffix.lower() not in {".html", ".js"}:
        continue
    if FOLDER in path.parts:
        continue
    if path.name.startswith("_"):
        continue
    if path.name in files:
        # skip redirect stubs
        continue
    text = path.read_text(encoding="utf-8")
    new = fix(text)
    if new != text:
        path.write_text(new, encoding="utf-8", newline="\n")
        changed.append(str(path.relative_to(ROOT)))

print("link fixes:", len(changed))
for c in changed:
    print(" -", c)
