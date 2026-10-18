import requests,time,json,io
from pathlib import Path
from urllib.parse import urlencode,quote
from PIL import Image,ImageOps
S=requests.Session()
S.headers.update({"User-Agent":"AdOrientem-VisibleMass/0.4 (github.com/Fulcanelli13/ad-orientem)","Accept":"application/json,image/jpeg,*/*"})
files={
"brompton360":"Brompton Oratory 360x180, London, UK - Diliff.jpg",
"newman360":"Newman University Church Interior 360x180, Dublin, Ireland - Diliff.jpg",
"newman_altar1":"Dublin Newman University Church Interior Choir Main Altar 1.jpg",
"newman_altar2":"Dublin Newman University Church Interior Choir Main Altar 2.jpg",
"newman_apse":"Dublin Newman University Church Interior Choir Apse 1.jpg",
"newman_pulpit":"Dublin Newman University Church Interior Nave Pulpit.jpg",
"newman_altar3":"Dublin Newman University Church Interior Choir Main Altar 3.jpg",
"brompton_altar1":"The Oratory of S Philip Neri, High Altar 1.jpg",
"brompton_altar2":"The Oratory of S Philip Neri, High Altar 2.jpg",
"brompton_lady":"The Oratory of S Philip Neri, The Lady Altar.jpg",
"brompton_heart":"The Oratory of S Philip Neri, Sacred Heart Chapel.jpg",
"brompton_still":"The High Altar - geograph.org.uk - 6213275.jpg"
}
out=Path("dist/visible-mass/panorama-sources");out.mkdir(parents=True,exist_ok=True)
metadata={}
# Wikimedia limits repeated sequential imageinfo calls. Query all required
# original files in two batches (pano and still), preserving exact title IDs.
def read_batch(items,width):
 titles="|".join("File:"+name for _,name in items)
 url="https://commons.wikimedia.org/w/api.php?"+urlencode({
  "action":"query","format":"json","formatversion":"2",
  "prop":"imageinfo","iiprop":"url|mime|size|extmetadata",
  "iiurlwidth":width,"titles":titles
 })
 for attempt in range(6):
  try:
   r=S.get(url,timeout=50);r.raise_for_status()
   pages=r.json()["query"]["pages"]
   found={p["title"].removeprefix("File:").replace("_"," ").casefold():p for p in pages}
   result={}
   for key,name in items:
    pg=found.get(name.replace("_"," ").casefold())
    if not pg or "imageinfo" not in pg:raise ValueError("Commons source title missing: "+name)
    info=pg["imageinfo"][0]
    if "image" not in info.get("mime",""):raise ValueError("Not an image: "+name)
    result[key]=info
   return result
  except Exception as e:
   if attempt==5:raise
   delay=(18*(attempt+1)) if getattr(getattr(e,"response",None),"status_code",0)==429 else 3+attempt*4
   print("retry batch imageinfo",str(e)[:150],"sleep",delay,flush=True)
   time.sleep(delay)
panos=[(key,name) for key,name in files.items() if key.endswith("360")]
stills=[(key,name) for key,name in files.items() if not key.endswith("360")]
source_info={**read_batch(panos,4096),**read_batch(stills,1800)}
for key,name in files.items():
 info=source_info[key]
 image=None
 for candidate in [info.get("thumburl"),info.get("url")]:
  if not candidate:continue
  for attempt in range(4):
   try:
    rr=S.get(candidate,timeout=50);rr.raise_for_status()
    assert rr.headers.get("content-type","").startswith("image/"),rr.text[:100]
    image=Image.open(io.BytesIO(rr.content));image.load()
    break
   except Exception as e:
    delay=18*(attempt+1) if getattr(getattr(e,"response",None),"status_code",0)==429 else 3+attempt*4
    print("retry image",key,str(e)[:170],"sleep",delay,flush=True);time.sleep(delay)
  if image is not None:break
 if image is None:raise RuntimeError("Image acquisition failed: "+key)
 image=ImageOps.exif_transpose(image).convert("RGB")
 if key.endswith("360"):
  if not (.995 < image.width/(2*image.height)<1.005):raise ValueError("not equirectangular: "+str(image.size))
  image.thumbnail((4096,2048),Image.Resampling.LANCZOS)
 else:image.thumbnail((1800,1800),Image.Resampling.LANCZOS)
 dest=out/(key+".jpg")
 image.save(dest,"JPEG",quality=83,progressive=True,optimize=True)
 ext=info.get("extmetadata",{})
 def val(field):
  import re
  return re.sub("<[^>]+>","",ext.get(field,{}).get("value","")).strip()
 metadata[key]={"file":dest.name,"original_name":name,
 "commons_page":"https://commons.wikimedia.org/wiki/File:"+quote(name.replace(" ","_"),safe="(),"),
 "artist":val("Artist"),"license":val("LicenseShortName"),"license_url":val("LicenseUrl"),
 "width":image.width,"height":image.height,"adaptations":"Recompressed and resized for offline interactive panorama preview."}
 print("ACQUIRED",key,image.size,dest.stat().st_size,metadata[key]["license"],flush=True)
 time.sleep(1.7)
(out/"metadata.json").write_text(json.dumps(metadata,indent=2),encoding="utf-8")
