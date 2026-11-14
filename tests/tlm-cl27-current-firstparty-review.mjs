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


// Wave 4: 28 more immutable source-day-clock rows reviewed against named
// operator pages, including dated 2026 evidence. Never turn the review into
// a new recurring Mass feed or a second source of CL2 physical identities.
const wave4=JSON.parse(readFileSync(new URL(
 "../data/directory/research/cl27-current-firstparty-20261104/source-review-wave4.v1.json",
 import.meta.url),"utf8"));
assert.equal(wave4.schema,"AO_CL27_CURRENT_SOURCE_WAVE4_V1");
assert.equal(wave4.publication,"RESEARCH_ONLY_NO_APP_IMPORT");
assert.equal(wave4.canonical_source.blob_sha,d.canonical_source.blob_sha);
assert.equal(wave4.canonical_source.pr,1775);
assert.equal(wave4.cases.length,8);
assert.deepEqual(wave4.summary,{
 new_source_groups_reviewed:8,
 new_historical_rows_reviewed:28,
 previous_reviewed:139,
 cumulative_reviewed:167,
 still_unreviewed:129,
 new_current_mass_events_approved:0,
 new_classifications_approved:0
});
const priorToWave4=new Set([...earlierIDs,...wave3IDs]);
assert.equal(priorToWave4.size,139);
const wave4IDs=new Set(),wave4Anchors=new Set();
for(const c of wave4.cases){
 assert.match(c.cl2_anchor,/^RG-[A-F0-9]{12}$/);
 assert.match(c.country,/^[A-Z]{2}$/);
 assert.ok(!wave4Anchors.has(c.cl2_anchor),"Wave 4 duplicate physical site review");
 wave4Anchors.add(c.cl2_anchor);
 assert.ok(c.historical_url.startsWith("https://"));
 assert.ok(c.evidence.length>0&&c.evidence.every(e=>e.url.startsWith("https://")&&e.kind));
 assert.ok(c.decision&&c.source_observation&&c.identity_and_occurrence_gate&&c.source_role_scope);
 assert.equal(c.publication_status,"HOLD_RESEARCH_ONLY_NO_CURRENT_MASS_APPROVAL");
 assert.ok(c.unproven.includes("exact_current_occurrence")&&c.unproven.includes("una_cum")&&
  c.unproven.includes("pope_named_in_canon")&&c.unproven.includes("canonical_status")&&
  c.unproven.includes("legal_ownership")&&c.unproven.includes("specific_1962_missal"));
 assert.equal(c.historical_rows.length,c.historical_claims.length);
 assert.equal(new Set(c.historical_rows).size,c.historical_rows.length);
 for(let i=0;i<c.historical_rows.length;i++){
  const id=c.historical_rows[i],claim=c.historical_claims[i];
  assert.ok(Number.isInteger(id));
  assert.equal(claim.historical_row,id);
  assert.ok(claim.source_id&&claim.day_pattern&&claim.local_time&&claim.frequency);
  assert.ok(!priorToWave4.has(id),"Wave 4 cannot double-count prior source review");
  assert.ok(!wave4IDs.has(id),"Wave 4 duplicated source row");
  wave4IDs.add(id);
  const source=byHistorical.get(id);
  assert.ok(source&&source.anchors.includes(c.cl2_anchor),"Wave 4 CL2 anchor mismatch");
  assert.equal(source.historical_url,c.historical_url);
 }
}
assert.equal(wave4IDs.size,28);
assert.equal(wave4Anchors.size,8);
assert.equal(new Set([...priorToWave4,...wave4IDs]).size,167);
assert.equal(296-priorToWave4.size-wave4IDs.size,129);
const br=wave4.cases.find(x=>x.cl2_anchor==="RG-CB03C808AE8A");
assert.equal(br.decision,"CONFLICTING_CURRENT_OPERATOR_VENUE_LOCATION");
assert.ok(br.source_observation.includes("Indaiatuba"));
assert.ok(br.identity_and_occurrence_gate.includes("Do not transfer"));
assert.ok(br.evidence.some(e=>e.url.includes("fevereiro-2026.pdf")));
const levis=wave4.cases.find(x=>x.cl2_anchor==="RG-22BB6F85DA74");
assert.ok(levis.evidence.some(e=>e.url.includes("2026")));
const poitiers=wave4.cases.find(x=>x.cl2_anchor==="RG-9F9858FBD0DA");
assert.ok(poitiers.source_role_scope.includes("Transfiguration"));
const fort=wave4.cases.find(x=>x.cl2_anchor==="RG-84B39A237AAB");
assert.ok(fort.source_observation.includes("NOT a 07:15 Mass"));
console.log("PASS CL27 wave4: 167/296 historical source claims reviewed, 129 pending; 8 source-locked church groups, operator geography and service-type disputes held, 0 public Masses or canonical/Una Cum claims");


