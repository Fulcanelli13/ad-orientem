import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {
  PRELIMINARY_R49_URL,PRELIMINARY_R49_TOTAL,
  PUBLISHED_PROVISIONAL_MASS_SITES_EXPECTED,
  projectPreliminaryR49,projectPublishedProvisionalMassSites,
  filterPreliminaryR49,loadPreliminaryR49,
} from "../src/find/preliminary-directory-r49.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {CL2_PHYSICAL_SITE_INDEX_URL} from "../src/find/cl2-physical-directory.js";
const base=JSON.parse(readFileSync(fileURLToPath(PRELIMINARY_R49_URL),"utf8"));
const release=JSON.parse(readFileSync("data/directory/published-provisional-mass-sites-20261026.v1.json","utf8"));
const worldwide=JSON.parse(readFileSync("data/directory/generated/cl2-physical-site-index.v1.json","utf8"));
const old=projectPreliminaryR49(base);
assert.equal(old.length,1879);
assert.equal(release.record_count,PUBLISHED_PROVISIONAL_MASS_SITES_EXPECTED);
const combined=projectPublishedProvisionalMassSites(old,release);
assert.equal(combined.length,1882);
assert.deepEqual(combined.slice(0,old.length),old,"Frozen R49 records/order mutated");
assert.equal(new Set(combined.map(r=>r.source_id)).size,combined.length);
assert.equal(filterPreliminaryR49(combined,{directoryGroup:"ROME"}).length,1025);
assert.equal(filterPreliminaryR49(combined,{directoryGroup:"SSPX"}).length,732);
assert.equal(filterPreliminaryR49(combined,{directoryGroup:"UNKNOWN"}).length,125);
assert.equal(filterPreliminaryR49(combined,{directoryGroup:"ALL"}).length,1882);
assert.equal(exploreMapFeatures(combined).length,1882);
const added=combined.slice(PRELIMINARY_R49_TOTAL);
assert.deepEqual(added.map(x=>x.source_id),[
  "RG-B85-4DA44A2F403B","RG-B89-4FFBC6AB3EC5","RG-B89-F7BFDAA8E4BB",
]);
for(const item of added){
 assert.equal(item.map_publishable,true);
 assert.equal(item.map_state,"PROVISIONAL");
 assert.equal(item.geo.approximate,true);
 assert.equal(item.preliminary_group,"ROME");
 assert.equal(item.actions.length,0);
 assert.equal(item.sections.length,0);
 assert.ok(item.source_links.length>=3);
 assert.ok(item.source_links.every(s=>s.url.startsWith("https://")));
 assert.match(item.summary,/not independently certified/i);
 assert.match(item.note,/not imported into the recurring Mass calendar/i);
 assert.ok(item.geo.lat&&item.geo.lng);
}
for(const needle of ["Bormes","Albenga","Rivarolo"]){
 assert.equal(filterPreliminaryR49(combined,{directoryGroup:"ALL",query:needle})
   .filter(x=>x.item_id.startsWith("tlm:published-provisional:")).length,1);
}
const invalid=structuredClone(release);
invalid.records[0].geo.lat=999;
assert.throws(()=>projectPublishedProvisionalMassSites(old,invalid),/Invalid\/unreleased/);
const badId=structuredClone(release);
badId.records[1].research_group_id=badId.records[0].research_group_id;
assert.throws(()=>projectPublishedProvisionalMassSites(old,badId),/Invalid\/unreleased/);
let calls=[];
const api=async url=>{
 calls.push(String(url));
 return {ok:true,status:200,json:async()=>String(url)===CL2_PHYSICAL_SITE_INDEX_URL?worldwide:
   String(url).includes("published-provisional")?release:base};
};
const live=await loadPreliminaryR49({fetchImpl:api});
assert.equal(live.length,2582,"Complete CL2 worldwide index must load without dropping the three B91 published additions");
assert.equal(live.filter(x=>x.map_publishable).length,1905);
assert.equal(live.filter(x=>x.map_state==="ADDRESS_ONLY").length,677);
assert.ok(added.every(x=>live.some(v=>v.item_id===x.item_id)));
assert.deepEqual(calls,[PRELIMINARY_R49_URL,
  new URL("../data/directory/published-provisional-mass-sites-20261026.v1.json",import.meta.url).href,
  CL2_PHYSICAL_SITE_INDEX_URL]);
console.log("PASS B91 controlled Mass-map release: 3 source-backed provisional additions retained inside 2582-record worldwide directory, 1905 mapped, 677 list-only, zero certified schedules");
