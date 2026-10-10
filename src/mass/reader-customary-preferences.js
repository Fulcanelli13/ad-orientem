// Local participation customs are display-only. They never rewrite the
// 1962 rubrics, priest actions, or the Mass's canonical event sequence.
import { resolveReaderPreferences, POSTURE_PROFILES, GESTURE_PROFILES } from "./reader-state.js";

export const MASS_CUSTOMARY_STORAGE_KEY="ao-mass-customary-v1";
const POSTURES=new Set(["STAND","SIT","KNEEL"]);
const CUE=/^AO\.SM\.C\d{4}$/;

function object(value){return value&&typeof value==="object"&&!Array.isArray(value)?value:{};}
function safeStorage(storage,method,...args){
  try{return storage?.[method]?.(...args)??null;}catch{return null;}
}
export function readMassCustomaryPreferences(base={},storage=null){
  let saved={};
  try{saved=object(JSON.parse(safeStorage(storage,"getItem",MASS_CUSTOMARY_STORAGE_KEY)||"{}"));}catch{}
  const source=object(base);
  const local={...object(source.localPostures)};
  for(const [cue,value] of Object.entries(object(saved.localPostures))){
    if(CUE.test(cue)&&POSTURES.has(value))local[cue]=value;
  }
  return resolveReaderPreferences({
    ...source,
    postureProfile:POSTURE_PROFILES.includes(saved.postureProfile)?saved.postureProfile:source.postureProfile,
    gestureProfile:GESTURE_PROFILES.includes(saved.gestureProfile)?saved.gestureProfile:source.gestureProfile,
    localPostures:local,
  });
}
export function updateMassCustomaryPreferences(preferences,change,storage=null){
  const input=object(change);
  const next={...preferences,localPostures:{...object(preferences?.localPostures)}};
  if(input.kind==="postureProfile"){
    if(!POSTURE_PROFILES.includes(input.value))return preferences;
    next.postureProfile=input.value;
  }else if(input.kind==="gestureProfile"){
    if(!GESTURE_PROFILES.includes(input.value))return preferences;
    next.gestureProfile=input.value;
  }else if(input.kind==="localPosture"){
    if(!CUE.test(String(input.cueId||"")))return preferences;
    if(input.value==null||input.value==="DEFAULT")delete next.localPostures[input.cueId];
    else if(POSTURES.has(input.value))next.localPostures[input.cueId]=input.value;
    else return preferences;
  }else return preferences;
  const resolved=resolveReaderPreferences(next);
  safeStorage(storage,"setItem",MASS_CUSTOMARY_STORAGE_KEY,JSON.stringify({
    postureProfile:resolved.postureProfile,
    gestureProfile:resolved.gestureProfile,
    localPostures:Object.fromEntries(Object.entries(resolved.localPostures).filter(([k,v])=>CUE.test(k)&&POSTURES.has(v))),
  }));
  return resolved;
}
