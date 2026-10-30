#!/usr/bin/env python3
"""Turn ONE P79 editorial selection into a source-checked, releasable photo.

No second human approval for ordinary selected photos. A user's explicit
choice certifies site/visual suitability; the program checks Commons bytes,
licence and creator. Source exceptions remain holds. Never run on Actions with
write permissions. Only --apply writes to existing app media paths.
"""
from __future__ import annotations
import argparse
import datetime as dt
import hashlib
import importlib.util
import json
import re
import shutil
import urllib.parse
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
DATA=ROOT/"data/geography"
P79=DATA/"research/p79-all-502-commons-review.v1.json"
SEED=DATA/"seed-registry.v1.json"
MEDIA=DATA/"approved-place-media.v1.json"
GALLERY=DATA/"approved-place-gallery.v1.json"
SOURCE=ROOT/"tools/directory/stage-bulk-place-photos.py"
spec=importlib.util.spec_from_file_location("ao_directory_photo_stager",SOURCE)
stager=importlib.util.module_from_spec(spec)
spec.loader.exec_module(stager)

SCHEMA="AO_P79_PLACE_PHOTO_SELECTIONS_V2"
POLICY={
    "CC0":"CC0",
    "CC BY 3.0":"CC-BY-3.0",
    "CC BY 4.0":"CC-BY-4.0",
    "CC BY SA 2.0":"CC-BY-SA-2.0",
    "CC BY SA 3.0":"CC-BY-SA-3.0",
    "CC BY SA 4.0":"CC-BY-SA-4.0",
}
MAX_ITEMS=100
MAX_SOURCE_BYTES=stager.MAX_ORIGINAL_BYTES
MAX_BATCH_SOURCE_BYTES=160_000_000

def read(path):
    return json.loads(Path(path).read_text(encoding="utf-8"))

def same_source_page(title,url):
    parts=urllib.parse.urlsplit(str(url or ""))
    return (parts.scheme=="https" and parts.hostname=="commons.wikimedia.org"
            and parts.port in (None,443) and not parts.username and not parts.password
            and not parts.query and not parts.fragment
            and urllib.parse.unquote(parts.path).replace("_"," ")=="/wiki/"+title)

def load_selections(review,p79,seed,media,gallery):
    """Validate full review export; return candidates with explicit editorial approval."""
    if (review.get("schema")!=SCHEMA or
        p79.get("schema")!="AO_P79_ONE_CAMPAIGN_ALL_502_COMMONS_ASSIGNMENTS_V1" or
        seed.get("schema")!="EXPLORE_GEOGRAPHY_SEED_V1" or
        media.get("schema")!="AO_APPROVED_PLACE_MEDIA_V1" or
        gallery.get("schema")!="AO_APPROVED_PLACE_GALLERY_V1"):
        raise ValueError("Review or canonical registry schema mismatch")
    places={p["place_id"]:p for p in seed["places"]}
    source={r["id"]:r for r in p79["records"] if r.get("owner")=="GEOGRAPHY"
            and r.get("entity_id") in places}
    by_place={}
    for r in source.values():
        by_place.setdefault(r["entity_id"],set()).add(r["id"])
    rows=review.get("decisions")
    if (review.get("source_as_of")!=p79.get("as_of") or
        review.get("candidate_count")!=len(source) or
        review.get("canonical_site_count")!=len(by_place) or
        not isinstance(rows,list) or len(rows)!=len(by_place)):
        raise ValueError("Review snapshot stale, incomplete or malformed")
    approved={r["place_id"] for r in media["items"]+gallery["items"] if r.get("status")=="APPROVED"}
    selected=[]
    seen=set()
    for item in rows:
        place_id=item.get("place_id")
        if place_id not in by_place or place_id in seen:
            raise ValueError("Duplicate/unknown canonical Place ID in review")
        seen.add(place_id)
        decision=item.get("decision")
        if decision not in ("chosen","none","hold","unreviewed"):
            raise ValueError("Invalid editorial decision")
        if decision!="chosen":
            if item.get("editorial_approved") is True:
                raise ValueError("Unselected photo marked editorially approved")
            continue
        if (item.get("editorial_approved") is not True or
            item.get("exact_building_editorially_confirmed") is not True or
            item.get("visual_quality_editorially_approved") is not True):
            raise ValueError("Chosen photo lacks positive one-click editorial attestation")
        if place_id in approved:
            continue  # Already published, never silently replace existing cover.
        photo_id=item.get("selected_p79_id")
        if photo_id not in by_place[place_id]:
            raise ValueError("Chosen photo belongs to a different physical Place")
        r=source[photo_id]
        if (r.get("prior_editorial")=="REJECT"
                or str(r.get("prior_triage") or "").startswith("EXCLUDE_")):
            raise ValueError("Previously rejected/wrong-location photo selected")
        license_name=POLICY.get(r.get("license_claim"))
        if not license_name:
            raise ValueError("Unsupported public-domain, regional or uncertain licence held")
        title=r.get("source_file")
        expected=r.get("original_sha1")
        if (not isinstance(title,str) or not title.startswith("File:")
                or not same_source_page(title,r.get("source_page"))
                or not re.fullmatch(r"[0-9a-f]{40}",str(expected or ""))):
            raise ValueError("Invalid Commons page/title/SHA1 in candidate source")
        if (item.get("source_file")!=title or item.get("source_page")!=r["source_page"]
                or item.get("frozen_original_sha1")!=expected):
            raise ValueError("Review selection changed from immutable P79 source")
        selected.append({"place_id":place_id,"place":places[place_id],
                         "source":r,"title":title,"license":license_name,
                         "sha1":expected})
    if seen!=set(by_place):
        raise ValueError("Review is missing canonical Places")
    return sorted(selected,key=lambda r:r["place_id"])

