#!/usr/bin/env python3
"""Review ONLY: fetch exact Wikimedia files, inspect licensing/identity, make previews.
Never publishes image assets into approved-place-media.v1.json.
"""
from __future__ import annotations
import hashlib, html, io, json, os, re, sys, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
RESEARCH = ROOT / os.environ.get("SHRINE_PHOTO_MANIFEST","data/geography/research/shrine-seven-photo-recovery-20261021.v1.json")
OUT = ROOT / os.environ.get("SHRINE_PHOTO_OUT","artifacts/shrine-photo-source-review")
OUT.mkdir(parents=True, exist_ok=True)
UA = "AdOrientemSacredGeography/1.0 (research project: https://github.com/Fulcanelli13/ad-orientem)"
API = "https://commons.wikimedia.org/w/api.php"
MAX_BYTES = 30_000_000
def get(url: str) -> bytes:
    request = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/json,image/jpeg,image/png,image/webp,*/*"})
    with urllib.request.urlopen(request, timeout=45) as response:
        if response.url.startswith("https://") is False:
            raise ValueError("Insecure redirect")
        mime = response.headers.get("content-type", "")
        n = response.headers.get("content-length", "")
        if n and int(n) > MAX_BYTES: raise ValueError("Image too large")
        data = response.read(MAX_BYTES + 1)
        if len(data) > MAX_BYTES: raise ValueError("Image too large after download")
        return data
def metadata(title: str) -> dict:
    q = urllib.parse.urlencode({"action":"query","titles":title,"prop":"imageinfo",
        "iiprop":"url|sha1|size|mime|extmetadata","format":"json","formatversion":2})
    payload = json.loads(get(API+"?"+q))
    p = (payload.get("query", {}).get("pages") or [{}])[0]
    if p.get("missing") is True or not p.get("imageinfo"): raise ValueError("Missing Commons file")
    if p.get("title") != title: raise ValueError("Wikimedia title changed: "+str(p.get("title")))
    return p["imageinfo"][0]
def plain(t: str) -> str: return re.sub(r"<[^>]*>", "", html.unescape(t or "")).strip()
def check_license(c: dict, info: dict) -> dict:
    ext=info.get("extmetadata") or {}
    short=plain(ext.get("LicenseShortName",{}).get("value",""))
    license_link=html.unescape(ext.get("LicenseUrl",{}).get("value",""))
    usage=plain(ext.get("UsageTerms",{}).get("value",""))
    expected=c["license"]
    if expected=="PUBLIC_DOMAIN":
        if not ("public domain" in (short+" "+usage).lower() or "cc0" in (short+" "+usage).lower()):
            raise ValueError("Commons metadata not explicitly public-domain")
    else:
        tag=expected.replace("CC-","CC ").replace("-"," ")
        # Wikimedia normalizes names differently, but the version and ShareAlike
        # attribution must survive even when a multi-licence file offers choices.
        ver=expected.split("-")[-1]
        if ver not in (short+" "+license_link+" "+usage):
            raise ValueError("Commons licence/version mismatch: "+short)
        if "by-sa" not in license_link.lower() and "share alike" not in short.lower() and "sharealike" not in short.lower():
            raise ValueError("Commons attribution/share-alike mismatch")
    return {"short":short,"license_url":license_link,"usage":usage,"artist":plain(ext.get("Artist",{}).get("value",""))[:400]}
def stage(c: dict) -> dict:
    title=c["commons_title"]
    info=metadata(title)
    licence=check_license(c,info)
    url=info.get("url","")
    parsed=urllib.parse.urlparse(url)
    if parsed.scheme!="https" or parsed.hostname not in ("upload.wikimedia.org","commons.wikimedia.org"):
        raise ValueError("Source is not a Wikimedia-hosted original")
    if info.get("mime") not in ("image/jpeg","image/png","image/webp"):
        raise ValueError("Unexpected MIME "+str(info.get("mime")))
    raw=get(url)
    digest=hashlib.sha1(raw).hexdigest()
    if digest!=info.get("sha1"): raise ValueError("Original SHA1 differs from Wikimedia")
    if c.get("original_sha1") and digest!=c["original_sha1"]: raise ValueError("Original SHA1 differs from frozen candidate evidence")
    img=Image.open(io.BytesIO(raw));img.load()
    img=ImageOps.exif_transpose(img).convert("RGB")
    initial=(img.width,img.height)
    img.thumbnail((1280,1280),Image.Resampling.LANCZOS)
    name=c["place_id"].replace("place:","").replace(":","-")+".webp"
    target=OUT/name
    img.save(target,"WEBP",quality=84,method=6)
    derived=target.read_bytes()
    return {"place_id":c["place_id"],"commons_title":title,"source_url":c["source_url"],
        "url":url,"original_sha1":digest,"original_size":len(raw),
        "original_dimensions":initial,"candidate_dimensions":(img.width,img.height),
        "candidate_filename":name,"derivative_sha256":hashlib.sha256(derived).hexdigest(),
        "derivative_bytes":len(derived),"rights":licence,"declared_license":c["license"],
        "credit":c["credit"],"alt_en":c["alt_en"],"alt_fr":c["alt_fr"],
        "image_state":"STAGING_ONLY_PENDING_ORIGINAL_SITE_VISUAL_REVIEW"}
def contact_sheet(rows: list[dict]):
    images=[]
    for row in rows:
        path=OUT/row["candidate_filename"]
        with Image.open(path) as im:
            image=ImageOps.contain(im.convert("RGB"),(600,340),Image.Resampling.LANCZOS)
            images.append((row,image.copy()))
    if not images:return
    cardw,cardh=630,410
    sheet=Image.new("RGB",(cardw*2,cardh*((len(images)+1)//2)),"#e5e5e5")
    draw=ImageDraw.Draw(sheet)
    for i,(r,img) in enumerate(images):
        x=(i%2)*cardw;y=(i//2)*cardh
        sheet.paste(img,(x+(cardw-img.width)//2,y+8+(340-img.height)//2))
        label=r["place_id"]+" | "+r["declared_license"]
        draw.text((x+12,y+360),label,fill="#171717")
        draw.text((x+12,y+380),"STAGING ONLY -- not approved for app",fill="#8c2222")
    sheet.save(OUT/"photo-source-contact-sheet.jpg",quality=87)
def main():
    data=json.loads(RESEARCH.read_text(encoding="utf8"))
    reviewed=[];errors=[]
    for c in data["candidates"]:
        try:
            r=stage(c);reviewed.append(r)
            print("STAGED",r["place_id"],r["candidate_dimensions"],r["declared_license"],flush=True)
        except Exception as e:
            errors.append({"place_id":c["place_id"],"error":str(e)})
            print("HOLD",c["place_id"],str(e),file=sys.stderr,flush=True)
        time.sleep(1)
    contact_sheet(reviewed)
    report={"schema":"AO_SHRINE_PHOTO_STAGING_REVIEW_V1",
        "status":"NOT_APPROVED_NOT_APP_VISIBLE","staged":reviewed,"held":errors,
        "remaining_held":data["held"],
        "instruction":"Manual exact-site image visual review and copyright compatibility review are required before adding any image to approved-place-media."}
    (OUT/"source-validation.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print(f"Source photo staging: {len(reviewed)} passed, {len(errors)} held. Nothing published.")
    # Network blocks should not invalidate the existing unrelated editorial release;
    # images are advisory research artifacts only.
    return 0
if __name__=="__main__":sys.exit(main())
