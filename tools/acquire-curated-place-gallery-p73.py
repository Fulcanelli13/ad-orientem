#!/usr/bin/env python3
"""P73: reviewed six-image Place asset pack. Does not publish from GitHub Actions.

--check-manifest: offline invariants; --acquire: re-download exact Commons
originals, verify SHA1, author and licence, prepare uncropped WebP and registry
together in a disposable checkout. A separate reviewed asset PR MUST commit
the WebP files and the approved-gallery JSON as one atomic change.
"""
import argparse, hashlib, html, importlib.util, io, json, re, tempfile, shutil, time
from pathlib import Path
from urllib.parse import urlencode, urlsplit
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"data/geography/research/p73-curated-place-gallery-bundle.v1.json"
P72=ROOT/"data/geography/research/p72-priority-original-byte-results.v1.jsonl"
GALLERY=ROOT/"data/geography/approved-place-gallery.v1.json"
GEO=ROOT/"data/geography/seed-registry.v1.json"
ASSET=ROOT/"assets/approved/place-gallery"
REPORT=ROOT/"data/geography/research/p73-asset-acquisition-result.json"
SPEC=importlib.util.spec_from_file_location("p72_verifier", ROOT/"tools/verify-priority-commons-p72.py")
P72MOD=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(P72MOD)
Image.MAX_IMAGE_PIXELS=28_000_000
LICENSES={
  "CC0-1.0":("CC0","https://creativecommons.org/publicdomain/zero/1.0/"),
  "CC-BY-SA-2.0":("CC BY SA 2.0","https://creativecommons.org/licenses/by-sa/2.0/"),
  "CC-BY-SA-4.0":("CC BY SA 4.0","https://creativecommons.org/licenses/by-sa/4.0/")
}
def insist(cond,msg):
    if not cond: raise ValueError(msg)

def clean(v):
    return html.unescape(re.sub(r"<[^>]*>", " ", str(v or ""))).strip()

def manifest():
    data=json.loads(MANIFEST.read_text(encoding="utf-8"))
    insist(data["schema"]=="AO_P73_CURATED_PLACE_GALLERY_BUNDLE_V1","Manifest schema drift")
    rows=data["candidates"]
    insist(len(rows)==6,"Expected six selected Place photos")
    evidence={r["commons_file_title"]:r for r in
      (json.loads(line) for line in P72.read_text(encoding="utf-8").splitlines())}
    places={r["place_id"] for r in json.loads(GEO.read_text(encoding="utf-8"))["places"]}
    registry=json.loads(GALLERY.read_text(encoding="utf-8"))
    oldIds={r["media_id"] for r in registry["items"]}
    held={r["commons_title"] for r in data["held_without_canonical_relic"]}
    rejected=set(data["rejected_source_titles"])
    titles=set(); ids=set(); files=set()
    insist("File:St Oliver Plunkett's head 2007-10-5.jpg" in held,"Missing relic subject hold")
    insist(len(rejected)==2,"Unexpected rejected candidate set")
    for row in rows:
        e=evidence.get(row["commons_title"])
        insist(e is not None and e["original_bytes_verified"] and e["observed_sha1"]==row["expected_source_sha1"],"Missing P72 SHA1 evidence")
        insist(e["visual_decision"] in ("IMPORT","IMPORT_WITH_CORRECTIONS"),"Not editorially selected")
        insist(row["place_id"]==e["entity_id"] and row["place_id"] in places,"Wrong Place ID")
        insist(row["commons_title"] not in held|rejected,"Held or rejected source cannot publish")
        insist(row["commons_title"] not in titles and row["media_id"] not in ids and row["asset_filename"] not in files,"Duplicate ID/path")
        insist(row["expected_license"] in LICENSES and row["expected_license_url"]==LICENSES[row["expected_license"]][1],"Licence URL mismatch")
        insist(row["entire_original_frame_no_crop"] is True and row["rights_and_bytes_must_be_reverified_at_acquisition"] is True,"Unsafe media transformation")
        insist(re.fullmatch(r"[a-f0-9]{40}",row["expected_source_sha1"]) is not None,"Invalid pinned SHA1")
        insist(re.fullmatch(r"[a-z0-9-]{12,100}",row["media_id"]) is not None,"Bad media ID")
        insist(re.fullmatch(r"(?:IE|MU)-[a-z0-9-]{10,95}\.webp",row["asset_filename"]) is not None,"Bad local filename")
        insist(row["display_role"] in ("HERO","GALLERY_SITE","GALLERY_ARCHITECTURE"),"Bad card role")
        insist(row["source_url"].startswith("https://commons.wikimedia.org/wiki/File:"),"Not a Commons file URL")
        insist(row["expected_artist"] and len(row["expected_artist"])>3,"Missing photographer")
        for k in ("label_en","label_fr","alt_en","alt_fr","caption_en","caption_fr"):
            insist(len(row[k].strip())>=20,"Missing bilingual metadata: "+k)
        titles.add(row["commons_title"]);ids.add(row["media_id"]);files.add(row["asset_filename"])
        if row["media_id"] in oldIds:
            existing=next(r for r in registry["items"] if r["media_id"]==row["media_id"])
            insist(existing.get("source_sha1")==row["expected_source_sha1"],"Existing media ID points at different bytes")
    return rows,registry

