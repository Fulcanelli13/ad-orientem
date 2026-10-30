#!/usr/bin/env python3
"""Recover remote-only images in the 2026-10-30 Sacred Art photo QA galleries.

Only source-record-backed photos; thumbnails are NOT release masters.
Preserve 284 existing embedded previews, locked source IDs and all user decisions.
Zero paid services; intended for GitHub Actions in the public repository.
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
from hashlib import sha256
from io import BytesIO
from pathlib import Path
from PIL import Image, ImageOps
import base64, csv, json, re, time, urllib.parse as U, urllib.request as Q

ROOT=Path("data/calendar/sacred-art-master-v2")
AGENT="AdOrientemSacredArtQA/2026-10-30 (+https://github.com/Fulcanelli13/ad-orientem)"
HEADERS={"User-Agent":AGENT,"Accept":"image/jpeg,image/png,image/webp,image/*;q=0.9,*/*;q=0.2"}
REPORT=ROOT/"fast-grid-offline-photo-recovery-20261030.v1.json"
STATS=ROOT/"fast-grid-click-review-ui-proof-20261030.v1.json"
MAX_BYTES=16_000_000

def get(url):
    req=Q.Request(url,headers=HEADERS)
    with Q.urlopen(req,timeout=18) as res:
        body=res.read(MAX_BYTES+1)
        if len(body)>MAX_BYTES:raise ValueError("PHOTO_EXCEEDS_16MB")
        if not body:raise ValueError("EMPTY_IMAGE")
        return body,res.geturl(),res.headers.get("Content-Type","")

def compact(data):
    with Image.open(BytesIO(data)) as im:
        im=ImageOps.exif_transpose(im)
        w,h=im.size
        if min(w,h)<240 or max(w,h)/min(w,h)>5:
            raise ValueError("INVALID_PHOTO_DIMENSIONS")
        im.thumbnail((680,680),Image.Resampling.LANCZOS)
        if im.mode!="RGB":im=im.convert("RGB")
        target=BytesIO()
        im.save(target,format="JPEG",quality=79,optimize=True,progressive=True)
        thumb=target.getvalue()
        if len(thumb)<3500:raise ValueError("SUSPICIOUSLY_SMALL_THUMBNAIL")
        return "data:image/jpeg;base64,"+base64.b64encode(thumb).decode("ascii"),{
            "downloadedDimensions":[w,h],"reviewDimensions":list(im.size),
            "downloadedSha256":sha256(data).hexdigest(),
            "reviewThumbnailSha256":sha256(thumb).hexdigest(),"thumbnailBytes":len(thumb)}

def commons_name(url):
    x=U.urlsplit(url)
    if x.hostname not in ("commons.wikimedia.org","www.commons.wikimedia.org"):return None
    path=U.unquote(x.path)
    if "/wiki/File:" not in path:return None
    return path.split("/wiki/File:",1)[1].replace("_"," ")

def candidates(row):
    urls=[]
    source=row.get("source_url") or ""
    for key in ("official_image_preview","official_image_original"):
        url=row.get(key) or ""
        if url.startswith("https://"):urls.append((url,key))
    name=commons_name(source)
    if name:
        fn=name.replace(" ","_")
        q=U.quote(fn,safe="(),-!._~")
        import hashlib
        h=hashlib.md5(fn.encode("utf-8")).hexdigest()
        urls.extend([
            ("https://commons.wikimedia.org/wiki/Special:Redirect/file/"+q+"?width=640","commons_exact_file_redirect"),
            ("https://upload.wikimedia.org/wikipedia/commons/thumb/"+h[0]+"/"+h[:2]+"/"+q+"/640px-"+q,"commons_exact_file_640"),
            ("https://upload.wikimedia.org/wikipedia/commons/thumb/"+h[0]+"/"+h[:2]+"/"+q+"/330px-"+q,"commons_exact_file_330"),
            ("https://upload.wikimedia.org/wikipedia/commons/"+h[0]+"/"+h[:2]+"/"+q,"commons_exact_original"),
        ])
    return [(u,s) for u,s in dict(urls).items()] if False else list(dict.fromkeys(urls))

def recover(job):
    card,row,batch=job
    errors=[]
    for url,origin in candidates(row):
        for attempt in range(2):
            try:
                downloaded,final_url,mime=get(url)
                uri,photo=compact(downloaded)
                if len(uri)>450_000:raise ValueError("EMBEDDED_THUMBNAIL_TOO_LARGE")
                return card["id"],uri,{
                    "batch":batch,"sourceRecordId":card["id"],
                    "sourceArtworkUrl":row.get("source_url",""),
                    "sourcePhotoFingerprint":row.get("selected_photo_file_fingerprint",""),
                    "thumbnailFrom":url,"resolvedThumbnailUrl":final_url,
                    "selectedCandidateField":origin,"recovered":True,
                    "sourceFileRightsCertified":False,
                    "nativeOriginalBytesCertified":False,"humanPristineApproved":False,
                    **photo}
            except Exception as e:
                errors.append(str(e)[:100])
                if attempt==0:time.sleep(0.5)
    return card["id"],None,{
        "batch":batch,"sourceRecordId":card["id"],
        "sourceArtworkUrl":row.get("source_url",""),
        "recovered":False,"urlsAttempted":len(candidates(row)),
        "errors":errors[-4:],"heldInPhotoQA":True}

manifest={"schema":"AO_SACRED_ART_FAST_GRID_EMBEDDED_RECOVERY_V1",
          "registryVersion":"20261030","reviewTotal":444,"existingPhotoPreviewsPreserved":True,
          "userApprovalsChanged":0,"photoRightsClearances":0,"queue1Promotions":0,
          "productionMutations":0,"feeEur":0,"batches":{},"newlyRecovered":[],"stillMissing":[]}
oldproof=json.loads(STATS.read_text(encoding="utf-8"))
if oldproof["batches"]["01"]["previewsEmbedded"]!=73:
    raise RuntimeError("First73 snapshot changed")
for batch,n in (("02",200),("03",171)):
    html=Path("docs/SACRED_ART_FAST_GRID_REVIEW_BATCH"+batch+"_20261030.html")
    src=html.read_text(encoding="utf-8")
    m=re.search(r"const data=(\[[\s\S]*?\]);\s*const KEY=",src)
    if not m:raise RuntimeError("Missing review cards: "+batch)
    cards=json.loads(m.group(1))
    if len(cards)!=n or len({x["id"] for x in cards})!=n:
        raise RuntimeError("Different batch cardinality or duplicate IDs")
    with (ROOT/("first-look-photo-review-batch-"+batch+".csv")).open(encoding="utf-8-sig",newline="") as f:
        rows={x["physical_work_group"]:x for x in csv.DictReader(f)}
    if set(rows)!={c["id"] for c in cards}:raise RuntimeError("CSV versus HTML identity drift")
    before=sum(bool(c.get("preview","").startswith("data:image/")) for c in cards)
    need=[(c,rows[c["id"]],batch) for c in cards if not (c.get("preview") or "").startswith("data:image/")]
    print("PHOTO_RECOVERY_BATCH",batch,"existing",before,"missing",len(need),flush=True)
    with ThreadPoolExecutor(max_workers=5) as pool:
        results=list(pool.map(recover,need))
    mapped={identity:(uri,meta) for identity,uri,meta in results}
    if len(mapped)!=len(need):raise RuntimeError("Result identity collision")
    for c in cards:
        if c["id"] not in mapped:continue
        preview,detail=mapped[c["id"]]
        if preview:
            c["preview"]=preview
            c["available"]=True
            c["remotePreview"]=""
            c["error"]=""
            manifest["newlyRecovered"].append(detail)
        else:
            c["available"]=False
            manifest["stillMissing"].append(detail)
    after=sum(bool(c.get("preview","").startswith("data:image/")) for c in cards)
    if after<before or after-before!=len([r for r in results if r[1]]):
        raise RuntimeError("Preview preservation/count invariant failed")
    payload=json.dumps(cards,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c").replace(">","\\u003e")
    source=src[:m.start(1)]+payload+src[m.end(1):]
    html.write_text(source,encoding="utf-8")
    manifest["batches"][batch]={"total":n,"previousEmbedded":before,"recovered":after-before,
                                "embeddedNow":after,"stillRemoteOnly":n-after,
                                "reviewHtml":str(html),"sha256":sha256(source.encode()).hexdigest()}
    print("PHOTO_RECOVERY_RESULT",batch,"new",after-before,"total",after,"missing",n-after,flush=True)
# Update old UI proof with actual new embedded counts, but preserve the original proof.
proof=json.loads(STATS.read_text(encoding="utf-8"))
proof["schema"]="AO_SACRED_ART_FAST_GRID_USER_CLICK_AND_RECOVERY_V2"
proof["recoveryLedger"]=str(REPORT)
for batch in ("02","03"):
    old=proof["batches"][batch]
    new=manifest["batches"][batch]
    old["previewsEmbedded"]=new["embeddedNow"]
    old["browserRemoteFallbacks"]=new["stillRemoteOnly"]
    old["unloadedNotApproved"]=new["stillRemoteOnly"]
    old["newlyRecoveredOffline"]=new["recovered"]
proof["photoApprovals"]=0
proof["productionMutations"]=0
proof["feeEur"]=0
STATS.write_text(json.dumps(proof,indent=2)+"\n",encoding="utf-8")
manifest["embeddedTotal"]=73+sum(manifest["batches"][b]["embeddedNow"] for b in ("02","03"))
manifest["missingTotal"]=444-manifest["embeddedTotal"]
manifest["newlyRecoveredCount"]=len(manifest["newlyRecovered"])
if manifest["embeddedTotal"]+manifest["missingTotal"]!=444:raise RuntimeError("Gallery coverage changed")
REPORT.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
print("PHOTO_RECOVERY_SUMMARY",json.dumps({k:manifest[k] for k in ("embeddedTotal","missingTotal","newlyRecoveredCount","queue1Promotions")}),flush=True)
