#!/usr/bin/env python3
"""Bulk intake: all 83 Breviarium.ink plates, Commons source-file metadata,
Ad Orientem prior 281 candidates + 103 rejection IDs + Prayer hero choices.

Research-only, no production mutation, no user re-selection, no image files
automatically promoted. Source rights and photo fidelity are separate gates.
"""
from __future__ import annotations
from collections import Counter
from datetime import datetime,timezone
import hashlib,json,re,unicodedata,urllib.parse,urllib.request,urllib.error
from pathlib import Path
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"data/calendar/sacred-art-breviarium-83-gallery-intake-20261029.v1.json"
PREVIOUS=json.loads(OUT.read_text()) if OUT.exists() else None
EVID=ROOT/"assets/staged/sacred-art-breviarium-source-audit-20261029"
EVID.mkdir(parents=True,exist_ok=True)
old=json.loads((ROOT/"data/calendar/sacred-art-candidates.v1.json").read_text())
banned=json.loads((ROOT/"data/calendar/sacred-art-w68-effective-global-rejection-blocklist-20261015.v1.json").read_text())
prayer=json.loads((ROOT/"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json").read_text())
assert len(old["artworks"])==281
assert banned["counts"]["effectiveBannedIDRecords"]==103
assert len(prayer["primary_artworks"])==22
UA="AdOrientem-SacredArt-Research/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
def get(url,limit=5_000_000,timeout=32):
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"text/html,application/json,*/*"})
    with urllib.request.urlopen(req,timeout=timeout) as f:
        buf=f.read(limit+1)
    if not buf or len(buf)>limit:raise ValueError("SOURCE_EMPTY_OR_TOO_LARGE")
    return buf
def norm(s):
    s=unicodedata.normalize("NFKD",s or "")
    s="".join(c for c in s if not unicodedata.combining(c)).lower()
    s=re.sub(r"\b(the|saint|st|sainte|our|lady|virgin|of|and|with|after|by|le|la|de|des)\b"," ",s)
    return re.sub(r"[^a-z0-9]+"," ",s).strip()
def short(s):
    return re.sub(r"\s+"," ",BeautifulSoup(str(s or ""),"html.parser").get_text(" ",strip=True))[:180]
def filename(url):
    p=urllib.parse.urlsplit(url)
    assert p.netloc=="commons.wikimedia.org"
    part=p.path.split("/Special:FilePath/",1)[-1]
    assert part and part!=p.path
    return urllib.parse.unquote(part).replace("_"," ")
def api(batch):
    title="|".join("File:"+f for f in batch)
    q=urllib.parse.urlencode({"action":"query","format":"json","formatversion":2,
      "prop":"imageinfo","iiprop":"size|sha1|mime|extmetadata|url","titles":title})
    obj=json.loads(get("https://commons.wikimedia.org/w/api.php?"+q,limit=6_000_000,timeout=40))
    data={}
    for page in obj.get("query",{}).get("pages",[]):
        if page.get("missing") or not page.get("imageinfo"):continue
        p=page["imageinfo"][0]
        ex=p.get("extmetadata") or {}
        data[page["title"].removeprefix("File:").replace("_"," ")]={
            "file_page":p.get("descriptionurl"),"sha1":p.get("sha1"),
            "native_width_px":p.get("width"),"native_height_px":p.get("height"),
            "byte_size":p.get("size"),"mime":p.get("mime"),
            "license_short_name":short(ex.get("LicenseShortName",{}).get("value")),
            "copyrighted":short(ex.get("Copyrighted",{}).get("value")),
            "artist_metadata":short(ex.get("Artist",{}).get("value")),
            "credit_metadata":short(ex.get("Credit",{}).get("value")),
            "commons_current_file_url":p.get("url")}
    return data

