#!/usr/bin/env python3
"""Archive exactly TWO explicitly approved public-domain Prayer images at €0.

Do not fetch any Peter Rauth, copyright-claimed, modern painting, or unrelated
Commons work through this archival process. Keeps original framing and
proportions (no AI upscaling), saves optimised WebP to the existing assets tree.
"""
from __future__ import annotations
import hashlib,io,json,urllib.request
from datetime import datetime,timezone
from pathlib import Path
from PIL import Image,ImageOps

SOURCES=(
 {"slot":"STG-pray.benediction-03","slug":"benediction-mystic-lamb","fileName":"Ghent_Altarpiece_-_Adoration_of_the_Mystic_Lamb.jpg",
  "page":"https://commons.wikimedia.org/wiki/File:Ghent_Altarpiece_-_Adoration_of_the_Mystic_Lamb.jpg",
  "source":"https://commons.wikimedia.org/wiki/Special:FilePath/Ghent_Altarpiece_-_Adoration_of_the_Mystic_Lamb.jpg",
  "expectedSize":(2725,1577),"expectedRights":"Wikimedia Commons PD-Art, old-100, Public Domain Mark (NOT a CC0 licence)",
  "editorial":"APPROVED_THEMATIC_SCENE","artist":"Hubert and Jan van Eyck","title":"The Adoration of the Mystic Lamb","workYear":1432},
 {"slot":"COV-novena.st_therese","slug":"st-therese-lisieux-historical-portrait","fileName":"Therese_lisieux_portrait.jpg",
  "page":"https://commons.wikimedia.org/wiki/File:Therese_lisieux_portrait.jpg",
  "source":"https://upload.wikimedia.org/wikipedia/commons/e/e7/Therese_lisieux_portrait.jpg",
  "expectedSize":(362,498),"expectedRights":"Wikimedia Commons Public Domain in France and United States (NOT modern Céline Martin painting)",
  "editorial":"FINAL_PHOTOGRAPH_APPROVED","artist":"Unknown historic photographer","title":"Saint Thérèse of Lisieux, authentic lifetime portrait","workYear":1897}
)
OUT=Path("assets/prayer/user-approved")
REG=Path("data/prayer/artwork-editorial-20261031/user-direct-benediction-therese-selections.v1.json")

def load(u):
 req=urllib.request.Request(u,headers={"User-Agent":"AdOrientemSacredArtResearch/1.0 (open-source educational attribution archive)"})
 with urllib.request.urlopen(req,timeout=26) as r:
  data=r.read(15_000_001)
 if len(data)>15_000_000:raise ValueError("Source too large")
 return data

def main():
 decisions={d["slot"]:d for d in json.loads(REG.read_text())["decisions"]}
 assert len(SOURCES)==2
 result={"schema":"AO_20261031_DIRECT_USER_PRESCRIBED_PD_IMAGE_ASSETS_V1","date":"2026-10-31",
  "originalSourceImagesSaved":False,"neverCropOrUpscale":True,"sourceCopyrightAndLicenseNotReassigned":True,
  "notRauthPhotos":True,"images":[]}
 OUT.mkdir(parents=True,exist_ok=True)
 for x in SOURCES:
  d=decisions[x["slot"]]
  assert d["userEditorial"]==x["editorial"]
  assert d["primarySource"]==x["page"]
  source=load(x["source"])
  with Image.open(io.BytesIO(source)) as original:
   assert original.format=="JPEG","Source needs reinspection: expected JPEG"
   image=ImageOps.exif_transpose(original).convert("RGB")
   assert image.size==x["expectedSize"],f"Remote source changed: {x['slug']}, dimensions {image.size}"
   payload=io.BytesIO()
   image.save(payload,format="WEBP",quality=91,method=6,exact=True)
   webp=payload.getvalue()
   with Image.open(io.BytesIO(webp)) as check:
    assert check.size==image.size
  output=OUT/(x["slug"]+".webp")
  output.write_bytes(webp)
  entry={"slot":x["slot"],"artist":x["artist"],"title":x["title"],"year":x["workYear"],
   "originalCommonsPage":x["page"],"downloadedSourceURL":x["source"],
   "originalSourceSHA256":hashlib.sha256(source).hexdigest(),"sourceBytes":len(source),
   "fileName":x["fileName"],"sourcePixels":list(image.size),
   "localAssetPath":str(output),"webpSHA256":hashlib.sha256(webp).hexdigest(),"webpBytes":len(webp),
   "rightsBasis":x["expectedRights"],"copyrightStatus":"PUBLIC_DOMAIN_RECORD_IDENTIFIED",
   "userApproval":x["editorial"],"unrelatedArtApprovalsPreserved":True,
   "noRauthPhotoPermissionInferred":True}
  result["images"].append(entry)
  print("ARCHIVED_PD_USER_SELECTION",x["slot"],str(output),image.size,len(webp),entry["webpSHA256"])
 assert len(result["images"])==2
 assert all("rauth" not in x["localAssetPath"].lower() for x in result["images"])
 out=OUT/"source-provenance.v1.json"
 out.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
 print("PUBLIC_DOMAIN_USER_ASSETS_READY=2")

if __name__=="__main__":main()
