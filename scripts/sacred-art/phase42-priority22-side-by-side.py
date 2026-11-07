#!/usr/bin/env python3
"""Phase42: assemble visual QA for 22 geometric-image candidates from existing bytes.

This board is research-only and retains exact original files. Selected owner
Commons images are never replaced, recropped or recolored by this script.
Do not infer image-photo rights from museum-object public-domain labels.
"""
import collections,csv,html,json,shutil
from pathlib import Path

ROOT=Path("reference-evidence")
OUT=Path("artifacts/sacred-art-phase42-priority22-board")
IMAGES=OUT/"images"
SOURCE=Path("scripts/sacred-art/artworks_177.csv")
SCORES=Path("reference-scores/image_identity_evidence.json")

TARGETS={
 "RECENT575::004","RECENT575::018","RECENT575::020","RECENT575::021","RECENT575::025",
 "RECENT575::026","RECENT575::037","RECENT575::039","RECENT575::042","RECENT575::044",
 "RECENT575::054","RECENT575::072","RECENT575::075","RECENT575::076","RECENT575::114",
 "RECENT575::143","RECENT575::152","RECENT575::153","RECENT575::238","RECENT575::240",
 "RECENT575::255","RECENT575::262"
}
assert len(TARGETS)==22
PHASES={"phase18","phase20","phase25","phase26","phase27"}
IMAGE_EXTS={".jpg",".jpeg",".png"}

def all_image_files():
    mapping={}
    for phase in PHASES:
        root=ROOT/phase
        if not root.exists():continue
        for p in root.rglob("*"):
            if p.suffix.lower() in IMAGE_EXTS and p.is_file():
                mapping[(phase,p.name)]=p
    return mapping

def main():
    with SOURCE.open(encoding="utf-8-sig",newline="") as f:
        registry={x["registry_id"]:x for x in csv.DictReader(f)}
    assert len(registry)==177 and set(TARGETS).issubset(set(registry))
    prior=json.loads(SCORES.read_text(encoding="utf8"))
    files=all_image_files()
    available=collections.defaultdict(list)
    for item in prior:
        rid=item.get("registry_id")
        if rid in TARGETS:
            available[rid].append(item)
    assert set(TARGETS).issubset(set(available)),sorted(TARGETS-set(available))
    IMAGES.mkdir(parents=True,exist_ok=True)
    report=[]
    for rid in sorted(TARGETS):
        options=sorted(available[rid],key=lambda x:
          (int(x.get("homography_inliers") or 0),float(x.get("inlier_ratio") or 0)),reverse=True)
        good=[x for x in options if x.get("status")=="GEOMETRIC_SAME_PAINTING_CANDIDATE_REVIEW"]
        item=good[0] if good else options[0]
        phase=item.get("phase")
        ref=files.get((phase,item.get("reference")))
        candidate=files.get((phase,item.get("candidate")))
        record={
          "registry_id":rid,"title":registry[rid]["title"],"artist":registry[rid]["artist"],
          "holding":registry[rid]["museum"],"selected_commons_url":registry[rid]["commons_url"],
          "reference_phase":phase,"prior_geometric_status":item.get("status"),
          "prior_homography_inliers":item.get("homography_inliers"),
          "prior_inlier_ratio":item.get("inlier_ratio"),
          "prior_reference_coverage":item.get("reference_coverage"),
          "prior_museum_coverage":item.get("candidate_coverage"),
          "selected_reference_file":item.get("reference"),"museum_candidate_file":item.get("candidate"),
          "reference_in_artifact":bool(ref),"museum_in_artifact":bool(candidate),
          "candidate_image_licence":"NOT_VERIFIED_FOR_EXACT_PHOTO",
          "publication_approved":False,
          "visual_editorial_review":"PENDING_CROP_COLOR_EXPOSURE_AND_FRAME",
          "filenames":{}
        }
        for kind,file in (("selected",ref),("museum",candidate)):
            if file:
                dest=IMAGES/f"{rid.replace(':','_')}_{kind}{file.suffix.lower()}"
                shutil.copyfile(file,dest)
                record["filenames"][kind]="images/"+dest.name
        report.append(record)
    styles="""body{font-family:system-ui,sans-serif;background:#f3f4f5;color:#162936;margin:0;padding:20px}
    h1{font-size:1.7rem}header{max-width:1050px;margin:0 auto 28px}
    .notice{padding:12px 16px;border:1px solid #a1aab6;background:white}
    section{border:1px solid #d9dde0;background:white;margin:18px auto;padding:20px;max-width:1250px;border-radius:9px}
    .head{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .images{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
    figure{margin:0;background:#eceeef;padding:8px}
    img{display:block;max-height:640px;max-width:100%;margin:auto;object-fit:contain}
    figcaption{padding:10px 2px;color:#52616b;font-size:.9rem}
    .metrics{font-family:ui-monospace,monospace;font-size:.85rem;color:#52616b}
    @media(max-width:680px){.images{grid-template-columns:1fr}}"""
    cards=[]
    for r in report:
        fig=[]
        for key,label in (("selected","Owner-selected Commons image"),("museum","Institutional candidate")):
            path=r["filenames"].get(key)
            image=f'<img loading="lazy" src="{html.escape(path)}" alt="{html.escape(label)}">' if path else "<p>Missing archived image bytes</p>"
            fig.append(f"<figure>{image}<figcaption>{html.escape(label)} — {html.escape((r['selected_reference_file'] if key=='selected' else r['museum_candidate_file']) or 'unavailable')}</figcaption></figure>")
        cards.append(f"""<section><div class="head"><div><h2>{html.escape(r['title'])}</h2>
        <p>{html.escape(r['registry_id'])} · {html.escape(r['artist'])} · {html.escape(r['holding'])}</p></div></div>
        <p class="metrics">Geometric status: {html.escape(str(r['prior_geometric_status']))} ·
        Inliers: {r['prior_homography_inliers']} · Inlier ratio: {r['prior_inlier_ratio']} ·
        Candidate rights: NOT CERTIFIED · Fidelity approval: PENDING</p>
        <div class="images">{''.join(fig)}</div></section>""")
    page=f"""<!doctype html><html lang="en"><meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Ad Orientem — 22 sacred image review pairs</title>
    <style>{styles}</style><header><h1>Ad Orientem — Priority 22 photographic comparison</h1>
    <div class="notice">Research-only. The selected images remain unchanged. The pairs show raw archived original
    selected photographs and institutional image candidates. A geometric same-painting match does not approve image
    reuse, attribution, colour fidelity, crop, frame or publication.</div></header>
    {''.join(cards)}</html>"""
    (OUT/"review_board.html").write_text(page,encoding="utf8")
    (OUT/"review_decisions.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    brief={
       "priority_selections":len(report),
       "selected_reference_bytes_available":sum(x["reference_in_artifact"] for x in report),
       "institutional_candidate_bytes_available":sum(x["museum_in_artifact"] for x in report),
       "full_image_pairs_available":sum(x["reference_in_artifact"] and x["museum_in_artifact"] for x in report),
       "geometric_candidate_status":dict(collections.Counter(x["prior_geometric_status"] for x in report)),
       "owner_photos_replaced":0,"published_gallery_changes":0,"photo_reuse_permissions_cleared":0,
       "review_board":"review_board.html",
       "note":"Visual comparison still required; preserve original files. No photograph was modified."}
    (OUT/"summary.json").write_text(json.dumps(brief,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print(json.dumps(brief,ensure_ascii=False,indent=2),flush=True)
if __name__=="__main__":main()
