#!/usr/bin/env python3
"""NGA official image-level Open Access ingestion for Ad Orientem B22.
Source is the frozen artwork catalogue: output is research-only, NEVER publishing.
The CC0 dataset licence by itself does not license each referenced image.
"""
import csv, hashlib, io, json, pathlib, re, time
from datetime import datetime, timezone
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from PIL import Image

MANIFEST=pathlib.Path("data/research/sacred-art-b22-nga31.manifest.json")
SOURCE_CSV="https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/published_images.csv"
POLICY="https://www.nga.gov/artworks/free-images-and-open-access"
OUT=pathlib.Path("artifacts/b22-nga31")
ORIGINALS=OUT/"iiif_openaccess_renditions"
OUT.mkdir(parents=True,exist_ok=True);ORIGINALS.mkdir(exist_ok=True)
Image.MAX_IMAGE_PIXELS=165_000_000
AGENT="AdOrientem-SacredArt-SourceResearch/2.0 (+https://github.com/Fulcanelli13/ad-orientem)"
FIELDS=["asset_source_id","artwork_id","object_id","title","artist","priority","source_url","image_uuid",
"image_openaccess","image_role","iiif_base_url","iiif_image_url","image_record_width","image_record_height",
"metadata_gate","acquisition_status","image_tier","sha256","bytes_acquired","decoded_width","decoded_height",
"decoded_format","long_edge_gate","source_policy","publication_gate","error","checked_utc"]
def now():return datetime.now(timezone.utc).isoformat(timespec="seconds")
def req(url,accept):
    if not url.startswith("https://"):raise ValueError("HTTPS only")
    return urlopen(Request(url,headers={"User-Agent":AGENT,"Accept":accept,"Accept-Encoding":"identity"}),timeout=70)
def trim(value):
    return str(value or "").strip()
def verified_iiif_base(url):
    p=urlsplit(trim(url))
    if p.scheme!="https" or p.hostname!="api.nga.gov" or not re.match(r"^/iiif/[0-9a-zA-Z-]+/?$",p.path):
        raise ValueError("Unapproved NGA IIIF host or base path: "+str(url))
    return trim(url).rstrip("/")
def choose(images):
    permitted=[x for x in images if trim(x.get("openaccess"))=="1" and trim(x.get("iiifurl"))]
    primary=[x for x in permitted if trim(x.get("viewtype")).lower()=="primary"]
    pool=primary or permitted
    pool.sort(key=lambda x: int(x.get("width") or 0)*int(x.get("height") or 0),reverse=True)
    return pool[0] if pool else None
def image_download(row,image):
    base=verified_iiif_base(image.get("iiifurl"))
    url=base+"/full/!3200,3200/0/default.jpg"
    tmp=ORIGINALS/(row["asset_source_id"]+".partial")
    h=hashlib.sha256();size=0
    try:
        with req(url,"image/jpeg,image/*") as response, tmp.open("wb") as output:
            ct=response.headers.get("Content-Type","").lower()
            if not ct.startswith("image/"):raise ValueError("Unexpected response content type "+ct)
            for piece in iter(lambda:response.read(1024*1024),b""):
                size+=len(piece)
                if size>30_000_000:raise ValueError("IIIF image exceeds 30 MB research cap")
                h.update(piece);output.write(piece)
        if size<10_000:raise ValueError("IIIF image unexpectedly small")
        with Image.open(tmp) as picture:
            picture.load()
            w,h_px=picture.size
            fmt=picture.format
        if fmt!="JPEG":raise ValueError("Unexpected NGA IIIF format "+str(fmt))
        tmp.replace(ORIGINALS/(row["asset_source_id"]+".jpg"))
        row.update(iiif_image_url=url,image_tier="NGA_IIIF_OPENACCESS_RENDITION_3200",
            acquisition_status="ACQUIRED_IIIF_RENDITION_HASHED",sha256=h.hexdigest(),
            bytes_acquired=size,decoded_width=w,decoded_height=h_px,decoded_format=fmt,
            long_edge_gate="PASS_2400" if max(w,h_px)>=2400 else "REVIEW_UNDER_2400")
    finally:tmp.unlink(missing_ok=True)
