import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {OFFICE_PRECEDENCE_RULESET,OFFICE_PRECEDENCE_SOURCE,reviewOfficeOccurrence}
 from "../src/office/precedence-review.js";
import {reviewOfficeHourHandoff} from "../src/office/reviewed-hour-handoff.js";
import {createOfficeConditionalSourceReader}
 from "../src/office/conditional-source-reader.js";
import {createOfficeSectionResolver}
 from "../src/office/source-section-resolver.js";
import {createOfficeAtReferenceResolver}
 from "../src/office/at-reference-resolver.js";
import {reviewOfficeSourceAcceptanceSlice,composeOfficeSourceAcceptanceSlice}
 from "../src/office/source-acceptance-slice.js";

const filenameIndex=JSON.parse(readFileSync(new URL(
 "../data/office/source-index/roman-1960-pinned-latin-filenames.json",
 import.meta.url),"utf8"));
const eve="2026-11-28",day="2026-11-29",sourcePath="Tempora/Adv1-0";
function candidate(id,date,kind,position,{first=false,second=true}={}){
 return {id,date,kind,tablePosition:position,
  class:position<=13?1:position<=21?2:position<=27?3:4,
  ruleset:OFFICE_PRECEDENCE_RULESET,calendarScope:"UNIVERSAL",
  witness:{rubricSource:OFFICE_PRECEDENCE_SOURCE,sourceId:"fixture:"+id},
  printedOfficeCertified:false,sourceTextApproved:false,
  hasFirstVespers:first,hasSecondVespers:second};
}
function occurrence(date,candidates){
 return reviewOfficeOccurrence({date,candidates,
  officeCalendarEvidence:"INDEPENDENT_OFFICE_CANDIDATES_RESEARCH",
  localCalendarStatus:"UNIVERSAL_ONLY"
 });
}
const saturday=occurrence(eve,[candidate("bvm-2026-11-28",eve,"SATURDAY_BVM",27,
 {second:false})]);
const advent=occurrence(day,[candidate("advent-i-2026-11-29",day,"SUNDAY",6,
 {first:true,second:true})]);
