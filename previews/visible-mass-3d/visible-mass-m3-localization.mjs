/**
 * M3 source-locked English/French research comparison for the six-photo pilot.
 * The only English answer owner is the original Phase 1.5 source; the overlay
 * is an editorial French translation candidate, not an independent doctrine
 * record. Neither language is approved for public teaching by this adapter.
 */
export const VMQ_M3_VIEWER_GATE="EDITORIAL_RESEARCH_PREVIEW_ONLY";
export function buildVisibleMassM3Index(pilot,historical,functional,overlay){
 if(pilot?.status!=="RESEARCH_ONLY_NO_PUBLICATION"||
   overlay?.status!=="FRENCH_RESEARCH_TRANSLATION_NO_PUBLICATION"||
   historical?.status!=="HISTORICAL_SOURCES_CHECKED_RESEARCH_DRAFT_NOT_LITURGICAL_APPROVAL"||
   functional?.status!=="SECONDARY_SOURCES_INSPECTED_RESEARCH_DRAFT_NOT_RITE_CERTIFICATION")
   throw new Error("VMQ M3 source publication gate changed");
 const questions=new Map((pilot.questions||[]).map(q=>[q.id,q]));
 const originals=new Map([...(historical.answers||[]),...(functional.answers||[])].map(a=>[a.question_id,a]));
 const held=new Set(["VMQ-0004","VMQ-0018","VMQ-0061","VMQ-0064"]);
 const permittedTriages=new Set(["SOURCE_CORROBORATED_CANDIDATE",
   "1962_RITUAL_CROSSCHECK_REQUIRED","HISTORICAL_REVIEW_REQUIRED"]);
 const byId=new Map();
 for(const item of overlay.translations||[]){
   const id=item.question_id,original=originals.get(id),question=questions.get(id);
   if(byId.has(id)||held.has(id)||!original||!question||item.owner_question_id!==id||
      item.object_id!==original.object_id||question.primary_object_id!==item.object_id||
      original.status!=="RESEARCH_DRAFT_EXACT_QUESTION_NOT_PUBLICATION_CERTIFIED"||
      item.original_answer_status!==original.status||
      item.translation_status!=="EDITORIAL_FRENCH_DRAFT_NOT_APPROVED"||
      !permittedTriages.has(item.triage)||
      !["question_fr","answer_fr","explanation_fr"].every(k=>
         typeof item[k]==="string"&&item[k].trim().length>=25)||
      !Array.isArray(item.primary_source_uris)||
      item.primary_source_uris.length===0||
      item.primary_source_uris.some(url=>!original.source_evidence.some(s=>s.url===url))){
     throw new Error("VMQ M3 translation cannot detach from original authority: "+id);
   }
   byId.set(id,Object.freeze(item));
 }
 if(byId.size!==20)throw new Error("VMQ M3 exact translation coverage changed");
 return Object.freeze({
   gate:VMQ_M3_VIEWER_GATE,count:byId.size,
   languageRecord(questionId,lang){
     const q=questions.get(questionId),en=originals.get(questionId);
     if(!q)return null;
     const fr=lang==="fr"?byId.get(questionId):null;
     return Object.freeze({
       id:questionId,language:fr?"fr":"en",fallback:lang==="fr"&&!fr,
       question:fr?.question_fr??q.question.en,
       answer:en?(fr?.answer_fr??en.answer_en):null,
       context:en?(fr?.explanation_fr??en.explanation_en):null,
       triage:fr?.triage??null,
       translationStatus:fr?.translation_status??null,
       originalAnswerStatus:en?.status??null,
       researchOnly:true
     });
   },
   hasFrench:id=>byId.has(id)
 });
}
