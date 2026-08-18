# -*- coding: utf-8 -*-
from pathlib import Path

DIR = Path(__file__).resolve().parent / "流程图" / "drawio-mmd"
OUT = Path(__file__).resolve().parent / "产品部门-全流程-drawio代码包.html"

FILES = [
    ("L0+L1 合体（HTML对齐）", "00-L0加L1-HTML对齐.mmd"),
    ("L0 主链路阶段", "00-L0-主链路阶段.mmd"),
    ("L1 部门泳道矩阵", "01-L1-部门泳道矩阵.mmd"),
    ("H 跨组交接", "02-H-跨组交接.mmd"),
    ("L2-S1 私卡询价报价", "10-L2-S1-私卡询价报价.mmd"),
    ("L2-S2 合约价确认", "11-L2-S2-合约价确认.mmd"),
    ("L2-S3 提单管理", "12-L2-S3-提单管理.mmd"),
    ("L2-S4 报关四切片", "13-L2-S4-报关四切片.mmd"),
    ("L2-S5 查货查验", "14-L2-S5-查货查验.mmd"),
    ("L2-S6 开船∥进港", "15-L2-S6-进港.mmd"),
    ("L2-S7 预估尾单", "16-L2-S7-预估尾单.mmd"),
    ("L2-S8 工单边界", "17-L2-S8-工单边界.mmd"),
]


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


blocks = []
toc = []
for i, (title, name) in enumerate(FILES):
    text = (DIR / name).read_text(encoding="utf-8")
    toc.append(f'<a href="#b{i}">{title}</a>')
    blocks.append(
        f"""
    <section class="card" id="b{i}">
      <div class="hd">
        <h2>{title}</h2>
        <div class="acts">
          <span class="file">{name}</span>
          <button type="button" class="copy" data-idx="{i}">复制 Mermaid</button>
        </div>
      </div>
      <pre class="code" id="c{i}">{esc(text)}</pre>
    </section>"""
    )

html = f"""<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>全流程 · draw.io Mermaid 代码包</title>
<style>
:root {{ --navy:#0b1f3a; --bg:#f0f2f5; --card:#fff; --line:#e8e8e8; --blue:#1890ff; --sub:rgba(0,0,0,.45); }}
* {{ box-sizing:border-box; }}
body {{ margin:0; font-family:"Microsoft YaHei","PingFang SC",Arial,sans-serif; font-size:13px; background:var(--bg); color:rgba(0,0,0,.88); }}
.top {{ position:sticky; top:0; z-index:10; background:var(--navy); color:#fff; padding:10px 16px; display:flex; flex-wrap:wrap; gap:10px; align-items:center; justify-content:space-between; }}
.top h1 {{ margin:0; font-size:16px; }}
.top a {{ color:#91d5ff; text-decoration:none; margin-left:10px; font-size:12px; }}
.wrap {{ max-width:1100px; margin:0 auto; padding:14px 16px 48px; }}
.banner {{ background:linear-gradient(135deg,#003a8c,#1890ff); color:#fff; border-radius:10px; padding:14px 16px; margin-bottom:14px; }}
.banner h2 {{ margin:0 0 6px; font-size:15px; }}
.banner ol {{ margin:8px 0 0; padding-left:20px; font-size:12px; line-height:1.7; opacity:.95; }}
.toc {{ display:flex; flex-wrap:wrap; gap:8px; margin-bottom:14px; }}
.toc a {{ background:#fff; border:1px solid var(--line); border-radius:6px; padding:6px 10px; color:#0958d9; text-decoration:none; font-size:12px; font-weight:600; }}
.toc a:hover {{ border-color:var(--blue); }}
.card {{ background:var(--card); border:1px solid var(--line); border-radius:8px; margin-bottom:12px; overflow:hidden; }}
.hd {{ display:flex; flex-wrap:wrap; gap:8px; align-items:center; justify-content:space-between; padding:10px 12px; background:#fafafa; border-bottom:1px solid var(--line); }}
.hd h2 {{ margin:0; font-size:14px; }}
.acts {{ display:flex; gap:8px; align-items:center; flex-wrap:wrap; }}
.file {{ font-size:11px; color:var(--sub); }}
.copy {{ height:28px; padding:0 12px; border:none; border-radius:4px; background:var(--blue); color:#fff; cursor:pointer; font:inherit; font-weight:600; }}
.copy:hover {{ opacity:.92; }}
.copy.ok {{ background:#389e0d; }}
.code {{ margin:0; padding:12px 14px; overflow:auto; max-height:360px; font-family:Consolas,"Courier New",monospace; font-size:12px; line-height:1.5; white-space:pre; background:#0b1f3a; color:#e6f7ff; }}
.foot {{ text-align:center; font-size:11px; color:var(--sub); margin-top:8px; }}
</style>
</head>
<body>
<div class="top">
  <div><h1>全流程 · draw.io Mermaid 代码包</h1></div>
  <div>
    <a href="产品部门-全流程-大图包小图-评审版.html">大图包小图评审页</a>
    <a href="流程图/drawio-mmd/00-导入drawio说明.txt">导入说明</a>
    <a href="../产品部门-导航.html">导航</a>
  </div>
</div>
<div class="wrap">
  <div class="banner">
    <h2>怎么用（复制到 draw.io）</h2>
    <ol>
      <li>点下方「复制 Mermaid」</li>
      <li>打开 draw.io → <b>排列 → 插入 → 高级 → Mermaid…</b></li>
      <li>粘贴 → 插入。建议每张图单独一页，不要全塞一张画布</li>
      <li>源文件也在：<code>各组sop/流程图/drawio-mmd/*.mmd</code></li>
    </ol>
  </div>
  <div class="toc">{''.join(toc)}</div>
  {''.join(blocks)}
  <p class="foot">大图包小图 · 不含点价订舱 · 旁支不进主链路</p>
</div>
<script>
document.querySelectorAll('.copy').forEach(function(btn){{
  btn.addEventListener('click', function(){{
    var i = btn.getAttribute('data-idx');
    var text = document.getElementById('c'+i).innerText;
    navigator.clipboard.writeText(text).then(function(){{
      btn.textContent = '已复制';
      btn.classList.add('ok');
      setTimeout(function(){{ btn.textContent='复制 Mermaid'; btn.classList.remove('ok'); }}, 1600);
    }});
  }});
}});
</script>
</body>
</html>
"""

OUT.write_text(html, encoding="utf-8")
print("wrote", OUT)
print("mmd", len(list(DIR.glob("*.mmd"))))
