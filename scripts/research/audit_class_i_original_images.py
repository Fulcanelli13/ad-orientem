#!/usr/bin/env python3
"""Zero-cost source-byte audit. NEVER grants frame-free or publication clearance."""
import argparse
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from PIL import Image, ImageFile

Image.MAX_IMAGE_PIXELS = 220_000_000
ImageFile.LOAD_TRUNCATED_IMAGES = False
ROOT = "https://upload.wikimedia.org/wikipedia/commons/"
# Commons structured-data hashes independently ground these exact uploaded bytes.
COMMONS_SHA1 = {
    "koenig-resurrection": "de5c983c0f4df218573836d0099e495b7084ec27",
    "beuckelaer-easter-wednesday": "8bf8dfbedd099daf6892b4570964d1b5e07d6df2",
}
SOURCES = [
 ("stom-epiphany","8/8a/The_Adoration_of_the_Magi_%28Matthias_Stom%29_-_Nationalmuseum_-_18796.jpg",3650,3747,"Nationalmuseum NM 1792","Nationalmuseum PD"),
 ("koenig-resurrection","f/f6/Clevelandart_2017.192.jpg",2561,3400,"Cleveland 2017.192","Cleveland CC0"),
 ("beuckelaer-easter-wednesday","1/18/Joachim_Beuckelaer_%28Netherlandish_-_The_Miraculous_Draught_of_Fishes_-_Google_Art_Project.jpg",4166,2137,"Getty 71.PB.59","Commons PD-Art; jurisdiction review"),
 ("netherlandish-ember-friday","e/e7/Netherlandish_16th_Century%2C_The_Healing_of_the_Paralytic%2C_c._1560-1590%2C_NGA_12205.jpg",2222,3147,"NGA 1943.7.7","NGA CC0"),
 ("champaigne-christmas-vigil","d/d0/Philippe_de_Champaigne_%281602-1674%29_-_The_Dream_of_Saint_Joseph_-_NG6276_-_National_Gallery.jpg",4421,6000,"National Gallery NG6276","Commons PD-Art; jurisdiction review"),
]
def audit(row, directory, cap=25*1024*1024):
    slug, partial_url, width, height, accession, declared_rights = row
    url = ROOT + partial_url
    report = dict(id=slug,accession=accession,source_original_url=url,source_rights_lead=declared_rights,expected_pixels=[width,height],
                  source_byte_status="FAILED",frame_status="UNVERIFIED_FULL_RESOLUTION_HUMAN_REVIEW",publication_ready=False)
    path=directory/(slug+".jpg")
    try:
        req=Request(url,headers={"User-Agent":"AdOrientem-SourceVerification/1.0", "Accept":"image/jpeg"})
        h=hashlib.sha256()
        sha1=hashlib.sha1()
        n=0
        with urlopen(req,timeout=45) as resp,open(path,"wb") as out:
            redirected=urlparse(resp.geturl())
            if redirected.scheme!="https" or redirected.hostname!="upload.wikimedia.org":
                raise ValueError("Unsafe redirect")
            while True:
                chunk=resp.read(1024*1024)
                if not chunk: break
                n+=len(chunk)
                if n>cap: raise ValueError("Source exceeds 25MiB cap")
                h.update(chunk)
                sha1.update(chunk)
                out.write(chunk)
        with Image.open(path) as im:
            f=im.format
            actual=list(im.size)
            im.verify()
        with Image.open(path) as im:
            im.load()
        if f!="JPEG" or actual != [width,height]:
            raise ValueError("Unexpected image format or dimensions")
        known=COMMONS_SHA1.get(slug)
        if known and sha1.hexdigest()!=known:
            raise ValueError("SHA1 DIFFERENT FROM COMMONS SOURCE VERSION")
        report.update(source_byte_status="SHA256_AND_PIXELS_VERIFIED", sha256=h.hexdigest(),commons_sha1=sha1.hexdigest(),bytes=n,pixels=actual)
    except Exception as e:
        report["error"]=type(e).__name__+": "+str(e)[:180]
    finally:
        path.unlink(missing_ok=True)
    return report
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--output",required=True,type=Path)
    args=ap.parse_args()
    with TemporaryDirectory() as d:
        rows=[audit(row,Path(d)) for row in SOURCES]
    successes=sum(r["source_byte_status"]=="SHA256_AND_PIXELS_VERIFIED" for r in rows)
    results=dict(schema="AO_ART_CLASS_I_ORIGINAL_BINARY_AUDIT_V1",
        checked_at=datetime.now(timezone.utc).isoformat(),
        results=rows, counts=dict(source_attempted=len(rows),bytes_sha256_verified=successes,
        failed=len(rows)-successes,frame_visually_certified=0,publication_ready=0),
        restrictions="Source originals discarded after checking; no image binary, artifact ZIP or artwork published. Full-resolution manual four-edge inspection and separate rights/editorial approval still required.",
        free_public_runner_only=True)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n")
    for r in rows: print(r["id"],r["source_byte_status"],r.get("sha256",r.get("error")))
    return 0 if successes>0 else 2
if __name__=="__main__":
    raise SystemExit(main())
