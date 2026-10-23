#!/usr/bin/env node
/**
 * Source-owned textual parallels for Chrysostom's 24 Matthew Catena-overlap
 * research leads. ORIGINAL OCR and canonical Catena fragments are copied
 * byte-for-byte with source digest. This does not certify theological or
 * authorial identity; in particular a shared Gospel quotation is not
 * duplicated exposition.
 *
 * Source corpus: immutable 1888 Schaff NPNF print OCR research artifact.
 * Parallel corpus: repository's canonical Oxford/Newman Matthew Catena.
 *
 * Run after the original question-prose, speech-layer and lexical-overlap jobs.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
const arg=(key,def)=>{const x=process.argv.indexOf(key);return x<0?def:process.argv[x+1]};
const input=resolve(arg("--research-dir","dist"));
const output=resolve(arg("--output-dir","dist/schaff-chrysostom-focused-parallels"));
const json=file=>JSON.parse(readFileSync(file,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const lexical=json(join(input,"schaff-chrysostom-catena-overlap/literal-overlap-source-evidence.v1.json"));
const speech=json(join(input,"schaff-chrysostom-speech-layers/speech-layer-source-triage.v1.json"));
const originals=json(join(input,"schaff-chrysostom-replies/chrysostom-question-ensuing-prose.v1.json"));
const catena=json("data/scripture/catena/matthew.json");
if(lexical.schema!=="ao.catena.chrysostom-canonical-matthew-literal-overlap-evidence.v1"||
 speech.schema!=="ao.catena.chrysostom-speech-layer-source-triage.v1"||
 originals.schema!=="ao.catena.chrysostom-historical-OCR-question-ensuing-prose.v1"||
 lexical.rows.length!==180||lexical.pinnedWitnesses.length!==4||
 speech.rows.length!==180||speech.pinnedWitnesses.length!==4||
 originals.rows.length!==180||originals.pinnedOriginalWorkEvidence.length!==4||
 lexical.sourceSha256!==originals.originalVolumeSHA256||
 speech.originalVolumeSHA256!==originals.originalVolumeSHA256)
 throw Error("SOURCE_RESEARCH_LEDGER_CHANGED");
const canon=new Map();
for(const p of catena.pericopes){
 if(!p.id.startsWith("catena.matthew."))throw Error("UNEXPECTED_CANONICAL_BOOK");
 p.segments.forEach((s,i)=>{
  const ptr=p.id+":"+i;
  if(!s?.text||!s.father||canon.has(ptr))throw Error("CANONICAL_CATENA_SEGMENT_INVALID");
  canon.set(ptr,{pointer:ptr,pericopeId:p.id,inheritedFatherLabel:s.father,
   exactOriginalCatenaWords:s.text,originalCatenaSHA256:sha(s.text),
   originalWordsOwnedByCanonicalCatena:true});
 });
}
if(canon.size!==4825)throw Error("EXPECTED_FROZEN_MATTHEW_CATENA_SEGMENTS");
const normal=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g,"$1$2")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const byOriginal=new Map(originals.rows.map(x=>[x.id,x]));
const byPinned=new Map(originals.pinnedOriginalWorkEvidence.map(x=>[x.seedId,x]));
const byRisk=new Map([...speech.rows,...speech.pinnedWitnesses].map(x=>[x.sourceId,x]));
const combined=[...lexical.rows,...lexical.pinnedWitnesses];
const focused=combined.filter(x=>
 x.canonicalLexicalOverlapEvidence.some(h=>h.canonicalInheritedFatherLabelMatchesChrysostom));
if(focused.length!==24||new Set(focused.map(x=>x.sourceId)).size!==24)
 throw Error("EXPECTED_24_CHRYSOSTOM_FOCUS_LEADS");
function phraseEvidenceSourceState(originalPhrase,rawProse,speaker){
 const normalizedPhrase=normal(originalPhrase),all=normal(rawProse);
 if(!all.includes(normalizedPhrase))throw Error("HISTORIC_OCR_DOES_NOT_CONTAIN_MATCHED_PHRASE");
 const span=speaker.quoteEvidence.sourceQuoteSpans;
 const pairedQuotedEvidence=span.some(s=>normal(s.exactOriginalOCR).includes(normalizedPhrase));
 const withoutDetectedQuotes=rawProse.split("").map((c,i)=>{
  return span.some(s=>i>=s.startOffset&&i<s.endOffset)?" ":c
 }).join("");
 const outsideQuotedEvidence=normal(withoutDetectedQuotes).includes(normalizedPhrase);
 const quoteBoundaryUnresolved=speaker.quoteEvidence.unpairedOrUnresolvedDelimiters.length>0;
 return {
  fiveWordPhrase:originalPhrase,
  inPairedPrintedQuotation:pairedQuotedEvidence,
  foundOutsideDetectedPairedQuotations:outsideQuotedEvidence,
  printedQuotationBoundaryIncomplete:quoteBoundaryUnresolved,
  assessment:"literal_words_only_speaker_not_verified"
 };
}
const packets=focused.map(r=>{
 const original=r.sourceKind==="homily_question_context"?
  byOriginal.get(r.sourceId):byPinned.get(r.sourceId),risk=byRisk.get(r.sourceId);
 if(!original||!risk)throw Error("UNRESOLVED_SOURCE_RECORD");
 const question=r.sourceKind==="homily_question_context"?
  original.originalQuestionSourceSpan:original.exactOCRQuestionUpToMark;
 const prose=r.sourceKind==="homily_question_context"?
  original.originalEnsuingProseOCR:original.exactOCREnsuingProse;
 const context=r.sourceKind==="homily_question_context"?
  original.originalContextOCR:original.completeOriginalOCR;
 const fullDigest=r.sourceKind==="homily_question_context"?
  original.originalEnsuingProseSHA256:original.completeOCRSHA256;
 if(sha(prose)!==risk.originalEnsuingProseSHA256||
  sha(question)!==risk.originalQuestionSHA256||
  r.historicalSourceSHA256!==fullDigest)
  throw Error("CHANGED_SOURCE_OR_QUESTION_TEXT");
 const matches=r.canonicalLexicalOverlapEvidence.map(h=>{
  const other=canon.get(h.canonicalSourcePointer);
  if(!other||h.canonicalInCatenaFatherLabel!==other.inheritedFatherLabel||
   h.canonicalInheritedFatherLabelMatchesChrysostom!==(other.inheritedFatherLabel==="Chrysostom"))
    throw Error("CANONICAL_INHERITED_FATHER_LABEL_CHANGED");
  const phrases=h.phraseEvidence.map(p=>{
   if(!normal(other.exactOriginalCatenaWords).includes(p))
    throw Error("CANONICAL_PARALLEL_MISSING_EXACT_FIVE_WORDS");
   return phraseEvidenceSourceState(p,prose,risk);
  });
  return {...other,sharedIndependentFiveWordPhrases:h.sharedIndependentFiveWordPhrases,
   matchedPhraseEvidence:phrases,
   wordingOverlapIsNotPatristicSourceIdentity:true,
   semanticEquivalenceReviewed:false,possibleSharedGospelTextNotResolved:true};
 });
 const same=matches.filter(x=>x.inheritedFatherLabel==="Chrysostom");
 if(!same.length)throw Error("NOT_A_SAME_ATTRIBUTION_FOCUS_ROW");
 // A work unit may have prose containing a different Gospel verse quotation;
 // no same-pericope assertion is made from 5-word similarity alone.
 return {
  id:r.sourceId,sourceKind:r.sourceKind,
  historicalPrintedHomily:r.historicalPrintedHomily,
  historicalPrintedLine:r.historicalPrintedLine,
  historicalVolumeSHA256:originals.originalVolumeSHA256,
  exactOriginalOCRQuestion:question,originalQuestionSHA256:sha(question),
  exactOriginalOCREnsuingProse:prose,originalEnsuingProseSHA256:sha(prose),
  exactHistoricalOCRContext:context,historicalContextSHA256:sha(context),
  quotationSourceEvidence:risk.quoteEvidence,
  additionalQuestionMarksInsideEnsuingProse:risk.additionalQuestionMarksInsideProse,
  sourceRisks:risk.sourceLayerRisks,
  originalPrintedHomilyLabel:r.historicalPrintedHomily,
  inheritedChrysostomCatenaParallelCount:same.length,
  catenaParallels:matches,
  hasPairedPrintedQuotation:risk.quoteEvidence.sourceQuoteSpans.length>0,
  anyMatchWithinPairedPrintedQuotation:matches.some(x=>
   x.matchedPhraseEvidence.some(p=>p.inPairedPrintedQuotation)),
  originalQuestionSpeakerAuthenticated:false,
  sourceAnswerBoundaryEstablished:false,
  patristicTextualIdentityEstablished:false,
  patristicArgumentEquivalenceEstablished:false,
  novelContentVerified:false,publicationApproval:false
 };
});
const onlyChrysostom=(p)=>p.catenaParallels.filter(x=>x.inheritedFatherLabel==="Chrysostom");
const ranking=packets.map(p=>({
 id:p.id,originalPrintedHomilyLabel:p.originalPrintedHomilyLabel,
 sourceWarnings:p.sourceRisks.length,
 sameInheritedAuthorPointers:onlyChrysostom(p).map(x=>x.pointer),
 maximumSharedFiveWordPhrases:Math.max(...onlyChrysostom(p).map(x=>x.sharedIndependentFiveWordPhrases)),
 originalQuestionStartsInsideOCRColumnLine:
  p.sourceKind==="homily_question_context"?
   byOriginal.get(p.id).OCRQuestionStartsOnPriorLine:false,
 safeToPublish:false
})).sort((a,b)=>a.sourceWarnings-b.sourceWarnings||
 b.maximumSharedFiveWordPhrases-a.maximumSharedFiveWordPhrases||
 a.id.localeCompare(b.id));
const summary={
 schema:"ao.catena.chrysostom-focused-literal-parallel-summary.v1",
 sourceEdition:"Schaff NPNF I/X 1888 original scan OCR",
 canonicalEdition:"Oxford/Newman Catena Aurea Matthew",
 canonicalCatenaSourceSegments:canon.size,
 sourcesSelectedForSameInheritedAuthorOverlap:packets.length,
 historicalOriginalContextPassagesRetained:packets.length,
 focusedSourcesWithPrintedQuoteSpans:packets.filter(x=>x.hasPairedPrintedQuotation).length,
 focusedSourcesWithLiteralSharedWordsInsidePrintedQuote:packets.filter(x=>
  x.anyMatchWithinPairedPrintedQuotation).length,
 focusedSourcesWithUnresolvedPrintedQuoteBoundary:packets.filter(x=>
  x.quotationSourceEvidence.unpairedOrUnresolvedDelimiters.length>0).length,
 distinctCanonicalChrysostomCandidatePointers:
  new Set(packets.flatMap(x=>onlyChrysostom(x).map(y=>y.pointer))).size,
 historicalQuestionSpeakersAuthenticated:0,
 originalAnswerBoundariesEstablished:0,
 validatedTheologicalDuplicates:0,verifiedNovelPatristicAnswers:0,
 humanReviews:0,publicationApprovals:0
};
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"focused-chrysostom-source-parallels.v1.json"),
 JSON.stringify({schema:"ao.catena.chrysostom-focused-literal-parallels.v1",
  originalVolumeSHA256:originals.originalVolumeSHA256,
  authorIdentityCriticallyVerified:false,
  printedQuoteMeansScripture:false,
  notAShippableMessengerCorpus:true,
  summary,prioritizedForFurtherSourceResearch:ranking,packets},null,2)+"\n");
writeFileSync(join(output,"summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
