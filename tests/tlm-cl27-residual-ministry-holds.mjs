import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const master=read("data/directory/generated/cl2-physical-site-index.v1.json");
const ministry=read("data/directory/cl27-institutional-ministry-liturgy-20261110.v1.json");
const held=read("data/directory/research/cl27-6-residual-ministry-role-holds-20261110.v1.json");
const previous=read("data/directory/research/cl27-10-residual-ministry-role-holds-20261110.v1.json");
const original=read("data/directory/research/cl27-19-residual-ministry-role-holds-20261110.v1.json");
assert.equal(previous.records.length,10);
assert.equal(previous.release_state,"ARCHIVED_HISTORICAL_RESEARCH_SNAPSHOT_NOT_RUNTIME_IMPORT");
assert.equal(previous.superseded_by,"data/directory/research/cl27-6-residual-ministry-role-holds-20261110.v1.json");
assert.equal(original.records.length,19);
assert.equal(original.superseded_by,"data/directory/research/cl27-10-residual-ministry-role-holds-20261110.v1.json");
assert.equal(held.schema,"AO_CL27_6_RESIDUAL_MINISTRY_ROLE_HOLDS_V1");
assert.equal(held.release_state,"RESEARCH_ONLY_NOT_RUNTIME_IMPORT");
assert.equal(held.counts.original_35_exceptions,35);
assert.equal(held.counts.resolved_institute_ministry_links,29);
assert.equal(held.counts.still_held,6);
assert.deepEqual(held.counts.by_reason,{
 HOSTED_CZECH_DIOCESAN_FSSP_ORGANIZER:4,
 BENEDICTINE_OSB_CHAPEL_NOT_SSPX_MINISTRY:1,
 ASSOCIATED_SISTERS_NOT_IDENTIFIED_PRIEST:1
});
assert.equal(held.records.length,6);
assert.equal(ministry.counts.source_ministry_joins,1418);
assert.equal(ministry.counts.distinct_physical_sites,1335);
const sites=new Map(master.records.map(r=>[r[0],r]));
const accepted=new Set(ministry.records.map(r=>r[0]+"|"+r[1]));
const seen=new Set(),groupCounts={};
for(const r of held.records){
 assert.ok(!seen.has(r.physical_anchor),"Duplicate held physical site");
 seen.add(r.physical_anchor);
 const site=sites.get(r.physical_anchor);
 assert.ok(site&&site[1].includes(r.original_source_id),"Historical CL2 site/source missing");
 assert.equal(r.location,site[2]);
 assert.equal(r.country_code,site[3]);
 assert.equal(r.listed_affiliation,site[5]);
 assert.ok(!accepted.has(r.physical_anchor+"|"+r.original_source_id),"Held source wrongly admitted");
 assert.ok(!ministry.records.some(x=>x[0]===r.physical_anchor),"Held site inherited 1962 ministry");
 assert.equal(r.status,"RESEARCH_ONLY_MINISTRY_ROLE_UNATTESTED_NO_PUBLIC_ROMAN_1962_CERTIFICATION");
 assert.ok(!Object.hasOwn(r,"missal_edition")&&!Object.hasOwn(r,"una_cum"));
 assert.ok(r.next_gate.length>15);
 groupCounts[r.hold_reason]=(groupCounts[r.hold_reason]||0)+1;
}
assert.deepEqual(groupCounts,held.counts.by_reason);
const brazil=held.records.find(r=>r.physical_anchor==="RG-B77-F01A0F43F58F");
assert.ok(brazil);
assert.equal(brazil.identified_clergy_family,"BENEDICTINE_OSB_DOM_LOURENCO_FLEICHMAN");
assert.ok(!ministry.records.some(r=>r[0]===brazil.physical_anchor),"Benedictine is not SSPX");
const abbey=held.records.find(r=>r.physical_anchor==="RG-D2068D45E6DF");
assert.ok(abbey);
assert.ok(abbey.historical_chaplain_note.includes("not current evidence"));
assert.ok(!ministry.records.some(r=>r[0]===abbey.physical_anchor));
const archiveIDs=new Set(previous.records.map(r=>r.physical_anchor));
const recovered=new Set(Object.keys(ministry.resolved_four_last_exception_ministries.source_identity_records));
assert.equal(recovered.size,4);
assert.equal(new Set([...seen,...recovered]).size,10);
assert.ok([...seen,...recovered].every(x=>archiveIDs.has(x)));
assert.equal(ministry.resolved_nine_ministry_exception_sources.count,9);
assert.equal(ministry.holds.filter(x=>x.live_anchor==="RG-3EFF2C4A33C0").length,2);
console.log("PASS CL27: 29 of 35 exception sources resolved; six exact holds; four new direct ministries; no invented Masses, Una Cum, or SSPX priest at Benedictine chapel");
