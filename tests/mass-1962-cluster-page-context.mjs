import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../data/geography/research/",import.meta.url);
const read=n=>JSON.parse(readFileSync(new URL(n+".v1.json",root),"utf8"));
const d=read("mass-1962-44-cluster-printed-page-context-20261012");
const cluster=read("mass-1962-printed-page-cluster-review-queue-20261011");
const expected=new Set(cluster.rows.filter(x=>x.pageClusterCandidates.length).map(x=>x.sourcePath));
assert.equal(d.schema,"MASS_1962_44_CLUSTER_PRINTED_PAGE_CONTEXT_V1");
assert.equal(d.rows.length,44);
assert.equal(d.stats.clusteredSourcePaths,44);
assert.deepEqual(new Set(d.rows.map(x=>x.sourcePath)),expected);
assert.equal(d.stats.stillUnadjudicatedPaths,44);
assert.equal(d.stats.publicationApproved,0);
assert.ok(d.candidatePdfPages.length>0);
assert.equal(new Set(d.candidatePdfPages).size,d.candidatePdfPages.length);
assert.ok(d.candidatePdfPages.every(x=>Number.isInteger(x)&&x>=1&&x<=1088));
assert.equal(d.stats.distinctCandidatePages,d.candidatePdfPages.length);
for(const r of d.rows){
 assert.equal(r.decision,"PENDING_PAGE_AND_CELEBRATION_ADJUDICATION");
 assert.ok(!r.publishable&&!r.bibleTextChecked&&!r.full1962EditionConfirmed);
 assert.ok(r.matchingLatinDoesNotProveFeast);
 assert.ok(r.clusters.length>=1 && r.clusters.length<=3);
 for(const c of r.clusters){
  assert.ok(c.pageDetails.length>=1);
  for(const p of c.pageDetails){
   assert.equal(p.printedPageIfStandardArabicOffset,p.pdfPage-81);
   assert.equal(p.printedHeadingVisuallyVerified,false);
   assert.ok(p.topOfPageSample.length<=320);
   assert.ok(p.bottomOfPageSample.length<=170);
   assert.ok(p.anchorMatches.every(a=>a.section && a.phrase && a.relativePosition!==null));
  }
 }
}
console.log("PASS: contextual OCR page dossier for 44 candidate files, "+d.candidatePdfPages.length+" source pages; 0 automated feast certifications");
