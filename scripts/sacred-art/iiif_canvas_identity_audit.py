#!/usr/bin/env python3
"""Canvas-aware, research-only IIIF audit for selected Ad Orientem artworks.

Every canvas is an independent candidate. No image is published or used to
replace a selected artwork. A missing Commons reference never passes identity.
"""
import argparse, csv, hashlib, html, io, json, math, statistics
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse
import requests
from PIL import Image, ImageOps, ImageStat
from audit_images import HOSTS, HEADERS, get_json, rights_gate, commons_preview

ROOT=Path(__file__).resolve().parent
OUT=Path("artifacts/sacred-art-phase20-canvas")
MAX_CANVASES=16

def allowed(url):
    p=urlparse(str(url or ""))
    return p.scheme=="https" and p.hostname in HOSTS

def label(v):
    if isinstance(v,str):return v
    if isinstance(v,dict):
        v=v.get("en") or v.get("none") or v.get("@value") or next(iter(v.values()),"")
    if isinstance(v,list): return " / ".join(label(q) for q in v[:3])
    return str(v or "")

def canvases(doc):
    found=[]
    if "sequences" in doc:
        seq=doc.get("sequences") or []
        for ci,canvas in enumerate((seq[0].get("canvases") or [])[:MAX_CANVASES] if seq else []):
            for ai,ann in enumerate((canvas.get("images") or [])[:3]):
                body=ann.get("resource") or {}
                services=body.get("service") or []
                if isinstance(services,dict):services=[services]
                for si,svc in enumerate(services[:2]):
                    uri=svc.get("@id") or svc.get("id")
                    if uri and allowed(uri):
                        found.append({"canvas":ci,"annotation":ai,"service_index":si,
                           "label":label(canvas.get("label")),"uri":uri,
                           "width":canvas.get("width") or body.get("width"),
                           "height":canvas.get("height") or body.get("height")})
    elif "items" in doc:
        for ci,canvas in enumerate((doc.get("items") or [])[:MAX_CANVASES]):
            for page in (canvas.get("items") or [])[:2]:
                for ai,ann in enumerate((page.get("items") or [])[:3]):
                    body=ann.get("body") or {}
                    bodies=body if isinstance(body,list) else [body]
                    for b in bodies[:2]:
                        services=b.get("service") or []
                        if isinstance(services,dict):services=[services]
                        for si,svc in enumerate(services[:2]):
                            uri=svc.get("id") or svc.get("@id")
                            if uri and allowed(uri):
                                found.append({"canvas":ci,"annotation":ai,"service_index":si,
                                   "label":label(canvas.get("label")),"uri":uri,
                                   "width":canvas.get("width") or b.get("width"),
                                   "height":canvas.get("height") or b.get("height")})
    return found

def fingerprint(path):
    with Image.open(path) as original:
        im=ImageOps.exif_transpose(original).convert("L")
        w,h=im.size
        small=im.resize((8,8),Image.Resampling.LANCZOS)
        pix=list(small.getdata());mean=sum(pix)/64
        avg=[v>mean for v in pix]
        run=list(im.resize((9,8),Image.Resampling.LANCZOS).getdata())
        diff=[run[y*9+x+1]>run[y*9+x] for y in range(8) for x in range(8)]
        ent=round(im.resize((256,256),Image.Resampling.LANCZOS).entropy(),2)
    return {"width":w,"height":h,"aspect":w/h,"avg":avg,"diff":diff,"entropy":ent}

def compare(a,b):
    ah=sum(x!=y for x,y in zip(a["avg"],b["avg"]))
    dh=sum(x!=y for x,y in zip(a["diff"],b["diff"]))
    aspect=abs(math.log(max(0.001,a["aspect"]/b["aspect"])))
    score=ah+dh+30*aspect
    return {"avg_hash_distance":ah,"diff_hash_distance":dh,
            "aspect_log_delta":round(aspect,4),"score":round(score,2)}

