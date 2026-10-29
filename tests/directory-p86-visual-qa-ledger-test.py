#!/usr/bin/env python3
"""Research-only QA ledger contract; no image publication/automatic approval."""
import json
from pathlib import Path
p=Path("data/directory/research/p86-actual-visual-photo-qa-301-20261029.json")
j=json.loads(p.read_text(encoding="utf-8"))
assert j["schema"]=="AO_DIRECTORY_P86_FIRST_VISUAL_QA_RESEARCH_LEDGER_V1"
r=j["review"]
assert r["original_candidates"]==301 and r["thumbnails_inspected"]==299
assert r["unavailable_previews"]==2
assert r["distinct_physical_anchors"]==139
assert r["generic_anchor_count"]==23 and r["generic_anchor_assignments"]==55
assert j["source"]["p83_queue_sha256"]=="dc9d94af8aa69959dcdc094de9b93f4b6ee29eeaec8944468a223c75cd082af8"
dis=j["dispositions_by_one_based_source_row"]
want={"OFF_TOPIC":46,"DETAIL_ONLY":111,"WEAK_VIEW":47,
      "AMBIGUOUS_VENUE":22,"NO_PREVIEW":2,"PLAUSIBLE_EXTERIOR":73}
assert {k:len(v) for k,v in dis.items()}==want
allids=[v for ids in dis.values() for v in ids]
assert sorted(allids)==list(range(1,302)),"Duplicate or missing photo review row"
short=j["shortlist"]["preferred_one_based_source_row"]
assert len(short)==len(set(short))==52 and set(short)<=set(dis["PLAUSIBLE_EXTERIOR"])
assert len(j["generic_city_or_mission_only_site_names"])==23
assert j["safety"]=={"building_subject_verified":0,"licences_independently_cleared":0,
   "original_bytes_verified":0,"approved_hero_images":0,"published_images":0,
   "rights_holds_preserved":True}
from importlib.util import spec_from_file_location, module_from_spec
spec=spec_from_file_location("p83","tools/directory/screen-worldwide-p83-photo-candidates.py")
mod=module_from_spec(spec);spec.loader.exec_module(mod)
assert set(mod.P86_GENERIC_UNRESOLVED_VENUE_NAMES)==set(j["generic_city_or_mission_only_site_names"])
print("P86 visual QA ledger: 299 thumbnails actually reviewed, 52 held exterior choices, 0 published — PASS")
