#!/usr/bin/env python3
"""B6 bulk archive-to-public-source fingerprint and rights-evidence reconciliation.

Reads exact archived originals for the 12 painting-only prospects; verifies
the frozen SHA256, native dimensions and embedded copyright fields. Attempts
ONE batch Wikimedia API request for all 10 Commons files, comparing the
published SHA1 with the actual archived binary. No downloads from Wikimedia,
no publication, no claimed legal/curatorial certification.
"""
from __future__ import annotations
import hashlib, io, json, re, time, urllib.parse, urllib.request, urllib.error
from pathlib import Path
from PIL import Image

ROOT=Path(__file__).resolve().parents[2]
REG=ROOT/"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json"
B2=ROOT/"data/research/prayer-sacred-art-b2-reconciled-intake-20261028.v1.json"
RIGHTS=ROOT/"data/research/prayer-art-b5-twelve-photo-source-rights-evidence-20261028.v1.json"
OUT=ROOT/"assets/staged/prayer-art-b6-twelve-source-fingerprint-20261028"
OUT.mkdir(parents=True,exist_ok=True)
reg=json.loads(REG.read_text())
b2=json.loads(B2.read_text())
right=json.loads(RIGHTS.read_text())
assert len(right["records"])==12 and len(reg["primary_artworks"])==22 and len(reg["placement_records"])==118
assert sum(x["kind"]=="approved_primary_hero" for x in right["records"])==10
UA="AdOrientem-PublicDomain-Photo-Provenance-Research/1.0 (GitHub: Fulcanelli13/ad-orientem)"
MAX=47_000_000

def sha(raw):
    return hashlib.sha256(raw).hexdigest(),hashlib.sha1(raw).hexdigest()

def github_raw(ref,path):
    if not ref or not path:raise ValueError("MISSING_EXACT_PINNED_GIT_SOURCE")
    url="https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/"+urllib.parse.quote(ref,safe="/")+"/"+"/".join(urllib.parse.quote(p,safe="") for p in path.split("/"))
    request=urllib.request.Request(url,headers={"User-Agent":UA})
    with urllib.request.urlopen(request,timeout=75) as f:
        b=f.read(MAX+1)
    if not b or len(b)>MAX:raise ValueError("SOURCE_BYTES_LIMIT")
    return b

def source_for_case(rights):
    if rights["kind"]=="approved_primary_hero":
        x=next(h for h in reg["primary_artworks"] if h["module_id"]==rights["id"])
        old=x["original"]
        loc=old.get("recovered_location") or old
        ref=loc.get("ref") or loc.get("git_ref")
        path=loc["path"]
        return github_raw(ref,path),ref,path
    x=next(h for h in b2["records"] if h["case_id"]==rights["id"])
    path=x["evidence_file"]
    return (ROOT/path).read_bytes(),"research/prayer-artwork-pristine-registry-bulk-20261028",path

def scrub(t):
    s=str(t or "")
    return re.sub(r"\s+"," ",re.sub("<[^>]+>"," ",s))[:450].strip()

def extract_meta(image):
    ex=image.getexif()
    out={"image_format":image.format,"icc_embedded":bool(image.info.get("icc_profile")),
         "exif_count":len(ex),"native_dimensions":list(image.size)}
    tagids={"Copyright":33432,"Artist":315,"ImageDescription":270,"Software":305,
            "DateTime":306,"Make":271,"Model":272}
    for k,n in tagids.items():
        val=ex.get(n)
        if val:out["exif_"+k.lower()]=scrub(val)
    if image.info.get("comment"):
        out["embedded_comment"]=scrub(image.info["comment"])
    return out

def batch_commons(titles):
    # Exactly one request for all 10 canonical filenames, no blind retries.
    params={"action":"query","format":"json","formatversion":2,
            "prop":"imageinfo","iiprop":"sha1|size|extmetadata|mime|url",
            "titles":"|".join(titles)}
    url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(params)
    request=urllib.request.Request(url,headers={
        "User-Agent":UA,"Accept":"application/json","Accept-Encoding":"identity"})
    with urllib.request.urlopen(request,timeout=30) as f:
        doc=json.loads(f.read(2_800_000))
    d={}
    for entry in doc.get("query",{}).get("pages",[]):
        title=entry.get("title")
        x=(entry.get("imageinfo") or [{}])[0]
        if not title or not x:continue
        ext=x.get("extmetadata") or {}
        d[title.replace("_"," ")]={"width":x.get("width"),"height":x.get("height"),
            "sha1":x.get("sha1"),"mime":x.get("mime"),
            "file_description_url":x.get("descriptionurl"),
            "license_short_name":scrub(ext.get("LicenseShortName",{}).get("value")),
            "copyrighted":scrub(ext.get("Copyrighted",{}).get("value")),
            "usage_terms":scrub(ext.get("UsageTerms",{}).get("value")),
            "credit":scrub(ext.get("Credit",{}).get("value")),
            "artist":scrub(ext.get("Artist",{}).get("value"))}
    return d

