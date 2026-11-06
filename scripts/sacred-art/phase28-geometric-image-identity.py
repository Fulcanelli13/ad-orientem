#!/usr/bin/env python3
"""Research-only crop/frame-tolerant exact-image audit for prior Sacred Art batches.

Reprocesses actual image bytes from five GitHub research artifacts. Uses local
SIFT + geometric consistency. A feature match is evidence of photo identity,
NEVER a licence, publication clearance, or permission to remove handpicks.
No public app code or curated images are touched.
"""
import csv, json, re, hashlib
from collections import Counter, defaultdict
from pathlib import Path
import cv2
import numpy as np

ROOT=Path("reference-evidence")
OUT=Path("artifacts/sacred-art-phase28-feature-identity")
NAME=re.compile(r"RECENT575__([0-9]{3})")
SOURCE_GROUPS=("phase18","phase20","phase25","phase26","phase27")
ALLOW_IMG={".jpg",".jpeg",".png"}

def classify_file(p):
    n=p.name.lower()
    if "handpicked" in n or "_selected_commons" in n or "_commons." in n:
        return "reference"
    if "_museum." in n or "_canvas" in n:
        return "candidate"
    return ""

def group_files():
    groups=defaultdict(lambda:{"reference":[],"candidate":[]})
    for phase in SOURCE_GROUPS:
        folder=ROOT/phase
        if not folder.is_dir():
            print("MISSING_SOURCE_ARTIFACT:",phase,flush=True)
            continue
        for path in folder.rglob("*"):
            if not path.is_file() or path.suffix.lower() not in ALLOW_IMG:continue
            match=NAME.search(path.name)
            if not match:continue
            kind=classify_file(path)
            if kind:groups[(phase,"RECENT575::"+match.group(1))][kind].append(path)
    return groups

def read_image(path):
    raw=np.fromfile(str(path),dtype=np.uint8)
    image=cv2.imdecode(raw,cv2.IMREAD_GRAYSCALE)
    if image is None:raise ValueError("Not a decodable image: "+str(path))
    h,w=image.shape
    scale=min(1.,1100/max(h,w))
    if scale<1:
        image=cv2.resize(image,(int(round(w*scale)),int(round(h*scale))),interpolation=cv2.INTER_AREA)
    return cv2.equalizeHist(image)

def features(image):
    detector=cv2.SIFT_create(nfeatures=3000)
    return detector.detectAndCompute(image,None)

def score(a,b):
    im_a=read_image(a)
    im_b=read_image(b)
    k1,d1=features(im_a)
    k2,d2=features(im_b)
    result={"reference":a.name,"candidate":b.name,"reference_px":list(reversed(im_a.shape)),
       "candidate_px":list(reversed(im_b.shape)),"keypoints_reference":len(k1),
       "keypoints_candidate":len(k2),"ratio_matches":0,"homography_inliers":0,
       "inlier_ratio":0.0,"reference_coverage":0.0,"candidate_coverage":0.0,
       "status":"INCONCLUSIVE_MANUAL_REVIEW_REQUIRED"}
    if d1 is None or d2 is None or len(d1)<8 or len(d2)<8:return result
    pairs=cv2.BFMatcher(cv2.NORM_L2,crossCheck=False).knnMatch(d1,d2,k=2)
    good=[m for m,n in pairs if m.distance<0.72*n.distance]
    result["ratio_matches"]=len(good)
    if len(good)<8:return result
    src=np.float32([k1[m.queryIdx].pt for m in good]).reshape(-1,1,2)
    dst=np.float32([k2[m.trainIdx].pt for m in good]).reshape(-1,1,2)
    matrix,mask=cv2.findHomography(src,dst,cv2.RANSAC,5.0,maxIters=4000,confidence=.995)
    if matrix is None or mask is None:return result
    valid=mask.ravel().astype(bool)
    n=int(valid.sum())
    ratio=n/len(good)
    def coverage(pts,shape):
        xy=pts[valid,0,:]
        if len(xy)<4:return 0.0
        xspan=np.percentile(xy[:,0],95)-np.percentile(xy[:,0],5)
        yspan=np.percentile(xy[:,1],95)-np.percentile(xy[:,1],5)
        h,w=shape
        return max(0.,float(xspan*yspan/(w*h)))
    c1=coverage(src,im_a.shape);c2=coverage(dst,im_b.shape)
    result.update(homography_inliers=n,inlier_ratio=round(ratio,4),
                  reference_coverage=round(c1,4),candidate_coverage=round(c2,4))
    if n>=35 and ratio>=.55 and c1>=.04 and c2>=.04:
        result["status"]="GEOMETRIC_SAME_PAINTING_CANDIDATE_REVIEW"
    elif n>=15 and ratio>=.40 and c1>=.02:
        result["status"]="POSSIBLE_SAME_PAINTING_CANDIDATE_REVIEW"
    return result

def main():
    groups=group_files()
    results=[]
    for (phase,rid),d in sorted(groups.items()):
        if not d["candidate"]:continue
        for candidate in sorted(d["candidate"]):
            if d["reference"]:
                evaluated=[]
                for ref in d["reference"]:
                    try:
                        res=score(ref,candidate)
                        evaluated.append(res)
                    except Exception as e:
                        evaluated.append({"reference":ref.name,"candidate":candidate.name,
                           "status":"PROCESSING_ERROR","error":str(e)[:200],
                           "homography_inliers":0,"inlier_ratio":0,"reference_coverage":0})
                res=max(evaluated,key=lambda q:(q.get("homography_inliers",0),q.get("inlier_ratio",0)))
            else:
                res={"reference":"","candidate":candidate.name,"status":"REFERENCE_NOT_DOWNLOADED",
                     "homography_inliers":0,"inlier_ratio":0,"reference_coverage":0}
            res.update(phase=phase,registry_id=rid,
                specific_photo_rights_cleared=False,
                gallery_replacement_approved=False)
            results.append(res)
            print(phase,rid,res["candidate"],res["status"],res["homography_inliers"],flush=True)
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"image_identity_evidence.json").write_text(json.dumps(results,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    columns=["phase","registry_id","reference","candidate","status","ratio_matches",
        "homography_inliers","inlier_ratio","reference_coverage","candidate_coverage",
        "specific_photo_rights_cleared","gallery_replacement_approved"]
    with (OUT/"image_identity_evidence.csv").open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=columns);writer.writeheader()
        writer.writerows([{k:r.get(k,"") for k in columns} for r in results])
    grouped=defaultdict(list)
    for r in results:grouped[(r["phase"],r["registry_id"])].append(r)
    summary={"batches_available":sorted({phase for phase,rid in groups}),
       "candidate_images_scored":len(results),
       "artworks_with_candidate_images":len(grouped),
       "artworks_with_reference":sum(any(x.get("reference") for x in xs) for xs in grouped.values()),
       "candidate_geometric_support":sum(r["status"]=="GEOMETRIC_SAME_PAINTING_CANDIDATE_REVIEW" for r in results),
       "status_counts":dict(Counter(r["status"] for r in results)),
       "gallery_upgrades_approved":0,"image_photo_licences_cleared":0,
       "notes":"Research evidence only; feature matching does not establish attribution, licence or perfect crop/colour fidelity."}
    (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,indent=2),flush=True)

if __name__=="__main__": main()
