import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {assembleChristmas2026PrivateOfficeResearchReview}
 from "../src/office/private-office-review.js";
import {projectComplineRecitation,COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";
import {researchChristmas2026PrivateComplineAppointment}
 from "../src/office/compline-christmas-2026-research-gate.js";
import {latinComplineReleaseEligibility,loadPublishedLatinCompline,
 LATIN_COMPLINE_RELEASE} from "../src/office/latin-compline-public-release.js";
import {officeRouteState} from "../src/office/office-route-state.js";

const fixture=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const saturday=fixture("advent-i-saturday-compline");
const tuesday=fixture("advent-i-feria-iii-compline");
const week=fixture("advent-i-week-compline");
const marian=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const base="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
const expected=[
 ["2026-12-21","Dominica","2026-12-21",30,[4,90,133],"Advent"],
 ["2026-12-22","Feria III","2026-12-22",26,[11,12,15],"Advent"],
 ["2026-12-23","Feria IV","2026-12-23",30,[33,33,60],"Advent"],
 ["2026-12-24","Dominica","2026-12-25",30,[4,90,133],"Nativiti"],
 ["2026-12-25","Dominica","2026-12-25",30,[4,90,133],"Nativiti"],
 ["2026-12-26","Dominica","2026-12-26",30,[4,90,133],"Nativiti"],
 ["2026-12-27","Dominica","2026-12-27",30,[4,90,133],"Nativiti"]
];
function latinPinnedTransport(){
 const calls=[];
 const fetchSource=async url=>{
  assert.ok(url.startsWith(base),"Only pinned Latin source is allowed: "+url);
  calls.push(url);
  const relative=decodeURIComponent(url.slice(base.length));
  assert.match(relative,/\.txt$/u);
  const id=relative.slice(0,-4);
  let raw;
  if(id==="Psalterium/Mariaant"){
   raw=marian;
  }else if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const number=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   raw=[87,102,233].includes(number)?saturday.psalms[number]:
    [11,12,15].includes(number)?tuesday.psalms[number]?.text:
    week.psalms[number]?.text;
  }else if(saturday.sections[id]){
   raw=Object.entries(saturday.sections[id])
    .map(([name,rows])=>"["+name+"]\n"+rows.join("\n"))
    .join("\n\n")+"\n";
  }
  assert.equal(typeof raw,"string","Missing original pinned Latin source "+id);
  return {ok:true,status:200,url,text:async()=>raw};
 };
 return {calls,fetchSource};
}

test("all seven exact-date Christmas source-intake appointments remain explicitly uncertified",()=>{
 assert.equal(expected.length,7);
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.length,23);
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.at(-1),"2026-12-20");
 for(const [date,psalmDay,officeDate,, ,marianSection] of expected){
  const a=researchChristmas2026PrivateComplineAppointment(date);
  assert.equal(a.status,"EXPLICIT_CHRISTMAS_2026_PRIVATE_SOURCE_RESEARCH");
  assert.equal(a.appointment.psalmDay,psalmDay);
  assert.equal(a.appointment.officeDate,officeDate);
  assert.equal(a.appointment.marianSection,marianSection);
  assert.equal(a.calendarSelectionAuthorized,false);
  assert.equal(a.completeHourCertified,false);
  assert.equal(a.published,false);
  assert.equal(latinComplineReleaseEligibility({date}).status,"WITHHELD");
  assert.equal(officeRouteState({date,hour:"COMPLINE"}).readingEnabled,false);
 }
});

test("28 complete *PRIVATE* Latin source projections: 7 civil dates × 2 contexts × 2 ministers",async()=>{
 for(const [date,psalmDay,officeDate,verses,psalmIds,marianSection] of expected){
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    const source=latinPinnedTransport();
    const privateReview=await assembleChristmas2026PrivateOfficeResearchReview({
     date,fetchSource:source.fetchSource
    });
    assert.equal(privateReview.status,"PRIVATE_SOURCE_TEXT_REVIEW",
     date+" "+context+" "+minister+" "+privateReview.reason);
    assert.equal(privateReview.civilDate,date);
    assert.equal(privateReview.officeDate,officeDate);
    assert.equal(privateReview.eventCount,42);
    assert.equal(privateReview.availableLanguages.length,1);
    assert.equal(privateReview.availableLanguages[0],"la");
    assert.equal(privateReview.rightsApproved,false);
    assert.equal(privateReview.published,false);
    const recitation=projectComplineRecitation(privateReview,{context,minister});
    assert.equal(recitation.status,"PRIVATE_SOURCE_TEXT_REVIEW",
     date+" "+context+" "+minister+" "+recitation.reason);
    assert.equal(recitation.sourceEventCount,42);
    assert.equal(recitation.readingEventCount,40);
    assert.equal(recitation.printedPsalmDisplayFrames,verses);
    assert.equal(recitation.frames.filter(f=>f.kind==="PSALM").length,verses);
    assert.deepEqual(recitation.events.filter(e=>e.kind==="PSALM")
     .map(e=>Number(/^Psalterium\/Psalmorum\/Psalm(\d+)/u.exec(e.sourceId)?.[1])),
     psalmIds);
    assert.equal(recitation.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(recitation.presidingMinister,minister);
    assert.equal(recitation.openingPaterOmitted,
     context===COMPLINE_CONTEXT.FINAL_PRAYER);
    assert.equal(recitation.liturgicallyCertified,false);
    assert.equal(recitation.published,false);
    assert.equal(recitation.publishable,false);
    const antiphon=recitation.frames.find(f=>f.kind==="MARIAN_ANTIPHON");
    const collect=recitation.frames.find(f=>f.kind==="MARIAN_COLLECT");
    assert.equal(antiphon.sourceId,"Psalterium/Mariaant#"+marianSection);
    assert.equal(collect.sourceId,"Psalterium/Mariaant#"+marianSection+":Oratio");
    const words=antiphon.texts.la.join(" ");
    const collectWords=collect.texts.la.join(" ");
    if(date<"2026-12-24"){
     assert.match(words,/Ángelus Dómini/u);
     assert.match(collectWords,/Grátiam tuam/u);
     assert.doesNotMatch(words,/Post partum/u);
    }else{
     assert.match(words,/Post partum, Virgo/u);
     assert.match(collectWords,/Deus, qui salútis ætérnæ/u);
     assert.doesNotMatch(words,/Ángelus Dómini/u);
    }
    assert.ok(source.calls.length>=7,"Expected source-driven reader");
    assert.ok(source.calls.every(url=>url.startsWith(base)));
   }
  }
 }
});

test("all 7 fully projected private texts remain withheld publicly BEFORE FETCH",async()=>{
 for(const [date] of expected){
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    let calls=0;
    const r=await loadPublishedLatinCompline({
     date,context,minister,fetchSource:async()=>{
      calls++;throw Error("PRIVATE_RESEARCH_MUST_NOT_REACH_PUBLIC_FETCH");
     }
    });
    assert.equal(r.status,"WITHHELD",date);
    assert.equal(r.published,false);
    assert.equal(r.frames.length,0);
    assert.equal(calls,0);
   }
  }
 }
});
