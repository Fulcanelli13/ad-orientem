import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectGloriaCredoFaithfulCue,GLORIA_CREDO_SEDILIA_WITNESSES,resolveIncarnatusSungAction} from "../src/mass/gloria-credo-faithful.js";
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
assert.equal(cue("AO.SM.C0061").gestureIconKey,"canon:faithful.gesture.bow_head","21 Oct 2026: head bow uses the user-approved canonical Faithful Bow (v46_bow)");
assert.ok(cue("AO.SM.C0061").gesture,"customary faithful bow cue was lost with its artwork");
assert.equal(cue("AO.SM.C0064").posture,"STAND"); // before Qui sedes
assert.equal(cue("AO.SM.C0065").posture,"SIT"); // "Qui sedes ad dexteram Patris"
assert.equal(cue("AO.SM.C0067").posture,"SIT");
assert.equal(cue("AO.SM.C0068").posture,"STAND");
assert.equal(cue("AO.SM.C0068").gestureIconKey,"canon:faithful.gesture.sign_of_cross");
assert.equal(cue("AO.SM.C0089").posture,"STAND");
assert.equal(cue("AO.SM.C0090").posture,"STAND");
assert.equal(cue("AO.SM.C0096").posture,"STAND");
assert.equal(cue("AO.SM.C0096").gestureIconKey,"canon:faithful.gesture.genuflect");
assert.equal(cue("AO.SM.C0097").posture,"SIT"); // after Incarnatus, first sentence
assert.equal(cue("AO.SM.C0098").posture,"SIT"); // second sentence
prefs=updateMassCustomaryPreferences(prefs,{kind:"credoSitStart",value:"AO.SM.C0098"},storage);
assert.equal(cue("AO.SM.C0097").posture,"STAND"); // local second-sentence option
assert.equal(cue("AO.SM.C0098").posture,"SIT");
assert.equal(readMassCustomaryPreferences({},storage).credoSitStart,"AO.SM.C0098");
prefs=updateMassCustomaryPreferences(prefs,{kind:"credoSitStart",value:"AO.SM.C0097"},storage);
assert.equal(cue("AO.SM.C0104").posture,"STAND");
assert.equal(cue("AO.SM.C0104").gestureIconKey,"canon:faithful.gesture.sign_of_cross");
assert.equal(cue("AO.SM.C0060").postureIconKey,"canon:faithful.posture.stand");
assert.equal(cue("AO.SM.C0069").postureIconKey,"canon:faithful.posture.stand");
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
assert.equal(cue("AO.SM.C0061").gestureIconKey,"canon:faithful.gesture.sign_of_cross","local gesture failed to replace suggested faithful icon");
assert.equal(readMassCustomaryPreferences({},storage).localGestures["AO.SM.C0061"],"SIGN_OF_CROSS");
prefs=updateMassCustomaryPreferences(prefs,{kind:"localGesture",cueId:"AO.SM.C0061",value:"NONE"},storage);
assert.equal(cue("AO.SM.C0061").gesture,null,"user cannot disable customary gesture");
prefs=updateMassCustomaryPreferences(prefs,{kind:"localGesture",cueId:"AO.SM.C0061",value:"DEFAULT"},storage);
assert.equal(cue("AO.SM.C0061").gestureIconKey,"canon:faithful.gesture.bow_head","default head bow shows the canonical Faithful Bow");
assert.ok(cue("AO.SM.C0061").gesture,"default gesture cue must survive");
prefs=updateMassCustomaryPreferences(prefs,{kind:"localGesture",cueId:"AO.SM.C0061",value:"KNEEL"},storage);
assert.equal(cue("AO.SM.C0061").gestureIconKey,"canon:faithful.posture.kneel",
  "Gloria/Credo special KNEEL gesture ignored the canonical kneel posture");
prefs=updateMassCustomaryPreferences(prefs,{kind:"localGesture",cueId:"AO.SM.C0061",value:"DEFAULT"},storage);
assert.equal(updateMassCustomaryPreferences(prefs,{kind:"localGesture",cueId:"bad",value:"GENUFLECT"},storage),prefs);
const markup=buildReaderShellMarkup({readerPreferences:{mode:"LIVE"},
  session:{resolvedMass:{actualCelebration:{title:"Mass"}}}});
assert.match(markup,/data-role="faithful-icon-picker"/);
assert.match(markup,/data-faithful-picker-gesture/);
assert.match(markup,/data-faithful-picker-posture/);
assert.match(markup,/data-faithful-icon-open/);
assert.doesNotMatch(markup,/icons\.className="ao-faithful-paragraph-icons"/,
  "Gloria/Credo must not recreate a separate tiny icon next to every prayer paragraph");
