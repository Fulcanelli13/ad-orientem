import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const p25=load("data/geography/research/sacred-places-p25-151-source-screen.v1.json");
const p21=load("data/geography/research/sacred-places-p21-first200-source-review.v1.json");
const p20=load("data/geography/research/sacred-places-p20-750-bulk-triage.v1.json");
const p22=load("data/geography/research/sacred-places-p22-map-first-ten-sites.v1.json");
const p24=load("data/geography/research/sacred-places-p24-world-16-map-first.v1.json");
const original=load("data/geography/research/sacred-places-p16-three-qualified-site-release.v1.json");
const geo=load("data/geography/seed-registry.v1.json");
const sources=load("data/shrines/source-registry.v1.json");
assert.equal(p25.schema,"AO_SACRED_PLACES_P25_151_REMAINING_SOURCE_SCREEN_V1");
assert.equal(p25.status,"RESEARCH_ONLY_NO_CANONICAL_RELEASE");
assert.deepEqual([geo.places.length,sources.sources.length],[LIVE.places,LIVE.sources]);
assert.deepEqual([p25.baseline.places,p25.baseline.sources],[LIVE.places,LIVE.sources]);
assert.equal(p25.all_151_priority_source_screen.length,151);
const priorUnreviewed=p21.reviewed_200.filter(x=>x.source_status==="NO_NEW_INDEPENDENT_SOURCE_REVIEW");
assert.deepEqual(p25.all_151_priority_source_screen.map(x=>x.candidate_id),priorUnreviewed.map(x=>x.candidate_id),"Remaining P21 priority order must be identical");
const sourceRows=p25.all_151_priority_source_screen.filter(x=>x.source_excerpt);
assert.equal(sourceRows.length,20);
assert.equal(sourceRows.filter(x=>["SITE_CATHOLIC_AUTHORITY","CIVIC_EXACT_CATHOLIC_SITE"].includes(x.identity_gate)).length,18);
assert.equal(sourceRows.filter(x=>x.identity_gate.startsWith("SECONDARY_")).length,2);
assert.equal(p25.all_151_priority_source_screen.filter(x=>x.identity_gate==="PRIMARY_CUSTODIAN_SOURCE_STILL_REQUIRED").length,131);
assert.equal(p25.result.now_source_excerpts_reviewed_in_first_200,69);
const srcById=new Set(geo.places.map(x=>x.place_id));
for(const row of p25.all_151_priority_source_screen){
 assert.equal(row.new_publishable_place,false);
 assert.equal(row.exact_new_building_geometry_independently_verified,false);
 if(row.source_excerpt){
  assert.equal(row.identity_gate,row.source_excerpt.classification);
  assert.match(row.source_excerpt.url,/^https:\/\//);
  assert.ok(row.source_excerpt.issuer.length>5);
  assert.ok(row.source_excerpt.identity_scope_note.length>45);
 }else assert.equal(row.identity_gate,"PRIMARY_CUSTODIAN_SOURCE_STILL_REQUIRED");
}
const cases=new Map(sourceRows.map(x=>[x.candidate_id,x]));
assert.equal(cases.get("SG-INV-0333").source_excerpt.issuer,"Roman Catholic Archdiocese of Vilnius");
assert.equal(cases.get("SG-INV-0328").identity_gate,"SITE_CATHOLIC_AUTHORITY");
assert.equal(cases.get("SG-INV-0341").identity_gate,"CIVIC_EXACT_CATHOLIC_SITE");
assert.equal(cases.get("SG-INV-0608").identity_gate,"SECONDARY_DISCOVERY_ONLY");
assert.equal(p25.refreshed_500_acquisition_queue.length,500);
assert.equal(new Set(p25.refreshed_500_acquisition_queue.map(x=>x.candidate_id)).size,500);
assert.deepEqual(p25.refreshed_500_acquisition_queue.map(x=>x.candidate_id),p20.source_acquisition_500.map(x=>x.candidate_id),"Do not silently alter source acquisition roster");
const oldPublished=new Map([...p22.published_new,...p24.published_new].map(x=>[x.candidate_id,x.place_id]));
oldPublished.set("SG-INV-0110","place:ES:covadonga-basilica");
assert.equal(p25.refreshed_500_acquisition_queue.filter(x=>x.gate==="ALREADY_REPRESENTED_DO_NOT_DUPLICATE").length,27);
for(const row of p25.refreshed_500_acquisition_queue){
 if(row.verified_existing_place_id){
  assert.equal(row.gate,"ALREADY_REPRESENTED_DO_NOT_DUPLICATE");
  assert.equal(row.verified_existing_place_id,oldPublished.get(row.candidate_id));
  assert.ok(srcById.has(row.verified_existing_place_id));
 }
}
assert.equal(original.held_exceptions.length,16);
assert.equal(p25.result.protected_holds_carried_from_earlier,16);
assert.equal(p25.result.canonical_new_places,0);
assert.equal(p25.result.bulk_routing_rows,500);
console.log("PASS P25: all 151 exact pending priorities, 20 new cited source excerpts, 131 unreviewed, 500 lead queue and 27 no-duplicate reuses; zero published Places");
