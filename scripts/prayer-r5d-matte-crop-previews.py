#!/usr/bin/env python3
"""Generate reversible R5D border-trim previews. NEVER write publication assets."""
import hashlib, json
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT=Path(__file__).resolve().parent.parent
LEDGER=json.loads((ROOT/"data/pray/research/r5d-first-cohort-visual-triage.v1.json").read_text())
OUT=ROOT/"r5d-matte-preview"
OUT.mkdir(exist_ok=True)
sources=json.loads((ROOT/"assets/prayer/research/r5d-bulk-museum-originals/manifest.json").read_text())["artworks"]
first=json.loads((ROOT/"data/pray/artwork-r5d-museum-source-verification-20261104.v1.json").read_text())["records"]
provenance={}
for r in sources:
    file=f"{r['museum']}-{r['object_id']}."+({"JPEG":"jpg","PNG":"png","TIFF":"tif"}[r["format"]])
    provenance[file]=(r["sha256"],r["bytes"])
for r in first:
    file="cleveland-1916.786.jpg" if "clevelandart" in r["sourcePage"] else "met-437542.jpg"
    provenance[file]=(r["imageSourceRetrieval"]["sha256"],r["imageSourceRetrieval"]["bytes"])
assert len(provenance)==16
assert len(LEDGER["records"])==16
assert LEDGER["photoPublicationAuthorized"] is False
items=[]
for row in LEDGER["records"]:
    file=row["file"]
    folder="r5d-museum-originals" if file in ("cleveland-1916.786.jpg","met-437542.jpg") else "r5d-bulk-museum-originals"
    original=ROOT/"assets/prayer/research"/folder/file
    raw=original.read_bytes()
    sha,length=provenance[file]
    assert hashlib.sha256(raw).hexdigest()==sha and len(raw)==length
    with Image.open(original) as src:
        src.verify()
    with Image.open(original) as src:
        img=src.convert("RGB")
    if row["status"]=="RECTANGULAR_MATTE_PREVIEW":
        left,top,right,bottom=(row["cropPct"][key]/100 for key in ("left","top","right","bottom"))
        assert all(0<=x<=0.04 for x in (left,top,right,bottom))
        w,h=img.size
        crop=img.crop((round(w*left),round(h*top),round(w*(1-right)),round(h*(1-bottom))))
        assert min(crop.size)>1200
        candidate=OUT/("trim-preview-"+file)
        crop.thumbnail((1200,1600))
        crop.save(candidate,quality=88)
        items.append((file,img,crop,row))
assert len(items)==7
# Seven original-versus-candidate comparisons, one per artwork.
for idx,(file,original,cropped,row) in enumerate(items,1):
    board=Image.new("RGB",(1250,800),"#f5f1ed")
    pen=ImageDraw.Draw(board)
    pen.text((30,20),f"R5D source review {idx}/7: {file} | unapproved matte-only crop",fill="#161616")
    for n,img in enumerate((original,cropped)):
        thumb=ImageOps.contain(img,(580,680))
        box=(25+n*620+(580-thumb.width)//2,80+(680-thumb.height)//2)
        board.paste(thumb,box)
        pen.text((30+n*620,55),"Original" if n==0 else "Candidate preview (not publication)",fill="#222222")
    board.save(OUT/(f"comparison-{idx:02d}.jpg"),quality=85)
(OUT/"crop-review.json").write_text(json.dumps({
    "schema":"AO_PRAYER_R5D_MATTE_PREVIEW_QA_V1","originalHashValidationPassed":True,
    "compositeCount":7,"publicationAuthorized":False,
    "requiresHumanVisualApproval":True,
    "previewFiles":[f"comparison-{i:02d}.jpg" for i in range(1,8)],
    "untouchedSpecialReview": [r["file"] for r in LEDGER["records"] if r["status"] in ("SHAPED_PANEL_MATTE_REVIEW","DECORATIVE_FRAME_IDENTITY_REVIEW")]
},indent=2)+"\n")
print("Verified 16 originals and prepared 7 non-destructive matte crop comparison previews; no production assets changed.")
