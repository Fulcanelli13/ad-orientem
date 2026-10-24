#!/usr/bin/env python3
"""B50 — all 95 approved sacred artworks: exact source-file image evidence.

Bounded external validation via Wikimedia Commons imageinfo API (no scraping,
no evasion of access limits). Reconcile SHA-256 of archived exact source to
source metadata, file-specific reuse claims, image dimensions and historical
selected photo SHA. A Commons title, one open-data licence or a visually similar
painting NEVER by itself grants publication approval. No app/master changes.
"""
import csv,html,json,re,time,hashlib
from pathlib import Path
from urllib.parse import urlencode,urlparse,unquote
from urllib.request import Request,urlopen
from urllib.error import HTTPError
from collections import Counter,defaultdict
R=Path("data/research")
P=R/"sacred-art-b49-95-frozen-approved-rights-review-queue.csv"
OUT=R/"sacred-art-b50-95-exact-photo-version-evidence.csv"
RAW=R/"sacred-art-b50-95-source-specific-commons-license-checks.json"
SUM=R/"sacred-art-b50-95-photo-rights-resolution-summary.json"
OWNER_META=R/"sacred-art-acquisition-245-source-rollup.csv"
METADATA=[
("sacred-art-b29-seven-exact-acquisition-results.csv","downloaded_sha256","metadata_license_short_name","metadata_file_page","acquired_bytes","width","height"),
("sacred-art-b30-six-selected-acquisition.csv","download_sha256","current_file_license","gallery_source_page","download_bytes","verified_width","verified_height"),
("sacred-art-b31-29-candidate-results.csv","original_file_sha256_measured","current_metadata_license","candidate_source_page","bytes_measured","actual_width","actual_height"),
("sacred-art-b32-15-source-file-results.csv","current_download_sha256","current_license","candidate_source_page","file_length_bytes","width","height"),
("sacred-art-b33-six-source-decisions.csv","downloaded_sha256","current_Commons_license","Commons_file_page","bytes_acquired","width","height"),
("sacred-art-b34-35-source-results.csv","downloaded_sha256","current_commons_license","source_page","original_bytes","width","height"),
("sacred-art-b35-3-originals-results.csv","actual_image_sha256","source_file_license_current","source_page","actual_image_bytes","width","height"),
("sacred-art-b35-kress2-results.csv","download_sha256","rights_text_status","source_page","download_bytes","width","height"),
("sacred-art-b35-nga2-results.csv","download_sha256","NGA_image_openaccess","source_page","download_bytes","width","height"),
("sacred-art-b36-four-file-results.csv","sha256","current_license","source_page","bytes","width","height"),
("sacred-art-b37-four-source-results.csv","sha256","current_commons_license","source_page","bytes","width","height"),
("sacred-art-b38-kmska-cc0-source-results.csv","sha256","current_commons_license","source_page","bytes","width","height"),
("sacred-art-b39-two-commons-source-results.csv","sha256","current_commons_license","source_page","bytes","width","height"),
("sacred-art-b40-wuilleret-commons-crossmatch-results.csv","commons_sha256","current_commons_license_claim","commons_file_page","commons_bytes","commons_width","commons_height")]
URL_KEYS=["metadata_file_page","gallery_source_page","candidate_source_page","source_page","Commons_file_page","commons_file_page","source_evidence_link","source_url"]
SHA=re.compile(r"^[a-f0-9]{64}$")
def read(p):
    with (R/p).open("r",encoding="utf-8",newline="") as f:return list(csv.DictReader(f))
def write(p,records):
    assert records
    with p.open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=list(records[0]));w.writeheader();w.writerows(records)
def write(path, records):
    assert records, "No research source evidence to write"
    with path.open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=list(records[0]));w.writeheader();w.writerows(records)

def number(v):
    try:return int(float(str(v or "0").replace(",","")))
    except (TypeError,ValueError):return 0
def cfilename(url):
    if not url:return None
    u=urlparse(url)
    if u.hostname not in ("commons.wikimedia.org","upload.wikimedia.org"):return None
    s=unquote(u.path)
    if u.hostname=="commons.wikimedia.org":
        q=s.split("/wiki/",1)[-1]
        if q.startswith("File:"):return q.replace("_"," ")
        return None
    # Commons upload/<2 char hash>/<rest>/<file>; Commons titles can be
    # reconstructed from a file basename but should not be treated as proof.
    return "File:"+s.rsplit("/",1)[-1].replace("_"," ")
