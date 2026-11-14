#!/usr/bin/env python3
"""B16 strictly named Commons originals. Research ZIPs ONLY; no publication rights granted."""
import argparse,hashlib,html,io,csv,json,re,time,urllib.parse,urllib.request,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
MASTER=ROOT/"data/geography/research/sacred-atlas-b16-124-custodian-exact-file-acquisition-master-20261031.v1.json"
UA="AdOrientemSacredAtlas/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
API="https://commons.wikimedia.org/w/api.php"
MAX=15*1024*1024
SEEDS={
 32:["File:SM Maggiore Roma fc13.jpg","File:SM Maggiore Roma fc14.jpg"],
 33:["File:Holy Robe in Trier.JPG"],
 34:["File:Scala Santa (Rome) 01.jpg","File:Scala Santa Roma Laterano.jpg"],
 60:["File:Châsse du saint Curé d'Ars - mars 2022.JPG","File:Châsse du saint Curé d'Ars - mars 2022 (2).JPG"],
 68:["File:Tombeau de Saint-Martin de Tours.jpg","File:Tours - basilique Saint-Martin, crypte (05).jpg"]
}
def clean(s):return re.sub(r"\s+"," ",html.unescape(re.sub(r"<[^>]*>"," ",s or ""))).strip()
def request(url,binary=False):
 last=None
 for k in range(3):
  try:
   req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"image/jpeg" if binary else "application/json"})
   with urllib.request.urlopen(req,timeout=18) as res:
    if binary:
     if urllib.parse.urlsplit(res.geturl()).hostname!="upload.wikimedia.org":raise ValueError("untrusted image host")
     if int(res.headers.get("Content-Length") or 0)>MAX:raise ValueError("source exceeds 15MiB")
     data=res.read(MAX+1)
     if len(data)>MAX:raise ValueError("source exceeds 15MiB")
     return data
    j=json.loads(res.read(2_000_000))
    if j.get("error"):raise ValueError(str(j["error"])[:150])
    return j
  except Exception as e:
   last=e
   if k<2:time.sleep(k+1)
 raise RuntimeError(str(last))
def commons(title):
 params=dict(action="query",format="json",formatversion="2",maxlag="5",titles=title,prop="imageinfo",
 iiprop="url|size|sha1|mime|extmetadata",iiextmetadatafilter="LicenseShortName|Artist|Credit|LicenseUrl")
 j=request(API+"?"+urllib.parse.urlencode(params))
 pages=j.get("query",{}).get("pages",[])
 return next((x["imageinfo"][0] for x in pages if x.get("title")==title and x.get("imageinfo")),None)
def licence_ok(label):
 s=clean(label).lower()
 return bool(re.match(r"^(cc0|cc by(?:-sa)?)\s*[- ]?[1-4](?:\.0)?",s)) or s in ("public domain","pd-self","pd-author")
