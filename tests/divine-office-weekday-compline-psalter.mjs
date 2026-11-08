import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {planWeeklyComplinePsalter,COMPLINE_PSALTER_WEEKDAYS,
 COMPLINE_MARIAN_SOURCE_SECTIONS}
 from "../src/office/weekday-compline-psalter-plan.js";
import {createFerialTuesdayComplinePinnedReader,
 assembleFerialTuesdayComplinePilot,
 FERIAL_COMPLINE_PILOT_SCHEMA}
 from "../src/office/saturday-compline-2026-pilot.js";
const saturday=Object.fromEntries(["la","en","fr"].map(lang=>[
 lang,JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/advent-i-saturday-compline-"+lang+".json",
 import.meta.url),"utf8"))]));
const tuesday=Object.fromEntries(["la","en","fr"].map(lang=>[
 lang,JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/advent-i-feria-iii-compline-"+lang+".json",
 import.meta.url),"utf8"))]));
const psalmi=Object.fromEntries(["la","en","fr"].map(lang=>[
 lang,saturday[lang].sections["Psalterium/Psalmi/Psalmi minor"].Completorium]));
const expected=[
 ["Dominica","4,90,133"],
 ["Feria II","6,7(2-10),7(11-18)"],
 ["Feria III","11,12,15"],
 ["Feria IV","33(2-11),33(12-23),60"],
 ["Feria V","69,70(1-12),70(13-24)"],
 ["Feria VI","76(2-13),76(14-21),85"],
 ["Sabbato","87,102(1-12),102(13-22)"]
];
const weekdayReader={
 sourceRevision:PIN,weekday:"Feria III",
 async section(path,name,language){
  const value=saturday[language].sections[path]?.[name];
  if(!Array.isArray(value))throw Error("FERIAL_SOURCE_SECTION_MISSING:"+path+"#"+name);
  return [...value];
 },
 async psalm(n,lang){
  return n===233?saturday[lang].psalms[233]:
   tuesday[lang].psalms[n]?.text;
 }
};
test("seven Roman weekday Compline psalter patterns are source-backed in all three languages",()=>{
 assert.deepEqual(COMPLINE_PSALTER_WEEKDAYS,expected.map(x=>x[0]));
 assert.deepEqual(COMPLINE_MARIAN_SOURCE_SECTIONS,
  ["Advent","Nativiti","Quadragesimae","Paschalis","Postpentecost"]);
 for(const [weekday,psalms] of expected){
  const r=planWeeklyComplinePsalter({
   weekday,marianSection:"Advent",sourceSections:psalmi
  });
  assert.equal(r.status,
   "SOURCE_FIRST_WEEKDAY_PSALTER_APPOINTMENT_RESEARCH_ONLY",r.reason);
  assert.equal(r.originalPinnedPsalmSpecification,psalms);
  assert.equal(r.segments.length,3);
  assert.equal(r.sourceRevision,PIN);
  assert.equal(r.appointmentVerified,false);
  assert.equal(r.publishable,false);
  for(const lang of ["la","en","fr"]){
   assert.ok(r.antiphons[lang].length>8);
  }
 }
});
test("ferial Tuesday Compline produces 42 complete tri-language source blocks and exact psalm 11/12/15",async()=>{
 const p=await assembleFerialTuesdayComplinePilot({reader:weekdayReader});
 assert.equal(p.status,
  "SOURCE_FIRST_FERIAL_TUESDAY_COMPLINE_RESEARCH_NOT_CERTIFIED",p.reason);
 assert.equal(p.schema,FERIAL_COMPLINE_PILOT_SCHEMA);
 assert.equal(p.civilDate,"2026-12-01");
 assert.equal(p.officeDate,"2026-12-01");
 assert.equal(p.weekday,"Feria III");
 assert.equal(p.marianSection,"Advent");
 assert.equal(p.rubricalAppointment,"ADVENT_I_FERIA_III_OFFICE_BR170_171_E");
 assert.equal(p.blockCount,42);
 assert.equal(p.sourceDocumentsPerLanguage,8);
 assert.deepEqual(p.blocks.filter(x=>x.kind==="PSALM").map(x=>x.sourceId),[
  "Psalterium/Psalmorum/Psalm11#2-9",
  "Psalterium/Psalmorum/Psalm12#1-6",
  "Psalterium/Psalmorum/Psalm15#1-11"
 ]);
 const ps12=p.blocks.find(x=>x.sourceId==="Psalterium/Psalmorum/Psalm12#1-6");
 assert.ok(ps12.texts.la.some(x=>x.startsWith("12:6b ")),
  "Psalm 12:6b must not be dropped by the numeric verse parser");
 assert.ok(p.blocks.filter(x=>x.kind==="PSALM").every(x=>
  ["la","en","fr"].every(lang=>x.texts[lang].length===x.texts.la.length)));
 assert.match(p.blocks.find(x=>x.kind==="ANTIPHON").texts.la[0],/Tu, Dómine/);
 assert.match(p.blocks.find(x=>x.kind==="MARIAN_ANTIPHON").texts.la.join(" "),/Alma Redemptóris/);
 assert.equal(p.frames.length>p.blocks.length,true);
 assert.equal(p.officeCompletenessCertified,false);
 assert.equal(p.rightsApproved,false);
 assert.equal(p.publishable,false);
 assert.equal(p.published,false);
});
test("unmatched weekday psalter and broken translations withhold the entire Tuesday Hour",async()=>{
 for(const breakReader of [
  { ...weekdayReader,async section(path,name,lang){
   if(path==="Psalterium/Psalmi/Psalmi minor"&&lang==="fr")
    return ["Feria III = not the right antiphon","11,12,15"];
   return weekdayReader.section(path,name,lang);
  }},
  { ...weekdayReader,async psalm(n,lang){
   if(n===12&&lang==="en")
    return tuesday.en.psalms[12].text.replace(/12:6b [^\n]*/u,"");
   return weekdayReader.psalm(n,lang);
  }},
  { ...weekdayReader,async psalm(n,lang){
   if(n===15&&lang==="fr")return "";
   return weekdayReader.psalm(n,lang);
  }}
 ]){
  const p=await assembleFerialTuesdayComplinePilot({reader:breakReader});
  assert.equal(p.status,"WITHHELD");
  assert.equal(p.blocks.length,0);
  assert.equal(p.published,false);
 }
});
test("Tuesday source transport reads 24 pinned originals, no extra psalm and no new network service",async()=>{
 const calls=[];
 const reader=createFerialTuesdayComplinePinnedReader({
  fetchSource:async (url,init)=>{
   calls.push(url);
   assert.equal(init.credentials,"omit");
   assert.match(url,new RegExp(PIN,"u"));
   const match=/\/(Latin|English|Francais)\/(.+)\.txt$/u.exec(url);
   assert.ok(match);
   const lang={Latin:"la",English:"en",Francais:"fr"}[match[1]];
   const path=decodeURIComponent(match[2]);
   let body;
   if(path.startsWith("Psalterium/Psalmorum/Psalm")){
    const n=Number(path.match(/Psalm(\d+)$/u)?.[1]);
    body=n===233?saturday[lang].psalms[n]:tuesday[lang].psalms[n]?.text;
   }else{
    const sections=saturday[lang].sections[path];
    assert.ok(sections);
    body=Object.entries(sections).map(([name,lines])=>
     "["+name+"]\n"+lines.join("\n")).join("\n\n");
   }
   assert.ok(body?.length);
   return {ok:true,status:200,url,text:async()=>body};
  }
 });
 const r=await assembleFerialTuesdayComplinePilot({reader});
 assert.equal(r.status,"SOURCE_FIRST_FERIAL_TUESDAY_COMPLINE_RESEARCH_NOT_CERTIFIED",r.reason);
 assert.equal(reader.cachedDistinctFiles(),24);
 assert.equal(new Set(calls).size,24);
 await assert.rejects(reader.psalm(102,"la"),/NOT_ALLOWED/);
 await assert.rejects(reader.psalm(87,"fr"),/NOT_ALLOWED/);
 assert.equal(r.publishable,false);
});
test("unknown Marian season and weekday variants fail rather than guessing",()=>{
 const noSeason=planWeeklyComplinePsalter({
  weekday:"Feria III",marianSection:"Easter?",
  sourceSections:psalmi});
 assert.equal(noSeason.status,"WITHHELD");
 assert.equal(noSeason.publishable,false);
 const noDay=planWeeklyComplinePsalter({
  weekday:"Feria VIII",marianSection:"Advent",
  sourceSections:psalmi});
 assert.equal(noDay.status,"WITHHELD");
});
