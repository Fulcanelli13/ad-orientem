import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const report=read("data/geography/research/sacred-geography-coverage-first-r70.v1.json");
const crosswalk=read("data/geography/research/sacred-geography-curated-750-site-crosswalk-2026-10-10.v1.1.json");
const launch=read("data/geography/research/sacred-geography-major-sites-launch-2026-10-10.v1.json");
const exceptions=read("data/geography/research/sacred-geography-major-exceptions-2026-10-10.v1.json");
const r70=read("data/geography/research/sacred-geography-r70-global-six-site-evidence.v1.json");
const r71=read("data/geography/research/sacred-geography-r71-major-site-reconciliation.v1.json");
const r72=read("data/geography/research/sacred-geography-r72-world-anchors.v1.json");
const r73=read("data/geography/research/sacred-geography-r73-major-shrines.v1.json");
const r74=read("data/geography/research/sacred-geography-r74-essential-sites.v1.json");
const r75=read("data/geography/research/sacred-geography-r75-essential-sites.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const shrines=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
assert.equal(report.schema,"AO_SACRED_GEOGRAPHY_COVERAGE_FIRST_R70_V1");
assert.equal(report.stage,"RESEARCH_RECONCILIATION_NO_AUTOMATIC_PUBLICATION");
assert.equal(report.review_batch_size,75);
assert.equal(report.candidates.length,750);
assert.equal(crosswalk.places.length,750);
assert.equal(report.summary.nonphysical_routes_events_excluded,98);
assert.equal(new Set(report.candidates.map(x=>x.candidate_id)).size,750);
assert.deepEqual(new Set(report.candidates.map(x=>x.candidate_id)),new Set(crosswalk.places.map(x=>x.candidate_id)));
assert.equal(report.summary.curated_physical_candidates,report.candidates.length);
assert.equal(report.summary.existing_production_places,251);
assert.equal(report.summary.existing_published_shrines,247);
assert.equal(report.summary.linked_pilgrimages,234);
assert.equal(report.summary.existing_country_coverage,63);
assert.equal(report.summary.priorities.Essential,64);
assert.equal(report.summary.priorities.Strong,576);
assert.equal(report.summary.priorities.Review,110);
assert.equal(report.candidates.filter(x=>x.priority==="Essential").length,64);
assert.ok(report.candidates.slice(0,64).every(x=>x.priority==="Essential"));
assert.ok(report.candidates.slice(64,640).every(x=>x.priority==="Strong"));
assert.ok(report.candidates.slice(640).every(x=>x.priority==="Review"));
assert.equal(report.summary.candidate_status.CONFIRMED_EXISTING_PROMOTION,99);
assert.equal(report.summary.candidate_status.POTENTIAL_EXISTING_ID_REVIEW,70);
assert.equal(report.summary.candidate_status.PHYSICAL_IDENTITY_SOURCE_AND_PIN_REVIEW,581);
const existing=new Set(geography.places.map(x=>x.place_id));
const promoted=new Map([...launch.promoted,...exceptions.promoted,...r70.sites.map(row=>({candidate_id:row.candidate,place_id:row.id})),...r71.published_new.map(row=>({candidate_id:row.candidate_id,place_id:row.place_id})),...r71.reviewed_existing.map(row=>({candidate_id:row.candidate_id,place_id:row.place_id})),...r72.sites.map(row=>({candidate_id:row.candidate_id,place_id:row.place_id})),...r73.sites.map(row=>({candidate_id:row.candidate_id,place_id:row.place_id})),...r73.existing_confirmed.map(row=>({candidate_id:row.candidate_id,place_id:row.place_id})),...r74.published_new.map(row=>({candidate_id:row.candidate_id,place_id:row.place_id})),...r74.existing_confirmed.map(row=>({candidate_id:row.candidate_id,place_id:row.place_id})),...r75.published_new.map(row=>({candidate_id:row.candidate_id,place_id:row.place_id})),...r75.existing_confirmed.map(row=>({candidate_id:row.candidate_id,place_id:row.place_id}))].map(row=>[row.candidate_id,row.place_id]));
for(const [i,row] of report.candidates.entries()){
 assert.equal(row.review_order,i+1);
 assert.equal(row.review_wave,Math.floor(i/75)+1);
 assert.equal(row.publication,"NO_AUTOMATIC_CHANGE");
 assert.equal(row.pin_gate==="EXISTING_CANONICAL_PIN"||row.pin_gate==="NO_PIN_FROM_TEXT_MATCH",true);
 assert.ok(row.name&&row.country&&row.category);
 assert.ok(row.discovery_sources_count>=0);
 assert.ok(!("lat" in row)&&!("lng" in row)&&!("published" in row),"No invented coordinates or launch status");
 if(row.reconciliation_status==="CONFIRMED_EXISTING_PROMOTION"){
  assert.equal(row.confirmed_place_id,promoted.get(row.candidate_id));
  assert.ok(existing.has(row.confirmed_place_id));
  assert.equal(row.possible_existing_place_id,null);
 }else if(row.reconciliation_status==="POTENTIAL_EXISTING_ID_REVIEW"){
  assert.equal(row.confirmed_place_id,null);
  assert.ok(existing.has(row.possible_existing_place_id));
 }else{
  assert.equal(row.reconciliation_status,"PHYSICAL_IDENTITY_SOURCE_AND_PIN_REVIEW");
  assert.equal(row.confirmed_place_id,null);
  assert.equal(row.possible_existing_place_id,null);
 }
}
assert.equal(Object.keys(report.summary.review_waves).length,10);
assert.ok(Object.values(report.summary.review_waves).every(n=>n===75));
assert.equal(new Set(report.candidates.map(x=>x.country)).size,report.countries.length);
for(const c of report.countries){
 const records=report.candidates.filter(x=>x.country===c.country);
 assert.equal(c.curated_candidates,records.length);
 assert.equal(c.confirmed_promotions+c.possible_reuses+c.unresolved,c.curated_candidates);
}
const sourceMap=new Map(sources.sources.map(x=>[x.id,x]));
const map=new Map(geography.places.map(x=>[x.place_id,x]));
for(const entry of shrines.shrines){
 const p=map.get(entry.place_id);
 assert.ok(p,"Published shrine without canonical Place: "+entry.shrine_id);
 assert.ok(Number.isFinite(p.geo?.lat)&&Number.isFinite(p.geo?.lng),"Missing published map coordinate");
 assert.ok(entry.origin_summary&&entry.origin_summary_fr,"Missing bilingual foundation for "+entry.shrine_id);
 assert.ok(entry.source_ids.some(id=>/^https:\/\/\S+/.test(sourceMap.get(id)?.url||"")),"Missing original published source URL");
}
for(const pilg of shrines.pilgrimages){
 assert.ok(pilg.scope_note&&pilg.scope_note_fr);
 assert.ok(shrines.shrines.some(s=>s.shrine_id===pilg.destination_shrine_id));
}
assert.ok(!report.candidates.some(x=>x.publication==="PUBLISHED"),"Research-only crosswalk must not become live site without source validation");
console.log("PASS R70: 750 reconciled research candidates; 10 balanced review waves; all live shrines retain source, pin, EN/FR; no guessed auto-publication");
