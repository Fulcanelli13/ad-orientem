#!/usr/bin/env python3
"""Research only: verify exact owner-selected Commons Tissot image and geometry of Paris IIIF canvases.
Never publish or replace selected art; record exact photo rights independently.
"""
import csv, hashlib, io, json, math, urllib.parse
from pathlib import Path
import requests, cv2, numpy as np
from PIL import Image

ROOT=Path("reference-paris")
OUT=Path("artifacts/sacred-art-phase30-paris-visual")
IMAGES=ROOT/"images"
SELECTED_FILE="The_Return_of_the_Prodigal_Son_James_Tissot.jpeg"
HREF="https://commons.wikimedia.org/wiki/File:"+SELECTED_FILE
OFFICIAL={"RECENT575::184":9,"RECENT575::279":1}

def acquire_selected_tissot():
    # URI uses the exact, pre-existing handpicked Commons file name and the
    # Commons documented file-hash path. No alternative file selection.
    fn=SELECTED_FILE
    hash=hashlib.md5(fn.encode("utf-8")).hexdigest()
    uri="https://upload.wikimedia.org/wikipedia/commons/"+hash[0]+"/"+hash[:2]+"/"+urllib.parse.quote(fn)
    dest=IMAGES/"RECENT575__279_selected_commons.jpg"
    if dest.exists():
        return {"status":"ALREADY_PRESENT","uri":uri,"bytes":dest.stat().st_size}
    try:
        with requests.get(uri,headers={"User-Agent":"AdOrientemResearch/1.0 (selected painting image verification only)","Accept":"image/jpeg,image/*"},timeout=(12,35),stream=True,allow_redirects=False) as r:
            r.raise_for_status()
            if "image/" not in r.headers.get("Content-Type","").lower():
                raise ValueError("Exact Commons request was not an image")
            buf=bytearray()
            for chunk in r.iter_content(65536):
                buf.extend(chunk)
                if len(buf)>9_000_000:raise ValueError("Reference image too large")
        with Image.open(io.BytesIO(buf)) as im:
            im.verify()
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(buf)
        return {"status":"EXACT_SELECTED_FILE_DOWNLOADED","uri":uri,"bytes":len(buf),"sha256":hashlib.sha256(buf).hexdigest()}
    except Exception as e:
        return {"status":"EXACT_SELECTED_FILE_UNAVAILABLE","uri":uri,"error":str(e)[:220]}

def image_features(path):
    image=cv2.imread(str(path),cv2.IMREAD_GRAYSCALE)
    if image is None:raise ValueError("Cannot decode "+str(path))
    h,w=image.shape
    scale=min(1.,1200/max(h,w))
    if scale<1:image=cv2.resize(image,(round(w*scale),round(h*scale)),interpolation=cv2.INTER_AREA)
    points,descr=cv2.SIFT_create(nfeatures=4000).detectAndCompute(cv2.equalizeHist(image),None)
    return image,points,descr

def compare(original,candidate):
    a,ka,da=image_features(original)
    b,kb,db=image_features(candidate)
    row={"original":original.name,"candidate":candidate.name,"status":"NO_GEOMETRIC_SUPPORT",
         "match_count":0,"homography_inliers":0,"inlier_ratio":0,"ref_coverage":0,
         "image_coverage":0,"original_image_short_px":None,"candidate_short_px":None}
    with Image.open(original) as im:row["original_image_short_px"]=min(im.size)
    with Image.open(candidate) as im:row["candidate_short_px"]=min(im.size)
    if da is None or db is None:return row
    pairs=cv2.BFMatcher().knnMatch(da,db,k=2)
    good=[m for m,n in pairs if m.distance<.72*n.distance]
    row["match_count"]=len(good)
    if len(good)<8:return row
    pa=np.float32([ka[m.queryIdx].pt for m in good]).reshape(-1,1,2)
    pb=np.float32([kb[m.trainIdx].pt for m in good]).reshape(-1,1,2)
    H,mask=cv2.findHomography(pa,pb,cv2.RANSAC,5.0,maxIters=4000)
    if mask is None:return row
    ok=mask.ravel()>0;n=int(ok.sum())
    row["homography_inliers"]=n
    row["inlier_ratio"]=round(n/len(good),4)
    def cover(points,shape):
        data=points[ok,0,:]
        if len(data)<4:return 0
        x=np.percentile(data[:,0],[5,95])
        y=np.percentile(data[:,1],[5,95])
        return max(0,round(float((x[1]-x[0])*(y[1]-y[0])/(shape[0]*shape[1])),3))
    row["ref_coverage"]=cover(pa,a.shape)
    row["image_coverage"]=cover(pb,b.shape)
    if n>=50 and row["inlier_ratio"]>.6 and row["ref_coverage"]>.35 and row["image_coverage"]>.35:
        row["status"]="SAME_COMPOSITION_FULL_VIEW_CANDIDATE"
    elif n>=25 and row["inlier_ratio"]>.5 and row["ref_coverage"]>.03:
        row["status"]="SAME_PAINTING_DETAIL_OR_CROP"
    return row

