import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {registeredMassReading,registeredSegmentedMassReading,massScriptureContextForCard} from "../src/mass/scripture-reading-context.js";
import {extendedLessonScriptureContext} from "../src/mass/scripture-extended-lesson-context.js";
import {buildEmberInsertionCards} from "../src/mass/reader-ember-lessons.js";
import {scriptureSegmentsReference} from "../src/scripture/segments.js";
import {scriptureReferenceWarning} from "../src/scripture/reference-safety.js";
import {VERIFIED_MASS_FEAST_READINGS} from "../src/mass/scripture-feast-reading-index.js";
import {VERIFIED_SEGMENTED_MASS_READINGS} from "../src/mass/scripture-segmented-reading-index.js";
import {VERIFIED_EXTENDED_LESSON_READINGS} from "../src/mass/scripture-extended-lesson-index.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const matrix=load("../data/mass/scripture-lent-weekday-source-audit.v1.json");
assert.equal(matrix.schema,"ao-1962-lent-weekday-scripture-source-matrix-v1");
assert.deepEqual(matrix.count,{
 ordinaryWeekdayPropers:26,singleRangeProperReferences:47,
 segmentedProperReadings:5,additionalSourceOrderedLessons:1
});
const actual=new Set(matrix.days.map(x=>x.sourcePath));
assert.equal(actual.size,26);
assert.equal(matrix.days.length,26);
assert.ok(!actual.has("Tempora/Quad5-5"));
for(const ember of ["Quad1-3","Quad1-5","Quad1-6"])
 assert.ok(!actual.has("Tempora/"+ember),"Existing Ember owner must not be duplicated");
const omitted=matrix.specialCases.find(x=>x.sourcePath==="Tempora/Quad5-5");
assert.equal(omitted.disposition,"HOLD_NOT_A_GENERIC_1962_FRIDAY_PROPER");
assert.ok(omitted.originalLatinFile.endsWith("/Quad5-5.txt"));
assert.equal(VERIFIED_MASS_FEAST_READINGS.length,55);
assert.equal(VERIFIED_SEGMENTED_MASS_READINGS.length,15);
assert.equal(VERIFIED_EXTENDED_LESSON_READINGS.length,26);
const normal=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replaceAll("æ","ae").replaceAll("œ","oe").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
const prep=p=>({session:{resolvedMass:{proper:{status:"READY",sourcePath:p.sourcePath,data:p}}}});
const card=slot=>({blocks:[{properSlot:slot}]});
let singles=0,segmented=0,extras=0;
for(const day of matrix.days){
 const path=day.sourcePath,row=VERIFIED_MASS_FEAST_READINGS.find(x=>x.sourcePath===path);
 assert.ok(row,"Missing Lenten Proper "+path);
 assert.equal(day.primaryLatinSourceUrl,row.witnessUrl);
 assert.ok(row.witnessUrl.endsWith("/"+path.split("/")[1]+".txt"));
 assert.ok(row.sourceOriginalHeadings.Lectio.startsWith("!"));
 const matched=new Set();
 for(const reading of day.properOrdinaryReadings){
  const field=reading.slot==="GOSPEL"?"gospel":"epistle";
  const v=row.readings[reading.slot];
  assert.equal(reading.reference,v.reference);
  assert.ok(v.latinIncipit.length>=35);
  const proper={sourcePath:path,[field]:{lat:"Lectio: "+v.latinIncipit+" et aliud."}};
  assert.equal(registeredMassReading(proper,reading.slot)?.reference,reading.reference,
   path+": Latin source-bound reference missing");
  assert.equal(massScriptureContextForCard(card(reading.slot),prep(proper))?.reference,reading.reference);
  assert.equal(registeredMassReading({...proper,sourcePath:"Tempora/Pent17-3"},reading.slot),null,
   "A text match must never override wrong source path");
  assert.equal(registeredMassReading({...proper,[field]:{lat:"Different authentic Latin reading"}},reading.slot),null,
   "A Proper text mismatch must disable Bible Context");
  assert.equal(massScriptureContextForCard(card(reading.slot),prep({
   ...proper,[field]:{...proper[field],reference:"John 3:16"}
  }))?.state,"UNRESOLVED_REFERENCE","Conflicting external citation must fail closed");
  matched.add(reading.slot);
  singles++;
 }
 for(const item of day.segmentedReadings){
  const source=VERIFIED_SEGMENTED_MASS_READINGS.find(x=>x.sourcePath===path&&x.slot===item.slot);
  assert.ok(source,"Unregistered segmented reading "+path);
  assert.deepEqual(source.segments,item.segments);
  assert.equal(scriptureSegmentsReference(item.segments),item.reference);
  assert.equal(source.reference,item.reference);
  assert.equal(source.sourceOriginalHeading,item.originalHeader);
  assert.ok(source.latinIncipit.length>45);
  const proper={sourcePath:path,epistle:{lat:source.latinIncipit+" et reliquum."}};
  assert.equal(registeredMassReading(proper,item.slot),null,
   "Disjoint reading must not be assigned a single uninterrupted Bible span");
  assert.equal(registeredSegmentedMassReading(proper,item.slot)?.reference,item.reference);
  assert.equal(massScriptureContextForCard(card(item.slot),prep(proper))?.reference,item.reference);
  assert.equal(registeredSegmentedMassReading({...proper,epistle:{lat:"No matching source Latin"}},item.slot),null);
  assert.equal(registeredSegmentedMassReading({...proper,sourcePath:"Tempora/Quad6-0"},item.slot),null);
  matched.add(item.slot);
  segmented++;
 }
 assert.equal(matched.size,2,"Each actual Mass Proper must have exactly its two readings "+path);
 for(const extra of day.supplementaryReadings){
  assert.equal(extra.sourceSectionId,"LectioL1");
  assert.equal(extra.reference,"Ezekiel 36:23–28");
  extras++;
 }
 if(day.inheritedGospelFrom){
  assert.equal(row.gospelInheritedFrom,day.inheritedGospelFrom);
  assert.ok(row.sourceOriginalHeadings.Evangelium.startsWith("@"));
 }
}
assert.equal(singles,47);assert.equal(segmented,5);assert.equal(extras,1);
const refs=Object.fromEntries(VERIFIED_SEGMENTED_MASS_READINGS
 .filter(x=>actual.has(x.sourcePath)).map(x=>[x.sourcePath,x]));
