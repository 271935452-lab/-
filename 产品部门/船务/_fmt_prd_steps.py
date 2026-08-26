# -*- coding: utf-8 -*-
"""Turn wall-of-text PRD 说明 cells into <ol class="steps">. Run from this folder."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent

FILES = [
    "船务组-提单创建批量-AI识别-MVP-PRD.html",
    "船务组-提单管理-按周分组与分配-MVP-PRD.html",
    "船务组-待配仓-MVP-PRD.html",
    "船务组-终配舱-MVP-PRD.html",
    "船务组-客户协议价格维护-原型-PRD.html",
    "船务组-产品库-出货要求与收费标准-MVP-PRD.html",
    "船务组-下单-FBA录入-合规策略-MVP-PRD.html",
    "进口商管理-MVP-PRD.html",
    "进口商-清关行港口配置-MVP-PRD.html",
    "柜子编辑-绑定进口商-MVP-PRD.html",
    "数据字典-船公司航运-提单号规则-MVP-PRD.html",
    "船务组-运价管理-我司与代理订舱-MVP-PRD.html",
    "船务组-销售产品-报价管理-批量调价-MVP-PRD.html",
]

OPEN = re.compile(r"<td(\s[^>]*)?>", re.I)
CLOSE = "</td>"
TR = re.compile(r"(<tr\b[^>]*>)(.*?)(</tr>)", re.S | re.I)


def plain_len(html: str) -> int:
    t = re.sub(r"<[^>]+>", "", html)
    t = re.sub(r"&[a-z]+;", " ", t)
    return len(t.strip())


def split_zh(text: str) -> list[str]:
    parts: list[str] = []
    buf: list[str] = []
    q = p = cjk_p = 0
    i = 0
    n = len(text)
    while i < n:
        ch = text[i]
        if ch == "「":
            q += 1
        elif ch == "」" and q:
            q -= 1
        elif ch in "（(":
            p += 1 if ch == "(" else 0
            cjk_p += 1 if ch == "（" else 0
        elif ch == ")" and p:
            p -= 1
        elif ch == "）" and cjk_p:
            cjk_p -= 1
        if ch == "。" and not q and not p and not cjk_p:
            piece = "".join(buf).strip()
            if piece:
                parts.append(piece)
            buf = []
            i += 1
            continue
        buf.append(ch)
        i += 1
    tail = "".join(buf).strip()
    if tail:
        parts.append(tail)
    return parts


def merge_short(parts: list[str], min_len: int = 16) -> list[str]:
    if not parts:
        return parts
    out: list[str] = []
    for p in parts:
        if out and plain_len(out[-1]) < min_len:
            prev = out[-1]
            join = "。" if not prev.endswith(("。", "；", ";", "：", ":")) else ""
            out[-1] = prev + join + p
        else:
            out.append(p)
    if len(out) >= 2 and plain_len(out[-1]) < min_len:
        prev = out[-2]
        join = "。" if not prev.endswith(("。", "；", ";", "：", ":")) else ""
        out[-2] = prev + join + out[-1]
        out.pop()
    return out


def to_items(inner: str) -> list[str] | None:
    raw = inner.strip()
    if not raw or "<ol" in raw.lower() or "<ul" in raw.lower():
        return None
    if plain_len(raw) < 28 and "测：" not in raw:
        return None

    m = re.search(r"测：", raw)
    body = raw
    tests: list[str] = []
    if m:
        body = raw[: m.start()].rstrip("。；; \n")
        test_blob = raw[m.start() + 2 :].strip()
        tests = split_zh(test_blob)
        tests = merge_short(tests, 12)

    rules = split_zh(body) if body else []
    rules = merge_short(rules, 16)
    items = rules[:]
    for t in tests:
        t = t.strip()
        if not t:
            continue
        if t.startswith("测："):
            items.append(t)
        else:
            items.append("测：" + t)
    if len(items) < 2:
        return None
    return items


def wrap_ol(items: list[str]) -> str:
    lis = "".join(f"<li>{it}</li>" for it in items)
    return f'<ol class="steps">{lis}</ol>'


def td_class(open_tag: str) -> str:
    m = re.search(r'class="([^"]*)"', open_tag, re.I)
    return (m.group(1) if m else "").lower()


def process_tr_inner(inner: str) -> str:
    out: list[str] = []
    i = 0
    idx = 0
    while True:
        m = OPEN.search(inner, i)
        if not m:
            out.append(inner[i:])
            break
        out.append(inner[i : m.start()])
        open_tag = m.group(0)
        start = m.end()
        end = inner.find(CLOSE, start)
        if end < 0:
            out.append(inner[m.start() :])
            break
        content = inner[start:end]
        cls = td_class(open_tag)
        convert = (
            idx > 0
            and "proto" not in cls
            and "pos" not in cls
        )
        if convert:
            items = to_items(content)
            if items:
                content = wrap_ol(items)
        out.append(open_tag + content + CLOSE)
        i = end + len(CLOSE)
        idx += 1
    return "".join(out)


def process_html(html: str) -> str:
    def repl(m: re.Match) -> str:
        return m.group(1) + process_tr_inner(m.group(2)) + m.group(3)

    return TR.sub(repl, html)


def main() -> None:
    for name in FILES:
        path = ROOT / name
        old = path.read_text(encoding="utf-8")
        new = process_html(old)
        n_old = old.count('<ol class="steps">')
        n_new = new.count('<ol class="steps">')
        if new != old:
            path.write_text(new, encoding="utf-8")
        print(f"{name}  steps {n_old} -> {n_new}")


if __name__ == "__main__":
    main()
