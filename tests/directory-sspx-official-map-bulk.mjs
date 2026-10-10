import assert from "node:assert/strict";
import {expandOfficialSspxMassPlaces} from "../src/find/official-sspx-discovery.js";
import {loadDirectoryDataset,filterDirectoryRecords} from "../src/find/data-service.js";
import {projectDirectoryItems} from "../src/find/explore-projection.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const official=[
 {crmId:"OPE-00001",slug:"same-chapel",url:"/en/places/same-chapel",name:"St Joseph Chapel",
 kind:"chapel",relationship:"fsspx",city:"Brussels",countryCode:"BE",sundayMass:true,weekdayMass:false},
 {crmId:"OPE-00002",slug:"renamed-chapel",url:"/en/places/renamed-chapel",name:"New Name Chapel",
 kind:"chapel",relationship:"fsspx",city:"Brussels",countryCode:"BE",sundayMass:true,weekdayMass:false},
 {crmId:"OPE-00003",slug:"weekday-chapel",url:"/en/places/weekday-chapel",name:"Our Lady of the Presentation",
 kind:"chapel",relationship:"fsspx",city:"Ghent",countryCode:"BE",sundayMass:false,weekdayMass:true},
 {crmId:"OPE-00004",slug:"sunday-chapel",url:"/en/places/sunday-chapel",name:"Sacred Heart Church",
 kind:"priory",alsoKinds:["chapel"],relationship:"fsspx",city:"Antwerp",countryCode:"BE",sundayMass:true,weekdayMass:true},
 {crmId:"OPE-00005",slug:"school-only",url:"/en/places/school-only",name:"Saint Peter School",
 kind:"school",relationship:"fsspx",city:"Liege",countryCode:"BE",sundayMass:false,weekdayMass:false},
 {crmId:"OPE-00006",slug:"friendly-chapel",url:"/en/places/friendly-chapel",name:"Friendly Community",
 kind:"chapel",relationship:"friend",city:"Leuven",countryCode:"BE",sundayMass:true,weekdayMass:false},
 {crmId:"OPE-00007",slug:"../weak-id",url:"javascript:alert(1)",name:"Fake unsafe link",
 kind:"chapel",relationship:"fsspx",city:"Namur",countryCode:"BE",sundayMass:true,weekdayMass:false},
 {crmId:"OPE-00004",slug:"sunday-chapel",url:"/en/places/sunday-chapel",name:"Sacred Heart Church",
 kind:"chapel",relationship:"fsspx",city:"Antwerp",countryCode:"BE",sundayMass:true,weekdayMass:false}
];
const known={venue:{venue_id:"existing-SSPX",name:{official:"St Joseph Chapel"},
 address:{country_code:"BE",city:"Brussels"},geo:{lat:null,lng:null}},
 ministries:[{community_id:"SSPX",schedules:[]}]};
const got=expandOfficialSspxMassPlaces(official,{existingRecords:[known]});
assert.equal(got.summary.official_rows,8);
assert.equal(got.summary.new_official_listings,2);
assert.equal(got.summary.already_in_directory,1);
assert.equal(got.summary.ambiguous_same_locality,1);
assert.equal(got.summary.duplicate_source_ids,1);
assert.equal(got.held.length,1);
assert.equal(got.records.length,2);
const first=got.records.find(r=>r.venue.name.official==="Our Lady of the Presentation");
const sun=got.records.find(r=>r.venue.name.official==="Sacred Heart Church");
assert.ok(first&&sun);
assert.equal(first.venue.publication_state,"OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED");
assert.equal(first.venue.capabilities.sunday_mass,false);
assert.equal(sun.venue.capabilities.sunday_mass,true);
assert.equal(first.ministries[0].schedules.length,0,"Do not invent Mass times");
assert.equal(first.sources[0].authority,"PRIMARY");
assert.equal(first.sources[0].url,"https://map.fsspx.org/en/places/weekday-chapel");
assert.equal(filterDirectoryRecords(got.records,{day:"SUNDAY"}).length,1);
const projected=projectDirectoryItems(got.records);
assert.ok(projected.every(x=>x.status==="OFFICIAL · TIMES UNCONFIRMED"));
assert.ok(projected.every(x=>x.sections.length===0));
assert.ok(projected.every(x=>x.actions.length===1&&x.actions[0].label==="Official SSPX Mass details"));
assert.ok(projected.every(x=>!x.actions.some(y=>y.label==="Directions")));
const html=renderExploreToString(buildExploreViewModel({lens:"tlm",items:projected,selectedId:projected[0].item_id}));
assert.match(html,/OFFICIAL · TIMES UNCONFIRMED/);
assert.match(html,/SSPX officially lists Mass at this place/);
assert.match(html,/https:\/\/map\.fsspx\.org\/en\/places\/weekday-chapel/);
assert.doesNotMatch(html,/Mass \/ liturgy/);

// App loader integration: one pre-existing SSPX parish triggers the same API call
// already used for indicative mapping, then adds only genuinely distinct locations.
const snapshot={schema:"AO_DIRECTORY_RESEARCH_PROVIDER_V1",provider:"SSPX_TEST",generated_at:"2026-10-09T00:00:00Z",
 defaults:{c:"SSPX",f:"ROMAN",b:"1962",mf:"TRADITIONAL_LATIN",vs:"OFFICIAL_VERIFIED"},
 records:[{u:"old",c:"SSPX",cc:"BE",n:"St Joseph Chapel",l:"Brussels",
 su:"https://sspx.org/en/places/st-joseph",sr:"Sunday Mass"}]};
let apiCalls=0;
const fetchImpl=async input=>{
 const url=String(input);
 if(url.includes("sspx-indicative"))throw Error("Unexpected request");
 if(url.includes("/data/directory/generated/v19/test-sspx.v1.json"))
   return {ok:true,json:async()=>snapshot};
 if(url.includes("map.fsspx.org/api/v1/places")){
   apiCalls++;
   assert.match(url,/limit=1000/);
   assert.doesNotMatch(url,/sundayMass=true/,"Do not exclude weekday-only Mass locations");
   return {ok:true,json:async()=>({total:official.length,items:official})};
 }
 return {ok:false,status:404};
};
const dataset=await loadDirectoryDataset({providers:[],
 researchProviders:[{key:"test-sspx",file:"test-sspx.v1.json"}],fetchImpl});
assert.equal(apiCalls,1);
assert.equal(dataset.officialSspxDiscoverySummary.new_official_listings,2);
assert.equal(dataset.officialSspxIdentityReviewCount,1);
assert.equal(dataset.records.length,3);
assert.equal(dataset.records.filter(x=>x.venue.publication_state==="OFFICIAL_LISTED_MASS_TIMES_UNCONFIRMED").length,2);
assert.equal(dataset.records.filter(x=>x.venue.upstream.provider_id==="SSPX_MAP_API").length,2);
console.log("Official SSPX global source: PASS — Sunday and weekday Mass locations, independent identity holds, no fabricated schedules or routes");
