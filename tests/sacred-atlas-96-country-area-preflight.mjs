import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry,auditGeoArea} from "../src/find/geography-contracts.js";
import {LIVE,RELEASES} from "./helpers/sacred-places-live-baseline.mjs";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const geography=read("data/geography/seed-registry.v1.json");
const staged=read("data/geography/research/sacred-atlas-96-priority-unapproved-preimport-20261106.v1.json");
const manifest=read("data/geography/research/sacred-places-v10-c6-country-area-preflight-20261106.v1.json");
const codes=["AL","BI","BO","BY","ME","ZA"];
const ids=codes.map(cc=>"geo:country:"+cc);
assert.ok(RELEASES.some(x=>x.id==="V10-C6"),"Country-area preflight is preserved in the append-only release chain");
assert.equal(manifest.status,"DRAFT_PR_GEOGRAPHY_STRUCTURE_ONLY_NOT_PLACE_ADMISSION");
assert.equal(manifest.new_places,0);
assert.equal(manifest.published_new.length,0);
assert.deepEqual(manifest.new_geo_areas,ids);
assert.equal(manifest.proposed.geo_areas-manifest.baseline.geo_areas,6);
assert.equal(manifest.proposed.places,manifest.baseline.places);
assert.equal(geography.geoAreas.length,LIVE.areas);
assert.equal(geography.places.length,LIVE.places);
assert.equal(new Set(geography.geoAreas.map(a=>a.geo_area_id)).size,geography.geoAreas.length);
for(const code of codes){
 const area=geography.geoAreas.find(a=>a.geo_area_id==="geo:country:"+code);
 assert.ok(area,"Missing country area "+code);
 assert.equal(area.area_system,"CIVIL");
 assert.equal(area.area_type,"country");
 assert.deepEqual(area.parent_geo_area_ids,["geo:world"]);
 assert.equal(area.codes.iso_alpha2,code);
 assert.deepEqual(auditGeoArea(area),[]);
}
assert.equal(staged.candidates.length,96);
assert.equal(staged.nonproduction,true);
assert.equal(staged.authoritative,false);
assert.equal(staged.autopublish,false);
assert.equal(staged.requires_owner_approval,true);
assert.equal(staged.counts.approved,0);
assert.equal(staged.counts.publishable,0);
assert.equal(staged.counts.missing_country_area_candidates,0);
assert.deepEqual(staged.counts.missing_country_area_codes,[]);
assert.equal(staged.resolved_country_areas.length,9);
assert.equal(staged.missing_country_areas.length,0);
assert.equal(new Set(staged.candidates.map(c=>c.candidate_id)).size,96);
for(const c of staged.candidates){
 assert.equal(c.geo_area_id,"geo:country:"+c.country_code);
 assert.ok(geography.geoAreas.some(a=>a.geo_area_id===c.geo_area_id),c.candidate_id);
 assert.equal(c.country_area_present_in_draft,true,c.candidate_id);
 assert.equal(c.status,"RESEARCH_ONLY_UNAPPROVED",c.candidate_id);
 assert.equal(c.owner_approved,false,c.candidate_id);
 assert.equal(c.publishable,false,c.candidate_id);
 assert.equal(c.canonical_place_id,null,c.candidate_id);
 assert.equal(c.source_ref,null,c.candidate_id);
 assert.equal(c.verified_at,null,c.candidate_id);
 assert.equal(c.location_preview.coordinate_independently_verified,["SG-INV-0415","SG-INV-0722"].includes(c.candidate_id),c.candidate_id);
}
assert.equal(assertExploreGeographyRegistry(geography).pass,true);
console.log("PASS: six country areas, nine former area gaps resolved, 96 candidate publication gates still closed");
