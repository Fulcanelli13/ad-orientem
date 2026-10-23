#!/usr/bin/env python3
"""Adjudicate Wikimedia accession search results against actual museum namespaces.

Raw search hits may share inventory strings with unrelated people or institutions
(e.g., US congressional bioguide P000362 vs Prado P000362). File rights
alone never prove depicted object identity.
"""
import csv,json,pathlib,re
from collections import Counter
from datetime import datetime,timezone
ROOT=pathlib.Path("data/research")
INPUT=ROOT/"sacred-art-b26-accession30-candidates.csv"
CAT=ROOT/"sacred-art-missing30-after-b25.csv"
OUT=ROOT/"sacred-art-b26-accession30-adjudicated.csv"
SUMMARY=ROOT/"sacred-art-b26-accession30-adjudicated.summary.json"
FIELDS=["artwork_id","work_title","museum_identifier","commons_file_title","commons_page",
        "raw_accession_literal","expected_artist_in_file","institution_identity_context",
        "manual_identification_exception","adjudicated_identity_status",
        "image_rights_status","source_original_acquired","production_release"]
def read(path):
    with path.open(newline="",encoding="utf-8") as f:return list(csv.DictReader(f))
def main():
    incoming=read(INPUT)
    src={x["artwork_id"]:x for x in read(CAT)}
    assert len(src)==30 and len(incoming)==61
    out=[]
    for r in incoming:
        id_=r["artwork_id"];art=src[id_];name=r["commons_file_title"]
        metadata=" ".join([r["metadata_source"],r["metadata_description"],r["metadata_artist"]]).lower()
        host=(art["legacy_source_url"] or art["legacy_object_url"] or "").lower()
        if "museodelprado.es" in host:
            institutional=any(s in metadata for s in ("museodelprado.es","museo del prado","museo nacional del prado"))
        elif "louvre.fr" in host:
            institutional=any(s in metadata for s in ("louvre.fr","musée du louvre","musee du louvre"))
        elif "pop.culture.gouv.fr" in host:
            institutional="pop.culture.gouv.fr" in metadata
        elif "catalogo" in host:
            institutional=any(s in metadata for s in ("catalogo.beniculturali.it","catalogo.cultura.gov.it","beni culturali"))
        else:institutional=bool(r["institution_url_found"]=="YES")
        exception=""
        if name=="File:Williampinkney (1).jpg" and r["museum_accession_search"]=="P000362":
            exception="US_CONGRESSIONAL_BIOGUIDE_IDENTIFIER_NOT_PRADO"
            institutional=False
        has_literal=r["literal_accession_found"]=="YES"
        has_artist=r["attribution_keyword_found"]=="YES"
        status="POTENTIAL_INSTITUTIONAL_OBJECT_ID_REQUIRES_HUMAN_CONFIRMATION" if (has_literal and institutional and has_artist) else ("IDENTIFIER_NAMESPACE_FALSE_POSITIVE" if exception else "UNVERIFIED_FILE_CANDIDATE_ONLY")
        out.append({"artwork_id":id_,"work_title":r["title"],"museum_identifier":r["museum_accession_search"],
            "commons_file_title":name,"commons_page":r["commons_file_page"],"raw_accession_literal":r["literal_accession_found"],
            "expected_artist_in_file":r["attribution_keyword_found"],"institution_identity_context":"YES" if institutional else "NO",
            "manual_identification_exception":exception,"adjudicated_identity_status":status,
            "image_rights_status":"NOT_CLEARED","source_original_acquired":"NO","production_release":"HOLD"})
    with OUT.open("w",newline="",encoding="utf-8") as f:
        writer=csv.DictWriter(f,fieldnames=FIELDS);writer.writeheader();writer.writerows(out)
    counts=dict(Counter(x["adjudicated_identity_status"] for x in out))
    assert counts.get("IDENTIFIER_NAMESPACE_FALSE_POSITIVE",0)==1
    summary={"raw_file_candidates":len(out),"raw_literal_accession_hits":sum(x["raw_accession_literal"]=="YES" for x in out),
        "confirmed_namespace_false_positives":1,
        "strong_identity_candidates_still_requiring_human_confirmation":sum(x["adjudicated_identity_status"]=="POTENTIAL_INSTITUTIONAL_OBJECT_ID_REQUIRES_HUMAN_CONFIRMATION" for x in out),
        "identity_approvals":0,"rights_approvals":0,"new_image_files":0,"publication_approvals":0,
        "counts":counts,
        "exception":"P000362 US Congress person William Pinkney is not Prado Giandomenico Tiepolo painting P000362",
        "checked_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")}
    SUMMARY.write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY",json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
