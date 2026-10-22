/*
 * External original-work reading aids for the Catena editor.
 * These are cross-checkable translated witnesses, not certificates.
 * Strictly no automatic checkbox attestation and no publication mutation.
 */
export const CATENA_EXTERNAL_SOURCE_SCHEMA="ao.catena.matthew-original-work-preview-loci.v1";
export function validateCatenaWorkLociPreview(data,contextReview){
 if(!contextReview||data?.schema!==CATENA_EXTERNAL_SOURCE_SCHEMA||
  data.originalWorkResearchCommit!=="23a9dc9f45a5f9b90d17db80c0ed22ca6a60a597"||
  data.contextReviewSourceCommit!==contextReview.sourceResearchCommit||
  data.originalLanguageCollated!==false||data.humanApproved!==false||
  data.publicationEligibility!=="blocked_research_only"||data.records?.length!==18)
  throw Error("CATENA_ORIGINAL_WORK_RESEARCH_INVALID");
 const source=new Map(contextReview.records.map(r=>[r.sourcePointer,r]));
 const seen=new Map();
 for(const item of data.records){
  const matched=source.get(item.sourcePointer);
  if(!matched||seen.has(item.sourcePointer)||
   item.rank!==matched.rank||item.inheritedFatherLabel!==matched.inheritedFatherLabel||
   item.originalReaderQuestion!==matched.originalReaderQuestion||
   !/^https:\/\/www\.newadvent\.org\/fathers\/[a-z0-9]+\.htm$/.test(item.externalWorkTextURL)||
   item.patristicWork?.length<20||item.workLocus?.length<14||
   item.translatedParallelEvidence?.length<70||item.qualification?.length<45||
   item.verificationDepth!=="specific_original_work_and_relevant_English_passage_located_no_Greek_Latin_collation"||
   item.originalLanguageCollated!==false||item.independentHumanApproved!==false||
   item.publicationEligibility!=="blocked_research_only")
   throw Error("CATENA_ORIGINAL_WORK_LOCATION_INVALID");
  seen.set(item.sourcePointer,item);
 }
 return Object.freeze({byPointer:seen,total:seen.size});
}
