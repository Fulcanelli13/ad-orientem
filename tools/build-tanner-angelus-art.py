#!/usr/bin/env python3
"""Build the one offline Tanner Angelus master from the named Commons PD source.

Run only during authorised artwork acquisition. No scene-specific cuts or AI
mutations: the original painting remains the single reusable image.
"""
from __future__ import annotations
import hashlib, io, json, sys
from datetime import date
from pathlib import Path
from urllib.request import Request, urlopen
from PIL import Image, ImageOps

SOURCE = ("https://upload.wikimedia.org/wikipedia/commons/b/b9/"
          "Henry_Ossawa_Tanner%2C_American_%28active_France%29_-_"
          "The_Annunciation_-_Google_Art_Project.jpg")
COMMONS = ("https://commons.wikimedia.org/wiki/File:"
           "Henry_Ossawa_Tanner,_American_(active_France)_-_The_Annunciation"
           "_-_Google_Art_Project.jpg")
OBJECT = "https://www.philamuseum.org/objects/104384"
TARGET = Path("assets/pray/angelus/tanner-annunciation-1898.webp")
LEDGER = Path("assets/pray/angelus/tanner-annunciation-1898.provenance.json")
EXPECTED_SIZE = (4717, 3811)
MAX_DOWNLOAD_BYTES = 7_000_000
MAX_WEBP_BYTES = 550_000

def main() -> int:
    request = Request(SOURCE, headers={
        "User-Agent": "AdOrientemSacredArtPilot/1.0 (source-credited nonprofit devotional prototype)",
        "Accept": "image/jpeg",
    })
    with urlopen(request, timeout=65) as response:
        if response.geturl().split("/")[2].lower() not in {"upload.wikimedia.org", "commons.wikimedia.org"}:
            raise RuntimeError("Source redirected off the permitted Wikimedia host")
        content = response.read(MAX_DOWNLOAD_BYTES + 1)
        if len(content) > MAX_DOWNLOAD_BYTES:
            raise RuntimeError("Image exceeded safe source size")
    source_hash = hashlib.sha256(content).hexdigest()
    image = Image.open(io.BytesIO(content))
    image.load()
    if image.format != "JPEG" or image.size != EXPECTED_SIZE:
        raise RuntimeError(f"Expected original JPEG {EXPECTED_SIZE}, got {image.format}/{image.size}")
    image = ImageOps.exif_transpose(image).convert("RGB")
    image.thumbnail((1920, 1920), Image.Resampling.LANCZOS)
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    best = None
    for quality in (83, 79, 74, 68, 62):
        output = io.BytesIO()
        image.save(output, format="WEBP", quality=quality, method=6)
        if len(output.getvalue()) <= MAX_WEBP_BYTES:
            best = (output.getvalue(), quality)
            break
    if best is None:
        raise RuntimeError("Cannot optimize Tanner painting within mobile memory budget")
    binary, quality = best
    TARGET.write_bytes(binary)
    ledger = {
      "sourceArtwork": {"artist":"Henry Ossawa Tanner","title":"The Annunciation",
                        "year":1898,"museum":"Philadelphia Museum of Art",
                        "accession":"W1899-1-1","objectUrl":OBJECT},
      "digitalSource": {"filePage": COMMONS, "downloadUrl": SOURCE,
                        "license":"Public Domain Mark 1.0",
                        "licenseUrl":"https://creativecommons.org/publicdomain/mark/1.0/",
                        "explanation":"Faithful reproduction of a two-dimensional public-domain work, per Wikimedia Commons",
                        "sourceSha256":source_hash, "sourceDimensions":list(EXPECTED_SIZE)},
      "derivative":{"path":str(TARGET),"format":"image/webp","dimensions":list(image.size),
                    "bytes":len(binary),"sha256":hashlib.sha256(binary).hexdigest(),
                    "quality":quality,"transformation":"Downscale and WebP optimization only; no crop or artificial generation"},
      "review":{"sourceRetrieved":date.today().isoformat(),
                "productionApproval":"pending-phone-visual-and-liturgical-gates"}
    }
    LEDGER.write_text(json.dumps(ledger, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
    assert TARGET.stat().st_size <= MAX_WEBP_BYTES
    print(f"OK {TARGET} {image.size} {len(binary)} bytes; source SHA256 {source_hash}")
    return 0

if __name__ == "__main__":
    sys.exit(main())
