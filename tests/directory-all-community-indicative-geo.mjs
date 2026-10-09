import assert from "node:assert/strict";
import fs from "node:fs";
import {fileURLToPath} from "node:url";
import {applyIndicativeOtherCommunityLocations} from "../src/find/community-indicative-geo.js";
import {loadDirectoryDataset} from "../src/find/data-service.js";
import {directoryMapFeatures} from "../src/find/map-runtime.js";
import {directoryGeoLabel,isMapPublishableGeo,isApproximateDirectoryGeo} from "../src/find/geo-provenance.js";
import {buildFindViewModel,renderFindToString} from "../src/find/presentation.js";
const read=path=>JSON.parse(fs.readFileSync(path,"utf8"));
const countries=read("data/directory/generated/indicative-country-references.v1.json");
const community="https://fssp.com/our-lady";
function fixture(id,cc,city,{lat=null,lng=null,precision="unknown",geocoding_source=null}={}){
 return {venue:{venue_id:id,name:{official:"Catholic Chapel "+id},address:{city,country_code:cc,
   formatted:(city||"Somewhere")+", "+cc},geo:{lat,lng,precision,geocoding_source},
   contact:{website:[community],schedule_url:[community]}},ministries:[{community_id:"FSSP",schedules:[]}],
   sources:[{url:community}]};
}
const p={lat:48.8566,lng:2.3522,precision:"address",geocoding_source:"OFFICIAL_SOURCE",
 source_ref:"FSSP:TEST",source_url:community,matched_country_code:"FR"};
const row=fixture("paris","FR","Paris",p);
const others=[
 row,fixture("other-paris","FR","Paris"),fixture("lyon","FR","Lyon"),
 fixture("mauritius","MU","Rose-Hill"),fixture("gb","GB-NIR","Belfast"),
 fixture("unclear","UA/RU","Eastern Mission"),
];
const output=applyIndicativeOtherCommunityLocations(others,{countryReferences:countries.countries});
assert.equal(output.summary.other_total,6);
assert.equal(output.summary.already_mapped,1);
assert.strictEqual(output.records[0],row,"Existing address pin must not be moved");
assert.equal(output.records[1].venue.geo.precision,"locality");
assert.equal(output.records[1].venue.geo.routing_eligible,false);
assert.equal(output.records[2].venue.geo.precision,"country");
assert.equal(output.records[3].venue.geo.precision,"country");
assert.deepEqual([output.records[3].venue.geo.lat,output.records[3].venue.geo.lng],[-20.25,57.5],
 "Mauritius must not inherit an ocean midpoint from all remote islands");
assert.equal(output.records[4].venue.geo.precision,"country");
assert.equal(output.records[5].venue.geo.lat,null,"Ambiguous dual-country locations must not be guessed");
assert.equal(output.summary.unresolved,1);
assert.ok(output.records.slice(1,5).every(r=>r.venue.geo.indicative_only&&r.venue.geo.routing_eligible===false));
assert.ok(output.records.slice(1,5).every(r=>isMapPublishableGeo(r.venue.geo,r.venue.address.country_code)));
assert.equal(directoryGeoLabel(output.records[3].venue.geo,{language:"fr"}),"Position indicative · pays uniquement");
assert.ok(isApproximateDirectoryGeo(output.records[4].venue.geo));
const html=renderFindToString(buildFindViewModel({records:[output.records[3]],selectedId:"mauritius"}));
assert.match(html,/Open official Mass/);
assert.match(html,/The pin is indicative only/);
assert.doesNotMatch(html,/google.com\/maps/);
const anchors=[
 fixture("a","FR","Paris",p),
 fixture("b","FR","Lyon",{lat:45.764,lng:4.8357,precision:"address",geocoding_source:"OSM_NOMINATIM"}),
 fixture("c","FR","Marseille",{lat:43.2965,lng:5.3698,precision:"street",geocoding_source:"OFFICIAL_SOURCE"}),
 fixture("d","FR",null),
];
anchors[1].venue.geo={...anchors[1].venue.geo,source_ref:"osm:node:1",source_url:"https://openstreetmap.org",attribution:"© OpenStreetMap contributors",matched_country_code:"FR",match_score:0.8};
anchors[2].venue.geo={...anchors[2].venue.geo,source_ref:"FSSP:MARSEILLE",source_url:community,matched_country_code:"FR"};
anchors[3].venue.address.formatted="Rue Something, 75002 Paris, France";
const inferred=applyIndicativeOtherCommunityLocations(anchors,{countryReferences:countries.countries});
assert.equal(inferred.records[3].venue.geo.precision,"locality",
 "Unambiguous established city in a source-formatted address should be reused");
