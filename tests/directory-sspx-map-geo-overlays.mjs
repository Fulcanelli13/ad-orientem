import fs from "node:fs";
import assert from "node:assert/strict";
import {expandResearchProviderSnapshot} from "../src/find/data-service.js";
import {auditDirectoryGeo,isMapPublishableGeo} from "../src/find/geo-provenance.js";
const load=x=>JSON.parse(fs.readFileSync("data/directory/generated/v19/"+x,"utf8"));
const expected=new Map([
 ["sspx-district-seed",8],
 ["sspx-france-first-party",85],
 ["sspx-france-second-pass",27],
 ["sspx-four-district-bulk",55],
 ["sspx-oct26-europe",24],
 ["sspx-oct26-americas",22],
 ["sspx-oct26-poland",21],
 ["sspx-asia-central-americas",24],
 ["sspx-north-america-20261008",90],
]);
let sum=0, oldApproved=0, newOfficialDirections=0, newAddress=0, newLocality=0;
const refs=new Set(),venueIds=new Set();
for(const [name,count] of expected){
 const snapshot=load(name+".v1.json"),overlay=load(name+".geo.v1.json");
 assert.equal(overlay.schema,"AO_DIRECTORY_RESEARCH_GEO_OVERLAY_V1");
 assert.equal(overlay.provider,snapshot.provider);
 assert.equal(overlay.records.length,count,name+" official coordinate-count drift");
 const rendered=expandResearchProviderSnapshot(snapshot,{geoRecords:overlay.records});
 assert.equal(rendered.venues.length,snapshot.records.length);
 let mapped=0;
 for(const venue of rendered.venues){
   if(venue.geo.lat===null||venue.geo.lng===null)continue;
   mapped+=1;
   assert.equal(isMapPublishableGeo(venue.geo,venue.address.country_code),true,
     "Official coordinate must meet map provenance standards: "+venue.venue_id);
   if(venue.geo.source_ref.startsWith("SSPX:OPE-")){
     oldApproved+=1;
     assert.equal(venue.geo.precision,"locality","Original CRM locality-precision pin must remain unchanged");
   }else{
     newOfficialDirections+=1;
     assert.ok(venue.geo.source_ref.startsWith("SSPX:MAP:"),"New point must reference an exact official map place");
     assert.ok(venue.geo.source_url.endsWith("/"+venue.geo.source_ref.slice("SSPX:MAP:".length)));
     assert.ok(["address","locality"].includes(venue.geo.precision));
     assert.ok(venue.geo.matched_on.startsWith("EXACT_OFFICIAL_PLACE_SLUG_"));
     if(venue.geo.precision==="address")newAddress+=1;else newLocality+=1;
   }
   assert.equal(venue.geo.geocoding_source,"OFFICIAL_SOURCE");
   assert.ok(venue.geo.source_ref.startsWith("SSPX:OPE-")||venue.geo.source_ref.startsWith("SSPX:MAP:"));
   assert.ok(venue.geo.source_url.startsWith("https://map.fsspx.org/"));
   assert.ok(!refs.has(venue.geo.source_ref),"A source CRM was assigned to two physical venues");
   assert.ok(!venueIds.has(venue.venue_id),"Venue was mapped in more than one overlay");
   refs.add(venue.geo.source_ref);venueIds.add(venue.venue_id);
 }
 assert.equal(mapped,count,"Overlay row was lost before Find projection");
 sum+=count;
}
assert.equal(sum,356);
assert.equal(oldApproved,336,"Original 336 verified CRM map geocoordinates must remain");
assert.equal(newOfficialDirections,20);
assert.equal(newAddress,19);
assert.equal(newLocality,1);
const mismatched={lat:46,lng:7,precision:"locality",geocoding_source:"OFFICIAL_SOURCE",
 source_ref:"SSPX:OPE-1234",source_url:"https://map.fsspx.org/en/places/example",
 matched_country_code:"CH"};
assert.ok(auditDirectoryGeo(mismatched,{countryCode:"US"}).some(x=>x.code==="GEO_COUNTRY_MISMATCH"));
assert.equal(isMapPublishableGeo(mismatched,"US"),false);
assert.equal(isMapPublishableGeo(mismatched,"CH"),true);
console.log("SSPX official map geolocation overlays: PASS — "+
 sum+" official-source pins (336 previous locality + 19 newly sourced address + 1 locality), "+refs.size+" unique source objects");
