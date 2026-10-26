#!/usr/bin/env python3
"""CL27 non-promoting validation of frozen worldwide Mass-time review and collision queues.

Uses only the SHA256-pinned CL2 JSON source corpus, not external spreadsheets or
unstable short-lived GitHub Actions artifacts. Never modifies runtime data.
"""
import argparse
import hashlib
import json
from collections import defaultdict
from pathlib import Path

DEFAULT_SOURCE = Path("data/directory/research/cl2-unified-20261026")
DEFAULT_AUDIT = Path("data/directory/research/cl27-bulk-timetable-audit-20261026/audit.v1.json")


def original(record, index):
    value = record["original_row"][index]
    return str(value if value is not None else "").strip()


def verified_parts(root, manifest, table):
    result = []
    for part_no, part in enumerate(manifest["shards"][table], 1):
        path = root / part["path"]
        raw = path.read_bytes()
        assert len(raw) == part["bytes"], f"Unexpected size: {path}"
        assert hashlib.sha256(raw).hexdigest() == part["sha256"], f"SHA256 failure: {path}"
        body = json.loads(raw)
        assert body["table"] == table
        assert body["part"] == part_no and body["parts"] == len(manifest["shards"][table])
        assert len(body["records"]) == part["rows"]
        result.extend(body["records"])
    return result


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--source", type=Path, default=DEFAULT_SOURCE)
    p.add_argument("--audit", type=Path, default=DEFAULT_AUDIT)
    args = p.parse_args()
    manifest = json.loads((args.source / "manifest.json").read_text())
    audit = json.loads(args.audit.read_text())
    assert manifest["schema"] == "AO_CL2_SINGLE_RESEARCH_MASTER_V1"
    assert audit["schema"] == "AO_CL27_BULK_SCHEDULE_RECONCILIATION_V1"
    assert audit["summary"]["new_public_approvals"] == 0

    mass = verified_parts(args.source, manifest, "mass")
    sites = verified_parts(args.source, manifest, "site")
    assert len(mass) == 4681 and len(sites) == 2584
    anchors = {site["group_id"]: site["effective_anchor_id"] for site in sites}
    assert len(anchors) == 2584 and len(set(anchors.values())) == 2579

    historically_verified = [r for r in mass if original(r, 19) == "VERIFIED"]
    unverified = [r for r in mass if original(r, 19) == "UNVERIFIED"]
    assert len(historically_verified) == 3347 and len(unverified) == 1334
    actionable = [r for r in unverified
                  if original(r, 6) and original(r, 7)
                  and (original(r, 14) or original(r, 15))]
    source_owners = audit["provider_review_cohort_1"] + audit["provider_review_cohort_2"]
    source_secondary = audit["secondary_source_replacement_queue"]
    assert len(actionable) == 296
    assert all(row["source_id"] for row in audit["provider_review_cohort_1"])
    assert (len(audit["provider_review_cohort_1"]),
            len(audit["provider_review_cohort_2"]),
            len(source_secondary)) == (200, 71, 25)

    index = {r['historical_row']: r for r in mass}
    assert len(index) == 4681, "Original CL2 historical row number collision"
    assert set(index) == set(range(1, 4682))
    listed = source_owners + source_secondary
    assert len({r["historical_row"] for r in listed}) == 296
    assert {r["historical_row"] for r in listed} == {r["historical_row"] for r in actionable}

    for row in listed:
        item = index[row["historical_row"]]
        assert original(item, 19) == "UNVERIFIED"
        assert row["source_id"] == original(item, 1)
        assert row["source_b53_row"] == original(item, 0)
        if not row["source_id"]:
            assert "MISSING_FROZEN_SOURCE_ID" in row["precision_holds"]
            assert row["identity_release_gate"] == "MISSING_SOURCE_ID_DO_NOT_APPROVE"
        assert row["site_group_id"] == original(item, 26)
        assert row["effective_anchor_id"] == anchors.get(original(item, 26))
        assert row["day_pattern"] == original(item, 6)
        assert row["local_time"] == original(item, 7)
        assert row["url"] == (original(item, 14) or original(item, 15))
        assert row["publication_status"] == "HOLD_NO_PUBLIC_TIMETABLE_APPROVAL"
        if row in source_secondary:
            assert row["source_class"] == "SECONDARY_NEEDS_OWNER_SOURCE"

    groups = defaultdict(list)
    for row in historically_verified:
        group_id = original(row, 26)
        assert group_id in anchors
        slot_key = "|".join((anchors[group_id],
                             original(row, 6).lower(), original(row, 7)))
        groups[slot_key].append(row["historical_row"])
    duplicates = {key: sorted(numbers) for key, numbers in groups.items() if len(numbers) > 1}
    collision_rows = audit["verified_same_site_day_time_reconciliation_queue"]
    assert len(duplicates) == len(collision_rows) == 106
    assert sum(map(len, duplicates.values())) == 234
    assert len({item["site_day_time_key"] for item in collision_rows}) == 106
    for group in collision_rows:
        assert group["site_day_time_key"] in duplicates
        assert group["row_count"] == len(group["source_rows"])
        assert sorted(x["historical_row"] for x in group["source_rows"]) == duplicates[group["site_day_time_key"]]
        assert group["disposition"] == "REVIEW_ONLY_NOT_PROOF_OF_DUPLICATE_NO_AUTOMERGE"

    expected = {
        "mass_rows": 4681,
        "historical_verified_rows": 3347,
        "unverified_rows": 1334,
        "actionable_unverified_rows": 296,
        "review_batch_1": 200,
        "review_batch_2": 71,
        "secondary_owner_source_holds": 25,
        "unverified_no_day_time_and_url": 1038,
        "unverified_without_url": 998,
        "unverified_with_url_but_missing_day_or_time": 40,
        "verified_without_explicit_mass_rite": 2108,
        "verified_without_timezone": 6,
        "verified_with_seasonal_qualifier": 478,
        "verified_with_feast_exception": 593,
        "same_anchor_day_time_collision_groups": 106,
        "collision_rows": 234,
        "new_public_approvals": 0,
        "actionable_missing_frozen_venue_source_id": 5,
        "historically_verified_missing_frozen_venue_source_id": 8,
        "provider_review_cohort_1_all_have_frozen_source_id": True,
    }
    assert audit["summary"] == expected, "Audit summary drift"
    assert sum(not original(r, 9) for r in historically_verified) == 2108
    assert sum(not original(r, 13) for r in historically_verified) == 6
    assert sum(bool(original(r, 10)) for r in historically_verified) == 478
    assert sum(bool(original(r, 21)) for r in historically_verified) == 593
    assert sum(not original(r, 14) and not original(r, 15) for r in unverified) == 998

    checked = audit["owner_page_evidence_spot_checks"]
    for page in checked:
        for number in page["historical_rows"]:
            assert number in index
            item = index[number]
            assert original(item, 14) == page["url"], (number, page["url"])
            assert original(item, 19) == "UNVERIFIED"
    assert len(checked) == 4

    print("CL27 PASS — 4,681 frozen rows; 200 + 71 + 25 actionable holds; "
          "106 collisions affecting 234 rows; zero public approvals.")


if __name__ == "__main__":
    main()
