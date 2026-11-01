// Main-based CL27 bridge: the existing research taxonomy is not publication
// evidence. Only source-qualified physical-site coordinates are user-filterable.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,
  tlmSiteEvidence,tlmSiteEvidenceCounts,tlmCountryCounts
} from "../src/find/preliminary-directory-r49.js";
import {projectCL2PhysicalDirectory,CL2_PHYSICAL_SITE_COUNT} from "../src/find/cl2-physical-directory.js";
import {PUBLIC_CL27_AXES,publicCL27FacetCounts,publicCL27Value,validPublicCL27Selection} from "../src/find/cl27-public-facets.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const load=path=>JSON.parse(readFileSync(path,"utf8"));
const taxonomy=load("data/directory/tlm-user-classification-taxonomy.v1.json");
assert.equal(taxonomy.schema,"AO_TLM_USER_CLASSIFICATION_TAXONOMY_V1");
assert.equal(taxonomy.public_approvals,0,"Unapproved CL27 research is never a public liturgical assertion");
assert.deepEqual(new Set(taxonomy.dimensions.map(x=>x.key)),new Set([
  "institute_or_community","ecclesial_position","una_cum","canonical_status",
  "liturgical_use","missal_edition","rubrical_basis","organizer_role",
  "venue_owner_type","celebrant_relationship","mass_type","schedule_and_location"
]));
assert.deepEqual(taxonomy.dimensions.find(x=>x.key==="una_cum").subject,
  ["MINISTRY","CELEBRATION"]);

const r49=projectPreliminaryR49(load("data/directory/preliminary-map-r49.v1.json"));
const extra=projectPublishedProvisionalMassSites(r49,
  load("data/directory/published-provisional-mass-sites-20261026.v1.json"));
const full=projectCL2PhysicalDirectory(extra,
  load("data/directory/generated/cl2-physical-site-index.v1.json"));
assert.equal(full.length,CL2_PHYSICAL_SITE_COUNT+3);
const counts=tlmSiteEvidenceCounts(full);
assert.equal(counts.ALL,full.length);
assert.equal(counts.ALL,counts.REVIEWED_PIN+counts.SOURCE_PIN+counts.ADDRESS_ONLY);
assert.ok(counts.REVIEWED_PIN>0&&counts.SOURCE_PIN>0&&counts.ADDRESS_ONLY>0,
  "No physical-site evidence cohort should be lost");
assert.equal(counts.ADDRESS_ONLY,full.filter(x=>!x.map_publishable).length);
for(const key of ["ALL","REVIEWED_PIN","SOURCE_PIN","ADDRESS_ONLY"]){
  const subset=filterPreliminaryR49(full,{siteEvidence:key});
  assert.equal(subset.length,counts[key],key);
  if(key!=="ALL")assert.ok(subset.every(x=>tlmSiteEvidence(x)===key),key);
}
const countryCounts=tlmCountryCounts(full);
assert.equal(Object.values(countryCounts).reduce((n,v)=>n+v,0),full.length,"All CL2 physical sites retain country source codes");
for(const cc of ["US","FR"]){
 const subset=filterPreliminaryR49(full,{countryCodes:[cc]});
 assert.equal(subset.length,countryCounts[cc]);
 assert.ok(subset.every(item=>item.country_code===cc));
}
assert.equal(filterPreliminaryR49(full,{countryCodes:["FR","US"]}).length,countryCounts.FR+countryCounts.US);
assert.ok(filterPreliminaryR49(full,{countryCodes:["FR"],affiliations:["FSSP"],siteEvidence:"REVIEWED_PIN"})
 .every(item=>item.country_code==="FR"&&item.community_id==="FSSP"&&tlmSiteEvidence(item)==="REVIEWED_PIN"));
