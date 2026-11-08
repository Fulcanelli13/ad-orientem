// R19: one Excel-approved, independently corroborated complex-vicinity marker.
// Snave/Ashford is an alias of an EXISTING mapped CL2 site, not a new pin.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R19} from "../src/find/cl2-illustrative-locality-pins-r19.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,tlmSiteEvidenceCounts} from "../src/find/preliminary-directory-r49.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const frozen=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const base=projectPublishedProvisionalMassSites(projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json")),read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const items=projectCL2PhysicalDirectory(base,frozen);
const byId=new Map(items.map(x=>[x.physical_group_id,x]));
const rows=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R19);
assert.equal(rows.length,1,"R19 must publish exactly ONE new pin, not duplicate Snave");
const [id,pin]=rows[0],origin=frozen.records.find(r=>r[0]===id),venue=byId.get(id);
assert.equal(id,"RG-2565E7B509ED");
assert.ok(origin&&origin[1].includes(pin.sourceId)&&origin[2]===pin.name&&origin[3]===pin.country);
assert.equal(origin[4],"","Do not backfill missing original CL2 address");
assert.equal(pin.addressNeedle,"");
assert.equal(venue?.physical_group_id,id);
assert.equal(venue.title,origin[2]);assert.equal(venue.source_id,pin.sourceId);
assert.ok(venue.source_ids.includes(pin.sourceId));
assert.ok(venue.map_publishable&&venue.map_state==="PROVISIONAL");
assert.ok(venue.geo?.approximate&&venue.geo.precision==="locality");
assert.equal(venue.geo.lat,40.488683);assert.equal(venue.geo.lng,-3.364960);
assert.equal(venue.geo.source_ref,"independent:r19-illustrative-rg2565e7b509ed");
assert.equal(venue.geo.source_url,pin.sourceUrl);
assert.equal(venue.geo.review_scope,"ILLUSTRATIVE_LOCALITY_POINT_NOT_WORSHIP_BUILDING_NOT_ENTRANCE");
assert.match(venue.geo.attribution,/not surveyed TLM chapel footprint/);
assert.ok(venue.source_links.some(x=>x.url===pin.sourceUrl));
assert.ok(venue.source_links.some(x=>x.url.includes("lamisadesiempre")));
assert.equal(venue.affiliation_scope,"SOURCE_LABEL_ONLY");
assert.match(venue.status,/MASS UNVERIFIED/);
assert.equal(venue.sections.length,0);assert.equal(venue.celebration_evidence,undefined);
assert.equal(venue.cover_media,undefined);
assert.equal(venue.actions.length,1);assert.equal(venue.actions[0].label,"Search location");
const url=new URL(venue.actions[0].url),q=url.searchParams.get("query");
assert.equal(url.hostname,"www.google.com");assert.equal(url.pathname,"/maps/search/");
assert.ok(q.includes(pin.name)&&q.includes("Paseo de la Estación 17"));
assert.ok(!venue.actions[0].url.includes("/maps/dir/"));
assert.ok(!venue.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)));
for(const lang of ["en","fr"]){
 const card=renderDirectoryVenueCard(venue,lang),profile=renderTlmChurchProfile(venue,lang);
 assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
 assert.ok(profile.includes("aoTlmProfileSources"));
 assert.ok(profile.includes("Google Maps"));
}
const ashford=byId.get("RG-24B468C40EBC"),snave=byId.get("RG-E8AB816F595F");
assert.ok(ashford&&!ashford.map_publishable&&!ashford.geo,"Ashford LMS record is SAME Snave site: no second pin");
assert.ok(snave?.map_publishable&&snave.geo?.approximate&&snave.geo?.precision==="locality",
 "Existing Snave locality marker stays unchanged pending optional building-site review");
assert.equal(snave.geo.source_ref,"independent:r3-illustrative-e8ab816f595f");
const other=byId.get("RG-505FF513488A");
assert.ok(other&&other.physical_group_id!==id&&other.title.includes("Concepcionistas"),
 "Concepcionistas Franciscanas is a DIFFERENT church in Alcalá");
assert.equal(items.length,2583);
assert.equal(items.filter(x=>x.map_publishable).length,2569);
assert.deepEqual(tlmSiteEvidenceCounts(items),{ALL:2583,REVIEWED_PIN:763,SOURCE_PIN:1806,ADDRESS_ONLY:14});
console.log("PASS R19: one historic Adoratrices complex-vicinity CL2 marker, Snave alias no duplicate, R23 adds one separate named-chapel grid-cell marker (2569/2583 total); schedule/door/CL27 remain unverified");
