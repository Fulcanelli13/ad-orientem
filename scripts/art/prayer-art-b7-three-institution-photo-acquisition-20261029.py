#!/usr/bin/env python3
"""Ad Orientem Prayer Art B7: three institution-authored photo source trails.

AIC's official public-domain artwork API + bounded IIIF rendition;
NGA's own CC0-donated Commons file with exact source metadata;
MNAC's object page and named image accession, no unlicensed binary scraping.
All new binaries staged as provenance research candidates; never replace
existing masters or certify photo quality automatically.
"""
from __future__ import annotations
import hashlib,html,io,json,re,time,urllib.parse,urllib.request,urllib.error
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps
ROOT=Path(__file__).resolve().parents[2]
REG=ROOT/"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json"
OUT=ROOT/"assets/staged/prayer-art-b7-three-institution-native-20261028"
OUT.mkdir(parents=True,exist_ok=True)
reg=json.loads(REG.read_text())
heroes={x["module_id"]:x for x in reg["primary_artworks"]}
assert len(heroes)==22 and len(reg["placement_records"])==118
UA="AdOrientem-PrayerArt-Research/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
def fetch(url,limit=16000000,timeout=40):
    req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,text/html,image/jpeg,*/*"})
    with urllib.request.urlopen(req,timeout=timeout) as resp:
        raw=resp.read(limit+1)
        if len(raw)>limit:raise ValueError("SOURCE_EXCEEDS_BYTE_LIMIT")
        return raw
def jsget(url,limit=2000000):
    return json.loads(fetch(url,limit).decode("utf-8"))
def checksum(data):
    return hashlib.sha256(data).hexdigest()
def image_check(raw,min_w,min_h):
    with Image.open(io.BytesIO(raw)) as im:
        im.load()
        if im.format not in ("JPEG","PNG"):raise ValueError("UNEXPECTED_FILE_FORMAT")
        if im.width<min_w or im.height<min_h:raise ValueError("BELOW_CANDIDATE_SIZE")
        if im.width*im.height>90000000:raise ValueError("TOO_MANY_PIXELS")
        meta={"pixels":[im.width,im.height],"format":im.format,"has_icc":bool(im.info.get("icc_profile"))}
        display=ImageOps.exif_transpose(im).convert("RGB")
        display.thumbnail((500,500),Image.Resampling.LANCZOS)
        return meta,display
def persist_img(raw,stem,min_w,min_h):
    meta,thumb=image_check(raw,min_w,min_h)
    suffix=".jpg" if meta["format"]=="JPEG" else ".png"
    p=OUT/(stem+suffix)
    p.write_bytes(raw)
    proof=OUT/(stem+"-full-composition-review.jpg")
    canvas=Image.new("RGB",(580,590),(22,25,29))
    d=ImageDraw.Draw(canvas)
    d.text((16,10),stem+" / INSTITUTIONAL RESEARCH CANDIDATE - NOT PRISTINE",fill=(235,225,198))
    canvas.paste(thumb,((580-thumb.width)//2,50))
    d.text((16,562),"Exact source checksum retained. No automated publication.",fill=(235,210,180))
    canvas.save(proof,"JPEG",quality=90)
    thumb.close()
    return {**meta,"source_sha256":checksum(raw),"bytes":len(raw),"path":str(p.relative_to(ROOT)),
        "review_proof":str(proof.relative_to(ROOT)),
        "review_proof_sha256":checksum(proof.read_bytes()),
        "source_original_unchanged":True,"pristine_certified":False,"production_allowed":False}
def record(i,h):
    return {"case_id":i,"registered_hero_sha256":heroes[h]["original"]["sha256"],
       "hero_original_retained":True,"new_image_is_primary_master":False,
       "photo_rights_final_certified":False,"pristine_certified":False,
       "production_allowed":False,"source_checks":[]}
cases=[]
# Museum AIC id is found by live institution API: never assume a third-party object ID.
a=record("morning-aic-song-lark","morning")
try:
    u="https://api.artic.edu/api/v1/artworks/search?"+urllib.parse.urlencode({
      "q":"The Song of the Lark Jules Breton","limit":20,
      "fields":"id,title,artist_title,is_public_domain,image_id,date_display"})
    response=jsget(u)
    options=response.get("data",[])
    a["searched_official_api"]=u
    a["matched_artworks"]=[{k:y.get(k) for k in ("id","title","artist_title","is_public_domain","image_id")} for y in options[:10]]
    hits=[y for y in options if y.get("title","").lower().strip()=="the song of the lark" and
          "breton" in str(y.get("artist_title","")).lower() and y.get("is_public_domain") is True and y.get("image_id")]
    if len(hits)!=1:raise ValueError("ONE_EXACT_PD_ARTWORK_NOT_CONFIRMED_COUNT="+str(len(hits)))
    art=hits[0]
    detail=jsget("https://api.artic.edu/api/v1/artworks/"+str(art["id"])+"?fields=id,title,artist_title,image_id,is_public_domain,date_display")
    d=detail.get("data",{})
    assert d.get("image_id")==art["image_id"] and d.get("is_public_domain") is True
    a["authoritative_object"]={k:d.get(k) for k in ("id","title","artist_title","image_id","date_display","is_public_domain")}
    a["institution_public_domain_object"]=True
    a["institution_api_documentation"]="https://api.artic.edu/docs/"
    a["source_checks"].append("OFFICIAL_ARTWORK_ID_TITLE_ARTIST_PD_AND_IMAGE_ID_MATCH")
    url="https://www.artic.edu/iiif/2/"+urllib.parse.quote(d["image_id"],safe="")+"/full/1686,/0/default.jpg"
    raw=fetch(url)
    a["candidate_image"]=persist_img(raw,"morning-aic-official-iiif-1686",1500,1750)
    a["institutional_render_url"]=url
    a["status"]="INSTITUTIONAL_PUBLIC_DOMAIN_IIIF_RENDITION_ARCHIVED_REVIEW"
except Exception as e:
    a["status"]="INSTITUTIONAL_API_OR_RENDITION_HOLD"
    a["exception"]=type(e).__name__+": "+str(e)[:300]
cases.append(a)
# Exact NGA-donated Commons image is an institution-authored CC0 reproduction.
b=record("confession-nga-donated-cc0","confession")
try:
    title="File:Bartolomé Esteban Murillo, The Return of the Prodigal Son, 1667-1670, NGA 34956.jpg"
    url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode({
      "action":"query","format":"json","formatversion":2,"titles":title,
      "prop":"imageinfo","iiprop":"url|size|sha1|extmetadata"})
    info=jsget(url).get("query",{}).get("pages",[{}])[0].get("imageinfo",[{}])[0]
    ex=info.get("extmetadata",{})
    lic=str(ex.get("LicenseShortName",{}).get("value",""))
    source=html.unescape(re.sub("<[^>]*>"," ",str(ex.get("Credit",{}).get("value",""))))
    if "CC0" not in lic and "CC-Zero" not in lic:raise ValueError("NO_EXPLICIT_COMMONS_CC0")
    assert info.get("width")>=4000 and info.get("height")>=3500
    assert info.get("url","").startswith("https://upload.wikimedia.org/"),"WRONG_FILE_HOST"
    b["commons_institution_donated_source"]={"page":"https://commons.wikimedia.org/wiki/"+urllib.parse.quote(title.replace(" ","_"),safe=":(),_"),
        "metadata_url":url,"licence":lic,"credit":source[:350],
        "width":info.get("width"),"height":info.get("height"),"sha1":info.get("sha1")}
    raw=fetch(info["url"],limit=16000000,timeout=60)
    if hashlib.sha1(raw).hexdigest()!=info.get("sha1"):raise ValueError("COMMONS_SHA1_MISMATCH")
    b["candidate_image"]=persist_img(raw,"confession-nga-donated-cc0",3800,3400)
    b["status"]="EXACT_NGA_DONATION_CC0_SOURCE_ARCHIVED_REVIEW"
    b["source_checks"].extend(["NGA_OBJECT_34956","COMMONS_FILE_CC0","SOURCE_BYTES_SHA1_MATCH"])
except Exception as e:
    b["status"]="NGA_DONATED_COMMONS_IMAGE_HOLD"
    b["exception"]=type(e).__name__+": "+str(e)[:300]
cases.append(b)
# MNAC object/asset is authoritative, but actual image rights need separately proved.
c=record("sorrows-mnac-008327","sorrows")
try:
    url="https://www.museunacional.cat/ca/colleccio/mare-de-deu-dels-set-dolors/mestre-de-les-mitges-figures/008327-000"
    page=fetch(url,limit=2500000).decode("utf-8",errors="replace")
    text=re.sub(r"\s+"," ",html.unescape(re.sub("<[^>]+>"," ",page))).lower()
    if "008327-000" not in text or "mare de déu dels set dolors" not in text:
        raise ValueError("MNAC_OBJECT_TEXT_NOT_FOUND")
    c["object_page"]=url
    c["image_asset_page"]="https://www.museunacional.cat/ca/file/008327-000jpg-0"
    c["source_checks"].append("MNAC_CATALOGUE_008327-000_MATCHES_APPROVED_WORK")
    c["object_public_domain_label_found"]="domini públic" in text
    c["source_checks"].append("MNAC_OBJECT_PAGE_COPYRIGHT_DOMINI_PUBLIC" if c["object_public_domain_label_found"] else "OBJECT_PD_LABEL_NOT_FETCHED")
    # Extract only the museum HTML's possible image sources for subsequent exact-byte
    # matching. Do not scrape/download a lower-res thumbnail as a claimed original.
    found=re.findall(r'008327[^"<> ]{0,140}[.]((?:jpg|jpeg|png))',page,re.I)
    c["museum_html_image_extensions_detected"]=list(sorted(set(y.lower() for y in found)))
    c["status"]="OFFICIAL_MNAC_OBJECT_IMAGE_REFERENCE_CONFIRMED_BINARY_NOT_YET_MAPPED"
except Exception as e:
    c["status"]="MNAC_CATALOGUE_FETCH_HOLD"
    c["exception"]=type(e).__name__+": "+str(e)[:300]
cases.append(c)
totals={"cases":3,"institutional_original_binary_candidates_archived":sum("candidate_image" in v for v in cases),
    "official_object_identity_evidence":sum(any("OBJECT" in s or "ARTWORK" in s for s in v["source_checks"]) for v in cases),
    "new_photo_rights_final_certifications":0,"new_pristine_certifications":0,"new_production_activations":0,"cost_eur":0}
result={"schema":"AO_PRAYER_ART_B7_THREE_INSTITUTIONAL_SOURCES_V1","date":"2026-10-29",
  "originals_preserved":True,"user_artwork_selection_changes":0,
  "note":"An institution-labelled image, CC0 reproduction or matching metadata is not itself a pristine painting/photo acceptance.",
  "cases":cases,"totals":totals}
(OUT/"institution-native-source-audit.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({"statuses":{v["case_id"]:v["status"] for v in cases},**totals}))