assert.match(markup,/data-faithful-icon-open/,
  "The persistent faithful ribbon must retain its single customization entry");
assert.ok(svgInventory.assets.some(row=>String(row.file??row.path??"").includes("cross.svg")) ||
  readFileSync(new URL("../assets/active/mass-v46/cross.svg",import.meta.url)).length>0);
// 1960 Code of Rubrics §518(b) exception must be selected-Mass-owned,
// not based on a civil calendar day, translated title or presumed priest seat.
const actualMass=(form,date,sourcePath,{id="Sancti/03-25",type="CALENDAR",calendarId=id,selected=false,status="READY"}={})=>({
  schema:"ao-resolved-mass-v2",form,date,
  actualCelebration:{id,type},calendarCelebration:{id:calendarId,type:"CALENDAR"},
  explicitlySelectedCelebration:selected,
  proper:{status,data:{sourcePath}},
});
const exceptional=[
  actualMass("MISSA_CANTATA_SIMPLE","2026-03-25","Sancti/03-25"),
  actualMass("SOLEMN","2024-04-08","Sancti/03-25"), // Annunciation transferred from Holy Week
  actualMass("MISSA_CANTATA_INCENSE","2026-12-25","Sancti/12-25",{id:"Sancti/12-25"}),
  actualMass("SOLEMN","2026-12-25","Tempora/Nat1-0",{id:"nativity-calendar-1962"}),
  actualMass("MISSA_CANTATA_SIMPLE","2026-12-25","Tempora/Nat2-0",{id:"nativity-calendar-1962"}),
];
for(const actual of exceptional){
  assert.equal(resolveIncarnatusSungAction(actual),"KNEEL",actual.form+" "+actual.date+" missing prescribed chant kneeling");
  const during=projectGloriaCredoFaithfulCue({cueId:"AO.SM.C0096",form:actual.form,
    preferences:{gestureProfile:"GUIDED_1962"},sourcedPosture:{value:"STAND",fixed:false},
    incarnatusAction:resolveIncarnatusSungAction(actual)});
  assert.equal(during.gesture?.type,"KNEEL","exceptional Creed action must be kneeling");
  assert.equal(during.posture,"KNEEL","ribbon cannot show STAND while gesture says KNEEL");
  assert.equal(during.source,"RG60_518B_EXCEPTIONAL_CHANT_KNEEL");
  const after=projectGloriaCredoFaithfulCue({cueId:"AO.SM.C0097",form:actual.form,
    preferences:{gestureProfile:"GUIDED_1962",followPriestSeating:false},sourcedPosture:{value:"STAND"},
    incarnatusAction:resolveIncarnatusSungAction(actual)});
  assert.equal(after.gesture,null,"one instant kneel must not leak into the next prayer cue");
  assert.equal(after.posture,"STAND","temporary exceptional kneeling must end");
}
for(const actual of [
  actualMass("LOW","2026-03-25","Sancti/03-25"),
  actualMass("MISSA_CANTATA_INCENSE","2024-04-08","Sancti/04-08"),
  actualMass("SOLEMN","2026-03-25","Sancti/03-19",{id:"Sancti/03-19"}),
  actualMass("SOLEMN","2026-12-25","Sancti/10-07",{id:"observed-votive",type:"VOTIVE",calendarId:"nativity-calendar-1962",selected:true}),
  actualMass("SOLEMN","2026-12-25","Sancti/10-07",{id:"nativity-calendar-1962"}),
  actualMass("SOLEMN","2026-12-25","Tempora/Nat1-0",{id:"actual-other",calendarId:"nativity-calendar-1962",selected:true}),
  actualMass("MISSA_CANTATA_SIMPLE","2026-03-25","Sancti/03-25",{status:"INCOMPLETE"}),
]) assert.equal(resolveIncarnatusSungAction(actual),"GENUFLECT",
  "Never force Christmas/Annunciation sung kneeling for a different or unverified Mass");
assert.equal(resolveIncarnatusSungAction(null),"GENUFLECT");
assert.equal(resolveIncarnatusSungAction({form:"SOLEMN",date:"2026-12-25"}),"GENUFLECT");
const code=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(code,/resolveIncarnatusSungAction\(resolvedMass\)/,
  "Native Mass must feed the selected celebration to both focused and paragraph cue projections");
assert.equal((code.match(/incarnatusAction,/g)||[]).length>=2,true,
  "The selected Mass exception must appear both in reader focus and in paragraph icons");

console.log("Gloria/Credo faithful: PASS — per-cue standing, sitting, bow, genuflect, cross, persistence and icon picker.");
