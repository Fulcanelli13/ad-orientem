import assert from "node:assert/strict";
import fs from "node:fs";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords} from "../src/find/data-service.js";
const snapshot=JSON.parse(fs.readFileSync("data/directory/generated/v19/diocesan.v1.json","utf8"));
const ids=new Set(snapshot.records.map(r=>r.u));
assert.equal(ids.size,snapshot.records.length,"Duplicate diocesan source identities");
const check=[
 ["DIO-US-ME-LEWISTON-BASILICA",/SUNDAY_08:30_TRADITIONAL_LATIN_MASS/,"princeofpeace.me"],
 ["DIO-US-MN-ST-PAUL-SAINT-AGNES",/SUNDAY_08:00_EXTRAORDINARY_FORM/,"churchofsaintagnes.org"],
 ["DIO-US-MN-HAMEL-ST-ANNE",/TUESDAY_18:30_EXTRAORDINARY_FORM/,"saintannehamel.org"],
];
for(const [id,raw,domain] of check){
 const row=snapshot.records.find(x=>x.u===id);
 assert.ok(row,"Newly sourced diocesan venue missing: "+id);
 assert.match(row.sr,raw);
 assert.ok(row.su.includes(domain)&&row.eu.includes(domain),"Primary source must support schedule and liturgical form");
 assert.equal(row.st,"PARISH_OFFICIAL");
 assert.equal(row.vv,"2026-10-09");
}
const doc=expandResearchProviderSnapshot(snapshot);
const joined=publishableDirectoryRecords(joinDirectoryRecords(doc));
for(const [id] of check){
 const venue=joined.find(x=>x.venue.upstream.upstream_id===id);
 assert.ok(venue,"Verified diocesan Mass missing after publication gate");
 assert.ok(venue.ministries.some(m=>m.community_id==="DIOCESAN"&&m.schedules.some(s=>s.service_type==="MASS")));
 assert.ok(venue.sources.some(s=>s.url===venue.venue.contact.website[0]));
}
console.log("Diocesan first-party batch: PASS — three new distinct public 1962 Mass venues; all linked sources and schedules retained");