site="https://breviarium.ink/art/"
html=get(site,limit=1_000_000)
soup=BeautifulSoup(html,"html.parser")
sections=soup.select("section.g-part")
expected={"Our Lady":23,"The Life of Christ":29,"The Mystery of God":2,"The Angels":6,"The Saints":23}
assert len(sections)==5
records=[]
for sec in sections:
    heading=sec.select_one("h2").get_text(" ",strip=True)
    assert heading in expected
    figures=sec.select("figure.g-plate")
    assert len(figures)==expected[heading],f"Count mismatch: {heading}, {len(figures)}"
    for fig in figures:
        tit=fig.select_one(".g-title")
        meta=fig.select_one(".g-meta")
        a=fig.select_one("a.g-frame[href]")
        if not (tit and meta and a):raise ValueError("MISSING_PLATE_FIELDS")
        title=tit.get_text(" ",strip=True)
        rawmeta=meta.get_text(" ",strip=True)
        comps=[x.strip() for x in rawmeta.split("·",1)]
        artist=comps[0]
        date=comps[1] if len(comps)>1 else None
        source_url=a["href"]
        file=filename(source_url)
        id=fig.get("id","")
        assert id.startswith("plate-") and title and artist
        notes=[n.get_text(" ",strip=True) for n in fig.select(".g-note,.plate-note,.note")]
        records.append({
            "breviarum_plate_id":id,
            "title":title,"artist_as_credited":artist,"date_label":date,
            "gallery_section":heading,"breviarum_gallery_url":site+"#"+id,
            "source_file_path_url":source_url,
            "commons_filename":file,
            "original_source_discovery":"BREVIARIUM_GALLERY_TO_COMMONS_FILEPATH",
            "notes_from_gallery":notes[:3]})
assert len(records)==83
assert len({v["breviarum_plate_id"] for v in records})==83
assert len({v["commons_filename"] for v in records})==83
# The owner's hard artist exclusions are immutable, independent of subject.
HARD=("el greco","fra angelico")
top_artists=("caravaggio","guido reni","philippe de champaigne",
 "georges de la tour","rembrandt","diego velazquez","bartolome esteban murillo",
 "jusepe de ribera","francisco de zurbaran","gerard van honthorst",
 "giovanni battista tiepolo","antonio de pereda","pompeo batoni")
secondary=("raphael","titian","paolo veronese","giovanni bellini",
 "jan van eyck","sassoferrato","leonardo da vinci","albrecht durer",
 "carl bloch","francesco botticini","miguel cabrera","johann georg schmidtner")
lowstyle=("duccio","giotto","sassetta","masaccio","ghirlandaio",
 "lorenzo monaco","francesco del cossa","goswin van der weyden",
 "carlo crivelli","sandro botticelli","verrocchio","book of kells")
# Normalize preferences with the same accent and name-particle rules as gallery artists.
top_artists=tuple(norm(z) for z in top_artists)
secondary=tuple(norm(z) for z in secondary)
lowstyle=tuple(norm(z) for z in lowstyle)
# Existing metadata matches are leads, never proof of physical object identity.
prior={}
for a in old["artworks"]:
    prior.setdefault((norm(a.get("artist")),norm(a.get("title"))),[]).append({
        "record_id":a.get("id"),"artist":a.get("artist"),
        "title":a.get("title"),"object_url":a.get("source",{}).get("objectUrl"),
        "source_sha256":a.get("acquisition",{}).get("originalSha256"),
        "editorial_status":a.get("review",{}).get("status")})
prohibited={}
for x in banned["items"]:
    prohibited.setdefault((norm(x.get("artist")),norm(x.get("title"))),[]).append({
        "previous_artwork_id":x.get("artworkId"),"title":x.get("title"),
        "artist":x.get("artist"),"score":x.get("score"),"original_sha256":x.get("originalSha256"),
        "source_object_url":x.get("primaryURL")})
heroes={}
for h in prayer["primary_artworks"]:
    heroes.setdefault((norm(h.get("artist")),norm(h.get("title"))),[]).append({
        "prayer_module":h["module_id"],"original_sha256":h["original"]["sha256"],
        "status":h.get("editorial_status")})
