#!/usr/bin/env python3
"""B32 source-backed bulk adjudication for 22 P0 image identity/rights holds.

An institutional object's existence is not proof that an unselected Wikimedia
photo depicts that very object; therefore 15 corroborated objects are still
research-only candidate sources, not released artworks. Explicit mismatches
are NEVER sent to the candidate acquisition subset.
"""
from collections import Counter
import csv
import json
from pathlib import Path
from urllib.parse import urlsplit

BASE=Path("data/research")
OUT=Path("artifacts/sacred-art-b32-22-evidence")
SUPPORT={"OBJECT_CORROBORATED_PHOTO_HOLD","SERIES_CORROBORATED_PHOTO_HOLD"}
DISPOSITIONS=SUPPORT|{"OBJECT_MISMATCH_QUARANTINE","UNRESOLVED_IDENTITY_HOLD","INSTITUTIONAL_REUSE_RESTRICTED"}
HEADERS=["artwork_id","title","artist","frozen_decision","previous_disposition",
         "B32_evidence_disposition","institution","institution_object_id",
         "institution_source_url","corroboration_explanation",
         "existing_candidate_gallery_sha256","existing_candidate_commons_page",
         "existing_candidate_original_url","previous_current_license_claim",
         "photographic_object_identity_certified","selected_photo_hash_unchanged",
         "publication_reuse_approved","automatic_editorial_promotion","next_action"]

def read(name):
    with (BASE/name).open(encoding="utf-8",newline="") as stream:
        return list(csv.DictReader(stream))

def write(path, rows, columns):
    path.parent.mkdir(parents=True,exist_ok=True)
    with path.open("w",encoding="utf-8",newline="") as stream:
        w=csv.DictWriter(stream,fieldnames=columns,extrasaction="ignore")
        w.writeheader();w.writerows(rows)

