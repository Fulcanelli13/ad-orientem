import assert from "node:assert/strict";
import fs from "node:fs";
import {applyIndicativeOtherCommunities} from "../src/find/sspx-indicative-geo.js";
import {isMapPublishableGeo} from "../src/find/geo-provenance.js";
import {directoryMapFeatures} from "../src/find/map-runtime.js";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords} from "../src/find/data-service.js";

const read=path=>JSON.parse(fs.readFileSync(path,"utf8"));
function fixture(id,community,cc,city,geo=null){
 return {venue:{venue_id:id,name:{official:id},address:{city,country_code:cc},
  geo:geo??{lat:null,lng:null,precision:"unknown",geocoding_source:null},
  contact:{website:["https://example.org/"+id],schedule_url:["https://example.org/"+id]}},
  ministries:[{community_id:community,schedules:[{service_type:"MASS"}]}],
  sources:[{url:"https://example.org/"+id}]};
}
const fixed={lat:48.8566,lng:2.3522,precision:"locality",geocoding_source:"OFFICIAL_SOURCE",
 source_ref:"SOURCE:PARIS",source_url:"https://example.org/paris",matched_country_code:"FR"};
const rows=[
 fixture("fssp-paris","FSSP","FR","Paris",fixed),
 fixture("icksp-paris","ICKSP","FR","Paris"),
 fixture("fssp-lyon","FSSP","FR","Lyon"),
 fixture("icksp-unresolved","ICKSP","ZZ","Unknown"),
 fixture("sspx-untouched","SSPX","FR","Paris"),
];
const output=applyIndicativeOtherCommunities(rows);
assert.strictEqual(output.records[0],rows[0],"Existing sourced locations are immutable");
assert.strictEqual(output.records[4],rows[4],"SSPX must remain owned by SSPX enrichment");
assert.equal(output.records[1].venue.geo.precision,"locality");
assert.equal(output.records[2].venue.geo.precision,"country");
for(const i of [1,2]){
 const geo=output.records[i].venue.geo;
 assert.equal(geo.indicative_only,true);
 assert.equal(geo.routing_eligible,false);
 assert.ok(isMapPublishableGeo(geo,"FR"));
}
assert.equal(output.records[3].venue.geo.lat,null,"Never invent a marker when no grounded country anchor exists");
assert.equal(output.summary.eligible,4);
assert.equal(output.summary.already_mapped,1);
assert.equal(output.summary.locality_added,1);
assert.equal(output.summary.country_added,1);
assert.equal(output.summary.unresolved,1);
assert.equal(directoryMapFeatures(output.records).length,3);

// Validate the existing ICKSP worldwide federated feed rather than a few manually selected examples.
const snapshot=read("data/directory/generated/v19/icksp-federated.v1.json");
const overlay=read("data/directory/generated/v19/icksp-federated.geo.v1.json");
const expanded=expandResearchProviderSnapshot(snapshot,{geoRecords:overlay.records});
const joined=publishableDirectoryRecords(joinDirectoryRecords(expanded));
const mass=joined.filter(x=>x.ministries.some(m=>m.community_id==="ICKSP"&&m.schedules.some(s=>s.service_type==="MASS")));
assert.ok(mass.length>=100,"ICKSP federated Mass corpus unexpectedly contracted");
const before=new Map(mass.map(x=>[x.venue.venue_id,x.venue.geo]));
const result=applyIndicativeOtherCommunities([...rows,...mass]);
const after=result.records.filter(x=>mass.some(y=>y.venue.venue_id===x.venue.venue_id));
assert.equal(after.length,mass.length,"No community records may be manufactured or dropped");
assert.equal(new Set(after.map(x=>x.venue.venue_id)).size,mass.length,"No duplicates");
for(const record of after){
 const original=before.get(record.venue.venue_id);
 if(isMapPublishableGeo(original,record.venue.address.country_code)){
  assert.strictEqual(record.venue.geo,original,"Source coordinates must be preserved");
 }else if(record.venue.geo?.indicative_only){
  assert.equal(record.venue.geo.routing_eligible,false);
  assert.ok(record.venue.geo.source_ref);
 }
 assert.ok(record.venue.contact.website.length,"Preserve canonical official link");
}
console.log("FSSP/ICKSP bulk indicative regression: PASS; existing official pins preserved; coarse points non-routing; no fictitious venue creation; ICKSP federated records checked:",mass.length);

const fsspMinistries=read("data/directory/generated/fssp/ministries.v1.json").records;
const fsspSources=read("data/directory/generated/fssp/sources.v1.json").records;
assert.ok(fsspMinistries.length>=300,"FSSP canonical ministry corpus unexpectedly contracted");
assert.ok(fsspSources.length>=300,"FSSP source evidence unexpectedly contracted");
const fsspSourceIds=new Set(fsspSources.map(s=>s.source_id));
for(const m of fsspMinistries){
 assert.equal(m.community_id,"FSSP","FSSP provider must not silently mix community ownership");
 assert.ok(m.source_ids?.some(id=>fsspSourceIds.has(id)),"Every FSSP ministry requires linked source evidence");
}
console.log("FSSP ministry/source inventory audit: PASS; records:",fsspMinistries.length,"sources:",fsspSources.length);
