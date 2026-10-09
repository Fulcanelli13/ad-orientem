import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildEmberInsertionCards} from "../src/mass/reader-ember-lessons.js";
import {extendedLessonScriptureContext} from "../src/mass/scripture-extended-lesson-context.js";
import {registeredMassReading} from "../src/mass/scripture-reading-context.js";
import {scriptureSegmentsReference} from "../src/scripture/segments.js";
import {VERIFIED_EXTENDED_LESSON_READINGS}
 from "../src/mass/scripture-extended-lesson-index.js";
import {VERIFIED_MASS_FEAST_READINGS}
 from "../src/mass/scripture-feast-reading-index.js";

const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const audit=load("../data/mass/scripture-september-ember-source-audit.v1.json");
const ext=load("../data/mass/scripture-extended-lesson.v1.json");
assert.equal(audit.schema,"ao-1962-september-ember-scripture-source-audit-v1");
assert.deepEqual(audit.days.map(x=>x.date),["2026-09-23","2026-09-25","2026-09-26"]);
assert.deepEqual(audit.days.map(x=>x.sourcePath),["Tempora/093-3","Tempora/093-5","Tempora/093-6"]);
assert.equal(VERIFIED_EXTENDED_LESSON_READINGS.length,26);
assert.deepEqual(VERIFIED_EXTENDED_LESSON_READINGS,ext.readings);

const septExtra=VERIFIED_EXTENDED_LESSON_READINGS.filter(r=>/^Tempora\/093-/.test(r.sourcePath));
assert.equal(septExtra.length,6);
assert.deepEqual(septExtra.map(x=>x.sourceSectionId),[
 "LectioL1","LectioL1","LectioL2","LectioL3","LectioL4","LectioL5"]);
assert.deepEqual(septExtra.map(x=>x.reference),[
 "Amos 9:13–15","Leviticus 23:26–32","Leviticus 23:39–43",
 "Micah 7:14; 7:16; 7:18–20","Zechariah 8:14–19","Daniel 3:47–51"]);
const micah=septExtra.find(x=>x.sourceSectionId==="LectioL3");
assert.equal(micah.segments.length,3,"Three disjoint Micah source ranges must be preserved");
assert.equal(scriptureSegmentsReference(micah.segments),micah.reference);
assert.deepEqual(micah.segments.map(x=>[x.verseStart,x.verseEnd]),
 [[14,14],[16,16],[18,20]]);
const septProper=VERIFIED_MASS_FEAST_READINGS.filter(r=>/^Tempora\/093-/.test(r.sourcePath));
assert.equal(septProper.length,3);
assert.deepEqual(septProper.map(x=>x.sourcePath),audit.days.map(x=>x.sourcePath));
assert.deepEqual(septProper.map(x=>Object.values(x.readings).map(y=>y.reference)),[
 ["Nehemiah 8:1–10","Mark 9:16–28"],
 ["Hosea 14:2–10","Luke 7:36–50"],
 ["Hebrews 9:2–12","Luke 13:6–17"]
]);
function fixture(order,path){
 const nodes=order.map((id,index)=>({
  id:"PRE_GOSPEL."+String(index+1).padStart(2,"0")+"."+id,
  type:id.startsWith("Lectio")?"LESSON":id.startsWith("Graduale")?"GRADUAL":"ORATION",
  sourceSectionId:id,sourceOrderIndex:index,orderAuthority:"SOURCE_ORDER",
  sourceRef:path+":"+id,payloadRef:id
 }));
 const records=VERIFIED_EXTENDED_LESSON_READINGS.filter(x=>x.sourcePath===path);
 const payloads=Object.fromEntries(nodes.map(node=>{
  const witness=records.find(x=>x.sourceSectionId===node.sourceSectionId);
  return [node.payloadRef,{
   textLat:witness ? witness.latinIncipit+(witness.latinContinuityGuard ? " "+witness.latinContinuityGuard.join(" ") : "")+" hoc est lectio originalis."
     : node.type==="ORATION"?"Orémus. Flectámus génua. Leváte.":"Graduale pro loco.",
   textEn:"Sourced testing counterpart"
  }];
 }));
 const m={schema:"ao-proper-manifest-v2",sourcePath:path,
  preGospelSequence:nodes,
  preGospelSequenceProvenance:{
   schema:"ao-pre-gospel-source-order-v1",sourcePath:path,
   orderAuthority:"SOURCE_ORDER",sourceOrder:order
  },preGospelPayloads:payloads};
 const resolved={proper:m,overlays:["EMBER_LESSONS"]};
 return {m,resolved,prepared:{session:{resolvedMass:{proper:{status:"READY",data:m}}}},
  cards:buildEmberInsertionCards(resolved)};
}
const wednesday=audit.days[0];
const wedOrder=wednesday.sourceSectionOrder.filter(s=>/^(LectioL\d+|GradualeL\d+|OratioL\d+)$/.test(s));
const wed=fixture(wedOrder,wednesday.sourcePath);
assert.deepEqual(wed.cards.map(x=>x.sourceSectionKey),wedOrder);
const wedAmos=wed.cards.find(c=>c.sourceSectionKey==="LectioL1");
assert.equal(extendedLessonScriptureContext(wedAmos,wed.prepared)?.reference,"Amos 9:13–15");
assert.ok(wed.cards.filter(x=>x.emberNodeType!=="LESSON").every(x=>
 extendedLessonScriptureContext(x,wed.prepared)===null),
 "Wednesday gradual/collect must not inherit Amos Scripture");
