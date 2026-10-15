import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=file=>JSON.parse(readFileSync(new URL("../"+file,import.meta.url),"utf8"));
const owner=read("data/saints/parallel-owner-identity-bridge-20261015.v1.json");
const pilot=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const cycle=read("data/saints/1962-observed-identity-crosswalk-pilot.v1.json");
assert.equal(owner.schema,"ao.saints.parallel-owner-identity-bridge.v1");
assert.equal(owner.status,"EDITORIAL_SOURCE_LINKS_ONLY_NOT_GLOBAL_ID_RENAMES");
assert.equal(owner.observed_2026.days,365);
assert.equal(owner.observed_2026.sanctoral_principals+owner.observed_2026.temporal_principals+owner.observed_2026.source_cycle_other,365);
assert.equal(owner.observed_2026.other_common_bvm+owner.observed_2026.other_feria,owner.observed_2026.source_cycle_other);
assert.equal(owner.observed_2026.named_commemoration_occurrences,117);
assert.equal(owner.observed_2026.days_with_named_commemorations,112);
assert.equal(owner.observed_2026.distinct_named_commemoration_strings,115);
assert.equal(owner.observed_2026.distinct_principal_source_ids,297);
assert.equal(owner.subject_demand_review.review_days,365);
assert.equal(owner.subject_demand_review.total_source_title_mentions_not_unique_saints,165+117);
assert.equal(owner.subject_demand_review.days_with_source_title_mentions,222);
assert.equal(owner.subject_demand_review.lexical_hint_individual_or_person+
 owner.subject_demand_review.lexical_hint_collective_or_group+
 owner.subject_demand_review.lexical_hint_marian+
 owner.subject_demand_review.lexical_hint_other,282);
assert.equal(owner.subject_demand_review.canonical_person_id_promotions,0);
assert.equal(owner.subject_demand_review.approved_artwork_promotions,0);

const idmap=new Map(pilot.people.map(p=>[p.saint_id,p]));
assert.equal(idmap.size,6,"Duplicate person identities are never allowed");
const crossIds=new Map(cycle.candidate_general_1962.map(x=>[x.saint_id,x.observed_2026_source_id]));
assert.equal(crossIds.get("saint:therese-of-lisieux"),"sancti:10-03:3:w");
assert.equal(crossIds.get("saint:margaret-mary-alacoque"),"sancti:10-17:3:w");
for(const link of owner.identity_links){
  assert(idmap.has(link.saints_id),"Linked identity missing from Saints owner");
  assert(/^saint\.[a-z0-9-]+$/.test(link.calendar_person_id),"Calendar identity format must remain Calendar-owned");
  assert(!link.calendar_person_id.includes("laval"),"Laval surname cannot be guessed as exact identity");
  if(link.observed_calendar_2026_principal_id)assert.equal(
    link.observed_calendar_2026_principal_id,crossIds.get(link.saints_id),"Calendar principal source mismatch");
}
assert.equal(owner.identity_links.length,2,"Only two cross-branch person matches are presently evidenced");
assert(owner.nonlinks.some(x=>x.saints_id==="blessed:jacques-desire-laval"
  &&x.calendar_person_id==="saint.francois-de-montmorency-laval"
  &&x.relation==="DISTINCT_PERSON_DO_NOT_MERGE"),"Distinct Laval persons must never be merged");
assert(owner.nonlinks.some(x=>x.saints_id==="saint:margaret-mary-alacoque"
  &&x.observed_calendar_2026_principal_id==="sancti:10-17:3:w"),"Observed calendar date may exist before full person owner crosswalk");
assert(pilot.people.every(x=>x.calendar_1962_keys.length===0),"Bridge does not mutate old Calendar person mappings");
assert(pilot.people.every(x=>x.approved_artwork_ids.length===0),"Bridge does not promote unreviewed art");
assert(owner.observed_2026.json_artifact.includes("/artifacts/11969382750"));
console.log("PASS: full-year summary, 2 exact Calendar owner identity links, distinct Laval lock, 1962 and art guards");
