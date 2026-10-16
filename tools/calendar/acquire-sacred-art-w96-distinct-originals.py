#!/usr/bin/env python3
"""W96 distinct originals: acquire full-source comparison photographs, not ratings or app art."""
from __future__ import annotations
import hashlib, importlib.util, io, json
from pathlib import Path
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w96-distinct-original-source-acquisition.v1.json"
OUT=ROOT/"artifacts/sacred-art-w96-authentic-variant-originals"
shared=ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py"
spec=importlib.util.spec_from_file_location("ao_w96_existing_image_acquisition",shared)
lib=importlib.util.module_from_spec(spec)
spec.loader.exec_module(lib)
Image.MAX_IMAGE_PIXELS=150_000_000
def acquire(row):
    rights=lib.commons_info(row["file"])
    if not rights["licenseSupported"]:raise ValueError("Commons license not verified")
    original,url=lib.fetch(rights["url"],limit=50_000_000)
    with Image.open(io.BytesIO(original)) as im:im.verify()
    with Image.open(io.BytesIO(original)) as im:
        o=ImageOps.exif_transpose(im).convert("RGB")
        w,h=o.size
        if min(w,h)<1000:raise ValueError("Too small for research archive")
        ratio=abs((w/h)/(row["plannedDimensions"][0]/row["plannedDimensions"][1])-1)
        if ratio>0.02:raise ValueError(f"Unexpected source image ratio: {ratio}")
        o.thumbnail((2400,2400),Image.Resampling.LANCZOS)
        preview=io.BytesIO();o.save(preview,format="WEBP",quality=87,method=4)
    sha=hashlib.sha256(original).hexdigest()
    stem=f"w96-{row['distinctArtworkId']}-{sha[:12]}"
    photo=stem+".source.jpg";thumbnail=stem+".webp"
    (OUT/photo).write_bytes(original);(OUT/thumbnail).write_bytes(preview.getvalue())
    return dict(categoryIndex=row["categoryIndex"],distinctArtworkId=row["distinctArtworkId"],
        title=row["painting"],artist=row["artist"],museum=row["museum"],accession=row["accession"],
        sourceUrl=url,sourcePage=rights["sourcePage"],licenseMetadata=rights["license"],
        dimensions=[w,h],sha256=sha,sourceFile=photo,previewFile=thumbnail,
        status="DISTINCT_ORIGINAL_IMAGE_ACQUIRED_COMPARISON_ONLY",
        identityDoesNotInheritHistoricalArtworkRating=True,
        mayReplaceUserSelectedPaintingWithoutReview=False,publishable=False)
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    raw=json.loads(SRC.read_text())
    results=[]
    for v in raw["newAlternatives"]:
        try:
            o=acquire(v)
            print("W96_IMAGE",o["distinctArtworkId"],o["dimensions"],flush=True)
        except Exception as e:
            o=dict(distinctArtworkId=v["distinctArtworkId"],status="IMAGE_HOLD",error=str(e)[:300],publishable=False)
            print("W96_HOLD",o["distinctArtworkId"],o["error"],flush=True)
        results.append(o)
    report={"schema":"AO_SACRED_ART_W96_DISTINCT_ORIGINAL_ACQUISITION_REPORT_V1",
       "counts":{"attempted":len(results),"acquired":sum(x["status"].startswith("DISTINCT_") for x in results),
       "holds":sum(x["status"]=="IMAGE_HOLD" for x in results),"newStrictCategoryPromotions":0},
       "records":results,"existingArtworkSelectionsUntouched":True,"strictCoverage":"146/168"}
    (OUT/"w96-source-photo-evidence.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
    print("W96_COMPLETE",json.dumps(report["counts"]),flush=True)
if __name__=="__main__":main()
