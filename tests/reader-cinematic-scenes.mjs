import assert from "node:assert/strict";
import { projectLiveCinematicScene } from "../src/mass/reader-cinematic-scenes.js";
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
  "CHALICE_ELEVATION","INCARNATUS_GESTURE"]){
 assert.ok(shell.includes('data-cinematic-scene="'+id+'"'),id+" lacked styling");
}
assert.ok(shell.includes('data-role="cinematic"'));
assert.ok(shell.includes("prefers-reduced-motion:reduce"));
assert.ok(shell.includes("aoCinematicIconHold"));
assert.ok(shell.includes("aoCinematicPostureCue"));
assert.ok(shell.includes("data-mode=\"MISSAL\""),"Missal mode CSS isolation lost");
console.log("PASS: five exact LIVE cinematic scenes, no invented action state, text-safe elevation, reduced motion and mode isolation.");
