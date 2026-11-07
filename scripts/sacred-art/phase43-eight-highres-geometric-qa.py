#!/usr/bin/env python3
"""Phase43: bounded high-resolution visual QA on eight owner-selected museum candidates.
No gallery or original edits. Metrics are diagnostics, never automatic photo approvals.
"""
import csv, hashlib, io, json, re, time
from pathlib import Path
from urllib.parse import urlsplit
import cv2, numpy as np, requests
from PIL import Image,ImageOps
ROOT=Path("reference-phase42/images")
OUT=Path("artifacts/sacred-art-phase43-eight-highres")
IMG=OUT/"images";IMG.mkdir(parents=True,exist_ok=True)
IDS=["004","018","020","021","025","026","054","072"]
CANVAS={"020":5}
CSV=Path("scripts/sacred-art/artworks_177.csv")
HOSTS={"iiif.kmska.be","imagehub.mskgent.be"}
HEAD={"User-Agent":"AdOrientemArtResearch/1.1 (read-only artwork photo quality research)"}
def safe(url):
 p=urlsplit(url or "")
 return p.scheme=="https" and p.hostname in HOSTS
def get(url,max_bytes=16000000):
 if not safe(url):raise ValueError("not an allowlisted official IIIF URL "+str(url)[:140])
 with requests.get(url,headers=HEAD,timeout=(8,50),allow_redirects=False,stream=True) as r:
  r.raise_for_status()
  parts=[];size=0
  for chunk in r.iter_content(65536):
   size+=len(chunk)
   if size>max_bytes:raise ValueError("download over bounded 16MB")
   parts.append(chunk)
 return b"".join(parts)
def canvas_details(manifest,index):
 c=(manifest.get("items") or (manifest.get("sequences") or [{}])[0].get("canvases") or [])[index]
 if c.get("images"):
  b=c["images"][0].get("resource") or {}
 else:
  page=(c.get("items") or [{}])[0];b=(page.get("items") or [{}])[0].get("body") or {}
  if isinstance(b,list):b=b[0]
 sv=b.get("service") or []
 if isinstance(sv,dict):sv=[sv]
 service=next((x.get("id") or x.get("@id") for x in sv if isinstance(x,dict) and (x.get("id") or x.get("@id"))),None)
 url=b.get("id") or b.get("@id")
 rights=[]
 for part in [manifest,c,b]:
  rights.extend([str(part.get(k)) for k in ("rights","license") if part.get(k)])
 for entry in (c.get("metadata") or []):
  if str(entry.get("label","")).strip().lower() in {"droits","copyright","rights","license"}:rights.append(str(entry.get("value","")))
 return c,service,url,rights
def photo(path):
 return cv2.imdecode(np.fromfile(str(path),dtype=np.uint8),cv2.IMREAD_COLOR)
def size_to(image,max_dim=1200):
 h,w=image.shape[:2];scale=min(1.,max_dim/max(h,w))
 if scale<1: image=cv2.resize(image,(round(w*scale),round(h*scale)),interpolation=cv2.INTER_AREA)
 return image
def compare(selected,candidate):
 selected=size_to(selected)
 candidate=size_to(candidate)
 a=cv2.equalizeHist(cv2.cvtColor(selected,cv2.COLOR_BGR2GRAY))
 b=cv2.equalizeHist(cv2.cvtColor(candidate,cv2.COLOR_BGR2GRAY))
 detector=cv2.SIFT_create(nfeatures=3500)
 kp1,d1=detector.detectAndCompute(a,None);kp2,d2=detector.detectAndCompute(b,None)
 rec={"selected_preview_size":[selected.shape[1],selected.shape[0]],"museum_preview_size":[candidate.shape[1],candidate.shape[0]],"homography_inliers":0,"inlier_ratio":0.0,
      "overlap_coverage_selected":0.0,"delta_e76_median_noncalibrated":None,
      "brightness_difference_luma":None,"quality_gates":["PHOTO_RIGHTS_PENDING","HUMAN_FULL_RES_VISUAL_REVIEW_PENDING"]}
 if d1 is None or d2 is None:return rec
 pairs=cv2.BFMatcher(cv2.NORM_L2).knnMatch(d1,d2,k=2)
 good=[m for m,n in pairs if m.distance <.72*n.distance]
 if len(good)<10:return rec
 src=np.float32([kp1[m.queryIdx].pt for m in good]).reshape(-1,1,2)
 dst=np.float32([kp2[m.trainIdx].pt for m in good]).reshape(-1,1,2)
 H,mask=cv2.findHomography(src,dst,cv2.RANSAC,4.,maxIters=5000,confidence=.997)
 if H is None or mask is None:return rec
 n=int(mask.sum());rec["homography_inliers"]=n;rec["inlier_ratio"]=round(n/len(good),4)
 if n<18:return rec
 # Warp museum into selected image coordinates and measure only valid common pixels.
 inv=np.linalg.inv(H)
 sh,sw=selected.shape[:2]
 warped=cv2.warpPerspective(candidate,inv,(sw,sh))
 valid=cv2.warpPerspective(np.full(candidate.shape[:2],255,np.uint8),inv,(sw,sh))>250
 border=round(min(sw,sh)*.03)
 if border>0:valid[:border]=False;valid[-border:]=False;valid[:,:border]=False;valid[:,-border:]=False
 rec["overlap_coverage_selected"]=round(float(valid.mean()),4)
 if valid.sum()<5000:return rec
 lab1=cv2.cvtColor(selected,cv2.COLOR_BGR2LAB).astype(np.float32)
 lab2=cv2.cvtColor(warped,cv2.COLOR_BGR2LAB).astype(np.float32)
 # OpenCV Lab units: L* x 255/100, a and b offset 128.
 diff=lab1-lab2
 diff[:,:,0]*=(100/255)
 rec["delta_e76_median_noncalibrated"]=round(float(np.median(np.sqrt((diff[:,:,0]**2)+diff[:,:,1]**2+diff[:,:,2]**2)[valid])),2)
 l1=cv2.cvtColor(selected,cv2.COLOR_BGR2GRAY)
 l2=cv2.cvtColor(warped,cv2.COLOR_BGR2GRAY)
 rec["brightness_difference_luma"]=round(float(l2[valid].mean()-l1[valid].mean()),2)
 rec["selected_luma_mean"]=round(float(l1[valid].mean()),2)
 rec["museum_luma_mean"]=round(float(l2[valid].mean()),2)
 if rec["overlap_coverage_selected"]<.65:
  rec["quality_gates"].append("CROP_OR_FRAME_VARIANCE")
 if rec["delta_e76_median_noncalibrated"]>15:
  rec["quality_gates"].append("TONAL_DIFFERENCE_REQUIRES_VISUAL_REVIEW")
 return rec
