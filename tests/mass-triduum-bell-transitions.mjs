import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 isCertifiedHolyThursdayMass,projectHolyThursdayBell,
 projectEasterVigilGloriaBell,TRIDUUM_BELL_AUTHORITY
} from "../src/mass/reader-triduum-bells.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const ordinary={date:"2026-04-02",proper:{sourcePath:"Tempora/Pasc0-0"}};
const thursday={date:"2026-04-02",proper:{sourcePath:"Tempora/Quad6-4r"}};
const wrongDateOnly={date:"2026-04-02",proper:{sourcePath:"Tempora/Quad6-3"}};
const wordsOnly={date:"",proper:{sourcePath:"Tempora/Quad6-4r"}};
assert.equal(isCertifiedHolyThursdayMass(thursday),true);
assert.equal(isCertifiedHolyThursdayMass(ordinary),false);
assert.equal(isCertifiedHolyThursdayMass(wrongDateOnly),false);
assert.equal(isCertifiedHolyThursdayMass(wordsOnly),false);
assert.equal(TRIDUUM_BELL_AUTHORITY.holyThursdayGloriaCue,"AO.SM.C0053");
const vanilla=Object.freeze({cueId:"AO.SM.C0145",label:"SANCTUS BELL"});
const elevationCinema=Object.freeze({kind:"ELEVATION",cueId:"AO.SM.C0174"});
const ordinaryBell=projectHolyThursdayBell({
 resolvedMass:ordinary,cueId:"AO.SM.C0145",expectedBell:vanilla});
assert.equal(ordinaryBell.applies,false);
assert.equal(ordinaryBell.bell,vanilla);
const opening=projectHolyThursdayBell({
 resolvedMass:thursday,cueId:"AO.SM.C0053"});
assert.equal(opening.applies,true);
assert.equal(opening.bell.soundClass,"CHURCH_AND_ALTAR_BELLS");
assert.equal(opening.bell.status,"EXPECTED_NOT_OBSERVED");
assert.equal(opening.bell.actuallyHeard,"UNKNOWN");
assert.equal(opening.cinematic.kind,"BELL");
assert.equal(opening.cinematic.canonicalAuthority,false);
const noFakeTowerAtOtherGloria=projectHolyThursdayBell({
 resolvedMass:ordinary,cueId:"AO.SM.C0053"});
assert.equal(noFakeTowerAtOtherGloria.bell,null);
for(const id of TRIDUUM_BELL_AUTHORITY.ordinaryBellCueIds){
 const projected=projectHolyThursdayBell({
  resolvedMass:thursday,cueId:id,
  expectedBell:{cueId:id,owner:"R17_EXPECTED_CANONICAL"},
  expectedCinematic:id==="AO.SM.C0174"?elevationCinema:null,
 });
 assert.equal(projected.applies,true);
 assert.equal(projected.bell,null,id+" must not show ordinary altar bell after Thursday Gloria");
 assert.equal(projected.suppressed,true,id);
 assert.equal(projected.owner,"1962_HOLY_THURSDAY_POST_GLORIA_BELL_SILENCE");
 assert.equal(projected.instrument,"WOODEN_CLAPPER_CUSTOM_NOT_OBSERVED");
 if(id==="AO.SM.C0174")assert.equal(projected.cinematic,elevationCinema,
  "Silencing the bell cannot suppress a real Host elevation");
}
for(const id of ["AO.SM.C0173","AO.SM.C0179","AO.SM.C0180"]){
 const v=projectHolyThursdayBell({resolvedMass:thursday,cueId:id});
 assert.equal(v.bell,null,"No premature bell at Consecration words "+id);
}
const ordinaryGloriaRows={paragraphs:[{sourceCueIds:["AO.SM.C0053"]}]};
assert.equal(projectEasterVigilGloriaBell({distinctRite:"EASTER_VIGIL",
 massStarted:false,card:ordinaryGloriaRows}).bell,null);
assert.equal(projectEasterVigilGloriaBell({distinctRite:"GOOD_FRIDAY",
 massStarted:true,card:ordinaryGloriaRows}).bell,null);
assert.equal(projectEasterVigilGloriaBell({distinctRite:"EASTER_VIGIL",
 massStarted:true,card:{paragraphs:[{sourceCueIds:["EV-LUM-110"]}]}}).bell,null);
const returned=projectEasterVigilGloriaBell({distinctRite:"EASTER_VIGIL",
 massStarted:true,card:ordinaryGloriaRows});
assert.equal(returned.bell.instrument,"CHURCH_AND_ALTAR_BELLS");
assert.equal(returned.bell.sourceTiming.rubricalWindow,"DURING_GLORIA");
assert.equal(returned.bell.status,"EXPECTED_NOT_OBSERVED");
assert.equal(returned.cinematic.subtitle,"EASTER VIGIL · GLORIA");
const core=load("../data/mass/special-days-core.v1.1.json");
assert.equal(core.mass_overlays.EASTER_VIGIL.modify_mc["MC-0013"].insert_signal,
 TRIDUUM_BELL_AUTHORITY.easterVigilGraphSignal,
 "The Vigil Gloria return must agree with the pre-existing native source overlay");
const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
assert.match(native,/projectHolyThursdayBell\(/);
assert.match(native,/const bell=triduumBell\.bell/);
assert.match(native,/projectEasterVigilGloriaBell\(/);
assert.match(native,/massStarted:true,card/);
assert.match(native,/bell:vigilGloriaBell\.bell/);
assert.match(native,/if\(moment\)reader\.renderMoment\(\{\.\.\.moment,bell:null,cinematic:null\}\)/);
console.log("PASS 1962 Holy Week bells: Thursday Gloria only, post-Gloria five-cue silence, independent elevation cinema, Vigil restoration at Mass Gloria, no premature distinct-rite bell.");
