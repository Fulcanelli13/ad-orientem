#!/usr/bin/env python3
"""P86: reconcile the one P84 reviewer with all evidence-backed P85 recoveries.

No new discovery, image acquisition, independent approvals or publication. It
builds the final complete one-review HTML using the EXISTING P84 renderer.
"""
import argparse, hashlib, importlib.util, json, pathlib, tempfile

ROOT=pathlib.Path(__file__).resolve().parents[2]
HOLD="RESEARCH_ONLY_NEVER_APP_VISIBLE"
P83_SCHEMA="AO_P83_GLOBAL_PHOTO_PREVIEW_SCREEN_V1"
P85_SCHEMA="AO_P85_WORLDWIDE_7400_HOLDS_CONSOLIDATED_V1"

def check(condition,message):
    if not condition:raise ValueError(message)

def digest(path):
    return hashlib.sha256(pathlib.Path(path).read_bytes()).hexdigest()

def records(path):
    with pathlib.Path(path).open(encoding="utf8") as f:
        return [json.loads(line) for line in f if line.strip()]

def key(r):
    return (r["physical_anchor_id"],r["file_title"],r.get("original_sha1_claim"))

def safe_unpublished(r):
    return (r.get("publication")==HOLD and r.get("published") is False
            and r.get("exact_site_verified") is False
            and r.get("original_bytes_verified") is False)

