#!/usr/bin/env python3
"""Strict, bounded acquisition of eleven PREVIOUSLY selected Commons PD-self photos.

Read frozen original rank-1 selections and previous read-only rights audit. Check
Commons title/revision, PD-self author grant, current public-domain terms, original
SHA1 and actual bytes, exact Place identity and validated full-frame WebP.
Holds are never substituted or silently treated as publication approval.
"""
from __future__ import annotations
import hashlib
import html
import io
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
M=ROOT/"data/geography/research/sacred-atlas-round11-pd-self-selected-cover-manifest-20261104.v1.json"
E=ROOT/"data/geography/research/sacred-atlas-round11-pd-self-source-evidence-20261104.v1.json"
C=ROOT/"data/geography/approved-place-media.v1.json"
G=ROOT/"data/geography/approved-place-gallery.v1.json"
D=ROOT/"data/geography/research/photo-finder-20261030/decisions.json"
P=ROOT/"data/geography/seed-registry.v1.json"
BASE_URL="https://commons.wikimedia.org/w/api.php"
PD_MARK="https://creativecommons.org/publicdomain/mark/1.0/"
AGENT="AdOrientemPDSourceCheck/2026-11-04 (single-use, rate-limited; exact approved sites)"
PD_SELF=re.compile(r"\{\{\s*PD-self\s*(?:\||\}\})",re.I)
SUSPECT=re.compile(r"\{\{\s*(?:Copyvio|No permission|FoP-|Derivative|Artwork|Delete|Do not move to Commons)\b",re.I)
MAX_ORIGINAL=32_000_000
MAX_PIXELS=65_000_000
Image.MAX_IMAGE_PIXELS=MAX_PIXELS

def load(path):return json.loads(path.read_text(encoding="utf8"))
def digest(x):
    return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode("utf8")).hexdigest()
def clean(s):
    return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(s or ""))).split())
def checked(url,hosts):
    u=urllib.parse.urlsplit(str(url or ""))
    if (u.scheme!="https" or u.hostname not in hosts or u.port not in (None,443)
            or u.username or u.password):
        raise ValueError("Unapproved network source or redirect")
    return url