// Wave 5: verify new official-source observations against the same frozen CL2
// universe. Explicitly prohibit turning schedule-pattern review into public
// events, made-up canonical standing, ministry-wide rites, or duplicate sites.
const wave5=JSON.parse(readFileSync(new URL(
 "../data/directory/research/cl27-current-firstparty-20261104/source-review-wave5.v1.json",
 import.meta.url),"utf8"));
assert.equal(wave5.schema,"AO_CL27_CURRENT_SOURCE_WAVE5_V1");
assert.equal(wave5.publication,"RESEARCH_ONLY_NO_APP_IMPORT");
assert.equal(wave5.canonical_source.pr,1775);
assert.equal(wave5.canonical_source.source_blob_sha,d.canonical_source.blob_sha);
assert.deepEqual(wave5.summary,{
 previous_reviewed:167,
 new_original_historical_rows_reviewed:44,
 new_source_site_groups_reviewed:28,
 cumulative_reviewed:211,
 still_unreviewed:85,
 published_current_events:0,
 published_source_scoped_classifications:0,
 collision_groups_source_adjudicated_unchanged:7
});
assert.equal(wave5.cases.length,28);
assert.equal(wave4IDs.size,28);
const prevWaves=new Set([...earlierIDs,...wave3IDs,...wave4IDs]);
assert.equal(prevWaves.size,167);
const wave5IDs=new Set(),wave5Anchors=new Set();
for(const c of wave5.cases){
 assert.match(c.cl2_anchor,/^RG-[A-F0-9]{12}$/);
 assert.match(c.country,/^[A-Z]{2}$/);
 assert.ok(c.venue_label&&c.source_observation&&c.remaining_gate&&c.role_scope);
 assert.ok(!wave5Anchors.has(c.cl2_anchor));
 wave5Anchors.add(c.cl2_anchor);
 assert.match(c.current_owner_url,/^https:\/\/[^ ]+$/);
 assert.equal(c.current_source_class,"CURRENT_FIRST_PARTY_OPERATOR_OR_DISTRICT_PAGE");
 assert.equal(c.publication_status,"HOLD_RESEARCH_ONLY_NO_CURRENT_EVENTS_OR_CLASSIFICATIONS");
 assert.ok(c.unknown_without_individual_evidence.includes("una_cum"));
 assert.ok(c.unknown_without_individual_evidence.includes("canonical_status"));
 assert.ok(c.unknown_without_individual_evidence.includes("dated_mass_occurrence"));
 assert.ok(c.unknown_without_individual_evidence.includes("public_access"));
 assert.equal(c.historical_rows.length,c.historical_claims.length);
 assert.ok(c.historical_source_urls.length>0);
 for(let i=0;i<c.historical_claims.length;i++){
  const x=c.historical_claims[i],id=c.historical_rows[i];
  assert.ok(Number.isInteger(id));
  assert.equal(x.historical_row,id);
  assert.ok(x.source_id&&x.day_pattern&&x.local_time&&x.frequency&&x.source_excerpt);
  assert.ok(!prevWaves.has(id),"Wave 5 overlaps an earlier source audit row");
  assert.ok(!wave5IDs.has(id),"Wave 5 repeats historical row");
  wave5IDs.add(id);
  const source=byHistorical.get(id);
  assert.ok(source&&source.anchors.includes(c.cl2_anchor),"CL2 anchor/source mismatch");
  assert.ok(c.historical_source_urls.includes(source.historical_url));
 }
}
assert.equal(wave5IDs.size,44);
assert.equal(wave5Anchors.size,28);
assert.equal(new Set([...prevWaves,...wave5IDs]).size,211);
assert.equal(296-prevWaves.size-wave5IDs.size,85);
const fromAnchor=id=>wave5.cases.find(x=>x.cl2_anchor===id);
assert.ok(fromAnchor("RG-D921C392A56D").source_review_decision.includes("HOURS_NOT_INDEPENDENTLY_CORROBORATED"));
assert.ok(fromAnchor("RG-6F08FF27F739").source_review_decision.includes("FIRST_SATURDAY_NOT_RECHECKED"));
assert.ok(fromAnchor("RG-C173C61BB658").source_observation.includes("08:00"));
assert.ok(fromAnchor("RG-A667A2072167").source_observation.includes("17th"));
assert.ok(fromAnchor("RG-20F5A383CAAF").source_observation.includes("08:00 or 09:50"));
assert.ok(fromAnchor("RG-6688A500756B").role_scope.includes("Franciscaines"));
assert.ok(fromAnchor("RG-4FDBB67357B4").role_scope.includes("Carmelites"));
assert.ok(fromAnchor("RG-B613AF3ED66D").source_observation.includes("monthly"));
console.log("PASS CL27 Wave 5: 211/296 unique historical rows reviewed, 85 pending; 28 first-party site groups, 44 new rows, 0 new public Masses or church-wide canonical claims");


