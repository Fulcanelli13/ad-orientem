#!/usr/bin/env python3
"""B49: 383-row photograph-rights evidence and actual git image reconciliation.

Read-only research. Do not upgrade per-object metadata rights into app photo
clearance, or perceptual similarity into catalogue identity. Does NOT republish
a previously published/selected work. Runs entirely €0 via existing GitHub
Actions, with the 5.6MB legacy B27 'gallery159' TAR only as comparison aid.
"""
import csv,hashlib,io,json,re,subprocess,tarfile,tempfile
from collections import Counter,defaultdict
from pathlib import Path
from PIL import Image,ImageOps,UnidentifiedImageError

ROOT=Path("data/research")
SOURCE=ROOT/"sacred-art-b48-383-photo-preservation-ledger.csv"
CATALOGUE=ROOT/"sacred-art-catalogue451-after-b25.csv"
ROLLUP=ROOT/"sacred-art-acquisition-245-source-rollup.csv"
OUT=ROOT/"sacred-art-b49-383-release-photo-rights-and-repo-mapping.csv"
REPORT=ROOT/"sacred-art-b49-383-photo-license-and-git-image-summary.json"
IMAGES=ROOT/"sacred-art-b49-git-tracked-images-and-visual-match-candidates.csv"
GALLERY_TAR="ao-supplement-b27-gallery159.tar"
RELEASE="sacred-art-originals-b26-20261024"
PREFIX="https://github.com/Fulcanelli13/ad-orientem/"
PERM_OPEN={"public domain","cc0","cc by","cc-by","cc by-sa","cc-by-sa"}
EXT={".png",".jpg",".jpeg",".webp",".tiff",".tif",".avif",".gif",".bmp",".jp2",".mpo"}
LICENSE_SEEMS_OPEN=re.compile(r"\b(?:public\s+domain|cc0|cc[\s-]?by(?:[\s-]?sa)?)\b",re.I)
LICENSE_SEEMS_RESTRICTED=re.compile(r"\b(?:permission required|all rights reserved|rights managed|copyright reserved|reproduction prohibited|written approval)\b",re.I)
def rows(path):
    with path.open(newline="",encoding="utf-8") as f:return list(csv.DictReader(f))
def write(path,items):
    assert items
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(items[0]))
        w.writeheader();w.writerows(items)
