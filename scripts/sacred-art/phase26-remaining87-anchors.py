#!/usr/bin/env python3
"""Phase 26: rebuild all 87 unresolved owner-handpicked records and inspect museum source links.
Read-only research. Avoid translating unrelated museum pages into unverified exact matches.
"""
import csv, json, re, unicodedata, collections, html
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse, urlunparse
import requests
from bs4 import BeautifulSoup

ROOT=Path(__file__).resolve().parent
BASE=ROOT/"artworks_177.csv"
P20=Path("reference-phase20/metadata_recovery_157.json")
OUT=Path("artifacts/sacred-art-phase26-source-crosswalk")
DIRECTORY=Path("data/research/sacred-art")
FILESETS=[
 ("phase21-official-object-crosswalk-20261106.v1.json","new_confirmed"),
 ("phase22-toulouse-inventory-crosswalk-20261106.v1.json","newly_confirmed"),
 ("phase22-institutional-object-confirmations-20261106.v1.json","new_verified"),
 ("phase23-institutional-identity-20261106.v1.json","confirmed"),
 ("phase24-five-museums-exact-object-crosswalk-20261106.v1.json","records"),
 ("phase25-image-recovery-and-identity-20261106.v1.json","new_museum_record_confirmations"),
]
URLPAT=re.compile(r'https?://[^\s\[\]\|{}<>\"\'()]+',re.I)
DOMAINS=(
 "augustins.org","musee-magnin.fr","musees.strasbourg.eu",
 "mahmah.ch","collections-mba.nancy.fr","mba.nancy.fr",
 "mbaa.besancon.fr","pop.culture.gouv.fr","vlaamsekunstcollectie.be",
 "museabrugge.be","petit-palais.org","museefabre.fr",
 "pba-opacweb.lille.fr","musee-conde.fr","collections.louvre.fr",
 "collections-mba-lyon.fr","musee-grenoble.fr",
 "musees-bordeaux.fr","musba-bordeaux.fr","musee-orsay.fr",
 "musee-unterlinden.com","musees-rouen-normandie.fr",
 "musee-granet.fr","musees-nantes.fr","artinflanders.be",
 "musee-des-beaux-arts.nancy.fr","musees.rennes.fr",
 "museedesbeauxarts.nantesmetropole.fr","kikirpa.be")
UA="AdOrientemArtResearch/1.0 (owner-handpicked museum identity only)"
STOP={"the","and","with","dans","des","les","une","saint","sainte","christ","de","du","la","le","et","en","un","a","de","l","d","jesus","museum","musée","musee","tableau"}
def norm(s):
 return unicodedata.normalize("NFKD",str(s or "")).encode("ascii","ignore").decode("ascii").lower()
def tokens(s):
 return set(x for x in re.findall(r"[a-z]{3,}",norm(s)) if x not in STOP)
def official_host(uri):
 host=urlparse(uri).hostname or ""
 return any(host==d or host.endswith("."+d) for d in DOMAINS)
def links(r):
 parts=[r.get("candidate_direct_museum_url",""),r.get("source_field",""),
        r.get("external_source_urls",""),r.get("accession_field","")]
 urls=[]
 for text in parts:
  for match in URLPAT.findall(str(text)):
   raw=match.strip(".,;")
   if raw.startswith("http://"):raw="https://"+raw[7:]
   q=urlparse(raw)
   if official_host(raw):
    raw=urlunparse((q.scheme,q.netloc,q.path,q.params,q.query,""))
    if raw not in urls: urls.append(raw)
 return urls[:5]
def get_brief(url):
 out={"url":url,"status":"FAILED","http_status":None,"page_title":"","page_heading":"",
      "extracted_inventory":"","page_excerpt":"","error":""}
 try:
  with requests.get(url,headers={"User-Agent":UA,"Accept":"text/html,application/xhtml+xml"},
                    timeout=(8,22),allow_redirects=False,stream=True) as r:
   out["http_status"]=r.status_code
   if r.status_code in (301,302,303,307,308):
    out["error"]="REDIRECT_NOT_FOLLOWED: "+str(r.headers.get("Location",""))[:150]
    return out
   if r.status_code!=200:
    out["error"]="HTTP "+str(r.status_code)
    return out
   data=bytearray()
   for part in r.iter_content(32768):
    data.extend(part)
    if len(data)>1200000:break
  typ=r.headers.get("Content-Type","")
  if "html" not in typ.lower():
   out["error"]="NOT_HTML_"+typ[:70]
   return out
  soup=BeautifulSoup(bytes(data),"html.parser")
  out["page_title"]=soup.title.get_text(" ",strip=True)[:240] if soup.title else ""
  heading=soup.find("h1")
  out["page_heading"]=heading.get_text(" ",strip=True)[:260] if heading else ""
  for el in soup(["script","style","nav","footer"]):el.decompose()
  content=soup.get_text(" ",strip=True)
  out["page_excerpt"]=content[:2400]
  out["status"]="HTML_ACCESSIBLE"
 except Exception as e:out["error"]=str(e)[:180]
 return out