def metadata(row):
    query=urlencode({"action":"query","format":"json","formatversion":"2","prop":"imageinfo",
        "iiprop":"url|sha1|size|mime|extmetadata","titles":row["commons_title"]})
    response=P72MOD.get_url_json("https://commons.wikimedia.org/w/api.php?"+query)
    pages=response["query"]["pages"]
    pages=list(pages.values()) if isinstance(pages,dict) else pages
    insist(len(pages)==1 and "missing" not in pages[0],"Commons file missing")
    p=pages[0]
    insist(p["title"].replace("_"," ")==row["commons_title"].replace("_"," ") and p["pageid"]==row["commons_page_id"],"Commons page identity drift")
    info=p["imageinfo"][0]
    insist(info["mime"]=="image/jpeg" and info["width"]>=800 and info["height"]>=800,"Invalid original image")
    insist(info["sha1"]==row["expected_source_sha1"],"Commons source SHA1 drift")
    insist(info["size"]<=15*1024*1024,"Original file too large")
    ext=info.get("extmetadata",{})
    m=lambda k: clean(ext.get(k,{}).get("value"))
    lic=re.sub(r"[-\s]+"," ",m("LicenseShortName")).upper()
    insist(lic==LICENSES[row["expected_license"]][0],"Licence grant drift: "+lic)
    if row["expected_license"]!="CC0-1.0":
        url=urlsplit(m("LicenseUrl"))
        want=urlsplit(row["expected_license_url"])
        insist(url.hostname==want.hostname and url.path.rstrip("/")==want.path.rstrip("/"),"Licence URL changed")
    insist(row["expected_artist"].casefold() in m("Artist").casefold(),"Photographer metadata changed")
    return info

def build_record(row,body,w,h):
    return {
      "media_id":row["media_id"],"place_id":row["place_id"],"status":"APPROVED",
      "kind":"PHOTO","content_kind":"PHOTO","asset_path":"assets/approved/place-gallery/"+row["asset_filename"],
      "chapter_id":row["chapter_id"],"display_role":row["display_role"],
      "label_en":row["label_en"],"label_fr":row["label_fr"],"alt_en":row["alt_en"],"alt_fr":row["alt_fr"],
      "caption_en":row["caption_en"],"caption_fr":row["caption_fr"],
      "source_url":row["source_url"],"source_sha1":row["expected_source_sha1"],
      "derivative_sha256":hashlib.sha256(body).hexdigest(),
      "credit":row["expected_artist"],"license":row["expected_license"],
      "license_url":row["expected_license_url"],
      "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
      "review_method":"Exact Place and original Commons SHA1 checked against downloaded bytes; source photographer, licence and full-frame preview screened in P72; no image crop.",
      "changes_en":"Resized and converted to WebP; no cropping, colour correction or retouching.",
      "changes_fr":"Image redimensionnée et convertie en WebP, sans recadrage ni retouche.",
      "photographed_at":row["photographed_at"],"width":w,"height":h,
      "orientation":"portrait" if h>w else "landscape","reviewed_at":"2026-10-29"
    }

