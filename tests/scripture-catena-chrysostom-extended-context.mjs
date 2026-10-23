import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const j=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const file="dist/schaff-chrysostom-extended/";
const data=j(file+"expanded-historical-source-contexts.v1.json");
const summary=j(file+"summary.v1.json");
const focus=j("dist/schaff-chrysostom-focused-parallels/focused-chrysostom-source-parallels.v1.json");
const study=j("data/scripture/catena/research/full-corpus-pass-20261021/chrysostom-24-argument-research-hypotheses.v1.json");
const source=j("dist/schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json");
const original=readFileSync("dist/schaff-original-ocr/NPNF1-10.raw-ocr.txt","utf8");
const lines=original.replace(/\r/g,"").split("\n");
assert.equal(data.schema,"ao.catena.chrysostom-24-extended-text-and-scene-hypotheses.v1");
assert.equal(summary.schema,"ao.catena.chrysostom-24-expanded-primary-source-context-summary.v1");
assert.deepEqual(data.summary,summary);
assert.equal(data.sourceResearchOnly,true);
assert.equal(data.allWordsOriginalHistoricalOCR,true);
assert.equal(data.researchInterpretationsAreNotFatherDialogue,true);
assert.equal(summary.primarySourceDigest,sha(original));
assert.equal(summary.primarySourceDigest,source.sourceVolumeSHA256);
assert.equal(summary.passagesWithExtendedVerbatimContext,24);
assert.equal(summary.likelySameArgumentResearchCases,16);
assert.equal(summary.sharedWordingWithDifferentOrMixedSceneCases,6);
assert.equal(summary.insufficientPreviouslyCroppedContextCases,2);
assert.equal(summary.originalGospelScenePerPointerRegisters,6);
assert.equal(summary.perPointerScriptureSceneJudgments,18);
for(const k of ["sourcePageAndGreekCriticallyVerified","fullAnswerBoundariesCertified",
"independentlyAuthenticatedDuplicates","provenNovelAnswers","newMessengerMessages",
"publicationApprovals"])assert.equal(summary[k],0);
const ids=new Set(),originalById=new Map(focus.packets.map(p=>[p.id,p]));
const studies=new Map(study.rows.map(p=>[p.sourceId,p]));
const units=new Map(source.units.map(x=>[x.id,x]));
const normal=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g,"$1$2")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
for(const row of data.rows){
 assert.ok(!ids.has(row.id));ids.add(row.id);
 const older=originalById.get(row.id),interpretation=studies.get(row.id);
 assert.ok(older&&interpretation);
 assert.equal(row.researchInterpretation,interpretation.comparisonHypothesis);
 assert.equal(row.researchReasonNotFatherSpeech,interpretation.researchReason);
 assert.equal(row.questionLine,older.historicalPrintedLine);
 assert.equal(row.originalFocusedContextSHA256,older.historicalContextSHA256);
 assert.equal(row.originalQuestionSHA256,older.originalQuestionSHA256);
 assert.equal(row.originalSourceVolumeSHA256,sha(original));
 const unit=units.get(row.sourceWorkUnitId);
 assert.ok(unit);
 assert.equal(row.sourceWorkUnitId,unit.id);
 assert.equal(row.originalWorkUnitSHA256,unit.originalUnitOCRSHA256);
 assert.ok(row.sourceLineStart>=unit.startLine);
 assert.ok(row.sourceLineEnd<=unit.endLine);
 assert.ok(row.sourceLineStart<=row.questionLine&&row.questionLine<=row.sourceLineEnd);
 assert.ok(row.sourceLineEnd-row.sourceLineStart>=70,
  "Historical source research must not silently shrink context to old cropped answer");
 const extracted=lines.slice(row.sourceLineStart-1,row.sourceLineEnd).join("\n");
 assert.equal(extracted,row.originalHistoricalOCRExtendedWindow);
 assert.equal(sha(extracted),row.extendedWindowSHA256);
 assert.ok(extracted.includes(older.exactHistoricalOCRContext));
 assert.ok(extracted.includes(older.exactOriginalOCRQuestion)||
  extracted.includes(older.exactOriginalOCRQuestion.slice(-50)));
 assert.ok(extracted.length>=older.exactHistoricalOCRContext.length);
 for(const item of [...row.originalOCRPageHeadingClues,...row.originalOCRPossibleFootnoteClues]){
  assert.equal(lines[item.line-1],item.exactOCRLine);
  assert.equal(sha(item.exactOCRLine),item.sha256);
  assert.ok(item.line>=row.sourceLineStart&&item.line<=row.sourceLineEnd);
 }
 for(const flag of ["questionAndReplyBoundaryNotVerified",
  "historicalTwoColumnPageLayoutNotReconstructed","historicalGreekNotCollated",
  "sourceAuthorshipNotAuthenticated","expansionIsBoundedWindowNotCompleteHomilyOrArgument",
  "sourceQuoteInsideFootnoteUnresolved","thematicNoveltyStillUnresolved"])
  assert.equal(row[flag],true);
 assert.equal(row.publicationEligible,false);
 assert.equal(row.perPointerSceneComparison.length,older.catenaParallels.length);
 const map=new Map(older.catenaParallels.map(x=>[x.pointer,x]));
 for(const parallel of row.perPointerSceneComparison){
  const expected=map.get(parallel.canonicalPointer);
  assert.ok(expected);
  assert.equal(parallel.canonicalPericopeId,expected.pericopeId);
  assert.equal(parallel.inheritedAuthor,expected.inheritedFatherLabel);
  assert.equal(parallel.originalCatenaWords,expected.exactOriginalCatenaWords);
  assert.equal(parallel.originalCatenaWordsSHA256,sha(expected.exactOriginalCatenaWords));
  assert.deepEqual(parallel.commonFiveWordStrings,
   expected.matchedPhraseEvidence.map(x=>x.fiveWordPhrase));
  for(const phrase of parallel.commonFiveWordStrings){
   assert.ok(normal(older.exactOriginalOCREnsuingProse).includes(phrase));
   assert.ok(normal(parallel.originalCatenaWords).includes(phrase));
  }
  assert.equal(parallel.quoteAndSpeakerIdentityUnverified,true);
  assert.equal(parallel.publicationEligible,false);
  assert.ok(parallel.sceneRelationHypothesis.length>15);
 }
 if(row.researchInterpretation==="shared_scriptural_language_context_differs"){
  assert.ok(row.provisionalOriginalGospelScene?.startsWith("Matthew "));
  assert.equal(row.gospelSceneInferredFromSourceContextNotCriticallyAuthenticated,true);
 }else{
  assert.equal(row.provisionalOriginalGospelScene,null);
  assert.equal(row.gospelSceneInferredFromSourceContextNotCriticallyAuthenticated,false);
 }
}
assert.equal(ids.size,24);
assert.equal(summary.homilyBoundedOriginalOCRLineContexts,
 data.rows.reduce((n,r)=>n+r.sourceLineEnd-r.sourceLineStart+1,0));
