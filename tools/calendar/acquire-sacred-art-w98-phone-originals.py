#!/usr/bin/env python3
"""W98: fetch source-original closeups and produce true-scale 390 CSS px phone proofs.
Do not equate number of pixels to quality, license or curatorial approval.
"""
import io,hashlib,importlib.util,json
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont,ImageOps
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/calendar/sacred-art-review-uploads/20261016-w98-mobile-original-icon-podesti-photo-retrieval.v1.json"
OUT=ROOT/"artifacts/sacred-art-w98-mobile-source-photo-proof"
spec=importlib.util.spec_from_file_location("shared_original",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
Image.MAX_IMAGE_PIXELS=100_000_000
def acquire(row):
    info=lib.commons_info(row["commonsFile"])
    if not info["licenseSupported"]:raise ValueError("Commons file-specific licence missing or unsupported")
    raw,resolved=lib.fetch(info["url"],limit=25_000_000)
    with Image.open(io.BytesIO(raw)) as im:im.verify()
    with Image.open(io.BytesIO(raw)) as img:
        img=ImageOps.exif_transpose(img).convert("RGB")
        width,height=img.size
        preview=img.copy()
        preview.thumbnail((1800,1800),Image.Resampling.LANCZOS)
        screen=img.copy()
        screen.thumbnail((390,500),Image.Resampling.LANCZOS)
        body=io.BytesIO();preview.save(body,"WEBP",quality=89)
        mobile=io.BytesIO();screen.save(mobile,"PNG")
    sha=hashlib.sha256(raw).hexdigest()
    stem=f"w98-{row['categoryIndex']}-{sha[:12]}"
    rawname=stem+".original-source"
    prevname=stem+".webp"
    phonename=stem+"-phone-fit.png"
    (OUT/rawname).write_bytes(raw)
    (OUT/prevname).write_bytes(body.getvalue())
    (OUT/phonename).write_bytes(mobile.getvalue())
    return {"categoryIndex":row["categoryIndex"],"workId":row["workId"],"file":row["commonsFile"],
     "status":"DOWNLOADED_FOR_VISUAL_PHONE_INSPECTION", "nativeResolution":[width,height],
     "phoneProofDimensions":list(screen.size),"sourceSha256":sha,
     "sourceFile":rawname,"previewFile":prevname,"phoneProofFile":phonename,
     "sourceUrl":resolved,"sourcePage":info["sourcePage"],"fileLicence":info["license"],"conservativePhotoRightsNote":row.get("photoRightsPolicy",row.get("licenseExpectation","")),
     "originalEvidenceStatus":row["physicalStatus"],"automaticApproval":False,
     "publishedInApp":False,"ratingsChanged":False}
def sheet(rows):
    good=[r for r in rows if r["status"].startswith("DOWNLOADED_")]
    if not good:return
    W,H=430,620
    out=Image.new("RGB",(W*len(good),H),(9,14,22))
    d=ImageDraw.Draw(out)
    for i,r in enumerate(good):
        img=Image.open(OUT/r["phoneProofFile"]).convert("RGB")
        out.paste(img,(W*i+(W-img.width)//2,15+(510-img.height)//2))
        lines=[f"Cat. {r['categoryIndex']} | {r['nativeResolution'][0]}x{r['nativeResolution'][1]}",
               r["fileLicence"]+" | rights still subject to review",
               r["file"][:45]]
        for n,line in enumerate(lines):d.text((W*i+10,533+n*25),line,fill=(244,231,206))
    out.save(OUT/"w98-true-phone-fit-contact-sheet.jpg",quality=92)
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    rows=[]
    for item in json.loads(SRC.read_text())["sourcePhotos"]:
        try:
            row=acquire(item)
            print("W98_SOURCE_DOWNLOADED",row["categoryIndex"],row["nativeResolution"],flush=True)
        except Exception as e:
            row={"categoryIndex":item["categoryIndex"],"file":item["commonsFile"],
                 "status":"SOURCE_FETCH_HOLD","error":str(e)[:260],"automaticApproval":False}
            print("W98_HOLD",row["categoryIndex"],row["error"],flush=True)
        rows.append(row)
    sheet(rows)
    stats={"attempts":len(rows),"downloaded":sum(r["status"].startswith("DOWNLOADED_") for r in rows),
           "holds":sum(not r["status"].startswith("DOWNLOADED_") for r in rows),
           "strictAutomaticallyClosed":0}
    (OUT/"w98-source-mobile-quality-proof.json").write_text(json.dumps({
       "schema":"AO_SACRED_ART_W98_PHONE_DISPLAY_SOURCE_PROOF_V1","counts":stats,
       "photos":rows,"visualExclusions":json.loads(SRC.read_text()).get("visualExclusions",[]),"noPixelsThreshold":True,"strictCategoryCoveragePrior":"146/168",
       "mobileQualityRequiresVisualInspection":True},indent=2,ensure_ascii=False)+"\n")
    print("W98_COMPLETE",json.dumps(stats),flush=True)
if __name__=="__main__":main()
