#!/usr/bin/env python3
"""Original PDF evidence only: never approves, publishes, or edits DYK cards.

This script inspects exact original bytes, searches the PDF text layer, and
renders bounded folio images for PRIVATE human inspection. A rendered page
is not an approved fact. OCR is deliberately not attempted.
"""
import hashlib
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

ROOT = Path("data/research/did-you-know/release-candidates")
PROOF = ROOT / "ao-dyk-batch-A-62-corrected-bilingual-owner-proof-RESEARCH_ONLY-20261111.v1.json"
TARGETS = {
    "DYK-C400-BF-006": ("weiser", ("barbara", "cherry")),
    "DYK-C400-BF-008": ("weiser", ("epiphany", "easter")),
    "DYK-C400-BF-014": ("weiser", ("malta", "easter")),
    "DYK-C400-BG-003": ("weiser", ("calendau", "bread")),
    "DYK-C400-BG-007": ("weiser", ("herring", "lent")),
    "DYK-C400-BG-011": ("weiser", ("fountains", "sunday")),
    "DYK-C400-BG-013": ("weiser", ("tivoli", "assumption")),
    "DYK-C400-BG-014": ("weiser", ("sassari", "candles")),
    "DYK-C400-BG-019": ("weiser", ("mother", "spain")),
    "DYK-C400-BG-025": ("weiser", ("durango", "anthony")),
    "DYK-C400-BG-029": ("weiser", ("grain", "lady")),
    "DYK-C400-BJ-001": ("weiser", ("ratschen", "bells")),
    "DYK-C400-BJ-002": ("weiser", ("malta", "supper")),
    "DYK-H04-W-A-039": ("weiser", ("brebeuf", "huron")),
    "DYK-H04-W-A-068": ("weiser", ("mince", "manger")),
    "DYK-H04-W-A-096": ("weiser", ("alleluia", "burial")),
    "DYK-H04-W-B-038": ("weiser", ("450", "eggs")),
    "DYK-H04-W-B-072": ("weiser", ("trinity", "plague")),
    "DYK-UM01-019": ("weiser", ("mainz", "angels")),
    "DYK-G600-P-028": ("pitre", ("cerauli", "serpenti")),
}
def norm(s):
    s=unicodedata.normalize("NFKD",s).lower()
    return "".join(c for c in s if not unicodedata.combining(c))
def run(args, timeout=120):
    return subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,timeout=timeout)
def source_report(path):
    if not path.is_file() or path.stat().st_size<1024:
        return {"downloaded":False,"byte_count":0,"page_count":None,"text_pages":[],"file":str(path)}
    b=path.read_bytes()
    r=run(["pdfinfo",str(path)])
    count_match=re.search(rb"^Pages:\s+(\d+)",r.stdout,re.M)
    count=int(count_match.group(1)) if count_match else None
    txt=run(["pdftotext","-layout",str(path),"-"],timeout=180)
    pages=txt.stdout.decode("utf-8","replace").split("\f") if txt.returncode==0 else []
    if pages and not pages[-1].strip():pages.pop()
    return {"downloaded":True,"byte_count":len(b),"sha256":hashlib.sha256(b).hexdigest(),
       "page_count":count,"text_pages":pages,"text_pages_nonempty":sum(bool(p.strip()) for p in pages),
       "pdfinfo_error":r.stderr.decode("utf-8","replace")[:300] if r.returncode else None,
       "text_extraction_error":txt.stderr.decode("utf-8","replace")[:300] if txt.returncode else None}
def render(src,pdf_page,destination):
    if not pdf_page:return False
    destination.parent.mkdir(parents=True,exist_ok=True)
    out=run(["pdftoppm","-f",str(pdf_page),"-l",str(pdf_page),
             "-singlefile","-gray","-scale-to","1250","-jpeg","-jpegopt","quality=65",
             str(src),str(destination.with_suffix(""))],timeout=50)
    return out.returncode==0 and destination.exists() and destination.stat().st_size>5000

