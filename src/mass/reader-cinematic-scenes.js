// LIVE-only visual focus. This layer is not a priest/minister observation clock.
// No animation here claims an actual genuflection, elevation, or user posture.
const CUES=Object.freeze({
  "AO.SM.C0173":"HOST_WORDS",
  "AO.SM.C0179":"CHALICE_WORDS",
  "AO.SM.C0174":"HOST_ELEVATION",
  "AO.SM.C0181":"CHALICE_ELEVATION",
  "AO.SM.C0096":"INCARNATUS_GESTURE",
});
const ELEVATIONS=new Set(["HOST_ELEVATION","CHALICE_ELEVATION"]);
const POSTURE_GESTURES=new Set(["GENUFLECT","KNEEL","BOW","PROFOUND_BOW","HEAD_BOW"]);

export function projectLiveCinematicScene({
  mode=null, cueId=null, cueNative=false, cinematic=null, faithfulGesture=null,
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
