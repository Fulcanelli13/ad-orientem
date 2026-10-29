import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {reviewOfficeOccurrence,OFFICE_PRECEDENCE_RULESET,OFFICE_PRECEDENCE_SOURCE}
 from "../src/office/precedence-review.js";
import {reviewOfficeHourHandoff} from "../src/office/reviewed-hour-handoff.js";
import {reviewAdventFirstVespersSourceSequence,assembleAdventFirstVespersPsalmodyResearch}
 from "../src/office/advent-first-vespers-source-sequence.js";
import {createOfficeAtReferenceResolver}
 from "../src/office/at-reference-resolver.js";

const eve="2026-11-28",day="2026-11-29";
const proper="Tempora/Adv1-0",psalter="Psalterium/Psalmi/Psalmi major";
const langs=["la","en","fr"],psalms=[109,110,111,112,113];
function candidate(date,id,kind,position,{first=false,second=true}={}){
 return {id,date,kind,tablePosition:position,
  class:position<=13?1:position<=21?2:position<=27?3:4,
  ruleset:OFFICE_PRECEDENCE_RULESET,calendarScope:"UNIVERSAL",
  witness:{rubricSource:OFFICE_PRECEDENCE_SOURCE,sourceId:"research:"+id},
  printedOfficeCertified:false,sourceTextApproved:false,
  hasFirstVespers:first,hasSecondVespers:second};
}
function occurrence(date,candidates){
 return reviewOfficeOccurrence({
  date,candidates,officeCalendarEvidence:"INDEPENDENT_OFFICE_CANDIDATES_RESEARCH",
  localCalendarStatus:"UNIVERSAL_ONLY"
 });
}
const a=occurrence(eve,[candidate(eve,"saturday-bvm","SATURDAY_BVM",27,{second:false})]);
const b=occurrence(day,[candidate(day,"advent-i-2026-11-29","SUNDAY",6,{first:true})]);
function handoff(){
 return reviewOfficeHourHandoff({
  civilDate:eve,hour:"VESPERS",occurrence:a,followingOccurrence:b,
  selection:{
   status:"RESEARCH_SELECTION",edition:"ROMAN_1960",date:day,
   hour:"VESPERS",officeKey:"advent-i-2026-11-29",officePart:"FIRST",
   sourceRevision:DIVINUM_OFFICIUM_PIN,orderedSections:[
    {key:"collect",path:proper,section:"Oratio",role:"COLLECT"}
   ]
  }
 });
}
function fixture({changes=()=>{},onRead=()=>{}}={}){
 const reads=[];
 const readSource=async(path,language)=>{
  reads.push([path,language]);onRead(path,language);
  const map=path===proper?new Map([
   ["Ant Laudes",psalms.map((n,i)=>
    (language==="la"?"Antíphona":"Antiphon")+" "+(i+1)+" * "+language+" Adventum.")],
   ["Oratio",["Collect "+language,"$Qui vivis"]],
   ["Capitulum Laudes",["!Rom 13:11","v. Source chapter"]],
   ["Ant 1",["Magnificat "+language]]
  ]):new Map([
   ["Day0 Vespera",psalms.map(n=>
    (language==="fr"?"Œuvres":"Dóminus")+" * "+language+" exhortatio.;;"+n)]
  ]);
  if(path===proper&&language==="la"){
   map.set("Ant Vespera",[
    "@:Ant Laudes",
    "(sed rubrica tridentina aut rubrica praedicatorum omittuntur)"
   ]);
  }
  changes(map,path,language);
  return {map,sourcePath:path,language,sourceRevision:DIVINUM_OFFICIUM_PIN};
 };
 return {reads,readSource};
}
test("Advent I First Vespers enumerates 5 source-numbered psalm pairs in all 3 locales",async()=>{
 const env=fixture();
 const r=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:env.readSource
 });
 assert.equal(r.status,"SOURCE_SEQUENCE_COMPONENTS_MAPPED_UNVERIFIED");
 assert.equal(r.sourceRevision,DIVINUM_OFFICIUM_PIN);
 assert.equal(r.civilDate,eve);
 assert.equal(r.officeDate,day);
 assert.equal(r.officePart,"FIRST");
 assert.equal(r.psalmRowsVerifiedAsSourceCandidates,5);
 assert.deepEqual(r.psalmCandidates.map(x=>x.number),psalms);
 assert.equal(r.psalmCandidates[0].psalmSourcePath,
  "Psalterium/Psalmorum/Psalm109");
 assert.deepEqual(Object.keys(r.psalmCandidates[0].languages),langs);
 assert.equal(r.psalmCandidates[0].languages.fr.antiphon,
  "Antiphon 1 * fr Adventum.");
 assert.equal(r.languageSectionsProbed,6);
 assert.equal(env.reads.length,6);
 assert.equal(r.components.length,10);
 assert.deepEqual(r.components.map(s=>s.role),[
  "OPENING","PSALMODY","CHAPTER","HYMN","VERSICLE",
  "MAGNIFICAT_ANTIPHON","CANTICLE","COLLECT","COMMEMORATIONS","CONCLUSION"
 ]);
 assert.equal(r.components.filter(s=>s.status.startsWith("FIVE_SOURCE")).length,1);
 assert.equal(r.appointedOfficeVerified,false);
 assert.equal(r.completeHourVerified,false);
 assert.equal(r.translationAlignmentVerified,false);
 assert.equal(r.published,false);
});
test("LA reference to Ant Laudes is required while missing EN/FR alias is normal",async()=>{
 const r=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:fixture().readSource
 });
 assert.equal(r.psalmCandidates.length,5);
 const bad=fixture({changes:(map,path,lang)=>{
  if(path===proper&&lang==="la")map.delete("Ant Vespera");
 }});
 const blocked=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:bad.readSource
 });
 assert.equal(blocked.reason,"OFFICE_FIRST_VESPERS_LATIN_ANTIPHON_OWNER_UNRESOLVED");
});
test("a locale-specific alternate Ant Vespera is not silently thrown away",async()=>{
 const env=fixture({changes:(map,path,lang)=>{
  if(path===proper&&lang==="en")map.set("Ant Vespera",["Unexpected alternative"]);
 }});
 const r=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:env.readSource
 });
 assert.equal(r.reason,"OFFICE_FIRST_VESPERS_LOCALE_OWNER_VARIANT_REVIEW_REQUIRED:en");
});
test("altered or reordered French psalm numbering withholds the whole sequence",async()=>{
 const env=fixture({changes:(map,path,lang)=>{
  if(path===psalter&&lang==="fr"){
   const lines=map.get("Day0 Vespera");
   const t=lines[3];lines[3]=lines[4];lines[4]=t;
  }
 }});
 const r=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:env.readSource
 });
 assert.equal(r.reason,"OFFICE_FIRST_VESPERS_PSALM_NUMBER_MISMATCH:fr");
 assert.equal(r.psalmRowsVerifiedAsSourceCandidates,0);
 assert.equal(r.published,false);
});
test("missing a French antiphon is a hard hold, never an English fallback",async()=>{
 const env=fixture({changes:(map,path,lang)=>{
  if(path===proper&&lang==="fr")map.get("Ant Laudes").pop();
 }});
 const r=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:env.readSource
 });
 assert.equal(r.reason,"OFFICE_FIRST_VESPERS_FIVE_SOURCE_ROWS_MISSING:fr");
 assert.equal(r.translationAlignmentVerified,false);
});
test("unresolved translation macro inside an antiphon blocks source candidate",async()=>{
 const env=fixture({changes:(map,path,lang)=>{
  if(path===proper&&lang==="fr")map.get("Ant Laudes")[0]="$Unknown";
 }});
 const r=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:env.readSource
 });
 assert.equal(r.reason,"OFFICE_FIRST_VESPERS_FIVE_SOURCE_ROWS_MISSING:fr");
});
test("wrong pinned revision and substituted source path are rejected",async()=>{
 const original=fixture();
 for(const wrong of [{sourceRevision:"0".repeat(40)},
  {sourcePath:"Tempora/Adv4-0"},{language:"de"}]){
  const r=await reviewAdventFirstVespersSourceSequence({
   handoff:handoff(),readSource:async(path,language)=>({
    ...(await original.readSource(path,language)),...wrong
   })
  });
  assert.equal(r.reason,"OFFICE_FIRST_VESPERS_SOURCE_IDENTITY_INVALID");
 }
});
test("forged second Vespers handoff cannot cause a read",async()=>{
 let reads=0;
 const bad={...handoff(),officePart:"SECOND"};
 const r=await reviewAdventFirstVespersSourceSequence({
  handoff:bad,readSource:async()=>{reads++;return {}}
 });
 assert.equal(r.reason,"OFFICE_FIRST_VESPERS_RESEARCH_HANDOFF_REQUIRED");
 assert.equal(reads,0);
});
test("not a full Office: all remaining rubrical and printed gates stay open",async()=>{
 const r=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:fixture().readSource
 });
 assert.ok(r.unresolvedGates.includes("COMMEMORATION_DECISION"));
 assert.ok(r.unresolvedGates.includes("MAGNIFICAT_TEXT_AND_ANTIPHON_APPOINTMENT"));
 assert.ok(r.unresolvedGates.includes("ANTIPHON_REPETITION_AND_FIRST_VESPERS_1960_RUBRICS"));
 assert.equal(r.psalmCandidates.every(x=>
  x.psalmVersesFetched===false&&x.gloriaPatriVerified===false),true);
 assert.equal(r.components.every(s=>s.fullComponentVerified===false),true);
 assert.equal(r.rightsApproved,false);
});