def main():
    if len(sys.argv)!=4:
        raise SystemExit("Usage: script.py <weiser.pdf> <pitre.pdf> <outdir>")
    paths={"weiser":Path(sys.argv[1]),"pitre":Path(sys.argv[2])}
    dest=Path(sys.argv[3]);dest.mkdir(parents=True,exist_ok=True)
    proof=json.loads(PROOF.read_text("utf8"))
    assert proof["release_stage"]=="RESEARCH_ONLY" and len(proof["records"])==62
    assert proof["inventory"]["owner_approved"]==0
    chosen={r["id"]:r for r in proof["records"]}
    assert set(TARGETS)<=set(chosen)
    docs={name:source_report(path) for name,path in paths.items()}
    reports=[]
    for id,(book,anchors) in TARGETS.items():
        doc=docs[book];pages=doc.get("text_pages",[])
        scores=[]
        for i,page in enumerate(pages):
            text=norm(page)
            score=sum(1 for anchor in anchors if norm(anchor) in text)
            if score:scores.append((score,i+1))
        scores.sort(key=lambda x:(-x[0],x[1]))
        top=[{"matched_anchors":score,"pdf_page_number":index} for score,index in scores[:4]]
        # An existing "355 / 413" is a lead, NOT proven pagination.
        raw=chosen[id]["research_provenance"].get("source_locator_raw","")
        registered_pdf_hint=413 if book=="pitre" else None
        page=top[0]["pdf_page_number"] if top and top[0]["matched_anchors"]==len(anchors) else registered_pdf_hint
        raster_name=None
        if doc["downloaded"] and page and page<=doc["page_count"]:
            raster=dest/"private_folio_images"/(id+".jpg")
            if render(paths[book],page,raster):raster_name=str(raster.relative_to(dest))
        status=("TEXT_LAYER_BOTH_ANCHORS_FOUND_NOT_FACSIMILE_CERTIFIED" if top and top[0]["matched_anchors"]==len(anchors)
           else "PARTIAL_TEXT_LAYER_NOT_FACSIMILE_CERTIFIED" if top
           else "NO_TEXT_MATCH_OR_DOCUMENT_NOT_AVAILABLE")
        reports.append({"id":id,"book":book,"registered_locator":raw,
            "search_anchors":list(anchors),"top_page_candidates":top,
            "page_raster_for_human_review":raster_name,
            "source_text_review":status,
            "image_visually_certified":False,"approval":False})
        print(f'{id}: {status}; top PDF pages={top[:2]}; rendered={bool(raster_name)}',flush=True)
    export={"format":"AO_DYK_HISTORICAL_FACSIMILE_EVIDENCE_ONLY_V1","batch_A_count":62,
        "source_card_count":20,"generated":__import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "documents":{name:{k:v for k,v in d.items() if k!="text_pages"} for name,d in docs.items()},
        "records":reports,
        "source_text_certification_complete":False,
        "original_folio_image_human_review_complete":False,
        "owner_approvals":0,"publication_authorized":False,
        "note":"PDF page numbers are candidates determined from text anchors and/or existing provisional locator. This report and bounded private raster artifact are NOT human page-image certification; manual verification and owner release remain required."}
    (dest/"report.json").write_text(json.dumps(export,ensure_ascii=False,indent=2)+"\n","utf8")
    print("SUMMARY:",json.dumps({"documents":{k:{"downloaded":v["downloaded"],"bytes":v["byte_count"],"pages":v["page_count"],"text_pages_nonempty":v.get("text_pages_nonempty")} for k,v in docs.items()},
      "image_renders":sum(bool(r["page_raster_for_human_review"]) for r in reports),
      "both_anchor_matches":sum(r["source_text_review"].startswith("TEXT_LAYER_BOTH") for r in reports),
      "manual_image_certifications":0}),flush=True)

if __name__=="__main__":main()
