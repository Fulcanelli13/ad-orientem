#!/usr/bin/env python3
"""Bounded, read-only original-file verification of five frozen regional-CC Place covers.

Source metadata, current CC legal-code family, named author, byte integrity, JPEG
decoder and a full-frame WebP review image are checked before a candidate is
STAGED. No approval, GitHub Pages asset, published media registry or TLM file
is modified. HTTP 429 is a stop condition; never bypass rate limits.
"""
from __future__ import annotations
from collections import Counter
from pathlib import Path
import hashlib, html, io, json, re, time, urllib.error, urllib.parse, urllib.request
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
MANIFEST=ROOT/"data/geography/research/sacred-atlas-ported5-original-licence-legal-code-review-20261104.v1.json"
PLACES=ROOT/"data/geography/seed-registry.v1.json"
DECISIONS=ROOT/"data/geography/research/photo-finder-20261030/decisions.json"
COVERS=ROOT/"data/geography/approved-place-media.v1.json"
GALLERY=ROOT/"data/geography/approved-place-gallery.v1.json"
REPORT=Path("/tmp/ao-atlas-ported-five-originals/report.json")
PREVIEWS=REPORT.parent/"review-previews"
API="https://commons.wikimedia.org/w/api.php"
USER_AGENT="AdOrientemSourceResearch/2026-11-04 (5 previously selected exact Commons originals, no publication)"
MAX_FILE=20_000_000
MAX_BATCH=75_000_000
MAX_PIXELS=32_000_000
MAX_METADATA=2_000_000
Image.MAX_IMAGE_PIXELS=MAX_PIXELS

def read(path):return json.loads(path.read_text(encoding="utf-8"))
def clean(s):return " ".join(html.unescape(re.sub(r"<[^>]+>"," ",str(s or ""))).split())
def legal_path(url):
    u=urllib.parse.urlsplit(url)
    if (u.scheme not in ("http","https") or u.hostname!="creativecommons.org"
            or u.username or u.password or u.port not in (None,443,80)):
        raise ValueError("UNTRUSTED_LICENSE_HOST")
    return u.path.rstrip("/").lower()
def checked(url,allowed):
    u=urllib.parse.urlsplit(url or "")
    if (u.scheme!="https" or u.hostname not in allowed or u.port not in (None,443)
            or u.username or u.password):
        raise ValueError("UNTRUSTED_MEDIA_HOST_OR_REDIRECT")
    return url

class BoundedClient:
    def __init__(self):self.last=0.0;self.rate_limits=0;self.total_bytes=0
    def fetch(self,url,max_bytes,hosts):
        if self.rate_limits>=2:raise RuntimeError("PAUSED_AFTER_TWO_COMMONS_429")
        checked(url,hosts)
        wait=6-(time.monotonic()-self.last) if self.last else 0
        if wait>0:time.sleep(wait)
        self.last=time.monotonic()
        req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT,"Accept":"*/*"})
        try:
            with urllib.request.urlopen(req,timeout=50) as res:
                checked(res.geturl(),hosts)
                buf=res.read(max_bytes+1)
        except urllib.error.HTTPError as err:
            if err.code==429:self.rate_limits+=1
            raise
        if len(buf)>max_bytes:raise ValueError("SOURCE_RESPONSE_EXCEEDS_FILE_CAP")
        return buf

