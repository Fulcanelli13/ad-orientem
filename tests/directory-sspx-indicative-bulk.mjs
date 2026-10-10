import assert from "node:assert/strict";
import fs from "node:fs";
import {applyIndicativeSspxLocations,fetchOfficialSspxPlaceIndex} from "../src/find/sspx-indicative-geo.js";
import {expandResearchProviderSnapshot,joinDirectoryRecords,publishableDirectoryRecords} from "../src/find/data-service.js";
import {isMapPublishableGeo,directoryGeoLabel,isApproximateDirectoryGeo} from "../src/find/geo-provenance.js";
import {directoryMapFeatures} from "../src/find/map-runtime.js";
import {buildFindViewModel,renderFindToString} from "../src/find/presentation.js";
const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
function fixture(id,cc,city,geo=null,name="Test Chapel"){
 const venue={venue_id:id,name:{official:name},address:{city,country_code:cc,
   formatted:name+", "+city+", "+cc},geo:geo??{lat:null,lng:null,precision:"unknown",geocoding_source:null},
   contact:{website:["https://sspx.org/en/chapels/"+id],schedule_url:["https://sspx.org/en/chapels/"+id]}};
 return {venue,ministries:[{community_id:"SSPX",schedules:[]}],sources:[{url:"https://sspx.org/en/chapels/"+id}]};
}
const sourceGeo={lat:48.86,lng:2.35,precision:"locality",geocoding_source:"OFFICIAL_SOURCE",
 source_ref:"SSPX:OPE-EXAMPLE",source_url:"https://map.fsspx.org/en/places/source",
 matched_country_code:"FR"};
const demo=[
 fixture("a","FR","Paris",sourceGeo,"St Peter's Chapel"),
 fixture("b","FR","Paris",null,"Chapel in the same city"),
 fixture("c","FR","Lyon",null,"A chapel elsewhere in France"),
 fixture("d","ZZ","Newtown",null,"No verifiable national map source")
];
const initial=applyIndicativeSspxLocations(demo);
assert.equal(initial.summary.total_sspx,4);
assert.equal(initial.summary.already_mapped,1);
assert.equal(initial.summary.locality_added,1);
assert.equal(initial.summary.country_added,1);
assert.equal(initial.summary.unresolved,1);
assert.strictEqual(initial.records[0],demo[0],"Never override an existing official pin");
assert.equal(initial.records[1].venue.geo.precision,"locality");
assert.equal(initial.records[1].venue.geo.routing_eligible,false);
assert.equal(initial.records[2].venue.geo.precision,"country");
assert.equal(initial.records[2].venue.geo.indicative_scope,"country");
assert.equal(initial.records[2].venue.geo.matched_on,"INDICATIVE_COUNTRY_ONLY_NOT_VENUE_LOCATION");
assert.ok(isMapPublishableGeo(initial.records[2].venue.geo,"FR"));
assert.ok(isApproximateDirectoryGeo(initial.records[2].venue.geo));
assert.equal(directoryGeoLabel(initial.records[2].venue.geo,{language:"en"}),"Indicative · country only");
assert.equal(directoryGeoLabel(initial.records[2].venue.geo,{language:"fr"}),"Position indicative · pays uniquement");
assert.equal(directoryMapFeatures(initial.records).length,3);
assert.equal(initial.records[3].venue.geo.lat,null);
const html=renderFindToString(buildFindViewModel({records:[initial.records[2]],selectedId:"c"}));
assert.match(html,/Open official Mass \/ chapel information/);
assert.match(html,/The pin is indicative only/);
assert.doesNotMatch(html,/https:\/\/www\.google\.com\/maps\/search/);
const live=[
 {relationship:"fsspx",sundayMass:true,crmId:"OPE-TEST",slug:"lyon-chapel",countryCode:"FR",city:"Lyon",
  name:"Our Lady's Chapel",lat:45.77,lng:4.84,url:"https://map.fsspx.org/en/places/lyon-chapel"},
 {relationship:"friend",sundayMass:true,crmId:"OPE-FRIEND",countryCode:"FR",city:"Newtown",
  name:"Not an SSPX chapel",lat:46,lng:6},
 {relationship:"fsspx",sundayMass:false,crmId:"OPE-WEEK",countryCode:"FR",city:"Lyon",
  name:"Weekday-only site",lat:40,lng:1}
];
const improved=applyIndicativeSspxLocations(demo,{officialPlaces:live});
assert.equal(improved.records[2].venue.geo.precision,"locality");
assert.deepEqual([improved.records[2].venue.geo.lat,improved.records[2].venue.geo.lng],[45.77,4.84]);
assert.equal(improved.summary.official_source_places,1);
assert.equal(improved.records[0].venue.geo.source_ref,"SSPX:OPE-EXAMPLE");
const requestLog=[];
const api=await fetchOfficialSspxPlaceIndex({fetchImpl:async(url)=>{
 requestLog.push(url);return {ok:true,json:async()=>({total:2,items:live.slice(0,2)})};
}});
assert.equal(requestLog.length,1);
assert.ok(!requestLog[0].includes("sundayMass=true"),"All official Mass places must include weekday-only chapels");
assert.equal(api.length,2);
assert.deepEqual(await fetchOfficialSspxPlaceIndex({fetchImpl:async()=>{throw Error("offline")}}),[]);
const names=["sspx-district-seed","sspx-france-first-party","sspx-france-second-pass",
 "sspx-four-district-bulk","sspx-oct26-europe","sspx-oct26-americas",
 "sspx-oct26-poland","sspx-asia-central-americas","sspx-north-america-20261008",
 "sspx-priority-europe-pacific-20261009","sspx-mexico-completion-20261009",
 "sspx-oct26-followup-65","sspx-global-completion-20261009",
 "sspx-official-route-oct26-20261009"];