rows=[]
for x in right["records"]:
    rec={"case_id":x["id"],"kind":x["kind"],"artist":x["artist"],"title":x["title"],
         "registered_source":x["source_url"],"source_label":x["source_label"],
         "prior_source_rights_evidence":x["evidence_source"],
         "registered_source_sha256":x["sha256"],
         "rights_final_certified":False,"pristine_final_certified":False,
         "production_allowed":False}
    try:
        raw,ref,path=source_for_case(x)
        actual_sha256,actual_sha1=sha(raw)
        assert actual_sha256==x["sha256"],"ARCHIVED_SHA256_MISMATCH"
        with Image.open(io.BytesIO(raw)) as im:
            im.load()
            meta=extract_meta(im)
            assert list(im.size)==x["native_dimensions"],"ARCHIVED_IMAGE_DIMENSIONS_MISMATCH"
        rec.update({"status":"ARCHIVED_SOURCE_FINGERPRINT_VERIFIED",
                    "source_ref":ref,"source_path":path,
                    "native_sha1":actual_sha1,"sha256_rechecked":actual_sha256,
                    "archived_original_bytes":len(raw),
                    "original_image_metadata":meta,
                    "exact_source_page_metadata_status":"NOT_YET_QUERIED"})
        embedded= " ".join(str(y) for k,y in meta.items() if k.startswith("exif_"))
        if any(z in embedded.lower() for z in ["copyright","all rights reserved","catholic news service"]):
            rec["embedded_rights_notice_review_required"]=True
        else:
            rec["embedded_rights_notice_review_required"]=False
        print("ARCHIVE_SHA_PASS",rec["case_id"],flush=True)
    except Exception as e:
        rec.update(status="ARCHIVED_SOURCE_FINGERPRINT_FAILED",
                   error=type(e).__name__+": "+str(e)[:350])
        print("ARCHIVE_HOLD",rec["case_id"],str(e)[:120],flush=True)
    rows.append(rec)

titles={}
for entry in rows:
    if entry["source_label"].startswith("COMMONS"):
        url=entry["registered_source"]
        title=urllib.parse.unquote(url.split("/wiki/",1)[-1]).replace("_"," ")
        assert title.startswith("File:"),"SOURCE_NOT_COMMONS_FILE_PAGE"
        titles[entry["case_id"]]=title
assert len(titles)==10
commons={}
error=None
try:
    commons=batch_commons(list(titles.values()))
except Exception as e:
    error=type(e).__name__+": "+str(e)[:350]
for entry in rows:
    key=entry["case_id"]
    if key in titles:
        data=commons.get(titles[key])
        if not data:
            entry["exact_source_page_metadata_status"]="SOURCE_API_UNAVAILABLE_OR_TITLE_NOT_RETURNED"
            entry["source_api_error"]=error
            continue
        entry["commons_imageinfo"]=data
        matches=(entry.get("native_sha1")==data.get("sha1"))
        pixel_match=(entry.get("original_image_metadata",{}).get("native_dimensions")==[data.get("width"),data.get("height")])
        entry["exact_source_page_metadata_status"]="MATCH_EXACT_COMMONS_FILE_BYTES" if matches and pixel_match else "COMMONS_SOURCE_BYTES_DIFFER_OR_FILE_VERSION_REVIEW"
        entry["commons_binary_sha1_match"]=matches
        entry["commons_native_dimensions_match"]=pixel_match
        # A matching binary and PD-Art declaration is provenance, not a
        # jurisdictional rights decision or curatorial fidelity approval.
        entry["photo_rights_final_certified"]=False
summary={
    "schema":"AO_PRAYER_ART_B6_TWELVE_PHOTO_ARCHIVE_AND_PUBLIC_SOURCE_FINGERPRINT_V1",
    "date":"2026-10-28","total_cases":12,
    "archived_sha256_verified":sum(z.get("status")=="ARCHIVED_SOURCE_FINGERPRINT_VERIFIED" for z in rows),
    "archived_source_failures":sum(z.get("status")!="ARCHIVED_SOURCE_FINGERPRINT_VERIFIED" for z in rows),
    "commons_file_pages_checked_in_one_query":10,"commons_api_error":error,
    "commons_titles_returned":len(commons),
    "exact_commons_source_bytes_matched":sum(z.get("exact_source_page_metadata_status")=="MATCH_EXACT_COMMONS_FILE_BYTES" for z in rows),
    "source_version_or_hash_discrepancies":sum(z.get("exact_source_page_metadata_status")=="COMMONS_SOURCE_BYTES_DIFFER_OR_FILE_VERSION_REVIEW" for z in rows),
    "source_api_unavailable":sum(z.get("exact_source_page_metadata_status")=="SOURCE_API_UNAVAILABLE_OR_TITLE_NOT_RETURNED" for z in rows),
    "copyright_notice_flags":sum(bool(z.get("embedded_rights_notice_review_required")) for z in rows),
    "photo_rights_final_certified":0,"pristine_final_certified":0,"production_released":0,"cost_eur":0,
    "important":"A Commons SHA1 match proves the exact saved file provenance, not fidelity or universal reuse legality. NGA/MNAC records are source-policy evidence, not Commons SHA matches.",
    "records":rows}
(OUT/"source-fingerprints.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({k:summary[k] for k in ("total_cases","archived_sha256_verified",
    "commons_titles_returned","exact_commons_source_bytes_matched",
    "source_api_unavailable","copyright_notice_flags","pristine_final_certified")}))
if summary["archived_sha256_verified"]!=12:
    raise SystemExit("B6_INCOMPLETE_ARCHIVE_FINGERPRINTS")
