#!/usr/bin/env python3
"""Verify a recovered historical 22-hero source archive without publishing art.

Exact original bytes (October 2026 hashes), no network, no changes to app
registry, and no assumption that hash/metadata constitutes publication rights.
"""
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps, UnidentifiedImageError

ROOT=Path(__file__).resolve().parents[2]
LEDGER=ROOT/"data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json"
ARCHIVE=ROOT/"data/research/module-hero-20-exact-source-archive-20261102.v1.json"
OUT=ROOT/"artifacts/module-hero-20-archive-qa"
Image.MAX_IMAGE_PIXELS=100_000_000

def main():
    ledger=json.loads(LEDGER.read_text(encoding="utf8"))
    archive=json.loads(ARCHIVE.read_text(encoding="utf8"))
    original={r["module_id"]:r for r in ledger["entries"]}
    records=archive["records"]
    assert len(records)==22 and len(original)==22, "Lost selected module identity"
    assert len({r["module"] for r in records})==22
    assert archive["count"]["originalFilesPresent"]==20
    assert archive["count"]["releaseCleared"]==0 and archive["count"]["livePublished"]==0
    OUT.mkdir(parents=True,exist_ok=True)
    audit=[];failed=[];images=[]
    for row in records:
        mid=row["module"];previous=original[mid]
        assert row["artworkId"]==previous["artwork_id"],"Original art changed "+mid
        assert row["title"]==previous["title"] and row["artist"]==previous["artist"]
        assert row["photoRelease"]=="BLOCKED","Unexpected publication promotion"
        rel=row["path"]
        if not rel:
            assert mid in ("angel","evening") and not previous["physical_master_acquired"]
            audit.append({"module":mid,"status":"SOURCE_MISSING","holds":row["holds"]})
            continue
        assert rel==previous["local_master_path"],"Source path changed "+mid
        assert row["expectedSHA256"]==previous["sha256"]
        path=ROOT/rel
        if not path.is_file():
            failed.append(mid+": exact original file missing")
            audit.append({"module":mid,"status":"SOURCE_MISSING_UNEXPECTED"})
            continue
        sha=hashlib.sha256(path.read_bytes()).hexdigest()
        if sha!=row["expectedSHA256"]:
            failed.append(mid+": checksum differs from original archived acquisition")
            audit.append({"module":mid,"status":"CHECKSUM_FAIL"})
            continue
        try:
            with Image.open(path) as im:
                im.verify()
            with Image.open(path) as im:
                im.load()
                px=list(im.size)
                preview=ImageOps.contain(im.convert("RGB"),(185,148))
                images.append((mid,preview.copy()))
        except (ValueError,OSError,UnidentifiedImageError) as exc:
            failed.append(mid+": invalid source image "+str(exc)[:100])
            audit.append({"module":mid,"status":"IMAGE_READ_FAIL"})
            continue
        audit.append({"module":mid,"status":"EXACT_SOURCE_VERIFIED_NOT_RELEASED",
                      "originalSHA256":sha,"sourceBytes":path.stat().st_size,
                      "dimensions":px,"holds":row["holds"],"photoApproval":False})
    assert len(audit)==22 and len([a for a in audit if a["status"]=="SOURCE_MISSING"])==2
    sheet=Image.new("RGB",(1000,216*5),(24,24,27))
    draw=ImageDraw.Draw(sheet)
    for i,(name,preview) in enumerate(images):
        x=i%5*200+int((200-preview.width)/2)
        y=i//5*216
        sheet.paste(preview,(x,y))
        rec=original[name]
        draw.text((i%5*200+5,y+151),name[:26],fill=(255,255,255))
        draw.text((i%5*200+5,y+172),rec["artist"][:26].encode("ascii","ignore").decode("ascii"),fill=(191,187,176))
        draw.text((i%5*200+5,y+192),"SOURCE ONLY - NO RELEASE",fill=(188,161,123))
    sheet.save(OUT/"source-contact-sheet.jpg",quality=88)
    result={"schema":"AO_MODULE_20_EXACT_SOURCE_QA_V1",
            "summary":{"approved":22,"presentAndSHA256Verified":sum(r["status"]=="EXACT_SOURCE_VERIFIED_NOT_RELEASED" for r in audit),
                       "missingPreviously":2,"photoCertified":0,"appReleased":0,
                       "technicalFailures":failed},
            "interpretation":"Verified unchanged source files, NOT quality, copyright, crop or production clearance.",
            "records":audit}
    (OUT/"report.json").write_text(json.dumps(result,indent=2)+"\n",encoding="utf8")
    print(json.dumps(result["summary"],indent=2),flush=True)
    if failed or result["summary"]["presentAndSHA256Verified"]!=20:
        raise SystemExit("SOURCE ARCHIVE INTEGRITY FAILURE")

if __name__=="__main__":
    main()
