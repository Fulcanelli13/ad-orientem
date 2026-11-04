#!/usr/bin/env python3
"""Read-only Wikimedia Commons original-pixel QA; never publishes or auto-crops."""
import argparse, hashlib, html, io, json, pathlib, urllib.parse, urllib.request
from PIL import Image, ImageOps, ImageStat

UA = "AdOrientemSacredArtReview/1.0 (research; github.com/Fulcanelli13/ad-orientem)"
MAX_BYTES = 35 * 1024 * 1024
MAX_TOTAL = 210 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 120_000_000

def commons_title(url):
    p = urllib.parse.urlsplit(url)
    if p.scheme != "https" or p.hostname != "commons.wikimedia.org" or not p.path.startswith("/wiki/File:"):
        raise ValueError("source must be an exact Commons File page")
    title = urllib.parse.unquote(p.path.split("/wiki/File:", 1)[1]).replace("_", " ")
    if not title or "/" in title or "\\" in title:
        raise ValueError("invalid Commons filename")
    return "File:" + title

def get_bytes(url, cap):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as reply:
        dest = urllib.parse.urlsplit(reply.geturl())
        if dest.scheme != "https" or dest.hostname not in ("commons.wikimedia.org", "upload.wikimedia.org"):
            raise ValueError("redirected outside Wikimedia")
        announced = int(reply.headers.get("Content-Length", 0))
        if announced > cap:
            raise ValueError("declared file size exceeds limit")
        payload = reply.read(cap + 1)
        if len(payload) > cap:
            raise ValueError("download exceeds byte limit")
        return payload

def fetch_info(title):
    endpoint = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({
        "action": "query", "format": "json", "prop": "imageinfo",
        "titles": title, "iiprop": "url|size|sha1|extmetadata"
    })
    pages = json.loads(get_bytes(endpoint, 750000))["query"]["pages"]
    matching = [page["imageinfo"][0] for page in pages.values() if page.get("imageinfo")]
    if len(matching) != 1:
        raise ValueError("exact file not found in Wikimedia metadata")
    return matching[0]

def source_image(info, budget):
    url = info.get("url", "")
    dest = urllib.parse.urlsplit(url)
    if dest.scheme != "https" or dest.hostname != "upload.wikimedia.org" or not dest.path.startswith("/wikipedia/commons/"):
        raise ValueError("file URL outside approved Wikimedia original path")
    size = int(info.get("size", 0))
    if size <= 0 or size > MAX_BYTES:
        raise ValueError("original too large or size unknown; hold for manual handling")
    return get_bytes(url, min(MAX_BYTES, budget)), url

def make_previews(raw, out, ident):
    digest = hashlib.sha256(raw).hexdigest()
    with Image.open(io.BytesIO(raw)) as src:
        src.verify()
    with Image.open(io.BytesIO(raw)) as src:
        im = ImageOps.exif_transpose(src).convert("RGB")
        w, h = im.size
        if w*h > 120_000_000:
            raise ValueError("image exceeds pixel limit")
        preview = im.copy()
        preview.thumbnail((1600, 1600), Image.Resampling.LANCZOS)
        whole = f"{ident}-whole.jpg"
        preview.save(out / whole, "JPEG", quality=85, optimize=True)
        edge_size = min(512, w, h)
        boxes = [(0, 0, edge_size, edge_size), (w-edge_size, 0, w, edge_size),
                 (0, h-edge_size, edge_size, h), (w-edge_size, h-edge_size, w, h)]
        edge_names = []
        for n, b in enumerate(boxes):
            name = f"{ident}-edge-{n}.jpg"
            im.crop(b).save(out / name, "JPEG", quality=90, optimize=True)
            edge_names.append(name)
        s = im.copy()
        s.thumbnail((500, 500), Image.Resampling.LANCZOS)
        variation = [round(x, 2) for x in ImageStat.Stat(s).stddev]
    return {"source_sha256": digest, "width": w, "height": h, "source_bytes": len(raw),
            "preview": whole, "edge_tiles": edge_names, "rgb_stdev": variation,
            "pixels_examined_by_software": True, "human_quality_certified": False,
            "crop_applied": False, "color_altered": False, "publication_approved": False}

