#!/usr/bin/env python3
"""Batch-acquire 14 original oil-painting photographs for editorial review.
CC BY-SA-4.0 derivatives are properly attributed and research-only.
NEVER place these files into production under the strict PD/CC0 rule.
"""
from __future__ import annotations

import hashlib
import io
import json
import time
import urllib.parse
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

from PIL import Image, ImageOps

ROOT=Path("data/prayer/stations/san-polo-tiepolo-oils-1747")
API="https://commons.wikimedia.org/w/api.php"
USER_AGENT="AdOrientem-SacredArtResearch/1.0 (github.com/Fulcanelli13/ad-orientem; Wikimedia Commons image attribution archive)"

def fetch(url, n=4):
    error=None
    for trial in range(n):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT,"Accept":"*/*"})
            with urllib.request.urlopen(req,timeout=120) as res: return res.read()
        except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as e:
            error=e
            print("Retry",trial+1,str(e)[:150],flush=True)
            time.sleep(2*(trial+1))
    raise RuntimeError(f"Image unavailable: {url} ({error})")

def main():
    m=json.loads((ROOT/"manifest.v1.json").read_text())
    files=m["files"]
    assert len(files)==14 and m["identification"]["medium"].startswith("OIL ON CANVAS")
    assert all(x["editorialStatus"]=="UNAPPROVED_COMPLETE_OIL_SERIES_RESEARCH" for x in files)
    titles=["File:"+x["commonsTitle"] for x in files]
    args={"action":"query","prop":"imageinfo","iiprop":"url|sha1|size|extmetadata","iiurlwidth":"1920","format":"json","titles":"|".join(titles)}
    data=json.loads(fetch(API+"?"+urllib.parse.urlencode(args)))
    if "error" in data: raise RuntimeError(data["error"])
    lookup={}
    for item in data.get("query",{}).get("pages",{}).values():
        if not item.get("imageinfo"): raise RuntimeError("Missing Commons file: "+str(item.get("title")))
        lookup[item["title"][5:].replace("_"," ")]=item["imageinfo"][0]
    if len(lookup)!=14: raise RuntimeError("Expected 14 distinct oil painting photo sources")
    images=[]; seen=set(); failures=[]
    # Previously committed derivatives stay valid between batch retries.
    results_path=ROOT/"acquisition-results.v1.json"
    previous={}
    if results_path.exists():
        try:
            ledger=json.loads(results_path.read_text())
            previous={x["station"]:x for x in ledger.get("files",[])}
        except (ValueError,KeyError,TypeError):
            previous={}
    retained=[]
    for record in files:
        keep=previous.get(record["station"])
        dest=Path(record["targetPath"])
        if keep and dest.exists():
            content=dest.read_bytes()
            if (hashlib.sha256(content).hexdigest()==keep.get("derivativeSHA256")
                    and keep.get("productionRightsGate")=="NOT_PD_CC0"
                    and keep.get("artMedium")=="oil on canvas"):
                retained.append(keep)
                seen.add(keep.get("receivedMediaSHA256",keep["derivativeSHA256"]))
                print(f"Station {record['roman']}: retained verified archive",flush=True)
                continue
        try:
            key=record["commonsTitle"].replace("_"," ")
            info=lookup.get(key)
            if not info: raise RuntimeError("Exact Commons title mismatch: "+key)
            metadata=info.get("extmetadata",{})
            license=metadata.get("LicenseShortName",{}).get("value","")
            license_url=metadata.get("LicenseUrl",{}).get("value","")
            if "CC BY-SA" not in license.upper() and "CC-BY-SA" not in license.upper():
                raise RuntimeError(f"Unanticipated file licence {key}: {license!r}")
            if not license_url.startswith("https://creativecommons.org/licenses/by-sa/"):
                raise RuntimeError("Unexpected licence URL for file "+key+": "+license_url)
            # Prefer Commons' official pregenerated thumbnail URLs, which
            # require far less bandwidth than the 8-13 MB original photos.
            # Treat HTTP 429 as a genuine source limit: do not spin on it.
            # Proxy is only a source-backed cache fallback; not a new license.
            original_url=info["url"].split("?")[0]
            thumb_url=info.get("thumburl")
            candidates=[]
            if thumb_url:
                candidates.append(("COMMONS_OFFICIAL_1920_THUMBNAIL",thumb_url))
            candidates.append(("WIKIMEDIA_DIRECT_ORIGINAL",original_url))
            # Cache-backed proxy uses a correctly decoded source path.
            # The previous attempt sent percent signs through two encoders
            # and received HTTP 404 at the cache service.
            canonical=urllib.parse.unquote(original_url)
            proxy="https://wsrv.nl/?" + urllib.parse.urlencode({
                "url":canonical,"w":1920,"output":"webp","q":88,
            })
            candidates.append(("CACHED_WIKIMEDIA_1920",proxy))
            photo=None
            image_source=None
            errors=[]
            for method,url in candidates:
                try:
                    photo=fetch(url,n=1)
                    image_source=method
                    break
                except RuntimeError as exc:
                    errors.append({"method":method,"error":str(exc)[:160]})
            if photo is None:
                raise RuntimeError("All official/source-backed image paths failed: "+json.dumps(errors))
            digest=hashlib.sha256(photo).hexdigest()
            if digest in seen: raise RuntimeError("Duplicate oil photo bytes")
            seen.add(digest)
            with Image.open(io.BytesIO(photo)) as im:
                width,height=im.size
                native_width,native_height=info["width"],info["height"]
                if abs(native_width-record["originalDimensions"][0])>4 or abs(native_height-record["originalDimensions"][1])>4:
                    raise RuntimeError(f"Commons source metadata changed for {record['roman']}: {(native_width,native_height)}")
                if image_source=="WIKIMEDIA_DIRECT_ORIGINAL" and (width<3000 or height<3000):
                    raise RuntimeError("Low-resolution original oil photograph")
                if image_source!="WIKIMEDIA_DIRECT_ORIGINAL" and max(width,height)<1800:
                    raise RuntimeError("Insufficient cached museum photo derivative quality")
                canvas=ImageOps.exif_transpose(im).convert("RGB")
                canvas.thumbnail((2400,2400),Image.Resampling.LANCZOS)
                buf=io.BytesIO()
                canvas.save(buf,"WEBP",quality=87,method=5)
                pixels=buf.getvalue()
                if len(pixels)<70_000: raise RuntimeError("Suspect corrupted derivative "+key)
                images.append((Path(record["targetPath"]),pixels,{
                    "station":record["station"],"roman":record["roman"],"subject":record["subject"],
                    "file":record["targetPath"],"sourceTitle":record["commonsTitle"],
                    "sourcePage":record["commonsPage"],"sourceDownloadURL":info["url"],
                    "originalSHA256":digest if image_source=="WIKIMEDIA_DIRECT_ORIGINAL" else None,
                    "originalCommonsSHA1":info.get("sha1"),
                    "receivedMediaSHA256":digest,
                    "retrieval":image_source,
                    "sourceOriginalDimensionsFromCommons":[native_width,native_height],
                    "sourceBytes":len(photo),"sourceDimensions":[width,height],
                    "derivativeSHA256":hashlib.sha256(pixels).hexdigest(),
                    "derivativeBytes":len(pixels),"derivativeDimensions":list(canvas.size),
                    "artMedium":"oil on canvas","photographLicence":license,
                    "photographLicenceURL":license_url,
                    "photoAuthor":"Didier Descouens (Wikimedia Commons user Archaeodontosaurus)",
                    "changes":"Resized, JPEG converted to WebP",
                    "licenseCompliance":"CC BY-SA 4.0; researcher derivatives shared under same licence",
                    "productionRightsGate":"NOT_PD_CC0",
                    "artworkApproved":False,"runtimeEnabled":False,
                }))
            print(f"Station {record['roman']}: oil photograph {width}×{height}; {len(pixels)} bytes derivative",flush=True)
        except Exception as exc:
            failure={"station":record["station"],"roman":record["roman"],
                     "file":record["commonsTitle"],"error":str(exc)[:500]}
            failures.append(failure)
            print(f"Station {record['roman']}: BLOCKED: {failure['error']}",flush=True)
            continue
    if len(images)+len(retained)+len(failures)!=14:
        raise RuntimeError("Acquisition ledger mismatch; station silently omitted")
    for path,data,meta in images:
        path.parent.mkdir(parents=True,exist_ok=True)
        path.write_bytes(data)
    results={
        "schema":"AO_SAN_POLO_TIEPOLO_OIL_BATCH_PHOTOS_V1",
        "createdUTC":datetime.now(timezone.utc).isoformat(),
        "scope":"Complete oil-on-canvas series; NOT Cooper Hewitt sketches/etchings",
        "photographsAcquired":len(images)+len(retained),"derivativesArchivedInGit":True,
        "fullyAcquired":len(failures)==0,
        "failedCount":len(failures),
        "failedStations":failures,
        "artworkMedium":"oil on canvas", "artist":"Giovanni Domenico Tiepolo",
        "photographsLicense":"CC BY-SA 4.0 (not CC0)",
        "researchOnly":True,"artworksNewlyApproved":0,
        "productionImagesEnabled":0,
        "attribution":"Oil paintings: Giandomenico Tiepolo, 1747–49, Church of San Polo, Venice. Photographs: Didier Descouens, licensed CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/. Adapted by resizing and converting to WebP.",
        "derivativeTotalBytes":sum(len(x[1]) for x in images)+sum(x.get("derivativeBytes",0) for x in retained),
        "files":[*retained,*(x[2] for x in images)],
    }
    (ROOT/"acquisition-results.v1.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n")
    (ROOT/"ATTRIBUTION.md").write_text(
        "# San Polo Tiepolo Via Crucis — 14 oil paintings\n\n"
        "Oil paintings: Giovanni Domenico Tiepolo, 1747–1749; Church of San Polo, Venice, Italy.\n\n"
        "Photographs: Didier Descouens (Wikimedia Commons: Archaeodontosaurus), "
        "CC BY-SA 4.0, https://creativecommons.org/licenses/by-sa/4.0/.\n"
        "Changed: images resized and converted from JPG to WebP. "
        "Redistributed photographic derivatives retain the CC BY-SA 4.0 licence.\n\n"
        "All 14 images are RESEARCH ONLY. They are not public-domain/CC0 photographs "
        "and must not be routed to live Ad Orientem Prayer artwork without separate clearance and artistic acceptance.\n"
    )
    print(json.dumps({"oilPaintingPhotos":results["photographsAcquired"],
                      "blockedStations":results["failedCount"],
                      "fullyAcquired":results["fullyAcquired"],
                      "archivedWebpBytes":results["derivativeTotalBytes"],
                      "newLiveImages":0},indent=2))

if __name__=="__main__":
    main()
