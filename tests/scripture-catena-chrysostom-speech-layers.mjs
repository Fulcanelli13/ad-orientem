import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const base="dist/schaff-chrysostom-replies/";
const source=read(base+"chrysostom-question-ensuing-prose.v1.json");
const output=read("dist/schaff-chrysostom-speech-layers/speech-layer-source-triage.v1.json");
const summary=read("dist/schaff-chrysostom-speech-layers/summary.v1.json");
assert.equal(output.schema,"ao.catena.chrysostom-speech-layer-source-triage.v1");
assert.equal(summary.schema,"ao.catena.chrysostom-speech-layer-summary.v1");
assert.equal(output.researchOnly,true);
assert.equal(output.approvedForMessenger,false);
assert.equal(output.quoteTypographyCannotProveScriptureSpeaker,true);
assert.equal(output.wordsRewrittenOrNormalized,false);
assert.equal(output.originalVolumeSHA256,source.originalVolumeSHA256);
assert.deepEqual(output.summary,summary);
assert.equal(output.rows.length,180);
assert.equal(output.pinnedWitnesses.length,4);
assert.equal(summary.checkedHomilySampleEnvelopes,180);
assert.equal(summary.checkedPriorBibliographicWitnesses,4);
assert.equal(summary.parentOriginalOCRVolumeSHA256,source.originalVolumeSHA256);
const originalRows=new Map(source.rows.map(x=>[x.id,x]));
const originalPinned=new Map(source.pinnedOriginalWorkEvidence.map(x=>[x.seedId,x]));
assert.equal(originalRows.size,180);
assert.equal(originalPinned.size,4);
const all=[...output.rows,...output.pinnedWitnesses],ids=new Set();
const checkSnippet=(text,s)=>{assert.ok(s.offset>=0);
 assert.equal(text.slice(s.offset,s.offset+s.length),s.exactOriginalOCR);
 assert.equal(sha(s.exactOriginalOCR),s.exactOriginalSHA256);};
