import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {assembleJan04_10PrivateOfficeResearchReview,
 assemblePrivateOfficeReview,
 assembleDec28Jan03PrivateOfficeResearchReview}
 from "../src/office/private-office-review.js";
import {createComplinePinnedReader,
 createJan04_10PrivateLatinPinnedReader}
 from "../src/office/saturday-compline-2026-pilot.js";
import {JAN04_10_DATES,reviewJan04_10ComplineSource}
 from "../src/office/compline-epiphany-jan04-10-2027-source-gate.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER,projectComplineRecitation}
 from "../src/office/compline-recitation-projection.js";
import {latinComplineReleaseEligibility,loadPublishedLatinCompline}
 from "../src/office/latin-compline-public-release.js";
const fixture=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const saturday=fixture("advent-i-saturday-compline");
const monday=fixture("advent-iii-feria-ii-compline");
const week=fixture("advent-i-week-compline");
const marian=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const ledger=JSON.parse(readFileSync(new URL(
 "../data/office/research/compline-epiphany-jan04-10-2027-source-intake.v1.json",
 import.meta.url),"utf8"));
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
const source=()=>{
 const calls=[];
 const fetchSource=async url=>{
  assert.ok(url.startsWith(BASE),"Epiphany private source not pinned: "+url);
  calls.push(url);
  const rel=decodeURIComponent(url.slice(BASE.length));
  assert.match(rel,/\.txt$/u);
  const id=rel.slice(0,-4);
  let raw;
  if(id==="Psalterium/Mariaant")raw=marian;
  else if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   raw=[6,7].includes(n)?monday.psalms[n]?.text:
    [87,102,233].includes(n)?saturday.psalms[n]:
    week.psalms[n]?.text;
  }else if(saturday.sections[id]){
   raw=Object.entries(saturday.sections[id]).map(([key,lines])=>
    "["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n";
  }
  assert.equal(typeof raw,"string","Missing pinned Latin source "+id);
  return {ok:true,status:200,url,text:async()=>raw};
 };
 return {calls,fetchSource};
};
const expected=[
 ["2027-01-04","Feria II","2027-01-04",28,[6,7,7]],
 ["2027-01-05","Dominica","2027-01-06",30,[4,90,133]],
 ["2027-01-06","Dominica","2027-01-06",30,[4,90,133]],
 ["2027-01-07","Feria V","2027-01-07",33,[69,70,70]],
 ["2027-01-08","Feria VI","2027-01-08",36,[76,76,85]],
 ["2027-01-09","Dominica","2027-01-10",30,[4,90,133]],
 ["2027-01-10","Dominica","2027-01-10",30,[4,90,133]]
];
test("7 dated Jan 2027 source profiles and source-read rights are research only",()=>{
 assert.deepEqual(expected.map(x=>x[0]),JAN04_10_DATES);
 for(const [date,psalms,officeDate,frames,events] of expected){
  const record=ledger.dates.find(r=>r.date===date);
  const reviewed=reviewJan04_10ComplineSource({date,record});
  assert.equal(reviewed.status,"FINITE_EPIPHANY_2027_DATED_ORDO_RESEARCH_ONLY");
  assert.equal(reviewed.appointment.officeDate,officeDate);
  assert.equal(reviewed.appointment.psalmDay,psalms);
  assert.equal(reviewed.appointment.printedPsalmFrames,frames);
  assert.deepEqual(reviewed.appointment.psalmIds,[...new Set(events)]);
  assert.equal(reviewed.sourceTextCertified,false);
  assert.equal(reviewed.published,false);
  assert.equal(latinComplineReleaseEligibility({date}).status,
   "ELIGIBLE");
 }
});
test("28 private source-backed Latin Compline recitations cover Epiphany and Holy Family",async()=>{
 for(const [date,psalmDay,officeDate,verseFrames,events] of expected){
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    const t=source();
    const original=await assembleJan04_10PrivateOfficeResearchReview({
     date,fetchSource:t.fetchSource
    });
    assert.equal(original.status,"PRIVATE_SOURCE_TEXT_REVIEW",
     date+" "+original.reason);
    assert.equal(original.civilDate,date);
    assert.equal(original.officeDate,officeDate);
    assert.equal(original.eventCount,42);
    assert.deepEqual(original.availableLanguages,["la"]);
    assert.equal(original.published,false);
    assert.equal(original.rightsApproved,false);
    const r=projectComplineRecitation(original,{context,minister});
    assert.equal(r.status,"PRIVATE_SOURCE_TEXT_REVIEW",date+" "+r.reason);
    assert.equal(r.sourceEventCount,42);
    assert.equal(r.readingEventCount,40);
    assert.equal(r.printedPsalmDisplayFrames,verseFrames);
    assert.equal(r.frames.filter(x=>x.kind==="PSALM").length,verseFrames);
    assert.deepEqual(r.events.filter(x=>x.kind==="PSALM")
     .map(x=>Number(/^Psalterium\/Psalmorum\/Psalm(\d+)/u.exec(x.sourceId)?.[1])),
      events,date+" incorrect Latin psalm source events");
    assert.equal(r.presidingMinister,minister);
    assert.equal(r.openingPaterOmitted,
     context===COMPLINE_CONTEXT.FINAL_PRAYER);
    assert.equal(r.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(r.ministerDialoguesResolved,2);
    assert.equal(r.frames.find(x=>x.kind==="MARIAN_ANTIPHON")?.sourceId,
     "Psalterium/Mariaant#Nativiti");
    assert.equal(r.frames.find(x=>x.kind==="MARIAN_COLLECT")?.sourceId,
     "Psalterium/Mariaant#Nativiti:Oratio");
    assert.match(r.frames.find(x=>x.kind==="MARIAN_ANTIPHON").texts.la.join(" "),
     /Post partum, Virgo/u);
    assert.match(r.frames.find(x=>x.kind==="MARIAN_COLLECT").texts.la.join(" "),
     /Deus, qui salútis ætérnæ/u);
    assert.equal(r.liturgicallyCertified,false);
    assert.equal(r.published,false);
    assert.equal(r.publishable,false);
    assert.ok(t.calls.length>=7);
   }
  }
 }
});
test("generic and former private adapters stay restricted to earlier dates",async()=>{
 for(const date of JAN04_10_DATES){
  let count=0;
  const fetchSource=async()=>{count++;throw Error("FETCH_NOT_ALLOWED")};
  assert.equal((await assemblePrivateOfficeReview({
   hour:"COMPLINE",date,fetchSource,languageMode:"latin"
  })).status,"WITHHELD");
  assert.equal((await assembleDec28Jan03PrivateOfficeResearchReview({
   date,fetchSource
  })).status,"WITHHELD");
  assert.throws(()=>createComplinePinnedReader({
   date,fetchSource,languages:["la"]
  }),/COMPLINE_UNREVIEWED_DATE_READER_WITHHELD/);
  const allowed=createJan04_10PrivateLatinPinnedReader({date,fetchSource});
  assert.equal(allowed.date,date);
  assert.equal(count,0);
 }
 assert.throws(()=>createJan04_10PrivateLatinPinnedReader({
  date:"2027-01-11",fetchSource:async()=>{}
 }),/EPIPHANY_PRIVATE_DATE_NOT_REVIEWED/);
});
test("private source-research status remains unchanged despite separate Holy Family release",async()=>{
 for(const date of ["2027-01-09","2027-01-10"]){
  const t=source();
  const r=await assembleJan04_10PrivateOfficeResearchReview({
   date,fetchSource:t.fetchSource
  });
  assert.equal(r.status,"PRIVATE_SOURCE_TEXT_REVIEW");
  assert.equal(r.liturgicallyCertified,false);
  assert.equal(r.published,false);
  assert.equal(r.rightsApproved,false);
  assert.equal(latinComplineReleaseEligibility({date}).status,"ELIGIBLE");
 }
});
