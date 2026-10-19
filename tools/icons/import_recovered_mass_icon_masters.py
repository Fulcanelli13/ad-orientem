#!/usr/bin/env python3
"""Import explicitly accepted Ad Orientem 2026-10-19 SVG masters from a review ZIP.

Review-only: never overwrites a different file; never touches the LIVE reader.
Dry-run is the default. Pass --write after inspecting the reported status.
"""
import argparse
import hashlib
import json
import re
import sys
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

MANIFEST = Path("data/presentation/mass-icon-recovered-svg-snapshot-20261020.v1.json")
DEST = Path("assets/review/mass-icon-candidates/recovered-20261020")
BAD_ELEMENTS = {"image", "foreignObject", "script", "filter"}
BAD_PALETTE = re.compile(rb"(?:#[0-9a-fA-F]{3,8}|rgba?\(|hsla?\()", re.IGNORECASE)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--archive", required=True, type=Path, help="13-asset verified review ZIP")
    parser.add_argument("--repo-root", type=Path, default=Path("."))
    parser.add_argument("--write", action="store_true", help="Stage verified SVGs in review folder")
    args = parser.parse_args()
    root = args.repo_root.resolve()
    manifest = json.loads((root / MANIFEST).read_text("utf-8"))
    if manifest["status"] != "ARCHIVE_RECOVERED_VERIFIED_LOCALLY_NOT_YET_IN_GITHUB":
        raise ValueError("Unexpected manifest lifecycle; review before proceeding")
    entries = manifest["entries"]
    if len(entries) != 13:
        raise ValueError(f"Expected 13 accepted entries, found {len(entries)}")
    archive = args.archive.resolve()
    if not archive.is_file():
        raise FileNotFoundError(archive)
    examined = []
    with zipfile.ZipFile(archive) as zf:
        for entry in entries:
            name = entry["name"]
            if Path(name).name != name or not name.endswith(".svg"):
                raise ValueError(f"Unsafe manifest filename: {name}")
            if entry["editorialStatus"] != "ACCEPTED_FOR_POTENTIAL_USE":
                raise ValueError(f"Non-approved asset refused: {name}")
            payload = zf.read(name)
            digest = hashlib.sha256(payload).hexdigest()
            if digest != entry["sha256"] or len(payload) != entry["bytes"]:
                raise ValueError(f"Hash/size mismatch: {name}")
            if b"currentColor" not in payload or BAD_PALETTE.search(payload):
                raise ValueError(f"SVG palette is not theme-safe: {name}")
            svg = ET.fromstring(payload)
            if svg.tag.rsplit("}", 1)[-1] != "svg":
                raise ValueError(f"Not an SVG root: {name}")
            if any(node.tag.rsplit("}", 1)[-1] in BAD_ELEMENTS for node in svg.iter()):
                raise ValueError(f"Embedded images/scripts/effects not permitted: {name}")
            target = root / DEST / name
            if target.exists() and target.read_bytes() != payload:
                raise FileExistsError(f"Different file already exists: {target}")
            examined.append((name, payload, target))
    if args.write:
        (root / DEST).mkdir(parents=True, exist_ok=True)
        for name, payload, target in examined:
            if not target.exists():
                target.write_bytes(payload)
            print(f"STAGED {name} sha256={hashlib.sha256(payload).hexdigest()[:16]}")
    else:
        for name, payload, target in examined:
            state = "ALREADY PRESENT" if target.exists() else "READY TO STAGE"
            print(f"{state}: {name} ({len(payload)} bytes)")
        print("All 13 passed. Rerun with --write to stage for review; production remains untouched.")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (ValueError, OSError, KeyError, ET.ParseError, zipfile.BadZipFile) as exc:
        print(f"IMPORT REFUSED: {exc}", file=sys.stderr)
        raise SystemExit(2)
