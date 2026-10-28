#!/usr/bin/env python3
"""Research-only bulk high-resolution alternative discovery for 24 locked paintings.
Never assumes same painting from title alone, never approves photographer rights, and
never writes artwork masters to Git. Public Wikimedia API only, cost EUR0.
"""
import csv,hashlib,html,io,json,re,time,urllib.parse,urllib.request,urllib.error
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/"data/calendar/sacred-art-approved24-resolution-recovery-20261028.csv"
OUT=ROOT/"artifacts/sacred-art-24-highres-discovery"
OUT.mkdir(parents=True,exist_ok=True)
UA="AdOrientemSourceResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem; no commercial image distribution)"
API="https://commons.wikimedia.org/w/api.php"
STOP={"the","of","and","at","a","in","on","from","saint","st","an","by","to","with","de","la","le","du","el","los","las","our","jpg","pdf","work","art","album"}
EXACT_INVENTORY={
 "ART-ean-estout-entecost": ("INV20303","La Pentecôte, Restout (Louvre INV20303)"),
 "ART-uido-eni-usannah-and-the-lders":("NG196","Susannah and the Elders"),
 "ART-ustache-e-ueur-aint-aul-reaching-at-phesus":("INV8020","La Prédication de saint Paul à Éphèse"),
}
def read(url,limit=4*1024*1024,attempts=2):
 for n in range(attempts):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json,image/jpeg,*/*"})
   with urllib.request.urlopen(req,timeout=40) as r:
    q=urllib.parse.urlparse(r.geturl())
    if q.scheme!="https" or q.hostname not in ("commons.wikimedia.org","upload.wikimedia.org","thumb.wikimedia.org"):
     raise RuntimeError("UNTRUSTED_REDIRECT_"+str(q.hostname))
    result=bytearray()
    while 1:
     b=r.read(131072)
     if not b:return bytes(result)
     result.extend(b)
     if len(result)>limit:raise RuntimeError("OVER_FILE_LIMIT")
  except urllib.error.HTTPError as e:
   if e.code in (429,503) and n+1<attempts:
    time.sleep(6);continue
   raise
 raise RuntimeError("FETCH_FAILED")
def api(params):
 q=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",**params})
 return json.loads(read(API+"?"+q))
def norm(s):
 return re.sub(r"[^a-z0-9 ]+"," ",html.unescape(str(s)).lower()).strip()
def toks(s):
 return set(norm(s).split())-STOP
def title_file(p):
 text=p.strip()
 if text.startswith("File:"):return "File:"+text[5:].replace("_"," ")
 if "/wiki/File:" in text:
  return "File:"+urllib.parse.unquote(text.split("/wiki/File:",1)[1]).replace("_"," ")
 return None
def img_info(page):
 i=(page.get("imageinfo") or [None])[0]
 if not i:return None
 return {"width":i.get("width",0),"height":i.get("height",0),"bytes":i.get("size",0),
         "sha1":i.get("sha1"),"url":i.get("url"),
         "short_licence":re.sub("<[^>]*>","",i.get("extmetadata",{}).get("LicenseShortName",{}).get("value","")),
         "licence_url":i.get("extmetadata",{}).get("LicenseUrl",{}).get("value",""),
         "artist_claim":re.sub("<[^>]*>"," ",i.get("extmetadata",{}).get("Artist",{}).get("value",""))[:250],
         "description":re.sub("<[^>]*>"," ",i.get("extmetadata",{}).get("ImageDescription",{}).get("value",""))[:400]}
def main():
 with SRC.open(encoding="utf8",newline="") as f:rows=list(csv.DictReader(f))
 assert len(rows)==24 and len({x["artwork_id"] for x in rows})==24
 out=[]
 for idx,row in enumerate(rows,1):
  title=row["title"];artist=row["artist"];old=max(int(row["archived_width"]),int(row["archived_height"]))
  # First query source-specific; second uses artist and distinctive subject.
  suffix=norm(artist).split()
  artist_needle=suffix[-1] if suffix else ""
  if artist_needle in ("elder","younger","studio","romano"):artist_needle=(suffix[-2] if len(suffix)>1 else artist_needle)
  subject_words=[w for w in norm(title).split() if w not in STOP and len(w)>3][:4]
  probes=[f'intitle:"{title.replace(chr(34),"")}"', " ".join([artist_needle]+subject_words)]
  if artist_needle in ("unknown","attribution","recorded","after"):probes=[f'intitle:"{title}"']
  record={"order":idx,"artwork_id":row["artwork_id"],"title":title,"artist":artist,
          "current_max_dimension":old,"current_source":row["source_commons"],
          "frozen_artwork_selection_preserved":True,"production_image_approved":False,
          "reference_original_inventory":EXACT_INVENTORY.get(row["artwork_id"]),
          "queries":[],"candidates":[]}
  found={}
  for p in probes:
   try:
    ans=api({"generator":"search","gsrsearch":p,"gsrnamespace":"6","gsrlimit":"15",
             "prop":"imageinfo","iiprop":"size|url|sha1|extmetadata"})
    pages=ans.get("query",{}).get("pages",[])
    record["queries"].append({"query":p,"result_count":len(pages),"error":None})
    for pg in pages:
     if pg.get("missing"):continue
     full=pg.get("title","");inf=img_info(pg)
     if not inf or not inf["width"] or full in found:continue
     if max(inf["width"],inf["height"])<=old:continue
     if max(inf["width"],inf["height"])<2400:continue
     # Explicitly classify all results as unconfirmed originals unless source exact-object evidence exists.
     a=toks(artist);t=toks(title);f=toks(full)
     surname=artist_needle in norm(full)
     overlap=len(t&f)
     aspectOld=int(row["archived_width"])/max(1,int(row["archived_height"]))
     aspectNew=inf["width"]/max(1,inf["height"])
     ratio=max(aspectOld/aspectNew,aspectNew/aspectOld)
     dubious=re.search(r"(?i)detail|cropped|copy|after|study|sketch|preparatory|frame|engraving|print|alternative",full)
     inv,cat=EXACT_INVENTORY.get(row["artwork_id"],(None,None))
     corroborated=bool(inv and inv.lower().replace(" ","") in norm(full+" "+inf["description"]).replace(" ",""))
     quality=(6 if corroborated else 0)+(2 if surname else 0)+min(3,overlap)-(4 if dubious else 0)-(2 if ratio>1.25 else 0)
     found[full]={"file_title":full,"commons_page":"https://commons.wikimedia.org/wiki/"+urllib.parse.quote(full.replace(" ","_"),safe=":/(),_-"),
         "width":inf["width"],"height":inf["height"],"bytes":inf["bytes"],"commons_sha1":inf["sha1"],
         "current_source_long_edge":old,"improvement_factor":round(max(inf["width"],inf["height"])/old,2),
         "original_aspect_ratio_ratio":round(ratio,3),
         "short_license":inf["short_licence"],"license_url":inf["licence_url"],
         "photo_credit_claim":inf["artist_claim"],"image_description_excerpt":inf["description"],
         "same_physical_original_evidence":"EXACT_INVENTORY_TEXT_IN_FILENAME_OR_DESCRIPTION" if corroborated else "NOT_ESTABLISHED_BY_PHOTO_METADATA",
         "requires_frame_free_native_edge_inspection":True,"requires_actual_photo_permission_check":True,
         "detail_or_sketch_or_frame_filename_risk":bool(dubious),
         "priority_score_not_approval":quality,
         "publication_approved":False}
    time.sleep(1.0)
   except Exception as e:
    record["queries"].append({"query":p,"error":type(e).__name__+":"+str(e)[:220]})
    time.sleep(2)
  record["candidates"]=sorted(found.values(),key=lambda z:(z["priority_score_not_approval"],z["improvement_factor"]),reverse=True)[:10]
  record["candidates_at_least_2400_px"]=len(found)
  record["candidate_leads_need_identity_review"]=sum(z["same_physical_original_evidence"]=="NOT_ESTABLISHED_BY_PHOTO_METADATA" for z in record["candidates"])
  if row["artwork_id"]=="ART-ean-estout-entecost":
   # Source is independently confirmed Louvre INV20303 in Commons category and museum.
   exact="Restout - La Pentecôte 01.jpg"
   x=found.get("File:"+exact)
   if x:
    x["same_physical_original_evidence"]="SAME_LOUVRE_INV20303_FROM_INDEPENDENT_COMMONS_AND_MUSEUM_RECORDS"
    x["institution_object"]="Louvre INV20303"
    record["exact_verified_original_lead"]=x["file_title"]
  out.append(record)
  (OUT/"records.json").write_text(json.dumps({"schema":"AO_ART_24_HIGHRES_BULK_DISCOVERY_V1","records":out},indent=2)+"\n",encoding="utf8")
  print("AO_24_DISCOVERY",idx,"/",len(rows),row["artwork_id"],"candidates",len(found),"search_errors",sum(bool(q.get("error")) for q in record["queries"]),flush=True)
  time.sleep(0.75)
 summary={"paintings_screened":len(out),
  "paintings_with_highres_metadata_candidate":sum(bool(x["candidates"]) for x in out),
  "highres_candidate_records":sum(len(x["candidates"]) for x in out),
  "exact_work_verified_candidate_records":sum(sum(c["same_physical_original_evidence"].startswith("SAME_LOUVRE") for c in x["candidates"]) for x in out),
  "candidates_with_licence_metadata":sum(sum(bool(c["short_license"]) for c in x["candidates"]) for x in out),
  "source_page_search_errors":sum(sum(bool(q.get("error")) for q in x["queries"]) for x in out),
  "highres_originals_newly_downloaded":0,"native_frame_free_photos_certified":0,"paintings_changed":0,"photo_publications":0,"spent_eur":0,
  "warning":"A Commons file found by artist/title is only a candidate, not a verified exact physical painting. Even a source with matching accession is not yet a frameless photo signoff."}
 (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf8")
 print("AO_24_SUMMARY",json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
