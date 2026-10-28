#!/usr/bin/env python3
"""Batch 5: original-preserving boundary proposals for four frozen Prayer heroes.

The extracted candidate files are research derivatives, not cleared pristine
photographs. Only non-paint-looking pixels are candidates for trim. A full
original is retained and SHA-256 verified before any analysis. Candidate boxes
are mechanical proposals requiring independent painted-boundary review.
"""
from __future__ import annotations
import gc,hashlib,io,json,urllib.request,urllib.parse
from pathlib import Path
from PIL import Image,ImageOps,ImageDraw,ImageCms
import numpy as np

ROOT=Path(__file__).resolve().parents[2]
REG=ROOT/"data/research/prayer-sacred-art-pristine-master-registry-20261028.v1.json"
OUT=ROOT/"assets/staged/prayer-art-b5-four-boundary-candidates-20261028"
OUT.mkdir(parents=True,exist_ok=True)
r=json.loads(REG.read_text())
CASES={"angelus":"EXPOSED_UNPAINTED_SUPPORT","adoration":"EXPOSED_UNPAINTED_SUPPORT",
       "king":"WHITE_NONART_MARGIN","rosary":"WHITE_NONART_MARGIN_CURVED_TOP"}
assert len(r["primary_artworks"])==22
assert len(r["placement_records"])==118
rows={x["module_id"]:x for x in r["primary_artworks"]}
assert all(rows[k]["original"]["archived"] for k in CASES)
Image.MAX_IMAGE_PIXELS=80_000_000

def source_bytes(x):
    orig=x["original"]
    info=orig.get("recovered_location") or orig
    ref=info.get("ref") or info.get("git_ref")
    path=info.get("path")
    assert ref and path
    remote="https://raw.githubusercontent.com/Fulcanelli13/ad-orientem/"+urllib.parse.quote(ref,safe="/")+"/"+"/".join(urllib.parse.quote(c,safe="") for c in path.split("/"))
    req=urllib.request.Request(remote,headers={"User-Agent":"AdOrientem-Prayer-B5-original-preserving-source-proof/1.0"})
    with urllib.request.urlopen(req,timeout=70) as resp:
        b=resp.read(46_000_001)
    if len(b)>46_000_000:raise ValueError("OVERSIZE_SOURCE")
    if hashlib.sha256(b).hexdigest()!=orig["sha256"]:raise ValueError("ORIGINAL_SHA_MISMATCH")
    with Image.open(io.BytesIO(b)) as p:
        p.load()
        if list(p.size)!=orig["dimensions_px"]:raise ValueError("NATIVE_DIMENSION_MISMATCH")
        # Detection/preview only. No gamut adjustment of the original.
        pic=ImageOps.exif_transpose(p)
        return pic.convert("RGB"),orig["sha256"],ref,path

def white_border_bound(img):
    # Find dark/non-neutral material; expensive painting regions are reliably
    # included even when their top arch is narrow. Tolerance leaves a white
    # safety margin. Values are NOT a proof that the rejected pixels have no paint.
    small=img.copy()
    small.thumbnail((1150,1150),Image.Resampling.LANCZOS)
    a=np.asarray(small,dtype=np.uint8)
    # Distinguish all-colour near-white paper from pigment. Conservatively
    # include any pixel with darkness > 19 or channel spread > 28.
    mx=a.max(axis=2).astype("int16");mn=a.min(axis=2).astype("int16")
    fg=(mn<236)|(mx-mn>28)
    fy=np.where(fg.sum(axis=1)>=max(5,int(small.width*.008)))[0]
    fx=np.where(fg.sum(axis=0)>=max(5,int(small.height*.008)))[0]
    if not len(fx) or not len(fy):raise ValueError("FOREGROUND_NOT_FOUND")
    sx=img.width/small.width;sy=img.height/small.height
    # + 0.6% or >= 18px no-paint assurance buffer in original-pixel space.
    pad=max(18,round(.006*max(img.size)))
    box=(max(0,int(fx.min()*sx)-pad),max(0,int(fy.min()*sy)-pad),
         min(img.width,int((fx.max()+1)*sx)+pad),min(img.height,int((fy.max()+1)*sy)+pad))
    small.close()
    return box,{"method":"NEAR_WHITE_MASK_CONSERVATIVE_ONLY_NOT_BOUNDARY_CLEARED",
                "near_white_threshold":236,"channel_spread_threshold":28,
                "nonwhite_min_occupancy_per_scanline":".8%",
                "safety_pad_px":pad}

def support_proposals(img):
    # No automated support/paint discrimination: only harmless fractional inset
    # *proposals*. They may still contain substrate OR cut paint. Never accept
    # without overlay inspection at native size.
    w,h=img.size
    return [(0,0,w,h)] + [(round(w*t),round(h*t),w-round(w*t),h-round(h*t))
            for t in (.005,.012,.020)]

