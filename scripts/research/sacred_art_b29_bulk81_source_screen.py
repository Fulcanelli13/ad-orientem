#!/usr/bin/env python3
"""Bulk screen 81 pre-existing source variants for 64 frozen P0 artworks.

Live metadata-only queries to Commons. Never download binary images, infer
subject correctness, approve a new variant, or write into app assets.
"""
from collections import Counter
import csv
import json
from pathlib import Path
import time
from urllib.parse import urlsplit

from sacred_art_b29_exact_selected import metadata_for

DATA=Path("data/research")
IN=DATA/"sacred-art-b29-p0-64-all-81-photo-variants.json"
OUT=Path("artifacts/sacred-art-b29-bulk81-source-screen")
STRONG={"EXISTING_OBJECT_LINKED_FILE","VERIFIED_ANTWERP_ROSARY_ORIGINAL_SOURCE_PHOTO",
        "EXACT_ORIGINAL_FULL_ASPECT_NATIVE_IMAGE_ACQUIRED"}
LICENCES={"Public domain":{"Public domain","PD-old-100","PD-old","PD-Art"},
          "CC0":{"CC0","Public domain"},
          "CC BY-SA 3.0":{"CC BY-SA 3.0"},
          "CC BY-SA 4.0":{"CC BY-SA 4.0"}}
FIELDNAMES=["artwork_id","title","frozen_decision","photo_key","source_page",
            "original_url","identity_basis","prior_selected_reference",
            "historical_gallery_master_sha256","license_claim","current_commons_license",
            "current_commons_license_url","metadata_recorded_width",
            "metadata_recorded_height","technical_long_edge",
            "source_identity_gate","live_licence_gate","bulk_status","next_action",
            "failure","publication_allowed"]

def main():
    j=json.loads(IN.read_text(encoding="utf-8"))
    assert j["artwork_records"]==64 and j["photo_variants"]==81
    assert j["research_only"] is True and j["approved_publication_count"]==0
    recovered=json.loads((DATA/"sacred-art-b29-selected-exact7-corrected.summary.json").read_text())
    assert recovered["forensically_verified_exact_selected_originals"]==7
    exact_ids={r["artwork_id"] for r in recovered["files"]}
    assert len(exact_ids)==7
    cache={}
    outputs=[]
    for art in j["rows"]:
        for photo in art["photo_variants"]:
            page=photo["source_page"]
            row={k:"" for k in FIELDNAMES}
            row.update({
              "artwork_id":art["artwork_id"],"title":art["title"],
              "frozen_decision":art["frozen_decision"],"photo_key":photo["photo_key"],
              "source_page":page,"original_url":photo["original_url"],
              "identity_basis":photo["identity_basis"],
              "prior_selected_reference":"YES" if photo["selected_historical_preview_sha_match"] else "NO",
              "historical_gallery_master_sha256":photo["original_recorded_sha256"],
              "license_claim":photo["license_claim"],
              "technical_long_edge":max(int(photo["width"]),int(photo["height"])),
              "source_identity_gate":"EXISTING_SOURCE_LINK" if photo["identity_basis"] in STRONG else "IDENTITY_HOLD",
              "publication_allowed":"NO"})
            if urlsplit(page).hostname!="commons.wikimedia.org":
                row.update(live_licence_gate="INSTITUTION_REVIEW",bulk_status="INSTITUTIONAL_PHOTO_RIGHTS_HOLD",
                           next_action="EXACT_MUSEUM_PHOTO_REUSE_PERMISSION_AND_ORIGINAL_FILE")
                outputs.append(row)
                continue
            if page not in cache:
                try:
                    cache[page]={"ok":metadata_for(page)}
                except Exception as e:
                    cache[page]={"error":type(e).__name__+": "+str(e)[:220]}
                time.sleep(0.8)
            entry=cache[page]
            if "error" in entry:
                row.update(live_licence_gate="METADATA_UNAVAILABLE",
                           bulk_status="METADATA_UNAVAILABLE_HOLD",
                           failure=entry["error"],next_action="RETRY_RATE_LIMITED_SOURCE_METADATA")
            else:
                m=entry["ok"]
                row.update(current_commons_license=m["license_short_name"],
                           current_commons_license_url=m["license_url"],
                           metadata_recorded_width=m["metadata_width"],
                           metadata_recorded_height=m["metadata_height"])
                license_ok=m["license_short_name"] in LICENCES.get(photo["license_claim"],set())
                row["live_licence_gate"]="CURRENT_METADATA_COMPATIBLE" if license_ok else "RIGHTS_DISCREPANCY_HOLD"
                if not license_ok:
                    row.update(bulk_status="RIGHTS_CLAIM_CONFLICT_HOLD",
                               next_action="RECHECK_FILE_LICENSE_OR_REPLACE_WITH_RIGHTS_VERIFIED_SOURCE")
                elif photo["identity_basis"] not in STRONG:
                    row.update(bulk_status="ARTWORK_IDENTITY_HOLD",
                               next_action="CONFIRM_EXACT_WORK_AND_HISTORIC_SELECTION_NO_AUTOMATIC_PROMOTION")
                elif art["artwork_id"] in exact_ids and photo["selected_historical_preview_sha_match"]:
                    row.update(bulk_status="B29_SELECTED_ORIGINAL_ALREADY_RECOVERED",
                               next_action="KEEP_TECHNICAL_MASTER_PRESERVED_HOLD_PUBLICATION_QA")
                else:
                    row.update(bulk_status="SOURCE_METADATA_SUPPORTED_NOT_SELECTED_MASTER",
                               next_action="HUMAN_SELECTION_AND_IMAGE_HASH_CONFIRMATION_BEFORE_ACQUISITION")
            outputs.append(row)
    assert len(outputs)==81
    assert len({r["artwork_id"] for r in outputs})==64
    OUT.mkdir(parents=True,exist_ok=True)
    with (OUT/"sacred-art-b29-81-live-source-screener.csv").open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=FIELDNAMES)
        writer.writeheader();writer.writerows(outputs)
    summary={
      "schema":"AO_SACRED_ART_B29_P0_81_SOURCE_METADATA_SCREEN_V1",
      "artwork_records":64,"source_variant_records":81,
      "unique_source_pages_checked_or_explicitly_held":len(cache)+sum(urlsplit(r["source_page"]).hostname!="commons.wikimedia.org" for r in outputs),
      "status_counts":dict(Counter(r["bulk_status"] for r in outputs)),
      "licence_gate_counts":dict(Counter(r["live_licence_gate"] for r in outputs)),
      "identity_gate_counts":dict(Counter(r["source_identity_gate"] for r in outputs)),
      "historically_selected_bytes_already_preserved":7,
      "new_binary_downloads_this_screen":0,
      "new_editorial_approvals":0,"new_publication_approvals":0,
      "frozen_catalogue_unchanged":True,
      "rights_source_claim_only_not_distribution_clearance":True,
      "no_paid_services":True}
    (OUT/"sacred-art-b29-81-live-source-screener.summary.json").write_text(
        json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print("B29_P0_81_METADATA_SCREEN_COMPLETED",json.dumps(summary),flush=True)

if __name__=="__main__":
    main()
