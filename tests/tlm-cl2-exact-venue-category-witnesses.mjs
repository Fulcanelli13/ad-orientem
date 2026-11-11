import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCL2SiteCategoryMatrix,attachCL2SiteCategories}
 from "../src/find/tlm-site-category-associations.js";
import {validateCL2ExactVenueCategoryWitnesses,attachCL2ExactVenueCategoryWitnesses}
 from "../src/find/tlm-exact-venue-categories.js";
import {attachInstitutionalMinistryLiturgy}
 from "../src/find/tlm-institutional-rite-missal.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const index=read("data/directory/generated/cl2-physical-site-index.v1.json");
const matrix=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const witness=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");
const institute=read("data/directory/cl27-institutional-ministry-liturgy-20261110.v1.json");
validateCL2SiteCategoryMatrix(index,matrix);
const exact=validateCL2ExactVenueCategoryWitnesses(index,witness);
assert.equal(exact.size,91);
assert.deepEqual(witness.summary.by_category,{
 DIOCESAN_OR_PARISH_CONTEXT:64,RELIGIOUS_HOUSE:16,MIXED_OR_HOST_RELATIONSHIP:10,
 PRIESTLY_SOCIETY_OR_CLERGY:1,
});
const original=index.records.map(r=>({
 kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",physical_group_id:r[0],
 source_ids:r[1],item_id:"tlm:cl2:"+r[0],
}));
const institutional=attachInstitutionalMinistryLiturgy(original,institute);
const categories=attachCL2SiteCategories(institutional,index,matrix);
const improved=attachCL2ExactVenueCategoryWitnesses(categories,index,witness);
assert.equal(improved.length,2580);
assert.equal(improved.filter(r=>r.site_category?.classification_basis==="EXACT_FIRST_PARTY_VENUE_WITNESS").length,91);
assert.equal(improved.filter(r=>r.site_category?.category==="UNRESOLVED").length,254);
assert.equal(improved.filter(r=>r.site_category?.category==="DIRECTORY_GROUP_ONLY").length,74);
assert.equal(improved.filter(r=>["UNRESOLVED","DIRECTORY_GROUP_ONLY"].includes(r.site_category?.category)).length,328);
assert.equal(improved.filter(r=>r.site_category?.category==="DIOCESAN_OR_PARISH_CONTEXT").length,697);
assert.equal(improved.filter(r=>r.site_category?.category==="RELIGIOUS_HOUSE").length,113);
assert.equal(improved.filter(r=>r.site_category?.category==="MIXED_OR_HOST_RELATIONSHIP").length,24);
assert.equal(improved.filter(r=>r.site_category?.category==="PRIESTLY_SOCIETY_OR_CLERGY").length,1393);
assert.equal(improved.filter(r=>r.institutional_liturgy).length,1335);
for(let i=0;i<improved.length;i++){
 const before=categories[i],after=improved[i],proof=exact.get(after.physical_group_id);
 assert.equal(after.physical_group_id,before.physical_group_id);
 assert.equal(after.institutional_liturgy,before.institutional_liturgy);
 assert.deepEqual(after.source_ids,before.source_ids);
 assert.equal(after.item_id,before.item_id);
 assert.equal(after.site_category?.source_scope,"CL2_SOURCE_REPORTED_NOT_VENUE_OWNERSHIP");
 if(proof){
  assert.equal(after.site_category.category,proof.category);
  assert.equal(after.site_category.visual_lane,proof.visual_lane);
  assert.equal(after.site_category.original_category,"UNRESOLVED");
  assert.equal(after.site_category.evidence_url,proof.identity_evidence_url);
  assert.equal(after.site_category.verification_scope,"VENUE_CONTEXT_ONLY_NOT_MINISTRY_OR_LITURGY");
  assert.ok(!("missal_edition" in after.site_category));
  assert.ok(!("una_cum" in after.site_category));
  assert.ok(!("canonical_status" in after.site_category));
 }else assert.equal(after,before,"Witness overlay must preserve unrelated sites exactly");
}
const byId=id=>improved.find(x=>x.physical_group_id===id);
assert.equal(byId("RG-50E89F98157D").site_category.category,"RELIGIOUS_HOUSE");
assert.equal(byId("RG-F0533B246844").site_category.category,"MIXED_OR_HOST_RELATIONSHIP");
assert.equal(byId("RG-F3940D915079").site_category.category,"DIOCESAN_OR_PARISH_CONTEXT");
assert.equal(byId("RG-01F176BB1074").site_category.category,"DIOCESAN_OR_PARISH_CONTEXT");
assert.equal(byId("RG-6504A98F8FAF").site_category.category,"PRIESTLY_SOCIETY_OR_CLERGY");
assert.equal(byId("RG-6504A98F8FAF").site_category.related_ministry_hint,"ICKSP");
assert.equal(byId("RG-293E1CE7BC2A").site_category.category,"DIOCESAN_OR_PARISH_CONTEXT");
assert.equal(byId("RG-B120BF4FF522").site_category.related_ministry_hint,"ROSMINIANS");
assert.equal(byId("RG-3923AED1F35D").site_category.category,"MIXED_OR_HOST_RELATIONSHIP");
const tampered=structuredClone(witness);
tampered.records[0].exact_name="Different church";
assert.throws(()=>validateCL2ExactVenueCategoryWitnesses(index,tampered),/Unsafe site-category witness/);
const wrongCategory=structuredClone(witness);
wrongCategory.records[0].category="PRIESTLY_SOCIETY_OR_CLERGY";
assert.throws(()=>validateCL2ExactVenueCategoryWitnesses(index,wrongCategory),/Unsafe site-category witness/);
const wrongLink=structuredClone(witness);
wrongLink.records[0].identity_evidence_url="https://www.latinmassdir.org/";
assert.throws(()=>validateCL2ExactVenueCategoryWitnesses(index,wrongLink),/Unsafe site-category witness/);
const noCategory=categories.map(x=>({...x}));
noCategory[noCategory.findIndex(x=>x.physical_group_id==="RG-0117370AD6BF")].site_category=undefined;
assert.throws(()=>attachCL2ExactVenueCategoryWitnesses(noCategory,index,witness),/Venue witness/);
console.log("PASS CL2 91 first-party venue categories: 2580 sites intact, 328 held, 1335 exact CL27 ministry joins unchanged");
