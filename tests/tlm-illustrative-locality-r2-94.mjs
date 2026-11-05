// CL2 R2: 93 reviewed municipality marker points, never precise church GPS or current Mass.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R2} from "../src/find/cl2-illustrative-locality-pins-r2.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS} from "../src/find/cl2-illustrative-locality-pins.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,tlmSiteEvidenceCounts} from "../src/find/preliminary-directory-r49.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const registry=CL2_ILLUSTRATIVE_LOCALITY_PINS_R2, manifest=read("data/directory/research/illustrative-locality-20261104/review-r2-approved.v1.json");
const index=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const base=projectPublishedProvisionalMassSites(projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json")),read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const all=projectCL2PhysicalDirectory(base,index),byId=new Map(all.map(x=>[x.physical_group_id,x]));
const frozen=new Map(index.records.map(x=>[x[0],x]));
assert.equal(manifest.schema,"AO_TLM_ATLAS_ILLUSTRATIVE_LOCALITY_R2_APPROVED_V1");
assert.equal(manifest.reviewed,93);
assert.equal(manifest.records.length,93);
assert.deepEqual(new Set(Object.keys(registry)),new Set(manifest.records.map(r=>r.cl2_anchor)));
assert.equal(Object.keys(CL2_ILLUSTRATIVE_LOCALITY_PINS).length,158);
for(const row of manifest.records){
 const {cl2_anchor:id}=row,pin=registry[id],source=frozen.get(id),venue=byId.get(id);
 assert.ok(pin&&source&&venue,"R2 locality must retain frozen CL2 site: "+id);
 assert.ok(!CL2_ILLUSTRATIVE_LOCALITY_PINS[id],"R2 must not replace R1 locality: "+id);
 assert.ok(source[1].includes(pin.sourceId)&&source[2]===pin.name&&source[3]===pin.country);
 assert.ok(source[4].includes(pin.addressNeedle)&&pin.addressNeedle.length>0);
 assert.equal(row.review_decision,"Approved");
 assert.equal(row.source_id,pin.sourceId);
 assert.equal(row.lat,pin.lat);assert.equal(row.lng,pin.lng);
 assert.equal(pin.precision,"locality");assert.equal(pin.placeId,null);
 assert.equal(pin.reviewScope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
 assert.match(pin.sourceRef,/^geonames-locality:[A-Z]{2}:[a-z0-9-]+:[a-z0-9-]+$/);
 assert.ok(pin.sourceUrl.includes("joelacus/world-cities/blob/")&&pin.attribution.includes("CC BY 4.0"));
 assert.ok(pin.evidence.some(x=>source[6].includes(x)));
 assert.ok(pin.evidence.every(x=>x.startsWith("https://")));
 assert.ok(venue.map_publishable&&venue.map_state==="PROVISIONAL");
 assert.equal(venue.geo.precision,"locality");assert.equal(venue.geo.lat,pin.lat);assert.equal(venue.geo.lng,pin.lng);
 assert.equal(venue.geo.source_ref,pin.sourceRef);assert.equal(venue.geo.approximate,true);
 assert.equal(venue.actions.length,1);assert.equal(venue.actions[0].label,"Search location");
 const url=new URL(venue.actions[0].url),query=url.searchParams.get("query");
 assert.equal(url.pathname,"/maps/search/");
 assert.ok(query.includes(pin.name)&&query.includes(pin.country)&&query.includes(pin.addressNeedle.split("(")[0].trim()));
 assert.ok(!query.includes(pin.lat+","+pin.lng));assert.ok(!url.pathname.includes("/dir/"));
 assert.match(venue.status,/MASS UNVERIFIED/);
 assert.equal(venue.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.equal(venue.celebration_evidence,undefined);assert.equal(venue.sections.length,0);
 assert.equal(venue.cover_media,undefined);
 for(const language of ["en","fr"]){
  const card=renderDirectoryVenueCard(venue,language),profile=renderTlmChurchProfile(venue,language);
  assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.ok(profile.includes("Google Maps"));
 }
}
for(const id of ["RG-50082C65DA56","RG-B66-ACD5E3A16E10","RG-18E53EDD9E9C","RG-615FF6835AAE","RG-2C84B50B3667"]){
 assert.ok(!registry[id]);assert.ok(!byId.get(id)?.map_publishable,"Identity or closed site hold must stay unpinned: "+id);
}
assert.equal(all.length,2582);assert.equal(all.filter(x=>x.map_publishable).length,2516);
assert.deepEqual(tlmSiteEvidenceCounts(all),{ALL:2582,REVIEWED_PIN:710,SOURCE_PIN:1806,ADDRESS_ONLY:66});
assert.equal(filterPreliminaryR49(all,{siteEvidence:"ADDRESS_ONLY"}).length,66);
console.log("PASS TLM R2: 93 Excel-approved GeoNames town centroids, frozen IDs, EN/FR cards, 2516 mapped, 66 unpinned, no GPS routing");