for(const row of all){
 assert.ok(!ids.has(row.sourceId));ids.add(row.sourceId);
 const orig=row.sourceKind==="research_envelope"?
  originalRows.get(row.sourceId):originalPinned.get(row.sourceId);
 assert.ok(orig,"Risk classification must point to a frozen original OCR source");
 const question=row.sourceKind==="research_envelope"?
  orig.originalQuestionSourceSpan:orig.exactOCRQuestionUpToMark;
 const prose=row.sourceKind==="research_envelope"?
  orig.originalEnsuingProseOCR:orig.exactOCREnsuingProse;
 assert.equal(sha(question),row.originalQuestionSHA256);
 assert.equal(sha(prose),row.originalEnsuingProseSHA256);
 assert.equal(row.ensuingProseCharacters,prose.length);
 if(row.sourceKind==="research_envelope"){
  assert.equal(row.sourceOriginalTextDigests.originalQuestionLineSHA256,
   orig.exactQuestionLineSHA256);
  assert.equal(row.sourceOriginalTextDigests.originalContextSHA256,
   orig.originalContextSHA256);
 }else assert.equal(row.sourceOriginalTextDigests.originalCompleteOCRSHA256,
  orig.completeOCRSHA256);
 const quote=row.quoteEvidence;
 assert.equal(quote.quoteBoundaryCriticallyVerified,false);
 assert.equal(quote.quotedTextNotNecessarilyFatherAuthored,true);
 assert.equal(quote.delimiterCount,[...prose.matchAll(/["“”]/g)].length);
 for(const span of quote.sourceQuoteSpans){
  assert.equal(prose.slice(span.startOffset,span.endOffset),span.exactOriginalOCR);
  assert.equal(sha(span.exactOriginalOCR),span.originalSHA256);
  assert.equal(span.attribution,"unknown_printed_quote_may_be_scripture_or_reported_speech");
 }
 for(const marker of quote.unpairedOrUnresolvedDelimiters)
  assert.equal(prose[marker.offset],marker.glyph);
 for(const cue of row.otherSpeakerTextCues)checkSnippet(prose,cue);
 for(const cue of row.reportedInterlocutorTextCues)checkSnippet(question+"\n"+prose,cue);
 for(const cue of row.possibleScriptureReferenceTextCues)checkSnippet(prose,cue);
 for(const cue of row.possibleFootnoteTextCues)checkSnippet(prose,cue);
 for(const cue of row.possibleHeadingTextCues)checkSnippet(prose,cue);
 assert.equal(row.additionalQuestionMarksInsideProse,
  [...prose.matchAll(/\?/g)].length);
 assert.ok(["source_layer_disambiguation_needed",
   "no_visible_source_layer_cue_authorship_still_unverified"]
  .includes(row.sourceAttributionTriage));
 assert.equal(row.sourceAttributionTriage==="source_layer_disambiguation_needed",
  row.sourceLayerRisks.some(x=>x!=="ocr_line_wrap_hyphenation_preserved"));
 for(const field of ["speakerProvedFromOriginalWork","answerSpanCriticallyEstablished",
 "completeSourceAnswerValidated","novelBeyondExistingCatena",
 "permittedAsLivingCatenaDialogue"])assert.equal(row[field],false);
 assert.equal(Object.hasOwn(row,"authenticatedFatherAnswer"),false);
 assert.equal(Object.hasOwn(row,"improvedGeneratedFatherText"),false);
}
assert.equal(ids.size,184);
const sum=(fn)=>all.filter(fn).length;
assert.equal(summary.sourcePassagesWithQuotedDelimiters,
 sum(x=>x.quoteEvidence.delimiterCount>0));
assert.equal(summary.sourcePassagesWithUnresolvedQuotation,
 sum(x=>x.quoteEvidence.unpairedOrUnresolvedDelimiters.length>0));
assert.equal(summary.sourcePassagesWithAdditionalQuestions,
 sum(x=>x.additionalQuestionMarksInsideProse>0));
assert.equal(summary.sourcePassagesNeedingSourceLayerDisambiguation,
 sum(x=>x.sourceAttributionTriage==="source_layer_disambiguation_needed"));
assert.equal(summary.sourcesWithoutVisibleAttributionCueButStillUnverified,
 sum(x=>x.sourceAttributionTriage==="no_visible_source_layer_cue_authorship_still_unverified"));
assert.equal(summary.sourcePassagesNeedingSourceLayerDisambiguation+
 summary.sourcesWithoutVisibleAttributionCueButStillUnverified,184);
assert.ok(summary.sourcePassagesWithQuotedDelimiters>=68,
 "All previously observed quotation-bearing source snippets must remain visible");
assert.ok(summary.sourcePassagesWithAdditionalQuestions>=20,
 "Questions inside ensuing prose must be counted, not silently merged");
assert.ok(summary.sourcePassagesWithReportedInterlocutors>=1);
for(const field of ["authenticatedFatherQuestions","authenticatedFatherAnswerSpans",
 "verifiedNonCatenaNewContent","publicationApprovals"])assert.equal(summary[field],0);
const pinnedById=new Map(output.pinnedWitnesses.map(x=>[x.sourceId,x]));
for(const id of ["SCH-CHR-002","SCH-CHR-004"])
 assert.ok(pinnedById.get(id).quoteEvidence.sourceQuoteSpans.length>=1);
assert.ok(pinnedById.get("SCH-CHR-003")
 .quoteEvidence.unpairedOrUnresolvedDelimiters.length>=1);
assert.ok(pinnedById.get("SCH-CHR-001").sourceLayerRisks.includes(
 "reported_objection_not_unqualified_Father_question"));
console.log("PASS Schaff speech-layer triage: 180 OCR contexts + four prior sources; all quotation/subspan digests, speaker risks and publication blockers verified");
