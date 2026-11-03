#!/usr/bin/env python3
"""Read-only museum downloads + branch-scoped committed exact originals and letterbox-free display derivatives."""
import hashlib, io, json, os, pathlib, urllib.request
from PIL import Image
SPEC = pathlib.Path("data/prayer/artwork-editorial-20261101/met-two-frameless-eight-slot-release-20261103.v1.json")
doc=json.loads(SPEC.read_text(encoding="utf-8"))
assert os.environ.get("GITHUB_REF")=="refs/heads/release/prayer-latour-giordano-eight-20261103"
assert os.environ.get("GITHUB_REPOSITORY")=="Fulcanelli13/ad-orientem"
assert doc["expectedSlotCount"]==8 and len(doc["works"])==2 and doc["governance"]=="DRAFT_NOT_YET_PRODUCTION"
records=[]
for w in doc["works"]:
    assert w["url"].startswith("https://images.metmuseum.org/CRDImages/ep/original/")
    assert w["source"].startswith("https://www.metmuseum.org/art/collection/search/")
    assert len(w["slots"]) in (3,5) and sum(len(t["slots"]) for t in doc["works"])==8
    req=urllib.request.Request(w["url"],headers={"User-Agent":"AdOrientemArtworkQA/1.0","Accept":"image/jpeg"})
    with urllib.request.urlopen(req,timeout=55) as r: raw=r.read(15_000_000)
    assert len(raw)==w["bytes"], (w["artId"],len(raw),w["bytes"])
    digest=hashlib.sha256(raw).hexdigest()
    assert digest==w["sha256"], (w["artId"],digest)
    im=Image.open(io.BytesIO(raw)).convert("RGB")
    assert im.size==(w["width"],w["height"])
    box=w["bbox"]; left,top,right,bottom=box
    assert 0<left<right<w["width"] and 0<top<bottom<w["height"]
    # Guard: the excluded area must be essentially all uniform black padding,
    # not unpainted dark details or meaningful portions of the artwork.
    # Scan the four removed rectangles, ignoring double-counting corner pixels.
    strips=[im.crop((0,0,w["width"],top)), im.crop((0,bottom,w["width"],w["height"])),
            im.crop((0,top,left,bottom)), im.crop((right,top,w["width"],bottom))]
    nearblack=total=0
    for strip in strips:
        rgb=strip.tobytes()
        total+=len(rgb)//3
        nearblack+=sum(1 for i in range(0,len(rgb),3) if max(rgb[i:i+3])<=10)
    assert nearblack/total>0.999, (w["artId"],"cropped region has nonblack painted content",nearblack/total)
    a=pathlib.Path(w["original"]); b=pathlib.Path(w["image"])
    for f in (a,b):
        assert str(f).startswith("assets/prayer/released/") and ".." not in f.parts
        f.parent.mkdir(parents=True,exist_ok=True)
    if a.exists():assert a.read_bytes()==raw
    else:a.write_bytes(raw)
    cropped=im.crop(tuple(box))
    cropped.save(b,format="JPEG",quality=90,subsampling=0,optimize=True)
    restored=Image.open(b)
    assert restored.size==(right-left,bottom-top)
    rdigest=hashlib.sha256(b.read_bytes()).hexdigest()
    records.append({"artId":w["artId"],"original":str(a),"originalSha256":digest,
      "image":str(b),"imageSha256":rdigest,"cropBounds":box,"imageWidth":restored.width,
      "imageHeight":restored.height,"removedBlackPaddingFraction":round(nearblack/total,7),
      "protectedOriginalUntouched":True,"displayDerivativeContainsAllPaintedPixels":True})
    print("STAGED_MUSEUM",w["artId"],digest,rdigest,restored.size)
target=pathlib.Path("data/prayer/artwork-editorial-20261101/met-two-frameless-pixel-proof-20261103.v1.json")
target.write_text(json.dumps({"source":"MET_OPEN_ACCESS_PUBLIC_DOMAIN","policy":"NO_PAINTING_CROP_ONLY_ZERO_PADDING_REMOVAL","works":records},indent=2)+"\n",encoding="utf-8")
print("STAGED_COMPLETE","2 files plus 2 derivatives, 8 previously approved exact slots")
