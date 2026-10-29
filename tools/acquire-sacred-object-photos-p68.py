#!/usr/bin/env python3
"""P68: offline manifest validation or Commons-source-verified permanent photo acquisition."""
import argparse,hashlib,html,io,json,re,shutil,tempfile,time
from pathlib import Path
from urllib.parse import urlencode,unquote,urlsplit
from urllib.request import urlopen,Request
from urllib.error import URLError,HTTPError
from PIL import Image,ImageOps

ROOT=Path(__file__).resolve().parents[1]
M=ROOT/"data/geography/research/approved-sacred-object-acquisition-p68.v1.json"
R=ROOT/"data/geography/approved-place-gallery.v1.json"
ASSET=ROOT/"assets/approved/place-gallery"
REL=ROOT/"data/explore/sacred-phenomena-seed.v1.json"
GEO=ROOT/"data/geography/seed-registry.v1.json"
MAX_BYTES=16_000_000
LICENSE="https://creativecommons.org/licenses/by-sa/4.0/"
Image.MAX_IMAGE_PIXELS=26_000_000
def check(ok,msg):
    if not ok:raise ValueError(msg)
def clean(x):
    return html.unescape(re.sub(r"<[^>]+>"," ",str(x or ""))).strip()
def get(url,limit):
    host=urlsplit(url)
    check(host.scheme=="https" and host.hostname in {"commons.wikimedia.org","upload.wikimedia.org"},"Illegal download host")
    req=Request(url,headers={"User-Agent":"AdOrientemSacredGeography/1.0 (source provenance and free reuse)","Accept":"*/*"})
    for i in range(3):
        try:
            with urlopen(req,timeout=40) as stream:
                check(urlsplit(stream.geturl()).hostname in {"commons.wikimedia.org","upload.wikimedia.org"},"Redirect host")
                data=stream.read(limit+1)
                check(len(data)<=limit,"Too many source bytes")
                return data
        except (URLError,HTTPError,TimeoutError):
            if i==2:raise
            time.sleep(2+i*3)
def checked_manifest():
    m=json.loads(M.read_text(encoding="utf-8"))
    check(m.get("schema")=="AO_SACRED_OBJECT_ACQUISITION_MANIFEST_P68_V1","Bad manifest schema")
    check(m.get("publication")=="ELIGIBLE_ONLY_AFTER_COMMONS_LICENCE_AND_BYTES_REVERIFICATION","Unapproved source")
    relics={r["id"]:r for r in json.loads(REL.read_text(encoding="utf-8"))["relics"]}
    places={r["place_id"] for r in json.loads(GEO.read_text(encoding="utf-8"))["places"]}
    rows=m["photos"]
    check(1<=len(rows)<=30,"Acquisition batch too large")
    ids=set();filenames=set()
    for row in rows:
        check(row["relic_id"] in relics and row["place_id"] in places and
              relics[row["relic_id"]]["place_id"]==row["place_id"],"Cross-Place relic")
        check(row["review_state"]=="SOURCE_AND_SUBJECT_REVIEWED_FOR_ACQUISITION" and
              row["crop_policy"]=="ENTIRE_FRAME_NO_CROP","Not editorially selected")
        check(row["expected_license"]=="CC-BY-SA-4.0" and row["expected_artist"],"Unreviewed licence or author")
        check(row["subject_kind"] in {"RELIQUARY_HOUSING_REPUTED_RELIC",
            "GLASS_SHRINE_REPORTED_BODILY_REMAINS"},"Bad photograph subject")
        check(re.fullmatch(r"[a-z0-9-]{10,100}",row["media_id"]) is not None,"Bad ID")
        check(re.fullmatch(r"[A-Z]{2}-[a-z0-9-]{10,100}\.webp",
              row["asset_filename"]) is not None,"Bad filename")
        check(row["media_id"] not in ids and row["asset_filename"] not in filenames,"Duplicate ID/path")
        ids.add(row["media_id"]);filenames.add(row["asset_filename"])
        check(row["commons_title"].startswith("File:") and
              unquote(urlsplit(row["source_url"]).path.removeprefix("/wiki/")).replace("_"," ")==
              row["commons_title"],"Commons title and permalink disagree")
        sha=row.get("expected_source_sha1")
        check(sha is None or re.fullmatch(r"[a-f0-9]{40}",sha) is not None,"Bad original SHA1")
        check(re.fullmatch(r"\d{4}-\d{2}-\d{2}",row["photographed_at"]) is not None,"No photo date")
        for key in ("label_en","label_fr","alt_en","alt_fr","caption_en","caption_fr"):
            check(len(row[key].strip())>=10,"Missing caption "+key)
    print("P68 MANIFEST PASS",len(rows),"exact object photos",flush=True)
    return m
