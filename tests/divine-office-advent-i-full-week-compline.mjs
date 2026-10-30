import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {ADVENT_I_COMPLINE_APPOINTMENTS,reviewAdventIComplineAppointment}
 from "../src/office/compline-advent-2026-appointments.js";
import {assembleDatedComplinePilot,createComplinePinnedReader}
 from "../src/office/saturday-compline-2026-pilot.js";
const fixtures={};
for(const lang of ["la","en","fr"]){
 const load=file=>JSON.parse(readFileSync(new URL(
  "../tests/fixtures/office/"+file+"-"+lang+".json",import.meta.url),"utf8"));
 const saturday=load("advent-i-saturday-compline");
 const tuesday=load("advent-i-feria-iii-compline");
 const rest=load("advent-i-week-compline");
 assert.equal(tuesday.sourceRevision,PIN);
 assert.equal(rest.sourceRevision,PIN);
 fixtures[lang]={saturday,tuesday,rest};
}
const expected=[
 ["2026-11-28","Sabbato",[87,102,102]],
 ["2026-11-29","Dominica",[4,90,133]],
 ["2026-11-30","Dominica",[4,90,133]],
 ["2026-12-01","Feria III",[11,12,15]],
 ["2026-12-02","Feria IV",[33,33,60]],
 ["2026-12-03","Feria V",[69,70,70]],
 ["2026-12-04","Feria VI",[76,76,85]],
 ["2026-12-05","Sabbato",[87,102,102]]
];
function reader(date){
 const appointment=reviewAdventIComplineAppointment(date).appointment;
 return {
  sourceRevision:PIN,weekday:appointment.psalmDay,date,
  async section(path,name,language){
   const value=fixtures[language].saturday.sections[path]?.[name];
   if(!Array.isArray(value))throw Error("MISSING_PINNED_SECTION:"+path+"#"+name);
   return [...value];
  },
  async psalm(number,language){
   const f=fixtures[language];
   if(number===233||number===87||number===102)
    return f.saturday.psalms[number];
   if([11,12,15].includes(number))return f.tuesday.psalms[number].text;
   return f.rest.psalms[number]?.text;
  }
 };
}
test("all eight Advent I Compline dates have an explicit rubric, real civil weekday and source-backed psalm profile",()=>{
 assert.equal(ADVENT_I_COMPLINE_APPOINTMENTS.length,8);
 for(const [date,day] of expected){
  const r=reviewAdventIComplineAppointment(date);
  assert.equal(r.status,"EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH");
  assert.equal(r.appointment.psalmDay,day);
  assert.equal(r.appointment.marianSection,"Advent");
  assert.match(r.appointment.rubricalReason,/(BR166_B|BR166_H|BR168_D|BR169_E|BR171_E)$/u);
  assert.equal(r.completeHourCertified,undefined);
  assert.equal(r.published,false);
 }
 const monday=reviewAdventIComplineAppointment("2026-11-30").appointment;
 assert.equal(monday.weekday,"Feria II");
 assert.equal(monday.psalmDay,"Dominica","St Andrew II class requires Sunday Compline");
 assert.equal(monday.officeClass,"II_FEAST");
 for(const date of ["2026-12-06","2026-12-07","2026-12-08","2027-11-29"]){
  const r=reviewAdventIComplineAppointment(date);
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.appointment,null);
 }
});
test("each of eight appointed dates assembles original Latin, English and French in the same reusable 42-block Compline",async()=>{
 for(const [date,psalmDay,ids] of expected){
  const result=await assembleDatedComplinePilot({reader:reader(date),date});
  assert.match(result.status,/^SOURCE_FIRST_(?:SATURDAY|FERIAL_TUESDAY|APPOINTED)_COMPLINE_RESEARCH_NOT_CERTIFIED$/u,
   date+": "+result.reason);
  assert.equal(result.civilDate,date);
  assert.equal(result.officeDate,date);
  assert.equal(result.weekday,psalmDay);
  assert.equal(result.blockCount,42);
  assert.equal(result.sourceDocumentsPerLanguage,4+new Set([...ids,233]).size);
  assert.deepEqual(result.blocks.filter(x=>x.kind==="PSALM")
   .map(x=>Number(/Psalm(\d+)#/u.exec(x.sourceId)[1])),ids,date);
  assert.equal(result.blocks.filter(x=>x.kind==="DOXOLOGY").length,4);
  assert.equal(result.blocks.filter(x=>x.kind==="MARIAN_ANTIPHON").length,1);
  assert.ok(result.focusFrameCount>result.blockCount);
  for(const item of result.blocks){
   assert.equal(item.originalSourceOnly,true);
   for(const lang of ["la","en","fr"]){
    assert.ok(item.texts[lang].length&&item.texts[lang].every(x=>x.trim()));
   }
  }
  assert.equal(result.officeCompletenessCertified,false);
  assert.equal(result.rightsApproved,false);
  assert.equal(result.publishable,false);
  assert.equal(result.published,false);
 }
});
test("St Andrew is appointed Sunday Compline and Advent III-class feasts use their ferial psalms",async()=>{
 for(const [date,psalm] of [
  ["2026-11-30","Psalm4"],
  ["2026-12-02","Psalm33"],
  ["2026-12-03","Psalm69"],
  ["2026-12-04","Psalm76"]
 ]){
  const r=await assembleDatedComplinePilot({date,reader:reader(date)});
  assert.notEqual(r.status,"WITHHELD",r.reason);
  assert.ok(r.blocks.find(b=>b.kind==="PSALM").sourceId.includes(psalm));
 }
});
test("date mismatches and unknown dates cannot borrow an existing Office",async()=>{
 const wrong=await assembleDatedComplinePilot({
  reader:reader("2026-12-02"),date:"2026-12-03"
 });
 assert.equal(wrong.status,"WITHHELD");
 assert.equal(wrong.blocks.length,0);
 for(const date of ["2026-12-06","2026-12-08"]){
  const held=await assembleDatedComplinePilot({
   reader:reader("2026-12-02"),date
  });
  assert.equal(held.status,"WITHHELD");
  assert.equal(held.published,false);
  assert.throws(()=>createComplinePinnedReader({
   date,fetchSource:async()=>null
  }),/WITHHELD/);
 }
});
test("a truncated French psalm refuses the entire affected Compline",async()=>{
 const date="2026-12-03",good=reader(date);
 const invalid={
  ...good,
  async psalm(n,lang){
   const content=await good.psalm(n,lang);
   return n===70&&lang==="fr"?content.slice(0,12):content;
  }
 };
 const p=await assembleDatedComplinePilot({date,reader:invalid});
 assert.equal(p.status,"WITHHELD");
 assert.equal(p.blocks.length,0);
 assert.equal(p.publishable,false);
});
