#!/usr/bin/env python3
"""W97: exact Rubens source recovery, with commercial-use rights kept distinct.
Research-only archive; no user ratings, selectors, application files, or
strict coverage figures are modified by this workflow.
"""
import io,hashlib,importlib.util,json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w97-two-rubens-exact-source-recovery.v1.json"
OUT=ROOT/"artifacts/sacred-art-w97-rubens-originals"
s=importlib.util.spec_from_file_location("existing_art_helper",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
lib=importlib.util.module_from_spec(s);s.loader.exec_module(lib)
Image.MAX_IMAGE_PIXELS=150_000_000
def get(row):
    inf=lib.commons_info(row["commonsFile"])
    if not inf.get("licenseSupported"):raise ValueError("File-level Commons rights metadata missing")
    raw,url=lib.fetch(inf["url"],limit=50_000_000)
    with Image.open(io.BytesIO(raw)) as im: im.verify()
    with Image.open(io.BytesIO(raw)) as im:
        im=ImageOps.exif_transpose(im)
        w,h=im.size
        if min(w,h)<1200:raise ValueError(f"Source resolution insufficient {w}x{h}")
        err=abs((w/h)/row["expectedWidthOverHeight"]-1)
        if err>0.07:raise ValueError(f"Artwork/photo ratios inconsistent: {w}x{h} / error {err:.3f}")
        thumb=im.convert("RGB")
        thumb.thumbnail((2500,2500),Image.Resampling.LANCZOS)
        out=io.BytesIO()
        thumb.save(out,format="WEBP",quality=89,method=4)
    digest=hashlib.sha256(raw).hexdigest()
    stem=f"w97-{row['categoryIndex']}-{digest[:15]}"
    source=stem+".source"
    preview=stem+".webp"
    (OUT/source).write_bytes(raw)
    (OUT/preview).write_bytes(out.getvalue())
    return {
        "categoryIndex":row["categoryIndex"],"subject":row["subject"],
        "registryWorkId":row["registryWorkId"],"physicalObject":row["physicalObject"],
        "sourcePage":inf["sourcePage"],"officialObjectPage":row["officialPage"],
        "sourceImageUrl":url,"sourceFile":source,"previewFile":preview,
        "sourceSha256":digest,"previewSha256":hashlib.sha256(out.getvalue()).hexdigest(),
        "sourceDimensions":[w,h],"previewDimensions":[thumb.width,thumb.height],
        "ratioRelativeError":round(err,5),"sourceRights":row["sourceRights"],
        "rightsStatus":row["rightsStatus"],"commonsFileLicense":inf["license"],
        "sourceIdentityStatus":row["sourceIdentityStatus"],
        "status":"ACTUAL_IMAGE_DOWNLOADED_ASPECT_PASSED_MANUAL_PAINTED_EDGE_CHECK_PENDING",
        "completePaintedSurfaceVerified":False,
        "appCommercialReleaseApproved":False,"existingArtworkSelectionChanged":False
    }
def sheet(rows):
    done=[r for r in rows if r["status"].startswith("ACTUAL_IMAGE")]
    if not done:return
    canvas=Image.new("RGB",(1200,480*len(done)),(11,16,26))
    d=ImageDraw.Draw(canvas)
    for i,r in enumerate(done):
        im=Image.open(OUT/r["previewFile"]).convert("RGB")
        im.thumbnail((720,440),Image.Resampling.LANCZOS)
        canvas.paste(im,((730-im.width)//2,i*480+(480-im.height)//2))
        lines=[r["subject"],r["physicalObject"]["museum"],r["physicalObject"]["accession"],
            f"{r['sourceDimensions'][0]}x{r['sourceDimensions'][1]} px",
            r["rightsStatus"],"Manual full-edge verification pending."]
        for j,line in enumerate(lines):
            d.text((740,i*480+27+j*52),line[:66],fill=(241,235,215))
    canvas.save(OUT/"w97-overall-composition-sheet.jpg",quality=88)
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    manifest=json.loads(SRC.read_text(encoding="utf-8"))
    rows=[]
    for row in manifest["items"]:
        try:
            found=get(row)
            print("W97_ACQUIRED",found["categoryIndex"],found["sourceDimensions"],flush=True)
        except Exception as e:
            found={"categoryIndex":row["categoryIndex"],"subject":row["subject"],
                   "status":"SOURCE_DOWNLOAD_OR_DIMENSION_HOLD","reason":str(e)[:280],
                   "appCommercialReleaseApproved":False}
            print("W97_HOLD",row["categoryIndex"],found["reason"],flush=True)
        rows.append(found)
    sheet(rows)
    counts={"targetOriginals":len(rows),"fileBytesAcquired":sum(x["status"].startswith("ACTUAL_IMAGE") for x in rows),
       "held":sum(not x["status"].startswith("ACTUAL_IMAGE") for x in rows),"certifiedPublishedImages":0}
    result={"schema":"AO_SACRED_ART_W97_TWO_RUBENS_ORIGINAL_SOURCE_QA","counts":counts,
            "strictCoverageRemains":"146/168 until identity, complete painted edges, legal and user selection gates are checked",
            "records":rows}
    (OUT/"w97-acquisition-source-qa.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print("W97_COMPLETE",json.dumps(counts),flush=True)
if __name__=="__main__":main()
