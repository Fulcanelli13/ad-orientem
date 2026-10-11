#!/usr/bin/env python3
"""Recover the exact archived 264 SHA256 originals for the human review atlas.

No art is promoted to production. GitHub Actions artifacts are temporary source
archives, and every imported byte is checked against the canonical registry.
"""
import argparse
import hashlib
import io
import json
import os
import shutil
import sys
import time
import urllib.error
import urllib.request
import zipfile
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "data/calendar/sacred-art-candidates.v1.json"
SOURCE_ROOT = ROOT / "artifacts/sacred-art-final-atlas/source-originals"
OUT = ROOT / "artifacts/sacred-art-final-atlas"
API = "https://api.github.com/repos/Fulcanelli13/ad-orientem/actions/artifacts"
MAX_ZIP_BYTES = 1_500_000_000
MAX_ORIGINAL_BYTES = 85_000_000

def fetch_zip(artifact_id, dest, token):
    url = API + "/" + str(artifact_id) + "/zip"
    headers = {"Accept": "application/vnd.github+json",
               "Authorization": "Bearer " + token,
               "X-GitHub-Api-Version": "2022-11-28",
               "User-Agent": "AdOrientem-SacredArtAtlas-CuratorialSourceRecovery"}
    for attempt in range(3):
        try:
            request = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(request, timeout=120) as response, dest.open("wb") as out:
                total = 0
                while True:
                    buf = response.read(1024 * 1024)
                    if not buf: break
                    total += len(buf)
                    if total > MAX_ZIP_BYTES:
                        raise ValueError("Archive exceeds size cap")
                    out.write(buf)
            return total
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, OSError) as err:
            if dest.exists(): dest.unlink()
            if isinstance(err, urllib.error.HTTPError) and err.code in (401, 403, 404, 410):
                raise RuntimeError("Artifact " + str(artifact_id) + " not downloadable: " + str(err))
            if attempt == 2: raise
            time.sleep(2 * (attempt + 1))

def exact_entry(names, path):
    requested = path.replace("\\", "/").lstrip("/")
    matches = [n for n in names if n == requested or n.endswith("/" + requested)]
    if len(matches) == 1: return matches[0]
    basename = Path(requested).name
    loose = [n for n in names if Path(n).name == basename]
    if len(loose) == 1: return loose[0]
    return None

def acquire(token, strict):
    OUT.mkdir(parents=True, exist_ok=True)
    SOURCE_ROOT.mkdir(parents=True, exist_ok=True)
    cache = OUT / "_temporary_artifact_zips"
    cache.mkdir(exist_ok=True)
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    items = [a for a in registry["artworks"]
             if len((a.get("acquisition") or {}).get("originalSha256") or "") == 64
             and (a.get("acquisition") or {}).get("archiveOriginal")]
    by_artifact = defaultdict(list)
    for a in items:
        k = a["acquisition"].get("artifactId")
        if k is None:
            raise ValueError("Missing acquisition artifact ID for " + a["id"])
        by_artifact[int(k)].append(a)
    results, missing = [], []
    for artifact_id, artworks in sorted(by_artifact.items(), key=lambda kv: -len(kv[1])):
        local = cache / (str(artifact_id) + ".zip")
        try:
            bytes_received = fetch_zip(artifact_id, local, token)
            with zipfile.ZipFile(local) as z:
                names = [n for n in z.namelist() if not n.endswith("/")]
                for a in artworks:
                    expected_sha = a["acquisition"]["originalSha256"]
                    entry = exact_entry(names, a["acquisition"]["archiveOriginal"])
                    if not entry:
                        missing.append({"artworkId": a["id"], "artifactId": artifact_id, "issue": "ORIGINAL_NOT_PRESENT_IN_ARCHIVE"})
                        continue
                    info = z.getinfo(entry)
                    if info.file_size > MAX_ORIGINAL_BYTES:
                        missing.append({"artworkId": a["id"], "artifactId": artifact_id, "issue": "ORIGINAL_TOO_LARGE"})
                        continue
                    with z.open(info) as stream:
                        payload = stream.read(MAX_ORIGINAL_BYTES + 1)
                    actual_sha = hashlib.sha256(payload).hexdigest()
                    if actual_sha != expected_sha:
                        missing.append({"artworkId": a["id"], "artifactId": artifact_id, "issue": "SHA256_MISMATCH", "actual": actual_sha})
                        continue
                    suffix = Path(entry).suffix.lower()
                    if suffix not in (".jpg", ".jpeg", ".png", ".webp"):
                        missing.append({"artworkId": a["id"], "artifactId": artifact_id, "issue": "UNSUPPORTED_IMAGE_TYPE"})
                        continue
                    outfile = SOURCE_ROOT / (a["id"] + suffix)
                    outfile.write_bytes(payload)
                    results.append({"artworkId": a["id"], "artifactId": artifact_id, "sha256": actual_sha,
                                    "bytes": len(payload), "originalArchivePath": entry, "sourceOriginal": str(outfile.relative_to(ROOT))})
            print("RECOVERED_ARTIFACT", artifact_id, len(artworks), "requested", bytes_received, "zip bytes", flush=True)
        except Exception as e:
            missing.extend({"artworkId": a["id"], "artifactId": artifact_id, "issue": "ARTIFACT_DOWNLOAD_FAILED", "detail": str(e)[:220]} for a in artworks)
            print("ARTIFACT_FAILED", artifact_id, str(e)[:220], file=sys.stderr, flush=True)
        finally:
            if local.exists(): local.unlink()
    try: cache.rmdir()
    except OSError: pass
    report = {"schema": "AO_SACRED_ART_ATLAS_SOURCE_RECOVERY_V1",
              "totalRegistryCandidates": len(registry["artworks"]),
              "expectedAcquiredOriginals": len(items),
              "downloadedHashVerifiedOriginals": len(results),
              "missingOrInvalid": missing,
              "sources": results,
              "releasedToProduction": False,
              "userReviewCompleted": False}
    (OUT / "source-recovery-report.json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print("SOURCE_RECOVERY", json.dumps({k: report[k] for k in ("totalRegistryCandidates", "expectedAcquiredOriginals", "downloadedHashVerifiedOriginals")}), flush=True)
    if missing:
        print("MISSING_OR_INVALID", json.dumps(missing[:25]), file=sys.stderr, flush=True)
        if strict: sys.exit(2)
    return report

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true")
    args = parser.parse_args()
    token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN")
    if not token:
        raise SystemExit("Set GITHUB_TOKEN with actions:read to recover archived originals")
    acquire(token, args.strict)