def main():
 rows={r["registry_id"].split("::")[-1]:r for r in csv.DictReader(CSV.open(encoding="utf-8-sig",newline=""))}
 assert len(rows)==177 and all(v in rows for v in IDS)
 output=[]
 for id in IDS:
  selected=ROOT/f"RECENT575__{id}_selected.jpg"
  previous=ROOT/f"RECENT575__{id}_museum.jpg"
  row=rows[id]
  rec={"registry_id":row["registry_id"],"selected_title":row["title"],"artist":row["artist"],"museum":row["museum"],
       "museum_object_url":row["museum_object_url"],"manifest":row["iiif_manifest"],
       "original_photo_preserved":True,"image_replaced":False,"publication_approved":False,
       "selected_file_available":selected.exists(),"previous_photo_available":previous.exists(),"selected_current_px":None,
       "native_canvas_px":None,"downloaded_highres_px":None,"IIIF_canvas_index":CANVAS.get(id,0),
       "museum_highres_download":"NOT_STARTED","image_rights_status":"REVIEW_REQUIRE_EXACT_PHOTO"}
  try:
   assert selected.exists() and previous.exists()
   r=json.loads(get(row["iiif_manifest"],2500000).decode("utf8"))
   c,service,url,rights=canvas_details(r,rec["IIIF_canvas_index"])
   rec["native_canvas_px"]=[c.get("width"),c.get("height")]
   rec["manifest_rights"]=rights
   rec["selected_current_px"]=list(Image.open(selected).size)
   if not service:raise ValueError("No image service for high resolution")
   if not safe(service):raise ValueError("Unapproved image service URL")
   # IIIF 2 and 3 both support width, to a bounded 3200px image. Not raw native resolution.
   imageurl=service.rstrip("/")+"/full/3200,/0/default.jpg"
   b=get(imageurl)
   im=Image.open(io.BytesIO(b));im.verify()
   dest=IMG/f"RECENT575__{id}_museum_3200.jpg"
   dest.write_bytes(b)
   rec["highres_sha256"]=hashlib.sha256(b).hexdigest()
   rec["downloaded_highres_px"]=list(Image.open(dest).size)
   rec["museum_highres_download"]="SUCCESS"
   old=photo(selected);new=photo(dest)
   rec["QA"]=compare(old,new)
   # Compact 800 px visual board, do not alter source bytes or generate color corrections.
   imgs=[]
   for f in [selected,dest]:
    i=ImageOps.exif_transpose(Image.open(f)).convert("RGB")
    i.thumbnail((760,740))
    imgs.append(i)
   out=Image.new("RGB",(2*780,800),(245,244,240))
   for k,i in enumerate(imgs):out.paste(i,(k*780+(780-i.width)//2,20+(740-i.height)//2))
   out.save(IMG/f"RECENT575__{id}_comparison.jpg",quality=85)
  except Exception as e:
   rec["museum_highres_download"]="FAILED";rec["error"]=str(e)[:250]
  print(id,rec["museum_highres_download"],rec.get("downloaded_highres_px"),rec.get("error",""),flush=True)
  output.append(rec)
 (OUT/"qa_8.json").write_text(json.dumps(output,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
 cols=["registry_id","selected_title","selected_current_px","native_canvas_px","downloaded_highres_px",
       "museum_highres_download","homography_inliers","overlap_coverage_selected",
       "delta_e76_median_noncalibrated","brightness_difference_luma","image_rights_status","publication_approved","error"]
 with (OUT/"qa_8.csv").open("w",encoding="utf8",newline="") as f:
  w=csv.DictWriter(f,fieldnames=cols);w.writeheader()
  for r in output:
   m=r.get("QA",{})
   w.writerow({k: (json.dumps(r.get(k)) if isinstance(r.get(k),(list,dict)) else r.get(k)) if k in r
               else m.get(k) for k in cols})
 summary={"records":8,"successful_highres_photos":sum(r["museum_highres_download"]=="SUCCESS" for r in output),
          "measured_pairs":sum((r.get("QA") or {}).get("delta_e76_median_noncalibrated") is not None for r in output),
          "native_original_not_guaranteed":True,"image_rights_approvals":0,"photographic_editorial_approvals":0,
          "gallery_replacements":0,"source_run":"Phase42 actual selected originals and official institution IIIF images"}
 (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf8")
 print(json.dumps(summary,indent=2),flush=True)
if __name__=="__main__":main()