def commons(row):
    url="https://commons.wikimedia.org/w/api.php?"+urlencode({
      "action":"query","format":"json","formatversion":"2","prop":"imageinfo",
      "titles":row["commons_title"],"iiprop":"url|sha1|size|mime|extmetadata"})
    pages=json.loads(get(url,1_500_000))["query"]["pages"]
    check(len(pages)==1 and not pages[0].get("missing"),"Missing Commons file")
    info=pages[0]["imageinfo"][0]
    check(info["mime"]=="image/jpeg" and min(info["width"],info["height"])>=800 and
          info["size"]<=MAX_BYTES,"Unsupported image dimensions, MIME or size")
    metadata=info["extmetadata"]
    value=lambda k:clean((metadata.get(k) or {}).get("value"))
    lic=value("LicenseShortName").replace("-"," ").replace("  "," ").upper()
    check(lic=="CC BY SA 4.0","Commons licence changed "+lic)
    parsed=urlsplit(value("LicenseUrl"))
    check(parsed.hostname=="creativecommons.org" and
        parsed.path.rstrip("/")=="/licenses/by-sa/4.0","Licence URL mismatch")
    check(row["expected_artist"].casefold() in value("Artist").casefold(),
        "Photographer identity mismatch")
    check(re.fullmatch(r"[a-f0-9]{40}",info["sha1"]) is not None,"Bad Commons checksum")
    if row.get("expected_source_sha1"):
        check(info["sha1"]==row["expected_source_sha1"],"Pinned source checksum changed")
    return info
def media(row,info,body,size):
    w,h=size
    return {"media_id":row["media_id"],"place_id":row["place_id"],
      "status":"APPROVED","kind":"PHOTO","content_kind":"SACRED_OBJECT_PHOTOGRAPH",
      "asset_path":"assets/approved/place-gallery/"+row["asset_filename"],
      "chapter_id":"sacred_treasures","subject_relic_id":row["relic_id"],
      "depicts_kind":row["subject_kind"],"photographed_at":row["photographed_at"],
      "caption_en":row["caption_en"],"caption_fr":row["caption_fr"],
      "label_en":row["label_en"],"label_fr":row["label_fr"],
      "alt_en":row["alt_en"],"alt_fr":row["alt_fr"],
      "source_url":row["source_url"],"source_sha1":info["sha1"],
      "derivative_sha256":hashlib.sha256(body).hexdigest(),
      "credit":row["expected_artist"],"license":"CC-BY-SA-4.0","license_url":LICENSE,
      "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
      "review_method":"Exact licensed Commons file and dated reliquary/shrine identity; original SHA1 checked against downloaded bytes. No crop.",
      "changes_en":"Resized and converted to WebP; no crop or retouching.",
      "changes_fr":"Redimensionnement et conversion WebP, sans recadrage ni retouche.",
      "width":w,"height":h,"orientation":"portrait" if h>w else "landscape",
      "reviewed_at":"2026-10-29"}
def acquire(manifest):
    registry=json.loads(R.read_text(encoding="utf-8"))
    check(registry["schema"]=="AO_APPROVED_PLACE_GALLERY_V1","Gallery schema drift")
    current={x["media_id"]:x for x in registry["items"]}
    acquired=[]
    with tempfile.TemporaryDirectory(prefix="p68-") as d:
        for row in manifest["photos"]:
            target=ASSET/row["asset_filename"]
            if row["media_id"] in current:
                old=current[row["media_id"]]
                check(old.get("subject_relic_id")==row["relic_id"] and target.exists(),
                      "Published record missing asset or changed owner")
                check(hashlib.sha256(target.read_bytes()).hexdigest()==
                      old["derivative_sha256"],"Local image hash drift")
                continue
            check(not target.exists(),"Unregistered approved path collision")
            info=commons(row)
            original=get(info["url"],MAX_BYTES)
            check(hashlib.sha1(original).hexdigest()==info["sha1"],"Commons bytes/checksum mismatch")
            with Image.open(io.BytesIO(original)) as source:
                check(source.format=="JPEG","Invalid source encoding")
                pic=ImageOps.exif_transpose(source).convert("RGB")
                check(min(pic.size)>=800,"Source photo too small")
                pic.thumbnail((1280,1280),Image.Resampling.LANCZOS)
                dest=Path(d)/row["asset_filename"]
                pic.save(dest,"WEBP",quality=84,method=6)
                size=pic.size
            binary=dest.read_bytes()
            check(len(binary)>12_000 and binary[:4]==b"RIFF" and
                  binary[8:12]==b"WEBP","Derivative failed")
            acquired.append((row,dest,media(row,info,binary,size)))
            print("REVIEWED",row["media_id"],info["sha1"],size,flush=True)
        if not acquired:
            print("P68 all assets already present: no-op");return
        existingHashes={r.get("source_sha1") for r in registry["items"]}
        for _,_,rec in acquired:
            check(rec["source_sha1"] not in existingHashes,"Photo duplicate by source SHA1")
            existingHashes.add(rec["source_sha1"])
        ASSET.mkdir(parents=True,exist_ok=True)
        for row,dest,_ in acquired:
            shutil.copyfile(dest,ASSET/row["asset_filename"])
        registry["items"].extend(rec for _,_,rec in acquired)
        registry["version"]="1.2.0"
        path=str(M.relative_to(ROOT))
        registry["acquisition_manifests"]=list(dict.fromkeys(
            [*registry.get("acquisition_manifests",[]),path]))
        R.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        print("P68 ACQUIRED",len(acquired),"source-verified local images (commit with registry)",flush=True)
if __name__=="__main__":
    a=argparse.ArgumentParser();opts=a.add_mutually_exclusive_group(required=True)
    opts.add_argument("--check-manifest",action="store_true")
    opts.add_argument("--acquire",action="store_true")
    args=a.parse_args()
    m=checked_manifest()
    if args.acquire:acquire(m)
