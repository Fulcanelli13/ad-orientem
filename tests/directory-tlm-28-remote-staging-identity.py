#!/usr/bin/env python3
"""Full 28-photo identity/visual staging gate; never approves production media."""
import hashlib,json,pathlib,re,sys
from PIL import Image
ROOT=pathlib.Path(__file__).resolve().parents[1]
READ=lambda p:json.loads((ROOT/p).read_text(encoding="utf-8"))
imp=READ("data/directory/research/tlm-28-commons-source-import-20261112.v1.json")
audit=READ("data/directory/research/tlm-28-commons-source-stage-result-20261112.v1.json")
ref=READ("data/directory/research/tlm-28-owner-archive-visual-fingerprints-20261112.v1.json")
idx=READ("data/directory/generated/cl2-physical-site-index.v1.json")
cat=READ("data/directory/cl2-source-site-category-matrix-20261111.v1.json")
wit=READ("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json")
approved=READ("data/directory/approved-venue-media.v1.json")
geo=READ("data/geography/seed-registry.v1.json")
assert imp["schema"]=="AO_TLM_28_COMMONS_SOURCE_IMPORT_INPUT_V1"
assert audit["schema"]=="AO_TLM_28_REMOTE_SOURCE_STAGING_AUDIT_V1"
assert ref["schema"]=="AO_TLM_28_OWNER_ARCHIVE_REFERENCE_VISUAL_FINGERPRINT_V1"
assert audit["counts"]=={"reviewed":28,"staged":28,"held":0,"approved":0,"published":0}
assert len(imp["entries"])==len(audit["records"])==len(ref["records"])==28
site={r[0]:r for r in idx["records"]}
labels={r[0]:r for r in cat["rows"]}
witness={r["cl2_anchor"]:r for r in wit["records"]}
proof={r["cl2_anchor"]:r for r in audit["records"]}
archive={r["cl2_anchor"]:r for r in ref["records"]}
approved_ids={r["venue_id"] for r in approved["items"]}
place_ids={r["venue_id"] for r in geo["directoryPlaceLinks"]}
def dhash(im):
    gray=im.convert("L").resize((9,8),Image.Resampling.LANCZOS)
    px=list(gray.getdata())
    val=0
    for y in range(8):
        for x in range(8):val=(val<<1)|int(px[y*9+x]>px[y*9+x+1])
    return val
seen=set();max_distance=0;hist={}
for item in imp["entries"]:
    id,venue=item["cl2_anchor"],item["venue_id"]
    assert id not in seen and id in site and venue in site[id][1],id
    seen.add(id)
    assert venue not in approved_ids and venue not in place_ids,id
    lane=witness.get(id,{}).get("visual_lane") or labels[site[id][5]][4]
    assert lane=="DIOCESAN_PHOTO",id
    p,source=proof[id],archive[id]
    assert p["venue_id"]==venue and p["status"]=="STAGED_NOT_APPROVED",id
    assert p["source_revision_sha1_verified"] is True
    assert p["source_sha1"]==source["source_original_sha1"]==item["original_sha1"]
    assert p["archived_preview_sha256"]==source["owner_archive_preview_sha256"]==item["archived_preview_sha256"]
    assert p["source_url"]==item["source_url"] and p["byte_identical_to_owner_archive"] is False
    assert p["source_license_reported"] and p["source_author_reported"]
    assert item["credit"].lower().replace(" ","") in p["source_author_reported"].lower().replace(" ",""),id
    assert all(item[x] is False for x in ("publication_approved","rights_verified","subject_verified","crop_reviewed"))
    raw=(ROOT/p["staged_asset_path"]).read_bytes()
    assert raw[:4]==b"RIFF" and raw[8:12]==b"WEBP",id
    assert hashlib.sha256(raw).hexdigest()==p["derived_sha256"],id
    with Image.open(ROOT/p["staged_asset_path"]) as im:
        assert im.format=="WEBP" and im.size==tuple(p["pixel_dimensions"]),id
        assert 250<=im.width<=1600 and 250<=im.height<=1600,id
        d=(dhash(im)^int(source["owner_archive_visual_dhash64"],16)).bit_count()
    max_distance=max(max_distance,d);hist[id]=d
    if d>ref["allowed_hamming_distance_max"]:
        raise AssertionError(f"Source photo composition differs from owner archive: {id} hamming={d}")
assert len(seen)==28
print("TLM28_REMOTE_SOURCE_EXACT_BINARY_PERCEPTUAL_QA_PASS 28/28, max_dhash_distance",max_distance)
print(json.dumps({"hamming_distances":hist},sort_keys=True))
print("ZERO_APPROVALS_ZERO_PUBLIC_ASSETS_CONFIRMED")
