#!/usr/bin/env python3
"""P85: one worldwide Commons source-metadata recovery for all 7400 P83 holds.

Six machine transport shards are keyed by Commons filename; no small editorial
batches, no original image download, no automated site/rights verification.
Never converts Commons text or GPS into a certified photographed building.
"""
import argparse,collections,hashlib,html,importlib.util,json,math,re,time,unicodedata
import urllib.error,urllib.parse,urllib.request
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
HOLD="RESEARCH_ONLY_NEVER_APP_VISIBLE"
P83="AO_P83_GLOBAL_PHOTO_PREVIEW_SCREEN_V1"
SCHEMA="AO_P85_WORLDWIDE_HELD_COMMONS_SOURCE_V1"
N=7400
SHARDS=6
API="https://commons.wikimedia.org/w/api.php"
UA="AdOrientem-WorldwideHoldEvidence/1.0 (https://github.com/Fulcanelli13/ad-orientem; research only)"
LICENSES={"cc0":"/publicdomain/zero/1.0",
          "ccby20":"/licenses/by/2.0","ccby30":"/licenses/by/3.0","ccby40":"/licenses/by/4.0",
          "ccbysa20":"/licenses/by-sa/2.0","ccbysa30":"/licenses/by-sa/3.0",
          "ccbysa40":"/licenses/by-sa/4.0"}
ALLOWED={"image/jpeg","image/png","image/webp"}
GENERIC=set("church chapel cathedral basilica ecclesia parish catholic chapelle eglise iglésia chiesa kirche santa saint santo san sainte our lady notre dame the of de di del du la le des notre marie mary maria virgen holy sacred".split())

def guard(p,msg):
    if not p:raise ValueError(msg)
def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def compact(s):
    return "".join(re.findall("[a-z0-9]+",str(s or "").lower()))
def natural(s):
    x=unicodedata.normalize("NFKD",str(s or ""))
    x="".join(t for t in x if not unicodedata.combining(t))
    return " ".join(re.findall("[a-z0-9]+",x.lower()))
def words(s):
    return set(natural(s).split())-GENERIC
def plain(s):
    return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(s or ""))).split())[:3000]
def canonical(title):
    return " ".join(unicodedata.normalize("NFC",str(title or "")).replace("_"," ").casefold().split())
def filename_ok(title):
    return (isinstance(title,str) and title.startswith("File:")
        and 6<len(title)<=260 and "\n" not in title and "\r" not in title
        and not any(x in title for x in ("\0","..","|","?","#")))
def read_jsonl(path):
    with Path(path).open(encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]
def key(record):
    return (record["physical_anchor_id"],record["file_title"],record.get("original_sha1_claim"))
def source_lineage(allfile,holdsfile,summaryfile):
    report=json.loads(Path(summaryfile).read_text())
    guard(report["schema"]==P83 and report["anchors_accounted"]==2579 and report["countries"]==76
        and report["photo_source_assignments"]==7701 and report["held_assignments"]==N
        and report["review_queue_assignments"]==301 and
        report["published_photos"]==report["approved_photos"]==report["rights_cleared"]==0,
        "P83 research-only global population mismatch")
    all_rows=read_jsonl(allfile)
    holds=read_jsonl(holdsfile)
    guard(len(all_rows)==7701 and len(holds)==N,"P83 actual source rows incomplete")
    identities={key(r) for r in all_rows}
    guard(len(identities)==7701 and len({key(r) for r in holds})==N,"Duplicate P83 identity assignments")
    guard({key(r) for r in holds}.issubset(identities),"Hold absent from all-source evidence")
    for r in holds:
        guard(r["publication"]==HOLD and r["published"] is False and
              r["exact_site_verified"] is False and r["rights_independently_cleared"] is False and
              not r["screening_disposition"].startswith("REVIEW_QUEUE_") and
              filename_ok(r["file_title"]),"Unsafe or malformed held source")
    return report,all_rows,holds

def load_geo(intake,cl2):
    spec=importlib.util.spec_from_file_location("p85_existing_geo",ROOT/"tools/directory/build-worldwide-photo-source-index.py")
    geo=importlib.util.module_from_spec(spec);spec.loader.exec_module(geo)
    mf,anchors,attached=geo.load_intake(intake)
    pins=geo.cl2_coords(cl2,mf,attached)
    guard(len(anchors)==2579,"P85 must reuse existing CL2 2579 IDs")
    return pins

