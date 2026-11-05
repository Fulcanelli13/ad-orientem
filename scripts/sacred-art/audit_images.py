#!/usr/bin/env python3
"""Read-only Ad Orientem image audit: no publishing, no gallery writes."""
import argparse, csv, hashlib, html, json, time, urllib.parse
from pathlib import Path
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry
from PIL import Image, ImageFilter, ImageStat

HOSTS = {"iiif.kmska.be", "imagehub.mskgent.be", "dam.museabrugge.be", "imagehub.vlaamsekunstcollectie.be"}
WIKIMEDIA = "https://commons.wikimedia.org/w/api.php"
HEADERS = {"User-Agent": "AdOrientemArtResearch/1.0 (read-only historical art research)"}

def allowed(url, hosts):
    p = urllib.parse.urlparse(url)
    return p.scheme == "https" and p.hostname in hosts

def session():
    s = requests.Session()
    s.headers.update(HEADERS)
    r = Retry(total=2, backoff_factor=1, status_forcelist=[429,500,502,503,504], allowed_methods=["GET"])
    s.mount("https://", HTTPAdapter(max_retries=r))
    return s

def get_json(s, url):
    r = s.get(url, timeout=(12, 40))
    r.raise_for_status()
    if len(r.content) > 5_000_000:
        raise ValueError("Manifest exceeds five megabytes")
    return r.json()

def parse_iiif(m):
    if "sequences" in m:
        canvases = m["sequences"][0].get("canvases", [])
        if not canvases:
            raise ValueError("No IIIF v2 canvases")
        canvas = canvases[0]
        image = canvas["images"][0]["resource"]
        service = image.get("service") or {}
        service = service[0] if isinstance(service,list) else service
        return {
            "width": canvas.get("width") or image.get("width"),
            "height": canvas.get("height") or image.get("height"),
            "service": service.get("@id") or service.get("id"),
            "rights": m.get("license") or "",
            "canvas_count": len(canvases),
            "version": "v2",
        }
    if "items" in m:
        canvases = m["items"]
        if not canvases:
            raise ValueError("No IIIF v3 canvases")
        canvas = canvases[0]
        body = canvas["items"][0]["items"][0]["body"]
        body = body[0] if isinstance(body,list) else body
        service = body.get("service") or []
        service = service[0] if isinstance(service,list) else service
        return {
            "width": canvas.get("width") or body.get("width"),
            "height": canvas.get("height") or body.get("height"),
            "service": service.get("id") or service.get("@id"),
            "rights": m.get("rights") or "",
            "canvas_count": len(canvases),
            "version": "v3",
        }
    raise ValueError("Unrecognised IIIF Presentation format")

def rights_gate(page_rights, manifest_rights):
    p = (page_rights or "").lower()
    m = (manifest_rights or "").lower()
    if "undetermined" in p or "unknown" in p:
        return "HOLD_UNDETERMINED"
    if "rightsstatements.org/page/und" in m or "/vocab/und/" in m:
        return "HOLD_PAGE_MANIFEST_CONFLICT" if ("cc0" in p or "public domain" in p) else "HOLD_UNDETERMINED"
    if any(token in m for token in ["/inc/","/noc-","/cne/"]) and "cc0" not in m:
        return "HOLD_RIGHTS_UNCONFIRMED"
    if "cc0" in p or "public domain" in p:
        return "REUSE_CANDIDATE_OBJECT_POLICY"
    return "HOLD_NEEDS_REVIEW"

def download(s, url, path, max_megabytes=30):
    if not allowed(url, HOSTS | {"upload.wikimedia.org"}):
        raise ValueError("Unapproved image source hostname")
    with s.get(url, timeout=(12,65), stream=True, allow_redirects=False) as r:
        r.raise_for_status()
        if not r.headers.get("Content-Type","").lower().startswith("image/"):
            raise ValueError("Server did not return an image")
        path.parent.mkdir(parents=True,exist_ok=True)
        sha = hashlib.sha256()
        total = 0
        try:
            with path.open("wb") as handle:
                for block in r.iter_content(chunk_size=262144):
                    total += len(block)
                    if total > max_megabytes*1024*1024:
                        raise ValueError("Image exceeds bounded download limit")
                    sha.update(block)
                    handle.write(block)
            with Image.open(path) as image:
                image.verify()
        except BaseException:
            path.unlink(missing_ok=True)
            raise
    return sha.hexdigest(), total

