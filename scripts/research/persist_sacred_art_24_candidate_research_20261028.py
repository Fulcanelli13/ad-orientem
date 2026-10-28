#!/usr/bin/env python3
"""Persist metadata-only 24-artwork Commons discovery from previously completed GitHub run.

No image downloads. No editorial selection changes. Rejected photo does not reject painting.
"""
import json
from pathlib import Path
BASE=Path(__file__).resolve().parents[2]
F=BASE/"artifacts/24-source-input/records.json"
rows=json.loads(F.read_text(encoding="utf8"))["records"]
assert len(rows)==24 and len({a["artwork_id"] for a in rows})==24
manual={
"ART-ean-estout-entecost":{
 "review":"EXACT_LOUVRE_INV20303_ARTWORK_CONFIRMED_BUT_PHOTO_REJECTED",
 "photographic_reason":"4037x2444 Pierre-Yves Beaudouin file Restout - La Pentecôte 01.jpg has visible four-sided gilt frame and serious glare. HIGH RES does NOT mean good photo.",
 "source_url":"https://commons.wikimedia.org/wiki/File:Restout_-_La_Pentec%C3%B4te_01.jpg"},
"B01-MARK-RENI-GENOA":{
 "review":"HIGHER_RES_PAINTING_PHOTO_LEADS_REJECTED_FRAME_VISIBLE",
 "photographic_reason":"Guido Reni Palazzo Rosso Saint Mark: 4352x3264 and 2154x2304 Commons files both depict gilt frame. Photographs under CC BY-SA 3.0, attribution needed. No clean photo master.",
 "source_url":"https://commons.wikimedia.org/wiki/File:Guido_reni,_san_marco_evangelista,_genova.JPG"},
"ART-eter-aul-ubens-iracles-of-aint-gnatius-of-oyola":{
 "review":"TOP_GOOGLE_ART_PROJECT_CANDIDATE_DIFFERENT_PHYSICAL_OBJECT",
 "photographic_reason":"Rubens Miracles of St Ignatius Google Art Project 3109x4921 is Dulwich Picture Gallery accession 148, NOT protected KHM Vienna GG517 painting.",
 "source_url":"https://commons.wikimedia.org/wiki/File:Rubens,_Sir_Peter_Paul_-_The_Miracles_of_Saint_Ignatius_of_Loyola_-_Google_Art_Project.jpg"},
"ART-ean-ouvenet-aising-of-azarus":{
 "review":"HIGH_RES_LOUVRE_TITLE_COLLISION_DIFFERENT_PAINTING",
 "photographic_reason":"Jouvenet 4037px Louvre INV5489 is different physical artwork from selected LACMA M.2000.179.4; no automated substitute.",
 "source_url":"https://commons.wikimedia.org/wiki/Category:La_R%C3%A9surrection_de_Lazare,_Jouvenet_(Louvre_INV5489)"},
"ART-uido-eni-usannah-and-the-lders":{
 "review":"HIGH_RES_SEARCH_HITS_DIFFERENT_ARTISTS_NOT_SAME_NG196",
 "photographic_reason":"The National Gallery NG196 Guido Reni has only 800px archived photograph. Search top hits include Getty Johann Carl Loth and Met other works.",
 "source_url":"https://www.nationalgallery.org.uk/paintings/guido-reni-susannah-and-the-elders"}
}
for item in rows:
 item["prior_artwork_approval_unchanged"]=True
 item["higher_resolution_photograph_accepted"]=False
 item["photo_rights_complete"]=False
 item["final_painted_surface_verified"]=False
 item["manual_source_review"]=manual.get(item["artwork_id"])
 for c in item["candidates"]:
  c["same_object_human_review_status"]="NOT_APPROVED"
  c["photo_frame_free_approved"]=False
  c["production_released"]=False
  if item["artwork_id"]=="ART-ean-estout-entecost" and "Restout - La Pentecôte 01" in c["file_title"]:
   c["photo_exclusion_reason"]="EXACT_OBJECT_BUT_VISIBLE_FRAME_AND_GLARE"
  if item["artwork_id"]=="ART-eter-aul-ubens-iracles-of-aint-gnatius-of-oyola" and "Google Art Project" in c["file_title"]:
   c["photo_exclusion_reason"]="WRONG_PHYSICAL_ORIGINAL_DULWICH_148_NOT_VIENNA_GG517"
counts={"paintings_screened":24,"paintings_with_highres_file_search_hits":sum(bool(a["candidates"]) for a in rows),
 "paintings_without_highres_file_search_hits":sum(not a["candidates"] for a in rows),
 "higher_resolution_file_hits":sum(len(a["candidates"]) for a in rows),
 "same_museum_object_filename_evidence":1,"photograph_replacements_accepted":0,
 "high_res_file_bytes_downloaded":0,"new_painting_selections":0,"fee_eur":0}
assert counts["paintings_with_highres_file_search_hits"]==16 and counts["higher_resolution_file_hits"]==118
out={"schema":"AO_SACRED_ART_APPROVED24_HIGHRES_CANDIDATES_V1","date":"2026-10-28",
 "research_run_url":"https://github.com/Fulcanelli13/ad-orientem/actions/runs/40668302895",
 "source_research_status":"24/24 Commons metadata queried. MOST of 118 hits are not verified exact painting sources; search result count is NOT completion count.",
 "counts":counts,"manual_high_risk_evidence":manual,
 "rules":["Frozen artwork IDs and editorial approvals immutable","Title/artist matches do not establish same physical museum object","Reject visible frame/mat/wall/glare regardless of pixel count","The Louvre Jouvenet and Dulwich Rubens alternatives must not replace distinct user-approved originals","Do not infer photographer commercial rights from generic public domain claim","No paid access or museum contact and no production deployment"],
 "records":rows}
dest=BASE/"data/calendar/sacred-art-approved24-highres-source-candidates-20261028.v1.json"
dest.write_text(json.dumps(out,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
print("PERSIST_A24",json.dumps(counts),str(dest))
