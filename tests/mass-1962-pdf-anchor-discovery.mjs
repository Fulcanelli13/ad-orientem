import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const p="data/geography/research/mass-1962-full-pdf-ocr-100-source-candidates-20261011.v1.json";
const d=JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
assert.equal(d.schema,"MASS_1962_FULL_PDF_OCR_100_SOURCE_ANCHOR_CANDIDATES_V1");
assert.equal(d.stats.sourcePaths,100);
assert.equal(new Set(d.anchors.map(x=>x.sourcePath)).size,100);
assert.ok(d.stats.pdfPages>=900);
assert.equal(d.stats.anchorSections,d.anchors.length);
assert.equal(d.stats.sectionCandidates+d.stats.shortAnchors+d.stats.noExactOcrMatch,d.anchors.length);
assert.equal(d.stats.uniquePageCandidates+d.stats.ambiguousPageCandidates,d.stats.sectionCandidates);
assert.equal(d.stats.editionCertified,0);
assert.equal(d.stats.publicationApproved,0);
assert.equal(d.publicationStatus,"RESEARCH_ONLY");
assert.ok(/^[0-9a-f]{64}$/.test(d.sourcePdfSHA256));
assert.ok(d.anchors.every(x=>!x.publishable&&!x.editionCertified&&!x.bibleVerseCertified));
for(const a of d.anchors) {
 assert.equal(a.candidateCount>=a.pageCandidates.length,true);
 assert.ok(a.pageCandidates.length<=15);
 assert.ok(a.pageCandidates.every(n=>Number.isInteger(n)&&n>=1&&n<=d.stats.pdfPages));
 if(a.candidateCount===0)assert.deepEqual(a.pageCandidates,[]);
}
console.log("PASS OCR page-candidate triage: "+d.stats.sourcePaths+" source files, "+d.stats.anchorSections+" short Latin anchor sections, 0 edition certifications");
