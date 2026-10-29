#!/usr/bin/env python3
"""Bulk, source-first, publication-locked media index for all CL2 anchors.

Only consumes checksum-frozen CL2 photo queues, original independent image
research, and country-level Wikidata P18 discovery exports. No network calls
and no binary/image/public website writes. Strong geospatial/name cues only
produce UNVERIFIED research leads.
"""
import argparse
import hashlib
import json
import math
import re
import unicodedata
import urllib.parse
from collections import Counter,defaultdict
from pathlib import Path

INTAKE="AO_DIRECTORY_UNIFIED_PHOTO_QUEUE_INDEX_V1"
COUNTRY_SCHEMA="AO_WIKIDATA_CHURCH_IMAGES_BY_COUNTRY_V1"
OUTPUT="AO_DIRECTORY_BULK_MEDIA_SOURCE_INDEX_V1"
HOLD="RESEARCH_ONLY_NEVER_APP_VISIBLE"

def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text(encoding="utf-8"))
def words(s):
    t=unicodedata.normalize("NFKD",str(s or ""))
    t="".join(c for c in t if not unicodedata.combining(c)).lower()
    return re.findall(r"[a-z0-9]+",t)
STOP={"saint","st","sainte","ste","church","chapel","chapelle","eglise","kirche",
      "sankt","san","santa","santo","chiesa","iglesia","churches","of","the",
      "notre","dame","our","lady","de","des","del","di","du","la","le","les",
      "parish","parroquia","catholic","roman","basilica","basilique","kapelle",
      "heilige","holy","sacred","heart","and","et","und","der","den","die",
      "pfarrkirche","kostel","kościół","chiesa","parrocchia","paroisse"}
def distinct_tokens(s):
    return [w for w in words(s) if w not in STOP and len(w)>2]
def km(a,b):
    x,y=a;u,v=b
    p=math.pi/180
    k=2*6371*math.asin(min(1.0,math.sqrt(math.sin((u-x)*p/2)**2+
        math.cos(x*p)*math.cos(u*p)*math.sin((v-y)*p/2)**2)))
    return k
def point(value):
    if not isinstance(value,str):return None
    m=re.fullmatch(r"Point\((-?[0-9.]+) (-?[0-9.]+)\)",value.strip())
    if not m:return None
    lon,lat=map(float,m.groups())
    if not (-90<=lat<=90 and -180<=lon<=180):return None
    return (lat,lon)
def coordinates(record):
    try:
        lat,lon=float(record[16]),float(record[17])
        if not (-90<=lat<=90 and -180<=lon<=180):return None
        if lat==0 and lon==0:return None
        precision=str(record[18] or "").lower()
        if precision not in ("building","address","street"): return None
        return (lat,lon,precision)
    except (ValueError,TypeError,IndexError):return None
def load_intake(directory):
    root=Path(directory)
    mf=read(root/"manifest.json")
    if (mf.get("schema")!=INTAKE or mf.get("not_app_visible") is not True
       or mf.get("publication")!=HOLD
       or mf.get("counts",{}).get("distinct_consolidated_physical_anchors")!=2579
       or len(mf.get("shards",[]))!=11):
        raise ValueError("Not a fully frozen, unpublished CL2 anchor manifest")
    records={}
    for part in mf["shards"]:
        name=part["path"]
        if not re.fullmatch(r"anchors-[0-9]{4}-[0-9]{4}\.json",name):
            raise ValueError("Noncanonical queue shard name")
        p=root/name
        if sha(p)!=part["sha256"] or p.stat().st_size!=part["bytes"]:
            raise ValueError("Intake shard SHA256/size mismatch")
        d=read(p)
        if (d.get("publication")!=HOLD or d.get("cl2_commit")!=mf["cl2_commit"] or
            d.get("cl2_manifest_sha256")!=mf["cl2_manifest_sha256"] or
            len(d.get("records",[]))!=part["count"]):
            raise ValueError("Intake shard metadata mismatch")
        for row in d["records"]:
            aid=row["physical_anchor_id"]
            if (aid in records or row.get("publication")!=HOLD or
                row.get("building_subject_verified") is not False or
                row.get("approved_originals")!=0 or row.get("approved_cover_photo") is not False):
                raise ValueError("Duplicate or previously approved physical anchor")
            records[aid]=row
    if len(records)!=2579:
        raise ValueError("Intake anchor count mismatch")
    exact={}
    for anchor in records.values():
        for sid in anchor["source_ids"]:
            if sid in exact and exact[sid]!=anchor["physical_anchor_id"]:
                raise ValueError("Source ID belongs to two distinct physical anchors")
            exact[sid]=anchor["physical_anchor_id"]
    if len(exact)!=2682:
        raise ValueError("CL2 safely attached venue sources mismatch")
    return mf,records,exact