def build(p83_directory,p85_directory,output_directory):
    p83=pathlib.Path(p83_directory)
    p85=pathlib.Path(p85_directory)
    p83_meta=json.loads((p83/"p83-worldwide-summary.json").read_text(encoding="utf8"))
    p85_meta=json.loads((p85/"p85-global-audit.json").read_text(encoding="utf8"))
    check(p83_meta["schema"]==P83_SCHEMA and p83_meta["anchors_accounted"]==2579
          and p83_meta["countries"]==76 and p83_meta["photo_source_assignments"]==7701
          and p83_meta["held_assignments"]==7400 and p83_meta["review_queue_assignments"]==301
          and p83_meta["published_photos"]==p83_meta["approved_photos"]==
              p83_meta["rights_cleared"]==p83_meta["original_photos_downloaded"]==0,
          "P86 must start from exact unpublished P83 world")
    check(p85_meta["schema"]==P85_SCHEMA and p85_meta["p83_original_anchors"]==2579
          and p85_meta["p83_original_assignments"]==7701
          and p85_meta["p83_existing_research_review"]==301
          and p85_meta["p85_original_held_assignments"]==7400
          and p85_meta["all_holds_accounted"]==7400
          and p85_meta["p83_source_summary_sha256"]==digest(p83/"p83-worldwide-summary.json")
          and p85_meta["images_approved"]==p85_meta["photos_published"]==
              p85_meta["rights_cleared"]==p85_meta["original_bytes_downloaded"]==0,
          "P85 audit incomplete or not attached to original P83")
    original=records(p83/"p83-source-screened-preview-queue.jsonl")
    old_holds=records(p83/"p83-holds-for-later-source-work.jsonl")
    new=records(p85/"p85-new-research-review-candidates.jsonl")
    remaining=records(p85/"p85-holds-still-open.jsonl")
    check(len(original)==301 and len(old_holds)==7400 and
          len(new)==p85_meta["p85_new_research_review_candidates"] and
          len(remaining)==p85_meta["p85_assignments_still_held"] and
          len(new)+len(remaining)==7400,
          "P83/P85 candidate and held populations don't reconcile")
    existing={key(r) for r in original}
    held={key(r) for r in old_holds}
    check(len(existing)==301 and len(held)==7400 and not existing.intersection(held),
          "P83 research queue/holds overlap")
    check(all(safe_unpublished(r) and str(r.get("screening_disposition","")).startswith("REVIEW_QUEUE_")
              and r.get("rights_independently_cleared") is False for r in original),
          "P83 already-approved image in viewer")
    check({key(r) for r in new}.isdisjoint({key(r) for r in remaining})
          and len({key(r) for r in new})==len(new)
          and len({key(r) for r in remaining})==len(remaining)
          and {key(r) for r in new+remaining}==held,
          "Every original P83 hold must appear in one P85 outcome, exactly once")
    final=list(original)
    for r in new:
        s=r.get("source_check") or {}
        check(safe_unpublished(r) and r.get("rights_approved") is False
              and str(r.get("p85_disposition","")).startswith("RECOVERED_FOR_RESEARCH_REVIEW_")
              and s.get("source_status")=="CURRENT_COMMONS_METADATA_RETRIEVED"
              and isinstance(s.get("current_rights_metadata_claim"),dict),
              "Unsafe P85 recovered candidate")
        check(r.get("original_sha1_claim") is None or
              s.get("current_original_sha1")==r["original_sha1_claim"],
              "P85 source original changed after screening")
        preview=s.get("thumbnail_url","")
        final.append({**r,"screening_disposition":"REVIEW_QUEUE_P85_CORROBORATED_RESEARCH_ONLY",
            "rights_metadata_status":"CURRENT_COMMONS_METADATA_CLAIM_RIGHTS_NOT_CLEARED",
            "preview_url":preview if isinstance(preview,str) else "",
            "same_original_multiple_site_ids":r.get("source_file_assigned_site_count",0)>1,
            "exact_site_verified":False,"rights_independently_cleared":False,
            "original_bytes_verified":False,"published":False,"publication":HOLD})
    check(len({(r["physical_anchor_id"],r["file_title"]) for r in final})==len(final),
          "Duplicate venue Commons title in final reviewer")
    check(len(final)==301+len(new) and all(safe_unpublished(r) for r in final),
          "P86 candidate completeness and publication gates")
    out=pathlib.Path(output_directory)
    check(not out.exists(),"P86 final reviewer already archived; never overwrite")
    out.mkdir(parents=True)
    data=out/"p86-one-worldwide-editorial-queue.jsonl"
    with data.open("w",encoding="utf8") as f:
        for r in final:f.write(json.dumps(r,ensure_ascii=False,separators=(",",":"))+"\n")
    # Build the one-and-only editorial UI from the EXISTING P84 renderer.
    # It preserves P84's stable local decisions and its 250/500-page controls.
    summary={**p83_meta,"review_queue_assignments":len(final)}
    digest_meta=out/"p86-final-viewer-input.json"
    digest_meta.write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    spec=importlib.util.spec_from_file_location("ao_canonical_p84_review",
        ROOT/"tools/directory/build-p84-worldwide-bulk-photo-review.py")
    renderer=importlib.util.module_from_spec(spec);spec.loader.exec_module(renderer)
    page=out/"index.html"
    renderer.build(data,digest_meta,page)
    html=page.read_text(encoding="utf8")
    check(html.count("<script>")==1 and html.count("</script>")==1
          and "Export complete review JSON" in html and "photos_approved:0" in html,
          "P84 safe one-review rendering contract changed")
    html=html.replace("One worldwide photo review — 250 or 500 at a time",
        "One final worldwide photo review — original + recovered sources")
    page.write_text(html,encoding="utf8")
    audit={"schema":"AO_P86_FINAL_SINGLE_WORLDWIDE_PHOTO_REVIEW_V1",
        "physical_anchors":2579,"countries":76,
        "original_photo_assignments":7701,"original_p83_reviewer_candidates":301,
        "p85_held_rechecked":7400,"p85_research_candidates_recovered":len(new),
        "p85_remaining_source_holds":len(remaining),"one_final_reviewer_candidates":len(final),
        "p83_worldwide_summary_sha256":digest(p83/"p83-worldwide-summary.json"),
        "p83_preview_queue_sha256":digest(p83/"p83-source-screened-preview-queue.jsonl"),
        "p85_global_audit_sha256":digest(p85/"p85-global-audit.json"),
        "p85_recovered_queue_sha256":digest(p85/"p85-new-research-review-candidates.jsonl"),
        "review_html_sha256":digest(page),
        "review_source_queue_sha256":digest(data),
        "review_format":"EXISTING_P84_ONE_EDITORIAL_INTERFACE_250_OR_500",
        "publication":HOLD,
        "original_image_bytes_downloaded":0,"subject_verified":0,
        "rights_approved":0,"photos_published":0}
    (out/"audit.json").write_text(json.dumps(audit,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("P86_COMPLETE_ONE_WORLDWIDE_REVIEW="+json.dumps(audit,sort_keys=True),flush=True)
    return audit

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--p83",type=pathlib.Path,required=True)
    p.add_argument("--p85",type=pathlib.Path,required=True)
    p.add_argument("--out",type=pathlib.Path,required=True)
    a=p.parse_args()
    build(a.p83,a.p85,a.out)
