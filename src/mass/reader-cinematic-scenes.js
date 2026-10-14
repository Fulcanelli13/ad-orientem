// LIVE-only visual focus. This layer is not a priest/minister observation clock.
// No animation here claims an actual genuflection, elevation, or user posture.
const CUES=Object.freeze({
  "AO.SM.C0173":"HOST_WORDS",
  "AO.SM.C0179":"CHALICE_WORDS",
  "AO.SM.C0174":"HOST_ELEVATION",
  "AO.SM.C0181":"CHALICE_ELEVATION",
  "AO.SM.C0096":"INCARNATUS_GESTURE",
  "AO.SM.C0161":"HANC_IGITUR_HANDS",
  "AO.SM.C0084":"GOSPEL_CROSSES",
});
const ELEVATIONS=new Set(["HOST_ELEVATION","CHALICE_ELEVATION"]);
const POSTURE_GESTURES=new Set(["GENUFLECT","KNEEL","BOW","PROFOUND_BOW","HEAD_BOW"]);

export function projectLiveCinematicScene({
  mode=null, cueId=null, cueNative=false, cinematic=null, faithfulGesture=null,
  priestAction=null, priestPosition=null, sourceGestureAction=null,
}={}){
  if(String(mode??"").toUpperCase()!=="LIVE" || cueNative!==true)return null;
  const id=CUES[String(cueId??"")]??null;
  if(!id)return null;
  if(ELEVATIONS.has(id) && (
    cinematic?.kind!=="ELEVATION" ||
    cinematic?.cueId!==cueId ||
    cinematic?.canonicalAuthority!==false
  ))return null;
  if(id==="INCARNATUS_GESTURE" && (
    faithfulGesture?.canonicalCueId!==cueId ||
    !POSTURE_GESTURES.has(String(faithfulGesture?.type??"").toUpperCase())
  ))return null;
  // This certified gesture's exact master is still pending. Accentuate the
  // prayer and existing source cue, never substitute an invented hands icon.
  if(id==="HANC_IGITUR_HANDS" && !(
    (priestAction?.cueId===cueId || priestAction?.sourceCueId===cueId) &&
    String(priestAction?.label??priestAction?.action??"").toUpperCase()==="HANDS OVER OBLATIONS"
  ))return null;
  // Do not stage the Gospel small crosses from a generic Gospel card title:
  // the priest's exact book/body-cross source cue and station must agree.
  if(id==="GOSPEL_CROSSES" && !(
    sourceGestureAction?.sourceGestureId==="GM.P.C0084.01" &&
    sourceGestureAction?.cueId===cueId &&
    sourceGestureAction?.owner==="GESTURE_MATRIX_SOT" &&
    sourceGestureAction?.iconKey==="gospel_crosses" &&
    String(priestPosition?.station??priestPosition?.value??"").toUpperCase()==="ALTAR_GOSPEL_MISSAL"
  ))return null;
  return Object.freeze({
    id,cueId,
    owner:"R17_EXACT_CUE_VISUAL_FOCUS",
    observedNow:false,
    priestActionClaim:false,
    faithfulActionClaim:false,
    canonicalAuthority:false,
    decorative:true,
  });
}

/* R28 Good Friday uses its own distinct-rite graph, not AO.SM Ordinary cues.
   This is a static, source-owned kneeling/silence treatment. Scrolling alone
   cannot invent GF-PASS-320; the existing death-word controller owns it. */
export function projectGoodFridayDeathScene({recordId=null,deathPause=false,posture=null}={}){
  if(recordId!=="GF-PASS-320" || deathPause!==true ||
    String(posture??"").toUpperCase()!=="KNEEL")return null;
  return Object.freeze({
    id:"PASSION_DEATH",cueId:"GF-PASS-320",
    owner:"R28_GF_PASSION_DEATH_SOURCE",
    observedNow:false,priestActionClaim:false,faithfulActionClaim:false,
    canonicalAuthority:false,decorative:true,
  });
}
