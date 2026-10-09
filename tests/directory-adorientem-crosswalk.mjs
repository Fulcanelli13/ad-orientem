import assert from "node:assert/strict";
import {crosswalkThirdPartyDirectory} from "../tools/directory/lib/crosswalk-adorientem-church.mjs";
const existing=[{venue:{venue_id:"a",name:{official:"St Peter"},address:{country_code:"FR",city:"Paris",formatted:"12 Rue A, Paris"}},ministries:[{community_id:"FSSP"}]}];
const incoming=[
 {id:"1",name:"St Peter",country_code:"FR",community:"FSSP",city:"Paris",address:"12 Rue A, Paris",url:"https://adorientem.church/location/1"},
 {id:"2",name:"St Paul",country_code:"GB",community:"SSPX",city:"London",url:"https://adorientem.church/location/2",source_url:"https://example.org/chapel"},
 {id:"3",name:"St Paul",country_code:"GB",community:"SSPX",city:"London",url:"https://adorientem.church/location/3"},
 {id:"4",name:"Unsourced",country_code:"GB",community:"OTHER"},
];
const r=crosswalkThirdPartyDirectory(incoming,existing,{observedAt:"2026-10-09"});
assert.deepEqual(r.statistics,{input:4,matched:1,needs_review:1,rejected:1,duplicates:1,published:0});
assert.equal(r.matched[0].matched_venue_id,"a");
assert.equal(r.needsReview[0].classification,"POTENTIAL_MISSING_VENUE");
assert.equal(r.needsReview[0].attribution.includes("adorientem.church"),true);
assert.equal(r.needsReview[0].source_url,"https://example.org/chapel");
assert.equal(r.needsReview[0].schedules,null);
console.log("Attributed third-party crosswalk: PASS; candidates staged without auto-publishing");
