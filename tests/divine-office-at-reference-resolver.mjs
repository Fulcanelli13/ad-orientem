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
   ["Versum 1",["@Psalterium/Special/Major Special:Adv Versum 3"]],
   ["Oratio",collectMacro?["Prayer "+language,"$Qui vivis"]:["Prayer "+language]]
  ]):new Map([["Adv Versum 3",["Psalterium line "+language]]]);
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
  resolver.resolve({path:original,section:"Versum 1",language})));
 assert.equal(results[0].text,"Psalterium line la");
 assert.equal(results[2].text,"Psalterium line fr");
 assert.equal(results[0].status,"EXPLICIT_AT_REFERENCES_EXPANDED_UNVERIFIED");
 assert.deepEqual(results[0].referenceTrace.map(x=>x.sourceId),[
  original+"#Versum 1",other+"#Adv Versum 3"
 ]);
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

test("source conditional lines and editorial notation remain unresolved",async()=>{
 for(const raw of ["(rubrica 1960)","(nisi rubrica tridentina)",
  "{:H-PlacareChriste:}v. hymn","!Isa 1:1-3"]){
  const resolver=createOfficeAtReferenceResolver({
   readSource:async(path,language)=>({
    sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
    map:new Map([["Oratio",[raw]]])
   })
  });
  await assert.rejects(resolver.resolve({
   path:original,section:"Oratio",language:"la"
  }),/OFFICE_AT_OTHER_MACRO_OR_CONDITIONAL_UNRESOLVED/);
 }
});

test("approved $Qui vivis resolves solely through exact per-language pinned Prayers sections",async()=>{
 const calls=[];
 const title={la:"Qui vivis et regnas cum Deo Patre",en:"Who livest and reignest with God the Father",fr:"Vous qui étant Dieu, vivez et régnez"};
 const readSource=async(path,language)=>{
  calls.push([path,language]);
  const map=path===original?new Map([
   ["Oratio",["Collect text "+language,"$Qui vivis"]]
  ]):path==="Psalterium/Common/Prayers"?new Map([
   ["Qui vivis",["r. "+title[language],"R. Amen."]]
  ]):new Map();
  return {sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,map};
 };
 const reader=createOfficeAtReferenceResolver({readSource,enableStandardPrayers:true});
 const result=await reader.resolveParallel({path:original,section:"Oratio",role:"COLLECT"});
 for(const lang of ["la","en","fr"]){
  assert.match(result.texts[lang],new RegExp(title[lang]));
  assert.deepEqual(result.referenceTraces[lang].map(x=>x.sourceId),[
   original+"#Oratio","Psalterium/Common/Prayers#Qui vivis"
  ]);
 }
 assert.equal(result.publishable,false);
 assert.equal(result.alignmentVerified,false);
 assert.equal(reader.standardPrayersSourceEnabled,true);
 assert.equal(calls.length,6);
});
test("missing French pinned prayer conclusion blocks all three languages",async()=>{
 const readSource=async(path,language)=>({
  sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
  map:path===original?new Map([["Oratio",["Text","$Qui vivis"]]]):
   language==="fr"?new Map():new Map([["Qui vivis",["Exact conclusion"]]])
 });
 const r=createOfficeAtReferenceResolver({readSource,enableStandardPrayers:true});
 await assert.rejects(r.resolveParallel({
  path:original,section:"Oratio",role:"COLLECT"
 }),/OFFICE_AT_SOURCE_SECTION_MISSING/);
});
test("unlisted prayers and disabled mode cannot invent a standard conclusion",async()=>{
 const readSource=async(path,language)=>({
  sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
  map:new Map([["Oratio",["Collect","$Qui vivis"]]])
 });
 const disabled=createOfficeAtReferenceResolver({readSource});
 await assert.rejects(disabled.resolve({
  path:original,section:"Oratio",language:"la"
 }),/OFFICE_AT_OTHER_MACRO_OR_CONDITIONAL_UNRESOLVED/);
 const enabled=createOfficeAtReferenceResolver({readSource,enableStandardPrayers:true});
 await assert.rejects(enabled.resolve({
  path:original,section:"Oratio",language:"la"
 }),/OFFICE_AT_SOURCE_SECTION_MISSING/);
 const unknown=createOfficeAtReferenceResolver({
  readSource:async(p,language)=>({
   sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:p,language,
   map:new Map([["Oratio",["$Unknown conclusion"]]])
  }),enableStandardPrayers:true
 });
 await assert.rejects(unknown.resolve({path:original,section:"Oratio",language:"la"}),
  /OFFICE_AT_OTHER_MACRO_OR_CONDITIONAL_UNRESOLVED/);
});

