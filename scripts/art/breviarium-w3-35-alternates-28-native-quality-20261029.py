#!/usr/bin/env python3
"""Breviarium Wave 3: whole 35-weak + 28-source native-quality cohort.

Validate a deliberately curated set of *distinct file* upgrades in one Commons
ImageInfo request. Do not download originals from Wikimedia after 429.
Provenance, distinct physical identity and file-photo rights remain separate.
"""
import hashlib,html,json,urllib.parse,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
W2=ROOT/"data/calendar/sacred-art-breviarium-83-w2-cross-registry-institutional-leads-20261029.v1.json"
W1=ROOT/"data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json"
OUT=ROOT/"data/calendar/sacred-art-breviarium-83-w3-weak-photo-alternatives-20261029.v1.json"
registry=json.loads(W2.read_text())
gallery=json.loads(W1.read_text())
byid={x["plate_id"]:x for x in registry["records"]}
assert len(byid)==83 and len(gallery["records"])==83
WEAK={"REPLACE_INSUFFICIENT_NATIVE_PHOTO","BETTER_NATIVE_PHOTO_PREFFERED"}
WEAK_IDS={k for k,v in byid.items() if v["publication_gate"] in WEAK}
QA_IDS={k for k,v in byid.items() if v["publication_gate"]=="CANDIDATE_NEEDS_FULL_NATIVE_PHOTO_AND_RIGHTS_QA"}
assert len(WEAK_IDS)==35 and len(QA_IDS)==28 and not (WEAK_IDS&QA_IDS)
# Curatorial physical-work IDs may be known from institutional catalogue,
# NOT inferred from file dimensions, painting titles or authors alone.
LEADS=[
 {"id":"plate-zurbaran-francis","title":"File:Saint francis in meditation 075217.JPG","object":"Timken 2015:001","identity":"MATCH_EXACT_INVENTORY","issue":"Independent user camera JPG, ISO 1600 and edited; appearance must be inspected at native pixels"},
 {"id":"plate-murillo-immaculate","title":"File:Inmaculada Concepción (Murillo, El Escorial).jpg","object":"Museo del Prado P00972","identity":"MATCH_EXACT_INVENTORY","issue":"Prado photographic source with faithful 2D PD-Art label; do NOT reuse Cleveland Murillo 1959.189"},
 {"id":"plate-murillo-immaculate","title":"File:Imaculada - Murillo.jpg","object":"Museo del Prado P00972","identity":"MATCH_EXACT_INVENTORY","issue":"Second version of Prado object P00972; source and tonal differences require inspection"},
 {"id":"plate-caravaggio-matthew","title":"File:The Calling of Saint Matthew-Caravaggo (1599-1600).jpg","object":"San Luigi dei Francesi, Contarelli Chapel original","identity":"MATCH_EXACT_COMPOSITION_INSTITUTION","issue":"Version reverted in April 2026; photo quality not guaranteed by large pixels"},
 {"id":"plate-caravaggio-matthew","title":"File:Caravaggio — The Calling of Saint Matthew.jpg","object":"San Luigi dei Francesi, Contarelli Chapel original","identity":"MATCH_EXACT_COMPOSITION_INSTITUTION","issue":"Photographer CC0 user file, 2025 colour correction, ISO6400; >40MB storage hold"},
 {"id":"plate-velazquez-crucified","title":"File:Cristo crucificado.jpg","object":"Museo del Prado P01167","identity":"MATCH_EXACT_INVENTORY","issue":"Prado institution source 2046×3051; avoid inferior WGA 588×900"},
 {"id":"plate-reni-cecilia","title":"File:St. Cecilia by Guido Reni.jpg","object":"Norton Simon Museum Saint Cecilia (1606)","identity":"MATCH_EXACT_COMPOSITION_INSTITUTION","issue":"2052×2574 file PD-Art; photographer provenance and frame-free edges pending"},
 {"id":"plate-titian-assumption","title":"File:Assumption of the Virgin – Titian.jpg","object":"Santa Maria Gloriosa dei Frari, Venice, high altar","identity":"MATCH_EXACT_COMPOSITION_INSTITUTION","issue":"New October 2026 87MB very large claimed scan; scan authenticity, painted bounds, free permanent storage unresolved"},
 {"id":"plate-raphael-transfiguration","title":"File:Raffael-verklärung-christi.jpg","object":"Vatican Museums, Pinacoteca, Raphael Transfiguration","identity":"MATCH_EXACT_COMPOSITION_INSTITUTION","issue":"Official object accession MV.40333; NOT a different Google Art Project Dulwich Raphael painting"},
 {"id":"plate-raphael-transfiguration","title":"File:Raphaël, La Transfiguration, 1518–1520, huile sur bois, 405 × 278 cm, Musées du Vatican, Pinacothèque, inv. 4.jpg","object":"Vatican Museums, Pinacoteca, Raphael Transfiguration","identity":"MATCH_EXACT_COMPOSITION_INSTITUTION","issue":"40MB version, needs quality, photographer rights and storage review"},
]
assert len({z["title"] for z in LEADS})==len(LEADS)
assert all(z["id"] in WEAK_IDS for z in LEADS)
UA="AdOrientem-SacredArt-Breviarium-Research/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
titles="|".join(z["title"] for z in LEADS)
url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
    "action":"query","format":"json","formatversion":2,"prop":"imageinfo",
    "iiprop":"size|mime|sha1|url|extmetadata","titles":titles})
