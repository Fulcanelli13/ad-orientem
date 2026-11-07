#!/usr/bin/env python3
"""Phase 44B: compare all 23 handpicked Commons selections against Phase44 museum previews.
Research only: no approval from a match, and no new Commons files admitted.
"""
from __future__ import annotations
import csv,hashlib,io,json,re,urllib.parse,time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from collections import Counter
import cv2,numpy as np,requests
from PIL import Image,ImageOps

SRC=Path("scripts/sacred-art/artworks_177.csv")
PREV=Path("reference-phase44")
OUT=Path("artifacts/sacred-art-phase44b-selected-reference-compare")
IMAGES=OUT/"selected_references";IMAGES.mkdir(parents=True,exist_ok=True)
BOARDS=OUT/"comparison_previews";BOARDS.mkdir(parents=True,exist_ok=True)
IDS=["014","051","092","179","184","279","330","369","392","394","407","409","410",
     "418","425","430","433","450","484","486","487","506","518"]
UA={"User-Agent":"AdOrientemSacredArtResearch/1.1 (noncommercial provenance check; GitHub Fulcanelli13/ad-orientem)",
    "Accept":"image/jpeg,image/png,image/webp,application/json,*/*;q=0.5"}
def get_image(url):
    r=requests.get(url,headers=UA,timeout=(8,32),stream=True,allow_redirects=True)
    if r.status_code!=200: raise ValueError(f"HTTP_{r.status_code}")
    if urllib.parse.urlsplit(r.url).hostname not in ("upload.wikimedia.org","commons.wikimedia.org"):
        raise ValueError("Unexpected file location")
    parts=[];size=0
    for b in r.iter_content(65536):
        size+=len(b)
        if size>12_000_000:raise ValueError("Reference exceeds 12 MB")
        parts.append(b)
    b=b"".join(parts)
    if b[:4] not in (b"\xff\xd8\xff\xe0",b"\xff\xd8\xff\xe1",b"\x89PNG"):
        # TIFF, JPEG variation or WebP: let Pillow validate if type not obvious
        pass
    im=Image.open(io.BytesIO(b)); im.verify()
    return b
def original_url(title):
    # Wikimedia media repo path is MD5 of canonical underscores-normalized title.
    filename=title.removeprefix("File:").replace(" ","_")
    h=hashlib.md5(filename.encode("utf-8")).hexdigest()
    return f"https://upload.wikimedia.org/wikipedia/commons/{h[0]}/{h[:2]}/{urllib.parse.quote(filename,safe='()_-')}"
def get_reference(row):
    filename=urllib.parse.unquote(urllib.parse.urlsplit(row["commons_url"]).path.split("/wiki/",1)[-1])
    if not filename.startswith("File:"):raise ValueError("Not original handpicked Commons File")
    direct=original_url(filename)
    fallback="https://commons.wikimedia.org/wiki/Special:FilePath/"+urllib.parse.quote(filename.removeprefix("File:").replace(" ","_"),safe="()_-")
    errors=[]
    for method,url in (("CANONICAL_WIKIMEDIA_UPLOAD_HASH_PATH",direct),("COMMONS_SPECIAL_FILEPATH",fallback)):
        try:
            b=get_image(url)
            name=row["registry_id"].split("::")[-1]+".img"
            im=Image.open(io.BytesIO(b))
            ext=".png" if im.format=="PNG" else ".jpg" if im.format=="JPEG" else ".webp"
            dest=IMAGES/(row["registry_id"].replace(":","_")+ext)
            dest.write_bytes(b)
            return {"status":"FETCHED","method":method,"url":url,
                 "width":im.width,"height":im.height,"sha256":hashlib.sha256(b).hexdigest(),
                 "path":str(dest),"bytes":len(b),"errors_before_success":errors}
        except Exception as e:
            errors.append(f"{method}:{str(e)[:120]}")
    return {"status":"REFERENCE_UNAVAILABLE","errors":errors}
def gray(path):
    im=np.fromfile(str(path),np.uint8)
    pic=cv2.imdecode(im,cv2.IMREAD_GRAYSCALE)
    if pic is None:raise ValueError("Image could not be decoded")
    h,w=pic.shape
    scale=min(1.,1200/max(h,w))
    if scale<1:pic=cv2.resize(pic,(round(w*scale),round(h*scale)),interpolation=cv2.INTER_AREA)
    return cv2.equalizeHist(pic)
