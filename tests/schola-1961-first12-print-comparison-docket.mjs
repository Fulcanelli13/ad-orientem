import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {FIRST12_1961_FACSIMILES}
 from "../src/mass/reader-proper-first12-1961-facsimile-locators.js";
const root=new URL("../.tmp/schola-1961-first12-original-facsimiles/",import.meta.url);
const docket=JSON.parse(readFileSync(new URL(
 "1961-first12-printed-music-comparison-docket.json",root),"utf8"));
const capture=JSON.parse(readFileSync(new URL(
 "1961-original-first12-source-image-manifest.json",root),"utf8"));
assert.equal(docket.schema,"ao-schola-1961-first12-independent-printed-music-docket-v1");
assert.equal(docket.counts.scores,12);
assert.equal(docket.counts.sourcePages,14);
assert.equal(docket.counts.originalGabcNoteGroups,
 docket.scores.reduce((sum,x)=>sum+x.gabcSourceNoteGroupCount,0));
assert.ok(docket.counts.originalGabcNoteGroups>0);
assert.equal(docket.counts.independentlyVerifiedPrintedNotes,0);
assert.equal(docket.counts.musicallyCertifiedScores,0);
assert.equal(docket.counts.editoriallyApprovedScores,0);
assert.equal(docket.counts.publishedScores,0);
assert.equal(docket.publication.automaticScoreApproval,false);
const originalById=new Map(FIRST12_1961_FACSIMILES.map(x=>[x.scoreId,x]));
const scanned=new Map(capture.pages.map(x=>[x.sourceUrl,x]));
assert.equal(new Set(docket.scores.map(x=>x.scoreId)).size,12);
assert.deepEqual(docket.scores.map(x=>x.scoreId),
 FIRST12_1961_FACSIMILES.map(x=>x.scoreId));
for(const score of docket.scores){
 const source=originalById.get(score.scoreId);
 assert.ok(source);
 assert.equal(score.original1961PrintedFolio,source.folio);
 assert.equal(score.sourceEdition,"Graduale Romanum Solesmes 1961");
 assert.equal(score.originalSourceUrl,source.sourceUrl);
 assert.match(score.originalGabcSha256,/^[a-f0-9]{64}$/);
 assert.equal(score.sourceSegmentation.length,score.gabcSourceNoteGroupCount);
 assert.equal(score.sourceSegmentation[0].ordinal,1);
 assert.ok(score.sourceSegmentation.every((g,i)=>g.ordinal===i+1 &&
   g.manualComparison==="NOT_YET_COMPLETED"&&g.printedPitch===null&&
   g.printedNeume===null&&g.printedRhythm===null&&g.printedUnderlay===null));
 assert.equal(score.pages.length,source.scannedFolios.length);
 for(const page of score.pages){
  const ref=scanned.get(page.original1961ScanUrl);
  assert.ok(ref);
  assert.equal(page.folio,ref.page);
  assert.equal(page.imageSha256,ref.pngSha256??null);
  assert.equal(page.printedPitchNeumeRhythmTranscribed,false);
 }
 for(const key of ["printedPitches","printedNeumes","printedRhythmicSigns",
   "printedSyllabicUnderlay","selected1962ProperUsage"])
  assert.match(score.checks[key],/^PENDING_/);
 assert.equal(score.checks.editorialDecision,"NOT_APPROVED");
 assert.equal(score.approvedForNativeReader,false);
 assert.equal(score.publicScore,false);
 assert.equal(score.verifiedMusicalNoteCount,0);
 assert.equal(score.certifiedSourceUnderlay,false);
 assert.equal(score.completeSourceImagesCaptured,
   score.pages.every(x=>Boolean(x.imageSha256)));
}
assert.equal(docket.counts.fullCapturedScoreSpans,
 docket.scores.filter(x=>x.completeSourceImagesCaptured).length);
console.log("PASS 12 original printed-source score dossiers with "+
 docket.counts.originalGabcNoteGroups+
 " archived GABC note groups, exact 14-page evidence, 0 printed-note certifications");
