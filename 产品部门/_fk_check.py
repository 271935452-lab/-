# -*- coding: utf-8 -*-
import json
from pathlib import Path
import gen_req_checklist as g

data = json.loads(g.JSON_PATH.read_text(encoding="utf-8"))
raw = g.from_problem_rows("风控组", g.load_sheet_rows(data, "风控组"), "sheet", "P1")
lines = ["raw FK sheet titles:"]
for it in raw:
    lines.append(" - " + it["title"][:80])

items = g.build_all(data)
lines.append(f"\nfinal total={len(items)}")
lines.append("final FK:")
for it in items:
    if it["group"] == "风控组":
        lines.append(f"{it['id']} | {it['title'][:70]} | note={(it.get('note') or '')[:60]}")

# simulate drop decisions
extras = g.research_extras()
keeper = next(x for x in extras if "查货操作列表" in x["title"])
lines.append("\ndrop decisions vs keeper:")
for it in raw:
    title = it["title"]
    drop = (
        title.strip() in ("智能体",)
        or "超品名" in title
        or title.startswith("附加费手动")
        or ("主要是查货操作" in title and "加收附加费" in title)
    )
    lines.append(f"  drop={drop} | {title[:60]}")

Path("_fk_check.txt").write_text("\n".join(lines), encoding="utf-8")
print("wrote")
