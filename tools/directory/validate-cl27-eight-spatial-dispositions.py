#!/usr/bin/env python3
"""Audit the eight CL2/R49 geospatial exceptions against immutable crosswalk data.

Evidence points are candidates, not app pin coordinates or certified entrances.
No generated data is imported into Find. One data master (CL2); this is a
per-anchor exception review, not an independent places catalogue.
"""
import argparse
from collections import Counter
import json
from math import asin, cos, radians, sin, sqrt
from pathlib import Path

STATUS={
    "COORDINATE_REFERENCE_FOUND_REQUIRES_RELEASE_REVIEW":5,
    "SAME_POINT_FLOAT_PRECISION":1,
    "HOLD_PRECISE_CHAPEL_OR_ENTRANCE_POSITION":1,
    "HOLD_INDEPENDENT_BUILDING_COORDINATES":1,
}

def haversine(a,b):
    a0,a1=map(radians,a)
    b0,b1=map(radians,b)
    diff0=b0-a0;diff1=b1-a1
    h=sin(diff0/2)**2+cos(a0)*cos(b0)*sin(diff1/2)**2
    return 6371000*2*asin(min(1,sqrt(h)))

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--crosswalk",type=Path,required=True)
    p.add_argument("--reviews",type=Path,default=Path(
       "data/directory/research/cl27-classification-review-20261026/eight-spatial-dispositions.v1.json"))
    p.add_argument("--output",type=Path,required=True)
    args=p.parse_args()
    assert not args.output.exists()
    crosswalk=json.loads(args.crosswalk.read_text())
    reviews=json.loads(args.reviews.read_text())
    assert crosswalk["schema"]=="AO_CL27_R49_EXACT_CL2_CROSSWALK_RESEARCH_V1"
    assert reviews["schema"]=="AO_CL27_R49_CL2_EIGHT_SPATIAL_DISPOSITIONS_V1"
    assert reviews["parent_crosswalk_schema"]==crosswalk["schema"]
    assert reviews["statuses"]==STATUS
    assert all(reviews["constraints"].values())
    group={r["anchor_id"]:r for r in crosswalk["represented_physical_anchors"]}
    src={r["r49_pin_id"]:r for r in crosswalk["r49_to_cl2_source_scope"]}
    assert len(group)==1844 and len(src)==1879
    conflicting={a for a,g in group.items() if g["multiple_pin_sources"] and not g["coordinates_identical"]}
    assert len(conflicting)==8
    assert {r["anchor_id"] for r in reviews["records"]}==conflicting
    disposition=Counter()
    out=[]
    for r in reviews["records"]:
        anchor=r["anchor_id"]
        g=group[anchor]
        assert g["pin_count"]==2
        assert sorted(r["source_pin_ids"])==g["source_pin_ids"]
        assert r["status"] in STATUS and r["no_coordinate_publication"] is True
        assert r["owner_or_government_evidence"]
        assert all(q["url"].startswith("https://") and q["supports"]
                   for q in r["owner_or_government_evidence"])
        a,b=[src[x]["r49_coordinate"] for x in g["source_pin_ids"]]
        separation=haversine(a,b)
        assert separation>0
        reference=r["independent_reference"]
        if r["status"]=="COORDINATE_REFERENCE_FOUND_REQUIRES_RELEASE_REVIEW":
            assert reference is not None
            assert reference["url"].startswith("https://")
            assert -90<=reference["lat"]<=90 and -180<=reference["lng"]<=180
            nearest=min(haversine(a,[reference["lat"],reference["lng"]]),
                        haversine(b,[reference["lat"],reference["lng"]]))
            assert nearest<65, (anchor,nearest)
        else:
            assert reference is None
            nearest=None
        if r["status"]=="SAME_POINT_FLOAT_PRECISION":
            assert separation<0.1
        elif r["status"]=="COORDINATE_REFERENCE_FOUND_REQUIRES_RELEASE_REVIEW":
            assert separation>5
        else:
            assert separation>25
        disposition[r["status"]]+=1
        out.append({
          "anchor_id":anchor,"name":r["name"],"country":r["country"],
          "source_pin_ids":sorted(r["source_pin_ids"]),
          "separation_m":round(separation,2),
          "review_status":r["status"],
          "independent_coordinate_reference":reference,
          "candidate_nearest_original_source_m":round(nearest,2) if nearest is not None else None,
          "evidence":r["owner_or_government_evidence"],
          "research_approved_spatial_identity":True,
          "public_marker_coordinate":None,
          "public_marker_approved":False,
          "source_coordinates_mutated":False,
          "review_notes":r["caution"]
        })
    assert dict(disposition)==STATUS
    assert all(q["public_marker_coordinate"] is None and not q["public_marker_approved"]
               for q in out)
    result={
      "schema":"AO_CL27_EIGHT_SPATIAL_QA_RESULT_V1",
      "source":"R49/CL2 exact-frozen-ID research crosswalk and CL27 scoped evidence",
      "counts":{"conflicting_source_geometry_groups":8,
                "independent_building_reference_candidates":5,
                "floating_point_rounding_only":1,
                "exact_position_holds":2,
                "new_approved_public_markers":0,
                "unreviewed_duplicate_groups_with_identical_stored_geometry":27},
      "results":out,
      "release_gate":"NO_PUBLIC_MAP_MUTATION; preserve all original source markers; manual evidence review still required"
    }
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("Eight spatial exceptions PASS: five building candidates, one rounding-only, two precise-location holds; zero public pins. Separations (m): "+str({x["anchor_id"]:x["separation_m"] for x in out}))


if __name__=="__main__":
    main()
