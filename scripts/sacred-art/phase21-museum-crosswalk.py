#!/usr/bin/env python3
"""Bulk source-only museum crosswalk for Ad Orientem handpicked art.

Uses official Flemish collections / French Joconde metadata. No photographs,
rights grants, app modifications, deployments, or automatic artwork promotion.
"""
import csv,json,re,unicodedata,collections
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
from urllib.parse import urlparse
import requests
from bs4 import BeautifulSoup

ROOT=Path("reference-phase20/metadata_recovery_157.json")
OUT=Path("artifacts/sacred-art-phase21-museum-crosswalk")
ODS="https://data.culture.gouv.fr/api/explore/v2.1/catalog/datasets/base-joconde-extrait/records"
HDR={"User-Agent":"AdOrientemArtResearch/1.0 (read-only historical art research)"}

def normal(s):
 return unicodedata.normalize("NFKD",str(s or "")).encode("ascii","ignore").decode().lower()

def inv(s):
 t=re.split(r"[,;]",str(s or ""),1)[0].strip()
 t=re.sub(r"(?i)^inv[. :]*","",t)
 return t if len(t)>2 and not t.lower().startswith("sa09") else ""

def exact(want,actual):
 parts=re.findall(r"[a-z0-9]+",normal(want))
 if not parts:return False
 pattern=r"(?<![a-z0-9])"+r"[^a-z0-9]*".join(re.escape(v) for v in parts)+r"(?![a-z0-9])"
 return bool(re.search(pattern,normal(actual)))

def get(url,params=None):
 r=requests.get(url,params=params,headers=HDR,timeout=(8,24))
 r.raise_for_status()
 if len(r.content)>3_000_000:raise ValueError("Response >3MB")
 return r

def query_flemish(acc):
 path=acc.upper().replace(".","-").replace("_","-").replace(" ","-")
 url="https://vlaamsekunstcollectie.be/en/collection/"+path
 resp=get(url)
 soup=BeautifulSoup(resp.text,"html.parser")
 raw=soup.get_text(" ",strip=True)
 h=soup.find("h1")
 title=h.get_text(" ",strip=True) if h else ""
 if not exact(acc,raw):return {"status":"HOLD_MUSEUM_ID_NOT_PRESENT","source_url":url}
 manifests=[a.get("href") for a in soup.find_all("a",href=True) if "manifest.json" in a.get("href","")]
 rights="IMAGE_RIGHTS_UNDETERMINED"
 if "Image CC0" in raw:rights="OBJECT_PAGE_CC0_NEEDS_MANIFEST_CHECK"
 elif "Image Public Domain" in raw:rights="OBJECT_PAGE_PD_NEEDS_MANIFEST_CHECK"
 return {"status":"EXACT_INVENTORY_AT_OFFICIAL_MUSEUM","source_url":url,"source_title":title,
         "iiif_manifest":manifests[0] if manifests else "","rights_status":rights}

def query_joconde(acc,row):
 query={'where':'search("'+acc.replace('"','')+'")','limit':20}
 data=get(ODS,query).json()
 if "results" not in data:raise ValueError("Official dataset returned no results array")
 matches=[]
 for item in data["results"]:
  fields={k:str(v) for k,v in item.items()}
  number_values=[v for k,v in fields.items() if ("numero" in k.lower() or "inventaire" in k.lower())]
  if not any(exact(acc,v) for v in number_values):continue
  title="; ".join(v for k,v in fields.items() if "titre" in k.lower())[:170]
  author="; ".join(v for k,v in fields.items() if "auteur" in k.lower())[:170]
  location="; ".join(v for k,v in fields.items() if ("conservation" in k.lower() or "localisation" in k.lower()))[:170]
  ref=fields.get("reference") or fields.get("ref") or ""
  matches.append({"source_url":"https://pop.culture.gouv.fr/notice/joconde/"+ref if ref else "",
                  "source_title":title,"source_artist":author,"source_holding":location,
                  "source_accession":number_values[0],"rights_status":"JOCONDE_IMAGE_NOT_LICENSED_BY_OPEN_DATA"})
 if len(matches)==1:
  out=matches[0]
  place=row["recorded_holding_museum"].split("·")[-1].strip()
  if location and normal(place) in normal(location):
   out["status"]="EXACT_ACCESSION_HOLDING_MATCH_ARTIST_REVIEW"
  else:out["status"]="ACCESSION_MATCH_HOLDING_UNCONFIRMED"
  return out
 if len(matches)>1:return {"status":"MULTIPLE_ACCESSION_MATCHES","note":str(len(matches))+" matches need disambiguation"}
 return {"status":"NO_JOCONDE_EXACT_HIT"}

def check(row):
 out={"registry_id":row["registry_id"],"painting":row["title"],"artist":row["artist"],
      "museum":row["recorded_holding_museum"],"accession_clue":row.get("accession_field",""),
      "institutional_url_clue":row.get("candidate_direct_museum_url",""),
      "source_url":"","source_title":"","source_artist":"","source_holding":"",
      "source_accession":"","iiif_manifest":"","rights_status":"NOT_ASSESSED",
      "status":"NO_ACTIONABLE_ACCESSION","note":"","published":False}
 acc=inv(row.get("accession_field",""))
 if not acc:
  if out["institutional_url_clue"]:out["status"]="INSTITUTION_URL_NEEDS_OBJECT_CHECK"
  return out
 try:
  if acc.upper().startswith("0000.GRO") or acc.upper().startswith("0000-GRO"):
   out.update(query_flemish(acc))
  elif any(x in row["recorded_holding_museum"] for x in ("Musée","Palais","Petit")):
   out.update(query_joconde(acc,row))
  else:out["status"]="PROVIDER_NOT_COVERED"
 except Exception as exc:
  out["status"]="ENDPOINT_ERROR";out["note"]=str(exc)[:240]
 return out

def main():
 rows=json.loads(ROOT.read_text(encoding="utf-8"))
 assert len(rows)==157 and len(set(r["registry_id"] for r in rows))==157
 with ThreadPoolExecutor(max_workers=4) as pool:
  results=[f.result() for f in as_completed([pool.submit(check,r) for r in rows])]
 results.sort(key=lambda r:r["registry_id"])
 OUT.mkdir(parents=True,exist_ok=True)
 (OUT/"crosswalk_157.json").write_text(json.dumps(results,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
 keys=list(results[0].keys())
 with (OUT/"crosswalk_157.csv").open("w",encoding="utf-8",newline="") as f:
  w=csv.DictWriter(f,fieldnames=keys);w.writeheader();w.writerows(results)
 status=dict(collections.Counter(r["status"] for r in results))
 summary={"records":len(results),"accession_leads":sum(bool(inv(r["accession_clue"])) for r in results),
          "status":status,"downloaded_photographs":0,"gallery_replacements":0}
 (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
 print(json.dumps(summary,indent=2))
if __name__=="__main__":main()
