#!/usr/bin/env python3
"""W95 heritage artwork photo acquisition. Identical-object source only; no publication or score changes."""
import hashlib,io,json,importlib.util
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w95-heritage-original-image-acquisition.v1.json"
OUT=ROOT/"artifacts/sacred-art-w95-heritage-image-evidence"
spec=importlib.util.spec_from_file_location("shared_acquisition",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
Image.MAX_IMAGE_PIXELS=150_000_000
def retrieve(i,row):
    raw,url=lib.fetch(row["source"],limit=55_000_000)
    with Image.open(io.BytesIO(raw)) as im:im.verify()
    with Image.open(io.BytesIO(raw)) as im:
        im=ImageOps.exif_transpose(im)
        w,h=im.size
        copy=im.convert("RGB");copy.thumbnail((2300,2300),Image.Resampling.LANCZOS)
        buff=io.BytesIO();copy.save(buff,"WEBP",quality=87,method=4)
    sha=hashlib.sha256(raw).hexdigest()
    stem=f"w95-{i:02d}-{row['categoryIndex']}-{sha[:12]}"
    filename=stem+".original-source";preview=stem+".webp"
    (OUT/filename).write_bytes(raw);(OUT/preview).write_bytes(buff.getvalue())
    return {
      "categoryIndex":row["categoryIndex"],"workId":row["workId"],
      "artist":row["artist"],"work":row["work"],"catalogue":row["catalogue"],
      "sourceMatchClass":row["sourceMatch"],"resolvedImageUrl":url,
      "sourceDimensions":[w,h],"sourceBytes":len(raw),"sourceSha256":sha,
      "previewFile":preview,"originalSourceFile":filename,
      "status":"DOWNLOADED_ORIGINAL_OBJECT_SOURCE_WITH_IMAGE_QA_PENDING",
      "sufficientResolution":min(w,h)>=1200,
      "fullPaintingSurfaceVerified":False,
      "photoRightsReleased":False,"publishedInApp":False,
      "historicalUserRatingsTouched":False
    }
def sheet(rows):
    good=[x for x in rows if x["status"].startswith("DOWNLOADED_")]
    if not good:return
    out=Image.new("RGB",(1080,len(good)*350),(10,14,22));d=ImageDraw.Draw(out)
    for j,row in enumerate(good):
        p=Image.open(OUT/row["previewFile"]).convert("RGB")
        p.thumbnail((650,325),Image.Resampling.LANCZOS)
        out.paste(p,((650-p.width)//2,j*350+(350-p.height)//2))
        details=[row["workId"],row["artist"],row["work"][:45],
                 str(row["sourceDimensions"]),"Image still needs edge/rights QA"]
        for k,line in enumerate(details):d.text((670,j*350+22+k*47),line,fill="#f1ead9")
    out.save(OUT/"w95-heritage-source-contact-sheet.jpg",quality=85)
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    original=json.loads(SRC.read_text(encoding="utf-8"))
    rows=[]
    for k,row in enumerate(original["items"]):
        try:
            v=retrieve(k,row)
            print("W95_ACQUIRED",row["workId"],v["sourceDimensions"],flush=True)
        except Exception as e:
            v={"workId":row["workId"],"categoryIndex":row["categoryIndex"],
               "status":"DOWNLOAD_OR_DECODING_HOLD","error":str(e)[:260],
               "sourcePage":row["catalogue"],"sourceUrl":row["source"],
               "publishedInApp":False}
            print("W95_HOLD",row["workId"],str(e)[:135],flush=True)
        rows.append(v)
    sheet(rows)
    stats={"attempted":len(rows),"sourceFilesDownloaded":sum(x["status"].startswith("DOWNLOADED_") for x in rows),
          "downloadHolds":sum(x["status"]=="DOWNLOAD_OR_DECODING_HOLD" for x in rows),
          "strictCategoryPromotions":0}
    result={"schema":"AO_SACRED_ART_W95_HERITAGE_PHOTOGRAPHIC_SOURCE_QA_V1",
            "counts":stats,"rows":rows,"notAppPublication":True,
            "strictCoverageBeforeAndAfter":"146/168"}
    (OUT/"w95-heritage-source-qa.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
    print("W95_COMPLETE",json.dumps(stats),flush=True)
if __name__=="__main__":main()