def point(d):
    if not isinstance(d,dict):return None
    try:
        lat,lon=float(d["lat"]),float(d["lon"])
        if -90<=lat<=90 and -180<=lon<=180 and not(lat==lon==0):return lat,lon
    except (KeyError,TypeError,ValueError):pass
    return None

def km(a,b):
    lat,lon=a;lat2,lon2=b;p=math.pi/180
    v=math.sin((lat2-lat)*p/2)**2+math.cos(lat*p)*math.cos(lat2*p)*math.sin((lon2-lon)*p/2)**2
    return 12742*math.asin(min(1,math.sqrt(v)))

def current_licence(info):
    meta=info.get("extmetadata") or {}
    field=lambda k:plain((meta.get(k) or {}).get("value"))
    label=compact(field("LicenseShortName"))
    if label=="cc010":label="cc0"
    license_path=LICENSES.get(label)
    if not license_path:return None,"HOLD_CURRENT_RIGHTS_UNSUPPORTED"
    uri=urllib.parse.urlsplit(field("LicenseUrl"))
    u=uri.path.rstrip("/").lower()
    if (uri.scheme not in ("https","http") or uri.hostname!="creativecommons.org" or
        uri.username or uri.password or not (u==license_path or u.startswith(license_path+"/deed"))):
        return None,"HOLD_CURRENT_LICENCE_URL_INCONSISTENT"
    author=field("Artist")
    if not author or compact(author) in ("unknown","anonymous"):return None,"HOLD_MISSING_AUTHOR_CREDIT"
    return {"label":field("LicenseShortName"),"url":field("LicenseUrl"),
            "author":author[:320],"description":field("ImageDescription")[:2000],
            "attribution":field("AttributionRequired")[:40]},None

def check_page(page,requested_title):
    if not page or page.get("missing") or not page.get("imageinfo"):
        return {"source_status":"HOLD_MISSING_CURRENT_COMMONS_PAGE"}
    if canonical(page.get("title"))!=canonical(requested_title):
        return {"source_status":"HOLD_COMMONS_TITLE_CHANGED",
                "returned_title":str(page.get("title",""))[:260]}
    info=page["imageinfo"][0]
    try:width,height,size=int(info["width"]),int(info["height"]),int(info["size"])
    except (KeyError,TypeError,ValueError):return {"source_status":"HOLD_MISSING_CURRENT_SIZE"}
    orig=urllib.parse.urlsplit(str(info.get("url","")))
    check={"current_page_id":page.get("pageid"),
           "current_original_sha1":str(info.get("sha1","")).lower(),
           "current_image_width":width,"current_image_height":height,
           "current_original_size":size,
           "current_mime":info.get("mime"),
           "thumbnail_url":str(info.get("thumburl") or "")[:1000],
           "source_status":"CURRENT_COMMONS_METADATA_RETRIEVED"}
    if (orig.scheme!="https" or orig.hostname!="upload.wikimedia.org" or orig.username or orig.password):
        check["source_status"]="HOLD_NONCANONICAL_ORIGINAL_HOST";return check
    rights,why=current_licence(info)
    if rights:check["current_rights_metadata_claim"]=rights
    else:check["current_rights_hold_reason"]=why
    if (info.get("mime") not in ALLOWED or size<1000 or size>16_000_000 or
        min(width,height)<650 or width*height>32_000_000):
        check["source_status"]="HOLD_CURRENT_SIZE_OR_MIME"
    if not re.fullmatch(r"[a-f0-9]{40}",check["current_original_sha1"]):
        check["source_status"]="HOLD_CURRENT_SOURCE_SHA1_MISSING"
    coords=[]
    for raw in page.get("coordinates") or []:
        val=point(raw)
        if val and raw.get("globe","earth").lower() in ("earth",""):coords.append({"lat":val[0],"lon":val[1]})
    check["geotag_source_coordinates"]=coords[:4]
    return check

