#!/usr/bin/env python3
"""W3b bounded exact-file intake, with strict 429 STOP and no retry.

At most seven known exact-composition files from the metadata-verified W3 queue.
One request per original source, never make a second request after HTTP 429.
Archive unchanged original bytes, SHA1, SHA256 and full+native-corner proofs.
No photo or rights certification, no production source replacement.
"""
import hashlib,io,json,urllib.parse,urllib.request,urllib.error
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[2]
SOURCE=ROOT/"data/calendar/sacred-art-breviarium-83-w3-weak-photo-alternatives-20261029.v1.json"
OUT=ROOT/"assets/staged/sacred-art-breviarium-w3b-exact-originals-20261029"
OUT.mkdir(parents=True,exist_ok=True)
src=json.loads(SOURCE.read_text())
assert len(src["weak_cohort"])==35 and len(src["native_quality_cohort"])==28
QUEUE=["plate-zurbaran-francis","plate-murillo-immaculate","plate-reni-cecilia",
       "plate-velazquez-crucified","plate-raphael-transfiguration",
       "plate-caravaggio-matthew"]
by={x["id"]:x for x in src["weak_cohort"]}
UA="AdOrientem-Breviarium-ExactPublicArt-Research/1.0 (GitHub: Fulcanelli13/ad-orientem)"
MAX_TOTAL=20_000_000
MAX_SINGLE=13_000_000
def sha1(z):return hashlib.sha1(z).hexdigest()
def sha256(z):return hashlib.sha256(z).hexdigest()
def checked_source(q):
    known=q.get("current_source_info")
    if not known or q.get("download_gate")!="SOURCE_PIXELS_IMPROVED_NEEDS_PHOTO_RIGHTS_AND_FIDELITY_REVIEW":
        raise ValueError("NOT_CONFIRMED_NON_OVERSIZE_UPGRADE")
    title=q["title"]
    uri="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
        "action":"query","format":"json","formatversion":2,
        "titles":title,"prop":"imageinfo","iiprop":"url|sha1|size|mime"})
    req=urllib.request.Request(uri,headers={"User-Agent":UA,"Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=35) as f:
        payload=json.loads(f.read(450000))
    pages=payload.get("query",{}).get("pages",{})
    listing=[p["imageinfo"][0] for p in pages.values() if p.get("imageinfo")]
    if len(listing)!=1:raise ValueError("NO_EXACT_FILE")
    info=listing[0]
    if info.get("sha1")!=known["sha1"] or info.get("size")!=known["size_bytes"]:
        raise ValueError("SOURCE_VERSION_CHANGED")
    uri=info.get("url")
    if not uri.startswith("https://upload.wikimedia.org/") or info.get("mime")!="image/jpeg":
        raise ValueError("UNEXPECTED_SOURCE_HOST_OR_MIME")
    if info.get("size",0)>MAX_SINGLE:raise ValueError("EXCEEDS_SINGLE_LIMIT")
    return info
def visual_proof(im,stem):
    w,h=im.size
    rgb=ImageOps.exif_transpose(im).convert("RGB")
    whole=rgb.copy();whole.thumbnail((350,400),Image.Resampling.LANCZOS)
    board=Image.new("RGB",(1170,470),(23,26,30))
    d=ImageDraw.Draw(board)
    d.text((12,10),stem+" | WHOLE SOURCE + FOUR 180px NATIVE CORNERS | QUALITY HOLD",fill=(235,225,203))
    board.paste(whole,(20+(350-whole.width)//2,40+(400-whole.height)//2))
    side=min(180,w,h)
    for i,(x,y) in enumerate(((0,0),(w-side,0),(0,h-side),(w-side,h-side))):
        tile=rgb.crop((x,y,x+side,y+side))
        bx=400+(i%2)*250;by=40+(i//2)*210
        board.paste(tile,(bx,by))
        d.text((bx,by+184),("TL","TR","BL","BR")[i],fill=(187,200,203))
    path=OUT/(stem+"-native-corners.jpg")
    board.save(path,"JPEG",quality=90)
    return {"path":str(path.relative_to(ROOT)),"sha256":sha256(path.read_bytes())}
results=[]
total=0
stopped=False
for plate in QUEUE:
    original=by[plate]
    alt=next((x for x in original["alternatives"] if x.get("download_gate")=="SOURCE_PIXELS_IMPROVED_NEEDS_PHOTO_RIGHTS_AND_FIDELITY_REVIEW"),None)
    if not alt:continue
    entry={"plate_id":plate,"source_file":alt["title"],"physical_object_identity_basis":alt["object"],
           "expected_sha1":alt["current_source_info"]["sha1"],
           "photo_rights_final_certified":False,"native_quality_final_certified":False,
           "pristine_certified":False,"production_allowed":False}
    if stopped:
        entry["status"]="NOT_ATTEMPTED_AFTER_COMMONS_429"
        results.append(entry)
        continue
    try:
        if total+alt["current_source_info"]["size_bytes"]>MAX_TOTAL:
            raise ValueError("RESEARCH_GIT_20MB_TOTAL_BUDGET")
        info=checked_source(alt)
        request=urllib.request.Request(info["url"],headers={"User-Agent":UA})
        with urllib.request.urlopen(request,timeout=75) as f:
            raw=f.read(MAX_SINGLE+1)
        if len(raw)!=info["size"] or sha1(raw)!=info["sha1"]:
            raise ValueError("SOURCE_BYTES_SHA1_OR_SIZE_MISMATCH")
        with Image.open(io.BytesIO(raw)) as im:
            im.load()
            assert im.format=="JPEG" and [im.width,im.height]==[info["width"],info["height"]]
            if min(im.size)<1800:raise ValueError("NATIVE_SHORT_EDGE_TOO_SMALL")
            proof=visual_proof(im,plate)
            pixels=list(im.size)
            raw_meta={"has_embedded_icc":bool(im.info.get("icc_profile")),"exif_tags":len(im.getexif())}
        path=OUT/(plate+".jpg")
        path.write_bytes(raw);total+=len(raw)
        entry.update(status="ORIGINAL_SOURCE_EXACT_HASH_ARCHIVED_PENDING_NATIVE_PHOTO_REVIEW",
                     source_file_page=alt["source"]["file_page"],path=str(path.relative_to(ROOT)),
                     sha256=sha256(raw),sha1=sha1(raw),bytes=len(raw),
                     native_pixels=pixels,metadata=raw_meta,inspection_proof=proof)
        print("ARCHIVED",plate,len(raw),flush=True)
    except urllib.error.HTTPError as e:
        entry["status"]="HTTP_SOURCE_HOLD";entry["http_status"]=e.code
        entry["error"]=str(e)[:220]
        if e.code==429:stopped=True
        print("HOLD",plate,e.code,"STOP" if stopped else "",flush=True)
    except Exception as e:
        entry["status"]="SOURCE_OR_STORAGE_HOLD"
        entry["error"]=type(e).__name__+": "+str(e)[:230]
        print("HOLD",plate,str(e)[:130],flush=True)
    results.append(entry)
report={"schema":"AO_SACRED_ART_BREVIARIUM_W3B_BOUNDED_NATIVE_ACQUISITION_V1",
        "date":"2026-10-29","first_429_stops_all_further_fetches":True,
        "attempts_after_429":0,"original_sources_unchanged":True,
        "processed_cases":len(results),
        "originals_verified_and_archived":sum(bool(x.get("path")) for x in results),
        "not_attempted_after_429":sum(x["status"]=="NOT_ATTEMPTED_AFTER_COMMONS_429" for x in results),
        "http_429_received":sum(x.get("http_status")==429 for x in results),
        "research_git_original_bytes":total,"new_pristine_certifications":0,
        "production_released":0,"cost_eur":0,"cases":results}
(OUT/"source-original-results.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({k:report[k] for k in ("processed_cases","originals_verified_and_archived",
 "not_attempted_after_429","http_429_received","research_git_original_bytes","production_released")}))
