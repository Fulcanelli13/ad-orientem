#!/usr/bin/env python3
"""P90 research-only ORIGINAL two-file Commons acquisition; never publish to app.

Exactly two P89 documentary-verified church subjects. Fails closed on
changed page ID, SHA-1, licence, author, dimensions, source host or decode.
No source search, generic-title fallback, substitutions or automatic release.
"""
import hashlib, html, io, json, pathlib, re, sys, time
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

PHOTOS = [
 {"row":384,"anchor":"RG-1A015C23D5BA",
  "title":"File:St. Boniface Church (Sioux City) from SW 1.jpg",
  "pageid":17245082,"sha1":"228b098e9254bfbf2fe93d208f9be4998d909d27",
  "width":1589,"height":2329,"author":"Ammodramus","license":"CC0",
  "file":"st-boniface-sioux-city-original.jpg"},
 {"row":376,"anchor":"RG-368B7B3B5FA3",
  "title":"File:Church of St Agnes 2013.jpg",
  "pageid":26897528,"sha1":"661b34873db6f23afd5ef25ec08766e647644e4c",
  "width":1748,"height":1474,"author":"McGhiever","license":"CC BY-SA 3.0",
  "file":"st-agnes-saint-paul-original.jpg"},
]
AGENT="AdOrientemPhotoSourceVerification/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
def fetch(url,host,max_bytes):
    u=urlsplit(url)
    assert u.scheme=="https" and u.hostname==host and not u.username and not u.password and not u.fragment
    exc=None
    for attempt in range(3):
        try:
            with urlopen(Request(url,headers={"User-Agent":AGENT,"Accept-Encoding":"identity"}),timeout=30) as h:
                assert urlsplit(h.geturl()).hostname==host, "redirected off approved host"
                data=h.read(max_bytes+1)
            assert 0<len(data)<=max_bytes, "invalid or oversized transfer"
            return data
        except Exception as e:
            exc=e
            if attempt<2: time.sleep(3*(attempt+1))
    raise RuntimeError("Cannot retrieve source") from exc

def txt(value):
    return html.unescape(re.sub(r"<[^>]+>","",str(value or ""))).strip()

def main(outpath):
    out=pathlib.Path(outpath)
    assert not out.exists(), "immutable research output must not already exist"
    out.mkdir(parents=True)
    manifest=[]
    for p in PHOTOS:
        query=urlencode({"action":"query","format":"json","formatversion":"2",
          "prop":"imageinfo","iiprop":"url|sha1|size|mime|extmetadata",
          "titles":p["title"]})
        api="https://commons.wikimedia.org/w/api.php?"+query
        pages=json.loads(fetch(api,"commons.wikimedia.org",1000000))["query"]["pages"]
        assert len(pages)==1, "ambiguous source"
        page=pages[0]
        assert page.get("pageid")==p["pageid"],"wrong Commons page"
        assert page.get("title")==p["title"],"source moved/retitled"
        info=page["imageinfo"][0]
        assert info["sha1"].lower()==p["sha1"],"source revision differs from pinned original"
        assert (info["width"],info["height"])==(p["width"],p["height"]),"dimension mismatch"
        assert info["mime"]=="image/jpeg" and info["size"]<6000000
        md=info["extmetadata"]
        label=txt(md.get("LicenseShortName",{}).get("value",""))
        artist=txt(md.get("Artist",{}).get("value",""))
        attribution=txt(md.get("AttributionRequired",{}).get("value","")).lower()
        assert p["license"].lower() in label.lower(),f"licence unexpectedly changed: {label}"
        assert p["author"].lower() in artist.lower(),f"author mismatch: {artist}"
        assert (p["license"]=="CC0" or attribution=="true"),"attribution flag invalid"
        u=urlsplit(info["url"])
        assert u.scheme=="https" and u.hostname=="upload.wikimedia.org"
        data=fetch(info["url"],"upload.wikimedia.org",6000000)
        assert len(data)==info["size"],"unexpected original byte count"
        assert hashlib.sha1(data).hexdigest()==p["sha1"],"original bytes SHA-1 mismatch"
        with Image.open(io.BytesIO(data)) as im:
            im.verify()
        with Image.open(io.BytesIO(data)) as im:
            assert im.format=="JPEG" and im.size==(p["width"],p["height"])
            assert not getattr(im,"is_animated",False)
            rgb=ImageOps.exif_transpose(im).convert("RGB")
            rgb.thumbnail((1000,1000),Image.Resampling.LANCZOS)
            rgb.save(out/(p["file"].replace("-original.jpg","-quality-preview.webp")),format="WEBP",quality=85)
        (out/p["file"]).write_bytes(data)
        manifest.append({
          "review_row":p["row"],"physical_anchor_id":p["anchor"],"file_title":p["title"],
          "commons_page_id":p["pageid"],"commons_file_page":"https://commons.wikimedia.org/wiki/"+p["title"].replace(" ","_"),
          "original_source_url":info["url"],"original_sha1":p["sha1"],
          "downloaded_sha256":hashlib.sha256(data).hexdigest(),
          "bytes":len(data),"dimensions":[p["width"],p["height"]],
          "creator_source_claim":artist,"licence_source_claim":label,
          "licence_reference":txt(md.get("LicenseUrl",{}).get("value","")),
          "attribution_required_source_claim":attribution,
          "source_revision_verified":True,"image_decode_verified":True,
          "image_original_saved":p["file"],
          "preview_saved":p["file"].replace("-original.jpg","-quality-preview.webp"),
          "exact_site_documentary_correlated":True,
          "full_quality_editorial_approved":False,
          "licence_compliance_signed_off":False,"app_published":False
        })
    audit={"schema":"AO_P90_TWO_CHURCH_ORIGINAL_VERIFICATION_V1",
     "source":"P86 combined 385-photo review; P89 independent exact building gate",
     "source_frozen_originals":2,"retrieved_and_SHA1_verified":len(manifest),
     "all_original_bytes_decoded":True,"publisher_action":"NONE_RESEARCH_ONLY",
     "final_editorial_approval_count":0,"copyright_release_approval_count":0,
     "published_count":0,"files":manifest}
    (out/"audit.json").write_text(json.dumps(audit,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    with (out/"SHA256SUMS").open("w",encoding="utf8") as f:
        for file in sorted(out.iterdir()):
            if file.is_file() and file.name!="SHA256SUMS":
                f.write(hashlib.sha256(file.read_bytes()).hexdigest()+"  "+file.name+"\n")
    print(json.dumps({"status":"SOURCE_ORIGINALS_VERIFIED_NOT_PUBLISHED","files":len(manifest),
      "sha256":[m["downloaded_sha256"] for m in manifest]}),flush=True)

if __name__=="__main__":
    assert len(sys.argv)==2,"usage: script.py <new-output-directory>"
    main(sys.argv[1])
