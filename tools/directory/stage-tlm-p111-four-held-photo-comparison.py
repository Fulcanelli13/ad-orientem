#!/usr/bin/env python3
"""P111: stage exact-source Commons alternatives for four HELD Catholic churches, never publish."""
import hashlib, html, io, json, pathlib, re, time
from urllib.parse import quote, urlencode, unquote, urlsplit
from urllib.request import Request, urlopen
from PIL import Image, ImageOps, ImageDraw

ROOT=pathlib.Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/directory/research/tlm-p111-four-site-common-photo-review-input-20261112.v1.json"
OUTPUT=ROOT/"data/directory/research/tlm-p111-four-site-photo-comparison-20261112.v1.json"
ASSET=pathlib.Path("assets/staged/directory-p111-four-held-20261112")
AGENT="AdOrientemChurchPhotoEditorial/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
MAX_BYTES=26_000_000
MAX_PIXELS=80_000_000
BASE_API="https://commons.wikimedia.org/w/api.php?"
EXCLUDE_NAME=re.compile(r"(inside|interior|nave|sanctuary|altar|organ|stained[ _-]?glass|statue|font|pulpit|window|windowpane|roof|grave|chapel|doorway[ _-]?detail|bell)",re.I)

def fetch(url, hostname, limit=MAX_BYTES):
    if urlsplit(url).scheme!="https" or urlsplit(url).hostname!=hostname:
        raise ValueError("untrusted source host")
    error=None
    for attempt in range(3):
        try:
            with urlopen(Request(url,headers={"User-Agent":AGENT,"Accept-Encoding":"identity"}),timeout=40) as h:
                if urlsplit(h.geturl()).hostname!=hostname: raise ValueError("redirect host mismatch")
                if int(h.headers.get("Content-Length","0"))>limit: raise ValueError("source exceeds byte cap")
                raw=h.read(limit+1)
            if not 0<len(raw)<=limit: raise ValueError("bad length")
            return raw
        except Exception as exc:
            error=exc
            if attempt<2: time.sleep(3*(attempt+1))
    raise RuntimeError("source unavailable: "+str(error))

def api_json(params):
    return json.loads(fetch(BASE_API+urlencode({"format":"json","formatversion":2,**params}),
        "commons.wikimedia.org",2_500_000))

def clean(value):
    return html.unescape(re.sub(r"<[^>]+>","",str(value or ""))).strip()

def norm(value):
    return re.sub(r"[^a-z0-9]","",str(value or "").lower())

def allow_license(label):
    name=norm(label)
    acceptable={"cc0":"CC0-1.0","ccby20":"CC-BY-2.0","ccby30":"CC-BY-3.0",
                "ccbysa20":"CC-BY-SA-2.0","ccbysa25":"CC-BY-SA-2.5",
                "ccbysa30":"CC-BY-SA-3.0","ccby40":"CC-BY-4.0",
                "ccbysa40":"CC-BY-SA-4.0"}
    return acceptable.get(name)

def list_category(category):
    if not category.startswith("Category:"): raise ValueError("bad category")
    # Dedicated Commons category is an exact-subject discovery boundary, not carte blanche to publish.
    results=[]
    cursor=None
    for _ in range(3):
        p={"action":"query","list":"categorymembers","cmtitle":category,"cmtype":"file","cmlimit":100}
        if cursor: p["cmcontinue"]=cursor
        body=api_json(p)
        results.extend(x["title"] for x in body["query"]["categorymembers"] if x["title"].startswith("File:"))
        cursor=body.get("continue",{}).get("cmcontinue")
        if not cursor: break
    return results

def info_for(title):
    x=api_json({"action":"query","prop":"imageinfo","iiprop":"url|sha1|size|mime|extmetadata",
          "titles":title})["query"]["pages"]
    if len(x)!=1 or not x[0].get("imageinfo"): raise ValueError("no exact Commons original")
    return x[0]["imageinfo"][0]

