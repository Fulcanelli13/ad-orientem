#!/usr/bin/env python3
"""B48: physical-first all-383 Sacred Art preservation and publication-gate audit.

Reuses individually SHA-verified B26 (B19-25), B29-B44 ledgers and performs
fresh online presence check of all unpublished GitHub Release assets.
Correlates *stable IDs*, never titles. Scans actual git-tracked image bytes
and compares SHA digests to previously verified source SHA.
No gallery addition, editorial/rights approval, image download, or app edit.
"""
from collections import Counter,defaultdict
from pathlib import Path
import csv,hashlib,json,re,subprocess
ROOT=Path("data/research")
RESULT=ROOT/"sacred-art-b48-383-preserved-image-and-publication-gates.json"
CSV=ROOT/"sacred-art-b48-383-photo-preservation-ledger.csv"
SAMPLES=ROOT/"sacred-art-b48-unmatched-repo-image-physical-summary.json"
REPO="Fulcanelli13/ad-orientem"
IMAGE_SUFFIXES={".jpg",".jpeg",".png",".webp",".tif",".tiff",".avif",".jp2",".bmp",".gif",".mpo"}
HASH=re.compile(r"^[0-9a-f]{64}$")

def data(name):return json.loads((ROOT/name).read_text())
def readcsv(name):
    with (ROOT/name).open("r",encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def rows_file(path):
    with path.open("w",encoding="utf-8",newline="") as f:
        return
def sha(path):
    h=hashlib.sha256()
    with path.open("rb") as f:
        for b in iter(lambda:f.read(1024*1024),b""):h.update(b)
    return h.hexdigest()
def release_metadata():
    raw=subprocess.check_output(
        ["gh","api",f"repos/{REPO}/releases?per_page=100"],text=True)
    rows=json.loads(raw)
    if not isinstance(rows,list):raise RuntimeError("Cannot inspect archive assets")
    releases={x["tag_name"]:x for x in rows}
    tag="sacred-art-originals-b26-20261024"
    x=releases.get(tag)
    if not x or x.get("draft") is not True:raise RuntimeError("B26 originals missing or public")
    primary={f"ao-source-b26-{w}.tar" for w in
     ["b19","b20","b21","b21r1","b21r2","b20r1",
      "b22nga","b22kress","b23p1","b23p2","b23commons35",
      "b23r2commons46","b23r3mpo","b24exact8","b24exact4","b25ribera"]}
    listed={a["name"]:a for a in x.get("assets",[])}
    if not primary.issubset(listed):raise RuntimeError("Missing B26 actual preserved primary tar "+str(sorted(primary-set(listed))))
    if any(listed[n].get("size",0)<4096 for n in primary):raise RuntimeError("Empty B26 archive in release")
    # B27 also created 10 supplemental archive assets, not included in B27
    # byte-linked 290 primary instance count.
    supplement=[n for n in listed if n.startswith("ao-supplement-b27-") and n.endswith(".tar")]
    secondary=[
        {"tag":tag,"asset":n,"size":listed[n]["size"],"is_draft":True,
         "source_group":"B19_B25_PRIMARY_PRIOR_BYTE_VERIFIED"} for n in sorted(primary)]
    later=[]
    for t,r in releases.items():
        if not re.fullmatch(r"ao-art-originals-\d+-1",t):continue
        if r.get("draft") is not True:raise RuntimeError("Preservation research Release was published: "+t)
        for asset in r.get("assets",[]):
            if asset["name"].endswith(".tar"):
                later.append({"tag":t,"asset":asset["name"],"size":asset["size"],
                    "is_draft":True,"source_group":"LATER_RESEARCH_RELEASE_PRIOR_REMOTE_SHA_VERIFIED"})
    real=[r for r in later if "synthetic-test" not in r["asset"]]
    if len(real)<18:raise RuntimeError("Unexpected missing recent artwork archives: "+str(len(real)))
    return {"primary":secondary,"later":real,
        "supplemental_b27_assets":sorted(supplement),
        "supplemental_b27_asset_count":len(supplement),
        "B26_primary_asset_bytes":sum(listed[n]["size"] for n in primary),
        "later_real_archive_asset_bytes":sum(r["size"] for r in real),
        "releases_total_visible":len(rows),
        "legacy_primary_asset_count":len(primary),
        "later_real_archive_asset_count":len(real),
        "all_required_draft":True,
        "current_byte_redownload_note":"The B26 archive was independently SHA-read back and byte-verified in B27; the newer archives were SHA re-read on acquisition workflows. B48 rechecked REMOTE ASSET PRESENCE and draft status, not another 4GB complete redownload."}

def tracked_physical_sha():
    import os
    raw=subprocess.check_output(["git","ls-files","-z"])
    names=[Path(p.decode("utf-8","replace")) for p in raw.split(b"\0") if p]
    result=[]
    for p in names:
        if p.suffix.lower() not in IMAGE_SUFFIXES or not p.is_file():continue
        result.append({"path":p.as_posix(),"sha256":sha(p),"bytes":p.stat().st_size})
    return result

def validhash(value):
    v=str(value or "").strip().lower()
    return v if HASH.fullmatch(v) else None
def main():
    master=readcsv("sacred-art-b27-451-physical-crosswalk.csv")
    source=readcsv("sacred-art-b27-physical-image-inventory.csv")
    original_summary=data("sacred-art-b27-physical-summary.json")
    P0=data("sacred-art-b33-p0-64-complete-research-coverage.json")
    legacy=data("sacred-art-b34-74-final-physical-and-rights-matrix.json")
    forty=data("sacred-art-b35-383-active-40-gaps-closeout.json")
    thirty=data("sacred-art-b37-383-research-source-coverage-closeout.json")
    b41=data("sacred-art-b41-383-research-source-coverage-closeout.json")
    b42=data("sacred-art-b42-383-research-closeout-and-access-holds.json")
    b47=data("sacred-art-b47-383-offline-preview-no-publication-closeout.json")
    active=[r for r in master if r["frozen_decision"]!="PERMANENTLY_REJECTED"]
    ids={r["artwork_id"] for r in active}
    rejected=[r for r in master if r["frozen_decision"]=="PERMANENTLY_REJECTED"]
    assert len(master)==451 and len(active)==len(ids)==383 and len(rejected)==68
    B27={r["artwork_id"] for r in active if int(r["verified_distinct_sha256"])>0}
    p0_by={r["artwork_id"]:r for r in P0["rows"]}
    legacy_by={r["artwork_id"]:r for r in legacy["rows"]}
    cohort_by={r["artwork_id"]:r for r in forty["full40_reconciliation_rows"]}
    assert len(B27)==245
    assert len(p0_by)==64 and len(legacy_by)==74 and len(cohort_by)==40
    assert len(set(p0_by)|set(legacy_by)|B27)==383
    assert not B27.intersection(p0_by)
    assert not B27.intersection(legacy_by)
    assert not set(p0_by).intersection(legacy_by)
    P0_yes={id_ for id_,r in p0_by.items() if r["original_file_available_in_research_archive"] is True}
    assert len(P0_yes)==63
    legacy_yes={id_ for id_,r in legacy_by.items() if r["state"] in
                ("NEW_RESEARCH_SOURCE_PHOTO_ARCHIVED","PREEXISTING_ARCHIVE_SOURCE_ALIAS")}
    assert len(legacy_yes)==35
    assert B27.isdisjoint(P0_yes) and B27.isdisjoint(legacy_yes)
    assert len(B27|P0_yes|legacy_yes)==343
    if {id_ for id_ in p0_by if id_ not in P0_yes} != {"G25-003"}:
        raise RuntimeError("Unexpected B33 non-P0 present ids")
    outstanding={r["artwork_id"] for r in b42["cases"]}
    assert len(outstanding)==25 and outstanding.issubset(cohort_by)
    late_complete=set(cohort_by)-outstanding
    assert len(late_complete)==15
    partial={"G28-003","ART-uan-orrea-de-ivar-aint-awrence-aint-ilary-two-sided-altarpiece-panel"}
    assert partial.issubset(outstanding)
    late_partial=partial
    some=B27|P0_yes|legacy_yes|late_complete|late_partial
    complete=B27|P0_yes|legacy_yes|late_complete
    assert len(some)==360 and len(complete)==358
    assert ids-complete==outstanding
    assert ids-some==outstanding-partial
    assert b47["artworks_with_any_research_source"]==len(some)
    assert b47["artworks_with_complete_object_source"]==len(complete)
    releases=release_metadata()
    inventory=tracked_physical_sha()
    repo_bysha=defaultdict(list)
    for row in inventory:repo_bysha[row["sha256"]].append(row["path"])
    # Build all known archive SHA identities from prior physical registers,
    # not from subject-title guesses or downloaded alternative artwork pictures.
    prior_sha_byid=defaultdict(set)
    for r in active:
        for v in r["matching_file_hashes"].split(" | "):
            if validhash(v):prior_sha_byid[r["artwork_id"]].add(v.lower())
    for id_,r in p0_by.items():
        d=validhash(r.get("archived_source_sha256"))
        if d:prior_sha_byid[id_].add(d)
    for id_,r in legacy_by.items():
        for d in r.get("new_archived_sha",[]):
            if validhash(d):prior_sha_byid[id_].add(d.lower())
    late_byid={id_:set() for id_ in cohort_by}
    for name,arr in [
        ("sacred-art-b35-383-active-40-gaps-closeout.json","full40_reconciliation_rows"),
        ("sacred-art-b36-383-active-source-coverage-closeout.json","entire_original_gap_cohort_of_40"),
        ("sacred-art-b37-383-research-source-coverage-closeout.json","scope_30_cases")]:
        j=data(name)
        for row in j[arr]:
            id_=row["artwork_id"]
            for key in ("archived_source_sha256","B37_original_SHA"):
                sha_id=validhash(row.get(key))
                if id_ in late_byid and sha_id:late_byid[id_].add(sha_id)
    for id_,records in [
        ("W04-009","sacred-art-b41-three-institution-source-results.csv"),
        ("G28-003","sacred-art-b41-three-institution-source-results.csv")]:
        for row in readcsv(records):
            if row["artwork_id"]==id_:
                sh=validhash(row.get("sha256"))
                if sh:late_byid[id_].add(sh)
    for id_,sha_ids in late_byid.items():prior_sha_byid[id_].update(sha_ids)
    legacy_inventory={r["sha256"] for r in source}
    assert len(source)==290 and original_summary["physical_image_instances_byte_verified"]==290
    # SHA from B29+ written acquisition evidence is authoritative when it exists,
    # but is not necessarily an approved editorial source.
    explicit_new={id_:set() for id_ in ids}
    mappings=[
       ("sacred-art-b29-seven-exact-acquisition-results.csv","downloaded_sha256"),
       ("sacred-art-b30-six-selected-acquisition.csv","download_sha256"),
       ("sacred-art-b31-29-candidate-results.csv","original_file_sha256_measured"),
       ("sacred-art-b32-15-source-file-results.csv","current_download_sha256"),
       ("sacred-art-b33-six-source-decisions.csv","downloaded_sha256"),
       ("sacred-art-b34-35-source-results.csv","downloaded_sha256"),
       ("sacred-art-b35-3-originals-results.csv","actual_image_sha256"),
       ("sacred-art-b35-kress2-results.csv","download_sha256"),
       ("sacred-art-b35-nga2-results.csv","download_sha256"),
       ("sacred-art-b36-four-file-results.csv","sha256"),
       ("sacred-art-b37-four-source-results.csv","sha256"),
       ("sacred-art-b38-kmska-cc0-source-results.csv","sha256"),
       ("sacred-art-b39-two-commons-source-results.csv","sha256"),
       ("sacred-art-b40-wuilleret-source-results.csv","original_image_sha256"),
       ("sacred-art-b40-wuilleret-commons-crossmatch-results.csv","commons_sha256"),
       ("sacred-art-b41-three-institution-source-results.csv","sha256")
    ]
    for filename,column in mappings:
        for row in readcsv(filename):
            id_=row.get("artwork_id","")
            sha_v=validhash(row.get(column))
            if id_ in ids and sha_v:explicit_new[id_].add(sha_v)
            # Alternate-identity '@' suffix not canonical; never count it silently.
    for id_,h in explicit_new.items():prior_sha_byid[id_].update(h)
    locked_historical=[r for r in active if r["frozen_decision"] in
                       ("APPROVED_LOCKED","APPROVED_5")]
    # Mark a source as technically preserved via stable source SHA, not an
    # editorially selected / openly licenced exact-app photo.
    ledger=[]
    for r in active:
        id_=r["artwork_id"]
        if id_ in B27:origin="B19_B25_EXACT_SHA_ARCHIVED"
        elif id_ in P0_yes:origin="B29_B33_P0_RESEARCH_ARCHIVED"
        elif id_ in legacy_yes:origin="B34_LEGACY_SOURCE_ARCHIVED"
        elif id_ in late_complete:origin="B35_B41_FULL_SOURCE_RESEARCH_ARCHIVED"
        elif id_ in late_partial:origin="B35_B41_PARTIAL_ONLY_RESEARCH_ARCHIVED"
        else:origin="MISSING_EXACT_RESEARCH_ORIGINAL"
        shas=sorted(prior_sha_byid[id_])
        repo_hits=sorted({p for digest in shas for p in repo_bysha.get(digest,[])})
        b26_hashes=sorted(set(shas)&legacy_inventory)
        if id_ in B27 and not b26_hashes:
            raise RuntimeError("B27 stable old SHA not in physical-image inventory: "+id_)
        # Historic selected-photo identities are retained, but not independent
        # evidence of a currently distributable app reproduction.
        ledger.append({
          "artwork_id":id_,"title":r["title"],"artist":r["artist"],
          "frozen_decision":r["frozen_decision"],"priority":r["priority"],
          "physical_source_present":id_ in some,
          "provisional_complete_work_photo_source":id_ in complete,
          "preservation_evidence_cohort":origin,
          "historical_B26_SHA_links_count":len(b26_hashes),
          "B29_B41_recorded_exact_ID_sha_count":len(explicit_new[id_]),
          "all_recorded_source_sha_count":len(shas),
          "recorded_source_sha256":" | ".join(shas),
          "SHA_matched_git_tracked_photo_count":len(repo_hits),
          "SHA_matched_git_tracked_paths":" | ".join(repo_hits),
          "source_composition_still_to_validate":id_ not in complete or
               (id_ in B27 and r["match_basis"]=="PROVISIONAL_URL_ALIAS_AND_SOURCE_SHA"),
          "institution_specific_commercial_image_license_verified_for_selected_original":False,
          "editorial_photo_choice_attributed_to_exact_SHA_verified":False,
          "full_release_gate_certified":False,
          "note":"Exact source finding or SHA proves research physicality; not chosen best-quality/size or commercial photo permission."
        })
    with CSV.open("w",encoding="utf-8",newline="") as f:
        wr=csv.DictWriter(f,fieldnames=list(ledger[0]))
        wr.writeheader();wr.writerows(ledger)
    bycohort=dict(Counter(r["preservation_evidence_cohort"] for r in ledger))
    stats={
      "schema":"AO_B48_ALL_383_SACRED_ART_PHYSICAL_PRESERVATION_AND_RELEASE_CENSUS_V1",
      "audit_date":"2026-10-24",
      "active_frozen_artworks":383,"frozen_artwork_catalogue_total":451,
      "frozen_rejected":68,"frozen_approved_historical_decisions":107,
      "B26_older_original_physical_files_previously_byte_verified":290,
      "B26_older_original_bytes_previously_byte_verified":3076497763,
      "B26_older_original_distinct_SHA":original_summary["distinct_binary_sha256"],
      "B26_older_active_artwork_IDs_with_SHA-linked_original":245,
      "B29_B44_later_archive_original_file_count":122,
      "B29_B44_later_archive_image_bytes":710773181,
      "combined_early_and_later_image_file_instances_before_crosswave_dedupe":412,
      "combined_early_and_later_image_bytes_before_crosswave_dedupe":3787270944,
      "early_research_release_tags":["sacred-art-originals-b26-20261024"],
      "remote_unpublished_B26_primary_tar_count":releases["legacy_primary_asset_count"],
      "remote_unpublished_B26_extra_supplementary_tar_count":releases["supplemental_b27_asset_count"],
      "remote_unpublished_newer_research_tar_count":releases["later_real_archive_asset_count"],
      "all_required_remote_archives_exist_as_unpublished_drafts":releases["all_required_draft"],
      "archive_remote_verification_type":"Remote draft asset existence and size rechecked B48; exact full image SHA byte checking was completed in original B27/research acquisition workflows, NOT rerun for 3.8GB in B48.",
      "repo_git_tracked_image_files_hashed":len(inventory),
      "repo_git_tracked_image_file_bytes_hashed":sum(i["bytes"] for i in inventory),
      "catalogue_artworks_with_matching_image_SHA_inside_current_git_tree":
           sum(bool(r["SHA_matched_git_tracked_photo_count"]) for r in ledger),
      "B27_B33_B34_B35_B41_source_cohort_counts":bycohort,
      "active_with_some_actual_research_original_source":len(some),
      "active_with_provisional_complete_object_research_photo":len(complete),
      "active_with_partial_only_research_source":len(some-complete),
      "active_without_any_stable_physical_research_source":len(ids-some),
      "active_missing_complete_object_photo":len(ids-complete),
      "noncomplete_artwork_ids":sorted(ids-complete),
      "partial_only_artwork_ids":sorted(some-complete),
      "missing_any_artwork_ids":sorted(ids-some),
      "catalogue_artworks_with_recorded_physical_SHA_provenance":sum(bool(r["all_recorded_source_sha_count"]) for r in ledger),
      "catalogue_artworks_with_physical_source_but_no_recorded_individual_SHA":sum(r["physical_source_present"] and not r["all_recorded_source_sha_count"] for r in ledger),
      "fully_publishable_end_to_end_certified_from_combined_record":0,
      "full_publishing_certification_status":"NOT_YET_RECONCILED_CANNOT_INFER_FROM_PHOTO_PRESERVATION",
      "frozen_approved_107_not_equivalent_to_commercial_photo_permissions":True,
      "source_rights_or_artwork_approvals_created":0,
      "canonical_451_artwork_records_changed":0,
      "production_app_changed":False,
      "strict_zero_euro":True,
      "B26_remote_release_evidence":releases,
      "limitations":[
        "122 later research image files does not represent the total repository picture inventory; legacy B26 includes 290 earlier physical files (287 SHA distinct).",
        "Combined 412 file instances count duplicates and alternative works; not 412 fully matched individual artworks.",
        "The count of 360 with some physical source and 358 with complete artwork is provisional source research coverage, not 360 rights-cleared app photos.",
        "A precise B26 SHA link still does not prove that the correct painting, photograph copyright, artistic quality, and editorial selection gates all pass.",
        "Byte verification of all 290 older files was performed and preserved in B27, not repeated B48; remote draft Release preservation and all required asset presence/size were rechecked now.",
        "External museum source imagery and catalogue alternatives do not count as exact original artwork files unless authoritatively accession-matched.",
        "No historical frozen approval changed and no app publication is asserted."
      ]
    }
    assert bycohort=={
      "B19_B25_EXACT_SHA_ARCHIVED":245,
      "B29_B33_P0_RESEARCH_ARCHIVED":63,
      "B34_LEGACY_SOURCE_ARCHIVED":35,
      "B35_B41_FULL_SOURCE_RESEARCH_ARCHIVED":15,
      "B35_B41_PARTIAL_ONLY_RESEARCH_ARCHIVED":2,
      "MISSING_EXACT_RESEARCH_ORIGINAL":23
    }
    assert 245+63+35+15+2+23==383
    assert stats["active_with_some_actual_research_original_source"]==360
    assert stats["active_with_provisional_complete_object_research_photo"]==358
    assert stats["combined_early_and_later_image_bytes_before_crosswave_dedupe"]==3787270944
    RESULT.write_text(json.dumps(stats,indent=2,ensure_ascii=False)+"\n")
    SAMPLES.write_text(json.dumps({
      "git_tracked_image_files_hashed":len(inventory),
      "git_tracked_image_file_bytes":sum(i["bytes"] for i in inventory),
      "sha_matched_catalogue_artworks":stats["catalogue_artworks_with_matching_image_SHA_inside_current_git_tree"],
      "unmatched_tracked_images_count":sum(i["sha256"] not in {v for q in prior_sha_byid.values() for v in q} for i in inventory),
      "caveat":"No filename-derived artwork identity. Paths are NOT used to infer new canonical artwork matches; only existing explicit SHA associations count."
    },indent=2)+"\n")
    print("B48_ALL383_REPORT",json.dumps({k:stats[k] for k in [
     "active_frozen_artworks","B26_older_original_physical_files_previously_byte_verified",
     "B26_older_active_artwork_IDs_with_SHA-linked_original",
     "B29_B44_later_archive_original_file_count",
     "repo_git_tracked_image_files_hashed",
     "catalogue_artworks_with_matching_image_SHA_inside_current_git_tree",
     "catalogue_artworks_with_recorded_physical_SHA_provenance",
     "catalogue_artworks_with_physical_source_but_no_recorded_individual_SHA",
     "active_with_some_actual_research_original_source",
     "active_with_provisional_complete_object_research_photo",
     "active_missing_complete_object_photo",
     "fully_publishable_end_to_end_certified_from_combined_record"
    ]}),flush=True)
if __name__=="__main__":main()
