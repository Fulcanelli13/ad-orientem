#!/usr/bin/env python3
"""Phase 27: inspect four newly identified Ghent MSK IIIF objects, research only.

Never promote image automatically; selected owner Commons original remains unchanged.
"""
import csv, json, html, importlib.util
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

HERE=Path(__file__).resolve().parent
mod=HERE/"phase26-three-new-iiif.py"
spec=importlib.util.spec_from_file_location("phase26_ref_reuse",mod)
runner=importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)
OUT=Path("artifacts/sacred-art-phase27-ghent")
runner.OUT=OUT
runner.PHASE25.OUTPUT=OUT

MUSEUM=[
 ("RECENT575::238","1926-A","https://www.mskgent.be/en/collection/1926-a","https://imagehub.mskgent.be/iiif/3/1054/manifest.json","Ghent Jordaens Assumption, distinct from Rubens composition"),
 ("RECENT575::240","S-52","https://www.mskgent.be/en/collection/s-52","https://imagehub.mskgent.be/iiif/3/152/manifest.json","Heemskerck Calvary, not Maeterlinck inventory 2005-Q"),
 ("RECENT575::242","S-54","https://www.mskgent.be/en/collection/s-54","https://imagehub.mskgent.be/iiif/3/6351/manifest.json","Raphael Coxie Last Judgement, no substitute panel"),
 ("RECENT575::247","S-9","https://www.mskgent.be/en/collection/s-9","https://imagehub.mskgent.be/iiif/3/6361/manifest.json","Rubens Saint Francis with Stigmata, multiple subject versions exist"),
]

def main():
    source=list(csv.DictReader((HERE/"artworks_177.csv").open(encoding="utf-8-sig",newline="")))
    assert len(source)==177
    byid={r["registry_id"]:r for r in source}
    with ThreadPoolExecutor(max_workers=3) as pool:
        jobs=[]
        for rid,acc,url,iiif,caution in MUSEUM:
            assert rid in byid
            official={"registry_id":rid,"accession":acc,"official_or_institutional_source":url,
                      "iiif_manifest":iiif,"identity_note":caution}
            jobs.append(pool.submit(runner.PHASE25.work,byid[rid],official))
        reports=[f.result() for f in as_completed(jobs)]
    reports.sort(key=lambda r:r["registry_id"])
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"four_image_audit.json").write_text(json.dumps(reports,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    rows=[]
    for r in reports:
        rows.append({k:r.get(k) for k in ("registry_id","painting","museum","accession",
            "iiif_manifest","current_short_px","canvas_count","downloaded_museum_images",
            "reference_status","rights_gate","best_canvas_index","best_original_short_px",
            "best_score","best_comparison","selected_museum_image","error")})
    with (OUT/"four_image_audit.csv").open("w",encoding="utf-8",newline="") as f:
        writer=csv.DictWriter(f,fieldnames=list(rows[0]));writer.writeheader();writer.writerows(rows)
    cards=[]
    for r in reports:
        key=r["registry_id"].replace(":","_")
        p=OUT/"images"/(key+"_handpicked.jpg")
        left='<img src="images/'+p.name+'">' if p.is_file() else "<p>Commons comparison unavailable; no visual clearance</p>"
        candidates=[]
        for c in r.get("candidate_images",[]):
            if not c.get("file"):continue
            candidates.append('<figure><img src="'+html.escape(c["file"])+'"><figcaption>Canvas '+str(c["canvas"])+' · '+html.escape(c.get("review_status",""))+' · '+str(c.get("score",""))+'</figcaption></figure>')
        cards.append("<article><h2>"+html.escape(r["painting"])+"</h2><p>"+html.escape(r["registry_id"])+
          " | "+html.escape(r["rights_gate"])+"</p><section>"+left+"<div class='choices'>"+
          "".join(candidates)+"</div></section></article>")
    css="body{font:15px system-ui;background:#eef2f6;color:#1f3444;margin:20px}article{background:white;padding:22px;margin:20px auto;max-width:1350px;border-radius:12px}section{display:grid;grid-template-columns:1fr 2fr;gap:12px}.choices{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}img{max-height:540px;width:100%;object-fit:contain}figcaption{font-size:12px}@media(max-width:780px){section,.choices{grid-template-columns:1fr}}"
    (OUT/"visual_comparison.html").write_text("<!doctype html><html><meta charset='utf-8'><style>"+css+"</style><h1>Four Ghent museum image comparisons — Research only</h1><p>Rights and exact photo fidelity are NOT approved. No auto-promotion.</p>"+"".join(cards)+"</html>",encoding="utf-8")
    summary={"scope":4,"manifests_success":sum(r["manifest_status"]=="SUCCESS" for r in reports),
      "museum_images_downloaded":sum(r["downloaded_museum_images"] for r in reports),
      "selected_commons_retrieved":sum(r["reference_status"]=="SUCCESS" for r in reports),
      "strong_visual_candidates":sum(r["best_comparison"].startswith("STRONG") for r in reports),
      "possible_visual_candidates":sum(r["best_comparison"].startswith("POSSIBLE") for r in reports),
      "rights_approved":0,"released_photo_replacements":0}
    (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,indent=2),flush=True)
if __name__=="__main__":main()