for r in records:
    artist=norm(r["artist_as_credited"])
    title=norm(r["title"])
    key=(artist,title)
    excluded=any(z in artist for z in HARD)
    collision=prohibited.get(key,[])
    known=prior.get(key,[])
    hero=heroes.get(key,[])
    if excluded:
        tier="EXCLUDE_ARTIST"
        action="DO_NOT_ACQUIRE_OR_DISPLAY"
        reason="PERMANENT_USER_ARTIST_EXCLUSION"
    elif collision:
        tier="EXACT_OBJECT_REJECTION_IDENTITY_REVIEW"
        action="RECONCILE_PHYSICAL_OBJECT_ID_AGAINST_GLOBAL_BAN_BEFORE_ANY_ACQUISITION"
        reason="PAINTING_TITLE_ARTIST_MAY_COLLIDE_WITH_EXPLICIT_0_TO_2_USER_REJECTION"
    elif any(z in artist for z in top_artists):
        tier="PRIORITY_PHOTOGRAPHIC_QA"
        action="CHECK_NATIVE_SOURCE_AND_PRIOR_EDITORIAL_OWNER_BEFORE_STAGING"
        reason="STRONG_AESTHETIC_ALIGNMENT_ARTIST_ONLY_NOT_PAINTING_APPROVAL"
    elif any(z in artist for z in secondary):
        tier="CONTEXTUAL_PAINTING_CANDIDATE"
        action="SCREEN_SUBJECT_VISUAL_AND_PRIOR_EDITORIAL_OWNER"
        reason="CONTEXTUAL_ARTIST_OR_SUITABLE_ICONOGRAPHY_NOT_AUTO_APPROVED"
    elif any(z in artist for z in lowstyle):
        tier="STYLE_EXCEPTION_HOLD"
        action="KEEP_RESEARCH_REFERENCE_ONLY_UNLESS_EXPLICIT_PRIOR_APPROVAL"
        reason="MEDIEVAL_OR_EARLY_RENAISSANCE_STYLE_OUTSIDE_DARK_BAROQUE_DEFAULT"
    else:
        tier="SECONDARY_VISUAL_REVIEW"
        action="REVIEW_FULL_IMAGE_AND_OBJECT_BEFORE_PROMOTION"
        reason="SINGLE_PAINTING_MAY_FIT_AESTHETIC_DESPITE_ARTIST_NOT_BEING_PRIORITY"
    r.update({"aesthetic_triage":tier,"preliminary_reason":reason,
        "next_action":action,"user_editorial_approval_for_this_work":False,
        "hard_artist_exclusion":excluded,
        "possible_global_rejected_identity_collisions":collision,
        "possible_existing_281_candidate_collisions":known,
        "possible_22_prayer_hero_collisions":hero,
        "same_artist_and_title_not_sufficient_for_physical_object_dedup":True,
        "not_an_automatic_replacement_for_any_selected_hero":True,
        "pristine_photo_certified":False,"production_allowed":False,
        "rights_verified_for_exact_photo":False})
# Minimise metadata requests: two ~50-title batches. Read-only; no image bytes.
meta={}
errors=[]
previous_metadata={x["commons_filename"]:x.get("commons_current_imageinfo") for x in PREVIOUS["records"]} if PREVIOUS and PREVIOUS.get("gallery_html_sha256")==hashlib.sha256(html).hexdigest() else {}
for start in (0,45):
    chunk=records[start:start+45]
    try:
        info=api([x["commons_filename"] for x in chunk])
        meta.update(info)
        errors.append(None)
    except Exception as e:
        errors.append(type(e).__name__+": "+str(e)[:250])
for r in records:
    info=meta.get(r["commons_filename"])
    if info is None and previous_metadata.get(r["commons_filename"]):
        info=previous_metadata[r["commons_filename"]]
        r["commons_metadata_from_prior_validated_snapshot"]=True
    if info is None:
        r["source_metadata_status"]="NOT_RETURNED_OR_COMMONS_API_UNAVAILABLE"
        r["source_metadata_rights_hold"]=True
        r["source_photo_pixel_quality_review"]="NOT_CHECKED"
    else:
        r["commons_current_imageinfo"]=info
        lic=info.get("license_short_name","").lower()
        rights_ok=("public domain" in lic or lic in ("cc0","cc zero","cc-zero"))
        r["source_metadata_status"]="COMMONS_CURRENT_FILE_METADATA_CAPTURED"
        r["source_metadata_rights_hold"]=not rights_ok
        r["source_photo_pixel_quality_review"]="NOT_CHECKED"
        if (info.get("native_width_px") or 0)<1800 or (info.get("native_height_px") or 0)<1800:
            r["low_native_resolution_candidate"]=True
        else:
            r["low_native_resolution_candidate"]=False
