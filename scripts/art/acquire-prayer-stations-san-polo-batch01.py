#!/usr/bin/env python3
"""Archive up to three of the exact, source-matched Tiepolo San Polo originals.

Uses the existing Prayer Commons original SHA verification and licence gate.
Files remain in research staging; no App/Prayer release manifest changes.
The full fourteen-file metadata queue is immutable.
"""
import importlib.util
import sys
from pathlib import Path
root=Path(__file__).resolve().parents[2]
basepath=root/"scripts/art/acquire-prayer-originals-batch01.py"
spec=importlib.util.spec_from_file_location("ao_prayer_art_source_gate",basepath)
module=importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
module.LEDGER=root/"data/prayer/artwork-editorial-20261101/tiepolo-san-polo-stations-14-source-photos-20261101.v1.json"
module.REPORT=root/"data/prayer/artwork-editorial-20261101/tiepolo-san-polo-stations-originals-acquisition-batch01.v1.json"
module.STAGE=root/"assets/staged/prayer-stations-san-polo-originals-20261101"
module.MAX_FILE=16*1024*1024
module.MAX_BATCH=42*1024*1024
sys.argv=[sys.argv[0],"--download","--limit","3"]
raise SystemExit(module.main())
