#!/usr/bin/env python3
"""Strict import/verification of the 14 original user-supplied Mass icon PNGs.
Run from the repository root with Python 3 (stdlib only). Supports both archive layouts.
  python scripts/import-user-mass-icon-originals.py /path/to/archive.zip --install
  python scripts/import-user-mass-icon-originals.py --verify-bank
All originals remain review-only. This does not approve or activate artwork.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import sys
import zipfile

LEDGER = Path("data/presentation/mass-icon-user-supplied-family-originals-20261020.v1.json")
DEST = Path("assets/review/mass-icon-originals-20261019")

def hashes(data):
    return (
        hashlib.sha256(data).hexdigest(),
        hashlib.sha1(b"blob " + str(len(data)).encode() + b"\0" + data).hexdigest(),
    )

def run():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument("archive", nargs="?", type=Path)
    p.add_argument("--install", action="store_true")
    p.add_argument("--verify-bank", action="store_true")
    p.add_argument("--repo-root", type=Path, default=Path.cwd())
    a = p.parse_args()
    if a.install and a.verify_bank:
        p.error("--install and --verify-bank cannot both be set")
    if not a.archive and not a.verify_bank:
        p.error("archive is required for source verification or installation")
    root = a.repo_root.resolve()
    doc = json.loads((root / LEDGER).read_text(encoding="utf-8"))
    items = doc["assets"]
    if len(items) != 14 or doc["authority"] != "PRESERVATION_ONLY_NOT_APPROVAL":
        raise ValueError("unexpected reference ledger / approval status")
    files = {}
    if not a.verify_bank:
        with zipfile.ZipFile(a.archive) as z:
            for x in items:
                name = x["sourceFilename"]
                if Path(name).name != name or "\\" in name:
                    raise ValueError("unsafe source name " + name)
                candidates = ["originals/" + name, (DEST / name).as_posix()]
                available = [entry for entry in candidates if entry in z.namelist()]
                if len(available) != 1:
                    raise ValueError("expected exactly one archive member for " + name)
                raw = z.read(available[0])
                if (*hashes(raw), len(raw)) != (
                    x["sha256"], x["gitBlobSha1"], x["sizeBytes"]
                ):
                    raise ValueError("source mismatch: " + name)
                files[name] = raw
    existing, missing = [], []
    for x in items:
        target = root / DEST / x["sourceFilename"]
        if target.is_symlink():
            raise ValueError("unsafe symlink: " + str(target))
        if target.exists():
            if hashes(target.read_bytes()) != (x["sha256"], x["gitBlobSha1"]):
                raise ValueError("bank asset conflicts with original: " + str(target))
            existing.append(target)
        else:
            missing.append(target)
    if a.install:
        (root / DEST).mkdir(parents=True, exist_ok=True)
        for target in missing:
            fd = os.open(target, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o644)
            with os.fdopen(fd, "wb") as out:
                out.write(files[target.name])
        existing.extend(missing)
        missing = []
    result = {
        "verified_source_pngs": len(files),
        "bank_present": len(existing),
        "bank_missing": len(missing),
        "destination": str(DEST),
        "state": "COMPLETE_ORIGINAL_BYTES" if not missing else "INCOMPLETE",
        "missing": [x.name for x in missing],
        "runtime_changed": False, "existing_approved_assets_replaced": False
    }
    print(json.dumps(result, indent=2))
    return 2 if a.verify_bank and missing else 0

if __name__ == "__main__":
    try:
        sys.exit(run())
    except (OSError, KeyError, ValueError, zipfile.BadZipFile) as exc:
        print("ERROR:", exc, file=sys.stderr)
        sys.exit(1)
