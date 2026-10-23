#!/usr/bin/env python3
"""Generate two operational queues from the 451-source non-destructive audit.
Collection queue = no image recorded. Legacy QA = preview but no new acquired file.
"""
import csv,json,pathlib,re,collections
from urllib.parse import urlsplit
from datetime import datetime,timezone
ROOT=pathlib.Path("data/research")
SOURCE=ROOT/"sacred-art-catalogue451-reconciliation.csv"
FIELDS=["artwork_id","catalogue_row","priority","frozen_decision","title","artist","source_provider","source_url",
"current_bucket","planned_route","permission_gate","first_action","release_status"]
def provider(url):
    try:return urlsplit(url).hostname.lower().removeprefix("www.") if url else "NO_SOURCE"
    except:return "UNPARSEABLE_SOURCE"
def route(row):
    url=row["legacy_source_url"] or row["legacy_object_url"]
    dom=provider(url)
    if row["catalogue_bucket"]=="COMMONS_429_NO_IMAGE":return "COMMONS_DEFERRED_RESPECT_RETRY_AFTER"
    if dom=="nga.gov":return "NGA_IMAGE_LEVEL_OPENACCESS_DATASET"
    if dom=="museodelprado.es":return "PRADO_OBJECT_IMAGE_RIGHTS_REVIEW"
    if dom in ("catalogo.beniculturali.it","catalogo.cultura.gov.it","pop.culture.gouv.fr"):
        return "PUBLIC_CULTURAL_CATALOGUE_PHOTO_RIGHTS_CHECK"
    if dom=="nationalgallery.org.uk":return "NGL_SOURCE_IMAGE_RIGHTS_REVIEW"
    if dom=="NO_SOURCE":return "SOURCE_DISCOVERY"
    return "OTHER_INSTITUTION_PHOTO_LICENSE_VERIFY"
def write(path,rows):
    with path.open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(rows)
def main():
    with SOURCE.open(encoding="utf-8",newline="") as f:data=list(csv.DictReader(f))
    assert len(data)==451
    missing=[];legacies=[]
    for row in data:
        if row["catalogue_bucket"]=="FROZEN_REJECTED":continue
        datafile=bool(int(row["acquired_original_count"] or "0") or int(row["acquired_print_count"] or "0"))
        preview=row["legacy_preview"]=="YES"
        if datafile:continue
        url=row["legacy_source_url"] or row["legacy_object_url"]
        p=provider(url)
        action="Check source identity, provenance and reuse rights" if preview else "Verify source rights; retrieve eligible image or document hold"
        entry={
            "artwork_id":row["artwork_id"],"catalogue_row":row["catalogue_row"],"priority":row["priority"],
            "frozen_decision":row["frozen_decision"],"title":row["title"],"artist":row["artist"],
            "source_provider":p,"source_url":url,"current_bucket":row["catalogue_bucket"],
            "planned_route":route(row) if not preview else "VERIFY_EXISTING_PREVIEW_MASTER_AND_RIGHTS",
            "permission_gate":"NOT_VERIFIED","first_action":action,"release_status":"HOLD"
        }
        if preview:legacies.append(entry)
        else:missing.append(entry)
    assert len(missing)==79 and len(legacies)==150,(len(missing),len(legacies))
    order={"P0":0,"P1":1,"P2":2}
    for ls in [missing,legacies]:ls.sort(key=lambda r:(order.get(r["priority"],3),int(r["catalogue_row"] or 0)))
    write(ROOT/"sacred-art-missing79-source-queue.csv",missing)
    write(ROOT/"sacred-art-legacy150-image-qa-queue.csv",legacies)
    summary={
        "missing_image_sources":len(missing),"unverified_legacy_previews":len(legacies),
        "missing_by_priority":dict(collections.Counter(r["priority"] for r in missing)),
        "legacy_qa_by_priority":dict(collections.Counter(r["priority"] for r in legacies)),
        "missing_by_retrieval_route":dict(collections.Counter(r["planned_route"] for r in missing)),
        "missing_by_provider":dict(collections.Counter(r["source_provider"] for r in missing)),
        "publication_approvals":0,"source_master_unchanged":True,
        "note":"Queues reflect pre-B22 NGA acquisition status; adjust only after verified hash audit and re-run of canonical crosswalk.",
        "generated_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")
    }
    (ROOT/"sacred-art-collection-and-legacy-qa-workplan.summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print(json.dumps(summary,sort_keys=True))
if __name__=="__main__":main()