def cl2_coords(directory,intake_mf,exact):
    if directory is None:return {}
    root=Path(directory)
    mf=read(root/"manifest.json")
    if (sha(root/"manifest.json")!=intake_mf["cl2_manifest_sha256"]
        or mf["schema"]!="AO_CL2_SINGLE_RESEARCH_MASTER_V1"):
        raise ValueError("CL2 master metadata is not pinned to intake")
    coords=defaultdict(list)
    for part in mf["shards"]["venue"]:
        p=root/part["path"]
        if sha(p)!=part["sha256"] or p.stat().st_size!=part["bytes"]:
            raise ValueError("CL2 source shard integrity failure")
        data=read(p)
        for r in data["records"]:
            aid=exact.get(r["source_id"])
            if not aid:continue
            parsed=coordinates(r["source_record"])
            if parsed:coords[aid].append(parsed)
    result={}
    for aid, values in coords.items():
        # The same physical anchor may have multiple provider pins. Conflicting
        # >300m geocodes are *not* averaged; those anchors are held for review.
        best=next((v for v in values if v[2]=="building"),values[0])
        if any(km(best[:2],other[:2])>.3 for other in values):
            result[aid]={"status":"CONFLICTING_SOURCE_PINS_HOLD","pin_count":len(values)}
        else:
            result[aid]={"status":"SOURCE_COORDINATE_SEARCH_HINT_NOT_CERTIFIED",
                         "lat":best[0],"lon":best[1],
                         "precision":best[2],"pin_count":len(values)}
    return result

def url_file(uri):
    if not isinstance(uri,str):return None
    parsed=urllib.parse.urlparse(uri)
    if parsed.scheme not in ("http","https") or parsed.netloc.lower() not in (
         "commons.wikimedia.org","upload.wikimedia.org"):
        return None
    filename=urllib.parse.unquote(parsed.path.split("/")[-1])
    if not filename or len(filename)>220 or "/" in filename or "\x00" in filename:return None
    if not re.search(r"\.(?:jpe?g|png|webp|tiff?)$",filename,re.I):return None
    return filename

def normalized_geo_list(directory, countries):
    rows=[]
    if not directory:return rows,Counter()
    stats=Counter()
    for code in countries:
        p=Path(directory)/f"country-{code}.json"
        if not p.exists():
            stats["countries_without_export"]+=1
            continue
        j=read(p)
        if j.get("schema")!=COUNTRY_SCHEMA or j.get("country")!=code:
            raise ValueError("Country file source mismatch: "+code)
        if j.get("status")!="SUCCESS":
            stats["countries_with_source_error"]+=1
            continue
        stats["countries_successful"]+=1
        if j.get("truncated"):stats["countries_truncated"]+=1
        for raw in j["records"]:
            qid=raw.get("qid")
            filename=url_file(raw.get("image"))
            if (not re.fullmatch(r"Q[1-9][0-9]*",str(qid or "")) or not filename
                or raw.get("country")!=code):
                stats["ineligible_image_metadata"]+=1
                continue
            rows.append({"country":code,"qid":qid,"wikidata_url":f"https://www.wikidata.org/wiki/{qid}",
                         "file_title":"File:"+filename,"image_source_url":"https://commons.wikimedia.org/wiki/File:"+filename.replace(" ","_"),
                         "name":str(raw.get("label") or ""),
                         "admin":str(raw.get("admin") or ""),
                         "coord":raw.get("coord"),"source":"WIKIDATA_COUNTRY_P18"})
    stats["wikidata_image_source_rows"]=len(rows)
    return rows,stats

