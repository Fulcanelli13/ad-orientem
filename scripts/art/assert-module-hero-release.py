#!/usr/bin/env python3
"""Block release of an Ad Orientem module hero without every image-quality gate.

No art acquisition, mutation, or publishing. Exit 1 on any missing evidence.
Use only when proposing a specific module's production promotion, NOT for
running the rest of the app while these masters are intentionally unready.
"""
import argparse
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
MANIFEST = ROOT / "data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json"
EXPECTED = (
    "object_match", "artwork_state_preserved", "colour_white_balance",
    "tonal_intent", "texture_vs_noise", "focus_sharpness",
    "no_glare_or_perspective", "no_jpeg_damage_or_halation",
    "uncropped_whole_work", "mobile_focal_layout",
)

def validate(module):
    problems = []
    if module.get("editorial_approved") is not True:
        problems.append("editorial hero not user-approved")
    if not module.get("physical_master_acquired"):
        problems.append("original image bytes not acquired")
    digest = module.get("sha256")
    if not isinstance(digest, str) or re.fullmatch("[0-9a-fA-F]{64}", digest) is None:
        problems.append("no valid original SHA-256")
    if not module.get("local_master_path"):
        problems.append("no permanent original master path recorded")
    if module.get("visual_quality", {}).get("verdict") != "PASS":
        problems.append("actual source-resolution visual-quality review not approved")
    checks = module.get("visual_quality", {}).get("reproduction_checks", {})
    for key in EXPECTED:
        if checks.get(key) != "pass":
            problems.append("image visual QA pending: " + key)
    if not module.get("rights_release_cleared"):
        problems.append("exact photo/image rights and attribution not approved")
    if not module.get("app_ready_crop_verified") or not module.get("crop_spec"):
        problems.append("mobile/desktop composition not explicitly approved")
    if not module.get("source_master_verified"):
        problems.append("exact object and actual original source not cross-verified")
    return problems

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("module_id", help="One approved module ID (e.g. rosary, confession, sorrows)")
    args=p.parse_args()
    d=json.loads(MANIFEST.read_text(encoding="utf-8"))
    matches=[e for e in d["entries"] if e["module_id"]==args.module_id]
    if len(matches)!=1:
        print("UNKNOWN MODULE:",args.module_id,file=sys.stderr)
        return 2
    errors=validate(matches[0])
    if errors:
        print("BLOCKED: ",args.module_id)
        for item in errors:
            print(" -",item)
        return 1
    print("READY FOR ART INTEGRATION QA, not proof of actual app release:", args.module_id)
    return 0

if __name__ == "__main__":
    sys.exit(main())
