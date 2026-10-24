#!/usr/bin/env python3
"""B40: search only Wikimedia Commons FILE metadata for precisely scoped
frozen-artwork identity and accession queries. NO source-image downloads.
All hits are noncanonical leads; B37/38/39 catalogues remain unchanged.
"""
import json
import time
import urllib.parse
import urllib.request
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path("data/research")
IN=ROOT/"sacred-art-b39-27-gap-object-photo-rights-casebook.json"
OUT=ROOT/"sacred-art-b40-27-commons-file-metadata-screen.json"
USER_AGENT="AdOrientemSacredArtResearch/2026 (https://github.com/Fulcanelli13/ad-orientem; no image downloads)"
# Explicit scope deliberately avoids generic saint-title search without artist/context:
QUERIES={
"G25-003":["\"P001314\"","\"cf95015c-5744-4471-a529-84a3981719d6\""],
"italy-0900119548":["\"0900119548\"","\"Antonio Marini\" \"Alfonso\""],
"G28-003":["\"1500005082\"","\"Michele Lenzi\" \"Alfonso\""],
"G17-006":["\"PM75000591\"","\"Philippe de Champaigne\" \"François de Sales\""],
"G30-004":["\"L0070-00118\"","\"Giuseppe Franchi\" \"Gregorio Nazianzeno\""],
"G20-002":["\"PM67000164\"","\"Saint Anselme\" \"Marmoutier\""],
"G30-007":["\"1500926537\"","\"San Pier Damiano\" \"angelo\""],
"zeri-45874-peter-damian":["\"PI_0476/5/9\"","\"Venanzio\" \"Pier Damiano\""],
"G30-006":["\"0800072792\"","\"San Pier Damiano\" \"Pianoro\""],
"G30-010":["\"1200225121\"","\"Roberto Bellarmino\" \"Scala\""],
"G30-012":["\"Pierre Wuilleret\" \"Canisius\"","\"Prédication\" \"Canisius\" \"Wuilleret\""],
"italy-banchero-0700031704":["\"0700031704\"","\"Angelo Giacinto Banchero\" \"Lorenzo\""],
"G32-002":["\"Francesco Netti\" \"Effremo\"","\"Netti\" \"Sant'Effremo\""],
"ART-uan-orrea-de-ivar-aint-awrence-aint-ilary-two-sided-altarpiece-panel":["\"San Hilario ermitaño\" \"Correa\"","\"Saint Hilary\" \"Correa de Vivar\""],
"G29-001":["\"IM33002267\"","\"Jérôme-Martin Langlois\" \"Hilaire\""],
"QCP-HILARY-LEDUC-1896-1900":["\"Ozias Leduc\" \"Hilaire\" \"Trinité\"","\"Saint Hilaire\" \"Ozias Leduc\""],
"W04-009":["\"INV 20450\"","\"Philippe de Champaigne\" \"Le songe de saint Joseph\""],
"G26-007":["\"RF 3946\"","\"Eugène Carrière\" \"Jeanne d'Arc\""],
"W10-009":["\"MI 1391\"","\"Apothéose de saint Louis\" \"Fragonard\""],
"G27-002":["\"Vincenzo Valdrè\" \"Saint Patrick\"","\"St Patrick's Hall\" \"Valdrè\""],
"G17-009":["\"PM01002382\"","\"Baronne Girod\" \"saint Denis\""],
"ART-eter-aul-ubens-oly-amily-with-aint-nne":["\"P001639\" \"Rubens\"","\"52.9.107\" \"Rubens\""],
"ART-iandomenico-iepolo-urial-of-hrist-rado-assion-series":["\"P000362\"","\"Giandomenico Tiepolo\" \"Entierro de Cristo\""],
"ART-eter-aul-ubens-aint-nthony-of-adua-with-the-hrist-hild":["\"Peter Paul Rubens\" \"Saint Anthony of Padua\"","\"Rubens\" \"Anthony of Padua\" \"Child\""],
"ART-eter-aul-ubens-he-oly-rinity":["\"KMSKA\" \"314\" \"Holy Trinity\""]
}
HOLDS={
"celine-1894-john-cross":"UNDERLYING_ARTWORK_COPYRIGHT",
"carmel-lisieux-1925-therese-aux-roses":"UNDERLYING_ARTWORK_COPYRIGHT"
}
def search(q):
    params={"action":"query","format":"json","generator":"search","gsrsearch":q,"gsrnamespace":"6",
      "gsrlimit":"6","prop":"imageinfo","iiprop":"size|mime|extmetadata|url","formatversion":"2"}
    url="https://commons.wikimedia.org/w/api.php?"+urllib.parse.urlencode(params)
    req=urllib.request.Request(url,headers={"User-Agent":USER_AGENT,"Accept":"application/json"})
    with urllib.request.urlopen(req,timeout=35) as conn:
        if conn.status!=200: raise RuntimeError("Commons API HTTP "+str(conn.status))
        data=conn.read(1_500_001)
    if len(data)>1_500_000: raise RuntimeError("Oversize metadata, not counted")
    j=json.loads(data)
    if "error" in j: raise RuntimeError("Commons API error: "+str(j["error"])[:180])
    hits=[]
    for page in j.get("query",{}).get("pages",[]):
        info=page.get("imageinfo",[{}])[0]
        ext=info.get("extmetadata",{})
        license_name=ext.get("LicenseShortName",{}).get("value","")
        title=page.get("title","")
        if not title.startswith("File:"): continue
        hits.append({"file_title":title,"page_id":page.get("pageid"),
             "file_page":"https://commons.wikimedia.org/wiki/"+urllib.parse.quote(title.replace(" ","_"),safe=":_(),.'%-"),
             "mime":info.get("mime"),"width":info.get("width"),"height":info.get("height"),
             "bytes":info.get("size"),"license_short_name_metadata":license_name[:120],
             "media_url":info.get("url") if str(info.get("url","")).startswith("https://upload.wikimedia.org/") else None,
             "match_certified":False,"object_identity_certified":False,"app_rights_approved":False})
    return hits