def make_montage(key,img,boxes):
    W,H=1480,420
    canvas=Image.new("RGB",(W,H*len(boxes)+42),(17,20,24))
    dr=ImageDraw.Draw(canvas)
    dr.text((12,12),key+" | FULL SOURCE + DERIVATIVE PROPOSALS | RESEARCH ONLY, NO PAINTED-EDGE CERTIFICATION",fill=(245,221,184))
    for j,(tag,box) in enumerate(boxes):
        y=42+j*H
        dr.text((10,y+10),tag+" | native box "+str(box),fill=(237,222,201))
        crop=img.crop(box)
        thumb=img.copy();thumb.thumbnail((420,348),Image.Resampling.LANCZOS)
        ct=crop.copy();ct.thumbnail((420,348),Image.Resampling.LANCZOS)
        canvas.paste(thumb,(18+(420-thumb.width)//2,y+48+(348-thumb.height)//2))
        canvas.paste(ct,(450+(420-ct.width)//2,y+48+(348-ct.height)//2))
        # Full image has a red box showing exactly what would be retained.
        ox=18+(420-thumb.width)//2
        oy=y+48+(348-thumb.height)//2
        scaled=[round(box[0]*thumb.width/img.width)+ox,round(box[1]*thumb.height/img.height)+oy,
                round(box[2]*thumb.width/img.width)+ox,round(box[3]*thumb.height/img.height)+oy]
        dr.rectangle(scaled,outline=(249,95,90),width=2)
        dr.text((20,y+395),"ORIGINAL, red box = retained field",fill=(180,187,190))
        dr.text((466,y+395),"DERIVATIVE, NOT RELEASED",fill=(180,187,190))
        side=140
        for k,(x,yc) in enumerate([(box[0],box[1]),(box[2]-side,box[1]),(box[0],box[3]-side),(box[2]-side,box[3]-side)]):
            x=max(0,min(x,img.width-side));yc=max(0,min(yc,img.height-side))
            corner=img.crop((x,yc,x+side,yc+side))
            cx=925+(k%2)*155;cy=y+48+(k//2)*170
            canvas.paste(corner,(cx,cy))
        dr.text((930,y+392),"CROP CORNERS at native 140px",fill=(180,187,190))
        crop.close();thumb.close();ct.close()
    path=OUT/(key+"-boundary-proposals.jpg")
    canvas.save(path,"JPEG",quality=88,optimize=True)
    return {"path":str(path.relative_to(ROOT)),"sha256":hashlib.sha256(path.read_bytes()).hexdigest()}

results=[]
for key,category in CASES.items():
    row=rows[key]
    try:
        img,sha,source_ref,source_path=source_bytes(row)
        if "WHITE" in category:
            proposed,algo=white_border_bound(img)
            boxes=[("ORIGINAL_UNTRIMMED",(0,0,img.width,img.height)),
                   ("CONSERVATIVE_NONWHITE_BOUND_PLUS_MARGIN",proposed)]
        else:
            algo={"method":"ONLY_MANUAL_FRACTIONAL_INSET_PROPOSALS_NO_AUTOMATED_SUPPORT_BOUNDARY"}
            boxes=[("ORIGINAL_UNTRIMMED" if i==0 else "UNVERIFIED_INSET_"+str(i),q)
                   for i,q in enumerate(support_proposals(img))]
        record={"case_id":key,"title":row["title"],"artist":row["artist"],
                "issue":category,"source_ref":source_ref,"source_path":source_path,
                "original_sha256":sha,"original_pixels":list(img.size),"original_preserved":True,
                "proposal_method":algo,"painted_boundary_final_accepted":False,
                "photographer_rights_certified":False,"pristine_certified":False,
                "production_activated":False,"candidate_files":[]}
        for name,box in boxes[1:]:
            box=list(box)
            if box[2]-box[0]<.7*img.width or box[3]-box[1]<.7*img.height:
                raise ValueError("UNSAFE_LARGE_TRIM")
            cropped=img.crop(tuple(box))
            # Lossless PNG derivative avoids introducing new JPEG artefacts.
            fname=key+"-"+name.lower()+".png"
            path=OUT/fname
            cropped.save(path,format="PNG",optimize=True)
            record["candidate_files"].append({"label":name,"path":str(path.relative_to(ROOT)),
                "source_crop_box":box,"candidate_pixels":list(cropped.size),
                "sha256":hashlib.sha256(path.read_bytes()).hexdigest(),
                "bytes":path.stat().st_size,
                "source_original_not_modified":True,"status":"RESEARCH_DERIVATIVE_NOT_APPROVED"})
            cropped.close()
        record["proof_contact_sheet"]=make_montage(key,img,boxes)
        results.append(record)
        print("PASS BOUNDARY PROOFS",key,"variants",len(boxes)-1,flush=True)
        img.close()
    except Exception as e:
        results.append({"case_id":key,"status":"FAILED_HELD","error":str(e)[:400],
                        "pristine_certified":False,"production_activated":False})
        print("HOLD",key,type(e).__name__,str(e)[:120],flush=True)
    gc.collect()

result={"schema":"AO_PRAYER_ART_B5_FOUR_CONSERVATIVE_BOUNDARY_PROOFS_V1",
        "date":"2026-10-28","exact_approved_paintings":4,
        "proven_originals_checked":sum(x.get("original_preserved",False) for x in results),
        "proposed_crop_derivatives":sum(len(x.get("candidate_files",[])) for x in results),
        "no_paint_loss_certified":0,"pristine_certified":0,"production_released":0,
        "must_preserve_curved_rosary_top_and_15_medallions":True,
        "no_paid_sources":True,"no_upscaling":True,
        "candidate_not_same_as_approved_pristine_photo":True,"cases":results}
(OUT/"boundary-proofs.json").write_text(json.dumps(result,ensure_ascii=False,indent=2)+"\n")
print(json.dumps({k:result[k] for k in
    ["exact_approved_paintings","proven_originals_checked","proposed_crop_derivatives",
    "no_paint_loss_certified","pristine_certified","production_released"]},sort_keys=True))
if result["proven_originals_checked"]!=4:raise SystemExit("INCOMPLETE_4_CASE_PROOF")
