#!/usr/bin/env python3
"""Reconcile the original 451-row artwork catalogue with the 245-source
acquisition rollup. Research audit only: never changes frozen artwork decisions.
"""
import collections, csv, json, pathlib, re
from datetime import datetime, timezone
from urllib.parse import unquote, urlsplit

ROOT=pathlib.Path("data/research")
SNAP=ROOT/"sacred-art-catalogue451-snapshot.json"
ACQ=ROOT/"sacred-art-acquisition-245-source-rollup.csv"
OUT=ROOT/"sacred-art-catalogue451-reconciliation.csv"
REPORT=ROOT/"sacred-art-catalogue451-reconciliation.summary.json"
FIELDS=["artwork_id","catalogue_row","title","artist","frozen_decision","frozen_selection","legacy_preview","legacy_photo_count",
"legacy_release_certified","legacy_qa_holds","legacy_source_url","legacy_object_url","legacy_source_rights_claim",
"legacy_permission_free_status","legacy_highres_url","matched_acquisition_ids","match_basis","source_candidates",
"acquired_original_count","acquired_print_count","outstanding_commons_count","rights_hold_count",
"catalogue_bucket","collection_need","release_status","priority","next_action","notes"]

def loadcsv(p):
    with p.open(newline="",encoding="utf-8") as handle:return list(csv.DictReader(handle))

def object_key(url):
    if not url or not url.startswith("https://"):return ""
    try:
        p=urlsplit(url.strip())
        host=p.hostname.lower().removeprefix("www.") if p.hostname else ""
        path=unquote(p.path).rstrip("/")
        if "metmuseum.org" in host:
            m=re.search(r"/art/collection/search/(\d+)",path,re.I)
            if m:return "met:"+m.group(1)
        if "clevelandart.org" in host:
            m=re.search(r"/art/([0-9]+(?:\.[A-Za-z0-9]+)+)",path,re.I)
            if m:return "cma:"+m.group(1).lower()
        if host=="commons.wikimedia.org" and path.startswith("/wiki/File:"):
            return "commons:"+path[len("/wiki/"):].replace("_"," ").casefold()
        if host=="upload.wikimedia.org":return "commons-cdn:"+path
        # Generic art URLs only match when paths, not a mere common homepage, align.
        if len(path)<8:return ""
        return "exact:"+host+path.lower()
    except Exception:return ""

def priority(decision):
    if decision in ("APPROVED_LOCKED","APPROVED_5","IMAGE_REPLACEMENT_HOLD"):return "P0"
    if decision in ("PREVIOUSLY_RATED_ACCEPTABLE","ACCEPTABLE_UNFINALIZED"):return "P1"
    if decision=="UNREVIEWED":return "P2"
    return "EXCLUDED"

