#!/usr/bin/env python3
"""Third independent FULL composition witness for Lotto: Yorck PD-Art photo."""
import hashlib,io,json,urllib.parse,urllib.request
from pathlib import Path
from PIL import Image
root=Path.cwd()
filename="Lorenzo_Lotto_057.jpg"
ua="AdOrientem-Research/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
def get(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":ua}),timeout=60) as r:
        return r.read(8*1024*1024+1),r.geturl()
q=urllib.parse.urlencode({"action":"query","format":"json","prop":"imageinfo",
"iiprop":"url|size|sha1|extmetadata","titles":"File:"+filename})
data_bytes,_=get("https://commons.wikimedia.org/w/api.php?"+q)
data=json.loads(data_bytes.decode("utf-8"))
info=next(iter(data["query"]["pages"].values()))["imageinfo"][0]
licence=info["extmetadata"]["LicenseShortName"]["value"]
if "public domain" not in licence.lower():raise ValueError("PD-Art rights check failed: "+licence)
if info["size"]>8*1024*1024:raise ValueError("Not within €0 archive cap")
raw,url=get(info["url"])
if len(raw)>8*1024*1024 or hashlib.sha1(raw).hexdigest()!=info["sha1"].lower():raise ValueError("Source byte hash mismatch")
if urllib.parse.urlsplit(url).hostname!="upload.wikimedia.org":raise ValueError("Source media host mismatch")
with Image.open(io.BytesIO(raw)) as im:
    im.verify()
with Image.open(io.BytesIO(raw)) as im:
    if im.format!="JPEG" or min(im.size)<1000:raise ValueError("Not a full-resolution JPEG candidate")
    width,height=im.size;icc=bool(im.info.get("icc_profile"))
out=root/"assets/staged/module-hero-comparisons/rosary-lotto-yorck.jpg"
out.parent.mkdir(parents=True,exist_ok=True);out.write_bytes(raw)
p=root/"data/research/lotto-rosary-yorck-third-witness-20261026.json"
p.write_text(json.dumps({"module":"Holy Rosary","candidate":"Yorck Project full altarpiece",
  "source_page":"https://commons.wikimedia.org/wiki/File:Lorenzo_Lotto_057.jpg",
  "rights_claim":licence,"rights_validation":"PD-Art; jurisdiction check remains",
  "sha256":hashlib.sha256(raw).hexdigest(),"sha1":info["sha1"],
  "path":str(out.relative_to(root)),"width":width,"height":height,
  "bytes":len(raw),"icc_profile":icc,"painting_fidelity":"PENDING HUMAN VISUAL COMPARISON",
  "editorial_selection_changed":False,"app_published":False},indent=2)+"\n")
print("Acquired verified third full composition:",width,height,len(raw))