test("plain &psalm(116) reads exact pinned Psalm116 verses in each language, but no Gloria",async()=>{
 const calls=[];
 const readSource=async(path,language)=>({
  sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
  map:new Map([["Special Vespera 1",["&psalm(116)"]]])
 });
 const readPsalmSource=async(path,language)=>{
  calls.push([path,language]);
  return {sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
   text:"116:1 "+language+" source verse first\n116:2 "+language+" source verse second\n"};
 };
 const resolver=createOfficeAtReferenceResolver({
  readSource,readPsalmSource,enablePsalmVerses:true
 });
 const r=await resolver.resolveParallel({
  path:"Tempora/Pasc0-0",section:"Special Vespera 1",role:"PSALM"
 });
 assert.equal(r.psalmVersesExpandedWithoutDoxology,true);
 assert.equal(r.psalmDoxologyAndAntiphonVerified,false);
 for(const lang of ["la","en","fr"]){
  assert.match(r.texts[lang],new RegExp("116:1 "+lang));
  assert.deepEqual(r.referenceTraces[lang].map(x=>x.sourceId),[
   "Tempora/Pasc0-0#Special Vespera 1",
   "Psalterium/Psalmorum/Psalm116#VERSES"
  ]);
 }
 assert.equal(calls.length,3);
 assert.equal(r.publishable,false);
 assert.equal(r.alignmentVerified,false);
 const draft=await composeOfficeHourDraft({resolver,selection:{
  edition:"ROMAN_1960",date:"2026-04-05",hour:"VESPERS",
  officeKey:"easter-research-only",sourceRevision:DIVINUM_OFFICIUM_PIN,
  status:"RESEARCH_SELECTION",orderedSections:[
   {key:"plain-psalm-verses",path:"Tempora/Pasc0-0",
    section:"Special Vespera 1",role:"PSALM"}
  ]
 }});
 assert.equal(draft.psalmVerseOnlyComponentCount,1);
 assert.equal(draft.psalmDoxologyAndAntiphonVerified,false);
 assert.equal(draft.sections[0].psalmVersesExpandedWithoutDoxology,true);
 assert.equal(draft.sections[0].psalmDoxologyAndAntiphonVerified,false);
 assert.equal(draft.officeCompletenessVerified,false);
 assert.equal(draft.publishable,false);
});
test("missing French Psalm 116 or unlisted psalm form is a hard failure",async()=>{
 const readSource=async(path,language)=>({
  sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
  map:new Map([["Psalm",["&psalm(116)"]],["PsalmRange",["&psalm(116,1)"]]])
 });
 const reader=createOfficeAtReferenceResolver({readSource,enablePsalmVerses:true,
  readPsalmSource:async(path,language)=>({
   sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
   text:language==="fr"?"":("116:1 one verse\n116:2 second verse")
  })
 });
 await assert.rejects(reader.resolveParallel({
  path:"Tempora/Pasc0-0",section:"Psalm",role:"PSALM"
 }),/OFFICE_AT_PSALM_VERSES_INVALID/);
 await assert.rejects(reader.resolve({
  path:"Tempora/Pasc0-0",section:"PsalmRange",language:"la"
 }),/OFFICE_AT_PSALM_FORM_NOT_SUPPORTED/);
});
test("psalm source-number confusion and upstream revision substitution cannot pass",async()=>{
 for(const file of [
  {sourceRevision:"0".repeat(40),text:"116:1 verse"},
  {sourcePath:"Psalterium/Psalmorum/Psalm115",text:"116:1 verse"},
  {text:"115:1 wrong psalm"},
  {text:"116:2 first\n116:1 out of order"},
  {text:"116:1 test\n116:1 repeated"},
  {text:"116:1 $Per Dominum"}
 ]){
  const reader=createOfficeAtReferenceResolver({
   enablePsalmVerses:true,
   readSource:async(path,language)=>({
    sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
    map:new Map([["Psalm",["&psalm(116)"]]])
   }),
   readPsalmSource:async(path,language)=>({
    sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
    ...file
   })
  });
  await assert.rejects(reader.resolve({path:"Tempora/Pasc0-0",section:"Psalm",language:"la"}),
   /OFFICE_AT_PSALM_/);
 }
});

