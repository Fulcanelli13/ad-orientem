import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MASS_SUNG_DIALOGUE_EVENT_IDS,MASS_SUNG_DIALOGUE_SPECS,
 projectMassSungDialogue} from "../src/mass/reader-mass-sung-dialogue-pairs.js";
import {resolveOrdinarySpeaker} from "../src/mass/reader-speaker-roles.js";
import {buildScholaMusicItinerary} from "../src/mass/reader-schola-event-timeline.js";

const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sung=JSON.parse(read("data/presentation/reader-text-sung.v1.json"));
const blocks=new Map(sung.blocks.map(b=>[b.Block_ID,b]));
const allCue=new Map(sung.blocks.flatMap(b=>(b.units??[]).map(u=>[u.cue_id,{block:b.Block_ID,unit:u}])));
const required=["GLORIA_INTONATION","GLORIA","COLLECT","GOSPEL","CREDO_INTONATION",
 "CREDO","PREFACE_DIALOGUE","PATERNOSTER","POSTCOMMUNION","DISMISSAL"];
assert.deepEqual([...MASS_SUNG_DIALOGUE_EVENT_IDS],required);
let exchanges=0;
for(const id of required){
 const src=MASS_SUNG_DIALOGUE_SPECS[id];
 assert.ok(src.exchanges.length);
 const expected=projectMassSungDialogue({eventId:id,form:"SOLEMN",
  resolvedMass:{overlays:[]},massPlan:{dismissal:"ITE_MISSA_EST"}});
 assert.ok(expected,"Missing planned dialogue "+id);
 assert.equal(expected.toneSelection.status,"NOT_SOURCE_CERTIFIED");
 assert.equal(expected.toneSelection.match,"NOT_MUSICALLY_VERIFIED");
 assert.equal(expected.toneSelection.noDateOrFeastTitleGuessing,true);
 assert.equal(expected.advancesPriestClock,false);
 assert.equal(expected.advancesScholaClock,false);
 assert.equal(expected.actuallySung,"UNKNOWN");
 for(const ex of expected.exchanges){
  const block=blocks.get(ex.sourceBlockId);
  assert.ok(block,id+" missing source block "+ex.sourceBlockId);
  const ids=block.units.map(x=>x.cue_id);
  const sequence=[...ex.leaderCueIds,...ex.responseCueIds];
  assert.ok(sequence.every(x=>ids.includes(x)),id+" unanchored dialogue "+ex.id);
  assert.deepEqual(sequence.map(x=>allCue.get(x).block),
   sequence.map(()=>ex.sourceBlockId));
  assert.ok(sequence.every((x,i)=>i===0||ids.indexOf(sequence[i-1])<ids.indexOf(x)),
   id+" dialogue sequence not in source order "+ex.id);
  assert.equal(ex.tonePair,"UNVERIFIED_MUSICAL_SETTING");
  assert.equal(ex.performance,"NOT_OBSERVED");
  assert.ok(ex.leaderCueIds.length>0&&ex.responseCueIds.length>0);
  assert.equal(ex.responseRole,["GLORIA","GLORIA_INTONATION","CREDO","CREDO_INTONATION"]
   .includes(id)?"SCHOLA":"RESPONDERS");
  exchanges++;
 }
 for(const cueId of src.contextCueIds)
  assert.ok(allCue.has(cueId),id+" referenced missing contextual cue "+cueId);
}
assert.equal(exchanges,14,"Expected source-linked exchanges across the seven families");
// Original Sung donor marks the final syllable of each priest intonation as
// SCHOLA_PUBLIC: the actual speaker role is certified separately.
for(const n of ["0053","0054","0089","0090"]){
 const id="AO.SM.C"+n,u=allCue.get(id).unit;
 assert.equal(resolveOrdinarySpeaker(u,{form:"SOLEMN",blockId:allCue.get(id).block}).role,"PRIEST");
}
assert.deepEqual(projectMassSungDialogue({eventId:"PREFACE_DIALOGUE",form:"SOLEMN"})
 .exchanges.map(e=>e.leaderCueIds),[
 ["AO.SM.C0137"],["AO.SM.C0139"],["AO.SM.C0141","AO.SM.C0142"]
]);
assert.deepEqual(projectMassSungDialogue({eventId:"PREFACE_DIALOGUE",form:"SOLEMN"})
 .exchanges.map(e=>e.responseCueIds),[
 ["AO.SM.C0138"],["AO.SM.C0140"],["AO.SM.C0143"]
]);
for(const form of ["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
 const gospel=projectMassSungDialogue({eventId:"GOSPEL",form});
 assert.ok(gospel.exchanges.every(e=>e.leaderRole===(form==="SOLEMN"?"DEACON":"CELEBRANT")));
 const ordinary=projectMassSungDialogue({eventId:"DISMISSAL",form,
  resolvedMass:{overlays:[]},massPlan:{dismissal:"ITE_MISSA_EST"}});
 assert.equal(ordinary.dismissal.formula,"ITE_MISSA_EST");
 assert.equal(ordinary.exchanges[1].leaderRole,form==="SOLEMN"?"DEACON":"CELEBRANT");
 const procession=projectMassSungDialogue({eventId:"DISMISSAL",form,
  massPlan:{dismissal:"BENEDICAMUS_DOMINO"}});
 assert.equal(procession.dismissal.formula,"BENEDICAMUS_DOMINO");
 const requiem=projectMassSungDialogue({eventId:"DISMISSAL",form,
  resolvedMass:{actualCelebration:{type:"REQUIEM"},overlays:[]},
  massPlan:{dismissal:"ITE_MISSA_EST"}});
 assert.equal(requiem.dismissal.formula,"REQUIESCANT_IN_PACE");
 assert.equal(requiem.dismissal.seasonalAlleluia,"NOT_APPLICABLE");
 if(form==="SOLEMN")assert.equal(requiem.exchanges[1].leaderRole,
   "LITURGICAL_MINISTER_REQUIRES_EXACT_FORM_PROOF");
 for(const id of ["GLORIA","GLORIA_INTONATION","CREDO","CREDO_INTONATION"])
  assert.equal(projectMassSungDialogue({eventId:id,form,
    resolvedMass:{overlays:["REQUIEM"]}}),null);
}
for(const id of ["GLORIA","GLORIA_INTONATION"])
 assert.equal(projectMassSungDialogue({eventId:id,form:"SOLEMN",
 resolvedMass:{provenance:{gloria:false}}}),null);
for(const id of ["CREDO","CREDO_INTONATION"])
 assert.equal(projectMassSungDialogue({eventId:id,form:"SOLEMN",
 resolvedMass:{provenance:{credo:false}}}),null);
for(const eventId of required)
 assert.equal(projectMassSungDialogue({eventId,form:"LOW"}),null,
 "Low Mass must not acquire a fictitious Schola dialogue");
assert.equal(projectMassSungDialogue({eventId:"CANON",form:"SOLEMN"}),null);
const unknown=projectMassSungDialogue({eventId:"DISMISSAL",form:"SOLEMN",
 resolvedMass:{date:"2026-04-07"}});
assert.equal(unknown.dismissal.formula,"UNRESOLVED",
 "An Easter-octave date alone must not invent the Paschal dismissal");
const normal=projectMassSungDialogue({eventId:"DISMISSAL",form:"SOLEMN",
 resolvedMass:{date:"2026-04-07"},massPlan:{dismissal:"ITE_MISSA_EST"}});
assert.equal(normal.dismissal.seasonalAlleluia,"EXACT_1962_EASTER_OCTAVE_PROPER_REQUIRED");
assert.equal(normal.toneSelection.status,"NOT_SOURCE_CERTIFIED");

// The real event owner must carry the dialogue without creating new cards,
// changing pre-existing 36 identities, or changing Schola progression.
const reader=read("src/mass/reader-schola-event-timeline.js");
assert.match(reader,/const sungDialogue=projectMassSungDialogue\(/);
assert.match(reader,/sungDialogue,notationHandoff,/);
assert.match(reader,/form:selected,resolvedMass,massPlan/);
assert.doesNotMatch(read("src/mass/reader-mass-sung-dialogue-pairs.js"),
 /setTimeout|getUserMedia|\.play\(|\.advance\(/);
console.log("PASS M02 14 exact dialogue pairs, omitted chants, form roles, Requiem/Benedicamus, no inferred musical tones");