# Additional rights and art-level quality gates remain independent.
count=Counter(x["aesthetic_triage"] for x in records)
sections_count=Counter(x["gallery_section"] for x in records)
result={"schema":"AO_SACRED_ART_BREVIARIUM_83_BULK_INTAKE_V1","as_of":"2026-10-29",
 "source_home":"https://breviarium.ink/","source_gallery":site,
 "gallery_html_sha256":hashlib.sha256(html).hexdigest(),
 "source_granularity":"EXACT_GALLERY_PLATE_TO_COMMONS_FILENAME_NOT_PROVEN_PAINTING_OBJECT",
 "preservation_policy":[
    "Never replace an explicitly approved artwork or its selected original photograph.",
    "Always exclude El Greco and Fra Angelico. Check 103 exact rejected art IDs before promotion.",
    "Artist/title similarity can flag duplication but never prove one physical painting.",
    "Do not import Breviarium's matte/site frame, font or artwork styling; source Commons master directly.",
    "The work's age does not alone grant rights in every photo or jurisdiction.",
    "Source metadata, full-native image quality, and curatorial acceptance are distinct gates.",
    "No paid source, no contact with rights owners, no production activation."],
 "upstream_owners":{
    "sacred_art_candidates_281":"data/calendar/sacred-art-candidates.v1.json",
    "global_rejections_103":"data/calendar/sacred-art-w68-effective-global-rejection-blocklist-20261015.v1.json",
    "prayer_approved22":"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json"},
 "counts":{"total_gallery_plates":len(records),"gallery_sections":dict(sections_count),
   "aesthetic_triage":dict(count),
   "hard_artist_exclusions":sum(x["hard_artist_exclusion"] for x in records),
   "possible_global_rejected_identity_collisions":sum(bool(x["possible_global_rejected_identity_collisions"]) for x in records),
   "potential_existing_candidate_collisions":sum(bool(x["possible_existing_281_candidate_collisions"]) for x in records),
   "possible_prayer_hero_collisions":sum(bool(x["possible_22_prayer_hero_collisions"]) for x in records),
   "commons_metadata_confirmed":sum(x["source_metadata_status"]=="COMMONS_CURRENT_FILE_METADATA_CAPTURED" for x in records),
   "low_resolution_native_source_candidates":sum(x.get("low_native_resolution_candidate",False) for x in records),
   "new_photo_originals_downloaded":0,"new_pristine_certifications":0,
   "production_activated":0,"cost_eur":0},
 "commons_metadata_batch_errors":errors,"records":records}
# Updating aesthetic classification must not erase successful image-archive proof.
if PREVIOUS and PREVIOUS.get("gallery_html_sha256")==result["gallery_html_sha256"]:
    old_rows={z["breviarum_plate_id"]:z for z in PREVIOUS["records"]}
    for row in records:
        prev=old_rows.get(row["breviarum_plate_id"],{})
        if "bulk_photo_firstwave" in prev:
            row["bulk_photo_firstwave"]=prev["bulk_photo_firstwave"]
    for k,v in PREVIOUS.get("counts",{}).items():
        if k.startswith("w1_") or k=="new_photo_originals_downloaded":
            result["counts"][k]=v
    if PREVIOUS.get("image_acquisition_wave1"):
        result["image_acquisition_wave1"]=PREVIOUS["image_acquisition_wave1"]
result["counts"]["artist_name_normalization_corrections"]=5
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
(EVID/"import-summary.json").write_text(json.dumps({"source":site,"sha256":result["gallery_html_sha256"],
    "counts":result["counts"],"metadata_api_errors":errors,"schema":result["schema"]},indent=2)+"\n")
print(json.dumps(result["counts"],ensure_ascii=False,sort_keys=True))
assert len(records)==83 and result["counts"]["hard_artist_exclusions"]==7
