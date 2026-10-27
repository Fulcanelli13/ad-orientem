#!/usr/bin/env python3
"""Museum-hosted alternative to rate-limited Commons originals. No frame certification."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
from urllib.request import Request, urlopen
from urllib.parse import urlparse
from PIL import Image, ImageFilter, ImageStat

OUT=Path("data/research/sacred-art-20261027-museum-origin-source-byte-report.v1.json")
API_BASE="https://openaccess-api.clevelandart.org/api/artworks/"
CLEVELAND_SOURCES=[
    ("2017.192","koenig-resurrection","koenig","BATCH3_EDITORIAL_PENDING"),
    ("1959.189","murillo-immaculate-conception","murillo","BATCH2_EDITORIAL_APPROVED"),
    ("1968.100","cavallino-christmas","cavallino","BATCH2_EDITORIAL_APPROVED")
]
NGA="https://api.nga.gov/iiif/294e57e7-14ef-4e2e-8b3d-081b4cc05fd6/full/full/0/default.jpg"
CAP=25*1024*1024
def read_json(url):
    with urlopen(Request(url,headers={"User-Agent":"AdOrientem-Art-Provenance/1.0","Accept":"application/json"}),timeout=35) as r:
        return json.load(r)

def pixel_diagnostics(image):
    """Quantitative edge and fidelity indicators. NOT a frame-free visual certification."""
    im=image.convert("RGB")
    im.thumbnail((1200, 1200), Image.Resampling.LANCZOS)
    w,h=im.size
    pad=max(3, round(min(w,h)*0.025))
    edge_boxes={
      "top":((0,0,w,pad),(0,pad,w,2*pad)),
      "bottom":((0,h-pad,w,h),(0,h-2*pad,w,h-pad)),
      "left":((0,0,pad,h),(pad,0,2*pad,h)),
      "right":((w-pad,0,w,h),(w-2*pad,0,w-pad,h))
    }
    per_edge={}
    flags=[]
    for edge,(outer,inner) in edge_boxes.items():
        out=ImageStat.Stat(im.crop(outer))
        inside=ImageStat.Stat(im.crop(inner))
        outer_std=round(sum(out.stddev)/3,2)
        inner_std=round(sum(inside.stddev)/3,2)
        outer_lum=round(sum(out.mean)/3,2)
        inner_lum=round(sum(inside.mean)/3,2)
        flag=outer_std<6 and inner_std>18 and abs(inner_lum-outer_lum)>12
        per_edge[edge]={"outer_rgb_std_average":outer_std,"inner_rgb_std_average":inner_std,
                        "outer_luminance_proxy":outer_lum,"inner_luminance_proxy":inner_lum,
                        "uniform_external_band_heuristic_flag":flag}
        if flag: flags.append(edge)
    gray=im.convert("L")
    hist=gray.histogram()
    total=sum(hist)
    ed=gray.filter(ImageFilter.FIND_EDGES)
    return {
      "method":"Pillow downsampled 1200px edge-band texture+tone scan, not visual approval",
      "sample_dimensions":[w,h],
      "edge_strips":per_edge,
      "heuristic_flags":flags,
      "image_dark_pixels_pct":round(sum(hist[:10])*100/total,3),
      "image_bright_pixels_pct":round(sum(hist[246:])*100/total,3),
      "edge_intensity_mean":round(ImageStat.Stat(ed).mean[0],3),
      "full_resolution_four_edge_visual_result":"NOT_DONE",
      "frame_clearance":"BLOCKED",
      "automated_no_frame_claim":False
    }

def fetch_image(url,folder,id_,host):
    parsed=urlparse(url)
    if parsed.scheme!="https" or not (parsed.hostname==host or parsed.hostname.endswith("."+host)):
        raise ValueError("Image URL not from authorised museum hostname")
    path=folder/(id_+".jpg")
    n=0
    h=hashlib.sha256()
    with urlopen(Request(url,headers={"User-Agent":"AdOrientem-Art-Provenance/1.0","Accept":"image/jpeg"}),timeout=45) as response, path.open("wb") as fh:
        actual=urlparse(response.geturl())
        if actual.scheme!="https" or not (actual.hostname==host or actual.hostname.endswith("."+host)):
            raise ValueError("Off-museum redirect blocked")
        while (chunk:=response.read(1024*1024)):
            n+=len(chunk)
            if n>CAP: raise ValueError("Image over 25MiB cap")
            h.update(chunk);fh.write(chunk)
    with Image.open(path) as im:
        fmt=im.format
        dims=list(im.size)
        im.verify()
    with Image.open(path) as im:
        im.load()
    if fmt!="JPEG" or min(dims)<1500: raise ValueError("Not a sufficiently large intact JPEG")
    with Image.open(path) as img:
        quality=pixel_diagnostics(img)
    path.unlink(missing_ok=True)
    return {"url":url,"sha256":h.hexdigest(),"bytes":n,"pixels":dims,"format":fmt,
            "image_diagnostics":quality}
def main():
    rows=[]
    with TemporaryDirectory() as td:
        folder=Path(td)
        for accession, name, slug, editorial in CLEVELAND_SOURCES:
            cma={"id":name,"museum":"Cleveland Museum of Art","accession":accession,
                "editorial_status":editorial,
                "frame_status":"UNVERIFIED_FOUR_EDGE_HUMAN_INSPECTION",
                "release":False,"source_byte_status":"FAILED"}
            try:
                obj=read_json(API_BASE+accession)["data"]
                if str(obj.get("accession_number"))!=accession or obj.get("share_license_status")!="CC0":
                    raise ValueError("Cleveland object or CC0 identity mismatch")
                images=obj.get("images") or {}
                print_url=(images.get("print") or images.get("web") or {}).get("url")
                if not print_url:raise ValueError("No museum image URL")
                cma.update(fetch_image(print_url,folder,slug,"clevelandart.org"))
                cma["source_byte_status"]="MUSEUM_IMAGE_VERIFIED"
                cma["source_variant"]="CLEVELAND_API_PRINT_OR_WEB_NOT_COMMONS_JPEG"
            except Exception as e:
                cma["error"]=type(e).__name__+": "+str(e)[:200]
            rows.append(cma)
        nga={"id":"netherlandish-ember-friday","museum":"National Gallery of Art","accession":"1943.7.7",
            "frame_status":"UNVERIFIED_FOUR_EDGE_HUMAN_INSPECTION","release":False,"source_byte_status":"FAILED"}
        try:
            nga.update(fetch_image(NGA,folder,"paralytic","nga.gov"))
            nga["source_byte_status"]="MUSEUM_IMAGE_VERIFIED"
            nga["source_variant"]="NGA_ORIGINAL_IIIF_NOT_COMMONS_JPEG"
        except Exception as e:
            nga["error"]=type(e).__name__+": "+str(e)[:200]
        rows.append(nga)
    OUT.parent.mkdir(parents=True,exist_ok=True)
    count=sum(r["source_byte_status"]=="MUSEUM_IMAGE_VERIFIED" for r in rows)
    required_approved={"murillo-immaculate-conception","cavallino-christmas"}
    verified_approved={r["id"] for r in rows if r["source_byte_status"]=="MUSEUM_IMAGE_VERIFIED"}
    approved_failures=sorted(required_approved-verified_approved)
    OUT.write_text(json.dumps({"schema":"AO_MUSEUM_IMAGE_BYTES_AUDIT_V2",
        "checked_utc":datetime.now(timezone.utc).isoformat(),"source_count":len(rows),
        "museum_bytes_verified":count,"approved_source_count":len(required_approved),
        "approved_bytes_verified":len(required_approved)-len(approved_failures),
        "approved_failed":approved_failures,"frame_visually_certified":0,"release_count":0,
        "note":"Independent museum-origin sources, including two previously user-approved Class I paintings. Hash applies ONLY to this downloaded variant. Source images deleted on completion; manual four-edge inspection still mandatory.",
        "results":rows},indent=2)+"\n")
    print("museum source files verified:",count)
    for r in rows: print(r["id"],r["source_byte_status"],r.get("error",r.get("sha256","")))
    if approved_failures:
        print("FAIL CLOSED: approved paintings not byte-verified:", ", ".join(approved_failures))
        return 3
    return 0 if count else 2
if __name__=="__main__":
    raise SystemExit(main())
