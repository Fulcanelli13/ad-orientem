import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectGloriaCredoFaithfulCue,GLORIA_CREDO_SEDILIA_WITNESSES} from "../src/mass/gloria-credo-faithful.js";
import {readMassCustomaryPreferences,updateMassCustomaryPreferences} from "../src/mass/reader-customary-preferences.js";
import {buildReaderShellMarkup} from "../src/mass/reader-dom.js";
import {resolveReaderPreferences} from "../src/mass/reader-state.js";
const svgInventory=JSON.parse(readFileSync(new URL("../assets/active/mass-v46/manifest.v1.json",import.meta.url),"utf8"));
const file=readFileSync(new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8");
const corpus=JSON.parse(file);
const cueMap=new Map(corpus.blocks.flatMap(block=>block.units??[]).map(unit=>[unit.cue_id,unit]));
assert.match(cueMap.get("AO.SM.C0068").latin,/Cum Sancto Spíritu ✠/);
assert.match(cueMap.get("AO.SM.C0104").latin,/Et vitam ✠/);
const memory=new Map();
const storage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};
let prefs=readMassCustomaryPreferences(resolveReaderPreferences({gestureProfile:"GUIDED_1962"}),storage);
const cue=(id,opts={})=>projectGloriaCredoFaithfulCue({cueId:id,form:"MISSA_CANTATA_SIMPLE",
  preferences:prefs,sourcedPosture:{value:"STAND",cueId:opts.sourceCueId??"AO.SM.C0053",fixed:opts.fixed??false},...opts});
assert.equal(cue("AO.SM.C0053").posture,"STAND");
assert.equal(cue("AO.SM.C0055").posture,"STAND");
assert.equal(cue("AO.SM.C0061").posture,"STAND");
assert.equal(cue("AO.SM.C0061").gestureIconKey,"head_bow");
assert.equal(cue("AO.SM.C0064").posture,"STAND"); // before Qui sedes
assert.equal(cue("AO.SM.C0065").posture,"SIT"); // "Qui sedes ad dexteram Patris"
assert.equal(cue("AO.SM.C0067").posture,"SIT");
assert.equal(cue("AO.SM.C0068").posture,"STAND");
assert.equal(cue("AO.SM.C0068").gestureIconKey,"cross");
assert.equal(cue("AO.SM.C0089").posture,"STAND");
assert.equal(cue("AO.SM.C0090").posture,"STAND");
assert.equal(cue("AO.SM.C0096").posture,"STAND");
assert.equal(cue("AO.SM.C0096").gestureIconKey,"genuflect");
assert.equal(cue("AO.SM.C0097").posture,"SIT"); // after Incarnatus, first sentence
assert.equal(cue("AO.SM.C0098").posture,"SIT"); // second sentence
prefs=updateMassCustomaryPreferences(prefs,{kind:"credoSitStart",value:"AO.SM.C0098"},storage);
assert.equal(cue("AO.SM.C0097").posture,"STAND"); // local second-sentence option
assert.equal(cue("AO.SM.C0098").posture,"SIT");
assert.equal(readMassCustomaryPreferences({},storage).credoSitStart,"AO.SM.C0098");
prefs=updateMassCustomaryPreferences(prefs,{kind:"credoSitStart",value:"AO.SM.C0097"},storage);
assert.equal(cue("AO.SM.C0104").posture,"STAND");
assert.equal(cue("AO.SM.C0104").gestureIconKey,"cross");
assert.equal(cue("AO.SM.C0060").postureIconKey,"stand");
assert.equal(cue("AO.SM.C0069").postureIconKey,"stand");
assert.equal(cue("AO.SM.C0065").priestStateWitness,GLORIA_CREDO_SEDILIA_WITNESSES.GLORIA.sit);
assert.equal(cue("AO.SM.C0068").priestStateWitness,GLORIA_CREDO_SEDILIA_WITNESSES.GLORIA.rise);
assert.equal(cue("AO.SM.C0097").priestStateWitness,GLORIA_CREDO_SEDILIA_WITNESSES.CREDO.sit);
assert.equal(cue("AO.SM.C0104").priestStateWitness,GLORIA_CREDO_SEDILIA_WITNESSES.CREDO.rise);
assert.equal(projectGloriaCredoFaithfulCue({cueId:"AO.SM.C0056",form:"LOW",preferences:prefs,sourcedPosture:{value:"STAND"}}).posture,"STAND");
assert.equal(cue("AO.SM.C0096",{fixed:true,sourcedPosture:{value:"STAND",fixed:true}}).posture,"STAND",
  "customary seating must never override a fixed rubrical source");
prefs=updateMassCustomaryPreferences(prefs,{kind:"followPriestSeating",value:false},storage);
assert.equal(cue("AO.SM.C0056").posture,"STAND","non-sedilia local Mass must stay standing");
prefs=updateMassCustomaryPreferences(prefs,{kind:"followPriestSeating",value:true},storage);
prefs=updateMassCustomaryPreferences(prefs,{kind:"localPosture",cueId:"AO.SM.C0056",value:"STAND"},storage);
assert.equal(cue("AO.SM.C0061").posture,"STAND","local posture must persist to the next saved cue");
prefs=updateMassCustomaryPreferences(prefs,{kind:"localGesture",cueId:"AO.SM.C0061",value:"SIGN_OF_CROSS"},storage);
assert.equal(cue("AO.SM.C0061").gestureIconKey,"cross","local gesture failed to replace suggested faithful icon");
assert.equal(readMassCustomaryPreferences({},storage).localGestures["AO.SM.C0061"],"SIGN_OF_CROSS");
prefs=updateMassCustomaryPreferences(prefs,{kind:"localGesture",cueId:"AO.SM.C0061",value:"NONE"},storage);
assert.equal(cue("AO.SM.C0061").gesture,null,"user cannot disable customary gesture");
prefs=updateMassCustomaryPreferences(prefs,{kind:"localGesture",cueId:"AO.SM.C0061",value:"DEFAULT"},storage);
assert.equal(cue("AO.SM.C0061").gestureIconKey,"head_bow","default icon failed to restore");
assert.equal(updateMassCustomaryPreferences(prefs,{kind:"localGesture",cueId:"bad",value:"GENUFLECT"},storage),prefs);
const markup=buildReaderShellMarkup({readerPreferences:{mode:"LIVE"},
  session:{resolvedMass:{actualCelebration:{title:"Mass"}}}});
assert.match(markup,/data-role="faithful-icon-picker"/);
assert.match(markup,/data-faithful-picker-gesture/);
assert.match(markup,/data-faithful-picker-posture/);
assert.match(markup,/data-faithful-icon-open/);
assert.match(markup,/ao-faithful-paragraph-icons/);
assert.ok(svgInventory.assets.some(row=>String(row.file??row.path??"").includes("cross.svg")) ||
  readFileSync(new URL("../assets/active/mass-v46/cross.svg",import.meta.url)).length>0);
console.log("Gloria/Credo faithful: PASS — per-cue standing, sitting, bow, genuflect, cross, persistence and icon picker.");
