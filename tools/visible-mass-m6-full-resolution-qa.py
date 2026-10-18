#!/usr/bin/env python3
"""M6: inspect originals at source resolution; package honest, non-editorial visual QA evidence."""
from __future__ import annotations
import hashlib
import html
import io
import json
import os
from pathlib import Path
import sys
import time
from urllib.parse import unquote, quote, urlsplit
import requests
import numpy as np
from PIL import Image, ImageOps, ImageDraw, ImageFont, UnidentifiedImageError

ROOT = Path(__file__).resolve().parent.parent
PREVIEWS = ROOT / "previews/visible-mass-3d"
OUT = ROOT / "dist/visible-mass/m6-original-photo-qa"
ORIGINALS = OUT / "originals"
CONTACTS = OUT / "contacts"
IDS = ["SV01", "SV02", "SV03", "LN04", "LN05"]
BATCHES = [
    "M6_COMPARATIVE_P0_BATCH15_UNAPPROVED_20261018.v1.json",
    "M6_COMPARATIVE_P0_BATCH16_UNAPPROVED_20261019.v1.json",
    "M6_COMPARATIVE_P0_BATCH17_UNAPPROVED_20261019.v1.json",
]
HEADERS = {"User-Agent": "AdOrientem-M6-SourceReview/0.1 (source file attribution; not publication)", "Accept": "application/json,image/*"}
MAX_BYTES = 40 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 120_000_000

def candidate_title(record):
    path = urlsplit(record["source_url"]).path
    if "/File:" not in path:
        raise ValueError("Not Wikimedia Commons File URL")
    return unquote(path.rsplit("/File:", 1)[-1]).replace("_", " ")

def commons_info(record, session):
    title = candidate_title(record)
    params = {"action": "query", "format": "json", "formatversion": 2, "titles": "File:" + title,
              "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata"}
    try:
        response = session.get("https://commons.wikimedia.org/w/api.php", params=params, timeout=30)
        response.raise_for_status()
        pages = response.json()["query"]["pages"]
        info = pages[0].get("imageinfo", [None])[0]
        if info and info.get("url"):
            return info["url"], {"width": info.get("width"), "height": info.get("height"),
                                 "mime": info.get("mime"), "canonical_title": pages[0].get("title"),
                                 "api_license_short": info.get("extmetadata", {}).get("LicenseShortName", {}).get("value")}
        return None, {"error": "Commons returned no imageinfo", "title": title}
    except (requests.RequestException, ValueError, KeyError, IndexError) as error:
        return None, {"api_error": str(error)[:300], "title": title}

def backup_url(record):
    """A computed original URL is a fallback *to be verified by actual download*, never claimed in advance."""
    title = candidate_title(record).replace(" ", "_")
    title = title[:1].upper() + title[1:]
    h = hashlib.md5(title.encode("utf-8")).hexdigest()
    return "https://upload.wikimedia.org/wikipedia/commons/" + h[0] + "/" + h[:2] + "/" + quote(title, safe="(),_-.'")

def download(session, url):
    with session.get(url, timeout=(18, 90), stream=True) as response:
        response.raise_for_status()
        mime = response.headers.get("Content-Type", "").lower()
        if not mime.startswith("image/"):
            raise ValueError("Non-image HTTP response: " + mime)
        data = bytearray()
        for part in response.iter_content(chunk_size=65536):
            data.extend(part)
            if len(data) > MAX_BYTES:
                raise ValueError("Original exceeds 40 MiB; review via source URL")
        return bytes(data)

