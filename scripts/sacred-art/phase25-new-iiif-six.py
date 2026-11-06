#!/usr/bin/env python3
"""Phase 25: research-only pixel comparison of six Phase 24 museum IIIF candidates.
No gallery writes, editorial promotions, releases, or art substitutions.
"""
from __future__ import annotations
import csv, hashlib, html, io, json, math, traceback
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse
import requests
from PIL import Image, ImageOps, ImageStat, ImageFilter
from audit_images import HEADERS, HOSTS, commons_preview, rights_gate
from iiif_canvas_identity_audit import canvases, fingerprint, compare

ROOT=Path(__file__).resolve().parent
MANIFEST=Path("data/research/sacred-art/phase24-five-museums-exact-object-crosswalk-20261106.v1.json")
OUTPUT=Path("artifacts/sacred-art-phase25-new-iiif")
MAX_CANVASES=12
MAX_BYTES=14_000_000

def allowed(url,extra=()):
    u=urlparse(str(url or ""))
    return u.scheme=="https" and u.hostname in set(HOSTS)|set(extra)

def safe_read_image(s,uri,to):
    if not allowed(uri):raise ValueError("Museum service host is not allowlisted")
    # Smaller preview for canvas identity, retaining metadata on original size.
    url=uri.rstrip("/")+"/full/1100,/0/default.jpg"
    with s.get(url,timeout=(8,35),stream=True,allow_redirects=False) as r:
        r.raise_for_status()
        if "image/" not in r.headers.get("Content-Type","").lower():
            raise ValueError("Museum server did not return an image")
        data=bytearray()
        for block in r.iter_content(65536):
            data.extend(block)
            if len(data)>MAX_BYTES:raise ValueError("Oversized preview")
    with Image.open(io.BytesIO(data)) as im:
        im.verify()
    to.parent.mkdir(parents=True,exist_ok=True)
    to.write_bytes(data)
    with Image.open(to) as im:
        im.load()
        return {"image_url":url,"file":str(to.relative_to(OUTPUT)),"w":im.width,"h":im.height,
                "sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data),
                "entropy":round(im.convert("L").resize((192,192)).entropy(),2)}

def work(row,official):
    rid=row["registry_id"]
    key=rid.replace(":","_")
    entry={"registry_id":rid,"painting":row["title"],"artist_selected":row["artist"],
        "selected_file":row["commons_url"],"current_short_px":int(row["original_short_px"] or 0),
        "museum":row["museum"],"accession":official["accession"],
        "official_object_url":official["official_or_institutional_source"],
        "iiif_manifest":official["iiif_manifest"],"identity_caution":official.get("identity_note",""),
        "manifest_status":"FAILED","reference_status":"FAILED","museum_image_count":0,
        "canvas_count":0,"candidate_images":[],"rights_gate":"UNVERIFIED",
        "best_canvas_index":None,"best_score":None,"best_comparison":"NO_COMPARISON",
        "best_original_short_px":None,"selected_museum_image":"",
        "downloaded_museum_images":0,"approved_for_publication":False,"error":""}
    s=requests.Session();s.headers.update(HEADERS)
    try:
        response=s.get(official["iiif_manifest"],timeout=(8,35),allow_redirects=False)
        response.raise_for_status()
        if len(response.content)>4_000_000:raise ValueError("Manifest exceeds 4 MB")
        doc=response.json()
        choices=canvases(doc)
        entry["manifest_status"]="SUCCESS"
        entry["canvas_count"]=len(doc.get("items") or []) if "items" in doc else len((doc.get("sequences") or [{}])[0].get("canvases") or [])
        entry["rights_gate"]=rights_gate("CC0" if "kmska.be" in official["iiif_manifest"] else "UNVERIFIED",doc.get("rights") or doc.get("license") or "")
        if not choices:raise ValueError("No usable image services in IIIF manifest")
        refpath=OUTPUT/"images"/(key+"_handpicked.jpg")
        try:
            meta=commons_preview(s,row["commons_url"],refpath)
            entry["reference_status"]="SUCCESS"
            entry["reference_download"]={"w":meta["pixels_width"],"h":meta["pixels_height"],
                                          "sha256":meta["sha256"],"url":meta["source"]}
            refsig=fingerprint(refpath)
        except Exception as e:
            entry["reference_status"]="FAILED"
            entry["reference_error"]=str(e)[:200]
            refsig=None
        candidates=[]
        for one in choices[:MAX_CANVASES]:
            idx=one["canvas"]
            p=OUTPUT/"images"/(key+f"_canvas{idx}_{one['annotation']}_{one['service_index']}.jpg")
            c={"canvas":idx,"annotation":one["annotation"],"canvas_label":one.get("label",""),
               "service":one["uri"],"original_width":one.get("width"),
               "original_height":one.get("height"),"status":"FAILED"}
            try:
                data=safe_read_image(s,one["uri"],p)
                c.update(data)
                c["status"]="SUCCESS"
                if refsig:
                    cmp=compare(refsig,fingerprint(p))
                    c.update(cmp)
                    if data["entropy"]<2.5 or min(data["w"],data["h"])<300:
                        c["review_status"]="REJECT_PLACEHOLDER_OR_TINY"
                    elif cmp["avg_hash_distance"]<=8 and cmp["diff_hash_distance"]<=10 and cmp["aspect_log_delta"]<=.10:
                        c["review_status"]="STRONG_VISUAL_CANDIDATE_MANUAL_REVIEW"
                    elif cmp["avg_hash_distance"]<=16 and cmp["diff_hash_distance"]<=19 and cmp["aspect_log_delta"]<=.22:
                        c["review_status"]="POSSIBLE_VISUAL_CANDIDATE_MANUAL_REVIEW"
                    else:c["review_status"]="MISMATCH_HOLD"
                else:c["review_status"]="NO_HANDPICKED_REFERENCE_HOLD"
            except Exception as e:c["error"]=str(e)[:240]
            candidates.append(c)
        entry["candidate_images"]=candidates
        entry["museum_image_count"]=len(candidates)
        entry["downloaded_museum_images"]=sum(c["status"]=="SUCCESS" for c in candidates)
        ranked=sorted((c for c in candidates if c.get("score") is not None and c["status"]=="SUCCESS" and
                      c["review_status"]!="REJECT_PLACEHOLDER_OR_TINY"),key=lambda c:c["score"])
        if ranked:
            best=ranked[0]
            entry["best_canvas_index"]=best["canvas"]
            entry["best_score"]=best["score"]
            entry["best_comparison"]=best["review_status"]
            entry["best_original_short_px"]=min(int(best.get("original_width") or 0),int(best.get("original_height") or 0))
            entry["selected_museum_image"]=best["file"]
        elif any(c["status"]=="SUCCESS" for c in candidates):
            entry["best_comparison"]="MUSEUM_IMAGES_RETRIEVED_REFERENCE_MISSING"
    except Exception as e:entry["error"]=str(e)[:300]
    print(f"{rid}: manifest={entry['manifest_status']}; museum_files={entry['downloaded_museum_images']}; commons={entry['reference_status']}; best={entry['best_comparison']}",flush=True)
    return entry

