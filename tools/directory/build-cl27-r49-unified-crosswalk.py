#!/usr/bin/env python3
"""Lossless exact-ID crosswalk: existing R49 pins -> the one CL2 physical master.

Research/audit only. Do NOT use this output to publish pins, current Mass times,
venue-wide rite/Missal, Una Cum or ecclesial/canonical status. Preserve every
R49 source ID and CL2 anchor ID; never match by similar names or proximity.
"""
import argparse
from collections import defaultdict, Counter
import hashlib
import json
import sqlite3
from pathlib import Path

R49 = Path("data/directory/preliminary-map-r49.v1.json")
R49_COLUMNS = ["id","name","country","locality","affiliation","group",
               "lat","lng","url","other_url","precision"]
UNKNOWN = "UNKNOWN"
JOIN = "JOINED_EXACT_SOURCE_AND_GROUP"


def build(db, pins):
    db.row_factory = sqlite3.Row
    assert db.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
    assert not db.execute("PRAGMA foreign_key_check").fetchall()
    for table, expected in [("unified_physical_site",2579),("source_ministry",2723),
                            ("venue_source",2687),("classification_source",2715),
                            ("mass_time",4681),("institute_norm",8)]:
        assert db.execute("SELECT COUNT(*) FROM " + table).fetchone()[0] == expected
    source = {x["source_id"]: dict(x) for x in db.execute("SELECT * FROM effective_source_liturgy")}
    ministry = {x["source_id"]: dict(x) for x in db.execute("SELECT * FROM source_ministry")}
    venues = {x["source_id"]: dict(x) for x in db.execute("SELECT * FROM venue_source")}
    classifications = {x["source_id"]: dict(x) for x in db.execute("SELECT * FROM classification_source")}
    physical = {x["anchor_id"]: dict(x) for x in db.execute("SELECT * FROM unified_physical_site")}
    canonical = {x["group_id"]: dict(x) for x in db.execute("SELECT * FROM canonical_site")}
    norms = defaultdict(list)
    for x in db.execute("SELECT * FROM institute_norm ORDER BY institute_id,field"):
        norms[x["institute_id"]].append({
            "field": x["field"], "value": x["value"],
            "scope": x["subject_scope"], "evidence_url": x["evidence_url"],
            "evidence_kind": x["evidence_kind"], "basis": x["evidence_basis"]})
    assert set(norms) == {"FSSP","ICKSP","IBP","SSPX"}
    assert all(len(n) == 2 for n in norms.values())

    by_anchor = defaultdict(list)
    result = []
    statuses = Counter()
    for pin in pins:
        source_id, name, country, locality, listed_affiliation, public_group, lat, lon, *_ = pin
        if source_id not in source or source_id not in venues:
            raise AssertionError("Pin source ID is absent from CL2; hold identity: " + source_id)
        m = ministry[source_id]
        v = venues[source_id]
        effective = source[source_id]
        if v["classification_merge_state"] != JOIN or m["original_join_state"] != JOIN:
            raise AssertionError("Crosswalk cannot use a held source-group join: " + source_id)
        anchor = effective["physical_anchor_id"]
        group_id = v["joined_canonical_group_id"]
        if not anchor or not group_id or not v["recorded_group_id"] == group_id:
            raise AssertionError("Crosswalk source/group/anchor is incomplete: " + source_id)
        if m["recorded_group_id"] != group_id:
            raise AssertionError("Source ministry has a contradictory group: " + source_id)
        canonical_site = canonical[group_id]
        if canonical_site["effective_anchor_id"] != anchor or anchor not in physical:
            raise AssertionError("Alias does not resolve to the frozen physical anchor: " + source_id)
        original = json.loads(v["source_json"])
        if original[0] != source_id or original[4] != name or original[5] != country:
            raise AssertionError("R49 name/country/source ID disagree with CL2: " + source_id)
        if country != canonical_site["country"] or country != physical[anchor]["country"]:
            raise AssertionError("Country disagrees with CL2 physical site: " + source_id)
        # Original venue-source fields 16/17 are historical latitude/longitude.
        if original[16] in ("", None) or original[17] in ("", None):
            coordinate_state = "CL2_SOURCE_COORDINATE_ABSENT"
        elif abs(float(original[16]) - lat) <= 0.00001 and abs(float(original[17]) - lon) <= 0.00001:
            coordinate_state = "SAME_STORED_SOURCE_COORDINATES_NOT_GEOCODE_VERIFIED"
        else:
            coordinate_state = "COORDINATE_DISAGREEMENT_HOLD"
        institute = effective["institute_id"]
        if institute:
            assert institute in norms
            assert effective["liturgical_use"] == "ROMAN"
            assert effective["missal_edition"] == "1962"
        else:
            assert effective["liturgical_use"] == UNKNOWN
            assert effective["missal_edition"] == UNKNOWN
        direct = bool(classifications[source_id]["owner_verified_missal_1962"])
        row = {
            "r49_pin_id": source_id, "cl2_source_id": source_id,
            "cl2_historical_group_id": group_id, "cl2_physical_anchor_id": anchor,
            "country": country, "venue_name": name,
            "r49_affiliation_label": listed_affiliation, "r49_public_group": public_group,
            "r49_coordinate": [lat, lon],
            "coordinate_comparison": coordinate_state,
            "institute_id_with_CL2_inherited_norm": institute,
            "source_ministry_liturgical_use": effective["liturgical_use"],
            "source_ministry_missal_edition": effective["missal_edition"],
            "source_ministry_claim_grade": effective["inherited_scope"],
            "direct_1962_source_witness": direct,
            "scope": "SOURCE_MINISTRY_ONLY_NOT_SITE_OR_CELEBRATION",
            "identity_join": "EXACT_FROZEN_SOURCE_ID_AND_GROUP",
            "classification_public_approval": False,
            "mass_schedule_public_approval": False,
            "do_not_rewrite_R49": True,
        }
        statuses[coordinate_state] += 1
        result.append(row)
        by_anchor[anchor].append(row)

    physical_groups = []
    for anchor, rows in sorted(by_anchor.items()):
        coords = {tuple(x["r49_coordinate"]) for x in rows}
        institutes = sorted({x["institute_id_with_CL2_inherited_norm"]
                             for x in rows if x["institute_id_with_CL2_inherited_norm"]})
        physical_groups.append({
            "anchor_id": anchor, "source_pin_ids": sorted(x["r49_pin_id"] for x in rows),
            "pin_count": len(rows), "multiple_pin_sources": len(rows)>1,
            "coordinates_identical": len(coords)==1,
            "institute_norm_refs": institutes,
            "mixed_institute_norms": len(institutes)>1,
            "representative_pin_selected": False,
            "physical_site_rite": UNKNOWN, "physical_site_missal": UNKNOWN,
            "una_cum": UNKNOWN, "current_schedule_verified": False,
            "release": "HOLD_NO_AUTOMATIC_MARKER_CONSOLIDATION",
        })

    # Preserve the rest of the canonical master as a separate release-gated
    # physical-site backlog, not a collection of invented R49 map records.
    source_counts_by_anchor = Counter(x["physical_anchor_id"] for x in ministry.values()
                                     if x["physical_anchor_id"] is not None)
    unrepresented = [
        {
            "physical_anchor_id": anchor, "country": x["country"],
            "name": x["name"], "description": x["physical_description"],
            "known_frozen_ministry_source_count":source_counts_by_anchor.get(anchor,0),
            "r49_public_pin_id":None,
            "publication_state":"RESEARCH_ONLY_NOT_IN_R49"
        }
        for anchor,x in sorted(physical.items()) if anchor not in by_anchor
    ]
    assert len(unrepresented)==735
    duplicates = [g for g in physical_groups if g["multiple_pin_sources"]]
    inherited = Counter(x["institute_id_with_CL2_inherited_norm"] for x in result
                        if x["institute_id_with_CL2_inherited_norm"])
    counts = {
        "r49_original_pins":len(pins),
        "exact_source_and_group_id_links":len(result),
        "unlinked_pins":0,
        "physical_anchors_represented":len(by_anchor),
        "physical_anchors_not_in_R49":len(unrepresented),
        "multiple_pin_physical_anchor_groups":len(duplicates),
        "additional_pins_above_unique_physical_anchors":sum(g["pin_count"]-1 for g in duplicates),
        "multiple_pin_groups_with_coordinate_differences":sum(not g["coordinates_identical"] for g in duplicates),
        "multiple_pin_groups_with_distinct_institute_norms":sum(g["mixed_institute_norms"] for g in duplicates),
        "source_coordinate_comparisons":dict(sorted(statuses.items())),
        "norm_inherited_pin_sources":sum(inherited.values()),
        "norm_inherited_pin_sources_by_institute":dict(sorted(inherited.items())),
        "direct_source_1962_witnesses":sum(x["direct_1962_source_witness"] for x in result),
        "newly_published_pins":0, "newly_published_classifications":0,
        "newly_published_mass_times":0,
    }
    assert (counts["r49_original_pins"],counts["exact_source_and_group_id_links"],
            counts["physical_anchors_represented"],
            counts["multiple_pin_physical_anchor_groups"],
            counts["additional_pins_above_unique_physical_anchors"]) == (1879,1879,1844,35,35)
    assert statuses["SAME_STORED_SOURCE_COORDINATES_NOT_GEOCODE_VERIFIED"] == 1878
    assert statuses["CL2_SOURCE_COORDINATE_ABSENT"] == 1
    assert statuses["COORDINATE_DISAGREEMENT_HOLD"] == 0
    assert all(x["physical_site_missal"]==UNKNOWN and not x["representative_pin_selected"]
               for x in physical_groups)
    return {
        "schema":"AO_CL27_R49_EXACT_CL2_CROSSWALK_RESEARCH_V1",
        "canonical_master":"CL2 checked-shard reconstructed SQLite; no new identity or classification master",
        "r49_sha256":hashlib.sha256(R49.read_bytes()).hexdigest(),
        "counts":counts,
        "institute_norm_evidence_single_canonical_catalogue":dict(sorted(norms.items())),
        "r49_to_cl2_source_scope":result,
        "represented_physical_anchors":physical_groups,
        "canonical_physical_sites_not_in_R49":unrepresented,
        "public_use":"RESEARCH_ONLY_NOT_AN_APP_IMPORT",
        "next_gate":"Review duplicate markers and exceptional coordinate/source issues before an explicit runtime projection."
    }


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--db",type=Path,required=True)
    parser.add_argument("--output",type=Path,required=True)
    args=parser.parse_args()
    assert not args.output.exists(), "Never overwrite a review audit"
    doc=json.loads(R49.read_text(encoding="utf-8"))
    assert doc["schema"]=="AO_PRELIMINARY_TLM_MAP_R49"
    assert doc["columns"]==R49_COLUMNS
    assert len(doc["records"])==1879
    pins=doc["records"]
    assert len({r[0] for r in pins})==len(pins)
    assert all(len(r)==11 and isinstance(r[6],(float,int))
               and isinstance(r[7],(float,int)) for r in pins)
    db=sqlite3.connect(args.db)
    data=build(db,pins)
    db.close()
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("R49→CL2 exact crosswalk PASS: "+json.dumps(data["counts"],sort_keys=True))


if __name__=="__main__":
    main()
