import assert from "node:assert/strict";
import fs from "node:fs";
import {expandResearchProviderSnapshot,publishableDirectoryRecords} from "../src/find/data-service.js";
import {auditVenue,auditSchedule} from "../src/find/contracts.js";
import {auditDirectoryGeo,isMapPublishableGeo} from "../src/find/geo-provenance.js";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const root="data/directory/generated/v19/";
const names=["sspx-oct26-poland","sspx-four-district-bulk","sspx-france-first-party","sspx-official-route-oct26-20261009"];
const snapshots=names.map(n=>({name:n,doc:read(root+n+".v1.json"),geo:read(root+n+".geo.v1.json")}));
const review=read("data/directory/research/sspx-official-directions-geo-batch-20261009.v1.json");
const v5=read("data/directory/research/sspx-worldwide-210-case-disposition-20261009.v5.json");
const v6=read("data/directory/research/sspx-worldwide-210-case-disposition-20261009.v6.json");
assert.equal(review.schema,"AO_DIRECTORY_SSPX_20261009_OFFICIAL_DIRECTIONS_23_GEO_AUDIT_V1");
assert.equal(review.cases.length,23);
assert.equal(review.added_existing_sspx_mass_site_coordinates,21);
assert.equal(review.added_new_venue_coordinates,2);
assert.equal(review.total_sspx_map_coordinates,373);
assert.equal(review.not_yet_geolocated,240);
assert.deepEqual(review.precision_counts,{address:22,locality:1});
const ids=new Set(),refs=new Set(),newRows=[];
const seen=new Map();
for(const {name,doc,geo} of snapshots){
 assert.equal(geo.schema,"AO_DIRECTORY_RESEARCH_GEO_OVERLAY_V1");
 assert.equal(doc.provider,geo.provider);
 const providers=expandResearchProviderSnapshot(doc,{geoRecords:geo.records});
 const byId=new Map(providers.venues.map(v=>[v.venue_id,v]));
 for(const item of geo.records){
  if(!item.geo.source_ref.startsWith("SSPX:MAP:")||!review.cases.some(x=>x.venue_id===item.venue_id))continue;
  const v=byId.get(item.venue_id);
  assert.ok(v,"Unresolved registered SSPX provider venue ID: "+name);
  assert.ok(!ids.has(item.venue_id),"Duplicate physical SSPX venue point");
  assert.ok(!refs.has(item.geo.source_ref),"Duplicate first-party source-place slug");
  ids.add(item.venue_id);refs.add(item.geo.source_ref);
  assert.equal(item.geo.geocoding_source,"OFFICIAL_SOURCE");
  assert.equal(item.geo.source_observed_at,"2026-10-09");
  assert.equal(item.geo.precision,review.cases.find(x=>x.venue_id===item.venue_id)?.precision);
  assert.equal(item.geo.source_url,"https://map.fsspx.org/de/places/"+item.geo.source_ref.slice("SSPX:MAP:".length));
  assert.ok(isMapPublishableGeo(item.geo,v.address.country_code));
  assert.deepEqual(auditDirectoryGeo(item.geo,{countryCode:v.address.country_code}),[]);
  assert.equal(v.geo.lat,item.geo.lat);
  assert.equal(v.geo.lng,item.geo.lng);
  newRows.push({name,entry:item,venue:v});
 }
}
assert.equal(newRows.length,23);
assert.equal(newRows.filter(x=>x.entry.geo.precision==="address").length,22);
assert.equal(newRows.filter(x=>x.entry.geo.precision==="locality").length,1);
assert.equal(newRows.filter(x=>x.name==="sspx-oct26-poland").length,11);
assert.equal(newRows.filter(x=>x.name==="sspx-four-district-bulk").length,9);
assert.equal(newRows.filter(x=>x.name==="sspx-france-first-party").length,1);
assert.equal(newRows.filter(x=>x.name==="sspx-official-route-oct26-20261009").length,2);
const armidale=newRows.find(x=>x.entry.geo.source_ref==="SSPX:MAP:armidale");
assert.equal(armidale.entry.geo.precision,"locality","Armidale map provides a town point, not Hughes House coordinate");
const newcomer=snapshots.find(x=>x.name==="sspx-official-route-oct26-20261009");
assert.equal(newcomer.doc.provider,"SSPX_OFFICIAL_ROUTE_OCT26_20261009");
assert.equal(newcomer.doc.records.length,2);
assert.equal(newcomer.doc.records.filter(x=>x.ps==="CONDITIONAL_MASS").length,0);
const expanded=expandResearchProviderSnapshot(newcomer.doc,{geoRecords:newcomer.geo.records});
assert.equal(expanded.venues.length,2);
assert.ok(expanded.venues.every(x=>x.capabilities.sunday_mass&&x.geo.precision==="address"));
assert.ok(expanded.venues.every(v=>auditVenue(v).length===0));
assert.ok(expanded.schedules.every(s=>auditSchedule(s).length===0));
assert.ok(expanded.ministries.every(x=>x.community_id==="SSPX"&&x.liturgical_usage.books==="1962"));
assert.equal(publishableDirectoryRecords(expanded.venues.map((venue,i)=>({
 venue,ministries:[{...expanded.ministries[i],schedules:[expanded.schedules[i]]}]
}))).length,2);
assert.equal(v5.pending_total,50);
assert.equal(v6.cases.length,210);
assert.deepEqual(v6.disposition_counts,{
 PENDING_PLACE_DETAIL_ADJUDICATION:41,
 EXISTING_PHYSICAL_ALIAS:95,
 NEW_VERIFIED_MASS_VENUE:38,
 ADDRESS_CONFLICT_HOLD:6,
 EXISTING_OFFICIAL_CRM_LINK:30
});
assert.equal(v6.fully_adjudicated,163);
assert.equal(v6.pending_total,47);
assert.equal(v6.current_sspx_mass_evidenced_records,614);
assert.equal(v6.current_all_mass_evidenced_records,1212);
assert.equal(v6.current_all_source_records,1449);
assert.equal(v6.official_sspx_map_pins_after_overlay,373);
assert.equal(v6.sspx_source_records_still_without_verified_coordinates,241);
assert.deepEqual(new Set(v6.cases.filter(c=>c.status==="NEW_VERIFIED_MASS_VENUE"&&v5.cases.some(old=>old.source_place_id===c.source_place_id&&old.status==="PENDING_PLACE_DETAIL_ADJUDICATION")).map(c=>c.source_place_id)),
 new Set(["rosenkranz-kapelle","chapelle-notre-dame-de-lourdes","chapelle-notre-dame-du-rosaire"]));
assert.equal(v6.cases.reduce((n,x)=>n+x.new_mass_record_count,0),38);
console.log("SSPX source-first coordinates: PASS — 23 unique official route points (22 address, 1 locality), 21 existing pinned, 2 Mass sites added; 373 total points, 163/210 source cases resolved");
