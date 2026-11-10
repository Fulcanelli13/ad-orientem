#!/usr/bin/env python3
"""Bounded public museum API research for alternative oil artworks.

Queries three institutionally published open-access APIs. Metadata only:
no image downloads, no copyright inference from subjects, and no app writes.
"""
import argparse, json, re, time, urllib.parse, urllib.request
from datetime import datetime, timezone
from pathlib import Path

ENDPOINTS={
    "CMA":"openaccess-api.clevelandart.org",
    "AIC":"api.artic.edu",
    "MET":"collectionapi.metmuseum.org"
}
MAX_RESPONSE=4*1024*1024
MAX_REQUESTS=130

class SourceSession:
    def __init__(self):self.count=0
    def get(self,url,provider):
        p=urllib.parse.urlparse(url)
        if p.scheme!="https" or p.hostname!=ENDPOINTS[provider]:
            raise ValueError("unlisted institutional API host")
        if self.count>=MAX_REQUESTS:raise ValueError("request cap reached")
        self.count+=1
        req=urllib.request.Request(url,headers={
            "Accept":"application/json","User-Agent":"AdOrientemResearchOpenMuseumAlternatives/1.0"
        })
        with urllib.request.urlopen(req,timeout=22) as response:
            final=urllib.parse.urlparse(response.geturl())
            if final.scheme!="https" or final.hostname!=ENDPOINTS[provider]:
                raise ValueError("unexpected API redirect")
            mime=response.headers.get("Content-Type","").lower()
            raw=response.read(MAX_RESPONSE+1)
        if not raw or len(raw)>MAX_RESPONSE:raise ValueError("empty or oversized API response")
        if "json" not in mime and raw[0:1] not in (b"{",b"["):
            raise ValueError("API did not return JSON")
        data=json.loads(raw)
        time.sleep(.08)
        return data

def short(x,maxlength=220):
    return str(x or "")[:maxlength]

def painting_like(*pieces):
    text=" ".join(str(x or "") for x in pieces).lower()
    positive=("oil","painting","tempera","acrylic","gouache")
    negative=("print","engraving","lithograph","etching","woodcut","photograph","sculpture",
              "ceramic","pottery","drawing","charcoal","pencil")
    return any(t in text for t in positive) and not any(t in text for t in negative)

def cma_search(s,query,limit):
    url="https://openaccess-api.clevelandart.org/api/artworks/?"+urllib.parse.urlencode(
       {"q":query,"cc0":"","has_image":1,"limit":limit})
    body=s.get(url,"CMA")
    candidates=[]
    for item in body.get("data",[])[:limit]:
        if not isinstance(item,dict):continue
        typ=item.get("type","")
        medium=item.get("technique","")
        if not painting_like(typ,medium):continue
        rights=short(item.get("share_license_status"),60)
        if rights.casefold()!="cc0":continue
        images=item.get("images") or {}
        web=images.get("web") or {}
        large=images.get("print") or images.get("full") or {}
        img=large.get("url") or web.get("url")
        if not img:continue
        candidates.append({
            "source":"CMA","id":str(item.get("id","")),"title":short(item.get("title")),
            "artist":short((item.get("creators") or [{}])[0].get("description")),
            "date":short(item.get("creation_date"),80),"medium":short(typ+"; "+medium,160),
            "rights":"CMA_CC0_EXACT_OBJECT", "imageUrl":short(img,600),
            "museumUrl":short(item.get("url") or "https://www.clevelandart.org/art/"+str(item.get("accession_number") or ""),600),
            "imageBytesDownloaded":False,"imagePhotoQACertified":False,"ownerApproved":False
        })
    return candidates,{"query":query,"returned":len(body.get("data",[])),"eligiblePaintingWithCC0Image":len(candidates)}

def aic_search(s,query,limit):
    fields="id,title,artist_title,date_display,medium_display,artwork_type_title,is_public_domain,image_id,api_link"
    params={"q":query,"limit":limit,"fields":fields,"query[term][is_public_domain]":"true"}
    url="https://api.artic.edu/api/v1/artworks/search?"+urllib.parse.urlencode(params)
    body=s.get(url,"AIC")
    candidates=[]
    for item in body.get("data",[])[:limit]:
        if not item.get("is_public_domain"):continue
        if not painting_like(item.get("medium_display"),item.get("artwork_type_title")):continue
        image_id=item.get("image_id")
        if not isinstance(image_id,str) or not re.fullmatch(r"[0-9a-fA-F-]{20,64}",image_id):continue
        candidates.append({
            "source":"AIC","id":str(item.get("id","")),"title":short(item.get("title")),
            "artist":short(item.get("artist_title")),"date":short(item.get("date_display"),80),
            "medium":short(item.get("medium_display"),160),
            "rights":"AIC_IS_PUBLIC_DOMAIN_TRUE_WITH_IIIF_IMAGE",
            "imageUrl":"https://www.artic.edu/iiif/2/"+image_id+"/full/843,/0/default.jpg",
            "museumUrl":"https://www.artic.edu/artworks/"+str(item.get("id")),
            "imageBytesDownloaded":False,"imagePhotoQACertified":False,"ownerApproved":False
        })
    return candidates,{"query":query,"returned":len(body.get("data",[])),"eligiblePaintingWithCC0Image":len(candidates)}