def metrics(path):
    with Image.open(path) as image:
        image.load()
        w,h = image.size
        mono = image.convert("L")
        mono.thumbnail((900,900))
        stat = ImageStat.Stat(mono)
        var = ImageStat.Stat(mono.filter(ImageFilter.FIND_EDGES)).var[0]
        return {
            "pixels_width":w, "pixels_height":h, "short_edge":min(w,h),
            "brightness_mean":round(stat.mean[0],2),
            "edge_variance_diagnostic":round(var,2),
            "format":image.format
        }

def commons_preview(s,url,path):
    p = urllib.parse.urlparse(url)
    if p.hostname != "commons.wikimedia.org" or "/wiki/File:" not in p.path:
        raise ValueError("No selected Wikimedia Commons file")
    title = urllib.parse.unquote(p.path.split("/wiki/",1)[1])
    q = urllib.parse.urlencode({
        "action":"query","format":"json","prop":"imageinfo","titles":title,
        "iiprop":"url|size|mime","iiurlwidth":"1150",
    })
    j = get_json(s, WIKIMEDIA+"?"+q)
    record = next(iter(j.get("query",{}).get("pages",{}).values()),{})
    info = (record.get("imageinfo") or [{}])[0]
    link = info.get("thumburl") or info.get("url")
    if not link:
        raise ValueError("Commons file has no image URL")
    sha, size = download(s,link,path)
    return {"source":link,"sha256":sha,"bytes":size,**metrics(path)}