def meta_records():
    result=defaultdict(list)
    for entry in read("sacred-art-acquisition-245-source-rollup.csv"):
        h=(entry.get("original_sha256") or "").lower()
        if not SHA.fullmatch(h):continue
        result[(entry["record_id"],h)].append(dict(
            origin="B19-B25-acquisition",sha256=h,license=entry.get("metadata_license") or "",
            source_page=entry.get("source_evidence_link") or entry.get("source_url") or "",
            bytes=number(entry.get("original_bytes")),width=number(entry.get("original_width")),
            height=number(entry.get("original_height")),
            review="LEGACY_SOURCE_IMAGE_AND_RIGHTS_NOT_FINAL",
            external_source=entry.get("source_url") or "",source_type=entry.get("source_type") or ""))
    for name,hashcol,licensecol,urlcol,sizecol,wcol,hcol in METADATA:
        for row in read(name):
            id_=row.get("artwork_id") or ""
            sh=(row.get(hashcol) or "").lower()
            if not id_ or not SHA.fullmatch(sh):continue
            source=row.get(urlcol,"") or ""
            result[(id_,sh)].append(dict(
                origin=name,sha256=sh,license=row.get(licensecol,"") or "",
                source_page=source,bytes=number(row.get(sizecol)),
                width=number(row.get(wcol)),height=number(row.get(hcol)),
                review="PRESERVED_PHYSICAL_ORIGINAL_METADATA_NOT_PHOTO_LICENSE_CERTIFICATE",
                external_source=row.get("source_original_url",row.get("source_file_url","")) or "",
                source_type="institutional_or_commons"))
    return result
def commons_api(titles):
    api="https://commons.wikimedia.org/w/api.php"
    params={"action":"query","prop":"imageinfo","titles":"|".join(titles),
            "iiprop":"size|url|extmetadata|sha1","format":"json","formatversion":"2",
            "redirects":"1"}
    url=api+"?"+urlencode(params)
    req=Request(url,headers={"User-Agent":"AdOrientemArtRightsResearch/1.0 (academic catalog review; https://github.com/Fulcanelli13/ad-orientem)",
        "Accept":"application/json"})
    with urlopen(req,timeout=28) as res:
        if res.status!=200 or urlparse(res.geturl()).hostname!="commons.wikimedia.org":
            raise ValueError("Commons API restricted or untrusted redirect")
        if "json" not in res.headers.get("Content-Type","").lower():raise ValueError("Commons API non-JSON")
        data=res.read(4500001)
        if len(data)>4500000:raise ValueError("Commons metadata oversized")
    j=json.loads(data)
    result={}
    for page in j.get("query",{}).get("pages",[]):
        title=page.get("title")
        if not title:continue
        image=(page.get("imageinfo") or [{}])[0]
        raw=image.get("extmetadata") or {}
        metadata={k:html.unescape(re.sub("<[^>]+>"," ",v.get("value","")))[:500]
                  for k,v in raw.items() if isinstance(v,dict) and k in
                  ("LicenseShortName","LicenseUrl","UsageTerms","Copyrighted",
                   "AttributionRequired","Restrictions","Credit","Artist","ObjectName")}
        result[title]=dict(
           page=title,missing="missing" in page,
           image_width=image.get("width"),image_height=image.get("height"),
           image_bytes=image.get("size"),image_url=image.get("url"),
           file_sha1=image.get("sha1"),rights_metadata=metadata)
    return result
