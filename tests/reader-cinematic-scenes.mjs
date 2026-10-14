import assert from "node:assert/strict";
import { projectLiveCinematicScene, projectGoodFridayDeathScene } from "../src/mass/reader-cinematic-scenes.js";
import { buildReaderShellMarkup, normalizeReaderMoment } from "../src/mass/reader-dom.js";

const scene=(cueId,rest={})=>projectLiveCinematicScene({mode:"LIVE",cueNative:true,cueId,...rest});
const hostWords=scene("AO.SM.C0173");
const chaliceWords=scene("AO.SM.C0179");
assert.equal(hostWords?.id,"HOST_WORDS");
assert.equal(chaliceWords?.id,"CHALICE_WORDS");
assert.ok(Object.isFrozen(hostWords));
assert.equal(hostWords.observedNow,false);
assert.equal(hostWords.priestActionClaim,false);
assert.equal(hostWords.canonicalAuthority,false);

const elevation=(cueId)=>({
  cueId,kind:"ELEVATION",canonicalAuthority:false,
  owner:"R17_EXACT_ELEVATION_CINEMATIC",
});
const host=scene("AO.SM.C0174",{cinematic:elevation("AO.SM.C0174")});
const chalice=scene("AO.SM.C0181",{cinematic:elevation("AO.SM.C0181")});
assert.equal(host?.id,"HOST_ELEVATION");
assert.equal(chalice?.id,"CHALICE_ELEVATION");
for(const x of [host,chalice])assert.deepEqual({
  priest:x.priestActionClaim,faithful:x.faithfulActionClaim,observed:x.observedNow,
},{priest:false,faithful:false,observed:false});
assert.equal(scene("AO.SM.C0174"),null,"Elevation must not be invented from focused cue alone");
assert.equal(scene("AO.SM.C0181",{cinematic:elevation("AO.SM.C0174")}),null,
  "Other elevation's cinematic must not leak");
assert.equal(scene("AO.SM.C0174",{cinematic:{...elevation("AO.SM.C0174"),canonicalAuthority:true}}),null,
  "Only the nonauthoritative presentation spec may drive visual focus");
assert.equal(scene("AO.SM.C0173",{mode:"MISSAL"}),null);
assert.equal(scene("AO.SM.C0179",{mode:"SIMPLE"}),null);
assert.equal(scene("AO.SM.C0173",{cueNative:false}),null);
assert.equal(scene("AO.SM.C9999"),null);
assert.equal(scene("AO.SM.C0180"),null,"Chalice genuflection and elevation cannot be collapsed");
assert.equal(scene("AO.SM.C0204"),null,"Minor Elevation cannot receive major Elevation treatment");

const faithful={canonicalCueId:"AO.SM.C0096",type:"GENUFLECT",owner:"R17_RUBRICAL_CUE"};
const incarnatus=scene("AO.SM.C0096",{faithfulGesture:faithful});
assert.equal(incarnatus?.id,"INCARNATUS_GESTURE");
assert.equal(incarnatus.faithfulActionClaim,false);
assert.equal(scene("AO.SM.C0096"),null,"Incarnatus not activated without resolved gesture");
assert.equal(scene("AO.SM.C0096",{faithfulGesture:{...faithful,type:"NONE"}}),null,
  "Customary NONE must suppress Incarnatus animation");
assert.equal(scene("AO.SM.C0096",{faithfulGesture:{...faithful,canonicalCueId:"AO.SM.C0097"}}),null);
assert.equal(scene("AO.SM.C0096",{faithfulGesture:{...faithful,type:"KNEEL"}})?.id,"INCARNATUS_GESTURE");
assert.equal(scene("AO.SM.C0096",{mode:"MISSAL",faithfulGesture:faithful}),null);

// Second batch is gated by already-existing actor, cue and Gospel station.
const hancAction={cueId:"AO.SM.C0161",label:"HANDS OVER OBLATIONS",
  owner:"GESTURE_MATRIX_SOT",iconKey:null};