assert.equal(filterPreliminaryR49([{...full[0],country_code:null,subtitle:"France"}],{countryCodes:["FR"]}).length,0);
// The new country facet must compose with CL27 source-approved celebration evidence.
const claims=load("data/directory/cl27-approved-celebration-evidence-20261102.v1.json");
const {attachPublishedCelebrationEvidence}=await import("../src/find/tlm-celebration-evidence.js");
const published=attachPublishedCelebrationEvidence(full,claims);
// CL27 public browse: all twelve axes are visible but unapproved taxonomy
// values cannot become source-backed claims. Both published programme witnesses
// concern selected celebrations, never a whole church, celebrant or institute.
assert.deepEqual(new Set(PUBLIC_CL27_AXES.map(a=>a.key)),new Set(taxonomy.dimensions.map(x=>x.key)));
const cl27Counts=publicCL27FacetCounts(published);
assert.equal(cl27Counts.missal_edition["1962"],2);
assert.equal(cl27Counts.missal_edition.UNKNOWN,2580);
assert.equal(cl27Counts.liturgical_use.ROMAN,2);
for(const axis of PUBLIC_CL27_AXES.filter(x=>!["institute_or_community","liturgical_use","missal_edition"].includes(x.key))){
 assert.equal(cl27Counts[axis.key].UNKNOWN,2582,axis.key);
}
assert.equal(filterPreliminaryR49(published,{cl27Facets:{missal_edition:"1962"}}).length,2);
assert.equal(filterPreliminaryR49(published,{cl27Facets:{missal_edition:"UNKNOWN"}}).length,2580);
assert.equal(filterPreliminaryR49(published,{cl27Facets:{liturgical_use:"ROMAN",missal_edition:"1962"},countryCodes:["US"]}).length,2);
assert.equal(filterPreliminaryR49(published,{cl27Facets:{liturgical_use:"UNKNOWN",missal_edition:"1962"}}).length,0);
assert.equal(filterPreliminaryR49(published,{cl27Facets:{una_cum:"UNKNOWN",missal_edition:"1962"}}).length,2);
assert.equal(filterPreliminaryR49(published,{cl27Facets:{una_cum:"YES"}}).length,0);
assert.equal(filterPreliminaryR49(published,{cl27Facets:{invalid_claim:"UNKNOWN"}}).length,0);
assert.equal(filterPreliminaryR49(published,{cl27Facets:{missal_edition:"PRE_1955"}}).length,0);
assert.equal(publicCL27Value({...published[0],unaCum:"NO",canonical_status:"REGULAR"},"una_cum"),"UNKNOWN");
assert.ok(validPublicCL27Selection("missal_edition","1962"));
assert.ok(!validPublicCL27Selection("missal_edition","PRE_1955"));
for(const lang of ["en","fr"]){
 const markup=renderExploreToString(buildExploreViewModel({
  language:lang,lens:"tlm",view:"list",items:published.slice(0,2),
  filters:{directoryGroup:"ALL",affiliations:[],countryCodes:[],cl27Facets:{missal_edition:"1962"}},
  tlmCl27Counts:cl27Counts,tlmAvailableCommunities:["DIOCESAN"]
 }));
 assert.equal((markup.match(/data-cl27-axis="/g)||[]).length,12);
 assert.match(markup,/data-find-cl27-axis="missal_edition"/);
 assert.match(markup,/data-find-cl27-value="1962"/);
 assert.match(markup,/data-find-cl27-axis="una_cum"/);
 assert.match(markup,lang==="fr"?/Non établi/:/Not established/);
}
assert.equal(filterPreliminaryR49(published,{celebrationEvidence:"SOURCE_1962",countryCodes:["US"]}).length,2);
assert.equal(filterPreliminaryR49(published,{celebrationEvidence:"SOURCE_1962",countryCodes:["FR"]}).length,0);
const byInstitute=filterPreliminaryR49(full,{affiliations:["FSSP"],siteEvidence:"REVIEWED_PIN"});
assert.ok(byInstitute.every(x=>x.community_id==="FSSP"&&tlmSiteEvidence(x)==="REVIEWED_PIN"));
assert.equal(filterPreliminaryR49(full,{siteEvidence:"INVALID"}).length,full.length,
  "Unknown filter values fail back to all, never reclassify venues");
// Neither an institute label nor a third-party directory grouping establishes
// the celebrant, a particular Mass's books, Una Cum or canonical status.
const claimant={...full[0],community_id:"SSPX",preliminary_group:"SSPX",
  unaCum:"NO",missal:"1962",canonical_status:"REGULAR",massType:"SOLEMN"};
assert.equal(tlmSiteEvidence(claimant),tlmSiteEvidence(full[0]));
assert.equal(filterPreliminaryR49([claimant],{siteEvidence:tlmSiteEvidence(full[0])}).length,1);

const presentation=readFileSync("src/find/explore-presentation.js","utf8");
const runtime=readFileSync("src/find/browser-entry.js","utf8");
assert.match(presentation,/function tlmCountryFilters/);
assert.match(presentation,/data-find-tlm-country/);
assert.match(presentation,/function tlmEvidenceFilters/);
assert.match(presentation,/data-find-filter/);
assert.match(presentation,/No published site-wide Una Cum, missal, canonical-status or celebrant claims/);
assert.match(runtime,/countryCodes:\[\]/);
assert.match(runtime,/tlmCountryCounts\(preliminary\?\?\[\]\)/);
assert.match(runtime,/siteEvidence:"ALL"/);
assert.match(runtime,/tlmSiteEvidenceCounts\(preliminary\?\?\[\]\)/);
console.log("PASS CL27 main source-qualified filters: "+counts.ALL+
 " sites, "+counts.REVIEWED_PIN+" source-reviewed site pins, "+
 counts.SOURCE_PIN+" provisional pins, "+counts.ADDRESS_ONLY+
 " address-only; 12 research classifications remain unapproved.");
