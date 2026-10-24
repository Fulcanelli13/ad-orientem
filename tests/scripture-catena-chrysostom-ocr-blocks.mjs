import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const base="dist/";
const src=readFileSync(base+"schaff-original-ocr/NPNF1-10.raw-ocr.txt","utf8");
const lines=src.replace(/\r/g,"").split("\n");
const units=read(base+"schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json");
const candidates=read(base+"schaff-chrysostom-replies/chrysostom-all-structural-candidates.v1.json");
const long=read(base+"schaff-chrysostom-full-structural/all-1938-long-original-source-contexts.v1.json");
const blocks=read(base+"schaff-chrysostom-ocr-blocks/ocr-block-source-locators.v1.json");
const links=read(base+"schaff-chrysostom-ocr-blocks/all-1938-question-block-links.v1.json");
const summary=read(base+"schaff-chrysostom-ocr-blocks/summary.v1.json");
assert.equal(summary.schema,"ao.catena.chrysostom-OCR-layout-block-index-summary.v1");
assert.equal(blocks.schema,"ao.catena.chrysostom-original-ocr-layout-blocks.v1");
assert.equal(links.schema,"ao.catena.chrysostom-1938-ocr-question-to-block.v1");
assert.deepEqual(links.summary,summary);
assert.deepEqual(blocks.summary,summary);
assert.equal(blocks.researchOnly,true);
assert.equal(blocks.noOCRLineWasRewritten,true);
assert.equal(blocks.blockBoundariesDerivedSolelyFromOriginalOCRBlankLines,true);
assert.equal(blocks.blockBoundariesAreNotCriticalParagraphBoundaries,true);
assert.equal(links.researchOnly,true);
assert.equal(links.noAuthorSpeakerVerified,true);
assert.equal(links.noRepliesPublished,true);
assert.equal(summary.original1888SourceVolumeSHA256,sha(src));
assert.equal(summary.original1888SourceVolumeSHA256,units.sourceVolumeSHA256);
assert.equal(summary.originalHomiliesIndexed,90);
assert.equal(summary.structuralQuestionsMappedToBlocks,1938);
assert.equal(blocks.unitSummaries.length,90);
assert.equal(links.links.length,1938);
assert.equal(summary.OCRNonemptyContiguousTextBlocks,blocks.blocks.length);
assert.ok(blocks.blocks.length>=90);
for(const key of ["sourceBoundariesAuthenticated","authenticQuestionSpeakersConfirmed",
 "answersCompleteInTheirBlocksConfirmed","novelPatristicAnswersConfirmed",
 "humanReviews","publicationApprovals"])assert.equal(summary[key],0);
