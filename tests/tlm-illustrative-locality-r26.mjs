// R26: two specifically Excel-approved indicative places; never substitute chapel
// door coordinates or infer present Mass use from historical records.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R26} from "../src/find/cl2-illustrative-locality-pins-r26.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,tlmSiteEvidenceCounts} from "../src/find/preliminary-directory-r49.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const frozen=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const published=projectPublishedProvisionalMassSites(projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json")),read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const items=projectCL2PhysicalDirectory(published,frozen);
const byId=new Map(items.map(x=>[x.physical_group_id,x]));
const approvals=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R26);
assert.deepEqual(approvals.map(([id])=>id),["RG-5E751D3AAEFA","RG-650EDC1EC27B"]);
for(const [id,pin] of approvals){
 const original=frozen.records.find(x=>x[0]===id),item=byId.get(id);
 assert.ok(original&&original[1].includes(pin.sourceId),"Frozen source ID not present: "+id);
 assert.equal(original[2],pin.name);assert.equal(original[3],pin.country);
 assert.ok(original[4].includes(pin.addressNeedle),"Frozen source address differs: "+id);
 assert.ok(item&&item.physical_group_id===id&&item.source_id===pin.sourceId);
 assert.equal(item.title,pin.name);assert.equal(item.source_location_description,original[4]);
 assert.ok(item.source_ids.includes(pin.sourceId));
 assert.equal(items.filter(x=>x.physical_group_id===id).length,1);
 assert.equal(item.map_publishable,true);assert.equal(item.map_state,"PROVISIONAL");
 assert.ok(item.geo.approximate);assert.equal(item.geo.precision,"locality");
 assert.equal(item.geo.lat,pin.lat);assert.equal(item.geo.lng,pin.lng);
 assert.equal(item.geo.source_ref,pin.sourceRef);assert.equal(item.geo.source_url,pin.sourceUrl);
 assert.equal(item.geo.review_scope,pin.reviewScope);
 assert.ok(item.source_links.some(x=>x.url===pin.sourceUrl));
 assert.ok(item.source_links.some(x=>x.url===pin.evidence[0]));
 assert.equal(item.affiliation_scope,"SOURCE_LABEL_ONLY");
 assert.match(item.status,/MASS UNVERIFIED/);
 assert.equal(item.sections.length,0);assert.equal(item.celebration_evidence,undefined);
 assert.equal(item.cover_media,undefined);
 assert.equal(item.actions.length,1);assert.equal(item.actions[0].label,"Search location");
 const maps=new URL(item.actions[0].url),query=maps.searchParams.get("query");
 assert.equal(maps.hostname,"www.google.com");assert.equal(maps.pathname,"/maps/search/");
 assert.ok(query.includes("Norberto Street")||query.includes("Ford Park Road"));
 assert.ok(!item.actions[0].url.includes("/maps/dir/"));
 assert.ok(!item.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)));
 for(const lang of ["en","fr"]){
  const card=renderDirectoryVenueCard(item,lang),profile=renderTlmChurchProfile(item,lang);
  assert.ok(card.includes('data-explore-item="'+item.item_id+'"'));
  assert.ok(profile.includes("aoTlmProfileSources"));
  assert.ok(profile.includes("Google Maps"));
 }
}
const ford=byId.get("RG-5E751D3AAEFA");
assert.match(ford.geo.attribution,/TWO physically distinct surviving chapels/);
assert.match(ford.geo.attribution,/NOT either chapel building/);
assert.ok(ford.source_links.some(x=>x.url.includes("historicengland.org.uk")));
const bulacan=byId.get("RG-650EDC1EC27B");
assert.match(bulacan.geo.attribution,/FORMER Adoration Chapel/);
assert.match(bulacan.geo.attribution,/PARENT PARISH CHURCH/);
assert.match(bulacan.geo.attribution,/NOT verified coordinates of the former Adoration Chapel/);
for(const hold of [
 "RG-0DCEDA190517", // Reading: uncertain church identity
 "RG-50082C65DA56", // Sheffield: St Joseph ambiguity
 "RG-615FF6835AAE", // Poprad/Kálnica contradiction
 "RG-A74DC06D4545", // Ciudad Juárez address dispute
 "RG-5926C75531A7", // Modesto named POI lacks numeric point
 "RG-832AB0C2265E", // Chelmsford historic; no active pin
 "RG-24B468C40EBC", // Ashford/Snave existing-site alias
]){
 assert.ok(byId.has(hold)&&!byId.get(hold).map_publishable&&!byId.get(hold).geo,
  "R26 must not pin held, historical or alias location: "+hold);
}
assert.equal(items.length,2582);
assert.equal(items.filter(x=>x.map_publishable).length,2559);
assert.deepEqual(tlmSiteEvidenceCounts(items),{ALL:2582,REVIEWED_PIN:753,SOURCE_PIN:1806,ADDRESS_ONLY:23});
console.log("PASS R26: two Excel GEO-only vicinity markers, 2559/2582 mapped and 23 list-only; UK cemetery and PH parent-parish proxies never route to a chapel entrance or assert present Mass");