def score_match(item,anchor,geo):
    # No name-only site identity determination. Strong name plus anchored
    # address/city or geographically close source pin => research lead only.
    target_names=[anchor["name"]]+anchor["source_name_search_hints"]
    label=distinct_tokens(item["name"])
    if not label:return None
    label_set=set(label)
    scored=[]
    for name in target_names:
        token=set(distinct_tokens(name))
        overlap=len(token & label_set)
        if not token or overlap==0:continue
        ratio=overlap/max(len(token),len(label_set),1)
        if ratio>=.6 and (overlap>=2 or ratio==1.0):
            scored.append(ratio)
    if not scored:return None
    match=max(scored)
    p=point(item.get("coord"))
    if geo and geo.get("status")=="SOURCE_COORDINATE_SEARCH_HINT_NOT_CERTIFIED" and p:
        distance=km((geo["lat"],geo["lon"]),p)
        cutoff=.35 if geo["precision"] in ("building","address") else .6
        if distance>cutoff:return None
        return {"match_grade":"NEAR_SOURCE_PIN_NAME_CORROBORATED_RESEARCH_ONLY",
                "distance_m":round(distance*1000,1),
                "name_overlap":round(match,3),"rank":round(4+match-distance,4)}
    # Strong name+locality still remains tentative. For no coordinates, avoid
    # searching a generic label with no administrative city corroboration.
    location=distinct_tokens(anchor.get("physical_description_search_hint"))
    admin=set(distinct_tokens(item.get("admin")))
    if match>=.8 and location and admin and len(set(location)&admin)>=1:
        return {"match_grade":"NAME_AND_LOCALITY_TEXT_RESEARCH_ONLY",
                "distance_m":None,"name_overlap":round(match,3),"rank":round(2+match,4)}
    return None

def candidate_key(candidate):
    return ("COMMONS_FILE",candidate["file_title"].lower()) if candidate.get("file_title") else ("URL",candidate.get("source_url",""))

