#!/usr/bin/env python3
from pathlib import Path
import hashlib, json

ROOT = Path(__file__).resolve().parents[1]
manifest = json.loads((ROOT / "migration/mass-v1.76/extraction-manifest-r19.json").read_text(encoding="utf-8"))
shell = json.loads((ROOT / manifest["shellBundle"]).read_text(encoding="utf-8"))
reader_manifest = json.loads((ROOT / manifest["readerPartsManifest"]).read_text(encoding="utf-8"))

reader = "".join((ROOT / item["path"]).read_text(encoding="utf-8") for item in reader_manifest["parts"])
reader_bytes = reader.encode("utf-8")
reader_sha = hashlib.sha256(reader_bytes).hexdigest()
assert len(reader) == reader_manifest["originalChars"], (len(reader), reader_manifest["originalChars"])
assert len(reader_bytes) == reader_manifest["originalBytes"], (len(reader_bytes), reader_manifest["originalBytes"])
assert reader_sha == reader_manifest["originalSha256"], (reader_sha, reader_manifest["originalSha256"])

bodies = []
for record in manifest["records"]:
    if record["transport"] == "READER_SOURCE_PARTS":
        body = reader
    else:
        body = (ROOT / record["target_path"]).read_text(encoding="utf-8")
    assert len(body) == record["chars"], (record["order"], len(body), record["chars"])
    bodies.append(body)

parts = []
for i, body in enumerate(bodies):
    parts.append(shell[i])
    parts.append(body)
parts.append(shell[-1])
source = "".join(parts)
payload = source.encode("utf-8")
sha = hashlib.sha256(payload).hexdigest()

assert len(source) == manifest["fullChars"], (len(source), manifest["fullChars"])
assert len(payload) == manifest["fullBytes"], (len(payload), manifest["fullBytes"])
assert sha == manifest["fullSha256"], (sha, manifest["fullSha256"])

print(f"PASS v1.76 full reconstruction: {len(payload)} bytes {sha}")
print(f"PASS reader reconstruction: {len(reader_bytes)} bytes {reader_sha}")
