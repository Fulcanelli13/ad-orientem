#!/usr/bin/env python3
"""Fail-closed binary and metadata audit for R68 before images can be published."""
import json,hashlib
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[1]
ledger=json.loads((ROOT/"data/geography/approved-place-gallery.v1.json").read_text(encoding="utf8"))
manifest=json.loads((ROOT/"data/geography/research/explore-r68-reviewed-photo-sources.v1.json").read_text(encoding="utf8"))
assert ledger["schema"]=="AO_APPROVED_PLACE_GALLERY_V1"
assert len(ledger["items"])==len(manifest["sources"])==2
by_id={s["media_id"]:s for s in manifest["sources"]}
paths=set()
for m in ledger["items"]:
 s=by_id[m["media_id"]]
 assert m["place_id"]==manifest["place_id"]=="place:FR:pontmain"
 assert m["source_url"]==s["source_url"] and m["credit"]==s["expected_artist"]
 assert m["license"]=="CC-BY-SA-4.0" and m["license_url"]=="https://creativecommons.org/licenses/by-sa/4.0/"
 assert m["rights_verified"] and m["subject_verified"] and m["crop_reviewed"]
 assert m["asset_path"]=="assets/approved/place-gallery/"+s["asset_filename"]
 assert m["asset_path"] not in paths
 paths.add(m["asset_path"])
 f=ROOT/m["asset_path"]
 assert f.is_file()
 data=f.read_bytes()
 assert data[:4]==b"RIFF" and data[8:12]==b"WEBP"
 assert hashlib.sha256(data).hexdigest()==m["derivative_sha256"]
 with Image.open(f) as im:
  assert im.size==(m["width"],m["height"])
  assert min(im.size)>=500
  assert ("portrait" if im.height>im.width else "landscape")==m["orientation"]
print("PASS R68 gallery binaries/rights/provenance",len(paths))
