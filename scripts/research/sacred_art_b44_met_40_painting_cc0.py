#!/usr/bin/env python3
"""B44 no-fee Met Open Access: 40 precisely scoped saint/pictorial-theme
queries, original JPEG verification, stricter PAINTING-ONLY and CC0 gates.

Every result is a DISTINCT alternative to a frozen artwork, never a substitute
for it. Object-specific isPublicDomain=True and museum original-image URI
are required. No source or editorial promotion is allowed.
"""
import csv,hashlib,json,re,time
from io import BytesIO
from pathlib import Path
from urllib.parse import urlencode,urlsplit
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
from PIL import Image

R=Path("data/research"); Q=R/"sacred-art-b44-met-40-themes-manifest.json"
O=Path("artifacts/b44-met-cc0-40-saint-painting-alternatives")
ROOT="https://collectionapi.metmuseum.org"
UA="AdOrientemHistoricalArtResearch/2026 (https://github.com/Fulcanelli13/ad-orientem)"
MAX_IMG=32_000_000
MAX_SEARCH_IDS_PER_QUERY=8
MAX_GLOBAL_OBJECT_DETAIL_CALLS=230
MAX_ARCHIVE_IMAGES=14
MAX_ALTERNATIVES_PER_FROZEN_THEME=2
FIELDS=["frozen_artwork_id","search_phrase","met_object_id","museum_object_link","met_accession",
        "alternative_title","alternative_artist","object_date","object_name","classification",
        "medium","department","photo_is_public_domain","met_image_original_url",
        "sha256","original_image_bytes","width","height","provider_claim",
        "same_as_frozen_object","new_editorial_adoption","app_publication","evidence_status","hold"]
def call(path,params=None,accept="application/json",limit=4_000_000):
    u=ROOT+path+("?" + urlencode(params) if params else "")
    req=Request(u,headers={"User-Agent":UA,"Accept":accept})
    with urlopen(req,timeout=23) as res:
        h=urlsplit(res.geturl())
        if res.status!=200 or h.scheme!="https" or h.hostname!="collectionapi.metmuseum.org":
            raise RuntimeError("Untrusted Met API HTTP/redirect")
        if "json" not in res.headers.get("Content-Type","").lower():raise RuntimeError("Non-JSON Met response")
        b=res.read(limit+1)
        if len(b)>limit:raise RuntimeError("Met response too large")
    return json.loads(b)
def source_image(url):
    h=urlsplit(url)
    if h.scheme!="https" or h.hostname!="images.metmuseum.org" or not h.path.startswith("/CRDImages/") or "/original/" not in h.path:
        raise ValueError("Not an image original from Met authenticated CDN")
    with urlopen(Request(url,headers={"User-Agent":UA,"Accept":"image/jpeg"}),timeout=55) as res:
        h2=urlsplit(res.geturl())
        if res.status!=200 or h2.scheme!="https" or h2.hostname!="images.metmuseum.org":
            raise RuntimeError("Met media redirect or HTTP not allowed")
        ct=res.headers.get("Content-Type","").lower()
        if "image/jpeg" not in ct:raise RuntimeError("Not JPEG from museum")
        b=res.read(MAX_IMG+1)
        if len(b)>MAX_IMG or len(b)<5000:raise RuntimeError("Image empty/over maximum size")
    with Image.open(BytesIO(b)) as im:
        fmt=im.format; dims=im.size; im.verify()
    if fmt!="JPEG" or min(dims)<680:raise RuntimeError("Met source below minimum image dimension")
    return b,dims
def painting_only(o):
    obj=(o.get("objectName") or "").lower()
    cls=(o.get("classification") or "").lower()
    # Painting on a physical support; reject book illumination/prints/manuscripts.
    medium=(o.get("medium") or "").lower()
    if any(t in cls for t in ["manuscript","drawing","print","photograph","book","miniature"]):
        return False
    if any(t in obj for t in ["book","manuscript","leaf","folio","print","drawing","photograph"]):return False
    if not ("painting" in obj or cls=="paintings"):return False
    if any(t in medium for t in ["engraving","etching","lithograph","woodcut","photograph","pencil"]):return False
    return True
