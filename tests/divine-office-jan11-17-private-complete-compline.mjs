import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {createJan11_17PrivateLatinPinnedReader,
 createComplinePinnedReader} from "../src/office/saturday-compline-2026-pilot.js";
import {assembleJan11_17PrivateOfficeResearchReview,
 assemblePrivateOfficeReview,assembleJan04_10PrivateOfficeResearchReview}
 from "../src/office/private-office-review.js";
import {JAN11_17_CIVIL_DATES,reviewJan11_17OfficeSource}
 from "../src/office/compline-jan11-17-2027-source-gate.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER,
 projectComplineRecitation}
 from "../src/office/compline-recitation-projection.js";
import {latinComplineReleaseEligibility,loadPublishedLatinCompline}
 from "../src/office/latin-compline-public-release.js";

const fixture=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const sat=fixture("advent-i-saturday-compline");
const weekday=fixture("advent-i-week-compline");
const tuesday=fixture("advent-i-feria-iii-compline");
const monday=fixture("advent-iii-feria-ii-compline");
const marian=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const ledger=JSON.parse(readFileSync(new URL(
 "../data/office/research/compline-jan11-17-2027-source-intake.v1.json",
 import.meta.url),"utf8"));
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
const EXPECTED=[
 ["2027-01-11","Feria II","2027-01-11",28,[6,7,7]],
 ["2027-01-12","Feria III","2027-01-12",26,[11,12,15]],
 ["2027-01-13","Dominica","2027-01-13",30,[4,90,133]],
 ["2027-01-14","Feria V","2027-01-14",33,[69,70,70]],
 ["2027-01-15","Feria VI","2027-01-15",36,[76,76,85]],
 ["2027-01-16","Sabbato","2027-01-17",41,[87,102,102]],
 ["2027-01-17","Dominica","2027-01-17",30,[4,90,133]]
];
function source(){
 const calls=[];
 const fetchSource=async url=>{
  assert.ok(url.startsWith(BASE),"Only pinned original Latin is allowed "+url);
  calls.push(url);
  const id=decodeURIComponent(url.slice(BASE.length)).replace(/\.txt$/u,"");
  let raw;
  if(id==="Psalterium/Mariaant")raw=marian;
  else if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   raw=[6,7].includes(n)?monday.psalms[n]?.text:
    [11,12,15].includes(n)?tuesday.psalms[n]?.text:
    [87,102,233].includes(n)?sat.psalms[n]:
    weekday.psalms[n]?.text;
  }else if(sat.sections[id])
   raw=Object.entries(sat.sections[id]).map(([name,lines])=>
    "["+name+"]\n"+lines.join("\n")).join("\n\n")+"\n";
  assert.equal(typeof raw,"string","Missing source leaf "+id);
  return {ok:true,status:200,url,text:async()=>raw};
 };
 return {calls,fetchSource};
}
test("11–17 January source registry never certifies an unsupported public date",()=>{
 assert.deepEqual(EXPECTED.map(x=>x[0]),JAN11_17_CIVIL_DATES);
 for(const [date,day,officeDate,focus,events] of EXPECTED){
  const record=ledger.dates.find(x=>x.date===date);
  const q=reviewJan11_17OfficeSource({date,record});
  assert.equal(q.status,"FINITE_POST_EPIPHANY_2027_DATED_OFFICE_SOURCE_RESEARCH_ONLY");
  assert.equal(q.appointment.psalmDay,day);
  assert.equal(q.appointment.officeDate,officeDate);
  assert.equal(q.appointment.printedPsalmFrames,focus);
  assert.deepEqual(q.appointment.psalmIds,[...new Set(events)]);
  assert.equal(q.sourceTextCertified,false);
  assert.equal(q.published,false);
  assert.equal(latinComplineReleaseEligibility({date}).status,"WITHHELD");
 }
});
test("28 private original-source recitations cover Baptism, First Vespers and weekdays",async()=>{
 for(const [date,day,officeDate,count,events] of EXPECTED){
  for(const context of Object.values(COMPLINE_CONTEXT))
   for(const minister of Object.values(COMPLINE_MINISTER)){
    const t=source();
    const original=await assembleJan11_17PrivateOfficeResearchReview({
     date,fetchSource:t.fetchSource
    });
    assert.equal(original.status,"PRIVATE_SOURCE_TEXT_REVIEW",
     date+" "+original.reason);
    assert.equal(original.civilDate,date);
    assert.equal(original.officeDate,officeDate);
    assert.equal(original.eventCount,42);
    assert.deepEqual(original.availableLanguages,["la"]);
    const r=projectComplineRecitation(original,{context,minister});
    assert.equal(r.status,"PRIVATE_SOURCE_TEXT_REVIEW",date+" "+r.reason);
    assert.equal(r.sourceEventCount,42);
    assert.equal(r.readingEventCount,40);
    assert.equal(r.printedPsalmDisplayFrames,count);
    assert.equal(r.frames.filter(x=>x.kind==="PSALM").length,count);
    assert.deepEqual(r.events.filter(x=>x.kind==="PSALM")
     .map(x=>Number(/^Psalterium\/Psalmorum\/Psalm(\d+)/u.exec(x.sourceId)?.[1])),
     events,"Wrong original Psalm portions "+date);
    const antiphon=r.frames.find(x=>x.kind==="MARIAN_ANTIPHON");
    const collect=r.frames.find(x=>x.kind==="MARIAN_COLLECT");
    assert.equal(antiphon.sourceId,"Psalterium/Mariaant#Nativiti");
    assert.equal(collect.sourceId,"Psalterium/Mariaant#Nativiti:Oratio");
    assert.match(antiphon.texts.la.join(" "),/Post partum, Virgo/u);
    assert.match(collect.texts.la.join(" "),/Deus, qui salútis ætérnæ/u);
    assert.equal(r.presidingMinister,minister);
    assert.equal(r.openingPaterOmitted,
     context===COMPLINE_CONTEXT.FINAL_PRAYER);
    assert.equal(r.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(r.ministerDialoguesResolved,2);
    assert.equal(r.liturgicallyCertified,false);
    assert.equal(r.rightsApproved,false);
    assert.equal(r.published,false);
    assert.equal(r.publishable,false);
    assert.ok(t.calls.length>=7);
   }
 }
});
test("separate private entry requires finite Jan11–17 and cannot leak through older paths",async()=>{
 for(const date of JAN11_17_CIVIL_DATES){
  let requests=0;
  const fetchSource=async()=>{requests++;throw Error("SOURCE_FETCH_FORBIDDEN")};
  assert.equal((await assemblePrivateOfficeReview({
   hour:"COMPLINE",date,fetchSource,languageMode:"latin"
  })).status,"WITHHELD");
  assert.equal((await assembleJan04_10PrivateOfficeResearchReview({
   date,fetchSource
  })).status,"WITHHELD");
  assert.throws(()=>createComplinePinnedReader({date,fetchSource,languages:["la"]}),
   /COMPLINE_UNREVIEWED_DATE_READER_WITHHELD/);
  const reader=createJan11_17PrivateLatinPinnedReader({date,fetchSource});
  assert.equal(reader.date,date);
  assert.equal(requests,0);
 }
 for(const date of ["2027-01-10","2027-01-18"])
  assert.throws(()=>createJan11_17PrivateLatinPinnedReader({
   date,fetchSource:async()=>{}
  }),/JAN11_17_PRIVATE_DATE_NOT_REVIEWED/);
});
test("28 public 11–17 January source requests remain withheld before fetch",async()=>{
 for(const date of JAN11_17_CIVIL_DATES)
  for(const context of Object.values(COMPLINE_CONTEXT))
   for(const minister of Object.values(COMPLINE_MINISTER)){
    let n=0;
    const r=await loadPublishedLatinCompline({
     date,context,minister,
     fetchSource:async()=>{n++;throw Error("RESEARCH_ONLY_NOT_PUBLIC")}
    });
    assert.equal(r.status,"WITHHELD");
    assert.equal(r.published,false);
    assert.equal(n,0);
   }
});
