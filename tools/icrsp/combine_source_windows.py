#!/usr/bin/env python3
"""Safely merge ICRSP metadata inspection windows (issue #1665).

Require the same complete, ordered *semantic index*: source URL, article ID,
labels, and index sections. Raw index HTML hashes may differ due to dynamic
page markup; preserve those hashes for audit instead of misclassifying
identical indexes as different catalogues.
"""
import argparse
import glob
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

EXPECTED_WINDOWS = {(200, 200), (400, 200), (600, 200), (800, 55)}
EDITION_STATUS = "NOT_CERTIFIED"
RIGHTS_STATUS = "NOT_CLEARED_INDEX_AND_LINK_ONLY"


def index_signature(doc):
    return [(p["articleId"], p["sourceUrl"], tuple(p["labels"]), tuple(p["sections"]))
            for p in doc["pages"]]


def merge(baseline, window_docs):
    signature = index_signature(baseline)
    if len(signature) != 855 or len(set(p[1] for p in signature)) != 855:
        raise ValueError("Baseline must have 855 distinct canonical article URLs")
    base = {p["sourceUrl"]: dict(p) for p in baseline["pages"]}
    if sum(p.get("state") == "METADATA_INSPECTED" for p in base.values()) != 200:
        raise ValueError("Baseline must contain exactly 200 inspected pages")
    windows_seen = set()
    snapshots = [{"window": "baseline", "indexHtmlSha256": baseline["indexHtmlSha256"]}]
    for doc in window_docs:
        window = doc["scanWindow"]
        key = (window["start"], window["actual"])
        if key not in EXPECTED_WINDOWS or key in windows_seen:
            raise ValueError(f"Unexpected or duplicate inspection window: {key}")
        windows_seen.add(key)
        if index_signature(doc) != signature:
            raise ValueError(f"Source index changed semantically in window {key}")
        if doc["totals"].get("errors") != 0:
            raise ValueError(f"Source fetch errors in window {key}")
        snaps = [p for p in doc["pages"] if p.get("state") == "METADATA_INSPECTED"]
        if len(snaps) != key[1]:
            raise ValueError(f"Missing inspected pages in window {key}: {len(snaps)}")
        expected_urls = {p[1] for p in signature[key[0]:key[0]+key[1]]}
        if set(p["sourceUrl"] for p in snaps) != expected_urls:
            raise ValueError(f"Window inspected incorrect source URLs: {key}")
        snapshots.append({"window": list(key), "indexHtmlSha256": doc["indexHtmlSha256"]})
        for page in snaps:
            uri = page["sourceUrl"]
            if base[uri].get("state") == "METADATA_INSPECTED":
                if base[uri].get("htmlSha256") != page.get("htmlSha256"):
                    raise ValueError(f"Different article HTML on overlapping window: {uri}")
            base[uri] = dict(page)
    if windows_seen != EXPECTED_WINDOWS:
        raise ValueError(f"Missing inspection windows: {EXPECTED_WINDOWS - windows_seen}")
    inspected = 0
    for p in baseline["pages"]:
        q = base[p["sourceUrl"]]
        if q.get("state") != "METADATA_INSPECTED":
            raise ValueError(f"Uninspected article: {p['sourceUrl']}")
        if not q.get("htmlSha256") or not any(
            h.get("level") == "h2" and h.get("text") for h in q.get("headings", [])
        ):
            raise ValueError(f"Missing article title/fingerprint: {p['sourceUrl']}")
        q["publication"] = "BLOCKED_SOURCE_REVIEW"
        q["rubricalEditionCertification"] = EDITION_STATUS
        q["rights"] = RIGHTS_STATUS
        # The old name detector searched the whole page, including site-wide
        # content: it is invalid as author-attribution evidence.
        if "authorsMentionedHeuristic" in q:
            q["unvalidatedWholePageNameMentions"] = q.pop("authorsMentionedHeuristic")
        q["authorAttributionCertification"] = "NOT_CERTIFIED"
        inspected += 1

    output = dict(baseline)
    output["schema"] = "AO_ICRSP_855_SCREENED_METADATA_V1"
    output["status"] = "METADATA_SCREENED_ONLY_NO_TEXT_OR_EDITORIAL_PROMOTION"
    output["pages"] = [base[p["sourceUrl"]] for p in baseline["pages"]]
    output["totals"] = dict(output["totals"])
    output["totals"].update({
        "metadataInspected": inspected, "fetchFailures": 0,
        "articleHeadingPresent": inspected, "editionCertified": 0,
        "authorshipCertified": 0, "rightsClearedForReproduction": 0,
        "canonicalRecordsPromoted": 0,
    })
    output["snapshots"] = snapshots
    output["indexHashDrift"] = len({s["indexHtmlSha256"] for s in snapshots}) > 1
    output["indexSignatureEquivalentAcrossSnapshots"] = True
    output["validation"] = {
        "expectedWindows": [list(x) for x in sorted(EXPECTED_WINDOWS)],
        "validatedWindows": [list(x) for x in sorted(windows_seen)],
        "sourceIdentityCompared": ["articleId", "sourceUrl", "labels", "sections"],
        "dynamicHtmlHashDifferencesNotTreatedAsCatalogChanges": True,
        "articleBodiesNotRepublished": True,
        "historicalEditionsQuarantined": True,
    }
    output["combinedAtUtc"] = datetime.now(timezone.utc).isoformat()
    return output


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--baseline", required=True)
    parser.add_argument("--windows", required=True, help="glob for per-window JSON files")
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    files = sorted(glob.glob(args.windows, recursive=True))
    if len(files) != 4:
        raise SystemExit(f"Expected four independent window reports; found {len(files)}")
    baseline = json.loads(Path(args.baseline).read_text(encoding="utf-8"))
    docs = [json.loads(Path(p).read_text(encoding="utf-8")) for p in files]
    result = merge(baseline, docs)
    target = Path(args.out)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"totals": result["totals"], "hashDrift": result["indexHashDrift"],
                      "indexSignatureEquivalent": result["indexSignatureEquivalentAcrossSnapshots"]},
                     ensure_ascii=False))


if __name__ == "__main__":
    main()
