#!/usr/bin/env python3
"""Bulk-IIIF source-scope metadata reconciliation for 37 owner-handpicked works.

17 supplemental catalogue manifests previously recorded in the approved Excel
research master were missing from the older canonical 177-input CSV.
No image downloads; rights statements are signals, never photo-use approvals.
"""
from __future__ import annotations
import collections,csv,json,urllib.parse
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import requests

ROOT=Path("scripts/sacred-art/artworks_177.csv")
LEDGER=Path("data/research/sacred-art/phase40-nine-artworks-oai-identity-conclusions-eight-remaining-20261107.v1.json")
OUT=Path("artifacts/sacred-art-phase41b-37-iiif")
OUT.mkdir(parents=True,exist_ok=True)

SUPPLEMENT={
 "RECENT575::051":"https://imagehub.mskgent.be/iiif/3/7534/manifest.json",
 "RECENT575::077":"https://imagehub.mskgent.be/iiif/3/1166/manifest.json",
 "RECENT575::114":"https://dam.museabrugge.be/iiif/3/12440/manifest.json",
 "RECENT575::143":"https://dam.museabrugge.be/iiif/3/12439/manifest.json",
 "RECENT575::152":"https://dam.museabrugge.be/iiif/3/6933/manifest.json",
 "RECENT575::179":"https://dam.museabrugge.be/iiif/3/428/manifest.json",
 "RECENT575::184":"https://apicollections.parismusees.paris.fr/iiif/160007869/manifest",
 "RECENT575::238":"https://imagehub.mskgent.be/iiif/3/1054/manifest.json",
 "RECENT575::240":"https://imagehub.mskgent.be/iiif/3/152/manifest.json",
 "RECENT575::242":"https://imagehub.mskgent.be/iiif/3/6351/manifest.json",
 "RECENT575::247":"https://imagehub.mskgent.be/iiif/3/6361/manifest.json",
 "RECENT575::255":"https://iiif.kmska.be/iiif/2/438/manifest.json",
 "RECENT575::262":"https://iiif.kmska.be/iiif/3/301/manifest.json",
 "RECENT575::267":"https://dam.museabrugge.be/iiif/3/6726/manifest.json",
 "RECENT575::271":"https://dam.museabrugge.be/iiif/3/411/manifest.json",
 "RECENT575::272":"https://dam.museabrugge.be/iiif/3/410/manifest.json",
 "RECENT575::279":"https://apicollections.parismusees.paris.fr/iiif/160008208/manifest"
}
HOSTS={"iiif.kmska.be","imagehub.mskgent.be","dam.museabrugge.be","apicollections.parismusees.paris.fr"}
HEADER={"User-Agent":"AdOrientemArtResearch/1.1 (museum IIIF catalogue access, no photo download)","Accept":"application/json"}
def analyze(pair):
    rid,url=pair
    out={"registry_id":rid,"museum_iiif":url,"origin":"PHASE40_XLSX_SUPPLEMENT" if rid in SUPPLEMENT else "REPO_177_CSV",
         "status":"UNFETCHED","rights_metadata":[],"width_height":[],"canvas_count":0,
         "selected_image_rights_cleared":False,"selected_image_exactly_compared":False,
         "replacement_approved":False}
    p=urllib.parse.urlsplit(url)
    if p.scheme!="https" or p.hostname not in HOSTS:
        out["status"]="UNSAFE_SOURCE_REJECTED";return out
    try:
        res=requests.get(url,headers=HEADER,timeout=(6,22),allow_redirects=False)
        out["http_status"]=res.status_code
        if len(res.content)>2500000:raise ValueError("manifest exceeds 2.5MB")
        res.raise_for_status()
        d=res.json()
        out["status"]="RETRIEVED"
        rights=[]
        for k in ("license","rights"):
            if d.get(k):rights.append(str(d[k]))
        canvases=d.get("items") or ((d.get("sequences") or [{}])[0].get("canvases") or [])
        out["canvas_count"]=len(canvases)
        for c in canvases[:40]:
            if isinstance(c,dict):
                out["width_height"].append([c.get("width"),c.get("height")])
                for k in ("license","rights"):
                    if c.get(k):rights.append(str(c[k]))
                if c.get("images"):
                    for ann in c["images"][:3]:
                        bodies=[ann.get("resource") or {}]
                        for b in bodies:
                            for k in ("rights","license"):
                                if b.get(k):rights.append(str(b[k]))
                for page in (c.get("items") or [])[:3]:
                    for ann in (page.get("items") or [])[:4]:
                        body=ann.get("body") or {}
                        for b in (body if isinstance(body,list) else [body]):
                            for k in ("rights","license"):
                                if b.get(k):rights.append(str(b[k]))
        out["rights_metadata"]=sorted(set(rights))[:30]
        if any("creativecommons.org/publicdomain/zero/" in v.lower() for v in rights):
            out["metadata_rights"]="CC0_DECLARED_CHECK_EXACT_CANVAS"
        elif any("creativecommons.org/publicdomain/mark/" in v.lower() for v in rights):
            out["metadata_rights"]="PDM_DECLARED_CHECK_EXACT_PHOTO_SCOPE"
        elif any("rightsstatements.org/page/und/" in v.lower() for v in rights):
            out["metadata_rights"]="RIGHTS_UNDETERMINED"
        elif rights:out["metadata_rights"]="OTHER_RIGHTS_DECLARATION_REVIEW"
        else:out["metadata_rights"]="NO_MACHINE_READABLE_RIGHTS"
    except Exception as e:
        out["status"]="ERROR";out["error"]=str(e)[:220]
    return out

def main():
    with ROOT.open(encoding="utf8-sig",newline="") as f: rows=list(csv.DictReader(f))
    assert len(rows)==177
    ledger=json.loads(LEDGER.read_text(encoding="utf8"))
    held={x["registry_id"] for x in ledger["retained_eight"]}
    assert len(held)==8
    originals={x["registry_id"]:(x.get("iiif_manifest") or "").strip() for x in rows if x.get("iiif_manifest")}
    assert len(originals)==20
    assert not set(SUPPLEMENT)&set(originals)
    assert not set(SUPPLEMENT)&held
    urls=dict(originals);urls.update(SUPPLEMENT)
    assert len(urls)==37
    with ThreadPoolExecutor(max_workers=5) as executor:
        result=list(executor.map(analyze,sorted(urls.items())))
    data={"schema":"AO_SACRED_ART_PHASE41B_37_IIIF_META_V1",
          "source":"GitHub selected-177 CSV plus 17 Phase40 Excel additions",
          "records":result,"identity_holds":sorted(held),
          "manual_review_obligations":["Full image must match exact owner handpicked photograph",
            "Manifest-level PDM/CC0 cannot clear a different photo unless image-level conditions checked",
            "Technical, detail and reverse canvases must be excluded; multi-canvas scope matters",
            "Verify actual licence, photographer credit and museum terms before any replacement"],
          "downloads":0,"published_gallery_changes":0}
    (OUT/"iiif_37.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    status=collections.Counter(x["status"] for x in result)
    rights=collections.Counter(x.get("metadata_rights","NOT_RETRIEVED") for x in result)
    summary={"manifest_records":len(result),"status_counts":dict(status),"rights_metadata_counts":dict(rights),
             "multiple_canvas_objects":sum(x["canvas_count"]>1 for x in result),
             "photo_replacements":0,"photo_approvals":0}
    (OUT/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)
if __name__=="__main__":main()
