import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createLiveCanonStageObservationController} from "../src/mass/reader-live-canon-stage-observation.js";
import {canonicalManualFollowContext} from "../src/mass/reader-live-canon-manual-follow.js";

const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const reg=read("../data/presentation/reader-rubric-events.v1.json");
const make=form=>createLiveCanonStageObservationController({registry:reg,form});
const cueHost="AO.SM.C0174",cueChalice="AO.SM.C0181";
for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const ctrl=make(form);
 const host=ctrl.getChoices({sourceCueId:cueHost,language:"en"});
 const chalice=ctrl.getChoices({sourceCueId:cueChalice,language:"fr"});
 assert.deepEqual(host.map(x=>x.eventId),[
   "AO.RUB.C0174.01","AO.RUB.C0174.02","AO.RUB.C0174.03",
   "AO.RUB.C0174.04","AO.RUB.C0174.05"
 ]);
 assert.equal(host[0].label,"First genuflection");
 assert.equal(host[4].label,"Second genuflection");
 assert.equal(host[2].actor,"SERVER");
 assert.equal(host[2].label,"Server rings bell");
 assert.equal(chalice[0].label,"Première génuflexion");
 assert.equal(chalice[1].label,"Élévation du Calice");
 assert.equal(chalice[2].actor,"SERVER");
 assert.equal(chalice[2].label,"Le servant sonne la clochette");
 assert.equal(chalice.length,form==="SOLEMN"?4:5,
   "Solemn mixed-role priest/deacon covering action must be withheld");
 assert.equal(chalice.some(x=>x.eventId==="AO.RUB.C0181.04"),form!=="SOLEMN");
 assert.equal(ctrl.getChoices({sourceCueId:"AO.SM.C0173"}).length,0);
 // The user can skip actions. A tap is its own explicit witness, and does
 // not pretend previously skipped genuflections were actually observed.
 const elevation=ctrl.observe({eventId:host[1].eventId,actor:"PRIEST",
   sourceCueId:cueHost,observed:true,source:"EXPLICIT_OBSERVATION"});
 assert.equal(elevation.accepted,true);
 const after=ctrl.getChoices({sourceCueId:cueHost});
 assert.equal(after[0].disabled,true);
 assert.equal(after[0].completed,true);
 assert.equal(after[1].disabled,true);
 assert.equal(after[1].completed,true);
 assert.equal(after[2].disabled,false);
 assert.equal(after[3].disabled,false);
 assert.equal(after[4].disabled,false);
 const bell=ctrl.observe({eventId:host[2].eventId,actor:"SERVER",
   sourceCueId:cueHost,observed:true,source:"EXPLICIT_OBSERVATION"});
 assert.equal(bell.accepted,true);
 assert.equal(ctrl.snapshot().lastPriestEventId,host[1].eventId);
 assert.equal(ctrl.snapshot().lastServerEventId,host[2].eventId);
 ctrl.observe({eventId:host[3].eventId,actor:"PRIEST",
   sourceCueId:cueHost,observed:true,source:"EXPLICIT_OBSERVATION"});
 assert.equal(ctrl.getChoices({sourceCueId:cueHost})[2].disabled,true,
   "No bell recording after the Host has been replaced");
 ctrl.reset();
 assert.equal(ctrl.getChoices({sourceCueId:cueHost})[0].disabled,false,
   "An accidental tap must be reversible with Reset");
}

const yes={mode:"LIVE",curated:true,sectionId:"AO.CANON.06",
 cueId:cueHost,specialRite:false};
assert.equal(canonicalManualFollowContext(yes),"HOST");
assert.equal(canonicalManualFollowContext({...yes,sectionId:"AO.CANON.07"}),null);
assert.equal(canonicalManualFollowContext({...yes,cueId:cueChalice,
 sectionId:"AO.CANON.07"}),"CHALICE");
for(const context of [
 {...yes,mode:"MISSAL"},{...yes,mode:"SIMPLE"},{...yes,curated:false},
 {...yes,cueId:"AO.SM.C0173"},{...yes,specialRite:true},
 {...yes,sectionId:"AO.CARD.019"},
]){
 assert.equal(canonicalManualFollowContext(context),null,
   "Manual control must not exist outside exact LIVE elevation focus");
}
const native=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
const manual=readFileSync(new URL("../src/mass/reader-live-canon-manual-follow.js",import.meta.url),"utf8");
assert.match(native,/mountLiveCanonManualFollow\(/);
assert.match(native,/canonManualUI\?\.update\(\)/);
assert.match(native,/canonManualUI\?\.destroy\(\)/);
assert.match(native,/observe:input=>observeCanonCeremonyStage\(input\)/);
assert.match(native,/clear:\(\)=>\{const state=clearCanonObservation\(\)/);
assert.match(manual,/trigger\.hidden=true/);
assert.match(manual,/aria-expanded/);
assert.match(manual,/data-canon-observe/);
assert.match(manual,/data-canon-follow-reset/);
assert.match(manual,/observed:true,source:"EXPLICIT_OBSERVATION"/);
assert.match(manual,/rightRail|\.ao-rail-right/);
assert.doesNotMatch(manual,/localStorage|sessionStorage|MutationObserver|microphone/i,
 "Manual action control must not imply persistence, speech or visual detection");
console.log("PASS LIVE Canon manual control: EN/FR options, four forms, skipped actions and Reset, independent server bell, fail-closed Solemn role, exact LIVE 65 focus and lifecycle.");
