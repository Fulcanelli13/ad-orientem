#!/usr/bin/env python3
"""Two exact museum-linked Navigart photo sources missed by generic HTML <img> scraping.
Photographs are research previews only; museum painting PD status is not a photo licence.
"""
from pathlib import Path
import hashlib,io,json,requests
from PIL import Image
OUT=Path("artifacts/sacred-art-phase44c-grenoble")
OUT.mkdir(parents=True,exist_ok=True)
cases=[
 {"registry_id":"RECENT575::506","artist":"Claude Vignon","title":"Jésus parmi les docteurs",
  "official_page":"https://www.museedegrenoble.fr/oeuvre/155/1922-jesus-parmi-les-docteurs.htm",
  "photo":"https://images.navigart.fr/1000/5C/78/5C78573.jpg","selected_short_px":512},
 {"registry_id":"RECENT575::518","artist":"Bernardo Strozzi","title":"Le Christ à Emmaüs",
  "official_page":"https://www.museedegrenoble.fr/oeuvre/118/1922-le-christ-a-emmaus.htm",
  "photo":"https://images.navigart.fr/1000/5C/98/5C98224.jpg","selected_short_px":512}
]
for r in cases:
 r.update(status="NOT_FETCHED",image_rights="PHOTO_CREDITED_TO_VILLE_DE_GRENOBLE_MUSEE_DE_GRENOBLE_JL_LACROIX",photo_reuse_permission="NOT_CLEARED",selected_comparison="NOT_AVAILABLE_WIKIMEDIA_HTTP_429",gallery_replaced=False)
 try:
  with requests.get(r["photo"],headers={"User-Agent":"AdOrientemArtResearch/1.1 (metadata and image quality research)"},timeout=(6,25),stream=True) as resp:
   resp.raise_for_status()
   b=resp.content
  if len(b)>10000000:raise ValueError("Too large")
  im=Image.open(io.BytesIO(b));im.verify()
  im=Image.open(io.BytesIO(b))
  r.update(status="RECOVERED_OFFICIAL_LINKED_IMAGE",width=im.width,height=im.height,
           short_px=min(im.width,im.height),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b),
           pixel_size_improvement=min(im.width,im.height)>r["selected_short_px"])
  im.convert("RGB").save(OUT/(r["registry_id"].replace(":","_")+".jpg"),quality=87)
 except Exception as e:
  r.update(status="FETCH_FAILED",error=str(e)[:150])
 (OUT/"evidence.json").write_text(json.dumps(cases,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print(json.dumps({"records":2,"downloaded":sum(r["status"]=="RECOVERED_OFFICIAL_LINKED_IMAGE" for r in cases),
 "pixel_edge_improvements":sum(r.get("pixel_size_improvement",False) for r in cases),
 "exact_photo_visual_matches":0,"image_licences_cleared":0,"images_published":0},indent=2),flush=True)
