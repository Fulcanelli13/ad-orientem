import fs from "node:fs";
import assert from "node:assert/strict";
import {RESEARCH_PROVIDERS,expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords}
  from "../src/find/data-service.js";

const data=JSON.parse(fs.readFileSync("data/directory/generated/v19/una-voce-czech-round20-20261010.v1.json","utf8"));
const reconciliation=JSON.parse(fs.readFileSync("data/directory/research/una-voce-czech-round20-reconciliation-20261010.v1.json","utf8"));
assert.equal(data.schema,"AO_DIRECTORY_RESEARCH_PROVIDER_V1");
assert.equal(data.provider,"UNA_VOCE_CZ_CURRENT_20261010");
assert.ok(RESEARCH_PROVIDERS.some(x=>x.file==="una-voce-czech-round20-20261010.v1.json"),
 "Czech venues not loaded in production Find");
assert.equal(data.records.length,16);
assert.equal(reconciliation.total_national_listings,28);
assert.equal(reconciliation.new_approved_research_provider,16);
assert.equal(reconciliation.records.length,12);
assert.equal(data.records.length+reconciliation.records.length,28);
assert.equal(new Set(data.records.map(r=>r.u)).size,16);
assert.equal(new Set(data.records.map(r=>r.su)).size,16);
assert.equal(new Set(reconciliation.records.map(r=>r.place)).size,12);
assert.ok(data.records.every(r=>r.cc==="CZ"&&r.b==="UNKNOWN"),
 "Do not infer the 1962 book year from a general traditional-Mass association listing");
assert.ok(data.records.every(r=>r.su.startsWith("https://www.unavoce.cz/kostely/")
 && r.st==="TRADITIONAL_ASSOCIATION_CURRENT"&&r.sa==="CORROBORATED_ASSOCIATION"));
assert.ok(data.records.every(r=>r.a.includes("Czech Republic")&&r.rr.timezone==="Europe/Prague"));
assert.ok(data.records.every(r=>!r.lat&&!r.lng&&r.sr.length>32));

const byId=new Map(data.records.map(r=>[r.u,r]));
const get=k=>byId.get("UVCZ-R20-"+k);
assert.ok(!data.records.some(r=>r.l.includes("Hradec")),"Round18 existing Hradec church was duplicated");
assert.deepEqual(get("PRAHA-KARLOV").rr.weekly[1].excluded_months,[7,8]);
assert.equal(get("PRAHA-KARLOV").rr.excluded_non_mass.length,2,
 "Adoration or litanies were silently converted to Masses");
assert.equal(get("PRAHA-ST-PETER-PORICI").rr.weekly[1].time,"07:00");
assert.equal(get("PRAHA-ST-VOJTECH").rr.weekly[1].summer_status,"VERIFY");
assert.equal(get("KOVARSKA-ST-MICHAEL").rr.unresolved[0].status,
 "COMBINED_ROSARY_MASS_START_UNCERTAIN");
assert.equal(get("VEJPRTY-ALL-SAINTS").rr.unresolved[0].status,
 "POSSIBLE_ROSARY_MASS_MIXED_SOURCE_ENTRIES");
assert.ok(get("VYSSI-BROD-ASSUMPTION").rr.daily[0].time==="07:15");
assert.equal(get("BRNO-ST-MICHAEL").rr.weekly[0].time,"15:00");
assert.equal(get("JIHLAVA-ST-IGNATIUS").rr.monthly_nth_weekday[0].nth,3);
assert.equal(get("HLUCIN-ST-JOHN-BAPTIST").rr.monthly_nth_weekday.length,2);
assert.equal(get("LUDGEROVICE-ST-NICHOLAS").rr.monthly_nth_weekday[0].nth,4);
assert.equal(get("RYMAROV-ST-MICHAEL").rr.monthly_nth_weekday[0].nth,2);
assert.deepEqual(get("SLEZSKA-OSTRAVA-ST-JOSEPH").rr.monthly_nth_weekday.map(r=>r.nth),[1,3,5]);
assert.ok(reconciliation.records.some(r=>r.disposition==="PHYSICAL_USE_CONFLICT_HOLD"
 && r.place.includes("Jošta")));
assert.ok(reconciliation.records.some(r=>r.disposition==="PRIVATE_MASS_HOLD"
 && r.place.includes("Řeznovice")));
assert.equal(reconciliation.records.filter(r=>r.disposition==="CROSS_PROVIDER_FSSP_HOLD").length,8);
assert.ok(reconciliation.records.every(r=>r.publication_state==="HELD_NOT_PUBLISHED"));

const exp=expandResearchProviderSnapshot(data);
assert.equal(exp.venues.length,16);
assert.equal(exp.ministries.length,16);
assert.equal(exp.schedules.length,16);
assert.equal(exp.sources.length,16);
assert.ok(exp.venues.every(v=>v.geo.lat===null&&v.geo.lng===null));
assert.ok(exp.schedules.every(s=>s.verification?.state==="RECENTLY_VERIFIED"));
assert.ok(exp.schedules.every(s=>s.payload?.rules?.timezone==="Europe/Prague"));
const pub=publishableDirectoryRecords(joinDirectoryRecords(exp));
assert.equal(pub.length,16,"Czech registered venues failed production presentation gate");
assert.ok(pub.every(r=>r.ministries.length===1&&r.ministries[0].liturgical_usage.books==="UNKNOWN"));
assert.ok(pub.every(r=>r.sources.length>=1&&r.sources[0].authority==="CORROBORATED_ASSOCIATION"));

const sspx=JSON.parse(fs.readFileSync("data/directory/generated/v19/sspx-oct26-europe.v1.json","utf8"));
const local=sspx.records.filter(r=>r.cc==="CZ");
assert.equal(local.length,8);
const norm=x=>String(x||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
for(const r of data.records){
 const candidate=local.filter(v=>norm(v.l)===norm(r.l));
 for(const c of candidate)assert.notEqual(norm(r.a),norm(c.a),
  "New Czech venue has same exact address as SSPX canonical record");
}
console.log("Round 20 Czech directory: PASS — 16 real new spaces, 12 holds/overlaps, 28/28 accounted, no invented Mass times or map pins");