def api_batch(titles,attempts=2):
    guard(1<=len(titles)<=20 and all(filename_ok(t) for t in titles),"Invalid Commons source batch")
    query=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",
        "prop":"imageinfo|coordinates","titles":"|".join(titles),
        "iiprop":"url|sha1|size|mime|extmetadata","iiurlwidth":"520",
        "coprop":"type|name|dim|country|region|globe","colimit":"max"})
    url=API+"?"+query
    reason=""
    for trial in range(attempts):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json","Accept-Encoding":"identity"})
            with urllib.request.urlopen(req,timeout=37) as response:
                target=urllib.parse.urlsplit(response.geturl())
                guard(target.scheme=="https" and target.hostname=="commons.wikimedia.org","Unsafe Commons redirect")
                raw=response.read(6_000_001)
                guard(len(raw)<=6_000_000,"Oversized metadata response")
            result=json.loads(raw)
            guard("query" in result and isinstance(result["query"].get("pages"),list),"Invalid Commons payload")
            return {canonical(p.get("title")):p for p in result["query"]["pages"]},None
        except (urllib.error.URLError,TimeoutError,ValueError,UnicodeError,KeyError) as err:
            reason=type(err).__name__+":"+str(err)[:130]
            if trial+1<attempts:time.sleep(5*(trial+1))
    return {},reason or "SOURCE_ERROR"

def with_current_source(row,source,allrefs,geo):
    item={"physical_anchor_id":row["physical_anchor_id"],"country":row["country"],
          "place_name":row["place_name"],"place_city_hint":row.get("place_city_hint",""),
          "file_title":row["file_title"],"source_url":row["source_url"],
          "original_sha1_claim":row.get("original_sha1_claim"),
          "p83_original_disposition":row["screening_disposition"],
          "publication":HOLD,"exact_site_verified":False,
          "rights_approved":False,"original_bytes_verified":False,"published":False}
    if source.get("source_status","").startswith("HOLD_"):
        item.update({"p85_disposition":source["source_status"],"source_check":source})
        return item
    claim=row.get("original_sha1_claim")
    if claim and source.get("current_original_sha1")!=claim:
        item.update({"p85_disposition":"HOLD_ORIGINAL_SHA1_CHANGED","source_check":source});return item
    if (row.get("commons_page_id") is not None and source.get("current_page_id")!=row["commons_page_id"]):
        item.update({"p85_disposition":"HOLD_COMMONS_PAGE_ID_CHANGED","source_check":source});return item
    if "current_rights_metadata_claim" not in source:
        item.update({"p85_disposition":source.get("current_rights_hold_reason","HOLD_UNVERIFIED_RIGHTS"),
                    "source_check":source});return item
    if row.get("unresolved_same_title_source_conflict"):
        item.update({"p85_disposition":"HOLD_CONFLICTING_SOURCE_REVISIONS","source_check":source});return item
    coords=source.get("geotag_source_coordinates",[])
    source_sites=allrefs[canonical(row["file_title"])]
    aid=row["physical_anchor_id"]
    currentpin=geo.get(aid,{})
    close=[]
    if currentpin.get("status")=="SOURCE_COORDINATE_SEARCH_HINT_NOT_CERTIFIED":
        precision=currentpin["precision"]
        limit=.6 if precision=="street" else .35
        for point0 in coords:
            distance=km((currentpin["lat"],currentpin["lon"]),(point0["lat"],point0["lon"]))
            if distance<=limit:close.append(distance)
    unambiguous_geo=False
    if close:
        unambiguous_geo=True
        # If Commons source reused across sites, all other destination pins
        # must be present and >=1000m away from the image geotag.
        for other in source_sites:
            if other==aid:continue
            p=geo.get(other,{})
            if p.get("status")!="SOURCE_COORDINATE_SEARCH_HINT_NOT_CERTIFIED":
                unambiguous_geo=False;break
            if min(km((p["lat"],p["lon"]),(c["lat"],c["lon"])) for c in coords)<1.0:
                unambiguous_geo=False;break
    city=natural(row.get("place_city_hint",""))
    desc=natural(source["current_rights_metadata_claim"].get("description",""))
    place=words(row["place_name"])
    match_words=words(desc+" "+row["file_title"])
    locality=bool(city and len(city)>=4 and
        re.search(r"(?<![a-z0-9])"+re.escape(city)+r"(?![a-z0-9])",desc))
    name=bool(place and place.intersection(match_words))
    # City-only or saint-dedication alone is not enough to make reused images safe.
    if unambiguous_geo:
        outcome="RECOVERED_FOR_RESEARCH_REVIEW_GEO_UNIQUE_NOT_APPROVED"
    elif len(source_sites)==1 and locality and name and row["screening_disposition"] not in (
        "HOLD_CONFLICTING_COMMONS_SOURCE_REVISIONS",):
        outcome="RECOVERED_FOR_RESEARCH_REVIEW_CITY_TEXT_NOT_APPROVED"
    else:outcome="HOLD_EXACT_BUILDING_IDENTITY_STILL_UNCORROBORATED"
    item.update({"p85_disposition":outcome,
                 "source_check":source,
                 "source_file_assigned_site_count":len(source_sites),
                 "source_geotag_distance_m":round(min(close)*1000) if close else None,
                 "city_in_current_description":locality,
                 "place_name_source_overlap":sorted(place.intersection(match_words))[:8]})
    return item