known={}
error=None
try:
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json","Accept-Encoding":"identity"})
    with urllib.request.urlopen(req,timeout=42) as f:
        data=json.loads(f.read(2500000))
    for page in data.get("query",{}).get("pages",[]):
        if not page.get("imageinfo"):continue
        info=page["imageinfo"][0]
        ext=info.get("extmetadata") or {}
        key=page.get("title","").replace("_"," ")
        clean=lambda z: " ".join(html.unescape(str(z or "")).replace("<br />"," ").split())[:180]
        known[key]={
            "width":info.get("width"),"height":info.get("height"),
            "size_bytes":info.get("size"),"sha1":info.get("sha1"),
            "mime":info.get("mime"),"descriptionurl":info.get("descriptionurl"),
            "licence":clean(ext.get("LicenseShortName",{}).get("value")),
            "copyrighted":clean(ext.get("Copyrighted",{}).get("value")),
            "source_page":info.get("descriptionurl")}
except Exception as e:
    error=type(e).__name__+": "+str(e)[:400]
alts={}
for p in LEADS:
    meta=known.get(p["title"])
    item={**p,"source":{"commons_title":p["title"],"file_page":"https://commons.wikimedia.org/wiki/"+urllib.parse.quote(p["title"].replace("File:","File:").replace(" ","_"),safe=":,()'_.–é")},
          "metadata_status":"VERIFIED_CURRENT_COMMS_IMAGEINFO" if meta else "METADATA_REQUEST_UNAVAILABLE_OR_FILE_ABSENT",
          "current_source_info":meta,
          "original_downloaded_in_w3":False,"photographic_rights_final":False,
          "painting_original_exact_photo_final_verified":False,"native_photo_quality_final":False,
          "production_allowed":False}
    old=byid[p["id"]]
    item["breviarum_short_edge"]=min(old["native_pixels"])
    if meta:
        item["short_edge_improvement_factor"]=round(min(meta["width"],meta["height"])/item["breviarum_short_edge"],3)
        item["max_pixel_ratio"]=round(max(meta["width"],meta["height"])/max(old["native_pixels"]),3)
        size=meta.get("size_bytes") or 0
        if size>30_000_000:item["download_gate"]="HOLD_OVERSIZE_GT_30MB_NO_FREE_STORE_CERT"
        elif item["short_edge_improvement_factor"]>1.1:item["download_gate"]="SOURCE_PIXELS_IMPROVED_NEEDS_PHOTO_RIGHTS_AND_FIDELITY_REVIEW"
        else:item["download_gate"]="NO_MEANINGFUL_NATIVE_SHORT_EDGE_IMPROVEMENT"
    else:item["download_gate"]="METADATA_UNAVAILABLE_HOLD"
    alts.setdefault(p["id"],[]).append(item)
