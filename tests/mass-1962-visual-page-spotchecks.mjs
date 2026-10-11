import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const base="data/geography/research/";
const read=x=>JSON.parse(readFileSync(new URL("../"+base+x+".v1.json",import.meta.url),"utf8"));
const d=read("mass-1962-cmaa-visual-10-page-source-spotchecks-20261011");
const q=read("mass-1962-edition-certification-priority-queue-20261011");
const high=new Set(q.rows.filter(x=>x.priority==="HIGH").map(x=>x.sourcePath));
assert.equal(d.schema,"MASS_1962_CMAA_VISUAL_SPOTCHECK_10_PAGES_V1");
assert.equal(d.paginationEvidence.samples.length,10);
assert.equal(d.sourceMatches.length,7);
assert.equal(new Set(d.sourceMatches.map(x=>x.sourcePath)).size,7);
assert.ok(d.sourceMatches.every(x=>high.has(x.sourcePath)));
assert.ok(d.paginationEvidence.samples.every(x=>x.pdfPage-x.printedPage===81));
assert.equal(d.paginationEvidence.observedOffsetForTheseTen,81);
assert.equal(d.stats.pdfPagesVisuallyChecked,10);
assert.equal(d.stats.additionalHighPrioritySourcePathsReviewed,7);
assert.equal(d.stats.visibleRawSourceFragmentComparisons,19);
assert.equal(d.stats.publicationApprovals,0);
assert.equal(d.frontMatterAndWholeEditionIndependentlyCertified,false);
assert.ok(d.sourceMatches.every(x=>x.printedPageVisuallyChecked&&x.latinIncipitComparedInVisibleSections));
assert.ok(d.sourceMatches.every(x=>!x.appReleaseApproved&&!x.fullFormularyCompared&&
!x.missalEditionEligibilityCertified&&!x.scriptureEditionWordsCertified));
for(const r of d.sourceMatches){
 assert.ok(r.pdfDeepLink.endsWith("#page="+r.pdfPage));
 assert.equal(r.printedPage,r.pdfPage-81);
 assert.ok(r.reviewedFragments.length>=2);
 assert.ok(r.reviewedFragments.every(v=>v.section&&v.bibleNote&&v.latin));
}
const aug=d.sourceMatches.find(x=>x.sourcePath==="Sancti/08-08");
assert.ok(aug.printedHeading.includes("Commemoratio"));
assert.ok(aug.editorialHold.includes("NOT identify"));
const lent=d.sourceMatches.find(x=>x.sourcePath==="Tempora/Quad4-3t");
assert.ok(lent.reviewedFragments.some(x=>x.section==="Tractus"));
assert.equal(d.publicationStatus,"RESEARCH_ONLY");
console.log("PASS: ten visually sampled CMAA pages, seven high-priority source matches, nineteen source fragments, commemoration guarded, no publication approval.");
