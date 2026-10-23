#!/usr/bin/env python3
"""B26: museum-identifier-first bulk Commons research across 30 image-less artworks.

This searches *file metadata* (never downloads) and differentiates literal museum-ID
evidence from fuzzy titles and different works. No licence or editorial approvals.
"""
import csv,html,json,pathlib,re,time,unicodedata
from collections import Counter,defaultdict
from datetime import datetime,timezone
from urllib.parse import urlencode,urlsplit,unquote
from urllib.request import Request,urlopen
from urllib.error import HTTPError,URLError
ROOT=pathlib.Path("data/research")
CAT=ROOT/"sacred-art-missing30-after-b25.csv"
OUT=pathlib.Path("artifacts/b26-targeted30");OUT.mkdir(parents=True,exist_ok=True)
UA="AdOrientem-SacredArt-MuseumAccessionResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)"
API="https://commons.wikimedia.org/w/api.php"
ROWS=["artwork_id","title","artist","museum_accession_search","query","commons_file_title","commons_file_page",
      "file_url_candidate","width","height","bytes","metadata_license","metadata_artist","metadata_source","metadata_description",
      "literal_accession_found","institution_url_found","attribution_keyword_found","identity_evidence_class",
      "original_work_rights_gate","image_rights_gate","image_status","publication_status","checked_utc"]
STATUS=["artwork_id","title","searches_executed","metadata_candidates","exact_accession_candidate_files","rate_limited",
        "error","next_action"]
def clean(s):
    return re.sub(r"\s+"," ",html.unescape(re.sub("<[^>]*>"," ",str(s or "")))).strip()
def accession(row):
    url=row.get("legacy_source_url") or row.get("legacy_object_url") or ""
    if row["artwork_id"]=="W40-006":return "P004126"
    if row["artwork_id"].startswith("ART-iandomenico-iepolo-urial"):return "P000362"
    if row["artwork_id"]=="W04-009":return "INV 20450"
    if row["artwork_id"]=="W10-009":return "MI 1391"
    if row["artwork_id"]=="G26-007":return "RF 3946"
    if row["artwork_id"]=="ART-uan-orrea-de-ivar-aint-awrence-aint-ilary-two-sided-altarpiece-panel":return "P001300"
    m=re.search(r"(/notice/palissy/)([A-Z]{2}[0-9]{8})",url)
    if m:return m.group(2)
    m=re.search(r"/(?:HistoricOrArtisticProperty)/([0-9]{8,12})",url)
    if m:return m.group(1)
    m=re.search(r"/(?:work)/([0-9]{3,9})",url)
    if m:return m.group(1)
    return ""
def get(params):
    request=Request(API+"?"+urlencode(params),headers={"User-Agent":UA,"Accept":"application/json"})
    try:
        with urlopen(request,timeout=45) as f:r=json.load(f)
        if r.get("error"):return [],str(r["error"])[:200],False
        return r.get("query",{}).get("pages",[]),"",False
    except HTTPError as e:return [],"HTTP_"+str(e.code),e.code==429
    except (URLError,TimeoutError,ValueError,OSError) as e:return [],str(e)[:200],False
def title_key(s):
    text=unicodedata.normalize("NFKD",s or "").encode("ascii","ignore").decode("ascii").lower()
    return re.sub("[^a-z0-9]+"," ",text).strip()
