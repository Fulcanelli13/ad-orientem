import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditVenue,auditSchedule} from "../src/find/contracts.js";
import {expandResearchProviderSnapshot,publishableDirectoryRecords} from "../src/find/data-service.js";
const load=x=>JSON.parse(readFileSync(x,"utf8"));
const path="data/directory/generated/v19/";
const fresh=load(path+"sspx-priority-europe-pacific-20261009.v1.json");
const ledger=load("data/directory/research/sspx-priority-districts-reconciliation-20261009.v1.json");
const former=["sspx-asia-central-americas","sspx-district-seed","sspx-four-district-bulk","sspx-france-first-party","sspx-france-second-pass","sspx-north-america-20261008","sspx-oct26-americas","sspx-oct26-europe","sspx-oct26-poland","sspx-mexico-completion-20261009"].flatMap(x=>load(path+x+".v1.json").records);
assert.equal(former.length,586);
assert.equal(fresh.provider,"SSPX_PRIORITY_EUROPE_PACIFIC_20261009");
assert.equal(fresh.records.length,11);
assert.equal(fresh.records.every(r=>r.ps==="CONDITIONAL_MASS"),true);
const norm=v=>String(v||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const ids=new Set(former.map(x=>x.u));
const addresses=new Set(former.map(x=>x.cc+"|"+norm(x.a)));
const slugs=new Set();
for(const r of fresh.records){
 assert.ok(!ids.has(r.u),"existing ID reused: "+r.u);ids.add(r.u);
 assert.ok(!addresses.has(r.cc+"|"+norm(r.a)),"duplicate physical address "+r.u);
 addresses.add(r.cc+"|"+norm(r.a));
 assert.equal(r.review_flag,"FIRST_PARTY_SSPX_MAP_SUNDAY_LABEL_AND_STREET_PHYSICAL_LOCATION");
 assert.equal(r.source_checked_on,"2026-10-09");
 assert.match(r.su,/^https:\/\/map\.fsspx\.org\/de\/places\//);
 assert.ok(/Sunday|Dimanche/i.test(r.sr),"Sunday Mass claim absent "+r.u);
 assert.ok(r.a.length>=30&&/[0-9]/.test(r.a),"Insufficient numbered physical address "+r.u);
 assert.ok(r.schedule_caveat);
 assert.ok(!slugs.has(r.official_map_source_place_id));slugs.add(r.official_map_source_place_id);
}
assert.equal(fresh.records.filter(x=>x.cc==="RU").length,2);
assert.equal(fresh.records.filter(x=>x.cc==="LT").length,2);
assert.ok(fresh.records.some(x=>x.official_map_source_place_id==="spiritual-centre-of-saint-berthold"&&
 x.sr.includes("Roman Rite")&&x.second_official_schedule_url.includes("/roman-rite/")),
 "Riga combined Byzantine and Latin source must disambiguate Roman Mass");
assert.ok(fresh.records.some(x=>x.official_map_source_place_id==="chapelle-saint-joseph-paita"&&
 x.sr.includes("Pas de messe dominicale hebdomadaire garantie")),
 "New Caledonia mission must not promise weekly Mass");
assert.ok(fresh.records.some(x=>x.official_map_source_place_id==="hill-end"&&
 x.sr.includes("four times a year")));
const expanded=expandResearchProviderSnapshot(fresh);
assert.equal(expanded.venues.length,11);
assert.ok(expanded.venues.every(v=>v.geo.lat===null&&v.geo.lng===null));
assert.ok(expanded.venues.every(v=>v.capabilities.sunday_mass));
assert.ok(expanded.ministries.every(m=>m.community_id==="SSPX"&&m.liturgical_usage.books==="1962"));
assert.ok(expanded.venues.every(v=>auditVenue(v).length===0));
assert.ok(expanded.schedules.every(s=>auditSchedule(s).length===0));
assert.equal(publishableDirectoryRecords(expanded.venues.map((venue,i)=>({
 venue,ministries:[{...expanded.ministries[i],schedules:[expanded.schedules[i]]}]
}))).length,11);
assert.equal(ledger.schema,"AO_DIRECTORY_SSPX_PRIORITY_DISTRICTS_RECONCILIATION_V1");
assert.equal(ledger.source_cases_reviewed,53);
assert.deepEqual(ledger.result_counts,{
 HOLD_NO_PUBLISHABLE_VISITOR_ADDRESS:10,
 POTENTIAL_EXISTING_SAME_LOCALITY:26,
 SOURCED_NEW_PHYSICAL_MASS_VENUE:11,
 EXISTING_REGISTERED_ALIAS_PHYSICAL_MATCH:6,
});
assert.equal(ledger.cases.filter(x=>x.publishable_new_record).length,11);
assert.deepEqual(new Set(ledger.cases.filter(x=>x.publishable_new_record).map(x=>x.official_place_id)),slugs);
assert.ok(ledger.cases.filter(x=>x.decision==="EXISTING_REGISTERED_ALIAS_PHYSICAL_MATCH")
 .every(x=>former.some(y=>y.u===x.existing_record_id)));
assert.ok(ledger.cases.every(x=>x.official_place_url.startsWith("https://map.fsspx.org/de/places/")));
console.log("SSPX priority districts: PASS — 53 reviewed, 11 sourced sites, 6 existing aliases, 26 same-locality reviews, 10 holds, 0 invented geocoordinates");