source_byid={x["breviarum_plate_id"]:x for x in gallery["records"]}
cohorts={"weak":[],"native_review":[]}
for k in sorted(WEAK_IDS):
    x=byid[k];new=alts.get(k,[])
    cohorts["weak"].append({
        "id":k,"title":x["title"],"artist":x["artist"],
        "original_institutional_lead":x.get("source_provenance_known_links"),
        "breviarum_current_weak_pixels":x["native_pixels"],"breviarum_file_sha1":x["source_sha1"],
        "original_source_file_page":x["source_file_page"],
        "original_photo_rights_label":x["source_license_metadata"],
        "aesthetic_priority":x["aesthetic_triage"],
        "alternatives":new,
        "operational_status":"IDENTIFIED_EXACT_FILE_ALTERNATIVE_PHOTO_QA_PENDING" if new else (
            "STYLE_OR_TASTE_EXCEPTION_RETAIN_METADATA_ONLY" if x["aesthetic_triage"] in ("STYLE_EXCEPTION_HOLD","CONTEXTUAL_PAINTING_CANDIDATE") else
            "INSTITUTIONAL_EXACT_PHOTO_SOURCE_STILL_NEEDED"),
        "no_substitution_of_different_physical_work":True,
        "user_approval_still_required":True,"pristine_certified":False,"production_activated":False})
for k in sorted(QA_IDS):
    x=byid[k];orig=source_byid[k]
    lic=(x["source_license_metadata"] or "").lower()
    photo_rights="COMMONS_PD_ART_NOT_JURISDICTIONALLY_CLEARED" if "public domain" in lic or "cc0" in lic else "CREATIVE_COMMONS_ATTRIBUTION_COMPLIANCE_AND_PHOTOGRAPH_RIGHTS_HOLD"
    source_file=orig.get("bulk_photo_firstwave") or {}
    verified=bool(source_file.get("archive_path"))
    cohorts["native_review"].append({
        "id":k,"title":x["title"],"artist":x["artist"],
        "pixels":x["native_pixels"],"source_sha1":x["source_sha1"],"source_page":x["source_file_page"],
        "file_bytes":x["source_file_bytes"],"source_rights_label":x["source_license_metadata"],
        "technical_workclass":"EXACT_FILE_BYTES_SHA1_ARCHIVED_4_NATIVE_CORNERS_REVIEWED" if verified else "ORIGINAL_BYTES_NOT_ARCHIVED_NATIVE_PHOTO_QA_UNPERFORMED",
        "registered_original_archive_path":source_file.get("archive_path") if verified else None,
        "full_native_edges_verified":False,"painted_boundary_verified":False,
        "tonal_fidelity_verified":False,"rights_state":photo_rights,
        "pristine_certified":False,"production_activated":False})
weak=cohorts["weak"];qa=cohorts["native_review"]
confirmed=[a for r in weak for a in r["alternatives"] if a["current_source_info"]]
qualifying=[a for a in confirmed if a.get("short_edge_improvement_factor",0)>1.1 and a.get("download_gate")!="HOLD_OVERSIZE_GT_30MB_NO_FREE_STORE_CERT"]
result={"schema":"AO_SACRED_ART_BREVIARIUM_W3_35_WEAK_28_NATIVE_QA_SOURCE_V1","as_of":"2026-10-29",
        "from_reconciliation":"data/calendar/sacred-art-breviarium-83-w2-cross-registry-institutional-leads-20261029.v1.json",
        "source_gallery":"https://breviarium.ink/art/",
        "immutable_policy":{"reject_el_greco":True,"reject_fra_angelico":True,"preserve_existing_prayer_heroes":22,"preserve_global_rejected_artwork_ids":103,
                            "no_substitute_inventories":True,"no_painted_area_loss":True,"zero_cost":True},
        "counts":{"weak_full_cohort_processed":len(weak),"photo_quality_eligible_cohort_processed":len(qa),
                  "new_distinct_source_files_checked":len(LEADS),
                  "exact_file_metadata_returned":len(confirmed),
                  "weak_cases_with_alternative_file_metadata":len([r for r in weak if any(a["current_source_info"] for a in r["alternatives"])]),
                  "alternative_file_short_edge_improved_without_oversize":len(qualifying),
                  "already_archived_native_full_originals_in_28":sum(bool(r["registered_original_archive_path"]) for r in qa),
                  "file_photo_rights_not_final":len(qa),
                  "new_full_original_bytes_archived_in_wave3":0,
                  "new_pristine_certifications":0,"new_releases":0,"expenditure_eur":0},
        "commons_batch_imageinfo_error":error,"weak_cohort":weak,"native_quality_cohort":qa}
assert len(weak)==35 and len(qa)==28
OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
print(json.dumps(result["counts"],sort_keys=True))
