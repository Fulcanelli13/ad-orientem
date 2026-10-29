#!/usr/bin/env python3
"""P83: offline, one-world pre-review screening of immutable P80 + P81 evidence.

No requests, photo-byte acquisition, publication, rights approval, or new venue IDs.
All 2579 anchors are accounted for, including source errors and zero-result sites.
"""
from __future__ import annotations
import argparse, collections, hashlib, json, re, unicodedata, urllib.parse, zipfile
from pathlib import Path

P80_SHA = "9310bd13e1b218944bb6a8951f625befc271ed18483dd9170f1fe812ceadcc59"
P80_SCHEMA = "AO_P80_WORLDWIDE_SOURCE_FIRST_CONSOLIDATION_V1"
P81_SCHEMA = "AO_P81_COMMONS_2579_SHARD_V1"
HOLD = "RESEARCH_ONLY_NEVER_APP_VISIBLE"
BASE = "https://commons.wikimedia.org/wiki/"
SUPPORTED = {"CC0":"/publicdomain/zero/1.0",
             "CC BY 4.0":"/licenses/by/4.0", "CC BY-SA 4.0":"/licenses/by-sa/4.0",
             "CC BY-SA 3.0":"/licenses/by-sa/3.0", "CC BY-SA 2.0":"/licenses/by-sa/2.0"}
GENERIC = {"the","church","chapel","cathedral","saint","sainte","san","santa","st",
           "our","lady","notre","dame","de","des","du","del","di","of","la","le",
           "eglise","iglesia","kirche","parish","catholic","maria","marie","mary",
           "basilica","basilique","holy"}
STATUSES = {"SEARCH_SUCCESS_EMPTY", "SEARCH_SUCCESS_WITH_CANDIDATES",
            "SOURCE_ERROR_NOT_ZERO_RESULTS", "NO_DISTINCT_BUILDING_NAME"}

def require(value, message):
    if not value: raise ValueError(message)

