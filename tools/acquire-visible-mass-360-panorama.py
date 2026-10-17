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
"newman_apse":"Dublin Newman University Church Interior Choir Apse 1.jpg"
}
out=Path("dist/visible-mass/panorama-sources");out.mkdir(parents=True,exist_ok=True)
metadata={}
for key,name in files.items():
 p={"action":"query","format":"json","formatversion":"2","prop":"imageinfo",
 "iiprop":"url|mime|size|extmetadata","iiurlwidth":4096 if key.endswith("360") else 1800,"titles":"File:"+name}
 url="https://commons.wikimedia.org/w/api.php?"+urlencode(p)
 for attempt in range(5):
  try:
   r=S.get(url,timeout=30);r.raise_for_status()
   data=r.json()
   pg=data["query"]["pages"][0];info=pg["imageinfo"][0]
   if "image" not in info.get("mime",""):raise ValueError("not image")
   break
  except Exception as e:
   if attempt==4:raise
   print("retry API",name,str(e)[:130],flush=True);time.sleep(3+attempt*3)
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
    print("retry image",key,str(e)[:170],flush=True);time.sleep(3+attempt*4)
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
 time.sleep(0.8)
(out/"metadata.json").write_text(json.dumps(metadata,indent=2),encoding="utf-8")
