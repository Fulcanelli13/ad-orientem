import test from "node:test";
import assert from "node:assert/strict";
import {DIVINUM_OFFICIUM_PIN} from "../src/app/source-transport-compat.js";
import {ADVENT_VESPERS_REMAINDER_SCHEMA}
 from "../src/office/advent-vespers-remainder-research.js";
import {assembleAdventMagnificatSourceResearch,OFFICE_MAGNIFICAT_SOURCE_SCHEMA}
 from "../src/office/advent-magnificat-source.js";

const pin=DIVINUM_OFFICIUM_PIN,langs=["la","en","fr"];
const psalm="Psalterium/Psalmorum/Psalm232";
const prayers="Psalterium/Common/Prayers";
const headings={
 la:"(Canticum B. Mariæ Virginis * Luc. 1:46-55)",
 en:"(Canticle of_the_Blessed_Virgin * Luke 1:46-55)",
 fr:"(Cantique de la B. Vierge Marie * Lc 1:46-55)"
};
function observation(){
 return {
  schema:ADVENT_VESPERS_REMAINDER_SCHEMA,
  status:"VERSICLE_AND_MAGNIFICAT_ANTIPHON_SOURCES_IDENTIFIED",
  civilDate:"2026-11-28",officeDate:"2026-11-29",
  officePart:"FIRST",sourceRevision:pin,
  appointedOfficeVerified:false,completeHourVerified:false,
  magnficatAntiphonAppointmentVerified:false,
  publishable:false,published:false,
  languages:Object.fromEntries(langs.map(lang=>[lang,{
   magnficatAntiphon:"Antiphon in "+lang,
   antiphonSourceId:"Tempora/Adv1-0#Ant 1"
  }]))
 };
}
const canticle=(lang)=>headings[lang]+"\n"+
 Array.from({length:10},(_,i)=>"1:"+(i+46)+" "+lang+
  " pinned source canticle half verse * second half.").join("\n")+"\n";
function env({mutate=()=>{}}={}){
 const reads=[];
 const readCanticleSource=async(path,language)=>{
  reads.push([path,language]);
  const result={sourceRevision:pin,sourcePath:path,language,
   text:canticle(language)};
  mutate(result);
  return result;
 };
 const readSource=async(path,language)=>{
  reads.push([path,language]);
  const result={sourceRevision:pin,sourcePath:path,language,
   map:new Map([["Gloria",["V. "+language+" Gloria Patri * Sancto",
    "R. "+language+" Sicut erat * Amen."]]])};
  mutate(result);
  return result;
 };
 return {reads,readCanticleSource,readSource};
}
test("exact Gospel canticle psalm 232 and named Gloria are located in each source language",async()=>{
 const s=env();
 const r=await assembleAdventMagnificatSourceResearch({
  sourceObservation:observation(),...s
 });
 assert.equal(r.schema,OFFICE_MAGNIFICAT_SOURCE_SCHEMA);
 assert.equal(r.status,"MAGNIFICAT_THREE_LANGUAGE_SOURCE_COMPONENT_UNVERIFIED");
 assert.equal(r.sourceVerseCountPerLanguage,10);
 assert.equal(r.canticleVersesLocated,true);
 assert.equal(r.sourceDoxologyLocated,true);
 assert.equal(r.languages.la.canticle.verses[0].verse,"Luke 1:46");
 assert.equal(r.languages.fr.canticle.verses[9].verse,"Luke 1:55");
 for(const lang of langs){
  assert.equal(r.languages[lang].sourceVerseCount,10);
  assert.deepEqual(r.languages[lang].sourceTrace.map(x=>x.sourceId),[
   "Tempora/Adv1-0#Ant 1",psalm+"#LUKE_1_46_55",prayers+"#Gloria"
  ]);
 }
 assert.equal(s.reads.length,6);
 assert.equal(r.rubricAntiphonPlacementVerified,false);
 assert.equal(r.appointedOfficeVerified,false);
 assert.equal(r.completeHourVerified,false);
 assert.equal(r.translationAlignmentVerified,false);
 assert.equal(r.publishable,false);
 assert.equal(r.published,false);
});
test("a missing French Magnificat or missing exact Gloria source withholds every locale",async()=>{
 for(const mutate of [
  d=>{if(d.language==="fr"&&"text" in d)d.text=""},
  d=>{if(d.language==="fr"&&"map" in d)d.map.delete("Gloria")}
 ]){
  const s=env({mutate});
  const r=await assembleAdventMagnificatSourceResearch({
   sourceObservation:observation(),...s
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.reason,"OFFICE_MAGNIFICAT_CANTICLE_OR_GLORIA_MISSING:fr");
  assert.equal(r.publishable,false);
 }
});
test("mixed translation, wrong revision or psalm number are rejected",async()=>{
 for(const mutate of [
  d=>{if(d.language==="en")d.sourceRevision="0".repeat(40)},
  d=>{if("text" in d&&d.language==="la")d.text=d.text.replace("1:52","1:62")},
  d=>{if("text" in d&&d.language==="fr")d.text=d.text.replace("1:55","1:54")}
 ]){
  const s=env({mutate});
  const r=await assembleAdventMagnificatSourceResearch({
   sourceObservation:observation(),...s
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.publishable,false);
 }
});
test("a fabricated source observation cannot trigger any source reads",async()=>{
 const s=env();
 const r=await assembleAdventMagnificatSourceResearch({
  sourceObservation:{...observation(),completeHourVerified:true},...s
 });
 assert.equal(r.status,"WITHHELD");
 assert.equal(r.reason,"OFFICE_MAGNIFICAT_SOURCE_OBSERVATION_REQUIRED");
 assert.equal(s.reads.length,0);
});
test("uncertified Magnificat antiphon is never upgraded to an approved Vespers",async()=>{
 const s=env();
 const r=await assembleAdventMagnificatSourceResearch({
  sourceObservation:observation(),...s
 });
 assert.equal(r.languages.la.repeatedAntiphonLiturgicalPositionVerified,false);
 assert.equal(r.languages.en.gloriaUseLiturgicallyAdjudicated,false);
 assert.equal(r.printedEditionCertified,false);
 assert.equal(r.rightsApproved,false);
});