def main():
    manifest=load(M)
    assert manifest["schema"]=="AO_SACRED_ATLAS_ROUND11_PD_SELF_ORIGINAL_COVERS_V1"
    rows=manifest["rows"]
    assert len(rows)==11 and len({x["place_id"] for x in rows})==11
    before=load(C);gallery=load(G);decisions=load(D)["decisions"];places=load(P)
    assert len(before["items"])==manifest["baseline"]["approved_covers"]==378
    assert len(gallery["items"])==manifest["baseline"]["gallery_items"]==42
    assert len(places["places"])==manifest["baseline"]["canonical_places"]==530
    existing_ids={x["place_id"] for x in before["items"]}
    existing_sha={x.get("source_sha1") for x in before["items"]}
    place_by_id={x["place_id"]:x for x in places["places"]}
    for item in rows:
        pid=item["place_id"];title=item["commons_file"]
        assert pid in place_by_id and pid not in existing_ids, "Cannot replace a cover"
        assert decisions[pid]["files"][0]==title, "Selection differs from prior rank-1 editorial approval"
        assert place_by_id[pid]["photo_editorial"]["cover_commons_file"]==title
        assert item["original_sha1"] not in existing_sha, "Source already published elsewhere"
        assert item["rights_template"]=="PD-self" and item["licence_marker"]=="PUBLIC_DOMAIN"
        assert item["expected_revision_id"]>0
        assert re.fullmatch(r"[0-9a-f]{40}",item["original_sha1"])
    last=[0.0];rate_limits=[0]
    def fetch(url,limit):
        if rate_limits[0]>=2:
            raise RuntimeError("PAUSED_AFTER_TWO_HTTP_429_NO_BYPASS")
        checked(url,{"commons.wikimedia.org","upload.wikimedia.org"})
        waited=time.monotonic()-last[0]
        if last[0] and waited<6:time.sleep(6-waited)
        last[0]=time.monotonic()
        req=urllib.request.Request(url,headers={"User-Agent":AGENT,"Accept":"*/*"})
        try:
            with urllib.request.urlopen(req,timeout=50) as response:
                checked(response.geturl(),{"commons.wikimedia.org","upload.wikimedia.org"})
                body=response.read(limit+1)
                if len(body)>limit:raise ValueError("Oversized original or metadata")
                return body
        except urllib.error.HTTPError as exc:
            if exc.code==429:rate_limits[0]+=1
            raise
    new=[];published=[];held=[]
    for item in rows:
        pid=item["place_id"];title=item["commons_file"]
        try:
            args=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",
                "titles":title,"prop":"imageinfo|revisions",
                "iiprop":"url|size|sha1|mime|extmetadata",
                "rvprop":"ids|content","rvslots":"main","rvlimit":1})
            payload=json.loads(fetch(BASE_URL+"?"+args,2_000_000))
            pages=payload.get("query",{}).get("pages",[])
            if len(pages)!=1 or pages[0].get("title")!=title or not pages[0].get("imageinfo"):
                raise ValueError("Exact reviewed Commons file unavailable or redirected")
            page=pages[0];info=page["imageinfo"][0]
            rev=(page.get("revisions") or [{}])[0]
            if rev.get("revid")!=item["expected_revision_id"]:
                raise ValueError("Commons source-description revision changed after audit")
            wikicode=str(rev.get("slots",{}).get("main",{}).get("content") or rev.get("content") or "")
            if not PD_SELF.search(wikicode) or SUSPECT.search(wikicode):
                raise ValueError("Current source lacks intact PD-self declaration or contains copyright warning")
            ext=info.get("extmetadata") or {}
            get=lambda name:clean((ext.get(name) or {}).get("value"))
            author=get("Artist")
            if not author or len(author)>500 or author.casefold().strip(" .") in (
                "unknown","unknown author","anonymous","own work","unspecified"):
                raise ValueError("No current named author for PD-self declaration")
            if get("LicenseShortName").casefold()!="public domain" or get("UsageTerms").casefold()!="public domain":
                raise ValueError("Current Commons public-domain metadata is absent or inconsistent")
            w,h=int(info.get("width") or 0),int(info.get("height") or 0)
            length=int(info.get("size") or 0)
            if (info.get("sha1")!=item["original_sha1"] or
                    [w,h]!=item["expected_dimensions"] or
                    length!=item["expected_original_bytes"] or
                    min(w,h)<650 or w*h>MAX_PIXELS or
                    length<1000 or length>MAX_ORIGINAL or
                    info.get("mime") not in ("image/jpeg","image/png","image/webp")):
                raise ValueError("Original SHA1, MIME, dimensions or source size changed/outside bounds")
            source_url=checked(info.get("url"),{"upload.wikimedia.org"})
            original=fetch(source_url,MAX_ORIGINAL)
            if len(original)!=length or hashlib.sha1(original).hexdigest()!=item["original_sha1"]:
                raise ValueError("Actual original bytes differ from Commons SHA1")
            with Image.open(io.BytesIO(original)) as photo:
                valid={"image/jpeg":("JPEG","MPO"),"image/png":("PNG",),"image/webp":("WEBP",)}
                if photo.format not in valid[info["mime"]]:
                    raise ValueError("Decoded file type differs from MIME")
                fixed=ImageOps.exif_transpose(photo)
                if (w,h) not in (photo.size,fixed.size):
                    raise ValueError("Decoded pixels do not match source dimensions")
                final=fixed.convert("RGB")
            final.thumbnail((1280,1280),Image.Resampling.LANCZOS)
            out=io.BytesIO()
            final.save(out,format="WEBP",quality=84,method=6)
            image=out.getvalue()
            if len(image)<3000 or image[:4]!=b"RIFF" or image[8:12]!=b"WEBP":
                raise ValueError("Invalid converted full-frame WebP")
            part=hashlib.sha256((pid+"\0"+title).encode("utf8")).hexdigest()[:22]
            rel="assets/approved/place-media/pf-"+part+".webp"
            target=ROOT/rel
            if target.exists():raise ValueError("Never overwrite existing photograph")
            target.parent.mkdir(parents=True,exist_ok=True)
            target.write_bytes(image)
            item_meta={
                "place_id":pid,"status":"APPROVED","asset_path":rel,
                "source_url":item["source_page"],"source_sha1":item["original_sha1"],
                "derivative_sha256":hashlib.sha256(image).hexdigest(),
                "credit":author,"license":"PUBLIC_DOMAIN","license_url":PD_MARK,
                "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
                "source_place_ref":"PHOTO_FINDER_2026-10-30_PD_SELF_R1",
                "width":final.width,"height":final.height,
                "orientation":"portrait" if final.height>final.width else "landscape",
                "alt_en":"Photograph of "+item["place_name"],
                "alt_fr":"Photographie de "+item["place_name"],
                "changes_en":"Full-frame WebP, EXIF orientation normalized; no crop or recolouring.",
                "changes_fr":"Image entière en WebP, orientation EXIF corrigée ; ni recadrage ni retouche.",
                "reviewed_at":"2026-11-04",
                "review_method":"Previous editorial first-choice Photo Finder selection; exact 2026-11-04 Commons PD-self source revision, named artist, original source bytes and WebP digest independently verified."
            }
            new.append(item_meta)
            published.append({"place_id":pid,"asset_path":rel,"source_sha1":item["original_sha1"],
                "source_revision_id":rev["revid"],"rights_template":"PD-self",
                "current_artist":author,"source_url":item["source_page"],
                "license":"PUBLIC_DOMAIN","license_url":PD_MARK,
                "derivative_sha256":item_meta["derivative_sha256"],
                "derivative_size":[final.width,final.height]})
        except Exception as error:
            held.append({"place_id":pid,"file":title,"reason":type(error).__name__+": "+str(error)[:240]})
        print("ROUND11_PD_SELF",json.dumps({"place_id":pid,"status":"PUBLISHED" if new and new[-1]["place_id"]==pid else "HELD"},ensure_ascii=False),flush=True)
    assert len(published)+len(held)==11
    assert len({x["place_id"] for x in new})==len(new)
    manifest_original_items=list(before["items"])
    previous=digest(before["items"])
    galleryhash=digest(gallery)
    if new:
        before["items"].extend(new)
        before["items"].sort(key=lambda i:i["place_id"])
        before["version"]="1.6.16"
        C.write_text(json.dumps(before,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    assert digest(load(G))==galleryhash,"Gallery mutated"
    assert len(load(C)["items"])==378+len(new)
    assert digest(sorted([x for x in load(C)["items"] if x["place_id"] not in {n["place_id"] for n in new}],key=lambda x:x["place_id"]))==digest(sorted([x for x in manifest_original_items],key=lambda x:x["place_id"])),"Original approved covers changed"
    E.write_text(json.dumps({"schema":"AO_SACRED_ATLAS_ROUND11_PD_SELF_SOURCE_EVIDENCE_V1",
        "date":"2026-11-04","scope":"SACRED_ATLAS_ONLY","reviewed":11,
        "before":{"covers":378,"missing":152,"gallery":42,"prior_covers_sha256":previous,"gallery_sha256":galleryhash},
        "after":{"covers":378+len(new),"missing":152-len(new),"gallery":42},
        "published_count":len(published),"held_count":len(held),
        "published":published,"holds":held,
        "previous_editorial_choices_unchanged":True,
        "current_exact_sha1_original_bytes_pd_self_and_revision_verified_for_published":True,
        "gallery_unchanged":True,"tlm_unchanged":True},indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("SACRED_ATLAS_ROUND11_SUMMARY",json.dumps({"reviewed":11,"published":len(new),
        "held":len(held),"covers_after":378+len(new),"gallery":42},ensure_ascii=False),flush=True)
    if not new:raise RuntimeError("No exact PD-self original verified; no covers approved")

if __name__=="__main__":main()
