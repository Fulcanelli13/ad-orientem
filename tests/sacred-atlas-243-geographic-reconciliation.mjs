import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const coords=read("data/geography/research/sacred-atlas-243-30-missing-coordinates-20261107.v1.json");
const decisions=read("data/geography/research/sacred-atlas-243-proximity-area-decisions-20261107.v1.json");
const source=read("data/geography/research/sacred-atlas-243-complement-triage-20261107.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const groups=source.candidate_ids_by_lane, all=new Set(Object.values(groups).flat());
assert.equal(coords.schema,"AO_SACRED_ATLAS_243_30_MISSING_COORDINATE_STAGE_V1");
assert.equal(decisions.schema,"AO_SACRED_ATLAS_243_PROXIMITY_AND_AREAS_V1");
assert.equal(coords.status,"RESEARCH_ONLY_UNAPPROVED");
assert.equal(decisions.status,"RESEARCH_ONLY_NO_GEOAREA_ADMISSION");
assert.equal(geo.places.length,535,"No unapproved Place admission");
assert.equal(coords.counts.missing_original,40);
assert.equal(coords.candidates.length,30);
assert.equal(groups.F_MISSING_COORDINATE.length,30);
assert.deepEqual(new Set(coords.candidates.map(x=>x.candidate_id)),new Set(groups.F_MISSING_COORDINATE));
assert.equal(new Set(coords.candidates.map(x=>x.candidate_id)).size,30);
const marked=coords.candidates.filter(x=>x.coordinate_stage);
assert.equal(marked.length,21);
assert.equal(marked.filter(x=>x.coordinate_stage.decision==="SITE_ILLUSTRATIVE").length,14);
assert.equal(marked.filter(x=>x.coordinate_stage.decision!=="SITE_ILLUSTRATIVE").length,7);
assert.equal(coords.candidates.filter(x=>x.hold).length,9);
assert.equal(coords.nonpin_original_missing_coordinate_ids.length,10);
assert.equal(new Set(coords.nonpin_original_missing_coordinate_ids).size,10);
for(const id of coords.nonpin_original_missing_coordinate_ids){
 assert.ok(all.has(id),id);
 assert.ok(!groups.F_MISSING_COORDINATE.includes(id),id);
}
assert.equal(coords.counts.still_without_proposed_point,19);
for(const row of coords.candidates){
 assert.equal(row.import_ready,false);
 assert.equal(row.publicly_published,false);
 assert.ok((row.coordinate_stage===null)!==(row.hold===null),row.candidate_id);
 if(row.coordinate_stage){
 const c=row.coordinate_stage;
 assert.ok(Number.isFinite(c.lat)&&c.lat>=-90&&c.lat<=90,row.candidate_id);
 assert.ok(Number.isFinite(c.lng)&&c.lng>=-180&&c.lng<=180,row.candidate_id);
 assert.equal(c.precision,"site_illustrative_not_entrance");
 assert.equal(c.coordinate_owner_approved,false);
 assert.ok(["http:","https:"].includes(new URL(c.source_url).protocol));
 assert.ok(c.scope_note.length>45,row.candidate_id);
 }
}
const near=decisions.source_nearest_proximity_cases;
assert.equal(near.length,10);
assert.equal(near.filter(x=>x.source_distance_m_to_production_place<100).length,2);
assert.equal(near.filter(x=>x.identity_review==="UNRESOLVED_SAME_BUILDING").length,1);
assert.equal(near.filter(x=>x.identity_review!=="UNRESOLVED_SAME_BUILDING").length,9);
assert.equal(new Set(near.map(x=>x.candidate_id)).size,10);
const placeIds=new Set(geo.places.map(x=>x.place_id));
for(const n of near){
 assert.ok(all.has(n.candidate_id),n.candidate_id);
 assert.ok(placeIds.has(n.near_existing_place_id),n.near_existing_place_id);
 assert.ok(n.source_distance_m_to_production_place>0&&n.source_distance_m_to_production_place<=500);
 assert.equal(n.proximity_is_not_equivalent_to_duplication,true);
 assert.equal(n.automerge,false);
 assert.equal(n.owner_approved,false);
}
assert.equal(near.find(x=>x.candidate_id==="SG-INV-0654").identity_review,"UNRESOLVED_SAME_BUILDING");
for(const id of ["SG-INV-0570","SG-INV-0599","SG-INV-0555"])assert.ok(near.find(x=>x.candidate_id===id).identity_review.startsWith("DISTINCT_"));
const area=decisions.missing_country_area_preflight;
assert.equal(area.length,9);
assert.deepEqual(new Set(area.map(x=>x.code)),new Set(["AM","BF","CY","ET","HT","TL","TN","TR","XK"]));
assert.deepEqual(new Set(area.filter(x=>x.decision==="ACTIVE_CATHOLIC_AREA_NEEDED").map(x=>x.code)),new Set(["BF","HT","TL","TR","XK"]));
assert.equal(area.filter(x=>x.decision==="HERITAGE_ONLY_DEFER").length,4);
const existingAreas=new Set(geo.geoAreas.map(x=>x.geo_area_id));
for(const a of area){
 assert.ok(!existingAreas.has(a.proposed_id),a.proposed_id);
 assert.ok(a.source_candidate_ids.length>0);
 assert.ok(a.source_candidate_ids.every(id=>all.has(id)),a.code);
 assert.ok(a.eligible_active_review_candidate_ids.every(id=>a.source_candidate_ids.includes(id)),a.code);
 assert.equal(a.area_owner_approved,false);
 assert.equal(a.canonical_area_insert_authorized,false);
 if(a.decision==="HERITAGE_ONLY_DEFER")assert.equal(a.eligible_active_review_candidate_ids.length,0);
}
assert.match(area.find(x=>x.code==="XK").code_note,/not formally assigned ISO/);
assert.equal(decisions.counts.production_imports,0);
assert.equal(coords.counts.production_imports,0);
console.log("PASS Atlas geography: 21 staged illustrative coordinate leads (14 stronger, 7 qualified), 19 without point, 10 proximity cases, five active-area prerequisites; 0 admissions");