def tone_metrics(im):
    """Heuristic only; cannot determine sacred-art taste, material correctness, context, or subject focus."""
    rgb = ImageOps.exif_transpose(im).convert("RGB")
    rgb.thumbnail((1300, 1300), Image.Resampling.LANCZOS)
    a = np.asarray(rgb).astype(np.float32)
    lum = 0.2126*a[:,:,0]+0.7152*a[:,:,1]+0.0722*a[:,:,2]
    # Laplacian = local high-frequency texture; not a calibrated measure of focus across differing objects.
    lap = 4*lum - np.roll(lum, 1, axis=0) - np.roll(lum, -1, axis=0) - np.roll(lum, 1, axis=1) - np.roll(lum, -1, axis=1)
    warnings = []
    clipped = float(np.mean(np.all(a>=249, axis=2)))
    shadows = float(np.mean(lum<=8))
    if clipped > .22: warnings.append("High white-background/near-white area; inspect highlights and silhouette")
    if shadows > .22: warnings.append("Large near-black area; inspect lost dark detail")
    if np.std(lum) < 26: warnings.append("Low global luminance contrast; check object visibility")
    return {
        "mean_luminance_0_255": round(float(lum.mean()), 1),
        "contrast_std_0_255": round(float(lum.std()), 1),
        "near_white_rgb_fraction": round(clipped, 4),
        "near_black_luma_fraction": round(shadows, 4),
        "laplacian_texture_variance_relative": round(float(lap[1:-1,1:-1].var()), 2),
        "interpretation": "automated warning indicators only; not optical-acuity proof or aesthetic score",
        "warnings": warnings,
    }

def shrink_contained(im, size):
    result = ImageOps.exif_transpose(im).convert("RGB").copy()
    result.thumbnail(size, Image.Resampling.LANCZOS)
    return result

