// Exact-source extension of six user-approved 29 Oct monochrome Mass icons.
// Never merge these into the frozen 67-masters: these are separate user
// approved additions and retain the original 1962 prayer/rubric owners.
const CUES=Object.freeze({
 "AO.SM.C0117":"ao_1962_priest_c0117",
 "AO.SM.C0155":"ao_1962_priest_c0155",
 "AO.SM.C0161":"ao_1962_priest_c0161",
 "AO.SM.C0193":"ao_1962_priest_c0193",
 "AO.SM.C0204":"ao_1962_priest_c0204",
 "AO.SM.C0263":"ao_1962_priest_c0263",
});
export const USER_APPROVED_MASS_GESTURE_KEYS=CUES;
export const USER_APPROVED_MASS_GESTURE_ASSETS=Object.freeze({
 "ao_1962_priest_c0117":new URL("../../assets/extensions/mass-user-gesture-20261029/C0117.svg",import.meta.url).href,
 "ao_1962_priest_c0155":new URL("../../assets/extensions/mass-user-gesture-20261029/C0155.svg",import.meta.url).href,
 "ao_1962_priest_c0161":new URL("../../assets/extensions/mass-user-gesture-20261029/C0161.svg",import.meta.url).href,
 "ao_1962_priest_c0193":new URL("../../assets/extensions/mass-user-gesture-20261029/C0193.svg",import.meta.url).href,
 "ao_1962_priest_c0204":new URL("../../assets/extensions/mass-user-gesture-20261029/C0204.svg",import.meta.url).href,
 "ao_1962_priest_c0263":new URL("../../assets/extensions/mass-user-gesture-20261029/C0263.svg",import.meta.url).href,
});
export function userApprovedMassGestureArt({cueId=null,matrixAction=null,priestAction=null}={}){
 const cue=String(cueId??"");
 const key=CUES[cue]??null;
 if(!key||!matrixAction||!priestAction)return null;
 if(matrixAction.cueId!==cue||matrixAction.sourceGestureId!=="GM.P."+cue.slice(6)+".01"||
   matrixAction.owner!=="GESTURE_MATRIX_SOT"||
   matrixAction.authorityClass!=="1962_NORMATIVE"||
   !matrixAction.sources?.includes("MR62_RITUS")||
   matrixAction.iconKey!=null||
   (priestAction.cueId&&priestAction.cueId!==cue))return null;
 return key;
}
export function resolveUserApprovedMassGestureArt(key,baseResolver){
 const name=String(key??"");
 if(Object.prototype.hasOwnProperty.call(USER_APPROVED_MASS_GESTURE_ASSETS,name))
   return USER_APPROVED_MASS_GESTURE_ASSETS[name];
 return typeof baseResolver==="function" ? baseResolver(name) : null;
}
