import assert from "node:assert/strict";
import {reconcileApprovedCandidates} from "../tools/directory/reconcile-approved-mass-candidates.mjs";
const existing=[{venue:{venue_id:"icksp-mauritius-1",name:{official:"Chapelle du Collège Saint-Joseph"},address:{country_code:"MU",city:"Curepipe",formatted:"Collège St Joseph, Curepipe"}},ministries:[{community_id:"ICKSP"}]}];
const corpus={records:[
 {source_id:"LMD:sj",name:"Chapelle du Collège Saint-Joseph (Saint Joseph College Chapel) Curepipe, Mauritius",country_code:"MU",directory_url:"https://www.latinmassdir.org/venue/sj/",has_mass_evidence:true,original_sources:["https://icrspmaurice.org/"]},
 {source_id:"LMD:unmatched",name:"Completely New Chapel",country_code:"US",directory_url:"https://www.latinmassdir.org/venue/unmatched/"},
 {source_id:"LMD:vespers",name:"Vespers-only Abbey",country_code:"FR",directory_url:"https://www.latinmassdir.org/venue/abbey/",has_mass_evidence:false}
]};
const got=await reconcileApprovedCandidates(corpus,{loadExisting:async()=>({records:existing})});
assert.equal(got.summary.third_party_source_records,3);
assert.equal(got.summary.matched_name_review,1);
assert.equal(got.summary.likely_novel_needs_source,2);
assert.equal(got.summary.has_mass_claim_and_original_link,1);
assert.equal(got.summary.requires_detail,1);
assert.equal(got.summary.no_mass_in_detail,1);
assert.equal(got.summary.published,0);
assert.equal(got.candidates[0].duplicate_state,"NAME_ONLY_CANDIDATE_MATCH");
assert.equal(got.candidates[0].candidate_matches[0].venue_id,"icksp-mauritius-1");
assert.ok(got.candidates.every(x=>x.publication_state==="RESEARCH_ONLY_NOT_MASS_VENUE"));
console.log("Approved worldwide candidate reconciliation: PASS — name-only overlap, original source hold and no publication");
