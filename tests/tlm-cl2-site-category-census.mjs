import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateCL2SiteCategoryMatrix,attachCL2SiteCategories}
 from "../src/find/tlm-site-category-associations.js";
import {attachInstitutionalMinistryLiturgy}
 from "../src/find/tlm-institutional-rite-missal.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const idx=read("data/directory/generated/cl2-physical-site-index.v1.json");
const census=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const ministry=read("data/directory/cl27-institutional-ministry-liturgy-20261110.v1.json");
const classifications=validateCL2SiteCategoryMatrix(idx,census);
assert.equal(classifications.size,140);
assert.equal(census.summary.site_total,2580);
assert.equal(census.summary.exact_source_ministry_sites,1335);
assert.equal(census.summary.unresolved_or_directory_group_only,419);
assert.deepEqual(census.summary.by_category,{
 PRIESTLY_SOCIETY_OR_CLERGY:1392,
 UNRESOLVED:345,
 DIOCESAN_OR_PARISH_CONTEXT:633,
 DIRECTORY_GROUP_ONLY:74,
 LAY_ASSOCIATION_OR_LOCAL_GROUP:25,
 RELIGIOUS_HOUSE:97,
 MIXED_OR_HOST_RELATIONSHIP:14,
});
const original=idx.records.map(([physical_group_id,source_ids])=>({
 item_id:"tlm:cl2:"+physical_group_id,physical_group_id,source_ids,
 kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",
}));
const inherited=attachInstitutionalMinistryLiturgy(original,ministry);
const withCategories=attachCL2SiteCategories(inherited,idx,census);
assert.equal(withCategories.length,2580);
assert.equal(withCategories.filter(x=>x.site_category).length,2580);
assert.equal(withCategories.filter(x=>x.site_category.ministry_evidence==="EXACT_SOURCE_MINISTRY").length,1335);
assert.equal(withCategories.filter(x=>x.site_category.category==="UNRESOLVED").length,345);
assert.equal(withCategories.filter(x=>x.site_category.category==="DIRECTORY_GROUP_ONLY").length,74);
assert.equal(withCategories.filter(x=>x.site_category.visual_lane==="DIOCESAN_PHOTO").length,633);
for(const [i,row] of idx.records.entries()){
 const originalItem=inherited[i],item=withCategories[i],category=item.site_category;
 assert.equal(item.physical_group_id,row[0]);
 assert.equal(category.source_label,row[5]||null);
 assert.equal(category.source_scope,"CL2_SOURCE_REPORTED_NOT_VENUE_OWNERSHIP");
 assert.equal(item.institutional_liturgy,originalItem.institutional_liturgy);
 assert.equal(item.kind,originalItem.kind);
 assert.deepEqual(item.source_ids,originalItem.source_ids);
 assert.ok(category.classification_basis);
 assert.ok(!("missal_edition" in category)&&!("una_cum" in category));
}
const findLabel=label=>withCategories[idx.records.findIndex(x=>x[5]===label)].site_category;
assert.equal(findLabel("Diocesan").visual_lane,"DIOCESAN_PHOTO");
assert.equal(findLabel("FSSP").category,"PRIESTLY_SOCIETY_OR_CLERGY");
assert.equal(findLabel("UNVERIFIED_OPERATOR_LMS_DISCOVERY").category,"UNRESOLVED");
assert.equal(findLabel("CMRI DIRECTORY (affiliation of celebrant not inferred)").category,"DIRECTORY_GROUP_ONLY");
assert.equal(findLabel("Philippines — diocesan / religious LMD").category,"MIXED_OR_HOST_RELATIONSHIP");
const other={item_id:"tlm:published-provisional:example",kind:"TLM_VENUE",source_id:"published-only"};
assert.equal(attachCL2SiteCategories([...inherited,other],idx,census).at(-1),other);
const noNorm=attachCL2SiteCategories(original,idx,census);
assert.equal(noNorm.filter(x=>x.site_category.ministry_evidence==="NOT_VERIFIED_BY_THIS_CENSUS").length,2580);
const corrupt=structuredClone(census);
corrupt.rows[0][1]="FAKE_OWNER";
assert.throws(()=>validateCL2SiteCategoryMatrix(idx,corrupt),/category/);
const missing=structuredClone(census);
missing.rows.pop();
assert.throws(()=>validateCL2SiteCategoryMatrix(idx,missing),/Unmapped/);
const wrongSite=original.map(x=>({...x}));
wrongSite[0].source_ids=["invented"];
assert.throws(()=>attachCL2SiteCategories(wrongSite,idx,census),/source identity mismatch/);
console.log("PASS CL2 category matrix: 2580/2580 assigned, 2161 source-reported, 419 explicit holds, 1335 exact source-ministry identities");
