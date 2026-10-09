import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditVenue,auditSchedule} from "../src/find/contracts.js";
import {expandResearchProviderSnapshot,publishableDirectoryRecords} from "../src/find/data-service.js";
const base="data/directory/generated/v19/";
const read=name=>JSON.parse(readFileSync(base+name+".v1.json","utf8"));
const added=read("sspx-mexico-completion-20261009");
const existingFiles=["sspx-district-seed","sspx-france-first-party","sspx-france-second-pass","sspx-four-district-bulk","sspx-oct26-europe","sspx-oct26-americas","sspx-oct26-poland","sspx-asia-central-americas","sspx-north-america-20261008"];
const existing=existingFiles.flatMap(readOne=>read(readOne).records).filter(x=>x.cc==="MX");
assert.equal(existing.length,14,"Previous Mexican SSPX baseline changed");
assert.equal(added.schema,"AO_DIRECTORY_RESEARCH_PROVIDER_V1");
assert.equal(added.provider,"SSPX_MEXICO_COMPLETION_20261009");
assert.equal(added.records.length,10);
assert.equal(added.review_summary.records,10);
const ids=new Set(),knownAddress=new Set(),knownCity=new Set();
const norm=v=>String(v||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
for(const x of existing){knownAddress.add(norm(x.a));knownCity.add(norm(x.l));}
const newAddress=new Set(),placeIds=new Set();
for(const row of added.records){
 assert.equal(row.cc,"MX");assert.equal(row.ps,"CONDITIONAL_MASS");
 assert.equal(row.source_checked_on,"2026-10-09");
 assert.equal(row.review_flag,"OFFICIAL_FIRST_PARTY_SUNDAY_MASS_AND_PHYSICAL_ADDRESS");
 assert.equal(row.su,"https://fsspx.mx/es/capillas-2");
 assert.ok(row.sr.toLowerCase().includes("domingo"),"Sunday evidence missing from "+row.u);
 assert.ok(row.a.length>=40,"Full physical address missing: "+row.u);
 assert.ok(row.official_map_url.endsWith("/"+row.official_map_source_place_id));
 assert.ok(!ids.has(row.u)&&!placeIds.has(row.official_map_source_place_id));
 ids.add(row.u);placeIds.add(row.official_map_source_place_id);
 assert.ok(!knownAddress.has(norm(row.a))&&!newAddress.has(norm(row.a)),
   "Duplicate Mexican physical venue "+row.u);
 assert.ok(!knownCity.has(norm(row.l)),"Already registered Mexican city; manual physical check needed: "+row.l);
 newAddress.add(norm(row.a));
}
const ag=added.records.find(x=>x.official_map_source_place_id==="mision-aguascalientes");
assert.equal(ag.schedule_caveat,"CONFLICTING_SUNDAY_FREQUENCY");
assert.ok(ag.conflicting_official_source.startsWith("https://fsspx.mx/"));
const ens=added.records.find(x=>x.official_map_source_place_id==="mision-ensenada");
assert.ok(ens.sr.includes("horario no publicado"),"Ensenada hour must not be invented");
const expanded=expandResearchProviderSnapshot(added);
assert.equal(expanded.venues.length,10);
assert.equal(expanded.ministries.length,10);
assert.equal(expanded.schedules.length,10);
assert.ok(expanded.venues.every(v=>v.capabilities.sunday_mass===true));
assert.ok(expanded.venues.every(v=>v.geo.lat===null&&v.geo.lng===null),"Do not invent coordinates");
assert.ok(expanded.venues.every(v=>v.publication_state==="CONDITIONAL_MASS"));
assert.ok(expanded.ministries.every(m=>m.community_id==="SSPX"&&m.liturgical_usage.books==="1962"));
assert.ok(expanded.venues.every(v=>auditVenue(v).length===0));
assert.ok(expanded.schedules.every(s=>auditSchedule(s).length===0));
const joined=expanded.venues.map((venue,i)=>({
 venue,ministries:[{...expanded.ministries[i],schedules:[expanded.schedules[i]]}],
}));
assert.equal(publishableDirectoryRecords(joined).length,10);
console.log("SSPX Mexico district completion: PASS — 10 new street-addressed Sunday sites, 10 conditional, 0 invented pins, 0 duplicates among 14 prior Mexico SSPX records");
