#!/usr/bin/env node
/**
 * Evidence-based *lexical* overlap between Schaff 1888 Matthew homilies and
 * frozen Oxford/Newman Catena Matthew source segments.
 *
 * Two historical translations may express the same argument differently.
 * No lexical hit DOES NOT mean the homilist wrote something absent in Catena.
 * A lexical hit DOES NOT prove equivalence, speaker or source edition accuracy.
 *
 * Run after the 180 source-exact question/prose and four seed output is built.
 */
import {readFileSync,writeFileSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {createHash} from "node:crypto";
const opt=(s,f)=>{const i=process.argv.indexOf(s);return i<0?f:process.argv[i+1]};
const input=resolve(opt("--input-dir","dist/schaff-chrysostom-replies"));
const output=resolve(opt("--output-dir","dist/schaff-chrysostom-catena-overlap"));
const root="data/scripture/catena/";
const sha=s=>createHash("sha256").update(s,"utf8").digest("hex");
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const source=read(join(input,"chrysostom-question-ensuing-prose.v1.json"));
const canonical=read(root+"matthew.json");
if(source.schema!=="ao.catena.chrysostom-historical-OCR-question-ensuing-prose.v1"||
 source.rows.length!==180||source.pinnedOriginalWorkEvidence.length!==4||
 !Array.isArray(canonical.pericopes)||canonical.pericopes.length<100)
 throw Error("CATENA_CHRYSOSTOM_RESEARCH_SOURCE_INVALID");
const normalize=s=>s.normalize("NFKD").replace(/[\u0300-\u036f]/g,"")
 .replace(/([A-Za-z])-\s*\n\s*([A-Za-z])/g,"$1$2")
 .toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const shingles=(s,width=5)=>{
 const toks=normalize(s).split(/\s+/).filter(x=>x.length>0);
 const set=new Set();
 for(let i=0;i<=toks.length-width;i++)set.add(toks.slice(i,i+width).join(" "));
 return set;
};
const catalog=new Map(),posts=new Map();
for(const section of canonical.pericopes){
 if(!section.id.startsWith("catena.matthew."))throw Error("UNEXPECTED_BOOK_IN_CATENA");
 for(let i=0;i<section.segments.length;i++){
  const seg=section.segments[i],pointer=section.id+":"+i;
  if(catalog.has(pointer))throw Error("REPEATED_CANONICAL_CATENA_POINTER");
  if(!seg.text||!seg.father)throw Error("CATENA_SEGMENT_WITHOUT_WORDS");
  catalog.set(pointer,{text:seg.text,father:seg.father,section:section.id});
  for(const phrase of shingles(seg.text)){
   if(!posts.has(phrase))posts.set(phrase,new Set());
   posts.get(phrase).add(pointer);
  }
 }
}
const MIN=2,MAX_FREQUENCY=30;
function compare(text){
 const fps=shingles(text),votes=new Map();
 for(const phrase of fps){
  const hits=posts.get(phrase);
  if(!hits||hits.size>MAX_FREQUENCY)continue;
  for(const pointer of hits){
   if(!votes.has(pointer))votes.set(pointer,new Set());
   votes.get(pointer).add(phrase);
  }
 }
 return [...votes].filter(([,phrases])=>phrases.size>=MIN)
  .map(([pointer,phrases])=>{
   const original=catalog.get(pointer);
   const ordered=[...phrases].sort();
   return {canonicalSourcePointer:pointer,canonicalInCatenaFatherLabel:original.father,
    sharedIndependentFiveWordPhrases:ordered.length,
    canonicalInheritedFatherLabelMatchesChrysostom:original.father==="Chrysostom",
    phraseEvidence:ordered.slice(0,8),
    sourceRelationsStatus:"lexical_similarity_only_not_source_identity_or_equivalent_argument",
    originalCatenaSourceUnchanged:true};
  })
  .sort((a,b)=>b.sharedIndependentFiveWordPhrases-a.sharedIndependentFiveWordPhrases||
   a.canonicalSourcePointer.localeCompare(b.canonicalSourcePointer)).slice(0,5);
}
const rows=source.rows.map(r=>{
 if(sha(r.originalEnsuingProseOCR)!==r.originalEnsuingProseSHA256)
  throw Error("HISTORICAL_CHRYSOSTOM_OCR_PROVENANCE_CHANGED");
 return {sourceId:r.id,sourceKind:"homily_question_context",
  historicalPrintedHomily:r.printedHomily,
  historicalPrintedLine:r.originalQuestionLine,
  historicalSourceSHA256:r.originalEnsuingProseSHA256,
  canonicalLexicalOverlapEvidence:compare(r.originalEnsuingProseOCR),
  thematicOrSemanticOverlapChecked:false,
  demonstrablyNovelBeyondCatena:false,
  publicationEligible:false};
});
const pinned=source.pinnedOriginalWorkEvidence.map(r=>{
 if(sha(r.completeOriginalOCR)!==r.completeOCRSHA256)
  throw Error("PRIOR_ANCHORED_HISTORICAL_SOURCE_CHANGED");
 const linked=r.priorCanonicalCatenaPointer;
 if(linked&&!catalog.has(linked))throw Error("KNOWN_CATENA_POINTER_MISSING");
 return {sourceId:r.seedId,sourceKind:"already_researched_bibliographic_witness",
  historicalPrintedHomily:r.printedHomily,
  historicalPrintedLine:r.questionMarkLine,
  historicalSourceSHA256:r.completeOCRSHA256,
  canonicalLexicalOverlapEvidence:compare(r.exactOCREnsuingProse),
  separatelyEstablishedExistingCatenaPointer:linked,
  knownPointerIsSourceResearchNotLiteralEquivalenceProof:!!linked,
  thematicOrSemanticOverlapChecked:false,
  demonstrablyNovelBeyondCatena:false,
  publicationEligible:false};
});
const all=[...rows,...pinned],summary={
 schema:"ao.catena.chrysostom-cross-edition-lexical-overlap-summary.v1",
 historicalEdition:"Schaff NPNF 1888",
 comparisonEdition:"Oxford/Newman Catena Aurea Matthew 1840s",
 indexedCanonicalMatthewExcerpts:catalog.size,
 historicalQuestionProseContextsCompared:rows.length,
 historicalPinnedBibliographicWitnessesCompared:pinned.length,
 researchRecordsWithLiteralFiveWordEvidence:all.filter(x=>
  x.canonicalLexicalOverlapEvidence.length>0).length,
 recordsWithLiteralEvidenceMatchingChrysostom:all.filter(x=>
  x.canonicalLexicalOverlapEvidence.some(v=>v.canonicalInheritedFatherLabelMatchesChrysostom)).length,
 recordsWithLiteralEvidenceOnlyOtherInheritedLabels:all.filter(x=>
  x.canonicalLexicalOverlapEvidence.length>0&&
  x.canonicalLexicalOverlapEvidence.every(v=>!v.canonicalInheritedFatherLabelMatchesChrysostom)).length,
 uniqueCatenaHitPointersNotVerifiedIdenticalToHomilist:
  new Set(all.flatMap(x=>x.canonicalLexicalOverlapEvidence.map(v=>v.canonicalSourcePointer))).size,
 previouslyEstablishedCanonicalPointerLinks:pinned.filter(x=>
  x.separatelyEstablishedExistingCatenaPointer).length,
 unresolvedSubstantiveNovelty:all.length,
 independentlyProvenNovelAnswers:0,
 approvedFatherAuthoredNewAnswers:0,publicationApprovals:0
};
mkdirSync(output,{recursive:true});
writeFileSync(join(output,"literal-overlap-source-evidence.v1.json"),
 JSON.stringify({schema:"ao.catena.chrysostom-canonical-matthew-literal-overlap-evidence.v1",
  sourceSha256:source.originalVolumeSHA256,derivedSearchOnly:true,
  identicalEnglishAcrossTranslationsNotRequired:true,
  noMatchNeverProvesNovelty:true,publicationApproval:false,
  summary,rows,pinnedWitnesses:pinned
 },null,2)+"\n");
writeFileSync(join(output,"summary.v1.json"),JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify(summary));
