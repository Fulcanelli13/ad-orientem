import assert from "node:assert/strict";
import fs from "node:fs";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords} from "../src/find/data-service.js";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const regional=read("data/directory/research/una-voce-scotland-20261009.v1.json");
const canonical=read("data/directory/generated/v19/diocesan.v1.json");
assert.equal(regional.schema,"AO_UVS_SCOTLAND_20261009_SOURCE_RECONCILIATION_V1");
assert.equal(regional.records.length,16);
assert.equal(regional.records.filter(r=>r.kind==="TLM").length,11);
assert.equal(regional.records.filter(r=>r.kind==="ORDINARIATE_DIVINE_WORSHIP").length,4);
assert.equal(regional.records.filter(r=>r.kind==="DISCONTINUED").length,1);
assert.ok(regional.records.every(r=>r.origin===regional.regional_source));
assert.ok(regional.records.filter(r=>r.kind!=="TLM").every(r=>r.decision.startsWith("EXCLUDE_")));
const ids=new Set(canonical.records.map(x=>x.u));
assert.equal(canonical.records.length,57);
assert.equal(ids.size,canonical.records.length);
const expected=[
 ["DIO-GB-MOTHERWELL-CLELAND-ST-MARY","THURSDAY_19:00_MASS_IN_EXTRAORDINARY_FORM","rcdom.org.uk","PUBLISHED_DIOCESE_2026"],
 ["DIO-GB-LANCASTER-CARLISLE-ST-MARGARET-MARY","SATURDAY_10:00_MASS_IN_EXTRAORDINARY_FORM","carlislecatholicchurch.org","PUBLISHED_PARISH_2026"],
 ["DIO-GB-GLASGOW-THORNLIEBANK-ST-VINCENT","SUNDAY_12:00_SUNG_TRADITIONAL_LATIN_MASS","glasgowlatinmass.co.uk","PUBLISHED_REGIONAL_APOSTOLATE_2026"]
];
const joined=publishableDirectoryRecords(joinDirectoryRecords(expandResearchProviderSnapshot(canonical)));
for(const [id,massEvidence,issuer,status] of expected){
 const r=canonical.records.find(x=>x.u===id);
 assert.ok(r,"Missing documented British venue "+id);
 assert.equal(r.cc,"GB");
 assert.equal(r.vv,"2026-10-09");
 assert.ok(r.su.startsWith("https://")&&r.su.includes(issuer));
 assert.ok(r.eu?.startsWith("https://")&&r.eu.includes(issuer));
 assert.ok(r.sr.includes(massEvidence));
 const record=joined.find(x=>x.venue.upstream.upstream_id===id);
 assert.ok(record,"Importer omitted sourced Mass "+id);
 assert.ok(record.ministries.some(m=>m.community_id==="DIOCESAN"&&m.schedules.some(s=>s.service_type==="MASS")));
 assert.ok(regional.records.some(x=>x.decision===status&&x.primary?.includes(issuer)));
}
const regionalPublished=regional.records.filter(x=>x.decision.startsWith("PUBLISHED_"));
assert.equal(regionalPublished.length,3,"Do not inflate 1962 venues from four Ordinariate Masses");
assert.equal(regional.records.filter(x=>x.decision==="ALREADY_IN_DIOCESAN").length,1);
assert.equal(regional.records.filter(x=>x.decision==="EXISTING_FSSP_OFFICIAL_SOURCE").length,2);
assert.equal(regional.records.filter(x=>x.decision.startsWith("HOLD_")).length,5);
const closed=regional.records.find(x=>x.id==="uvs-closed-st-brigids");
assert.equal(closed.decision,"EXCLUDE_DISCONTINUED_2025");
const eriskay=regional.records.find(x=>x.id==="uvs-eriskay");
assert.equal(eriskay.decision,"HOLD_LITURGICAL_FORM_NOT_CORROBORATED");
const lawside=canonical.records.find(x=>x.u==="DIO-GB-DUNKELD-DUNDEE-LAWSIDE");
assert.ok(lawside&&lawside.sr.includes("SUNDAY_13:00"),"Do not duplicate existing Dundee chapel");
console.log("Scottish source reconciliation: PASS — 3 new original-source Masses, 3 already covered, 5 held, 4 Ordinariate excluded, 1 discontinued excluded");