def verify_committed(rows,registry):
    rec={x["media_id"]:x for x in registry["items"]}
    for row in rows:
        record=rec.get(row["media_id"])
        insist(record is not None and record.get("status")=="APPROVED","Missing published registry entry")
        insist(record.get("source_sha1")==row["expected_source_sha1"],"Source SHA1 mismatch")
        insist(record.get("license")==row["expected_license"],"Licence mismatch")
        path=ROOT/record["asset_path"]
        insist(path.exists() and path.parent==ASSET,"Missing local approved binary")
        b=path.read_bytes()
        insist(hashlib.sha256(b).hexdigest()==record["derivative_sha256"],"Derivative SHA256 mismatch")
        with Image.open(io.BytesIO(b)) as im:
            insist(im.format=="WEBP" and im.size==(record["width"],record["height"]),"Incorrect WebP dimensions")
    print("P73_COMMITTED_PASS="+json.dumps({"files":len(rows),"derivatives_verified":len(rows)},sort_keys=True))

def acquire(rows,registry,delay):
    insist(3<=delay<=15,"Require 3-15 sec Commons delay")
    existing={x["media_id"]:x for x in registry["items"]}
    writes=[]
    report=[]
    with tempfile.TemporaryDirectory(prefix="p73-acquire-") as folder:
        for idx,row in enumerate(rows):
            if row["media_id"] in existing:
                report.append({"media_id":row["media_id"],"status":"EXISTING_VERIFIED"})
                continue
            target=ASSET/row["asset_filename"]
            insist(not target.exists(),"Existing unregistered asset path")
            info=metadata(row)
            raw,checksum=P72MOD.download_original(info["url"])
            insist(checksum==row["expected_source_sha1"],"Downloaded SHA1 mismatch")
            with Image.open(io.BytesIO(raw)) as img:
                insist(img.format=="JPEG" and img.size==(info["width"],info["height"]),"Original encoding/dimensions mismatch")
                im=ImageOps.exif_transpose(img).convert("RGB")
                im.thumbnail((1280,1280),Image.Resampling.LANCZOS)
                tmp=Path(folder)/row["asset_filename"]
                im.save(tmp,"WEBP",quality=84,method=6)
                w,h=im.size
            b=tmp.read_bytes()
            insist(b[:4]==b"RIFF" and b[8:12]==b"WEBP" and len(b)>12000,"Bad derivative")
            record=build_record(row,b,w,h)
            writes.append((row,tmp,record))
            report.append({"media_id":row["media_id"],"status":"CHECKED_SOURCE_AND_DERIVATIVE",
                           "original_sha1":checksum,"derivative_sha256":record["derivative_sha256"],
                           "width":w,"height":h,"original_bytes":len(raw),"webp_bytes":len(b)})
            print("P73_ASSET_RESULT="+json.dumps(report[-1]),flush=True)
            if idx+1<len(rows):time.sleep(delay)
        sources={x.get("source_sha1") for x in registry["items"]}
        for _,_,record in writes:
            insist(record["source_sha1"] not in sources,"Duplicate original in approved gallery")
            sources.add(record["source_sha1"])
        ASSET.mkdir(parents=True,exist_ok=True)
        for row,tmp,record in writes:
            shutil.copyfile(tmp,ASSET/row["asset_filename"])
            registry["items"].append(record)
        if writes:
            registry["version"]="1.3.0"
            registry["acquisition_manifests"]=list(dict.fromkeys([
              *registry.get("acquisition_manifests",[]),str(MANIFEST.relative_to(ROOT))]))
            GALLERY.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        verify_committed(rows,registry)
        REPORT.write_text(json.dumps({"schema":"AO_P73_ACQUIRED_ASSET_REPORT_V1",
          "sources":len(rows),"published":False,"needs_reviewed_asset_pr":True,
          "records":report},indent=2)+"\n",encoding="utf-8")
        print("P73_BUNDLE_READY="+json.dumps({"candidates":len(rows),"webps":len(writes),"state":"NOT_COMMITTED_NOT_PUBLISHED"}))

if __name__=="__main__":
    p=argparse.ArgumentParser()
    op=p.add_mutually_exclusive_group(required=True)
    op.add_argument("--check-manifest",action="store_true")
    op.add_argument("--acquire",action="store_true")
    op.add_argument("--verify-committed",action="store_true")
    p.add_argument("--delay",type=float,default=4.0)
    args=p.parse_args()
    selected,registry=manifest()
    if args.check_manifest:
        print("P73_OFFLINE_PASS="+json.dumps({"candidates":len(selected),"distinct_places":len({r["place_id"] for r in selected}),"published_by_this_check":0}))
    elif args.verify_committed:
        verify_committed(selected,registry)
    else:
        acquire(selected,registry,args.delay)
