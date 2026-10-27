#!/usr/bin/env python3
"""Create zero-cost high-volume, release-gated geocode intake from CL2 only.

These 735 canonical CL2 locations are absent from R49; each is retained under
its frozen physical anchor, with all joined sources and provider links.
Address-like description text is not validated geography. Never auto-publish.
"""
import argparse
from collections import Counter, defaultdict
import json
import re
import sqlite3
from pathlib import Path
from urllib.parse import urlparse

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--db",type=Path,required=True)
    p.add_argument("--crosswalk",type=Path,required=True)
    p.add_argument("--output",type=Path,required=True)
    a=p.parse_args()
    assert not a.output.exists()
    x=json.loads(a.crosswalk.read_text())
    assert x["schema"]=="AO_CL27_R49_EXACT_CL2_CROSSWALK_RESEARCH_V1"
    assert x["counts"]["physical_anchors_not_in_R49"]==735
    db=sqlite3.connect(a.db)
    db.row_factory=sqlite3.Row
    rows=[dict(row) for row in db.execute("SELECT * FROM source_ministry WHERE physical_anchor_id IS NOT NULL")]
    assert len(rows)==2674
    byanchor=defaultdict(list)
    for r in rows:byanchor[r["physical_anchor_id"]].append(r)
    venue={r["source_id"]:dict(r) for r in db.execute("SELECT * FROM venue_source")}
    cls={r["source_id"]:dict(r) for r in db.execute("SELECT * FROM classification_source")}
    targets=[]
    geography=Counter()
    bysource=Counter()
    texts=Counter()
    sourcecoords=0
    for site in x["canonical_physical_sites_not_in_R49"]:
        anchor=site["physical_anchor_id"]
        members=sorted(byanchor[anchor],key=lambda r:r["source_id"])
        assert len(members)==site["known_frozen_ministry_source_count"]
        desc=(site["description"] or "").strip()
        # LOW-CONFIDENCE TEXT TRIAGE ONLY. Digits can be postal codes, not
        # street numbers. Nothing here constitutes an approved address.
        signal=("MISSING_DESCRIPTION" if not desc else
            "DESCRIPTION_CONTAINS_DIGITS_NOT_VERIFIED_ADDRESS"
            if re.search(r"\d",desc) else "LOCALITY_OR_NAME_TEXT_NO_DIGITS")
        evidence=[]
        for m in members:
            v=venue.get(m["source_id"])
            assert v and v["classification_merge_state"]=="JOINED_EXACT_SOURCE_AND_GROUP"
            raw=json.loads(v["source_json"])
            assert raw[0]==m["source_id"]
            coord=(raw[16],raw[17])
            if coord[0] not in ("",None) and coord[1] not in ("",None):
                sourcecoords+=1
                raise AssertionError("Unrepresented anchor unexpectedly has coordinates; adjust release gate")
            # Original source URLs occupy columns 25 and 26. They may hold
            # semicolon lists; retain only source-grade URL references.
            urls=[]
            for cell in (raw[25],raw[26]):
                for u in str(cell or "").split(";"):
                    u=u.strip()
                    if u.startswith(("https://","http://")) and u not in urls:
                        urls.append(u)
            c=cls.get(m["source_id"])
            evidence.append({
                "source_id":m["source_id"],
                "reported_organization":m["institute_id"],
                "source_label_grade":m["institute_label_grade"],
                "source_urls":urls,
                "known_CL2_source_coordinates":False,
                "owner_1962_witness_if_any":bool(c and c["owner_verified_missal_1962"]),
                "ritual_and_missal_scoped_to_source_not_venue":True
            })
        geography[site["country"]]+=1
        bysource[len(members)]+=1
        texts[signal]+=1
        targets.append({
           "physical_anchor_id":anchor,"country":site["country"],"name":site["name"],
           "physical_description_as_recorded":desc,
           "text_triage_not_geocode":signal,
           "source_memberships":evidence,
           "geometry":None,"location_approved":False,
           "current_recurring_mass_approved":False,
           "public_release_approved":False,
           "next_gate":"FIRST_PARTY_PHYSICAL_LOCATION_AND_EXACT_CHURCH_FOOTPRINT_THEN_INDEPENDENT_RELEASE_REVIEW"
        })
    assert len(targets)==735 and sourcecoords==0
    assert dict(bysource)=={0:8,1:691,2:36},bysource
    assert sum(geography.values())==735
    assert all(not t["location_approved"] and not t["public_release_approved"] for t in targets)
    batches=[]
    # High-volume throughput: group by country order but fill complete
    # 150-anchor cohorts across country boundaries (never 1-20-site batches).
    ordered=sorted(targets,key=lambda s:(-geography[s["country"]],
                                       s["country"],s["physical_anchor_id"]))
    for start in range(0,len(ordered),150):
        cohort=ordered[start:start+150]
        batches.append({
            "batch":len(batches)+1,
            "anchor_ids":[s["physical_anchor_id"] for s in cohort],
            "country_distribution":dict(sorted(Counter(s["country"] for s in cohort).items())),
            "count":len(cohort),
            "research_state":"RESEARCH_NOT_GEOCODE_VERIFIED"
        })
    assert sum(b["count"] for b in batches)==735
    assert [b["count"] for b in batches]==[150,150,150,150,135]
    stats={
       "CL2_locations_not_in_R49":735,
       "source_memberships_by_site":dict(sorted((str(k),v) for k,v in bysource.items())),
       "sites_with_existing_source_coordinates":0,
       "geocoded_and_approved":0,
       "descriptive_text_triage":dict(sorted(texts.items())),
       "per_country":dict(sorted(geography.items(),key=lambda x:(-x[1],x[0]))),
       "batch_count":len(batches),
       "new_public_pins":0
    }
    result={
      "schema":"AO_CL27_CL2_735_MISSING_MAP_SITE_BULK_INTAKE_V1",
      "derived_from":"CL2 canonical physical anchor and source ministry master, via exact R49 crosswalk",
      "counts":stats,
      "intake":targets,
      "geocode_batches_max_150":batches,
      "publish_state":"ZERO_APPROVALS_ALL_HELD"
    }
    db.close()
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps(result,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("735-site batch intake PASS: "+json.dumps(stats,sort_keys=True))


if __name__=="__main__":
    main()
