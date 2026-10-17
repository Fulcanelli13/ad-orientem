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
// 1960 Code of Rubrics §518(b): during the *sung* Et incarnatus, everyone
// kneels at the three Christmas Masses or Mass of the Annunciation. Do not
// infer this from the calendar date alone: the actual selected Proper wins,
// including an Annunciation transferred to a different civil date. Do not
// reuse this choir-phase rule for the priest's private recitation or Low Mass.
export function resolveIncarnatusSungAction(resolvedMass){
  const form=String(resolvedMass?.form??"").toUpperCase();
  if(!["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(form))
    return "GENUFLECT";
  const actual=resolvedMass?.actualCelebration;
  const proper=resolvedMass?.proper;
  if(!actual||proper?.status!=="READY")return "GENUFLECT";
  const inner=proper?.data??proper;
  const path=String(inner?.sourcePath??proper?.sourcePath??"").trim();
  // Annunciation is source-identified, not March-25-identified: transferred
  // observances still use the proper of the Annunciation.
  const annunciation=path==="Sancti/03-25";
  // The three Nativity Masses can resolve from distinct source owners. Their
  // common obligation is safely keyed by the actual Christmas calendar
  // celebration, never by the selected civil day if another Mass is followed.
  const nativityProper=/^Sancti\\/12-25(?:$|[._-][123abc])/.test(path);
  const sameCalendar=actual.type==="CALENDAR" &&
    resolvedMass?.explicitlySelectedCelebration!==true &&
    Boolean(actual.id) && actual.id===resolvedMass?.calendarCelebration?.id;
  const calendarChristmas=sameCalendar &&
    /^\\d{4}-12-25$/.test(String(resolvedMass?.date??""));
  return annunciation||nativityProper||calendarChristmas?"KNEEL":"GENUFLECT";
}

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
  // Faithful custom recorded for this local celebration, not a
  // universally fixed 1962 rubrical timestamp:
  // Gloria: priest sits at "Qui sedes ad dexteram Patris" and rises
  // at "Cum Sancto Spiritu", just before the concluding Amen.
  // Credo: remain standing/genuflect at the Incarnatus; sit at the
  // first paragraph after the kneeling passage (Crucifixus), or at the
  // following paragraph if selected locally; rise at "Et vitam".
  return phase==="GLORIA"
    ? n>=65&&n<68
    : n>=97&&n<104;
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
  const credoSitStart=preferences.credoSitStart==="AO.SM.C0098"?98:97;
  const customSitting=phase==="CREDO"
    ? num(cueId)>=credoSitStart&&num(cueId)<104
    : gloriaCredoSittingCue(cueId);
  const sungSpecialKneel=phase==="CREDO" && String(cueId)==="AO.SM.C0096" &&
    sung && incarnatusAction==="KNEEL";
  const defaultPosture=sungSpecialKneel?"KNEEL":follow&&customSitting?"SIT":sourceValue;
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
    conditionalSedilia:follow && customSitting,
    priestStateWitness:follow
      ? GLORIA_CREDO_SEDILIA_WITNESSES[phase][customSitting?"sit":"rise"]
      : null,
    gestureOwner:gesture?.owner??"NO_FAITHFUL_GESTURE",
    fixedSourcePosture:fixed,
  });
}
