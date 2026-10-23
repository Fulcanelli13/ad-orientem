#!/usr/bin/env node
/*
 * First source-layer triage over all 180 Chrysostom question/ensuing-prose
 * research envelopes and the four previously pinned full-work examples.
 *
 * Printed quotations are NOT automatically Gospel words, and absence of
 * quotation marks does NOT authenticate Chrysostom's own speech.
 * No new Father messages, no language-model rewriting, no approval.
 *
 * Run after scripts/scripture-catena-chrysostom-original-question-replies.mjs
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {createHash} from "node:crypto";
const opt=(name,fallback)=>{const n=process.argv.indexOf(name);return n>=0?process.argv[n+1]:fallback};
const input=resolve(opt("--input-dir","dist/schaff-chrysostom-replies"));
const output=resolve(opt("--output-dir","dist/schaff-chrysostom-speech-layers"));
const research=JSON.parse(readFileSync(join(input,"chrysostom-question-ensuing-prose.v1.json"),"utf8"));
if(research.schema!=="ao.catena.chrysostom-historical-OCR-question-ensuing-prose.v1"||
 research.rows.length!==180||research.pinnedOriginalWorkEvidence.length!==4)
 throw Error("UNEXPECTED_CHRYSOSTOM_RESEARCH_SOURCE");
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const speaker=/\b(?:saith\s+(?:Christ|the\s+Lord|one|he|the\s+prophet|the\s+Evangelist)|said\s+(?:Christ|Jesus|the\s+Lord)|the\s+Saviour\s+(?:said|saith)|it\s+is\s+written|as\s+it\s+is\s+written|the\s+Scripture\s+(?:saith|says)|the\s+prophet\s+(?:saith|says)|the\s+Gospel\s+(?:saith|says))\b/gi;
const interlocutor=/\b(?:saith\s+one|it\s+may\s+be\s+asked|someone\s+will\s+say|some\s+one\s+will\s+say|you\s+may\s+say|thou\s+wilt\s+say|it\s+may\s+be\s+said)\b/gi;
const scriptureReference=/\b(?:Matth?|Mark|Luke|John|Isa|Rom|Cor|Acts|Ps(?:alm)?)[.]?\s*(?:[IVX]{1,9}|\d{1,3})\s*[.:,]\s*(?:\d{1,3})?/gi;
const footnoteLine=/(?:^|\n)\s*(?:\d{1,3}[.)]\s+(?:See|Cf|Matt|Matth|Mark|Luke|John|Rom|Cor|ibid)|[*†‡]\s+(?:See|Cf|Matt|Matth|Mark|Luke|John)|\[[0-9]{1,3}\])/gim;
const printedHeading=/(?:^|\n)\s*(?:HOMILY\s+[IVXLCDM\d]+\.?|CHAP\.\s+[IVXLCDM]+\.?|FOOTNOTES?|INDEX)\s*(?:\n|$)/gim;
const count=(s,re)=>[...s.matchAll(re)].length;
const snippets=(s,re,max=9)=>[...s.matchAll(re)].slice(0,max).map(m=>({
 offset:m.index,length:m[0].length,exactOriginalOCR:m[0],
 exactOriginalSHA256:sha(m[0])
}));
function quotationDelimiters(s){
 const matches=[...s.matchAll(/["“”]/g)];
 const spans=[];
 // A pair of straight quotation marks or a conventional curly pair is a
 // typographic span candidate only; never guess an author's identity.
 let open=null;
 for(const m of matches){
  const glyph=m[0],offset=m.index;
  if(open===null){
   if(glyph==='"'||glyph==='“')open={glyph,offset};
  }else if((open.glyph==='"'&&glyph==='"')||
           (open.glyph==='“'&&glyph==='”')){
   const text=s.slice(open.offset,offset+1);
   if(text.length>=6){
    spans.push({startOffset:open.offset,endOffset:offset+1,
     exactOriginalOCR:text,originalSHA256:sha(text),
     attribution:"unknown_printed_quote_may_be_scripture_or_reported_speech"});
   }
   open=null;
  }else if(glyph==='“'){
   // Nested or bad OCR typography: do not merge into a fabricated speech unit.
   break;
  }
 }
 const occupied=new Set(spans.flatMap(x=>[x.startOffset,x.endOffset-1]));
 const unpaired=matches.filter(m=>!occupied.has(m.index) &&
  !spans.some(x=>m.index>x.startOffset&&m.index<x.endOffset)).map(m=>({
  offset:m.index,glyph:m[0]
 }));
 return {delimiterCount:matches.length,sourceQuoteSpans:spans,
  unpairedOrUnresolvedDelimiters:unpaired,
  quotedTextNotNecessarilyFatherAuthored:true,
  quoteBoundaryCriticallyVerified:false};
}
function examine(id,sourceId,question,prose,sourceDigests,knownRole){
 const quote=quotationDelimiters(prose);
 const risks=[];
 if(quote.delimiterCount)risks.push("printed_double_quote_requires_speaker_attribution");
 if(quote.unpairedOrUnresolvedDelimiters.length)risks.push("cropped_or_unbalanced_printed_quotation");
 const anotherQuestion=(prose.match(/\?/g)||[]).length;
 if(anotherQuestion)risks.push("additional_question_inside_ensuing_prose");
 const speakerCues=snippets(prose,speaker);
 if(speakerCues.length)risks.push("reported_scripture_or_other_speaker_possible");
 const interlocutorCues=snippets(question+"\n"+prose,interlocutor);
 if(interlocutorCues.length||knownRole==="reported_interlocutor_or_objection")
  risks.push("reported_objection_not_unqualified_Father_question");
 const citationCues=snippets(prose,scriptureReference);
 if(citationCues.length)risks.push("possible_printed_scripture_reference");
 const footnotes=snippets(prose,footnoteLine);
 if(footnotes.length)risks.push("possible_printed_footnote_marker");
 const headings=snippets(prose,printedHeading);
 if(headings.length)risks.push("possible_printed_heading_crossed");
 const wrapped=(prose.match(/-\s*\n/g)||[]).length;
 if(wrapped)risks.push("ocr_line_wrap_hyphenation_preserved");
 // These are search priorities, NOT confidence scores of patristic authorship.
 const attributionBlockingRisks=risks.filter(x=>x!=="ocr_line_wrap_hyphenation_preserved");
 const triage=attributionBlockingRisks.length?"source_layer_disambiguation_needed":
   "no_visible_source_layer_cue_authorship_still_unverified";
 return {
  sourceId:id,sourceKind:sourceId,questionFormHypothesis:knownRole,
  sourceOriginalTextDigests:sourceDigests,
  originalQuestionSHA256:sha(question),originalEnsuingProseSHA256:sha(prose),
  ensuingProseCharacters:prose.length,
  quoteEvidence:quote,additionalQuestionMarksInsideProse:anotherQuestion,
  otherSpeakerTextCues:speakerCues,reportedInterlocutorTextCues:interlocutorCues,
  possibleScriptureReferenceTextCues:citationCues,
  possibleFootnoteTextCues:footnotes,possibleHeadingTextCues:headings,
  originalOCRHyphenWraps:wrapped,sourceLayerRisks:risks,
  sourceAttributionTriage:triage,
  speakerProvedFromOriginalWork:false,
  answerSpanCriticallyEstablished:false,
  completeSourceAnswerValidated:false,
  novelBeyondExistingCatena:false,
  permittedAsLivingCatenaDialogue:false
 };
}
const rows=research.rows.map(r=>{
 if(sha(r.exactQuestionLineOCR)!==r.exactQuestionLineSHA256||
  sha(r.originalEnsuingProseOCR)!==r.originalEnsuingProseSHA256||
  sha(r.originalContextOCR)!==r.originalContextSHA256)
  throw Error("ORIGINAL_CHRYSOSTOM_SOURCE_HASH_CHANGED");
 return examine(r.id,"research_envelope",r.originalQuestionSourceSpan,
  r.originalEnsuingProseOCR,{
   sourceVolumeSHA256:research.originalVolumeSHA256,
   originalQuestionLineSHA256:r.exactQuestionLineSHA256,
   originalContextSHA256:r.originalContextSHA256
  },r.questionFormHypothesis);
});
const prior=research.pinnedOriginalWorkEvidence.map(r=>{
 if(sha(r.completeOriginalOCR)!==r.completeOCRSHA256||
  r.exactOCRQuestionUpToMark+r.exactOCREnsuingProse!==r.completeOriginalOCR)
  throw Error("PINNED_CHRYSOSTOM_QUESTION_AND_PROSE_MISMATCH");
 return examine(r.seedId,"prior_bibliographic_witness",
  r.exactOCRQuestionUpToMark,r.exactOCREnsuingProse,
  {sourceVolumeSHA256:research.originalVolumeSHA256,
   originalCompleteOCRSHA256:r.completeOCRSHA256},
  r.seedId==="SCH-CHR-001"?"reported_interlocutor_or_objection":
    "question_form_not_yet_speaker_authenticated");
});
const all=[...rows,...prior];
const fieldCount=key=>all.filter(x=>x.sourceLayerRisks.includes(key)).length;
const summary={
 schema:"ao.catena.chrysostom-speech-layer-summary.v1",
 parentOriginalOCRVolumeSHA256:research.originalVolumeSHA256,
 checkedHomilySampleEnvelopes:rows.length,checkedPriorBibliographicWitnesses:prior.length,
 sourcePassagesWithQuotedDelimiters:all.filter(x=>x.quoteEvidence.delimiterCount>0).length,
 sourcePassagesWithUnresolvedQuotation:all.filter(x=>
  x.quoteEvidence.unpairedOrUnresolvedDelimiters.length>0).length,
 sourcePassagesWithAdditionalQuestions:all.filter(x=>
  x.additionalQuestionMarksInsideProse>0).length,
 sourcePassagesWithReportedInterlocutors:fieldCount("reported_objection_not_unqualified_Father_question"),
 sourcePassagesWithPossibleSpeakerCues:fieldCount("reported_scripture_or_other_speaker_possible"),
 sourcePassagesWithFootnoteCues:fieldCount("possible_printed_footnote_marker"),
 sourcePassagesWithScriptureReferenceCues:fieldCount("possible_printed_scripture_reference"),
 sourcePassagesNeedingSourceLayerDisambiguation:all.filter(x=>
  x.sourceAttributionTriage==="source_layer_disambiguation_needed").length,
 sourcesWithoutVisibleAttributionCueButStillUnverified:all.filter(x=>
  x.sourceAttributionTriage==="no_visible_source_layer_cue_authorship_still_unverified").length,
 authenticatedFatherQuestions:0,authenticatedFatherAnswerSpans:0,
 verifiedNonCatenaNewContent:0,publicationApprovals:0
};
if(summary.checkedHomilySampleEnvelopes!==180||summary.checkedPriorBibliographicWitnesses!==4)
 throw Error("SOURCE_SCREENING_POPULATION_CHANGED");
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"speech-layer-source-triage.v1.json"),JSON.stringify({
 schema:"ao.catena.chrysostom-speech-layer-source-triage.v1",
 researchOnly:true,originalVolumeSHA256:research.originalVolumeSHA256,
 quoteTypographyCannotProveScriptureSpeaker:true,
 wordsRewrittenOrNormalized:false,approvedForMessenger:false,
 summary,rows,pinnedWitnesses:prior
},null,2)+"\n");
writeFileSync(join(output,"summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
