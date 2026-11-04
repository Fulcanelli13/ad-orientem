#!/usr/bin/env python3
"""Compare exact photographs of four previously approved Flemish artworks.

Research only. Read-only network access, fail-closed holds, no automatic crop,
no subjective winner selection, no rights declaration or app publishing.
"""
import argparse, hashlib, html, io, json, pathlib, time, urllib.parse, urllib.request, urllib.error
from PIL import Image, ImageOps, ImageStat

UA = "AdOrientemArtworkPreflight/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
MAX_SOURCE_BYTES = 36_000_000
MAX_RUN_BYTES = 140_000_000
Image.MAX_IMAGE_PIXELS = 135_000_000

def exact_commons_original(page_url):
    p = urllib.parse.urlsplit(page_url)
    path = urllib.parse.unquote(p.path)
    if p.scheme != "https" or p.hostname != "commons.wikimedia.org" or not path.startswith("/wiki/File:"):
        raise ValueError("source is not an exact Commons File page")
    filename = path.split("/wiki/File:", 1)[1].replace(" ", "_")
    if not filename or "/" in filename or "\\" in filename:
        raise ValueError("unsafe Commons filename")
    digest = hashlib.md5(filename.encode("utf-8")).hexdigest()
    safe_file = urllib.parse.quote(filename, safe="()_,.-")
    return f"https://upload.wikimedia.org/wikipedia/commons/{digest[0]}/{digest[:2]}/{safe_file}"

