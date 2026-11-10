import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const master=read("data/directory/generated/cl2-physical-site-index.v1.json");
const imported=read("data/directory/cl27-institutional-ministry-liturgy-20261110.v1.json");
const held=read("data/directory/research/cl27-19-residual-ministry-role-holds-20261110.v1.json");
assert.equal(held.schema,"AO_CL27_19_RESIDUAL_MINISTRY_ROLE_HOLDS_V1");
assert.equal(held.release_state,"RESEARCH_ONLY_NOT_RUNTIME_IMPORT");
assert.deepEqual(held.counts,{original_35_exceptions:35,certified_first_party_ministry_links:16,
 residual_identity_holds:19,by_reason:{
 HOSTED_CZECH_DIOCESAN_FSSP_ORGANIZER:10,
 SSPX_FRIENDLY_NOT_OPERATED:2,
 FSSP_SWISS_SPECIALIST_ONLY:2,
 ASSOCIATED_SISTERS_NOT_IDENTIFIED_PRIEST:4,
 CANADA_PHYSICAL_ALIAS_NOT_SOURCE_MINISTRY:1
 }});
assert.equal(held.records.length,19);
assert.equal(imported.counts.source_ministry_joins,1405);
assert.equal(imported.counts.distinct_physical_sites,1322);
const sites=new Map(master.records.map(x=>[x[0],x]));
const admitted=new Set(imported.records.map(x=>x[0]+"|"+x[1]));
const usedAnchors=new Set(),usedSources=new Set(),groups={};
for(const row of held.records){
 assert.ok(!usedAnchors.has(row.physical_anchor),"No duplicate held physical anchor");
 usedAnchors.add(row.physical_anchor);
 const key=row.physical_anchor+"|"+row.original_source_id;
 assert.ok(!usedSources.has(key),"No duplicate original source relationship");
 usedSources.add(key);
 const site=sites.get(row.physical_anchor);
 assert.ok(site,"Missing historic CL2 site "+row.physical_anchor);
 assert.ok(site[1].includes(row.original_source_id),"Orphaned source ID for "+row.physical_anchor);
 assert.ok(!admitted.has(key),"A held ministry source may not inherit Roman/1962 books");
 assert.ok(!imported.records.some(r=>r[0]===row.physical_anchor),
  "Held site gained institutional Rite/Missal from an unproved ministry");
 assert.equal(row.status,"RESEARCH_ONLY_MINISTRY_ROLE_UNATTESTED_NO_PUBLIC_ROMAN_1962_CERTIFICATION");
 assert.ok(row.next_gate.length>15);
 assert.equal(row.location,site[2]);
 assert.equal(row.country_code,site[3]);
 assert.equal(row.listed_affiliation,site[5]);
 assert.ok(!Object.hasOwn(row,"missal_edition")&&!Object.hasOwn(row,"una_cum"));
 groups[row.hold_reason]=(groups[row.hold_reason]||0)+1;
}
assert.deepEqual(groups,held.counts.by_reason);
// Saint-Irénée has three frozen source identities for ONE physical building.
// The LMD primary is still unclassified; two FSSP alias source IDs retain
// their original research-to-live site-ID discrepancy holds, not promotion.
const montreal=held.records.find(x=>x.physical_anchor==="RG-3EFF2C4A33C0");
assert.ok(montreal.original_source_id.startsWith("LMD:"));
const aliases=imported.holds.filter(x=>x.live_anchor===montreal.physical_anchor);
assert.equal(aliases.length,2);
assert.ok(aliases.every(x=>sites.get(montreal.physical_anchor)[1].includes(x.source_id)));
console.log("PASS CL27 residual: 16/35 exact ministry recoveries; 19 source-linked role/alias holds; 0 venue-wide or unsupported 1962 claims");
