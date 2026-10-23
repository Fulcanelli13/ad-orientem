#!/usr/bin/env node
/*
 * Align all 1938 Chrysostom structural-question OCR lines to the actual
 * 1888 scan page/word-coordinate records. This is a locator, not a certified
 * quotation, patristic speaker attribution, or complete answer boundary.
 *
 * Requires the preexisting original OCR research artifact plus
 * scripts/scripture-catena-schaff-layout-acquire.mjs output.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
const opt=(x,d)=>{const i=process.argv.indexOf(x);return i<0?d:process.argv[i+1]};
const base=resolve(opt("--source-dir","dist"));
const layout=resolve(opt("--layout-dir","dist/schaff-layout-1888"));
const output=resolve(opt("--output-dir","dist/schaff-chrysostom-page-alignment"));
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=b=>createHash("sha256").update(b).digest("hex");
const q=read(join(base,"schaff-chrysostom-replies/chrysostom-all-structural-candidates.v1.json"));
const unit=read(join(base,"schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json"));
const raw=readFileSync(join(base,"schaff-original-ocr/NPNF1-10.raw-ocr.txt"),"utf8");
const acquisition=read(join(layout,"acquisition-summary.v1.json"));
const djvu=readFileSync(join(layout,"NPNF1-10.djvu.xml"));
const scan=readFileSync(join(layout,"NPNF1-10.scandata.xml"));
const PIN_DJVU="f5ac920b83c568a03bb4f22d5f7dbd4e89e93388c092b56a441c8935b428ea08";
const PIN_SCAN="cf9aaa8eb4099af7fe0bdc082070e08681eef4eea9e866f3ddc43c9468e49782";
if(q.schema!=="ao.catena.chrysostom-all-structural-question-prose-ocr.v1"||
 q.records.length!==1938||unit.units.length!==90||
 sha(raw)!==unit.sourceVolumeSHA256||
 sha(raw)!==q.historicalVolumeSHA256||
 acquisition.editionId!=="NPNF1-10"||
 sha(djvu)!==PIN_DJVU||acquisition.djvuXMLSHA256!==PIN_DJVU||
 sha(scan)!==PIN_SCAN||acquisition.scandataXMLSHA256!==PIN_SCAN)
 throw Error("HISTORICAL_SOURCE_OR_LAYOUT_BYTES_CHANGED");
const originalLines=raw.toString("utf8").replace(/\r/g,"").split("\n");
const normalize=s=>(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim().split(/\s+/).filter(Boolean);
function grams(w){
 const result=new Set();
 for(let i=0;i+6<=w.length;i++)result.add(w.slice(i,i+6).join(" "));
 return [...result];
}
function decode(s){
 const entities={amp:"&",lt:"<",gt:">",quot:'"',apos:"'"};
 return s.replace(/&(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-f]+);/gi,m=>{
  const key=m.slice(1,-1).toLowerCase();
  if(entities[key])return entities[key];
  const n=key.startsWith("#x")?parseInt(key.slice(2),16):
   key.startsWith("#")?Number(key.slice(1)):null;
  return n>0&&n<=0x10ffff?String.fromCodePoint(n):m;
 });
}
const question=[],wanted=new Set();
for(const r of q.records){
 if(originalLines[r.originalQuestionLine-1]!==r.exactQuestionLineOCR||
  sha(r.exactQuestionLineOCR)!==r.exactQuestionLineSHA256)
  throw Error("ORIGINAL_QUESTION_LINE_CHANGED:"+r.id);
 const a=grams(normalize(r.exactQuestionLineOCR));
 const b=a.length?[]:grams(normalize(r.originalQuestionSourceSpan));
 const phrases=a.length?a:b;
 for(const g of phrases)wanted.add(g);
 question.push({source:r,phrases,usedPriorContext:!a.length});
}
const scandata=new Map();
for(const p of scan.toString("utf8").matchAll(/<page\b([^>]*)>([\s\S]*?)<\/page>/gi)){
 const leaf=/\bleafNum="(\d+)"/.exec(p[1]);
 if(!leaf)continue;
 const field=n=>{
  const re=new RegExp("<"+n+"(?:\\s[^>]*)?>([\\s\\S]*?)<\\/"+n+">","i");
  const m=re.exec(p[2]);return m?decode(m[1].trim()):null;
 };
 scandata.set(Number(leaf[1]),{label:field("pageNumber"),
  pageType:field("pageType"),handSide:field("handSide")});
}
const pageList=[],postings=new Map();
for(const object of djvu.toString("utf8").matchAll(/<OBJECT\b([^>]*)>([\s\S]*?)<\/OBJECT\s*>/gi)){
 const param=/<PARAM\s+name="PAGE"\s+value="([^"]+)"\s*\/>/i.exec(object[2]);
 const leaf=param&&/_(\d+)\.djvu$/.exec(param[1]);
 if(!leaf)throw Error("ORIGINAL_PAGE_IDENTIFIER_MISSING");
 const leafNum=Number(leaf[1]),meta=scandata.get(leafNum)||{},pageIndex=pageList.length;
 pageList.push({pageIndex,leafNum,originalScanPage:param[1],
  originalPrintedPageLabelFromScandata:meta.label||null,
  originalScanPageType:meta.pageType||null,originalScanHandSide:meta.handSide||null});
 let column=0;
 for(const c of object[2].matchAll(/<PAGECOLUMN\b[^>]*>([\s\S]*?)<\/PAGECOLUMN\s*>/gi)){
  const words=[];let paragraph=0,line=0;
  for(const para of c[1].matchAll(/<PARAGRAPH\b[^>]*>([\s\S]*?)<\/PARAGRAPH\s*>/gi)){
   paragraph++;
   for(const l of para[1].matchAll(/<LINE\b[^>]*>([\s\S]*?)<\/LINE\s*>/gi)){
    line++;
    for(const w of l[1].matchAll(/<WORD\b([^>]*)>([\s\S]*?)<\/WORD\s*>/gi)){
     const coords=/\bcoords="([^"]+)"/.exec(w[1]);
     for(const token of normalize(decode(w[2].replace(/<[^>]*>/g,""))))
      words.push({token,originalCoordinates:coords?.[1]||null,
       pageColumnOrdinal:column,paragraphOrdinalInColumn:paragraph,
       lineOrdinalInColumn:line});
    }
   }
  }
  for(let i=0;i+6<=words.length;i++){
   const gram=words.slice(i,i+6).map(w=>w.token).join(" ");
   if(!wanted.has(gram))continue;
   if(!postings.has(gram))postings.set(gram,new Map());
   const posting=postings.get(gram);
   if(!posting.has(pageIndex))posting.set(pageIndex,{
    originalFirstWordCoords:words[i].originalCoordinates,
    originalSixthWordCoords:words[i+5].originalCoordinates,
    pageColumnOrdinal:column,
    paragraphOrdinalInColumn:words[i].paragraphOrdinalInColumn,
    lineOrdinalInColumn:words[i].lineOrdinalInColumn});
  }
  column++;
 }
}
if(pageList.length!==586||pageList.length!==acquisition.pageObjects)
 throw Error("ORIGINAL_1888_SCAN_PAGE_COUNT_CHANGED");
const counts={strong:0,weak:0,tie:0,missing:0,fallback:0},rows=[];
for(const query of question){
 const pageVotes=new Map();
 for(const gram of query.phrases){
  for(const [i,coord] of postings.get(gram)||[]){
   if(!pageVotes.has(i))pageVotes.set(i,{votes:0,originalSixWordPhrase:gram,coord});
   pageVotes.get(i).votes++;
  }
 }
 const ranking=[...pageVotes].sort((a,b)=>b[1].votes-a[1].votes||a[0]-b[0]);
 const top=ranking[0]||null,second=ranking[1]||null;
 const best=top?.[1].votes||0,runnerUp=second?.[1].votes||0;
 const state=!best?"no_six_word_anchor":
  best===runnerUp?"ambiguous_page_tie":
  best>=3&&best-runnerUp>=2?"strong_unique_original_OCR_page_match":
  "weak_unique_original_OCR_page_match";
 if(state.startsWith("strong"))counts.strong++;
 else if(state.startsWith("weak"))counts.weak++;
 else if(state.startsWith("ambiguous"))counts.tie++;
 else counts.missing++;
 counts.fallback+=Number(query.usedPriorContext);
 const pg=top&&state!=="ambiguous_page_tie"?pageList[top[0]]:null;
 rows.push({id:query.source.id,originalOCRQuestionLine:query.source.originalQuestionLine,
  sourceQuestionSHA256:query.source.originalQuestionSourceSpanSHA256,
  original1888PlainTextVolumeSHA256:unit.sourceVolumeSHA256,
  originalDjVuXMLSHA256:PIN_DJVU,
  scannedLeaf:pg?.leafNum??null,
  originalScanPage:pg?.originalScanPage??null,
  printedPageLabelFromScandata:pg?.originalPrintedPageLabelFromScandata??null,
  scanHandSide:pg?.originalScanHandSide??null,
  pageMatchState:state,
  sixWordAnchorsFromOriginalOCR:query.phrases.length,
  matchedOriginalOCRSixWordAnchors:best,
  runnerUpPageAnchorMatches:runnerUp,
  usedPriorLineContextForShortQuestion:query.usedPriorContext,
  sixWordEvidence:pg?{
   exactSixWordSourceOCR:top[1].originalSixWordPhrase,
   originalCoordinatesFirstWord:top[1].coord.originalFirstWordCoords,
   originalCoordinatesSixthWord:top[1].coord.originalSixthWordCoords,
   pageColumnOrdinal:top[1].coord.pageColumnOrdinal,
   paragraphOrdinalInColumn:top[1].coord.paragraphOrdinalInColumn,
   lineOrdinalInColumn:top[1].coord.lineOrdinalInColumn,
   hasPotentialOCRAlternativePage:!!second}:null,
  notAVisuallyVerifiedPrintedPageCitation:true,
  historicalOCRReadingOrderNotCriticallyVerified:true,
  biblicalAndFatherSpeakerNotSeparated:true,
  sourceQuoteOrAnswerBoundaryNotCertified:true,publicationEligible:false});
}
const monotone=rows.filter(x=>x.scannedLeaf!==null)
 .sort((a,b)=>a.originalOCRQuestionLine-b.originalOCRQuestionLine);
const orderingExceptions=[];
for(let i=1;i<monotone.length;i++)
 if(monotone[i].scannedLeaf<monotone[i-1].scannedLeaf)
  orderingExceptions.push({prior:monotone[i-1].id,next:monotone[i].id,
   originalOCRLine:monotone[i].originalOCRQuestionLine,
   precedingScannedLeaf:monotone[i-1].scannedLeaf,
   nextScannedLeaf:monotone[i].scannedLeaf});
const summary={
 schema:"ao.catena.chrysostom-1888-page-coordinate-alignment-summary.v1",
 scannedPageObjects:pageList.length,originalDjVuOCRWords:acquisition.ocrWords,
 sourceQuestionCandidates:rows.length,
 strongUniquePageMatches:counts.strong,weakUniquePageMatches:counts.weak,
 ambiguousPageTies:counts.tie,noSixWordMatch:counts.missing,
 fallbackToPriorQuestionContextForShortLine:counts.fallback,
 originalOCRLineToScanLeafOrderReversals:orderingExceptions.length,
 unchangedDjVuXMLSHA256:PIN_DJVU,
 unchangedOriginalPlainOCRSHA256:unit.sourceVolumeSHA256,
 sourceSpeakerCertifications:0,originalGreekCollations:0,
 authenticatedAnswers:0,publicationApprovals:0
};
if(rows.length!==1938||counts.strong+counts.weak+counts.tie+counts.missing!==1938)
 throw Error("SOURCE_PAGE_LOCATOR_COVERAGE_CHANGED");
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"all-1938-page-coordinate-hints.v1.json"),
 JSON.stringify({schema:"ao.catena.chrysostom-all-1938-original-1888-page-coordinate-hints.v1",
  sourceOnlyUnverified:true,sourcePageTextWasNotRewritten:true,
  printedPageAndSpeakerMustStillBeConfirmed:true,
  summary,leaves:pageList,monotonicityExceptions:orderingExceptions,rows},null,2)+"\n");
const exceptions=rows.filter(x=>x.pageMatchState!=="strong_unique_original_OCR_page_match")
 .sort((a,b)=>({no_six_word_anchor:0,ambiguous_page_tie:1,
  weak_unique_original_OCR_page_match:2}[a.pageMatchState]??3)-
  ({no_six_word_anchor:0,ambiguous_page_tie:1,
    weak_unique_original_OCR_page_match:2}[b.pageMatchState]??3)||
   a.originalOCRQuestionLine-b.originalOCRQuestionLine);
const unresolved=exceptions.filter(x=>x.scannedLeaf===null);
writeFileSync(join(output,"page-alignment-exception-queue.v1.json"),
 JSON.stringify({
  schema:"ao.catena.chrysostom-1888-page-alignment-exception-queue.v1",
  originalVolumeSHA256:unit.sourceVolumeSHA256,
  originalPageXMLSHA256:PIN_DJVU,
  queuePurpose:"Machine-research disambiguation and historical scan-page OCR verification; not human-review or publication",
  unresolvedPageHints:unresolved.length,
  weakerUniquePageHints:exceptions.length-unresolved.length,
  sourcePassagesInQueue:exceptions.length,
  sourceCriticalPageIdentitiesAuthenticated:0,
  publicationApprovals:0,
  entries:exceptions.map(r=>({
   sourceId:r.id,originalOCRQuestionLine:r.originalOCRQuestionLine,
   pageMatchState:r.pageMatchState,
   scannedLeafProvisional:r.scannedLeaf,
   historicalSourceQuestionSHA256:r.sourceQuestionSHA256,
   exactSixWordAnchor:r.sixWordEvidence?.exactSixWordSourceOCR||null,
   machineNextStep:r.scannedLeaf===null?
    "recover_or_disambiguate_original_scan_coordinate_anchor":
    "strengthen_page_anchor_with_longer_context_and_printed_scan_location",
   originalQuestionSpeakerCertified:false,
   publicationEligible:false
  }))
 },null,2)+"\n");
writeFileSync(join(output,"summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
