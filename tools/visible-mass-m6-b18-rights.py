#!/usr/bin/env python3
"""Batch-verify B18 individual Wikimedia Commons pages, avoiding assumptions from collection-level licenses."""
import html, json, re, time, requests
from pathlib import Path
from urllib.parse import urlsplit,unquote
ROOT=Path(__file__).resolve().parent.parent
SRC=ROOT/"previews/visible-mass-3d/M6_P0_BATCH18_FRENCH_CATHOLIC_COLLECTIONS_20261019.v1.json"
DEST=ROOT/"dist/visible-mass/M6_B18_Commons_Rights_20261019.json"
r=json.loads(SRC.read_text(encoding="utf-8"))
assert len(r["images"])==14
def normalized(url):
    return "File:"+unquote(urlsplit(url).path.split("File:",1)[1]).replace("_"," ")
titles=[normalized(x["source_url"]) for x in r["images"]]
session=requests.Session()
session.headers.update({"User-Agent":"AdOrientemM6-AttributionResearch/0.1 (purpose: source provenance verification)"})
params={"action":"query","format":"json","formatversion":"2","prop":"imageinfo","iiprop":"size|mime|extmetadata","titles":"|".join(titles)}
resp=session.get("https://commons.wikimedia.org/w/api.php",params=params,timeout=75)
resp.raise_for_status()
pages=resp.json()["query"]["pages"]
bytitle={x["title"].replace("_"," "):x for x in pages}
def strip(s):
    return html.unescape(re.sub("<[^>]+>"," ",s or "")).strip()
out=[]
for x, title in zip(r["images"],titles):
    page=bytitle.get(title)
    if not page:
        # Case/normalization may differ; do not substitute speculative source IDs.
        out.append({"asset_id":x["asset_id"],"status":"NOT_VERIFIED_MISSING_TITLE","requested_title":title})
        continue
    img=(page.get("imageinfo") or [{}])[0]
    meta=img.get("extmetadata") or {}
    get=lambda k:strip((meta.get(k) or {}).get("value"))
    author=get("Artist") or get("Credit") or ""
    lic=get("LicenseShortName")
    link=get("LicenseUrl")
    result={"asset_id":x["asset_id"],"source_url":x["source_url"],"canonical_file_title":page["title"],
            "original_width":img.get("width"),"original_height":img.get("height"),"mime":img.get("mime"),
            "license_short_name":lic,"license_url":link,"artist_raw":author[:500],"usage_terms":get("UsageTerms")[:150]}
    # Only assign by exact named author evidence; do not infer based on filename similarity.
    if re.search("Pierre Poschadel|P\\.poschadel",author,re.I):
        result["verified_creator"]="Pierre Poschadel"
    elif re.search("own work",author,re.I):
        result["verified_creator"]=None
    else:
        result["verified_creator"]=None
    license_ok=lic in {"CC BY-SA 4.0","CC BY 4.0","CC0","CC0 1.0"} and bool(link)
    result["rights_status"]="SOURCE_PAGE_METADATA_VERIFIED" if license_ok and result["verified_creator"] else "METADATA_ONLY_CREATOR_OR_LICENSE_REVIEW_NEEDED"
    result["editorial_approved"]=False
    out.append(result)
result={"schema":"AO_VISIBLE_MASS_B18_COMMMONS_RIGHTS_CHECK_V1","source_count":14,
        "reference_file":SRC.name,"records":out,"license_recording_is_not_user_approval":True,
        "independent_image_rights_checked":sum(x.get("rights_status")=="SOURCE_PAGE_METADATA_VERIFIED" for x in out)}
DEST.parent.mkdir(parents=True,exist_ok=True)
DEST.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
print("B18 RIGHTS SUMMARY",json.dumps({"verified":result["independent_image_rights_checked"],"count":len(out)}),flush=True)
for x in out:print("B18 RIGHTS RECORD",json.dumps({k:x.get(k) for k in ["asset_id","verified_creator","license_short_name","original_width","original_height","rights_status"]},ensure_ascii=False),flush=True)
