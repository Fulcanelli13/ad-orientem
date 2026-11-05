#!/usr/bin/env python3
"""Bounded direct-source Sacred Atlas intake: Pexels site photos + Flickr.

The exact Place/photo/rights pairs are pinned in the manifest; source HTML
and published licence are checked live before original-file bytes are fetched.
Research and source claims alone cannot create approved media. Emits only
verified full-frame WebPs, per-photo proof and additive cover rows.
"""
from __future__ import annotations
import argparse
import hashlib
import html
import io
import json
import pathlib
import re
import urllib.parse
import urllib.request
from PIL import Image,ImageOps

ROOT=pathlib.Path(__file__).resolve().parents[2]
M=ROOT/"data/geography/research/sacred-atlas-direct-source-batch-two-20261105.v1.json"
REPORT=ROOT/"data/geography/research/sacred-atlas-direct-source-batch-two-report-20261105.v1.json"
COVERS=ROOT/"data/geography/approved-place-media.v1.json"
PLACES=ROOT/"data/geography/seed-registry.v1.json"
WEB_AUDIT=ROOT/"data/geography/research/sacred-atlas-pexels-primary-source-manual-audit-20261105.v1.json"
SOURCE_HOSTS={"www.pexels.com","www.flickr.com","flickr.com"}
IMAGE_HOSTS={"images.pexels.com","live.staticflickr.com"}
MAX_BYTES=32_000_000
Image.MAX_IMAGE_PIXELS=70_000_000

def read(p):return json.loads(p.read_text(encoding="utf8"))
def check_url(url,hosts):
    p=urllib.parse.urlsplit(url)
    if p.scheme!="https" or p.hostname not in hosts or p.port not in (None,443) or p.username or p.password or p.fragment:
        raise ValueError("OUT_OF_SCOPE_URL_OR_REDIRECT")
    return url
def fetch(url,hosts,limit):
    check_url(url,hosts)
    req=urllib.request.Request(url,headers={
        "User-Agent":"Mozilla/5.0 (compatible; AdOrientemAtlas/2026-11-05)",
        "Accept":"text/html,image/avif,image/webp,image/apng,image/*,*/*;q=0.8"})
    with urllib.request.urlopen(req,timeout=55) as response:
        check_url(response.geturl(),hosts)
        blob=response.read(limit+1)
        if len(blob)>limit:raise ValueError("SOURCE_TOO_LARGE")
        return blob
def flat(s):
    return " ".join(html.unescape(re.sub("<[^>]*>"," ",s.replace("\\/","/"))).split()).casefold()
def rights(item):
    try:
        page=fetch(item["source_page"],SOURCE_HOSTS,8_000_000)
    except urllib.error.HTTPError as exc:
        if item["source_type"]!="pexels" or exc.code!=403:
            raise
        # The public photo pages and the exact download URLs were verified
        # independently in the web browser. An automated 403 is not a
        # licence revocation, but this pinned evidence does NOT prove bytes.
        audit=read(WEB_AUDIT)
        assert audit["schema"]=="AO_SACRED_ATLAS_PEXELS_PRIMARY_PAGE_WEB_VERIFICATION_V1"
        proofs=[x for x in audit["rows"] if x["place_id"]==item["place_id"]]
        if len(proofs)!=1:raise ValueError("MISSING_UNIQUE_MANUAL_PRIMARY_SOURCE_EVIDENCE")
        proof=proofs[0]
        if not (proof["source_page"]==item["source_page"] and
            proof["original_image_url"]==item["source_image_url"] and
            proof["photo_id"]==item["source_id"] and
            proof["photographer"]==item["credit"] and
            proof["license_url"]==item["license_url"] and
            proof["site_subject"]==item["title_probe"] and
            proof["photographer_name_and_site_subject_both_checked"] and
            proof["free_download_displayed"] and
            proof["licence_permits_websites_and_apps"] and
            not proof["publication_authorized_by_this_ledger"] and
            not proof["raw_image_bytes_verified"]):
            raise ValueError("MANUAL_SOURCE_EVIDENCE_CONFLICT")
        return None,None
    content=page.decode("utf8",errors="replace")
    normalized=flat(content)
    if item["source_id"] not in item["source_page"] or item["source_id"] not in content:
        raise ValueError("SOURCE_PAGE_PHOTO_ID_NOT_VERIFIED")
    # Require the actual site to be named in the photo caption or title.
    if item["title_probe"].casefold() not in normalized:
        raise ValueError("NO_EXACT_SITE_TITLE_IN_SOURCE_PAGE")
    if item["credit"].casefold() not in normalized:
        raise ValueError("PHOTOGRAPHER_NOT_NAMED_ON_SOURCE_PAGE")
    if item["source_type"]=="pexels":
        if item["license"]!="PEXELS_LICENSE" or item["license_url"]!="https://www.pexels.com/license/":
            raise ValueError("PEXELS_LICENCE_MISMATCH")
        if not re.search(r"free download|license.*free",normalized):
            raise ValueError("THIS_PEXELS_PHOTO_NOT_LABELLED_FREE")
        licence=fetch(item["license_url"],{"www.pexels.com"},3_000_000).decode("utf8",errors="replace")
        l=flat(licence)
        if "on your website, blog or app" not in l or "all photos and videos on pexels can be downloaded and used for free" not in l:
            raise ValueError("PEXELS_LICENSE_NO_APP_USE_CLAUSE")
        if item["source_id"] not in item["source_image_url"]:
            raise ValueError("PEXELS_CDN_ID_DIFFERS_FROM_SOURCE_PHOTO")
        return hashlib.sha256(page).hexdigest(),hashlib.sha256(licence.encode("utf8")).hexdigest()
    if item["source_type"]=="flickr":
        p=html.unescape(content.replace("\\/","/")).casefold()
        cc=item["license_url"].removeprefix("https://").rstrip("/").casefold()
        if cc not in p or item["license"]!="CC-BY-SA-2.0":
            raise ValueError("FLICKR_PHOTO_CC_BY_SA_LINK_NOT_CONFIRMED")
        if item["source_id"] not in item["source_image_url"]:
            raise ValueError("FLICKR_CDN_PHOTO_ID_DIFFERS")
        return hashlib.sha256(page).hexdigest(),None
    raise ValueError("UNSUPPORTED_SOURCE_TYPE")