def SHA(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for b in iter(lambda:f.read(1048576),b""):h.update(b)
    return h.hexdigest()
def dhash(image):
    gray=ImageOps.grayscale(image)
    img=gray.resize((9,8),Image.Resampling.LANCZOS)
    pixels=list(img.getdata())
    n=0
    for y in range(8):
        for x in range(8):n=(n<<1)|(pixels[y*9+x]>pixels[y*9+x+1])
    return n
def imginfo(path=None,byte_source=None):
    try:
        if path:
            with Image.open(path) as im:
                if im.format not in ("JPEG","PNG","WEBP","TIFF"):return None
                w,h=im.size
                if min(w,h)<350:return None
                ph=dhash(im);return {"w":w,"h":h,"dhash":ph,"ratio":w/h,"format":im.format}
        if byte_source:
            with Image.open(io.BytesIO(byte_source)) as im:
                if im.format not in ("JPEG","PNG","WEBP","TIFF"):return None
                w,h=im.size
                if min(w,h)<350:return None
                ph=dhash(im);return {"w":w,"h":h,"dhash":ph,"ratio":w/h,"format":im.format}
    except (OSError,UnidentifiedImageError,ValueError,MemoryError):pass
    return None
def gallery_records():
    with tempfile.TemporaryDirectory() as d:
        subprocess.run(["gh","release","download",RELEASE,
          "--repo","Fulcanelli13/ad-orientem","--pattern",GALLERY_TAR,
          "--dir",d],capture_output=True,text=True,check=True)
        path=Path(d)/GALLERY_TAR
        samples=[];non_images=[]
        with tarfile.open(path,mode="r") as f:
            members=[z for z in f.getmembers() if z.isfile()]
            for member in members:
                if Path(member.name).suffix.lower() not in EXT:
                    non_images.append(member.name);continue
                if member.size>17_000_000:continue
                with f.extractfile(member) as original:b=original.read(17_000_001)
                if len(b)>17_000_000:continue
                image=imginfo(byte_source=b)
                if image:
                    samples.append({"member":member.name,
                       "bytes":len(b),"sha256":hashlib.sha256(b).hexdigest(),**image})
        return samples,non_images,len(members),path.stat().st_size
def git_files():
    names=[Path(x.decode("utf-8","replace")) for x in subprocess.check_output(
        ["git","ls-files","-z"]).split(b"\0") if x]
    files=[]
    for path in names:
        if path.suffix.lower() not in EXT or not path.is_file():continue
        size=path.stat().st_size
        src=imginfo(path=path) if size<42_000_000 else None
        files.append({"path":path.as_posix(),"bytes":size,"sha256":SHA(path),
          "width":src["w"] if src else 0,
          "height":src["h"] if src else 0,
          "candidate_scene":bool(src),
          "_im":src})
    return files
def main():
    baseline=rows(SOURCE)
    frozen=rows(CATALOGUE);rollup=rows(ROLLUP)
    b48=json.loads((ROOT/"sacred-art-b48-383-preserved-image-and-publication-gates.json").read_text())
    assert len(baseline)==383 and len({r["artwork_id"] for r in baseline})==383
    assert len(rollup)==245 and len(frozen)==451
    old={r["artwork_id"]:r for r in frozen}
    source_by_sha=defaultdict(list)
    for v in rollup:
        for f in ("original_sha256","museum_print_sha256"):
            sha=(v.get(f) or "").lower()
            if re.fullmatch(r"[a-f0-9]{64}",sha):
                source_by_sha[sha].append(v)
    # Only same frozen ID + exact measured SHA can establish a candidate
    # licence claim; an acquisition's URL/source slug is insufficient.
    evidence_files={
      "sacred-art-b29-seven-exact-acquisition-results.csv":("downloaded_sha256","license_claim"),
      "sacred-art-b30-six-selected-acquisition.csv":("download_sha256","current_file_license"),
      "sacred-art-b31-29-candidate-results.csv":("original_file_sha256_measured","current_metadata_license"),
      "sacred-art-b32-15-source-file-results.csv":("current_download_sha256","current_license"),
      "sacred-art-b33-six-source-decisions.csv":("downloaded_sha256","current_Commons_license"),
      "sacred-art-b34-35-source-results.csv":("downloaded_sha256","current_commons_license"),
      "sacred-art-b35-3-originals-results.csv":("actual_image_sha256","source_file_license_current"),
      "sacred-art-b35-kress2-results.csv":("download_sha256","rights_text_status"),
      "sacred-art-b35-nga2-results.csv":("download_sha256","NGA_image_openaccess"),
      "sacred-art-b36-four-file-results.csv":("sha256","current_license"),
      "sacred-art-b37-four-source-results.csv":("sha256","current_commons_license"),
      "sacred-art-b38-kmska-cc0-source-results.csv":("sha256","current_commons_license"),
      "sacred-art-b39-two-commons-source-results.csv":("sha256","current_commons_license"),
      "sacred-art-b40-wuilleret-commons-crossmatch-results.csv":("commons_sha256","current_commons_license_claim")
    }
    explicit=defaultdict(list)
    for filename,(sha_key,license_key) in evidence_files.items():
        for row in rows(ROOT/filename):
            digest=(row.get(sha_key) or "").lower()
            id_=row.get("artwork_id","")
            if not re.fullmatch(r"[a-f0-9]{64}",digest):continue
            if id_ not in old:continue
            explicit[(id_,digest)].append({
                "file":filename,
                "source_license_as_reported":row.get(license_key,""),
                "source_sha":digest,
                "institution_open_claim":filename in
                   ("sacred-art-b35-nga2-results.csv","sacred-art-b35-kress2-results.csv")
            })
    # Source licensing claims never imply a selected final output.
    ledgers=[]
    for current in baseline:
        id_=current["artwork_id"]
        oldrow=old[id_]
        shas=[x.strip() for x in current["recorded_source_sha256"].split(" | ") if x.strip()]
        attached=[]
        for digest in shas:
            for source in source_by_sha[digest]:
                attached.append({"digest":digest,"source":source["source_evidence_link"] or source["source_url"],
                   "licence":source["metadata_license"],
                   "rights_gate":source["rights_gate"],
                   "recorded_unverified":source["recorded_rights_unverified"],
                   "recorded_photo_editorial":source["editorial_approval"],
                   "source_type":source["source_type"],
                   "rights_class":"PRESERVED_ACQUISITION_SOURCE_METADATA_NO_OBJECT_LEVEL_REUSE_ATTESTATION"})
            attached.extend(explicit.get((id_,digest),[]))
        positive=[x for x in attached if (
            LICENSE_SEEMS_OPEN.search(str(x.get("licence","")) or str(x.get("source_license_as_reported","")) or "") or
            x.get("institution_open_claim"))]
        negatives=[x for x in attached if LICENSE_SEEMS_RESTRICTED.search(
            str(x.get("licence",""))+" "+str(x.get("source_license_as_reported","")))]
        older_approved=oldrow["frozen_decision"]=="APPROVED_LOCKED"
        reported_open=len(positive)
        reason=("OPEN_LICENSE_METADATA_RECORDED_BUT_COMMERCIAL_PHOTO_REUSE_AND_IDENTITY_NOT_JOINTLY_APPROVED" if reported_open else
                "NO_ATTRIBUTED_OPEN_PHOTO_SOURCE_RIGHTS_IN_MATCHED_ARCHIVE_RECORDS")
        if id_ in ("G28-003","W04-009","G27-002"):
            reason="SPECIFIC_PHOTO_REPRODUCTION_PERMISSION_HOLD"
        if id_ in ("celine-1894-john-cross","carmel-lisieux-1925-therese-aux-roses"):
            reason="UNDERLYING_ARTWORK_COPYRIGHT_HOLD"
        if "PREEXISTING_ARCHIVE_SOURCE_ALIAS" in current["preservation_evidence_cohort"]:
            reason="ALIAS_ONLY_NO_DIRECT_FROZEN_OBJECT_IMAGE_IDENTITY"
        if not current["physical_source_present"] or current["physical_source_present"]=="False":
            if not shas:reason="NO_EXACT_FROZEN_ARTWORK_SHA_SOURCE"
        ledgers.append({
          "artwork_id":id_,"title":current["title"],"artist":current["artist"],
          "frozen_decision":current["frozen_decision"],"priority":current["priority"],
          "B48_source_cohort":current["preservation_evidence_cohort"],
          "some_source_preserved":current["physical_source_present"],
          "complete_object_research_source":current["provisional_complete_work_photo_source"],
          "source_SHA_count":len(shas),"source_sha256":" | ".join(shas),
          "attached_older_acquisition_rights_metadata_records":len(attached),
          "source_records_with_open_licence_metadata_claim":reported_open,
          "source_records_with_explicit_restriction_text":len(negatives),
          "source_rights_evidence_class":reason,
          "has_open_license_metadata_claim":bool(reported_open),
          "has_owner_granted_exact_selected_photo_commercial_reuse":False,
          "photo_subject_composition_independently_release_certified":False,
          "frozen_editorial_artwork_preapproved":older_approved,
          "historical_selected_exact_source_SHA_verified_for_app_release":False,
          "app_reproduction_approved":False,
          "ready_to_ship_end_to_end_certified":False,
          "action":"OBJECT_IDENTITY_AND_PHOTO_RIGHTS_REVIEW" if current["physical_source_present"]=="True" else "EXACT_ORIGINAL_SOURCE_DISCOVERY_OR_ALIAS_CLEARANCE"
        })
    write(OUT,ledgers)
    repo=git_files()
    gallery,non_images,tar_total,tar_bytes=gallery_records()
    photo_candidates=[]
    for tracked in repo:
        image=tracked["_im"]
        source=[x for x in gallery if x["sha256"]==tracked["sha256"]]
        close=[]
        if image and not source:
            for oldpreview in gallery:
                if abs(oldpreview["ratio"]/image["ratio"]-1)>0.075:continue
                d=(image["dhash"]^oldpreview["dhash"]).bit_count()
                if d<=8:
                    close.append((d,oldpreview))
            close.sort(key=lambda x:x[0])
        candidate=source or [r for d,r in close[:5]]
        photo_candidates.append({
         "git_tracked_image_path":tracked["path"],
         "git_sha256":tracked["sha256"],
         "git_file_bytes":tracked["bytes"],
         "width":tracked["width"],"height":tracked["height"],
         "image_decodes_as_photo_size":tracked["candidate_scene"],
         "gallery_exact_SHA_matches":len(source),
         "gallery_perceptual_potential_count":len(close),
         "lowest_64bit_dhash_distance":close[0][0] if close else "",
         "matched_gallery_paths":" | ".join(x["member"] for x in candidate[:5]),
         "matching_evidence_level":"EXACT_BINARY_GALLERY_MATCH_NOT_CANONICAL_ID" if source else (
            "PHASH_SIMILARITY_UNVALIDATED_SOURCE_ID" if close else "NO_MATCH"),
         "frozen_ID_promoted":"NO",
         "editorial_or_photo_rights_granted":"NO"
        })
    write(IMAGES,photo_candidates)
    status=Counter(x["source_rights_evidence_class"] for x in ledgers)
    matches=Counter(x["matching_evidence_level"] for x in photo_candidates)
    result={
        "schema":"AO_B49_ALL383_PHOTO_REUSE_AND_GIT_IMAGE_VISUAL_RECONCILIATION_V1",
        "date":"2026-10-24",
        "active_frozen_artworks":383,
        "previous_complete_original_source_evidence":b48["active_with_provisional_complete_object_research_photo"],
        "preserved_any_source":b48["active_with_some_actual_research_original_source"],
        "remaining_complete_object_source_gaps":b48["active_missing_complete_object_photo"],
        "historically_selected_artwork_counts_preserved":107,
        "per_photo_source_license_metadata_claim_artworks":sum(x["has_open_license_metadata_claim"] for x in ledgers),
        "per_photo_source_license_metadata_claim_note":"Metadata claims are NOT final legal clearance; licenses may refer to the database object rather than photograph and version, and choice of preferred image may differ.",
        "rights_evidence_class_counts":dict(status),
        "confirmed_commercial_app_reusable_selected_exact_photos_end_to_end":0,
        "end_to_end_release_readiness_certification_completed":False,
        "zero_certifications_means_unchecked_not_forbidden":True,
        "photographic_files_in_git":len(repo),
        "git_photo_bytes":sum(x["bytes"] for x in repo),
        "git_files_that_decode_at_minimum_350px":sum(x["candidate_scene"] for x in repo),
        "legacy_gallery_supplementary_tar_archive":GALLERY_TAR,
        "legacy_gallery_tar_bytes":tar_bytes,
        "legacy_gallery_tar_members":tar_total,
        "legacy_gallery_valid_photo_previews":len(gallery),
        "legacy_gallery_non_image_members":len(non_images),
        "git_to_gallery_visual_candidate_outcomes":dict(matches),
        "git_art_image_SHA_direct_matches_to_B48_catalogue":b48["catalogue_artworks_with_matching_image_SHA_inside_current_git_tree"],
        "git_perceptual_similarity_is_not_source_identity_or_permission":True,
        "all383_ledger_path":str(OUT),
        "all_git_image_candidate_path":str(IMAGES),
        "new_frozen_catalogue_artwork_sources_promoted":0,
        "new_photo_reuse_approvals":0,
        "new_editorial_approvals":0,
        "new_app_publication_changes":0,
        "no_additional_paid_storage_or_services":True,
        "cost_eur":0,
        "next_actions":[
            "Resolve 3 archived source aliases without incorrectly treating Rubens preparatory oil modelli as finished original paintings.",
            "Audit meaningful perceptual git-gallery matches by filename and visually inspect; no automated source adoption.",
            "Use positive owner rights and exact SHA evidence to produce high confidence editorial release candidates; separate historic approved artworks from photographer image versions.",
            "Continue new exact-object source acquisition for 23 no-source paintings and two partial-only cases only when new genuinely accessible source evidence emerges."
        ]
    }
    REPORT.write_text(json.dumps(result,indent=2)+"\n")
    print("B49_FULL383_RIGHTS_AND_GIT_REPORT",json.dumps({
        "n":len(ledgers),"rights_claim_count":result["per_photo_source_license_metadata_claim_artworks"],
        "rights_count":dict(status),"git_files":len(repo),
        "git_images_350px":result["git_files_that_decode_at_minimum_350px"],
        "gallery_previews":len(gallery),"match_outcomes":dict(matches),
        "publishable_certified":result["confirmed_commercial_app_reusable_selected_exact_photos_end_to_end"],
        "source_gaps":result["remaining_complete_object_source_gaps"]
    }),flush=True)
if __name__=="__main__":main()
