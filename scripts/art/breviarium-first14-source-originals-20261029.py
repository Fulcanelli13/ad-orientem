#!/usr/bin/env python3
"""Breviarium bulk first-wave: 14 original Commons images with exact SHA1.

All 83 gallery plates were already preserved as registry records. This pass
archives a deliberately bounded, aesthetically relevant, historically unused
candidate cohort, then creates native-corner QA sheets. No artist selection,
crop, copyright decision or live artwork is changed.
"""
from __future__ import annotations
from collections import Counter
from io import BytesIO
import gc,hashlib,json,time,urllib.parse,urllib.request,urllib.error
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw

ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json"
OUT=ROOT/"assets/staged/sacred-art-breviarium-wave1-native-20261029"
OUT.mkdir(parents=True,exist_ok=True)
reg=json.loads(SOURCE.read_text())
assert reg["counts"]["total_gallery_plates"]==83
INDEX={x["breviarum_plate_id"]:x for x in reg["records"]}
TARGETS=[
 "plate-caravaggio-thomas","plate-caravaggio-emmaus",
 "plate-caravaggio-flagellation","plate-caravaggio-crowning",
 "plate-rembrandt-christ","plate-rembrandt-adulteress",
 "plate-rembrandt-storm","plate-rembrandt-ascension",
 "plate-rembrandt-jacob","plate-reni-joseph",
 "plate-latour-newborn","plate-ribera-jerome",
 "plate-ulivelli-peregrine","plate-poussin-rita"]
assert len(TARGETS)==14 and len(set(TARGETS))==14
assert all(k in INDEX for k in TARGETS)
Image.MAX_IMAGE_PIXELS=160_000_000
UA="AdOrientem-SacredArt-PublicDomain-Research/1.0 (GitHub: Fulcanelli13/ad-orientem)"
MAX_SINGLE=14_500_000
MAX_TOTAL=100_000_000
def sha1(x):return hashlib.sha1(x).hexdigest()
def sha256(x):return hashlib.sha256(x).hexdigest()

def fetch(url):
    p=urllib.parse.urlparse(url)
    if p.scheme!="https" or p.netloc not in ("upload.wikimedia.org","upload.wikimedia.org"):
        raise ValueError("NOT_VERIFIED_COMMONS_UPLOAD_URL")
    req=urllib.request.Request(url,headers={"User-Agent":UA})
    with urllib.request.urlopen(req,timeout=90) as resp:
        data=resp.read(MAX_SINGLE+1)
    if not data or len(data)>MAX_SINGLE:raise ValueError("SOURCE_EXCEEDS_RESEARCH_STORAGE_LIMIT")
    return data

def decode_and_sheet(rec,raw):
    with Image.open(BytesIO(raw)) as source:
        source.load()
        if source.format!="JPEG":raise ValueError("NOT_JPEG_SOURCE")
        if [source.width,source.height] != [rec["commons_current_imageinfo"]["native_width_px"],
                                           rec["commons_current_imageinfo"]["native_height_px"]]:
            raise ValueError("COMMONS_DIMENSIONS_NOT_MATCH")
        if source.width*source.height>120_000_000:raise ValueError("UNBOUNDED_PIXEL_COUNT")
        exif=source.getexif()
        icc=bool(source.info.get("icc_profile"))
        # All previews are reductions. Source master bytes are never recompressed.
        thumb=source.copy()
        thumb.thumbnail((235,255),Image.Resampling.LANCZOS)
        thumb=thumb.convert("RGB")
        corners=[]
        size=min(205,source.width,source.height)
        for x,y in ((0,0),(source.width-size,0),(0,source.height-size),(source.width-size,source.height-size)):
            corners.append(source.crop((x,y,x+size,y+size)).convert("RGB"))
        return {"native_pixels":[source.width,source.height],"format":source.format,
                "native_corner_size_px":size,"embedded_icc_present":icc,
                "embedded_exif_tag_count":len(exif),
                "all_corners_source_exact":True},thumb,corners
