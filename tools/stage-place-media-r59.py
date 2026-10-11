#!/usr/bin/env python3
"""R59: rights-checked but NOT automatically approved Commons photo staging."""
import argparse, hashlib, io, json, re, runpy
from pathlib import Path
from urllib.parse import urlencode, urlparse
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"data/geography/research/place-media-candidates-r59.v1.json"
REVIEW=ROOT/"data/geography/research/place-media-publication-review-r58.v1.json"
PUBLISHED=ROOT/"data/geography/approved-place-media.v1.json"
TARGET=ROOT/"assets/staged/place-media-r59"
REPORT=ROOT/"data/geography/research/place-media-stage-report-r59.v1.json"
upstream=runpy.run_path(str(ROOT/"tools/stage-place-media.py"),run_name="r59_library")
request_bytes=upstream["request_bytes"]
cleaned=upstream["cleaned"]
TARGET.mkdir(parents=True,exist_ok=True)

def validate():
    manifest=json.loads(MANIFEST.read_text(encoding="utf-8"))
    review=json.loads(REVIEW.read_text(encoding="utf-8"))
    pub=json.loads(PUBLISHED.read_text(encoding="utf-8"))
    entries=manifest["candidates"]
    excluded={x["place_id"] for x in review["needs_replacement"]+review["held"]}
    published={x["place_id"] for x in pub["items"]}
    assert len(entries)==10 and len(excluded)==10
    assert {x["place_id"] for x in entries}==excluded
    assert not excluded.intersection(published)
    assert len([x for x in entries if x["expected_license"]=="CC-BY-SA-4.0"])==8
    assert {x["expected_license"] for x in entries}=={"CC-BY-SA-4.0","CC-BY-SA-3.0","CC-BY-SA-2.0"}
    for entry in entries:
        assert entry["source_page_url"].startswith("https://commons.wikimedia.org/wiki/File:")
        assert entry["commons_title"].startswith("File:")
        assert entry["alt_en"].strip() and entry["alt_fr"].strip()
        assert entry["publication_approved"] is False and entry["subject_crop_reviewed"] is False
        version=entry["expected_license"].rsplit("-",1)[-1]
        assert entry["license_url"]=="https://creativecommons.org/licenses/by-sa/"+version+"/"
    return entries

def metadata(title,expected):
    params={"action":"query","format":"json","formatversion":"2",
            "prop":"imageinfo","titles":title,
            "iiprop":"url|extmetadata|sha1|size|mime","iiurlwidth":"1280"}
    data=json.loads(request_bytes("https://commons.wikimedia.org/w/api.php?"+urlencode(params),max_bytes=1800000))
    pages=data.get("query",{}).get("pages",[])
    if len(pages)!=1 or pages[0].get("missing"):raise ValueError("Commons file not found")
    inf=(pages[0].get("imageinfo") or [None])[0]
    if not inf or not inf.get("mime","").startswith("image/"):
        raise ValueError("File is not an image")
    ex=inf.get("extmetadata",{})
    f=lambda key:cleaned(ex.get(key,{}).get("value",""))
    got=re.sub(r"[^A-Z0-9]","",f("LicenseShortName").upper())
    expected_compact=re.sub(r"[^A-Z0-9]","",expected.upper())
    if got!=expected_compact:raise ValueError("Licence mismatch "+str(f("LicenseShortName"))+" expected "+expected)
    url=f("LicenseUrl")
    p=urlparse(url)
    expected_tail="/licenses/by-sa/"+expected.rsplit("-",1)[-1]+"/"
    if p.hostname!="creativecommons.org" or not p.path.startswith(expected_tail):
        raise ValueError("Unmatched original license URL "+url)
    img=inf.get("thumburl") or inf.get("url")
    if urlparse(img).hostname not in {"upload.wikimedia.org","thumb.wikimedia.org"}:
        raise ValueError("Non-Wikimedia image delivery host")
    return {"source_sha1":inf.get("sha1"),"original_author_live":f("Artist"),
            "source_description":f("ImageDescription")[:1000],
            "license":expected,"license_url":"https://creativecommons.org"+expected_tail,
            "source_image_url":img,"source_mime":inf.get("mime")}

def stage(entries):
    records=[]
    for row in entries:
        record={"place_id":row["place_id"],"commons_title":row["commons_title"],
                "source_page_url":row["source_page_url"],
                "status":"HOLD_NOT_PUBLISHED"}
        try:
            info=metadata(row["commons_title"],row["expected_license"])
            raw=request_bytes(info["source_image_url"])
            with Image.open(io.BytesIO(raw)) as im0:
                if im0.format not in {"JPEG","PNG","WEBP"}:raise ValueError("Unsupported image")
                im=ImageOps.exif_transpose(im0).convert("RGB")
                if min(im.size)<600:raise ValueError("Not enough resolution")
                im.thumbnail((1280,1280),Image.Resampling.LANCZOS)
                path=TARGET/(row["place_id"].replace("place:","").replace(":","-")+".webp")
                im.save(path,"WEBP",quality=82,method=6)
                record.update(info)
                record.update({"status":"STAGED_NOT_APPROVED",
                    "asset_path":str(path.relative_to(ROOT)),"alt_en":row["alt_en"],"alt_fr":row["alt_fr"],
                    "derivative_sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
                    "output_width":im.width,"output_height":im.height,
                    "output_bytes":path.stat().st_size,
                    "changes_en":"Resized to maximum 1280px; converted to WebP without crop.",
                    "changes_fr":"Redimensionnée à 1 280 px maximum et convertie en WebP sans recadrage."})
        except Exception as exc:record["error"]=str(exc)
        print(record["status"],record["place_id"],record.get("error",""),flush=True)
        records.append(record)
    report={"schema":"AO_EXPLORE_PLACE_MEDIA_STAGE_REPORT_R59_V1",
            "summary":{"staged":sum(r["status"]=="STAGED_NOT_APPROVED" for r in records),
                        "held":sum(r["status"]!="STAGED_NOT_APPROVED" for r in records),
                        "published":0},
            "media":records,
            "notice":"Review exact image and mobile crop before any approved publication. Older CC versions must be linked precisely."}
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    if not report["summary"]["staged"]:raise SystemExit("No images retrieved")

if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    options=parser.parse_args()
    entries=validate()
    print("PASS R59 10-place rights/identity manifest")
    if not options.validate_only:stage(entries)
