#!/usr/bin/env python3
"""Acquire and QA only institutionally cleared Holy Trinity source photographs.
Research-only GitHub Action, no repository or deployed-site changes.
Requires Pillow. Writes source originals unchanged and separate WebP derivatives.
"""
import hashlib, json, os, pathlib, shutil, sys, time, urllib.request
from PIL import Image, ImageOps

ROOT=pathlib.Path("trinity-cleared-acquisition")
MASTERS=ROOT/"originals"
MOBILE=ROOT/"mobile"
MASTERS.mkdir(parents=True,exist_ok=True)
MOBILE.mkdir(parents=True,exist_ok=True)
IMAGES=[
    ("01_rubens_1620_kmska_314.jpg",[
       "https://iiif.kmska.be/c/iiif/2/public@28958.tif/full/full/0/default.jpg",
       "https://upload.wikimedia.org/wikipedia/commons/8/81/Peter_Paul_Rubens_-_Heilige_Drievuldigheid_-_314_-_Royal_Museum_of_Fine_Arts_Antwerp.jpg"
     ],"KMSKA/Flemish Art Collection CC0",{"width":19178,"height":19721}),
    ("03_dolci_c1640_risd_59009.jpg",[
       "https://upload.wikimedia.org/wikipedia/commons/a/a4/Carlo_Dolci_-_The_Trinity_in_Glory_-_59.009_-_Rhode_Island_School_of_Design_Museum.jpg"
     ],"RISD Museum CC0",{"width":877,"height":1024}),
    ("09_campeche_c1790_met_2025244.jpg",[
       "https://collectionapi.metmuseum.org/api/collection/v1/iiif/917618/2494779/main-image"
     ],"The Metropolitan Museum of Art CC0 Open Access",None)
]
def get(url, target):
    request=urllib.request.Request(url,headers={
       "User-Agent":"AdOrientemSacredArtSourceReview/1.0 (+https://github.com/Fulcanelli13/ad-orientem)",
       "Accept":"image/jpeg,image/*;q=0.9,*/*;q=0.3"
    })
    with urllib.request.urlopen(request,timeout=150) as r, open(target,"wb") as f:
        ctype=r.headers.get("Content-Type","")
        if "text/html" in ctype or "application/json" in ctype:
            raise ValueError("Received non-image "+ctype)
        shutil.copyfileobj(r,f)
    with open(target,"rb") as f:
        first=f.read(2)
    if first!=b"\xff\xd8":
        raise ValueError("Not a JPEG")
    im=Image.open(target); im.verify()
    im=Image.open(target)
    return im.size

results=[]
for filename,urls,rights,expected in IMAGES:
    file=MASTERS/filename
    record={"filename":filename,"rightsEvidence":rights,"status":"NOT_ACQUIRED","errors":[]}
    for url in urls:
        for attempt in range(2):
            try:
                dimensions=get(url,file)
                record["status"]="ACQUIRED"
                record["source"]=url
                record["width"],record["height"]=dimensions
                with open(file,"rb") as f:
                    record["sha256"]=hashlib.file_digest(f,"sha256").hexdigest()
                record["bytes"]=file.stat().st_size
                record["expectedDimensionsEqual"]=(expected is None or dimensions==(expected["width"],expected["height"]))
                image=Image.open(file)
                icc=image.info.get("icc_profile")
                image=ImageOps.exif_transpose(image)
                if image.mode not in ("RGB","RGBA"):
                    image=image.convert("RGB")
                record["derivatives"]=[]
                for long_edge in [768,1200,2000,3200]:
                    if max(image.size)<long_edge:
                        continue # never upscale
                    derivative=image.copy()
                    derivative.thumbnail((long_edge,long_edge),Image.Resampling.LANCZOS)
                    out=MOBILE/(file.stem+"_"+str(long_edge)+".webp")
                    kwargs=dict(format="WEBP",quality=88,method=6)
                    if icc:kwargs["icc_profile"]=icc
                    derivative.save(out,**kwargs)
                    record["derivatives"].append({"file":str(out.relative_to(ROOT)),"width":derivative.width,"height":derivative.height,"bytes":out.stat().st_size})
                break
            except Exception as e:
                record["errors"].append({"source":url,"attempt":attempt+1,"type":type(e).__name__,"message":str(e)[:240]})
                try:file.unlink()
                except FileNotFoundError:pass
                time.sleep(1)
        if record["status"]=="ACQUIRED": break
    results.append(record)
    print(json.dumps({k:v for k,v in record.items() if k not in ("errors","derivatives")},ensure_ascii=False),flush=True)
report={
"schema":"AO_TRINITY_CC0_MASTER_ACQUISITION_RESULT_V1",
"researchOnly":True,
"productionAssetsInstalled":False,
"workIds":[1,3,9],
"sourceMasterFilesUntouched":True,
"qualityControl":"JPEG signature + Pillow verification, true pixel dimensions and SHA-256; manual colour/brushwork inspection still pending.",
"artworks":results
}
(ROOT/"ACQUISITION_REPORT.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
(ROOT/"README.txt").write_text(
"Ad Orientem Holy Trinity research originals and derived WebP files.\n"
"Only CC0-labelled sources 1 Rubens, 3 Dolci, 9 Campeche are included.\n"
"No production use until manual visual/source QA, colour and license acceptance.\n"
"Source JPEGs in originals/ are not altered. Derivatives are not upscaled.\n"
"Sources/actual SHA-256 dimensions and acquisition failures in ACQUISITION_REPORT.json.\n"
"Works 2 Guido Reni, 4 Tiepolo, 8 Dürer remain in source/rights review.\n"
)
if any(x["status"]!="ACQUIRED" for x in results):sys.exit(1)
