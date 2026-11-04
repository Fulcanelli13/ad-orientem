#!/usr/bin/env python3
"""Acquire exactly one previously user-selected Maria Luggau Commons original.

Guarded PR-branch release staging only: checks 2026 Photo Finder rank-one choice,
source SHA1, Commons description revision, site identity, named photographer,
country-specific CC BY-SA 3.0 AT and actual original bytes. Writes one WebP
derivative and one approved-media record to THIS BRANCH; no live publication
until PR tests pass and main is merged through GitHub Pages. Stops on HTTP 429.
"""
from __future__ import annotations
import hashlib, html, io, json, re, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
SPEC=ROOT/"data/geography/research/sacred-atlas-maria-luggau-frozen-selected-release-20261104.v1.json"
PLACES=ROOT/"data/geography/seed-registry.v1.json"
DECISIONS=ROOT/"data/geography/research/photo-finder-20261030/decisions.json"
CREDITS=ROOT/"data/geography/research/photo-finder-20261030/credits.csv"
SOURCE_AUDIT=ROOT/"data/geography/research/sacred-atlas-selected24-current-source-findings-20261104.v1.json"
SOURCE_HOLD=ROOT/"data/geography/research/sacred-atlas-selected24-hold-closure-20261104.v1.json"
COVERS=ROOT/"data/geography/approved-place-media.v1.json"
GALLERY=ROOT/"data/geography/approved-place-gallery.v1.json"
EVIDENCE=ROOT/"data/geography/research/sacred-atlas-maria-luggau-selected-cover-binary-evidence-20261104.v1.json"
COMMONS="https://commons.wikimedia.org/w/api.php"
AGENT="AdOrientemMariaLuggauFrozenSelectedPhoto/2026-11-04 (one original; no retry; GitHub Pages)"
Image.MAX_IMAGE_PIXELS=32_000_000

def read(p):return json.loads(p.read_text(encoding="utf-8"))
def clean(s):return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(s or ""))).split())
def get(meta,key):return clean((meta.get(key) or {}).get("value"))
def trusted(url,hosts):
    u=urllib.parse.urlsplit(str(url or ""))
    if u.scheme!="https" or u.hostname not in hosts or u.username or u.password or u.port not in (None,443):
        raise ValueError("UNTRUSTED_SOURCE_URL_OR_REDIRECT")
    return url
