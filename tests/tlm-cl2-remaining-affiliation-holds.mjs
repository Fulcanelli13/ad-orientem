import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const index=read("data/directory/generated/cl2-physical-site-index.v1.json");
const matrix=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const witness=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");
const holds=read("data/directory/research/cl2-remaining-affiliation-holds-20261111.v1.json");
assert.equal(holds.schema,"AO_CL2_REMAINING_SOURCE_AFFILIATION_HOLDS_V1");
assert.equal(holds.scope,"EXACT_CL2_UNCLASSIFIED_SITES_NO_INFERRED_OPERATOR_LITURGY_OR_OWNERSHIP");
assert.equal(holds.records.length,255);
assert.equal(holds.summary.physical_sites,2580);
assert.equal(holds.summary.positively_source_categorized,2325);
assert.equal(holds.summary.first_party_witnesses,164);
assert.deepEqual(holds.summary.by_category,{UNRESOLVED:181,DIRECTORY_GROUP_ONLY:74});
const reasonCounts={
 LMS_DISCOVERY_ONLY_NOT_FIRST_PARTY_VENUE_CLASS:98,
 DIRECTORY_MEMBERSHIP_NOT_VERIFIED_OPERATOR:74,
 ASSOCIATED_COMMUNITY_NOT_PROVEN_SITE_OPERATOR:17,
 LMD_GENERIC_OR_LOCALE_ONLY_EXACT_VENUE_NOT_RECONCILED:28,
 GENERIC_SOURCE_LABEL_NO_VERIFIED_OPERATOR:33,
 MIXED_OR_UNCONFIRMED_SOURCE_RELATIONSHIP:5,
};
assert.deepEqual(holds.summary.by_reason,reasonCounts);
const bySource=new Map(matrix.rows.map(r=>[r[0],r]));
const wits=new Set(witness.records.map(r=>r.cl2_anchor));
const expected=index.records.filter(r=>!wits.has(r[0])&&
 ["UNRESOLVED","DIRECTORY_GROUP_ONLY"].includes(bySource.get(r[5])?.[1]));
assert.equal(expected.length,255);
assert.equal(wits.size,164);
const exact=new Map(expected.map(r=>[r[0],r]));
assert.deepEqual(holds.records.map(r=>r.cl2_anchor).sort(),[...exact.keys()].sort(),
 "Each hold must be represented once, not recreated by a wildcard label");
for(const item of holds.records){
 const row=exact.get(item.cl2_anchor);
 assert.ok(row);
 assert.deepEqual(item.source_ids,row[1]);
 assert.equal(item.source_name,row[2]);
 assert.equal(item.country,row[3]);
 assert.equal(item.source_location_description,row[4]);
 assert.equal(item.literal_affiliation,row[5]);
 assert.deepEqual(item.source_urls,row[6]);
 assert.equal(item.effective_category,bySource.get(row[5])[1]);
 assert.equal(item.visual_lane,"NEUTRAL");
 assert.equal(item.review_action,"REQUIRE_EXACT_FIRST_PARTY_VENUE_SOURCE_AND_ROLE_BEFORE_CATEGORY_PROMOTION");
 for(const key of ["ownership","missal_edition","community_operator"])
   assert.equal(item[key],null);
 assert.equal(wits.has(item.cl2_anchor),false,
  "A current first-party witness cannot simultaneously be a hold");
}
for(const id of ["RG-02AEBA830666","RG-832AB0C2265E"]){
 assert.ok(exact.has(id),"Historical abbey or priory must remain held pending current operator proof");
}
console.log("PASS all 255 exact CL2 hold rows: no guessed operator, photos, rite/Missal or ownership");