def compare(selected,preview):
    a,b=gray(selected),gray(preview)
    sift=cv2.SIFT_create(nfeatures=3200)
    ka,da=sift.detectAndCompute(a,None);kb,db=sift.detectAndCompute(b,None)
    ret={"inliers":0,"ratio_good":0,"ratio_inliers":0.0,"selected_coverage":0.0,
         "candidate_coverage":0.0,"status":"INCONCLUSIVE_NO_MATCH"}
    if da is None or db is None:return ret
    knn=cv2.BFMatcher(cv2.NORM_L2).knnMatch(da,db,k=2)
    good=[m for m,n in knn if m.distance<.72*n.distance]
    ret["ratio_good"]=len(good)
    if len(good)<10:return ret
    src=np.float32([ka[m.queryIdx].pt for m in good]).reshape(-1,1,2)
    dst=np.float32([kb[m.trainIdx].pt for m in good]).reshape(-1,1,2)
    H,mask=cv2.findHomography(src,dst,cv2.RANSAC,4.5,maxIters=4000,confidence=.995)
    if H is None:return ret
    ok=mask.ravel().astype(bool)
    count=int(ok.sum()); ret["inliers"]=count
    ret["ratio_inliers"]=round(count/len(good),4)
    def span(points,shape):
        if len(points)<5:return 0.0
        p=points.reshape(-1,2)
        dx=np.percentile(p[:,0],95)-np.percentile(p[:,0],5)
        dy=np.percentile(p[:,1],95)-np.percentile(p[:,1],5)
        return max(0.0,float(dx*dy/(shape[0]*shape[1])))
    ret["selected_coverage"]=round(span(src[ok],a.shape),4)
    ret["candidate_coverage"]=round(span(dst[ok],b.shape),4)
    if count>=35 and ret["ratio_inliers"]>=.5 and ret["selected_coverage"]>=.05 and ret["candidate_coverage"]>=.05:
        ret["status"]="SAME_PAINTING_GEOMETRICALLY_SUPPORTED_REVIEW_ONLY"
    elif count>=15 and ret["ratio_inliers"]>=.35 and ret["selected_coverage"]>=.02:
        ret["status"]="POSSIBLE_MATCH_REQUIRES_MANUAL_REVIEW"
    return ret
def board(ref,preview,dest):
    canvas=Image.new("RGB",(1250,660),(244,242,238))
    for i,p in enumerate((ref,preview)):
        pic=ImageOps.exif_transpose(Image.open(p)).convert("RGB");pic.thumbnail((600,620))
        canvas.paste(pic,(i*625+(625-pic.width)//2,15+(620-pic.height)//2))
    canvas.save(dest,quality=86)
def main():
    data=json.loads((PREV/"evidence_23.json").read_text(encoding="utf-8"))
    src={r["registry_id"]:r for r in csv.DictReader(SRC.open(encoding="utf-8-sig",newline=""))}
    assert len(data)==23 and len(src)==177
    assert set(x["registry_id"] for x in data)=={f"RECENT575::{i}" for i in IDS}
    results=[]
    # Controlled concurrency: this is the exact Wikimedia user-selected photo, not a substitute.
    with ThreadPoolExecutor(max_workers=2) as pool:
        selected=list(pool.map(get_reference,[src[x["registry_id"]] for x in data]))
    for item,ref in zip(data,selected):
        rid=item["registry_id"]
        can=[]
        for p in sorted((PREV/"previews").glob(rid.split("::")[1]+"_*.jpg")):
            cand_meta=None
            name=p.name
            official=item["official"]
            if "_museum" in name:cand_meta=official.get("image")
            else:
                m=re.search(r"official(\d+)",name)
                if m:
                    idx=int(m.group(1))
                    if idx < len(official.get("image_candidates",[])):
                        cand_meta=official["image_candidates"][idx].get("probe")
            if not cand_meta or cand_meta.get("status")!="FETCHED_RESEARCH_ONLY":continue
            if ref["status"]=="FETCHED":
                score=compare(ref["path"],p)
            else:score={"status":"NO_SELECTED_REFERENCE_BYTES","inliers":0}
            if score["status"]=="SAME_PAINTING_GEOMETRICALLY_SUPPORTED_REVIEW_ONLY":
                if (min(cand_meta["width"],cand_meta["height"])<=min(ref["width"],ref["height"])):
                    score["resolution_note"]="SAME_PAINTING_NO_PROVEN_RESOLUTION_UPGRADE"
                else:score["resolution_note"]="MUSEUM_PHOTO_HAS_GREATER_NATIVE_PIXEL_EDGE"
                board(ref["path"],p,BOARDS/(rid.replace(":","_")+"_"+name))
            can.append({"candidate_filename":name,"source":cand_meta.get("url"),"candidate_px":[cand_meta.get("width"),cand_meta.get("height")],
                        "score":score,"rights_cleared":False,"crop_color_approved":False,"release_approved":False})
        results.append({"registry_id":rid,"title":item["title"],"selected_reference":ref,
             "candidate_comparisons":can,"strong_same_painting_candidates":sum(
                c["score"]["status"]=="SAME_PAINTING_GEOMETRICALLY_SUPPORTED_REVIEW_ONLY" for c in can),
             "best_candidate":max(can,key=lambda c:c["score"].get("inliers",0)) if can else None,
             "photo_rights_cleared":False,"gallery_change":False})
        print(rid,ref["status"],len(can),results[-1]["strong_same_painting_candidates"],flush=True)
    summary={"records":len(results),"selected_original_downloaded":sum(r["selected_reference"]["status"]=="FETCHED" for r in results),
        "candidate_comparisons":sum(len(r["candidate_comparisons"]) for r in results),
        "artworks_with_geometric_support":sum(r["strong_same_painting_candidates"]>0 for r in results),
        "strong_candidates":sum(r["strong_same_painting_candidates"] for r in results),
        "reference_unavailable":sum(r["selected_reference"]["status"]!="FETCHED" for r in results),
        "actual_publication_replacements":0,"photo_rights_cleared":0,
        "note":"SIFT/RANSAC finds same-painting candidates but not photo rights, exact source attribution, color fidelity, crop acceptability or owner editorial approval."}
    (OUT/"comparisons_23.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    (OUT/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,ensure_ascii=False,indent=2),flush=True)
if __name__=="__main__":main()
