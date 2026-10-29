#!/usr/bin/env python3
"""Batch 7B: deduplicate Breton original and acquire exact Seven Sorrows candidate.

One batch Commons ImageInfo query for two pinned exact-work filenames.
Breton image SHA-256 compared to *existing* archived primary original, not
downloaded again if metadata says unchanged (fewer network requests).
MNAC Google Art Project rendition downloaded unaltered as additional photo
candidate, source SHA1 + dimension + explicit PD-Art metadata checked.
No promotion to primary, no final rights or pristine certifications.
"""
import hashlib,html,io,json,re,urllib.parse,urllib.request
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"assets/staged/prayer-art-b7b-breton-mnac-exact-commons-20261029"
OUT.mkdir(parents=True,exist_ok=True)
REG=json.loads((ROOT/"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json").read_text())
R={x["module_id"]:x for x in REG["primary_artworks"]}
UA="AdOrientem-PrayerArt-ExactSourcePhoto-Research/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
FILES={
 "morning":"File:Jules Breton, le chant de l'alouette.1884.jpg",
 "sorrows":"File:Master of the Half Lengths - Virgin of the Seven Sorrows - Google Art Project.jpg"}
def get(url,limit=10000000):
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/jpeg,*/*"})
    with urllib.request.urlopen(req,timeout=65) as f:
        raw=f.read(limit+1)
    if len(raw)>limit:raise ValueError("SOURCE_BYTES_EXCEED_LIMIT")
    return raw
api="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
    "action":"query","format":"json","formatversion":2,
    "titles":"|".join(FILES.values()),"prop":"imageinfo",
    "iiprop":"url|size|mime|sha1|extmetadata"})
doc=json.loads(get(api,3000000).decode())
pages={}
for page in doc.get("query",{}).get("pages",[]):
    info=(page.get("imageinfo") or [{}])[0]
    pages[page.get("title","").replace("_"," ")]=info
rows=[]
for key,title in FILES.items():
    h=R[key]
    data={"id":key,"artist":h["artist"],"artwork":h["title"],"commons_exact_filename":title,
          "existing_primary_sha256":h["original"]["sha256"],
          "existing_primary_dimensions":h["original"]["dimensions_px"],
          "research_only":True,"original_primary_bytes_unchanged":True,
          "photo_rights_final_certified":False,"pristine_certified":False,
          "publication_allowed":False}
    try:
        info=pages.get(title)
        if not info or not info.get("url"):raise ValueError("PINNED_COMMONS_TITLE_MISSING")
        rights=info.get("extmetadata") or {}
        licence=re.sub("<[^>]*>"," ",str(rights.get("LicenseShortName",{}).get("value",""))).strip()
        data["commons_metadata"]={
            "file_page":"https://commons.wikimedia.org/wiki/"+urllib.parse.quote(title.replace(" ","_"),safe=":,_.()'"),
            "sha1":info.get("sha1"),"width":info.get("width"),"height":info.get("height"),
            "mime":info.get("mime"),"licence":licence,
            "copyrighted":re.sub("<[^>]*>"," ",str(rights.get("Copyrighted",{}).get("value",""))).strip(),
            "artist":re.sub("<[^>]*>"," ",str(rights.get("Artist",{}).get("value",""))).strip()[:250]}
        if info.get("mime")!="image/jpeg" or not info.get("sha1"):raise ValueError("UNTRUSTED_FILE_TYPE")
        if "public domain" not in licence.lower():raise ValueError("NOT_EXPLICIT_PD_MARK")
        if key=="morning":
            if [info.get("width"),info.get("height")]!=h["original"]["dimensions_px"]:
                raise ValueError("INDEPENDENT_MORNING_COMMONS_DIMENSIONS_MISMATCH")
            # Exact current Commons file still needs byte-match before declaring
            # the archival photo definitively same. One pinned 2MB source fetch.
            raw=get(info["url"],limit=4500000)
            assert hashlib.sha1(raw).hexdigest()==info["sha1"],"ORIGIN_SHA1_MISMATCH"
            data["archived_primary_is_exact_second_commons_file"]=hashlib.sha256(raw).hexdigest()==h["original"]["sha256"]
            data["status"]="EXACT_PINNED_ARCHIVED_MORNING_COMMONS_FILE_VERIFIED" if data["archived_primary_is_exact_second_commons_file"] else "MORNING_SHA256_DIFFERENT_SAME_PIXEL_DIMENSIONS_HOLD"
        else:
            if info.get("width",0)<3000 or info.get("height",0)<4000:raise ValueError("MNAC_CANDIDATE_TOO_SMALL")
            raw=get(info["url"],limit=9000000)
            if hashlib.sha1(raw).hexdigest()!=info["sha1"]:raise ValueError("MNAC_SOURCE_SHA1_MISMATCH")
            with Image.open(io.BytesIO(raw)) as pic:
                pic.load()
                if [pic.width,pic.height]!=[info.get("width"),info.get("height")]:raise ValueError("IMAGEINFO_PIXEL_MISMATCH")
                display=ImageOps.exif_transpose(pic).convert("RGB")
                display.thumbnail((360,480),Image.Resampling.LANCZOS)
            filename="sorrows-google-art-project-3250x4391-commons-original.jpg"
            target=OUT/filename
            target.write_bytes(raw)
            proof=OUT/"sorrows-google-art-project-entire-composition-review.jpg"
            panel=Image.new("RGB",(510,565),(18,22,27))
            d=ImageDraw.Draw(panel)
            d.text((8,10),"MNAC 008327-000 - GOOGLE ART PROJECT SOURCE - HOLD",fill=(242,221,198))
            panel.paste(display,((510-display.width)//2,47))
            d.text((8,532),"No approval. Exact file SHA1 / SHA256 captured.",fill=(200,201,204))
            panel.save(proof,"JPEG",quality=91)
            data["candidate_image"]={
                "path":str(target.relative_to(ROOT)), "sha256":hashlib.sha256(raw).hexdigest(),
                "sha1":hashlib.sha1(raw).hexdigest(),"pixels":[info["width"],info["height"]],
                "bytes":len(raw),"full_frame_proof":str(proof.relative_to(ROOT)),
                "full_frame_proof_sha256":hashlib.sha256(proof.read_bytes()).hexdigest(),
                "quality_and_rights_hold":True,"master_not_replaced":True}
            data["status"]="HIGHER_NATIVE_PIXEL_EXACT_SEVEN_SORROWS_SOURCE_ARCHIVED_FOR_QUALITY_REVIEW"
    except Exception as e:
        data["status"]="EXACT_FILE_SOURCE_HOLD"
        data["exception"]=type(e).__name__+": "+str(e)[:400]
    rows.append(data)
result={"schema":"AO_PRAYER_ART_B7B_BRETON_AND_MNAC_COMMONS_NATIVE_CANDIDATES_V1",
       "date":"2026-10-29","source_api_calls":1,
       "cases":rows,"totals":{
          "cases":2,"primary_hero_master_overwrites":0,
          "archived_source_exact_morning_identifications":sum(1 for x in rows if x.get("archived_primary_is_exact_second_commons_file")),
          "higher_resolution_sorrows_candidate_archived":sum(1 for x in rows if x.get("candidate_image")),
          "pristine_final_certifications":0,"photo_rights_final_certifications":0,"production_releases":0,"cost_eur":0}}
(OUT/"two-case-results.json").write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n")
print(json.dumps({"statuses":{x["id"]:x["status"] for x in rows},**result["totals"]}))
