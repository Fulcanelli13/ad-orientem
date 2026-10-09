import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildEmberInsertionCards} from "../src/mass/reader-ember-lessons.js";
import {extendedLessonScriptureContext} from "../src/mass/scripture-extended-lesson-context.js";
import {registeredMassReading,registeredSegmentedMassReading,massScriptureContextForCard} from "../src/mass/scripture-reading-context.js";
import {scriptureSegmentsReference} from "../src/scripture/segments.js";
import {openReaderScriptureContext} from "../src/mass/browser-entry.js";
import {VERIFIED_EXTENDED_LESSON_READINGS} from "../src/mass/scripture-extended-lesson-index.js";
import {VERIFIED_MASS_FEAST_READINGS} from "../src/mass/scripture-feast-reading-index.js";
import {VERIFIED_SEGMENTED_MASS_READINGS} from "../src/mass/scripture-segmented-reading-index.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const audit=read("../data/mass/scripture-seasonal-ember-source-matrix.v1.json");
const readings=read("../data/mass/scripture-extended-lesson.v1.json").readings;
assert.equal(audit.schema,"ao-1962-three-season-ember-source-order-matrix-v1");
assert.deepEqual(VERIFIED_EXTENDED_LESSON_READINGS,readings);
assert.equal(readings.length,25);
assert.equal(audit.days.length,9);
assert.deepEqual(audit.days.map(x=>x.sourcePath),[
 "Tempora/Adv3-3","Tempora/Adv3-5","Tempora/Adv3-6",
 "Tempora/Quad1-3","Tempora/Quad1-5","Tempora/Quad1-6",
 "Tempora/Pasc7-3","Tempora/Pasc7-5","Tempora/Pasc7-6"
]);
assert.deepEqual(audit.days.map(x=>x.date),[
 "2026-12-16","2026-12-18","2026-12-19",
 "2026-02-25","2026-02-27","2026-02-28",
 "2026-05-27","2026-05-29","2026-05-30"
]);
assert.equal(audit.days.reduce((n,d)=>n+d.supplementaryReadings.length,0),18);
assert.equal(audit.days.reduce((n,d)=>n+d.ordinaryProperReadings.length,0),17);
assert.equal(audit.days.reduce((n,d)=>n+d.segmentedProperReadings.length,0),1);
const ex=readings.filter(x=>audit.days.some(d=>d.sourcePath===x.sourcePath));
assert.equal(ex.length,18);
assert.equal(ex.filter(x=>x.liturgicalArrangement).length,3);
const actualProper=VERIFIED_MASS_FEAST_READINGS.filter(x=>audit.days.some(d=>d.sourcePath===x.sourcePath));
assert.equal(actualProper.length,9);
assert.equal(actualProper.reduce((n,x)=>n+Object.keys(x.readings).length,0),17);
assert.equal(VERIFIED_MASS_FEAST_READINGS.length,29);
assert.equal(VERIFIED_SEGMENTED_MASS_READINGS.length,10);
function mock(order,path){
 const nodes=order.map((id,i)=>({
  id:"PRE_GOSPEL."+String(i+1).padStart(2,"0")+"."+id,
  type:id.startsWith("Lectio")?"LESSON":id.startsWith("Oratio")?"ORATION":"GRADUAL",
  sourceSectionId:id,sourceOrderIndex:i,orderAuthority:"SOURCE_ORDER",
  sourceRef:path+":"+id,payloadRef:id
 }));
 const payloads=Object.fromEntries(nodes.map(x=>{
  const row=ex.find(r=>r.sourcePath===path&&r.sourceSectionId===x.sourceSectionId);
  const latin=row?row.latinIncipit+" "+(row.latinContinuityGuard?.join(" ")??"")+" Aliud.":
    x.type==="ORATION"?"Oremus. Flectamus genua. Levate.":"Graduale.";
  return [x.payloadRef,{textLat:latin,textEn:"English counterpart for reader regression"}];
 }));
 const m={schema:"ao-proper-manifest-v2",sourcePath:path,
  preGospelSequence:nodes,
  preGospelSequenceProvenance:{schema:"ao-pre-gospel-source-order-v1",
   orderAuthority:"SOURCE_ORDER",sourcePath:path,sourceOrder:order},
  preGospelPayloads:payloads};
 const cards=buildEmberInsertionCards({proper:m,overlays:["EMBER_LESSONS"]});
 return {m,cards,prepared:{session:{resolvedMass:{proper:{status:"READY",data:m}}}}};
}
for(const day of audit.days){
 const path=day.sourcePath,expected=ex.filter(r=>r.sourcePath===path);
 const full=mock(day.sourceSectionOrder,path);
 assert.deepEqual(full.cards.map(x=>x.sourceSectionKey),day.sourceSectionOrder,
  path+": insertion changed canonical Latin source sequence");
 for(const row of expected){
  const card=full.cards.find(x=>x.sourceSectionKey===row.sourceSectionId);
  assert.ok(card,row.sourcePath+" missing source-owned lesson "+row.sourceSectionId);
  assert.equal(scriptureSegmentsReference(row.segments),row.reference);
  const context=extendedLessonScriptureContext(card,full.prepared);
  assert.equal(context?.state,"READY",path+" "+row.sourceSectionId+" should have a source-bound reference");
  assert.equal(context?.reference,row.reference);
  assert.deepEqual(context?.segments,row.segments);
  const mixed=extendedLessonScriptureContext({...card,paragraphs:[
    {primary:"English",alternate:"Completely different Latin"}
  ]},full.prepared);
  assert.equal(mixed,null,"Another day's Latin must never inherit a Scripture reference");
  const wrong=extendedLessonScriptureContext(card,{session:{resolvedMass:{proper:{data:{
    ...full.m,sourcePath:"Tempora/Pent17-6"
  }}}}});
  assert.equal(wrong,null,"Canonical source path is mandatory");
  if(row.liturgicalArrangement){
   assert.equal(context.liturgicalArrangement.canonicalReference,"Daniel 3:47–51");
   assert.deepEqual(context.liturgicalArrangement.liturgicalVerseOrder,[
    "Daniel 3:49","Daniel 3:47–48","Daniel 3:50–51"]);
   assert.equal(context.liturgicalArrangement.noteEn.includes("canonical order"),true);
   assert.equal(context.liturgicalArrangement.noteFr.includes("ordre liturgique"),true);
   const corrupted={...card,paragraphs:[{alternate:row.latinIncipit+" "+row.latinContinuityGuard[2]+" "+row.latinContinuityGuard[1]}]};
   assert.equal(extendedLessonScriptureContext(corrupted,full.prepared),null,
    "A reordered Daniel Latin sentence must be rejected");
   assert.equal(extendedLessonScriptureContext({...card,paragraphs:[{
    alternate:row.latinIncipit+" "+row.latinContinuityGuard[0]
   }]},full.prepared),null,
    "A partial Daniel passage must not be presented with the transposition notice");
  }else assert.equal(context.liturgicalArrangement,undefined);
 }
 for(const card of full.cards.filter(c=>c.emberNodeType!=="LESSON")){
  assert.equal(extendedLessonScriptureContext(card,full.prepared),null,
   "Graduals and collects are never preparatory Scripture reading controls");
 }
 const base=actualProper.find(x=>x.sourcePath===path);
 assert.ok(base);
 assert.equal(base.witnessUrl,day.witnessUrl);
 for(const slot of day.ordinaryProperReadings){
  const field=slot.slot==="GOSPEL"?"gospel":"epistle";
  const row=base.readings[slot.slot];
  assert.equal(row.reference,slot.reference);
  const proper={sourcePath:path,[field]:{lat:row.latinIncipit+" reliquum."}};
  assert.equal(registeredMassReading(proper,slot.slot)?.reference,slot.reference,
   path+" "+slot.slot);
  assert.equal(registeredMassReading({...proper,[field]:{lat:"Unrelated passage"}},slot.slot),null);
  const card={blocks:[{properSlot:slot.slot}]};
  assert.equal(massScriptureContextForCard(card,{session:{resolvedMass:{proper:{data:proper,sourcePath:path}}}})?.reference,slot.reference);
 }
 for(const segmented of day.segmentedProperReadings){
  const row=VERIFIED_SEGMENTED_MASS_READINGS.find(x=>x.sourcePath===path&&x.slot===segmented.slot);
  assert.equal(scriptureSegmentsReference(row.segments),segmented.reference);
  assert.equal(segmented.omittedVerse,"Joel 2:25");
  assert.deepEqual(row.segments.map(x=>[x.verseStart,x.verseEnd]),[[23,24],[26,27]]);
  const proper={sourcePath:path,epistle:{lat:row.latinIncipit+" atque alterum."}};
  assert.equal(registeredSegmentedMassReading(proper,segmented.slot)?.reference,segmented.reference);
  assert.equal(registeredMassReading(proper,segmented.slot),null);
  assert.equal(massScriptureContextForCard({blocks:[{properSlot:segmented.slot}]},{session:{resolvedMass:{proper:{data:proper,sourcePath:path}}}})?.reference,segmented.reference);
 }
 if(day.saturdayVariant){
  assert.equal(day.saturdayVariant.rubricEvidence,true,path+" rubric not source-certified");
  assert.deepEqual(day.saturdayVariant.longLessons,[
   "LectioL1","LectioL2","LectioL3","LectioL4","LectioL5"]);
  assert.deepEqual(day.saturdayVariant.shortLessons,["LectioL1","LectioL5"]);
  const short=mock(["LectioL1","LectioL5"],path);
  assert.deepEqual(short.cards.map(x=>x.sourceSectionKey),["LectioL1","LectioL5"]);
  assert.equal(extendedLessonScriptureContext(short.cards[0],short.prepared)?.state,"READY");
  const dan=extendedLessonScriptureContext(short.cards[1],short.prepared);
  assert.equal(dan?.reference,"Daniel 3:47–51");
  assert.equal(dan?.liturgicalArrangement?.liturgicalVerseOrder[0],"Daniel 3:49");
  for(const id of ["LectioL2","LectioL3","LectioL4"]){
   const longCard=full.cards.find(x=>x.sourceSectionKey===id);
   assert.equal(extendedLessonScriptureContext(longCard,short.prepared),null,
    "Long-form lesson leaked into selected shorter-form reader");
  }
 }
}
assert.equal(ex.find(x=>x.sourcePath==="Tempora/Pasc7-6"&&x.sourceSectionId==="LectioL2").segments.length,3);
assert.equal(ex.find(x=>x.sourcePath==="Tempora/Pasc7-6"&&x.sourceSectionId==="LectioL3").segments.length,2);
assert.equal(ex.find(x=>x.sourcePath==="Tempora/Quad1-6"&&x.sourceSectionId==="LectioL3").reference,"2Maccabees 1:23–27");
assert.equal(ex.find(x=>x.sourcePath==="Tempora/Quad1-6"&&x.sourceSectionId==="LectioL4").reference,"Sirach 36:1–10");
assert.equal(actualProper.find(x=>x.sourcePath==="Tempora/Quad1-3").readings.EPISTLE_OR_LESSON.reference,"1Kings 19:3–8");
assert.equal(actualProper.find(x=>x.sourcePath==="Tempora/Quad1-6").gospelInheritedFrom,"Tempora/Quad2-0");
{
 let opened=false;
 const row=ex.find(x=>x.sourcePath==="Tempora/Adv3-6"&&x.sourceSectionId==="LectioL5");
 const context={reference:row.reference,segments:row.segments,
  liturgicalArrangement:row.liturgicalArrangement,provenance:"EXTENDED_LESSON_SOURCE_ORDER_AND_LATIN_BOUND"};
 await openReaderScriptureContext(context,{win:{AO_SCRIPTURE_CONTEXT_V1:{
  open:()=>{throw new Error("Daniel source must use shared segmented Bible ownership");},
  openSegments:(segments,opts)=>{
   opened=true;
   assert.deepEqual(segments,row.segments);
   assert.deepEqual(opts.liturgicalArrangement,row.liturgicalArrangement);
   assert.equal(opts.reference,"Daniel 3:47–51");
   return true;
  }
 }}});
 assert.equal(opened,true);
}
console.log("PASS Advent/Lent/Pentecost Ember 9 Mass Propers, 17 ordinary and 1 segmented citations, 18 preparatory lessons, 3 long/short Saturday forms, Daniel canonical Bible-order notices (EN/FR), all SOURCE_ORDER/Latin fail-closed guards.");
