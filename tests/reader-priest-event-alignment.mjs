import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createReaderCueStateController} from "../src/mass/reader-cue-state.js";
import {ORDINARY_SUNG_SOURCE_ONLY_CUES} from "../src/mass/reader-source-only-cues.js";
import {
  ORDINARY_SUNG_PRIEST_EVENT_ALIGNMENT,
  auditOrdinarySungPriestEventAlignment,
  projectObservedOrdinaryPriestEvent,
} from "../src/mass/reader-priest-event-alignment.js";
const read=(path)=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const events=[1,2,3,4,5,6].flatMap(n=>read("../data/mass/mc-events-0"+n+".v1.json").events);
const audit=auditOrdinarySungPriestEventAlignment(events);
assert.deepEqual({all:audit.sourceOnlyCues,matched:audit.eventMatched,pending:audit.pending},
  {all:15,matched:7,pending:8});
assert.equal(ORDINARY_SUNG_PRIEST_EVENT_ALIGNMENT.length,ORDINARY_SUNG_SOURCE_ONLY_CUES.length);
const bad=events.map(e=>({...e}));
bad.find(e=>e.id==="MC-GLR-040").actor="SCHOLA";
assert.throws(()=>auditOrdinarySungPriestEventAlignment(bad),/mismatched canonical/);
const registries=Object.freeze(Object.fromEntries([
  ["gestures","reader-gestures.v1.json"],
  ["responses","reader-responses.v1.json"],
  ["postures","reader-postures.v1.json"],
  ["positions","reader-priest-positions.v1.json"],
  ["voices","reader-priest-voices.v1.json"],
  ["actions","reader-priest-actions.v1.json"],
].map(([k,path])=>[k,read("../data/presentation/"+path)])));
const sung=read("../data/presentation/reader-text-sung.v1.json");
const prepared={session:{resolvedMass:{form:"MISSA_CANTATA_INCENSE",provenance:{conditions:[]}}},
  readerPreferences:{mode:"LIVE",postureProfile:"FOLLOW_CONGREGATION",gestureProfile:"GUIDED_1962"}};
const controller=createReaderCueStateController({registries,sungCorpus:sung,prepared});
const index=new Map(events.map(e=>[e.id,e]));
const base={independentlyObserved:true,form:"MISSA_CANTATA_INCENSE",eventIndex:index,cueController:controller};
const observed=(eventId,sectionId,conditions=[])=>projectObservedOrdinaryPriestEvent({
  ...base,observedEventId:eventId,sourceSectionId:sectionId,conditions,
});
const sit=["SEDILIA_USED","SEDILIA_USED_AND_CHANT_CONTINUES"];
for(const [id,section,position] of [
  ["MC-GLR-040","AO.CARD.003","SEDILIA"],
  ["MC-GLR-060","AO.CARD.003","ALTAR_CENTER"],
  ["MC-CRD-040","AO.CARD.009","SEDILIA"],
  ["MC-CRD-070","AO.CARD.009","ALTAR_CENTER"],
]){
  const context=id.endsWith("040")?sit:["SEDILIA_USED"];
  const value=observed(id,section,context);
  assert.ok(value,id+" independent event was not resolved");
  assert.equal(value.priestPosition?.station,position);
  assert.equal(value.faithfulPosture,null);
  assert.equal(value.faithfulGesture,null);
  assert.equal(value.bell,null);
  assert.equal(value.cinematic,null);
  assert.equal(value.owner,"EXPLICIT_SOURCE_PRIEST_EVENT");
  assert.equal(observed(id,section,[]),null,"No unselected sedilia movement");
  assert.equal(observed(id,"AO.CARD.010",context),null,"Cross-chapter event leak");
}
const secret=observed("MC-SEC-010","AO.CARD.011");
assert.ok(secret);
assert.match(secret.priestVoice?.value??"",/SECRET|LOW/);
const preface=observed("MC-PREF-040","AO.CARD.012");
assert.ok(preface);
assert.match(preface.priestVoice?.value??"",/SUNG|CLEAR/);
assert.equal(observed("MC-GSP-060","AO.CARD.007")?.cueId,"AO.SM.C0086");
assert.equal(projectObservedOrdinaryPriestEvent({...base,form:"SOLEMN",observedEventId:"MC-GSP-060",
  sourceSectionId:"AO.CARD.007"}),null,
  "Solemn Gospel minister is not necessarily the priest");
for(const id of ["MC-INT-020","MC-EPI-020","MC-CHT-010","MC-OFF-030","MC-COM-305",
                 "MC-COM-260","MC-END-030"]){
  assert.equal(observed(id,"AO.CARD.001"),null,
    id+" lacked an exact one-to-one priest cue and must fail closed");
}
assert.equal(projectObservedOrdinaryPriestEvent({...base,observedEventId:"MC-SEC-010",
  sourceSectionId:"AO.CARD.011",independentlyObserved:false}),null,
  "The reader's current text is not an independent priest event");
assert.equal(projectObservedOrdinaryPriestEvent({...base,observedEventId:"MC-SEC-010",
  sourceSectionId:"AO.CARD.011",form:"LOW"}),null,"Low Mass not licensed by Sung event map");
assert.equal(projectObservedOrdinaryPriestEvent({...base,observedEventId:"MC-SEC-010",
  sourceSectionId:"AO.CARD.011",eventIndex:new Map()}),null,"Unknown event must fail closed");
console.log("Mass source-only priest event alignment PASS: 15 classified; 7 exact observable; 8 held; form/condition/context/actor/faithful lanes fail closed.");
