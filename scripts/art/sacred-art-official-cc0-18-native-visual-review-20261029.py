#!/usr/bin/env python3
"""First visual review of official museum CC0 photos, same frozen SHA.

Research-only, no production. Original source image is downloaded once from
museum API, SHA-256 verified against earlier official museum current-image
evidence. Review sheets include whole painting and four native corner samples;
the script never auto-decides whether an edge contains painted matter.
"""
from __future__ import annotations
import hashlib,io,json,urllib.request,urllib.error
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[2]
REG=ROOT/"data/calendar/sacred-art-22-museum-official-cc0-photo-sha-20261028.v1.json"
OUT=ROOT/"assets/staged/sacred-art-curator-18-official-cc0-native-qa-20261029"
OUT.mkdir(parents=True,exist_ok=True)
source=json.loads(REG.read_text())["records"]
assert len(source)==22
pinned=[r for r in source if r.get("source_photo_bytes_same_as_frozen_archive")]
assert len(pinned)==18
UA="AdOrientem-SacredArt-Curatorial-Review/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
Image.MAX_IMAGE_PIXELS=85000000
def fetch(url,max_size,timeout=45):
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/jpeg,*/*"})
    with urllib.request.urlopen(req,timeout=timeout) as f:
        raw=f.read(max_size+1)
    if not raw or len(raw)>max_size:raise ValueError("UNBOUNDED_OR_MISSING_IMAGE")
    return raw
def official_image_url(row):
    details=json.loads(fetch(row["official_object_api"],1200000).decode("utf-8"))
    if row["museum"]=="Metropolitan Museum of Art":
        if details.get("objectID")!=int(row["museum_object_id"]) or details.get("isPublicDomain") is not True:
            raise ValueError("MUSEUM_OBJECT_OR_PD_FLAG_CHANGED")
        return details["primaryImage"]
    if row["museum"]=="Cleveland Museum of Art":
        data=details.get("data",{})
        if data.get("id")!=int(row["museum_object_id"]) or data.get("share_license_status")!="CC0":
            raise ValueError("CMA_ID_OR_CC0_CHANGED")
        return data["images"]["print"]["url"]
    raise ValueError("UNRECOGNIZED_MUSEUM")
def inspect(row):
    url=official_image_url(row)
    if not url.startswith("https://"):raise ValueError("NON_HTTPS_MUSEUM_IMAGE")
    raw=fetch(url,25000000,timeout=70)
    sh=hashlib.sha256(raw).hexdigest()
    if sh!=row["official_photo_sha256_current"]:
        raise ValueError("CURRENT_OFFICIAL_IMAGE_SHA_CHANGED")
    with Image.open(io.BytesIO(raw)) as img:
        img.load()
        if img.format!="JPEG" or list(img.size)!=row["official_current_image_dimensions"]:
            raise ValueError("JPEG_FORMAT_OR_NATIVE_SIZE_MISMATCH")
        rgb=ImageOps.exif_transpose(img).convert("RGB")
        width,height=rgb.size
        whole=rgb.copy();whole.thumbnail((310,390),Image.Resampling.LANCZOS)
        side=min(180,width,height)
        corners=[rgb.crop((x,y,x+side,y+side)) for x,y in
                 [(0,0),(width-side,0),(0,height-side),(width-side,height-side)]]
        middle=rgb.crop(((width-side)//2,(height-side)//2,(width+side)//2,(height+side)//2))
        metadata={"pixels":[width,height],"size_bytes":len(raw),
          "icc_profile_present":bool(img.info.get("icc_profile")),"exif_tag_count":len(img.getexif())}
    rgb.close()
    return {"sha256":sh,"source_object":row["official_object_api"],"museum":row["museum"],
      "title":row["title"],"artist":row["artist"],"artwork_id":row["artwork_id"],**metadata,
      "source_bytes_hash_verified_against_frozen_original":True,
      "official_CC0_recorded":True,
      "full_painted_field_final_certified":False,
      "colour_fidelity_final_certified":False,
      "pristine_final_certified":False,
      "production_approved":False},whole,corners,middle
def sheet(chunk,index):
    H=470;W=1310
    canvas=Image.new("RGB",(W,30+H*len(chunk)),(18,21,24))
    d=ImageDraw.Draw(canvas)
    d.text((12,8),"OFFICIAL CC0 / ORIGINAL SHA EXACT / COMPLETE IMAGE + FIVE NATIVE PIXEL DETAIL SAMPLES / REVIEW NOT APPROVAL",fill=(231,221,206))
    for i,(rec,whole,corners,middle) in enumerate(chunk):
        y=30+H*i
        d.text((14,y+10),rec["title"][:55]+" — "+rec["artist"][:40],fill=(244,223,199))
        d.text((14,y+33),rec["artwork_id"]+" | "+str(rec["pixels"])+" | SHA MATCH",fill=(162,206,203))
        canvas.paste(whole,(15+(320-whole.width)//2,y+64+(385-whole.height)//2))
        for k,cr in enumerate(corners):
            cx=365+(k%2)*215;cy=y+61+(k//2)*207
            canvas.paste(cr,(cx,cy))
            d.text((cx,cy+183),("TL","TR","BL","BR")[k],fill=(181,194,202))
        canvas.paste(middle,(830,y+62))
        d.text((835,y+245),"CENTRE NATIVE",fill=(181,194,202))
        d.text((1020,y+76),"RIGHTS:",fill=(220,219,214))
        d.text((1020,y+96),"OFFICIAL CC0",fill=(127,216,170))
        d.text((1020,y+131),"QUALITY:",fill=(220,219,214))
        d.text((1020,y+151),"PENDING",fill=(233,186,143))
        d.text((1020,y+190),"NO AUTOMATIC",fill=(186,193,200))
        d.text((1020,y+211),"PRISTINE MARK",fill=(186,193,200))
        whole.close();middle.close()
        for p in corners:p.close()
    path=OUT/("official-original-native-edges-"+str(index).zfill(2)+".jpg")
    canvas.save(path,"JPEG",quality=91,optimize=True)
    return {"path":str(path.relative_to(ROOT)),"sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
      "artwork_ids":[v[0]["artwork_id"] for v in chunk]}
rows=[];group=[];sheets=[]
for art in pinned:
    try:
        rec,whole,corners,middle=inspect(art)
        rec["status"]="OFFICIAL_CC0_SOURCE_BYTE_IDENTICAL_NATIVE_VISUAL_REVIEW_PROOF_CAPTURED"
        group.append((rec,whole,corners,middle))
        print("SOURCE_EXACT",art["artwork_id"],flush=True)
        if len(group)==3:
            sheets.append(sheet(group,len(sheets)+1));group.clear()
    except Exception as e:
        rec={"artwork_id":art["artwork_id"],"title":art["title"],"artist":art["artist"],
          "status":"LIVE_INSTITUTIONAL_SOURCE_RETRIEVAL_HOLD",
          "exception":type(e).__name__+": "+str(e)[:320],
          "source_sha256_recorded":art["official_photo_sha256_current"],
          "official_CC0_recorded":True,"pristine_final_certified":False}
        print("SOURCE_HOLD",art["artwork_id"],rec["exception"],flush=True)
    rows.append(rec)
if group:sheets.append(sheet(group,len(sheets)+1))
report={"schema":"AO_SACRED_ART_OFFICIAL_CC0_18_NATIVE_PREVIEW_W1_V1",
 "date":"2026-10-29","source":"data/calendar/sacred-art-22-museum-official-cc0-photo-sha-20261028.v1.json",
 "total_official_cc0_exact_frozen_originals":18,
 "official_original_retrievals_source_SHA_verified":sum(z["status"].startswith("OFFICIAL_CC0_SOURCE") for z in rows),
 "official_retrieval_holds":sum(z["status"].startswith("LIVE_") for z in rows),
 "native_photo_review_sheets":len(sheets),
 "visually_approved_pristine":0,"source_photo_licence_CC0":18,
 "production_changes":0,"cost_eur":0,"records":rows,"sheets":sheets}
(OUT/"native-official-photo-qa.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({k:report[k] for k in ("total_official_cc0_exact_frozen_originals","official_original_retrievals_source_SHA_verified","official_retrieval_holds","native_photo_review_sheets","visually_approved_pristine")}))
