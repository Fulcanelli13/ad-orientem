import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {
 SCHOLA_SOURCE_TEXT_EXCEPTIONS,SCHOLA_ASPERGES_TEXT_OWNER,
 scholaTextExceptionForCue,scholaEventVisibleInMusicMenu,scholaMusicMenuLabel
} from "../src/mass/reader-schola-text-cue-policy.js";

const corpus=JSON.parse(readFileSync(
 new URL("../data/presentation/reader-text-sung.v1.json",import.meta.url),"utf8"));
const cue=n=>"AO.SM.C"+String(n).padStart(4,"0");
const expected=[135,136,138,140,143,206,207,217,218,259,260].map(cue);
assert.deepEqual(SCHOLA_SOURCE_TEXT_EXCEPTIONS.map(x=>x.cue),expected);
assert.equal(new Set(expected).size,11);
for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 for(const id of expected){
  const item=scholaTextExceptionForCue({cueId:id,form,sungCorpus:corpus,
   resolvedMass:{overlays:[]},massPlan:{dismissal:"ITE_MISSA_EST"}});
  assert.equal(item?.cueId,id,form+" "+id);
  assert.equal(item?.display,"TEXT_ONLY_EXCEPTION");
  assert.equal(item?.sourceOwner,"PINNED_1962_SUNG_CORPUS");
  assert.equal(item?.musicalScore,false);
  assert.equal(item?.actuallySung,"UNKNOWN");
  assert.ok(item?.latin?.trim());
  assert.ok(item?.sourceBlockId?.startsWith("AO.SM.B"));
 }
 for(const id of [70,71,82,83,137,139,141,142,210,219,220,251,252,254,255,257,258]){
  assert.equal(scholaTextExceptionForCue({cueId:cue(id),form,sungCorpus:corpus}),null,
   "Routine greeting, priest speech or generic response incorrectly added "+id);
 }
}
for(const id of expected)
 assert.equal(scholaTextExceptionForCue({cueId:id,form:"LOW",sungCorpus:corpus}),null);
for(const id of [259,260]){
 assert.equal(scholaTextExceptionForCue({cueId:cue(id),form:"SOLEMN",
  sungCorpus:corpus,resolvedMass:{overlays:["REQUIEM"]}}),null);
 assert.equal(scholaTextExceptionForCue({cueId:cue(id),form:"SOLEMN",
  sungCorpus:corpus,massPlan:{dismissal:"BENEDICAMUS_DOMINO"}}),null);
}
const corrupted=structuredClone(corpus);
corrupted.blocks.find(b=>b.Block_ID==="AO.SM.B043").units
 .find(u=>u.cue_id===cue(140)).latin="Translated but not source Latin";
assert.equal(scholaTextExceptionForCue({cueId:cue(140),form:"SOLEMN",sungCorpus:corrupted}),null);
const wrongBlock=structuredClone(corpus);
wrongBlock.blocks.find(b=>b.Block_ID==="AO.SM.B041").Block_ID="AO.SM.B999";
assert.equal(scholaTextExceptionForCue({cueId:cue(135),form:"SOLEMN",sungCorpus:wrongBlock}),null);
assert.equal(scholaTextExceptionForCue({cueId:cue(135),form:"SOLEMN",sungCorpus:{blocks:[]}}),null);
const duplicated=structuredClone(corpus);
duplicated.blocks[0].units.push({...duplicated.blocks.find(b=>b.Block_ID==="AO.SM.B041")
 .units.find(u=>u.cue_id===cue(135))});
assert.equal(scholaTextExceptionForCue({cueId:cue(135),form:"SOLEMN",sungCorpus:duplicated}),null);
const allowed=new Set(["ORATE_SECRET","PREFACE_DIALOGUE","PAX_COMMICTIO","DISMISSAL"]);
for(const id of ["COLLECT","GOSPEL","GLORIA_INTONATION","CREDO_INTONATION","PATERNOSTER","POSTCOMMUNION","LAST_GOSPEL"]){
 assert.equal(scholaEventVisibleInMusicMenu({id,kind:"PRIEST_VOICE"}),false,id);
}
for(const id of allowed){
 assert.equal(scholaEventVisibleInMusicMenu({id,kind:"PRIEST_VOICE"}),true,id);
 assert.ok(scholaMusicMenuLabel({id,kind:"PRIEST_VOICE",label:"Unused"}).length);
}
for(const kind of ["CHANT","QUIET_INTERVAL","ORGAN_OPTION","LOCAL_OPTION"]){
 assert.equal(scholaEventVisibleInMusicMenu({id:"INTROIT",kind}),true,kind);
}
assert.deepEqual(SCHOLA_ASPERGES_TEXT_OWNER.acceptedEvents,["AO.MUS.ASP.ME","AO.MUS.ASP.VIDI"]);
assert.equal(SCHOLA_ASPERGES_TEXT_OWNER.notAnOrdinaryMassCard,true);
const runtime=readFileSync(new URL("../src/mass/reader-native-preview.js",import.meta.url),"utf8");
const ui=readFileSync(new URL("../src/mass/reader-dom.js",import.meta.url),"utf8");
assert.match(runtime,/scholaTextException:scholaTextExceptionForCue\(/);
assert.match(runtime,/cueId:activeCueId,form,/);
assert.match(runtime,/!scholaEventVisibleInMusicMenu\(event\)/);
assert.match(ui,/current\?\.scholaTextException/);
assert.match(ui,/if\(!scholaEventVisibleInMusicMenu\(item\)\)continue/);
assert.match(ui,/scholaDisplay=\(eventReference\?\.latin\?\?eventReference\?\.label\)/);
assert.doesNotMatch(runtime,/addScholaTextCard|appendScholaTextCard/);
console.log("SCHOLA_MINIMAL_TEXT_POLICY_PASS: 11 precise source cues, four priest-event menu exceptions, native Asperges retained; 65-card Mass untouched");
