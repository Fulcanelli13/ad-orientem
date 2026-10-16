#!/usr/bin/env python3
"""W93: acquire privately staged hard-gap source photographs; NEVER auto-promote art.
Works with the existing Sacred Art acquisition helper and unchanged app/curator scores.
"""
import hashlib, importlib.util, io, json
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w93-hard-gaps-source-queue.v1.json"
OUT=ROOT/"artifacts/sacred-art-w93-hard-gap-evidence"
spec=importlib.util.spec_from_file_location("acq_existing",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
lib=importlib.util.module_from_spec(spec)
spec.loader.exec_module(lib)
Image.MAX_IMAGE_PIXELS=180_000_000
def fetch_row(row):
    rights={}
    if row.get("commonsFile"):
        rights=lib.commons_info(row["commonsFile"])
        if not rights.get("licenseSupported"):raise ValueError("Commons file-specific licence not verified")
        url=rights["url"]
    else:url=row["imageUrl"]
    raw,actual=lib.fetch(url,limit=55_000_000)
    with Image.open(io.BytesIO(raw)) as im:im.verify()
    with Image.open(io.BytesIO(raw)) as im:
        im=ImageOps.exif_transpose(im)
        width,height=im.size
        if min(width,height)<row["expectedResolutionMin"]:raise ValueError(f"Insufficient size {width}x{height}")
        x=im.convert("RGB")
        x.thumbnail((2300,2300),Image.Resampling.LANCZOS)
        preview=io.BytesIO();x.save(preview,format="WEBP",quality=88,method=4)
    sha=hashlib.sha256(raw).hexdigest()
    previewbytes=preview.getvalue()
    source_name=row["key"]+"-"+sha[:12]+".original-source"
    preview_name=row["key"]+"-"+sha[:12]+".webp"
    (OUT/source_name).write_bytes(raw)
    (OUT/preview_name).write_bytes(previewbytes)
    actual_ratio=width/height
    expected=row.get("expectedSurfaceAspect")
    ratio_delta=abs(actual_ratio/expected-1) if expected else None
    return {
      "key":row["key"],"categoryIndex":row["categoryIndex"],"workId":row["workId"],
      "status":"SOURCE_FILE_DOWNLOADED_MANUAL_COMPOSITION_QA_PENDING",
      "sourcePage":row["objectPage"],"resolvedImageUrl":actual,"imageSource":row["basis"],
      "rightsStatement":rights.get("license") or row["legalStatus"],"rightsGatePassed":False,
      "subject":row["subject"],"paintingIdentity":row["identity"],
      "fullPaintingSurfaceVerified":False,"inSituNotPaintingMaster":row.get("inSituNotPaintingMaster",False),
      "pixelDimensions":[width,height],"relativeAspectError":round(ratio_delta,5) if ratio_delta is not None else None,
      "previewFile":preview_name,"originalFile":source_name,"sha256Original":sha,
      "sha256Preview":hashlib.sha256(previewbytes).hexdigest(),
      "previousRatingsUntouched":True,"publishable":False,
      "attributionNote":row.get("attributionNote")
    }
def contact_sheet(rows):
    good=[r for r in rows if r["status"].startswith("SOURCE_FILE_")]
    if not good:return
    canvas=Image.new("RGB",(1060,len(good)*345),(10,15,24))
    dr=ImageDraw.Draw(canvas)
    for j,r in enumerate(good):
        img=Image.open(OUT/r["previewFile"]).convert("RGB")
        img.thumbnail((580,305),Image.Resampling.LANCZOS)
        left=12+(590-img.width)//2
        top=j*345+(320-img.height)//2
        canvas.paste(img,(left,top))
        parts=[r["key"],r["paintingIdentity"],"Source: "+str(r["pixelDimensions"]),
         "Photo only; original painted surface not yet verified", "Rights/identity hold: do not publish."]
        for i,v in enumerate(parts):dr.text((610,j*345+25+i*48),v[:66],fill=(238,231,210))
    canvas.save(OUT/"w93-uncropped-source-contact-sheet.jpg",quality=88)
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    input=json.loads(INPUT.read_text(encoding="utf-8"))
    rows=[]
    for row in input["items"]:
        try:
            r=fetch_row(row)
            print("W93_FILE",r["key"],r["pixelDimensions"],flush=True)
        except Exception as exc:
            r={"key":row["key"],"categoryIndex":row["categoryIndex"],"workId":row["workId"],
               "status":"DOWNLOAD_OR_SOURCE_HOLD","reason":str(exc)[:240],
               "sourcePage":row["objectPage"],"rightsStatement":row["legalStatus"],
               "fullPaintingSurfaceVerified":False,"publishable":False}
            print("W93_HOLD",r["key"],r["reason"],flush=True)
        rows.append(r)
    contact_sheet(rows)
    stats={"attempts":len(rows),"downloadedSources":sum(r["status"].startswith("SOURCE_FILE_") for r in rows),
           "held":sum(r["status"]=="DOWNLOAD_OR_SOURCE_HOLD" for r in rows),
           "strictNewCategoryCertifications":0}
    out={"schema":"AO_SACRED_ART_W93_ACQUISITION_EVIDENCE_V1","counts":stats,"rows":rows,
         "correctStrictCoverageStill":"146/168","ratingsAltered":False,"appAltered":False}
    (OUT/"w93-acquisition-evidence.json").write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("W93_COMPLETE",json.dumps(stats),flush=True)
if __name__=="__main__":main()
