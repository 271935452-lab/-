# -*- coding: utf-8 -*-
"""为 *-PRD.html 增加 prd-body 锚点与 hash 滚动脚本。"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SCROLL = """    <script>
    if (window.self !== window.top) document.documentElement.classList.add("ess-prd-embed");
    (function () {
      function scrollToHash() {
        var id = (location.hash || "").replace(/^#/, "");
        if (!id) return;
        var el = document.getElementById(id);
        if (el) el.scrollIntoView({ block: "start", behavior: "auto" });
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", scrollToHash);
      else scrollToHash();
      window.addEventListener("hashchange", scrollToHash);
    })();
  </script>"""

OLD_EMBED = '<script>if (window.self !== window.top) document.documentElement.classList.add("ess-prd-embed");</script>'


def patch(text: str) -> str:
    if "function scrollToHash" not in text:
        if OLD_EMBED in text:
            text = text.replace(OLD_EMBED, SCROLL, 1)
        else:
            text = re.sub(
                r"<script>\s*if \(window\.self !== window\.top\)[^<]*</script>",
                SCROLL.strip(),
                text,
                count=1,
            )
    if 'id="prd-body"' not in text:
        text = re.sub(
            r'(<section class="card")(?![^>]*\bid=)(>)',
            r'\1 id="prd-body"\2',
            text,
            count=1,
        )
    return text


def main() -> None:
    n = 0
    for path in ROOT.rglob("*-PRD.html"):
        if path.name == "散货AI询价报价-需求PRD.html":
            continue
        orig = path.read_text(encoding="utf-8")
        new = patch(orig)
        if new != orig:
            path.write_text(new, encoding="utf-8")
            n += 1
    print(f"patched {n} PRD files")


if __name__ == "__main__":
    main()