def main():
    from collections import Counter
    selected=list(csv.DictReader((ROOT/"artworks_177.csv").open(encoding="utf-8-sig",newline="")))
    assert len(selected)==177
    by_id={r["registry_id"]:r for r in selected}
    data=json.loads(MANIFEST.read_text(encoding="utf-8"))
    targets=[r for r in data["records"] if r.get("iiif_manifest")]
    assert len(targets)==6 and len({r["registry_id"] for r in targets})==6
    with ThreadPoolExecutor(max_workers=3) as pool:
        reports=[f.result() for f in as_completed([pool.submit(work,by_id[r["registry_id"]],r) for r in targets])]
    reports.sort(key=lambda r:r["registry_id"])
    OUTPUT.mkdir(parents=True,exist_ok=True)
    (OUTPUT/"six_image_audit.json").write_text(json.dumps(reports,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    keys=["registry_id","painting","artist_selected","museum","accession","official_object_url","iiif_manifest",
       "current_short_px","canvas_count","museum_image_count","downloaded_museum_images",
       "reference_status","rights_gate","best_canvas_index","best_original_short_px","best_score",
       "best_comparison","selected_museum_image","identity_caution","error"]
    with (OUTPUT/"six_image_audit.csv").open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=keys);writer.writeheader();writer.writerows([{k:r.get(k) for k in keys} for r in reports])
    blocks=[]
    for r in reports:
        key=r["registry_id"].replace(":","_")
        ref=OUTPUT/"images"/(key+"_handpicked.jpg")
        left=('<img src="images/'+html.escape(ref.name)+'">' if ref.is_file() else "<p>Commons unavailable</p>")
        ims=[]
        for c in r["candidate_images"]:
            filename=c.get("file","")
            if filename:
                ims.append("<div><img src='"+html.escape(filename)+"'><p>Canvas "+str(c["canvas"])+" / "+
                           html.escape(c.get("review_status",""))+" / "+str(c.get("score",""))+"</p></div>")
        blocks.append("<article><h2>"+html.escape(r["painting"])+"</h2><p>"+html.escape(r["registry_id"])+" • "+
                      html.escape(r["rights_gate"])+"</p><div class='ref'>"+left+
                      "<div class='grid'>"+"".join(ims)+"</div></div></article>")
    css="body{font:15px system-ui;color:#172b3a;background:#f1f2f3;margin:20px}article{background:#fff;border-radius:10px;padding:20px;margin:20px auto;max-width:1500px}.ref{display:grid;grid-template-columns:1fr 2fr;gap:10px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}img{width:100%;max-height:470px;object-fit:contain}p{font-size:12px}@media(max-width:800px){.ref,.grid{grid-template-columns:1fr}}"
    (OUTPUT/"canvas_contact_sheet.html").write_text("<!doctype html><html><meta charset='utf-8'><style>"+css+"</style><h1>Ad Orientem — Phase 25 image research</h1><p>No photograph is publication approved. Canvas-level visual similarity is preliminary.</p>"+"".join(blocks)+"</html>",encoding="utf-8")
    summary={"scope_new_iiif":len(targets),
      "manifests_fetched":sum(x["manifest_status"]=="SUCCESS" for x in reports),
      "museum_images_downloaded":sum(x["downloaded_museum_images"] for x in reports),
      "owner_selected_commons_downloaded":sum(x["reference_status"]=="SUCCESS" for x in reports),
      "strong_visual_candidates":sum(x["best_comparison"].startswith("STRONG") for x in reports),
      "rights_review_holds":sum(x["rights_gate"].startswith("HOLD") or x["rights_gate"]=="UNVERIFIED" for x in reports),
      "automatic_gallery_replacements":0,"manual_photo_approvals":0}
    (OUTPUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,indent=2),flush=True)
if __name__=="__main__":
    main()
