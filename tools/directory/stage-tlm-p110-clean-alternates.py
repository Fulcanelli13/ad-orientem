#!/usr/bin/env python3
"""P110: acquire two exact-site Commons alternate originals; preserve research-only gates."""
import hashlib, html, io, json, pathlib, re, time
from urllib.parse import unquote, urlencode, urlsplit
from urllib.request import Request, urlopen
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT=pathlib.Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/directory/research/tlm-p110-clean-alternates-input-20261112.v1.json"
AUDIT=ROOT/"data/directory/research/tlm-p110-clean-alternates-stage-20261112.v1.json"
PREVIEW=ROOT/"assets/staged/directory-photo-p110-20261112/p110-mobile-contact.jpg"
AGENT="AdOrientemPublicChurchImages/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
MAX=25*1024*1024

def retrieve(url,hostname,limit=MAX):
    parsed=urlsplit(url)
    if parsed.scheme!="https" or parsed.hostname!=hostname:
        raise ValueError("untrusted source host")
    last=None
    for attempt in range(3):
        try:
            request=Request(url,headers={"User-Agent":AGENT,"Accept-Encoding":"identity"})
            with urlopen(request,timeout=45) as handle:
                if urlsplit(handle.geturl()).hostname!=hostname:
                    raise ValueError("unexpected redirect host")
                if int(handle.headers.get("Content-Length",0))>limit:
                    raise ValueError("source too large")
                value=handle.read(limit+1)
            if not 0<len(value)<=limit:
                raise ValueError("invalid data length")
            return value
        except Exception as error:
            last=error
            if attempt<2: time.sleep(4*(attempt+1))
    raise RuntimeError("remote fetch failed: "+str(last))

def clean(v):
    return html.unescape(re.sub("<[^>]*>","",str(v or ""))).strip()
def norm(v):
    return re.sub("[^a-z0-9]","",str(v or "").lower())

def acquire(entry,site_ids,previously_approved,linked_ids):
    anchor=entry["cl2_anchor"]
    venue=entry["venue_id"]
    if not re.fullmatch(r"RG-[A-Z0-9-]+",anchor):
        raise ValueError("noncanonical anchor")
    if site_ids.get(anchor,[None])[0]!=venue or venue in previously_approved or venue in linked_ids:
        raise ValueError("source identity collision")
    if entry["stage_path"]!=f"assets/staged/directory-photo-p110-20261112/{anchor}-alternate.webp":
        raise ValueError("not a research-only path")
    if not entry["first_party_witness"].startswith("https://"):
        raise ValueError("missing exact-site first-party witness")
    source=urlsplit(entry["source_url"])
    if source.scheme!="https" or source.hostname!="commons.wikimedia.org" or not source.path.startswith("/wiki/File:"):
        raise ValueError("unsafe Commons file link")
    title=unquote(source.path.removeprefix("/wiki/")).replace("_"," ")
    api="https://commons.wikimedia.org/w/api.php?"+urlencode({
        "action":"query","format":"json","formatversion":2,"prop":"imageinfo",
        "iiprop":"url|sha1|size|mime|extmetadata","titles":title
    })
    pages=json.loads(retrieve(api,"commons.wikimedia.org",2_000_000))["query"]["pages"]
    if len(pages)!=1 or not pages[0].get("imageinfo"):
        raise ValueError("Commons exact file missing")
    info=pages[0]["imageinfo"][0]
    metadata=info.get("extmetadata") or {}
    source_lic=clean((metadata.get("LicenseShortName") or {}).get("value"))
    author=clean((metadata.get("Artist") or {}).get("value"))
    # Commons returns "CC0" for the 1.0 waiver; other CC grants retain their version.
    source_license_matches = (norm(source_lic)=="cc0" if entry["license"]=="CC0-1.0"
                              else norm(entry["license"])==norm(source_lic))
    if not source_license_matches:
        raise ValueError("source licence mismatch: "+source_lic)
    if norm(entry["expected_creator"]) not in norm(author):
        raise ValueError("source creator mismatch: "+author)
    if info["mime"]!="image/jpeg":
        raise ValueError("unexpected source MIME")
    if info["size"]>MAX:
        raise ValueError("source size exceeded")
    original=retrieve(info["url"],"upload.wikimedia.org")
    source_sha=hashlib.sha1(original).hexdigest()
    if source_sha!=info["sha1"].lower() or len(original)!=info["size"]:
        raise ValueError("downloaded original checksum mismatch")
    with Image.open(io.BytesIO(original)) as pic: pic.verify()
    with Image.open(io.BytesIO(original)) as pic:
        if pic.width*pic.height>80_000_000 or pic.width<800 or pic.height<800:
            raise ValueError("invalid source dimensions")
        frame=ImageOps.exif_transpose(pic).convert("RGB")
        original_dimensions=list(frame.size)
        frame.thumbnail((1600,1600),Image.Resampling.LANCZOS)
        new_dimensions=list(frame.size)
        out=io.BytesIO()
        frame.save(out,"WEBP",quality=83,method=5)
        data=out.getvalue()
    if data[:4]!=b"RIFF" or data[8:12]!=b"WEBP":
        raise ValueError("WebP encoding invalid")
    destination=ROOT/entry["stage_path"]
    destination.parent.mkdir(parents=True,exist_ok=True)
    if destination.exists() and hashlib.sha256(destination.read_bytes()).digest()!=hashlib.sha256(data).digest():
        raise ValueError("previous staging binary would be overwritten")
    destination.write_bytes(data)
    return {
      "cl2_anchor":anchor,"venue_id":venue,"status":"STAGED_NOT_APPROVED",
      "source_url":entry["source_url"],"first_party_witness":entry["first_party_witness"],
      "source_original_sha1":source_sha,"original_file_bytes":len(original),
      "source_author":author,"verified_credit":entry["expected_creator"],
      "source_licence":source_lic,"license":entry["license"],"license_url":entry["license_url"],
      "original_dimensions":original_dimensions,"width":new_dimensions[0],"height":new_dimensions[1],
      "staged_asset_path":entry["stage_path"],"derived_sha256":hashlib.sha256(data).hexdigest(),
      "visual_review_required":True,"rights_metadata_verified":True,"site_anchor_matched":True,
      "publication_approved":False,"crop_reviewed":False
    }

