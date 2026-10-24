#!/usr/bin/env python3
"""B36 preserve museum-accessioned source photos, research only."""
import csv,hashlib,json,time
from pathlib import Path
from PIL import Image
from sacred_art_b29_exact_selected import metadata_for,retrieve
R=Path("data/research")
O=Path("artifacts/b36-museum4")
C=["artwork_id","institution","accession","source_file_page","original_url","current_license","sha256","bytes","width","height","resolution","status","hold","publication_approved","editorial_selected"]
def main():
 m=json.loads((R/"sacred-art-b36-four-accessioned-photo-source-manifest.json").read_text())
 records=m["records"]
 assert len(records)==4 and not m["publication_approved"] and not m["editorial_selected"]
 O.mkdir(parents=True,exist_ok=True)
 (O/"images").mkdir(exist_ok=True)
 Image.MAX_IMAGE_PIXELS=180000000
 out=[];total=0
 for r in records:
  d=O/"images"/(hashlib.sha256(r["artwork_id"].encode()).hexdigest()[:20]+".jpg")
  x=dict.fromkeys(C,"")
  x.update(artwork_id=r["artwork_id"],institution=r["institution"],accession=r["inventory"],source_file_page=r["source_file_page"],original_url=r["source_original_url"],publication_approved="NO",editorial_selected="NO")
  try:
   info=metadata_for(r["source_file_page"])
   x["current_license"]=info["license_short_name"]
   if info["license_short_name"] not in {"Public domain","PD-Art","PD-old","PD-old-100","CC0"}:raise ValueError("Source rights metadata hold")
   if info["mime"]!="image/jpeg":raise ValueError("Not a JPEG")
   if not info["original_url"].startswith("https://upload.wikimedia.org/wikipedia/commons/"):raise ValueError("Unexpected source host")
   sha,size=retrieve(r["source_original_url"],d,120000000)
   x.update(sha256=sha,bytes=size)
   with Image.open(d) as im:im.verify()
   with Image.open(d) as im:w,h=im.size
   x.update(width=w,height=h)
   if (w,h)!=(r["expected_width"],r["expected_height"]):raise ValueError("Frozen source size changed")
   x.update(resolution="LONG_EDGE_2400_PASS" if max(w,h)>=2400 else "RESOLUTION_REVIEW",status="MUSEUM_OBJECT_SOURCE_HASHED_RESEARCH_ONLY")
   total+=size
  except Exception as e:
   d.unlink(missing_ok=True)
   x.update(status="SOURCE_HOLD",hold=type(e).__name__+": "+str(e)[:250])
  out.append(x)
  print("B36_FILE",x["artwork_id"],x["status"],x["hold"],flush=True)
  time.sleep(0.5)
 assert len(out)==4
 with (O/"source-results.csv").open("w",newline="",encoding="utf-8") as f:
  wr=csv.DictWriter(f,fieldnames=C);wr.writeheader();wr.writerows(out)
 ok=[x for x in out if x["status"]=="MUSEUM_OBJECT_SOURCE_HASHED_RESEARCH_ONLY"]
 assert len(ok)==len(list((O/"images").iterdir()))
 summary={"schema":"AO_B36_FOUR_MUSEUM_OBJECT_SOURCES","four_cases_screened":4,"new_source_images":len(ok),"source_holds":4-len(ok),"new_source_bytes":total,"technical_2400_pass":sum(x["resolution"]=="LONG_EDGE_2400_PASS" for x in ok),"resolution_review":sum(x["resolution"]=="RESOLUTION_REVIEW" for x in ok),"editorial_approvals":0,"publication_approvals":0,"frozen_ids_unchanged":True,"remote_archival_verification_required":True}
 (O/"source-summary.json").write_text(json.dumps(summary,indent=2)+"\n")
 print("B36_SUMMARY",json.dumps(summary),flush=True)
if __name__=="__main__":main()
