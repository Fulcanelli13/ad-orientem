#!/usr/bin/env python3
"""Bounded, read-only IIIF connectivity and 600px preview probe. Research only."""
import csv, json, io, hashlib, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import urlparse
import requests
from PIL import Image
from audit_images import parse_iiif, rights_gate, HOSTS

HERE=Path(__file__).resolve().parent
OUT=Path("artifacts/sacred-art-phase18-fast-probe")
UA="AdOrientemArtResearch/1.0 (research only; no publication)"
def allowed(uri):
    p=urlparse(uri)
    return p.scheme=="https" and p.hostname in HOSTS

def probe(r):
    key=r["registry_id"].replace(":","_")
    result={"registry_id":r["registry_id"],"title":r["title"],
            "museum":r["museum"],"object_url":r["museum_object_url"],
            "manifest":r["iiif_manifest"],"manifest_status":"", "image_status":"",
            "museum_original_size":"", "preview_size":"", "sha256":"",
            "rights_status":"","error":""}
    try:
        uri=r["iiif_manifest"]
        if not allowed(uri): raise ValueError("Manifest hostname not permitted")
        sess=requests.Session()
        sess.headers.update({"User-Agent":UA,"Accept":"application/json"})
        mresp=sess.get(uri,timeout=(6,15),allow_redirects=False)
        if mresp.status_code in (301,302,303,307,308):
            raise ValueError("Manifest redirect to "+str(mresp.headers.get("Location","")))
        mresp.raise_for_status()
        if len(mresp.content)>4_000_000: raise ValueError("Manifest >4MB")
        m=parse_iiif(mresp.json())
        result["manifest_status"]="OK"
        result["museum_original_size"]=f'{m["width"]}x{m["height"]}'
        result["rights_status"]=rights_gate(r.get("rights_on_object_page",""),m["rights"])
        service=m["service"]
        if not service or not allowed(service): raise ValueError("Image service hostname outside allowlist: "+str(service))
        url=service.rstrip("/")+"/full/600,/0/default.jpg"
        sess.headers.update({"Accept":"image/jpeg,image/*"})
        with sess.get(url,timeout=(6,18),stream=True,allow_redirects=False) as response:
            if response.status_code in (301,302,303,307,308):
                raise ValueError("Image redirect to "+str(response.headers.get("Location","")))
            response.raise_for_status()
            size=0
            data=bytearray()
            for ch in response.iter_content(chunk_size=65536):
                size+=len(ch)
                if size>5_000_000: raise ValueError("Preview exceeds 5 MB")
                data.extend(ch)
        blob=bytes(data)
        with Image.open(io.BytesIO(blob)) as img:
            img.load()
            result["preview_size"]=f"{img.width}x{img.height}"
            if img.format not in ("JPEG","PNG"):raise ValueError("Unexpected image format")
        result["sha256"]=hashlib.sha256(blob).hexdigest()
        dest=OUT/"previews"/(key+".jpg")
        dest.parent.mkdir(parents=True,exist_ok=True)
        dest.write_bytes(blob)
        result["image_status"]="OK"
    except Exception as e:
        result["image_status"]="FAILED"
        result["error"]=str(e)[:250]
    return result
def main():
    rows=list(csv.DictReader((HERE/"artworks_177.csv").open(encoding="utf-8-sig",newline="")))
    mapped=[r for r in rows if r["iiif_manifest"]]
    OUT.mkdir(parents=True,exist_ok=True)
    results=[]
    with ThreadPoolExecutor(max_workers=4) as pool:
        for future in as_completed([pool.submit(probe,r) for r in mapped]):
            result=future.result()
            results.append(result)
            print(f'{result["registry_id"]} manifest={result["manifest_status"]} image={result["image_status"]} {result["error"]}',flush=True)
    results.sort(key=lambda r:r["registry_id"])
    (OUT/"results.json").write_text(json.dumps(results,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    with (OUT/"results.csv").open("w",encoding="utf-8",newline="") as handle:
        writer=csv.DictWriter(handle,fieldnames=list(results[0]));writer.writeheader();writer.writerows(results)
    summary={"mapped":len(mapped),"manifests_ok":sum(x["manifest_status"]=="OK" for x in results),
             "previews_downloaded":sum(x["image_status"]=="OK" for x in results),
             "rights_holds":sum(x["rights_status"].startswith("HOLD_") for x in results),
             "not_publication_approval":True}
    (OUT/"summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(summary,indent=2))
if __name__=="__main__":main()
