import assert from "node:assert/strict";
import fs from "node:fs";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords} from "../src/find/data-service.js";

const snapshot=JSON.parse(fs.readFileSync("data/directory/generated/v19/diocesan.v1.json","utf8"));
const additions=[
 ["DIO-US-ORL-SANFORD-ALLSOULS-HISTORIC","SUNDAY_14:00_LATIN_LOW_FIRST_THIRD","asccsanford.org"],
 ["DIO-US-HOU-ANNUNCIATION-TEXAS","EF_HIGH_MASS_PUBLIC_2026-09-29","annunciationcc.org"],
 ["DIO-US-HOU-THIB-GIBSON-BLESSED-SACRAMENT","SUNDAY_08:00_EF_LOW","htdiocese.org"],
 ["DIO-US-VEN-AVEMARIA-PARISH","SUNDAY_12:30_EXTRAORDINARY_FORM","avemariaparish.org"],
 ["DIO-US-BOS-HOLYCROSS-CATHEDRAL","SUNDAY_10:00_EXTRAORDINARY_FORM","bostoncathedral.com"],
];
assert.equal(snapshot.records.length,64);
assert.equal(new Set(snapshot.records.map(r=>r.u)).size,snapshot.records.length);
const joined=publishableDirectoryRecords(joinDirectoryRecords(expandResearchProviderSnapshot(snapshot)));
for(const [id,schedule,domain] of additions){
 const row=snapshot.records.find(x=>x.u===id);
 assert.ok(row,"Missing newly verified venue: "+id);
 assert.ok(row.sr.includes(schedule),"Schedule or liturgical claim missing for "+id);
 assert.ok(row.su.includes(domain),"First party Mass schedule source missing for "+id);
 assert.ok(row.eu?.startsWith("https://"),"Liturgical-form first party source missing for "+id);
 assert.equal(row.vv,"2026-10-09");
 assert.ok(["PARISH_OFFICIAL","DIOCESE_OFFICIAL"].includes(row.st));
 assert.equal(row.cc,"US");
 assert.equal(row.pc,"YES");
 const record=joined.find(x=>x.venue.upstream.upstream_id===id);
 assert.ok(record,"Find did not publish original-source Mass record: "+id);
 assert.ok(record.ministries.some(m=>m.community_id==="DIOCESAN"&&m.schedules.some(s=>s.service_type==="MASS")));
 assert.ok(record.sources.some(s=>s.url===row.su));
}
assert.equal(joined.filter(x=>additions.some(a=>a[0]===x.venue.upstream.upstream_id)).length,5);
console.log("Five independent first-party diocesan additions: PASS — real Mass venues, original liturgical evidence, distinct physical IDs");
