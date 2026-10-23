import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const json=p=>JSON.parse(readFileSync(p,"utf8"));
const sourceDir="dist/schaff-original-ocr/";
const unitDir="dist/schaff-sectioned-research/";
const data=json("dist/schaff-context-pilot/question-source-layer-pilot.v1.json");
const summary=json("dist/schaff-context-pilot/summary.v1.json");
assert.equal(data.schema,"ao.catena.schaff-question-source-layer-pilot.v1");
assert.equal(summary.schema,"ao.catena.schaff-question-layer-summary.v1");
assert.equal(data.questionWindowCount,4131);
assert.equal(data.sourceAuthorshipCertified,0);
assert.equal(data.sourceRepliesCertified,0);
assert.equal(data.catenaNoveltyConfirmed,0);
assert.equal(data.approvals,0);
assert.equal(data.harmonyColumnInterleavingUnresolved,true);
assert.equal(data.chrysostomPrintedNotesUnresolved,true);
assert.ok(data.excerptWindowCount>=94&&data.excerptWindowCount<=220);
assert.equal(summary.contextEnvelopes,data.excerptWindowCount);
assert.equal(data.selected.length,data.excerptWindowCount);
assert.equal(data.volumes.length,2);
assert.deepEqual(data.volumes.map(x=>x.unitCount),[4,90]);
assert.deepEqual(data.volumes.map(x=>x.candidates),[481,3650]);
assert.equal(data.volumes.flatMap(x=>Object.values(x.screeningBreakdown))
 .reduce((sum,n)=>sum+n,0),4131);
assert.equal(data.volumes.flatMap(x=>x.perUnit)
 .reduce((sum,x)=>sum+x.prioritizedOriginalContextEnvelopes,0),
 data.excerptWindowCount);
for(const volume of data.volumes){
 assert.ok(volume.perUnit.every(u=>u.prioritizedOriginalContextEnvelopes>=1),
 "Must supply a source-grounded context candidate for each of 94 actual work units");
 assert.equal(volume.firstPartyTextCertified,0);
}
const ids=new Set(),unitsSeen=new Set();
for(const id of ["NPNF1-06","NPNF1-10"]){
 const source=readFileSync(sourceDir+id+".raw-ocr.txt","utf8").replace(/\r/g,"").split("\n");
 const unit=json(unitDir+id+".source-units-and-questions.v1.json");
 const candidates=new Map(unit.questions.map(q=>[q.id,q]));
 const segment=new Map(unit.units.map(u=>[u.id,u]));
 for(const candidate of data.selected.filter(r=>r.editionId===id)){
  assert.ok(!ids.has(candidate.id));ids.add(candidate.id);
  unitsSeen.add(candidate.workUnitId);
  const orig=candidates.get(candidate.id),block=segment.get(candidate.workUnitId);
  assert.ok(orig&&block,"Orphaned record");
  assert.equal(orig.originalQuestionLineOCR,candidate.originalQuestionLineOCR);
  assert.equal(orig.originalQuestionLineSHA256,candidate.originalQuestionLineSHA256);
  assert.equal(candidate.originalQuestionLineOCR,source[candidate.originalLineNumber-1]);
  assert.equal(candidate.originalQuestionLineSHA256,sha(candidate.originalQuestionLineOCR));
  const w=candidate.contextEnvelope;
  assert.ok(w.sourceLineStart>=block.startLine&&w.sourceLineEnd<=block.endLine);
  assert.ok(w.sourceLineStart<=candidate.originalLineNumber&&
   w.sourceLineEnd>=candidate.originalLineNumber);
  const originalWindow=source.slice(w.sourceLineStart-1,w.sourceLineEnd).join("\n");
  assert.equal(w.verbatimOCRText,originalWindow);
  assert.equal(w.verbatimOCRSHA256,sha(originalWindow));
  assert.equal(w.queryLineOffset,candidate.originalLineNumber-w.sourceLineStart);
  assert.equal(w.textRole,"neighboring_unverified_OCR_not_a_verified_answer");
  assert.equal(w.sourceOwnedWordsOnly,false);
  assert.equal(w.containsPotentialBibleAndEditorialText,true);
  assert.equal(candidate.columnAlignmentValidated,false);
  assert.equal(candidate.questionAndReplySpeakerSeparated,false);
  assert.equal(candidate.originalPrintedPageChecked,false);
  if(id==="NPNF1-06"){
   assert.ok(candidate.preliminaryScreening.sourceLayerRisks.includes(
    "two_column_harmony_OCR_alignment_unresolved"));
   assert.ok(candidate.preliminaryScreening.positiveCueEvidence.includes(
    "possible_scripture_interleaved_across_scan_columns"));
  }
  assert.equal(candidate.fatherAuthorshipEstablished,false);
  assert.equal(candidate.sourceOwnedReplyLocated,false);
  assert.equal(candidate.catenaNoveltyEstablished,false);
  assert.equal(candidate.publicationEligible,false);
  assert.ok(!Object.hasOwn(candidate,"fatherAnswer"));
  assert.ok(!Object.hasOwn(candidate,"generatedPatristicText"));
  assert.ok(["higher_priority_source_inspection","medium_priority_source_inspection",
   "low_priority_or_quoted_text"].includes(candidate.preliminaryScreening.screeningClass));
 }
}
assert.equal(unitsSeen.size,94);
assert.equal(ids.size,data.excerptWindowCount);
assert.equal(data.showcase.editionId,"NPNF1-10");
assert.equal(data.showcase.sourceUnitId,"schaff.npnf1-10.matthew-homily-03");
assert.equal(data.showcase.originalLineNumber,3086);
assert.match(data.showcase.originalOCRText,/But  what  kind  of  marvel  \?/);
assert.match(data.showcase.originalOCRText,/That  the  Virgin  should  be  preserved/);
assert.equal(sha(data.showcase.originalOCRText),data.showcase.originalOCRSHA256);
assert.equal(data.showcase.published,false);
assert.equal(summary.certifiedFatherQuestions,0);
assert.equal(summary.certifiedSourceReplies,0);
assert.equal(summary.confirmedCatenaNovelty,0);
assert.equal(summary.publicationApprovals,0);
console.log("PASS Schaff question layer: "+data.questionWindowCount+
 " original OCR candidates classified, "+data.excerptWindowCount+
 " SHA-pinned context envelopes covering all 94 units; zero authorial answers certified");
