import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load = path => JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const r=load("data/geography/research/sacred-places-p20-750-bulk-triage.v1.json");
const geo=load("data/geography/seed-registry.v1.json");
const src=load("data/shrines/source-registry.v1.json");
const original=load("data/geography/research/sacred-places-p16-three-qualified-site-release.v1.json");
const queue=load("data/geography/research/sacred-geography-r70-worldwide-coverage-queue.v1.json");

assert.equal(r.schema,"AO_SACRED_PLACES_P20_750_WORLDWIDE_BULK_TRIAGE_V1");
assert.equal(r.status,"RESEARCH_ONLY_NOT_CANONICAL_RELEASE");
assert.deepEqual([r.baseline.places,r.baseline.sources,r.baseline.directory_place_links],[361,659,9]);
assert.ok(geo.places.length>=r.baseline.places);
assert.ok(src.sources.length>=r.baseline.sources);
assert.equal(r.all_750_reconciliation.length,750);
const byId=new Map(r.all_750_reconciliation.map(x=>[x.candidate_id,x]));
assert.equal(byId.size,750,"duplicate inventory candidate");
assert.deepEqual(new Set(queue.rows.map(x=>x.candidate_id)),new Set(byId.keys()),"original queue must remain fully represented");
const canonical=new Set(geo.places.map(x=>x.place_id));
const statuses={};
for(const x of r.all_750_reconciliation){
 statuses[x.identity_gate]=(statuses[x.identity_gate]||0)+1;
 assert.equal(x.publish_new_place,false);
 assert.equal(x.physical_identity_and_geo_verified_for_new_publication,false);
 if(x.identity_gate==="CONFIRMED_EXISTING_CANONICAL"){
  assert.ok(canonical.has(x.verified_canonical_place_id),"confirmed old physical ID must remain canonical");
  assert.ok(x.verification_basis);
 }else{
  assert.equal(x.verified_canonical_place_id,undefined,"unconfirmed text match must not become confirmed Place link");
 }
 if(x.source_discovery_pointer){
  assert.equal(x.source_discovery_pointer.link_status,"PROVISIONAL_TEXT_CROSSWALK_NOT_SITE_VERIFICATION");
  assert.ok(x.source_discovery_pointer.urls.every(u=>u.startsWith("https://")));
 }
}
assert.deepEqual(statuses,r.counts.identity_gate_totals);
assert.equal(statuses.CONFIRMED_EXISTING_CANONICAL,170);
assert.equal(statuses.P16_HISTORICAL_TITLE_HOLD,13);
assert.equal(statuses.OUTSIDE_CATHOLIC_SCOPE_HOLD,2);
assert.equal(statuses.R78_PHYSICAL_SCOPE_HOLD,5);
const originalIds=new Set(original.held_exceptions.map(x=>x.candidate_id.replace(/^candidate:/,"")));
assert.equal(originalIds.size,16);
assert.deepEqual(new Set(r.historical_exceptions_16.map(x=>x.candidate_id)),originalIds);
assert.equal(r.historical_exceptions_16.filter(x=>x.represented_in_750).length,13);
const forbidden=new Set(["CONFIRMED_EXISTING_CANONICAL","P16_HISTORICAL_TITLE_HOLD","R78_PHYSICAL_SCOPE_HOLD","OUTSIDE_CATHOLIC_SCOPE_HOLD"]);
const eligible=r.all_750_reconciliation.filter(x=>!forbidden.has(x.identity_gate));
assert.equal(eligible.length,560);
assert.equal(r.source_acquisition_500.length,500);
assert.equal(new Set(r.source_acquisition_500.map(x=>x.candidate_id)).size,500);
assert.equal(r.verification_first_200.length,200);
assert.equal(new Set(r.verification_first_200).size,200);
const batchIds=new Set(r.source_acquisition_500.map(x=>x.candidate_id));
for(const id of r.verification_first_200)assert.ok(batchIds.has(id),"200 must be a subset of 500");
for(const row of r.source_acquisition_500){
 const x=byId.get(row.candidate_id);
 assert.ok(x);
 assert.ok(!forbidden.has(x.identity_gate));
 assert.ok(!originalIds.has(x.candidate_id),"no original unresolved P16 case in proposed source-acquisition tranche");
 assert.ok(!x.verified_canonical_place_id);
}
assert.equal(new Set(r.source_acquisition_500.map(x=>x.country)).size,100);
assert.equal(new Set(r.verification_first_200.map(id=>byId.get(id).country)).size,100);
assert.equal(r.counts.new_publishable_places,0);
assert.equal(r.counts.remaining_eligible_not_in_bulk,60);
console.log("PASS P20: 750 deduplicated historic leads, 170 verified reuses, 16 original holds, 500 pending source research in 100 countries, 200 verification priorities, zero new published Places");
