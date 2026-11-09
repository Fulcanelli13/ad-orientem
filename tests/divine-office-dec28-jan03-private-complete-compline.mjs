import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {assembleDec28Jan03PrivateOfficeResearchReview,
 assemblePrivateOfficeReview,assembleChristmas2026PrivateOfficeResearchReview}
 from "../src/office/private-office-review.js";
import {createComplinePinnedReader,
 createChristmas2026PrivateLatinPinnedReader,
 createDec28Jan03PrivateLatinPinnedReader}
 from "../src/office/saturday-compline-2026-pilot.js";
import {DEC28_JAN03_FINITE_DATES,reviewDec28Jan03ComplineResearch}
 from "../src/office/compline-dec28-jan03-2027-source-gate.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER,projectComplineRecitation}
 from "../src/office/compline-recitation-projection.js";
import {latinComplineReleaseEligibility,loadPublishedLatinCompline}
 from "../src/office/latin-compline-public-release.js";
const fixture=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const sunday=fixture("advent-i-week-compline");
const saturday=fixture("advent-i-saturday-compline");
const marian=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const intake=JSON.parse(readFileSync(new URL(
 "../data/office/research/compline-dec28-jan03-2027-source-intake.v1.json",
 import.meta.url),"utf8"));
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
function source(){
 const calls=[];
 const fetchSource=async url=>{
  assert.ok(url.startsWith(BASE),"Unexpected source URL "+url);
  calls.push(url);
  const relative=decodeURIComponent(url.slice(BASE.length));
  assert.match(relative,/\.txt$/u);
  const id=relative.slice(0,-4);
  let raw;
  if(id==="Psalterium/Mariaant")raw=marian;
  else if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   raw=[87,102,233].includes(n)?saturday.psalms[n]:sunday.psalms[n]?.text;
  }else if(saturday.sections[id])
   raw=Object.entries(saturday.sections[id]).map(([title,lines])=>
    "["+title+"]\n"+lines.join("\n")).join("\n\n")+"\n";
  assert.equal(typeof raw,"string","Missing pinned Latin original "+id);
  return {ok:true,status:200,url,text:async()=>raw};
 };
 return {calls,fetchSource};
}
test("source-fed complete 28 PRIVATE Latin variants cover seven fixed dates, two contexts and ministers",async()=>{
 assert.equal(intake.dates.length,7);
 assert.deepEqual(intake.dates.map(r=>r.date),DEC28_JAN03_FINITE_DATES);
 for(const record of intake.dates){
  const checked=reviewDec28Jan03ComplineResearch({date:record.date,record});
  assert.equal(checked.status,"FINITE_OFFICE_ORDO_SOURCE_RESEARCH_ONLY");
  assert.equal(checked.calendarSelectionAuthorized,false);
  const expected=record.psalmIds;
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    const transport=source();
    const privateReview=await assembleDec28Jan03PrivateOfficeResearchReview({
     date:record.date,fetchSource:transport.fetchSource
    });
    assert.equal(privateReview.status,"PRIVATE_SOURCE_TEXT_REVIEW",
     record.date+" "+context+" "+minister+" "+privateReview.reason);
    assert.equal(privateReview.officeDate,record.officeDate);
    assert.equal(privateReview.civilDate,record.date);
    assert.equal(privateReview.eventCount,42);
    assert.deepEqual(privateReview.availableLanguages,["la"]);
    assert.equal(privateReview.rightsApproved,false);
    assert.equal(privateReview.published,false);
    const r=projectComplineRecitation(privateReview,{context,minister});
    assert.equal(r.status,"PRIVATE_SOURCE_TEXT_REVIEW",record.date+" "+r.reason);
    assert.equal(r.readingEventCount,40);
    assert.equal(r.sourceEventCount,42);
    assert.equal(r.printedPsalmDisplayFrames,record.printedPsalmFrames);
    assert.equal(r.frames.filter(x=>x.kind==="PSALM").length,record.printedPsalmFrames);
    const sourcePsalmEvents=r.events.filter(x=>x.kind==="PSALM")
     .map(e=>Number(/^Psalterium\/Psalmorum\/Psalm(\d+)/u.exec(e.sourceId)?.[1]));
    assert.deepEqual(sourcePsalmEvents,expected,
     "Holy Name II-class Compline is Sunday even after First Vespers");
    assert.equal(r.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(r.presidingMinister,minister);
    assert.equal(r.openingPaterOmitted,context===COMPLINE_CONTEXT.FINAL_PRAYER);
    const marianFrame=r.frames.find(x=>x.kind==="MARIAN_ANTIPHON");
    const collectFrame=r.frames.find(x=>x.kind==="MARIAN_COLLECT");
    assert.equal(marianFrame.sourceId,"Psalterium/Mariaant#Nativiti");
    assert.equal(collectFrame.sourceId,"Psalterium/Mariaant#Nativiti:Oratio");
    assert.match(marianFrame.texts.la.join(" "),/Post partum, Virgo/u);
    assert.match(collectFrame.texts.la.join(" "),/Deus, qui salútis ætérnæ/u);
    assert.doesNotMatch(marianFrame.texts.la.join(" "),/Ángelus Dómini/u);
    assert.equal(r.liturgicallyCertified,false);
    assert.equal(r.publishable,false);
    assert.equal(r.published,false);
    assert.ok(transport.calls.length>=7);
    assert.ok(transport.calls.every(url=>url.startsWith(BASE)));
   }
  }
 }
});
test("new finite private entry cannot leak into generic or earlier Christmas private reader",async()=>{
 for(const date of DEC28_JAN03_FINITE_DATES){
  let calls=0;
  const fetchSource=async()=>{calls++;throw Error("SOURCE_BEFORE_AUTHORIZATION")};
  const ordinary=await assemblePrivateOfficeReview({
   hour:"COMPLINE",date,fetchSource,languageMode:"latin"
  });
  const oldChristmas=await assembleChristmas2026PrivateOfficeResearchReview({
   date,fetchSource
  });
  assert.equal(ordinary.status,"WITHHELD");
  assert.equal(oldChristmas.status,"WITHHELD");
  assert.throws(()=>createComplinePinnedReader({
   date,fetchSource,languages:["la"]
  }),/COMPLINE_UNREVIEWED_DATE_READER_WITHHELD/);
  assert.throws(()=>createChristmas2026PrivateLatinPinnedReader({
   date,fetchSource
  }),/CHRISTMAS_PRIVATE_RESEARCH_DATE_UNREVIEWED/);
  const isolated=createDec28Jan03PrivateLatinPinnedReader({
   date,fetchSource
  });
  assert.equal(isolated.date,date);
  assert.equal(calls,0);
 }
 assert.throws(()=>createDec28Jan03PrivateLatinPinnedReader({
  date:"2027-01-04",fetchSource:async()=>{}
 }),/YEAR_BOUNDARY_PRIVATE_COMPLINE_DATE_NOT_REVIEWED/);
});
test("private Latin review keeps source/publishing flags false despite separate public authorization",async()=>{
 for(const date of DEC28_JAN03_FINITE_DATES){
  const t=source();
  const r=await assembleDec28Jan03PrivateOfficeResearchReview({
   date,fetchSource:t.fetchSource
  });
  assert.equal(r.status,"PRIVATE_SOURCE_TEXT_REVIEW");
  assert.equal(r.published,false);
  assert.equal(r.liturgicallyCertified,false);
  assert.equal(r.rightsApproved,false);
  assert.equal(latinComplineReleaseEligibility({date}).status,"ELIGIBLE");
 }
});
