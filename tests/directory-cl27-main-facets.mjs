// Main-based CL27 bridge: the existing research taxonomy is not publication
// evidence. Only source-qualified physical-site coordinates are user-filterable.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
  projectPreliminaryR49,projectPublishedProvisionalMassSites,filterPreliminaryR49,
  tlmSiteEvidence,tlmSiteEvidenceCounts
} from "../src/find/preliminary-directory-r49.js";
import {projectCL2PhysicalDirectory,CL2_PHYSICAL_SITE_COUNT} from "../src/find/cl2-physical-directory.js";

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
assert.match(presentation,/function tlmEvidenceFilters/);
assert.match(presentation,/data-find-filter/);
assert.match(presentation,/No published site-wide Una Cum, missal, canonical-status or celebrant claims/);
assert.match(runtime,/siteEvidence:"ALL"/);
assert.match(runtime,/tlmSiteEvidenceCounts\(preliminary\?\?\[\]\)/);
console.log("PASS CL27 main source-qualified filters: "+counts.ALL+
 " sites, "+counts.REVIEWED_PIN+" source-reviewed site pins, "+
 counts.SOURCE_PIN+" provisional pins, "+counts.ADDRESS_ONLY+
 " address-only; 12 research classifications remain unapproved.");
