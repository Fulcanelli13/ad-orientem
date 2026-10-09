import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {extendedLessonScriptureContext} from "../src/mass/scripture-extended-lesson-context.js";
import {VERIFIED_EXTENDED_LESSON_READINGS,VERIFIED_EXTENDED_LESSON_VERSION}
  from "../src/mass/scripture-extended-lesson-index.js";
import {scriptureSegmentsReference} from "../src/scripture/segments.js";
const load=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const data=load("../data/mass/scripture-extended-lesson.v1.json");
assert.equal(VERIFIED_EXTENDED_LESSON_VERSION,data.version);
assert.deepEqual(VERIFIED_EXTENDED_LESSON_READINGS,data.readings);
assert.equal(data.readings.length,25);
const source=data.readings[0];
assert.equal(source.sourcePath,"Tempora/Quad6-3");
assert.equal(source.sourceSectionId,"LectioL1");
assert.equal(source.reference,"Isaiah 62:11; 63:1–7");
assert.equal(scriptureSegmentsReference(source.segments),source.reference);
const node={
 id:"PRE_GOSPEL.L1",type:"LESSON",sourceSectionId:"LectioL1",sourceOrderIndex:1,
 orderAuthority:"SOURCE_ORDER",sourceRef:"Tempora/Quad6-3:LectioL1",
 payloadRef:"HOLY_WEDNESDAY_L1"
};
const order=["OratioL2","LectioL1","GradualeL1","OratioL1"];
const proper={
 schema:"ao-proper-manifest-v2",sourcePath:"Tempora/Quad6-3",
 preGospelSequence:[{id:"PRE_GOSPEL.OR2",type:"ORATION",sourceSectionId:"OratioL2",
    sourceOrderIndex:0,sourceRef:"Tempora/Quad6-3:OratioL2"},node,
   {id:"PRE_GOSPEL.GR1",type:"GRADUAL",sourceSectionId:"GradualeL1",sourceOrderIndex:2,
    sourceRef:"Tempora/Quad6-3:GradualeL1"},
   {id:"PRE_GOSPEL.OR1",type:"ORATION",sourceSectionId:"OratioL1",sourceOrderIndex:3,
    sourceRef:"Tempora/Quad6-3:OratioL1"}],
 preGospelSequenceProvenance:{
  orderAuthority:"SOURCE_ORDER",sourcePath:"Tempora/Quad6-3",sourceOrder:order
 }
};
const card={emberInsertion:true,emberNodeType:"LESSON",sourceSectionKey:"LectioL1",
 sourceOrderIndex:1,emberNodeId:"PRE_GOSPEL.L1",sourceRef:"Tempora/Quad6-3:LectioL1",
 paragraphs:[{id:"L1",primary:"Voici votre Sauveur",alternate:"Hæc dicit Dóminus Deus: Dícite fíliæ Sion: Ecce Salvátor tuus venit. Quis est iste, qui venit de Edom?"}]};
const prepared={session:{resolvedMass:{proper:{status:"READY",data:proper}}}};
const result=extendedLessonScriptureContext(card,prepared);
assert.equal(result?.state,"READY");
assert.equal(result?.reference,"Isaiah 62:11; 63:1–7");
assert.equal(result?.segments.length,2);
assert.equal(result?.sourceSectionId,"LectioL1");
assert.equal(result?.provenance,"EXTENDED_LESSON_SOURCE_ORDER_AND_LATIN_BOUND");
function invalidCard(changes){return extendedLessonScriptureContext({...card,...changes},prepared);}
function invalidProper(changes){return extendedLessonScriptureContext(card,{
 session:{resolvedMass:{proper:{status:"READY",data:{...proper,...changes}}}}
});}
assert.equal(invalidCard({emberInsertion:false}),null);
assert.equal(invalidCard({emberNodeType:"GRADUAL"}),null);
assert.equal(invalidCard({sourceSectionKey:"LectioL2"}),null);
assert.equal(invalidCard({sourceOrderIndex:2}),null);
assert.equal(invalidCard({emberNodeId:"PRE_GOSPEL.WRONG"}),null);
assert.equal(invalidCard({sourceRef:"Tempora/Other:LectioL1"}),null);
assert.equal(invalidCard({paragraphs:[{alternate:"Another Latin reading entirely"}]}),null);
assert.equal(invalidProper({sourcePath:"Tempora/Quad5-3"}),null);
assert.equal(invalidProper({preGospelSequenceProvenance:{
 orderAuthority:"NUMBER_SUFFIX",sourcePath:"Tempora/Quad6-3",sourceOrder:order}}),null);
assert.equal(invalidProper({preGospelSequenceProvenance:{
 orderAuthority:"SOURCE_ORDER",sourcePath:"Tempora/Quad6-3",sourceOrder:[...order].reverse()}}),null);
assert.equal(invalidProper({preGospelSequence:[
 {...proper.preGospelSequence[0]},{...node,scriptureReference:"Jeremiah 1:1"},
 ...proper.preGospelSequence.slice(2)]}),null,
 "A contradictory first-party scripture citation must veto the external witness");
assert.equal(invalidProper({preGospelSequence:[
 {...proper.preGospelSequence[0]},{...node,sourceOrderIndex:2},
 ...proper.preGospelSequence.slice(2)]}),null);
const regularMass={blocks:[{properSlot:"EPISTLE_OR_LESSON"}],paragraphs:[]};
assert.equal(extendedLessonScriptureContext(regularMass,prepared),null,
 "An ordinary Proper Epistle cannot be displaced by the first extended Lesson");
const held=load("../data/mass/scripture-feast-reading-supplement.v1.json");
assert.equal(held.celebrations.find(x=>x.sourcePath==="Tempora/Quad6-3").readings.EPISTLE_OR_LESSON.reference,"Isaiah 53:1–12");
const segmented=load("../data/mass/scripture-segmented-proper.v1.json");
assert.equal(segmented.readings.find(x=>x.sourcePath==="Tempora/Quad6-3").reference,
 "Luke 22:39–71; 23:1–53");
console.log("PASS Holy Wednesday: Isaiah first/source-order and second/Proper remain separate; Luke Passion segmented; unmatched Ember lessons cannot inherit guessed citations.");
