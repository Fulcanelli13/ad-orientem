import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolveReaderPreferences } from "../src/mass/reader-state.js";
import { resolveReaderPostureChannel } from "../src/mass/reader-posture-profile.js";
import { readMassCustomaryPreferences, updateMassCustomaryPreferences, MASS_CUSTOMARY_STORAGE_KEY } from "../src/mass/reader-customary-preferences.js";
import { GLORIA_CREDO_FAITHFUL_GESTURES, resolveFaithfulGestureForCue } from "../src/mass/faithful-gesture-cues.js";
import { buildReaderShellMarkup } from "../src/mass/reader-dom.js";

const memory=new Map();
const storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};
let preferences=readMassCustomaryPreferences(resolveReaderPreferences({postureProfile:"FOLLOW_CONGREGATION"}),storage);
assert.equal(preferences.postureProfile,"FOLLOW_CONGREGATION");
preferences=updateMassCustomaryPreferences(preferences,{kind:"gestureProfile",value:"TRADITIONAL"},storage);
preferences=updateMassCustomaryPreferences(preferences,{kind:"postureProfile",value:"OCONNELL_1962_COMMUNITY"},storage);
preferences=updateMassCustomaryPreferences(preferences,{kind:"localPosture",cueId:"AO.SM.C0093",value:"SIT"},storage);
assert.match(memory.get(MASS_CUSTOMARY_STORAGE_KEY),/AO.SM.C0093/);
assert.equal(readMassCustomaryPreferences({},storage).gestureProfile,"TRADITIONAL");
assert.equal(readMassCustomaryPreferences({},storage).localPostures["AO.SM.C0093"],"SIT");
const source={
  cueId:"AO.SM.C0093",
  posture:{value:"STAND",label:"STAND",sourcePostureId:"SOURCE_STAND",fixed:false}
};
let state=resolveReaderPostureChannel({preferences,cueProjection:source,cueId:"AO.SM.C0093"});
assert.equal(state.posture.value,"SIT");
assert.equal(state.owner,"LOCAL_OVERRIDE");
assert.equal(state.localKey,"AO.SM.C0093");
// Gloria/Credo local sitting persists until the next sourced posture event.
const continued=resolveReaderPostureChannel({
  preferences,
  cueProjection:{cueId:"AO.SM.C0095",posture:{value:"STAND",cueId:"AO.SM.C0089",fixed:false}},
  cueId:"AO.SM.C0095",
});
assert.equal(continued.posture.value,"SIT");
assert.equal(continued.localKey,"AO.SM.C0093");
const nextSource=resolveReaderPostureChannel({
  preferences,
  cueProjection:{cueId:"AO.SM.C0107",posture:{value:"STAND",cueId:"AO.SM.C0106",fixed:false}},
  cueId:"AO.SM.C0107",
});
assert.equal(nextSource.posture.value,"STAND","local Credo custom leaked past sourced Offertory transition");
state=resolveReaderPostureChannel({preferences,cueProjection:{
  ...source,posture:{...source.posture,fixed:true}
},cueId:"AO.SM.C0093"});
assert.equal(state.posture.value,"STAND","local custom must not override a fixed rubric");
assert.equal(state.owner,"SOURCED_FIXED");
const changed=updateMassCustomaryPreferences(preferences,{kind:"localPosture",cueId:"AO.SM.C0093",value:"DEFAULT"},storage);
assert.equal(changed.localPostures["AO.SM.C0093"],undefined,"cue override could not be cleared");
const rejected=updateMassCustomaryPreferences(changed,{kind:"localPosture",cueId:"../../bad",value:"SIT"},storage);
assert.strictEqual(rejected,changed);
assert.equal(updateMassCustomaryPreferences(changed,{kind:"gestureProfile",value:"INVENTED"},storage),changed);

const src=JSON.parse(readFileSync(new URL("../data/presentation/reader-postures.v1.json",import.meta.url),"utf8"));
const map=new Map(src.items.filter(x=>x.cueId).map(x=>[x.cueId,x]));
for(const [cue,posture] of Object.entries({
  "AO.SM.C0053":"STAND", // Gloria
  "AO.SM.C0070":"STAND", // Collect
  "AO.SM.C0075":"SIT",   // Lessons
  "AO.SM.C0082":"STAND", // Gospel
  "AO.SM.C0089":"STAND", // Credo
  "AO.SM.C0106":"STAND", // Offertory greeting
}))assert.equal(map.get(cue)?.posture,posture,cue+" source transition missing");
for(const macro of ["AO.SM.M03","AO.SM.M09"]){
  const sit=src.items.find(item=>item.macroId===macro&&item.anchorType==="PRIEST_STATE"&&item.posture==="SIT");
  assert.ok(sit && sit.cueId===null && /LOCAL_PROFILE_SIT_WITH_MINISTERS/.test(sit.condition),
    "customary sitting is not yet an exact-cue transition; it must not be projected universally");
}
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0096",gestureProfile:"ESSENTIAL"}).type,"GENUFLECT");
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0056",gestureProfile:"GUIDED_1962"}),null);
assert.equal(resolveFaithfulGestureForCue({cueId:"AO.SM.C0056",gestureProfile:"TRADITIONAL"}).type,"HEAD_BOW");
assert.ok(GLORIA_CREDO_FAITHFUL_GESTURES["AO.SM.C0104"]);
const markup=buildReaderShellMarkup({readerPreferences:{mode:"LIVE"},session:{resolvedMass:{actualCelebration:{title:"Mass"},proper:{status:"READY",data:{colour:"red"}}}}});
assert.match(markup,/data-reader-customary="postureProfile"/);
assert.match(markup,/data-reader-customary="gestureProfile"/);
assert.match(markup,/data-reader-customary="localPosture"/);
assert.match(markup,/data-liturgical-colour="RED"/);
assert.match(markup,/--ao-missal-face/);
assert.match(markup,/data-opening="true"/); // CSS initial selector present
assert.match(markup,/prefers-reduced-motion/);
console.log("Mass customs and missal presentation: PASS — local overrides, Gloria/Credo cues, theme, typography.");
