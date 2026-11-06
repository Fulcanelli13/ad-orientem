// Research-only crosswalk of historical CL27 timetable source rows.
// Never reads or mutates the production schedule; source patterns are not published events.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const d=JSON.parse(readFileSync(
  new URL("../data/directory/research/cl27-current-firstparty-20261104/source-review.v1.json",import.meta.url),
  "utf8"
));
assert.equal(d.schema,"AO_CL27_HISTORICAL_ROWS_TO_LIVE_SOURCES_RECONCILIATION_V1");
assert.equal(d.publication,"RESEARCH_ONLY_NO_APP_IMPORT");
assert.equal(d.canonical_source.pr,1775);
assert.equal(d.canonical_source.blob_sha,"842b30caad7b6ad08ffed098cc136080fe89eb6d");
const byHistorical=new Map();
const seenUrls=new Set(),seenAnchors=new Set();
for(const group of d.source_page_groups){
  assert.ok(/^https?:\/\//.test(group.historical_url));
  assert.ok(!seenUrls.has(group.historical_url),"Duplicate source page URL");
  seenUrls.add(group.historical_url);
  assert.ok(group.rows.length&&group.anchors.length);
  assert.ok(group.source_review_state==="PARTIAL_LIVE_CHECK_EXISTS"||
            group.source_review_state==="UNREVIEWED");
  for(const id of group.anchors){
    if(id!==null)assert.match(id,/^RG-[A-F0-9]{12}$/);
    seenAnchors.add(id);
  }
  for(const row of group.rows){
    assert.ok(Number.isInteger(row)&&row>=0);
    assert.ok(!byHistorical.has(row),"Historical row belongs to more than one source");
    byHistorical.set(row,group);
  }
}
assert.equal(seenUrls.size,120);
assert.equal(byHistorical.size,296);
assert.equal(seenAnchors.size,143);
const checked=new Set(),cases=new Set(),stateCounts={};
for(const c of d.reviewed_cases){
  assert.ok(!cases.has(c.id));cases.add(c.id);
  assert.match(c.anchor,/^RG-[A-F0-9]{12}$/);
  assert.match(c.current_source,/^https:\/\//);
  assert.ok(c.observation&&c.gate&&c.classification_scope&&c.source_kind);
  assert.ok(c.rows.length);
  assert.ok(!Object.hasOwn(c,"una_cum")&&!Object.hasOwn(c,"canonical_status")&&
            !Object.hasOwn(c,"missal_edition")&&!Object.hasOwn(c,"pope_named_in_canon"),
            "Source association cannot publish a communion, canonical or book claim");
  for(const id of c.rows){
    assert.ok(!checked.has(id),"Duplicate reviewed historical row");checked.add(id);
    const group=byHistorical.get(id);
    assert.ok(group&&group.anchors.includes(c.anchor),"Reviewer crosswalk must preserve CL2 physical anchor");
    assert.equal(group.source_review_state,"PARTIAL_LIVE_CHECK_EXISTS");
  }
  stateCounts[c.verdict]=(stateCounts[c.verdict]||0)+c.rows.length;
}
assert.equal(cases.size,12);
assert.equal(checked.size,34);
assert.deepEqual(stateCounts,{
  PATTERN_CORROBORATED_SOURCE_ONLY:23,
  AGGREGATOR_DUPLICATE_OR_CONFLICT:3,
  PATTERN_CORROBORATED_LOCAL_EXCEPTION:2,
  CORRECT_HISTORICAL_MASS_TIME:2,
  VARIABLE_TIME_NOT_FIXED_RECURRENCE:4
});
assert.equal(d.reviewed_row_refs.length,34);
assert.equal(new Set(d.reviewed_row_refs.map(r=>r.historical_row)).size,34);
for(const row of d.reviewed_row_refs){
  assert.ok(checked.has(row.historical_row));
  assert.ok(row.source_id&&row.anchor&&row.case_id);
  assert.equal(row.publication,"HOLD_NO_PUBLIC_TIMETABLE_APPROVAL");
  assert.equal(byHistorical.get(row.historical_row).historical_url,row.legacy_source_url);
}
assert.deepEqual(d.summary,{
  historical_source_rows:296,
  source_urls:120,
  anchors:143,
  live_reviewed_source_claims:34,
  reviewed_site_cases:12,
  remaining_unreviewed_rows:262,
  missing_frozen_source_id:5,
  approved_timetables:0,
  approved_classifications:0,
  historical_collision_groups_pending:106
});
assert.deepEqual(d.reviewed_cases.find(x=>x.id==="PL-SLUPSK").rows,[2267,2268]);
assert.deepEqual(d.reviewed_cases.find(x=>x.id==="CZ-PRAHA-KARLOV").rows,[2365,2367]);
for(const id of ["AU-EAST-GREENMOUNT","AU-BUDERIM"]){
  assert.equal(d.reviewed_cases.find(x=>x.id===id).verdict,
    "VARIABLE_TIME_NOT_FIXED_RECURRENCE");
}
console.log("PASS CL27 historical source review: 296 frozen rows / 120 source pages / 143 site anchors; 34 reviewed without public promotion");


// A community/source role is not an individual Mass's rite, communion profile,
// celebrant, legal building title, or timeless canonical standing.
const roleReview=JSON.parse(readFileSync(new URL(
  "../data/directory/research/cl27-current-firstparty-20261104/classification-role-review.v1.json",
  import.meta.url),"utf8"));
assert.equal(roleReview.schema,"AO_CL27_SOURCE_ROLE_REVIEW_V1");
assert.equal(roleReview.publication,"RESEARCH_ONLY_NO_CLASSIFICATION_PROMOTION");
assert.equal(roleReview.records.length,13);
const observedAnchors=new Set();
const permitted=new Set(["ICKSP","FSSP","CARMELITE","ORATORIAN","SSPX","UNKNOWN"]);
for(const r of roleReview.records){
  const match=d.reviewed_cases.find(c=>c.id===r.case_id);
  assert.ok(match&&match.anchor===r.cl2_anchor);
  assert.equal(match.current_source,r.source_url);
  assert.equal(match.source_kind,r.source_kind);
  assert.ok(permitted.has(r.source_reported_community));
  assert.equal(r.subject,"SOURCE_NAMED_RELATIONSHIP_NOT_ALL_CELEBRATIONS");
  assert.equal(r.publication,"HOLD_CLASSIFICATION_SOURCE_SCOPED_RESEARCH");
  for(const field of ["una_cum","pope_named_in_canon","recognises_current_pontiff",
                     "ecclesial_position","canonical_status","exact_celebrant",
                     "missal_edition","rubrical_basis","venue_legal_owner"]){
    assert.ok(r.unknown_until_independently_documented.includes(field));
    assert.ok(!Object.hasOwn(r,field),"No unsupported public classification: "+field);
  }
  observedAnchors.add(r.cl2_anchor);
}
assert.equal(observedAnchors.size,12);
assert.equal(roleReview.records.filter(r=>r.case_id==="US-DALLAS-CARMEL").length,2);
console.log("PASS CL27 source roles: 13 scoped relationship observations / 12 sites; 0 published canonical or Una Cum claims");

// Wave 2 must be a pure extension of Wave 1, not a new timetable corpus.
const wave2=JSON.parse(readFileSync(new URL(
  "../data/directory/research/cl27-current-firstparty-20261104/source-review-wave2.v1.json",
  import.meta.url),"utf8"));
assert.equal(wave2.schema,"AO_CL27_SOURCE_PAGE_WAVE2_REVIEW_V1");
assert.equal(wave2.publication,
  "RESEARCH_ONLY_NO_APP_TIMETABLES_NO_CL27_PUBLIC_CLASSIFICATIONS");
assert.equal(wave2.historical_snapshot_blob_sha,d.canonical_source.blob_sha);
assert.equal(wave2.cases.length,18);
assert.equal(wave2.row_references.length,36);
assert.equal(wave2.summary.aggregate_reviewed_rows_after_wave2,70);
assert.equal(wave2.summary.remaining_historical_rows,226);
assert.equal(wave2.summary.approved_recurring_Masses,0);
assert.equal(wave2.summary.approved_canonical_UnaCum_claims,0);
assert.equal(wave2.summary.new_source_page_urls,2);
assert.equal(wave2.summary.source_pages_reviewed_this_wave,3);
const reviewedWave2=new Set();
const wave2Cases=new Map(wave2.cases.map(c=>[c.anchor,c]));
const allReviewed=new Set(checked);
for(const r of wave2.row_references){
  assert.ok(!allReviewed.has(r.historical_row),"Wave 2 cannot duplicate Wave 1 reviewed row");
  assert.ok(!reviewedWave2.has(r.historical_row));
  assert.equal(r.publication_status,"HOLD_NO_PUBLIC_TIMETABLE_APPROVAL");
  const g=byHistorical.get(r.historical_row);
  assert.ok(g,"Wave 2 must retain original historical row census");
  assert.equal(g.historical_url,r.source_url);
  assert.ok(g.anchors.includes(r.effective_anchor));
  assert.equal(wave2Cases.get(r.effective_anchor)?.decision,r.site_decision);
  reviewedWave2.add(r.historical_row);allReviewed.add(r.historical_row);
}
assert.equal(reviewedWave2.size,36);
assert.equal(allReviewed.size,70);
for(const c of wave2.cases){
  assert.ok(c.historical_rows.length>0);
  assert.equal(c.publication_status,"HOLD_RESEARCH_ONLY_NO_WEEKLY_MASS_APPROVAL");
  assert.ok(c.remaining_gate&&c.source_observation);
  for(const id of c.historical_rows)assert.ok(reviewedWave2.has(id));
}
const roleWave2=JSON.parse(readFileSync(new URL(
  "../data/directory/research/cl27-current-firstparty-20261104/classification-role-review-wave2.v1.json",
  import.meta.url),"utf8"));
assert.equal(roleWave2.schema,"AO_CL27_SOURCE_ROLE_REVIEW_WAVE2_V1");
assert.equal(roleWave2.publication,"RESEARCH_ONLY_NO_CLASSIFICATION_PROMOTION");
assert.equal(roleWave2.records.length,18);
for(const r of roleWave2.records){
  assert.ok(wave2Cases.has(r.cl2_anchor));
  assert.equal(r.classification_decision,"SOURCE_ASSOCIATION_RESEARCH_ONLY");
  assert.ok(["FSSP","SSPX"].includes(r.source_reported_community));
  assert.ok(r.unknown_fields.includes("una_cum"));
  assert.ok(r.unknown_fields.includes("canonical_status"));
  assert.ok(r.unknown_fields.includes("missal_edition"));
  assert.ok(r.unknown_fields.includes("exact_celebrant"));
  for(const field of r.unknown_fields)assert.ok(!Object.hasOwn(r,field));
}
// All 106 legacy same-anchor/day/time groups are preserved for editorial
// adjudication. A collision is not a duplicate until dates and ministry match.
const collisions=JSON.parse(readFileSync(new URL(
  "../data/directory/research/cl27-current-firstparty-20261104/collision-screen-106.v1.json",
  import.meta.url),"utf8"));
assert.equal(collisions.schema,"AO_CL27_HISTORICAL_COLLISION_SCREEN_V1");
assert.equal(collisions.publication,"SCREENED_FOR_RISK_ONLY_NO_MERGE_NO_PUBLIC_OCCURRENCE");
assert.equal(collisions.source_blob_sha,d.canonical_source.blob_sha);
assert.equal(collisions.groups.length,106);
assert.equal(new Set(collisions.groups.map(g=>g.site_day_time_key)).size,106);
assert.equal(collisions.groups.reduce((sum,g)=>sum+g.row_count,0),234);
assert.deepEqual(collisions.summary.category_counts,{
  SAME_SLOT_MULTIPLE_SOURCE_IDS:75,
  MASS_TYPE_DISAGREEMENT:10,
  MULTIPLE_PROVENANCE_URLS:6,
  DIFFERENT_FREQUENCY_OR_QUALIFIER:14,
  SAME_SLOT_REPEAT_ROWS:1
});
assert.equal(collisions.summary.adjudicated_and_approved_merges,0);
assert.equal(collisions.summary.approved_mass_events,0);
for(const g of collisions.groups){
  assert.match(g.physical_anchor,/^RG-[A-F0-9]{12}$/);
  assert.equal(g.source_rows.length,g.row_count);
  assert.equal(g.original_historical_rows.length,g.row_count);
  assert.equal(g.editorial_disposition,
    "UNRESOLVED_REQUIRES_SOURCE_AND_CALENDAR_ADJUDICATION");
  assert.ok(g.next_action);
  assert.ok(g.source_rows.every(r=>Number.isInteger(r.historical_row)));
  if(g.candidate_collision_reason==="DIFFERENT_FREQUENCY_OR_QUALIFIER")
    assert.ok(g.recurrence_variants.length>1);
}
console.log("PASS Wave 2: 70/296 unique historical source rows checked, 31 scoped role observations; all 106 collision cases risk-triaged without any automatic event merge or promotion");

// Wave 3: cite fresh pages while preserving all 69 historical CL2 row keys.
const wave3=JSON.parse(readFileSync(new URL(
  "../data/directory/research/cl27-current-firstparty-20261104/source-review-wave3.v1.json",import.meta.url),"utf8"));
assert.equal(wave3.schema,"AO_CL27_CURRENT_SOURCE_WAVE3_V1");
assert.equal(wave3.publication,"RESEARCH_ONLY_NO_APP_IMPORT");
assert.equal(wave3.original_cl27_blob_sha,d.canonical_source.blob_sha);
assert.equal(wave3.source_groups.length,16);
assert.equal(wave3.reviewed_rows.length,69);
assert.deepEqual(wave3.summary,{
  new_historical_rows_reviewed:69,
  new_source_pages_reviewed:16,
  distinct_cl2_physical_anchors:19,
  previous_reviewed:70,
  cumulative_reviewed:139,
  still_unreviewed:157,
  new_approved_current_events:0,
  new_published_cl27_classifications:0
});
const wave3IDs=new Set();
const earlierIDs=new Set([...checked,...reviewedWave2]);
const wave3Sources=new Map(wave3.source_groups.map(g=>[g.historical_source_url,g]));
assert.equal(wave3Sources.size,16);
const wave3Anchors=new Set();
for(const row of wave3.reviewed_rows){
 assert.ok(Number.isInteger(row.historical_row));
 assert.ok(!earlierIDs.has(row.historical_row),"Wave 3 cannot repeat earlier reviewed historical row");
 assert.ok(!wave3IDs.has(row.historical_row),"Wave 3 internal duplicate");
 wave3IDs.add(row.historical_row);wave3Anchors.add(row.cl2_anchor);
 const snapshot=byHistorical.get(row.historical_row);
 assert.ok(snapshot&&snapshot.anchors.includes(row.cl2_anchor));
 assert.equal(snapshot.historical_url,row.historical_owner_url);
 const group=wave3Sources.get(row.historical_owner_url);
 assert.ok(group&&group.cl2_anchors.includes(row.cl2_anchor));
 assert.ok(group.reviewed_historical_rows.includes(row.historical_row));
 assert.equal(group.independent_or_current_owner_url,row.reviewed_evidence_url);
 assert.match(row.reviewed_evidence_url,/^https:\/\//);
 assert.equal(row.approval,"HOLD_NO_PUBLIC_TIMETABLE_APPROVAL");
 assert.ok(row.source_review_decision);
 assert.ok(!Object.hasOwn(row,"una_cum")&&!Object.hasOwn(row,"canonical_status"));
}
assert.equal(wave3IDs.size,69);
assert.equal(wave3Anchors.size,19);
assert.equal(new Set([...earlierIDs,...wave3IDs]).size,139);
assert.equal(wave3.reviewed_rows.filter(r=>
 r.source_review_decision==="HISTORICAL_CLOCK_NOT_SUPPORTED_BY_LATEST_BULLETIN").length,3);
assert.ok(wave3.reviewed_rows.some(r=>
 r.historical_row===4676&&r.source_review_decision==="MASS_CLOCK_WITH_UNPROVEN_HOST_LOCATION"));
assert.equal(wave3.reviewed_rows.filter(r=>
 [4675,4676,4677,4678,4679].includes(r.historical_row)).length,5);
// Research-only source scopes: no new venue-wide liturgical assumptions.
const roleWave3=JSON.parse(readFileSync(new URL(
  "../data/directory/research/cl27-current-firstparty-20261104/classification-role-review-wave3.v1.json",import.meta.url),"utf8"));
assert.equal(roleWave3.schema,"AO_CL27_ROLE_OBSERVATIONS_WAVE3_V1");
assert.equal(roleWave3.research_only,true);
assert.equal(roleWave3.records.length,19);
assert.equal(new Set(roleWave3.records.map(r=>r.cl2_anchor)).size,19);
assert.deepEqual(new Set(roleWave3.records.map(r=>r.cl2_anchor)),wave3Anchors);
for(const r of roleWave3.records){
 assert.equal(r.publication,"HOLD_RESEARCH_ONLY");
 assert.equal(r.source_scoped_only,true);
 assert.ok(r.unknown_without_individual_evidence.includes("una_cum"));
 assert.ok(r.unknown_without_individual_evidence.includes("canonical_status"));
 assert.ok(r.unknown_without_individual_evidence.includes("mass_missal_edition"));
 assert.ok(["SSPX","ICKSP","CAPUCINS_MORGON","TRANSFIGURATION"].includes(r.source_reported_community));
 for(const fld of r.unknown_without_individual_evidence)assert.ok(!Object.hasOwn(r,fld));
}
// Seven source-adjudicated risk groups: an actual monthly first-Sunday versus
// third-Sunday schedule must NEVER be joined as the same calendar occurrence.
const collisionReview=JSON.parse(readFileSync(new URL(
  "../data/directory/research/cl27-current-firstparty-20261104/collision-source-decisions-7.v1.json",import.meta.url),"utf8"));
assert.equal(collisionReview.schema,"AO_CL27_COLLISION_SOURCE_DECISIONS_V1");
assert.equal(collisionReview.publication,"RESEARCH_ONLY_NO_MERGED_EVENTS");
assert.equal(collisionReview.records.length,7);
assert.deepEqual(collisionReview.summary,{
 source_reviewed_collision_groups:7,
 source_alias_groups:5,
 distinct_monthweek_groups:2,
 remaining_without_source_disposition:99,
 production_events_generated:0
});
const collisionScreen=new Map(collisions.groups.map(x=>[x.site_day_time_key,x]));
for(const r of collisionReview.records){
 const source=collisionScreen.get(r.site_day_time_key);
 assert.ok(source&&source.physical_anchor===r.cl2_anchor);
 assert.deepEqual(r.original_historical_rows,source.original_historical_rows);
 assert.equal(r.event_merged_or_published,false);
 assert.equal(r.historical_ids_retained,true);
 assert.match(r.source_recheck_url,/^https:\/\//);
 assert.ok([
  "SOURCE_ALIAS_SAME_SCHEDULE_SLOT","DISTINCT_MONTHWEEK_RECURRENCES_NOT_DUPLICATES"
 ].includes(r.decision));
 if(r.decision==="DISTINCT_MONTHWEEK_RECURRENCES_NOT_DUPLICATES")
   assert.ok(source.recurrence_variants.length>1);
}
console.log("PASS CL27 wave3: 139/296 unique original source rows / 19 new site roles; 7 first-party collision dispositions; no Mass event or unsupported ecclesial promotions");
