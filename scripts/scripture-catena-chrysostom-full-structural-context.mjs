#!/usr/bin/env node
/**
 * Expand ALL 1,938 original-work Chrysostom question+prose structural
 * candidates to homily-bounded historical 1888 OCR windows.
 *
 * Research-only. Historical scan OCR may intermingle biblical dialogue,
 * translator footnotes, broken line wraps or different speakers. Blank lines
 * and quotation marks are locator clues, NOT authenticated paragraph or
 * author/answer boundaries. Nothing from this program can become a
 * published Father response or prove theological novelty.
 *
 * Prerequisites:
 *  scripts/scripture-catena-schaff-ocr-ingest.mjs
 *  scripts/scripture-catena-schaff-section-ingest.mjs
 *  scripts/scripture-catena-chrysostom-original-question-replies.mjs
 *  scripts/scripture-catena-chrysostom-bulk-context.mjs
 *
 * node scripts/scripture-catena-chrysostom-full-structural-context.mjs
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
const flag=(name,fallback)=>{
 const n=process.argv.indexOf(name);return n<0?fallback:process.argv[n+1]
};
const root=resolve(flag("--source-dir","dist"));
const output=resolve(flag("--output-dir","dist/schaff-chrysostom-full-structural"));
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const original=readFileSync(join(root,"schaff-original-ocr/NPNF1-10.raw-ocr.txt"),"utf8");
const units=read(join(root,"schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json"));
const structures=read(join(root,"schaff-chrysostom-replies/chrysostom-all-structural-candidates.v1.json"));
const sample=read(join(root,"schaff-chrysostom-bulk-research/all-180-extended-source-contexts.v1.json"));
const screened=read(join(root,"schaff-chrysostom-bulk-research/all-1938-structural-question-screening.v1.json"));
if(units.editionId!=="NPNF1-10"||units.units?.length!==90||
 structures.schema!=="ao.catena.chrysostom-all-structural-question-prose-ocr.v1"||
 structures.records?.length!==1938||
 sample.schema!=="ao.catena.chrysostom-180-long-source-contexts.v1"||
 sample.rows?.length!==180||
 screened.schema!=="ao.catena.chrysostom-1938-candidate-source-screen.v1"||
 screened.rows?.length!==1938||
 sha(original)!==units.sourceVolumeSHA256||
 sha(original)!==structures.historicalVolumeSHA256||
 sha(original)!==sample.summary.scanSHA256)
 throw Error("CHANGED_CHRYSOSTOM_HISTORICAL_OCR_OR_REGISTRY");
const lines=original.replace(/\r/g,"").split("\n");
const homily=new Map(units.units.map(u=>[u.id,u]));
const previous=new Map(sample.rows.map(x=>[x.id,x]));
const triaged=new Map(screened.rows.map(x=>[x.id,x]));
if(previous.size!==180||triaged.size!==1938||
 new Set(structures.records.map(x=>x.id)).size!==1938)
 throw Error("RESEARCH_SOURCE_IDS_COLLIDE");
const PRINTED_HEADER=/^(?:HOMILY\s+(?:[IVXLCDM\d]+)|CHAP\.\s+[IVXLCDM]+|THE\s+GOSPEL\s+OF|FOOTNOTES?|INDEX)\b/i;
const POSSIBLE_NOTE=/^(?:\d{1,3}[.)]?\s+(?:Matt|Matth|Mark|Luke|John|Isa|Rom|Cor|Acts|See|Cf|Ibid)\b|[*†‡]\s+\S|\[\s*(?:R\.?\s*V\.?|A\.?\s*V\.?|The\s+Greek))\b/i;
const INTERLOCUTOR=/\b(?:saith\s+one|it\s+may\s+be\s+asked|some\s+one\s+will\s+say|thou\s+wilt\s+say|you\s+may\s+say)\b/i;
const SCRIPTURE_CUE=/\b(?:saith\s+(?:Christ|the\s+Lord)|the\s+Scripture\s+saith|as\s+it\s+is\s+written|the\s+prophet\s+saith|Matth?\.?\s+(?:[IVXLCDM]+|\d+))\b/i;
function printedLocatorClues(u,first,last,question){
 const blanks=[],headings=[],notes=[],quoteMarks=[];
 for(let n=first;n<=last;n++){
  const row=lines[n-1]||"",trimmed=row.trim();
  if(!trimmed)blanks.push(n);
  if(PRINTED_HEADER.test(trimmed))
   headings.push({line:n,originalOCR:row,sha256:sha(row)});
  if(POSSIBLE_NOTE.test(trimmed))
   notes.push({line:n,originalOCR:row,sha256:sha(row)});
  const quoteGlyphs=[...row.matchAll(/["“”]/g)];
  if(quoteGlyphs.length)
   quoteMarks.push({line:n,glyphCount:quoteGlyphs.length,exactOriginalLineSHA256:sha(row)});
 }
 const before=[...blanks].reverse().find(n=>n<question&&n>=question-24)??null;
 const after=blanks.find(n=>n>question&&n<=question+24)??null;
 return {blankOCRLines:blanks,
  nearestPriorBlankOCRLineWithin24:before,
  nearestSubsequentBlankOCRLineWithin24:after,
  headingCandidates:headings,possiblePrintedNoteLines:notes,
  quotationGlyphLineEvidence:quoteMarks,
  blankLinesAreNotCertifiedParagraphBoundaries:true,
  headingAndNotePatternsNotPrintedPageConfirmed:true,
  quoteGlyphsNotBiblicalSpeakerVerification:true};
}
const outputRows=[],intervals=new Map();
let repeatedQuestions=0,withInterlocutor=0,withQuoteGlyphs=0,withPrintedNotes=0;
let noNearbyBlank=0,contextCutByHomily=0,withScriptureCues=0;
for(const r of structures.records){
 const unit=homily.get(r.sourceWorkUnitId),prior=triaged.get(r.id);
 if(!unit||!prior||prior.workUnitId!==unit.id||prior.originalOCRLine!==r.originalQuestionLine||
  r.originalQuestionLine<unit.startLine||r.originalQuestionLine>unit.endLine||
  r.ensuingProseEndLine>unit.endLine||
  lines[r.originalQuestionLine-1]!==r.exactQuestionLineOCR||
  sha(r.originalQuestionSourceSpan)!==r.originalQuestionSourceSpanSHA256||
  sha(r.originalEnsuingProseOCR)!==r.originalEnsuingProseSHA256||
  sha(r.originalContextOCR)!==r.originalContextSHA256||
  prior.originalOCRQuestionSHA256!==r.originalQuestionSourceSpanSHA256||
  prior.originalFollowingTextSHA256!==r.originalEnsuingProseSHA256)
  throw Error("SOURCE_QUESTION_OR_OCR_PROVENANCE_DRIFT:"+r.id);
 const n=r.originalQuestionLine;
 const first=Math.max(unit.startLine,n-55),last=Math.min(unit.endLine,n+110);
 const text=lines.slice(first-1,last).join("\n");
 if(!text.includes(r.originalContextOCR))
  throw Error("PRIOR_CROPPED_SOURCE_CONTEXT_NOT_PRESERVED:"+r.id);
 const currentSample=previous.get(r.id);
 if(currentSample){
  if(currentSample.originalLongWindowFirstLine!==first||
   currentSample.originalLongWindowLastLine!==last||
   currentSample.originalLongOCRSHA256!==sha(text)||
   currentSample.originalLongOCR!==text)
   throw Error("PREVIOUSLY_REPORTED_180_CONTEXTS_CHANGED:"+r.id);
 }
 const quotationClues=printedLocatorClues(unit,first,last,n);
 const qmark=[...r.originalEnsuingProseOCR.matchAll(/\?/g)].length;
 const possibleInterlocutor=INTERLOCUTOR.test(r.originalQuestionSourceSpan+"\n"+r.originalEnsuingProseOCR);
 const scriptureCue=SCRIPTURE_CUE.test(r.originalQuestionSourceSpan+"\n"+r.originalEnsuingProseOCR);
 const quoteGlyphs=quotationClues.quotationGlyphLineEvidence.reduce((s,x)=>s+x.glyphCount,0);
 const noBoundary=quotationClues.nearestPriorBlankOCRLineWithin24===null||
                  quotationClues.nearestSubsequentBlankOCRLineWithin24===null;
 const cut=first===unit.startLine||last===unit.endLine;
 repeatedQuestions+=Number(qmark>0);
 withInterlocutor+=Number(possibleInterlocutor);
 withQuoteGlyphs+=Number(quoteGlyphs>0);
 withPrintedNotes+=Number(quotationClues.possiblePrintedNoteLines.length>0);
 withScriptureCues+=Number(scriptureCue);
 noNearbyBlank+=Number(noBoundary);
 contextCutByHomily+=Number(cut);
 outputRows.push({
  id:r.id,workUnitId:unit.id,workUnitOrdinal:unit.unitOrdinal,
  originalHistoricalHomily:unit.unitLabel,sourceVolumeSHA256:sha(original),
  originalHomilyOCRSHA256:unit.originalUnitOCRSHA256,
  originalQuestionLine:n,originalQuestionSHA256:r.originalQuestionSourceSpanSHA256,
  originalQuestionText:r.originalQuestionSourceSpan,
  originalFollowingProseSHA256:r.originalEnsuingProseSHA256,
  originalLongContextStartLine:first,originalLongContextEndLine:last,
  exactOriginalLongContextOCR:text,exactOriginalLongContextSHA256:sha(text),
  originalQuestionWithinLongContextLineOffset:n-first,
  originalPrintedLocatorEvidence:quotationClues,
  questionMarksInInitialEnsuingProse:qmark,
  interlocutorExpressionObserved:possibleInterlocutor,
  possibleScripturalAttributionExpressionObserved:scriptureCue,
  printedOCRQuotationGlyphs:quoteGlyphs,
  initialScreeningRiskFlags:prior.originalLayerRisks,
  existingCatenaLexicalCandidates:prior.lexicalCatenaCandidates,
  repeatedQuestionInInitialResponseText:qmark>0,
  noRecognizableNearbyOCRBlankLineBothSides:noBoundary,
  extendedContextTouchesHomilyBoundary:cut,
  isOneOfOriginal180:!!currentSample,
  noSourceOwnedSpeakerDetermination:true,
  sourceParagraphBoundaryNotReconstructed:true,
  responseEndCannotBeDeducedFromWindow:true,
  sourceEditionEnglishOCRUnverifiedAgainstGreek:true,
  noVerifiedNoveltyFromCatena:true,publicationEligible:false
 });
 if(!intervals.has(unit.id))intervals.set(unit.id,[]);
 intervals.get(unit.id).push([first,last]);
}
if(outputRows.length!==1938||outputRows.filter(x=>x.isOneOfOriginal180).length!==180)
 throw Error("BULK_ORIGINAL_SOURCE_COVERAGE_NOT_EXACT");
const coverage=[],summaryTotal={occurrences:0,unique:0};
for(const u of units.units){
 const part=intervals.get(u.id)||[];
 if(!part.length)throw Error("HOMILY_WITHOUT_EXTENDED_CONTEXT:"+u.id);
 part.sort((a,b)=>a[0]-b[0]);
 let distinct=0,first=null,end=null;
 for(const [a,b] of part){
  summaryTotal.occurrences+=b-a+1;
  if(first===null){first=a;end=b;continue}
  if(a<=end+1)end=Math.max(end,b);
  else{distinct+=end-first+1;first=a;end=b}
 }
 if(first!==null)distinct+=end-first+1;
 summaryTotal.unique+=distinct;
 coverage.push({workUnitId:u.id,homilyOrdinal:u.unitOrdinal,originalOCRLinesInHomily:u.endLine-u.startLine+1,
  structuralQuestions:part.length,distinctOCRLinesCovered:distinct,
  proportionOriginalHomilyOCRLinesCovered:Number((distinct/(u.endLine-u.startLine+1)).toFixed(4)),
  coverageIsOCRLocatorReachNotFatherQuestionVerification:true});
}
const workLines=units.units.reduce((s,x)=>s+x.endLine-x.startLine+1,0);
const summary={
 schema:"ao.catena.chrysostom-1938-expanded-source-context-summary.v1",
 historicalSourceSHA256:sha(original),printedWork:"Chrysostom NPNF I/X Matthew homilies",
 historicalHomiliesRepresented:coverage.length,
 structuralCandidatesWithLongOriginalText:outputRows.length,
 newlyExpandedBeyondOriginal180:outputRows.length-180,
 originalsPreservedFromPrior180:180,
 totalOCRLineOccurrencesAcrossContexts:summaryTotal.occurrences,
 uniqueSourceOCRLinesCovered:summaryTotal.unique,
 originalPrintedHomilyOCRLinesTotal:workLines,
 fractionOfHomilyOCRLinesTouched:Number((summaryTotal.unique/workLines).toFixed(4)),
 contextsWithVisibleOriginalQuotationGlyphs:withQuoteGlyphs,
 contextsWithMoreQuestionsInInitialProse:repeatedQuestions,
 contextsWithReportedInterlocutorExpression:withInterlocutor,
 contextsWithScriptureSpeakerTextCue:withScriptureCues,
 contextsWithPossiblePrintedNoteClues:withPrintedNotes,
 contextsWithoutBothNearbyBlankLineClues:noNearbyBlank,
 contextsTouchingHomilyBoundary:contextCutByHomily,
 independentlyAuthenticatedPatristicQuestions:0,
 independentlyAuthenticatedOriginalReplyBounds:0,
 sourceCriticallyVerifiedNewCatenaMaterial:0,
 humanApprovalRequests:0,publicationApprovals:0
};
if(summary.uniqueSourceOCRLinesCovered>summary.originalPrintedHomilyOCRLinesTotal||
 summary.uniqueSourceOCRLinesCovered>summary.totalOCRLineOccurrencesAcrossContexts)
 throw Error("BULK_COVERAGE_OVERCOUNT");
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"all-1938-long-original-source-contexts.v1.json"),
 JSON.stringify({schema:"ao.catena.chrysostom-all-1938-original-contexts.v1",
  sourceTextChangesMade:false,authorAnswersCertified:false,
  textSource:"Unmodified 1888 printed Schaff NPNF I/X scan OCR",
  summary,perHomilySourceCoverage:coverage,records:outputRows},null,2)+"\n");
writeFileSync(join(output,"summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