def fetch_preview(session,service,destination):
    if not allowed(service):raise ValueError("Service host rejected")
    target=service.rstrip("/")+"/full/550,/0/default.jpg"
    with session.get(target,timeout=(7,24),allow_redirects=False,stream=True) as response:
        response.raise_for_status()
        if not response.headers.get("Content-Type","").lower().startswith("image/"):
            raise ValueError("Non-image response")
        chunks=[]; total=0
        for part in response.iter_content(chunk_size=65536):
            total+=len(part)
            if total>6_000_000:raise ValueError("Preview >6MB")
            chunks.append(part)
    data=b"".join(chunks)
    with Image.open(io.BytesIO(data)) as img:
        img.verify()
    destination.parent.mkdir(parents=True,exist_ok=True)
    destination.write_bytes(data)
    return {"sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data),
            "preview_url":target}

def row_audit(row):
    rid=row["registry_id"]
    prefix=rid.replace(":","_")
    dest=OUT/"previews"
    result={"registry_id":rid,"title":row["title"],"museum":row["museum"],
            "museum_object_url":row["museum_object_url"],"manifest":row["iiif_manifest"],
            "manifest_status":"FAILED","canvas_total":0,"candidates_examined":0,
            "reference_status":"FAILED","selection":"HOLD","selected_canvas":"",
            "selected_image_url":"","selected_preview":"","source_image_short_px":"",
            "preview_short_px":"","score":"","runner_up_margin":"","rights_status":"",
            "failure_reason":"","candidate_scores":[]}
    if not allowed(row["iiif_manifest"]):
        result["failure_reason"]="Missing or unapproved IIIF manifest"
        return result
    s=requests.Session();s.headers.update(HEADERS)
    try:
        doc=get_json(s,row["iiif_manifest"])
        candidates=canvases(doc)
        result["manifest_status"]="SUCCESS"
        result["canvas_total"]=len(doc.get("items") or []) if "items" in doc else len((doc.get("sequences") or [{}])[0].get("canvases") or [])
        result["rights_status"]=rights_gate(row.get("rights_on_object_page",""),doc.get("rights") or doc.get("license") or "")
        if not candidates:raise ValueError("No allowable IIIF image services")
    except Exception as e:
        result["failure_reason"]="MANIFEST: "+str(e)[:180]
        return result
    ref=dest/(prefix+"_selected_commons.jpg")
    try:
        commons_preview(s,row["commons_url"],ref)
        ref_sig=fingerprint(ref)
        result["reference_status"]="SUCCESS"
    except Exception as e:
        ref_sig=None
        result["failure_reason"]="Commons reference unavailable: "+str(e)[:180]
    ratings=[]
    for candidate in candidates[:MAX_CANVASES]:
        ci=candidate["canvas"]
        fn=dest/(prefix+f"_canvas_{ci}_{candidate['annotation']}_{candidate['service_index']}.jpg")
        detail={k:candidate[k] for k in ("canvas","annotation","service_index","label","uri","width","height")}
        try:
            download=fetch_preview(s,candidate["uri"],fn)
            sig=fingerprint(fn)
            detail.update({"status":"DOWNLOADED","preview":fn.name,"sha256":download["sha256"],
                           "short_side":min(sig["width"],sig["height"]),"entropy":sig["entropy"]})
            if ref_sig: detail.update(compare(ref_sig,sig))
            else: detail.update({"score":None})
            if sig["width"]<300 or sig["height"]<300 or sig["entropy"]<2.5:
                detail["status"]="REJECTED_PLACEHOLDER_OR_TINY"
        except Exception as e:
            detail.update({"status":"DOWNLOAD_FAILED","error":str(e)[:180],"score":None})
        ratings.append(detail)
    result["candidates_examined"]=len(ratings)
    result["candidate_scores"]=ratings
    ranked=sorted((q for q in ratings if q.get("score") is not None and q["status"]=="DOWNLOADED"),
                  key=lambda q:q["score"])
    if not ref_sig:
        result["failure_reason"]+="; No automatic selection without owner-selected reference"
        return result
    if not ranked:
        result["failure_reason"]="No comparable valid canvas previews"
        return result
    best=ranked[0]
    runner_up=ranked[1] if len(ranked)>1 else None
    margin=round(runner_up["score"]-best["score"],2) if runner_up else None
    result.update({"selected_canvas":best["canvas"],"selected_image_url":best["uri"],
                   "selected_preview":best["preview"],"source_image_short_px":min(int(best["width"] or 0),int(best["height"] or 0)),
                   "preview_short_px":best["short_side"],"score":best["score"],
                   "runner_up_margin":margin})
    margin_ok=margin is None or margin>=5
    strict=(best["avg_hash_distance"]<=8 and best["diff_hash_distance"]<=10
            and best["aspect_log_delta"]<=0.10 and margin_ok)
    possible=(best["avg_hash_distance"]<=16 and best["diff_hash_distance"]<=19
              and best["aspect_log_delta"]<=0.22)
    if strict:
        result["selection"]="STRONG_VISUAL_MATCH_REVIEW_RIGHTS"
    elif possible:
        result["selection"]="POSSIBLE_MATCH_MANUAL_REVIEW"
    else:
        result["selection"]="REJECT_IMAGE_CANVAS_MISMATCH"
    if result["rights_status"].startswith("HOLD_"):
        result["selection"]+="__RIGHTS_HOLD"
    return result

