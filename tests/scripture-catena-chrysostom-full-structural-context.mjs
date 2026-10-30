import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const base="dist/";
const data=read(base+"schaff-chrysostom-full-structural/all-1938-long-original-source-contexts.v1.json");
const summary=read(base+"schaff-chrysostom-full-structural/summary.v1.json");
const historical=readFileSync(base+"schaff-original-ocr/NPNF1-10.raw-ocr.txt","utf8");
const lines=historical.replace(/\r/g,"").split("\n");
const candidate=read(base+"schaff-chrysostom-replies/chrysostom-all-structural-candidates.v1.json");
const screened=read(base+"schaff-chrysostom-bulk-research/all-1938-structural-question-screening.v1.json");
const earlier=read(base+"schaff-chrysostom-bulk-research/all-180-extended-source-contexts.v1.json");
const units=read(base+"schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json");
assert.equal(data.schema,"ao.catena.chrysostom-all-1938-original-contexts.v1");
assert.equal(summary.schema,"ao.catena.chrysostom-1938-expanded-source-context-summary.v1");
assert.deepEqual(data.summary,summary);
assert.equal(data.sourceTextChangesMade,false);
assert.equal(data.authorAnswersCertified,false);
assert.equal(summary.historicalSourceSHA256,sha(historical));
assert.equal(summary.historicalSourceSHA256,units.sourceVolumeSHA256);
assert.equal(summary.historicalHomiliesRepresented,90);
assert.equal(summary.structuralCandidatesWithLongOriginalText,1938);
assert.equal(summary.newlyExpandedBeyondOriginal180,1758);
assert.equal(summary.originalsPreservedFromPrior180,180);
assert.equal(data.records.length,1938);
assert.equal(data.perHomilySourceCoverage.length,90);
assert.ok(summary.totalOCRLineOccurrencesAcrossContexts>250000);
assert.ok(summary.uniqueSourceOCRLinesCovered>25000);
assert.ok(summary.uniqueSourceOCRLinesCovered<=summary.originalPrintedHomilyOCRLinesTotal);
assert.equal(summary.fractionOfHomilyOCRLinesTouched,
 Number((summary.uniqueSourceOCRLinesCovered/summary.originalPrintedHomilyOCRLinesTotal).toFixed(4)));
for(const field of ["independentlyAuthenticatedPatristicQuestions",
 "independentlyAuthenticatedOriginalReplyBounds","sourceCriticallyVerifiedNewCatenaMaterial",
 "humanApprovalRequests","publicationApprovals"])
 assert.equal(summary[field],0);
const unitsById=new Map(units.units.map(x=>[x.id,x]));
const originalById=new Map(candidate.records.map(x=>[x.id,x]));
const priorById=new Map(earlier.rows.map(x=>[x.id,x]));
const screenedById=new Map(screened.rows.map(x=>[x.id,x]));
assert.equal(originalById.size,1938);
assert.equal(screenedById.size,1938);
assert.equal(priorById.size,180);
const seen=new Set(),partitions=new Map();
let verifiedOverlap=0,allLineOccurrences=0,noBlank=0,boundary=0,
 quote=0,extraQuestion=0,interlocutor=0,scripture=0,notes=0;