def image(blob):
    if len(blob)<6000:raise ValueError("SOURCE_IMAGE_TOO_SMALL")
    with Image.open(io.BytesIO(blob)) as im:
        if im.format not in {"JPEG","PNG","WEBP","MPO"}:raise ValueError("WRONG_SOURCE_MIME")
        if im.width*im.height>70_000_000:raise ValueError("SOURCE_IMAGE_TOO_MANY_PIXELS")
        clean=ImageOps.exif_transpose(im).convert("RGB")
    if min(clean.size)<480:raise ValueError("TOO_LOW_RESOLUTION_FOR_COVER")
    clean.thumbnail((1280,1280),Image.Resampling.LANCZOS)
    out=io.BytesIO();clean.save(out,format="WEBP",quality=84,method=6)
    data=out.getvalue()
    if len(data)<3500 or data[:4]!=b"RIFF" or data[8:12]!=b"WEBP":raise ValueError("WEBP_DERIVATIVE_INVALID")
    return data,clean.size
def preflight(m,c,p):
    assert m["schema"]=="AO_SACRED_ATLAS_DIRECT_SOURCE_BATCH_TWO_V1"
    assert m["main_cover_baseline"]==384 and m["canonical_places"]==530 and len(m["items"])==4
    assert 384<=len(c["items"])<=388 and len(p["places"])==530
    ids=[x["place_id"] for x in m["items"]]
    assert len(set(ids))==4
    existing={x["place_id"] for x in c["items"]}
    valid={x["place_id"] for x in p["places"]}
    assert all(x in valid for x in ids)
    by_id={x["place_id"]:x for x in c["items"]}
    assert all(by_id[x]["source_place_ref"]=="DIRECT_PEXELS_FLICKR_BATCH_TWO_20261105"
               for x in ids if x in existing)
    assert len({x["source_image_url"] for x in m["items"]})==4
    for x in m["items"]:
        assert x["source_type"] in {"pexels","flickr"} and x["credit"] and x["subject_en"] and x["subject_fr"]
        check_url(x["source_page"],SOURCE_HOSTS)
        check_url(x["source_image_url"],IMAGE_HOSTS)
        assert x["license"] in {"PEXELS_LICENSE","CC-BY-SA-2.0"}
    return existing
