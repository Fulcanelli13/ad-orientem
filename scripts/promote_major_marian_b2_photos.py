#!/usr/bin/env python3
"""One-shot trusted-branch publication of 7 manually screened Wikimedia photos.

Requires exact existing Place IDs, independent Commons rights/author/original
SHA1 verification, pre-reviewed complete-frame subjects and local WebP SHA256.
Never publishes the Banneux hold or writes to Calendar / sacred-art registries.
"""
from __future__ import annotations
import hashlib, json, shutil
from pathlib import Path
from stage_shrine_photo_candidates import stage, OUT

ROOT = Path(__file__).resolve().parents[1]
CANDIDATES = ROOT/"data/geography/research/explore-major-marian-b2-photo-candidates.v1.json"
MEDIA = ROOT/"data/geography/approved-place-media.v1.json"
LEDGER = ROOT/"data/shrines/editorial-master-inventory-20261021.v1.json"
SHRINES = ROOT/"data/shrines/shrines-pilgrimages-seed.v1.json"
ACCEPT = "EDITORIALLY_ACCEPTED_EXACT_SITE_AND_FULL_FRAME_20261021"

def read(p): return json.loads(p.read_text(encoding="utf8"))
def write(p, data): p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
def exact_replacement(path, old, new):
    text=path.read_text(encoding="utf8")
    if text.count(old)!=1: raise ValueError(f"{path}: expected one occurrence of {old!r}, found {text.count(old)}")
    path.write_text(text.replace(old,new),encoding="utf8")
