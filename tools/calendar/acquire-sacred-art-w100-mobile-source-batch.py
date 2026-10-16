#!/usr/bin/env python3
"""W100: acquire seven proposed visual-source files as ONE mobile-first research batch.
No min-resolution filter; no selected-original substitutions or app/rating writes.
"""
from __future__ import annotations
import hashlib, importlib.util, io, json
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w100-mobile-gap-acquisition-candidates.v1.json"
OUT=ROOT/"artifacts/sacred-art-w100-mobile-subject-evidence"
spec=importlib.util.spec_from_file_location("existing_commons",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
Image.MAX_IMAGE_PIXELS=150_000_000
def acquire(item):
    source=lib.commons_info(item["file"])
    if not source.get("licenseSupported"):
        raise ValueError("Commons file-specific terms not declared compatible with research")
    try:
        raw,url=lib.fetch(source["url"],limit=55_000_000)
        kind="COMMONS_ORIGINAL_SOURCE"
    except Exception as original_error:
        if not source.get("display") or source["display"]==source["url"]:
            raise original_error
        raw,url=lib.fetch(source["display"],limit=55_000_000)
        kind="COMMONS_NATIVE_RATIO_DERIVATIVE_SOURCE"
    with Image.open(io.BytesIO(raw)) as img:img.verify()
    with Image.open(io.BytesIO(raw)) as im:
        painting=ImageOps.exif_transpose(im).convert("RGB")
        w,h=painting.size
        review=painting.copy()
        review.thumbnail((1600,1600),Image.Resampling.LANCZOS)
        phone=painting.copy()
        phone.thumbnail((350,410),Image.Resampling.LANCZOS)
        buffer=io.BytesIO();review.save(buffer,"WEBP",quality=86,method=4)
        phonebuf=io.BytesIO();phone.save(phonebuf,"PNG")
    checksum=hashlib.sha256(raw).hexdigest()
    stem=f"w100-{item['workKey']}-{checksum[:12]}"
    files=dict(source=stem+".source",review=stem+".webp",mobile=stem+"-mobile.png")
    (OUT/files["source"]).write_bytes(raw)
    (OUT/files["review"]).write_bytes(buffer.getvalue())
    (OUT/files["mobile"]).write_bytes(phonebuf.getvalue())
    return {k:item[k] for k in ("categoryIndex","workKey","physicalId","title","artist","museum","accession","date","kind","rightsNote","visualNotes")} | {
      "sourceStatus":"DOWNLOADED_FOR_390PX_MOBILE_VISUAL_REVIEW",
      "sourceType":kind,"sourcePage":source["sourcePage"],"sourceUrl":url,
      "commonsReportedLicence":source["license"],"commonsPhotographer":source["artistCredit"],
      "sourceDimensions":[w,h],"mobileDimensions":list(phone.size),
      "sourceSHA256":checksum,"files":files,
      "fullPaintingSurfaceManuallyVerified":False,
      "mobileArtQualityManuallyVerified":False,
      "selectedOriginalIdentityReconciled":False,
      "commercialDistributionRightsResolved":False,
      "releaseApproved":False
    }
def contact_sheet(rows):
    good=[r for r in rows if r.get("files")]
    if not good:return
    cardw,cardh=970,440
    out=Image.new("RGB",(cardw,cardh*len(good)),(9,15,23))
    draw=ImageDraw.Draw(out)
    for i,row in enumerate(good):
        im=Image.open(OUT/row["files"]["mobile"]).convert("RGB")
        x=15+(410-im.width)//2;y=i*cardh+6+(416-im.height)//2
        out.paste(im,(x,y))
        labels=[row["workKey"],row["title"],row["artist"],row["museum"],
           f"{row['sourceDimensions'][0]}×{row['sourceDimensions'][1]} px (phone proof to 350×410)",
           row["kind"],"Image + legal rights require independent acceptance"]
        for n,label in enumerate(labels):
            draw.text((435,i*cardh+20+n*47),str(label)[:77],fill=(245,230,203))
        draw.line([(0,(i+1)*cardh-1),(cardw,(i+1)*cardh-1)],fill=(72,79,88),width=1)
    out.save(OUT/"w100-seven-mobile-visual-candidates.jpg",quality=90)
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    doc=json.loads(SRC.read_text(encoding="utf-8"))
    rows=[]
    for item in doc["items"]:
        try:
            rec=acquire(item)
            print("W100_DOWNLOADED",rec["workKey"],rec["sourceDimensions"],rec["commonsReportedLicence"],flush=True)
        except Exception as e:
            rec={"categoryIndex":item["categoryIndex"],"workKey":item["workKey"],
                 "physicalId":item["physicalId"],"sourceStatus":"SOURCE_FETCH_OR_DECODE_HOLD",
                 "reason":str(e)[:250],"sourcePage":item["sourcePage"],"releaseApproved":False}
            print("W100_HOLD",item["workKey"],rec["reason"],flush=True)
        rows.append(rec)
    contact_sheet(rows)
    counts={"attempts":len(rows),"imageFilesDownloaded":sum(bool(x.get("files")) for x in rows),
       "imageFileHolds":sum(not x.get("files") for x in rows),
       "categoryPhotosCertifiedForProduction":0}
    report={"schema":"AO_SACRED_ART_W100_ACTUAL_SOURCE_DOWNLOAD_AND_MOBILE_PROOF",
       "counts":counts,"records":rows,"strictCategoryCoverageNotChanged":"146/168",
       "preservesRatingsAndApp":True,"requiresOriginalIdentityAndRightsQa":True}
    (OUT/"w100-mobile-image-evidence.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("W100_DONE",json.dumps(counts),flush=True)
if __name__=="__main__":main()
