import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords,RESEARCH_PROVIDERS} from "../src/find/data-service.js";

const file="data/directory/generated/v19/verified-global-round19-20261010.v1.json";
const dataset=JSON.parse(readFileSync(file,"utf8"));
assert.equal(dataset.schema,"AO_DIRECTORY_RESEARCH_PROVIDER_V1");
assert.equal(dataset.provider,"VERIFIED_GLOBAL_ROUND19_20261010");
assert.equal(dataset.records.length,6);
assert.equal(new Set(dataset.records.map(r=>r.u)).size,6);
assert.ok(RESEARCH_PROVIDERS.some(x=>x.file==="verified-global-round19-20261010.v1.json"));
const record=Object.fromEntries(dataset.records.map(r=>[r.u,r]));
for(const r of dataset.records){
 assert.ok(r.su.startsWith("https://")&&r.a.length>=25&&r.sr.length>=40);
 assert.ok(r.rr?.timezone);
 assert.ok(["1962","UNKNOWN"].includes(r.b));
 assert.ok(!r.lat&&!r.lng,"Source-only venues may not acquire invented map coordinates");
}
assert.equal(record["VG19-BR-UBERLANDIA-CSTA"].rr.weekday_rule,"HELD_SOURCE_CONFLICT",
 "Conflicting organizer/college weekday timetables must not be published");
assert.deepEqual(record["VG19-BR-UBERLANDIA-CSTA"].rr.weekly.map(x=>x.time),["07:00","09:00"]);
assert.equal(record["VG19-BR-PETROLINA-JUDAS"].b,"1962");
assert.ok(record["VG19-BR-PETROLINA-JUDAS"].rr.monthly_nth_weekday[0].nth===1);
assert.equal(record["VG19-PL-LODZ-ALL-SAINTS"].rr.date_overrides[0].time,"19:00");
assert.ok(record["VG19-PL-LODZ-ALL-SAINTS"].rr.date_overrides[0].additional_times.includes("08:30"));
assert.equal(record["VG19-ES-VALENCIA-CORPUS"].rr.seasonal_uncertainty,"VERIFY_AUGUST_DIRECTLY");
assert.equal(record["VG19-PR-ARECIBO-MARTIN"].rr.weekly[0].time,"13:00");
assert.equal(record["VG19-PR-ARECIBO-MARTIN"].rr.supersedes,"SUNDAY_14:00_LEGACY");
assert.equal(record["VG19-AU-KELMSCOTT-ORIGINAL-CHAPEL"].rr.physical_space,"ORIGINAL_CHAPEL_SEPARATE_FROM_NEW_PARISH_CHURCH");
assert.equal(record["VG19-AU-KELMSCOTT-ORIGINAL-CHAPEL"].rr.timezone,"Australia/Perth");
const p=JSON.parse(readFileSync("data/directory/generated/v19/sspx-oct26-poland.v1.json","utf8"));
const other=p.records.find(x=>x.u==="SSPX-OCT26-PL-ODZ-KAPLICA-SW-PIUSA-V");
assert.ok(other&&other.a.includes("Skargi")&&record["VG19-PL-LODZ-ALL-SAINTS"].a.includes("Żubardzka"),
 "Different Łódź SSPX chapel must not be merged with diocesan All Saints chapel");
const expanded=expandResearchProviderSnapshot(dataset);
assert.equal(expanded.venues.length,6);
assert.equal(expanded.ministries.length,6);
assert.equal(expanded.schedules.length,6);
assert.equal(expanded.sources.length,8);
assert.ok(expanded.venues.every(x=>x.geo.lat===null&&x.geo.lng===null));
const published=publishableDirectoryRecords(joinDirectoryRecords(expanded));
assert.equal(published.length,6,"Verified source-backed places missing from Find");
assert.ok(published.every(x=>x.ministries[0].schedules[0].payload.rules),
 "Structured schedule exceptions lost during importer projection");
assert.deepEqual([...new Set(published.map(x=>x.venue.address.country_code))].sort(),["AU","BR","ES","PL","PR"]);
console.log("Round19: PASS — six new worldwide Mass venues, 5 territories, distinct spaces, conflict holds, source-backed rules");
