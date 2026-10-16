#!/usr/bin/env python3
"""Discover actual image URLs inside authoritative Lisieux Carmel gallery sections.
Only indexes and exact-subject matching for research; no content release."""
import json,requests,re
from bs4 import BeautifulSoup,Tag
from pathlib import Path
from urllib.parse import urljoin
ROOT=Path(__file__).resolve().parents[2]
OUTPUT=ROOT/"artifacts/sacred-art-w90-carmel"
SITES=[
{"categoryIndices":[25],"subject":"Saint Jean de la Croix","url":"https://archives.carmeldelisieux.fr/environnement-familial/tableaux-et-fusains/tableaux-de-celine-martin/"},
{"categoryIndices":[48,82],"subject":"Thérèse aux Roses","url":"https://archives.carmeldelisieux.fr/naissance-dune-sainte/iconographie-theresienne/tableaux-2/"}
]
def extract(section,base):
 matches=[]
 for elt in section:
  if not isinstance(elt,Tag):continue
  if elt.name in ("h1","h2","h3","h4"):break
  tags=[elt] if elt.name=="img" else list(elt.find_all("img",limit=6))
  for img in tags:
   options=[]
   for k in ("src","data-src","data-lazy-src","data-full-url","data-large_image","srcset"):
    v=img.get(k)
    if v:
     if k=="srcset": v=v.split(",")[-1].strip().split(" ")[0]
     options.append(urljoin(base,v))
   if options:matches.append({"alt":img.get("alt","")[:250],"possibleImageUrls":list(dict.fromkeys(options))[:6]})
 return matches
def main():
 OUTPUT.mkdir(parents=True,exist_ok=True)
 results=[]
 for site in SITES:
  rec=dict(site)
  try:
   r=requests.get(site["url"],timeout=35,headers={"User-Agent":"Mozilla/5.0 (AdOrientemResearch/1.0)"})
   r.raise_for_status()
   soup=BeautifulSoup(r.text,"html.parser")
   terms=site["subject"].lower().replace("é","e")
   headings=[]
   for h in soup.find_all(re.compile("^h[1-5]$")):
    title=h.get_text(" ",strip=True)
    text=title.lower().replace("é","e")
    if terms in text or (site["categoryIndices"]==[25] and "jean de la croix" in text):
     nxt=[]
     for sibling in h.next_elements:
      if sibling is h:continue
      if isinstance(sibling,Tag) and sibling.name in ("h1","h2","h3","h4") and sibling is not h:break
      nxt.append(sibling)
      if len(nxt)>300:break
     headings.append({"heading":title,"images":extract(nxt,site["url"])[:15]})
   rec.update(status="SOURCE_HTML_FETCHED",pageBytes=len(r.content),headingMatches=headings)
  except Exception as e:rec.update(status="FETCH_FAILURE",error=str(e)[:250])
  results.append(rec)
  print("W90_PROBE",site["subject"],rec["status"],sum(len(x["images"]) for x in rec.get("headingMatches",[])),flush=True)
 out={"schema":"AO_SACRED_ART_W90_CARMEL_IMAGE_DISCOVERY_V1","notPublication":True,"sourceCopyrightRequiresPermission":True,"sites":results}
 (OUTPUT/"source-image-candidates.json").write_text(json.dumps(out,ensure_ascii=False,indent=2)+"\n")
 print("W90_COMPLETE",json.dumps({"pages":len(results),"matchingSourceImages":sum(len(x["images"]) for row in results for x in row.get("headingMatches",[]))}),flush=True)
if __name__=="__main__":main()
