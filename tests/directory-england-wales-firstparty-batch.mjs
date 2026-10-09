import assert from "node:assert/strict";
import fs from "node:fs";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords} from "../src/find/data-service.js";
import {stageFirstPartyMassBatch,mergeStagedFirstPartyMasses} from "../tools/directory/ingest-firstparty-mass-batch.mjs";

const read=f=>JSON.parse(fs.readFileSync(f,"utf8"));
const canonical=read("data/directory/generated/v19/diocesan.v1.json");
const review=read("data/directory/research/england-wales-first-party-reconciliation-20261009.v1.json");
assert.equal(canonical.records.length,65);
assert.equal(new Set(canonical.records.map(r=>r.u)).size,64);
assert.equal(review.imported.length,9);
assert.equal(review.held.length,12);
assert.equal(review.held.find(r=>r.id==="DIO-GB-GLASGOW-TORYGLEN").decision,"ARCHIVED_DISCONTINUED");
assert.equal(canonical.records.some(r=>r.u==="DIO-GB-GLASGOW-TORYGLEN"),false,"Discontinued Mass centre must not appear in canonical active data");
const joined=publishableDirectoryRecords(joinDirectoryRecords(expandResearchProviderSnapshot(canonical)));
for(const entry of review.imported){
 const row=canonical.records.find(r=>r.u===entry.id);
 assert.ok(row,"Missing source-backed venue: "+entry.id);
 assert.equal(row.cc,"GB");
 assert.equal(row.c||canonical.defaults.c,entry.community);
 assert.equal(row.vv,"2026-10-09");
 assert.equal(row.su,entry.source_url);
 if(entry.edition_source)assert.equal(row.eu,entry.edition_source);
 assert.ok(row.eu?.startsWith("https://"),"Liturgical form must have a source");
 assert.ok(row.sr.length>22,"Schedule/frequency evidence must be explicit");
 assert.ok(row.st.endsWith("_OFFICIAL")||row.st==="LOCAL_TRADITIONAL_MASS_ASSOCIATION");
 const record=joined.find(x=>x.venue.upstream.upstream_id===row.u);
 assert.ok(record,"Source row not rendered: "+row.u);
 assert.ok(record.ministries.some(m=>m.community_id===entry.community&&m.schedules.some(s=>s.service_type==="MASS")));
 assert.ok(record.sources.some(s=>s.url===row.su));
}
const caterham=canonical.records.find(r=>r.u==="DIO-GB-ARUNDEL-CATERHAM-SACRED-HEART");
assert.match(caterham.sr,/10:15/);
assert.doesNotMatch(caterham.sr,/10:00/);
const evesham=canonical.records.find(r=>r.u==="DIO-GB-BIRMINGHAM-EVESHAM-ST-EGWIN");
assert.match(evesham.sr,/1962_MISSAL/);
const oxford=canonical.records.find(r=>r.u==="ORD-GB-OXFORD-ORATORY-ST-ALOYSIUS");
assert.match(oxford.sr,/SUNDAY_08:00_EXTRAORDINARY_FORM/);
assert.doesNotMatch(oxford.sr,/11:00_EXTRAORDINARY_FORM/,"Oxford 11:00 solemn Latin Mass is the newer rite");
const oratorians=review.imported.filter(r=>r.community==="ORATORIAN");
assert.equal(oratorians.length,3);
const heldIds=new Set(review.held.map(r=>r.id));
assert.ok(heldIds.has("WITNESS-GB-WESTMINSTER-ROSARY-SHRINE"));
assert.ok(heldIds.has("WITNESS-GB-WESTMINSTER-CATHEDRAL"));
assert.ok(heldIds.has("WITNESS-GB-SOUTHWARK-MOLESEY"));
assert.ok(heldIds.has("WITNESS-GB-ARUNDEL-LEWES"));

// Large-batch operation never relies on third-party catalogue ownership or page scraping.
const fixture={schema:"AO_DIRECTORY_RESEARCH_PROVIDER_V1",defaults:{c:"DIOCESAN"},records:[]};
const sample=n=>({
 u:"INDEPENDENT-FIRSTPARTY-"+n,cc:"GB",l:"Town "+n,n:"St Example "+n,
 a:""+(n+2)+" Church Lane, Town "+n+", GB",sr:"SUNDAY_09:00_1962_MISSAL",
 su:"https://church"+n+".example.org/mass-times",eu:"https://church"+n+".example.org/mass-times",
 st:"PARISH_OFFICIAL",vv:"2026-10-09",
 editorial_liturgical_evidence:"Original parish advertises 1962 Missal Sunday Mass, independently reviewed",
});
const manifest={records:[...Array.from({length:30},(_,n)=>sample(n)),
 {...sample(1),u:"ANOTHER_NAME_DIFFERENT_UPSTREAM"},
 {...sample(0),u:"INDEPENDENT-FIRSTPARTY-0"},
 {...sample(31),st:"THIRD_PARTY_DIRECTORY"},
 {...sample(32),eu:"javascript:alert(1)"},
 {...sample(33),editorial_liturgical_evidence:"unknown"},
]};
const staged=stageFirstPartyMassBatch(fixture,manifest);
assert.equal(staged.summary.accepted,30);
assert.equal(staged.summary.held,5);
assert.equal(staged.summary.input,35);
assert.equal(staged.holds.filter(x=>x.reason==="POTENTIAL_EXISTING_PHYSICAL_VENUE").length,1);
assert.equal(staged.holds.filter(x=>x.reason==="EXISTING_SOURCE_ID").length,1);
assert.equal(staged.holds.filter(x=>x.reason==="NOT_ORIGINAL_OR_APPROVED_DIRECT_ORGANISER_EVIDENCE").length,2);
assert.equal(staged.holds.filter(x=>x.reason==="MISSING_CURRENT_EDITORIAL_FORM_REVIEW").length,1);
assert.equal(mergeStagedFirstPartyMasses(fixture,staged).records.length,30);
const repeated=stageFirstPartyMassBatch(mergeStagedFirstPartyMasses(fixture,staged),manifest);
assert.equal(repeated.accepted.length,0,"Batch must be idempotent");
assert.equal(repeated.holds.length,35);
console.log("England/Wales first-party batch: PASS — 9 mass venues, 1 discontinued removed, 12 documented holds; 30-row batch idempotent");