def network_get(url, cap, allowed_hosts):
    last_error = None
    for attempt in range(3):
        if attempt:
            time.sleep((3, 8)[attempt - 1])
        p = urllib.parse.urlsplit(url)
        if p.scheme != "https" or p.hostname not in allowed_hosts or p.username or p.password:
            raise ValueError("untrusted source host")
        request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/*,application/json"})
        try:
            with urllib.request.urlopen(request, timeout=60) as response:
                dest = urllib.parse.urlsplit(response.geturl())
                if dest.scheme != "https" or dest.hostname not in allowed_hosts:
                    raise ValueError("untrusted redirect")
                if int(response.headers.get("Content-Length") or 0) > cap:
                    raise ValueError("original exceeds maximum source size")
                payload = response.read(cap + 1)
                if len(payload) > cap:
                    raise ValueError("original exceeds byte cap")
                return payload
        except urllib.error.HTTPError as ex:
            last_error = "HTTP " + str(ex.code)
            if ex.code not in (429, 502, 503, 504) or attempt == 2:
                raise ValueError(last_error) from ex
    raise ValueError(last_error or "network retry exhausted")

def iiif_image_source(manifest_url):
    if manifest_url != "https://imagehub.mskgent.be/iiif/3/6361/manifest.json":
        raise ValueError("unexpected IIIF manifest; inventory S-9 only")
    raw = network_get(manifest_url, 2_000_000, {"imagehub.mskgent.be"})
    manifest = json.loads(raw)
    if not isinstance(manifest, dict) or not manifest.get("items"):
        raise ValueError("IIIF manifest has no canvases")
    candidates = []
    def walk(obj):
        if isinstance(obj, dict):
            services = obj.get("service")
            if isinstance(services, dict):
                services = [services]
            if isinstance(services, list):
                for service in services:
                    if isinstance(service, dict):
                        service_id = service.get("id") or service.get("@id")
                        if isinstance(service_id, str):
                            candidates.append(service_id)
            for value in obj.values():
                walk(value)
        elif isinstance(obj, list):
            for v in obj:
                walk(v)
    walk(manifest.get("items"))
    candidates = [x.rstrip("/") for x in candidates if x.startswith("https://imagehub.mskgent.be/")]
    if not candidates:
        raise ValueError("official IIIF service URL absent")
    # IIIF standard size syntax: no manual object crop, max 4400 px in either dimension
    return candidates[0] + "/full/!4400,4400/0/default.jpg"

def image_proof(original, dest, key):
    digest = hashlib.sha256(original).hexdigest()
    with Image.open(io.BytesIO(original)) as img:
        img.verify()
    with Image.open(io.BytesIO(original)) as img:
        fmt = img.format
        icc = bool(img.info.get("icc_profile"))
        canvas = ImageOps.exif_transpose(img).convert("RGB")
        w, h = canvas.size
        if w < 500 or h < 500 or w*h > 135_000_000:
            raise ValueError("source pixel dimensions outside allowed range")
        view = canvas.copy()
        view.thumbnail((1550,1550), Image.Resampling.LANCZOS)
        preview_name = key + "_whole.jpg"
        view.save(dest / preview_name, "JPEG", quality=87, optimize=True)
        side = min(500,w,h)
        edges = ((0,0,side,side),(w-side,0,w,side),
                 (0,h-side,side,h),(w-side,h-side,w,h))
        tile_names = []
        for i, box in enumerate(edges):
            tile = key + "_edge_" + str(i) + ".jpg"
            canvas.crop(box).save(dest/tile, "JPEG", quality=90)
            tile_names.append(tile)
        stdev = [round(v,2) for v in ImageStat.Stat(view).stddev]
    original_name = key + "_exact_original.bin"
    (dest / original_name).write_bytes(original)
    return {"sha256": digest, "bytes":len(original),"format":fmt,
            "pixels":[w,h],"icc_profile_present":icc,
            "compressed_bytes_per_pixel":round(len(original)/(w*h),4),
            "preview":preview_name,"edge_details":tile_names,
            "staged_original":original_name,"rgb_stdev":stdev,
            "crop_applied":False,"pixel_decoded":True,
            "publication":False,"rights_final":False,
            "best_image_certified":False}

def run(manifest, out, *, max_sources=6):
    out.mkdir(parents=True,exist_ok=True)
    report={"schema":"AO_FLANDERS_FOUR_EXACT_PHOTO_PIXEL_QA_V1",
            "publication":False,"rights_verified_by_download":False,
            "cropping":False,"canonical_work_approvals_unchanged":True,
            "sources":[]}
    remaining=MAX_RUN_BYTES
    sources = [(work,src) for work in manifest["works"] for src in work["sources"]][:max_sources]
    for work,src in sources:
        i=work["approvedRecordIndex"]
        key=str(i)+"_"+str(len([x for x in report["sources"] if x["approvedRecordIndex"]==i])+1)
        result={"approvedRecordIndex":i,"title":work["title"],"artist":work["artist"],
                "inventory":work["accession"],"museum":work["museum"],
                "label":src["label"],"source":src["url"],"source_kind":src["kind"],
                "status":"HELD","publication":False,
                "rights_statement":work["rightsEvidence"],
                "rights_scope":"INDIVIDUAL_REUSE_REVIEW_REQUIRED",
                "visual_identity_verified":False}
        try:
            if src["kind"]=="COMMONS_FILE":
                direct=exact_commons_original(src["url"])
                original=network_get(direct,min(remaining,MAX_SOURCE_BYTES),{"upload.wikimedia.org"})
            elif src["kind"]=="IIIF3_MANIFEST":
                direct=iiif_image_source(src["url"])
                original=network_get(direct,min(remaining,MAX_SOURCE_BYTES),{"imagehub.mskgent.be"})
            else:
                raise ValueError("unrecognized source kind")
            result["download_url"]=direct
            result.update(image_proof(original,out,key))
            result["status"]="PIXEL_PROOF_READY"
            remaining -= len(original)
        except Exception as e:
            result["hold_reason"]=str(e)[:240]
        report["sources"].append(result)
        (out/"report.json").write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
        time.sleep(1)
    cards=[]
    for r in report["sources"]:
        image = '<img src="'+html.escape(r["preview"],quote=True)+'">' if r.get("preview") else ""
        cards.append('<section><h2>'+html.escape(r["title"])+'</h2><p>'+html.escape(r["label"])+
                     ' — '+html.escape(r["status"])+'</p>'+image+
                     '<p>'+html.escape(str(r.get("pixels",[])))+
                     ' '+html.escape(r.get("hold_reason",""))+'</p></section>')
    page='<!doctype html><html><meta charset="utf-8"><title>Flemish masterpieces source QA</title><style>body{background:#101416;color:#eee;font:16px system-ui;padding:20px}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px}section{background:#222a2e;padding:18px;border-radius:14px}img{max-width:100%;max-height:540px;object-fit:contain}</style><h1>Four approved Flemish masterpieces — source comparisons</h1><p>Research only; no published files or final rights / crop approvals.</p><main>'+''.join(cards)+'</main></html>'
    (out/"review.html").write_text(page,encoding="utf-8")
    return report

if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--manifest",type=pathlib.Path,required=True)
    ap.add_argument("--output",type=pathlib.Path,required=True)
    args=ap.parse_args()
    data=json.loads(args.manifest.read_text(encoding="utf-8"))
    r=run(data,args.output)
    print("Downloaded:",sum(x["status"]=="PIXEL_PROOF_READY" for x in r["sources"]))
    print("Held:",sum(x["status"]=="HELD" for x in r["sources"]))
    for x in r["sources"]:
        print(x["approvedRecordIndex"], x["label"],x.get("pixels"),x["status"],x.get("hold_reason",""))