function verses({missingFrench=false,substituted=false}={}){
 const calls=[];
 const resolver=createOfficeAtReferenceResolver({
  readSource:async()=>{throw Error("NO_ADDITIONAL_OFFICE_SOURCE_READ")},
  enablePsalmVerses:true,
  maxDocuments:16,
  readPsalmSource:async(path,language)=>{
   calls.push([path,language]);
   const n=Number(path.slice(path.lastIndexOf("Psalm")+5));
   return {
    sourcePath:substituted?"Psalterium/Psalmorum/Psalm99":path,
    sourceRevision:DIVINUM_OFFICIUM_PIN,language,
    text:language==="fr"&&missingFrench?"":(
     n+":1 "+language+" première ligne du psaume.\n"+
     n+":2 "+language+" deuxième ligne du psaume.")
   };
  }
 });
 return {resolver,calls};
}
test("five exact psalm verse files per language yield 15 traced research components",async()=>{
 const source=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:fixture().readSource
 });
 const v=verses();
 const r=await assembleAdventFirstVespersPsalmodyResearch({
  sourceSequence:source,psalmVerseResolver:v.resolver
 });
 assert.equal(r.status,"FIVE_TRILINGUAL_PSALM_VERSE_COMPONENTS_UNVERIFIED");
 assert.equal(r.fivePsalmsReadFromExactSources,true);
 assert.equal(r.psalmVerseComponents.length,5);
 assert.equal(v.calls.length,15);
 assert.deepEqual(r.psalmVerseComponents.map(x=>x.psalmNumber),psalms);
 assert.equal(r.psalmVerseComponents[0].languages.la.sourceTrace[0].sourceId,
  "Psalterium/Psalmorum/Psalm109#VERSES");
 assert.match(r.psalmVerseComponents[4].languages.fr.psalmVerses,/113:2/);
 assert.equal(r.psalmVerseComponents.every(x=>
   x.exactSourceVersesLocated===true&&x.psalmDoxologyVerified===false&&
   x.liturgicalPlacementVerified===false),true);
 assert.equal(r.requiredAntiphonPlacementVerified,false);
 assert.equal(r.gloriaPatriVerified,false);
 assert.equal(r.translationAlignmentVerified,false);
 assert.equal(r.completeHourVerified,false);
 assert.equal(r.published,false);
});
test("one missing French psalm withholds all five in research",async()=>{
 const source=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:fixture().readSource
 });
 const r=await assembleAdventFirstVespersPsalmodyResearch({
  sourceSequence:source,psalmVerseResolver:verses({missingFrench:true}).resolver
 });
 assert.equal(r.status,"WITHHELD");
 assert.match(r.reason,/OFFICE_AT_PSALM_VERSES_INVALID/);
 assert.equal(r.psalmRowsVerifiedAsSourceCandidates,0);
 assert.equal(r.published,false);
});
test("psalm verse source identity substitution blocks source composition",async()=>{
 const source=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:fixture().readSource
 });
 const r=await assembleAdventFirstVespersPsalmodyResearch({
  sourceSequence:source,psalmVerseResolver:verses({substituted:true}).resolver
 });
 assert.equal(r.status,"WITHHELD");
 assert.match(r.reason,/OFFICE_AT_PSALM_SOURCE_PROVENANCE_OR_SIZE_INVALID/);
});
test("a fabricated source sequence or selected psalm number cannot be assembled",async()=>{
 const source=await reviewAdventFirstVespersSourceSequence({
  handoff:handoff(),readSource:fixture().readSource
 });
 const bad={...source,psalmCandidates:[
  {...source.psalmCandidates[0],number:118},...source.psalmCandidates.slice(1)
 ]};
 const v=verses();
 const r=await assembleAdventFirstVespersPsalmodyResearch({
  sourceSequence:bad,psalmVerseResolver:v.resolver
 });
 assert.equal(r.reason,"OFFICE_FIRST_VESPERS_SOURCE_CANDIDATE_CHANGED");
 assert.equal(v.calls.length,0);
});
