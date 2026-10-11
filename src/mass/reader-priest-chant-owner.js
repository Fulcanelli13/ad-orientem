// Exact owner guard for priest actions during the Sung Sanctus.
// Public Schola text and the priest's own silent/quiet prayer are independent.
// An explicit observation is an external/manual input, NOT automatic movement recognition.
// No canonical cue, devotional instruction, or faithful posture is generated here.

const SUNG_FORMS=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const SOURCE_GESTURES=Object.freeze({
  PRIEST_SANCTUS_RECITATION:Object.freeze({
    sourceCueId:"AO.SM.C0145",sourceGestureId:"GM.P.C0145.01"
  }),
  PRIEST_BENEDICTUS_RECITATION:Object.freeze({
    sourceCueId:"AO.SM.C0148",sourceGestureId:"GM.P.C0148.01"
  }),
});
const SCHOLA_CUES=new Set(["AO.SM.C0145","AO.SM.C0148"]);
const WINDOW_CUES=new Set([
  "AO.SM.C0145","AO.SM.C0146","AO.SM.C0147","AO.SM.C0148","AO.SM.C0149"
]);

export const PRIEST_SANCTUS_OBSERVATION_TYPES=Object.freeze(Object.keys(SOURCE_GESTURES));

export function resolvePriestChantAction({
  form=null,cueId=null,sourceClock=null,
  observation=null,gestureMatrix=null,ordinaryAction=null
}={}){
  const fail=(owner,reason)=>Object.freeze({priestAction:null,owner,reason,observed:false});
  if(!SUNG_FORMS.has(String(form??"").toUpperCase())){
    // No choir-owned Sanctus cue in the Low Mass donor.
    return Object.freeze({priestAction:ordinaryAction??null,owner:"UNCHANGED_FORM",reason:null,observed:false});
  }
  const id=String(cueId??"");
  const schola=SCHOLA_CUES.has(id) && sourceClock==="SCHOLA_PUBLIC";
  // Reject even a correct observation if focus has changed since it was made.
  const validObservation=observation?.actor==="PRIEST" &&
    observation?.observed===true &&
    observation?.source==="EXPLICIT_OBSERVATION" &&
    observation?.atCueId===id &&
    WINDOW_CUES.has(id) &&
    Object.hasOwn(SOURCE_GESTURES,String(observation?.eventType??""));
  if(validObservation){
    const def=SOURCE_GESTURES[observation.eventType];
    const row=gestureMatrix?.items?.find(x=>x.id===def.sourceGestureId);
    if(row?.actor==="PRIEST" && row?.cueId===def.sourceCueId &&
       row?.displayPrimary===true && row?.authorityClass==="1962_NORMATIVE"){
      return Object.freeze({
        priestAction:Object.freeze({
          label:row.label,action:row.label,iconKey:row.iconKey,
          sourceGestureId:row.id,sourceCueId:row.cueId,
          cueId:id,owner:"INDEPENDENT_PRIEST_OBSERVATION",transient:true
        }),
        owner:"INDEPENDENT_PRIEST_OBSERVATION",reason:null,observed:true
      });
    }
    return fail("PRIEST_EVENT_FAIL_CLOSED","GESTURE_SOURCE_MISMATCH");
  }
  if(schola){
    return fail("PRIEST_EVENT_UNOBSERVED","SCHOLA_PUBLIC_CUE_NOT_PRIEST_ACTION");
  }
  // Do not silently turn an observed gesture into a permanent state.
  return Object.freeze({
    priestAction:ordinaryAction??null,owner:"EXISTING_SOURCE_ACTION",
    reason:null,observed:false
  });
}

export function validatePriestChantObservation(event,cueId,form){
  const id=String(cueId??"");
  if(!SUNG_FORMS.has(String(form??"").toUpperCase()))return false;
  if(!WINDOW_CUES.has(id))return false;
  return Boolean(event && event.actor==="PRIEST" &&
    event.observed===true && event.source==="EXPLICIT_OBSERVATION" &&
    Object.hasOwn(SOURCE_GESTURES,String(event.eventType??"")));
}