def main():
    plan=read(MANIFEST)
    assert plan["schema"]=="AO_SACRED_ATLAS_PORTED_FIVE_CC_LICENCE_REFERENCES_V1"
    assert plan["status"]=="RESEARCH_ONLY_NO_PUBLICATION"
    assert len(plan["rows"])==5 and len({x["place_id"] for x in plan["rows"]})==5
    geo=read(PLACES);decisions=read(DECISIONS)["decisions"]
    covers=read(COVERS)["items"];gallery=read(GALLERY)["items"]
    assert len(geo["places"])==530 and len(covers)>=379 and len(gallery)==42
    existing={x["place_id"] for x in covers}
    known_hashes={x.get("source_sha1") for x in covers+gallery}
    sites={p["place_id"]:p for p in geo["places"]}
    client=BoundedClient()
    records=[]
    REPORT.parent.mkdir(parents=True,exist_ok=True)
    PREVIEWS.mkdir(parents=True,exist_ok=True)
    for row in plan["rows"]:
        pid=row["place_id"];title=row["original_first_choice"]
        assert pid in sites and pid not in existing
        assert decisions[pid]["files"][0]==title
        assert sites[pid]["photo_editorial"]["cover_commons_file"]==title
        assert sites[pid]["photo_editorial"]["decision"]=="SELECTED"
        assert row["expected_original_sha1"] not in known_hashes
        assert not row["publication_authorized"]
        expected=legal_path(row["original_commons_deed_link"])
        assert expected.endswith("/deed.en") and legal_path(row["independently_located_country_specific_cc_legal_code"]).replace("/legalcode.hu","").replace("/legalcode","")==expected.removesuffix("/deed.en")
        entry={"place_id":pid,"source_title":title,"expected_sha1":row["expected_original_sha1"],"status":"NOT_CHECKED",
               "publication_authorized":False,"original_verified":False,"editorial_approved":False}
        records.append(entry)
        if client.rate_limits>=2:
            entry["status"]="PAUSED_AFTER_TWO_COMMONS_429"
            continue
        try:
            args=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2","titles":title,
                "prop":"imageinfo|revisions","iiprop":"url|size|sha1|mime|extmetadata",
                "rvprop":"ids|content","rvslots":"main","rvlimit":1})
            pageinfo=json.loads(client.fetch(API+"?"+args,MAX_METADATA,{"commons.wikimedia.org"}))
            pages=pageinfo.get("query",{}).get("pages",[])
            if len(pages)!=1 or pages[0].get("title")!=title or not pages[0].get("imageinfo"):
                raise ValueError("COMMONS_SOURCE_TITLE_MISSING_OR_CHANGED")
            page=pages[0];info=page["imageinfo"][0]
            sha=info.get("sha1");bytes_expected=int(info.get("size") or 0)
            w=int(info.get("width") or 0);h=int(info.get("height") or 0)
            if sha!=row["expected_original_sha1"] or [w,h]!=row["expected_original_dimensions"]:
                raise ValueError("SOURCE_ORIGINAL_SHA1_OR_DIMENSIONS_DIFFER")
            if (info.get("mime")!="image/jpeg" or min(w,h)<650 or w*h>MAX_PIXELS
                    or bytes_expected<1000 or bytes_expected>MAX_FILE
                    or client.total_bytes+bytes_expected>MAX_BATCH):
                raise ValueError("SOURCE_FORMAT_BYTE_OR_PIXEL_CAP")
            ext=info.get("extmetadata") or {}
            field=lambda key:clean((ext.get(key) or {}).get("value"))
            credit=field("Artist")
            licence_name=field("LicenseShortName")
            licence_url=field("LicenseUrl")
            if not credit or len(credit)>500 or row["photographer"].casefold() not in credit.casefold():
                raise ValueError("SOURCE_AUTHOR_MISSING_OR_DIFFERENT")
            # Preserve the exact original ported country/version. A generic
            # unported legal-code path does not satisfy a regional CC selection.
            license_canon=legal_path(licence_url)
            accepted={expected,expected.removesuffix("/deed.en"),
                      expected.removesuffix("/deed.en")+"/deed",
                      expected.removesuffix("/deed.en")+"/deed.en"}
            if license_canon not in accepted:
                raise ValueError("CURRENT_CC_LICENSE_IS_NOT_EXACT_ORIGINAL_PORTED_CODE")
            short=re.sub(r"[^a-z0-9]","",licence_name.lower())
            expected_short=re.sub(r"[^a-z0-9]","",row["photo_license_claim"].lower())
            if not (short==expected_short or short==expected_short+expected.removesuffix("/deed.en").split("/")[-1]):
                raise ValueError("CURRENT_LICENSE_LABEL_CHANGED")
            revision=(page.get("revisions") or [{}])[0]
            raw=str(revision.get("slots",{}).get("main",{}).get("content")
                    or revision.get("content") or "")
            if re.search(r"\{\{\s*(?:copyvio|delete|no permission|fop-|derivative|artwork)\b",raw,re.I):
                raise ValueError("SOURCE_DESCRIPTION_COPYRIGHT_WARNING")
            original=client.fetch(info.get("url"),MAX_FILE,{"upload.wikimedia.org"})
            if len(original)!=bytes_expected or hashlib.sha1(original).hexdigest()!=sha:
                raise ValueError("ORIGINAL_FILE_SHA1_OR_SIZE_INVALID")
            client.total_bytes+=len(original)
            with Image.open(io.BytesIO(original)) as pic:
                if pic.format not in ("JPEG","MPO"):raise ValueError("NOT_JPEG_OR_MPO_ORIGINAL")
                rotated=ImageOps.exif_transpose(pic)
                if (w,h) not in (pic.size,rotated.size):raise ValueError("DECODED_PIXELS_DIFFER_FROM_SOURCE")
                im=rotated.convert("RGB")
            im.thumbnail((1280,1280),Image.Resampling.LANCZOS)
            webp=io.BytesIO();im.save(webp,format="WEBP",quality=84,method=6)
            data=webp.getvalue()
            if len(data)<3000 or data[:4]!=b"RIFF" or data[8:12]!=b"WEBP":
                raise ValueError("INVALID_REVIEW_WEBP")
            filename=hashlib.sha256((pid+"\0"+sha).encode()).hexdigest()[:20]+".webp"
            out=PREVIEWS/filename
            assert not out.exists(),"Research preview must not overwrite another preview"
            out.write_bytes(data)
            entry.update({"status":"SOURCE_BYTES_VERIFIED_REVIEW_ONLY","original_verified":True,
                "current_source_rev_id":revision.get("revid"),
                "current_license_name":licence_name,"current_license_url":licence_url,
                "photographer":credit,"source_bytes":len(original),
                "original_sha256":hashlib.sha256(original).hexdigest(),
                "preview_file":str(out),"preview_sha256":hashlib.sha256(data).hexdigest(),
                "source_dimensions":[w,h],"preview_dimensions":list(im.size),
                "manual_gates":["EXACT_PHYSICAL_SITE_AND_MOBILE_CROP",
                                "UNDERLYING_ARTWORK_ARCHITECTURAL_RIGHTS",
                                "ATTRIBUTION_SHAREALIKE_AND_PUBLICATION_APPROVAL"]})
        except Exception as ex:
            entry.update({"status":"HOLD_"+type(ex).__name__.upper(),
                "error":str(ex)[:250]})
        print("PORTED_CC_ORIGINAL",json.dumps({"place_id":pid,"status":entry["status"]},ensure_ascii=False),flush=True)
    assert len(records)==5
    report={"schema":"AO_SACRED_ATLAS_PORTED_FIVE_ORIGINAL_BYTE_RESEARCH_V1",
        "scope":"READ_ONLY_NO_PUBLISHED_IMAGE","reviewed":5,
        "verified_originals":sum(i["original_verified"] for i in records),
        "published":0,"original_bytes_total":client.total_bytes,
        "http_429_count":client.rate_limits,
        "status_counts":dict(Counter(x["status"] for x in records)),
        "rows":records}
    REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("PORTED_CC_SUMMARY",json.dumps({k:report[k] for k in ("reviewed","verified_originals","published","http_429_count")}),flush=True)

if __name__=="__main__":main()
