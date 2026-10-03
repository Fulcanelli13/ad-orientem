#!/usr/bin/env python3
from pathlib import Path
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
manifest_path = ROOT / "src/mass/legacy/reader-runtime-v1.76.parts/MANIFEST.json"
manifest = json.loads(manifest_path.read_text(encoding="utf-8"))

pieces = []
for item in manifest["parts"]:
    pieces.append((ROOT / item["path"]).read_text(encoding="utf-8"))
source = "".join(pieces)
payload = source.encode("utf-8")

if len(source) != manifest["originalChars"]:
    raise SystemExit(f"FAIL chars: {len(source)} != {manifest['originalChars']}")
if len(payload) != manifest["originalBytes"]:
    raise SystemExit(f"FAIL bytes: {len(payload)} != {manifest['originalBytes']}")
sha = hashlib.sha256(payload).hexdigest()
if sha != manifest["originalSha256"]:
    raise SystemExit(f"FAIL sha256: {sha} != {manifest['originalSha256']}")

out = ROOT / manifest["originalPath"]
out.write_text(source, encoding="utf-8")
print(f"PASS reader v1.76: {len(payload)} bytes {sha}")
