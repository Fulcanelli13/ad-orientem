#!/usr/bin/env python3
"""B47: build genuinely OFFLINE single HTML art-comparison gallery.

Input comes exclusively from previously unpublished, checksum-verified GitHub
draft Release TAR research originals B38/B43/B44. SHA256, size, filename, and
explicit upstream CC0/public-domain status must agree with frozen provenance.
Embed only visually faithful, downsized JPEG thumbnails. No original binary
is republished, no catalogue or editorial selection is mutated.

Run: python scripts/research/sacred_art_b47_offline_gallery_from_archives.py
Requires: gh CLI authenticated to repository draft Releases; Pillow.
"""
import base64
import hashlib
import io
import json
import os
import re
import subprocess
import tarfile
import tempfile
from pathlib import Path
from PIL import Image, ImageOps

REPO = "Fulcanelli13/ad-orientem"
ROOT = Path("data/research")
SOURCE = ROOT / "sacred-art-b46-six-cc0-comparison-review.json"
TEMPLATE = Path("previews/sacred-art-b46-cc0-editorial-gallery.html")
OUTPUT = Path("previews/sacred-art-b47-offline-cc0-editorial-gallery.html")
REPORT = ROOT / "sacred-art-b47-six-offline-thumbnail-audit.json"

ARCHIVES = {
    "KMSKA-314": ("ao-art-originals-40082818225-1", "ao-originals-b38-kmska-cc0-40082818225-1.tar"),
    "CMA-1974.108": ("ao-art-originals-40089028479-1", "ao-originals-b43-cma-cc0-alt-40089028479-1.tar"),
    "CMA-2005.55": ("ao-art-originals-40089028479-1", "ao-originals-b43-cma-cc0-alt-40089028479-1.tar"),
    "CMA-2016.32": ("ao-art-originals-40089028479-1", "ao-originals-b43-cma-cc0-alt-40089028479-1.tar"),
    "MET-435621": ("ao-art-originals-40090336600-1", "ao-originals-b44-met-40-cc0-40090336600-1.tar"),
    "MET-471903": ("ao-art-originals-40090336600-1", "ao-originals-b44-met-40-cc0-40090336600-1.tar"),
}
Image.MAX_IMAGE_PIXELS = 450_000_000
MAX_ORIGINAL_BYTES = 65_000_000
MAX_OFFLINE_HTML_BYTES = 3_000_000

def gh(*cmd, capture=True):
    p = subprocess.run(["gh", *cmd], text=True, check=True,
                       capture_output=capture)
    return p.stdout.strip() if capture else None

def digest(blob):
    return hashlib.sha256(blob).hexdigest()

def get_image_from_tar(tarpath, original):
    with tarfile.open(tarpath, mode="r") as archive:
        rows = json.load(archive.extractfile("AO_ARCHIVE_ACQUISITION_INDEX.json"))
        assert rows["research_only"] is True
        assert rows["publication_rights_approved"] is False
        matches = [x for x in rows["files"] if x["sha256"] == original["research_original_sha256"]]
        if len(matches) != 1:
            raise RuntimeError(f"Image exact SHA missing or ambiguous for {original['id']}: {len(matches)}")
        found = matches[0]
        if found["bytes"] != original["research_original_size_bytes"]:
            raise RuntimeError("Byte count does not match Git-sourced evidence")
        if found["bytes"] > MAX_ORIGINAL_BYTES or not found["image_file"]:
            raise RuntimeError("Unexpected original image type/size")
        member = archive.getmember(found["path"])
        if not member.isfile() or member.size != found["bytes"]:
            raise RuntimeError("Untrusted TAR entry or size")
        with archive.extractfile(member) as f:
            original_bytes = f.read(MAX_ORIGINAL_BYTES + 1)
        if digest(original_bytes) != original["research_original_sha256"]:
            raise RuntimeError("Downloaded draft archived original failed SHA256")
        return original_bytes, found["path"], rows["wave"]

def compressed_preview(blob, artwork_id):
    # Authentic research source bytes are SHA verified BEFORE decoding.
    with Image.open(io.BytesIO(blob)) as image:
        # JPEG decoder-level shrink of up to 8x, needed for the 378 MP KMSKA original.
        image.draft("RGB", (1120,1120))
        ImageOps.exif_transpose(image, in_place=True)
        image.thumbnail((1130, 1130), resample=Image.Resampling.LANCZOS)
        image = image.convert("RGB")
        thumbnail_size = image.size
        assert min(thumbnail_size) >= 300 and max(thumbnail_size) <= 1130
        bio = io.BytesIO()
        image.save(bio, format="WEBP", quality=77, method=5, optimize=True)
        out = bio.getvalue()
    if not out.startswith(b"RIFF") or out[8:12] != b"WEBP":
        raise RuntimeError("Not a real WebP image")
    # Verify preview decode and dimensions without using any external link.
    with Image.open(io.BytesIO(out)) as chk:
        assert chk.format == "WEBP" and chk.size == thumbnail_size, artwork_id
        chk.verify()
    if len(out) > 600_000:
        raise RuntimeError("Thumbnail unreasonably large: "+artwork_id)
    return out, thumbnail_size