def write_outputs(rows):
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"canvas_audit.json").write_text(json.dumps(rows,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    cols=["registry_id","title","museum","museum_object_url","manifest","manifest_status",
       "canvas_total","candidates_examined","reference_status","selection","selected_canvas",
       "selected_image_url","selected_preview","source_image_short_px","preview_short_px",
       "score","runner_up_margin","rights_status","failure_reason"]
    with (OUT/"canvas_audit.csv").open("w",encoding="utf-8",newline="") as f:
        w=csv.DictWriter(f,fieldnames=cols);w.writeheader();w.writerows([{k:r.get(k,"") for k in cols} for r in rows])
    cards=[]
    for r in rows:
        prefix=r["registry_id"].replace(":","_")
        ref=OUT/"previews"/(prefix+"_selected_commons.jpg")
        selected=OUT/"previews"/str(r["selected_preview"])
        def img(p):
            return '<img src="previews/'+html.escape(p.name)+'">' if p.is_file() else "<p>Unavailable</p>"
        cards.append("<article><h2>"+html.escape(r["title"])+"</h2><p>"+html.escape(r["registry_id"]+" | "+r["selection"])+
                     "</p><div>"+img(ref)+img(selected)+"</div><p>Canvas "+
                     html.escape(str(r["selected_canvas"]))+" · "+html.escape(str(r["score"]))+"</p></article>")
    css="body{font:15px system-ui;background:#eee;color:#222;margin:24px}article{background:white;padding:20px;margin:15px auto;max-width:1100px}article div{display:grid;grid-template-columns:1fr 1fr;gap:15px}img{width:100%;max-height:550px;object-fit:contain}"
    (OUT/"canvas_contact_sheet.html").write_text("<!doctype html><html><meta charset='utf-8'><style>"+css+"</style><h1>IIIF Canvas Identity Audit — Research Only</h1><p>Strong visual similarity does not certify an artwork, image rights, or publication fitness.</p>"+"".join(cards)+"</html>",encoding="utf-8")
    summary={"total_rows":len(rows),"iiif_attempted":sum(bool(r["manifest"]) for r in rows),
      "manifest_success":sum(r["manifest_status"]=="SUCCESS" for r in rows),
      "with_reference":sum(r["reference_status"]=="SUCCESS" for r in rows),
      "strong_visual_candidates":sum(r["selection"].startswith("STRONG_") for r in rows),
      "possible_review":sum(r["selection"].startswith("POSSIBLE_") for r in rows),
      "mismatch":sum(r["selection"].startswith("REJECT_") for r in rows),
      "rights_holds":sum(r["rights_status"].startswith("HOLD_") for r in rows),
      "published_or_promoted":0}
    (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,indent=2),flush=True)

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--input",default=str(ROOT/"artworks_177.csv"))
    p.add_argument("--workers",type=int,default=4)
    args=p.parse_args()
    allrows=list(csv.DictReader(open(args.input,encoding="utf-8-sig",newline="")))
    if len(allrows)!=177 or len(set(x["registry_id"] for x in allrows))!=177:
        raise ValueError("Manifest must have 177 distinct works")
    targets=[r for r in allrows if r["iiif_manifest"]]
    with ThreadPoolExecutor(max_workers=min(4,max(1,args.workers))) as pool:
        results=[f.result() for f in as_completed([pool.submit(row_audit,r) for r in targets])]
    results.sort(key=lambda x:x["registry_id"])
    write_outputs(results)
if __name__=="__main__":
    main()
