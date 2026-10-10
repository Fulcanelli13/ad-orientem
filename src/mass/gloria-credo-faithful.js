// Display-only conventional Gloria/Credo participation guide.
// The certified priest-position registry owns source states C0276–C0279;
// those state sentinels are NOT prayer text cues. Word-level placement here
// is explicitly customary guidance, not a new 1962 rubrical command.
import { resolveFaithfulGestureForCue } from "./faithful-gesture-cues.js";
import { R17_ICON_KEYS } from "./reader-icons.js";

export const GLORIA_CREDO_SEDILIA_WITNESSES=Object.freeze({
  GLORIA:Object.freeze({sit:"AO.SM.C0276",rise:"AO.SM.C0277"}),
  CREDO:Object.freeze({sit:"AO.SM.C0278",rise:"AO.SM.C0279"}),
});
export const FAITHFUL_LOCAL_GESTURES=Object.freeze([
  "DEFAULT","NONE","HEAD_BOW","PROFOUND_BOW","GENUFLECT","KNEEL","SIGN_OF_CROSS",
]);
const postureValues=new Set(["STAND","SIT","KNEEL"]);
const gestureValues=new Set(FAITHFUL_LOCAL_GESTURES);
const num=id=>{const hit=String(id??"").match(/^AO\.SM\.C(\d{4})$/);return hit?Number(hit[1]):null;};
export function gloriaCredoPhase(cueId){
  const n=num(cueId);
  return n!=null&&n>=53&&n<=69?"GLORIA":n!=null&&n>=89&&n<=105?"CREDO":null;
}
export function gloriaCredoSittingCue(cueId){
  const n=num(cueId),phase=gloriaCredoPhase(cueId);
  if(!phase)return false;
  // When the priest uses the sedilia, the Schola begins after his
  // intonation. Rise is displayed at the closing doxology/Et vitam.
  // These are user-adjustable guide boundaries, not exact priest timestamps.
  return phase==="GLORIA" ? n>=55&&n<68 : n>=90&&n<104;
}
export function projectGloriaCredoFaithfulCue({
  cueId,form="SUNG",preferences={},sourcedPosture=null,incarnatusAction="GENUFLECT",
}={}){
  const phase=gloriaCredoPhase(cueId);
  if(!phase)return null;
  const sung=String(form).toUpperCase()!=="LOW";
  const sourceValue=String(sourcedPosture?.value??sourcedPosture?.label??"STAND").toUpperCase();
  const fixed=sourcedPosture?.fixed===true;
  const follow=preferences.followPriestSeating!==false && sung &&
    preferences.postureProfile!=="MY_LOCAL";
  const defaultPosture=follow&&gloriaCredoSittingCue(cueId)?"SIT":sourceValue;
  const local=preferences.localPostures??{};
  let saved=null;
  const key=String(cueId??"");
  if(!fixed){
    const candidate=local[key];
    if(postureValues.has(candidate))saved=candidate;
    else{
      // A selected local posture applies until a new saved instruction or
      // the next canonical section. Restrict ranges to this phase only.
      const n=num(key),start=phase==="GLORIA"?53:89;
      for(let i=start;i<=n;i++){
        const id="AO.SM.C"+String(i).padStart(4,"0");
        if(postureValues.has(local[id]))saved=local[id];
      }
    }
  }
  const posture=fixed?sourceValue:(saved??defaultPosture);
  const gestureSetting=preferences.localGestures?.[key]??"DEFAULT";
  const resolved=resolveFaithfulGestureForCue({
    cueId:key,gestureProfile:preferences.gestureProfile??"GUIDED_1962",incarnatusAction,
  });
  const gesture=gestureValues.has(gestureSetting)&&gestureSetting!=="DEFAULT"
    ? gestureSetting==="NONE"?null:Object.freeze({
        type:gestureSetting,label:gestureSetting.replaceAll("_"," "),
        canonicalCueId:key,owner:"LOCAL_FAITHFUL_CUSTOM",transient:true,
        anchorLat:resolved?.anchorLat??null,anchorEn:resolved?.anchorEn??null,
        anchorFr:resolved?.anchorFr??null,
      })
    : resolved;
  const gestureKey=gesture
    ? R17_ICON_KEYS.gesture[gesture.type]??(gesture.type==="KNEEL"?"kneel":null)
    : null;
  return Object.freeze({
    cueId:key,phase,posture,postureIconKey:R17_ICON_KEYS.posture[posture]??null,
    gesture,gestureIconKey:gestureKey,
    savedPosture:saved,savedGesture:gestureSetting,
    source:"GLORIA_CREDO_CUSTOMARY_DISPLAY",
    conditionalSedilia:follow && gloriaCredoSittingCue(key),
    priestStateWitness:follow
      ? GLORIA_CREDO_SEDILIA_WITNESSES[phase][gloriaCredoSittingCue(key)?"sit":"rise"]
      : null,
    gestureOwner:gesture?.owner??"NO_FAITHFUL_GESTURE",
    fixedSourcePosture:fixed,
  });
}
