import assert from "node:assert/strict";
import fs from "node:fs";
import {expandResearchProviderSnapshot,publishableDirectoryRecords} from "../src/find/data-service.js";
import {auditVenue,auditSchedule} from "../src/find/contracts.js";
import {isMapPublishableGeo} from "../src/find/geo-provenance.js";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const root="data/directory/generated/v19/";
const oldNames=["sspx-asia-central-americas","sspx-district-seed","sspx-four-district-bulk","sspx-france-first-party","sspx-france-second-pass","sspx-north-america-20261008","sspx-oct26-americas","sspx-oct26-europe","sspx-oct26-poland","sspx-mexico-completion-20261009","sspx-priority-europe-pacific-20261009","sspx-oct26-followup-65"];
const old=oldNames.flatMap(s=>read(root+s+".v1.json").records);
const current=read(root+"sspx-global-completion-20261009.v1.json");
const geo=read(root+"sspx-global-completion-20261009.geo.v1.json");
const reviews=read("data/directory/research/sspx-last-71-source-review-20261009.v1.json");
const v4=read("data/directory/research/sspx-worldwide-210-case-disposition-20261009.v4.json");
const v5=read("data/directory/research/sspx-worldwide-210-case-disposition-20261009.v5.json");
assert.equal(old.length,604);
assert.equal(new Set(old.map(x=>x.u)).size,604);
assert.equal(current.provider,"SSPX_GLOBAL_COMPLETION_20261009");
assert.equal(current.records.length,7);
assert.equal(current.records.filter(x=>x.ps==="CURRENT_PUBLIC_MASS").length,2);
assert.equal(current.records.filter(x=>x.ps==="CONDITIONAL_MASS").length,5);
assert.deepEqual(current.review_summary.country_totals,{GT:1,CO:2,AR:1,PY:1,BR:1,GB:1});
const addresses=new Set(old.map(x=>x.cc+"|"+x.a.toLowerCase().replace(/[^a-z0-9]/g,"")));
const ids=new Set(old.map(x=>x.u)),sourceSlugs=new Set();
for(const row of current.records){
 assert.equal(row.cc.length,2);
 assert.equal(row.source_checked_on,"2026-10-09");
 assert.equal(row.review_flag,"DIRECT_OFFICIAL_SUNDAY_AND_PHYSICAL_ADDRESS");
 assert.ok(/^https:\/\//.test(row.su));
 assert.ok(row.a.length>=35);
 assert.ok(/\bsunday\b/i.test(row.sr));
 assert.ok(!ids.has(row.u));ids.add(row.u);
 assert.ok(!sourceSlugs.has(row.official_map_source_place_id));sourceSlugs.add(row.official_map_source_place_id);
 const key=row.cc+"|"+row.a.toLowerCase().replace(/[^a-z0-9]/g,"");
 assert.ok(!addresses.has(key),"physical site address duplicate: "+row.u);addresses.add(key);
}
assert.equal(geo.schema,"AO_DIRECTORY_RESEARCH_GEO_OVERLAY_V1");
assert.equal(geo.provider,current.provider);
assert.equal(geo.records.length,7);
assert.equal(new Set(geo.records.map(x=>x.venue_id)).size,7);
assert.equal(new Set(geo.records.map(x=>x.geo.source_ref)).size,7);
for(const record of geo.records){
 const g=record.geo;
 assert.equal(g.geocoding_source,"OFFICIAL_SOURCE");
 assert.ok(sourceSlugs.has(g.source_ref.replace("SSPX:MAP:","")));
 assert.ok(g.source_url.endsWith("/"+g.source_ref.replace("SSPX:MAP:","")));
 assert.ok(["address","locality"].includes(g.precision));
 assert.ok(["OFFICIAL_PLACE_ID_CITY_LEVEL_DIRECTIONS_POINT","OFFICIAL_PLACE_ID_PHYSICAL_ADDRESS_DIRECTIONS_POINT"].includes(g.matched_on));
 assert.ok(isMapPublishableGeo(g,g.matched_country_code));
}
assert.equal(geo.records.filter(x=>x.geo.precision==="locality").length,2);
assert.equal(geo.records.filter(x=>x.geo.precision==="address").length,5);
for(const slug of ["mision-san-pio-x","capela-nossa-senhora-fatima"]){
 assert.equal(geo.records.find(x=>x.geo.source_ref==="SSPX:MAP:"+slug)?.geo.precision,"locality");
}
const expanded=expandResearchProviderSnapshot(current,{geoRecords:geo.records});
assert.equal(expanded.venues.length,7);
assert.ok(expanded.venues.every(v=>v.capabilities.sunday_mass===true));
assert.ok(expanded.venues.every(v=>v.geo.lat!==null&&v.geo.lng!==null));
assert.ok(expanded.venues.every(v=>auditVenue(v).length===0));
assert.ok(expanded.schedules.every(s=>auditSchedule(s).length===0));
assert.ok(expanded.ministries.every(x=>x.community_id==="SSPX"&&x.liturgical_usage.books==="1962"));
assert.equal(publishableDirectoryRecords(expanded.venues.map((venue,i)=>({
 venue,ministries:[{...expanded.ministries[i],schedules:[expanded.schedules[i]]}]
}))).length,7);
assert.equal(reviews.cases.length,71);
assert.deepEqual(reviews.disposition_counts,{RETAIN_PENDING_FIRST_PARTY_EVIDENCE:44,EXISTING_PHYSICAL_SITE_ALIAS:17,ADDRESS_CONFLICT_HOLD:3,NEW_VERIFIED_MASS_SITE:7});
assert.equal(new Set(reviews.cases.map(x=>x.official_place_id)).size,71);
assert.deepEqual(new Set(reviews.cases.map(x=>x.official_place_id)),new Set(v4.cases.filter(x=>x.status==="PENDING_PLACE_DETAIL_ADJUDICATION").map(x=>x.source_place_id)));
assert.ok(reviews.cases.filter(x=>x.decision==="EXISTING_PHYSICAL_SITE_ALIAS").every(x=>old.some(y=>y.u===x.registered_venue_id)));
assert.deepEqual(reviews.cases.filter(x=>x.decision==="NEW_VERIFIED_MASS_SITE").map(x=>x.new_venue_id).sort(),current.records.map(x=>x.u).sort());
assert.deepEqual(reviews.cases.filter(x=>x.decision==="ADDRESS_CONFLICT_HOLD").map(x=>x.official_place_id).sort(),["capela-do-sagrado-coracao","mision-de-la-fraternidad-s-pio-x","oratorio-stella-maris"]);
assert.ok(reviews.cases.filter(x=>x.decision==="RETAIN_PENDING_FIRST_PARTY_EVIDENCE").every(x=>x.reason.length>10));
assert.equal(v5.cases.length,210);
assert.equal(new Set(v5.cases.map(x=>x.source_place_id)).size,210);
assert.deepEqual(v5.disposition_counts,{PENDING_PLACE_DETAIL_ADJUDICATION:44,EXISTING_PHYSICAL_ALIAS:95,NEW_VERIFIED_MASS_VENUE:35,ADDRESS_CONFLICT_HOLD:6,EXISTING_OFFICIAL_CRM_LINK:30});
assert.equal(v5.fully_adjudicated,160);
assert.equal(v5.pending_total,50);
assert.equal(v5.pending_first_party_place_detail,44);
assert.equal(v5.pending_address_conflict,6);
assert.equal(v5.current_sspx_mass_evidenced_records,611);
assert.equal(v5.current_all_mass_evidenced_records,1209);
assert.equal(v5.current_all_source_records,1446);
assert.equal(v5.cases.reduce((n,x)=>n+x.new_mass_record_count,0),35);
assert.ok(v5.cases.filter(x=>x.status==="ADDRESS_CONFLICT_HOLD").every(x=>x.discrepancy));
console.log("SSPX world final-71 review: PASS — 7 new official geolocated Mass sites; 17 physical aliases; 3 additional address disputes; 44 unresolved; worldwide 160/210 settled and 611 SSPX Mass rows");
