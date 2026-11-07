// R23: only Excel Approved Geo Manifest row 183 is eligible; a named chapel
// Open Location Code cell centre is illustrative geography, not a routing endpoint.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R23} from "../src/find/cl2-illustrative-locality-pins-r23.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,tlmSiteEvidenceCounts} from "../src/find/preliminary-directory-r49.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const frozen=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const base=projectPublishedProvisionalMassSites(projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json")),read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const items=projectCL2PhysicalDirectory(base,frozen),byId=new Map(items.map(v=>[v.physical_group_id,v]));
const entries=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R23);
assert.equal(entries.length,1,"R23 publishes precisely one Excel GEO-only approved CL2 source");
const [id,pin]=entries[0],origin=frozen.records.find(v=>v[0]===id),venue=byId.get(id);
assert.equal(id,"RG-C4138959E1D3");
assert.ok(origin&&origin[1].includes(pin.sourceId)&&origin[2]===pin.name&&origin[3]===pin.country);
assert.equal(origin[4],"Taytay, Rizal, Philippines","The frozen source location must stay immutable");
assert.equal(pin.addressNeedle,origin[4]);
assert.equal(venue?.physical_group_id,id);
assert.equal(venue.title,pin.name);assert.equal(venue.source_id,pin.sourceId);
assert.ok(venue.source_ids.includes(pin.sourceId));
assert.equal(venue.source_location_description,origin[4]);
assert.equal(venue.map_publishable,true);assert.equal(venue.map_state,"PROVISIONAL");
assert.equal(venue.geo.approximate,true);assert.equal(venue.geo.precision,"locality");
assert.equal(pin.lat,14.5548875);assert.equal(pin.lng,121.117984375);
assert.equal(venue.geo.lat,pin.lat);assert.equal(venue.geo.lng,pin.lng);
assert.equal(venue.geo.source_ref,"independent:r23-taytay-sacred-heart-chapel-plus-code");
assert.equal(venue.geo.source_url,pin.sourceUrl);
assert.equal(venue.geo.review_scope,"ILLUSTRATIVE_NAMED_CHAPEL_PLUS_CODE_CELL_NOT_SURVEYED_DOOR_OR_ENTRANCE");
assert.match(venue.geo.attribution,/7Q63H439\+X55/);
assert.match(venue.geo.attribution,/NOT the verified chapel building/);
assert.match(venue.geo.attribution,/DIFFERENT diocesan Sacred Heart of Jesus Parish/);
assert.ok(venue.source_links.some(v=>v.url===pin.sourceUrl));
assert.ok(venue.source_links.some(v=>v.url.includes("centres-de-messe-nuc-2019")));
assert.ok(venue.source_links.some(v=>v.url.includes("parishph.com/2022/07/sacred-heart-of-jesus-parish")));
assert.equal(venue.affiliation_scope,"SOURCE_LABEL_ONLY");
assert.match(venue.status,/MASS UNVERIFIED/);
assert.equal(venue.sections.length,0);assert.equal(venue.celebration_evidence,undefined);
assert.equal(venue.cover_media,undefined);
assert.equal(venue.actions.length,1);assert.equal(venue.actions[0].label,"Search location");
const a=new URL(venue.actions[0].url),q=a.searchParams.get("query");
assert.equal(a.hostname,"www.google.com");assert.equal(a.pathname,"/maps/search/");
assert.ok(q.includes("Sacred Heart Chapel")&&q.includes("Solomon St")&&q.includes("Eastbank Rd"));
assert.ok(q.includes("Cainta")&&q.includes("Rizal"));
assert.ok(!venue.actions[0].url.includes("/maps/dir/"));
assert.ok(!venue.actions[0].url.includes(String(pin.lat)+","+String(pin.lng)));
for(const l of ["en","fr"]){
 const card=renderDirectoryVenueCard(venue,l),profile=renderTlmChurchProfile(venue,l);
 assert.ok(card.includes('data-explore-item="'+venue.item_id+'"'));
 assert.ok(profile.includes("aoTlmProfileSources"));
 assert.ok(profile.includes("Google Maps"));
}
for(const hold of [
 "RG-5926C75531A7", // Modesto has address and Google Place ID, no numeric POI coordinate
 "RG-A74DC06D4545", // Ciudad Juárez church number 533/553 unresolved; colony point not site
 "RG-615FF6835AAE", // Poprad vs Kálnica identity conflict
 "RG-832AB0C2265E", // Sold Chelmsford prior site
 "RG-24B468C40EBC", // Ashford/Snave same-site alias
]){
 assert.ok(byId.has(hold)&&!byId.get(hold).map_publishable&&!byId.get(hold).geo,
  "R23 must not pin unrelated held/alias record: "+hold);
}
assert.equal(items.length,2582);
assert.equal(items.filter(v=>v.map_publishable).length,2559);
assert.deepEqual(tlmSiteEvidenceCounts(items),{ALL:2582,REVIEWED_PIN:753,SOURCE_PIN:1806,ADDRESS_ONLY:23});
console.log("PASS R23: one Excel-reviewed named Sacred Heart Chapel POI grid centre; 2559/2582 mapped, 23 held; EN/FR, provenance, no door directions or current schedule, no Cainta parish confusion");