def stage_one(site,index,title):
    info=info_for(title)
    if info.get("mime") not in ("image/jpeg","image/png"):
        raise ValueError("non-photographic MIME: "+str(info.get("mime")))
    if info.get("size",0)>MAX_BYTES:
        raise ValueError("original too large")
    meta=info.get("extmetadata",{})
    source_license=clean(meta.get("LicenseShortName",{}).get("value"))
    normalized_license=allow_license(source_license)
    if not normalized_license:
        raise ValueError("licence excluded: "+source_license)
    author=clean(meta.get("Artist",{}).get("value"))
    if not author or len(author)>500:
        raise ValueError("missing or ambiguous artist metadata")
    original=fetch(info["url"],"upload.wikimedia.org")
    sha=hashlib.sha1(original).hexdigest()
    if sha!=str(info["sha1"]).lower() or len(original)!=info["size"]:
        raise ValueError("Commons original checksum mismatch")
    with Image.open(io.BytesIO(original)) as img: img.verify()
    with Image.open(io.BytesIO(original)) as img:
        if img.width*img.height>MAX_PIXELS or min(img.size)<400:
            raise ValueError("source too small or exceeds pixel budget")
        fr=ImageOps.exif_transpose(img).convert("RGB")
        original_size=list(fr.size)
        fr.thumbnail((1600,1600),Image.Resampling.LANCZOS)
        buf=io.BytesIO()
        fr.save(buf,"WEBP",quality=83,method=5)
        deriv=buf.getvalue()
        dimensions=list(fr.size)
    if deriv[:4]!=b"RIFF" or deriv[8:12]!=b"WEBP":
        raise ValueError("bad WebP")
    path=ASSET/(site["cl2_anchor"]+"-candidate-"+str(index).zfill(2)+".webp")
    dest=ROOT/path
    dest.parent.mkdir(parents=True,exist_ok=True)
    if dest.exists() and hashlib.sha256(dest.read_bytes()).digest()!=hashlib.sha256(deriv).digest():
        raise ValueError("unapproved staged binary already exists with a different hash")
    dest.write_bytes(deriv)
    source_url="https://commons.wikimedia.org/wiki/"+quote(title.replace(" ","_"),safe=":/_(),.-'")
    license_url=("https://creativecommons.org/publicdomain/zero/1.0/" if normalized_license=="CC0-1.0"
                 else "https://creativecommons.org/licenses/"+normalized_license.lower().replace("cc-","").replace("-","/",1).replace("-","/")+"/")
    # Ensure license destination derives from an allowlisted version, not source-page HTML.
    known={
      "CC-BY-2.0":"https://creativecommons.org/licenses/by/2.0/",
      "CC-BY-3.0":"https://creativecommons.org/licenses/by/3.0/",
      "CC-BY-4.0":"https://creativecommons.org/licenses/by/4.0/",
      "CC-BY-SA-2.0":"https://creativecommons.org/licenses/by-sa/2.0/",
      "CC-BY-SA-2.5":"https://creativecommons.org/licenses/by-sa/2.5/",
      "CC-BY-SA-3.0":"https://creativecommons.org/licenses/by-sa/3.0/",
      "CC-BY-SA-4.0":"https://creativecommons.org/licenses/by-sa/4.0/",
      "CC0-1.0":"https://creativecommons.org/publicdomain/zero/1.0/"
    }
    license_url=known[normalized_license]
    return {"status":"VERIFIED_STAGED_NOT_APPROVED",
            "cl2_anchor":site["cl2_anchor"],"venue_id":site["venue_id"],
            "source_title":title,"source_url":source_url,
            "source_sha1":sha,"source_bytes":len(original),
            "credit":author,"source_license_short_name":source_license,
            "license":normalized_license,"license_url":license_url,
            "original_dimensions":original_size,"dimensions":dimensions,
            "staged_asset_path":str(path),"derivative_sha256":hashlib.sha256(deriv).hexdigest(),
            "subject_category_witness":site["category"],"first_party_site_witness":site["first_party"],
            "publication_approved":False,"image_identity_editorial_approved":False,
            "mobile_frame_editorial_approved":False}