def build(directory,cl2_dir,candidates,country_dir,out):
    mf,anchors,exact=load_intake(directory)
    country_codes={v["country"] for v in anchors.values()}
    geos=cl2_coords(cl2_dir,mf,exact)
    records,harvest=normalized_geo_list(country_dir,country_codes)
    bycountry=defaultdict(list)
    for row in records:bycountry[row["country"]].append(row)
    staged=defaultdict(dict)
    statistics=Counter()
    for f in candidates:
        j=read(f)
        if (j.get("schema")!="AO_DIRECTORY_OPEN_PHOTO_CANDIDATES_V1"
            or j.get("publication")!=HOLD or j.get("publications")!=0):
            raise ValueError("Research-only candidate archive mismatch")
        statistics["prior_pilot_source_venues"]+=len(j["venues"])
        for venue in j["venues"]:
            aid=exact.get(venue["source_id"])
            if not aid:statistics["legacy_unattached_rows"]+=1;continue
            for kind in ("EXTERIOR","INTERIOR","SACRED_DETAIL"):
                for c in venue.get("categories",{}).get(kind,[]):
                    url=c.get("source_url","")
                    if not url.startswith("https://"):continue
                    item={"physical_anchor_id":aid,"role":kind,
                          "source_url":url,"file_title":c.get("commons_title"),
                          "license_claim_unverified":c.get("license"),
                          "rights_approved":False,"subject_approved":False,
                          "source":"PRIOR_R49_METADATA_EXACT_SOURCE_CROSSWALK",
                          "evidence":{"source_id":venue["source_id"],
                                      "discovery_method":c.get("discovery_method"),
                                      "category_evidence":c.get("category_evidence")},
                          "publication":HOLD}
                    staged[aid][candidate_key(item)]=item
                    statistics["prior_source_candidate_links"]+=1
    wikidata_links=0
    for anchor in anchors.values():
        aid=anchor["physical_anchor_id"]
        geo=geos.get(aid)
        for item in bycountry.get(anchor["country"],[]):
            m=score_match(item,anchor,geo)
            if not m:continue
            result={"physical_anchor_id":aid,"role":"EXTERIOR",
                    "source_url":item["image_source_url"],"file_title":item["file_title"],
                    "license_claim_unverified":None,
                    "rights_approved":False,"subject_approved":False,
                    "source":"WIKIDATA_COUNTRY_P18_BULK_RESEARCH",
                    "evidence":{"wikidata_qid":item["qid"],"wikidata_url":item["wikidata_url"],
                                "name":item["name"],"admin":item["admin"],
                                **{k:v for k,v in m.items() if k!="rank"}},
                    "rank":m["rank"],"publication":HOLD}
            key=candidate_key(result)
            if key not in staged[aid]:
                staged[aid][key]=result;wikidata_links+=1
    output=[]
    for anchor in sorted(anchors.values(),key=lambda x:(x["country"],x["physical_anchor_id"])):
        aid=anchor["physical_anchor_id"]
        candidates=sorted(staged[aid].values(),key=lambda x:(
            0 if x["source"]=="PRIOR_R49_METADATA_EXACT_SOURCE_CROSSWALK" else 1,
            -x.get("rank",0),x["source_url"]))[:12]
        output.append({"physical_anchor_id":aid,"country":anchor["country"],
            "name":anchor["name"],"legacy_r49_source_count":len(anchor["legacy_r49_source_ids"]),
            "source_count":anchor["source_count"],
            "coordinate_status":geos.get(aid,{}).get("status","NO_TRUSTED_SOURCE_PIN"),
            "photographic_candidates":candidates,"candidate_count":len(candidates),
            "approved_exterior":False,"publication":HOLD})
    counts={"physical_anchors_indexed":len(output),"countries":len(country_codes),
            "anchors_with_any_photo_lead":sum(bool(x["candidate_count"]) for x in output),
            "anchors_without_photo_leads":sum(not x["candidate_count"] for x in output),
            "photographic_lead_links":sum(x["candidate_count"] for x in output),
            "wikidata_matched_photo_links_before_rank_cutoff":wikidata_links,
            "prior_pilot_candidate_links_before_dedup":statistics["prior_source_candidate_links"],
            "prior_pilot_source_venues":statistics["prior_pilot_source_venues"],
            "source_pins_available":sum(v.get("status")=="SOURCE_COORDINATE_SEARCH_HINT_NOT_CERTIFIED" for v in geos.values()),
            "conflicting_source_pins_held":sum(v.get("status")=="CONFLICTING_SOURCE_PINS_HOLD" for v in geos.values()),
            "original_files_downloaded":0,"approved_cover_images":0,"published_images":0}
    counts.update(harvest)
    if len(output)!=2579 or any(x["publication"]!=HOLD for x in output):
        raise ValueError("Source-first index attempted to publish or change universe")
    out=Path(out)
    if out.exists():raise ValueError("Refuse overwriting media index")
    out.parent.mkdir(parents=True,exist_ok=True)
    body={"schema":OUTPUT,"publication":HOLD,"intake_cl2_commit":mf["cl2_commit"],
          "intake_manifest_sha256":sha(Path(directory)/"manifest.json"),
          "counts":counts,"country_harvest_status":"UNVERIFIED_EXTERNAL_METADATA",
          "records":output}
    out.write_text(json.dumps(body,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf-8")
    print(json.dumps(counts,sort_keys=True))
    return body

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--intake-dir",type=Path,required=True)
    p.add_argument("--cl2-dir",type=Path,required=True)
    p.add_argument("--candidate-file",action="append",type=Path,default=[])
    p.add_argument("--country-dir",type=Path)
    p.add_argument("--output",type=Path,required=True)
    args=p.parse_args()
    build(args.intake_dir,args.cl2_dir,args.candidate_file,args.country_dir,args.output)
if __name__=="__main__":
    main()
