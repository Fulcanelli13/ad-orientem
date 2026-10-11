#!/usr/bin/env python3
"""R69 local gallery binary, publication and source-title verification."""
import hashlib,json
from pathlib import Path
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
g=json.loads((ROOT/"data/geography/approved-place-gallery.v1.json").read_text(encoding="utf8"))
src=json.loads((ROOT/"data/geography/research/explore-r69-gallery-sources.v1.json").read_text(encoding="utf8"))
assert g["schema"]=="AO_APPROVED_PLACE_GALLERY_V1"
assert len(g["items"])==6 and len(src["sources"])==4
assert len({x["media_id"] for x in g["items"]})==6
by_id={x["media_id"]:x for x in src["sources"]}
for old,sha in [
 ("pontmain-east-facade-2016","672b9f9da38f8c91fe7e70d93aabf662396ddaf81582f12445882c09a856fb9f"),
 ("pontmain-main-nave-2011","83835efbf75a70f8595e8a9ff782e26c2a31d3525f0e99ec2ea956d587028523")]:
 row=next(x for x in g["items"] if x["media_id"]==old)
 assert row["derivative_sha256"]==sha,"Historical R68 image altered"
for row in g["items"]:
 candidate=by_id.get(row["media_id"])
 assert row["status"]=="APPROVED" and row["kind"]=="PHOTO"
 assert row["rights_verified"] and row["subject_verified"] and row["crop_reviewed"]
 assert row["license"]=="CC-BY-SA-4.0" and row["license_url"]=="https://creativecommons.org/licenses/by-sa/4.0/"
 assert row["source_url"].startswith("https://commons.wikimedia.org/wiki/File:")
 assert row["asset_path"].startswith("assets/approved/place-gallery/")
 if candidate:
  assert row["source_url"]==candidate["source_url"]
  assert row["place_id"]==candidate["place_id"]
  assert row["credit"]==candidate["expected_artist"]
  assert row["asset_path"].endswith("/"+candidate["asset_filename"])
 path=ROOT/row["asset_path"]
 assert path.is_file(),row["asset_path"]
 data=path.read_bytes()
 assert data[:4]==b"RIFF" and data[8:12]==b"WEBP"
 assert hashlib.sha256(data).hexdigest()==row["derivative_sha256"]
 with Image.open(path) as im:
  assert im.size==(row["width"],row["height"])
  assert min(im.size)>=500
  assert ("portrait" if im.height>im.width else "landscape")==row["orientation"]
print("PASS R69: six approved local gallery assets across four Places, old two byte-identical")
