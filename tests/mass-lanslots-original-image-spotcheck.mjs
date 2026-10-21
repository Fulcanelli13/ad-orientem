// Lanslots 1897 original printed page-image evidence contract.
// Run: node tests/mass-lanslots-original-image-spotcheck.mjs
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const images=load("data/research/mass-lanslots-1897-original-pdf-11-page-visual-collation.v1.json");
const historical=load("data/research/mass-lanslots-1897-doctrinal-historical-critical-review.v1.json");
const claims=load("data/research/mass-lanslots-1897-claim-differential.v1.json");
const newCitations=load("data/research/mass-lanslots-1897-fulltext-17-new-citations.v1.json");
const coverage=load("data/research/mass-lanslots-1897-chapter-coverage.v1.json");
const royal=load("data/research/mass-lanslots-1897-royal-priesthood-prepost-crosswalk.v1.json");
const workflow=readFileSync(new URL("../.github/workflows/lanslots-1897-full-ocr-census.yml",import.meta.url),"utf8");
assert.equal(images.originalPdf.pageCount,404);
assert.equal(images.originalPdf.byteCount,29387192);
assert.equal(images.originalPdf.sha256,"6650f21a95a0936ecbbfdb71e41aaa6872039322d94ed14c3f4b383578ae8c04");
assert.equal(images.inspectedPdfPageCount,11);
assert.equal(images.inspections.length,11);
assert.equal(new Set(images.inspections.map(x=>x.oneBasedPdfPageIndex)).size,11,"page images must be distinct");
for(const item of images.inspections){
  assert(Number.isInteger(item.oneBasedPdfPageIndex)&&item.oneBasedPdfPageIndex>=1&&item.oneBasedPdfPageIndex<=404);
  assert.equal(item.originalImageVisuallyInspected,true);
  assert.equal(item.frenchTheologicalApproval,false);
  assert.equal(item.formSpecific1962RubricApproval,false);
  assert.equal(item.published,false);
}
const byPdfPage=new Map(images.inspections.map(x=>[x.oneBasedPdfPageIndex,x]));
const expected=new Map([[16,"10"],[19,"13"],[150,"128"],[173,"147"],[179,"153"],[211,"181"],[245,"211"],[270,"234"],[271,"235"],[321,"279"],[322,"280"]]);
for(const [p,printed] of expected)assert.equal(byPdfPage.get(p)?.printedPageNumber,printed);
const mal=claims.claims.find(x=>x.id==="LAN-016");
assert.equal(mal.printedPageLocatorStatus,"PRINTED_PAGE_13_VISUALLY_CHECKED_PDF19");
assert.equal(mal.originalOcr.originalPageScanChecked,true);
assert.equal(mal.runtimePromotion,"BLOCKED");
const cross=historical.records.filter(x=>x.originalOcr.printedPageImageChecked===true);
assert.equal(cross.length,5,"only five critical review cases were checked against printed pages");
assert(cross.some(x=>x.id==="L1897-DISC-10"&&x.visuallyCheckedSourcePage.oneBasedPdfPage===211));
assert(cross.some(x=>x.id==="L1897-DISC-02"&&x.visuallyCheckedSourcePage.oneBasedPdfPage===270));
assert(cross.some(x=>x.id==="L1897-DISC-03"&&x.visuallyCheckedSourcePage.oneBasedPdfPage===321));
const scans=newCitations.records.filter(x=>x.pdfPageVisualCheck===true);
assert.equal(scans.length,4);
assert.equal(newCitations.records.length,17);
assert(scans.some(x=>x.normalizedScriptureRef==="2 Peter 1:4"&&x.visuallyVerifiedOriginalScan.oneBasedPdfPage===150));
assert(scans.some(x=>x.normalizedScriptureRef==="Lamentations 3:41"&&x.visuallyVerifiedOriginalScan.oneBasedPdfPage===179));
assert.equal(coverage.census.originalTextPdfPagesVisuallyChecked,11);
assert.equal(coverage.census.exhaustiveVerseCountKnown,false);
assert.equal(royal.originalOcrWitnesses.filter(x=>x.originalPrintedPageImageChecked).length,2);
assert(!/contents:\s*write/.test(workflow),"Research download workflow must remain read-only");
assert(!workflow.includes("git push origin"),"Automatic OCR repo mutation must not return");
console.log("PASS Lanslots images: exact 404-page PDF digest recorded; 11 certified original printed page samples; 17-source and 10-doctrine holds; read-only workflow.");
