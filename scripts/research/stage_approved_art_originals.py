#!/usr/bin/env python3
"""One-time CC0 original transfer for QA, never a production/artwork release.

Runs on a FREE public-repo GitHub-hosted runner on a research-only branch.
Image bytes are staged temporarily to allow transfer to private folio-core.
Strict museum host, path, accession, SHA256 and pixel checks.
No files can be marked frame-free merely by automated inspection.
"""
from __future__ import annotations
import hashlib
import base64
import json
from pathlib import Path
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from PIL import Image, ImageOps, ImageDraw
from datetime import datetime, timezone

DEST=Path("data/research/_art_transfer_quarantine_20261028")
FILES=[
    {"id":"murillo-immaculate-conception","accession":"1959.189",
     "url":"https://openaccess-cdn.clevelandart.org/1959.189/1959.189_print.jpg",
     "sha256":"9630b345caf4062287f16d9d8e0b728b87938f4a3b22eb1ae43d888c518f9d6a",
     "size":4691706,"pixels":[1951,3400],"editorial":"APPROVED"},
    {"id":"cavallino-adoration-shepherds","accession":"1968.100",
     "url":"https://openaccess-cdn.clevelandart.org/1968.100/1968.100_print.jpg",
     "sha256":"115e78e0c096c9274051fa89f277d93392cec097474d183c1e4f20a371960268",
     "size":6445697,"pixels":[3400,2905],"editorial":"APPROVED"}
]

def download_exact(obj):
    url=obj["url"]
    p=urlparse(url)
    if p.scheme!="https" or p.hostname!="openaccess-cdn.clevelandart.org":
        raise ValueError("Unauthorized image hostname")
    if p.path!=f"/{obj['accession']}/{obj['accession']}_print.jpg":
        raise ValueError("Only Cleveland exact PRIMARY art image allowed, never framed alternates")
    DEST.mkdir(parents=True,exist_ok=True)
    original=DEST/(obj["id"]+".jpg")
    req=Request(url,headers={"User-Agent":"AdOrientem-CC0-Art-Source-Quarantine/1.0"})
    h=hashlib.sha256()
    total=0
    with urlopen(req,timeout=50) as resp,original.open("wb") as output:
        end=urlparse(resp.geturl())
        if end.scheme!="https" or end.hostname!="openaccess-cdn.clevelandart.org":
            raise ValueError("Unexpected museum redirect")
        while True:
            data=resp.read(1024*1024)
            if not data:break
            total+=len(data)
            if total>10_000_000: raise ValueError("Image exceeds restricted maximum")
            h.update(data)
            output.write(data)
    if total!=obj["size"] or h.hexdigest()!=obj["sha256"]:
        original.unlink(missing_ok=True)
        raise ValueError("Source bytes mismatch previously verified museum original")
    with Image.open(original) as im:
        if im.format!="JPEG" or list(im.size)!=obj["pixels"]: raise ValueError("Unexpected source type/size")
        im.verify()
    return original

def make_review_sheet(image_file,obj):
    with Image.open(image_file) as src:
        image=ImageOps.exif_transpose(src).convert("RGB")
        w,h=image.size
        sw=max(100,round(w*.14)); sh=max(100,round(h*.14))
        areas=[
          ("COMPLETE", image.copy()),
          ("TOP", image.crop((0,0,w,sh))),
          ("BOTTOM",image.crop((0,h-sh,w,h))),
          ("LEFT",image.crop((0,0,sw,h))),
          ("RIGHT",image.crop((w-sw,0,w,h))),
          ("CORNER TOP LEFT", image.crop((0,0,sw,sh))),
          ("CORNER TOP RIGHT",image.crop((w-sw,0,w,sh))),
          ("CORNER BOTTOM LEFT",image.crop((0,h-sh,sw,h))),
          ("CORNER BOTTOM RIGHT",image.crop((w-sw,h-sh,w,h)))
        ]
        tw,th=500,440
        canvas=Image.new("RGB",(tw*3,th*3), "#202020")
        draw=ImageDraw.Draw(canvas)
        for n,(label,tile) in enumerate(areas):
            x=n%3*tw;y=n//3*th
            tile.thumbnail((tw-24,th-55),Image.Resampling.LANCZOS)
            canvas.paste(tile,(x+(tw-tile.width)//2,y+39+(th-50-tile.height)//2))
            draw.text((x+12,y+10),label,fill="#f2f2f2")
        dest=DEST/(obj["id"]+"__QA_EDGES.jpg")
        canvas.save(dest,"JPEG",quality=89,optimize=True)
        return dest

def main():
    manifest={"schema":"AO_ART_SOURCE_TEMPORARY_TRANSFER_V1",
              "created_at_utc":datetime.now(timezone.utc).isoformat(),
              "status":"QUARANTINE_NOT_PUBLISHED",
              "frame_free_certified":False,
              "publication":False,
              "purpose":"Move approved exact-source bytes into PRIVATE archive; remove this staging copy after transfer",
              "sources":[]}
    for item in FILES:
        original=download_exact(item)
        sheet=make_review_sheet(original,item)
        payload=base64.b64encode(original.read_bytes()).decode("ascii")
        chunks=[payload[j:j+500000] for j in range(0,len(payload),500000)]
        transfer_names=[]
        for k,part in enumerate(chunks):
            chunk_file=DEST/(item["id"]+f".b64.part{k:03d}.txt")
            chunk_file.write_text(part,encoding="ascii")
            transfer_names.append(chunk_file.as_posix())
        manifest["sources"].append({**item,
            "binary_file":original.as_posix(),
            "qa_sheet_file":sheet.as_posix(),
            "base64_transfer_chunks":transfer_names,
            "base64_transfer_chunk_count":len(chunks),
            "sha256_verified":True,"frame_four_edge_manual":"PENDING",
            "permanently_archived_in_private_repo":False})
    (DEST/"manifest.json").write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
    print("Two exact CC0 originals staged with hash validation, independent no-frame review still required")

if __name__=="__main__":
    main()
