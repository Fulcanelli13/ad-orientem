#!/usr/bin/env node
/**
 * Blank-line OCR block locator for 90 Chrysostom Matthew homilies and every
 * one of the 1938 structural question candidates.
 *
 * IMPORTANT: OCR whitespace is NOT critical paragraph attribution.
 * The following text may be Scripture, an editor, an objection, or a new
 * question. The tool only supplies original printed-OCR segment pointers,
 * hashes and layout evidence. It makes no Father answer or novelty claims.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
const arg=(k,d)=>{const i=process.argv.indexOf(k);return i<0?d:process.argv[i+1]};
const base=resolve(arg("--source-dir","dist"));
const output=resolve(arg("--output-dir","dist/schaff-chrysostom-ocr-blocks"));
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const raw=readFileSync(join(base,"schaff-original-ocr/NPNF1-10.raw-ocr.txt"),"utf8");
const units=read(join(base,"schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json"));
const structs=read(join(base,"schaff-chrysostom-replies/chrysostom-all-structural-candidates.v1.json"));
const long=read(join(base,"schaff-chrysostom-full-structural/all-1938-long-original-source-contexts.v1.json"));
if(units.editionId!=="NPNF1-10"||units.units.length!==90||
 structs.records.length!==1938||
 long.records.length!==1938||
 sha(raw)!==units.sourceVolumeSHA256||
 sha(raw)!==structs.historicalVolumeSHA256||
 sha(raw)!==long.summary.historicalSourceSHA256)
 throw Error("ORIGINAL_CHRYSOSTOM_SOURCE_NOT_FROZEN");
const lines=raw.replace(/\r/g,"").split("\n");
const locators=[],blockById=new Map(),blockAtLine=new Map(),byUnit=new Map();
let emptyLineCount=0;
const NOTE=/^(?:\d{1,3}[.)]?\s+(?:See|Cf|Matt|Mark|Luke|John|Rom|Cor|Isa)|[*†‡]\s+\S|\[)/i;
const HEADER=/^(?:HOMILY\s+[IVXLCDM\d]+|CHAP\.\s+[IVXLCDM]+|FOOTNOTES?|INDEX)\b/i;
for(const unit of units.units){
 const collected=[],last=unit.endLine;
 let start=null,sequence=0;
 function flush(end){
  if(start===null)return;
  const original=lines.slice(start-1,end).join("\n");
  const id=unit.id+":ocr-block-"+String(++sequence).padStart(4,"0");
  const block={
   id,homilyId:unit.id,homilyOrdinal:unit.unitOrdinal,
   originalOCRLineStart:start,originalOCRLineEnd:end,
   exactHistoricalOriginalOCR:original,
   originalOCRSHA256:sha(original),
   possiblePrintedHeading:HEADER.test(lines[start-1].trim()),
   possiblePrintedFootnote:NOTE.test(lines[start-1].trim()),
   notACertifiedOriginalParagraph:true,
   noPatristicAuthorshipVerified:true,
   publicationEligible:false
  };
  locators.push(block);collected.push(block);blockById.set(id,block);
  for(let n=start;n<=end;n++)blockAtLine.set(n,id);
  start=null;
 }
 for(let line=unit.startLine;line<=last;line++){
  if(!lines[line-1].trim()){
   emptyLineCount++;flush(line-1);
  }else if(start===null)start=line;
 }
 flush(last);
 if(!collected.length)throw Error("HOMILY_WITHOUT_ORIGINAL_OCR_BLOCKS");
 byUnit.set(unit.id,collected);
}
const allIds=new Set(),links=[],longMap=new Map(long.records.map(x=>[x.id,x]));
const questionCounts=new Map(),withNext=new Set();
let sameLineContinuation=0,questionSpanPriorBlock=0,footnoteSuspect=0;
for(const question of structs.records){
 if(allIds.has(question.id))throw Error("NONUNIQUE_ORIGINAL_STRUCTURAL_QUESTION");
 allIds.add(question.id);
 const id=blockAtLine.get(question.originalQuestionLine),block=blockById.get(id);
 const sourceLong=longMap.get(question.id);
 if(!block||!sourceLong||block.homilyId!==question.sourceWorkUnitId||
  sourceLong.workUnitId!==block.homilyId||
  lines[question.originalQuestionLine-1]!==question.exactQuestionLineOCR||
  sha(question.exactQuestionLineOCR)!==question.exactQuestionLineSHA256)
  throw Error("ORIGINAL_QUESTION_HAS_NO_VERIFIED_PRINT_OCR_BLOCK:"+question.id);
 const mark=question.questionMarkOffset;
 if(question.exactQuestionLineOCR[mark]!=="?")throw Error("QUESTION_MARK_MOVED");
 const suffixLine=question.exactQuestionLineOCR.slice(mark+1);
 const rest=lines.slice(question.originalQuestionLine,block.originalOCRLineEnd);
 const suffix=suffixLine+(rest.length?"\n"+rest.join("\n"):"");
 const group=byUnit.get(block.homilyId);
 const ordinal=group.findIndex(x=>x.id===id);
 if(ordinal<0)throw Error("OCR_BLOCK_IN_WRONG_HOMILY");
 const next=group[ordinal+1]||null;
 const beginsBefore=question.originalQuestionSourceSpanStartLine<block.originalOCRLineStart;
 const likelyNote=block.possiblePrintedFootnote||!!next?.possiblePrintedFootnote;
 sameLineContinuation+=Number(suffixLine.trim().length>0);
 questionSpanPriorBlock+=Number(beginsBefore);
 footnoteSuspect+=Number(likelyNote);
 if(next)withNext.add(question.id);
 questionCounts.set(id,(questionCounts.get(id)||0)+1);
 links.push({
  id:question.id,homilyId:block.homilyId,
  originalQuestionLine:question.originalQuestionLine,
  originalQuestionLineSHA256:question.exactQuestionLineSHA256,
  questionMarkOffsetWithinOriginalLine:mark,
  containingOCRBlockId:id,
  containingOCRBlockSHA256:block.originalOCRSHA256,
  containingOCRBlockLineStart:block.originalOCRLineStart,
  containingOCRBlockLineEnd:block.originalOCRLineEnd,
  originalSourceQuestionStartsBeforeThisOCRBlock:beginsBefore,
  exactOCRFollowingTextInSameBlock:suffix,
  sameBlockPostQuestionOCRSHA256:sha(suffix),
  originalSameLineContinuationExists:suffixLine.trim().length>0,
  nextOCRBlockId:next?.id||null,
  nextOCRBlockSHA256:next?.originalOCRSHA256||null,
  nextBlockMayBeDifferentSpeakerScriptureOrPrintedNote:true,
  possiblePrintedFootnoteAtBlockBoundary:likelyNote,
  speakerOwnerOfQuestionNotKnown:true,
  answerMayContinueThroughMultipleBlocks:true,
  originalPrintedParagraphBoundaryNotConfirmed:true,
  publicationEligible:false
 });
}
if(links.length!==1938||new Set(links.map(x=>x.id)).size!==1938)
 throw Error("NOT_ALL_STRUCTURAL_SOURCE_QUESTIONS_MAPPED");
const unitSummaries=units.units.map(u=>{
 const b=byUnit.get(u.id),questionCount=b.reduce((n,x)=>n+(questionCounts.get(x.id)||0),0);
 return {homilyId:u.id,ordinal:u.unitOrdinal,
  sourceOCRBlockCandidates:b.length,
  structuralQuestionsMapped:questionCount,
  originalHomilySHA256:u.originalUnitOCRSHA256,
  noCertifiedAuthorBoundaries:true};
});
const summary={
 schema:"ao.catena.chrysostom-OCR-layout-block-index-summary.v1",
 original1888SourceVolumeSHA256:sha(raw),
 originalHomiliesIndexed:unitSummaries.length,
 OCRNonemptyContiguousTextBlocks:locators.length,
 structuralQuestionsMappedToBlocks:links.length,
 distinctTextBlocksContainingQuestion:questionCounts.size,
 structuralQuestionsWithSameLineTextAfterQuestionMark:sameLineContinuation,
 structuralQuestionsWithAdjacentNextOCRBlock:withNext.size,
 questionTextPotentiallyStartingBeforeCurrentOCRBlock:questionSpanPriorBlock,
 possiblePrintedNoteAtQuestionOrNextBlock:footnoteSuspect,
 blankOCRLinesObservedInside90Homilies:emptyLineCount,
 sourceBoundariesAuthenticated:0,authenticQuestionSpeakersConfirmed:0,
 answersCompleteInTheirBlocksConfirmed:0,novelPatristicAnswersConfirmed:0,
 humanReviews:0,publicationApprovals:0
};
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"ocr-block-source-locators.v1.json"),
 JSON.stringify({schema:"ao.catena.chrysostom-original-ocr-layout-blocks.v1",
  researchOnly:true,noOCRLineWasRewritten:true,
  blockBoundariesDerivedSolelyFromOriginalOCRBlankLines:true,
  blockBoundariesAreNotCriticalParagraphBoundaries:true,
  summary,unitSummaries,blocks:locators},null,2)+"\n");
writeFileSync(join(output,"all-1938-question-block-links.v1.json"),
 JSON.stringify({schema:"ao.catena.chrysostom-1938-ocr-question-to-block.v1",
  researchOnly:true,sourceVolumeSHA256:sha(raw),
  noAuthorSpeakerVerified:true,noRepliesPublished:true,
  summary,links},null,2)+"\n");
writeFileSync(join(output,"summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
