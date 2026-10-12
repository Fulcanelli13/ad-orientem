#!/usr/bin/env python3
"""Dedicated Formation acquisition lane using the canonical museum screening engine."""
import importlib.util
import sys
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
engine_path=ROOT/"tools/calendar/acquire-sacred-art-wide.py"
spec=importlib.util.spec_from_file_location("sacred_art_wide_engine",engine_path)
engine=importlib.util.module_from_spec(spec)
spec.loader.exec_module(engine)
engine.TARGETS=ROOT/"data/learn/sacred-art-formation-targets.v1.json"
engine.GROUPS["formation"]=lambda t:t["id"].startswith("formation.")
sys.argv=[str(engine_path),"--group","formation","--max-originals","35"]
engine.main()
