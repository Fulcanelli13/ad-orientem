#!/usr/bin/env python3
"""Research-only institutional public-domain image acquisition, Kress K2027."""
import csv,hashlib,json,pathlib,urllib.request
from datetime import datetime,timezone
from PIL import Image
ROOT=pathlib.Path("artifacts/b22-kress-k2027")
ROOT.mkdir(parents=True,exist_ok=True)
URL="https://bmmweb.blob.core.windows.net/kress/k2027_3233_001.jpg"
SOURCE="https://www.kressfoundation.org/kress-collection/artwork/5cfc10f4fb81dd90a2088e868b50f68a66c11fc3525daa2e5b3c7530fa82d82f"
DOWNLOAD_PAGE="https://www.kressfoundation.org/Download/?FilePath=https%3A%2F%2Fbmmweb.blob.core.windows.net%2Fkress%2Fk2027_3233_001.jpg"
FIELDS=["asset_source_id","artwork_id","title","artist","source_url","institution","repository","accession",
"image_download_link","image_url","rights_statement","rights_status","image_tier","acquisition_status",
"sha256","bytes_acquired","decoded_width","decoded_height","format","long_edge_gate","publication_status","checked_utc","error"]
r={k:"" for k in FIELDS}
r.update(asset_source_id="AO-KRESS-K2027",artwork_id="kress-k2027",title="The Last Judgment",
artist="Fernando Gallego and Workshop",source_url=SOURCE,institution="Samuel H. Kress Foundation",
repository="University of Arizona Museum of Art",accession="1961.013.052",image_download_link=DOWNLOAD_PAGE,
image_url=URL,rights_statement="Public Domain on official individual artwork page",
rights_status="OFFICIAL_SOURCE_PUBLIC_DOMAIN_RECORDED_EDITORIAL_REVIEW",
image_tier="INSTITUTION_DOWNLOAD_JPEG_NOT_CERTIFIED_ARCHIVAL_ORIGINAL",
acquisition_status="NOT_ATTEMPTED",publication_status="HOLD",
checked_utc=datetime.now(timezone.utc).isoformat(timespec="seconds"))
tmp=ROOT/"AO-KRESS-K2027.partial"
size=0
sha=hashlib.sha256()
try:
    req=urllib.request.Request(URL,headers={"User-Agent":"AdOrientemSacredArtResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)","Accept":"image/*"})
    with urllib.request.urlopen(req,timeout=65) as result,tmp.open("wb") as f:
        content=result.headers.get("Content-Type","").lower()
        if content and not content.startswith("image/"):raise ValueError("Not an image content type")
        while True:
            b=result.read(1048576)
            if not b:break
            size+=len(b)
            if size>95_000_000:raise ValueError("Original image oversized")
            sha.update(b);f.write(b)
    if size<10000:raise ValueError("Truncated image download")
    with Image.open(tmp) as img:
        img.load();w,h=img.size;fmt=img.format
    if fmt!="JPEG":raise ValueError("Wrong image format: "+str(fmt))
    tmp.rename(ROOT/"AO-KRESS-K2027.jpg")
    r.update(acquisition_status="ACQUIRED_INSTITUTION_JPEG_SHA256",sha256=sha.hexdigest(),bytes_acquired=size,
             decoded_width=w,decoded_height=h,format=fmt,
             long_edge_gate="PASS_2400" if max(w,h)>=2400 else "REVIEW_UNDER_2400")
except Exception as exc:
    r.update(acquisition_status="DOWNLOAD_FAILED_SOURCE_REVIEW",error=str(exc)[:280])
finally:tmp.unlink(missing_ok=True)
with (ROOT/"Acquisition_results.csv").open("w",encoding="utf-8",newline="") as f:
    w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerow(r)
summary={"wave":"B22_KRESS_K2027","source_records":1,"institution_images_acquired":int(r["acquisition_status"]=="ACQUIRED_INSTITUTION_JPEG_SHA256"),
"rights_source":SOURCE,"publication_approvals":0,"status":r["acquisition_status"]}
(ROOT/"Acquisition_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
print("SUMMARY",json.dumps(summary,sort_keys=True),flush=True)