def main():
    data=json.loads(MANIFEST.read_text(encoding="utf-8"))
    records=data["records"]; assert len(records)==31
    if len({r["object_id"] for r in records})!=len(records):raise ValueError("NGA object ID duplicate")
    needed={r["object_id"] for r in records}
    images={k:[] for k in needed}
    with req(SOURCE_CSV,"text/csv") as response:
        text=io.TextIOWrapper(response,encoding="utf-8-sig",errors="replace",newline="")
        reader=csv.DictReader(text)
        cols={c.lower():c for c in reader.fieldnames or []}
        required=("depictstmsobjectid","openaccess","iiifurl","uuid")
        if any(c not in cols for c in required):raise ValueError("NGA image-level rights metadata columns missing: "+str(reader.fieldnames))
        for record in reader:
            object_id=trim(record.get(cols["depictstmsobjectid"]))
            if object_id in images:
                lower={k.lower():v for k,v in record.items()}
                images[object_id].append(lower)
    rows=[];stopped=False
    for rec in records:
        out={name:"" for name in FIELDS}
        out.update(asset_source_id=rec["asset_source_id"],artwork_id=rec["artwork_id"],
            object_id=rec["object_id"],title=rec["title"],artist=rec["artist"],priority=rec["priority"],
            source_url=rec["source_url"],metadata_gate="NOT_CHECKED",acquisition_status="NOT_ATTEMPTED",
            source_policy=POLICY,publication_gate="HOLD",checked_utc=now())
        possibilities=images[rec["object_id"]]
        img=choose(possibilities)
        if not possibilities:
            out.update(metadata_gate="NGA_IMAGE_ROW_NOT_FOUND",acquisition_status="NO_PUBLISHED_IMAGE_ROW")
        elif not img:
            out.update(metadata_gate="NO_IMAGE_LEVEL_OPENACCESS_1",acquisition_status="RIGHTS_OR_IMAGE_HOLD")
        else:
            out.update(image_uuid=img.get("uuid",""),image_openaccess="1",image_role=img.get("viewtype",""),
                iiif_base_url=img.get("iiifurl",""),image_record_width=img.get("width",""),
                image_record_height=img.get("height",""),metadata_gate="OPENACCESS_IMAGE_ROW_VERIFIED")
            if stopped:
                out["acquisition_status"]="DEFERRED_IIIF_HOST_429"
            else:
                try:
                    image_download(out,img)
                except HTTPError as exc:
                    if exc.code==429:
                        stopped=True
                        out["acquisition_status"]="DEFERRED_IIIF_HOST_429"
                    else:out["acquisition_status"]="IIIF_DOWNLOAD_FAILED"
                    out["error"]=str(exc)[:260]
                except (URLError,ValueError,OSError,Image.DecompressionBombError) as exc:
                    out["acquisition_status"]="IIIF_DOWNLOAD_FAILED"
                    out["error"]=str(exc)[:260]
            time.sleep(0.45)
        rows.append(out)
        with (OUT/"Acquisition_results.csv").open("w",newline="",encoding="utf-8") as file:
            writer=csv.DictWriter(file,fieldnames=FIELDS);writer.writeheader();writer.writerows(rows)
        print(rec["object_id"],out["metadata_gate"],out["acquisition_status"],flush=True)
    summary={"wave":"B22NGA31","source_object_ids":len(records),"image_openaccess_verified":sum(x["metadata_gate"]=="OPENACCESS_IMAGE_ROW_VERIFIED" for x in rows),
        "downloaded_iiif_renditions":sum(x["acquisition_status"]=="ACQUIRED_IIIF_RENDITION_HASHED" for x in rows),
        "status_counts":{st:sum(x["acquisition_status"]==st for x in rows) for st in sorted({x["acquisition_status"] for x in rows})},
        "not_archival_originals":True,"publication_approvals_created":0,"image_source_rights_from":"published_images.csv image.openaccess=1; not dataset CC0 alone",
        "review_placement_needed":True,"checked_utc":now()}
    (OUT/"Acquisition_summary.json").write_text(json.dumps(summary,indent=2),encoding="utf-8")
    print("SUMMARY "+json.dumps(summary,sort_keys=True),flush=True)
if __name__=="__main__":main()
