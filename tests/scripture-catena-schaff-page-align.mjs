import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s).digest("hex");
const base="dist/";
const out=read(base+"schaff-chrysostom-page-alignment/all-1938-page-coordinate-hints.v1.json");
const summary=read(base+"schaff-chrysostom-page-alignment/summary.v1.json");
const queue=read(base+"schaff-chrysostom-page-alignment/page-alignment-exception-queue.v1.json");
const source=read(base+"schaff-chrysostom-replies/chrysostom-all-structural-candidates.v1.json");
const coords=read(base+"schaff-layout-1888/acquisition-summary.v1.json");
const historic=readFileSync(base+"schaff-original-ocr/NPNF1-10.raw-ocr.txt","utf8");
const xml=readFileSync(base+"schaff-layout-1888/NPNF1-10.djvu.xml","utf8");
const scandata=readFileSync(base+"schaff-layout-1888/NPNF1-10.scandata.xml","utf8");
assert.equal(out.schema,"ao.catena.chrysostom-all-1938-original-1888-page-coordinate-hints.v1");
assert.equal(summary.schema,"ao.catena.chrysostom-1888-page-coordinate-alignment-summary.v1");
assert.deepEqual(out.summary,summary);
assert.equal(out.sourceOnlyUnverified,true);
assert.equal(out.sourcePageTextWasNotRewritten,true);
assert.equal(out.printedPageAndSpeakerMustStillBeConfirmed,true);
assert.equal(summary.unchangedDjVuXMLSHA256,sha(xml));
assert.equal(summary.unchangedDjVuXMLSHA256,coords.djvuXMLSHA256);
assert.equal(sha(scandata),coords.scandataXMLSHA256);
assert.equal(summary.unchangedOriginalPlainOCRSHA256,sha(historic));
assert.equal(summary.unchangedOriginalPlainOCRSHA256,source.historicalVolumeSHA256);
assert.equal(summary.scannedPageObjects,586);
assert.equal(summary.originalDjVuOCRWords,522127);
assert.equal(summary.sourceQuestionCandidates,1938);
assert.equal(summary.strongUniquePageMatches,1284);
assert.equal(summary.weakUniquePageMatches,634);
assert.equal(summary.ambiguousPageTies,18);
assert.equal(summary.noSixWordMatch,2);
assert.equal(summary.fallbackToPriorQuestionContextForShortLine,21);
assert.equal(summary.originalOCRLineToScanLeafOrderReversals,0);
assert.equal(queue.schema,"ao.catena.chrysostom-1888-page-alignment-exception-queue.v1");
assert.equal(queue.unresolvedPageHints,20);
assert.equal(queue.weakerUniquePageHints,634);
assert.equal(queue.sourcePassagesInQueue,654);
assert.equal(queue.entries.length,654);
assert.equal(queue.originalVolumeSHA256,source.historicalVolumeSHA256);
assert.equal(queue.originalPageXMLSHA256,coords.djvuXMLSHA256);
assert.equal(queue.sourceCriticalPageIdentitiesAuthenticated,0);
assert.equal(queue.publicationApprovals,0);
assert.deepEqual(queue.entries.slice(0,2).map(x=>x.pageMatchState),
 ["no_six_word_anchor","no_six_word_anchor"]);
assert.ok(queue.entries.slice(2,20).every(x=>x.pageMatchState==="ambiguous_page_tie"));
assert.ok(queue.entries.slice(20).every(x=>x.pageMatchState==="weak_unique_original_OCR_page_match"));
const mappedRows=new Map(out.rows.map(r=>[r.id,r]));
for(const exception of queue.entries){
 const sourceRow=mappedRows.get(exception.sourceId);
 assert.ok(sourceRow);
 assert.equal(exception.originalOCRQuestionLine,sourceRow.originalOCRQuestionLine);
 assert.equal(exception.pageMatchState,sourceRow.pageMatchState);
 assert.equal(exception.scannedLeafProvisional,sourceRow.scannedLeaf);
 assert.equal(exception.historicalSourceQuestionSHA256,sourceRow.sourceQuestionSHA256);
 assert.equal(exception.exactSixWordAnchor,
  sourceRow.sixWordEvidence?.exactSixWordSourceOCR||null);
 assert.equal(exception.originalQuestionSpeakerCertified,false);
 assert.equal(exception.publicationEligible,false);
}
for(const k of ["sourceSpeakerCertifications","originalGreekCollations",
 "authenticatedAnswers","publicationApprovals"])assert.equal(summary[k],0);
