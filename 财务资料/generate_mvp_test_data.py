# -*- coding: utf-8 -*-
"""兼容入口：一键生成「人员映射全量」测试数据（推荐）。"""
from pathlib import Path
import importlib.util

_here = Path(__file__).resolve().parent
_spec = importlib.util.spec_from_file_location("_full", _here / "generate_full_personnel_coverage.py")
_mod = importlib.util.module_from_spec(_spec)
assert _spec.loader
_spec.loader.exec_module(_mod)

if __name__ == "__main__":
    _mod.main()