def digest(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def norm(s):
    t = unicodedata.normalize("NFKD", str(s or ""))
    t = "".join(ch for ch in t if not unicodedata.combining(ch)).casefold()
    return " ".join(re.findall(r"[a-z0-9]+", t))

def tokens(s):
    return set(norm(s).split()) - GENERIC

def title_from_pointer(uri):
    if not isinstance(uri,str): return None
    p=urllib.parse.urlsplit(uri)
    if p.scheme not in ("http","https") or p.hostname!="commons.wikimedia.org": return None
    name=urllib.parse.unquote(p.path.split("/")[-1]).replace("_"," ").strip()
    if not re.search(r"\.(?:jpe?g|png|webp)$",name,re.I): return None
    if any(ch in name for ch in "\r\n\0") or ".." in name: return None
    return "File:"+name.removeprefix("File:")

def locality_from_address(address):
    """Conservative CITY hint only; never a certified coordinate or exact site."""
    parts=[x.strip() for x in str(address or "").split(",") if x.strip()]
    if len(parts)<2:return ""
    parts=parts[:-1]  # last part is normally the country
    for part in reversed(parts[1:] if len(parts)>1 else parts):
        s=norm(part)
        if not s or (len(s)<=3 and not any(x.isdigit() for x in s)):continue
        s=re.sub(r"\b\d{4,7}(?:\s+\d{2,5})?\b"," ",s)
        s=re.sub(r"\b[a-z]{1,3}\d{2,5}\b"," ",s)
        s=" ".join(s.split())
        if len(s)<4 or any(x in s.split() for x in ("street","rue","road","avenue","via","estrada","chemin")):continue
        return s
    return ""

def locality_in_source(city, media):
    if not city: return False
    content=norm(media.get("file_title","")+" "+media.get("description_claim",""))
    return bool(re.search(r"(?<![a-z0-9])"+re.escape(city)+r"(?![a-z0-9])",content))

def rights_metadata(media):
    label=" ".join(str(media.get("license_claim") or "").upper().split())
    if label=="CC 0":label="CC0"\n    label=label.replace("CC-BY","CC BY")\n    label=label.replace("BY-SA","BY-SA")
    path=SUPPORTED.get(label)
    if not path:return "HOLD_UNSUPPORTED_LICENSE_CLAIM"
    url=urllib.parse.urlsplit(str(media.get("license_url") or ""))
    if url.hostname!="creativecommons.org" or url.scheme not in ("http","https"):
        return "HOLD_LICENSE_URL_INCONSISTENT"
    if url.path.rstrip("/").lower()!=path and not url.path.lower().startswith(path+"/deed"):
        return "HOLD_LICENSE_URL_INCONSISTENT"
    if not str(media.get("artist_claim") or "").strip():return "HOLD_NO_AUTHOR_CREDIT"
    if (int(media.get("original_bytes_claim") or 0)>16_000_000 or
        min(int(media.get("width") or 0),int(media.get("height") or 0))<650 or
        int(media.get("width") or 0)*int(media.get("height") or 0)>32_000_000):
        return "HOLD_IMAGE_RESOLUTION_OR_SIZE"
    return "SUPPORTED_LICENSE_METADATA_CLAIM_NOT_INDEPENDENTLY_CLEARED"

def read_archives(p80_path,p81_path):
    require(digest(p80_path)==P80_SHA,"P80 permanent archive SHA256 mismatch")
    with zipfile.ZipFile(p80_path) as z:
        names=set(z.namelist())
        index_name="p80-whole-world/p80-2579-source-first-index.json"
        require(index_name in names, "Missing P80 complete index")
        p80=json.loads(z.read(index_name))
        require(p80["schema"]==P80_SCHEMA and
                p80["counts"]["anchors_accounted"]==2579 and
                p80["counts"]["raw_country_image_rows"]==44777 and
                p80["publication"]==HOLD,"P80 original scope/rights drift")
        countries={}
        for country in re.findall(r"p80-all-countries/country-([A-Z]{2})\.json","\n".join(names)):
            data=json.loads(z.read(f"p80-all-countries/country-{country}.json"))
            require(data["country"]==country and data["publication"]==HOLD,
                    "Bad P80 country source")
            countries[country]=data
        require(len(countries)==76 and sum(len(x["records"]) for x in countries.values())==44777,
                "Incomplete P80 76-country source evidence")
    with zipfile.ZipFile(p81_path) as z:
        expected={f"p81-shard-{i:02d}.json" for i in range(11)}
        require(expected.issubset(set(z.namelist())),"Incomplete P81 11-shard archive")
        p81_rows=[]
        for shard in range(11):
            d=json.loads(z.read(f"p81-shard-{shard:02d}.json"))
            require(d["schema"]==P81_SCHEMA and d["summary"]["shard"]==shard,
                    "P81 shard identity drift")
            expected_size=250 if shard<10 else 79
            require(len(d["records"])==expected_size,"P81 source shard size drift")
            p81_rows.extend(d["records"])
        require(len(p81_rows)==2579,"Missing P81 physical anchor records")
    return p80, countries, p81_rows

def screen(p80,p80_countries,p81_rows,geos=None):
    """No output is independently verified; even top-tier records require visual review."""
    geos=geos or {}
    p80_rows={r["physical_anchor_id"]:r for r in p80["records"]}
    p81_map={r["physical_anchor_id"]:r for r in p81_rows}
    require(len(p80_rows)==len(p81_map)==2579 and set(p80_rows)==set(p81_map),
            "P80/P81 same 2579 exact identities required")
    require(len({r["country"] for r in p81_rows})==76,"Country population changed")
    raw_lookup={}
    for country,data in p80_countries.items():
        for item in data["records"]:
            raw_lookup[(country,item["qid"],item["image"])]=item
    index=[]
    anchors=[]
    for aid in sorted(p81_map):
        r=p81_map[aid];older=p80_rows[aid]
        require(r["country"]==older["country"] and
                r["subject_verified"] is False and r["rights_cleared"] is False and
                r["published"] is False,"Unsafe or mismatched anchor")
        require(r["search_status"] in STATUSES and
                r["candidate_count"]==len(r["source_media_candidates"])<=4,
                "P81 source status/candidate bound mismatch")
        city=locality_from_address(r.get("source_description_hint",""))
        group={}
        for photo in r["source_media_candidates"]:
            require(photo["review_status"]=="UNVERIFIED_MEDIA_DISCOVERY_LEAD" and
                    photo["exact_building_subject_verified"] is False and
                    photo["license_independently_cleared"] is False and
                    photo["published"] is False,"Unexpected Commons media approval")
            sha=photo["original_sha1_claim"].lower()
            require(re.fullmatch(r"[a-f0-9]{40}",sha),"Invalid P81 original SHA1 claim")
            key=norm(photo["file_title"])
            require(key not in group,"Duplicate title in one anchor")
            group[key]={"physical_anchor_id":aid,"country":r["country"],
                "place_name":r["place_name"],"place_city_hint":city,
                "source":["P81_COMMONS_DIRECT"],"file_title":photo["file_title"],
                "source_url":photo["source_url"],"preview_url":photo.get("preview_url",""),
                "original_sha1_claim":sha,"commons_page_id":photo["commons_page_id"],
                "rights_metadata_status":rights_metadata(photo),
                "name_hint":photo.get("name_similarity_hint",0),
                "locality_correlated":locality_in_source(city,photo),
                "source_description":photo.get("description_claim","")[:240],
                "evidence":[]}
        for lead in older["candidate_image_leads"]:
            require(lead["match_state"]=="RESEARCH_LEAD_EXACT_BUILDING_NOT_VERIFIED" and
                    lead["site_approved"] is False and lead["license_checked"] is False and
                    lead["original_sha1_checked"] is False,"Unexpected P80 photo approval")
            title=title_from_pointer(lead.get("commons_image_pointer"))
            if not title:continue
            key=norm(title)
            source=raw_lookup.get((r["country"],lead["wikidata_qid"],lead["commons_image_pointer"]))
            require(source is not None,"P80 source lead not in immutable country archive")
            evidence={"qid":lead["wikidata_qid"],"wikidata_label":lead["wikidata_label"],
                      "source_admin":source.get("admin",""),"source_coord":source.get("coord",""),
                      "source_name_hint":lead["match_score"]}
            if key in group:
                group[key]["source"].append("P80_WIKIDATA_P18")
                group[key]["evidence"].append(evidence)
            else:
                group[key]={"physical_anchor_id":aid,"country":r["country"],
                    "place_name":r["place_name"],"place_city_hint":city,
                    "source":["P80_WIKIDATA_P18"],"file_title":title,
                    "source_url":BASE+urllib.parse.quote(title.replace(" ","_"),safe="():,_-.'"),
                    "preview_url":"","original_sha1_claim":None,"commons_page_id":None,
                    "rights_metadata_status":"HOLD_P80_ORIGINAL_METADATA_UNVERIFIED",
                    "name_hint":lead["match_score"],"locality_correlated":False,
                    "source_description":"","evidence":[evidence]}
        anchors.append({"physical_anchor_id":aid,"country":r["country"],
                        "place_name":r["place_name"],"source_ids":r["source_ids"],
                        "p80_source_country_status":older["source_country_status"],
                        "p80_country_source_truncated":older["source_country_truncated"],
                        "p81_search_status":r["search_status"],
                        "source_image_assignments":len(group),
                        "publication":HOLD})
        for photo in group.values():
            pin=geos.get(aid,{})
            pin_ok=False
            for e in photo["evidence"]:
                coord=e["source_coord"]
                if pin.get("status")!="SOURCE_COORDINATE_SEARCH_HINT_NOT_CERTIFIED":continue
                m=re.fullmatch(r"Point\((-?[0-9.]+) (-?[0-9.]+)\)",coord or "")
                if not m:continue
                import math
                lon,lat=map(float,m.groups())
                p=math.pi/180
                a=math.sin((lat-pin["lat"])*p/2)**2+math.cos(lat*p)*math.cos(pin["lat"]*p)*math.sin((lon-pin["lon"])*p/2)**2
                meters=2*6371000*math.asin(min(1,math.sqrt(a)))
                if meters <= (600 if pin["precision"]=="street" else 350):
                    pin_ok=True
                    e["distance_to_frozen_pin_m"]=round(meters)
            photo["p80_near_source_pin"]=pin_ok
            photo["exact_site_verified"]=False
            photo["rights_independently_cleared"]=False
            photo["original_bytes_verified"]=False
            photo["published"]=False
            photo["publication"]=HOLD
            index.append(photo)
    bysha=collections.defaultdict(set)
    for p in index:
        if p["original_sha1_claim"]:bysha[p["original_sha1_claim"]].add(p["physical_anchor_id"])
    disposition=collections.Counter()
    for p in index:
        shared=len(bysha.get(p["original_sha1_claim"],set()))>1 if p["original_sha1_claim"] else False
        p["same_original_multiple_site_ids"]=shared
        if shared:
            p["screening_disposition"]="HOLD_SHARED_IMAGE_ACROSS_DIFFERENT_SITES"
        elif p["rights_metadata_status"]!="SUPPORTED_LICENSE_METADATA_CLAIM_NOT_INDEPENDENTLY_CLEARED":
            p["screening_disposition"]=p["rights_metadata_status"]
        elif p["p80_near_source_pin"]:
            p["screening_disposition"]="REVIEW_QUEUE_GEO_SOURCE_PIN_CORROBORATED"
        elif p["locality_correlated"] and len(tokens(p["place_name"]) & tokens(p["file_title"]+" "+p["source_description"]))>=1:
            p["screening_disposition"]="REVIEW_QUEUE_LOCALITY_AND_NAME_CORROBORATED"
        else:
            p["screening_disposition"]="HOLD_NO_EXACT_SITE_GEO_OR_LOCALITY_CORROBORATION"
        disposition[p["screening_disposition"]]+=1
    queue=[p for p in index if p["screening_disposition"].startswith("REVIEW_QUEUE_")]
    return anchors,index,queue,dict(sorted(disposition.items()))

def write_output(root,anchors,index,queue,dispositions,p80_sha,p81_sha):
    root=Path(root);require(not root.exists(),"Do not overwrite research campaign")
    root.mkdir(parents=True)
    def jsonlines(name,items):
        with (root/name).open("w",encoding="utf-8") as f:
            for x in items:f.write(json.dumps(x,ensure_ascii=False,separators=(",",":"))+"\n")
    jsonlines("p83-all-2579-anchor-coverage.jsonl",anchors)
    jsonlines("p83-all-source-photo-assignments.jsonl",index)
    jsonlines("p83-source-screened-preview-queue.jsonl",queue)
    jsonlines("p83-holds-for-later-source-work.jsonl",[x for x in index if not x["screening_disposition"].startswith("REVIEW_QUEUE_")])
    summary={"schema":"AO_P83_GLOBAL_PHOTO_PREVIEW_SCREEN_V1",
             "p80_original_archive_sha256":p80_sha,"p81_original_archive_sha256":p81_sha,
             "anchors_accounted":len(anchors),"countries":len({x["country"] for x in anchors}),
             "photo_source_assignments":len(index),
             "distinct_p81_original_sha1_claims":len({x["original_sha1_claim"] for x in index if x["original_sha1_claim"]}),
             "review_queue_assignments":len(queue),
             "held_assignments":len(index)-len(queue),
             "no_image_lead_anchors":sum(x["source_image_assignments"]==0 for x in anchors),
             "p81_query_error_anchors":sum(x["p81_search_status"]=="SOURCE_ERROR_NOT_ZERO_RESULTS" for x in anchors),
             "p80_source_error_anchors":sum(x["p80_source_country_status"]!="SUCCESS" for x in anchors),
             "dispositions":dispositions,"approved_photos":0,"rights_cleared":0,
             "original_photos_downloaded":0,"published_photos":0,
             "note":"Preview queue is research-only: not guaranteed exact building; rights metadata claims are unverified."}
    require(summary["anchors_accounted"]==2579 and summary["countries"]==76 and
            summary["review_queue_assignments"]+summary["held_assignments"]==len(index),"Bad global count")
    (root/"p83-worldwide-summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("P83_WORLDWIDE_SUMMARY="+json.dumps(summary,sort_keys=True),flush=True)
    return summary

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--p80-archive",required=True,type=Path)
    ap.add_argument("--p81-archive",required=True,type=Path)
    ap.add_argument("--p81-sha256",required=True)
    ap.add_argument("--out",required=True,type=Path)
    ap.add_argument("--intake-root",type=Path)
    ap.add_argument("--cl2-root",type=Path)
    args=ap.parse_args()
    require(re.fullmatch(r"[a-f0-9]{64}",args.p81_sha256) and
            digest(args.p81_archive)==args.p81_sha256,"P81 immutable research ZIP checksum mismatch")
    p80,countries,p81=read_archives(args.p80_archive,args.p81_archive)
    geos={}
    if args.intake_root and args.cl2_root:
        import importlib.util
        source=Path(__file__).with_name("build-worldwide-photo-source-index.py")
        spec=importlib.util.spec_from_file_location("ao_photo_geo",source)
        mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
        manifest,anchors,source_to_anchor=mod.load_intake(args.intake_root)
        require(set(anchors)=={r["physical_anchor_id"] for r in p81},"CL2 source population mismatch")
        geos=mod.cl2_coords(args.cl2_root,manifest,source_to_anchor)
    a,photos,queue,dispositions=screen(p80,countries,p81,geos)
    write_output(args.out,a,photos,queue,dispositions,P80_SHA,args.p81_sha256)

if __name__=="__main__":main()
