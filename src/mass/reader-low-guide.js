// Research-only Low Mass Guide resolver, isolated from the 32-entry canonical Guide registry.
// This does NOT replace the released reader, publish historic copy, infer gestures, or
// map 35 legacy editorial stages onto 30 priest/source macros.
export const LOW_GUIDE_RESEARCH_FILE="mass-low-35-guide-legacy-index-20261016.v1.json";
export const LOW_GUIDE_RESEARCH_STATUS="HISTORICAL_SOURCE_SHORT_TEXT_RESTORED_LONG_TEXT_ONLY_IN_FROZEN_WORKBOOK";
export const LOW_GUIDE_MASS_FORM="LOW_1962";

export function validateLowGuideResearch(index){
  if(!index||index.schema!=="ao-low-mass-guide-source-index-v1")throw new TypeError("Exact Low Mass research schema required");
  if(index.status!==LOW_GUIDE_RESEARCH_STATUS||index.authority!=="RESEARCH_COPY_NO_PUBLICATION")throw new Error("Not research-only Low Mass source");
  if(index.massForm!==LOW_GUIDE_MASS_FORM||index.entryCount!==35)throw new Error("35 exact Low Mass records required");
  if(index.preserveExactly32CurrentGuides!==true||index.scholaTrackMustNotBeInvented!==true)throw new Error("Low/Sung canonical separation required");
  const entries=index.entries??{};
  if(Object.keys(entries).length!==35)throw new Error("Incomplete Low Mass research source");
  for(let n=1;n<=35;n++){
    const id="LOW."+String(n).padStart(3,"0");
    const record=entries[id];
    if(!record||record.key!==id||record.profile!=="LOW_MASS"||record.sequence!==n)throw new Error("Low Guide identity mismatch: "+id);
    if(!record.moment?.trim()||!record.short?.trim())throw new Error("Empty Low Guide source: "+id);
    if(record.releaseApproved!==false||record.longSourceOnly!==true)throw new Error("Low Guide text not cleared: "+id);
  }
  return index;
}
export async function loadLowGuideResearch({fetchImpl=globalThis.fetch,baseUrl=import.meta.url}={}){
  if(typeof fetchImpl!=="function")throw new TypeError("Fetch implementation required");
  const url=new URL("../../data/learn/research/"+LOW_GUIDE_RESEARCH_FILE,baseUrl);
  const response=await fetchImpl(url);
  if(!response?.ok)throw new Error("Low Guide research index unavailable");
  return Object.freeze({index:validateLowGuideResearch(await response.json()),url:String(url)});
}
/** Research preview ONLY: an explicitly selected Low Mass guide ID, NEVER a
 * guess from source cue, card index or the public Sung guide's sequence.
 * Returns no long text, gesture, posture, or publication approval.
 */
export function lowGuideResearchCandidate(index,{massForm=null,guideId=null,allowResearchPreview=false}={}){
  validateLowGuideResearch(index);
  if(allowResearchPreview!==true || massForm!==LOW_GUIDE_MASS_FORM)return null;
  if(typeof guideId!=="string"||!/^LOW\.0(?:0[1-9]|[12][0-9]|3[0-5])$/.test(guideId))return null;
  const record=index.entries[guideId];
  if(!record)return null;
  return Object.freeze({
    key:guideId,profile:"LOW_MASS",moment:record.moment,
    text:record.short,detail:null,sourceLine:null,sourceLinks:null,
    sourceStatus:"RESEARCH_ONLY_SHORT_TEXT",releaseApproved:false,
    registryAvailable:false,actorClock:"PRIEST+SERVER",scholaClock:null,
    formGate:"EXPLICIT_LOW_1962",requiresSourceReview:true,
    sourceWorkbookRow:record.originalWorkbookRow
  });
}


/** Research-only bridge to the actual R17 source-cue clock. Not a new Mass sequence.
 * It only selects an existing source index row, and never certifies its text,
 * its exact handoff timing, priest gestures, or a condition for which the
 * current resolved Mass has provided no explicit applicability.
 */
export function lowGuideForActiveCue(index,{
  massForm=null,
  activeCueId=null,
  allowResearchPreview=false,
  applicableConditionalGuideIds=[],
  selectedObservationalGuideId=null,
}={}){
  validateLowGuideResearch(index);
  if(allowResearchPreview!==true||massForm!==LOW_GUIDE_MASS_FORM)return null;
  const allowed=new Set(Array.isArray(applicableConditionalGuideIds)?
    applicableConditionalGuideIds.filter(x=>typeof x==="string") : []);
  // The two explicitly observational Guides are never manufactured from a cue.
  if(selectedObservationalGuideId!=null){
    if(!["LOW.001","LOW.028"].includes(selectedObservationalGuideId))return null;
    if(!allowed.has(selectedObservationalGuideId))return null;
    const selected=lowGuideResearchCandidate(index,{
      massForm,guideId:selectedObservationalGuideId,allowResearchPreview,
    });
    return selected ? Object.freeze({...selected,researchPreview:true,
      sourceCueId:null,coverage:"EXPLICIT_OBSERVATIONAL_RESEARCH"}) : null;
  }
  if(!/^AO\.SM\.C\d{4}$/.test(String(activeCueId??"")))return null;
  const cueNumber=Number(String(activeCueId).slice(-4));
  let selected=null;
  for(let i=1;i<=35;i++){
    const e=index.entries["LOW."+String(i).padStart(3,"0")];
    if(!e.anchorCueCandidate)continue;
    const anchorNumber=Number(e.anchorCueCandidate.slice(-4));
    if(anchorNumber<=cueNumber)selected=e;
    else break;
  }
  if(!selected)return null;
  // Conditional status is inferred from neither calendar date nor the
  // presence of a candidate source anchor. The caller must establish that
  // this particular liturgical feature occurs in the selected Mass.
  if(selected.condition!=="ORDINARY_LOW_MASS_SEQUENCE_USE_READER_ACTUAL_CUE" &&
     !allowed.has(selected.key))return null;
  const candidate=lowGuideResearchCandidate(index,{
    massForm,guideId:selected.key,allowResearchPreview,
  });
  return candidate ? Object.freeze({...candidate,researchPreview:true,
    sourceCueId:activeCueId,coverage:"CUE_RANGE_RESEARCH_CANDIDATE_NOT_WORD_CERTIFIED"}) : null;
}
