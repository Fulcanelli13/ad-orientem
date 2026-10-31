#!/usr/bin/env python3
"""Research-only Wikimedia Commons original-image acquisition; never publish."""
import argparse,csv,hashlib,html,io,json,re,time,urllib.parse,urllib.request,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
B12=ROOT/"data/geography/research/sacred-atlas-b12-147-unacquired-source-priority-queue-20261031.v1.json"
B14=ROOT/"tools/sacred-atlas-b14-bulk-photo-retriever.html"
API="https://commons.wikimedia.org/w/api.php"
UA="AdOrientemSacredAtlas/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
MAXBYTES=15*1024*1024
STOP=set("the of with from for lady our saint saints shrine church cathedral basilica basilique sanctuary chapel original relic relics at in la le du des de di and mary notredame".split())
def plain(v): return re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]*>"," ",v or ""))).strip()
def toks(v):
 import unicodedata
 v=unicodedata.normalize("NFKD",plain(v)).lower()
 return set(z for z in re.findall(r"[a-z0-9]+","".join(c for c in v if not unicodedata.combining(c))) if len(z)>2 and z not in STOP)
def source():
 rows=json.loads(B12.read_text())["targets"];s=B14.read_text()
 match=re.search(r"const TARGETS=(\[.*?\]);",s)
 blocks=re.search(r"const BLOCKED_MISMATCHES=new Set\((\[.*?\])\);",s)
 if not match or not blocks: raise ValueError("Missing B14 source identifiers")
 seeds={x["id"]:x for x in json.loads(match.group(1))}
 banned=set(json.loads(blocks.group(1)))
 if len(rows)!=147 or len(seeds)!=147 or len(set(r["subject_id"] for r in rows))!=147: raise ValueError("Canonical ID count failed")
 if sum(bool(r["previous_approval_protected"]) for r in rows)!=8: raise ValueError("Historic KEEP decision count changed")
 if any(r["subject_id"] not in seeds for r in rows): raise ValueError("B12/B14 immutable subject ID crosswalk mismatch")
 return rows,seeds,banned
def get(url,as_json=False):
 last=None
 for attempt in range(3):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"application/json" if as_json else "image/jpeg"})
   with urllib.request.urlopen(req,timeout=16) as r:
    if as_json:
     j=json.loads(r.read(2_000_000))
     if j.get("error"): raise ValueError(str(j["error"])[:200])
     return j
    if urllib.parse.urlsplit(r.geturl()).hostname!="upload.wikimedia.org": raise ValueError("Unexpected image host")
    if int(r.headers.get("Content-Length") or 0)>MAXBYTES: raise ValueError("Original exceeds 15MiB")
    chunks=[];size=0
    while 1:
     part=r.read(128*1024)
     if not part: break
     size+=len(part)
     if size>MAXBYTES: raise ValueError("Original exceeds 15MiB")
     chunks.append(part)
    return b"".join(chunks)
  except Exception as e:
   last=e
   if attempt<2: time.sleep(1.5*(attempt+1))
 raise RuntimeError(str(last))
def api(**params):
 q={"action":"query","format":"json","formatversion":"2","maxlag":"5"}
 q.update(params)
 return get(API+"?"+urllib.parse.urlencode(q),True)
def lookup(titles):
 return [p for p in api(titles="|".join(titles),prop="imageinfo",iiprop="url|size|sha1|mime|extmetadata",
 iiextmetadatafilter="LicenseShortName|LicenseUrl|Artist|Credit|ImageDescription|ObjectName|UsageTerms").get("query",{}).get("pages",[]) if p.get("imageinfo")]
def compatible(x):
 x=plain(x).lower()
 return bool(re.match(r"^cc\s*(0|by(?:-sa)?)\s*[- ]?[1-4](?:\.0)?",x)) or x in ("public domain","pd-self")
def candidates(target,seed,blocked):
 chosen=[s for s in seed.get("seeds",[]) if s.startswith("File:") and s not in blocked][:2]
 found=[];errors=[]
 for title in chosen:
  try:found+=lookup([title])
  except Exception as e:errors.append("seed "+str(e)[:160])
 if not found:
  for query in [target["subject_title"]+" "+target["site"],target["subject_title"]]:
   try:
    titles=[p["title"] for p in api(list="search",srnamespace="6",srlimit="6",srsearch=query[:120]).get("query",{}).get("search",[]) if p.get("title","").startswith("File:")]
    for name in titles:
     if name not in blocked:found+=lookup([name])
     if len(found)>=6:break
    if found:break
   except Exception as e:errors.append("search "+str(e)[:160])
 out=[]
 for p in found:
  title=p["title"];i=p["imageinfo"][0];m=i.get("extmetadata",{})
  lic=plain(m.get("LicenseShortName",{}).get("value",m.get("UsageTerms",{}).get("value","")))
  author=plain(m.get("Artist",{}).get("value",m.get("Credit",{}).get("value","")))
  desc=plain(m.get("ImageDescription",{}).get("value",""))[:500]
  need=toks(target["subject_title"]+" "+target["site"])
  match=len(need & toks(title+" "+desc))/max(1,len(need))
  seedmatch=title in chosen
  ok=compatible(lic) and i.get("mime")=="image/jpeg" and min(i.get("width",0),i.get("height",0))>=1200 and bool(author) and (seedmatch or match>=0.15)
  out.append(dict(title=title,commons_page="https://commons.wikimedia.org/wiki/"+urllib.parse.quote(title.replace(" ","_")),
  original_url=i.get("url"),commons_sha1=i.get("sha1"),width=i.get("width"),height=i.get("height"),
  license_declaration=lic,author=author,description=desc,seed_match=seedmatch,text_match=round(match,3),eligible_metadata=ok))
 out.sort(key=lambda x:(not x["eligible_metadata"],not x["seed_match"],-x["text_match"]))
 return out,errors
