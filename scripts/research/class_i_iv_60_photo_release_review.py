#!/usr/bin/env python3
"""60 distinct archived images with explicit per-photo public release choices."""
import json,re,base64,hashlib
from pathlib import Path
from io import BytesIO
from PIL import Image
src=Path("previews/sacred-art-b56-classi-53-hero-selection-offline.html").read_text()
def js(name,next_):
 m=re.search("const "+name+r"=(.*?);\s*const "+next_+"=",src,re.S)
 if not m:raise ValueError("Missing source "+name)
 return json.loads(m.group(1))
days=js("DAYS","IMAGE_BANK");images=js("IMAGE_BANK","CACHE")
calendar=json.loads(Path("data/calendar/sacred-art-2026-all-classes-365-coverage.v1.json").read_text())
assert len(days)==53 and len(calendar["days"])==365 and len(images)>=60
all_={}
for day in days:
 for o in day["options"]:
  key=o.get("image_key")
  if not key or key not in images:continue
  a=all_.setdefault(key,{"key":key,"id":o["choice_id"],"title":o["title"],
   "artist":o["artist"],"url":o.get("source_url",""),"originalSha256":o.get("source_sha256"),
   "previouslySelected":False,"dates":[]})
  a["previouslySelected"]|=bool(o.get("historically_approved_for_date"))
  a["dates"].append({"date":day["date"],"class":"I","feast":day["title"],"relation":o["grade"]})
for a in all_.values():
 for d in calendar["days"]:
  if d["rank"]=="I":continue
  if any(z["artworkId"]==a["id"] for z in d.get("linkedCatalogueArt",[])):
   a["dates"].append({"date":d["date"],"class":d["rank"],"feast":d["observedTitle"],"relation":"EXACT_ARTWORK_ID"})
rows=[];usedKeys=set();usedSHA=set()
def add(key):
 if not key or key in usedKeys or key not in all_:return False
 b=base64.b64decode(images[key].split(",",1)[1],validate=True)
 assert b[:4]==b"RIFF" and b[8:12]==b"WEBP"
 h=hashlib.sha256(b).hexdigest()
 if h in usedSHA:return False
 with Image.open(BytesIO(b)) as im:im.verify()
 usedKeys.add(key);usedSHA.add(h)
 a=dict(all_[key]);a["previewSha256"]=h;a["classes"]=sorted(set(x["class"] for x in a["dates"]))
 rows.append(a)
 return True
for d in days:
 for opt in d["options"]:
  if add(opt.get("image_key")):break
for a in sorted(all_.values(),key=lambda x:(x["previouslySelected"],len(x["dates"])),reverse=True):
 if len(rows)>=60:break
 add(a["key"])
assert len(rows)==60,"Need 60 distinct actual photo SHA, not 60 placements"
out=Path("artifacts/class-i-iv-60-photo-release-review");out.mkdir(parents=True,exist_ok=True)
manifest={"schema":"AO_I_IV_60_PHOTOS_B01","photos":60,"classIDates":53,
 "rightsGate":"NOT_AUTOMATICALLY_CLEARED","publicationCount":0,
 "priorPaintingSelectionsPreserved":True,"rows":rows}
(out/"manifest.json").write_text(json.dumps(manifest,indent=2,ensure_ascii=False)+"\n")
template=Path("previews/class-i-iv-60-photo-approval-template.html").read_text()
template=template.replace("__ROWS__",json.dumps(rows,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c"))
template=template.replace("__IMAGES__",json.dumps({x["key"]:images[x["key"]] for x in rows},separators=(",",":")))
assert template.count("data:image/webp;base64,")>=60
(out/"AO_2026_Class_I-IV_60_Photo_Approval_B01.html").write_text(template)
print("PASS 60 distinct images; II-linked",sum("II" in x["classes"] for x in rows),
 "III-linked",sum("III" in x["classes"] for x in rows),"bytes",len(template))