function saturdayPsalmFixture(number,language){
 const numbers=number===143?
  [1,2,2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,15]:
  [1,2,3,4,5,6,7,8,9,10,11,12,"13a","13b",14,15,16,17,18,19,20,21];
 return numbers.map((n,i)=>number+":"+n+" "+language+
  " exact psalter portion "+i+".").join("\n");
}
test("1960 Sunday First Vespers Saturday psalm 143/144 source ranges retain split boundaries",async()=>{
 const calls=[];
 const resolver=createOfficeAtReferenceResolver({
  readSource:async()=>{throw Error("NOT_USED")},
  enablePsalmVerses:true,maxDocuments:12,
  readPsalmSource:async(path,language)=>{
   calls.push([path,language]);
   const number=Number(path.split("Psalm").at(-1));
   return {sourceRevision:DIVINUM_OFFICIUM_PIN,
    sourcePath:path,language,text:saturdayPsalmFixture(number,language)};
  }
 });
 const ranges=[[143,"1-8"],[143,"9-15"],[144,"1-7"],
  [144,"8-13a"],[144,"13b-21"]];
 const parts=await Promise.all(ranges.map(([number,range])=>
  resolver.resolvePsalmSegmentParallel({number,range})));
 assert.equal(parts.length,5);
 assert.equal(calls.length,6);
 assert.equal(resolver.cachedSourceCount(),6);
 assert.equal(parts[0].schema,"ao.office.psalm-source-segment.v1");
 assert.equal(parts[0].status,"THREE_LANGUAGE_SATURDAY_PSALTER_SEGMENT_UNVERIFIED");
 assert.equal(parts[0].texts.la.split("\n").length,9);
 assert.equal(parts[1].texts.la.split("\n").length,9);
 assert.equal(parts[2].texts.fr.split("\n").length,7);
 assert.equal(parts[3].texts.fr.split("\n").length,6);
 assert.equal(parts[4].texts.fr.split("\n").length,9);
 assert.match(parts[3].texts.fr,/144:13a/);
 assert.doesNotMatch(parts[3].texts.fr,/144:13b/);
 assert.match(parts[4].texts.fr,/^144:13b/);
 assert.equal(parts[0].gloriaPatriVerified,false);
 assert.equal(parts.every(p=>p.publishable===false),true);
});
test("French-source typographic quotes normalize only the explicitly known 144 split",async()=>{
 const resolver=createOfficeAtReferenceResolver({
  readSource:async()=>{throw Error("NOT_USED")},
  enablePsalmVerses:true,
  readPsalmSource:async(path,language)=>({
   sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
   text:saturdayPsalmFixture(144,language)
  })
 });
 const one=await resolver.resolvePsalmSegmentParallel({number:144,range:"8-’13a’"});
 const two=await resolver.resolvePsalmSegmentParallel({number:144,range:"‘13b’-21"});
 assert.equal(one.range,"8-13a");
 assert.equal(two.range,"13b-21");
 await assert.rejects(resolver.resolvePsalmSegmentParallel({number:144,range:"1-21"}),
  /OFFICE_AT_PSALM_SEGMENT_NOT_SUPPORTED/);
});
test("unverified duplicate or missing Saturday psalm verses refuse segmented assembly",async()=>{
 for(const make of [
  (n,s)=>s.replace("143:2 ", "143:5 "),
  (n,s)=>s.replace("144:13b ","144:15 "),
  (n,s)=>s.split("\n").slice(1).join("\n")
 ]){
  const resolver=createOfficeAtReferenceResolver({
   readSource:async()=>{throw Error("NOT_USED")},
   enablePsalmVerses:true,
   readPsalmSource:async(path,language)=>{
    const n=Number(path.split("Psalm").at(-1));
    return {sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
     text:make(n,saturdayPsalmFixture(n,language))};
   }
  });
  await assert.rejects(
   resolver.resolvePsalmSegmentParallel({number:143,range:"1-8"})
    .then(async x=>resolver.resolvePsalmSegmentParallel({number:144,range:"13b-21"})),
   /OFFICE_AT_PSALM_SEGMENT_/);
 }
});
