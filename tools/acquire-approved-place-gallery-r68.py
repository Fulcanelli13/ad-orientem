#!/usr/bin/env python3
"""Acquire two reviewed Pontmain Commons photographs into exact local assets.

No scraping, no remote image embeds, no crops. Run only for the R68 editorial
manifest after external source identity and licence review. Fails closed.
"""
import hashlib
import html
import io
import json
import re
import runpy
from pathlib import Path
from urllib.parse import urlencode, urlsplit

from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
SRC=ROOT/"data/geography/research/explore-r68-reviewed-photo-sources.v1.json"
OUT=ROOT/"assets/approved/place-gallery"
REGISTRY=ROOT/"data/geography/approved-place-gallery.v1.json"
REQUEST=runpy.run_path(str(ROOT/"tools/stage-place-media.py"),run_name="r68_helpers")["request_bytes"]
LICENSE="https://creativecommons.org/licenses/by-sa/4.0/"
Image.MAX_IMAGE_PIXELS=24_000_000

def cleaned(value):
    return html.unescape(re.sub("<[^>]+>"," ",str(value or ""))).strip()

def verify():
    source=json.loads(SRC.read_text(encoding="utf8"))
    geo=json.loads((ROOT/"data/geography/seed-registry.v1.json").read_text(encoding="utf8"))
    existing=json.loads((ROOT/"data/geography/approved-place-media.v1.json").read_text(encoding="utf8"))
    assert source["schema"]=="AO_PLACE_GALLERY_ACQUISITION_R68_V1"
    assert source["place_id"]=="place:FR:pontmain"
    assert source["place_id"] in {p["place_id"] for p in geo["places"]}
    assert all(p["place_id"]!=source["place_id"] for p in existing["items"]), "Avoid duplicate approved hero owner"
    rows=source["sources"]
    assert len(rows)==2
    assert len({r["media_id"] for r in rows})==2
    assert len({r["source_url"] for r in rows})==2
    assert len({r["asset_filename"] for r in rows})==2
    for r in rows:
        assert r["commons_title"].startswith("File:Pontmain ")
        assert r["source_url"].startswith("https://commons.wikimedia.org/wiki/File:")
        assert r["expected_license"]=="CC-BY-SA-4.0" and r["expected_artist"]=="GO69"
        assert re.fullmatch(r"FR-pontmain-[a-z0-9-]+\.webp",r["asset_filename"])
        for field in ("label_en","label_fr","alt_en","alt_fr"):
            assert len(r[field])>=15
    return source

def fetch_info(title):
    query=urlencode({"action":"query","format":"json","formatversion":"2",
      "prop":"imageinfo","titles":title,
      "iiprop":"url|extmetadata|sha1|size|mime","iiurlwidth":"1280"})
    data=json.loads(REQUEST("https://commons.wikimedia.org/w/api.php?"+query,max_bytes=1_500_000))
    pages=data["query"]["pages"]
    assert len(pages)==1 and not pages[0].get("missing")
    info=pages[0]["imageinfo"][0]
    assert info["mime"] in {"image/jpeg","image/png","image/webp"}
    fields=info["extmetadata"]
    value=lambda k: cleaned((fields.get(k) or {}).get("value"))
    lic=value("LicenseShortName").replace("-"," ").upper().replace("  "," ")
    assert lic=="CC BY SA 4.0", "Commons licence mismatch: "+lic
    license_raw=value("LicenseUrl").strip()
    license_parsed=urlsplit(license_raw)
    assert license_parsed.scheme in {"http","https"} and license_parsed.hostname=="creativecommons.org" and license_parsed.path.rstrip("/")=="/licenses/by-sa/4.0", "Unexpected Commons licence URL: "+license_raw
    assert "GO69" in value("Artist"), "Photographer identity differs from reviewed source"
    assert re.fullmatch("[0-9a-f]{40}",info["sha1"])
    return info

def main():
    source=verify()
    OUT.mkdir(parents=True,exist_ok=True)
    records=[]
    for row in source["sources"]:
        info=fetch_info(row["commons_title"])
        photo_url=info.get("thumburl") or info.get("url")
        raw=REQUEST(photo_url,max_bytes=18_000_000)
        with Image.open(io.BytesIO(raw)) as original:
            assert original.format in {"JPEG","PNG","WEBP"}
            image=ImageOps.exif_transpose(original).convert("RGB")
            assert image.width>=500 and image.height>=500
            image.thumbnail((1280,1280),Image.Resampling.LANCZOS)
            # NO crop: never silently remove a church, art object or caption.
            dest=OUT/row["asset_filename"]
            image.save(dest,"WEBP",quality=84,method=6)
            w,h=image.size
        encoded=dest.read_bytes()
        assert len(encoded)>=12_000 and encoded[:4]==b"RIFF" and encoded[8:12]==b"WEBP"
        records.append({
          "media_id":row["media_id"],"place_id":source["place_id"],
          "status":"APPROVED","kind":"PHOTO","asset_path":str(dest.relative_to(ROOT)),
          "chapter_id":row["chapter_id"],"label_en":row["label_en"],"label_fr":row["label_fr"],
          "alt_en":row["alt_en"],"alt_fr":row["alt_fr"],
          "source_url":row["source_url"],"source_sha1":info["sha1"],
          "derivative_sha256":hashlib.sha256(encoded).hexdigest(),
          "credit":"GO69","license":"CC-BY-SA-4.0","license_url":LICENSE,
          "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
          "review_method":"Wikimedia author, licence, caption and camera location verified against original file page; entire image retained without cropping, mobile image displayed with object-fit:contain.",
          "changes_en":"Resized and converted to WebP; no crop, colour adjustment or compositing.",
          "changes_fr":"Image redimensionnée et convertie en WebP ; aucun recadrage ni retouche colorimétrique.",
          "width":w,"height":h,"orientation":"portrait" if h>w else "landscape",
          "reviewed_at":"2026-10-11"
        })
        print("APPROVED",row["media_id"],w,h,len(encoded),flush=True)
    REGISTRY.write_text(json.dumps({"schema":"AO_APPROVED_PLACE_GALLERY_V1","version":"1.0.0",
       "acquisition_manifest":str(SRC.relative_to(ROOT)),"items":records,
       "editorial_policy":"Only source-reviewed exact-place licensed local images; no remote hotlinks or rights-held artwork"},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("R68 PASS: acquired and locally verified",len(records),"gallery images",flush=True)

if __name__=="__main__":
    main()
