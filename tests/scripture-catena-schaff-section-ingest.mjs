import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const hash=s=>createHash("sha256").update(s,"utf8").digest("hex");
const root="dist/schaff-sectioned-research/",ocrRoot="dist/schaff-original-ocr/";
const manifest=read("data/scripture/catena/research/full-corpus-pass-20261021/schaff-ocr-work-scope.v1.json");
const summary=read(root+"summary.v1.json");
assert.equal(summary.schema,"ao.catena.schaff-source-unit-study-summary.v1");
assert.equal(summary.printedVolumes,2);
assert.equal(summary.sourceUnits,94);
assert.equal(summary.questionWindows,4131);
assert.equal(summary.authorQuestionsIndependentlyConfirmed,0);
assert.equal(summary.uniqueNonCatenaAnswersConfirmed,0);
assert.equal(summary.publicationApprovals,0);
const expected={"NPNF1-06":{units:4,questions:481},"NPNF1-10":{units:90,questions:3650}};
const allIds=new Set();
for(const volume of manifest.volumes){
 const vol=volume.editionId,original=readFileSync(ocrRoot+vol+".raw-ocr.txt","utf8");
 const candidates=read(ocrRoot+vol+".question-candidates.json");
 const unitData=read(root+vol+".source-units-and-questions.v1.json");
 const lines=original.replace(/\r/g,"").split("\n");
 assert.equal(hash(original),volume.ocrSHA256);
 assert.equal(unitData.sourceVolumeSHA256,volume.ocrSHA256);
 assert.equal(unitData.unitsFound,expected[vol].units);
 assert.equal(unitData.questionWindowsAssigned,expected[vol].questions);
 assert.equal(unitData.questionWindowsBeforeFirstUnit,0);
 assert.equal(unitData.units.length,expected[vol].units);
 assert.equal(unitData.questions.length,expected[vol].questions);
 assert.equal(unitData.printedEditionOCRIsUnverified,true);
 assert.equal(unitData.biblicalQuotationAndFootnoteDisambiguationPending,true);
 assert.equal(unitData.sourceAttributionAndGenuineNoveltyPending,true);
 assert.equal(unitData.humanApprovals,0);
 assert.equal(unitData.publicationApprovals,0);
 if(vol==="NPNF1-06"){
  assert.equal(unitData.provisionalChapterHeadingCount,123);
  assert.equal(unitData.provisionalChapterHeadingEvidence.length,123);
  const reversed=unitData.provisionalChapterHeadingEvidence.filter(h=>
   h.chapterNumberDecreasedOrRepeatedInLinearOCR);
  assert.ok(reversed.length>=2,"Two-column historical OCR must not be trusted as strictly chapter ordered");
  for(const h of unitData.provisionalChapterHeadingEvidence){
   assert.ok(unitData.units.some(u=>u.id===h.printedWorkUnitId&&
    u.startLine<=h.originalLineNumber&&u.endLine>=h.originalLineNumber));
   assert.equal(hash(h.originalHeadingOCR),h.originalHeadingSHA256);
   assert.equal(h.originalHeadingOCR,lines[h.originalLineNumber-1]);
   assert.equal(h.sectionBoundaryNotEstablished,true);
   assert.equal(h.completenessUnverified,true);
  }
 }else{
  assert.equal(unitData.provisionalChapterHeadingCount,0);
  assert.deepEqual(unitData.provisionalChapterHeadingEvidence,[]);
 }
 const sourceIds=new Set(candidates.windows.map(w=>w.id));
 const unitIds=new Set(),headingFixes=[];
 for(let i=0;i<unitData.units.length;i++){
  const u=unitData.units[i];
  assert.ok(u.startLine<=u.endLine);
  assert.equal(u.unitOrdinal,i+1);
  assert.ok(!unitIds.has(u.id));unitIds.add(u.id);
  assert.equal(u.originalUnitOCRSHA256,hash(lines.slice(u.startLine-1,u.endLine).join("\n")));
  assert.equal(u.printedHeadingOCR,lines[u.startLine-1]);
  assert.equal(u.sourceAuthorSpeakerVerified,false);
  assert.equal(u.sourceOCRUnverified,true);
  if(i>0)assert.equal(u.startLine,unitData.units[i-1].endLine+1);
  if(u.headingNormalization)headingFixes.push([u.unitOrdinal,u.headingNormalization]);
  assert.equal(u.questionWindowCount,unitData.questions.filter(x=>x.workUnitId===u.id).length);
 }
 assert.equal(unitData.units.at(-1).endLine,unitData.workLineEnd);
 assert.equal(unitData.questionOriginScreeningCounts.candidate_author_rhetoric_unconfirmed+
   unitData.questionOriginScreeningCounts.needs_source_layer_disambiguation,
  unitData.questions.length);
 if(vol==="NPNF1-10"){
  assert.deepEqual(headingFixes.map(([n])=>n),[2,31,32],
   "OCR headings II, XXXI and XXXII are visually misread; retain original and normalized reading");
 }else assert.equal(headingFixes.length,0);
 for(const question of unitData.questions){
  assert.ok(!allIds.has(question.id));allIds.add(question.id);
  assert.ok(sourceIds.has(question.id));
  assert.ok(unitIds.has(question.workUnitId));
  assert.equal(question.originalQuestionLineOCR,lines[question.ocrLine-1]);
  assert.equal(question.originalQuestionLineSHA256,hash(question.originalQuestionLineOCR));
  assert.equal(question.originalOCRContextSHA256,hash(question.originalOCRContext));
  assert.equal(question.authorQuestionConfirmed,false);
  assert.equal(question.authorReplyVerified,false);
  assert.equal(question.novelBeyondCatena,false);
  assert.equal(question.publicationEligible,false);
  assert.ok(["candidate_author_rhetoric_unconfirmed","needs_source_layer_disambiguation"]
   .includes(question.originScreening));
  assert.equal(question.sourceOwnership,
   "unverified_ocr_question_may_be_author_scripture_or_editor");
  assert.ok(!Object.hasOwn(question,"fatherResponse"));
  assert.ok(!Object.hasOwn(question,"answerGeneratedByAI"));
 }
 console.log(vol+": "+unitData.units.length+" source units, "+unitData.questions.length+
  " raw question candidates, heading corrections "+headingFixes.length);
}
assert.equal(allIds.size,4131);
console.log("PASS: Schaff SHA-256-pinned unit segmentation covers 4 Augustine books and 90 Chrysostom homilies; 4131 OCR windows, 0 approved Father responses");