def run():
 p=argparse.ArgumentParser()
 p.add_argument("--batch",type=int,choices=(0,1),default=0)
 p.add_argument("--selftest",action="store_true")
 p.add_argument("--out",default="artifacts/atlas-b16")
 a=p.parse_args()
 j=json.loads(MASTER.read_text(encoding="utf-8")); rows=j["records"]
 if len(rows)!=124 or sum(x["protection_existing_USER_KEEP"] for x in rows)!=4:raise ValueError("Canonical queue mismatch")
 if [len(rows[:100]),len(rows[100:])]!=[100,24]:raise ValueError("Batch split mismatch")
 if len(SEEDS)!=5 or sum(len(x) for x in SEEDS.values())!=9:raise ValueError("Seed corpus wrong")
 for n,titles in SEEDS.items():
  rec=next((r for r in rows if r["original_b12_queue_n"]==n),None)
  if not rec:raise ValueError("Missing canonical target "+str(n))
  allowed={x["file_title"] for x in j["file_leads"] if x["n"]==n}
  if any(t not in allowed for t in titles):raise ValueError("Undocumented exact file seed "+str(n))
 if a.selftest:
  print("PASS: 124 IDs, 4 historic KEEP, 5 source-identified subjects, 9 exact-file leads, no generic download",flush=True)
  return
 segment=rows[:100] if a.batch==0 else rows[100:]
 Path(a.out).mkdir(parents=True,exist_ok=True)
 results=[]
 zpath=Path(a.out)/("Atlas_B16_exact_source_originals_%02d.zip"%(a.batch+1))
 with zipfile.ZipFile(zpath,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=5,allowZip64=True) as z:
  for target in segment:
   n=target["original_b12_queue_n"]
   result=dict(queue_n=n,subject_id=target["subject_id"],place_id=target["place_id"],
   label=target["requested_original_subject"],historic_user_KEEP=target["protection_existing_USER_KEEP"],
   attempted_exact_titles=SEEDS.get(n,[]),downloaded_files=[],errors=[],state="NO_EXACT_SOURCE_FILE_SEED",
   identity_approved=False,rights_approved=False,quality_approved=False,editorial_approved=False,published=False)
   if n in SEEDS:
    result["state"]="SOURCE_SEED_METADATA_HOLD"
    for ix,title in enumerate(SEEDS[n]):
     try:
      meta=commons(title)
      if not meta:raise ValueError("Commons file absent")
      ext=meta.get("extmetadata",{})
      license=clean(ext.get("LicenseShortName",{}).get("value",""))
      author=clean(ext.get("Artist",{}).get("value",ext.get("Credit",{}).get("value","")))
      if not licence_ok(license) or min(meta.get("width",0),meta.get("height",0))<1200 or not author or meta.get("mime")!="image/jpeg":
       raise ValueError("Licence/author/dimensions/mime gate failed: "+license)
      binary=request(meta["url"],True)
      if not binary.startswith(b"\xff\xd8\xff"):raise ValueError("Wrong JPEG magic")
      sha1=hashlib.sha1(binary).hexdigest()
      if meta.get("sha1") and sha1!=meta["sha1"].lower():raise ValueError("Commons SHA1 mismatch")
      dest="UNAPPROVED/%03d_%02d_%s"%(n,ix+1,re.sub(r"[^a-zA-Z0-9_.-]","_",title[5:])[:130])
      z.writestr(dest,binary)
      result["downloaded_files"].append(dict(title=title,commons_sha1=sha1,sha256=hashlib.sha256(binary).hexdigest(),
      file_in_zip=dest,bytes=len(binary),pixels=[meta["width"],meta["height"]],
      photographer=author,commons_declared_photo_license=license,underlying_art_rights_cleared=False,
      scene_visual_qa_approved=False,publication_allowed=False,
      scope="HISTORICAL_2012_EXPOSITION_ONLY" if n==33 else "EXACT_OBJECT_RESEARCH_CANDIDATE"))
     except Exception as e:result["errors"].append(title+": "+str(e)[:250])
    if result["downloaded_files"]:result["state"]="UNAPPROVED_EXACT_SOURCE_ORIGINALS_DOWNLOADED"
   results.append(result)
   if n in SEEDS:print(n,result["state"],len(result["downloaded_files"]),flush=True)
  summary=dict(subjects=len(results),source_seed_subjects=sum(bool(x["attempted_exact_titles"]) for x in results),
  original_files=sum(len(x["downloaded_files"]) for x in results),subjects_with_downloaded_originals=sum(bool(x["downloaded_files"]) for x in results),
  zero_download_subjects=sum(not x["downloaded_files"] for x in results),new_user_approvals=0,publications=0)
  z.writestr("manifest.json",json.dumps(dict(schema="AO_ATLAS_B16_SOURCE_VERIFIED_FILES_RESEARCH_V1",stats=summary,rows=results),ensure_ascii=False,indent=2))
  f=io.StringIO();w=csv.writer(f);w.writerow(["queue_n","subject_id","state","downloaded_titles","errors"])
  for r in results:w.writerow([r["queue_n"],r["subject_id"],r["state"],";".join(x["title"] for x in r["downloaded_files"]),";".join(r["errors"])])
  z.writestr("manifest.csv",f.getvalue())
  z.writestr("README.txt","RESEARCH ONLY. No copyright, physical-object identity, photographer attribution adequacy, quality or editorial approval. Historical Trier exposition is not current display.\n")
 (Path(a.out)/("B16_batch_%02d_results.json"%(a.batch+1))).write_text(json.dumps(dict(stats=summary,rows=results),ensure_ascii=False,indent=2),encoding="utf-8")
 print(json.dumps(summary),flush=True)
if __name__=="__main__":run()
