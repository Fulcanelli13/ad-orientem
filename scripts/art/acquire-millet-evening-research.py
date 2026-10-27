#!/usr/bin/env python3
"""Acquire the high-resolution *candidate* Millet Angelus from Wikimedia Commons.

The editorial primary for Evening Prayer remains undecided; do not publish,
rewrite the original Frère choice, enhance the photograph, or certify quality.
"""
import hashlib
import io
import json
from pathlib import Path
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "assets/staged/module-hero-evening-candidate-20261027"
TITLE = "Jean-François Millet - The Angelus - Google Art Project.jpg"
SOURCE_PAGE = "https://commons.wikimedia.org/wiki/File:Jean-Fran%C3%A7ois_Millet_-_The_Angelus_-_Google_Art_Project.jpg"
MUSEUM_PAGE = "https://www.musee-orsay.fr/en/artworks/langelus-345"
PIXELS = (7053, 5864)
MAX_BYTES = 12 * 1024 * 1024
UA = "AdOrientemResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)"

def fetch(url, hosts, size=MAX_BYTES):
    p = urlsplit(url)
    if p.scheme != "https" or p.hostname not in hosts:
        raise ValueError("Unexpected source host")
    with urlopen(Request(url, headers={"User-Agent": UA}), timeout=60) as f:
        q = urlsplit(f.geturl())
        if q.scheme != "https" or q.hostname not in hosts:
            raise ValueError("Source redirected outside allowed host")
        raw = f.read(size + 1)
    if not raw or len(raw) > size:
        raise ValueError("Image oversized or missing")
    return raw

def main():
    # Candidate only: never turn the editorial preference into an implicit final choice.
    ledger = json.loads((ROOT / 'data/research/module-hero-editorial-decision-ledger-2026-10-26.review19.json').read_text())
    evening = next(x for x in ledger['final_approved_heroes'] if x['module_id'] == 'evening')
    if evening.get('artist') != 'Pierre-Édouard Frère' or evening.get('title') != 'The Prayer':
        raise ValueError('The pinned review19 Evening Prayer baseline changed; reconcile editorial choices before acquisition')
    params = urlencode({"action": "query", "format": "json", "prop": "imageinfo",
                        "iiprop": "url|size|sha1|mime|extmetadata",
                        "titles": "File:" + TITLE})
    info_raw = fetch("https://commons.wikimedia.org/w/api.php?" + params,
                     {"commons.wikimedia.org"}, 500000)
    data = json.loads(info_raw)
    page = next(iter(data["query"]["pages"].values()))
    info = page["imageinfo"][0]
    if info["mime"] != "image/jpeg" or (info["width"], info["height"]) != PIXELS:
        raise ValueError("Wrong original image format or dimensions")
    if info["size"] > MAX_BYTES or len(info["sha1"]) != 40:
        raise ValueError("Image is oversized or missing SHA-1")
    # For research only: Commons PD-Art is a rights lead, not automatic jurisdiction clearance.
    rights = json.dumps(info.get("extmetadata", {}), ensure_ascii=False).lower()
    if "public domain" not in rights and "pd-art" not in rights:
        raise ValueError("Public-domain evidence missing from current Commons file")
    raw = fetch(info["url"], {"upload.wikimedia.org"})
    sha1 = hashlib.sha1(raw).hexdigest()
    sha256 = hashlib.sha256(raw).hexdigest()
    if sha1 != info["sha1"].lower() or len(raw) != info["size"]:
        raise ValueError("Download differs from published original SHA-1 or length")
    with Image.open(io.BytesIO(raw)) as im:
        im.verify()
    with Image.open(io.BytesIO(raw)) as im:
        if im.format not in ("JPEG", "MPO") or im.size != PIXELS:
            raise ValueError("Decoded source dimensions differ")
        im.load()
        icc = bool(im.info.get("icc_profile"))
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / "millet-angelus-google-art-original.jpg"
    if dest.exists():
        if hashlib.sha256(dest.read_bytes()).hexdigest() != sha256:
            raise ValueError("Prior archive differs: never overwrite research original")
    else:
        dest.write_bytes(raw)
    record = {
      "object": "Jean-Francois Millet — L'Angelus (1857–1859)",
      "institution": "Musee d'Orsay", "museum_page": MUSEUM_PAGE,
      "source_page": SOURCE_PAGE, "source_name": TITLE,
      "research_source_path": str(dest.relative_to(ROOT)),
      "sha1": sha1, "sha256": sha256, "bytes": len(raw),
      "width_px": PIXELS[0], "height_px": PIXELS[1],
      "icc_profile_embedded": icc,
      "file_role": "provisional Evening Prayer *candidate* only",
      "editorial_final_selected": False, "pristine_photo_verified": False,
      "photo_rights_approved": False, "app_publication_approved": False,
      "visual_exceptions_pending": [
        "compare photograph and colour against Musee d'Orsay official record",
        "inspect native-pixel subject and painting surface; detect scan sharpening",
        "confirm frameless full painted surface and mobile composition",
        "jurisdiction-specific photographic reproduction rights"
      ],
      "cost_eur": 0
    }
    (OUT / "millet-acquisition.json").write_text(
        json.dumps(record, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(json.dumps({"archived":True, "bytes":len(raw), "sha256":sha256,
                      "quality_passed":False, "editorial_selected":False}))

if __name__ == "__main__":
    main()
