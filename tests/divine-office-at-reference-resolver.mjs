import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {createOfficeAtReferenceResolver}
 from "../src/office/at-reference-resolver.js";
import {composeOfficeHourDraft}
 from "../src/office/structured-hour-draft.js";

const original="Tempora/Adv1-0",other="Psalterium/Special/Major Special";
function setup({badFrench=false,collectMacro=false,cycle=false,wrongPin=false}={}){
 const calls=[];
 const readSource=async(path,language)=>{
  calls.push([path,language]);
  const map=path===original?new Map([
   ["Ant Vespera",["@:Ant Laudes"]],
   ["Ant Laudes",cycle?["@:Ant Vespera"]:["Antiphon of "+language]],
   ["Ant 1",["Source Magnificat antiphon "+language]],
   ["Oratio",collectMacro?["Prayer "+language,"$Qui vivis"]:["Prayer "+language]]
  ]):new Map([["Other",["Psalterium line "+language]]]);
  if(badFrench&&language==="fr")map.delete("Ant Laudes");
  return {sourceRevision:wrongPin?"0".repeat(40):DIVINUM_OFFICIUM_PIN,
   sourcePath:path,language,map};
 };
 return {resolver:createOfficeAtReferenceResolver({readSource}),calls};
}
test("same-leaf @: reference resolves the explicit source section in all three languages",async()=>{
 const {resolver,calls}=setup();
 const r=await resolver.resolveParallel({path:original,section:"Ant Vespera",role:"ANTIPHON"});
 assert.equal(r.texts.la,"Antiphon of la");
 assert.equal(r.texts.en,"Antiphon of en");
 assert.equal(r.texts.fr,"Antiphon of fr");
 assert.deepEqual(r.referenceTraces.fr.map(x=>x.sourceId),[
  original+"#Ant Vespera",original+"#Ant Laudes"
 ]);
 assert.equal(r.alignmentVerified,false);
 assert.equal(r.publishable,false);
 assert.equal(calls.length,3);
});
test("absolute @path:section references retain dependency and exact language",async()=>{
 const {resolver}=setup();
 const results=await Promise.all(["la","en","fr"].map(language=>
  resolver.resolve({path:other,section:"Other",language})));
 assert.equal(results[0].text,"Psalterium line la");
 assert.equal(results[2].text,"Psalterium line fr");
 assert.equal(results[0].status,"EXPLICIT_AT_REFERENCES_EXPANDED_UNVERIFIED");
});
test("a parsed three-language explicit-reference section can enter a draft but is not a complete Hour",async()=>{
 const {resolver}=setup();
 const r=await composeOfficeHourDraft({resolver,selection:{
  date:"2026-11-29",hour:"VESPERS",officeKey:"advent-i-2026-11-29",
  edition:"ROMAN_1960",sourceRevision:DIVINUM_OFFICIUM_PIN,
  status:"RESEARCH_SELECTION",orderedSections:[
   {key:"research-antiphon",path:original,section:"Ant Vespera",role:"ANTIPHON"}
  ]
 }});
 assert.equal(r.sections[0].texts.fr,"Antiphon of fr");
 assert.equal(r.officeCompletenessVerified,false);
 assert.equal(r.languagesAligned,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("missing French dependency blocks the entire source parallel",async()=>{
 const {resolver}=setup({badFrench:true});
 await assert.rejects(resolver.resolveParallel({
  path:original,section:"Ant Vespera",role:"ANTIPHON"
 }),/OFFICE_AT_SOURCE_SECTION_MISSING/);
});
test("cycle and reference depth are bounded, no recursive runaway",async()=>{
 const {resolver}=setup({cycle:true});
 await assert.rejects(resolver.resolve({
  path:original,section:"Ant Vespera",language:"la"
 }),/OFFICE_AT_REFERENCE_CYCLE/);
});
test("standard prayer $ macro is not guessed or silently omitted",async()=>{
 const {resolver}=setup({collectMacro:true});
 await assert.rejects(resolver.resolveParallel({
  path:original,section:"Oratio",role:"COLLECT"
 }),/OFFICE_AT_OTHER_MACRO_OR_CONDITIONAL_UNRESOLVED/);
});
test("unrecognised implicit path reference is quarantined",async()=>{
 const resolver=createOfficeAtReferenceResolver({readSource:async(path,language)=>({
  sourcePath:path,language,sourceRevision:DIVINUM_OFFICIUM_PIN,
  map:new Map([["Lectio1",["@Commune/C9"]]])
 })});
 await assert.rejects(resolver.resolve({path:original,section:"Lectio1",language:"la"}),
  /OFFICE_AT_REFERENCE_SYNTAX_UNSUPPORTED/);
});
test("source provenance must remain at the immutable pin",async()=>{
 const {resolver}=setup({wrongPin:true});
 await assert.rejects(resolver.resolve({path:original,section:"Ant 1",language:"la"}),
  /OFFICE_AT_SOURCE_PROVENANCE_MISMATCH/);
});
test("repeated requests use the same parsed document rather than a new read",async()=>{
 const {resolver,calls}=setup();
 await resolver.resolve({path:original,section:"Ant 1",language:"la"});
 await resolver.resolve({path:original,section:"Ant Vespera",language:"la"});
 assert.equal(calls.length,1);
 assert.equal(resolver.cachedSourceCount(),1);
});
test("source document request ceiling is strict",async()=>{
 const resolver=createOfficeAtReferenceResolver({
  maxDocuments:1,readSource:async(path,language)=>({
   sourcePath:path,language,sourceRevision:DIVINUM_OFFICIUM_PIN,
   map:new Map([["Ant 1",["Text"]]])
  })
 });
 await resolver.resolve({path:original,section:"Ant 1",language:"la"});
 await assert.rejects(resolver.resolve({path:original,section:"Ant 1",language:"en"}),
  /OFFICE_AT_SOURCE_READ_BUDGET/);
});