def contact(site,records):
    successes=[r for r in records if r["status"]=="VERIFIED_STAGED_NOT_APPROVED"]
    count=len(successes)
    if not count:return None
    cellw,cellh=365,350
    cols=min(3,count)
    rows=(count+cols-1)//cols
    out=Image.new("RGB",(cols*cellw+30,rows*cellh+60),"#f7f6f2")
    draw=ImageDraw.Draw(out)
    draw.text((16,10),site["name"]+" — SOURCE CANDIDATES / NOT APPROVED",fill="#262e31")
    for i,r in enumerate(successes):
        x=15+(i%cols)*cellw
        y=45+(i//cols)*cellh
        with Image.open(ROOT/r["staged_asset_path"]) as im:
            thumb=im.copy()
            thumb.thumbnail((340,245),Image.Resampling.LANCZOS)
            fill=Image.new("RGB",(340,245),"#e5e7e5")
            fill.paste(thumb,((340-thumb.width)//2,(245-thumb.height)//2))
            out.paste(fill,(x,y))
        draw.text((x,y+253),r["source_title"][5:54],fill="#293338")
        draw.text((x,y+275),r["source_title"][54:95],fill="#293338")
        draw.text((x,y+297),r["license"]+" / "+r["credit"][:30],fill="#293338")
        draw.text((x,y+320),f'{r["dimensions"][0]} x {r["dimensions"][1]}',fill="#293338")
    path=ASSET/(site["cl2_anchor"]+"-contact.jpg")
    dest=ROOT/path
    dest.parent.mkdir(parents=True,exist_ok=True)
    out.save(dest,"JPEG",quality=90)
    return str(path)

def main():
    doc=json.loads(INPUT.read_text())
    if doc["schema"]!="AO_TLM_P111_FOUR_SITE_EXACT_COMMONS_REVIEW_INPUT_V1" or doc["publication_approved"] or len(doc["sites"])!=4:
        raise ValueError("bad nonpublication input")
    index=json.loads((ROOT/"data/directory/generated/cl2-physical-site-index.v1.json").read_text())
    src={x[0]:x[1] for x in index["records"]}
    approved=json.loads((ROOT/"data/directory/approved-venue-media.v1.json").read_text())
    if len(approved["items"])!=doc["approved_media_baseline"]:
        raise ValueError("approval registry changed")
    approved_ids={x["venue_id"] for x in approved["items"]}
    geo=json.loads((ROOT/"data/geography/seed-registry.v1.json").read_text())
    linked={x["venue_id"] for x in geo["directoryPlaceLinks"]}
    groups=[]
    for site in doc["sites"]:
        if src.get(site["cl2_anchor"])!=[site["venue_id"]]:
            raise ValueError("exact site to directory ID mismatch: "+site["cl2_anchor"])
        if site["venue_id"] in approved_ids or site["venue_id"] in linked:
            raise ValueError("already approved Place or venue image: "+site["cl2_anchor"])
        choices=list(site["file_titles"])
        if site["category"]:
            discovered=list_category(site["category"])
            if choices:
                if not set(choices).issubset(discovered):
                    raise ValueError("Seeded file absent from exact-site category: "+site["name"])
            else:
                choices=discovered
        print("P111_CATEGORY",site["name"],"TOTAL",len(choices),flush=True)
        # The exact category constrains subjects; still reject old image and clearly non-exterior titles.
        filtered=[x for x in choices if x!=site["excluded_original"] and
                  not EXCLUDE_NAME.search(x) and re.search(r"\.(jpg|jpeg|png)$",x,re.I)]
        filtered=filtered[:site["candidate_limit"]]
        if not filtered: print("P111_NO_ALTERNATES",site["name"],flush=True)
        records=[]
        for i,title in enumerate(filtered,1):
            try:
                row=stage_one(site,i,title)
                print("P111_VERIFIED",site["cl2_anchor"],title,row["derivative_sha256"],flush=True)
            except Exception as exc:
                row={"status":"HOLD_SOURCE_OR_LICENCE","source_title":title,
                     "reason":str(exc)[:350],"publication_approved":False}
                print("P111_HELD",site["cl2_anchor"],title,str(exc)[:250],flush=True)
            records.append(row)
            time.sleep(.7)
        sheet=contact(site,records)
        groups.append({"cl2_anchor":site["cl2_anchor"],"venue_id":site["venue_id"],
            "name":site["name"],"category":site["category"],
            "first_party":site["first_party"],"original_held_source":site["excluded_original"],
            "category_candidates_found":len(choices),"candidates_considered":len(records),
            "candidates_verified":sum(r["status"]=="VERIFIED_STAGED_NOT_APPROVED" for r in records),
            "contact_sheet_path":sheet,"records":records,
            "editorial_status":"VISUAL_IDENTITY_REVIEW_REQUIRED_NO_APPROVAL"})
    num=sum(g["candidates_verified"] for g in groups)
    result={"schema":"AO_TLM_P111_FOUR_SITE_ORIGINALS_AND_VISUAL_RESEARCH_V1",
            "date":"2026-11-12","status":"STAGING_ONLY_NOT_PUBLIC",
            "counts":{"venues":len(groups),"verified_candidates":num,"approved_new_covers":0,
              "remaining_holds":5,"production_covers_unchanged":25,"new_pins":0},
            "groups":groups,
            "notice":"Source-original SHA-1 and license metadata verified per candidate; exact building identity, visual quality and mobile cover editorial judgement still required before publication. Park City excluded."}
    OUTPUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
    if num==0: raise RuntimeError("No usable Commons source candidates")
    print("P111_RESEARCH_DONE",num,"VERIFIED_CANDIDATE_IMAGES; APPROVED=0",flush=True)

if __name__=="__main__": main()