assert.equal(scene("AO.SM.C0161",{priestAction:hancAction})?.id,"HANC_IGITUR_HANDS");
assert.equal(scene("AO.SM.C0161"),null,"Hanc cannot invent a priest gesture");
assert.equal(scene("AO.SM.C0161",{priestAction:{...hancAction,label:"BLESSES OFFERINGS"}}),null);
assert.equal(scene("AO.SM.C0161",{mode:"MISSAL",priestAction:hancAction}),null);
const gospelAction={cueId:"AO.SM.C0084",
  label:"SIGNS GOSPEL BOOK · FOREHEAD · LIPS · BREAST",
  sourceGestureId:"GM.P.C0084.01",
  owner:"GESTURE_MATRIX_SOT",iconKey:"gospel_crosses"};
const gospelStation={station:"ALTAR_GOSPEL_MISSAL"};
assert.equal(scene("AO.SM.C0084",{sourceGestureAction:gospelAction,priestPosition:gospelStation})?.id,
  "GOSPEL_CROSSES");
assert.equal(scene("AO.SM.C0084",{sourceGestureAction:gospelAction}),null,
  "Generic Gospel title must not imply a Gospel-side location");
assert.equal(scene("AO.SM.C0084",{sourceGestureAction:gospelAction,
  priestPosition:{station:"ALTAR_EPISTLE_MISSAL"}}),null);
assert.equal(scene("AO.SM.C0084",{sourceGestureAction:{...gospelAction,cueId:"AO.SM.C0081"},
  priestPosition:gospelStation}),null);
assert.equal(scene("AO.SM.C0084",{mode:"SIMPLE",
  sourceGestureAction:gospelAction,priestPosition:gospelStation}),null);
const gf=projectGoodFridayDeathScene({
  recordId:"GF-PASS-320",deathPause:true,posture:"KNEEL",
});
assert.equal(gf?.id,"PASSION_DEATH");
assert.equal(gf.owner,"R28_GF_PASSION_DEATH_SOURCE");
assert.equal(gf.canonicalAuthority,false);
assert.equal(gf.faithfulActionClaim,false);
assert.equal(projectGoodFridayDeathScene({recordId:"GF-PASS-310",deathPause:true,posture:"KNEEL"}),null);
assert.equal(projectGoodFridayDeathScene({recordId:"GF-PASS-320",deathPause:false,posture:"KNEEL"}),null);
assert.equal(projectGoodFridayDeathScene({recordId:"GF-PASS-320",deathPause:true,posture:"STAND"}),null);
assert.equal(projectGoodFridayDeathScene({recordId:"GF-PASS-330",deathPause:true,posture:"STAND"}),null);

const initial=normalizeReaderMoment({id:"a",cinematicScene:host,paragraphs:[{
  id:"p",kind:"CONSECRATION_WORDS",primary:"HOC EST ENIM CORPUS MEUM",active:true,
}]});
assert.equal(initial.cinematicScene.id,"HOST_ELEVATION");
const next=normalizeReaderMoment({id:"a",cardUpdate:false,cinematicScene:null},initial);
assert.equal(next.cinematicScene,null,"Cinematic focus must not persist past the exact cue");
const shell=buildReaderShellMarkup({
 readerPreferences:{mode:"LIVE"},
 session:{resolvedMass:{presentationMode:"LIVE"}},
});
for(const id of ["HOST_WORDS","CHALICE_WORDS","HOST_ELEVATION",
  "CHALICE_ELEVATION","INCARNATUS_GESTURE",
  "HANC_IGITUR_HANDS","GOSPEL_CROSSES","PASSION_DEATH"]){
 assert.ok(shell.includes('data-cinematic-scene="'+id+'"'),id+" lacked styling");
}
assert.ok(shell.includes('data-role="cinematic"'));
assert.ok(shell.includes("prefers-reduced-motion:reduce"));
assert.ok(shell.includes("aoCinematicIconHold"));
assert.ok(shell.includes("aoCinematicPostureCue"));
assert.ok(shell.includes("data-mode=\"MISSAL\""),"Missal mode CSS isolation lost");
console.log("PASS: five exact LIVE cinematic scenes, no invented action state, text-safe elevation, reduced motion and mode isolation.");
