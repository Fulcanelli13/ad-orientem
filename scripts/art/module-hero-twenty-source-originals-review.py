#!/usr/bin/env python3
"""Reconstruct read-only 20-original module hero visual preflight from canonical archive refs.

No source master is uploaded as an Actions artifact; only downscaled overview
and native-pixel diagnostic sheets. Editorial choices and release gates unchanged.
"""
from __future__ import annotations
from collections import defaultdict
from io import BytesIO
import hashlib
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "data/research/module-hero-artwork-production-readiness-2026-10-26.audit1.json"
OUT = ROOT / "artifacts/module-hero-originals-20-inspection"

def run(*args):
    return subprocess.run(args, cwd=ROOT, check=True, capture_output=True, text=True).stdout

def main():
    records = json.loads(REGISTRY.read_text(encoding="utf8"))["entries"]
    assert len(records) == 22, "Frozen module-hero roster drifted"
    acquired = [r for r in records if r.get("physical_master_acquired") is True]
    missing = [r["module_id"] for r in records if not r.get("physical_master_acquired")]
    assert len(acquired) == 20 and len(missing) == 2, (
        "Archive coverage changed: reconcile manifest before changing this gate", len(acquired), missing)
    OUT.mkdir(parents=True, exist_ok=True)
    fetched = {}
    archive_branches = sorted({r["staged_research_file"]["git_branch"] for r in acquired})
    for idx, branch in enumerate(archive_branches):
        assert re.fullmatch(r"research/[a-zA-Z0-9/_-]+", branch), branch
        ref = "refs/ao-hero-archive/a" + str(idx)
        # Partial clone avoids downloading unrelated masters and PR content.
        run("git", "-c", "protocol.version=2", "fetch", "--quiet", "--no-tags",
            "--filter=blob:none", "--depth=1", "origin", "refs/heads/" + branch + ":" + ref)
        fetched[branch] = ref
        print("ARCHIVE_REF", branch, "OK", flush=True)
    inspected = []
    overview_tiles = []
    with tempfile.TemporaryDirectory(prefix="ao-hero-masters-") as temp:
        original_dir = Path(temp)
        for row in acquired:
            info = row["staged_research_file"]
            id = row["module_id"]
            path = info["file_path"]
            assert path.startswith("assets/staged/") and path.endswith((".jpg", ".jpeg", ".png")), path
            data = subprocess.run(["git", "show", fetched[info["git_branch"]] + ":" + path],
                                  cwd=ROOT, check=True, capture_output=True).stdout
            actual_hash = hashlib.sha256(data).hexdigest()
            assert actual_hash == info["sha256"], ("SHA-256 mismatch", id, actual_hash)
            assert actual_hash == row["sha256"], ("Mainline identity digest mismatch", id)
            with Image.open(BytesIO(data)) as im:
                im.verify()
            with Image.open(BytesIO(data)) as im:
                fmt, w, h = im.format, im.width, im.height
                assert [w, h] == info["verified_pixel_dimensions"], ("Pixel mismatch", id, w, h)
                assert fmt in ("JPEG", "PNG"), ("Unexpected original image type", id, fmt)
                im=ImageOps.exif_transpose(im)
                tile=ImageOps.contain(im.convert("RGB"), (272, 310), Image.Resampling.LANCZOS)
                overview_tiles.append((id, row["artist"], row["title"], tile.copy()))
            (original_dir / (id + ".jpg")).write_bytes(data)
            inspected.append({
              "id":id,"artist":row["artist"],"title":row["title"],
              "original_sha256":actual_hash,"original_pixels":[w,h],
              "bytes":len(data),"format":fmt,"source_branch":info["git_branch"],
              "research_path":path,"editorial_approved":row["editorial_approved"],
              "release_state":row["production_release"],
              "rights_state":row["master_candidate"].get("rights_review"),
              "preview_only":True,"publication_authorized":False})
            print("PASS", id, str(w)+"x"+str(h), actual_hash[:12], flush=True)
        # Reuse the existing official preflight program and all of its
        # source-resolution sampling / preservation checks.
        run(sys.executable, "scripts/art/review-module-hero-quality.py",
            "--staged", str(original_dir), "--output", str(OUT/"native-detail-sheets"))
    assert len(inspected) == 20
    W, H, cols = 338, 405, 5
    rows = (len(overview_tiles)+cols-1)//cols
    sheet = Image.new("RGB", (W*cols, H*rows+64), "#171b23")
    draw = ImageDraw.Draw(sheet)
    draw.text((22,10),"AD ORIENTEM | 20 archived selected originals | SOURCE PREVIEW ONLY", fill="#efebdd")
    draw.text((22,31),"Uncropped aspect ratio maintained | no image here is released or quality-approved", fill="#d3ab77")
    for i,(id,artist,title,im) in enumerate(overview_tiles):
        x,y=(i%cols)*W,(i//cols)*H+64
        sheet.paste(im,(x+(W-im.width)//2,y+12+(312-im.height)//2))
        draw.text((x+16,y+329),str(i+1).zfill(2)+"  "+id,fill="#f3efe6")
        draw.text((x+16,y+349),artist[:38],fill="#b6b9c7")
        draw.text((x+16,y+371),title[:40],fill="#d2bf9e")
    overview=OUT/"approved-module-originals-contact-sheet.jpg"
    sheet.save(overview,"JPEG",quality=90,optimize=True)
    results={"schema":"AO_MODULE_HERO_20_ORIGINAL_ARCHIVE_INTEGRITY_V1",
       "generatedAt":"GitHub Actions generated / see workflow run metadata",
       "scope":"Read-only identity, file integrity, dimensions, and visual review PREP",
       "originalsVerified":len(inspected),"unacquired":missing,
       "finalUserArtworkApprovals":22,"newQualityApprovals":0,
       "rightsClearedByThisWorkflow":0,"publishedByThisWorkflow":0,
       "sourceBranchCount":len(archive_branches),"records":inspected,
       "overviewContactSheet":str(overview.relative_to(ROOT)),
       "nativeDetailSheetsProduced":20,
       "note":"Technical preflight cannot decide artist attribution, lawful reuse, framelessness, color fidelity, mobile focal crop or human publication authorization."}
    (OUT/"manifest.json").write_text(json.dumps(results,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    print("PASS MODULE HERO ARCHIVE: 20/20 SHA + dimensions; 2 not acquired",flush=True)

if __name__=="__main__":
    main()