assert.equal(extendedLessonScriptureContext(wedAmos,{
 session:{resolvedMass:{proper:{status:"READY",data:{...wed.m,sourcePath:"Tempora/Pent17-3"}}}}
}),null,"Do not infer old weekly Pent17 Proper aliases");

const saturday=audit.days[2];
assert.match(saturday.rule,/forma longior aut forma brevior/);
assert.deepEqual(saturday.longFormSupplementaryReadingIds,[
 "LectioL1","LectioL2","LectioL3","LectioL4","LectioL5"]);
assert.deepEqual(saturday.shortFormSupplementaryReadingIds,["LectioL1","LectioL5"]);
const satOrder=saturday.fullSourceSectionOrder.filter(id=>/^(LectioL\d+|GradualeL\d+|OratioL\d+)$/.test(id));
const sat=fixture(satOrder,saturday.sourcePath);
assert.deepEqual(sat.cards.map(x=>x.sourceSectionKey),satOrder,
 "Source order must not be sorted into pairs using numeric L suffixes");
for(const id of saturday.longFormSupplementaryReadingIds){
 const card=sat.cards.find(x=>x.sourceSectionKey===id);
 assert.ok(card,"Long form source missed "+id);
 const context=extendedLessonScriptureContext(card,sat.prepared);
 if(id==="LectioL5"){
   assert.equal(context?.state,"READY");
   assert.equal(context?.reference,"Daniel 3:47–51");
   assert.equal(context?.liturgicalArrangement?.noteFr?.includes("ordre liturgique"),true);
 }
 else{
  assert.equal(context?.state,"READY",id+" should have source/LATIN proof");
  assert.equal(context?.reference,
   saturday.supplementaryReadings.find(x=>x.sourceSectionId===id).reference);
 }
}
const short=fixture(saturday.shortFormSupplementaryReadingIds,saturday.sourcePath);
assert.deepEqual(short.cards.map(x=>x.sourceSectionKey),["LectioL1","LectioL5"]);
assert.equal(extendedLessonScriptureContext(short.cards[0],short.prepared)?.reference,
 "Leviticus 23:26–32");
assert.equal(extendedLessonScriptureContext(short.cards[1],short.prepared)?.reference,"Daniel 3:47–51");
assert.ok(!short.cards.some(x=>["LectioL2","LectioL3","LectioL4"].includes(x.sourceSectionKey)));
for(const id of ["LectioL2","LectioL3","LectioL4"]){
 const card=sat.cards.find(x=>x.sourceSectionKey===id);
 assert.equal(extendedLessonScriptureContext({...card,sourceOrderIndex:0},sat.prepared),null,
  "A long-only lesson must not be silently remapped to another source index");
 assert.equal(extendedLessonScriptureContext(card,short.prepared),null,
  "A short-form source manifest cannot inherit absent long-form lessons");
}
const altered={...sat.cards.find(x=>x.sourceSectionKey==="LectioL2"),
 paragraphs:[{primary:"A French gloss",alternate:
 septExtra.find(x=>x.sourceSectionId==="LectioL1"&&x.sourcePath===saturday.sourcePath).latinIncipit}]};
assert.equal(extendedLessonScriptureContext(altered,sat.prepared),null,
 "Leviticus L1 vs L2 must be distinguished by exact Latin incipit");
assert.ok(sat.cards.filter(x=>x.emberNodeType!=="LESSON").every(x=>
 extendedLessonScriptureContext(x,sat.prepared)===null),
 "Collects, Graduals and Daniel Hymn must not be treated as Scripture reading");

for(const day of audit.days){
 const proper=septProper.find(x=>x.sourcePath===day.sourcePath);
 assert.equal(proper.witnessUrl,day.witnessUrl);
 assert.equal(proper.sourceFileUrl,day.latinSourceFile);
 for(const [slot,ref] of Object.entries(proper.readings)){
  const field=slot==="GOSPEL"?"gospel":"epistle";
  const value={sourcePath:day.sourcePath,[field]:{lat:ref.latinIncipit+" additum."}};
  assert.equal(registeredMassReading(value,slot)?.reference,ref.reference);
  assert.equal(registeredMassReading({...value,sourcePath:"Tempora/Pent17-6"},slot),null);
  assert.equal(registeredMassReading({...value,[field]:{lat:"Sententia omnino aliena"}},slot),null);
 }
}
const dan=saturday.supplementaryReadings.find(x=>x.sourceSectionId==="LectioL5");
assert.equal(dan.status,"BIBLE_CONTEXT_CANONICAL_ORDER_WITH_MANDATORY_LITURGICAL_TRANSPOSITION_NOTE");
assert.deepEqual(dan.actualLatinTextOrder,
 ["Daniel 3:49","Daniel 3:47–48","Daniel 3:50–51"]);
assert.equal(dan.observedLatinHeader,"Dan 3:47-51");
assert.equal(dan.observedEnglishHeader,"Dan 3:49-51");
assert.equal(septExtra.find(x=>x.sourceSectionId==="LectioL5")?.liturgicalArrangement?.canonicalReference,"Daniel 3:47–51");
assert.ok(!septProper.some(x=>Object.values(x.readings).some(v=>/Daniel/.test(v.reference))));
assert.ok(dan.hymnSeparate.startsWith("Daniel 3:52–59"));
console.log("September 1962 Ember Scripture: PASS — Wednesday Amos, Saturday five source-ordered lessons with explicit canonical-vs-liturgical Daniel order, six ordinary Proper refs, original 093 source paths, short/long source selection and no duplicate scripture controls.");
