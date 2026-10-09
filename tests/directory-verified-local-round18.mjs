import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords,RESEARCH_PROVIDERS} from "../src/find/data-service.js";

const j=JSON.parse(readFileSync("data/directory/generated/v19/verified-local-round18-20261010.v1.json","utf8"));
assert.equal(j.schema,"AO_DIRECTORY_RESEARCH_PROVIDER_V1");
assert.equal(j.provider,"VERIFIED_LOCAL_ROUND18_20261010");
assert.equal(j.records.length,5);
assert.equal(new Set(j.records.map(x=>x.u)).size,5);
assert.ok(RESEARCH_PROVIDERS.some(x=>x.file==="verified-local-round18-20261010.v1.json"),
  "A verified venue snapshot is not attached to the normal Find data loader");
const expected=[
 ["VL18-PL-NOWY-SACZ-ST-MARGARET","DIOCESAN","UNKNOWN","Sunday 15:30"],
 ["VL18-DE-FRANKFURT-DEUTSCHORDEN","DIOCESAN","1962","Sunday and holy days 18:00"],
 ["VL18-CZ-HRADEC-TREBES-ST-JOHN","DIOCESAN","1962","Sunday 17:00"],
 ["VL18-BE-NIEL-AS-ST-MICHAEL","UNKNOWN","1962","Sunday Mass:"],
 ["VL18-PL-OSWIECIM-FATIMA-CHAPEL","DIOCESAN","UNKNOWN","Second Sunday"]
];
const byId=new Map(j.records.map(r=>[r.u,r]));
for(const [id,community,books,phrase] of expected){
 const x=byId.get(id);
 assert.ok(x,id);
 assert.equal(x.c,community);
 assert.equal(x.b,books);
 assert.ok(x.sr.startsWith(phrase),id+" has lost its readable Mass schedule");
 assert.ok(x.a.length>=30&&x.su.startsWith("https://"),id+" has no precise address or linked source");
 assert.ok(x.rr&&x.rr.timezone,id+" has no structured recurrence source");
 assert.ok(!x.lat&&!x.lng,"Research must not invent map coordinates");
}
assert.deepEqual(byId.get("VL18-PL-NOWY-SACZ-ST-MARGARET").rr.seasonal_overrides,
 [{season:"LENT",day:"SU",time:"20:00",replaces:"15:30"}]);
assert.equal(byId.get("VL18-DE-FRANKFURT-DEUTSCHORDEN").rr.feast_days[0].deduplicate_when,"SUNDAY");
assert.equal(byId.get("VL18-CZ-HRADEC-TREBES-ST-JOHN").rr.weekly[0].effective_from,"2026-10-18");
const niel=byId.get("VL18-BE-NIEL-AS-ST-MICHAEL");
assert.equal(niel.rr.date_overrides[1].date,"2026-10-18");
assert.equal(niel.rr.date_overrides[1].time,null,"A to-be-announced time must not be invented");
assert.equal(niel.rr.date_overrides[2].time,"10:00");
assert.deepEqual(byId.get("VL18-PL-OSWIECIM-FATIMA-CHAPEL").rr.excluded_months,[7,8]);

const existingPoland=JSON.parse(readFileSync("data/directory/generated/v19/sspx-oct26-poland.v1.json","utf8"));
const kingi=existingPoland.records.find(x=>x.u==="SSPX-OCT26-PL-NOWY-SACZ-KAPLICA-SW-KINGI");
assert.ok(kingi&&kingi.a.includes("Zygmuntowska")&&byId.get("VL18-PL-NOWY-SACZ-ST-MARGARET").a.includes("Kolegiacki"),
 "Different Nowy Sącz liturgical spaces merged into one");

const expanded=expandResearchProviderSnapshot(j);
assert.equal(expanded.venues.length,5);
assert.equal(expanded.schedules.length,5);
assert.equal(expanded.ministries.length,5);
assert.equal(expanded.sources.length,8);
assert.ok(expanded.venues.every(v=>v.geo.lat===null&&v.geo.lng===null),"An unverified point leaked to the map");
const published=publishableDirectoryRecords(joinDirectoryRecords(expanded));
assert.equal(published.length,5,"Verified venues must be visible in the Find list after loader expansion");
assert.ok(published.every(x=>x.ministries[0].schedules[0].payload.rules),
 "Published schedules dropped machine-readable exceptions");
const named=Object.fromEntries(published.map(x=>[x.venue.upstream.upstream_id,x]));
assert.equal(named["VL18-CZ-HRADEC-TREBES-ST-JOHN"].sources[0].authority,"CORROBORATED_ASSOCIATION");
assert.equal(named["VL18-BE-NIEL-AS-ST-MICHAEL"].ministries[0].community_id,"UNKNOWN");
assert.equal(named["VL18-PL-NOWY-SACZ-ST-MARGARET"].ministries[0].liturgical_usage.books,"UNKNOWN");
console.log("Round18: PASS — five distinct list records, first-party provenance, explicit exceptions, unknown book years retained, no synthetic map pins");
