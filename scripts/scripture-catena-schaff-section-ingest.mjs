#!/usr/bin/env node
/**
 * SHA-256-pinned 1888 NPNF source-work segmentation.
 * Identifies 4 books of Augustine's Harmony and 90 Chrysostom Matthew homilies.
 * Individual OCR questions, authorship, text fidelity and Catena novelty remain UNVERIFIED.
 * node scripts/scripture-catena-schaff-section-ingest.mjs
 * --input-dir dist/schaff-original-ocr --output-dir dist/schaff-sectioned-research
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
const root="data/scripture/catena/research/full-corpus-pass-20261021/";
const scopes=JSON.parse(readFileSync(root+"schaff-ocr-work-scope.v1.json","utf8"));
if(scopes.schema!=="ao.catena.schaff-historical-scan-work-scope.v1")
 throw Error("INVALID_PRINTED_WORK_BOUNDARIES");
const arg=(flag,fallback)=>{const i=process.argv.indexOf(flag);return i<0?fallback:process.argv[i+1]};
const input=resolve(arg("--input-dir","dist/schaff-original-ocr"));
const output=resolve(arg("--output-dir","dist/schaff-sectioned-research"));
mkdirSync(output,{recursive:true});
const hash=s=>createHash("sha256").update(s,"utf8").digest("hex");
const clean=s=>s.replace(/\s+/g," ").trim();
const roman=n=>{const opts=[[90,"XC"],[50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]];
 let s="";for(const [number,symbol] of opts){while(n>=number){s+=symbol;n-=number}}return s};
const OCR_ROMAN_FIXES={"11":"II","XXXL":"XXXI","XXXIL":"XXXII"};
function homilyUnits(lines,scope){
 const matches=[];
 for(let n=scope.start;n<=scope.end;n++){
  const raw=clean(lines[n-1]||"");
  const m=/^HOMILY\s+([IVXLCDM0-9]+)[.,^]*$/.exec(raw);
  if(!m)continue;
  const observed=m[1],corrected=OCR_ROMAN_FIXES[observed]||observed;
  matches.push({line:n,raw:lines[n-1],observed,corrected});
 }
 if(matches.length!==90||matches.some((x,i)=>x.corrected!==roman(i+1)))
  throw Error("HOMILY_NUMBER_SEQUENCE_NOT_RECOVERED:"+matches.length);
 return matches.map((h,i)=>({
  id:"schaff.npnf1-10.matthew-homily-"+String(i+1).padStart(2,"0"),
  authorLabel:"John Chrysostom",work:"Homilies on Matthew",unitKind:"homily",
  unitOrdinal:i+1,unitLabel:"Homily "+roman(i+1),
  startLine:h.line,endLine:i===89?scope.end:matches[i+1].line-1,
  printedHeadingOCR:h.raw,
  headingNormalization:h.observed===h.corrected?null:{
   observedOCR:h.observed,normalizedHeading:h.corrected},
  chapterOrParagraphIdentityNotProven:true
 }));
}
function augustineUnits(lines,scope){
 const matches=[];
 for(let n=scope.start;n<=scope.end;n++){
  const raw=clean(lines[n-1]||""),m=/^BOOK\s+(I|II|III|IV)\.$/.exec(raw);
  if(m)matches.push({line:n,raw:lines[n-1],roman:m[1]});
 }
 if(matches.length!==4||matches.some((h,i)=>h.roman!==roman(i+1)))
  throw Error("FOUR_AUGUSTINE_BOOK_HEADINGS_NOT_RECOVERED");
 return matches.map((h,i)=>({
  id:"schaff.npnf1-06.harmony-book-"+roman(i+1).toLowerCase(),
  authorLabel:"Augustine",work:"De consensu evangelistarum",unitKind:"book",
  unitOrdinal:i+1,unitLabel:"Book "+roman(i+1),
  startLine:h.line,endLine:i===3?scope.end:matches[i+1].line-1,
  printedHeadingOCR:h.raw,headingNormalization:null,
  chapterOrParagraphIdentityNotProven:true
 }));
}
function romanValue(romanHeading){
 const weights={I:1,V:5,X:10,L:50,C:100,D:500,M:1000};
 let count=0;
 for(let i=0;i<romanHeading.length;i++){
  const now=weights[romanHeading[i]],next=weights[romanHeading[i+1]]||0;
  if(!now)return null;
  count+=now<next?-now:now;
 }
 return count;
}
function augustineChapterHeadingCandidates(lines,units){
 const evidence=[];
 for(const unit of units){
  let prev=0;
  for(let n=unit.startLine;n<=unit.endLine;n++){
   const raw=lines[n-1]||"",oneLine=clean(raw).toUpperCase();
   // These are locator *candidates*. OCR two-column reading order mixes
   // chapter headings and content, so NEVER assign paragraph chapter spans.
   const match=/^CHAP\.\s+([IVXLCDM]+)\.?\s*[—–-]/.exec(oneLine);
   if(!match)continue;
   const chapter=romanValue(match[1]);
   if(!chapter||chapter>110)continue;
   const outOfOrder=chapter<=prev;
   evidence.push({
    printedWorkUnitId:unit.id,bookOrdinal:unit.unitOrdinal,
    candidateChapter:chapter,observedRoman:match[1],
    originalHeadingOCR:raw,originalHeadingSHA256:hash(raw),
    originalLineNumber:n,
    chapterNumberDecreasedOrRepeatedInLinearOCR:outOfOrder,
    completenessUnverified:true,sectionBoundaryNotEstablished:true
   });
   prev=chapter;
  }
 }
 return evidence;
}
function questionScreening(line,unit,n){
 const normalized=clean(line),flags=[];
 if(n-unit.startLine<20)flags.push("near_printed_unit_heading");
 if(/(?:^|\s)(?:\d{1,3}\s*[.:;]|[IVXLCDM]{1,8}\s*[.:])\s*["“]/.test(normalized))
  flags.push("possible_biblical_quote");
 if(/\b(?:matth?|mark|luke|john|rom|cor|ps|isa|rev)\.?\s+[ivxlcdm0-9]+\./i.test(normalized))
  flags.push("possible_scripture_citation");
 if(/^[\s\d*\[\]()\-–—.]*(?:\[|\(R\.|\(V\.|\*|["“])/.test(line))
  flags.push("possible_biblical_quote_or_printed_footnote");
 if(/^(?:\d{1,2}|\*|†)\s{0,4}\S+/.test(line.trim()))
  flags.push("possible_printed_footnote");
 if(/\b(?:CHAP\.|HOMILY|BOOK|FOOTNOTES?|EDITOR|CONTENTS|INDEX)\b/i.test(normalized))
  flags.push("possible_editorial_heading");
 if(normalized.length<12)flags.push("very_short_or_ocr_corrupted_question");
 return {sourceOwnership:"unverified_ocr_question_may_be_author_scripture_or_editor",
  originScreening:flags.length?"needs_source_layer_disambiguation":
   "candidate_author_rhetoric_unconfirmed",screeningFlags:flags};
}
function processVolume(editionId){
 const vol=scopes.volumes.find(x=>x.editionId===editionId);
 if(!vol)throw Error("UNPINNED_VOLUME");
 const text=readFileSync(join(input,editionId+".raw-ocr.txt"),"utf8");
 if(hash(text)!==vol.ocrSHA256)throw Error("SOURCE_OCR_SHA256_CHANGED:"+editionId);
 const lines=text.replace(/\r/g,"").split("\n");
 if(lines.length!==vol.maxLines)throw Error("SOURCE_OCR_LINE_COUNT_CHANGED");
 const existing=JSON.parse(readFileSync(join(input,editionId+".question-candidates.json"),"utf8"));
 if(existing.editionId!==editionId||existing.sourceSHA256!==vol.ocrSHA256||
    existing.windows?.length!==existing.questionMarkCandidates)
  throw Error("QUESTION_CANDIDATE_PROVENANCE_MISMATCH");
 const kind=editionId==="NPNF1-06"?
  "augustine_harmony_of_gospels_provisional":"chrysostom_matthew_homilies_provisional";
 const work=vol.scopes.find(x=>x.unit===kind);
 if(!work)throw Error("PRINTED_WORK_SCOPE_MISSING");
 const units=editionId==="NPNF1-06"?augustineUnits(lines,work):homilyUnits(lines,work);
 const entries=[],notAssigned=[];
 for(const window of existing.windows){
  const n=window.ocrLineQuestion;
  if(n<work.start||n>work.end)continue;
  const unit=units.find(x=>n>=x.startLine&&n<=x.endLine);
  if(!unit){notAssigned.push(n);continue}
  const context=lines.slice(window.ocrLineStart-1,window.ocrLineEnd).join("\n");
  if(context!==window.originalOCRWindow||hash(context)!==window.originalOCRWindowSHA256)
   throw Error("QUESTION_OCR_WINDOW_TEXT_CHANGED:"+editionId+":"+n);
  const questionLine=lines[n-1]||"";
  entries.push({
   id:window.id,editionId,workUnitId:unit.id,
   workUnitKind:unit.unitKind,workUnitLabel:unit.unitLabel,
   originalVolumeSHA256:vol.ocrSHA256,ocrLine:n,
   originalQuestionLineOCR:questionLine,originalQuestionLineSHA256:hash(questionLine),
   originalOCRContext:context,originalOCRContextSHA256:hash(context),
   lexicalCatenaOverlapHints:window.catenaOverlapHints,
   ...questionScreening(questionLine,unit,n),
   authorQuestionConfirmed:false,authorReplyVerified:false,
   novelBeyondCatena:false,publicationEligible:false
  });
 }
 const chapterHeadingCandidates=editionId==="NPNF1-06"?
  augustineChapterHeadingCandidates(lines,units):[];
 const countKind={candidate_author_rhetoric_unconfirmed:0,needs_source_layer_disambiguation:0};
 for(const item of entries)countKind[item.originScreening]++;
 for(const unit of units){
  unit.originalUnitOCRSHA256=hash(lines.slice(unit.startLine-1,unit.endLine).join("\n"));
  unit.questionWindowCount=entries.filter(q=>q.workUnitId===unit.id).length;
  unit.questionsWithLexicalCatenaHints=entries.filter(q=>
   q.workUnitId===unit.id&&q.lexicalCatenaOverlapHints.length).length;
  unit.sourceAuthorSpeakerVerified=false;unit.sourceOCRUnverified=true;
 }
 const result={
  schema:"ao.catena.schaff-source-unit-question-inventory.v1",
  editionId,sourceVolumeSHA256:vol.ocrSHA256,printedWorkScope:kind,
  workLineStart:work.start,workLineEnd:work.end,
  unitsFound:units.length,questionWindowsAssigned:entries.length,
  questionWindowsBeforeFirstUnit:notAssigned.length,
  questionOriginScreeningCounts:countKind,
  printedEditionOCRIsUnverified:true,
  biblicalQuotationAndFootnoteDisambiguationPending:true,
  sourceAttributionAndGenuineNoveltyPending:true,
  provisionalChapterHeadingCount:chapterHeadingCandidates.length,
  provisionalChapterHeadingEvidence:chapterHeadingCandidates,
  humanApprovals:0,publicationApprovals:0,units,questions:entries
 };
 writeFileSync(join(output,editionId+".source-units-and-questions.v1.json"),
  JSON.stringify(result,null,2)+"\n");
 return {editionId,units:units.length,questionWindows:entries.length,
  notAssigned:notAssigned.length,screeningCounts:countKind,
  possibleLexicalCatenaOverlaps:entries.filter(x=>x.lexicalCatenaOverlapHints.length).length,
  sourceVolumeSHA256:vol.ocrSHA256,publicationApprovals:0};
}
const volume=arg("--volume","all");
if(!["all","NPNF1-06","NPNF1-10"].includes(volume))throw Error("UNSUPPORTED_VOLUME");
const studies=(volume==="all"?["NPNF1-06","NPNF1-10"]:[volume]).map(processVolume);
const summary={schema:"ao.catena.schaff-source-unit-study-summary.v1",
 printedVolumes:studies.length,sourceUnits:studies.reduce((s,x)=>s+x.units,0),
 questionWindows:studies.reduce((s,x)=>s+x.questionWindows,0),
 authorQuestionsIndependentlyConfirmed:0,uniqueNonCatenaAnswersConfirmed:0,
 publicationApprovals:0,studies};
writeFileSync(join(output,"summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