def main():
    source=read(CANDIDATES);media=read(MEDIA);ledger=read(LEDGER);shr=read(SHRINES)
    candidates=source["candidates"]
    assert len(candidates)==7 and len(source["held"])==1
    assert source["held"][0]["place_id"]=="place:BE:banneux"
    assert all(c.get("image_review_state")==ACCEPT for c in candidates)
    original={p["place_id"]:p for p in shr["shrines"]}
    already={p["place_id"]:p for p in media["items"]}
    assert len(already)==24
    for c in candidates:
        place=c["place_id"]
        if place not in original or place in already: raise ValueError("Duplicate/missing canonical Place: "+place)
        details=stage(c)
        target="assets/approved/place-media/"+place.removeprefix("place:").replace(":","-")+".webp"
        src=OUT/details["candidate_filename"];dst=ROOT/target
        if not src.exists() or dst.exists(): raise ValueError("Missing derivative / path collision "+target)
        dst.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(src,dst)
        if hashlib.sha256(dst.read_bytes()).hexdigest()!=details["derivative_sha256"]:
            raise ValueError("Source-verified photo hash failed after copy")
        observed_license=details["rights"]["license_url"]
        if c["license"]!="PUBLIC_DOMAIN":
            assert c["license_url"].rstrip("/") in observed_license.rstrip("/"),(place,c["license_url"],observed_license)
        else:
            assert c["license"]=="PUBLIC_DOMAIN" and "public domain" in (
                details["rights"]["short"]+" "+details["rights"]["usage"]).lower()
        record={
          "place_id":place,"status":"APPROVED","asset_path":target,
          "credit":c["credit"],"license":c["license"],"license_url":c["license_url"],
          "source_url":c["source_url"],"source_sha1":details["original_sha1"],
          "derivative_sha256":details["derivative_sha256"],
          "source_place_ref":original[place]["source_ids"][0],
          "alt_en":c["alt_en"],"alt_fr":c["alt_fr"],
          "changes_en":"Resized to fit 1280 px maximum and converted to WebP; no crop, recolouring or montage.",
          "changes_fr":"Image redimensionnée à 1 280 px maximum et convertie en WebP ; sans recadrage, retouche colorimétrique ni montage.",
          "rights_verified":True,"subject_verified":True,"crop_reviewed":True,
          "reviewed_at":"2026-10-21",
          "review_method":"Source Wikimedia file/original SHA1 and free-reuse metadata verified; visual contact-sheet review of full-frame exact original Catholic site; local WebP derivative SHA256 verified.",
          "width":details["candidate_dimensions"][0],"height":details["candidate_dimensions"][1],
          "orientation":"portrait" if details["candidate_dimensions"][1]>details["candidate_dimensions"][0] else "landscape"
        }
        media["items"].append(record);already[place]=record
        print("APPROVED",place,target,c["license"],flush=True)
    assert len(already)==31
    media["items"].sort(key=lambda x:x["place_id"]);media["version"]="1.4.0"
    write(MEDIA,media)
    for item in ledger["shrines"]:
        photo=already.get(item["place_id"])
        if photo and item["hero_media"]!="APPROVED_LOCAL":
            item["hero_media"]="APPROVED_LOCAL";item["hero_asset_path"]=photo["asset_path"]
            item["next_editorial_action"]="QA_RELEASED_FOLIO" if item["detailed_guide"]=="PUBLISHED" else "WRITE_SOURCE_LINKED_GUIDE"
    for pilgrim in ledger["pilgrimages"]:
        if pilgrim["destination_place_id"] in already: pilgrim["destination_hero"]="APPROVED_LOCAL"
    ls=ledger["shrines"]
    ledger["summary"]["shrineApprovedHero"]=sum(x["hero_media"]=="APPROVED_LOCAL" for x in ls)
    ledger["summary"]["shrineGuideAndHero"]=sum(x["hero_media"]=="APPROVED_LOCAL" and x["detailed_guide"]=="PUBLISHED" for x in ls)
    ledger["summary"]["marianApprovedHero"]=sum(x["hero_media"]=="APPROVED_LOCAL" and x["category"]=="MARIAN" for x in ls)
    ledger["summary"]["approvedSitePhotos"]=len(already)
    assert ledger["summary"]["shrineApprovedHero"]==31
    assert ledger["summary"]["shrineGuideAndHero"]==31
    assert ledger["summary"]["marianApprovedHero"]==21
    assert ledger["summary"]["shrineGuides"]==33
    write(LEDGER,ledger)
    # Update obsolete cardinality assertions *only*. Historical R58/59 cohort
    # identity, original licence/source assertions and holds remain untouched.
    patches={
      "tests/shrine-marian-editorial-inventory-contract.mjs":[
        ("assert.equal(ledger.summary.shrineApprovedHero,24);","assert.equal(ledger.summary.shrineApprovedHero,31);"),
        ("assert.equal(images.items.length,24,","assert.equal(images.items.length,31,"),
        ("assert.equal(ledger.summary.shrineGuideAndHero,24);","assert.equal(ledger.summary.shrineGuideAndHero,31);"),
        ('33 detailed guides; all 24 approved local site photographs','33 detailed guides; all 31 approved local site photographs')
      ],
      "tests/explore-surface.mjs":[('assert.equal(mediaRegistry.items.length,24,','assert.equal(mediaRegistry.items.length,31,')],
      "tests/explore-photo-research.mjs":[
        ('assert.equal(approved.items.length,24,','assert.equal(approved.items.length,31,'),
        ('const shrineCandidates=new Map(shrineRecovery.candidates.map(x=>[x.place_id,x]));',
         'const shrineCandidates=new Map(shrineRecovery.candidates.map(x=>[x.place_id,x]));\nconst b2Candidates=new Map(read("data/geography/research/explore-major-marian-b2-photo-candidates.v1.json").candidates.map(x=>[x.place_id,x]));'),
        ('assert.ok(["CC-BY-SA-2.0","CC-BY-SA-3.0","CC-BY-SA-4.0"].includes(item.license),',
         'assert.ok(["PUBLIC_DOMAIN","CC-BY-SA-2.0","CC-BY-SA-3.0","CC-BY-SA-4.0"].includes(item.license),'),
        ('  assert.equal(item.license_url,\n    "https://creativecommons.org/licenses/by-sa/"+item.license.split("-").at(-1)+"/");',
         '  assert.equal(item.license_url,item.license==="PUBLIC_DOMAIN"\n    ? "https://creativecommons.org/publicdomain/mark/1.0/"\n    : "https://creativecommons.org/licenses/by-sa/"+item.license.split("-").at(-1)+"/");'),
        ('    const c=shrineCandidates.get(item.place_id);',
         '    const c=shrineCandidates.get(item.place_id)||b2Candidates.get(item.place_id);')
      ],
      "tests/explore-photo-r59.mjs":[('assert.equal(published.items.length,24,','assert.equal(published.items.length,31,')],
      "tests/explore-r64-illustrated-ireland.mjs":[('assert.equal(media.items.length,24,','assert.equal(media.items.length,31,')],
      "tests/explore-r65-ireland-five-places.mjs":[('assert.equal(media.items.length,24,','assert.equal(media.items.length,31,')],
      "tests/explore-r68-photo-gallery.mjs":[('assert.equal(hero.items.length,24,','assert.equal(hero.items.length,31,')],
      "tests/explore-r69-multi-place-gallery.mjs":[('assert.equal(hero.items.length,24);','assert.equal(hero.items.length,31);')],
      "tests/sacred-geography-r70-six-global-sites.mjs":[('assert.equal(hero.items.length,24,','assert.equal(hero.items.length,31,')]
    }
    for path,replacements in patches.items():
        for a,b in replacements:exact_replacement(ROOT/path,a,b)
    b2=ROOT/"tests/shrine-marian-editorial-inventory-contract.mjs"
    exact_replacement(b2,
        'assert.equal(imageByPlace.has(g.place_id),false,\n   "Research-only photograph must not be treated as approved for "+g.place_id);',
        'assert.equal(imageByPlace.has(g.place_id),g.place_id!=="place:BE:banneux",\n   "Seven photographed sanctuaries and one genuine Banneux photo hold expected");')
    visual=ROOT/"tests/explore-shrine-illustrated-folios-phone.mjs"
    exact_replacement(visual,
        "17 existing photo-backed and eight new bilingual-source guides without borrowed artwork.",
        "17 existing photos and seven newly approved site photos; Banneux holds its photograph.")
    print("PROMOTION READY: 31 verified media photographs; 33 detailed shrines; 1 Banneux no-photo hold",flush=True)

if __name__=="__main__":main()