const sections=[{key:"magnificat-antiphon",path:sourcePath,section:"Ant 1",role:"ANTIPHON"}];
function handoff(orderedSections=sections){
 return reviewOfficeHourHandoff({civilDate:eve,hour:"VESPERS",
  occurrence:saturday,followingOccurrence:advent,
  selection:{date:day,hour:"VESPERS",officePart:"FIRST",
   officeKey:"advent-i-2026-11-29",edition:"ROMAN_1960",
   sourceRevision:DIVINUM_OFFICIUM_PIN,status:"RESEARCH_SELECTION",
   orderedSections}});
}
const originalMetadata=`[Officium]
Dominica I Adventus

[Rank]
;;Semiduplex;;6.9

[Rule]
9 lectiones
Antiphonas horas

[Ant 1]
Ecce nomen Domini * venit de longinquo.

[Oratio]
Excita, quaesumus, Domine, potentiam tuam, et veni:
$Qui vivis

[Lectio1]
This lesson content is never exposed through metadata.
`;
function environment({raw=originalMetadata,french=true,collectMacro=false,approvedPrayers=false,missingFrenchPrayer=false}={}){
 const calls=[];
 const fetchSource=async(url,init)=>{
  calls.push({url,init});
  return {ok:true,status:200,url,headers:{get:()=>null},text:async()=>raw};
 };
 const metadataReader=createOfficeConditionalSourceReader({
  filenameIndex,fetchSource,maxDistinctReads:2
 });
 const reads=[];
 const readSource=async(path,language)=>{
  reads.push([path,language]);
  return {
   sourceRevision:DIVINUM_OFFICIUM_PIN,sourcePath:path,language,
   map:path==="Psalterium/Common/Prayers"?
    language==="fr"&&missingFrenchPrayer?new Map():
     new Map([["Qui vivis",[
      "r. "+language+" pinned Qui vivis source conclusion","R. Amen."
     ]]]):
    new Map([
     ["Ant 1",...(language==="fr"&&!french?[]:[[language+" indexed Advent antiphon"]])],
     ["Oratio",[language+" indexed collect",...(collectMacro?["$Qui vivis"]:[])]]
    ])
  };
 };
 const resolver=approvedPrayers?
  createOfficeAtReferenceResolver({readSource,enableStandardPrayers:true}):
  createOfficeSectionResolver({readSource});
 return {metadataReader,resolver,calls,reads};
}
const args=(env,review=handoff(),path=sourcePath,title="Dominica I Adventus")=>({
 handoff:review,sourcePath:path,expectedLatinTitle:title,
 metadataReader:env.metadataReader,resolver:env.resolver
});
test("real pinned Advent header shapes yield one trilingual research component, not a complete Hour",async()=>{
 const env=environment();
 const result=await composeOfficeSourceAcceptanceSlice(args(env));
 assert.equal(result.status,"TRILINGUAL_SOURCE_COMPONENT_SLICE_UNVERIFIED");
 assert.equal(result.civilDate,eve);
 assert.equal(result.date,day);
 assert.equal(result.officePart,"FIRST");
 assert.equal(result.sourcePath,sourcePath);
 assert.equal(result.sourceSections[0].section,"Ant 1");
 assert.equal(result.sectionCount,1);
 assert.equal(result.trilingualSectionsLocated,true);
 assert.deepEqual(Object.keys(result.sections[0].texts),["la","en","fr"]);
 assert.equal(result.completeHourVerified,false);
 assert.equal(result.translationCollationVerified,false);
 assert.equal(result.liturgicalSelectionVerified,false);
 assert.equal(result.publishable,false);
 assert.equal(result.published,false);
 assert.equal(env.calls.length,1);
 assert.equal(env.reads.length,3);
 assert.equal(JSON.stringify(result).includes("This lesson content"),false);
});
test("source collect with unresolved conclusion blocks the entire multi-section slice",async()=>{
 const env=environment({collectMacro:true});
 const r=await composeOfficeSourceAcceptanceSlice(args(env,handoff([
  ...sections,{key:"collect",path:sourcePath,section:"Oratio",role:"COLLECT"}
 ])));
 assert.equal(r.status,"WITHHELD");
 assert.match(r.reason,/OFFICE_SOURCE_DIRECTIVE_UNRESOLVED/);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("missing source French section is blocked, never replaced by English",async()=>{
 const env=environment({french:false});
 const result=await composeOfficeSourceAcceptanceSlice(args(env));
 assert.equal(result.status,"WITHHELD");
 assert.match(result.reason,/OFFICE_SOURCE_SECTION_EMPTY/);
 assert.equal(result.translationCollationVerified,false);
});
test("a wrong Latin feast header blocks composition before trilingual source lookup",async()=>{
 const env=environment();
 const r=await composeOfficeSourceAcceptanceSlice(args(env,handoff(),sourcePath,
  "Dominica IV Adventus"));
 assert.equal(r.reason,"OFFICE_SOURCE_SLICE_LATIN_TITLE_NOT_MATCHED");
 assert.equal(env.reads.length,0);
 assert.equal(env.calls.length,1);
});
test("repeated conditional Ant 1 variants cannot be chosen arbitrarily",async()=>{
 const env=environment({raw:originalMetadata+
  "\n[Ant 1] (rubrica tridentina)\nOther version of the antiphon.\n"});
 const r=await composeOfficeSourceAcceptanceSlice(args(env));
 assert.equal(r.reason,"OFFICE_SOURCE_SLICE_SECTION_VARIANT_UNRESOLVED:Ant 1");
 assert.equal(env.reads.length,0);
});
test("research Office on Saturday cannot be matched to next-day source without concurrence",async()=>{
 const env=environment();
 const mismatch={...handoff(),status:"WITHHELD"};
 const r=await composeOfficeSourceAcceptanceSlice(args(env,mismatch));
 assert.equal(r.reason,"OFFICE_PRECEDENCE_RESEARCH_HANDOFF_REQUIRED");
 assert.equal(env.calls.length,0);
 assert.equal(env.reads.length,0);
});
test("every section must come from the exact selected one-leaf source in this pilot",async()=>{
 const env=environment();
 const r=await reviewOfficeSourceAcceptanceSlice(args(env,handoff([
  ...sections,{key:"other",path:"Sancti/11-29",section:"Oratio",role:"COLLECT"}
 ])));
 assert.equal(r.reason,"OFFICE_SOURCE_SLICE_EXPLICIT_SINGLE_OWNER_REQUIRED");
 assert.equal(env.calls.length,0);
});
test("unlisted or nonmatching date path is withheld before original source is read",async()=>{
 const env=environment();
 const review=handoff([{key:"a",path:"Sancti/11-01",section:"Ant 1",role:"ANTIPHON"}]);
 await assert.rejects(composeOfficeSourceAcceptanceSlice(
  args(env,review,"Sancti/11-01","Omnium Sanctorum")),
  /OFFICE_CONDITIONAL_SOURCE_NOT_DATE_LEAD/);
 assert.equal(env.calls.length,0);
});

test("source-owned Qui vivis supports a two-component trilingual Advent I research slice",async()=>{
 const env=environment({collectMacro:true,approvedPrayers:true});
 const r=await composeOfficeSourceAcceptanceSlice(args(env,handoff([
  ...sections,{key:"collect",path:sourcePath,section:"Oratio",role:"COLLECT"}
 ])));
 assert.equal(r.status,"TRILINGUAL_SOURCE_COMPONENT_SLICE_UNVERIFIED");
 assert.equal(r.sectionCount,2);
 assert.equal(r.trilingualSectionsLocated,true);
 for(const lang of ["la","en","fr"]){
  const collect=r.sections.find(s=>s.key==="collect");
  assert.match(collect.texts[lang],new RegExp(lang+" pinned Qui vivis"));
  assert.deepEqual(collect.referenceTraces[lang].map(x=>x.sourceId),[
   "Tempora/Adv1-0#Oratio","Psalterium/Common/Prayers#Qui vivis"
  ]);
 }
 assert.equal(env.reads.length,6);
 assert.equal(env.calls.length,1);
 assert.equal(r.completeHourVerified,false);
 assert.equal(r.liturgicalSelectionVerified,false);
 assert.equal(r.translationCollationVerified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("a missing French standard-prayer conclusion blocks Advent I collect research",async()=>{
 const env=environment({collectMacro:true,approvedPrayers:true,missingFrenchPrayer:true});
 const r=await composeOfficeSourceAcceptanceSlice(args(env,handoff([
  ...sections,{key:"collect",path:sourcePath,section:"Oratio",role:"COLLECT"}
 ])));
 assert.equal(r.status,"WITHHELD");
 assert.match(r.reason,/OFFICE_AT_SOURCE_SECTION_MISSING/);
 assert.equal(r.publishable,false);
});