def main():
    m=json.loads(Q.read_text()); qs=m["queries"]
    assert len(qs)==40 and m["strictly_zero_euro"] and m["editorial_adoptions"]==0
    # Exact, frozen catalogue identities are explicit in legacy 451 master.
    with (R/"sacred-art-b27-451-physical-crosswalk.csv").open(encoding="utf-8",newline="") as f:
        existing={r["artwork_id"] for r in csv.DictReader(f)}
    O.mkdir(parents=True,exist_ok=True);(O/"originals").mkdir(exist_ok=True)
    saved=set();details_cache={};attempts=[];files=[];per_theme={};global_calls=0
    for query in qs:
        q=query["query"]; fid=query["frozen_artwork_id"]
        item={"frozen_artwork_id":fid,"query":q,"search_status":"UNKNOWN",
            "raw_total":0,"ids_examined":[],"qualified_painting_alternatives":[],"holds":[]}
        try:
            search=call("/public/collection/v1.1/search",{"q":q,"title":"true","hasImages":"true","offset":0,"limit":MAX_SEARCH_IDS_PER_QUERY})
            item["search_status"]="OK";item["raw_total"]=int(search.get("total") or 0)
            ids=search.get("objectIDs") or []
        except Exception as e:
            item["search_status"]="API_RESEARCH_ACCESS_HOLD"
            item["holds"].append("SEARCH: "+type(e).__name__+": "+str(e)[:160]);ids=[]
        rx=re.compile(query["title_regex"],re.I)
        for object_id in ids:
            if global_calls>=MAX_GLOBAL_OBJECT_DETAIL_CALLS:break
            if not isinstance(object_id,int):continue
            if object_id not in details_cache:
                try:
                    data=call(f"/public/collection/v1/objects/{object_id}")
                    details_cache[object_id]=data
                    global_calls+=1
                except Exception as e:
                    item["holds"].append(f"{object_id} API_ERR {type(e).__name__} {str(e)[:85]}")
                    global_calls+=1;continue
            o=details_cache[object_id]
            title=o.get("title") or ""
            is_painting=painting_only(o)
            title_match=bool(rx.search(title))
            already=f"met-{object_id}" in existing
            rights=o.get("isPublicDomain") is True and bool(o.get("primaryImage"))
            image=o.get("primaryImage") or ""
            creator=o.get("artistDisplayName") or ""
            candidate={"id":object_id,"title":title,"artist":creator,"accession":o.get("accessionNumber"),
                "class":o.get("classification"),"obj":o.get("objectName"),"medium":o.get("medium"),
                "exact_title_subject":title_match,"painting_only":is_painting,
                "owner_public_domain":o.get("isPublicDomain"),"image_exists":bool(image),
                "already_registered_frozen_met_id":already,
                "qualified_alternative":bool(title_match and is_painting and rights and not already),
                "object_page":o.get("objectURL") or f"https://www.metmuseum.org/art/collection/search/{object_id}"}
            item["ids_examined"].append(candidate)
            if not candidate["qualified_alternative"]:continue
            item["qualified_painting_alternatives"].append(candidate)
            if (object_id in saved or len(saved)>=MAX_ARCHIVE_IMAGES or per_theme.get(fid,0)>=MAX_ALTERNATIVES_PER_FROZEN_THEME):
                continue
            row={key:"" for key in FIELDS}
            row.update(frozen_artwork_id=fid,search_phrase=q,met_object_id=object_id,
              museum_object_link=candidate["object_page"],met_accession=candidate["accession"],
              alternative_title=title,alternative_artist=creator,object_date=o.get("objectDate"),
              object_name=o.get("objectName"),classification=o.get("classification"),
              medium=o.get("medium"),department=o.get("department"),photo_is_public_domain="YES",
              met_image_original_url=image,provider_claim="MET_OBJECT_PUBLIC_DOMAIN_TRUE_PRIMARY_ORIGINAL_JPEG_CC0",
              same_as_frozen_object="NO_DISTINCT_ALTERNATIVE_PAINTING",
              new_editorial_adoption="NO",app_publication="NO",
              hold="Alternative painted work needs explicit Catholic thematic/iconographic/quality review. Does NOT fill a frozen exact-object source gap.")
            try:
                b,(w,h)=source_image(image)
                digest=hashlib.sha256(b).hexdigest()
                (O/"originals"/(f"met-{object_id}-{digest[:16]}.jpg")).write_bytes(b)
                row.update(sha256=digest,original_image_bytes=len(b),width=w,height=h,
                    evidence_status="MET_CC0_DISTINCT_ALTERNATIVE_PAINTING_ORIGINAL_SHA_VERIFIED")
                saved.add(object_id);per_theme[fid]=per_theme.get(fid,0)+1
            except Exception as e:
                row.update(evidence_status="MEDIA_ACCESS_OR_IMAGE_QUALITY_HOLD",
                    hold=row["hold"]+"; "+type(e).__name__+": "+str(e)[:180])
            files.append(row)
        attempts.append(item)
        print("B44_MET",fid,q,item["search_status"],item["raw_total"],
              "checked",len(item["ids_examined"]),"qual",len(item["qualified_painting_alternatives"]),
              "saved",len(saved),flush=True)
        time.sleep(.15)
    with (O/"source-results.csv").open("w",newline="",encoding="utf-8") as f:
        wr=csv.DictWriter(f,fieldnames=FIELDS);wr.writeheader();wr.writerows(files)
    (O/"discovery-evidence.json").write_text(json.dumps(attempts,indent=2,ensure_ascii=False)+"\n")
    good=[r for r in files if r["sha256"]]
    summary={"schema":"AO_B44_MET_40_THEMES_CC0_PAINTING_ALTERNATIVES_V1",
        "narrow_search_queries":len(qs),
        "searches_successful":sum(a["search_status"]=="OK" for a in attempts),
        "searches_failed":sum(a["search_status"]!="OK" for a in attempts),
        "museum_records_inspected":sum(len(a["ids_examined"]) for a in attempts),
        "unique_museum_object_details_requested":global_calls,
        "qualified_case_object_pairs":sum(len(a["qualified_painting_alternatives"]) for a in attempts),
        "image_recovery_attempts":len(files),"CC0_met_painted_alternative_originals":len(good),
        "new_alternative_image_bytes":sum(int(r["original_image_bytes"]) for r in good),
        "different_work_research_only":True,"canonical_frozen_artwork_gaps_closed":0,
        "editorial_publication_approvals":0,"commercial_use_museum_CC0_alternative_candidates":len(good),
        "strict_zero_euro":True,"draft_remote_release_sha_gate_required":True}
    (O/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
    print("B44_MET_SUMMARY",json.dumps(summary),flush=True)
if __name__=="__main__":main()
