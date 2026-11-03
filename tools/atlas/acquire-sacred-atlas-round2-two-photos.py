#!/usr/bin/env python3
"""Acquire exactly two previously selected Sacred Atlas photographs into approved Place gallery.
Fail closed: original Commons identity, licence-independent photo choice, and bytes must all match.
No directory or TLM file is read or written.
"""
import argparse, hashlib, io, json, os, re, sys, time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, quote
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
MANIFEST=ROOT/"data/geography/research/sacred-atlas-round2-four-photo-decision-20261103.v1.json"
GALLERY=ROOT/"data/geography/approved-place-gallery.v1.json"
LEDGER=ROOT/"data/geography/research/sacred-atlas-round2-published-binary-evidence-20261103.v1.json"
UA="AdOrientemSacredAtlas/1.0 (https://github.com/Fulcanelli13/ad-orientem; source-verified educational image publication)"

def get_bytes(url, cap=25_000_000):
    last=None
    for delay in [0,2,5]:
        if delay: time.sleep(delay)
        try:
            req=Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/jpeg,image/png,image/webp,*/*"})
            with urlopen(req,timeout=55) as response:
                data=response.read(cap+1)
                if len(data)>cap: raise RuntimeError("Image exceeds size cap")
                return data
        except (HTTPError,URLError,TimeoutError) as e:
            last=e
    raise RuntimeError(f"Cannot fetch source {url}: {last}")

def commons_original(title):
    params=urlencode({"action":"query","format":"json","formatversion":2,
        "prop":"imageinfo","iiprop":"url|sha1|size|extmetadata","titles":title})
    meta=json.loads(get_bytes("https://commons.wikimedia.org/w/api.php?"+params,cap=4_000_000))
    pages=meta.get("query",{}).get("pages",[])
    if len(pages)!=1 or not pages[0].get("imageinfo"):
        raise RuntimeError("Commons source title not present: "+title)
    info=pages[0]["imageinfo"][0]
    url=info.get("url","")
    if not url.startswith("https://upload.wikimedia.org/wikipedia/commons/"):
        raise RuntimeError("Commons returned unexpected image host")
    return info

def archive_dhash(image):
    # Same 9x8 adjacent-pixel luminance hash from the user's A100/B16 archive.
    px=list(image.convert("L").resize((9,8),Image.Resampling.LANCZOS).getdata())
    value=0
    for y in range(8):
        for x in range(8):
            value=(value<<1) | int(px[y*9+x] > px[y*9+x+1])
    return f"{value:016x}"

def verify_candidate(row):
    info=commons_original(row["commons_title"])
    raw=get_bytes(info["url"])
    digest=hashlib.sha1(raw).hexdigest()
    if digest!=row["expected_source_original_sha1"]:
        raise RuntimeError(f"Commons original differs from archive: {row['commons_title']}")
    license_meta=info.get("extmetadata",{}).get("LicenseShortName",{}).get("value","")
    if "CC BY-SA 4.0" not in license_meta:
        raise RuntimeError(f"Commons license not verified: {row['commons_title']} ({license_meta})")
    expected_b36=format(int(digest,16),"x") # formatted below using integer base conversion
    def to_b36(n):
        chars="0123456789abcdefghijklmnopqrstuvwxyz"
        out=""
        while n:
            n,r=divmod(n,36);out=chars[r]+out
        return out.zfill(31)
    api_sha=info.get("sha1","").lower()
    if api_sha and api_sha not in (digest,to_b36(int(digest,16))):
        raise RuntimeError(f"Commons original file SHA-1 mismatch: {row['commons_title']}")
    with Image.open(io.BytesIO(raw)) as img:
        if img.format!="JPEG": raise RuntimeError("Unexpected original image format; reviewed JPEG required")
        # Some Commons originals, notably Mariazell, store landscape pixel
        # arrays with EXIF rotation; the archive preview and Wikimedia's
        # published dimensions describe the visibly upright photograph.
        upright=ImageOps.exif_transpose(img)
        original_dims=[upright.width,upright.height]
        if original_dims!=row["source_original_dimensions"]:
            raise RuntimeError(f"Commons displayed original dimensions changed {row['commons_title']}: {original_dims}")
        got_dhash=archive_dhash(upright)
        bitdiff=(int(got_dhash,16)^int(row["expected_archive_dhash"],16)).bit_count()
        if bitdiff>8:
            raise RuntimeError(f"Photo differs from preserved A100 user-approved source {row['commons_title']}: dHash difference {bitdiff}")
        image=upright.convert("RGB")
    image.thumbnail((1600,1600),Image.Resampling.LANCZOS)
    if min(image.size)<500: raise RuntimeError("Derived photograph too small for approved gallery")
    target=ROOT/"assets/approved/place-gallery"/row["filename"]
    target.parent.mkdir(parents=True,exist_ok=True)
    image.save(target,format="WEBP",quality=88,method=6)
    derived=target.read_bytes()
    if derived[:4]!=b"RIFF" or derived[8:12]!=b"WEBP":raise RuntimeError("Derivative is not a valid WebP")
    dsha=hashlib.sha256(derived).hexdigest()
    ratio="portrait" if image.height>image.width else "landscape"
    entry={
        "media_id":row["media_id"],"place_id":row["place_id"],"status":"APPROVED",
        "kind":"PHOTO","asset_path":"assets/approved/place-gallery/"+row["filename"],
        "chapter_id":"images","display_role":row["display_role"],
        "subject_focus_id":row["subject_focus_id"],
        "label_en":row["label_en"],"label_fr":row["label_fr"],
        "alt_en":row["alt_en"],"alt_fr":row["alt_fr"],
        "caption_en":row["caption_en"],"caption_fr":row["caption_fr"],
        "source_url":row["source_url"],"source_sha1":digest,
        "derivative_sha256":dsha,"credit":row["source_author"],
        "license":row["source_license"],"license_url":row["license_url"],
        "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
        "photographed_at":row["date"],"reviewed_at":"2026-11-03",
        "review_method":"Existing user Round 1 KEEP; original selected Commons source documented in A100/B16 archive; source author's public Commons licence and photograph pixels checked; source SHA1 and archival dHash verified; original sacred object and underlying-work period independently sourced. No substitute image selected.",
        "underlying_work_source_url":row["underlying_work_source_url"],
        "changes_en":"Whole original photo resized to fit 1,600 pixels and encoded as WebP; no crop, recolouring or compositing.",
        "changes_fr":"Photographie originale réduite à 1 600 pixels au maximum et convertie en WebP ; aucun recadrage, changement de couleurs ni montage.",
        "width":image.width,"height":image.height,"orientation":ratio,
        "user_selection_provenance":"HISTORIC_KEEP_PROTECTED_20261031",
        "not_relic_image":row["not_relic_image"],
    }
    if row.get("subject_relic_id"):entry["subject_relic_id"]=row["subject_relic_id"]
    if row.get("depicts_kind"):entry["depicts_kind"]=row["depicts_kind"]
    evidence={"round1_number":row["round1_number"],"media_id":row["media_id"],"place_id":row["place_id"],
        "original_sha1":digest,"archive_download_expected_sha256":row["expected_archive_download_sha256"],"commons_api_sha1":api_sha,"original_dimensions":original_dims,
        "archive_expected_dhash":row["expected_archive_dhash"],"actual_original_dhash":got_dhash,
        "archive_visual_hamming_distance":bitdiff,
        "derivative_sha256":dsha,"derivative_dimensions":[image.width,image.height],
        "asset_path":entry["asset_path"],"photo_source_url":row["source_url"],
        "photo_author":row["source_author"],"licence":row["source_license"],"rights_citation":row["underlying_work_source_url"]}
    return entry,evidence

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--write",action="store_true")
    args=parser.parse_args()
    manifest=json.loads(MANIFEST.read_text())
    assert manifest["schema"]=="AO_SACRED_ATLAS_ROUND2_FOUR_CANDIDATE_RELEASE_V1"
    selected=[x for x in manifest["rows"] if x.get("media_id")]
    held=[x for x in manifest["rows"] if not x.get("media_id")]
    assert len(selected)==2 and len(held)==2
    if not args.write:
        print("DRY_RUN_SELECTED",[(x["round1_number"],x["media_id"]) for x in selected])
        return
    gallery=json.loads(GALLERY.read_text())
    existing={x["media_id"] for x in gallery["items"]}
    if all(x["media_id"] in existing for x in selected):
        print("ALREADY_PUBLISHED",len(selected))
        return
    if any(x["media_id"] in existing for x in selected):
        raise RuntimeError("Partial release already present; manual reconciliation needed")
    new,evidence=[],[]
    for row in selected:
        entry,proof=verify_candidate(row)
        new.append(entry);evidence.append(proof)
        print("ACQUIRED",entry["media_id"],entry["asset_path"],proof["archive_visual_hamming_distance"],flush=True)
    gallery["items"].extend(new)
    gallery["version"]="1.5.2"
    # Make attribution/bilingual captions canonical with the newly acquired verified source.
    GALLERY.write_text(json.dumps(gallery,ensure_ascii=False,indent=2)+"\n")
    LEDGER.write_text(json.dumps({"schema":"AO_SACRED_ATLAS_ROUND2_TWO_PUBLISHED_IMAGE_BYTES_V1",
        "reviewed_on":"2026-11-03","source_manifest":str(MANIFEST.relative_to(ROOT)),
        "published":len(evidence),"held":len(held),"new_approved_assets":evidence},ensure_ascii=False,indent=2)+"\n")
    print("WROTE_APPROVED_PHOTO_RELEASE",len(new),flush=True)

if __name__=="__main__":main()