for(const record of data.records){
 assert.ok(!seen.has(record.id));seen.add(record.id);
 const orig=originalById.get(record.id),sc=screenedById.get(record.id),
  u=unitsById.get(record.workUnitId);
 assert.ok(orig&&sc&&u,"Every expanded record must derive from a real original source");
 assert.equal(record.originalSourceVolumeSHA256,undefined);
 assert.equal(record.sourceVolumeSHA256,sha(historical));
 assert.equal(record.originalHomilyOCRSHA256,u.originalUnitOCRSHA256);
 assert.equal(record.workUnitOrdinal,u.unitOrdinal);
 assert.equal(record.originalHistoricalHomily,u.unitLabel);
 assert.equal(record.originalQuestionLine,orig.originalQuestionLine);
 assert.equal(record.originalQuestionSHA256,orig.originalQuestionSourceSpanSHA256);
 assert.equal(record.originalQuestionText,orig.originalQuestionSourceSpan);
 assert.equal(sha(record.originalQuestionText),record.originalQuestionSHA256);
 assert.equal(record.originalFollowingProseSHA256,orig.originalEnsuingProseSHA256);
 assert.equal(record.originalQuestionWithinLongContextLineOffset,
  record.originalQuestionLine-record.originalLongContextStartLine);
 assert.equal(record.originalLongContextStartLine,Math.max(u.startLine,record.originalQuestionLine-55));
 assert.equal(record.originalLongContextEndLine,Math.min(u.endLine,record.originalQuestionLine+110));
 assert.equal(record.exactOriginalLongContextOCR,
  lines.slice(record.originalLongContextStartLine-1,record.originalLongContextEndLine).join("\n"));
 assert.equal(sha(record.exactOriginalLongContextOCR),record.exactOriginalLongContextSHA256);
 assert.ok(record.exactOriginalLongContextOCR.includes(orig.originalContextOCR));
 assert.deepEqual(record.initialScreeningRiskFlags,sc.originalLayerRisks);
 assert.deepEqual(record.existingCatenaLexicalCandidates,sc.lexicalCatenaCandidates);
 const prior=priorById.get(record.id);
 assert.equal(record.isOneOfOriginal180,!!prior);
 if(prior){
  verifiedOverlap++;
  assert.equal(record.originalLongContextStartLine,prior.originalLongWindowFirstLine);
  assert.equal(record.originalLongContextEndLine,prior.originalLongWindowLastLine);
  assert.equal(record.exactOriginalLongContextOCR,prior.originalLongOCR);
  assert.equal(record.exactOriginalLongContextSHA256,prior.originalLongOCRSHA256);
 }
 const loc=record.originalPrintedLocatorEvidence;
 assert.equal(loc.blankLinesAreNotCertifiedParagraphBoundaries,true);
 assert.equal(loc.headingAndNotePatternsNotPrintedPageConfirmed,true);
 assert.equal(loc.quoteGlyphsNotBiblicalSpeakerVerification,true);
 const rangel=[record.originalLongContextStartLine,record.originalLongContextEndLine];
 for(const n of loc.blankOCRLines){
  assert.ok(n>=rangel[0]&&n<=rangel[1]);
  assert.equal(lines[n-1].trim(),"");
 }
 for(const n of [loc.nearestPriorBlankOCRLineWithin24,loc.nearestSubsequentBlankOCRLineWithin24]){
  if(n!==null){
   assert.ok(loc.blankOCRLines.includes(n));
   assert.ok(Math.abs(n-record.originalQuestionLine)<=24);
  }
 }
 for(const item of [...loc.headingCandidates,...loc.possiblePrintedNoteLines]){
  assert.ok(item.line>=rangel[0]&&item.line<=rangel[1]);
  assert.equal(item.originalOCR,lines[item.line-1]);
  assert.equal(item.sha256,sha(item.originalOCR));
 }
 let glyphs=0;
 for(const item of loc.quotationGlyphLineEvidence){
  assert.ok(item.line>=rangel[0]&&item.line<=rangel[1]);
  assert.equal(item.exactOriginalLineSHA256,sha(lines[item.line-1]));
  const m=[...lines[item.line-1].matchAll(/["“”]/g)].length;
  assert.equal(item.glyphCount,m);
  glyphs+=m;
 }
 assert.equal(record.printedOCRQuotationGlyphs,glyphs);
 assert.equal(record.questionMarksInInitialEnsuingProse,
  [...orig.originalEnsuingProseOCR.matchAll(/\?/g)].length);
 assert.equal(record.repeatedQuestionInInitialResponseText,
  record.questionMarksInInitialEnsuingProse>0);
 assert.equal(record.noRecognizableNearbyOCRBlankLineBothSides,
  loc.nearestPriorBlankOCRLineWithin24===null||
  loc.nearestSubsequentBlankOCRLineWithin24===null);
 assert.equal(record.extendedContextTouchesHomilyBoundary,
  rangel[0]===u.startLine||rangel[1]===u.endLine);
 for(const flag of ["noSourceOwnedSpeakerDetermination",
  "sourceParagraphBoundaryNotReconstructed","responseEndCannotBeDeducedFromWindow",
  "sourceEditionEnglishOCRUnverifiedAgainstGreek",
  "noVerifiedNoveltyFromCatena"])
  assert.equal(record[flag],true);
 assert.equal(record.publicationEligible,false);
 if(!partitions.has(u.id))partitions.set(u.id,[]);
 partitions.get(u.id).push(rangel);
 allLineOccurrences+=rangel[1]-rangel[0]+1;
 noBlank+=Number(record.noRecognizableNearbyOCRBlankLineBothSides);
 boundary+=Number(record.extendedContextTouchesHomilyBoundary);
 quote+=Number(glyphs>0);
 extraQuestion+=Number(record.questionMarksInInitialEnsuingProse>0);
 interlocutor+=Number(record.interlocutorExpressionObserved);
 scripture+=Number(record.possibleScripturalAttributionExpressionObserved);
 notes+=Number(loc.possiblePrintedNoteLines.length>0);
}
assert.equal(seen.size,1938);
assert.equal(verifiedOverlap,180);
assert.equal(partitions.size,90);
assert.equal(allLineOccurrences,summary.totalOCRLineOccurrencesAcrossContexts);
assert.equal(noBlank,summary.contextsWithoutBothNearbyBlankLineClues);
assert.equal(boundary,summary.contextsTouchingHomilyBoundary);
assert.equal(quote,summary.contextsWithVisibleOriginalQuotationGlyphs);
assert.equal(extraQuestion,summary.contextsWithMoreQuestionsInInitialProse);
assert.equal(interlocutor,summary.contextsWithReportedInterlocutorExpression);
assert.equal(scripture,summary.contextsWithScriptureSpeakerTextCue);
assert.equal(notes,summary.contextsWithPossiblePrintedNoteClues);
let unique=0,sourceTotal=0;
for(const u of units.units){
 const r=partitions.get(u.id);
 assert.ok(r?.length>0);
 r.sort((a,b)=>a[0]-b[0]);
 let a=null,b=null,volume=0;
 for(const [i,j] of r){
  if(a===null){a=i;b=j}
  else if(i<=b+1)b=Math.max(b,j);
  else{volume+=b-a+1;a=i;b=j}
 }
 if(a!==null)volume+=b-a+1;
 unique+=volume;
 sourceTotal+=u.endLine-u.startLine+1;
 const cover=data.perHomilySourceCoverage.find(x=>x.workUnitId===u.id);
 assert.ok(cover);
 assert.equal(cover.structuralQuestions,r.length);
 assert.equal(cover.distinctOCRLinesCovered,volume);
 assert.equal(cover.originalOCRLinesInHomily,u.endLine-u.startLine+1);
 assert.equal(cover.coverageIsOCRLocatorReachNotFatherQuestionVerification,true);
 assert.equal(cover.proportionOriginalHomilyOCRLinesCovered,
  Number((volume/cover.originalOCRLinesInHomily).toFixed(4)));
}
assert.equal(unique,summary.uniqueSourceOCRLinesCovered);
assert.equal(sourceTotal,summary.originalPrintedHomilyOCRLinesTotal);
console.log("PASS all Chrysostom long-source contexts: 1938/1938 original SHA-pinned questions, 1758 newly expanded, 180 previous context parity, all 90 homilies, zero Father or publication claims");
