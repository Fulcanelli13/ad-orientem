import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {expandResearchProviderSnapshot,publishableDirectoryRecords} from "../src/find/data-service.js";
import {auditVenue,auditSchedule} from "../src/find/contracts.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const dir="data/directory/generated/v19/";
const existingNames=["sspx-asia-central-americas","sspx-district-seed","sspx-four-district-bulk","sspx-france-first-party","sspx-france-second-pass","sspx-north-america-20261008","sspx-oct26-americas","sspx-oct26-europe","sspx-oct26-poland","sspx-mexico-completion-20261009","sspx-priority-europe-pacific-20261009"];
const previous=existingNames.flatMap(n=>read(dir+n+".v1.json").records);
const added=read(dir+"sspx-oct26-followup-65.v1.json");
const review=read("data/directory/research/sspx-six-district-65-review-20261009.v1.json");
const worldwide=read("data/directory/research/sspx-worldwide-210-case-disposition-20261009.v4.json");
assert.equal(previous.length,597);
assert.equal(added.schema,"AO_DIRECTORY_RESEARCH_PROVIDER_V1");
assert.equal(added.provider,"SSPX_OCT26_FOLLOWUP_65_20261009");
assert.equal(added.records.length,7);
assert.deepEqual(added.review_summary.by_country,{FR:4,IT:1,CH:1,NL:1});
assert.equal(added.records.filter(r=>r.ps==="CONDITIONAL_MASS").length,5);
assert.equal(added.records.filter(r=>r.ps==="CURRENT_PUBLIC_MASS").length,2);
const normalize=v=>String(v||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
const ids=new Set(previous.map(r=>r.u));
const physical=new Set(previous.map(r=>r.cc+"|"+normalize(r.a)));
for(const row of added.records){
 assert.ok(!ids.has(row.u));ids.add(row.u);
 assert.ok(row.su.startsWith("https://map.fsspx.org/de/places/"));
 assert.equal(row.source_checked_on,"2026-10-09");
 assert.equal(row.review_flag,"OFFICIAL_FIRST_PARTY_PHYSICAL_SUNDAY_MASS_OCT2026");
 assert.equal(row.geographic_coordinate_state,"OFFICIAL_SOURCE_ADDRESS_ROUTE_GEO_OVERLAY");
 assert.ok(row.a.length>=35);
 assert.ok(/Sunday\b/i.test(row.sr),"No explicit Sunday Mass source on "+row.u);
 assert.ok(!physical.has(row.cc+"|"+normalize(row.a)),"Previously published address duplicated "+row.u);
 physical.add(row.cc+"|"+normalize(row.a));
}
const geoOverlay=read(dir+"sspx-oct26-followup-65.geo.v1.json");
assert.equal(geoOverlay.schema,"AO_DIRECTORY_RESEARCH_GEO_OVERLAY_V1");
assert.equal(geoOverlay.provider,added.provider);
assert.equal(geoOverlay.records.length,7);
assert.equal(new Set(geoOverlay.records.map(r=>r.venue_id)).size,7);
assert.equal(new Set(geoOverlay.records.map(r=>r.geo.source_ref)).size,7);
const sourceSlugs=new Set(added.records.map(x=>x.official_map_source_place_id));
for(const entry of geoOverlay.records){
 assert.equal(entry.geo.precision,"address");
 assert.equal(entry.geo.geocoding_source,"OFFICIAL_SOURCE");
 assert.equal(entry.geo.matched_on,"OFFICIAL_PLACE_ID_ADDRESS_AND_DIRECTIONS_DESTINATION");
 assert.equal(entry.geo.source_observed_at,"2026-10-09");
 assert.ok(entry.geo.lat>=-90&&entry.geo.lat<=90&&entry.geo.lng>=-180&&entry.geo.lng<=180);
 assert.ok(sourceSlugs.has(entry.geo.source_ref.replace("SSPX:MAP:","")));
}
const expanded=expandResearchProviderSnapshot(added);
assert.equal(expanded.venues.length,7);
assert.equal(expanded.schedules.length,7);
assert.ok(expanded.venues.every(x=>x.geo.lat===null&&x.geo.lng===null),"Unverified coordinate was fabricated");
const withOfficialGeo=expandResearchProviderSnapshot(added,{geoRecords:geoOverlay.records});
assert.equal(withOfficialGeo.venues.length,7);
assert.ok(withOfficialGeo.venues.every(v=>v.geo.geocoding_source==="OFFICIAL_SOURCE"&&v.geo.precision==="address"));
assert.ok(withOfficialGeo.venues.every(v=>v.geo.lat!==null&&v.geo.lng!==null));
assert.ok(withOfficialGeo.venues.every(v=>auditVenue(v).length===0),"Official address point violates venue audit");

assert.ok(expanded.venues.every(x=>x.capabilities.sunday_mass===true));
assert.ok(expanded.venues.every(x=>auditVenue(x).length===0));
assert.ok(expanded.schedules.every(x=>auditSchedule(x).length===0));
assert.ok(expanded.ministries.every(x=>x.community_id==="SSPX"&&x.liturgical_usage.books==="1962"));
const joined=expanded.venues.map((venue,i)=>({venue,ministries:[{...expanded.ministries[i],schedules:[expanded.schedules[i]]}]}));
assert.equal(publishableDirectoryRecords(joined).length,7);
assert.equal(review.records.length,65);
assert.deepEqual(review.disposition_counts,{
 EVIDENCE_OR_PHYSICAL_ACCESS_HOLD:16,
 MATCHES_EXISTING_REGISTERED_SITE:41,
 NEW_CURRENT_MASS_VENUE:7,
 ADDRESS_CONFLICT_HOLD:1,
});
assert.equal(new Set(review.records.map(x=>x.official_place_id)).size,65);
const v1=read("data/directory/research/sspx-worldwide-210-case-disposition-20261009.v3.json");
assert.ok(review.records.every(x=>v1.cases.some(y=>y.source_place_id===x.official_place_id&&y.status==="PENDING_PLACE_DETAIL_ADJUDICATION")));
assert.ok(review.records.filter(x=>x.decision==="MATCHES_EXISTING_REGISTERED_SITE").every(x=>
 previous.some(y=>y.u===x.registered_venue_id&&normalize(y.a)===normalize(x.registered_address))));
assert.deepEqual(review.records.filter(x=>x.decision==="NEW_CURRENT_MASS_VENUE").map(x=>x.new_venue_id).sort(),added.records.map(x=>x.u).sort());
assert.deepEqual(review.records.filter(x=>x.decision==="ADDRESS_CONFLICT_HOLD").map(x=>x.official_place_id),["kapelle-jablonec-nad-nisou"]);
assert.ok(review.records.filter(x=>x.decision==="EVIDENCE_OR_PHYSICAL_ACCESS_HOLD").every(x=>x.reason&&x.published===false));
assert.equal(worldwide.source_v1_cases,210);
assert.equal(worldwide.cases.length,210);
assert.equal(new Set(worldwide.cases.map(x=>x.source_place_id)).size,210);
assert.deepEqual(worldwide.disposition_counts,{
 PENDING_PLACE_DETAIL_ADJUDICATION:71,
 EXISTING_PHYSICAL_ALIAS:78,
 NEW_VERIFIED_MASS_VENUE:28,
 EXISTING_OFFICIAL_CRM_LINK:30,
 ADDRESS_CONFLICT_HOLD:3,
});
assert.equal(worldwide.pending_total,74);
assert.equal(worldwide.fully_adjudicated,136);
assert.equal(worldwide.current_sspx_mass_evidenced_records,604);
assert.equal(worldwide.current_all_mass_evidenced_records,1202);
assert.equal(worldwide.current_all_source_records,1439);
assert.equal(worldwide.cases.reduce((n,x)=>n+x.new_mass_record_count,0),28);
assert.equal(worldwide.cases.filter(x=>x.status==="NEW_VERIFIED_MASS_VENUE").length,28);
assert.ok(worldwide.cases.filter(x=>x.status==="ADDRESS_CONFLICT_HOLD").every(x=>x.discrepancy));
console.log("SSPX six-district directory: PASS — 65 source cases, 41 existing sites, seven current public venues, 16 evidence holds, one address conflict, seven official address pins; 604 SSPX source Mass records");