def sheet(chunk,no):
    W,H=1220,300
    panel=Image.new("RGB",(W,24+H*len(chunk)),(18,21,26))
    d=ImageDraw.Draw(panel)
    d.text((14,6),"BREVIARIUM W1: SOURCE-EXACT PHOTOS / FULL IMAGE + FOUR NATIVE CORNERS / NOT PRISTINE",fill=(238,225,201))
    for i,(rec,thumbnail,corners) in enumerate(chunk):
        y=24+i*H
        d.text((12,y+8),rec["title"][:60]+" | "+rec["artist"][:35],fill=(243,222,193))
        d.text((12,y+28),str(rec["native_pixels"])+" / "+rec["status"],fill=(161,202,202))
        panel.paste(thumbnail,(16+(240-thumbnail.width)//2,y+46+(252-thumbnail.height)//2))
        for ci,c in enumerate(corners):
            panel.paste(c,(270+ci*227,y+50))
            d.text((270+ci*227,y+263),("NATIVE TL","NATIVE TR","NATIVE BL","NATIVE BR")[ci],fill=(210,191,166))
        thumbnail.close()
        for c in corners:c.close()
    name="full-and-four-native-corners-"+str(no).zfill(2)+".jpg"
    path=OUT/name
    panel.save(path,"JPEG",quality=88,optimize=True)
    return {"path":str(path.relative_to(ROOT)),"sha256":sha256(path.read_bytes()),
            "case_ids":[c[0]["plate_id"] for c in chunk]}
rows=[]
qa=[]
sheets=[]
downloaded_bytes=0
for key in TARGETS:
    x=INDEX[key]
    info=x.get("commons_current_imageinfo")
    row={"plate_id":key,"title":x["title"],"artist":x["artist_as_credited"],
        "source_gallery":x["breviarum_gallery_url"],
        "source_file_page":info.get("file_page") if info else None,
        "source_file_sha1":info.get("sha1") if info else None,
        "source_original_bytes":info.get("byte_size") if info else None,
        "source_native_dimensions":[info.get("native_width_px"),info.get("native_height_px")] if info else None,
        "aesthetic_triage":x["aesthetic_triage"],
        "quality_certified":False,"rights_final_certified":False,"pristine_certified":False,
        "production_activated":False,"user_editorial_approval":False,
        "existing_hero_unchanged":True,"no_auto_crop":True}
    try:
        if x["hard_artist_exclusion"] or x["possible_global_rejected_identity_collisions"]:
            raise ValueError("ARTIST_EXCLUDED_OR_GLOBAL_USER_REJECTION_IDENTITY_HOLD")
        if x["possible_22_prayer_hero_collisions"]:
            raise ValueError("EXISTING_APPROVED_PRAYER_MASTER_DEDUP_HOLD")
        if info is None or x["source_metadata_rights_hold"]:
            raise ValueError("NO_SOURCE_SPECIFIC_PD_RIGHTS_EVIDENCE")
        if min(info["native_width_px"],info["native_height_px"])<1800:
            raise ValueError("NATIVE_SHORT_EDGE_BELOW_1800")
        if info["byte_size"]>MAX_SINGLE:
            raise ValueError("TOO_LARGE_FOR_UNREVIEWED_BULK_RESEARCH_GIT")
        if downloaded_bytes+info["byte_size"]>MAX_TOTAL:
            raise ValueError("EXCEEDS_BOUNDED_BULK_RESEARCH_STORAGE")
        raw=fetch(info["commons_current_file_url"])
        if len(raw)!=info["byte_size"] or sha1(raw)!=info["sha1"]:
            raise ValueError("COMMONS_ORIGINAL_SIZE_SHA1_MISMATCH")
        meta,thumb,corners=decode_and_sheet(x,raw)
        path=OUT/(key+".jpg")
        path.write_bytes(raw)
        downloaded_bytes+=len(raw)
        row.update({"status":"SOURCE_EXACT_ORIGINAL_ARCHIVED_PHOTOGRAPHIC_QA_PENDING",
                    "archive_path":str(path.relative_to(ROOT)),"archive_sha256":sha256(raw),
                    "archive_sha1":sha1(raw),"archive_bytes":len(raw),**meta,
                    "source_photo_rights_basis":info["license_short_name"],
                    "source_file_attribution":info.get("artist_metadata"),
                    "archived_bytes_unchanged_from_commons":True})
        qa.append((row,thumb,corners))
        print("ARCHIVED",key,meta["native_pixels"],len(raw),flush=True)
        if len(qa)==3:
            sheets.append(sheet(qa,len(sheets)+1))
            qa.clear()
    except Exception as e:
        row.update(status="SOURCE_OR_PHOTOGRAPHIC_QA_HOLD",
                   hold_reason=type(e).__name__+": "+str(e)[:280])
        print("HOLD",key,str(e)[:130],flush=True)
    finally:
        rows.append(row)
        gc.collect()
        time.sleep(.15)
if qa:
    sheets.append(sheet(qa,len(sheets)+1))
    qa.clear()
out={"schema":"AO_SACRED_ART_BREVIARIUM_W1_FOURTEEN_NATIVE_SOURCE_PROOFS_V1",
     "date":"2026-10-29","origin":"data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json",
     "source_file_downloads_bounded":True,"no_el_greco_no_fra_angelico":True,
     "approved_image_master_changes":0,"photo_rights_final_certified":0,
     "pristine_publication_certified":0,"production_activated":0,"cost_eur":0,
     "total_cases":len(rows),
     "originals_sha1_byte_verified_and_archived":sum(bool(x.get("archive_path")) for x in rows),
     "source_holds":sum(not x.get("archive_path") for x in rows),
     "archive_bytes_total":downloaded_bytes,"cases":rows,"native_review_sheets":sheets}
(OUT/"wave1-source-intake-results.json").write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({k:out[k] for k in ("total_cases","originals_sha1_byte_verified_and_archived",
    "source_holds","archive_bytes_total","pristine_publication_certified","production_activated")}))
if not out["originals_sha1_byte_verified_and_archived"]:
    raise SystemExit("W1_FAILED_NO_SOURCE_ACQUIRED")