def main():
    snap=json.loads(SNAP.read_text(encoding="utf-8"))
    catalog=snap["rows"]
    acquisitions=loadcsv(ACQ)
    assert len(catalog)==451 and len({r["id"] for r in catalog})==451
    assert len(acquisitions)==245 and len({r["asset_source_id"] for r in acquisitions})==245
    assert sum(x["decision"] in ("APPROVED_LOCKED","APPROVED_5") for x in catalog)==107
    assert sum(x["decision"]=="PERMANENTLY_REJECTED" for x in catalog)==68
    assert sum(x["certified"]=="True" for x in catalog)==0
    by_id=collections.defaultdict(list)
    by_url=collections.defaultdict(list)
    for a in acquisitions:
        sid=a["asset_source_id"]
        refs=[x.removeprefix("PAINTING CATALOGUE:") for x in a["related_records"].split(" | ") if x.startswith("PAINTING CATALOGUE:")]
        if a["source_sheet"]=="PAINTING CATALOGUE":refs.append(a["record_id"])
        for key in set(refs):by_id[key].append(a)
        key=object_key(a["source_url"])
        if key:by_url[key].append(a)
    final=[];candidate_aliases=[]
    for c in catalog:
        identity=c["id"]
        direct=by_id.get(identity,[])
        aliases=[];keys=[]
        if not direct:
            for url in (c["url"],c["object_url"]):
                key=object_key(url)
                if key and key not in keys:keys.append(key)
                for candidate in by_url.get(key,[]):
                    if candidate["asset_source_id"] not in {a["asset_source_id"] for a in aliases}:
                        aliases.append(candidate)
        basis=("STABLE_CATALOGUE_ID" if direct else ("SOURCE_URL_ALIAS_CANDIDATE" if aliases else "NO_ACQUISITION_MATCH"))
        found=direct if direct else aliases
        unique={a["asset_source_id"]:a for a in found}
        found=list(unique.values())
        if basis=="SOURCE_URL_ALIAS_CANDIDATE":
            candidate_aliases.append((identity,[x["asset_source_id"] for x in found]))
        # URL-only aliases must be reviewed for object identity before being relied
        # on for release, but files can count as candidate coverage.
        originals=[a for a in found if a["acquisition_tier"]=="ORIGINAL"]
        prints=[a for a in found if a["acquisition_tier"]=="MUSEUM_PRINT_DERIVATIVE"]
        deferred=[a for a in found if a["technical_status"]=="DEFERRED_COMMONS_HTTP_429"]
        holds=[a for a in found if a["technical_status"]=="HOLD_RIGHTS"]
        decision=c["decision"]
        rejected=decision=="PERMANENTLY_REJECTED"
        legacy=c["preview"]=="True" or (int(c["photos"] or "0")>0)
        if rejected:
            bucket="FROZEN_REJECTED";need="NO_NEW_COLLECTION";action="DO_NOT_ACQUIRE"
        elif originals:
            bucket="ACQUIRED_ORIGINAL";need="IMAGE_ALREADY_OBTAINED";action="VISUAL_IDENTITY_RIGHTS_AND_PLACEMENT_QA"
        elif prints:
            bucket="ACQUIRED_MUSEUM_PRINT";need="IMAGE_ALREADY_OBTAINED_DERIVATIVE";action="VISUAL_QA_AND_DECIDE_IF_ARCHIVAL_ORIGINAL_NEEDED"
        elif legacy:
            bucket="LEGACY_PREVIEW_ONLY";need="VERIFY_LEGACY_FILE_NOT_ASSUME_MASTER";action="CHECK_LEGACY_IMAGE_PROVENANCE_RIGHTS_AND_RESOLUTION"
        elif deferred:
            bucket="COMMONS_429_NO_IMAGE";need="RETRIEVE_KNOWN_SOURCE_AFTER_COOLDOWN";action="DEFERRED_RATE_LIMIT_OR_INSTITUTIONAL_ALTERNATIVE"
        elif holds:
            bucket="SOURCE_RIGHTS_HOLD_NO_IMAGE";need="CLEAR_SOURCE_RIGHTS_FIRST";action="SOURCE_RIGHTS_RESOLUTION"
        elif found:
            bucket="KNOWN_SOURCE_NO_IMAGE";need="RESOLVE_SOURCE_DOWNLOAD";action="RESOLVE_METADATA_OR_SOURCE"
        elif c["url"] or c["object_url"]:
            bucket="UNMATCHED_SOURCE_NO_IMAGE";need="RESEARCH_AND_ACQUIRE_IF_ELIGIBLE";action="SCREEN_OBJECT_SOURCE_AND_IMAGE_RIGHTS"
        else:
            bucket="NO_SOURCE_NO_IMAGE";need="DISCOVER_VERIFIABLE_SOURCE";action="DISCOVER_MUSEUM_OBJECT_ID_AND_RIGHTS"
        out={key:"" for key in FIELDS}
        out.update(artwork_id=identity,catalogue_row=c["row"],title=c["title"],artist=c["artist"],frozen_decision=decision,
            frozen_selection="YES" if decision in ("APPROVED_LOCKED","APPROVED_5") else "NO",
            legacy_preview="YES" if legacy else "NO",legacy_photo_count=c["photos"],
            legacy_release_certified="YES" if c["certified"]=="True" else "NO",
            legacy_qa_holds=c["qa"],legacy_source_url=c["url"],legacy_object_url=c["object_url"],
            legacy_source_rights_claim=c["source_rights"],legacy_permission_free_status=c["rights"],
            legacy_highres_url=c["highres"],matched_acquisition_ids=" | ".join(a["asset_source_id"] for a in found),
            match_basis=basis,source_candidates=len(found),acquired_original_count=len(originals),
            acquired_print_count=len(prints),outstanding_commons_count=len(deferred),rights_hold_count=len(holds),
            catalogue_bucket=bucket,collection_need=need,release_status="FROZEN_REJECTED" if rejected else "HOLD_NO_NEW_APPROVAL",
            priority=priority(decision),next_action=action,
            notes="Candidate match by URL requires object identity review" if basis=="SOURCE_URL_ALIAS_CANDIDATE" else "")
        final.append(out)
    buckets=collections.Counter(x["catalogue_bucket"] for x in final)
    prio=collections.Counter(x["priority"] for x in final if x["collection_need"] not in ("NO_NEW_COLLECTION","IMAGE_ALREADY_OBTAINED","IMAGE_ALREADY_OBTAINED_DERIVATIVE"))
    active=[x for x in final if x["catalogue_bucket"]!="FROZEN_REJECTED"]
    with OUT.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(final)
    missing=[x for x in active if x["legacy_preview"]=="NO" and int(x["acquired_original_count"] or 0)==0 and int(x["acquired_print_count"] or 0)==0]
    existing=[x for x in active if x not in missing]
    summary={
        "source_workbook":snap["source_workbook"],"catalogue_rows":451,
        "frozen_previously_approved":107,"frozen_permanently_rejected":68,
        "active_nonrejected_artworks":len(active),
        "acquisition_source_identities":245,
        "linked_by_explicit_catalogue_id":sum(x["match_basis"]=="STABLE_CATALOGUE_ID" for x in final),
        "additional_url_alias_candidate_matches":len(candidate_aliases),
        "catalogue_status_counts":dict(buckets),
        "active_artworks_with_either_new_image_or_legacy_preview":len(existing),
        "active_artworks_without_any_recorded_image":len(missing),
        "missing_image_priority_counts":dict(collections.Counter(x["priority"] for x in missing)),
        "not_yet_technically_release_certified":len(active),
        "legacy_release_quality_certified":0,"new_manual_visual_approvals":0,"new_publication_approvals":0,
        "constraints":["Existing photo preview is not proof of a distributable image master","One source may support multiple artwork catalogue IDs; source identities are not artwork counts","URL alias matches require manual identity reconciliation","Source-rights and visual/editorial gates independent"],
        "generated_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")
    }
    assert sum(buckets.values())==451
    assert len(active)==383 and len(existing)+len(missing)==383
    assert all(x["release_status"]=="HOLD_NO_NEW_APPROVAL" for x in active)
    REPORT.write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print(json.dumps(summary,sort_keys=True),flush=True)

if __name__=="__main__":main()
