#!/usr/bin/env python3
"""Reproducible, €0, research-only 2,579-anchor photographic intake.

Run against the *checked-out* CL2 research shards, never auto-import an
unmerged research branch into production. Source rows and SHA256s are checked.
One physical anchor => one intake unit, even when it has multiple venue/source
records or historical same-building group aliases.

Usage:
 python tools/directory/build-unified-photo-intake.py \
   --cl2-dir /tmp/cl2-worktree/data/directory/research/cl2-unified-20261026 \
   --r49 data/directory/preliminary-map-r49.v1.json \
   --out-dir /tmp/ao-unified-photo-intake --shard-size 250 \
   --cl2-commit <exact 40-char reviewed SHA>
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path

EXPECTED_SITE_IDS = 2584
EXPECTED_ANCHORS = 2579
EXPECTED_VENUE_SOURCES = 2687
EXPECTED_R49 = 1879
PUBLICATION = "RESEARCH_ONLY_NEVER_APP_VISIBLE"
SCHEMA = "AO_DIRECTORY_UNIFIED_PHOTO_INTAKE_V1"


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def read_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def validate_source_parts(directory: Path):
    path = directory / "manifest.json"
    manifest = read_json(path)
    if manifest.get("schema") != "AO_CL2_SINGLE_RESEARCH_MASTER_V1":
        raise ValueError("Expected CL2 source master, not a second register")
    if manifest.get("status") != "RESEARCH_ONLY_NOT_PUBLIC_NO_RUNTIME_IMPORT":
        raise ValueError("CL2 source is not frozen research-only")
    if manifest.get("count", {}).get("effective_physical_sites") != EXPECTED_ANCHORS:
        raise ValueError("Unexpected historical CL2 anchor count: review baseline")
    expected = {"site": EXPECTED_SITE_IDS, "venue": EXPECTED_VENUE_SOURCES}
    result = {}
    for key, size in expected.items():
        parts = manifest.get("shards", {}).get(key, [])
        if not parts:
            raise ValueError("Missing CL2 source shards: " + key)
        rows = []
        for i, part in enumerate(parts, 1):
            name = part.get("path", "")
            if not re.fullmatch(r"[a-z_]+-[0-9]{2}-of-[0-9]{2}\.json", name):
                raise ValueError("Unsafe/noncanonical source-part filename")
            f = directory / name
            if f.stat().st_size != part["bytes"] or digest(f) != part["sha256"]:
                raise ValueError("CL2 source bytes/hash changed: " + name)
            p = read_json(f)
            if (p.get("table") != key or p.get("part") != i
                    or p.get("parts") != len(parts) or
                    len(p.get("records", [])) != part["rows"]):
                raise ValueError("CL2 source partition mismatch: " + name)
            rows.extend(p["records"])
        if len(rows) != size:
            raise ValueError(f"CL2 expected {size} {key} rows; found {len(rows)}")
        result[key] = rows
    return manifest, digest(path), result


def read_r49(path: Path):
    source = read_json(path)
    if (source.get("schema") != "AO_PRELIMINARY_TLM_MAP_R49"
            or len(source.get("records", [])) != EXPECTED_R49):
        raise ValueError("Historical 1,879 R49 identities must remain frozen")
    cols = source.get("columns", [])
    required = ["id", "name", "country", "lat", "lng", "precision"]
    if any(name not in cols for name in required):
        raise ValueError("Wrong R49 source layout")
    idx = cols.index("id")
    ids = [str(row[idx]) for row in source["records"]]
    if len(set(ids)) != EXPECTED_R49:
        raise ValueError("Duplicate R49 identifiers")
    return set(ids), digest(path)


def safe_source_urls(values):
    seen = set()
    urls = []
    for v in values:
        for u in str(v or "").split(";"):
            u = u.strip()
            if not u.startswith("https://") or len(u) > 700 or u in seen:
                continue
            urls.append(u)
            seen.add(u)
            if len(urls) == 5:
                return urls
    return urls


def normalize_anchor_rows(parts, r49_ids):
    anchors = {}
    group_anchor = {}
    for entry in parts["site"]:
        group = entry["group_id"]
        aid = entry["effective_anchor_id"]
        if group in group_anchor:
            raise ValueError("Duplicate CL2 historical ID")
        if entry.get("site_state") != "RESEARCH_ONLY_NOT_PUBLIC":
            raise ValueError("Unexpected site release state")
        if not re.fullmatch(r"RG-(?:B[0-9]{2}-)?[0-9A-F]{12}", group) or not re.fullmatch(r"RG-(?:B[0-9]{2}-)?[0-9A-F]{12}", aid):
            raise ValueError("Noncanonical CL2 group ID")
        group_anchor[group] = aid
        if group == aid:
            canonical = entry["canonical"]
            if canonical[0] != group or canonical[7] != "RESEARCH_ONLY_NOT_PUBLIC":
                raise ValueError("CL2 anchor identity/release mismatch")
            anchors[aid] = {
                "physical_anchor_id": aid,
                "country": str(canonical[1]),
                "name": str(canonical[2]),
                "physical_description_search_hint": str(canonical[3] or ""),
                "description_is_site_verified": False,
                "official_source_urls": safe_source_urls([canonical[9]]),
                "historical_group_ids": [],
                "source_ids": [],
                "source_name_search_hints": [],
                "legacy_r49_source_ids": [],
                "source_count": 0,
                "photo_roles": ["EXTERIOR", "INTERIOR", "SACRED_DETAIL"],
                "building_subject_verified": False,
                "approved_originals": 0,
                "approved_cover_photo": False,
                "publication": PUBLICATION,
                "review_state": "HOLD_EXACT_BUILDING_AND_MEDIA_RIGHTS",
            }
    if len(anchors) != EXPECTED_ANCHORS:
        raise ValueError(f"Expected 2,579 unique physical anchors, found {len(anchors)}")
    for group, aid in group_anchor.items():
        if aid not in anchors:
            raise ValueError("Alias points outside CL2 consolidated anchors")
        anchors[aid]["historical_group_ids"].append(group)
    if len(group_anchor) - len(anchors) != EXPECTED_SITE_IDS - EXPECTED_ANCHORS:
        raise ValueError("CL2 same-building historical aliases changed")
    unique_sources = set()
    held_group_conflicts = []
    unmapped_venue_sources = []
    for venue in parts["venue"]:
        sid = venue["source_id"]
        if sid in unique_sources:
            raise ValueError("Duplicate source ID in CL2")
        unique_sources.add(sid)
        g = venue.get("research_group_id")
        status = venue.get("classification_merge_state")
        if venue.get("release") != "RESEARCH_ONLY_NEVER_AUTO_PUBLISH":
            raise ValueError("Venue source was unexpectedly approved")
        if status == "GROUP_CONFLICT_HOLD":
            held_group_conflicts.append(sid)
            continue
        if g not in group_anchor:
            unmapped_venue_sources.append(sid)
            continue
        anchor = anchors[group_anchor[g]]
        anchor["source_ids"].append(sid)
        source = venue.get("source_record", [])
        if (len(source) >= 37 and source[0] == sid):
            name = str(source[4]).strip()
            if (name and name != anchor["name"]
                    and name not in anchor["source_name_search_hints"]
                    and len(anchor["source_name_search_hints"]) < 6):
                anchor["source_name_search_hints"].append(name)
            anchor["official_source_urls"] = safe_source_urls(
                anchor["official_source_urls"] + [source[25], source[26], source[27]])
        if sid in r49_ids:
            anchor["legacy_r49_source_ids"].append(sid)
    if len(unique_sources) != EXPECTED_VENUE_SOURCES:
        raise ValueError("CL2 source population drifted")
    for anchor in anchors.values():
        anchor["historical_group_ids"].sort()
        anchor["source_ids"].sort()
        anchor["legacy_r49_source_ids"].sort()
        anchor["source_name_search_hints"].sort()
        anchor["source_count"] = len(anchor["source_ids"])
    return sorted(anchors.values(), key=lambda x: (x["country"], x["physical_anchor_id"])), {
        "group_conflict_source_ids": sorted(held_group_conflicts),
        "unmatched_venue_source_ids": sorted(unmapped_venue_sources),
    }


def export(directory: Path, r49: Path, out_dir: Path, *, chunk_size: int, commit: str):
    if not re.fullmatch(r"[0-9a-f]{40}", commit):
        raise ValueError("Pin the actual reviewed 40-character CL2 Git commit")
    if not 100 <= chunk_size <= 500:
        raise ValueError("Queue shards must contain 100–500 physical anchors")
    if out_dir.exists() and any(out_dir.iterdir()):
        raise ValueError("Refuse to overwrite any existing photographic research archive")
    manifest, manifest_sha, parts = validate_source_parts(directory)
    historical_ids, r49_sha = read_r49(r49)
    anchors, exceptions = normalize_anchor_rows(parts, historical_ids)
    linked_r49_ids = {sid for a in anchors for sid in a["legacy_r49_source_ids"]}
    if len(anchors) != EXPECTED_ANCHORS or not linked_r49_ids.issubset(historical_ids):
        raise ValueError("Unexpected CL2/R49 linkage")
    out_dir.mkdir(parents=True, exist_ok=True)
    files = []
    for start in range(0, len(anchors), chunk_size):
        subset = anchors[start:start+chunk_size]
        name = f"anchors-{start:04d}-{start+len(subset)-1:04d}.json"
        path = out_dir / name
        path.write_text(json.dumps({
            "schema": SCHEMA,
            "publication": PUBLICATION,
            "cl2_commit": commit,
            "cl2_manifest_sha256": manifest_sha,
            "offset": start, "count": len(subset),
            "records": subset,
        }, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
        files.append({"path": name, "count": len(subset), "sha256": digest(path), "bytes": path.stat().st_size})
    count = {
        "distinct_consolidated_physical_anchors": len(anchors),
        "research_photo_queue_records": len(anchors),
        "historical_canonical_group_ids": EXPECTED_SITE_IDS,
        "same_building_aliases_not_extra_sites": EXPECTED_SITE_IDS-len(anchors),
        "all_cl2_venue_sources": len(parts["venue"]),
        "cl2_venue_sources_safely_attached": sum(a["source_count"] for a in anchors),
        "cl2_venue_sources_held_for_group_conflict": len(exceptions["group_conflict_source_ids"]),
        "cl2_venue_sources_other_unmapped": len(exceptions["unmatched_venue_source_ids"]),
        "r49_historical_source_ids": len(historical_ids),
        "r49_exact_source_ids_crosswalked": len(linked_r49_ids),
        "r49_unmatched_historical_source_ids": len(historical_ids-linked_r49_ids),
        "anchors_with_r49_exact_source": sum(bool(a["legacy_r49_source_ids"]) for a in anchors),
        "anchors_without_r49_exact_source": sum(not a["legacy_r49_source_ids"] for a in anchors),
        "anchors_with_source_evidence": sum(bool(a["source_ids"]) for a in anchors),
        "unique_countries": len({a["country"] for a in anchors}),
        "photos_downloaded": 0, "photos_approved": 0, "photos_published": 0,
    }
    if (count["cl2_venue_sources_safely_attached"]
            + count["cl2_venue_sources_held_for_group_conflict"]
            + count["cl2_venue_sources_other_unmapped"] != EXPECTED_VENUE_SOURCES):
        raise ValueError("Some venue/source identity records were lost")
    audit = {
        "schema": "AO_DIRECTORY_UNIFIED_PHOTO_INTAKE_AUDIT_V1",
        "publication": PUBLICATION,
        "cl2_commit": commit, "cl2_manifest_sha256": manifest_sha,
        "r49_sha256": r49_sha, "counts": count,
        "country_counts": dict(sorted(Counter(a["country"] for a in anchors).items())),
        "held_identity_exceptions": exceptions,
        "r49_unmatched_historical_source_ids": sorted(historical_ids-linked_r49_ids),
        "unresolved_leads": "SEPARATE_CL2_IDENTITY_RECONCILIATION_QUEUE_NOT_ADMITTED_PHYSICAL_SITES",
        "rules": ["NO_AUTOMATIC_IDENTITY_JOIN", "NO_PHOTO_PUBLICATION",
                  "NO_REPLACEMENT_OF_FROZEN_R49", "NO_PAID_IMAGE_SERVICES",
                  "ONE_CONSOLIDATED_ANCHOR_PER_PHOTO_QUEUE_UNIT"],
    }
    (out_dir/"audit.json").write_text(json.dumps(audit, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    index = {
        "schema": "AO_DIRECTORY_UNIFIED_PHOTO_QUEUE_INDEX_V1",
        "publication": PUBLICATION,
        "source_master": "CL2_UNMERGED_RESEARCH_ONLY",
        "cl2_commit": commit, "cl2_manifest_sha256": manifest_sha,
        "r49_sha256": r49_sha, "shard_size": chunk_size, "shards": files,
        "counts": count,
        "audit_sha256": digest(out_dir/"audit.json"),
        "not_app_visible": True,
    }
    (out_dir/"manifest.json").write_text(json.dumps(index, ensure_ascii=False, indent=2)+"\n", encoding="utf-8")
    return index


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--cl2-dir", type=Path, required=True)
    p.add_argument("--r49", type=Path, required=True)
    p.add_argument("--out-dir", type=Path, required=True)
    p.add_argument("--shard-size", type=int, default=250)
    p.add_argument("--cl2-commit", required=True)
    args = p.parse_args()
    summary = export(args.cl2_dir, args.r49, args.out_dir,
                     chunk_size=args.shard_size, commit=args.cl2_commit)
    print(json.dumps({"counts": summary["counts"], "shards": len(summary["shards"]),
                      "publication": summary["publication"]}, indent=2))


if __name__ == "__main__":
    main()