def main():
    with CAT.open(newline="",encoding="utf-8") as f:source=list(csv.DictReader(f))
    assert len(source)==30 and all(x["priority"]=="P2" for x in source)
    found=[];screens=[];limited=False
    for count,row in enumerate(source,1):
        aid=row["artwork_id"];acc=accession(row)
        copyright_hold=aid in ("celine-1894-john-cross","carmel-lisieux-1925-therese-aux-roses")
        artist=row["artist"].split("(")[0].strip()
        # No search broad enough to assign an unknown Rubens/Lamentation to an inventory.
        qs=[]
        if acc:qs.append('"'+acc+'"')
        if artist and not copyright_hold:qs.append('"'+row["title"]+'" "'+artist.split()[-1]+'"')
        if not qs and row["legacy_source_url"]:qs.append('"'+row["title"]+'"')
        # Rights-protected contemporary Céline works: no automatic image search or download.
        if copyright_hold:qs=[]
        seen=set();executed=0;errors=[];hits=0;exact_files=0
        for q in qs[:2]:
            if limited:break
            pages,err,throttle=get({"action":"query","generator":"search","gsrsearch":q,"gsrnamespace":6,"gsrlimit":7,
                "prop":"imageinfo","iiprop":"url|size|extmetadata","format":"json","formatversion":2,"maxlag":5})
            executed+=1
            if err:errors.append(err)
            if throttle:
                limited=True;break
            for page in pages:
                name=page.get("title","")
                if not name.startswith("File:") or name in seen:continue
                seen.add(name)
                info=(page.get("imageinfo") or [{}])[0];extra=info.get("extmetadata") or {}
                meta=lambda k:clean((extra.get(k) or {}).get("value",""))
                desc=" ".join([name,meta("ObjectName"),meta("ImageDescription"),meta("Credit"),meta("Source"),meta("Artist")])
                # The accession must be a literal, delimited museum inventory code.
                literal=bool(acc and re.search(r"(?<![A-Za-z0-9])"+re.escape(acc)+r"(?![A-Za-z0-9])",desc,re.I))
                inst=row["legacy_source_url"] or row["legacy_object_url"] or ""
                ident_url=bool(inst and len(inst)>30 and inst.lower() in desc.lower())
                surname=title_key(artist).split()[-1] if title_key(artist) else ""
                person=bool(len(surname)>3 and surname in title_key(desc))
                ident="EXACT_INVENTORY_REFERENCE_CANDIDATE" if literal or ident_url else ("TITLE_ARTIST_CANDIDATE" if person else "UNVERIFIED_POSSIBLE_DIFFERENT_ARTWORK")
                if literal:exact_files+=1
                rec={"artwork_id":aid,"title":row["title"],"artist":row["artist"],"museum_accession_search":acc,
                    "query":q,"commons_file_title":name,"commons_file_page":"https://commons.wikimedia.org/wiki/"+name.replace(" ","_"),
                    "file_url_candidate":info.get("url",""),"width":info.get("width",""),"height":info.get("height",""),
                    "bytes":info.get("size",""),"metadata_license":meta("LicenseShortName"),"metadata_artist":meta("Artist")[:220],
                    "metadata_source":meta("Source")[:300],"metadata_description":meta("ImageDescription")[:500],
                    "literal_accession_found":"YES" if literal else "NO","institution_url_found":"YES" if ident_url else "NO",
                    "attribution_keyword_found":"YES" if person else "NO","identity_evidence_class":ident,
                    "original_work_rights_gate":"CONTEMPORARY_CREATOR_RIGHTS_HOLD" if copyright_hold else "MANUAL_WORK_RIGHTS_CHECK",
                    "image_rights_gate":"EXACT_FILE_LICENSE_AND_PHOTO_OWNERSHIP_CHECK","image_status":"NOT_DOWNLOADED",
                    "publication_status":"HOLD","checked_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")}
                found.append(rec);hits+=1
            time.sleep(1.15)
        screens.append({"artwork_id":aid,"title":row["title"],"searches_executed":executed,
            "metadata_candidates":hits,"exact_accession_candidate_files":exact_files,
            "rate_limited":"YES" if limited else "NO","error":" | ".join(errors),
            "next_action":"UNDERLYING_WORK_PERMISSION_FIRST" if copyright_hold else (
                "INSTITUTIONAL_IDENTITY_AND_FILE_LICENSE_COMPARE" if exact_files else "EXACT_OBJECT_DISCOVERY_OR_OTHER_SOURCE")})
        print("PROGRESS",count,"/30",aid,"candidate",hits,"accession",exact_files,flush=True)
        if limited:
            for r in source[count:]:
                screens.append({"artwork_id":r["artwork_id"],"title":r["title"],"searches_executed":0,
                    "metadata_candidates":0,"exact_accession_candidate_files":0,"rate_limited":"YES",
                    "error":"DEFERRED_AFTER_COMMONS_429","next_action":"RESPECT_RETRY_AFTER"})
            break
    with (OUT/"Accession_file_candidates.csv").open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=ROWS);w.writeheader();w.writerows(found)
    with (OUT/"Accession_search30.csv").open("w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=STATUS);w.writeheader();w.writerows(screens)
    report={"scope_artworks":30,"artworks_with_candidates":len({a["artwork_id"] for a in found}),
        "candidate_records":len(found),"literal_museum_accession_candidate_files":sum(z["literal_accession_found"]=="YES" for z in found),
        "artworks_with_accession_candidate":len({z["artwork_id"] for z in found if z["literal_accession_found"]=="YES"}),
        "copyright_protected_excluded_from_search":2,"rate_limit_triggered":limited,
        "rights_clearances":0,"image_files_downloaded":0,"publication_approvals":0,
        "generated_utc":datetime.now(timezone.utc).isoformat(timespec="seconds")}
    (OUT/"Accession_search_summary.json").write_text(json.dumps(report,indent=2),encoding="utf-8")
    print("SUMMARY",json.dumps(report,sort_keys=True),flush=True)
if __name__=="__main__":main()
