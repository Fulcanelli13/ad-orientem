#!/usr/bin/env python3
"""Once-only replacement of invalid held Walsingham interior with licensed exterior.

Preserve original early R59 interior-photo hold. Expect original published
photo bytes from previous PR; replace ONLY after exact-source licence SHA1,
manual original/derivative identity and independent review checks.
"""
import hashlib,json,shutil
from pathlib import Path
from stage_shrine_photo_candidates import stage,OUT
ROOT=Path(__file__).resolve().parents[1]
manifest=json.loads((ROOT/"data/geography/research/explore-major-marian-b2-photo-candidates.v1.json").read_text(encoding="utf-8"))
path=ROOT/"data/geography/approved-place-media.v1.json"
media=json.loads(path.read_text(encoding="utf-8"))
place="place:GB:walsingham-catholic-shrine"
candidates=[c for c in manifest["candidates"] if c["place_id"]==place]
assert len(candidates)==1
c=candidates[0]
assert c["image_review_state"]=="EDITORIALLY_ACCEPTED_EXACT_SITE_AND_FULL_FRAME_20261021"
assert c["commons_title"]=="File:Slipper Chapel, Walsingham - geograph.org.uk - 2833334.jpg"
old=[r for r in media["items"] if r["place_id"]==place]
assert len(old)==1 and len(media["items"])==31
old=old[0]
assert old["source_url"].endswith("8015873.jpg"),"Original held interior source changed; refuse overwrite"
asset=ROOT/old["asset_path"]
assert old["asset_path"]=="assets/approved/place-media/GB-walsingham-catholic-shrine.webp"
assert hashlib.sha256(asset.read_bytes()).hexdigest()==old["derivative_sha256"],"Unexpected change to current hero"
details=stage(c)
src=OUT/details["candidate_filename"]
assert hashlib.sha256(src.read_bytes()).hexdigest()==details["derivative_sha256"]
assert details["rights"]["license_url"].rstrip("/").startswith(c["license_url"].rstrip("/"))
assert details["original_dimensions"][0]>=2000 and details["original_dimensions"][1]>=2000
shutil.copyfile(src,asset)
assert hashlib.sha256(asset.read_bytes()).hexdigest()==details["derivative_sha256"]
old.update({
"credit":c["credit"],"license":c["license"],"license_url":c["license_url"],
"source_url":c["source_url"],"source_sha1":details["original_sha1"],
"derivative_sha256":details["derivative_sha256"],
"alt_en":c["alt_en"],"alt_fr":c["alt_fr"],
"changes_en":"Resized full-frame and converted to WebP; no crop or colour changes.",
"changes_fr":"Image entière redimensionnée et convertie en WebP ; sans recadrage ni retouche colorimétrique.",
"reviewed_at":"2026-10-21",
"review_method":"Historic R59 interior specifically rejected for hero. Independent Geograph/Commons exterior photo by Len Williams, CC BY-SA 2.0, original SHA1, full-frame subject and local derivative SHA256 inspected and verified.",
"width":details["candidate_dimensions"][0],
"height":details["candidate_dimensions"][1],
"orientation":"portrait" if details["candidate_dimensions"][1]>details["candidate_dimensions"][0] else "landscape"
})
path.write_text(json.dumps(media,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
print("REPLACED WALSINGHAM HERO: Catholic exterior by Len Williams; original held interior stays banned",flush=True)
