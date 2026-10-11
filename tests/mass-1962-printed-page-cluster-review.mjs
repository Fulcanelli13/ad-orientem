import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root="data/geography/research/";
const read=x=>JSON.parse(readFileSync(new URL("../"+root+x+".v1.json",import.meta.url),"utf8"));
const d=read("mass-1962-printed-page-cluster-review-queue-20261011");
const source=read("mass-1962-full-pdf-ocr-100-source-candidates-20261011");
assert.equal(d.schema,"MASS_1962_PRINTED_OCR_MULTI_SECTION_CLUSTER_TRIAGE_V1");
assert.equal(d.rows.length,100);
assert.equal(new Set(d.rows.map(x=>x.sourcePath)).size,100);
assert.equal(d.stats.sourcePaths,100);
assert.equal(d.stats.pathsWithAnyOCRAnchor,source.stats.sourcePathsWithAnyCandidate);
assert.equal(d.stats.pathsWithMultiSectionPageClusters+d.stats.pathsWithoutMultiSectionClusters,100);
assert.equal(d.stats.totalTopThreeClusterCandidates,d.rows.reduce((n,x)=>n+x.pageClusterCandidates.length,0));
assert.equal(d.stats.visuallyPageChecked,0);
assert.equal(d.stats.editionCertified,0);
assert.equal(d.stats.releaseApproved,0);
assert.ok(d.rows.every(x=>x.missalEditionEligible===null&&!x.approvedForApp&&!x.calendarIdentityChecked&&!x.fullLatinCompared&&!x.biblicalEditionCompared));
assert.ok(d.rows.every(x=>x.pageClusterCandidates.length<=3));
for(const row of d.rows){
 for(const c of row.pageClusterCandidates){
  assert.ok(c.distinctSectionsCount>=2);
  assert.ok(c.uniquePageAnchorSections.length>=1);
  assert.ok(c.pdfPageStart>=1&&c.pdfPageEnd<=d.pdfPages+2);
  assert.equal(c.status,"POSSIBLE_SAME_FORMULARY_PAGE_CLUSTER_NOT_PRINTED_EDITION_CERTIFIED");
 }
}
console.log("PASS: 100 high-priority source paths reviewed for distinct multi-section page clusters; no printed-edition certification or app publication");