LAST=0.0
def fetch(url,limit,hosts):
    global LAST
    trusted(url,hosts)
    if LAST:
        elapsed=time.monotonic()-LAST
        if elapsed<6:time.sleep(6-elapsed)
    LAST=time.monotonic()
    req=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":"*/*"})
    # No retries or alternate endpoints after any error, including 429.
    with urllib.request.urlopen(req,timeout=55) as response:
        trusted(response.geturl(),hosts)
        buf=response.read(limit+1)
        if len(buf)>limit:raise ValueError("SOURCE_EXCEEDS_BOUNDED_BYTES")
        return buf

def main():
    m=read(SPEC);pid=m["place_id"];title=m["selected_file"]
    assert m["schema"]=="AO_SACRED_ATLAS_SELECTED_MARIA_LUGGAU_SAFE_RELEASE_V1"
    assert pid=="place:AT:wallfahrtsbasilika-maria-schnee-luggau"
    assert title=="File:Lesachtal Maria Luggau Servitenkloster NW-Ansicht 16072014 804.jpg"
    assert m["pinned_original_sha1"]=="ca025cb7c0d5815ccb25b5f5570e8a57331103d7"
    assert m["pinned_original_bytes"]==11755745
    assert m["pinned_dimensions"]==[4928,3280]
    assert m["pinned_source_description_rev_id"]==1190961558
    assert m["photo_license_url"]=="https://creativecommons.org/licenses/by-sa/3.0/at/deed.en"
    assert m["flags"]["already_user_chosen"] and m["flags"]["no_alternate_sources"]
    assert m["flags"]["no_crop"] and not m["release_authorized_from_metadata_alone"]
    assert not EVIDENCE.exists(),"Never fabricate a second source verification"
    assert m["limits"]["max_original_bytes"]==20_000_000
    assert m["limits"]["max_image_pixels"]==32_000_000
    geo=read(PLACES);site={x["place_id"]:x for x in geo["places"]}
    dec=read(DECISIONS);audit=read(SOURCE_AUDIT);holds=read(SOURCE_HOLD)
    before=read(COVERS);gallery=read(GALLERY)
    assert len(site)==m["before"]["canonical_places"]==530
    assert len(before["items"])==m["before"]["approved_cover_items"]==379
    assert len(gallery["items"])==m["before"]["approved_gallery_items"]==42
    assert len({x["place_id"] for x in before["items"]})==379
    assert not any(x["place_id"]==pid for x in before["items"])
    assert not any(x.get("source_sha1")==m["pinned_original_sha1"] for x in before["items"]+gallery["items"])
    assert site[pid]["photo_editorial"]["status"]=="DONE"
    assert site[pid]["photo_editorial"]["decision"]=="SELECTED"
    assert site[pid]["photo_editorial"]["cover_commons_file"]==title
    assert dec["decisions"][pid]["files"][0]==title
    source=next(x for x in holds["rows"] if x["place_id"]==pid)
    assert source["source_title"]==title and source["sha1"]==m["pinned_original_sha1"]
    assert source["classification"]=="PORTED_CC_LEGAL_CODE"
    src_audit=next(x for x in audit["rows"] if x["place_id"]==pid)
    assert src_audit["source_revision_id"]==m["pinned_source_description_rev_id"]
    assert src_audit["current_size_bytes"]==m["pinned_original_bytes"]
    assert src_audit["verification_status"]=="PORTED_CC_REQUIRES_EXACT_LEGAL_CODE_AND_APP_WHITELIST"

    args=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",
        "titles":title,"prop":"imageinfo|revisions",
        "iiprop":"url|size|sha1|mime|extmetadata",
        "rvprop":"ids|content","rvslots":"main","rvlimit":1})
    payload=json.loads(fetch(COMMONS+"?"+args,2_000_000,{"commons.wikimedia.org"}))
    pages=payload.get("query",{}).get("pages",[])
    if len(pages)!=1 or pages[0].get("title")!=title or not pages[0].get("imageinfo"):
        raise ValueError("EXACT_SELECTED_COMMONS_TITLE_MISSING_OR_REDIRECTED")
    page=pages[0];info=page["imageinfo"][0]
    desc=(page.get("revisions") or [{}])[0]
    if desc.get("revid")!=m["pinned_source_description_rev_id"]:
        raise ValueError("SOURCE_DESCRIPTION_REVISION_CHANGED")
    wiki=str(desc.get("slots",{}).get("main",{}).get("content") or desc.get("content") or "")
    if not ("maria luggau" in wiki.casefold()
        and ("wallfahrtskirche" in wiki.casefold() or "pilgrimage church" in wiki.casefold())):
        raise ValueError("SITE_DESCRIPTION_NO_LONGER_ATTESTS_EXACT_CHURCH")
    if re.search(r"\{\{\s*(?:copyvio|no permission|delete|derivative|copyright violation)\b",wiki,re.I):
        raise ValueError("SOURCE_DESCRIPTION_HAS_COPYRIGHT_WARNING")
    source_size=int(info.get("size") or 0)
    w,h=int(info.get("width") or 0),int(info.get("height") or 0)
    if (info.get("sha1")!=m["pinned_original_sha1"]
        or source_size!=m["pinned_original_bytes"]
        or [w,h]!=m["pinned_dimensions"]):
        raise ValueError("ORIGINAL_SHA1_SIZE_OR_DIMENSIONS_CHANGED")
    if (info.get("mime")!="image/jpeg" or source_size>m["limits"]["max_original_bytes"]
        or w*h>m["limits"]["max_image_pixels"] or min(w,h)<650):
        raise ValueError("ORIGINAL_IMAGE_TYPE_SIZE_OR_PIXELS_UNSAFE")
    ext=info.get("extmetadata") or {}
    author=get(ext,"Artist")
    lic_short=get(ext,"LicenseShortName")
    lic_url=get(ext,"LicenseUrl")
    if m["photographer"] not in author:
        raise ValueError("CURRENT_NAMED_PHOTOGRAPHER_CHANGED")
    marker=re.sub(r"[^A-Z0-9]","",lic_short.upper())
    if marker not in ("CCBYSA30AT","CCBYSA30"):
        raise ValueError("CURRENT_CC_REGIONAL_LICENSE_LABEL_CHANGED")
    p=urllib.parse.urlsplit(lic_url)
    if (p.scheme not in ("http","https") or p.hostname!="creativecommons.org"
        or p.username or p.password or p.port not in (None,443,80)
        or p.path.rstrip("/") not in
        ("/licenses/by-sa/3.0/at/deed.en","/licenses/by-sa/3.0/at")):
        raise ValueError("CURRENT_CC_LICENSE_IS_NOT_PINNED_AUSTRIAN_3_0")
    # Reject unexpected file source (Commons must serve original from its
    # controlled upload host, not a query-time alternate or third-party mirror).
    rawurl=trusted(info.get("url"),{"upload.wikimedia.org"})
    original=fetch(rawurl,m["limits"]["max_original_bytes"],{"upload.wikimedia.org"})
    if len(original)!=source_size or hashlib.sha1(original).hexdigest()!=m["pinned_original_sha1"]:
        raise ValueError("DOWNLOAD_BYTE_SHA1_OR_SIZE_MISMATCH")
    with Image.open(io.BytesIO(original)) as opened:
        if opened.format not in ("JPEG","MPO"):raise ValueError("JPEG_DECODER_FORMAT_MISMATCH")
        corrected=ImageOps.exif_transpose(opened)
        if [w,h] not in [list(opened.size),list(corrected.size)]:
            raise ValueError("DECODED_ORIGINAL_DIMENSIONS_MISMATCH")
        image=corrected.convert("RGB")
    image.thumbnail((m["limits"]["max_webp_px"],m["limits"]["max_webp_px"]),Image.Resampling.LANCZOS)
    webp=io.BytesIO();image.save(webp,format="WEBP",quality=84,method=6)
    binary=webp.getvalue()
    if len(binary)<3000 or binary[:4]!=b"RIFF" or binary[8:12]!=b"WEBP":
        raise ValueError("WEBP_BINARY_INVALID")
    token=hashlib.sha256((pid+"\0"+title).encode("utf8")).hexdigest()[:22]
    asset="assets/approved/place-media/pf-"+token+".webp"
    target=ROOT/asset
    if target.exists():raise ValueError("REFUSE_OVERWRITE_EXISTING_ASSET")
    record={
      "place_id":pid,"status":"APPROVED","asset_path":asset,
      "source_url":m["source_page"],"source_sha1":m["pinned_original_sha1"],
      "derivative_sha256":hashlib.sha256(binary).hexdigest(),
      "credit":"Johann Jaritz","license":"CC-BY-SA-3.0-AT",
      "license_url":"https://creativecommons.org/licenses/by-sa/3.0/at/deed.en",
      "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
      "width":image.width,"height":image.height,
      "orientation":"portrait" if image.height>image.width else "landscape",
      "alt_en":"Maria Schnee pilgrimage basilica and Servite monastery in Maria Luggau, Austria",
      "alt_fr":"Basilique de pèlerinage Maria Schnee et monastère des Servites à Maria Luggau, en Autriche",
      "changes_en":"Full-frame scaled WebP from original; EXIF orientation normalized, no crop or recolouring.",
      "changes_fr":"Image complète redimensionnée en WebP, orientation EXIF corrigée, sans recadrage ni retouche.",
      "reviewed_at":"2026-11-04",
      "review_method":"Photo Finder editorial selection, 2026-10-30; exact Commons source revision, Austrian CC BY-SA 3.0 ported licence, site caption, named photographer and SHA1 original bytes checked.",
      "source_place_ref":"PHOTO_FINDER_2026-10-30_R1"
    }
    after={**before,"version":"1.6.17","items":sorted(before["items"]+[record],key=lambda x:x["place_id"])}
    assert len(after["items"])==380
    evidence={
      "schema":"AO_SACRED_ATLAS_MARIA_LUGGAU_FROZEN_COVER_ORIGINAL_VERIFIED_V1",
      "scope":"SINGLE_ORIGINAL_BRANCH_RELEASE_UNTIL_MERGE",
      "place_id":pid,"title":title,"sha1":m["pinned_original_sha1"],
      "source_description_revision":desc.get("revid"),
      "photo_author":author,"license_short_name":lic_short,"license_url":lic_url,
      "source_original_bytes":source_size,"source_original_sha256":hashlib.sha256(original).hexdigest(),
      "original_dimensions":[w,h],"derivative_dimensions":[image.width,image.height],
      "derivative_sha256":record["derivative_sha256"],"asset_path":asset,
      "before":{"covers":379,"gallery":42},"after":{"covers":380,"gallery":42},
      "source_rights_and_original_verified":True,"source_exact_place_verified":True,
      "selected_first_choice_preserved":True,
      "full_frame_no_crop_or_recolour":True,
      "prior_approved_covers_unchanged":True,
      "gallery_unchanged":True,
      "git_hub_pages_only":True,
      "production_verified":False
    }
    # Write only after all independent checks passed. Workflow stages the new
    # binary and metadata in a PR branch; merge is still a separate action.
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_bytes(binary)
    COVERS.write_text(json.dumps(after,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    EVIDENCE.write_text(json.dumps(evidence,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    assert read(GALLERY)==gallery
    assert [x for x in read(COVERS)["items"] if x["place_id"]!=pid]==before["items"], "Prior approved Place cover records changed"
    assert read(COVERS)["items"]==after["items"], "New original cover record not stable after write"
    print("MARIA_LUGGAU_SELECTED_COVER_VERIFIED",json.dumps({
      "place_id":pid,"original_sha1":m["pinned_original_sha1"],
      "derivative_sha256":record["derivative_sha256"],
      "covers_staged":len(after["items"]),"published_to_main":False},ensure_ascii=False),flush=True)

if __name__=="__main__":main()
