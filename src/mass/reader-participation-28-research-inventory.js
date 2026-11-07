// Off-production, research-only Gregorian source review registry.
// Do not import this file from the public Mass reader or score selector.
// Preserves the existing 24 source-attached fixed excerpts and appends
// four separately witnessed 1961 Tonus solemnior Preface phrases.
import {PARTICIPATION_REFERENCE_SCORES} from "./reader-participation-reference-scores.js";
import {PREFACE_SOLEMNIOR_RESEARCH_SCORES} from "./reader-preface-solemnior-reference-scores.js";
import {buildParticipationCoverage} from "./reader-participation-coverage.js";
import {printedPlatesForParticipationScore} from "./reader-participation-printed-plates.js";
import {printedPassageForPrefaceScore} from "./reader-preface-1961-print-passage.js";

export const PARTICIPATION_RESEARCH_28_SCHEMA="ao-mass-participation-28-source-review-v1";
export const PARTICIPATION_RESEARCH_28_SCORES=Object.freeze([
 ...PARTICIPATION_REFERENCE_SCORES,...PREFACE_SOLEMNIOR_RESEARCH_SCORES
]);
export function buildParticipation28ResearchReview(){
 const coverage=buildParticipationCoverage();
 if(coverage.counts.fixedResearchExcerpts!==24||
    coverage.counts.exactPublicFragments!==2||
    PARTICIPATION_REFERENCE_SCORES.length!==24||
    PREFACE_SOLEMNIOR_RESEARCH_SCORES.length!==4||
    PARTICIPATION_RESEARCH_28_SCORES.length!==28)
  throw Error("RESEARCH_28_MUST_NOT_REPLACE_CANONICAL_24");
 const byId=new Map(PARTICIPATION_RESEARCH_28_SCORES.map(s=>[s.id,s]));
 if(byId.size!==28)throw Error("DUPLICATE_RESEARCH_SCORE_ID");
 const appendixIds=new Set(PREFACE_SOLEMNIOR_RESEARCH_SCORES.map(s=>s.id));
 const seen=new Set(),groups=[];
 const events=coverage.events.filter(e=>e.fixedResearchIds.length>0);
 if(events.length!==15)throw Error("EXPECTED_15_SOURCE_MAPPED_EVENT_GROUPS");
 for(const event of events){
  const appendix=PREFACE_SOLEMNIOR_RESEARCH_SCORES.filter(s=>
   s.sourceCueIds.length===1&&event.cueIds.includes(s.sourceCueIds[0]));
  const ids=[...event.fixedResearchIds,...appendix.map(s=>s.id)];
  const rows=ids.map(id=>{
   const s=byId.get(id);
   if(!s||seen.has(id)||s.publicScoreApproved!==false)
    throw Error("RESEARCH_SCORE_DUPLICATED_OR_PUBLISHED_"+id);
   const isAppendix=appendixIds.has(id);
   if(isAppendix&&(!s.researchOnly||s.exactSourceContextCertified||
      s.actualRitualSetting!=="NOT_CERTIFIED"||
      s.printedNoteParity!=="PENDING_INDEPENDENT_NEUME_COLLATION"))
    throw Error("SOLEMNIOR_NOT_CONTEXT_CERTIFIED_"+id);
   const registered=isAppendix?null:printedPlatesForParticipationScore(s.sourceId);
   const fixedPreface=isAppendix?null:printedPassageForPrefaceScore(id);
   const printedWitnesses=isAppendix?s.printWitnesses:
     fixedPreface?.printWitnesses??registered?.plates;
   if(!printedWitnesses?.length||
      printedWitnesses.some(p=>!/^https:\/\/gregobase\.selapa\.net\/sources\/[23]\/\d+\.png$/.test(p.url)))
    throw Error("RESEARCH_SCORE_MISSING_ORIGINAL_PRINTED_PLATE_"+id);
   if(!s.sourceCueIds?.every(c=>event.cueIds.includes(c)))
    throw Error("SOURCE_CUE_EVENT_OWNERSHIP_CHANGED_"+id);
   seen.add(id);
   return Object.freeze({
    id:s.id,eventId:event.id,cueIds:Object.freeze([...s.sourceCueIds]),
    sourceId:s.sourceId,sourceName:s.sourceName,sourceLatin:s.sourceLatin,
    sourceFolio:s.sourceFolio,sourceUrl:s.sourceUrl,
    sourcePhraseIndex:s.sourcePhraseIndex??null,
    toneFamily:s.toneFamily??s.settingId??null,
    gabc:s.gabc,score:s,
    printedPosition:fixedPreface?.sectionTitle?
       fixedPreface.sectionTitle+" · "+fixedPreface.position:
       isAppendix?"3. Tonus solemnior · "+s.printedLabel+" · LU p.110 / GR p.132*":null,
    originalPrintedWitnesses:Object.freeze(printedWitnesses.map(p=>
      Object.freeze({url:p.url,book:p.book,page:p.page}))),
    researchCatalogue:isAppendix?"SOLEMNIOR_FOUR_SOURCE_ONLY":"FIXED_24_BASELINE",
    printedNoteParity:"PENDING_INDEPENDENT_NOTE_BY_NOTE_REVIEW",
    contextCertified:false,publicScoreApproved:false,
    editorialDecision:"DO_NOT_PUBLISH"
   });
  });
  groups.push(Object.freeze({eventId:event.id,cueIds:Object.freeze([...event.cueIds]),
    baseline24Count:event.fixedResearchIds.length,appendixCount:appendix.length,
    rows:Object.freeze(rows)}));
 }
 if(seen.size!==28||[...byId.keys()].some(id=>!seen.has(id)))
  throw Error("RESEARCH_28_MISSING_OR_DUPLICATED_EVENT_MAPPING");
 const rows=Object.freeze(groups.flatMap(g=>g.rows));
 const urls=new Set(rows.flatMap(r=>r.originalPrintedWitnesses.map(p=>p.url)));
 const sourceIds=new Set(rows.map(r=>r.sourceId));
 if(sourceIds.size!==12||urls.size!==14||
    rows.filter(r=>r.researchCatalogue==="SOLEMNIOR_FOUR_SOURCE_ONLY").length!==4)
  throw Error("RESEARCH_28_EVIDENCE_IDENTITY_CHANGED");
 return Object.freeze({
  schema:PARTICIPATION_RESEARCH_28_SCHEMA,
  counts:Object.freeze({sourceRecords:12,sourceMappedMassEventGroups:15,
   baseFixedExcerpts:24,solemniorAppendixExcerpts:4,totalResearchExcerpts:28,
   distinctOriginalPrintedPages:14,printedFineNeumesCertified:0,
   actualSolemniorMassContextsCertified:0,newPublicApprovals:0,
   existingPublicIteVIIIFragments:2}),
  groups:Object.freeze(groups),rows
 });
}