def inspect(item,meta):
 rid=item["registry_id"]
 d={"registry_id":rid,"painting":item["title"],"artist":item["artist"],"museum":item["museum"],
    "selected_commons":item["commons_url"],"accession_hint":meta.get("accession_field",""),
    "source_text":str(meta.get("source_field",""))[:380],
    "official_urls":links(meta),"inspected_official_pages":[],"best_result":"NO_OFFICIAL_URL",
    "exact_museum_object_verified_this_batch":False,"proposed_object_url":"","warnings":[]}
 for uri in d["official_urls"][:3]:
  found=get_brief(uri)
  text=found["page_heading"]+" "+found["page_title"]
  overlap=tokens(item["title"]) & tokens(text)
  hint=str(meta.get("accession_field",""))
  raw=re.sub(r"https?://\S+","",hint).split(",")[0].strip()
  accparts=[x for x in re.split(r"[;,|]",raw) if x.strip()]
  exact_inventory=any(re.search(r"(?<!\w)"+re.escape(x.strip())+r"(?!\w)",found["page_excerpt"],flags=re.I) for x in accparts if len(x.strip())>=5)
  found["title_token_overlap"]=list(sorted(overlap))
  found["accession_seen"]=exact_inventory
  if found["status"]=="HTML_ACCESSIBLE":
   if exact_inventory and len(overlap)>=1:
    found["triage"]="POTENTIAL_EXACT_INVENTORY_SUBJECT_CHECK_ATTRIBUTION"
   elif exact_inventory:
    found["triage"]="ACCESSION_MATCH_TITLE_OR_SUBJECT_CONFLICT"
   elif len(overlap)>=2:
    found["triage"]="TITLE_MATCH_WITHOUT_INVENTORY_REQUIRES_EXACT_OBJECT_CHECK"
   else:
    found["triage"]="PAGE_ACCESSIBLE_IDENTITY_NOT_ESTABLISHED"
  else:found["triage"]="ENDPOINT_NOT_ACCESSIBLE"
  d["inspected_official_pages"].append(found)
 statuses=[p["triage"] for p in d["inspected_official_pages"]]
 for label in ("POTENTIAL_EXACT_INVENTORY_SUBJECT_CHECK_ATTRIBUTION",
               "ACCESSION_MATCH_TITLE_OR_SUBJECT_CONFLICT",
               "TITLE_MATCH_WITHOUT_INVENTORY_REQUIRES_EXACT_OBJECT_CHECK",
               "PAGE_ACCESSIBLE_IDENTITY_NOT_ESTABLISHED",
               "ENDPOINT_NOT_ACCESSIBLE"):
  if label in statuses:
   d["best_result"]=label
   d["proposed_object_url"]=next(p["url"] for p in d["inspected_official_pages"] if p["triage"]==label)
   break
 if rid=="RECENT575::014":d["warnings"].append("Selected Commons title says resurrected Christ but linked Augustins work is Les Âmes du Purgatoire; do not count as exact match without image/identity audit")
 return d
def main():
 rows=list(csv.DictReader(BASE.open(encoding="utf-8-sig",newline="")))
 assert len(rows)==177
 verified={r["registry_id"] for r in rows if r.get("iiif_manifest")}
 verified.add("RECENT575::002")
 for path,field in FILESETS:
  data=json.loads((DIRECTORY/path).read_text(encoding="utf-8"))
  for row in data[field]:
   verified.add(row["registry_id"])
 assert len(verified)==90, f"Expected 90 verified from frozen Phase25 baseline, found {len(verified)}"
 missing=[r for r in rows if r["registry_id"] not in verified]
 assert len(missing)==87
 original=json.loads(P20.read_text(encoding="utf-8"))
 lookup={r["registry_id"]:r for r in original}
 if any(r["registry_id"] not in lookup for r in missing):raise ValueError("Missing provenance for unresolved painting")
 with ThreadPoolExecutor(max_workers=5) as pool:
  futures=[pool.submit(inspect,r,lookup[r["registry_id"]]) for r in missing]
  data=[f.result() for f in as_completed(futures)]
 data.sort(key=lambda d:d["registry_id"])
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"remaining_87_links.json").write_text(json.dumps(data,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 keys=["registry_id","painting","artist","museum","accession_hint","selected_commons","source_text","official_urls",
       "best_result","proposed_object_url","warnings"]
 with (OUT/"remaining_87_links.csv").open("w",encoding="utf-8",newline="") as f:
  writer=csv.DictWriter(f,fieldnames=keys);writer.writeheader()
  writer.writerows([{k:json.dumps(r[k],ensure_ascii=False) if isinstance(r[k],list) else r[k] for k in keys} for r in data])
 triage=collections.Counter(r["best_result"] for r in data)
 count=collections.Counter(r["museum"] for r in data)
 summary={"phase25_identified":90,"unresolved_processed":len(data),
          "unresolved_by_institution":dict(count),"official_url_candidates":sum(bool(r["official_urls"]) for r in data),
          "official_page_fetches":sum(len(r["inspected_official_pages"]) for r in data),
          "accessible_official_pages":sum(sum(p["status"]=="HTML_ACCESSIBLE" for p in r["inspected_official_pages"]) for r in data),
          "triage":dict(triage),
          "new_museum_object_admissions":0,"gallery_replacements":0}
 (OUT/"summary.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 print(json.dumps(summary,indent=2,ensure_ascii=False),flush=True)
if __name__=="__main__":main()
