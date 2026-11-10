import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const master=read("data/directory/generated/cl2-physical-site-index.v1.json");
const ministry=read("data/directory/cl27-institutional-ministry-liturgy-20261110.v1.json");
const held=read("data/directory/research/cl27-10-residual-ministry-role-holds-20261110.v1.json");
const archive=read("data/directory/research/cl27-19-residual-ministry-role-holds-20261110.v1.json");
assert.equal(archive.release_state,"ARCHIVED_HISTORICAL_RESEARCH_SNAPSHOT_NOT_RUNTIME_IMPORT");
assert.equal(archive.superseded_by,"data/directory/research/cl27-10-residual-ministry-role-holds-20261110.v1.json");
assert.equal(archive.records.length,19);
assert.equal(held.schema,"AO_CL27_10_RESIDUAL_MINISTRY_ROLE_HOLDS_V1");
assert.equal(held.release_state,"RESEARCH_ONLY_NOT_RUNTIME_IMPORT");
assert.equal(held.counts.original_35_exceptions,35);
assert.equal(held.counts.certified_first_party_ministry_links,25);
assert.equal(held.counts.residual_identity_holds,10);
assert.deepEqual(held.counts.by_reason,{
 ASSOCIATED_SISTERS_NOT_IDENTIFIED_PRIEST:4,
 HOSTED_CZECH_DIOCESAN_FSSP_ORGANIZER:5,
 BENEDICTINE_OSB_CHAPEL_NOT_SSPX_MINISTRY:1
});
assert.equal(held.records.length,10);
assert.equal(ministry.counts.source_ministry_joins,1414);
assert.equal(ministry.counts.distinct_physical_sites,1331);
const sites=new Map(master.records.map(r=>[r[0],r]));
const admitted=new Set(ministry.records.map(r=>r[0]+"|"+r[1]));
const seen=new Set(),groupCounts={};
for(const r of held.records){
 assert.ok(!seen.has(r.physical_anchor),"Duplicate held physical site");
 seen.add(r.physical_anchor);
 const site=sites.get(r.physical_anchor);
 assert.ok(site&&site[1].includes(r.original_source_id),"Missing frozen CL2 source");
 assert.equal(r.location,site[2]);
 assert.equal(r.country_code,site[3]);
 assert.equal(r.listed_affiliation,site[5]);
 assert.ok(!admitted.has(r.physical_anchor+"|"+r.original_source_id),"Held source is admitted");
 assert.ok(!ministry.records.some(x=>x[0]===r.physical_anchor),"Held site wrongly inherited books");
 assert.equal(r.status,"RESEARCH_ONLY_MINISTRY_ROLE_UNATTESTED_NO_PUBLIC_ROMAN_1962_CERTIFICATION");
 assert.ok(!Object.hasOwn(r,"missal_edition")&&!Object.hasOwn(r,"una_cum"));
 assert.ok(r.next_gate.length>15);
 groupCounts[r.hold_reason]=(groupCounts[r.hold_reason]||0)+1;
}
assert.deepEqual(groupCounts,held.counts.by_reason);
const brazil=held.records.find(x=>x.physical_anchor==="RG-B77-F01A0F43F58F");
assert.ok(brazil);
assert.equal(brazil.identified_clergy_family,"BENEDICTINE_OSB_DOM_LOURENCO_FLEICHMAN");
assert.equal(brazil.source_of_independent_identity,"https://fsspx.com.br/pt/priorados-e-capelas-51589");
assert.ok(!ministry.records.some(r=>r[0]===brazil.physical_anchor));
const past=new Set(archive.records.map(r=>r.physical_anchor));
const recovered=new Set(Object.keys(ministry.resolved_nine_ministry_exception_sources.source_identity_records));
assert.equal(recovered.size,9);
assert.equal(new Set([...seen,...recovered]).size,19);
assert.ok([...seen,...recovered].every(x=>past.has(x)),"Original 19 exceptions not fully accounted for");
const montreal=ministry.records.find(x=>x[0]==="RG-3EFF2C4A33C0");
assert.ok(montreal?.[1]?.startsWith("LMD:"),"Only exact original LMD Montreal link promoted");
const aliases=ministry.holds.filter(x=>x.live_anchor==="RG-3EFF2C4A33C0");
assert.equal(aliases.length,2);
assert.ok(aliases.every(x=>sites.get("RG-3EFF2C4A33C0")[1].includes(x.source_id)));
console.log("PASS CL27: 25 of 35 historical roles recovered, 10 active holds, nine new direct source ministries, two Montreal aliases remain frozen, no SSPX inference for Niterói OSB chapel");
