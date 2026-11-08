import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const coords=read("data/geography/research/sacred-atlas-243-30-missing-coordinates-20261107.v1.json");
const decisions=read("data/geography/research/sacred-atlas-243-proximity-area-decisions-20261107.v1.json");
const source=read("data/geography/research/sacred-atlas-243-complement-triage-20261107.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const preview=read("data/geography/research/sacred-atlas-five-active-country-area-preview-20261107.v1.json");
const groups=source.candidate_ids_by_lane, all=new Set(Object.values(groups).flat());
assert.equal(coords.schema,"AO_SACRED_ATLAS_243_30_MISSING_COORDINATE_STAGE_V1");
assert.equal(decisions.schema,"AO_SACRED_ATLAS_243_PROXIMITY_AND_AREAS_V1");
assert.equal(coords.status,"RESEARCH_IDENTITY_RECONCILED_16_CASES_NO_ADMISSION");
assert.equal(decisions.status,"RESEARCH_ONLY_NO_GEOAREA_ADMISSION");
assert.equal(geo.places.length,535,"No unapproved Place admission");
assert.equal(coords.counts.missing_original,40);
assert.equal(coords.candidates.length,30);
assert.equal(groups.F_MISSING_COORDINATE.length,30);
assert.deepEqual(new Set(coords.candidates.map(x=>x.candidate_id)),new Set(groups.F_MISSING_COORDINATE));
assert.equal(new Set(coords.candidates.map(x=>x.candidate_id)).size,30);
const marked=coords.candidates.filter(x=>x.coordinate_stage);
assert.equal(marked.length,24);
assert.equal(marked.filter(x=>x.coordinate_stage.decision==="SITE_ILLUSTRATIVE").length,23);
assert.equal(marked.filter(x=>x.coordinate_stage.decision!=="SITE_ILLUSTRATIVE").length,1);
assert.equal(coords.candidates.filter(x=>x.hold).length,6);
assert.equal(coords.nonpin_original_missing_coordinate_ids.length,10);
assert.equal(new Set(coords.nonpin_original_missing_coordinate_ids).size,10);
for(const id of coords.nonpin_original_missing_coordinate_ids){
 assert.ok(all.has(id),id);
 assert.ok(!groups.F_MISSING_COORDINATE.includes(id),id);
}
assert.equal(coords.counts.still_without_proposed_point,16);
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
assert.equal(coords.counts.second_pass_case_reviews,16);
assert.equal(coords.counts.second_pass_added_coordinate_proposals,3);
assert.equal(coords.counts.second_pass_promoted_geometry_leads,6);
assert.equal(coords.counts.correction_events,1);
assert.equal(coords.counts.existing_place_reuse_from_original_F_lane,2);
const find = id => coords.candidates.find(x=>x.candidate_id===id);
for(const id of ["SG-INV-0679","SG-INV-0475","SG-INV-0230"]){
 const row=find(id);
 assert.equal(row.hold,null,id);
 assert.equal(row.coordinate_stage.decision,"SITE_ILLUSTRATIVE");
 assert.ok(row.identity_research);
 assert.equal(row.coordinate_stage.coordinate_owner_approved,false);
}
const sano=find("SG-INV-0535");
assert.equal(sano.coordinate_stage.lat,-34.0942);
assert.equal(sano.coordinate_stage.lng,-56.2112);
assert.equal(sano.coordinate_stage.prior_source_point.lng,-56.21338);
assert.equal(sano.coordinate_stage.prior_source_point.lat,-34.09417);
assert.notEqual(sano.coordinate_stage.lng,sano.coordinate_stage.prior_source_point.lng);
for(const id of ["SG-INV-0071","SG-INV-0229","SG-INV-0723"]){
 assert.equal(find(id).coordinate_stage,null,id);
 assert.ok(find(id).hold,id);
}
const reuse = [
 ["SG-INV-0676","place:MY:st-jude-church-rawang","REUSE_EXISTING_RAWANG_SITE_DIFFERENT_CITY"],
 ["SG-INV-0534","place:UY:santuario-nuestra-senora-del-carmen-carmelo","REUSE_EXISTING_SANTUARIO_CARMELO"]
];
for(const [id,place,code] of reuse){
 const row=find(id);
 assert.equal(row.hold.code,code);
 assert.equal(row.coordinate_stage,null);
 assert.ok(geo.places.some(x=>x.place_id===place),place);
}
const historical=find("SG-INV-0233");
assert.equal(historical.hold.code,"DEMOLISHED_CHAPEL_HISTORIC_HERITAGE_ONLY");
assert.equal(historical.coordinate_stage,null);
const rakunai=find("SG-INV-0747");
assert.equal(rakunai.coordinate_stage.decision,"GEOMETRY_NEEDS_SECOND_SOURCE");
const urkupina=find("SG-INV-0542");
assert.equal(urkupina.coordinate_stage.decision,"SITE_ILLUSTRATIVE");
assert.match(urkupina.coordinate_stage.scope_note,/San Ildefonso/i);
const kfifan=find("SG-INV-0579");
assert.equal(kfifan.coordinate_stage.decision,"SITE_ILLUSTRATIVE");
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
assert.equal(preview.schema,"AO_SACRED_ATLAS_FIVE_COUNTRY_AREA_PREVIEW_V1");
assert.equal(preview.status,"RESEARCH_ONLY_ROUTING_CODE_PREPARED_NOT_ADMITTED");
assert.equal(preview.proposals.length,5);
assert.equal(preview.counts.standard_iso_compatible,4);
assert.equal(preview.counts.operational_territory_adapter_hold,1);
assert.equal(preview.counts.operational_territory_adapter_prepared,1);
assert.equal(preview.counts.geo_areas_appended_to_canonical,0);
assert.equal(preview.counts.candidate_places_admitted,0);
assert.deepEqual(new Set(preview.heritage_only_deferred_codes),new Set(["AM","CY","ET","TN"]));
for(const entry of preview.proposals){
 assert.equal(entry.owner_review_status,"PENDING");
 assert.equal(entry.canonical_area_insert_authorized,false);
 assert.equal(entry.proposed_geo_area.area_system,"CIVIL");
 assert.ok(["country","other"].includes(entry.proposed_geo_area.area_type));
 assert.deepEqual(entry.proposed_geo_area.parent_geo_area_ids,["geo:world"]);
 assert.ok(!existingAreas.has(entry.proposed_geo_area.geo_area_id));
 const source=area.find(a=>a.code===entry.source_country_code);
 assert.ok(source,entry.source_country_code);
 assert.deepEqual(new Set(entry.required_candidate_ids),new Set(source.eligible_active_review_candidate_ids));
 if(entry.source_country_code==="XK"){
  assert.equal(entry.standard_code_state,"OPERATIONAL_USER_ASSIGNED_NOT_ISO");
  assert.equal(entry.canonical_compatibility,"ADAPTER_PREPARED_STILL_UNAPPROVED");
  assert.equal(entry.proposed_geo_area.codes.iso_alpha2,undefined);
  assert.equal(entry.operational_code_route.cannot_write_into_codes_iso_alpha2,true);
  assert.equal(entry.operational_code_route.requires_explicit_adapter_or_schema_decision,false);
  assert.equal(entry.proposed_geo_area.geo_area_id,"geo:territory:XK");
  assert.equal(entry.proposed_geo_area.area_type,"other");
  assert.equal(entry.proposed_geo_area.codes.operational_alpha2,"XK");
 }else{
  assert.equal(entry.standard_code_state,"OFFICIAL_ISO_3166_1_ALPHA2");
  assert.equal(entry.proposed_geo_area.codes.iso_alpha2,entry.source_country_code);
  assert.equal(entry.canonical_compatibility,"STRUCTURALLY_COMPATIBLE_UNAPPROVED");
  assert.equal(entry.proposed_geo_area.area_type,"country");
 }
}
assert.equal(decisions.counts.production_imports,0);
assert.equal(coords.counts.production_imports,0);
console.log("PASS Atlas geography: 24 staged site coordinates (23 stronger, 1 qualified), 16 without point, 10 proximity cases, five active-area prerequisites; 0 admissions");
