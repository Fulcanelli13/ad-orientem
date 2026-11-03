import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {FIRST12_1961_FACSIMILES}
 from "../src/mass/reader-proper-first12-1961-facsimile-locators.js";
const dir=new URL("../.tmp/schola-1961-first12-original-facsimiles/",import.meta.url);
const x=JSON.parse(readFileSync(new URL("1961-original-first12-source-image-manifest.json",dir),"utf8"));
assert.equal(x.schema,"ao-schola-1961-first12-original-printed-source-image-capture-v1");
assert.equal(x.counts.priorityScores,12);
assert.equal(x.counts.distinctPrintedPages,14);
assert.equal(x.counts.continuationScoreCount,4);
assert.equal(x.counts.completeSourceSpanScores,x.scores.filter(s=>
 s.originalScanStatus==="COMPLETE_ORIGINAL_PRINT_SPAN_CAPTURED_NOT_MUSICALLY_VERIFIED").length);
assert.equal(x.counts.musicallyCollatedScores,0);
assert.equal(x.counts.approvedPublicScores,0);
assert.equal(x.counts.downloadedOriginalPageImages+x.counts.pageImageAccessHolds,14);
assert.equal(x.pages.length,14);
assert.equal(x.scores.length,12);
assert.equal(new Set(x.pages.map(r=>r.sourceUrl)).size,14);
assert.equal(new Set(x.scores.map(r=>r.scoreId)).size,12);
for(const s of FIRST12_1961_FACSIMILES){
 const row=x.scores.find(z=>z.scoreId===s.scoreId);
 assert.ok(row);
 assert.equal(row.original1961Page,s.folio);
 assert.deepEqual(row.originalPrintedFolios[0],s.folio);
 assert.equal(row.originalPrintedFolios.length,row.capturedOriginalPageHashes.length);
 assert.ok(row.originalPrintedFolios.length===1||row.originalPrintedFolios.length===2);
 assert.equal(row.original1961ScanUrl,s.scanned1961PageUrl);
 assert.equal(row.gregobaseSourceUrl,s.sourceUrl);
 assert.equal(row.part,s.part);
 assert.equal(row.publicScore,false);
 assert.equal(row.pitchVerified,false);
 assert.equal(row.neumesVerified,false);
 assert.equal(row.underlayVerified,false);
}
for(const page of x.pages){
 const where=new URL(page.file,dir);
 assert.match(page.file,/^graduale-romanum-1961-original-p\d+-source2-\d+\.png$/);
 if(page.status==="ORIGINAL_1961_SCAN_CAPTURED_NOT_MUSICALLY_VERIFIED"){
  assert.match(page.pngSha256,/^[a-f0-9]{64}$/);
  assert.ok(existsSync(where));
  const binary=readFileSync(where);
  assert.equal(createHash("sha256").update(binary).digest("hex"),page.pngSha256);
  assert.equal(binary.length,page.bytes);
  assert.ok(page.width>=350&&page.height>=350);
 }else{
  assert.equal(page.status,"SOURCE_IMAGE_UNAVAILABLE_REVIEW_HOLD");
  assert.equal(page.pngSha256,null);
  assert.equal(existsSync(where),false);
  assert.ok(page.error);
 }
 assert.equal(page.printedStaffPitchesCompared,false);
 assert.equal(page.printedNeumeShapesCompared,false);
 assert.equal(page.rhythmicSignParityCompared,false);
 assert.equal(page.syllableUnderlayCertified,false);
}
assert.equal(x.publication.publicScores,0);
const expectedSpans={
 "GREGOBASE-475":["392","393"],"GREGOBASE-782":["362","363"],
 "GREGOBASE-265":["79","80"],"GREGOBASE-1271":["383","384"]
};
assert.equal(x.scores.filter(s=>s.originalPrintedFolios.length===2).length,4);
for(const [id,pages] of Object.entries(expectedSpans)){
 assert.deepEqual(x.scores.find(s=>s.scoreId===id)?.originalPrintedFolios,pages);
}

assert.equal(x.publication.independentPrintedComparisonStillRequired,true);
console.log("PASS first12 1961 original image evidence: "+x.counts.downloadedOriginalPageImages+
 " distinct folios downloaded, "+x.counts.pageImageAccessHolds+
 " source access holds, every hash/score/page verified, zero musical approval");