const normalize=s=>(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim().split(/\s+/).filter(Boolean);
const originalRows=new Map(source.records.map(x=>[x.id,x]));
const lines=historic.replace(/\r/g,"").split("\n");
const historicalTextSHA256=sha(historic),historicalPageXMLSHA256=sha(xml);
const pages=new Map();
for(const page of xml.matchAll(/<OBJECT\b[^>]*>([\s\S]*?)<\/OBJECT\s*>/gi)){
 const leaf=/<PARAM\s+name="PAGE"\s+value="[^"]*_(\d+)\.djvu"\s*\/>/i.exec(page[1]);
 assert.ok(leaf);
 pages.set(Number(leaf[1]),page[1]);
}
assert.equal(pages.size,586);
assert.equal(out.leaves.length,586);
const ids=new Set();let mapped=0,high=0,weak=0,ties=0,missing=0;
for(const r of out.rows){
 assert.ok(!ids.has(r.id));ids.add(r.id);
 const original=originalRows.get(r.id);
 assert.ok(original);
 assert.equal(r.originalOCRQuestionLine,original.originalQuestionLine);
 assert.equal(r.sourceQuestionSHA256,original.originalQuestionSourceSpanSHA256);
 assert.equal(r.original1888PlainTextVolumeSHA256,historicalTextSHA256);
 assert.equal(r.originalDjVuXMLSHA256,historicalPageXMLSHA256);
 assert.equal(original.exactQuestionLineOCR,lines[r.originalOCRQuestionLine-1]);
 assert.equal(sha(original.originalQuestionSourceSpan),r.sourceQuestionSHA256);
 assert.equal(r.notAVisuallyVerifiedPrintedPageCitation,true);
 assert.equal(r.historicalOCRReadingOrderNotCriticallyVerified,true);
 assert.equal(r.biblicalAndFatherSpeakerNotSeparated,true);
 assert.equal(r.sourceQuoteOrAnswerBoundaryNotCertified,true);
 assert.equal(r.publicationEligible,false);
 assert.ok(r.sixWordAnchorsFromOriginalOCR>=0);
 assert.ok(r.matchedOriginalOCRSixWordAnchors>=0);
 assert.ok(r.runnerUpPageAnchorMatches>=0);
 if(r.pageMatchState==="strong_unique_original_OCR_page_match")high++;
 else if(r.pageMatchState==="weak_unique_original_OCR_page_match")weak++;
 else if(r.pageMatchState==="ambiguous_page_tie")ties++;
 else if(r.pageMatchState==="no_six_word_anchor")missing++;
 else assert.fail("Unsupported match state");
 if(!r.scannedLeaf){
  assert.ok(["ambiguous_page_tie","no_six_word_anchor"].includes(r.pageMatchState));
  assert.equal(r.sixWordEvidence,null);
  continue;
 }
 mapped++;
 assert.ok(["strong_unique_original_OCR_page_match",
  "weak_unique_original_OCR_page_match"].includes(r.pageMatchState));
 const page=pages.get(r.scannedLeaf),e=r.sixWordEvidence;
 assert.ok(page&&e);
 assert.match(r.originalScanPage,/\.djvu$/);
 assert.match(e.originalCoordinatesFirstWord,/^\d+,\d+,\d+,\d+$/);
 assert.match(e.originalCoordinatesSixthWord,/^\d+,\d+,\d+,\d+$/);
 assert.equal(e.exactSixWordSourceOCR.split(" ").length,6);
 const sourcePhrase=r.usedPriorLineContextForShortQuestion?
  original.originalQuestionSourceSpan:original.exactQuestionLineOCR;
 assert.ok(normalize(sourcePhrase).join(" ").includes(e.exactSixWordSourceOCR),
  "Page evidence must derive from the literal original source question text");
 const columns=[...page.matchAll(/<PAGECOLUMN\b[^>]*>([\s\S]*?)<\/PAGECOLUMN\s*>/gi)];
 assert.ok(e.pageColumnOrdinal>=0&&e.pageColumnOrdinal<columns.length);
 const column=columns[e.pageColumnOrdinal][1];
 const words=[];
 for(const w of column.matchAll(/<WORD\b([^>]*)>([\s\S]*?)<\/WORD\s*>/gi)){
  const coords=/\bcoords="([^"]+)"/.exec(w[1]);
  const value=w[2].replace(/&amp;/gi,"&").replace(/&quot;/gi,'"')
   .replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(Number(n)));
  for(const token of normalize(value))words.push({token,coords:coords?.[1]||null});
 }
 const desired=e.exactSixWordSourceOCR.split(" ");
 let found=false;
 for(let i=0;i+6<=words.length;i++){
  if(words.slice(i,i+6).map(x=>x.token).join(" ")!==desired.join(" "))continue;
  if(words[i].coords===e.originalCoordinatesFirstWord&&
    words[i+5].coords===e.originalCoordinatesSixthWord){found=true;break}
 }
 assert.ok(found,"Source word coordinates must truly occur in original historical page XML");
}
assert.equal(ids.size,1938);
assert.equal(mapped,1918);
assert.deepEqual([high,weak,ties,missing],[1284,634,18,2]);
assert.equal(out.monotonicityExceptions.length,0);
const ordered=out.rows.filter(x=>x.scannedLeaf!==null)
 .sort((a,b)=>a.originalOCRQuestionLine-b.originalOCRQuestionLine);
for(let i=1;i<ordered.length;i++)
 assert.ok(ordered[i].scannedLeaf>=ordered[i-1].scannedLeaf);
console.log("PASS: 1938 historical Chrysostom questions matched against source-pinned word-coordinate scan pages: 1284 strong, 634 weaker, 18 ties, 2 unmatched; zero Father answers");
