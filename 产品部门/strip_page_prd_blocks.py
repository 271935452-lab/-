# -*- coding: utf-8 -*-
"""从原型页剥离 ess-prd-source / todo-tip，写入独立 *-PRD.html（规则引擎页除外）。"""
from __future__ import annotations

import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 规则引擎：保留页内说明
KEEP_INLINE = {
    "私卡报价-AI报价规则配置-MVP.html",
}

# 已是 PRD / 方案 / 计划 / 导航，不处理
SKIP_NAME_PATTERNS = (
    r"-PRD\.html$",
    r"需求PRD",
    r"大致方案\.html$",
    r"产品部门-对开发-",
    r"产品部门-导航\.html$",
    r"原型导航",
    r"-导航\.html$",
    r"流程图",
    r"组流程图",
    r"会议纪要",
    r"评审版\.html$",
    r"发群一屏",
)

SKIP_DIRS = {"__pycache__", ".git", "node_modules", "_extract_tmp"}

# 已有总 PRD，不重复生成 sidecar
MERGED_INTO = {
    "ESS询价报价-报价员列表-MVP.html": "报价组/散货AI询价报价-需求PRD.html",
    "ESS散货询价方案详情-MVP.html": "报价组/散货AI询价报价-需求PRD.html",
    "ESS询价编辑-APP-散货-MVP.html": "报价组/散货AI询价报价-需求PRD.html",
    "ESS我的报价-列表-MVP.html": "报价组/散货AI询价报价-需求PRD.html",
    "ESS询价编辑-MVP.html": "报价组/散货AI询价报价-需求PRD.html",
}

PRD_SHELL = """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{title}</title>
  <style>
    :root {{ --bg:#f5f7fb; --card:#fff; --line:#e5e7eb; --text:#111827; --sub:#6b7280; --blue:#2563eb; }}
    * {{ box-sizing:border-box; }}
    body {{ margin:0; background:var(--bg); color:var(--text);
      font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif; font-size:14px; }}
    a {{ color:var(--blue); }}
    .page {{ max-width:920px; margin:0 auto; padding:20px 16px 48px; }}
    .hero {{ background:linear-gradient(135deg,#1e3a5f,#2563eb); color:#fff;
      border-radius:12px; padding:16px 18px; margin-bottom:14px; }}
    .hero h1 {{ margin:0 0 6px; font-size:18px; }}
    .hero p {{ margin:0; font-size:13px; line-height:1.65; opacity:.95; }}
    .card {{ background:var(--card); border:1px solid var(--line); border-radius:12px;
      padding:16px 18px; line-height:1.7; }}
    .card h3 {{ margin:14px 0 8px; font-size:15px; }}
    .card h4 {{ margin:12px 0 6px; font-size:14px; }}
    .card ul {{ margin:0; padding-left:18px; }}
    .foot {{ text-align:center; font-size:12px; color:var(--sub); margin-top:16px; }}
    html.ess-prd-embed body {{ background: #f8fafc; }}
    html.ess-prd-embed .page {{ max-width: none; margin: 0; padding: 8px 8px 24px; }}
    html.ess-prd-embed .hero {{ padding: 10px 12px; margin-bottom: 8px; border-radius: 8px; }}
    html.ess-prd-embed .hero h1 {{ font-size: 16px; }}
    html.ess-prd-embed .card {{ padding: 12px 14px; margin-bottom: 8px; }}
  </style>
</head>
<body>
    <script>
    if (window.self !== window.top) document.documentElement.classList.add("ess-prd-embed");
    (function () {{
      function scrollToHash() {{
        var id = (location.hash || "").replace(/^#/, "");
        if (!id) return;
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({{ block: "start", behavior: "auto" }});
      }}
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scrollToHash);
      else scrollToHash();
      window.addEventListener("hashchange", scrollToHash);
    }})();
  </script>
  <div class="page">
    <section class="hero">
      <h1>{title}</h1>
      <p>{date} · 原型：<a href="{proto_href}" style="color:#fff">{proto_name}</a></p>
    </section>
    <section class="card" id="prd-body">
{body}
    </section>
    <p class="foot">产品部门 · 由原型页 ess-prd-source 剥离</p>
  </div>
</body>
</html>
"""

