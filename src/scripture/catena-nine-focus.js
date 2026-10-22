/*
 * Manual-editor focus queue: pointer-verified routing evidence, not approval.
 * This validator cannot grant an approval or set a human attestation.
 */
export const CATENA_NINE_FOCUS_SCHEMA="ao.catena.matthew-nine-focused-editorial-preview.v1";
export function validateCatenaNineFocus(data,contextReview,workLoci){
 if(data?.schema!==CATENA_NINE_FOCUS_SCHEMA||
  data.researchCommit!=="23a9dc9f45a5f9b90d17db80c0ed22ca6a60a597"||
  data.sourceWorkCrosswalkCommit!==data.researchCommit||
  data.expectedTotal!==9||data.records?.length!==9||
  data.originalLanguageCollated!==false||data.independentlyEditorApproved!==false||
  data.publicationEligibility!=="blocked_research_only"||
  !contextReview?.records||!workLoci?.byPointer)
  throw new Error("CATENA_NINE_FOCUS_INVALID");
 const prior=new Map(contextReview.records.map(x=>[x.sourcePointer,x]));
 const ranks=[2,3,4,9,12,22,23,25,29],accepted=new Map();
 for(let i=0;i<ranks.length;i++){
  const row=data.records[i],p=prior.get(row?.sourcePointer),w=workLoci.byPointer.get(row?.sourcePointer);
  if(!p||!w||accepted.has(row.sourcePointer)||row.rank!==ranks[i]||
   row.rank!==p.rank||row.rank!==w.rank||
   p.AIContextAssessment!=="direct"||
   row.inheritedFatherLabel!==p.inheritedFatherLabel||
   row.originalReaderQuestion!==p.originalReaderQuestion||
   row.originalSourceEvidencePhrase!==p.originalSourceEvidencePhrase||
   row.fullWorkCitation!==w.workLocus||row.fullWorkLink!==w.externalWorkTextURL||
   !/^https:\/\/www\.newadvent\.org\/fathers\/\d+\.htm$/.test(row.fullWorkLink)||
   row.shortParallelTranslationAnchor?.length<16||
   row.comparisonBasis!=="passage_argument_same_meaning_in_distinct_English_translations"||
   row.researchCaution?.length<45||
   row.humanSignoff!==false||row.independentTextCriticalAuthentication!==false||
   row.publicationEligibility!=="blocked_research_only")
   throw new Error("CATENA_NINE_FOCUS_RECORD_INVALID");
  accepted.set(row.sourcePointer,row);
 }
 if(accepted.get("catena.matthew.13.1:17")?.fullWorkCitation!=="Homily 44, section 5"||
  accepted.get("catena.matthew.13.36:9")?.fullWorkCitation!=="Homily 47, section 1")
  throw Error("CATENA_NINE_FOCUS_SECTION_CORRECTION_MISSING");
 return Object.freeze({byPointer:accepted,total:accepted.size});
}