def make_sheet(obj_id, records, file_by_id):
    cell_w, cell_h = 490, 620
    sheet = Image.new("RGB", (4*cell_w, cell_h), (11, 15, 22))
    draw = ImageDraw.Draw(sheet)
    for i, record in enumerate(records):
        x = i*cell_w
        draw.rounded_rectangle((x+6, 6, x+cell_w-6, cell_h-8), radius=14, outline=(75, 83, 96), width=2)
        original=file_by_id.get(record["asset_id"])
        if original:
            try:
                with Image.open(original) as im:
                    im=shrink_contained(im, (cell_w-30, cell_h-132))
                    sheet.paste(im, (x+(cell_w-im.width)//2, 19+(cell_h-135-im.height)//2))
            except (OSError, ValueError, UnidentifiedImageError):
                original=None
        if not original:
            draw.text((x+30, 260), "SOURCE IMAGE UNAVAILABLE", fill=(228, 176, 136))
        draw.text((x+17,cell_h-118),obj_id+" | "+str(i+1)+" / 4",fill=(230,221,201))
        tag=record["asset_id"]
        while tag:
            draw.text((x+17,cell_h-98),tag[:49],fill=(195,202,214))
            tag=tag[49:]
            break
        draw.text((x+17,cell_h-70),record.get("creator","")[:50],fill=(150,161,177))
        draw.text((x+17,cell_h-49),record.get("licence","")[:60],fill=(150,161,177))
    filename=CONTACTS/(obj_id+"_full_source_visual_contact_sheet.jpg")
    sheet.save(filename,quality=91,subsampling=0)
    return filename

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    ORIGINALS.mkdir(parents=True,exist_ok=True)
    CONTACTS.mkdir(parents=True,exist_ok=True)
    batches=[json.loads((PREVIEWS/f).read_text()) for f in BATCHES]
    master=json.loads((PREVIEWS/"M6_PHOTOGRAPHIC_ATLAS_COVERAGE_20261018.v1.json").read_text())
    byid={v["asset_id"]:v for v in master["images"]}
    for batch in batches:
        for photo in batch["records"]:
            if photo["asset_id"] in byid: raise AssertionError("Asset ID duplicated: "+photo["asset_id"])
            byid[photo["asset_id"]]=photo
    picks={}
    for oid in IDS:
        refs=next(o for o in master["objects"] if o["object_id"]==oid)["candidate_assets"]
        candidates=[byid[r["asset_id"]] for r in refs]
        for batch in batches:
            candidates += [r for r in batch["records"] if oid in r["object_ids"]]
        choices=[r for r in candidates if r.get("role") in ["object_detail","alternative_detail","object_in_liturgical_use"]
                 and r.get("width",0)>=1200 and r.get("height",0)>=1200
                 and r["asset_id"] not in {v["asset_id"] for batch in batches for v in batch.get("screening_overrides",[])}]
        if len(choices)!=4:
            raise AssertionError(f"{oid}: expected exactly four metadata-qualified sources; saw {len(choices)}")
        picks[oid]=choices
    unique={r["asset_id"]:r for arr in picks.values() for r in arr}
    if len(unique)!=20: raise AssertionError("Expected twenty distinct photo assets")
    session=requests.Session()
    session.headers.update(HEADERS)
    metrics=[]
    file_by_id={}
    stopped_for_rate_limit=False
    for idx,(asset_id,record) in enumerate(unique.items(),1):
        if stopped_for_rate_limit:
            result={"asset_id":asset_id,"object_ids":record.get("object_ids"),"source_url":record["source_url"],
                    "status":"NOT_ATTEMPTED_AFTER_SOURCE_RATE_LIMIT",
                    "publication_approved":False,"visual_editorial_approval":False,
                    "reason":"Earlier Wikimedia 429; no more Commons requests issued during this job"}
            metrics.append(result)
            print("PHOTO_QA "+json.dumps({"i":idx,"id":asset_id,"status":result["status"]}),flush=True)
            continue
        info_url, commons=commons_info(record,session)
        urls=list(dict.fromkeys([u for u in [info_url,backup_url(record)] if u]))
        result={"asset_id":asset_id,"object_ids":record.get("object_ids"),"source_url":record["source_url"],
                "creator_recorded":record.get("creator"),"license_recorded":record.get("licence"),"license_url":record.get("license_url"),
                "rights_source_verified_externally":bool(info_url),"commons":commons,"status":"UNAVAILABLE_RETRY","publication_approved":False,
                "visual_editorial_approval":False}
        problems=[]
        for url in urls:
            try:
                content=download(session,url)
                with Image.open(io.BytesIO(content)) as im:
                    im.load()
                    actual=ImageOps.exif_transpose(im)
                    result["original_pixel_size"]=[actual.width,actual.height]
                    result["file_size_bytes"]=len(content)
                    result["image_quality_heuristics"]=tone_metrics(im)
                ext=".jpg" if actual.format in ("JPEG",None) else "."+str(actual.format).lower()
                if actual.format=="PNG": ext=".png"
                out=ORIGINALS/(asset_id+ext)
                out.write_bytes(content)
                file_by_id[asset_id]=out
                result.update(status="ORIGINAL_PIXELS_ACQUIRED",original_path=str(out.relative_to(OUT)),http_url_fetched=url)
                expected=[record.get("width"),record.get("height")]
                if all(expected) and expected != result["original_pixel_size"]:
                    result["dimensions_discrepancy"]={"recorded":expected,"downloaded":result["original_pixel_size"]}
                break
            except (requests.RequestException, ValueError, OSError, UnidentifiedImageError, Image.DecompressionBombError) as e:
                problems.append(str(e)[:180])
                if "429" in str(e) or "Too many requests" in str(e):
                    stopped_for_rate_limit=True
                    result["status"]="WIKIMEDIA_SOURCE_RATE_LIMIT_NO_IMMEDIATE_RETRY"
                    break
        if problems: result["fetch_attempt_errors"]=problems
        metrics.append(result)
        print("PHOTO_QA "+json.dumps({"i":idx,"id":asset_id,"status":result["status"],"actual":result.get("original_pixel_size"),
                                      "heuristic":result.get("image_quality_heuristics"),"errors":problems},ensure_ascii=False),flush=True)
        time.sleep(2.0)  # Conservative source request pacing, never loop into repeated HTTP 429
    sheets=[make_sheet(oid,picks[oid],file_by_id) for oid in IDS]
    # No automated score: both editorial suitability and sharpness at 100% remain human decisions.
    results={"schema":"AO_VISIBLE_MASS_M6_ORIGINAL_IMAGE_QUALITY_EVIDENCE_V1","original_sources":20,
             "downloaded":len(file_by_id),"failed":20-len(file_by_id),
             "publication_approved":False,"automated_metrics_are_not_quality_ratings":True,
             "rights_caveat":"Commons licence assertion is recorded for each photo, not a substituted IP audit.",
             "manual_review_required":["actual focus at 100%", "glass reflections and glare", "clean subject isolation",
                                        "authentic correct physical object","typical 1962 Roman rite form",
                                        "historical vs instructional use","original-specimen duplication","aesthetic suitability"],
             "images":metrics,"groups":{oid:[r["asset_id"] for r in picks[oid]] for oid in IDS}}
    (OUT/"source_pixel_evidence.json").write_text(json.dumps(results,indent=2,ensure_ascii=False)+"\n")
    (OUT/"manifest.html").write_text(build_html(picks,metrics,sheets,file_by_id),encoding="utf-8")
    print("M6_SOURCE_QA_SUMMARY "+json.dumps({k:results[k] for k in ["original_sources","downloaded","failed","publication_approved"]}))
    if len(file_by_id)<20:
        print("INCOMPLETE_SOURCE_ACQUISITION: preserve samples; if rate-limited, STOP and wait for source availability, never bulk retry",file=sys.stderr)

def build_html(picks, metrics, sheets, downloaded):
    lookup={r["asset_id"]:r for r in metrics}
    sections=[]
    for oid in IDS:
        cards=[]
        for r in picks[oid]:
            m=lookup[r["asset_id"]]
            source=html.escape(r["source_url"],quote=True)
            original=html.escape(m.get("original_path",""),quote=True)
            warnings=m.get("image_quality_heuristics",{}).get("warnings",[])
            if original:
                image='<a href="'+original+'" title="Open original at full resolution"><img src="'+original+'" loading="lazy"></a>'
            else:
                image='<div class="missing">Original fetch failed; use Commons source link.</div>'
            cards.append('<article>'+image+'<div class="txt"><strong>'+html.escape(r["asset_id"])+'</strong><p>'+html.escape(r.get("creator",""))+' · '+html.escape(r.get("licence",""))+'</p>'+
                         '<p>Original pixels: '+html.escape(str(m.get("original_pixel_size","Unavailable")))+'</p>'+
                         '<p>Automated flags: '+html.escape("; ".join(warnings) if warnings else "none (not a quality verdict)")+'</p>'+
                         '<a href="'+source+'">Original Commons page and licence</a></div></article>')
        sections.append('<section id="'+oid+'"><h2>'+oid+' — 4 unapproved alternatives</h2>'+
                        '<p>Four different-source candidate objects; do not equate four technically eligible images with four suitable images.</p>'+
                        '<img class="contact" src="contacts/'+oid+'_full_source_visual_contact_sheet.jpg">'+
                        '<div class="grid">'+"".join(cards)+'</div></section>')
    return '''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Ad Orientem · M6 Original Photo Quality Evidence</title><style>body{margin:0;background:#080c12;color:#ddd7c8;font:16px/1.5 system-ui,sans-serif}
main{max-width:1320px;margin:auto;padding:22px}h1,h2{font-family:Georgia,serif;color:#f3e9d6}a{color:#d4b88b}
.notice{border:1px solid #504536;border-radius:10px;padding:16px;background:#141b24}
nav{display:flex;gap:16px;flex-wrap:wrap}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:12px}
article{border:1px solid #2d3541;border-radius:12px;overflow:hidden;background:#111923}
article img{width:100%;height:300px;object-fit:contain;background:#0b1016}.txt{padding:13px;font-size:13px}
.contact{width:100%;height:auto;max-height:440px;object-fit:contain;background:#0b1016}
section{margin:46px 0}p{color:#aeb2b9}.missing{padding:100px 16px;text-align:center;color:#df9b77}
</style></head><body><main><h1>Original-photo visual QA · M6</h1>
<div class="notice"><b>Source evidence, not curated approval.</b> This review displays the acquired original pixels, grouped by the 1962 Roman-rite object.
Click a photograph for 100%-pixel scrutiny. Highlight/shadow and texture values in the accompanying JSON are diagnostic flags, not aesthetic scores.
Some historical specimens are valid photographed objects but may be unsuitable as typical illustrations. Use the separate comparative rating gallery for decisions.</div>
<p>Standalone offline file with local originals when acquired. Each photograph links to its original rights source.</p>
<nav>'''+"".join('<a href="#'+id+'">'+id+'</a> ' for id in IDS)+'''</nav>'''+"".join(sections)+'''</main></body></html>'''

if __name__ == "__main__":
    main()
