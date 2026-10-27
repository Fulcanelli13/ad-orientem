import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {MASS_SCHOLA_EVENT_SPECS,buildScholaMusicItinerary,
 nextScholaMusicEvent} from "../src/mass/reader-schola-event-timeline.js";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const sourceOrder=[
 ...Array.from({length:13},(_,i)=>"AO.CARD."+String(i+1).padStart(3,"0")),
 ...Array.from({length:14},(_,i)=>"AO.CANON."+String(i+1).padStart(2,"0")),
 ...Array.from({length:12},(_,i)=>"AO.CARD."+String(i+19).padStart(3,"0")),
];
const blockFor={"AO.CARD.001":"AO.SM.B014","AO.CARD.006":"AO.SM.B021",
 "AO.CARD.010":"AO.SM.B030","AO.CANON.06":"AO.SM.B052",
 "AO.CANON.07":"AO.SM.B053","AO.CARD.023":"AO.SM.B074",
 "AO.CARD.026":"AO.SM.B085"};
function makeCards({split=true,withFollowup=true,introitEntry=false}={}){
 const cards=[];let count=0;
 for(const source of sourceOrder){
  const chunks=split&&(source==="AO.CARD.001"?5:
    source==="AO.CARD.003"?3:source==="AO.CARD.009"?4:
    source==="AO.CARD.010"?6:source==="AO.CARD.011"?2:
    source==="AO.CARD.007"?2:source==="AO.CARD.020"?3:
    source==="AO.CARD.022"?2:source==="AO.CARD.023"?2:
    source==="AO.CARD.024"?2:source==="AO.CARD.026"?2:
    source==="AO.CARD.029"?2:source==="AO.CARD.030"?2:
    source==="AO.CANON.06"||source==="AO.CANON.07"?2:1) || 1;
  for(let part=1;part<=chunks;part++){
   const blocks=[];
   const anchor=blockFor[source];
   if(anchor&&(source!=="AO.CARD.001"||part===chunks))blocks.push({
    blockId:anchor,paragraphCount:1});
   if(source==="AO.CARD.006"&&withFollowup)blocks.push({
    blockId:"AO.SM.B022",paragraphCount:1});
   cards.push({sectionId:"AO.LIVECURATED."+source+"."+part,
    sourceSectionId:source,title:source,blocks,sequence:++count});
  }
 }
 if(introitEntry)cards.splice(0,4);
 return cards.map((card,i)=>({...card,sequence:i+1}));
}
const tracks=["INTROIT","KYRIE","GLORIA","GRADUAL",
 "ALLELUIA_TRACT_SEQUENCE","CREDO","OFFERTORY","SANCTUS_BENEDICTUS",
 "AGNUS_DEI","COMMUNION"];
const cards=makeCards(),args={cards,tracks,form:"SOLEMN"};
assert.ok(cards.length>=65,"Real-card-shaped fixture must exceed the ordinary 65-card baseline");
assert.equal(new Set(cards.map(x=>x.sectionId)).size,cards.length);
assert.equal(MASS_SCHOLA_EVENT_SPECS.length,36);
const plan=buildScholaMusicItinerary(args);
assert.equal(plan.supported,true);
assert.equal(plan.activeClock,"SCHOLA_INDEPENDENT");
assert.equal(plan.sourceCardCount,cards.length);
assert.ok(plan.events.length>=27,"Source timeline must cover all major ordinary Mass moments");
assert.ok(plan.events.every(e=>e.actuallySinging==="UNKNOWN"&&
 e.actuallyPlaying==="UNKNOWN"&&e.independentFromPriestScroll));
assert.ok(plan.events.every((e,i,all)=>!i||e.cardIndex>=all[i-1].cardIndex));
for(const id of ["INTROIT","KYRIE","GLORIA","GRADUAL","OFFERTORY","SANCTUS",
 "HOST_CONSECRATION_SILENCE","CHALICE_CONSECRATION_SILENCE","AGNUS_DEI","COMMUNION",
 "COMMUNION_PRINTED","LAST_GOSPEL"]){
 assert.ok(plan.events.some(e=>e.id===id),"Missing essential event "+id);
}
const into=plan.events.find(e=>e.id==="INTROIT");
assert.equal(into.card.id,cards.find(c=>c.sourceSectionId==="AO.CARD.001"&&
 c.blocks.some(b=>b.blockId==="AO.SM.B014")).sectionId);