def main():
    queue=read("sacred-art-b49-95-frozen-approved-rights-review-queue.csv")
    assert len(queue)==95 and len({r["artwork_id"] for r in queue})==95
    b49=json.loads((R/"sacred-art-b49-383-photo-license-and-git-image-summary.json").read_text())
    assert b49["historically_approved_with_complete_object_and_open_photo_metadata_claim"]==95
    evidence=meta_records()
    alias=json.loads((R/"sacred-art-b48-three-alias-photo-identity-and-kmska-exception-casebook.json").read_text())
    assert alias["source_count_alias_cases"]==3
    commons_targets={}
    pre_records=[]
    for q in queue:
        hashes=[x for x in q["source_image_hashes"].split(" | ") if SHA.fullmatch(x.strip())]
        candidates=[]
        for sh in hashes:
            candidates.extend(evidence.get((q["artwork_id"],sh),[]))
        # Sources must precisely match the *recorded original SHA* AND frozen
        # ID — no match by artist/title. Prefer known historical selection.
        early=(R/"sacred-art-b33-p0-64-complete-research-coverage.json")
        # Stable scoring: source metadata + measured size/dimensions + commons file URL.
        candidates.sort(key=lambda e:(
            bool(e["source_page"]),bool(cfilename(e["source_page"])),
            bool(e["width"] and e["height"] and e["bytes"]),
            e["width"]*e["height"]),reverse=True)
        unique=[]
        seen=set()
        for c in candidates:
            key=(c["sha256"],c["source_page"],c["origin"])
            if key not in seen:
                unique.append(c);seen.add(key)
        candidates=unique
        selected=candidates[0] if candidates else None
        title=cfilename(selected["source_page"]) if selected else None
        if title and title not in commons_targets:
            commons_targets[title]=[]
        if title:commons_targets[title].append(q["artwork_id"])
        pre_records.append((q,candidates,selected,title,hashes))
    # Query Wikimedia open endpoint once per ~20 actual File:title objects,
    # with a deterministic cap and throttling. Do not bypass 403/429.
    titles=sorted(commons_targets)
    fetched={};attempts=[]
    for n in range(0,len(titles),18):
        batch=titles[n:n+18]
        try:
            got=commons_api(batch)
            fetched.update(got)
            attempts.append({"requested_file_titles":batch,"status":"RESPONDED","returned":len(got)})
        except Exception as e:
            attempts.append({"requested_file_titles":batch,"status":"OFFICIAL_METADATA_ACCESS_BLOCKED",
                "error":type(e).__name__+": "+str(e)[:230]})
        time.sleep(.35)
    results=[];details=[]
    p0=json.loads((R/"sacred-art-b33-p0-64-complete-research-coverage.json").read_text())
    original_p0={x["artwork_id"]:x for x in p0["rows"]}
    for q,candidates,chosen,title,hashes in pre_records:
        id_=q["artwork_id"]
        remote=fetched.get(title) if title else None
        historical=original_p0.get(id_)
        historically_recovered=bool(historical and
            historical.get("physical_state")=="HISTORIC_EXACT_ORIGINAL_RETRIEVED" and
            chosen and historical.get("archived_source_sha256")==chosen["sha256"])
        # Hash-matched exact historical selected image is separately reported.
        # Do not infer this status from the photo title being selected.
        license=chosen["license"] if chosen else ""
        claim_open=bool(re.search(r"\b(?:public\s+domain|CC0|CC[\s-]?BY)\b",license,re.I))
        remote_license=(remote or {}).get("rights_metadata",{}).get("LicenseShortName","")
        remote_open=bool(re.search(r"\b(?:public\s+domain|CC0|CC[\s-]?BY|PD-old|PD-art)\b",remote_license,re.I))
        dims_match=bool(remote and chosen and chosen["width"] and chosen["height"] and
            remote.get("image_width")==chosen["width"] and remote.get("image_height")==chosen["height"])
        size_match=bool(remote and chosen and chosen["bytes"] and remote.get("image_bytes")==chosen["bytes"])
        metadata_version_match=dims_match and size_match
        long_edge=max(chosen["width"],chosen["height"]) if chosen else 0
        quality=("RESOLUTION_2400_PLUS_METADATA" if long_edge>=2400 else
                 "LOW_OR_UNRECORDED_RESOLUTION_METADATA")
        remote_gate=("COMMONS_FILE_VERSION_SIZE_DIMENSIONS_MATCH" if metadata_version_match else
               "COMMONS_FILE_PRESENT_VERSION_MISMATCH_OR_NO_LOCAL_SIZE" if remote and not remote.get("missing") else
               "COMMONS_METADATA_UNAVAILABLE_OR_MISSING")
        # The Commons size/width comparison is of the CURRENT file and
        # prior archived metadata; it is not a re-hash of current remote bits.
        row={
          "rank":q["rank"],"artwork_id":id_,"title":q["title"],"artist":q["artist"],
          "frozen_artwork_approved":True,
          "number_archived_sha_candidates":len(hashes),
          "source_id_sha_exact_join_count":len(candidates),
          "selected_evidence_source":chosen["origin"] if chosen else "",
          "chosen_archived_sha256":chosen["sha256"] if chosen else "",
          "chosen_source_page":chosen["source_page"] if chosen else "",
          "chosen_source_file_commons_title":title or "",
          "chosen_archived_bytes_from_source_metadata":chosen["bytes"] if chosen else 0,
          "chosen_archived_width":chosen["width"] if chosen else 0,
          "chosen_archived_height":chosen["height"] if chosen else 0,
          "technical_resolution_metadata_gate":quality,
          "archived_source_license_metadata":license,
          "archived_open_license_claim_present":claim_open,
          "current_commons_source_metadata_retrieved":bool(remote and not remote.get("missing")),
          "current_commons_claimed_license":remote_license,
          "current_commons_open_license_claim":remote_open,
          "current_commons_file_version_size_and_dimensions_match":metadata_version_match,
          "current_commons_file_metadata_evidence_status":remote_gate,
          "historical_selected_photo_SHA_exact_match_in_P0_source_ledger":historically_recovered,
          "iconographic_full_image_visual_review_done":False,
          "photographer_exact_file_commercial_reuse_legal_review_completed":False,
          "attribution_credit_requirements_reconciled":False,
          "one_final_best_photo_version_approved_for_artwork":False,
          "ready_to_publish_in_ad_orientem":False,
          "next_release_gate":(
             "MATCH_EXACT_SOURCE_SHA_AND_SOURCE_PAGE" if not chosen else
             "VERIFY_ARCHIVED_IMAGE_CONTENT_PHOTO_LICENCE_AND_VISUAL_ART_SELECTION" if metadata_version_match
             else "RESOLVE_SOURCE_RENDITION_VERSION_RIGHTS_THEN_VISUAL_SELECTION")
        }
        results.append(row)
        details.append({"rank":q["rank"],"artwork_id":id_,"selected_evidence":chosen,
          "other_same_id_sha_matched_evidence":candidates[:8],
          "commons_verification":remote,"historical_p0_state":historical.get("physical_state") if historical else None,
          "source_sha_candidates":hashes,
          "editorial_or_commercial_reproduction_approved":False})
    write(OUT,results)
    stats=Counter(x["current_commons_file_metadata_evidence_status"] for x in results)
    output={
      "schema":"AO_B50_APPROVED95_EXACT_IMAGE_RIGHTS_VERSION_AND_TECHNICAL_GATES_V1",
      "audit_date":"2026-10-24",
      "approved_artworks_in_firstpass":95,
      "all_frozen_artwork_decisions_preserved":107,
      "reviewed_exact_artwork_IDs":95,
      "all_95_records_frozen_approved":True,
      "per_frozen_ID_SHA_source_matched_records":sum(bool(x["source_id_sha_exact_join_count"]) for x in results),
      "with_source_image_dimensions_measured_in_prior_acquisition":sum(bool(x["chosen_archived_width"] and x["chosen_archived_height"]) for x in results),
      "source_image_recorded_long_edge_2400_or_more":sum(x["technical_resolution_metadata_gate"]=="RESOLUTION_2400_PLUS_METADATA" for x in results),
      "historical_selected_photo_SHA_exact_matched":sum(x["historical_selected_photo_SHA_exact_match_in_P0_source_ledger"] for x in results),
      "has_commons_source_page_attributed":sum(bool(x["chosen_source_file_commons_title"]) for x in results),
      "commons_unique_file_pages_requested":len(titles),
      "commons_batch_requests":len(attempts),
      "commons_responses_succeeded":sum(x["status"]=="RESPONDED" for x in attempts),
      "commons_access_blocked_or_failed":sum(x["status"]!="RESPONDED" for x in attempts),
      "commons_file_pages_readable":sum(x["current_commons_source_metadata_retrieved"] for x in results),
      "commons_current_metadata_open_license_claims":sum(x["current_commons_open_license_claim"] for x in results),
      "commons_current_file_size_and_dimensions_match":sum(x["current_commons_file_version_size_and_dimensions_match"] for x in results),
      "commons_evidence_classes":dict(stats),
      "current_commons_metadata_requests":attempts,
      "specific_archived_exact_file_photographer_legal_review_completed":0,
      "source_image_visual_artwork_identity_review_completed":0,
      "chosen_editorial_photo_version_approved":0,
      "end_to_end_publishable_completed":0,
      "zero_completed_means_not_certified_not_no_rights":True,
      "frozen_107_approval_selection_changed":0,
      "frozen_383_artwork_record_changes":0,
      "app_photo_publication_events":0,
      "strictly_zero_euro":True,
      "aggregate_source_evidence_path":str(RAW),
      "per_artwork_photo_version_evidence_path":str(OUT)
    }
    RAW.write_text(json.dumps({"schema":"AO_B50_COMPARABLE_95_SOURCES_PER_ID_V1","artworks":details,
      "commons_endpoint_checks":attempts,"new_rights_approvals":0,"zero_euro":True},indent=2,ensure_ascii=False)+"\n")
    SUM.write_text(json.dumps(output,indent=2,ensure_ascii=False)+"\n")
    print("B50_RIGHTS_BATCH",json.dumps({k:output[k] for k in (
        "approved_artworks_in_firstpass","per_frozen_ID_SHA_source_matched_records",
        "with_source_image_dimensions_measured_in_prior_acquisition",
        "source_image_recorded_long_edge_2400_or_more",
        "historical_selected_photo_SHA_exact_matched",
        "commons_unique_file_pages_requested",
        "commons_responses_succeeded",
        "commons_access_blocked_or_failed",
        "commons_current_file_size_and_dimensions_match",
        "end_to_end_publishable_completed")}),flush=True)
if __name__=="__main__":main()
