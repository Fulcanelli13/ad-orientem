// R27 one Excel GEO-only Chiltern town marker; nine-case editorial ledger.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R27} from "../src/find/cl2-illustrative-locality-pins-r27.js";
import {CL2_ILLUSTRATIVE_LOCALITY_PINS_R28} from "../src/find/cl2-illustrative-locality-pins-r28.js";
import {validateCL2PhysicalIndex,projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites,tlmSiteEvidenceCounts} from "../src/find/preliminary-directory-r49.js";
import {renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {renderTlmChurchProfile} from "../src/find/tlm-church-profile.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const frozen=validateCL2PhysicalIndex(read("data/directory/generated/cl2-physical-site-index.v1.json"));
const published=projectPublishedProvisionalMassSites(projectPreliminaryR49(read("data/directory/preliminary-map-r49.v1.json")),read("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const items=projectCL2PhysicalDirectory(published,frozen);
const byId=new Map(items.map(x=>[x.physical_group_id,x]));
const [id,pin]=Object.entries(CL2_ILLUSTRATIVE_LOCALITY_PINS_R27)[0];
assert.deepEqual(Object.keys(CL2_ILLUSTRATIVE_LOCALITY_PINS_R27),["RG-6C322C1860C9"]);
const source=frozen.records.find(x=>x[0]===id),site=byId.get(id);
assert.ok(source&&source[1].includes(pin.sourceId));
assert.equal(source[2],pin.name);assert.equal(source[3],"AU");
assert.ok(source[4].includes(pin.addressNeedle));
assert.equal(items.filter(x=>x.physical_group_id===id).length,1,"No chapel duplication");
assert.ok(site?.map_publishable&&site.geo?.approximate&&site.geo.precision==="locality");
assert.equal(site.physical_group_id,id);assert.equal(site.source_id,pin.sourceId);
assert.equal(site.title,pin.name);
assert.equal(site.source_location_description,source[4]);
assert.equal(site.geo.lat,-36.15044);assert.equal(site.geo.lng,146.60843);
assert.equal(site.geo.source_ref,pin.sourceRef);assert.equal(site.geo.source_url,pin.sourceUrl);
assert.equal(site.geo.review_scope,pin.reviewScope);
assert.equal(site.map_state,"PROVISIONAL");
assert.equal(site.affiliation_scope,"SOURCE_LABEL_ONLY");
assert.match(site.status,/MASS UNVERIFIED/);
assert.equal(site.sections.length,0);assert.equal(site.celebration_evidence,undefined);
assert.equal(site.cover_media,undefined);
assert.match(site.geo.attribution,/ONLY the wider Chiltern TOWN CENTRE/);
assert.match(site.geo.attribution,/SAME address and cleric as ST JOSEPH'S CHAPEL/);
assert.match(site.geo.attribution,/present worship access, occupation and TLM service cannot be assumed/);
assert.equal(site.actions.length,1);assert.equal(site.actions[0].label,"Search location");
const maps=new URL(site.actions[0].url);
assert.equal(maps.hostname,"www.google.com");assert.equal(maps.pathname,"/maps/search/");
const query=maps.searchParams.get("query");
assert.ok(query.includes("49 High Street")&&query.includes("Chiltern"));
assert.ok(!site.actions[0].url.includes("/maps/dir/"));
assert.ok(!site.actions[0].url.includes("-36.15044,146.60843"));
for(const lang of ["en","fr"]){
 const card=renderDirectoryVenueCard(site,lang),profile=renderTlmChurchProfile(site,lang);
 assert.ok(card.includes('data-explore-item="'+site.item_id+'"'));
 assert.ok(profile.includes("aoTlmProfileSources"));
 assert.ok(profile.includes("Google Maps"));
}
const ledger=read("data/directory/research/atlas-r27-final-nine-adjudication.v1.json");
assert.equal(ledger.records.length,9);
assert.equal(ledger.records.filter(x=>x.decision==="APPROVED_GEO_ONLY_NOT_RELEASED").length,1);
assert.equal(ledger.records.filter(x=>x.decision!=="APPROVED_GEO_ONLY_NOT_RELEASED").length,8);
assert.deepEqual(ledger.proposed,{sourcePins:1806,reviewedPins:754,mapped:2560,listOnly:22});
for(const v of ledger.records){
 const r=frozen.records.find(x=>x[0]===v.anchor),i=byId.get(v.anchor);
 assert.ok(r&&r[1].includes(v.sourceId),"Original CL2 identity missing: "+v.anchor);
 assert.equal(i.title,r[2],"Published venue must retain exact frozen source title");
 assert.ok(i);
 if(v.anchor!==id)assert.ok(CL2_ILLUSTRATIVE_LOCALITY_PINS_R28[v.anchor]&&i.map_publishable&&i.geo?.precision==="locality","R28 owner-authorized approximate override must retain original R27 historical research hold: "+v.anchor);
}
for(const hold of ["RG-832AB0C2265E","RG-24B468C40EBC"]){
 assert.ok(byId.has(hold)&&!byId.get(hold).map_publishable,"Historical Chelmsford and Ashford/Snave alias remain list only");
}
assert.equal(items.length,2583);
assert.deepEqual(tlmSiteEvidenceCounts(items),{ALL:2583,REVIEWED_PIN:763,SOURCE_PIN:1806,ADDRESS_ONLY:14});
console.log("PASS R27: one Excel GEO-only Chiltern town marker; full nine-site hold ledger, 2569/2583 mapped, no current Mass, no GPS directions, frozen 2583 CL2 source identities");
