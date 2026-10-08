import fs from "node:fs";
import assert from "node:assert/strict";
import {expandResearchProviderSnapshot} from "../src/find/data-service.js";
import {auditDirectoryGeo,isMapPublishableGeo} from "../src/find/geo-provenance.js";
const load=x=>JSON.parse(fs.readFileSync("data/directory/generated/v19/"+x,"utf8"));
const expected=new Map([
 ["sspx-district-seed",8],
 ["sspx-france-first-party",85],
 ["sspx-france-second-pass",27],
 ["sspx-four-district-bulk",46],
 ["sspx-oct26-europe",24],
 ["sspx-oct26-americas",22],
 ["sspx-oct26-poland",10],
 ["sspx-asia-central-americas",24],
 ["sspx-north-america-20261008",90],
]);
let sum=0;
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
   assert.equal(venue.geo.precision,"locality",
     "Unverified building-specific coordinates must not be advertised");
   assert.equal(venue.geo.geocoding_source,"OFFICIAL_SOURCE");
   assert.ok(venue.geo.source_ref.startsWith("SSPX:OPE-"));
   assert.ok(venue.geo.source_url.startsWith("https://map.fsspx.org/"));
   assert.ok(!refs.has(venue.geo.source_ref),"A source CRM was assigned to two physical venues");
   assert.ok(!venueIds.has(venue.venue_id),"Venue was mapped in more than one overlay");
   refs.add(venue.geo.source_ref);venueIds.add(venue.venue_id);
 }
 assert.equal(mapped,count,"Overlay row was lost before Find projection");
 sum+=count;
}
assert.equal(sum,336);
const mismatched={lat:46,lng:7,precision:"locality",geocoding_source:"OFFICIAL_SOURCE",
 source_ref:"SSPX:OPE-1234",source_url:"https://map.fsspx.org/en/places/example",
 matched_country_code:"CH"};
assert.ok(auditDirectoryGeo(mismatched,{countryCode:"US"}).some(x=>x.code==="GEO_COUNTRY_MISMATCH"));
assert.equal(isMapPublishableGeo(mismatched,"US"),false);
assert.equal(isMapPublishableGeo(mismatched,"CH"),true);
console.log("SSPX official map geolocation overlays: PASS — "+
 sum+" new locality-precision pins, "+refs.size+" unique official CRM objects");