def approved_item(selection,actual_license,author,derivative,shape):
    place=selection["place"]
    name=place["name"]["official"]
    city=str((place.get("address") or {}).get("city") or "").strip()
    locality=", "+city if city and city.lower() not in name.lower() else ""
    place_id=selection["place_id"]
    file_digest=hashlib.sha256(place_id.encode()).hexdigest()[:16]
    path="assets/approved/place-media/P79-"+file_digest+".webp"
    digest=hashlib.sha256(derivative).hexdigest()
    return {
        "place_id":place_id,"status":"APPROVED","asset_path":path,
        "credit":author,"license":"CC0-1.0" if actual_license=="CC0" else actual_license,
        "license_url":stager.LICENSES[actual_license],
        "source_url":selection["source"]["source_page"],
        "source_sha1":selection["sha1"],"derivative_sha256":digest,
        "source_place_ref":"P79:"+str(selection["source"]["id"]),
        "alt_en":"Photograph of "+name+locality,
        "alt_fr":"Photographie de "+name+locality,
        "changes_en":"Full frame retained; EXIF orientation normalized and resized without upscaling; WebP encoded, with no crop, recolouring or montage.",
        "changes_fr":"Image entière conservée ; orientation EXIF corrigée et redimensionnement sans agrandissement ; conversion WebP, sans recadrage ni retouche.",
        "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
        "reviewed_at":dt.datetime.now(dt.timezone.utc).date().isoformat(),
        "review_method":"Single explicit P79 Place editorial choice (exact physical site, clear composition, no prominent restricted artwork or sensitive faces); current Commons licence/author and exact SHA1 original bytes checked. Full-frame derivative SHA256 independently computed.",
        "width":shape[0],"height":shape[1],
        "orientation":"landscape" if shape[0]>shape[1] else "portrait" if shape[0]<shape[1] else "square"
    }