const all={venues:[],ministries:[],schedules:[],sources:[]};
for(const name of names){
 const snapshot=read("data/directory/generated/v19/"+name+".v1.json");
 const overlay=read("data/directory/generated/v19/"+name+".geo.v1.json");
 const doc=expandResearchProviderSnapshot(snapshot,{geoRecords:overlay.records});
 for(const k of Object.keys(all))all[k].push(...doc[k]);
}
const joined=publishableDirectoryRecords(joinDirectoryRecords(all));
const original=joined.filter(x=>x.ministries.some(m=>m.community_id==="SSPX"));
const baseline=original.filter(x=>isMapPublishableGeo(x.venue.geo,x.venue.address.country_code)).length;
assert.equal(original.length,613);
assert.equal(baseline,401);
const allIndicative=applyIndicativeSspxLocations(joined);
const newRows=allIndicative.records.filter(x=>x.ministries.some(m=>m.community_id==="SSPX"));
const mapped=newRows.filter(x=>isMapPublishableGeo(x.venue.geo,x.venue.address.country_code)).length;
assert.equal(allIndicative.summary.total_sspx,613);
assert.equal(allIndicative.summary.already_mapped,401);
assert.equal(allIndicative.summary.locality_added+allIndicative.summary.region_added+
 allIndicative.summary.country_added+allIndicative.summary.unresolved,212);
assert.equal(mapped,613-allIndicative.summary.unresolved);
assert.equal(mapped,613,"Every SSPX record must have a clearly scoped discovery indicator");
assert.equal(allIndicative.summary.unresolved,0);
assert.equal(allIndicative.summary.locality_added,4);
assert.equal(allIndicative.summary.country_added,208);
assert.ok(newRows.every(x=>x.venue.contact.website.length>0),"All venues retain official site redirection");
assert.ok(newRows.filter(x=>x.venue.geo?.indicative_only).every(x=>x.venue.geo.routing_eligible===false));
const ids=new Set(newRows.map(x=>x.venue.venue_id));
assert.equal(ids.size,613,"Geo enrichment must not add duplicate physical SSPX venues");
const missingPlaces=newRows.filter(x=>!isMapPublishableGeo(x.venue.geo,x.venue.address.country_code));
const missingCountries=Object.fromEntries([...new Set(missingPlaces.map(x=>x.venue.address.country_code))].map(cc=>
 [cc,missingPlaces.filter(x=>x.venue.address.country_code===cc).length]));
console.log("SSPX unresolved geographic countries: "+JSON.stringify(missingCountries));
console.log("SSPX indicative map bulk: PASS — offline "+mapped+"/613 mapped ("+
  allIndicative.summary.locality_added+" new locality, "+allIndicative.summary.region_added+
  " region, "+allIndicative.summary.country_added+" country, "+allIndicative.summary.unresolved+
  " source-geography holds); all official source links retained; online official feed can improve locality precision");
