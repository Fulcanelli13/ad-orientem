#!/usr/bin/env node
/**
 * High-volume, source-preserving research expansion:
 *   (1) all 1,938 structural Chrysostom question+prose OCR candidates
 *   (2) 180 extended, homily-bounded original-source text windows
 *   (3) lexical Catena Matthew overlap evidence for every structural candidate
 *
 * All fields are acquisition/screening data, never Father-attributed answers.
 * Absence of lexical overlap is not proof of novelty; shared biblical text
 * is not proof of duplicated exposition. No publication or human gate.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
const arg=(key,fallback)=>{const i=process.argv.indexOf(key);return i<0?fallback:process.argv[i+1]};
const input=resolve(arg("--source-dir","dist"));
const output=resolve(arg("--output-dir","dist/schaff-chrysostom-bulk-research"));
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const old=read(join(input,"schaff-chrysostom-replies/chrysostom-question-ensuing-prose.v1.json"));
const all=read(join(input,"schaff-chrysostom-replies/chrysostom-all-structural-candidates.v1.json"));
const units=read(join(input,"schaff-sectioned-research/NPNF1-10.source-units-and-questions.v1.json"));
const original=readFileSync(join(input,"schaff-original-ocr/NPNF1-10.raw-ocr.txt"),"utf8");
const catena=read("data/scripture/catena/matthew.json");
if(old.schema!=="ao.catena.chrysostom-historical-OCR-question-ensuing-prose.v1"||
 all.schema!=="ao.catena.chrysostom-all-structural-question-prose-ocr.v1"||
 units.editionId!=="NPNF1-10"||units.units.length!==90||
 all.records.length!==1938||old.rows.length!==180||
 sha(original)!==all.historicalVolumeSHA256||
 sha(original)!==units.sourceVolumeSHA256||
 sha(original)!==old.originalVolumeSHA256)
 throw Error("HIGH_VOLUME_SOURCE_MANIFEST_DRIFT");
const lines=original.replace(/\r/g,"").split("\n");
const unitById=new Map(units.units.map(u=>[u.id,u]));
const structurals=new Map(all.records.map(r=>[r.id,r]));
const normalize=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g,"$1$2")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const shingles=s=>{
 const w=normalize(s).split(/\s+/).filter(Boolean),out=new Set();
 for(let i=0;i+4<w.length;i++)out.add(w.slice(i,i+5).join(" "));
 return out;
};
const postings=new Map(),canonical=new Map();
for(const p of catena.pericopes){
 if(!p.id.startsWith("catena.matthew."))throw Error("UNEXPECTED_CANONICAL_BOOK");
 for(let i=0;i<(p.segments||[]).length;i++){
  const seg=p.segments[i],pointer=p.id+":"+i;
  if(!seg.text||!seg.father||canonical.has(pointer))throw Error("CANONICAL_CATENA_SEGMENT_DRIFT");
  canonical.set(pointer,{father:seg.father,originalTextSHA256:sha(seg.text)});
  for(const gram of shingles(seg.text)){
   if(!postings.has(gram))postings.set(gram,new Set());
   postings.get(gram).add(pointer);
  }
 }
}
if(canonical.size!==4825)throw Error("EXPECTED_CANONICAL_MATTHEW_4825");
function overlap(text){
 const votes=new Map();
 for(const gram of shingles(text)){
  const hits=postings.get(gram);
  if(!hits||hits.size>30)continue;
  for(const ptr of hits){
   if(!votes.has(ptr))votes.set(ptr,new Set());
   votes.get(ptr).add(gram);
  }
 }
 return [...votes].filter(([,shared])=>shared.size>=2)
  .map(([pointer,shared])=>({
   canonicalPointer:pointer,canonicalInheritedFather:canonical.get(pointer).father,
   matchedFiveWordPhrases:shared.size,
   firstExactCommonPhrases:[...shared].sort().slice(0,4),
   commonWordingOnlyNotSamePatristicArgument:true
  }))
  .sort((a,b)=>b.matchedFiveWordPhrases-a.matchedFiveWordPhrases||
   a.canonicalPointer.localeCompare(b.canonicalPointer)).slice(0,3);
}
const counted={possibleQuotationMarkers:0,moreQuestionsInNextProse:0,
 reportedInterlocutor:0,anyMatthewCatenaLexicalHit:0,sameInheritedLabelHit:0,
 otherInheritedOnlyHit:0,attributionRiskPresent:0};
const researchRows=[];
for(const r of all.records){
 const u=unitById.get(r.sourceWorkUnitId);
 if(!u||r.originalQuestionLine<u.startLine||r.ensuingProseEndLine>u.endLine||
  sha(r.exactQuestionLineOCR)!==r.exactQuestionLineSHA256||
  sha(r.originalQuestionSourceSpan)!==r.originalQuestionSourceSpanSHA256||
  sha(r.originalEnsuingProseOCR)!==r.originalEnsuingProseSHA256||
  sha(r.originalContextOCR)!==r.originalContextSHA256||
  lines[r.originalQuestionLine-1]!==r.exactQuestionLineOCR||
  lines.slice(r.originalContextLineStart-1,r.originalContextLineEnd).join("\n")!==r.originalContextOCR)
  throw Error("SOURCE_OCR_QUESTION_OR_HOMILY_MISMATCH:"+r.id);
 const originalQuestion=r.originalQuestionSourceSpan,prose=r.originalEnsuingProseOCR;
 const quotationMarks=[...prose.matchAll(/["“”]/g)].length;
 const additionalQuestions=[...prose.matchAll(/\?/g)].length;
 const possibleReport=r.questionFormHypothesis==="reported_interlocutor_or_objection"||
  /\b(?:saith\s+one|it\s+may\s+be\s+asked|some\s+one\s+will\s+say)\b/i.test(originalQuestion+"\n"+prose);
 const risky=quotationMarks>0||additionalQuestions>0||possibleReport||
  r.sourceLayerRisks.length>0;
 const lexical=overlap(prose);
 const same=lexical.some(x=>x.canonicalInheritedFather==="Chrysostom");
 counted.possibleQuotationMarkers+=Number(quotationMarks>0);
 counted.moreQuestionsInNextProse+=Number(additionalQuestions>0);
 counted.reportedInterlocutor+=Number(possibleReport);
 counted.anyMatthewCatenaLexicalHit+=Number(lexical.length>0);
 counted.sameInheritedLabelHit+=Number(same);
 counted.otherInheritedOnlyHit+=Number(lexical.length>0&&!same);
 counted.attributionRiskPresent+=Number(risky);
 researchRows.push({
  id:r.id,workUnitId:u.id,printedHomily:u.unitLabel,
  originalOCRLine:r.originalQuestionLine,
  originalOCRQuestionSHA256:r.originalQuestionSourceSpanSHA256,
  originalOCRQuestionLineSHA256:r.exactQuestionLineSHA256,
  originalFollowingTextSHA256:r.originalEnsuingProseSHA256,
  originalSourceContextSHA256:r.originalContextSHA256,
  structuralCandidateOnly:true,sourceQuestionIsAuthenticallyFatherOwned:false,
  originalOCRProseQuestionMarks:additionalQuestions,
  originalOCRProseQuoteDelimiters:quotationMarks,
  possibleReportedInterlocutor:possibleReport,
  originalLayerRisks:r.sourceLayerRisks,
  requiresSpeakerDisambiguation:risky,
  lexicalCatenaCandidates:lexical,
  lexicalNonmatchCannotProveNovelty:true,
  exactPatristicAnswerBoundaryEstablished:false,
  newMaterialBeyondCatenaEstablished:false,publicationEligible:false
 });
}
const extended=[],lineIntervals=[];
for(const r of old.rows){
 const originalRow=structurals.get(r.id);
 if(!originalRow)throw Error("SAMPLED_180_CASE_NOT_PRESENT_IN_1938:"+r.id);
 if(r.originalContextSHA256!==originalRow.originalContextSHA256||
  r.originalEnsuingProseSHA256!==originalRow.originalEnsuingProseSHA256||
  r.exactQuestionLineSHA256!==originalRow.exactQuestionLineSHA256)
  throw Error("SAMPLED_SOURCE_CHANGED_FROM_FULL_RESEARCH_REGISTER");
 const u=unitById.get(r.sourceWorkUnitId),n=r.originalQuestionLine;
 const first=Math.max(u.startLine,n-55),last=Math.min(u.endLine,n+110);
 const text=lines.slice(first-1,last).join("\n");
 if(!text.includes(r.originalContextOCR))
  throw Error("OLD_CONTEXT_NOT_PRESERVED_IN_LONG_WINDOW");
 const digest=sha(text);
 extended.push({
  id:r.id,workUnitId:u.id,printedHomily:u.unitLabel,
  originalSourceVolumeSHA256:old.originalVolumeSHA256,
  questionOriginalLine:n,originalLongWindowFirstLine:first,
  originalLongWindowLastLine:last,originalLongOCR:text,
  originalLongOCRSHA256:digest,
  questionOriginalSHA256:r.originalQuestionSourceSpanSHA256,
  followingProseSHA256:r.originalEnsuingProseSHA256,
  preExistingShortContextSHA256:r.originalContextSHA256,
  printedQuotationBoundaryNotAuthenticated:true,
  originalSpeakerNotAuthenticated:true,
  textIsBoundedWindowNotCompleteAnswer:true,
  sourceNotCriticallyCollated:true,publicationEligible:false
 });
 lineIntervals.push({unitId:u.id,first,last});
}
const coverage=new Map();
for(const item of lineIntervals){
 if(!coverage.has(item.unitId))coverage.set(item.unitId,[]);
 coverage.get(item.unitId).push(item);
}
let uniqueLines=0;
for(const group of coverage.values()){
 group.sort((a,b)=>a.first-b.first||a.last-b.last);
 let a=null,b=null;
 for(const interval of group){
  if(a===null){a=interval.first;b=interval.last;continue}
  if(interval.first<=b+1)b=Math.max(b,interval.last);
  else{uniqueLines+=b-a+1;a=interval.first;b=interval.last}
 }
 if(a!==null)uniqueLines+=b-a+1;
}
const summary={
 schema:"ao.catena.chrysostom-bulk-source-screening-summary.v1",
 scanSHA256:old.originalVolumeSHA256,
 historicalHomiliesCovered:90,
 historicalOCRQuestionMarksInspected:3650,
 structuralOCRQuestionProseCandidatesPreserved:researchRows.length,
 structuralProseWithQuoteDelimiters:counted.possibleQuotationMarkers,
 structuralProseWithAdditionalQuestionMarks:counted.moreQuestionsInNextProse,
 structuralPossibleInterlocutors:counted.reportedInterlocutor,
 structuralCasesWithAnyLexicalMatthewCatenaLead:counted.anyMatthewCatenaLexicalHit,
 structuralCasesWithLexicalInheritedChrysostomLead:counted.sameInheritedLabelHit,
 structuralCasesLexicallyMatchingOnlyOtherInheritedLabels:counted.otherInheritedOnlyHit,
 structuralCasesWithVisibleSpeakerOrQuoteRisk:counted.attributionRiskPresent,
 sampledResearchContextsExpanded:extended.length,
 distinctHomiliesRepresented:new Set(extended.map(x=>x.workUnitId)).size,
 totalLineOccurrencesAcrossLongContexts:extended.reduce((n,x)=>
  n+x.originalLongWindowLastLine-x.originalLongWindowFirstLine+1,0),
 uniqueOriginalOCRLinesAcrossLongContexts:uniqueLines,
 canonicalMatthewCatenaExcerptsCompared:canonical.size,
 sourceOwnedAuthorQuestionsConfirmed:0,sourceOwnedCompleteRepliesConfirmed:0,
 independentlyEstablishedNovelAnswers:0,publicationApprovals:0
};
if(researchRows.length!==1938||extended.length!==180||
 summary.distinctHomiliesRepresented!==90||
 summary.uniqueOriginalOCRLinesAcrossLongContexts>
 summary.totalLineOccurrencesAcrossLongContexts)
 throw Error("BULK_COVERAGE_NOT_EXACT");
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"all-1938-structural-question-screening.v1.json"),
 JSON.stringify({schema:"ao.catena.chrysostom-1938-candidate-source-screen.v1",
  sourceResearchOnly:true,originalWordsHeldInHashedSourceRegister:true,
  noCandidateIsFatherAuthenticated:true,noAbsentCatenaOverlapImpliesNovelty:true,
  summary,rows:researchRows},null,2)+"\n");
writeFileSync(join(output,"all-180-extended-source-contexts.v1.json"),
 JSON.stringify({schema:"ao.catena.chrysostom-180-long-source-contexts.v1",
  sourceResearchOnly:true,originalWordsAreUnmodified:true,
  notCompleteOriginalParagraphs:true,summary,rows:extended},null,2)+"\n");
writeFileSync(join(output,"summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