def process(manifest, out, limit):
    out.mkdir(parents=True, exist_ok=True)
    remaining = MAX_TOTAL
    report = {"schema": "AO_MASTERPIECE_ORIGINAL_PIXEL_QA_V1", "publication": False,
              "rights_cleared_by_qa": False, "automatic_crop": False, "items": []}
    for item in manifest["candidates"][:limit]:
        r = {"approved_record_index": item["approved_record_index"], "title": item["title"],
             "artist": item["artist"], "source_page": item["commons_file"],
             "license_claim_prior": item.get("license_claim_prior", "UNKNOWN"),
             "status": "HELD", "publication": False}
        try:
            info = fetch_info(commons_title(item["commons_file"]))
            ext = info.get("extmetadata", {})
            r["commons_license_short_name"] = ext.get("LicenseShortName", {}).get("value", "UNKNOWN")
            r["rights_gate"] = "EXACT_FILE_INDEPENDENT_REVIEW_REQUIRED"
            r["commons_reported_bytes"] = info.get("size")
            r["commons_reported_width"] = info.get("width")
            r["commons_reported_height"] = info.get("height")
            r["commons_sha1"] = info.get("sha1")
            if remaining < 1:
                raise ValueError("download budget exhausted")
            raw, url = source_image(info, remaining)
            remaining -= len(raw)
            r["downloaded_source"] = url
            r.update(make_previews(raw, out, str(item["approved_record_index"])))
            if item["approved_record_index"] in (174, 192):
                staged = out / "staged-originals"
                staged.mkdir(exist_ok=True)
                ext = ".jpeg" if item["approved_record_index"] == 174 else ".jpg"
                original_name = str(item["approved_record_index"]) + "-exact-original" + ext
                (staged / original_name).write_bytes(raw)
                r["staged_original_path"] = "staged-originals/" + original_name
                r["staged_original_sha256"] = r["source_sha256"]
                r["staged_original_publication"] = False
            r["status"] = "PIXELS_EXTRACTED_FOR_MANUAL_REVIEW"
        except Exception as exc:
            r["hold_reason"] = str(exc)[:240]
        report["items"].append(r)
    (out/"report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    cards = []
    for r in report["items"]:
        title = html.escape(r["title"])
        status = html.escape(r["status"])
        url = html.escape(r["source_page"], quote=True)
        preview = f'<img src="{r["preview"]}" loading="lazy">' if r.get("preview") else ""
        tiles = "".join(f'<img src="{t}" loading="lazy">' for t in r.get("edge_tiles", []))
        hold = html.escape(r.get("hold_reason",""))
        cards.append(f'<article><h2>{title}</h2><small>{status}</small><p>{preview}</p><div class="tiles">{tiles}</div><p>{hold}</p><a href="{url}">Exact Commons source and rights</a></article>')
    page = '<!doctype html><meta charset="utf-8"><title>AO image QA</title><style>body{background:#121619;color:#eee;font:16px system-ui;max-width:1360px;margin:24px auto}main{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:24px}article{background:#20282d;padding:18px;border-radius:12px}img{max-width:100%;max-height:480px;object-fit:contain}.tiles{display:grid;grid-template-columns:1fr 1fr;gap:6px}a{color:#ade}</style><h1>Original-pixel QA — research only</h1><p>Whole composition and source-resolution corner tiles. No crop, colour alteration, approval or publication.</p><main>' + "".join(cards) + '</main>'
    (out/"review.html").write_text(page, encoding="utf-8")
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", required=True, type=pathlib.Path)
    parser.add_argument("--output", required=True, type=pathlib.Path)
    parser.add_argument("--limit", type=int, default=19)
    args = parser.parse_args()
    if not 1 <= args.limit <= 19:
        parser.error("--limit must be 1 to 19")
    process(json.loads(args.manifest.read_text(encoding="utf-8")), args.output, args.limit)