def process(selected,out_dir,*,metadata_loader=None,download=None,apply=False):
    """Stage verified WebPs; --apply installs passed items into existing app files."""
    if not selected or len(selected)>MAX_ITEMS:
        raise ValueError("Select 1–100 existing Places for one release")
    metadata_loader=metadata_loader or stager.api_metadata
    download=download or stager.fetch
    out_dir=Path(out_dir)
    if out_dir.exists():
        raise ValueError("Output path already exists; use an immutable new batch path")
    out_dir.mkdir(parents=True)
    staged=[];held=[];bytes_total=0
    for choice in selected:
        entry={"title":choice["title"],"expected_sha1":choice["sha1"],
               "expected_license":choice["license"],"venue_id":choice["place_id"],
               "panorama_hint":"UNSPECIFIED"}
        try:
            info,actual_license,author=metadata_loader(entry)
            if (actual_license!=choice["license"]
                    or info.get("sha1")!=choice["sha1"]
                    or info.get("mime") not in {"image/jpeg","image/png","image/webp"}
                    or int(info["size"])<1000 or int(info["size"])>MAX_SOURCE_BYTES
                    or bytes_total+int(info["size"])>MAX_BATCH_SOURCE_BYTES):
                raise ValueError("Commons licence/SHA1/size no longer meets release policy")
            original=download(info["url"],MAX_SOURCE_BYTES)
            if (len(original)!=int(info["size"])
                    or hashlib.sha1(original).hexdigest()!=choice["sha1"]):
                raise ValueError("Original bytes do not match Commons source")
            derivative,shape,panorama=stager.convert_original(original,info,entry)
            if panorama:
                raise ValueError("Unverified panorama projection")
            record=approved_item(choice,actual_license,author,derivative,shape)
            filename=out_dir/Path(record["asset_path"]).name
            filename.write_bytes(derivative)
            staged.append({"item":record,"local_webp":str(filename)})
            bytes_total+=len(original)
        except (Exception) as exc:
            # Hold only the failed item; never substitute a similarly named image.
            held.append({"place_id":choice["place_id"],"p79_id":choice["source"]["id"],
                         "reason":type(exc).__name__+": "+str(exc)[:240]})
    report={"schema":"AO_P79_SELECTION_TO_VERIFIED_MEDIA_V1",
            "status":"LOCAL_APP_FILES_UPDATED" if apply else "STAGED_READY_FOR_REVIEWED_COMMIT",
            "selected":len(selected),"source_checked_and_staged":len(staged),
            "held":len(held),"new_approved_entries":len(staged) if apply else 0,
            "new_photos_verified_visible_in_running_app":0,
            "records":staged,"exceptions":held}
    if apply and staged:
        # Exact production destination, no unreviewed overwrite or loose link.
        registry=read(MEDIA)
        existing={r["place_id"] for r in registry["items"]}
        for x in staged:
            r=x["item"]
            target=ROOT/r["asset_path"]
            if r["place_id"] in existing or target.exists():
                raise ValueError("Existing approved media or bytes: refusing overwrite")
        for x in staged:
            r=x["item"];target=ROOT/r["asset_path"]
            target.parent.mkdir(parents=True,exist_ok=True)
            shutil.copyfile(x["local_webp"],target)
            registry["items"].append(r)
        registry["items"].sort(key=lambda x:x["place_id"])
        tmp=MEDIA.with_suffix(".json.tmp")
        tmp.write_text(json.dumps(registry,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
        tmp.replace(MEDIA)
    (out_dir/"verification-report.json").write_text(
        json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    return report

def main():
    p=argparse.ArgumentParser(description=__doc__)
    p.add_argument("--review",type=Path,required=True,help="Downloaded P79 V2 one-click editorial review JSON")
    p.add_argument("--output-dir",type=Path,help="Unique immutable local batch directory")
    p.add_argument("--validate-only",action="store_true")
    p.add_argument("--apply",action="store_true",help="Write verified new WebPs and approved entries into existing app checkout")
    args=p.parse_args()
    if args.apply and args.validate_only: p.error("--apply requires actual source verification")
    chosen=load_selections(read(args.review),read(P79),read(SEED),read(MEDIA),read(GALLERY))
    if args.validate_only:
        print(json.dumps({"schema":SCHEMA,"one_click_editorial_approvals":len(chosen),
                          "original_downloads":0,"photos_published":0}))
        return
    if not args.output_dir: p.error("--output-dir required unless --validate-only")
    report=process(chosen,args.output_dir,apply=args.apply)
    print(json.dumps({k:report[k] for k in
        ("status","selected","source_checked_and_staged","held","new_approved_entries",
         "new_photos_verified_visible_in_running_app")}))

if __name__=="__main__":
    main()
