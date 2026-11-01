#!/usr/bin/env python3
"""One-shot, fail-closed import of two source-verified TLM exterior photographs.

Offline only: reuse already acquired, exact Commons-original JPEG files from the
user's 13 previously supplied archives. Requires AO_TLM_ORIGINALS_DIR. No
new network fetch, no licence assumptions and no automatic publication.
"""
import hashlib
import io
import os
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[2]
DEST = ROOT / "assets" / "approved" / "directory-media"

SOURCES = (
    {
        "id": "RG-843570C4C0E0",
        "name": "GB-groombridge-st-pius-v.webp",
        "url": "https://upload.wikimedia.org/wikipedia/commons/1/18/Church_of_St_Pius_V%2C_Groombridge.JPG",
        "source_sha1": "2287d8cf585499fa4525c5df17fd1b0d81e399c7",
        "source_size": (1800, 2000),
        "derivative_size": (1440, 1600),
        "derivative_sha256": "2aac4d9122a20e32000261e040acc9a35f37fcdcc51cdddd0ca12957ac56a94d",
    },
    {
        "id": "RG-93691FBCC8E6",
        "name": "GB-brighton-st-mary-magdalen.webp",
        "url": "https://upload.wikimedia.org/wikipedia/commons/1/18/St_Mary_Magdalen%27s_RC_Church%2C_Upper_North_Street%2C_Brighton_%28NHLE_Code_1381058%29.JPG",
        "source_sha1": "9fda9bea36116380d0e2a52fb796745bb7fc2fe1",
        "source_size": (1900, 2500),
        "derivative_size": (1216, 1600),
        "derivative_sha256": "f73bb8401082f27804496eb7e983067b6333f5dc9247cdd5637e35d8c363db61",
    },
)

def get_source(spec):
    offline = os.environ.get("AO_TLM_ORIGINALS_DIR")
    if not offline:
        raise RuntimeError("Provide existing original JPEGs via AO_TLM_ORIGINALS_DIR; no Wikimedia downloads")
    path = Path(offline) / (spec["id"] + ".jpg")
    if not path.is_file():
        raise RuntimeError("Previously acquired original missing: " + str(path))
    return path.read_bytes()

def convert(spec, binary):
    sha1 = hashlib.sha1(binary).hexdigest()
    if sha1 != spec["source_sha1"]:
        raise RuntimeError(f"{spec['id']}: source SHA-1 mismatch, got {sha1}")
    with Image.open(io.BytesIO(binary)) as original:
        original.load()
        if original.format != "JPEG" or original.size != spec["source_size"]:
            raise RuntimeError(f"{spec['id']}: original media dimensions/type changed")
        frame = ImageOps.exif_transpose(original).convert("RGB")
    frame.thumbnail((2000, 1600), Image.Resampling.LANCZOS)
    if frame.size != spec["derivative_size"]:
        raise RuntimeError(f"{spec['id']}: full-frame derivative dimensions changed")
    data = io.BytesIO()
    frame.save(data, format="WEBP", quality=75, method=6)
    b = data.getvalue()
    digest = hashlib.sha256(b).hexdigest()
    if digest != spec["derivative_sha256"]:
        raise RuntimeError(f"{spec['id']}: reproducibility hash differs: {digest}")
    return b

def main():
    # Stage and fully verify BOTH before touching an approved binary path.
    outputs = []
    for spec in SOURCES:
        b = convert(spec, get_source(spec))
        outputs.append((spec, b))
    DEST.mkdir(parents=True, exist_ok=True)
    for spec, binary in outputs:
        p = DEST / spec["name"]
        if p.exists():
            if hashlib.sha256(p.read_bytes()).hexdigest() != spec["derivative_sha256"]:
                raise RuntimeError("existing image differs; refuse overwrite: " + str(p))
        else:
            p.write_bytes(binary)
        print(spec["name"], spec["derivative_sha256"], p.stat().st_size)
    print("Two original SHA-1 checks, both expected WebP SHA-256 checks and dimensions: PASS")
    print("This copies local binaries only; editorial registry, release and deployment remain independent.")

if __name__ == "__main__":
    try:
        main()
    except Exception as exc:
        print("HOLD — no photo approval or public release: " + str(exc), file=sys.stderr)
        sys.exit(1)