def main():
    b=json.loads(IN.read_text(encoding="utf-8"))
    records=b["cases"]
    assert len(records)==27 and len(set(x["artwork_id"] for x in records))==27
    assert len(QUERIES)==25 and len(HOLDS)==2
    assert set(QUERIES)|set(HOLDS)=={r["artwork_id"] for r in records}
    rows=[]
    for case in records:
        key=case["artwork_id"]
        if key in HOLDS:
            rows.append({"artwork_id":key,"title":case["title"],"status":HOLDS[key],
             "queries":[],"raw_candidate_files":[],"search_completed":False,
             "photo_promoted":False,"acquisition_permitted":False})
            continue
        results=[]
        for q in QUERIES[key]:
            attempt={"query":q,"status":"UNKNOWN","hits":[]}
            try:
                attempt["hits"]=search(q)
                attempt["status"]="OK"
            except Exception as e:
                attempt["status"]="FETCH_ERROR"
                attempt["error"]=type(e).__name__+": "+str(e)[:180]
            results.append(attempt)
            time.sleep(.35)
        seen={}
        for a in results:
            for h in a["hits"]:
                seen[h["file_title"]]=h
        rows.append({"artwork_id":key,"title":case["title"],
            "status":"METADATA_LEADS_UNVERIFIED" if seen else "NO_FILE_LEADS_FROM_THIS_LIMITED_QUERY",
            "queries":results,"raw_candidate_files":list(seen.values()),
            "search_completed":all(x["status"]=="OK" for x in results),
            "photo_promoted":False,"acquisition_permitted":False})
        print("B40_METADATA",key,len(seen),"/",len(results),flush=True)
    assert len(rows)==27
    success=sum(q["status"]=="OK" for row in rows for q in row["queries"])
    failures=sum(q["status"]=="FETCH_ERROR" for row in rows for q in row["queries"])
    leads=sum(len(row["raw_candidate_files"]) for row in rows)
    result={"schema":"AO_B40_27_PRECISE_COMMONS_METADATA_QUERY_SCREEN_V1","date":"2026-10-24",
         "method":"Wikimedia Commons File namespace search, up to six returned results per query. Search metadata only; no image bytes or reuse rights certified. Query failure is not no-image proof.",
         "case_count":27,"copyright_excluded_cases":2,
         "searchable_cases":25,"queries_completed":success,"queries_failed":failures,
         "unique_case_file_pairs":leads,
         "source_files_downloaded":0,"source_bytes_preserved":0,"photo_rights_approved":0,
         "catalogue_coverage_increment":0,"editorial_approvals":0,"strictly_zero_euro":True,
         "base_any_source":357,"base_complete_object":356,
         "remaining_full_object_gaps":27,"cases":rows}
    OUT.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("B40_SUMMARY",json.dumps({k:result[k] for k in
        ("case_count","copyright_excluded_cases","queries_completed","queries_failed","unique_case_file_pairs","catalogue_coverage_increment")}),flush=True)
if __name__=="__main__":main()
