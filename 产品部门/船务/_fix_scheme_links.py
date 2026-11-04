# -*- coding: utf-8 -*-
"""Restore 船务组-订舱仓位装柜-评审导航.html from git HEAD, then fix scheme links."""
import re
import subprocess
from pathlib import Path

ROOT = Path(r"d:/Cursor/头程项目/产品部门/船务")
REPO = Path(r"d:/Cursor/头程项目")
NAV = ROOT / "船务组-订舱仓位装柜-评审导航.html"

SCHEME_FILES = [
    "义乌智能仓-自动配舱-方案确认.html",
    "义乌智能仓-自动配舱-场景.html",
    "义乌智能仓-自动配舱-待确认.html",
    "义乌智能仓-封门留货-关务对接确认.html",
    "义乌智能仓-规则到海外仓-泳道图.html",
    "义乌智能仓配舱规则.xlsx",
]

# Restore corrupted review nav from HEAD
rel = "产品部门/船务/船务组-订舱仓位装柜-评审导航.html"
raw = subprocess.check_output(["git", "-C", str(REPO), "show", f"HEAD:{rel}"])
NAV.write_bytes(raw)
print("restored", NAV.name, "bytes", len(raw))


def rewrite_text(text: str, from_scheme_folder: bool) -> str:
    """Prefix scheme file refs that are not already under 义乌智能仓-方案/."""
    out = text
    for name in SCHEME_FILES:
        # skip if already has folder prefix variants
        patterns = [
            # bare name
            (rf'(href=["\'])({re.escape(name)})', rf'\1义乌智能仓-方案/\2'),
            (rf'(href=["\'])(\.\./)({re.escape(name)})', rf'\1\2义乌智能仓-方案/\3'),
            (rf'(href=["\'])(\.\./\.\./)({re.escape(name)})', rf'\1\2义乌智能仓-方案/\3'),
        ]
        if from_scheme_folder:
            # inside folder: sibling links should stay bare — do not prefix
            continue
        for pat, repl in patterns:
            def _sub(m, _repl=repl, _name=name):
                whole = m.group(0)
                # already prefixed?
                if "义乌智能仓-方案/" + _name in whole or "义乌智能仓-方案/" in whole:
                    return whole
                return m.expand(_repl)
            out = re.sub(pat, _sub, out)
    # fix double prefix if any
    out = out.replace("义乌智能仓-方案/义乌智能仓-方案/", "义乌智能仓-方案/")
    return out


# Fix review nav links (outside folder)
nav_text = NAV.read_text(encoding="utf-8")
nav_new = rewrite_text(nav_text, from_scheme_folder=False)
if nav_new != nav_text:
    NAV.write_text(nav_new, encoding="utf-8", newline="\n")
    print("updated links in", NAV.name)
else:
    print("no link changes needed in", NAV.name)

# Fix other html/js outside 义乌智能仓-方案/
skip_dirs = {"义乌智能仓-方案", "__pycache__"}
changed = []
for path in ROOT.rglob("*"):
    if not path.is_file():
        continue
    if path.suffix.lower() not in {".html", ".js"}:
        continue
    if any(part in skip_dirs for part in path.parts):
        continue
    if path.name.startswith("_"):
        continue
    if path.resolve() == NAV.resolve():
        continue
    text = path.read_text(encoding="utf-8")
    new = rewrite_text(text, from_scheme_folder=False)
    if new != text:
        path.write_text(new, encoding="utf-8", newline="\n")
        changed.append(str(path.relative_to(ROOT)))

print("updated files:", len(changed))
for c in changed:
    print(" -", c)

# Verify nav
t = NAV.read_text(encoding="utf-8")
assert "原型入口" in t, "nav still broken encoding"
assert "义乌智能仓-方案/义乌智能仓-自动配舱-方案确认.html" in t or "义乌智能仓-自动配舱-方案确认.html" in t
print("verify ok: 原型入口 present")
hrefs = re.findall(r'href="([^"]*义乌[^"]*)"', t)
print("义乌 hrefs:")
for h in hrefs:
    print(" ", h)