const before=nextScholaMusicEvent(plan,cards[0].sectionId);
assert.equal(before?.id,"INTROIT");
assert.equal(before.status,"UPCOMING_IN_MASS_ORDER_NOT_HEARD");
assert.equal(nextScholaMusicEvent(plan,into.card.id)?.id,"KYRIE");
const B=plan.events.find(e=>e.id==="COMMUNION");
assert.equal(B.sourceRef,"AO.SM.B074");
const print=plan.events.find(e=>e.id==="COMMUNION_PRINTED");
assert.equal(print.kind,"DISPLAY_REFERENCE");
assert.notEqual(B.card.id,print.card.id);
const host=plan.events.find(e=>e.id==="HOST_CONSECRATION_SILENCE");
assert.equal(host.sourcePrecision,"CONSECRATION_CUE_ONLY");
assert.equal(host.sourceRef,"AO.SM.B052");
assert.equal(plan.events.find(e=>e.id==="OFFERTORY_ORGAN_OPTION").status,
 "ORGAN_CANDIDATE_REQUIRES_RITUAL_CUE");
assert.equal(plan.events.find(e=>e.id==="OFFERTORY_ORGAN_OPTION").organPermission.status,"REQUIRES_CONTEXT");
assert.equal(plan.events.find(e=>e.id==="OFFERTORY_LOCAL_MOTET").status,
 "LOCAL_PROGRAMME_UNCONFIRMED");
const gregorian=buildScholaMusicItinerary({...args,sanctusPerformance:"GREGORIAN"});
assert.ok(gregorian.events.some(e=>e.id==="BENEDICTUS_CONTINUOUS"));
assert.ok(!gregorian.events.some(e=>e.id==="BENEDICTUS_AFTER_CHALICE"));
const poly=buildScholaMusicItinerary({...args,sanctusPerformance:"POLYPHONIC"});
const delayed=poly.events.find(e=>e.id==="BENEDICTUS_AFTER_CHALICE");
assert.ok(delayed);
const lastChalice=cards.findLastIndex(c=>
 c.blocks.some(b=>b.blockId==="AO.SM.B053"));
assert.ok(delayed.cardIndex>lastChalice,"Benedictus must be AFTER the complete Chalice Consecration");
assert.equal(delayed.status,"AWAIT_EXPLICIT_CHOIR_OBSERVATION");
assert.equal(delayed.manualOnly,true);
assert.ok(!poly.events.some(e=>e.id==="BENEDICTUS_CONTINUOUS"));
assert.equal(plan.events.filter(e=>e.id.startsWith("BENEDICTUS")).length,0,
 "Unknown local Schola practice cannot invent timing");
const requiem=buildScholaMusicItinerary({...args,
 resolvedMass:{overlays:["REQUIEM"]}});
for(const id of ["GLORIA","GLORIA_INTONATION","CREDO",
 "CREDO_INTONATION","BLESSING"])assert.ok(!requiem.events.some(e=>e.id===id));
assert.ok(requiem.events.some(e=>e.id==="AGNUS_DEI"));
const noSequence=buildScholaMusicItinerary({...args,
 cards:makeCards({withFollowup:false})});
assert.ok(!noSequence.events.some(e=>e.id==="PRE_GOSPEL_FOLLOWUP"));
assert.ok(noSequence.events.some(e=>e.id==="GRADUAL"));
const entry=buildScholaMusicItinerary({...args,
 cards:makeCards({introitEntry:true})});
assert.ok(entry.events.some(e=>e.id==="INTROIT"));
assert.equal(buildScholaMusicItinerary({...args,form:"LOW"}).events.length,0);
assert.equal(buildScholaMusicItinerary({...args,cards:[{sectionId:"AO.R19.M01",sequence:1}]}).supported,false);
assert.equal(nextScholaMusicEvent(plan,"AO.R19.M01"),null);
assert.equal(nextScholaMusicEvent(plan,cards.at(-1).sectionId),null);
const ui=read("src/mass/reader-dom.js"),native=read("src/mass/reader-native-preview.js");
assert.match(ui,/data-role="schola-upcoming"/);
assert.match(ui,/nextScholaMusicEvent\(itinerary,current\?\.id\)/);
assert.match(native,/scholaMusicItinerary:\(\)=>applyScholaLocalProgramme\(buildScholaMusicItinerary/);
assert.match(native,/onScholaLocalProgrammeChange:change=>/);
assert.doesNotMatch(ui,/onScholaAdvance\?\.\(nextScholaMusicEvent/);
assert.doesNotMatch(read("src/mass/reader-schola-event-timeline.js"),/gr1961-proper-|gregobase-|setTimeout|Date\.now|getUserMedia/);
console.log("PASS sourced Schola itinerary, curated card anchors, conditional organ and Benedictus, no inferred musical clock");
