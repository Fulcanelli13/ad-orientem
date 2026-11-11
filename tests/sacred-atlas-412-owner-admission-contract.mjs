import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));

const all=read("data/geography/research/sacred-atlas-412-consolidated-owner-admission-board-20261108.v1.json");
const first=read("data/geography/research/sacred-atlas-169-consolidated-admission-board-20261107.v1.json");
const second=read("data/geography/research/sacred-atlas-243-complement-triage-20261107.v1.json");
const screened=read("data/geography/research/sacred-atlas-150-source-scope-evidence-20261107.v1.json");
const staged=read("data/geography/research/sacred-atlas-243-30-missing-coordinates-20261107.v1.json");
const prox=read("data/geography/research/sacred-atlas-243-proximity-area-decisions-20261107.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const area=read("data/geography/research/sacred-atlas-five-active-country-area-preview-20261107.v1.json");
const reviewPackets=read("data/geography/research/sacred-atlas-334-owner-review-three-batches-20261108.v1.json");

assert.equal(all.schema,"AO_SACRED_ATLAS_412_CONSOLIDATED_ADMISSION_DECISION_BOARD_V1");
assert.equal(all.status,"DRAFT_OWNER_REVIEW_READY_NOT_APPROVED_OR_PUBLISHED");
assert.equal(all.records.length,412);
assert.equal(all.counts.first_cohort,169);
assert.equal(all.counts.complement_cohort,243);
assert.equal(all.counts.page_screened_complement,150);
assert.equal(all.counts.owner_approvals,0);
assert.equal(all.counts.new_published_places,0);
assert.equal(geo.places.length,535);
const expectedClasses={
 OWNER_REVIEW_PRESENTABLE:334,
 EXISTING_DRAFT_SIGNOFF:2,
 EXISTING_PLACE_REUSE:4,
 HERITAGE_NOT_CURRENT_CATHOLIC_PIN:54,
 PARALLEL_P107_DRAFT:6,
 IDENTITY_HOLD:11,
 GEOMETRY_QUALIFIED:1
};
assert.deepEqual(all.counts.review_classes,expectedClasses);
const actualClasses=Object.fromEntries(Object.keys(expectedClasses).map(k=>
 [k,all.records.filter(x=>x.review_class===k).length]));
assert.deepEqual(actualClasses,expectedClasses);
const ids=new Set(all.records.map(x=>x.candidate_id));
assert.equal(ids.size,412);
const firstIds=new Set(first.records.map(x=>x.candidate_id));
const secondIds=new Set(Object.values(second.candidate_ids_by_lane).flat());
assert.equal(firstIds.size,169);
assert.equal(secondIds.size,243);
for(const id of ids)assert.ok(firstIds.has(id)||secondIds.has(id),id);
for(const id of firstIds)assert.ok(!secondIds.has(id),id);
const existing=new Set(geo.places.map(x=>x.place_id));
const screens=new Map(screened.records.map(x=>[x.candidate_id,x]));
const fpoints=new Map(staged.candidates.map(x=>[x.candidate_id,x]));
const nearest=new Map(prox.source_nearest_proximity_cases.map(x=>[x.candidate_id,x]));
for(const item of all.records){
 const isFirst=item.source_cohort==="FIRST_169";
 assert.equal(isFirst,firstIds.has(item.candidate_id),item.candidate_id);
 assert.equal(item.owner_decision,"PENDING");
 assert.equal(item.approved,false);
 assert.equal(item.canonical_admission_authorized,false);
 assert.equal(item.publication_authorized,false);
 assert.ok(item.name&&item.country_code,item.candidate_id);
 if(item.source_point){
   assert.ok(Number.isFinite(item.source_point.lat)&&Math.abs(item.source_point.lat)<=90,item.candidate_id);
   assert.ok(Number.isFinite(item.source_point.lng)&&Math.abs(item.source_point.lng)<=180,item.candidate_id);
   assert.equal(item.source_point.entrance_certified,false);
   assert.equal(item.source_point.coordinate_owner_approved,false);
 }
 if(item.review_class==="OWNER_REVIEW_PRESENTABLE")assert.ok(item.source_point,item.candidate_id);
 if(item.review_class==="EXISTING_DRAFT_SIGNOFF")assert.ok(existing.has(item.existing_draft_place_id),item.candidate_id);
 if(item.review_class==="EXISTING_PLACE_REUSE"){
   assert.ok(item.linked_existing_place_ids.length>0,item.candidate_id);
   assert.ok(item.linked_existing_place_ids.some(id=>existing.has(id)),item.candidate_id);
 }
 if(item.source_lane==="G_QUALIFIED_REVIEW"||item.source_lane==="H_STANDARD_REVIEW"){
   assert.ok(screens.get(item.candidate_id)?.web_evidence_review.page_level_research_performed,item.candidate_id);
   assert.equal(item.source_review_completed,true);
 }
 if(item.source_lane==="F_MISSING_COORDINATE"){
   const p=fpoints.get(item.candidate_id);assert.ok(p,item.candidate_id);
   if(p.coordinate_stage){
     assert.ok(item.source_point,item.candidate_id);
     assert.equal(item.source_point.lat,p.coordinate_stage.lat);
     assert.equal(item.source_point.lng,p.coordinate_stage.lng);
   }else{
     assert.equal(item.source_point,null);
   }
 }
 if(nearest.has(item.candidate_id)){
   assert.equal(item.proximity_alert.near_existing_place_id,
     nearest.get(item.candidate_id).near_existing_place_id);
 }
}
assert.equal(all.records.filter(x=>x.source_cohort==="FIRST_169").length,169);
assert.equal(all.records.filter(x=>x.source_cohort==="COMPLEMENT_243").length,243);
assert.equal(all.records.filter(x=>x.source_lane==="F_MISSING_COORDINATE").length,30);
assert.equal(all.records.filter(x=>x.source_lane==="G_QUALIFIED_REVIEW"||x.source_lane==="H_STANDARD_REVIEW").length,150);
assert.equal(all.records.filter(x=>x.proximity_alert&&x.source_cohort==="COMPLEMENT_243").length,10);
for(const id of ["CL-CD-20261105-28","SG-INV-0023","SG-INV-0471","SG-INV-0683","CL-UG-20261105-26"])
 assert.equal(all.records.find(x=>x.candidate_id===id).review_class,"IDENTITY_HOLD",id);
const rakunai=all.records.find(x=>x.candidate_id==="SG-INV-0747");
assert.equal(rakunai.review_class,"GEOMETRY_QUALIFIED");
const sanCono=all.records.find(x=>x.candidate_id==="SG-INV-0535");
assert.equal(sanCono.source_point.lat,-34.0942);
assert.equal(sanCono.source_point.lng,-56.2112);
assert.notEqual(sanCono.source_point.lng,-56.21338);
for(const [id,place] of [
 ["SG-INV-0676","place:MY:st-jude-church-rawang"],
 ["SG-INV-0534","place:UY:santuario-nuestra-senora-del-carmen-carmelo"]]){
 const item=all.records.find(x=>x.candidate_id===id);
 assert.equal(item.review_class,"EXISTING_PLACE_REUSE");
 assert.ok(item.linked_existing_place_ids.includes(place));
 assert.ok(existing.has(place));
}
assert.equal(area.proposals.length,5);
assert.equal(all.country_preflight.no_added_to_canonical,true);
assert.ok(!geo.geoAreas.some(a=>a.geo_area_id==="geo:territory:XK"));
assert.equal(area.proposals.find(x=>x.source_country_code==="XK").proposed_geo_area.codes.iso_alpha2,undefined);
assert.equal(reviewPackets.schema,"AO_SACRED_ATLAS_334_OWNER_BATCHES_V1");
assert.equal(reviewPackets.status,"REVIEW_PACKET_NO_APPROVAL");
assert.equal(reviewPackets.counts.presentable,334);
assert.equal(reviewPackets.counts.batches,3);
assert.equal(reviewPackets.counts.owner_approved,0);
assert.equal(reviewPackets.counts.places_imported,0);
assert.deepEqual(reviewPackets.batches.map(x=>[x.id,x.count]),[
 ["INITIAL_166",166],
 ["INSTITUTIONAL_SCREENED_145",145],
 ["ILLUSTRATIVE_COORDINATES_23",23]
]);
const batchRows=reviewPackets.batches.flatMap(x=>x.records);
assert.equal(batchRows.length,334);
assert.equal(new Set(batchRows.map(x=>x.candidate_id)).size,334);
const actualReviewIds=new Set(all.records.filter(x=>x.review_class==="OWNER_REVIEW_PRESENTABLE").map(x=>x.candidate_id));
assert.deepEqual(new Set(batchRows.map(x=>x.candidate_id)),actualReviewIds);
for(const batch of reviewPackets.batches){
 assert.equal(batch.count,batch.records.length);
 assert.equal(batch.owner_decision_required,true);
 assert.equal(batch.admission_authorized,false);
 for(const row of batch.records){
  assert.equal(row.owner_decision,"PENDING");
  assert.equal(row.admit,false);
  assert.equal(row.proposed_site_point.entrance_certified,false);
  assert.equal(row.proposed_site_point.coordinate_owner_approved,false);
 }
}
console.log("PASS 412 candidate registry: 334 owner-review, 2 draft signoffs, 4 reuses, 54 heritage, 6 P107, 11 identity holds, 1 geometry hold, zero approvals/imports");
