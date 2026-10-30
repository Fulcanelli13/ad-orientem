#!/usr/bin/env python3
"""Validate CL3 research-only crosswalk and description evidence against frozen CL2."""
import argparse
import hashlib
import json
from pathlib import Path


def read(path):
    return json.loads(path.read_text(encoding="utf-8"))


def require(condition, message):
    if not condition:
        raise AssertionError(message)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--cl2", type=Path, default=Path("data/directory/research/cl2-unified-20261026"))
    parser.add_argument("--cl3", type=Path, default=Path("data/directory/research/cl3-reconciliation-20261026"))
    args = parser.parse_args()

    manifest = read(args.cl2 / "manifest.json")
    overlay = read(args.cl3 / "overlay.json")
    require(manifest["schema"] == "AO_CL2_SINGLE_RESEARCH_MASTER_V1", "Wrong CL2 baseline")
    require(overlay["schema"] == "AO_CL3_RECONCILIATION_OVERLAY_V1", "Wrong CL3 schema")
    require(overlay["status"] == "RESEARCH_ONLY_NO_PUBLIC_IMPORT", "CL3 is not releasable")
    require(overlay["baseline"] == manifest["schema"], "Baseline mismatch")

    shard_data = {}
    for name, entries in manifest["shards"].items():
        shard_data[name] = []
        for entry in entries:
            raw = (args.cl2 / entry["path"]).read_bytes()
            require(hashlib.sha256(raw).hexdigest() == entry["sha256"], f"CL2 digest mismatch: {entry['path']}")
            obj = json.loads(raw)
            records = obj["records"]
            require(len(records) == entry["rows"], f"CL2 row mismatch: {entry['path']}")
            shard_data[name].extend(records)
    sites = shard_data["site"]
    issues = shard_data["identity_issue"]
    orphans = shard_data["classification_orphan"]
    by_site = {r["group_id"]: r for r in sites}
    by_orphan = {r["group_id"]: r for r in orphans}
    require(len(sites) == 2584 == len(by_site), "Canonical sites changed")
    require(len(issues) == 49, "CL2 identity population changed")
    require(len(orphans) == 36, "CL2 orphan population changed")

    original_blanks = {s["group_id"] for s in sites if not str(s["canonical"][3]).strip()}
    require(len(original_blanks) == 113, "CL2 description population changed")
    decisions = overlay["identity_decisions"]
    require(len(decisions) == 7, "Expected seven independent decisions")
    require(len({d["decision_id"] for d in decisions}) == 7, "Duplicate decision key")
    exceptions = overlay["identity_exception_queue"]
    require(len(exceptions) == 49, "Unrepresented identity exceptions")
    require(len({x["exception_key"] for x in exceptions}) == 49, "Duplicate exception key")

    original_exception_keys = set()
    for item in issues:
        if item["kind"] == "EXACT_SOURCE_ID_GROUP_CONFLICT":
            original_exception_keys.add("SOURCE:" + item["source_id"])
        else:
            original_exception_keys.add("GROUP:" + item["item"]["origin"] + ":" + item["item"]["group_id"])
    require({x["exception_key"] for x in exceptions} == original_exception_keys, "Exception loss/addition")

    originals_by_source = {x["source_id"]: x for x in issues if x["kind"] == "EXACT_SOURCE_ID_GROUP_CONFLICT"}
    originals_by_group = {x["item"]["group_id"]: x["item"] for x in issues if "item" in x}
    resolved_alias_targets = set()
    source_decisions = set()
    for d in decisions:
        require(d["public_release"] == "NO" and d["preserve_frozen_identifiers"], "Unsafe decision")
        canonical = by_site[d["canonical_group_id"]]
        require(d["site_name"] == canonical["canonical"][2], "Canonical site name changed")
        if d["decision"] == "HISTORICAL_SOURCE_GROUP_ALIAS_RESOLVED":
            old = originals_by_source[d["source_id"]]
            require(old["venue_group_id"] == d["original_source_group_id"], "Source lineage mismatch")
            require(old["classification_group_id"] == d["canonical_group_id"], "Classification lineage mismatch")
            require(d["original_source_group_id"] in [x.strip() for x in canonical["canonical"][4].split(";")], "Historic alias not in canonical record")
            source_decisions.add(d["source_id"])
        elif d["decision"] == "CLASSIFICATION_ONLY_SAME_BUILDING_ALIAS_RESOLVED":
            original = originals_by_group[d["original_source_group_id"]]
            require(original["origin"] == "B92_CLASSIFICATION_MASTER_ONLY", "Not a classification-only record")
            require(d["original_source_group_id"] in by_orphan, "Orphan record not present")
            require(d["source_id"] == by_orphan[d["original_source_group_id"]]["source_id"], "Orphan source ID changed")
            require(d["canonical_group_id"] in originals_by_group, "Reverse location-only exception missing")
            require(originals_by_group[d["canonical_group_id"]]["origin"] == "B98_LOCATION_MASTER_ONLY", "Target not a location-only exception")
            require(d["evidence_url"].startswith("https://"), "Missing official evidence")
            resolved_alias_targets.add(d["canonical_group_id"])
        else:
            require(False, "Unknown lineage decision")
    require(len(source_decisions) == 5 and len(resolved_alias_targets) == 2, "Lineage proof count mismatch")

    resolved = [x for x in exceptions if x["status"] == "RESOLVED_RESEARCH_ONLY"]
    require(len(resolved) == 9 and len(exceptions) - len(resolved) == 40, "Exception progress mismatch")
    for x in resolved:
        if x["kind"] == "EXACT_SOURCE_ID_GROUP_CONFLICT":
            require(x["source_id"] in source_decisions, "Unreviewed conflict resolved")
        else:
            target = x["target_canonical_group_id"]
            require(target in resolved_alias_targets, "Unreviewed orphan/target marked resolved")

    backfills = overlay["description_backfills"]
    require(len(backfills) == 23, "Address evidence count mismatch")
    ids = [x["group_id"] for x in backfills]
    require(len(set(ids)) == len(ids), "Duplicate backfill")
    require(set(ids).issubset(original_blanks), "Description overwrote a nonblank CL2 record")
    for b in backfills:
        site = by_site[b["group_id"]]
        require(b["site_name"] == site["canonical"][2] and b["country"] == site["canonical"][1], "Description identity mismatch")
        require(site["canonical"][6] == "FSSP", "FSSP source used for unrelated group")
        require(b["source_authority"] == "FSSP_INSTITUTIONAL_DIRECTORY", "Wrong source authority")
        require(b["source_url"] == "https://www.fssp.org/en/find-us/where-are-we/", "Source URL changed")
        require(bool(b["description"].strip()), "Empty description")
        require(b["precision"] in ("POSTAL_ADDRESS", "STREET_ONLY"), "Unknown precision")
        require(not b["public_geocode_approved"] and not b["public_venue_approved"], "Public release forbidden")
    q = overlay["description_queue"]
    require(len(q) == 113 and len({x["group_id"] for x in q}) == 113, "Description queue incomplete")
    require({x["group_id"] for x in q} == original_blanks, "Description queue changed baseline")
    require(len([x for x in q if x["status"] == "HOLD_DESCRIPTION_BLANK"]) == 90, "Description remaining count mismatch")
    require({x["group_id"] for x in q if x["status"] == "SOURCE_BACKED_DESCRIPTION_ADDED"} == set(ids), "Description evidence status mismatch")
    require(overlay["summary"] == {
        "identity_exception_rows_original":49,"identity_exception_rows_resolved":9,"identity_exception_rows_remaining":40,
        "independent_identity_crosswalk_decisions":7,"original_description_blanks":113,
        "first_party_descriptions_added":23,"description_blanks_remaining":90,
        "public_approved_sites":0,"new_verified_mass_schedules":0
    }, "Counts or public gates changed")
    print("CL3 PASS: 7 source/group crosswalk decisions close 9/49 exception rows; 40 held")
    print("CL3 PASS: 23 first-party FSSP descriptions resolve 23/113 blanks; 90 held")
    print("CL3 PASS: original CL2 parts SHA256 intact, no public sites or current schedules promoted")


if __name__ == "__main__":
    main()