def main():
    evidence=json.loads((BASE/"sacred-art-b32-22-institutional-identity-evidence.json").read_text())
    review=evidence["records"]
    original=read("sacred-art-b30-remaining51-p0-acquisition-gates.csv")
    first=read("sacred-art-b31-29-candidate-results.csv")
    allgallery=json.loads((BASE/"sacred-art-b29-p0-64-all-81-photo-variants.json").read_text())
    assert evidence["new_editorial_approvals"]==0 and evidence["new_publication_approvals"]==0
    assert len(review)==22 and len({r["artwork_id"] for r in review})==22
    assert len(original)==51 and len(first)==29 and len(allgallery["rows"])==64
    earlier={r["artwork_id"]:r for r in original}
    previously_archived={r["original_file_sha256_measured"] for r in first}
    allgallery_by_id={r["artwork_id"]:r for r in allgallery["rows"]}
    assert set(earlier)==set(r["artwork_id"] for r in review) | set(r["artwork_id"] for r in first)
    assert all(r["disposition"] in DISPOSITIONS for r in review)
    assert len([r for r in review if r["disposition"] in SUPPORT])==15
    assert len([r for r in review if r["disposition"]=="OBJECT_MISMATCH_QUARANTINE"])==3
    assert len([r for r in review if r["disposition"]=="UNRESOLVED_IDENTITY_HOLD"])==3
    assert len([r for r in review if r["disposition"]=="INSTITUTIONAL_REUSE_RESTRICTED"])==1

    # Exact high-impact wrong-photo regression locks. Never acquire/promote.
    mismatch={
     "ART-usepe-de-ibera-aint-eter-postolate":"Penitent",
     "G25-003":"Coronation_of_the_Virgin",
     "ART-iandomenico-iepolo-an-olo-ia-rucis-tation-12-eath-on-the-ross":"VIA_CRUCIS_VIII",
    }
    review_by_id={r["artwork_id"]:r for r in review}
    assert all(review_by_id[ident]["disposition"]=="OBJECT_MISMATCH_QUARANTINE" for ident in mismatch)
    assert all(w in earlier[ident]["candidate_source_page"] for ident,w in mismatch.items())
    assert review_by_id["ART-uido-eni-usannah-and-the-lders"]["disposition"]=="INSTITUTIONAL_REUSE_RESTRICTED"
    assert "NG196" in review_by_id["ART-uido-eni-usannah-and-the-lders"]["institutional_object_id"]

    output=[]; candidates=[]
    for item in sorted(review,key=lambda r:r["artwork_id"]):
        id=item["artwork_id"]
        assert id in earlier and id in allgallery_by_id
        prev=earlier[id]
        assert prev["disposition"] in ("IDENTITY_HOLD_NO_NEW_ACQUISITION",
                                       "INSTITUTIONAL_REUSE_HOLD_NO_NEW_ACQUISITION")
        assert prev["new_candidate_as_approved_selected_original"]=="NO"
        assert prev["publication_rights_approved"]=="NO"
        assert prev["historically_selected_original_sha256"]=="UNRECORDED"
        sha=prev["candidate_original_sha_from_gallery_key"]
        gallery=allgallery_by_id[id]
        variants=[p for p in gallery["photo_variants"]
                  if p["candidate_original_file_sha256_from_gallery_key"]==sha]
        assert len(variants)==1 and variants[0]["source_page"]==prev["candidate_source_page"]
        assert variants[0]["original_url"]==prev["candidate_original_url"]
        if item["disposition"] in SUPPORT:
            assert item["institutional_source_url"].startswith("https://")
            assert urlsplit(prev["candidate_original_url"]).hostname in (
                "upload.wikimedia.org","thumb.wikimedia.org")
            assert urlsplit(prev["candidate_source_page"]).hostname=="commons.wikimedia.org"
            assert sha not in previously_archived
            action="OPTIONAL_RESEARCH_ONLY_DOWNLOAD_KEEP_IDENTITY_AND_EDITORIAL_HOLDS"
        elif item["disposition"]=="OBJECT_MISMATCH_QUARANTINE":
            action="REJECT_WRONG_PHOTO_AND_SEARCH_EXACT_INSTITUTIONAL_WORK_NO_DOWNLOAD"
        elif item["disposition"]=="INSTITUTIONAL_REUSE_RESTRICTED":
            action="FIND_OPEN_PHOTO_OR_GET_INSTITUTIONAL_PERMISSION_NOT_LICENSED_FOR_COMMERCIAL_REUSE"
        else:
            action="INSPECT_ATTESTED_OBJECT_ACCESSION_AND_IMAGE_FULL_COMPOSITION_FIRST"
        row={
          "artwork_id":id,"title":prev["title"],"artist":prev["artist"],
          "frozen_decision":prev["frozen_decision"],"previous_disposition":prev["disposition"],
          "B32_evidence_disposition":item["disposition"],"institution":item["institution"],
          "institution_object_id":item["institutional_object_id"],
          "institution_source_url":item["institutional_source_url"],
          "corroboration_explanation":item["evidence_reason"],
          "existing_candidate_gallery_sha256":sha,
          "existing_candidate_commons_page":prev["candidate_source_page"],
          "existing_candidate_original_url":prev["candidate_original_url"],
          "previous_current_license_claim":prev["candidate_current_commons_license"],
          "photographic_object_identity_certified":"NO",
          "selected_photo_hash_unchanged":"YES",
          "publication_reuse_approved":"NO",
          "automatic_editorial_promotion":"NO",
          "next_action":action,
        }
        output.append(row)
        if item["disposition"] in SUPPORT:candidates.append(row)
    assert len(output)==22 and len(candidates)==15
    assert len({x["existing_candidate_gallery_sha256"] for x in candidates})==15
    assert all(x["B32_evidence_disposition"] in SUPPORT for x in candidates)
    assert not set(mismatch)&{x["artwork_id"] for x in candidates}
    OUT.mkdir(parents=True,exist_ok=True)
    write(OUT/"sacred-art-b32-all22-institutional-evidence-gates.csv",output,HEADERS)
    write(OUT/"sacred-art-b32-fifteen-provisional-source-queue.csv",candidates,HEADERS)
    summary={
      "schema":"AO_SACRED_ART_B32_IDENTITY_RIGHTS_22_REVIEW_V1",
      "original_p0_holds_reviewed":22,
      "institutional_object_corrob_photo_unverified":13,
      "documented_rosary_series_corrob_photo_unverified":2,
      "explicitly_wrong_photo_quarantined":3,
      "unresolved_identity_no_download":3,
      "institutional_photo_reuse_restriction":1,
      "source_backed_photo_candidates_research_only":15,
      "previous_recovered_P0_files":42,
      "new_originals_acquired_in_this_adjudication":0,
      "artwork_photo_identity_certified":0,
      "source_photo_publication_approvals":0,
      "new_editorial_approvals":0,
      "frozen_choices_changed":False,
      "next_step":"Separate research-only byte recovery of 15 corroborated candidates; all identity and reuse holds persist until photo matched",
    }
    (OUT/"sacred-art-b32-22-evidence-summary.json").write_text(
        json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print("B32_22_INSTITUTIONAL_EVIDENCE_GATES_CHECKED",json.dumps(summary),flush=True)

if __name__=="__main__":
    main()
