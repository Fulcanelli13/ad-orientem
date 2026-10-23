#!/usr/bin/env node
/**
 * Source-preserving question -> ensuing-prose research, NOT Father replies.
 * 1888 Schaff NPNF I/X OCR is not a critical Greek edition and can contain
 * Scripture quotation, interlocutors, translator notes and column errors.
 * Run after whole-volume and work-unit OCR research acquisition.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
const get=(flag,fallback)=>{const n=process.argv.indexOf(flag);return n<0?fallback:process.argv[n+1]};
const input=resolve(get("--input-dir","dist/schaff-original-ocr"));
const unitDir=resolve(get("--unit-dir","dist/schaff-sectioned-research"));
const output=resolve(get("--output-dir","dist/schaff-chrysostom-replies"));
const root="data/scripture/catena/research/full-corpus-pass-20261021/";
const digest=s=>createHash("sha256").update(s,"utf8").digest("hex");
const raw=readFileSync(join(input,"NPNF1-10.raw-ocr.txt"),"utf8");
const corpus=JSON.parse(readFileSync(join(unitDir,"NPNF1-10.source-units-and-questions.v1.json"),"utf8"));
if(corpus.editionId!=="NPNF1-10"||corpus.units.length!==90||
 corpus.questions.length!==3650||digest(raw)!==corpus.sourceVolumeSHA256)
 throw Error("SOURCE_IS_NOT_PINNED_1888_CHRYSOSTOM");
const lines=raw.replace(/\r/g,"").split("\n"),unitMap=new Map(corpus.units.map(u=>[u.id,u]));
const tidy=s=>s.replace(/\s+/g," ").trim();
const START=/^(?:(?:But|And|For|Now|Yet)\s+)?(?:Why|What|How|Wherefore|Whence|Who|Whom)\b/i;
const TRIG=/\b(?:(?:But|And|For|Now|Yet)\s+)?(?:Why|What|How|Wherefore|Whence|Who|Whom)\b/gi;
const REPORT=/\b(?:saith\s+(?:one|some)|it\s+may\s+be\s+asked|some\s+one\s+(?:will\s+)?say|you\s+may\s+say|it\s+is\s+said)\b/i;
const APPARATUS=/^(?:\s*[0-9*†‡]+\s+[A-Z][a-z]?\.?\s|\s*\[|\s*(?:FOOTNOTES|HOMILY|INDEX|CHAP\.)\b)/i;
const BIBLICAL=/\b(?:Mat(?:t|th)?\.?|Mark\.?|Luke\.?|John\.?|Isa\.?|Psalm?|Rom\.?|Cor\.?|Acts\.?)\s*(?:[IVXLCDM]{1,9}|\d{1,3})[.:, ]/i;
const STOP=/^\s*(?:\d{1,2}\s+\b(?:Matt|Mark|Luke|John|Rom|Cor|Ps|Isa|See)\b|[*†‡]\s+|\[|HOMILY\s+[IVXLCDM]+\b|CHAP\.\s+[IVXLCDM]+)/i;
function candidate(q,u){
 const line=q.originalQuestionLineOCR,mark=line.indexOf("?");
 if(mark<0||APPARATUS.test(line))return null;
 const before=tidy(line.slice(0,mark));
 const sourceStart=Math.max(q.ocrLine-2,u.startLine);
 const contiguous=lines.slice(sourceStart-1,q.ocrLine-1).concat(line.slice(0,mark));
 const merged=tidy(contiguous.join(" "));
 const triggers=[...merged.matchAll(TRIG)],found=triggers.at(-1);
 if(!found||merged.length-found.index>185||/[!?]/.test(merged.slice(found.index))||
  !START.test(found[0]))return null;
 const risks=[];
 if(/["“”]/.test(merged.slice(found.index)))risks.push("quotation_possible_not_Father_question");
 if(BIBLICAL.test(line))risks.push("possible_scripture_verse_citation");
 if(q.screeningFlags.length)risks.push("prior_OCR_source_warning");
 if(!START.test(before))risks.push("question_starts_on_prior_OCR_line");
 const form=REPORT.test(merged+" "+line)?"reported_interlocutor_or_objection":
  /(?:\bsaith\s+Christ|\bsaith\s+(?:he|the\s+Lord)|\bdoth\s+he\s+say)/i.test(line)?
  "question_about_Scripture_speaker":"author_rhetorical_form_unverified";
 if(form==="reported_interlocutor_or_objection")risks.push("interlocutor_not_Father_first_person");
 const remainder=line.slice(mark+1),snippets=[];
 if(remainder.trim())snippets.push(remainder);
 let end=q.ocrLine;
 for(let n=q.ocrLine+1;n<=Math.min(q.ocrLine+9,u.endLine);n++){
  const v=lines[n-1];if(!v?.trim()||STOP.test(v))break;
  snippets.push(v);end=n;
 }
 const following=snippets.join("\n");
 if(tidy(following).length<45||!/[a-zA-Z]{4}/.test(following)||
  (end===q.ocrLine&&tidy(remainder).length<80))return null;
 if(/\b(?:it\s+is\s+said|saith\s+one|they\s+say|was\s+written)\b/i.test(following.slice(0,170)))
  risks.push("possibly_reported_or_biblical_reply");
 const sameLine=tidy(remainder).length>=30;
 const cue=/^(?:That|Because|For|By|Since|This|He|It|They|Not|To|From|As|In|The|A|So|And|I|There|But)\b/i.test(tidy(following));
 const rank=(cue?2:0)+(sameLine?2:0)+(form==="reported_interlocutor_or_objection"?1:0)+
  (START.test(before)?2:0)-risks.length;
 const sourceWindowStart=Math.max(u.startLine,q.ocrLine-5);
 const sourceWindowEnd=Math.min(u.endLine,end+5);
 const context=lines.slice(sourceWindowStart-1,sourceWindowEnd).join("\n");
 const qspan=lines.slice(sourceStart-1,q.ocrLine).join("\n");
 return {
  id:q.id,sourceWorkUnitId:u.id,printedHomily:u.unitLabel,
  originalQuestionLine:q.ocrLine,questionMarkOffset:mark,
  questionFormHypothesis:form,searchPriorityScore:rank,sourceLayerRisks:risks,
  OCRQuestionStartsOnPriorLine:!START.test(before),
  originalQuestionSourceSpanStartLine:sourceStart,
  originalQuestionSourceSpan:qspan,originalQuestionSourceSpanSHA256:digest(qspan),
  exactQuestionLineOCR:line,exactQuestionLineSHA256:digest(line),
  originalEnsuingProseOCR:following,originalEnsuingProseSHA256:digest(following),
  ensuingProseEndLine:end,
  originalContextLineStart:sourceWindowStart,originalContextLineEnd:sourceWindowEnd,
  originalContextOCR:context,originalContextSHA256:digest(context),
  possibleCatenaLexicalMatches:q.lexicalCatenaOverlapHints,
  originalPrintPageCollated:false,sourceQuestionSpeakerResolved:false,
  sourceReplySpeakerResolved:false,sourceParagraphBoundaryVerified:false,
  materialBeyondCatenaVerified:false,publicationEligible:false
 };
}
const homilies=[],samples=[],allStructural=[];
for(const u of corpus.units){
 const q=corpus.questions.filter(x=>x.workUnitId===u.id);
 const matches=q.map(x=>candidate(x,u)).filter(Boolean);
 allStructural.push(...matches);
 const ranked=matches.sort((a,b)=>b.searchPriorityScore-a.searchPriorityScore||
   a.originalQuestionLine-b.originalQuestionLine),pick=[];
 for(const row of ranked){
  if(pick.length>=2)break;
  if(pick.some(x=>Math.abs(x.originalQuestionLine-row.originalQuestionLine)<30))continue;
  pick.push(row);
 }
 samples.push(...pick);
 homilies.push({unitId:u.id,number:u.unitOrdinal,
  originalQuestionMarks:q.length,structuralQuestionAndProseCandidates:matches.length,
  selectedSourcePointers:pick.map(x=>x.id),noStructuralQuestion:matches.length===0});
}
const previous=JSON.parse(readFileSync(root+"schaff-first-full-work-question-seeds.v1.json","utf8"));
const anchored=[
 ["SCH-CHR-001",44,42321,42323,42333],
 ["SCH-CHR-002",47,43840,43841,43844],
 ["SCH-CHR-003",47,43868,43870,43879],
 ["SCH-CHR-004",47,44008,44010,44018]
];
function inspectPrintedQuotationMarkers(original){
 // Paired double-quote spans are only typography evidence, not certified
 // Gospel citations. An unmatched mark indicates that the cropped context
 // must not be treated as a clean standalone Father answer.
 const visibleQuoteMarks=[...original.matchAll(/["“”]/g)].length;
 const candidates=[];
 for(const match of original.matchAll(/"[^"]{5,550}"/gs)){
  const text=match[0];
  candidates.push({startOffset:match.index,endOffset:match.index+text.length,
   originalQuotedOCR:text,originalQuoteSHA256:digest(text),
   sourceRole:"unresolved_printed_quotation_not_automatically_Father_speech"});
 }
 return {sourceQuotationCandidates:candidates,
  visiblePrintedQuoteMarks:visibleQuoteMarks,unpairedOrOutsideContextQuotationPossible:
   visibleQuoteMarks!==2*candidates.length};
}
const pinnedOriginalWorkEvidence=anchored.map(([seedId,n,first,markLine,last])=>{
 const seed=previous.rows.find(x=>x.id===seedId),u=corpus.units[n-1];
 if(!seed||seed.editionId!=="NPNF1-10"||!u||u.unitOrdinal!==n||
  first<u.startLine||last>u.endLine)throw Error("SEED_OR_PRINTED_WORK_UNIT_CHANGED");
 const qline=lines[markLine-1],mark=qline.indexOf("?");
 if(mark<0)throw Error("NO_PINNED_SOURCE_QUESTION_MARK");
 const q=lines.slice(first-1,markLine-1).concat(qline.slice(0,mark+1)).join("\n");
 const trailing=qline.slice(mark+1)+(last>markLine?"\n"+lines.slice(markLine,last).join("\n"):"");
 const combined=lines.slice(first-1,last).join("\n");
 const quotationEvidence=inspectPrintedQuotationMarkers(trailing);
 if(q+trailing!==combined)throw Error("PINNED_ORIGINAL_OCR_WORDS_CHANGED");
 return {seedId,printedHomily:u.unitLabel,sourceWorkUnitId:u.id,
  originalLineStart:first,questionMarkLine:markLine,originalLineEnd:last,
  exactOCRQuestionUpToMark:q,exactOCREnsuingProse:trailing,
  completeOriginalOCR:combined,completeOCRSHA256:digest(combined),
  priorCanonicalCatenaPointer:seed.catenaSourcePointer||null,
  questionAndProsePrintedContiguously:true,
  ensuingProseQuotationEvidence:quotationEvidence,
  ensuingProseMayIncludeBiblicalQuotation:quotationEvidence.visiblePrintedQuoteMarks>0,
  sourceQuoteOwnershipUnverified:true,
  speakerOriginalGreekAuthenticated:false,printedPageCollated:false,
  sourceResponseBoundaryEditoriallyAuthenticated:false,
  noveltyComparedAgainstFullCatena:false,publicationEligible:false};
});
const sorted=samples.sort((a,b)=>a.sourceWorkUnitId.localeCompare(b.sourceWorkUnitId)||
 a.originalQuestionLine-b.originalQuestionLine);
allStructural.sort((a,b)=>a.originalQuestionLine-b.originalQuestionLine||a.id.localeCompare(b.id));
const result={
 schema:"ao.catena.chrysostom-historical-OCR-question-ensuing-prose.v1",
 sourceEdition:"Schaff NPNF I/X, 1888 print scan OCR",
 originalVolumeSHA256:corpus.sourceVolumeSHA256,originalHomilies:90,
 questionMarkWindowsScreened:3650,
 structuralQuestionAndProseCandidates:homilies.reduce((n,x)=>n+x.structuralQuestionAndProseCandidates,0),
 sampledSourceExactEnvelopes:sorted.length,
 homiliesRepresented:homilies.filter(x=>x.selectedSourcePointers.length).length,
 knownPreviouslyResearchedSourceLoci:pinnedOriginalWorkEvidence.length,
 questionSpeakersConfirmed:0,sourceAnswerBoundariesConfirmed:0,
 confirmedNewPatristicAnswers:0,publicationApprovals:0,
 eligibleForProductionMessenger:false,
 pinnedOriginalWorkEvidence,homilies,rows:sorted
};
mkdirSync(output,{recursive:true});
if(allStructural.length!==result.structuralQuestionAndProseCandidates||
 new Set(allStructural.map(x=>x.id)).size!==allStructural.length)
 throw Error("ALL_STRUCTURAL_QUESTION_RECORDS_NOT_EXHAUSTIVE");
writeFileSync(join(output,"chrysostom-all-structural-candidates.v1.json"),
 JSON.stringify({
  schema:"ao.catena.chrysostom-all-structural-question-prose-ocr.v1",
  historicalVolumeSHA256:corpus.sourceVolumeSHA256,
  homiliesScreened:90,questionMarksScreened:3650,
  structuralCandidatesPreserved:allStructural.length,
  sourceQuestionSpeakerAuthenticated:0,sourceReplyBoundariesAuthenticated:0,
  novelPatristicAnswersConfirmed:0,publicationApprovals:0,
  records:allStructural
 },null,2)+"\n");
writeFileSync(join(output,"chrysostom-question-ensuing-prose.v1.json"),
 JSON.stringify(result,null,2)+"\n");
writeFileSync(join(output,"summary.v1.json"),JSON.stringify({
 schema:"ao.catena.chrysostom-question-ensuing-prose-summary.v1",
 totalQuestionMarks:result.questionMarkWindowsScreened,
 structuralQuestionAndProseCandidates:result.structuralQuestionAndProseCandidates,
 sourceExactResearchEnvelopes:result.sampledSourceExactEnvelopes,
 homiliesRepresented:result.homiliesRepresented,
 previouslyResearchedLoci:result.knownPreviouslyResearchedSourceLoci,
 speakerOwnershipEstablished:0,answersCertified:0,catenaNoveltyCertified:0,
 publicationApprovals:0},null,2)+"\n");
console.log(JSON.stringify({
 questionMarks:result.questionMarkWindowsScreened,
 structuralCandidates:result.structuralQuestionAndProseCandidates,
 sourceExactSample:result.sampledSourceExactEnvelopes,
 homilies:result.homiliesRepresented,knownLoci:4,
 patristicAnswersCertified:0}));