def main():
    if os.environ.get("GITHUB_REPOSITORY") not in (None, REPO):
        raise RuntimeError("Refusing different repository")
    if not os.environ.get("GH_TOKEN"):
        raise RuntimeError("GH_TOKEN required for authenticated draft release reread")
    evidence = json.loads(SOURCE.read_text())
    originals = evidence["items"]
    assert len(originals) == 6 and set(ARCHIVES) == {x["id"] for x in originals}
    assert evidence["editorial_approvals"] == 0 and evidence["publication_approvals"] == 0
    rendered = []
    audit = []
    with tempfile.TemporaryDirectory(prefix="ao-b47-verified-releases-") as folder:
        dest = Path(folder)
        archived = {}
        for tag, asset in sorted(set(ARCHIVES.values())):
            # gh can read a draft Release with repo contents:read while tag REST lookup is 404.
            info = json.loads(gh("release", "view", tag, "--repo", REPO,
                                 "--json", "isDraft,assets"))
            if info.get("isDraft") is not True:
                raise RuntimeError("Preserved originals unexpectedly published: "+tag)
            assets = {a["name"] for a in info.get("assets", [])}
            if asset not in assets:
                raise RuntimeError("Required previous acquisition TAR not in draft Release: "+asset)
            gh("release", "download", tag, "--repo", REPO,
               "--pattern", asset, "--dir", str(dest), capture=False)
            archived[(tag, asset)] = dest / asset
        for original in originals:
            tag, asset = ARCHIVES[original["id"]]
            raw, path, wave = get_image_from_tar(archived[(tag,asset)], original)
            thumb, (w,h) = compressed_preview(raw, original["id"])
            row = dict(original)
            row["offline_preview_data_url"] = "data:image/webp;base64," + base64.b64encode(thumb).decode("ascii")
            row["offline_source_is_verified"] = True
            rendered.append(row)
            audit.append({
                "candidate_id":original["id"],
                "source_museum":original["institution"],
                "source_original_sha256":original["research_original_sha256"],
                "source_original_image_bytes":len(raw),
                "source_draft_release_tag":tag,
                "source_draft_tar_name":asset,
                "source_original_tar_member":path,
                "acquisition_wave":wave,
                "preview_format":"image/webp",
                "preview_width":w,"preview_height":h,
                "thumbnail_bytes":len(thumb),
                "thumbnail_sha256":digest(thumb),
                "thumbnail_verified_by_image_decoder":True,
                "preview_captured_from_original_sha_not_external_thumbnail":True,
                "frozen_artwork_id":original["frozen_artwork_id"],
                "editorially_selected":False,
                "published_to_app":False
            })
            print("B47_VERIFIED_THUMB",original["id"],len(raw),len(thumb),w,h,flush=True)

    html = TEMPLATE.read_text()
    original_block = "const items=" + json.dumps(originals,ensure_ascii=False).replace("<","\\u003c").replace("</script","<\\/script") + ";"
    # Existing B46 template embeds exact JS JSON via JSON.stringify without pretty formatting.
    m = re.search(r"const items=(\[[\s\S]*?\]);\s*const gallery=", html)
    if not m or json.loads(m.group(1)) != originals:
        raise RuntimeError("Old preview gallery changed; safe embed cannot be guaranteed")
    serial = json.dumps(rendered,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c").replace("</script","<\\/script")
    html = html[:m.start(1)] + serial + html[m.end(1):]
    old_expr = 'img.src=item.image_url;'
    if html.count(old_expr) != 1:
        raise RuntimeError("Existing preview does not have expected image source binding")
    html = html.replace(old_expr, 'img.src=item.offline_preview_data_url;')
    old_note = "Image previews require internet access; original research bytes and SHA-256 checksums are already preserved separately in unpublished GitHub releases."
    if html.count(old_note) != 1:
        raise RuntimeError("Old gallery note not found")
    html = html.replace(old_note, "The six image previews are embedded in this HTML and display entirely offline. Museum links are optional and require internet; full-resolution original research bytes remain in unpublished GitHub releases.")
    html = html.replace("<title>Ad Orientem — Sacred Art CC0 Research Selection Preview · B46</title>","<title>Ad Orientem — Sacred Art OFFLINE CC0 Selection Preview · B47</title>")
    html = html.replace("B46 · Source values from B38/B43/B44", "B47 offline · Source values from B38/B43/B44")
    html = html.replace("six image previews and interactive filters", "six embedded offline WebP previews and interactive filters")
    html = html.replace("Six works for consideration", "Six artworks, reviewed offline")
    if len(html.encode("utf-8")) >= MAX_OFFLINE_HTML_BYTES:
        raise RuntimeError("Self-contained gallery excessive file size")
    assert html.count("data:image/webp;base64,") == 6
    OUTPUT.write_text(html,encoding="utf-8")
    report = {
        "schema":"AO_B47_SIX_OFFLINE_CC0_THUMBNAILS_SHA_FROM_DRAFT_RELEASES_V1",
        "date":"2026-10-24",
        "input_B46_unchanged":True,
        "source_originals_verified_count":len(audit),
        "owner_public_domain_or_CC0_sources":True,
        "original_releases_still_draft":True,
        "original_images_newly_recovered":0,
        "new_full_resolution_original_files":0,
        "derivative_webp_previews_embedded":len(audit),
        "total_offline_preview_binary_bytes":sum(z["thumbnail_bytes"] for z in audit),
        "self_contained_html_file_bytes":OUTPUT.stat().st_size,
        "offline_image_display_requires_network":False,
        "museum_original_links_require_network":True,
        "original_frozen_383_source_gaps_closed":0,
        "editorial_decisions":0,
        "app_publication_approvals":0,
        "cost_eur":0,
        "production_app_changed":False,
        "strict_zero_euro":True,
        "html_gallery_path":str(OUTPUT),
        "preview_derivatives_reproduction_status":"RESEARCH_REVIEW_ONLY",
        "items":audit,
    }
    REPORT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("B47_OFFLINE_COMPLETE",json.dumps({k:report[k] for k in (
        "source_originals_verified_count",
        "derivative_webp_previews_embedded",
        "total_offline_preview_binary_bytes",
        "self_contained_html_file_bytes",
        "original_frozen_383_source_gaps_closed",
        "cost_eur")}),flush=True)
if __name__=="__main__":main()