const unitMap=new Map(units.units.map(u=>[u.id,u]));
const questions=new Map(candidates.records.map(x=>[x.id,x]));
const longSource=new Map(long.records.map(x=>[x.id,x]));
const blockMap=new Map(),blocksByUnit=new Map();
for(const b of blocks.blocks){
 assert.ok(!blockMap.has(b.id));blockMap.set(b.id,b);
 const u=unitMap.get(b.homilyId);
 assert.ok(u);
 assert.equal(b.homilyOrdinal,u.unitOrdinal);
 assert.ok(b.originalOCRLineStart>=u.startLine&&b.originalOCRLineEnd<=u.endLine);
 assert.ok(b.originalOCRLineStart<=b.originalOCRLineEnd);
 const original=lines.slice(b.originalOCRLineStart-1,b.originalOCRLineEnd).join("\n");
 assert.equal(b.exactHistoricalOriginalOCR,original);
 assert.equal(b.originalOCRSHA256,sha(original));
 assert.ok(original.length>0);
 assert.ok(lines.slice(b.originalOCRLineStart-1,b.originalOCRLineEnd)
  .every(line=>line.trim().length>0));
 assert.equal(b.notACertifiedOriginalParagraph,true);
 assert.equal(b.noPatristicAuthorshipVerified,true);
 assert.equal(b.publicationEligible,false);
 if(!blocksByUnit.has(u.id))blocksByUnit.set(u.id,[]);
 blocksByUnit.get(u.id).push(b);
}
let blankTotal=0;
for(const u of units.units){
 const all=blocksByUnit.get(u.id);
 assert.ok(all?.length>0);
 all.sort((a,b)=>a.originalOCRLineStart-b.originalOCRLineStart);
 assert.equal(all[0].homilyId,u.id);
 const summaryUnit=blocks.unitSummaries.find(r=>r.homilyId===u.id);
 assert.ok(summaryUnit);
 assert.equal(summaryUnit.sourceOCRBlockCandidates,all.length);
 assert.equal(summaryUnit.originalHomilySHA256,u.originalUnitOCRSHA256);
 assert.equal(summaryUnit.noCertifiedAuthorBoundaries,true);
 const knownLines=new Set();
 for(const block of all){
  for(let n=block.originalOCRLineStart;n<=block.originalOCRLineEnd;n++){
   assert.ok(!knownLines.has(n));
   knownLines.add(n);
  }
 }
 for(let n=u.startLine;n<=u.endLine;n++){
  const has=knownLines.has(n);
  assert.equal(has,lines[n-1].trim().length>0,
   "Blank OCR lines separate candidate blocks; no source lines can be lost or invented");
  if(!has)blankTotal++;
 }
}
assert.equal(blankTotal,summary.blankOCRLinesObservedInside90Homilies);
const linkedIds=new Set(),countPerBlock=new Map(),perHomily=new Map();
let sameLine=0,hasNext=0,priorBlock=0,footnote=0;
for(const r of links.links){
 assert.ok(!linkedIds.has(r.id));linkedIds.add(r.id);
 const q=questions.get(r.id),previous=longSource.get(r.id);
 const block=blockMap.get(r.containingOCRBlockId);
 assert.ok(q&&previous&&block);
 assert.equal(q.originalQuestionLine,r.originalQuestionLine);
 assert.equal(r.originalQuestionLineSHA256,q.exactQuestionLineSHA256);
 assert.equal(lines[r.originalQuestionLine-1],q.exactQuestionLineOCR);
 assert.equal(r.containingOCRBlockSHA256,block.originalOCRSHA256);
 assert.equal(r.homilyId,block.homilyId);
 assert.equal(r.homilyId,previous.workUnitId);
 assert.equal(r.containingOCRBlockLineStart,block.originalOCRLineStart);
 assert.equal(r.containingOCRBlockLineEnd,block.originalOCRLineEnd);
 assert.ok(r.originalQuestionLine>=block.originalOCRLineStart&&
  r.originalQuestionLine<=block.originalOCRLineEnd);
 assert.equal(r.questionMarkOffsetWithinOriginalLine,q.questionMarkOffset);
 assert.equal(q.exactQuestionLineOCR[q.questionMarkOffset],"?");
 const rest=lines.slice(r.originalQuestionLine,block.originalOCRLineEnd);
 const text=q.exactQuestionLineOCR.slice(q.questionMarkOffset+1)+
  (rest.length?"\n"+rest.join("\n"):"");
 assert.equal(r.exactOCRFollowingTextInSameBlock,text);
 assert.equal(r.sameBlockPostQuestionOCRSHA256,sha(text));
 assert.equal(r.originalSameLineContinuationExists,
  q.exactQuestionLineOCR.slice(q.questionMarkOffset+1).trim().length>0);
 assert.equal(r.originalSourceQuestionStartsBeforeThisOCRBlock,
  q.originalQuestionSourceSpanStartLine<block.originalOCRLineStart);
 const siblings=blocksByUnit.get(r.homilyId);
 const pos=siblings.findIndex(x=>x.id===block.id);
 assert.ok(pos>=0);
 const next=siblings[pos+1]||null;
 assert.equal(r.nextOCRBlockId,next?.id||null);
 assert.equal(r.nextOCRBlockSHA256,next?.originalOCRSHA256||null);
 assert.equal(r.possiblePrintedFootnoteAtBlockBoundary,
  block.possiblePrintedFootnote||!!next?.possiblePrintedFootnote);
 assert.equal(r.nextBlockMayBeDifferentSpeakerScriptureOrPrintedNote,true);
 assert.equal(r.speakerOwnerOfQuestionNotKnown,true);
 assert.equal(r.answerMayContinueThroughMultipleBlocks,true);
 assert.equal(r.originalPrintedParagraphBoundaryNotConfirmed,true);
 assert.equal(r.publicationEligible,false);
 sameLine+=Number(r.originalSameLineContinuationExists);
 hasNext+=Number(!!next);
 priorBlock+=Number(r.originalSourceQuestionStartsBeforeThisOCRBlock);
 footnote+=Number(r.possiblePrintedFootnoteAtBlockBoundary);
 countPerBlock.set(block.id,(countPerBlock.get(block.id)||0)+1);
 perHomily.set(block.homilyId,(perHomily.get(block.homilyId)||0)+1);
}
assert.equal(linkedIds.size,1938);
assert.equal(summary.structuralQuestionsWithSameLineTextAfterQuestionMark,sameLine);
assert.equal(summary.structuralQuestionsWithAdjacentNextOCRBlock,hasNext);
assert.equal(summary.questionTextPotentiallyStartingBeforeCurrentOCRBlock,priorBlock);
assert.equal(summary.possiblePrintedNoteAtQuestionOrNextBlock,footnote);
assert.equal(summary.distinctTextBlocksContainingQuestion,countPerBlock.size);
for(const u of units.units){
 const count=perHomily.get(u.id);
 assert.ok(count>=1);
 const label=blocks.unitSummaries.find(x=>x.homilyId===u.id);
 assert.equal(label.structuralQuestionsMapped,count);
}
console.log("PASS Schaff OCR block locators: 90 original homilies, "+
 blocks.blocks.length+" original blank-separated text blocks and all 1938 question-continuation crosswalks; source hashes preserved and no certified Father-owned answer");
