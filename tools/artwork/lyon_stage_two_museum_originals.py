#!/usr/bin/env python3
"""Stage only two exact museum-original photographs from Lyon's official press page.

Images and reports are ephemeral GitHub Actions artifacts, NOT app publications.
"""
import argparse, hashlib, io, json, pathlib
from urllib.parse import urlsplit
from urllib.request import Request, urlopen
from PIL import Image, ImageOps, ImageStat

SOURCES = [
    {"record_id": 372, "artist": "Pietro Perugino", "title": "The Ascension of Christ",
     "url": "https://www.mba-lyon.fr/sites/mba/files/content/medias/images/2020-07/perugin_ascension_du_christ_presse.jpg",
     "prior_commons_pixels": [698, 930]},
    {"record_id": 376, "artist": "Peter Paul Rubens", "title": "The Adoration of the Magi",
     "url": "https://www.mba-lyon.fr/sites/mba/files/content/medias/images/2020-07/rubens_ladoration_des_mages.jpg",
     "prior_commons_pixels": [4500, 3417]},
]
POLICY_URL = "https://www.mba-lyon.fr/fr/article/peintures-visuels-pour-la-presse"
CREDIT = "Image © Lyon MBA - Photo Alain Basset"
MAX_BYTES = 36_000_000
Image.MAX_IMAGE_PIXELS = 110_000_000

def exact_allowed(url):
    p = urlsplit(url)
    return p.scheme == "https" and p.hostname == "www.mba-lyon.fr" and p.path.startswith("/sites/mba/files/content/medias/images/") and not p.username and not p.password

def fetch_exact(url):
    if not exact_allowed(url):
        raise ValueError("non-museum or out-of-scope image URL")
    req = Request(url, headers={"User-Agent": "AdOrientemArtResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)", "Accept": "image/*"})
    with urlopen(req, timeout=45) as response:
        if not exact_allowed(response.geturl()):
            raise ValueError("image redirected outside official museum source")
        if int(response.headers.get("Content-Length") or 0) > MAX_BYTES:
            raise ValueError("original exceeds size limit")
        raw = response.read(MAX_BYTES + 1)
        if len(raw) > MAX_BYTES:
            raise ValueError("image exceeds byte limit")
        return raw, response.headers.get("Content-Type", "")

def inspect(raw, record_id, output):
    with Image.open(io.BytesIO(raw)) as im:
        im.verify()
    with Image.open(io.BytesIO(raw)) as orig:
        source_format = orig.format
        image = ImageOps.exif_transpose(orig).convert("RGB")
        width, height = image.size
        if not 100 <= width <= 16000 or not 100 <= height <= 16000 or width*height > 110_000_000:
            raise ValueError("image dimensions outside allowed range")
        whole = image.copy()
        whole.thumbnail((1700, 1700), Image.Resampling.LANCZOS)
        whole_path = f"{record_id}-museum-whole.jpg"
        whole.save(output / whole_path, "JPEG", quality=88, optimize=True)
        edge = min(512, width, height)
        rects = ((0,0,edge,edge), (width-edge,0,width,edge),
                 (0,height-edge,edge,height), (width-edge,height-edge,width,height))
        edges = []
        for i, rect in enumerate(rects):
            name = f"{record_id}-museum-edge-{i}.jpg"
            image.crop(rect).save(output / name, "JPEG", quality=92)
            edges.append(name)
        stat = ImageStat.Stat(whole)
    name = f"{record_id}-museum-original.bin"
    (output / name).write_bytes(raw)
    return {"original_file": name, "source_sha256": hashlib.sha256(raw).hexdigest(),
            "bytes": len(raw), "format": source_format,
            "width": width, "height": height, "preview_file": whole_path,
            "edge_detail_files": edges, "rgb_stddev": [round(n, 2) for n in stat.stddev],
            "automatic_crop": False, "color_retouched": False, "publication": False}

def run(output):
    output.mkdir(parents=True, exist_ok=True)
    report = {"schema": "AO_LYON_TWO_MUSEUM_ORIGINAL_PIXEL_PREFLIGHT_V1",
              "source_policy": POLICY_URL, "credit": CREDIT, "publication": False,
              "app_license_final": False, "protected_assignments_overwritten": False,
              "notes": "Official press-photo page says reproduction libre de droit. Verify rights scope for app/gallery separately.",
              "items": []}
    for s in SOURCES:
        entry = {**s, "status": "HELD", "publication": False}
        try:
            raw, ctype = fetch_exact(s["url"])
            entry["http_content_type"] = ctype
            entry.update(inspect(raw, s["record_id"], output))
            entry["status"] = "SOURCE_PIXELS_INSPECTABLE"
        except Exception as e:
            entry["hold_reason"] = str(e)[:400]
        report["items"].append(entry)
        (output / "report.json").write_text(json.dumps(report, indent=2, ensure_ascii=False), encoding="utf-8")
    return report

if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("--output", type=pathlib.Path, required=True)
    args = p.parse_args()
    result = run(args.output)
    print("Decoded", sum(x["status"] == "SOURCE_PIXELS_INSPECTABLE" for x in result["items"]), "of", len(result["items"]))
    for x in result["items"]:
        print(x["record_id"], x["status"], x.get("width"), x.get("height"), x.get("hold_reason",""))