function relation(id,pointer){
 const r=data.rows.find(x=>x.id===id);
 assert.ok(r);
 const p=r.perPointerSceneComparison.find(x=>x.canonicalPointer===pointer);
 assert.ok(p);
 return p.sceneRelationHypothesis;
}
assert.equal(relation("schaff-ocr-npnf1-10-ca77ecdf81002456",
 "catena.matthew.12.1:14"),"same_narrative_scene_argument_not_certified");
assert.equal(relation("schaff-ocr-npnf1-10-ca77ecdf81002456",
 "catena.matthew.26.6:14"),"saying_cited_in_different_anointing_scene");
assert.equal(relation("schaff-ocr-npnf1-10-adf2f2cf2247586f",
 "catena.matthew.26.6:14"),"same_narrative_scene_argument_not_certified");
assert.equal(relation("schaff-ocr-npnf1-10-adf2f2cf2247586f",
 "catena.matthew.12.1:14"),"saying_cited_in_different_sabbath_scene");
assert.equal(relation("SCH-CHR-004","catena.matthew.9.27:8"),
 "same_short_reply_in_different_blind_healing_scene");
assert.equal(relation("SCH-CHR-004","catena.matthew.13.51:0"),
 "same_gospel_passage_under_different_inherited_author_label");
console.log("PASS: 24 longer historical OCR source windows and 18 per-pointer Scripture-context research distinctions; all words and hashes preserved, zero verified answers");
