#!/usr/bin/env python3
"""Create actual sourced, independently filterable TLM classifications over CL2.

Run after reconstructing the existing checksum-verified CL2 SQLite.
Do not replace the source master, invent celebrants, or publish any Mass.
Only Python 3 standard library required. Provenance and missing evidence survive.
"""
import argparse
import json
import sqlite3
from collections import Counter, defaultdict
from pathlib import Path

TAXONOMY = Path("data/directory/tlm-user-classification-taxonomy.v1.json")
COLUMNS = Path("data/directory/research/cl2-unified-20261026/manifest.json")
SOURCE_ONLY = "SOURCE_LABEL_ONLY_NOT_MINISTRY_ATTESTED"
UNKNOWN = "UNKNOWN"
UNRELEASED = "HOLD_CLASSIFICATION_NOT_PUBLIC"


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--db", type=Path, required=True, help="CL2 checksum-rebuilt SQLite")
    parser.add_argument("--output", type=Path, required=True, help="Classification research JSON export")
    parser.add_argument("--html-output", type=Path, help="Optional self-contained offline source/evidence reviewer")
    args = parser.parse_args()
    tax = json.loads(TAXONOMY.read_text())
    manifest = json.loads(COLUMNS.read_text())
    assert tax["schema"] == "AO_TLM_USER_CLASSIFICATION_TAXONOMY_V1"
    assert manifest["schema"] == "AO_CL2_SINGLE_RESEARCH_MASTER_V1"
    columns = manifest["classification_columns"]
    col = lambda arr, key: arr[columns.index(key)]
    assert not args.output.exists(), "Never overwrite prior research exports"
    db = sqlite3.connect(args.db)
    db.row_factory = sqlite3.Row
    for table, total in [("canonical_site", 2584), ("venue_source", 2687),
                         ("classification_source", 2715), ("mass_time", 4681),
                         ("identity_exception", 49)]:
        assert db.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0] == total
    # Read the one CL2 authoritative institution policy and effective scoped views.
    # CL27 may project these facts but must never recalculate or reauthor them.
    for table, total in [("unified_physical_site", 2579), ("source_ministry", 2723),
                         ("institute_norm", 8), ("timetable_ministry_link", 4681)]:
        assert db.execute(f"SELECT COUNT(*) FROM {table}").fetchone()[0] == total
    norm_evidence = defaultdict(list)
    for n in db.execute("SELECT * FROM institute_norm ORDER BY institute_id,field"):
        norm_evidence[n["institute_id"]].append({
            "field": n["field"], "value": n["value"],
            "subject_scope": n["subject_scope"], "evidence_url": n["evidence_url"],
            "evidence_kind": n["evidence_kind"], "evidence_basis": n["evidence_basis"]
        })
    effective_sources = {r["source_id"]: dict(r)
                         for r in db.execute("SELECT * FROM effective_source_liturgy")}
    assert len(effective_sources) == 2723
    assert set(norm_evidence) == {"FSSP", "ICKSP", "IBP", "SSPX"}
    anchor_rows = db.execute("SELECT * FROM canonical_site ORDER BY effective_anchor_id, group_id").fetchall()
    physical = defaultdict(list)
    for s in anchor_rows:
        physical[s["effective_anchor_id"]].append(s)
    assert len(physical) == 2579

    source_to_venue = {row["source_id"]: row for row in
        db.execute("SELECT * FROM venue_source")}
    source_records = []
    counts = Counter()
    joined_sources = defaultdict(list)
    institutions = Counter()
    for c in db.execute("SELECT * FROM classification_source ORDER BY source_id"):
        raw = json.loads(c["source_json"])
        venue = source_to_venue.get(c["source_id"])
        safe = c["join_state"] == "JOINED_EXACT_SOURCE_AND_GROUP"
        effective = None
        if safe:
            assert venue is not None and venue["joined_canonical_group_id"]
            assert venue["recorded_group_id"] == col(raw, "historical_group_id")
            effective = db.execute(
                "SELECT effective_anchor_id FROM canonical_site WHERE group_id=?",
                (venue["joined_canonical_group_id"],)
            ).fetchone()["effective_anchor_id"]
            assert effective in physical
            joined_sources[effective].append(c["source_id"])
        else:
            assert c["join_state"] in ("SOURCE_GROUP_CONFLICT_HOLD", "CLASSIFICATION_ONLY_NO_B98_SOURCE")
        group = str(col(raw, "organization_hint") or "").strip()
        group_state = str(col(raw, "organization_hint_status") or "").strip()
        source_only = group_state == "SOURCE_LABEL_ONLY"
        if source_only:
            assert group not in ("UNKNOWN", "UNRESOLVED", "")
            institutions[group] += 1
        edition = "1962" if c["owner_verified_missal_1962"] else UNKNOWN
        inherited = effective_sources[c["source_id"]]
        institute = inherited["institute_id"]
        norm = norm_evidence.get(institute, [])
        assert (len(norm) == 2) if institute else not norm
        if institute:
            assert inherited["institute_label_grade"] == "SOURCE_LABEL_ONLY"
            assert inherited["liturgical_use"] == "ROMAN"
            assert inherited["missal_edition"] == "1962"
            counts["inherited_institute_source_labels"] += 1
            counts["inherited_" + institute] += 1
        else:
            assert inherited["liturgical_use"] == UNKNOWN
            assert inherited["missal_edition"] == UNKNOWN
        if safe:
            assert inherited["physical_anchor_id"] == effective
        else:
            assert inherited["physical_anchor_id"] is None
        claim = {
            "source_id": c["source_id"],
            "historical_group_id": col(raw, "historical_group_id"),
            "physical_anchor_id": effective,
            "join_state": c["join_state"],
            "name_as_listed": col(raw, "name_as_listed"),
            "original_affiliation": col(raw, "affiliation_as_listed"),
            "institution_label": group if source_only else UNKNOWN,
            "institution_evidence": SOURCE_ONLY if source_only else UNKNOWN,
            "institution_source_url": col(raw, "institutional_evidence_url") or None,
            "institute_is_actual_celebrant": UNKNOWN,
            "lay_organizer": UNKNOWN,
            "canonical_status": UNKNOWN,
            "ecclesial_position": UNKNOWN,
            "pontiff_recognition": UNKNOWN,
            "una_cum": UNKNOWN,
            # A group-wide norm is sourced ONCE in CL2, inherited by this
            # source-labelled ministry; a direct owner witness remains separate.
            "liturgical_use": inherited["liturgical_use"],
            "effective_missal_edition": inherited["missal_edition"],
            "inherited_institute_id": institute,
            "inherited_institute_policy": norm,
            "inherited_scope": inherited["inherited_scope"],
            "liturgical_claim_grade": (
                "INHERITED_INSTITUTE_NORM_SOURCE_LABEL_NOT_MASS_VERIFIED"
                if institute else UNKNOWN),
            "missal_edition_at_source_scope": edition,
            "missal_owner_witness_url": col(raw, "owner_missal_evidence_url") if edition == "1962" else None,
            "missal_assertion_scope": "EXACT_SOURCE_WITNESS_NOT_BLANKET_MASS" if edition == "1962" else UNKNOWN,
            "original_rite_claim": col(raw, "rite_source_claim"),
            "original_missal_literal": col(raw, "missal_original_literal"),
            "original_evidence_status": col(raw, "original_evidence_status"),
            "publication": UNRELEASED,
        }
        source_records.append(claim)
        counts[c["join_state"]] += 1
        counts["source_edition_1962"] += int(edition == "1962")
        counts["source_label_only"] += int(source_only)

    assert counts["JOINED_EXACT_SOURCE_AND_GROUP"] == 2674
    assert counts["SOURCE_GROUP_CONFLICT_HOLD"] == 5
    assert counts["CLASSIFICATION_ONLY_NO_B98_SOURCE"] == 36
    assert counts["source_edition_1962"] == 3
    assert counts["source_label_only"] == 2008
    assert counts["inherited_institute_source_labels"] == 1389
    assert {i: counts["inherited_" + i] for i in norm_evidence} == {
        "FSSP": 381, "ICKSP": 158, "IBP": 31, "SSPX": 819}
    assert len(source_records) == 2715

    site_rows = []
    for anchor, historical in sorted(physical.items()):
        first = next((r for r in historical if r["group_id"] == anchor), historical[0])
        source_ids = sorted(set(joined_sources[anchor]))
        records = [r for r in source_records if r["physical_anchor_id"] == anchor]
        labels = sorted({r["institution_label"] for r in records
                         if r["institution_label"] != UNKNOWN})
        witness_ids = sorted(r["source_id"] for r in records
                             if r["missal_edition_at_source_scope"] == "1962")
        inherited_ids = sorted(r["source_id"] for r in records
                               if r["inherited_institute_id"] is not None)
        site_rows.append({
            "physical_anchor_id": anchor,
            "historical_group_ids": sorted(row["group_id"] for row in historical),
            "country": first["country"],
            "name": first["name"],
            "physical_description": first["physical_description"],
            "source_ids": source_ids,
            "institute_source_labels": labels,
            "source_label_conflicts": len(labels) > 1,
            "source_level_1962_witness_ids": witness_ids,
            "institute_norm_inherited_source_ids": inherited_ids,
            # Do not copy any inherited liturgical norm onto a shared building.
            "celebrant": UNKNOWN,
            "organizing_society": UNKNOWN,
            "una_cum": UNKNOWN,
            "pontiff_recognition": UNKNOWN,
            "ecclesial_position": UNKNOWN,
            "canonical_status": UNKNOWN,
            "rite_of_all_celebrations": UNKNOWN,
            "missal_for_all_celebrations": UNKNOWN,
            "research_only": True,
            "public_classification_approved": False
        })

    assert len(site_rows) == 2579
    assert sum(len(x["source_ids"]) for x in site_rows) == 2674
    assert sum(len(x["historical_group_ids"]) for x in site_rows) == 2584
    assert sum(len(x["source_level_1962_witness_ids"]) for x in site_rows) == 3
    assert sum(len(x["institute_norm_inherited_source_ids"]) for x in site_rows) == sum(
        r["inherited_institute_id"] is not None and r["physical_anchor_id"] is not None
        for r in source_records)
    assert all(r["rite_of_all_celebrations"] == UNKNOWN
               and r["missal_for_all_celebrations"] == UNKNOWN for r in site_rows)
    assert all(x["una_cum"] == UNKNOWN and x["ecclesial_position"] == UNKNOWN
               and not x["public_classification_approved"] for x in site_rows)

    missing = sorted(set(source_to_venue) - set(x["source_id"] for x in source_records))
    assert len(missing) == 8
    result = {
        "schema": "AO_CL27_TLM_CLASSIFICATION_PROJECTION_V1",
        "frozen_baseline": "CL2",
        "date": "2026-10-26",
        "taxonomy": tax,
        "counts": {
            "historical_canonical_site_ids": 2584,
            "distinct_physical_anchors": 2579,
            "historical_mass_rows_unchanged": 4681,
            "classification_source_rows": len(source_records),
            "safe_exact_classification_source_joins": counts["JOINED_EXACT_SOURCE_AND_GROUP"],
            "identity_group_conflicts_held": 5,
            "classification_only_orphans_held": 36,
            "venue_sources_without_classification_held": len(missing),
            "organization_labels_at_source_only": counts["source_label_only"],
            "source_scoped_1962_witnesses": counts["source_edition_1962"],
            "institute_norm_assertions_from_CL2": sum(map(len, norm_evidence.values())),
            "inherited_institute_source_labels": counts["inherited_institute_source_labels"],
            "inherited_source_labels_by_institute": {
                i: counts["inherited_" + i] for i in sorted(norm_evidence)},
            "inherited_exact_joined_source_labels": sum(
                len(x["institute_norm_inherited_source_ids"]) for x in site_rows),
            "una_cum_confirmed_per_celebration": 0,
            "public_classifications_approved": 0,
        },
        "physical_site_classification_facets": site_rows,
        "source_scoped_classification_assertions": source_records,
        "unclassified_frozen_venue_source_ids": missing,
        "release_note": "CL2 institution-wide Roman/1962 norms are inherited by source-labelled ministries. This does not certify any individual Mass, venue-wide Missal, celebrant, canonical status, or Una Cum value."
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(result, ensure_ascii=False, separators=(",", ":"))
    args.output.write_text(serialized + "\n", encoding="utf-8")
    if args.html_output:
        assert not args.html_output.exists(), "Never overwrite an existing offline review export"
        template = Path("tools/directory/review-cl27-tlm-classifications.html").read_text(encoding="utf-8")
        slot = "<script>\n'use strict';"
        assert template.count(slot) == 1, "Missing safe offline-embed insertion point"
        # The JSON script is inert. Escape HTML parser-sensitive characters before insertion.
        inert_json = serialized.replace("<", "\\u003c").replace(">", "\\u003e").replace("&", "\\u0026")
        html = template.replace(slot, '<script id="embedded-data" type="application/json">' + inert_json + '</script>\n' + slot, 1)
        args.html_output.parent.mkdir(parents=True, exist_ok=True)
        args.html_output.write_text(html, encoding="utf-8")
        assert html.count('id="embedded-data"') == 1 and 'AO_CL27_TLM_CLASSIFICATION_PROJECTION_V1' in html
        print(f"Self-contained offline reviewer: {args.html_output}")
    print("Classification projection PASS: 2,579 anchors / 2,715 source claims / "
          "1,389 CL2 group-inherited source labels / 3 direct owner 1962 witnesses / "
          "zero venue-wide inference or public approvals")


if __name__ == "__main__":
    main()