def report(rows,out):
    out.mkdir(parents=True,exist_ok=True)
    cols = [
        "registry_id","title","artist","museum","museum_accession","museum_object_url",
        "iiif_manifest","manifest_fetch","iiif_version","manifest_width","manifest_height",
        "manifest_short_px","manifest_rights","object_page_rights","rights_gate",
        "iiif_image_url","image_download","image_sha256","downloaded_width","downloaded_height",
        "downloaded_short_px","commons_image_download","commons_preview_url",
        "commons_preview_metrics","identity_caution","hold_reason"
    ]
    with (out/"acquisition_audit.csv").open("w",encoding="utf-8",newline="") as f:
        writer = csv.DictWriter(f,fieldnames=cols)
        writer.writeheader()
        writer.writerows([{key:row.get(key,"") for key in cols} for row in rows])
    (out/"acquisition_audit.json").write_text(json.dumps(rows,indent=2,ensure_ascii=False),encoding="utf-8")
    cards = []
    for row in rows:
        rid = row["registry_id"]
        filename = rid.replace(":","_")
        a = out/"images"/(filename+"_commons.jpg")
        b = out/"images"/(filename+"_museum.jpg")
        left = f'<img src="images/{a.name}" alt="Current handpicked photograph">' if a.exists() else "<p>Current image not downloaded</p>"
        right = f'<img src="images/{b.name}" alt="Museum candidate">' if b.exists() else "<p>Museum image not downloaded</p>"
        cards.append(
            "<article><h2>"+html.escape(row.get("title",""))+"</h2>"
            "<p>"+html.escape(rid)+" | "+html.escape(row.get("museum",""))+"</p>"
            "<p>"+html.escape(row.get("rights_gate",""))+" / "+html.escape(row.get("image_download",""))+"</p>"
            '<div class="pair"><section><h3>Handpicked Commons</h3>'+left+'</section>'
            '<section><h3>Official museum candidate</h3>'+right+"</section></div></article>"
        )
    css = "body{margin:2rem;font:15px system-ui;background:#f1f2f0;color:#273139}article{background:#fff;padding:1.4rem;margin:1rem auto;max-width:1200px;border-radius:10px}.pair{display:grid;grid-template-columns:1fr 1fr;gap:1rem}.pair section{min-width:0}.pair img{max-height:640px;max-width:100%;object-fit:contain}@media(max-width:650px){.pair{grid-template-columns:1fr}}"
    (out/"review_contact_sheet.html").write_text(
        '<!doctype html><html lang="en"><meta charset="utf-8"><title>Sacred Art image review</title>'
        '<style>'+css+'</style><h1>Ad Orientem — research-only image comparison</h1>'
        "<p>No artwork is promoted. Identity, rights and fidelity must be reviewed.</p>"
        +"".join(cards)+"</html>",encoding="utf-8"
    )

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input",default="artworks_177.csv")
    parser.add_argument("--out",default="audit")
    parser.add_argument("--limit",type=int,default=20)
    parser.add_argument("--max-width",type=int,default=2200)
    parser.add_argument("--dry-run",action="store_true")
    args = parser.parse_args()
    source = list(csv.DictReader(open(args.input,encoding="utf-8-sig",newline="")))
    if len(source) != 177 or len({r["registry_id"] for r in source}) != 177:
        raise ValueError("Expected 177 distinct handpicked artwork rows")
    s = session()
    output = Path(args.out)
    rows = []
    attempts = 0
    for row in source:
        item = {**row,"manifest_fetch":"NOT_PROCESSED","image_download":"NOT_PROCESSED",
                "commons_image_download":"NOT_PROCESSED","rights_gate":"UNASSESSED","hold_reason":""}
        manifest = (row.get("iiif_manifest") or "").strip()
        if not manifest:
            item["hold_reason"]="Museum IIIF manifest still unmapped"
            rows.append(item)
            continue
        if attempts >= args.limit:
            item["hold_reason"]="Outside run limit"
            rows.append(item)
            continue
        attempts += 1
        if not allowed(manifest,HOSTS):
            item["hold_reason"]="Museum manifest hostname not on allowlist"
            rows.append(item)
            continue
        if args.dry_run:
            item["manifest_fetch"]="DRY_RUN_NOT_FETCHED"
            item["image_download"]="DRY_RUN_NOT_FETCHED"
            rows.append(item)
            continue
        try:
            info = parse_iiif(get_json(s,manifest))
            w,h = int(info["width"]),int(info["height"])
            item.update(manifest_fetch="SUCCESS",iiif_version=info["version"],
                        manifest_width=w,manifest_height=h,manifest_short_px=min(w,h),
                        manifest_rights=info["rights"],object_page_rights=row.get("rights_on_object_page",""))
            item["rights_gate"]=rights_gate(row.get("rights_on_object_page",""),info["rights"])
            if info["canvas_count"]!=1:
                item["hold_reason"]="Multiple-canvas object: artwork scope needs review"
            base=info["service"]
            if not base or not allowed(base,HOSTS):
                raise ValueError("Image service hostname not on allowlist")
            url=base.rstrip("/")+"/full/"+str(min(max(300,args.max_width),w))+",/0/default.jpg"
            item["iiif_image_url"]=url
            imagepath=output/"images"/(row["registry_id"].replace(":","_")+"_museum.jpg")
            sha,n=download(s,url,imagepath)
            met=metrics(imagepath)
            item.update(image_download="SUCCESS",image_sha256=sha,
                        downloaded_width=met["pixels_width"],downloaded_height=met["pixels_height"],
                        downloaded_short_px=met["short_edge"])
            if item["rights_gate"].startswith("HOLD_"):
                item["hold_reason"]="Rights need reconciliation; do not publish. "+item["hold_reason"]
        except Exception as exc:
            item["image_download"]="FAILED"
            item["hold_reason"]=(item["hold_reason"]+"; "+str(exc))[:500]
        time.sleep(1.5)
        if item["image_download"]=="SUCCESS":
            try:
                old=output/"images"/(row["registry_id"].replace(":","_")+"_commons.jpg")
                current=commons_preview(s,row.get("commons_url",""),old)
                item["commons_image_download"]="SUCCESS"
                item["commons_preview_url"]=current["source"]
                item["commons_preview_metrics"]=json.dumps(current,ensure_ascii=False)
            except Exception as exc:
                item["commons_image_download"]="FAILED: "+str(exc)[:160]
            time.sleep(1.5)
        rows.append(item)
    report(rows,output)
    print(json.dumps({
        "records":len(rows),
        "mapped_iiif":sum(bool(r.get("iiif_manifest")) for r in rows),
        "manifest_success":sum(r.get("manifest_fetch")=="SUCCESS" for r in rows),
        "museum_downloads":sum(r.get("image_download")=="SUCCESS" for r in rows),
        "commons_downloads":sum(r.get("commons_image_download")=="SUCCESS" for r in rows),
        "rights_holds":sum(r.get("rights_gate","").startswith("HOLD_") for r in rows),
    },indent=2))

if __name__=="__main__":
    main()
