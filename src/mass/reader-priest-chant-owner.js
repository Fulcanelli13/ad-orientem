// Exact owner guard for priest action/voice during choir-owned Sanctus, Benedictus and Agnus Dei.
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
// All five Sanctus/Benedictus public phrases are independent of the priest's
// recitation, not only the first Sanctus and Benedictus cue.
const SCHOLA_CUES=new Set([
  "AO.SM.C0145","AO.SM.C0146","AO.SM.C0147","AO.SM.C0148","AO.SM.C0149",
]);
// Ritus servandus X.3: three normative priest breast strikes at Agnus Dei
// (not in Requiem). A choir's three invocations are NOT an observed
// priest gesture. The Requiem form is guarded separately upstream.
const AGNUS_SCHOLA_CUES=new Set([
  "AO.SM.C0222","AO.SM.C0223","AO.SM.C0224",
]);
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
  const schola=(SCHOLA_CUES.has(id)||AGNUS_SCHOLA_CUES.has(id)) &&
    sourceClock==="SCHOLA_PUBLIC";
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

/**
 * Keep the priest's *voice* as independent of the Schola as his actions.
 * The frozen cue voice at C0145 describes a quiet priest track, not an
 * observation that he happens to be reciting it when the choir sings.
 * The source voice applies normally outside the five Schola-owned cues.
 */
export function resolvePriestChantVoice({
  form=null,cueId=null,sourceClock=null,
  ordinaryVoice=null,observedPriestAction=null,observation=null
}={}){
  const selected=String(form??"").toUpperCase(),id=String(cueId??"");
  if(!SUNG_FORMS.has(selected)||
      !(WINDOW_CUES.has(id)||AGNUS_SCHOLA_CUES.has(id))||
      sourceClock!=="SCHOLA_PUBLIC"){
    return Object.freeze({priestVoice:ordinaryVoice??null,
      owner:"EXISTING_SOURCE_VOICE",observed:false});
  }
  // Agnus gestures are source-attested but no independently observable
  // Agnus event type has been certified. Never reuse a Sanctus observation,
  // a choir tick, or a frozen quiet-priest voice for these three cues.
  if(AGNUS_SCHOLA_CUES.has(id))return Object.freeze({
    priestVoice:null,owner:"PRIEST_VOICE_UNOBSERVED_FAIL_CLOSED",observed:false
  });
  const verified=observedPriestAction?.observed===true &&
    observedPriestAction?.owner==="INDEPENDENT_PRIEST_OBSERVATION" &&
    observation?.actor==="PRIEST" && observation?.observed===true &&
    observation?.source==="EXPLICIT_OBSERVATION" &&
    observation?.atCueId===id &&
    Object.hasOwn(SOURCE_GESTURES,String(observation?.eventType??""));
  if(!verified){
    return Object.freeze({priestVoice:null,
      owner:"PRIEST_VOICE_UNOBSERVED_FAIL_CLOSED",observed:false});
  }
  const label=observation.eventType==="PRIEST_SANCTUS_RECITATION"
    ?"PRIEST RECITES SANCTUS QUIETLY"
    :"PRIEST RECITES BENEDICTUS QUIETLY";
  return Object.freeze({priestVoice:Object.freeze({
    label,value:"QUIET / SECRET",
    owner:"INDEPENDENT_PRIEST_OBSERVATION",cueId:id,
    sourceCueId:SOURCE_GESTURES[observation.eventType].sourceCueId,
    transient:true
  }),owner:"INDEPENDENT_PRIEST_OBSERVATION",observed:true});
}

export function validatePriestChantObservation(event,cueId,form){
  const id=String(cueId??"");
  if(!SUNG_FORMS.has(String(form??"").toUpperCase()))return false;
  if(!WINDOW_CUES.has(id))return false;
  return Boolean(event && event.actor==="PRIEST" &&
    event.observed===true && event.source==="EXPLICIT_OBSERVATION" &&
    Object.hasOwn(SOURCE_GESTURES,String(event.eventType??"")));
}