// Wave 6 source dispositions: complete 264 of 296 frozen original claims
// without silently upgrading official site pages or secondary pages to public
// event approvals, official 1962 Missal, or ecclesial conclusions.
const wave6=JSON.parse(readFileSync(new URL(
 "../data/directory/research/cl27-current-firstparty-20261104/source-review-wave6.v1.json",
 import.meta.url),"utf8"));
assert.equal(wave6.schema,"AO_CL27_CURRENT_SOURCE_WAVE6_V1");
assert.equal(wave6.publication,"RESEARCH_ONLY_NO_LIVE_MASS_OR_CL27_PROMOTION");
assert.equal(wave6.canonical_source.original_pr,1775);
assert.equal(wave6.canonical_source.blob_sha,d.canonical_source.blob_sha);
assert.deepEqual(wave6.summary,{
 previous_reviewed:211,
 source_group_count:35,
 new_original_rows_reviewed:53,
 cumulative_reviewed:264,
 remaining_historical_rows:32,
 approved_live_mass_events:0,
 approved_cl27_ecclesial_claims:0,
 approved_coordinate_changes:0
});
assert.equal(wave6.records.length,35);
const earlierW6=new Set([...prevWaves,...wave5IDs]);
assert.equal(earlierW6.size,211);
const reviewedW6=new Set(),siteW6=new Set();
for(const c of wave6.records){
 assert.match(c.cl2_anchor,/^RG-[0-9A-F]{12}$/);
 assert.match(c.country,/^[A-Z]{2}$/);
 assert.ok(!siteW6.has(c.cl2_anchor));siteW6.add(c.cl2_anchor);
 assert.ok(c.source_venue_name&&c.decision&&c.observation&&c.remaining_gate);
 assert.match(c.current_evidence_url,/^https:\/\/[^ ]+$/);
 assert.equal(c.publication_status,"RESEARCH_ONLY_HOLD_UNTIL_EXPLICIT_EVENT_VALIDATION");
 assert.equal(c.published_current_occurrences,0);
 for(const field of ["dated_2026_occurrence","exact_1962_books","una_cum","named_pope_in_canon","canonical_status","venue_ownership","visitor_entrance"]){
  assert.ok(c.not_established.includes(field));
  assert.ok(!Object.hasOwn(c,field));
 }
 assert.equal(c.historical_rows.length,c.historical_claims.length);
 for(let i=0;i<c.historical_rows.length;i++){
  const id=c.historical_rows[i],claim=c.historical_claims[i];
  assert.ok(Number.isInteger(id)&&!earlierW6.has(id)&&!reviewedW6.has(id),"Wave 6 duplicate or overlap");
  reviewedW6.add(id);
  assert.equal(claim.row,id);
  assert.ok(claim.source_id&&claim.day_pattern&&claim.time&&claim.frequency);
  const legacy=byHistorical.get(id);
  assert.ok(legacy&&legacy.anchors.includes(c.cl2_anchor));
  assert.ok(c.historical_source_urls.includes(legacy.historical_url));
 }
}
assert.equal(siteW6.size,35);
assert.equal(reviewedW6.size,53);
assert.equal(new Set([...earlierW6,...reviewedW6]).size,264);
assert.equal(296-earlierW6.size-reviewedW6.size,32);
const w6ById=new Map(wave6.records.map(x=>[x.cl2_anchor,x]));
for(const id of ["RG-F61760F13D97","RG-6F16A016F04B","RG-A306B10B763B","RG-9DB299EB9AFB","RG-B0B5E828070F"]){
 assert.ok(/CONFLICT|UNSUPPORTED|NOT_CONFIRMED|NOT_SUPPORTED/.test(w6ById.get(id).decision),"Do not promote disputed historical clock");
}
assert.ok(w6ById.get("RG-EC5A4BA48BF9").decision.includes("NOT_1962_PROOF"));
assert.ok(w6ById.get("RG-DA2F4D212252").decision.includes("NOT_1962_PROOF"));
assert.ok(w6ById.get("RG-270DB00DC743").observation.includes("TWO Sundays"));
assert.ok(w6ById.get("RG-9B5F40D1BDED").observation.includes("following Monday"));
assert.ok(w6ById.get("RG-7D5AA61CAE06").observation.includes("Transfiguration"));
assert.ok(w6ById.get("RG-F78E459E839F").decision.includes("NOT_IN_MAIN_PARISH_SCHEDULE"));
console.log("PASS CL27 Wave 6: 264/296 historical rows source-reviewed, 32 unresolved, 35 named site/source groups, 53 new row IDs, no liturgical or public timetable fabrication");


