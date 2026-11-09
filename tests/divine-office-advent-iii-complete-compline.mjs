import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {ADVENT_I_COMPLINE_APPOINTMENTS,reviewAdventIComplineAppointment}
 from "../src/office/compline-advent-2026-appointments.js";
import {ADVENT_II_COMPLINE_APPOINTMENTS}
 from "../src/office/compline-advent-ii-2026-appointments.js";
import {ADVENT_III_COMPLINE_APPOINTMENTS,reviewAdventIII2026OrdoWitness}
 from "../src/office/compline-advent-iii-2026-appointments.js";
import {ADVENT_III_2026_ORDO_WITNESSES,ADVENT_III_2026_ORDO_SOURCE}
 from "../src/office/compline-advent-iii-2026-ordo-witness.js";
import {resolveSourceFirstComplineOrdo,researchWitnessForReviewedAdventCompline,
 summarizeSourceFirstComplineCoverage}
 from "../src/office/office-ordo-compline-resolver.js";
import {loadPublishedLatinCompline,latinComplineReleaseEligibility,
 LATIN_COMPLINE_RELEASE}
 from "../src/office/latin-compline-public-release.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";
import {officeRouteState} from "../src/office/office-route-state.js";
const read=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const saturday=read("advent-i-saturday-compline");
const tuesday=read("advent-i-feria-iii-compline");
const week=read("advent-i-week-compline");
const monday=read("advent-iii-feria-ii-compline");
const base="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
function latinTransport(){
 const calls=[];
 const fetchSource=async url=>{
  assert.ok(url.startsWith(base),"Forbidden English/French source: "+url);
  calls.push(url);
  const relative=decodeURIComponent(url.slice(base.length));
  assert.match(relative,/\.txt$/u);
  const id=relative.slice(0,-4);
  let body;
  if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   body=[6,7].includes(n)?monday.psalms[n]?.text:
    [87,102,233].includes(n)?saturday.psalms[n]:
    [11,12,15].includes(n)?tuesday.psalms[n]?.text:
    week.psalms[n]?.text;
  }else if(saturday.sections[id]){
   body=Object.entries(saturday.sections[id])
    .map(([name,rows])=>"["+name+"]\n"+rows.join("\n"))
    .join("\n\n")+"\n";
  }
  assert.equal(typeof body,"string","Missing original Latin source "+id);
  return {ok:true,status:200,url,text:async()=>body};
 };
 return {calls,fetchSource};
}
const expected=Object.freeze([
 ["2026-12-14","Feria II","2026-12-14",28,[6,7,7]],
 ["2026-12-15","Feria III","2026-12-15",26,[11,12,15]],
 ["2026-12-16","Feria IV","2026-12-16",30,[33,33,60]],
 ["2026-12-17","Feria V","2026-12-17",33,[69,70,70]],
 ["2026-12-18","Feria VI","2026-12-18",36,[76,76,85]],
 ["2026-12-19","Sabbato","2026-12-20",41,[87,102,102]],
 ["2026-12-20","Dominica","2026-12-20",30,[4,90,133]]
]);
test("exactly seven independently dated Office and Ember profiles match each 1960 Roman Compline rubric",()=>{
 assert.equal(ADVENT_III_COMPLINE_APPOINTMENTS.length,7);
 assert.equal(ADVENT_III_2026_ORDO_WITNESSES.length,7);
 assert.match(ADVENT_III_2026_ORDO_SOURCE,/breviariumgregorianum/u);
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.length,23);
 for(let i=0;i<expected.length;i++){
  const [date,psalmDay,officeDate,count]=expected[i];
  const appointment=ADVENT_III_COMPLINE_APPOINTMENTS[i];
  assert.equal(appointment.date,date);
  assert.equal(appointment.psalmDay,psalmDay);
  assert.equal(appointment.officeDate,officeDate);
  const dated=reviewAdventIII2026OrdoWitness(appointment);
  assert.equal(dated.status,"INDEPENDENT_DATED_ROMAN_1960_ORDO_REVIEW");
  assert.equal(dated.witness.stichs,count);
  const review=reviewAdventIComplineAppointment(date);
  assert.equal(review.status,"EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH");
  assert.equal(review.officeOrdoResearch.officeDate,officeDate);
  assert.equal(review.officeOrdoResearch.appointment.psalmDay,psalmDay);
  const source=resolveSourceFirstComplineOrdo({date,
   record:researchWitnessForReviewedAdventCompline(appointment)});
  assert.equal(source.status,"OFFICE_PSALTER_APPOINTMENT_RESEARCH_ONLY");
  assert.equal(source.published,false);
  assert.equal(source.appointment.psalmDay,psalmDay);
  assert.equal(latinComplineReleaseEligibility({date}).status,"ELIGIBLE");
  const route=officeRouteState({date,hour:"COMPLINE"});
  assert.equal(route.status,"RELEASED");
  assert.equal(route.officeDate,officeDate);
  assert.equal(route.published,true);
 }
});
test("Ember Days remain ferial Compline even though II-class, and O Antiphon remains Vespers-only",()=>{
 for(const [date,day] of [
  ["2026-12-16","Feria IV"],["2026-12-17","Feria V"],
  ["2026-12-18","Feria VI"]
 ]){
  const appointment=ADVENT_III_COMPLINE_APPOINTMENTS.find(x=>x.date===date);
  assert.equal(appointment.rank,"II");
  assert.equal(appointment.officeClass,"FERIA");
  assert.equal(appointment.psalmDay,day);
  assert.equal(reviewAdventIII2026OrdoWitness(appointment).witness.rubric,"171(e)");
 }
 const dec17=ADVENT_III_2026_ORDO_WITNESSES.find(x=>x.date==="2026-12-17");
 assert.match(dec17.vespersNote,/Vespers; not the Compline Marian antiphon/u);
 const comm=researchWitnessForReviewedAdventCompline(
  ADVENT_III_COMPLINE_APPOINTMENTS.find(x=>x.date==="2026-12-16"));
 assert.equal(comm.commemorationDisposition,"ADJUDICATED_WITH_COMM_REQUIRED");
 assert.equal(ADVENT_III_COMPLINE_APPOINTMENTS.find(x=>x.date==="2026-12-19").officeDate,"2026-12-20");
 assert.equal(latinComplineReleaseEligibility({date:"2026-12-19"}).psalmDay,"Sabbato");
 assert.equal(latinComplineReleaseEligibility({date:"2026-12-20"}).psalmDay,"Dominica");
});
test("2026 finite annual research ledger is 23 reviewed and 342 withheld, not automatically public",()=>{
 const records=[
  ...ADVENT_I_COMPLINE_APPOINTMENTS,
  ...ADVENT_II_COMPLINE_APPOINTMENTS,
  ...ADVENT_III_COMPLINE_APPOINTMENTS
 ].map(researchWitnessForReviewedAdventCompline);
 assert.equal(records.length,23);
 const coverage=summarizeSourceFirstComplineCoverage({year:2026,records});
 assert.equal(coverage.days,365);
 assert.equal(coverage.sourceReviewed,23);
 assert.equal(coverage.withheld,342);
 assert.equal(coverage.published,0);
 for(const [date] of expected)assert.equal(
  coverage.rows.find(x=>x.date===date).publicReleaseApproved,false);
 for(const date of ["2027-01-09","2027-01-10","2027-01-11","2027-01-12"])
  assert.equal(latinComplineReleaseEligibility({date}).status,"WITHHELD");
});
test("all seven new dates load 42 original Latin events and 40 printed moments with 2×2 minister/context choices",async()=>{
 for(const [date,psalmDay,officeDate,count,psalmIds] of expected){
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    const source=latinTransport();
    const r=await loadPublishedLatinCompline({
     date,context,minister,fetchSource:source.fetchSource
    });
    assert.equal(r.status,"PUBLIC_LATIN_COMPLINE",date+" "+r.reason);
    assert.equal(r.civilDate,date);
    assert.equal(r.officeDate,officeDate);
    assert.equal(latinComplineReleaseEligibility({date}).psalmDay,psalmDay);
    assert.equal(r.published,true);
    assert.equal(r.readingEventCount,40);
    assert.equal(r.sourceEventCount,42);
    assert.equal(r.printedPsalmDisplayFrames,count);
    assert.equal(r.frames.filter(f=>f.kind==="PSALM").length,count);
    assert.deepEqual(r.events.filter(e=>e.kind==="PSALM")
     .map(e=>Number(/^Psalterium\/Psalmorum\/Psalm(\d+)/u.exec(e.sourceId)?.[1])),
     psalmIds);
    assert.equal(r.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(r.visitaShortConclusionPrinted1961,true);
    assert.equal(r.ministerDialoguesResolved,2);
    assert.equal(r.presidingMinister,minister);
    assert.equal(r.recitationContext,context);
    assert.deepEqual(r.availableLanguages,["la"]);
    assert.ok(r.frames.every(frame=>!JSON.stringify(frame.texts).includes("/:")));
    assert.ok(source.calls.length>0);
    assert.ok(source.calls.every(url=>url.startsWith(base)));
    assert.equal(r.frames.filter(f=>f.kind==="EXAMINATION").length,
     context===COMPLINE_CONTEXT.FINAL_PRAYER?1:0);
    if(date==="2026-12-14"){
     const numbered=r.frames.filter(f=>f.sourceNumberingNormalized);
     assert.equal(numbered.length,28);
     assert.ok(numbered.every(f=>!f.texts.la[0].startsWith(f.sourceVerseLabel+" ")));
     assert.equal(numbered[0].sourceVerseLabel,"6:2");
     assert.ok(numbered.some(f=>f.sourceVerseLabel==="7:7b"&&
      !f.texts.la[0].includes("(8a)")));
    }
   }
  }
 }
});
test("all unreviewed dates, local calendars and other seven Hours remain source-fetch-free",async()=>{
 for(const options of [
  {date:"2027-01-09"}, {date:"2027-01-10"},
  {date:"2027-12-14"}, {date:"2026-12-19",calendarScope:"LOCAL"},
  {date:"2026-12-18",hour:"VESPERS"},
  {date:"2026-12-20",hour:"LAUDS"}
 ]){
  let fetches=0;
  const r=await loadPublishedLatinCompline({...options,
   fetchSource:async()=>{fetches++;throw Error("Unauthorized fetch");}});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.published,false);
  assert.equal(fetches,0);
 }
});
