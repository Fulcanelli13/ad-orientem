// Research-only owner model. NOT imported by the Ad Orientem application.
// An observed priest act is an independent lane, not a fabricated new canonical cue.
export const PREVIEW_PRIEST_OBSERVATION_EVENTS=Object.freeze({
  PRIEST_SANCTUS_RECITATION:Object.freeze({
    sourceCueId:"AO.SM.C0145",gestureId:"GM.P.C0145.01",formScope:"ALL"
  }),
  PRIEST_BENEDICTUS_RECITATION:Object.freeze({
    sourceCueId:"AO.SM.C0148",gestureId:"GM.P.C0148.01",formScope:"ALL"
  })
});
const SUPPORTED=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const PUBLIC_SCHOLA_CUES=new Set(["AO.SM.C0145","AO.SM.C0148"]);

export function previewPriestCeremonialOwnership({
  form,
  publicCueId=null,
  observedPriestEvent=null,
  gestureMatrix,
  sungCorpus
}={}){
  const fail=(reason)=>Object.freeze({
    schema:"ao-research-priest-owner-preview-v1",researchOnly:true,
    runtimeApproved:false,priestAction:null,owner:"FAIL_CLOSED",
    publicCueId:publicCueId??null,reason,
    faithfulPosture:null,scholaCueRetained:publicCueId??null
  });
  if(!SUPPORTED.has(form))return fail("UNSUPPORTED_FORM");
  if(!gestureMatrix||!sungCorpus)return fail("MISSING_CANONICAL_INPUTS");
  const all=new Map(sungCorpus.blocks.flatMap(b=>(b.units??[]).map(u=>[u.cue_id,u])));
  const speech=String(publicCueId??"");
  if(speech&&!all.has(speech))return fail("UNKNOWN_CUE");
  if(observedPriestEvent==null){
    return fail(PUBLIC_SCHOLA_CUES.has(speech)?"SCHOLA_CUE_NOT_PRIEST_OBSERVATION":"NO_OBSERVED_PRIEST_EVENT");
  }
  if(observedPriestEvent?.actor!=="PRIEST"||observedPriestEvent?.observed!==true){
    return fail("PRIEST_EVENT_NOT_OBSERVED");
  }
  const rule=PREVIEW_PRIEST_OBSERVATION_EVENTS[observedPriestEvent.eventType];
  if(!rule)return fail("UNREVIEWED_PRIEST_EVENT");
  if(sungCorpus.blocks.flatMap(b=>b.units??[]).find(x=>x.cue_id===rule.sourceCueId)?.clock!=="SCHOLA_PUBLIC"){
    return fail("SOURCE_CLOCK_CHANGED_NEEDS_REVIEW");
  }
  const row=gestureMatrix.items.find(x=>x.id===rule.gestureId);
  if(!row||row.actor!=="PRIEST"||row.cueId!==rule.sourceCueId||!row.displayPrimary){
    return fail("SOURCE_GESTURE_NOT_CERTIFIED");
  }
  return Object.freeze({
    schema:"ao-research-priest-owner-preview-v1",researchOnly:true,
    runtimeApproved:false,priestAction:Object.freeze({
      sourceGestureId:row.id,sourceCanonicalCueId:row.cueId,
      label:row.label,gesture:row.gesture,iconKey:row.iconKey,
      actor:"PRIEST",owner:"OBSERVED_PRIEST_EVENT_NOT_SCHOLA"
    }),owner:"PRIEST_OBSERVATION",
    reason:null,publicCueId:speech||null,
    faithfulPosture:null,scholaCueRetained:speech||null
  });
}