assert.deepEqual(Object.keys(refs).sort(),[
 "Tempora/Quad2-3","Tempora/Quad3-5","Tempora/Quad3-6",
 "Tempora/Quad5-3","Tempora/Quad5-4"
]);
assert.deepEqual(refs["Tempora/Quad2-3"].segments.map(x=>[x.verseStart,x.verseEnd]),[[8,11],[15,17]]);
assert.ok(scriptureReferenceWarning("Esther","en")?.includes("Greek additions"),
 "Vulgate Esther 13 is not blanket-aligned to other Greek-addition editions");
assert.deepEqual(refs["Tempora/Quad3-5"].segments.map(x=>[x.verseStart,x.verseEnd]),[[1,1],[3,3],[6,13]]);
assert.deepEqual(refs["Tempora/Quad3-6"].segments.map(x=>[x.verseStart,x.verseEnd]),[[1,9],[15,17],[19,30],[33,62]]);
assert.deepEqual(refs["Tempora/Quad5-3"].segments.map(x=>[x.verseStart,x.verseEnd]),[[1,2],[11,19],[25,25]]);
assert.deepEqual(refs["Tempora/Quad5-4"].segments.map(x=>[x.verseStart,x.verseEnd]),[[25,25],[34,45]]);
assert.equal(VERIFIED_MASS_FEAST_READINGS.find(x=>x.sourcePath==="Tempora/Quad3-4").gospelInheritedFrom,"Tempora/Pasc7-6");
assert.equal(VERIFIED_MASS_FEAST_READINGS.find(x=>x.sourcePath==="Tempora/Quad5-4").gospelInheritedFrom,"Sancti/07-22");
// Fourth Lent Wednesday: two Lessons really are different cards in
// the 1962 source. Only the first one participates in preGospelSequence.
const path="Tempora/Quad4-3",extra=VERIFIED_EXTENDED_LESSON_READINGS.find(x=>x.sourcePath===path);
assert.equal(extra?.reference,"Ezekiel 36:23–28");
const order=["LectioL1","GradualeL1","OratioL1"];
const nodes=order.map((id,index)=>({
 id:"PRE_GOSPEL."+index+"."+id,
 type:id.startsWith("Lectio")?"LESSON":id.startsWith("Graduale")?"GRADUAL":"ORATION",
 sourceSectionId:id,sourceOrderIndex:index,
 sourceRef:path+":"+id,payloadRef:id,orderAuthority:"SOURCE_ORDER"
}));
const payloads={
 LectioL1:{textLat:extra.latinIncipit+" Quod sequitur.",textEn:"First baptized lesson"},
 GradualeL1:{textLat:"Graduale baptismale",textEn:"Gradual"},
 OratioL1:{textLat:"Oremus et flectamus genua",textEn:"Collect"}
};
const source={schema:"ao-proper-manifest-v2",sourcePath:path,preGospelSequence:nodes,
 preGospelSequenceProvenance:{schema:"ao-pre-gospel-source-order-v1",orderAuthority:"SOURCE_ORDER",
  sourcePath:path,sourceOrder:order},
 preGospelPayloads:payloads};
const cards=buildEmberInsertionCards({proper:source,overlays:["EMBER_LESSONS"]});
assert.deepEqual(cards.map(x=>x.sourceSectionKey),order);
const prepared=prep(source);
assert.equal(extendedLessonScriptureContext(cards[0],prepared)?.reference,"Ezekiel 36:23–28");
for(const nonReading of cards.slice(1))
 assert.equal(extendedLessonScriptureContext(nonReading,prepared),null,
  "A collect or gradual must never inherit the first Lesson's Bible link");
assert.equal(extendedLessonScriptureContext({...cards[0],paragraphs:[{alternate:"Not the original Latin"}]},prepared),null);
assert.equal(extendedLessonScriptureContext({...cards[0],sourceOrderIndex:1},prepared),null);
assert.equal(extendedLessonScriptureContext(cards[0],prep({...source,sourcePath:"Tempora/Quad4-2"})),null);
const later=VERIFIED_MASS_FEAST_READINGS.find(x=>x.sourcePath===path).readings.EPISTLE_OR_LESSON;
assert.equal(later.reference,"Isaiah 1:16–19");
assert.notEqual(normal(extra.latinIncipit),normal(later.latinIncipit));
assert.equal(registeredMassReading({sourcePath:path,epistle:{lat:later.latinIncipit}}, "EPISTLE_OR_LESSON")?.reference,"Isaiah 1:16–19");
console.log("PASS Lent weekdays: 26 source-pinned Propers, 47 single readings, 5 truly segmented omissions, 1 separately ordered Ezekiel lesson; 1962 Marian Friday hold, inherited Gospel sources, Latin/source fail-closed controls.");
