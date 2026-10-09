import assert from "node:assert/strict";
import {crosswalkThirdPartyDirectory} from "../tools/directory/lib/crosswalk-adorientem-church.mjs";
const existing=[
 {venue:{venue_id:"fr-a",name:{official:"St Peter"},address:{country_code:"FR",city:"Paris",formatted:"12 Rue A, Paris"}},ministries:[{community_id:"FSSP"}]},
 {venue:{venue_id:"us-fc",name:{official:"Annunciation Chapel"},address:{country_code:"US",city:"Fort Collins",formatted:"290 E County Road 56, Fort Collins, CO 80524"}},ministries:[{community_id:"SSPX"}]},
 {venue:{venue_id:"us-hou",name:{official:"Annunciation Catholic Church"},address:{country_code:"US",city:"Houston",formatted:"1618 Texas Avenue, Houston, TX 77003"}},ministries:[{community_id:"DIOCESAN"}]}
];
const incoming=[
 {id:"fr1",name:"St Peter",country_code:"FR",community:"FSSP",city:"Paris",address:"12 Rue A, Paris",url:"https://adorientem.church/find/fr1"},
 {id:"fort1",name:"Annunciation Chapel",country_code:"US",community:"SSPX",city:"Fort Collins",address:"290 E. County Road 56 Fort Collins, Colorado 80524",url:"https://adorientem.church/find/annunciation-chapel-fort-collins-4e352963",source_url:"https://viewer.mapme.com/entry"},
 {id:"fort2",name:"Annunciation Chapel",country_code:"US",community:"SSPX",city:"56 Fort Collins",address:"290 E County Rd 56, Fort Collins, CO 80524",url:"https://adorientem.church/find/annunciation-chapel-56-fort-collins-25016d75"},
 {id:"hou1",name:"Annunciation Catholic",country_code:"US",community:"DIOCESAN",city:"Houston",address:"1618 Texas Avenue, Houston, Texas 77003",url:"https://adorientem.church/find/annunciation-catholic-houston-f6122ff1"},
 {id:"hou2",name:"Annunciation Catholic Church",country_code:"US",community:"DIOCESAN",city:"Houston",address:"1618 Texas Ave Houston TX 77003",url:"https://adorientem.church/find/annunciation-catholic-church-houston-f4d0a45c"},
 {id:"uk1",name:"St Paul",country_code:"GB",community:"SSPX",city:"London",url:"https://adorientem.church/find/uk1",source_url:"https://example.org/current-mass"},
 {id:"future",name:"Future Mass",country_code:"PT",community:"FSSP",city:"Porto",status:"planned",url:"https://adorientem.church/find/future"},
 {id:"invalid",name:"Unsourced",country_code:"GB",community:"OTHER"}
];
const r=crosswalkThirdPartyDirectory(incoming,existing,{observedAt:"2026-10-09"});
assert.deepEqual(r.statistics,{input:8,matched:3,needs_review:2,rejected:1,duplicates:2,published:0});
assert.equal(r.matched.find(x=>x.id==="fr1").classification,"EXISTING_NAME_LOCALITY_POSSIBLE_MATCH");
assert.equal(r.matched.find(x=>x.id==="fort1").matched_venue_id,"us-fc");
assert.equal(r.matched.find(x=>x.id==="hou1").matched_venue_id,"us-hou");
assert.ok(r.duplicates.find(x=>x.id==="fort2"));
assert.ok(r.duplicates.find(x=>x.id==="hou2"));
assert.equal(r.matched.find(x=>x.id==="fort1").source_class,"THIRD_PARTY_AGGREGATOR");
assert.equal(r.needsReview.find(x=>x.id==="uk1").classification,"POTENTIAL_MISSING_VENUE");
assert.equal(r.needsReview.find(x=>x.id==="uk1").next_step,"VERIFY_ORIGINAL_MASS_EVIDENCE");
assert.equal(r.needsReview.find(x=>x.id==="future").classification,"PLANNED_NOT_ACTIVE");
assert.equal(r.needsReview.find(x=>x.id==="future").publication_eligible,false);
assert.equal(r.matched.find(x=>x.id==="fort1").attribution.includes("adorientem.church"),true);
console.log("Attributed competitor crosswalk: PASS — aliases/duplicate streets, status, provenance, zero publication");
