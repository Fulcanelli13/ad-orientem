#!/usr/bin/env python3
"""Read-only Wikimedia Commons original-pixel QA; never publishes or auto-crops."""
import argparse, hashlib, html, io, json, pathlib, urllib.parse, urllib.request, urllib.error, time
from PIL import Image, ImageOps, ImageStat

UA = "AdOrientemSacredArtReview/1.0 (research; github.com/Fulcanelli13/ad-orientem)"
MAX_BYTES = 35 * 1024 * 1024
MAX_TOTAL = 210 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 120_000_000

def commons_title(url):
    p = urllib.parse.urlsplit(url)
    if p.scheme != "https" or p.hostname != "commons.wikimedia.org" or not urllib.parse.unquote(p.path).startswith("/wiki/File:"):
        raise ValueError("source must be an exact Commons File page")
    title = urllib.parse.unquote(p.path).split("/wiki/File:", 1)[1].replace("_", " ")
    if not title or "/" in title or "\\" in title:
        raise ValueError("invalid Commons filename")
    return "File:" + title

def get_bytes(url, cap):
    """Bounded download with delayed retry only for temporary Wikimedia throttling."""
    for attempt in range(4):
        if attempt:
            time.sleep((2, 5, 12)[attempt - 1])
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "image/*"})
        try:
            with urllib.request.urlopen(req, timeout=55) as reply:
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
        except urllib.error.HTTPError as e:
            if e.code not in (429, 502, 503, 504) or attempt == 3:
                raise ValueError(f"HTTP {e.code}") from e
    raise ValueError("download exhausted retries")

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

def exact_original_info(title):
    """Derive original from an approved exact Commons File title, not a search."""
    if not title.startswith("File:"):
        raise ValueError("invalid exact Commons File title")
    filename = title[5:].replace(" ", "_")
    if not filename or "/" in filename or "\\" in filename:
        raise ValueError("unsafe Commons filename")
    digest = hashlib.md5(filename.encode("utf-8")).hexdigest()
    encoded = urllib.parse.quote(filename, safe="()_,.-")
    url = f"https://upload.wikimedia.org/wikipedia/commons/{digest[0]}/{digest[:2]}/{encoded}"
    return {"url": url, "size": 0, "source": "APPROVED_EXACT_TITLE_DIRECT_ORIGINAL"}

def source_image(info, budget):
    url = info.get("url", "")
    dest = urllib.parse.urlsplit(url)
    if dest.scheme != "https" or dest.hostname != "upload.wikimedia.org" or not dest.path.startswith("/wikipedia/commons/"):
        raise ValueError("file URL outside approved Wikimedia original path")
    size = int(info.get("size", 0))
    if size > MAX_BYTES:
        raise ValueError("original too large; hold for manual handling")
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

def process(manifest, out, limit, *, direct_recovery=False, held_only=False):
    out.mkdir(parents=True, exist_ok=True)
    remaining = MAX_TOTAL
    report = {"schema": "AO_MASTERPIECE_ORIGINAL_PIXEL_QA_V1", "publication": False,
              "rights_cleared_by_qa": False, "automatic_crop": False, "items": []}
    for item in manifest["candidates"][:limit]:
        if held_only and item["approved_record_index"] in (174, 192, 372, 373):
            continue
        r = {"approved_record_index": item["approved_record_index"], "title": item["title"],
             "artist": item["artist"], "source_page": item["commons_file"],
             "license_claim_prior": item.get("license_claim_prior", "UNKNOWN"),
             "status": "HELD", "publication": False}
        try:
            title = commons_title(item["commons_file"])
            info = exact_original_info(title) if direct_recovery else fetch_info(title)
            if direct_recovery and info["url"].lower().endswith((".tiff", ".tif")):
                raise ValueError("oversized/multipage TIFF requires separate archival extraction")
            ext = info.get("extmetadata", {})
            r["commons_license_short_name"] = ext.get("LicenseShortName", {}).get("value", "UNKNOWN")
            r["rights_gate"] = "EXACT_FILE_INDEPENDENT_REVIEW_REQUIRED"
            r["source_mode"] = "DIRECT_APPROVED_TITLE_NO_LICENSE_METADATA" if direct_recovery else "COMMONS_IMAGEINFO"
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
            if direct_recovery:
                staged = out / "exact-originals"
                staged.mkdir(exist_ok=True)
                original_name = str(item["approved_record_index"]) + ".bin"
                (staged / original_name).write_bytes(raw)
                r["staged_original_path"] = "exact-originals/" + original_name
                r["staged_original_sha256"] = r["source_sha256"]
                r["staged_original_publication"] = False
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
        if direct_recovery:
            (out/"report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
            time.sleep(1.5)
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
    parser.add_argument("--direct-recovery", action="store_true")
    parser.add_argument("--held-only", action="store_true")
    args = parser.parse_args()
    if not 1 <= args.limit <= 19:
        parser.error("--limit must be 1 to 19")
    process(json.loads(args.manifest.read_text(encoding="utf-8")), args.output, args.limit,
            direct_recovery=args.direct_recovery, held_only=args.held_only)