assert.equal(inferred.records[3].venue.geo.lat,48.8566);
const fileFetch=async(url)=>{
 const u=new URL(url);
 if(u.protocol==="file:"){
  try{
   const json=read(fileURLToPath(u));
   return {ok:true,json:async()=>json};
  }catch{return {ok:false,status:404,json:async()=>({})}}
 }
 if(u.hostname==="map.fsspx.org")return {ok:true,json:async()=>({total:0,items:[]})};
 return {ok:false,status:404,json:async()=>({})};
};
const full=await loadDirectoryDataset({fetchImpl:fileFetch});
const every=full.records;
const other=every.filter(r=>!r.ministries?.some(m=>m.community_id==="SSPX"));
const sspx=every.filter(r=>r.ministries?.some(m=>m.community_id==="SSPX"));
const mappedOther=other.filter(r=>isMapPublishableGeo(r.venue.geo,r.venue.address.country_code));
const mappedSspx=sspx.filter(r=>isMapPublishableGeo(r.venue.geo,r.venue.address.country_code));
assert.equal(sspx.length,613);
assert.equal(mappedSspx.length,613);
assert.ok(other.length>=800,"Expected complete FSSP, ICKSP, IBP and smaller institute registry");
assert.ok(mappedOther.length/other.length>=0.98,
  "At least 98% of non-SSPX Mass source records should be discoverable on indicative map");
assert.equal(full.indicativeGeoSummary.otherCommunities.other_total,other.length);
assert.equal(full.indicativeGeoSummary.otherCommunities.unresolved,other.length-mappedOther.length);
assert.ok(other.every(r=>r.venue.contact.website.length>0||r.sources.some(s=>s.url)));
assert.ok(other.filter(r=>r.venue.geo.indicative_only).every(r=>r.venue.geo.routing_eligible===false));
assert.equal(new Set(every.map(r=>r.venue.venue_id)).size,every.length,
 "Indicative mapping must not create duplicate physical venue IDs");
assert.equal(directoryMapFeatures(every).length,mappedSspx.length+mappedOther.length);
for(const [name,count] of [["FSSP",404],["ICKSP",27],["IBP",34]]){
 const pre=read("data/directory/generated/"+name.toLowerCase()+"/venues.v1.json").records;
 assert.equal(pre.length,count);
 const publicIds=new Set(every.map(r=>r.venue.venue_id));
 const rawOriginal=pre.filter(v=>v.geo?.lat!==null&&v.geo?.lat!==undefined);
 for(const v of rawOriginal){
  const projected=every.find(r=>r.venue.venue_id===v.venue_id);
  if(!projected)continue; // status/contract publication gates can exclude non-Mass records
  assert.equal(projected.venue.geo.lat,v.geo.lat,"Do not change original institute coordinates");
  assert.equal(projected.venue.geo.lng,v.geo.lng);
 }
 assert.ok(publicIds.size>count);
}
console.log("All institutes indicative geographic coverage: PASS — "+mappedOther.length+"/"+other.length+
 " non-SSPX mapped; "+mappedSspx.length+" SSPX; "+every.length+" total unique directory records; "+
 full.indicativeGeoSummary.otherCommunities.locality_added+" locality, "+
 full.indicativeGeoSummary.otherCommunities.region_added+" region, "+
 full.indicativeGeoSummary.otherCommunities.country_added+" country-only additional indicators; "+
 full.indicativeGeoSummary.otherCommunities.unresolved+" genuine unplaced");