def main():
    manifest=json.loads((ROOT/"paris_two_artworks.json").read_text(encoding="utf-8"))
    assert len(manifest)==2
    ref=acquire_selected_tissot()
    print("TISSOT_SELECTED_COMMONS",json.dumps(ref),flush=True)
    results=[]
    for artwork in manifest:
        rid=artwork["registry_id"]
        pre=rid.replace(":","_")
        selected=IMAGES/(pre+"_selected_commons.jpg")
        images=[IMAGES/(pre+"_canvas"+str(i)+".jpg") for i in range(OFFICIAL[rid])]
        for canvas,path in enumerate(images):
            assert path.exists(),path
            if selected.is_file():
                record=compare(selected,path)
            else:
                record={"status":"SELECTED_REFERENCE_NOT_FETCHED","homography_inliers":0,
                        "match_count":0,"inlier_ratio":0,"ref_coverage":0,
                        "image_coverage":0,"original_image_short_px":None,
                        "candidate_short_px":None}
            metadata=next((x for x in artwork["candidates"] if x["canvas"]==canvas),{})
            right=metadata.get("canvas_copyright_url","")
            record.update(registry_id=rid,canvas=canvas,
              image_rights_label=metadata.get("canvas_rights_label",""),
              image_copyright_declaration=right,
              explicit_cc0_in_canvas_metadata=("creativecommons.org/publicdomain/zero/1.0" in right),
              museum_image_sha256=metadata.get("sha256"),
              museum_image_pixels=metadata.get("pixels"),
              exact_selected_commons_file=artwork["selected_commons_url"],
              image_publication_approved=False,
              visual_fidelity_approved=False,
              selected_commons_replaced=False)
            results.append(record)
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"paris_geometric_photo_assessments.json").write_text(json.dumps({"tissot_selected_file_attempt":ref,"records":results},indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    fields=["registry_id","canvas","status","match_count","homography_inliers","inlier_ratio","ref_coverage",
      "image_coverage","original_image_short_px","candidate_short_px","museum_image_pixels","museum_image_sha256",
      "image_rights_label","image_copyright_declaration","explicit_cc0_in_canvas_metadata",
      "image_publication_approved","visual_fidelity_approved"]
    with (OUT/"paris_geometric_photo_assessments.csv").open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader()
        writer.writerows([{k:r.get(k) for k in fields} for r in results])
    stats={"images_assessed":len(results),"canvas_cc0_declarations":sum(r["explicit_cc0_in_canvas_metadata"] for r in results),
      "same_composition_full_view":sum(r["status"]=="SAME_COMPOSITION_FULL_VIEW_CANDIDATE" for r in results),
      "same_painting_detail":sum(r["status"]=="SAME_PAINTING_DETAIL_OR_CROP" for r in results),
      "tissot_exact_reference":ref["status"],"published_gallery_changes":0,"photographic_fidelity_approvals":0}
    (OUT/"summary.json").write_text(json.dumps(stats,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(stats,indent=2),flush=True)

if __name__=="__main__":main()