def evidence_shard(allfile,holdsfile,summaryfile,intake,cl2,out,shard,delay=1.0,loader=api_batch):
    guard(0<=shard<SHARDS and .2<=delay<=6,"P85 machine-only shard/delay invalid")
    report,allrows,holds=source_lineage(allfile,holdsfile,summaryfile)
    geo=load_geo(intake,cl2)
    refs=collections.defaultdict(set)
    for row in allrows: refs[canonical(row["file_title"])].add(row["physical_anchor_id"])
    byfile=collections.defaultdict(list)
    for row in holds:
        token=canonical(row["file_title"])
        if int(hashlib.sha256(token.encode()).hexdigest()[:8],16)%SHARDS==shard:
            byfile[token].append(row)
    expected=len([r for r in holds if int(hashlib.sha256(canonical(r["file_title"]).encode()).hexdigest()[:8],16)%SHARDS==shard])
    guard(sum(map(len,byfile.values()))==expected,"P85 shard missed held assignments")
    guard(not Path(out).exists(),"No overwrite of complete P85 source evidence")
    Path(out).mkdir(parents=True)
    names=sorted(byfile)
    result=[]
    queries=0
    failed=0
    for j in range(0,len(names),20):
        batch=names[j:j+20]
        title=[byfile[n][0]["file_title"] for n in batch]
        found,error=loader(title)
        queries+=1
        if error:failed+=len(batch)
        for fileid in batch:
            source=check_page(found.get(fileid),byfile[fileid][0]["file_title"]) if not error else {
                "source_status":"HOLD_COMMONS_QUERY_ERROR_NOT_NO_RESULTS","source_error":error}
            for row in byfile[fileid]:
                result.append(with_current_source(row,source,refs,geo))
        if j+20<len(names):time.sleep(delay)
    result.sort(key=lambda x:(x["physical_anchor_id"],x["file_title"],str(x["original_sha1_claim"])))
    disp=collections.Counter(r["p85_disposition"] for r in result)
    summary={"schema":SCHEMA,"technical_shard":shard,"technical_shard_count":SHARDS,
        "source_p83_summary_sha256":digest(summaryfile),
        "source_p83_all_assignments_sha256":digest(allfile),
        "source_p83_holds_sha256":digest(holdsfile),
        "unique_file_titles_checked":len(names),"assignments_accounted":len(result),
        "commons_metadata_requests":queries,"file_metadata_query_failures":failed,
        "source_holds":dict(sorted(disp.items())),"original_bytes_downloaded":0,
        "site_approvals":0,"rights_approvals":0,"publications":0}
    (Path(out)/f"p85-shard-{shard:02d}.json").write_text(json.dumps({"summary":summary,"records":result},
        ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf8")
    print("P85_SOURCE_SHARD="+json.dumps(summary,sort_keys=True),flush=True)
    return summary

def consolidate(allfile,holdsfile,summaryfile,technical,out):
    p83,allrows,holds=source_lineage(allfile,holdsfile,summaryfile)
    expected={key(r) for r in holds};found={}
    counters=collections.Counter();requests=0;badqueries=0
    for i in range(SHARDS):
        p=Path(technical)/f"p85-shard-{i:02d}.json"
        guard(p.exists(),"Missing one entire P85 technical source shard")
        contents=json.loads(p.read_text())
        m=contents["summary"]
        guard(m["schema"]==SCHEMA and m["technical_shard"]==i and
              m["technical_shard_count"]==SHARDS and
              m["source_p83_summary_sha256"]==digest(summaryfile) and
              m["source_p83_all_assignments_sha256"]==digest(allfile) and
              m["source_p83_holds_sha256"]==digest(holdsfile) and
              m["assignments_accounted"]==len(contents["records"]) and
              m["original_bytes_downloaded"]==m["site_approvals"]==m["rights_approvals"]==m["publications"]==0,
              "Inconsistent global P85 source shard")
        requests+=m["commons_metadata_requests"];badqueries+=m["file_metadata_query_failures"]
        for row in contents["records"]:
            k=key(row)
            guard(k in expected and k not in found,"P85 unexpected or repeated exact source identity")
            guard(row["publication"]==HOLD and row["published"] is False and
                  row["rights_approved"] is False and row["exact_site_verified"] is False and
                  row["original_bytes_verified"] is False,"P85 illegal promotion")
            guard(int(hashlib.sha256(canonical(row["file_title"]).encode()).hexdigest()[:8],16)%SHARDS==i,
                  "P85 wrong source-file shard")
            found[k]=row
            counters[row["p85_disposition"]]+=1
    guard(set(found)==expected and len(found)==N,"P85 all 7400 holds not accounted")
    ready=sorted((r for r in found.values() if r["p85_disposition"].startswith("RECOVERED_")),
        key=lambda x:(x["country"],x["place_name"],x["file_title"]))
    held=sorted((r for r in found.values() if not r["p85_disposition"].startswith("RECOVERED_")),
        key=lambda x:(x["country"],x["place_name"],x["file_title"]))
    cover=collections.Counter(x["physical_anchor_id"] for x in allrows)
    guard(sum(cover.values())==7701,"P85 cannot change original 7701 source assignments")
    out=Path(out)
    guard(not out.exists(),"Do not overwrite P85 global research evidence")
    out.mkdir(parents=True)
    for file,records in [("p85-7400-all-holds-rechecked.jsonl",sorted(found.values(),key=lambda x:(x["physical_anchor_id"],x["file_title"]))),
                         ("p85-new-research-review-candidates.jsonl",ready),
                         ("p85-holds-still-open.jsonl",held)]:
        with (out/file).open("w",encoding="utf8") as stream:
            for r in records:stream.write(json.dumps(r,ensure_ascii=False,separators=(",",":"))+"\n")
    audit={"schema":"AO_P85_WORLDWIDE_7400_HOLDS_CONSOLIDATED_V1",
        "p83_source_summary_sha256":digest(summaryfile),
        "p83_original_anchors":2579,"p83_original_assignments":7701,
        "p83_existing_research_review":301,
        "p85_original_held_assignments":N,
        "p85_new_research_review_candidates":len(ready),
        "p85_assignments_still_held":len(held),
        "all_holds_accounted":len(found),
        "commons_current_source_api_calls":requests,
        "file_metadata_query_failures":badqueries,
        "dispositions":dict(sorted(counters.items())),
        "original_bytes_downloaded":0,"images_approved":0,"rights_cleared":0,
        "photos_published":0,
        "next_gate":"Combine with original 301 only after full audit; site and rights still require verification; avoid second manual review."}
    guard(audit["p85_new_research_review_candidates"]+audit["p85_assignments_still_held"]==N,
          "P85 reconciled source count mismatch")
    (out/"p85-global-audit.json").write_text(json.dumps(audit,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    print("P85_ALL_7400_COMPLETED="+json.dumps(audit,sort_keys=True),flush=True)
    return audit

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--all",type=Path,required=True)
    p.add_argument("--holds",type=Path,required=True)
    p.add_argument("--summary",type=Path,required=True)
    p.add_argument("--intake",type=Path)
    p.add_argument("--cl2",type=Path)
    p.add_argument("--technical",type=Path)
    p.add_argument("--shard",type=int)
    p.add_argument("--out",type=Path,required=True)
    p.add_argument("--delay",type=float,default=1.0)
    a=p.parse_args()
    if a.technical:
        consolidate(a.all,a.holds,a.summary,a.technical,a.out)
    else:
        guard(a.intake and a.cl2 and a.shard is not None,"Worker must use pinned CL2 source pins")
        evidence_shard(a.all,a.holds,a.summary,a.intake,a.cl2,a.out,a.shard,delay=a.delay)
if __name__=="__main__":main()
