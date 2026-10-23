#!/usr/bin/env python3
"""B26: verify whether 108 legacy-preview-only artworks have a traceable
source file in the checked-out repository; do NOT confuse workbook preview
flags with actual publication masters.

A basename/ID match is a lead, never evidence of image identity by itself.
"""
import csv,hashlib,json,pathlib,re,subprocess
from collections import Counter
from datetime import datetime,timezone
ROOT=pathlib.Path("data/research")
CANON=ROOT/"sacred-art-catalogue451-snapshot.json"
STATE=ROOT/"sacred-art-catalogue451-after-b25.csv"
OUT=ROOT/"sacred-art-b26-legacy108-repo-photo-audit.csv"
REPORT=ROOT/"sacred-art-b26-legacy108-repo-photo-audit.summary.json"
FIELDS=["artwork_id","frozen_decision","work_title","legacy_photo_count_claimed",
"selected_photo_reference","selected_photo_expected_sha256","selected_photo_expected_filename",
"tracked_file_match_basis","candidate_tracked_file_paths","candidate_file_count",
"actual_file_sha256","hash_match_to_workbook_reference","binary_readable",
"binary_is_git_lfs_pointer","image_dimensions","image_decode_status",
"source_reuse_rights","identity_provenance","historical_editorial_approval",
"actual_new_release_approval","next_action"]
ART_SUFFIX={".jpg",".jpeg",".png",".tif",".tiff",".webp",".jp2",".avif",".mpo",".gif"}
def sha(path):
    h=hashlib.sha256()
    with path.open("rb") as fd:
        for block in iter(lambda:fd.read(1<<20),b""):h.update(block)
    return h.hexdigest()
def main():
    snap=json.loads(CANON.read_text(encoding="utf-8"))
    base={r["id"]:r for r in snap["rows"]}
    with STATE.open(newline="",encoding="utf-8") as f:rows=list(csv.DictReader(f))
    entries=[r for r in rows if r["catalogue_bucket"]=="LEGACY_PREVIEW_ONLY"]
    assert len(entries)==108,(len(entries),[r["artwork_id"] for r in entries[:5]])
    assert len(base)==451
    tracked=subprocess.check_output(["git","ls-files","-z"],text=True).split("\0")
    candidates=[pathlib.Path(x) for x in tracked if x and pathlib.Path(x).suffix.lower() in ART_SUFFIX]
    names={}
    for path in candidates:names.setdefault(path.name.lower(),[]).append(path)
    result=[]
    for r in entries:
        c=base[r["artwork_id"]]
        old=(c.get("selected_photo") or "").split("|")
        hashval=next((x.lower() for x in old if re.fullmatch("[a-fA-F0-9]{64}",x)), "")
        basename=next((x for x in old if pathlib.Path(x).suffix.lower() in ART_SUFFIX),"")
        chosen=names.get(basename.lower(),[]) if basename else []
        basis="EXACT_RECORDED_BASENAME" if chosen else ("NO_RECORDED_FILENAME" if not basename else "RECORDED_FILENAME_NOT_TRACKED")
        if not chosen:
            idmatches=[x for x in candidates if x.stem.casefold().startswith((r["artwork_id"]+"-").casefold()) or x.stem.casefold()==r["artwork_id"].casefold()]
            if idmatches:
                chosen=idmatches
                basis="ARTWORK_ID_FILENAME_LEAD_ONLY"
        item={k:"" for k in FIELDS}
        item.update(artwork_id=r["artwork_id"],frozen_decision=r["frozen_decision"],work_title=r["title"],
            legacy_photo_count_claimed=c.get("photos",""),selected_photo_reference=c.get("selected_photo",""),
            selected_photo_expected_sha256=hashval,selected_photo_expected_filename=basename,
            tracked_file_match_basis=basis,candidate_tracked_file_paths=" | ".join(map(str,chosen[:12])),
            candidate_file_count=len(chosen),hash_match_to_workbook_reference="NOT_VERIFIED",
            binary_readable="NO",binary_is_git_lfs_pointer="UNKNOWN",image_decode_status="NOT_VERIFIED",
            source_reuse_rights="NOT_VERIFIED",identity_provenance="NOT_VERIFIED",
            historical_editorial_approval=r["frozen_selection"],
            actual_new_release_approval="NO")
        if len(chosen)==1:
            path=chosen[0]
            if path.is_file():
                item["binary_readable"]="YES"
                b=path.read_bytes()[:180]
                lfs=b.startswith(b"version https://git-lfs.github.com/spec/v1")
                item["binary_is_git_lfs_pointer"]="YES" if lfs else "NO"
                if not lfs and path.stat().st_size<95_000_000:
                    digest=sha(path)
                    item["actual_file_sha256"]=digest
                    item["hash_match_to_workbook_reference"]="YES" if hashval and digest==hashval else ("NO" if hashval else "UNKNOWN_NO_EXPECTED_HASH")
                    try:
                        from PIL import Image
                        with Image.open(path) as image:
                            image.load()
                            item["image_decode_status"]="SUCCESS"
                            item["image_dimensions"]=f"{image.width}x{image.height}"
                    except Exception:
                        item["image_decode_status"]="FAILED_OR_NON_IMAGE"
        item["next_action"]=("TRACKED_BINARY_HAS_CORRECT_HASH_VALIDATE_RIGHTS_AND_IDENTIFICATION"
            if item["hash_match_to_workbook_reference"]=="YES" else
            "LOCATE_EXACT_LEGACY_SOURCE_BINARY_OUTSIDE_GIT_OR_ACQUIRE_NEW_INSTITUTION_FILE")
        result.append(item)
    with OUT.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(result)
    summary={
        "artworks_with_only_legacy_preview":108,"originally_approved_among_legacy":sum(x["historical_editorial_approval"]=="YES" for x in result),
        "total_tracked_image_file_candidates":len(candidates),
        "entries_with_selected_filename_recorded":sum(bool(x["selected_photo_expected_filename"]) for x in result),
        "entries_with_exact_tracked_selected_basename":sum(x["tracked_file_match_basis"]=="EXACT_RECORDED_BASENAME" for x in result),
        "entries_with_any_tracked_file_lead":sum(int(x["candidate_file_count"])>0 for x in result),
        "entries_with_binary_sha256_matching_workbook":sum(x["hash_match_to_workbook_reference"]=="YES" for x in result),
        "entries_with_decoded_binary":sum(x["image_decode_status"]=="SUCCESS" for x in result),
        "new_editorial_approvals":0,"new_publication_approvals":0,
        "important_caveat":"Git checkout is only one asset location: NOT_FOUND does not prove the user's original workbook, file library, GitHub Actions archives or other project storage lacks the file.",
        "created_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")
    }
    REPORT.write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY",json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