RE_ESS = re.compile(
    r'<div\s+class="ess-prd-source"[^>]*>.*?</div>\s*',
    re.DOTALL | re.IGNORECASE,
)
RE_TODO = re.compile(
    r'<div\s+class="todo-tip"[^>]*>.*?</div>\s*',
    re.DOTALL | re.IGNORECASE,
)
RE_TODO_CSS = re.compile(
    r"\s*\.todo-tip\s*\{[^}]*\}\s*(\.todo-tip\s+[^{]+\{[^}]*\}\s*)?",
    re.DOTALL,
)
RE_ESS_CSS = re.compile(
    r"\s*\.ess-prd-source\s*\{[^}]*\}\s*"
    r"(\.ess-prd-chip\s*\{[^}]*\}\s*)?"
    r"(\.ess-prd-source\s+[^{]+\{[^}]*\}\s*)*",
    re.DOTALL,
)


def should_skip(path: Path) -> bool:
    name = path.name
    if name in KEEP_INLINE:
        return True
    for pat in SKIP_NAME_PATTERNS:
        if re.search(pat, name):
            return True
    return False


def rel_href(from_dir: Path, to: Path) -> str:
    try:
        return Path(os_path_relpath(from_dir, to)).as_posix()
    except Exception:
        return to.name


def os_path_relpath(from_dir: Path, to: Path) -> str:
    import os

    return os.path.relpath(to, from_dir)


def extract_inner(block: str) -> str:
    m = re.search(r'<div\s+class="ess-prd-source"[^>]*>(.*)</div>\s*$', block, re.DOTALL | re.IGNORECASE)
    if not m:
        return ""
    inner = m.group(1).strip()
    inner = re.sub(r'^\s*<span\s+class="ess-prd-chip"[^>]*>.*?</span>\s*', "", inner, flags=re.DOTALL | re.IGNORECASE)
    return inner.strip()


def write_prd(html_path: Path, inner: str) -> Path | None:
    if len(inner) < 40:
        return None
    if "散货AI询价报价-需求PRD.html" in inner and inner.count("<li>") < 3:
        return None
    merged = MERGED_INTO.get(html_path.name)
    if merged:
        return None

    out = html_path.with_name(html_path.stem + "-PRD.html")
    if out.exists():
        return None

    title_m = re.search(r"<h3[^>]*>(.*?)</h3>", inner, re.DOTALL | re.IGNORECASE)
    title = re.sub(r"<[^>]+>", "", title_m.group(1)).strip() if title_m else html_path.stem
    proto_rel = html_path.name
    body = "\n".join("      " + line if line.strip() else line for line in inner.splitlines())
    out.write_text(
        PRD_SHELL.format(
            title=title + " · PRD",
            date=date.today().isoformat(),
            proto_href=proto_rel,
            proto_name=html_path.name,
            body=body,
        ),
        encoding="utf-8",
    )
    return out


def process_file(path: Path) -> dict:
    text = path.read_text(encoding="utf-8")
    orig = text
    created = None
    removed_ess = False
    removed_todo = False

    for m in list(RE_ESS.finditer(text)):
        inner = extract_inner(m.group(0))
        if inner and not created:
            p = write_prd(path, inner)
            if p:
                created = p
    if RE_ESS.search(text):
        text = RE_ESS.sub("", text)
        removed_ess = True

    if RE_TODO.search(text):
        text = RE_TODO.sub("\n", text)
        removed_todo = True

    if removed_ess or removed_todo:
        text = RE_TODO_CSS.sub("\n", text)
        text = RE_ESS_CSS.sub("\n", text)
        text = re.sub(r"\n{4,}", "\n\n\n", text)

    if text != orig:
        path.write_text(text, encoding="utf-8")

    return {"file": path, "ess": removed_ess, "todo": removed_todo, "prd": created}


def main() -> None:
    stats = {"files": 0, "ess": 0, "todo": 0, "prd": 0}
    created_list: list[str] = []

    for path in sorted(ROOT.rglob("*.html")):
        if any(p in SKIP_DIRS for p in path.parts):
            continue
        if should_skip(path):
            continue
        r = process_file(path)
        if r["ess"] or r["todo"]:
            stats["files"] += 1
            if r["ess"]:
                stats["ess"] += 1
            if r["todo"]:
                stats["todo"] += 1
            if r["prd"]:
                stats["prd"] += 1
                created_list.append(str(r["prd"].relative_to(ROOT)))

    print(f"Updated {stats['files']} HTML files (ess={stats['ess']}, todo={stats['todo']}, new_prd={stats['prd']})")
    for c in created_list[:30]:
        print(f"  + {c}")
    if len(created_list) > 30:
        print(f"  ... and {len(created_list) - 30} more")


if __name__ == "__main__":
    main()