// Wave 7 is a closing *disposition* of source gaps, not 32 further current
// Mass verifications. Preserve every frozen historical row and explicitly
// block the false implication that completing a review creates public events.
const wave7=JSON.parse(readFileSync(new URL(
 "../data/directory/research/cl27-current-firstparty-20261104/source-review-wave7-source-dispositions.v1.json",
 import.meta.url),"utf8"));
assert.equal(wave7.schema,"AO_CL27_FINAL_SOURCE_GAP_DISPOSITIONS_WAVE7_V1");
assert.equal(wave7.publication,"RESEARCH_ONLY_NO_APP_IMPORT");
assert.equal(wave7.canonical_source.pr,1775);
assert.equal(wave7.canonical_source.blob_sha,d.canonical_source.blob_sha);
assert.deepEqual(wave7.summary,{
 previously_reviewed:264,
 new_historical_rows_dispositioned:32,
 cumulative_historical_rows_accounted_for:296,
 unassessed_historical_rows:0,
 current_mass_events_approved:0,
 canonical_una_cum_claims_approved:0,
 source_gap_or_time_hold_count:32
});
assert.equal(wave7.records.length,25);
const previouslyDispostioned=new Set([...earlierW6,...reviewedW6]);
assert.equal(previouslyDispostioned.size,264);
const wave7IDs=new Set(),wave7Sites=new Set(),secondaryIDs=new Set();
for(const c of wave7.records){
 assert.match(c.cl2_anchor,/^RG-[0-9A-F]{12}$/);
 assert.match(c.country,/^[A-Z]{2}$/);
 assert.ok(!wave7Sites.has(c.cl2_anchor),"Wave 7 duplicate site assessment");
 wave7Sites.add(c.cl2_anchor);
 assert.ok(c.venue_label&&c.assessment&&c.editorial_disposition);
 assert.match(c.historical_source,/^https?:\/\/[^ ]+$/);
 assert.match(c.current_evidence_url,/^https:\/\/[^ ]+$/);
 assert.equal(c.gate,"RESEARCH_ONLY_NO_CURRENT_MASS_EVENT_NO_SOURCE_WIDE_1962_OR_CANONICAL_INFERENCE");
 for(const field of ["dated_current_occurrence_unverified","una_cum_unverified","canonical_status_unverified","exact_missal_unverified","ministry_and_owner_not_inferred"]){
  assert.ok(c.source_status.includes(field),"A source disposition must not imply event or ecclesial certification");
 }
 assert.equal(c.historical_rows.length,c.original_source_claims.length);
 for(let i=0;i<c.historical_rows.length;i++){
  const id=c.historical_rows[i],claim=c.original_source_claims[i];
  assert.ok(Number.isInteger(id)&&!previouslyDispostioned.has(id)&&!wave7IDs.has(id),"Wave 7 row overlap/duplicate");
  wave7IDs.add(id);
  assert.equal(claim.historical_row,id);
  assert.ok(claim.source_id&&claim.day_pattern&&claim.local_time&&claim.frequency&&claim.original_excerpt);
  const source=byHistorical.get(id);
  assert.ok(source&&source.anchors.includes(c.cl2_anchor),"Wave 7 CL2 anchor mismatch");
  assert.equal(c.historical_source,source.historical_url);
  if(c.assessment.startsWith("SECONDARY_")||c.assessment.includes("INFERRED"))secondaryIDs.add(id);
 }
}
assert.equal(wave7Sites.size,25);
assert.equal(wave7IDs.size,32);
assert.ok(secondaryIDs.size>=20,"Last wave must preserve uncertainty of third-party/ambiguous listings");
const all296=new Set([...previouslyDispostioned,...wave7IDs]);
assert.equal(all296.size,296);
assert.equal(d.source_page_groups.reduce((n,g)=>n+g.rows.length,0),296);
for(const g of d.source_page_groups){
 for(const id of g.rows)assert.ok(all296.has(id),"Historical source audit cannot silently discard a row: "+id);
}
const wave7ById=new Map(wave7.records.map(c=>[c.cl2_anchor,c]));
assert.ok(wave7ById.get("RG-DA0AFA244DB4").assessment.includes("INFERRED_SUNDAY"));
assert.ok(wave7ById.get("RG-DA0AFA244DB4").editorial_disposition.includes("NO weekday"));
assert.ok(wave7ById.get("RG-9D79E31A64C4").editorial_disposition.includes("Log Church"));
assert.ok(wave7ById.get("RG-28B6C5B21415").assessment.includes("PROVIDER_UNVERIFIED"));
console.log("PASS CL27 Waves 1–7: 296/296 frozen historical rows accounted for (264 reviewed + 32 explicit source-gap holds), 25 last-wave groups, no live events, Una Cum, canonical status, ownership or coordinate changes");
