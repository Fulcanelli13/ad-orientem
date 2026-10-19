import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {BELL_CUE_BINDINGS,createReaderTransientController,validateReaderTransientBindings} from "../src/mass/reader-transients.js";
import {projectPriestQuietOffertory} from "../src/mass/reader-offertory-quiet.js";
import {visibleMassCardTitle} from "../src/mass/reader-live-curated-cards.js";
import {normalizeReaderMoment,buildReaderShellMarkup} from "../src/mass/reader-dom.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const sung=load("../data/presentation/reader-text-sung.v1.json");
const events=[1,2,3,4,5,6].flatMap(i=>load("../data/mass/mc-events-0"+i+".v1.json").events);
const units=sung.blocks.flatMap(b=>b.units??[]);
const sourceCues=new Map(units.filter(u=>/^AO\.SM\.C\d{4}$/.test(String(u.cue_id)))
  .map(u=>[u.cue_id,u]));
assert.equal(sourceCues.size,279,"The canonical Sung cue family must remain 279 exact AO.SM.C#### IDs");
assert.deepEqual(units.filter(u=>!/^AO\.SM\.C\d{4}$/.test(String(u.cue_id)))
  .map(u=>u.cue_id),["AO.SM.B096.SYN"],
  "The one synthetic source-only block unit is not an audible/gesture cue");

// A complete audit of the recovered altar-bell family: 7 canonical event
// sound records, attached to exactly 5 presentation cue points, not 7
// invented bell moments. Never interpret a cue as microphone detection.
const canonicalAltarBells=events.flatMap(e=>(e.soundEvents??[])
 .filter(v=>v.type==="ALTAR_BELL"&&v.audible===true)
 .map(v=>({eventId:e.id,...v})));
assert.equal(canonicalAltarBells.length,7);
const audit=validateReaderTransientBindings(events);
assert.equal(audit.bellCueCount,5);
assert.equal(audit.canonicalBellEventCount,7);
assert.deepEqual(audit.cueIds,[
  "AO.SM.C0145","AO.SM.C0161","AO.SM.C0174","AO.SM.C0181","AO.SM.C0225",
]);
for(const cue of BELL_CUE_BINDINGS){
  assert.ok(sourceCues.has(cue.cueId),"No source text cue for bell "+cue.cueId);
  for(const id of cue.canonicalEventIds)
    assert.ok(canonicalAltarBells.some(e=>e.eventId===id),"Bell lacks source sound record: "+id);
}
const yes=createReaderTransientController({events,prepared:{session:{
  resolvedMass:{form:"MISSA_CANTATA_INCENSE",conditions:["FAITHFUL_COMMUNICANTS_PRESENT"]}
}}});
for(const cue of BELL_CUE_BINDINGS){
  assert.equal(yes.project(cue.cueId).bell?.cueId,cue.cueId);
  assert.equal(yes.project(cue.cueId).cinematic?.cueId,cue.cueId);
  assert.equal(yes.project(cue.cueId).cinematic?.canonicalAuthority,false);
}
for(const before of ["AO.SM.C0144","AO.SM.C0160","AO.SM.C0173","AO.SM.C0180","AO.SM.C0224"]){
  assert.equal(yes.project(before).bell,null,"Bell appeared before its exact sound cue "+before);
}
for(const after of ["AO.SM.C0146","AO.SM.C0162","AO.SM.C0175","AO.SM.C0182","AO.SM.C0226"]){
  assert.equal(yes.project(after).bell,null,"Bell outlived its exact source cue "+after);
}
const noCommunicants=createReaderTransientController({events,prepared:{session:{
  resolvedMass:{form:"SOLEMN",conditions:[]}
}}});
assert.equal(noCommunicants.project("AO.SM.C0225").bell,null,
 "Communion warning must remain conditional, not invented");

const privateCue=(id,language="en",rest={})=>projectPriestQuietOffertory({
  cueId:id,sourceClock:sourceCues.get(id)?.clock,
  form:"MISSA_CANTATA_INCENSE",mode:"LIVE",language,...rest
});
for(const n of [110,112,113,114,116,118,119,120,121,122,123,125,126,127,128,131,133]){
  const id="AO.SM.C"+String(n).padStart(4,"0");
  assert.equal(sourceCues.get(id).clock,"PRIEST_PRIVATE",id);
  const q=privateCue(id);
  assert.equal(q?.sourceOwner,"SUNG_CORPUS_PRIEST_PRIVATE",id);
  assert.equal(q?.iconKey,"priest_silent",id);
  assert.equal(q?.actuallyHeard,"UNKNOWN",id);
  assert.equal(q?.notAnObservation,true,id);
}
for(const n of [105,106,107,108,109,111,115,117,124,129,130,132,134,135]){
  const id="AO.SM.C"+String(n).padStart(4,"0");
  assert.equal(privateCue(id),null,id+" must not falsely claim a private prayer");
}
const fr=privateCue("AO.SM.C0110","fr");
assert.match(fr.label,/PRÊTRE/);
assert.match(fr.description,/schola/);
assert.equal(privateCue("AO.SM.C0110","en",{mode:"MISSAL"}),null);
assert.equal(privateCue("AO.SM.C0110","en",{form:"LOW"}),null);
assert.equal(projectPriestQuietOffertory({
  cueId:"AO.SM.C0108",sourceClock:"PUBLIC_TEXT",form:"SOLEMN",mode:"LIVE"
}),null,"Oremus itself must remain public");
assert.equal(visibleMassCardTitle({sourceSectionId:"AO.CARD.013",title:"Sanctus — Benedictus"}),"Sanctus");
assert.equal(visibleMassCardTitle({sectionId:"AO.CARD.013",title:"Sanctus · Benedictus"}),"Sanctus");
assert.equal(visibleMassCardTitle({sourceSectionId:"AO.CARD.010",title:"Offertory"}),"Offertory");

const quiet=privateCue("AO.SM.C0110");
const one=normalizeReaderMoment({id:"off",sectionTitle:"Offertory",
  nativeCueId:"AO.SM.C0110",priestQuietOffertory:quiet,
  bell:null,paragraphs:[]});
assert.equal(one.priestQuietOffertory.cueId,"AO.SM.C0110");
assert.equal(one.nativeCueId,"AO.SM.C0110");
const following=normalizeReaderMoment({id:"off",cardUpdate:false,
  nativeCueId:"AO.SM.C0130",priestQuietOffertory:null},one);
assert.equal(following.priestQuietOffertory,null,
  "Orate fratres audible beginning must clear the priestly-quiet banner");
const changed=normalizeReaderMoment({id:"new",sectionTitle:"Secret",paragraphs:[]},one);
assert.equal(changed.priestQuietOffertory,null,"Quiet Offertory banner leaked to next card");
assert.equal(changed.nativeCueId,undefined,"Source cue leaked across card changes");
const html=buildReaderShellMarkup({session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE"}}});
assert.ok(html.includes('data-role="priest-quiet-offertory"'));
assert.ok(html.includes('data-icon-slot="priest-quiet-offertory"'));
assert.ok(html.includes('data-icon-slot="bell"'));
assert.ok(html.includes('data-role="cinematic"'));
console.log("PASS: 279 canonical cues, 7 altar-bell sound events / 5 exact moments, conditional Communion, sourced Offertory quiet from C0110, Sanctus presentation, and cue/card resets.");
