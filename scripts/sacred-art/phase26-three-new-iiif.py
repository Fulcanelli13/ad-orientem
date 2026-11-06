#!/usr/bin/env python3
"""Ad Orientem Phase 26: download three newly mapped museum image sets, no publication."""
import csv, html, importlib.util, json
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import quote, unquote, urlparse
import requests
from PIL import Image
from audit_images import commons_preview

ROOT=Path(__file__).resolve().parent
MOD=ROOT/"phase25-new-iiif-six.py"
SPEC=importlib.util.spec_from_file_location("phase25_existing",MOD)
PHASE25=importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(PHASE25)
OUT=Path("artifacts/sacred-art-phase26-new-iiif")
PHASE25.OUTPUT=OUT
ORIGINAL=PHASE25.commons_preview

def fallback_selected_commons(s,url,destination):
    try:
        return ORIGINAL(s,url,destination)
    except Exception as first:
        p=urlparse(url)
        if p.hostname!="commons.wikimedia.org" or "/wiki/File:" not in p.path:
            raise
        name=unquote(p.path.split("/wiki/File:",1)[1])
        request_url="https://commons.wikimedia.org/wiki/Special:Redirect/file/"+quote(name,safe="")+"?width=1200"
        current=request_url
        for _ in range(4):
            with s.get(current,timeout=(9,25),allow_redirects=False,stream=True) as response:
                if response.status_code in (301,302,303,307,308):
                    next_url=response.headers.get("Location","")
                    if next_url.startswith("/"):
                        from urllib.parse import urljoin
                        next_url=urljoin(current,next_url)
                    q=urlparse(next_url)
                    if q.scheme!="https" or q.hostname not in ("commons.wikimedia.org","upload.wikimedia.org"):
                        raise ValueError("Unexpected Commons redirect hostname")
                    current=next_url
                    continue
                response.raise_for_status()
                if not response.headers.get("Content-Type","").lower().startswith("image/"):
                    raise ValueError("Commons alternate path returned non-image")
                data=bytearray()
                for ch in response.iter_content(65536):
                    data.extend(ch)
                    if len(data)>10_000_000:raise ValueError("Selected Commons preview exceeds 10MB")
                destination.parent.mkdir(parents=True,exist_ok=True)
                destination.write_bytes(data)
                with Image.open(destination) as img:
                    img.load()
                    info={"pixels_width":img.width,"pixels_height":img.height,"format":img.format}
                import hashlib
                return {"source":current,"sha256":hashlib.sha256(data).hexdigest(),"bytes":len(data),**info}
        raise ValueError("Commons redirect depth exceeded; original error "+str(first)[:70])
PHASE25.commons_preview=fallback_selected_commons

def main():
    from collections import Counter
    selected=list(csv.DictReader((ROOT/"artworks_177.csv").open(encoding="utf-8-sig",newline="")))
    by_id={r["registry_id"]:r for r in selected}
    doc=json.loads(Path("data/research/sacred-art/phase25-image-recovery-and-identity-20261106.v1.json").read_text(encoding="utf-8"))
    new=doc["new_museum_record_confirmations"]
    assert len(new)==3 and len({r["registry_id"] for r in new})==3
    targets=[{"registry_id":r["registry_id"],"accession":r["accession"],
              "official_or_institutional_source":r["official_object"],
              "iiif_manifest":r["iiif_manifest"],"identity_note":r["caution"]} for r in new]
    with ThreadPoolExecutor(max_workers=3) as pool:
        reports=[f.result() for f in as_completed([pool.submit(PHASE25.work,by_id[t["registry_id"]],t) for t in targets])]
    reports.sort(key=lambda x:x["registry_id"])
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"three_image_audit.json").write_text(json.dumps(reports,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    import csv
    keys=["registry_id","painting","artist_selected","museum","accession","official_object_url","iiif_manifest",
          "current_short_px","canvas_count","downloaded_museum_images","reference_status","rights_gate",
          "best_canvas_index","best_original_short_px","best_score","best_comparison","identity_caution","error"]
    with (OUT/"three_image_audit.csv").open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=keys);writer.writeheader()
        writer.writerows([{k:r.get(k) for k in keys} for r in reports])
    sections=[]
    for r in reports:
        rid=r["registry_id"].replace(":","_")
        ref=OUT/"images"/(rid+"_handpicked.jpg")
        left='<img src="images/'+ref.name+'">' if ref.exists() else '<p>Selected Commons reference not downloaded</p>'
        slides=[]
        for c in r.get("candidate_images",[]):
            fn=c.get("file")
            if not fn:continue
            slides.append("<figure><img src='"+html.escape(fn)+"'><figcaption>Canvas "+str(c["canvas"])+
               " · "+html.escape(c.get("review_status",""))+" · "+str(c.get("score",""))+"</figcaption></figure>")
        sections.append("<article><h2>"+html.escape(r["painting"])+"</h2><p>"+html.escape(r["registry_id"])+
                        " — "+html.escape(r["rights_gate"])+"</p><div class='compare'><div>"+left+"</div><div class='grid'>"+
                        "".join(slides)+"</div></div></article>")
    css="body{font:15px system-ui;background:#eef1f4;color:#20303e;margin:20px}article{background:white;margin:20px auto;padding:20px;max-width:1400px}.compare{display:grid;grid-template-columns:1fr 2fr;gap:12px}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}img{max-height:600px;width:100%;object-fit:contain}figcaption{font-size:12px}@media(max-width:900px){.compare,.grid{grid-template-columns:1fr}}"
    (OUT/"three_visual_comparisons.html").write_text("<!doctype html><html><meta charset='utf-8'><style>"+css+"</style><h1>Phase 26 — Research only. Never auto-publish.</h1>"+"".join(sections)+"</html>",encoding="utf-8")
    summary={"new_iiif_objects":len(new),"manifest_success":sum(r["manifest_status"]=="SUCCESS" for r in reports),
       "museum_image_files":sum(r["downloaded_museum_images"] for r in reports),
       "handpicked_comparison_files":sum(r["reference_status"]=="SUCCESS" for r in reports),
       "strong_visual_candidates":sum(str(r["best_comparison"]).startswith("STRONG") for r in reports),
       "possible_visual_candidates":sum(str(r["best_comparison"]).startswith("POSSIBLE") for r in reports),
       "image_reuse_approved":0,"gallery_replacements":0}
    (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,indent=2),flush=True)
if __name__=="__main__":main()