def main():
 p=argparse.ArgumentParser()
 p.add_argument("--chunk",type=int,choices=range(6),default=0)
 p.add_argument("--out",default="artifacts/atlas-b15")
 p.add_argument("--selftest",action="store_true")
 a=p.parse_args()
 rows,seeds,blocked=source()
 if a.selftest:
  assert [len(rows[i:i+25]) for i in range(0,147,25)]==[25,25,25,25,25,22]
  assert all(not t["file_downloaded"] for t in rows)
  print("PASS 147 IDs, 8 KEEP, 6 batches, 0 publication",flush=True)
  return
 subset=rows[a.chunk*25:(a.chunk+1)*25];Path(a.out).mkdir(parents=True,exist_ok=True)
 archive=Path(a.out)/("AO_SacredAtlas_B15_research_originals_%02d.zip"%(a.chunk+1))
 records=[]
 with zipfile.ZipFile(archive,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=5,allowZip64=True) as z:
  for t in subset:
   n=t["queue_n"]
   row=dict(queue_n=n,subject_id=t["subject_id"],place_id=t["place_id"],title=t["subject_title"],
   existing_user_KEEP_preserved=t["previous_approval_protected"],state="UNRESOLVED",candidates=[],errors=[],
   original_binary_downloaded=False,original_sha256=None,identity_verified=False,underlying_art_rights_cleared=False,
   visual_quality_approved=False,editorial_approved=False,published=False)
   try:
    c,err=candidates(t,seeds[t["subject_id"]],blocked);row["candidates"]=c;row["errors"]+=err
    eligible=next((x for x in c if x["eligible_metadata"] and x["original_url"]),None)
    if eligible:
     binary=get(eligible["original_url"])
     if not binary.startswith(b"\xff\xd8\xff"):raise ValueError("Not JPEG")
     if eligible["commons_sha1"] and hashlib.sha1(binary).hexdigest().lower()!=eligible["commons_sha1"].lower():
      raise ValueError("Original SHA1 differs from Commons metadata")
     name=re.sub("[^A-Za-z0-9._-]","_",eligible["title"].replace("File:",""))[:140]
     path="unapproved/%03d_%s"%(n,name)
     z.writestr(path,binary)
     row.update(state="UNAPPROVED_ORIGINAL_ACQUIRED",original_binary_downloaded=True,
     original_sha256=hashlib.sha256(binary).hexdigest(),archive_path=path,
     downloaded_file_title=eligible["title"],actual_bytes=len(binary))
    elif c:row["state"]="METADATA_HOLD"
   except Exception as e:
    row["state"]="DOWNLOAD_OR_SEARCH_FAILURE";row["errors"].append(str(e)[:300])
   records.append(row)
   print(n,row["state"],flush=True)
  stats=dict(chunk=a.chunk+1,targets=len(records),acquired=sum(bool(r["original_binary_downloaded"]) for r in records),
  unresolved=sum(not r["original_binary_downloaded"] for r in records),approved=0,published=0)
  z.writestr("manifest.json",json.dumps(dict(schema="AO_ATLAS_B15_UNAPPROVED_BINARY_ACQUISITION_V1",stats=stats,records=records),ensure_ascii=False,indent=2))
  s=io.StringIO();w=csv.writer(s);w.writerow(["queue_n","subject_id","state","downloaded_file_title","sha256","error"])
  for r in records:w.writerow([r["queue_n"],r["subject_id"],r["state"],r.get("downloaded_file_title",""),r.get("original_sha256",""),"; ".join(r["errors"])])
  z.writestr("manifest.csv",s.getvalue())
  z.writestr("README.txt","RESEARCH ONLY. No object identity, modern-art/heritage rights, crop, or user approval certified. DO NOT PUBLISH.")
 (Path(a.out)/("chunk_%02d.json"%(a.chunk+1))).write_text(json.dumps(dict(stats=stats,records=records),ensure_ascii=False,indent=2))
 print(json.dumps(stats),flush=True)
if __name__=="__main__":main()