def contact_sheet(records):
    w,h=820,1100
    canvas=Image.new("RGB",(w,h),"#f5f5ef")
    d=ImageDraw.Draw(canvas)
    for column,record in enumerate(records):
        x=15+column*405
        d.text((x,10),"Blandford Forum" if column==0 else "Oxford",fill="#18242a")
        with Image.open(ROOT/record["staged_asset_path"]) as pic:
            for i,(vw,vh,top) in enumerate(((320,235,55),(390,330,510))):
                d.text((x,top-20),f"{vw}px simulated photo area",fill="#35454f")
                pic2=pic.copy();pic2.thumbnail((vw,vh),Image.Resampling.LANCZOS)
                outer=Image.new("RGB",(vw,vh),"#e1e1dd")
                outer.paste(pic2,((vw-pic2.width)//2,(vh-pic2.height)//2))
                canvas.paste(outer,(x,top))
                d.rectangle((x,top,x+vw-1,top+vh-1),outline="#75848b",width=1)
        d.text((x,880),record["cl2_anchor"],fill="#18242a")
        d.text((x,910),record["verified_credit"]+" / "+record["license"],fill="#18242a")
    PREVIEW.parent.mkdir(parents=True,exist_ok=True)
    canvas.save(PREVIEW,"JPEG",quality=88)

def main():
    doc=json.loads(INPUT.read_text(encoding="utf8"))
    if doc["schema"]!="AO_TLM_P110_TWO_CLEAN_COMMONS_ALTERNATIVES_INPUT_V1" or len(doc["candidates"])!=2 or doc["publication_approved"]:
        raise ValueError("bad P110 input")
    physical=json.loads((ROOT/"data/directory/generated/cl2-physical-site-index.v1.json").read_text(encoding="utf8"))
    index={r[0]:r[1] for r in physical["records"]}
    approved=json.loads((ROOT/"data/directory/approved-venue-media.v1.json").read_text(encoding="utf8"))
    existing={r["venue_id"] for r in approved["items"]}
    links=json.loads((ROOT/"data/geography/seed-registry.v1.json").read_text(encoding="utf8"))
    linked={r["venue_id"] for r in links["directoryPlaceLinks"]}
    records=[]
    for row in doc["candidates"]:
        record=acquire(row,index,existing,linked)
        records.append(record)
        print("P110_ORIGINAL_SHA1_AND_RIGHTS_VERIFIED",record["cl2_anchor"],record["derived_sha256"],flush=True)
        time.sleep(1)
    contact_sheet(records)
    result={
      "schema":"AO_TLM_P110_TWO_CLEAN_COMMONS_ALTERNATES_STAGING_V1",
      "as_of":"2026-11-12","status":"RESEARCH_SOURCE_VERIFIED_NOT_PUBLIC",
      "summary":{"candidate_count":2,"verified_source_originals":2,"sha1_matches":2,"licence_creator_matches":2,"approved":0,"published":0},
      "records":records,
      "contact_sheet_path":"assets/staged/directory-photo-p110-20261112/p110-mobile-contact.jpg",
      "notice":"Source and binary identity verified; manual exact-subject and full-frame EN/FR card composition must still pass before promotion"
    }
    AUDIT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("P110_TWO_COMMONS_SOURCES_STAGED_NO_PRODUCTION_APPROVAL",flush=True)

if __name__=="__main__": main()