def met_search(s,query,limit,details):
    params={"q":query,"isPublicDomain":"true","hasImages":"true","offset":"0","limit":limit}
    url="https://collectionapi.metmuseum.org/public/collection/v1.1/search?"+urllib.parse.urlencode(params)
    results=s.get(url,"MET")
    candidates=[]
    ids=results.get("objectIDs") or []
    for ident in ids[:details]:
        if not isinstance(ident,int):continue
        try:
            item=s.get("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+str(ident),"MET")
        except Exception:continue
        if item.get("isPublicDomain") is not True or not item.get("primaryImage"):continue
        if not painting_like(item.get("medium"),item.get("objectName"),item.get("classification")):continue
        image_url=item.get("primaryImage")
        p=urllib.parse.urlparse(image_url)
        if p.scheme!="https" or p.hostname!="images.metmuseum.org":continue
        candidates.append({
            "source":"MET","id":str(ident),"title":short(item.get("title")),
            "artist":short(item.get("artistDisplayName")),
            "date":short(item.get("objectDate"),80),"medium":short(item.get("medium"),160),
            "rights":"MET_OPEN_ACCESS_CC0_IS_PUBLIC_DOMAIN_TRUE",
            "imageUrl":short(image_url,600),
            "museumUrl":short(item.get("objectURL") or "https://www.metmuseum.org/art/collection/search/"+str(ident),600),
            "imageBytesDownloaded":False,"imagePhotoQACertified":False,"ownerApproved":False
        })
    return candidates,{"query":query,"totalReported":results.get("total",0),
                      "objectsInspected":min(len(ids),details),"eligiblePaintingWithCC0Image":len(candidates)}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--manifest",required=True)
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    cfg=json.loads(Path(args.manifest).read_text("utf-8"))
    assert cfg["schema"]=="AO_SACRED_ART_CC0_MUSEUM_ALTERNATIVE_DISCOVERY_BATCH4_V1"
    targets=cfg["targets"]
    if len(targets)!=8 or len(cfg["providers"])!=3 or cfg["counts"]["totalSearchQueries"]!=24:
        raise ValueError("unexpected research request scope")
    if any(t["ownerApproved"] or t["productionAssignment"] for t in targets):
        raise ValueError("unsafe authorisation in research manifest")
    s=SourceSession()
    report={"schema":"AO_SACRED_ART_CC0_MUSEUM_ALTERNATIVES_PROVISIONAL_V1",
       "asOfUtc":datetime.now(timezone.utc).isoformat(),
       "researchOnly":True,"ownerApproved":False,"imagesRetrieved":0,
       "publicImageAssignments":0,"requestCount":0,"targets":[]}
    for t in targets:
        entries=[];errors=[];queries=[]
        for provider in cfg["providers"]:
            pid=provider["id"]
            query=t["queries"][0]
            try:
                if pid=="CMA":arts,info=cma_search(s,query,provider["limitPerQuery"])
                elif pid=="AIC":arts,info=aic_search(s,query,provider["limitPerQuery"])
                elif pid=="MET":arts,info=met_search(s,query,provider["limitPerQuery"],10)
                else:raise ValueError("not allowed provider")
                entries.extend(arts)
                queries.append({"provider":pid,**info})
            except Exception as e:
                errors.append({"provider":pid,"query":query,"error":type(e).__name__+": "+str(e)[:220]})
        # Candidate metadata from museum search is not yet verified as depicting
        # this saint or scene. Always require independent manual iconographic review.
        report["targets"].append({
            "originalKey":t["originalKey"],"date":t["proposedLiturgicalDate"],
            "desiredFidelity":t["desiredFidelity"],"providerQueries":queries,
            "errors":errors,"provisionalAlternatives":entries,
            "matchedExactSaintOrScene":False,"globalRejectionCrosscheckDone":False,
            "ownerApproved":False
        })
        print(t["originalKey"]+": "+str(len(entries))+" photo-linked museum painting leads; errors="+str(len(errors)),flush=True)
    report["requestCount"]=s.count
    report["provisionalArtworks"]=sum(len(t["provisionalAlternatives"]) for t in report["targets"])
    report["uniqueProviderObjectKeys"]=len(set((c["source"],c["id"]) for t in report["targets"] for c in t["provisionalAlternatives"]))
    dest=Path(args.output);dest.mkdir(parents=True,exist_ok=True)
    (dest/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Potential object records:",report["provisionalArtworks"],"no images downloaded or placements approved",flush=True)
    return 0
if __name__=="__main__":
    raise SystemExit(main())
