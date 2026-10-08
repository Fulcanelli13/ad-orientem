import assert from "node:assert/strict";
import {parseOfficialMapJson,assertOfficialMapPage,eligibleMapPlaces,
  matchOfficialMapPlaces} from "../tools/directory/acquire-sspx-official-map-geo.mjs";
import {isMapPublishableGeo} from "../src/find/geo-provenance.js";
const raw={total:942,limit:1000,offset:0,items:[
  {crmId:"OPE-001",slug:"chapelle-st-pie-x",url:"/en/places/chapelle-st-pie-x",
   name:"Saint Pius X Chapel",kind:"chapel",relationship:"fsspx",city:"Lyon",
   countryCode:"FR",lat:45.763,lng:4.836,sundayMass:true},
  {crmId:"OPE-002",slug:"ecole-saint-joseph",url:"/en/places/ecole-saint-joseph",
   name:"Saint Joseph School",kind:"school",relationship:"fsspx",city:"Lyon",
   countryCode:"FR",lat:45.76,lng:4.8,sundayMass:true},
  {crmId:"OPE-003",slug:"friend",url:"/en/places/friend",
   name:"Friend Chapel",kind:"chapel",relationship:"friend",city:"Paris",
   countryCode:"FR",lat:48.8,lng:2.3,sundayMass:true},
  {crmId:"OPE-004",slug:"weekday",url:"/en/places/weekday",
   name:"Weekday Chapel",kind:"chapel",relationship:"fsspx",city:"Nice",
   countryCode:"FR",lat:43.7,lng:7.2,sundayMass:false},
  {crmId:"OPE-005",slug:"no-geo",url:"/en/places/no-geo",
   name:"No Coordinates Chapel",kind:"chapel",relationship:"fsspx",city:"Paris",
   countryCode:"FR",lat:null,lng:null,sundayMass:true},
]};
assert.equal(parseOfficialMapJson(JSON.stringify(raw)).items.length,5);
assert.equal(parseOfficialMapJson("Header\n"+JSON.stringify(raw)).total,942);
assertOfficialMapPage(raw,{offset:0});
assert.throws(()=>assertOfficialMapPage({...raw,offset:50},{offset:0}),/offset drift/);
assert.throws(()=>assertOfficialMapPage({...raw,total:10},{offset:0}),/count/);
assert.equal(eligibleMapPlaces(raw.items).length,1);
const one={provider:"SSPX_TEST",filename:"test.v1.json",records:[
  {u:"test-lyon",cc:"FR",l:"Lyon",n:"Saint Pius X Chapel",ps:"CURRENT_PUBLIC_MASS"},
  {u:"test-school",cc:"FR",l:"Lyon",n:"Saint Joseph School",ps:"CURRENT_PUBLIC_MASS"},
]};
let match=matchOfficialMapPlaces([one],raw.items);
assert.equal(match.matched.length,1);
assert.equal(match.unmatched.length,0);
assert.equal(match.holds.length,1);
assert.equal(match.matched[0].geo.precision,"locality");
assert.equal(match.matched[0].geo.source_ref,"SSPX:OPE-001");
assert.equal(isMapPublishableGeo(match.matched[0].geo,"FR"),true);
assert.equal(isMapPublishableGeo(match.matched[0].geo,"GB"),true,
  "Source country must be verified through matched venue context");
assert.equal(match.matched[0].country_code,"FR");
const two={provider:"SSPX_OTHER",filename:"other.v1.json",records:[
  {u:"duplicate-source-row",cc:"FR",l:"Lyon",n:"Saint Pius X Chapel",ps:"CURRENT_PUBLIC_MASS"},
]};
match=matchOfficialMapPlaces([one,two],raw.items);
assert.equal(match.matched.length,0);
assert.ok(match.holds.some(h=>h.reason==="OFFICIAL_CRM_MATCHES_MULTIPLE_RESEARCH_VENUES"));
console.log("SSPX official CRM geolocation matcher: PASS — name/country/site gate, duplicate CRM hold");