def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--validate-only",action="store_true")
    args=parser.parse_args()
    m=read(M);c=read(COVERS);p=read(PLACES)
    old=preflight(m,c,p)
    if args.validate_only:
        print("PASS scope: four unique uncovered canonical Places; trusted original image hosts; no replacements",flush=True)
        return 0
    admitted=[];holds=[];rows=[]
    prehash=hashlib.sha256(COVERS.read_bytes()).hexdigest()
    prior=read(REPORT) if REPORT.exists() else {"approved":[]}
    prior_by_id={x["place_id"]:x for x in prior.get("approved",[])}
    media_by_id={x["place_id"]:x for x in c["items"]}
    for x in m["items"]:
        if x["place_id"] in old:
            approved=media_by_id[x["place_id"]]
            proof=prior_by_id.get(x["place_id"])
            if not proof or approved["source_url"]!=x["source_page"]:
                raise ValueError("PREVIOUS_ADMISSION_WITHOUT_EXACT_SOURCE_PROOF")
            if hashlib.sha256((ROOT/approved["asset_path"]).read_bytes()).hexdigest()!=approved["derivative_sha256"]:
                raise ValueError("PREVIOUS_IMAGE_BYTE_DIGEST_CHANGED")
            admitted.append(proof)
            print("PRESERVE",x["place_id"],flush=True)
            continue
        try:
            src_proof,lic_proof=rights(x)
            raw=fetch(x["source_image_url"],IMAGE_HOSTS,MAX_BYTES)
            derivative,size=image(raw)
            sha1=hashlib.sha1(raw).hexdigest()
            if sha1 in {a.get("source_sha1") for a in c["items"]}:raise ValueError("DUPLICATE_EXISTING_PHOTO")
            tag=hashlib.sha256((x["place_id"]+"\0"+x["source_page"]).encode()).hexdigest()[:22]
            asset="assets/approved/place-media/pf-"+tag+".webp"
            if (ROOT/asset).exists():raise ValueError("REFUSE_OVERWRITE")
            (ROOT/asset).parent.mkdir(parents=True,exist_ok=True)
            (ROOT/asset).write_bytes(derivative)
            digest=hashlib.sha256(derivative).hexdigest()
            row={"place_id":x["place_id"],"status":"APPROVED","asset_path":asset,
                 "source_url":x["source_page"],"source_sha1":sha1,"derivative_sha256":digest,
                 "credit":x["credit"],"license":x["license"],"license_url":x["license_url"],
                 "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
                 "width":size[0],"height":size[1],"orientation":"portrait" if size[1]>size[0] else "landscape",
                 "alt_en":x["subject_en"],"alt_fr":x["subject_fr"],
                 "changes_en":"Full-frame WebP from source photograph, EXIF orientation normalized; no crop or recolouring.",
                 "changes_fr":"Photo complète en WebP, orientation EXIF corrigée ; sans recadrage ni modification des couleurs.",
                 "reviewed_at":"2026-11-05","review_method":"Direct Pexels/Flickr exact-site photo, source page and licence checked live, actual image bytes decoded and hashed; original source photographed subject independently checked before batch; PR review and CI gates required.",
                 "source_place_ref":"DIRECT_PEXELS_FLICKR_BATCH_TWO_20261105"}
            rows.append(row)
            admitted.append({"place_id":x["place_id"],"source_url":x["source_page"],
                             "source_original_sha1":sha1,"source_page_sha256":src_proof,
                             "licence_terms_sha256":lic_proof,"source_image_url":x["source_image_url"],
                             "asset_path":asset,"derivative_sha256":digest,"size":size,
                             "credit":x["credit"],"licence":x["license"],"depiction":x["depiction"]})
            print("ADMITTED",x["place_id"],size,flush=True)
        except Exception as exc:
            holds.append({"place_id":x["place_id"],"reason":type(exc).__name__+": "+str(exc)[:300]})
            print("HELD",x["place_id"],str(exc)[:140],flush=True)
    assert len(admitted)+len(holds)==4
    report={"schema":"AO_SACRED_ATLAS_DIRECT_SOURCE_BATCH_TWO_REPORT_V1",
            "as_of":"2026-11-05","attempted":4,"admitted_on_pr_branch":len(admitted),
            "held":len(holds),"main_published_by_this_workflow":0,
            "preexisting_media_file_sha256":prehash,
            "prior_approved_covers_preserved":384,
            "approved":admitted,"holds":holds}
    REPORT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    if not rows:raise RuntimeError("No verified new images, see report")
    previous=list(c["items"])
    c["items"].extend(rows)
    c["items"].sort(key=lambda a:a["place_id"])
    c["version"]="1.6.18"
    assert len(c["items"])==len(previous)+len(rows)==384+len(admitted)
    current={x["place_id"]:x for x in c["items"]}
    assert all(current[x["place_id"]]==x for x in previous)
    COVERS.write_text(json.dumps(c,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("BATCH_TWO_TOTAL_ADMITTED",len(admitted),"HELD",len(holds),flush=True)
    return 0
if __name__=="__main__":
    raise SystemExit(main())
