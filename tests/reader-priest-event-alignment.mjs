import {ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS} from "../src/mass/reader-priest-pending-observations.js";
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

const sheet=readFileSync(new URL("../tools/priest-event-field-review.html",import.meta.url),"utf8");
const sheetRows=[...sheet.matchAll(/^\["(C\d{4})","(MC-[A-Z0-9-]+)"/gm)];
assert.equal(sheetRows.length,15,"Field sheet must track exactly 15 source-only cues");
assert.deepEqual(sheetRows.map(r=>"AO.SM."+r[1]).sort(),
  ORDINARY_SUNG_SOURCE_ONLY_CUES.map(r=>r.cueId).sort(),
  "Human evidence sheet drifted from canonical source-only registry");
for(const row of ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS){
  assert.equal(sheetRows.find(r=>"AO.SM."+r[1]===row.cueId)?.[2],row.eventId,
    "Observer-only field sheet event is stale for "+row.cueId);
}
assert.ok(sheet.includes("fieldCertified:false") &&
  sheet.includes("readerOutcome") && sheet.includes("Export evidence JSON"),
  "Field review must distinguish physical evidence from app output and never self-certify");

assert.deepEqual({all:audit.sourceOnlyCues,matched:audit.eventMatched,pending:audit.pending},
  {all:15,matched:15,pending:0});
assert.deepEqual(audit.pendingCueIds,[]);
assert.equal(audit.graphEventBindings,10);
assert.equal(audit.observerOnlyBindings,5);
assert.equal(ORDINARY_SUNG_PRIEST_EVENT_ALIGNMENT.length,ORDINARY_SUNG_SOURCE_ONLY_CUES.length);

// Five exact *observer-only* MC identities, never part of the certified
// Solemn traversal: no Schola, swipe, proximate prayer, or host preparation
// can produce the required independent evidence.
assert.equal(ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS.length,5);
assert.deepEqual(ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS.map(x=>x.cueId).sort(),
  ["AO.SM.C0042","AO.SM.C0077","AO.SM.C0109","AO.SM.C0250","AO.SM.C0256"].sort());
assert.equal(new Set(ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS.map(x=>x.observationKey)).size,5);
for(const row of ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS){
  assert.match(row.eventId,/^MC-OBS-[A-Z0-9-]+$/);
  assert.equal(row.activation,"EXPLICIT_OBSERVER_EVENT_ONLY");
  assert.equal(row.observerOnly,true);
  assert.equal(row.automatedIconAllowed,false);
  assert.equal(row.faithfulPostureAllowed,false);
  assert.equal(row.scholaClockAllowed,false);
  assert.ok(row.observationCriterion.length>70);
  assert.match(row.sourceUrl,/^https:\/\//);
  assert.ok(row.rubric && row.sourceSectionId);
  assert.ok(row.forbiddenProxyEvents.length>=2);
}

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
const observed=(eventId,sectionId,conditions=[],proof={})=>projectObservedOrdinaryPriestEvent({
  ...base,observedEventId:eventId,sourceSectionId:sectionId,conditions,...proof,
});
// Against the REAL event index/controller: a proxy may legitimately own
// another cue (e.g. C0043), but never an observer-only cue.
for(const row of ORDINARY_SUNG_PENDING_PRIEST_OBSERVATIONS){
  assert.equal(observed(row.observationKey,row.sourceSectionId),null);
  assert.equal(observed(row.eventId,row.sourceSectionId),null,
    "Naming event without proof must fail closed");
  assert.equal(observed(row.eventId,row.sourceSectionId,[],{
    [row.requiredWitness]:row.requiredValue}),null,
    "Exact observation still requires independently identified PRIEST");
  for(const eventId of row.forbiddenProxyEvents){
    assert.ok(index.has(eventId),"Prohibited proxy must actually exist: "+eventId);
    assert.notEqual(observed(eventId,row.sourceSectionId)?.cueId,row.cueId,
      eventId+" must not produce observed "+row.cueId);
  }
}
const priest={observedActor:"PRIEST"};
const introitMove=observed("MC-OBS-INT-POS","AO.CARD.001",[],{
  ...priest,observedPosition:"ALTAR_EPISTLE_MISSAL"});
assert.equal(introitMove?.cueId,"AO.SM.C0042");
assert.equal(introitMove?.priestPosition?.station,"ALTAR_EPISTLE_MISSAL");
assert.equal(introitMove?.priestVoice,null,"Physical move has no public prayer");
assert.equal(observed("MC-OBS-INT-POS","AO.CARD.001",[],{
  ...priest,observedPosition:"ALTAR_CENTER"}),null);
const gradual=observed("MC-OBS-GRADUAL","AO.CARD.006",[],{
  ...priest,observedDelivery:"READ"});
assert.equal(gradual,null,"Solemn-only source must not leak into Missa Cantata");
const solemnGradual=projectObservedOrdinaryPriestEvent({...base,form:"SOLEMN",
  observedEventId:"MC-OBS-GRADUAL",sourceSectionId:"AO.CARD.006",
  ...priest,observedDelivery:"READ"});
assert.equal(solemnGradual?.cueId,"AO.SM.C0077");
assert.equal(solemnGradual?.priestVoice?.value,"LOW_VOICE");
assert.equal(solemnGradual?.priestPosition,null,
  "PRIEST_TRACK_ASYNC must not display as physical station");
const offertory=observed("MC-OBS-OFFERTORY","AO.CARD.010",[],{
  ...priest,observedDelivery:"READ"});
assert.equal(offertory?.cueId,"AO.SM.C0109");
assert.equal(offertory?.priestVoice?.value,"LOW_VOICE");
assert.equal(offertory?.faithfulPosture,null,
  "C0109 faithful sitting is NOT transferred by priest recitation");
assert.equal(offertory?.priestPosture,null);
assert.equal(offertory?.bell,null);
const postcommunionTurn=observed("MC-OBS-PC-TURN","AO.CARD.026",[],{
  ...priest,observedAction:"TURN_TO_PEOPLE"});
assert.equal(postcommunionTurn?.cueId,"AO.SM.C0250");
assert.equal(postcommunionTurn?.priestAction?.label,"TURNS TO PEOPLE");
assert.equal(postcommunionTurn?.priestVoice,null);
const dismissalTurn=observed("MC-OBS-DISMISS-TURN","AO.CARD.027",[],{
  ...priest,observedAction:"TURN_TO_PEOPLE"});
assert.equal(dismissalTurn?.cueId,"AO.SM.C0256");
assert.equal(dismissalTurn?.priestAction?.label,"TURNS TO PEOPLE");
assert.equal(observed("MC-OBS-DISMISS-TURN","AO.CARD.027",
  ["ORATIO_SUPER_POPULUM_PRESENT"],{
  ...priest,observedAction:"TURN_TO_PEOPLE"}),null,
  "Lenten prayer must finish before the final turn");
assert.equal(observed("MC-OBS-DISMISS-TURN","AO.CARD.027",
  ["ORATIO_SUPER_POPULUM_PRESENT","ORATIO_SUPER_POPULUM_COMPLETED"],{
  ...priest,observedAction:"TURN_TO_PEOPLE"})?.cueId,"AO.SM.C0256");
for(const [id,section] of [["MC-OBS-PC-TURN","AO.CARD.026"],
                            ["MC-OBS-DISMISS-TURN","AO.CARD.027"]]){
  assert.equal(observed(id,section,["ALTAR_FACES_PEOPLE"],{
    ...priest,observedAction:"TURN_TO_PEOPLE"}),null,
    "Versus populum setting must not invent a physical turn");
  assert.equal(observed(id,section,[],{...priest,observedAction:"KISS_ALTAR"}),null);
  assert.equal(observed(id,"AO.CARD.001",[],{
    ...priest,observedAction:"TURN_TO_PEOPLE"}),null);
}
assert.equal(projectObservedOrdinaryPriestEvent({...base,form:"LOW",
  observedEventId:"MC-OBS-INT-POS",sourceSectionId:"AO.CARD.001",
  ...priest,observedPosition:"ALTAR_EPISTLE_MISSAL"}),null);

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
// Priest-side Introit is not synchronized to the Schola entrance.
const introit=observed("MC-INT-020","AO.CARD.001");
assert.equal(introit?.cueId,"AO.SM.C0043");
assert.equal(introit?.priestPosition?.station,"ALTAR_EPISTLE_MISSAL");
assert.match(introit?.priestVoice?.value??"",/QUIET PRIEST TRACK/);
assert.equal(observed("MC-INT-020","AO.CARD.003"),null,
  "Priest's Introit may not update after entering Gloria");
// Communion antiphon recitation is after ablutions, not the Schola's
// Communion antiphon at distribution. This source station is async-only.
const communion=observed("MC-END-010","AO.CARD.026");
assert.equal(communion?.cueId,"AO.SM.C0249");
assert.match(communion?.priestVoice?.value??"",/QUIET PRIEST TRACK/);
assert.equal(communion.priestPosition,null,
  "PRIEST_TRACK_ASYNC is not a drawable priest position");
assert.equal(observed("MC-COM-305","AO.CARD.026"),null,
  "Schola's Communion chant must not advance celebrant recitation");
// Rubricae Generales Missalis Romani 1960/1962, n. 514:
 // Missa Cantata permits a sung Epistle by a lector or a reading/singing
 // by the priest. The canonical actor is RESOLVED_READER, never automatically PRIEST.
assert.equal(observed("MC-EPI-020","AO.CARD.005"),null,
  "Unspecified reader must not be reported as the celebrant");
for(const [form,actor,delivery,allowed] of [
  ["MISSA_CANTATA_SIMPLE","PRIEST","READ",true],
  ["MISSA_CANTATA_INCENSE","PRIEST","SUNG",true],
  ["MISSA_CANTATA_INCENSE","LECTOR","SUNG",false],
  ["MISSA_CANTATA_SIMPLE","PRIEST",null,false],
  ["MISSA_CANTATA_SIMPLE",null,"READ",false],
  ["SOLEMN","PRIEST","SUNG",false],
]){
  const result=projectObservedOrdinaryPriestEvent({...base,form,
    observedEventId:"MC-EPI-020",sourceSectionId:"AO.CARD.005",
    observedActor:actor,observedDelivery:delivery});
  assert.equal(Boolean(result),allowed,
    "Unjustified Epistle priest identity/voice projection "+[form,actor,delivery]);
  if(result){
    assert.equal(result.cueId,"AO.SM.C0075");
    assert.equal(result.priestPosition,null,"Lector/celebrant location cannot be assumed");
    assert.equal(result.priestAction?.label,"READS EPISTLE");
    assert.equal(result.priestVoice?.value,delivery==="READ"?"READ / NOT SUNG":"SUNG / CLEAR");
    assert.equal(result.faithfulPosture,null,"Epistle celebrant does not determine faithful posture");
  }
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
for(const id of ["MC-INT-010","MC-EPI-020","MC-CHANT-010","MC-OFF-030","MC-COM-305",
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
console.log("Mass source-only priest event alignment PASS: 15/15 bound (10 canonical traversal + 5 observer-only); strict actor, physical observation, Solemn/Lent, Schola and faithful lanes fail closed.");
