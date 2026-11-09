import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {ADVENT_II_COMPLINE_APPOINTMENTS,reviewAdventII2026OrdoWitness}
 from "../src/office/compline-advent-ii-2026-appointments.js";
import {ADVENT_II_2026_ORDO_WITNESSES,
 ADVENT_II_2026_ORDO_SOURCE,
 ADVENT_II_2026_VESPERS_SECOND_WITNESS}
 from "../src/office/compline-advent-ii-2026-ordo-witness.js";
import {ADVENT_I_COMPLINE_APPOINTMENTS,reviewAdventIComplineAppointment}
 from "../src/office/compline-advent-2026-appointments.js";
import {resolveSourceFirstComplineOrdo,researchWitnessForReviewedAdventCompline,
 summarizeSourceFirstComplineCoverage}
 from "../src/office/office-ordo-compline-resolver.js";
import {loadPublishedLatinCompline,latinComplineReleaseEligibility}
 from "../src/office/latin-compline-public-release.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";
import {officeRouteState} from "../src/office/office-route-state.js";
const read=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const saturday=read("advent-i-saturday-compline");
const tuesday=read("advent-i-feria-iii-compline");
const week=read("advent-i-week-compline");
const base="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
function pinnedSource(){
 const calls=[];
 const fetchSource=async(url)=>{
  assert.ok(url.startsWith(base),"Only pinned Latin source is authorized: "+url);
  calls.push(url);
  const rel=decodeURIComponent(url.slice(base.length));
  assert.match(rel,/\.txt$/u);
  const id=rel.slice(0,-4);
  let body;
  if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const number=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   body=[87,102,233].includes(number)?saturday.psalms[number]:
    [11,12,15].includes(number)?tuesday.psalms[number]?.text:
    week.psalms[number]?.text;
  }else if(saturday.sections[id]){
   body=Object.entries(saturday.sections[id])
    .map(([key,rows])=>"["+key+"]\n"+rows.join("\n"))
    .join("\n\n")+"\n";
  }
  assert.equal(typeof body,"string","Missing original Latin source "+id);
  return {ok:true,status:200,url,text:async()=>body};
 };
 return {calls,fetchSource};
}
const expected=Object.freeze([
 ["2026-12-06","Dominica","2026-12-06",30,[4,90,133]],
 ["2026-12-07","Dominica","2026-12-08",30,[4,90,133]],
 ["2026-12-08","Dominica","2026-12-08",30,[4,90,133]],
 ["2026-12-09","Feria IV","2026-12-09",30,[33,33,60]],
 ["2026-12-10","Feria V","2026-12-10",33,[69,70,70]],
 ["2026-12-11","Feria VI","2026-12-11",36,[76,76,85]],
 ["2026-12-12","Sabbato","2026-12-13",41,[87,102,102]],
 ["2026-12-13","Dominica","2026-12-13",30,[4,90,133]]
]);
test("8 independent dated Office ordo records exactly match 1960 Roman rubrics and source-owned Psalms",()=>{
 assert.equal(ADVENT_II_COMPLINE_APPOINTMENTS.length,8);
 assert.equal(ADVENT_II_2026_ORDO_WITNESSES.length,8);
 assert.match(ADVENT_II_2026_ORDO_SOURCE,/breviariumgregorianum\.com\/ordo-2026/u);
 assert.match(ADVENT_II_2026_VESPERS_SECOND_WITNESS,/cantusorgani/u);
 for(let i=0;i<expected.length;i++){
  const [date,psalmDay,officeDate,count]=expected[i];
  const appointment=ADVENT_II_COMPLINE_APPOINTMENTS[i];
  assert.equal(appointment.date,date);
  assert.equal(appointment.psalmDay,psalmDay);
  assert.equal(appointment.officeDate,officeDate);
  const source=reviewAdventII2026OrdoWitness(appointment);
  assert.equal(source.status,"INDEPENDENT_DATED_ROMAN_1960_ORDO_REVIEW");
  assert.equal(source.witness.stichs,count);
  const checked=reviewAdventIComplineAppointment(date);
  assert.equal(checked.status,"EXPLICIT_ROMAN_1960_APPOINTMENT_RESEARCH");
  assert.equal(checked.officeOrdoResearch.officeDate,officeDate);
  const r=resolveSourceFirstComplineOrdo({
   date,record:researchWitnessForReviewedAdventCompline(appointment)
  });
  assert.equal(r.status,"OFFICE_PSALTER_APPOINTMENT_RESEARCH_ONLY");
  assert.equal(r.appointment.psalmDay,psalmDay);
  assert.equal(r.appointment.sourceUrl,ADVENT_II_2026_ORDO_SOURCE);
  assert.equal(r.published,false);
  assert.equal(latinComplineReleaseEligibility({date}).status,"ELIGIBLE");
  const route=officeRouteState({date,hour:"COMPLINE"});
  assert.equal(route.status,"RELEASED");
  assert.equal(route.officeDate,officeDate);
 }
});
test("7 December after Ambrose III-class is First Compline of I-class Immaculate Conception, never Monday psalms",()=>{
 const r=ADVENT_II_COMPLINE_APPOINTMENTS[1];
 assert.equal(r.date,"2026-12-07");
 assert.equal(r.officeClass,"I_FEAST_FIRST_VESPERS");
 assert.equal(r.officeDate,"2026-12-08");
 assert.equal(r.psalmDay,"Dominica");
 assert.equal(ADVENT_II_2026_ORDO_WITNESSES[1].civilDayOffice,
  "Saint Ambrose, Bishop, Confessor and Doctor of the Church (III)");
 assert.equal(ADVENT_II_2026_ORDO_WITNESSES[1].concurrenceSecondWitness,
  ADVENT_II_2026_VESPERS_SECOND_WITNESS);
 assert.equal(ADVENT_II_2026_ORDO_WITNESSES[1].rubric,"167(b)");
});
test("16-date 2026 annual source-intake research has 349 nonreviewed dates, not 365 automatically published",()=>{
 const allRecords=[
  ...ADVENT_I_COMPLINE_APPOINTMENTS,...ADVENT_II_COMPLINE_APPOINTMENTS
 ].map(researchWitnessForReviewedAdventCompline);
 assert.equal(allRecords.length,16);
 const coverage=summarizeSourceFirstComplineCoverage({year:2026,records:allRecords});
 assert.equal(coverage.days,365);
 assert.equal(coverage.sourceReviewed,16);
 assert.equal(coverage.withheld,349);
 assert.equal(coverage.published,0);
 for(const [date] of expected)assert.equal(
  coverage.rows.find(row=>row.date===date).publicReleaseApproved,false);
 assert.equal(latinComplineReleaseEligibility({date:"2027-01-11"}).status,"WITHHELD");
 assert.equal(officeRouteState({date:"2027-01-11",hour:"COMPLINE"}).published,false);
});
test("all eight Advent II dates load original 42-event/40-moment Latin Compline in both minister and recitation contexts",async()=>{
 for(const [date,psalmDay,officeDate,count,psalms] of expected){
  for(const minister of Object.values(COMPLINE_MINISTER)){
   for(const context of Object.values(COMPLINE_CONTEXT)){
    const transport=pinnedSource();
    const r=await loadPublishedLatinCompline({
     date,minister,context,fetchSource:transport.fetchSource
    });
    assert.equal(r.status,"PUBLIC_LATIN_COMPLINE",date+": "+r.reason);
    assert.equal(r.civilDate,date);
    assert.equal(r.officeDate,officeDate);
    assert.equal(latinComplineReleaseEligibility({date}).psalmDay,psalmDay);
    assert.equal(r.published,true);
    assert.equal(r.sourceEventCount,42);
    assert.equal(r.readingEventCount,40);
    assert.equal(r.printedPsalmDisplayFrames,count);
    assert.equal(r.frames.filter(f=>f.kind==="PSALM").length,count);
    assert.deepEqual(r.events.filter(e=>e.kind==="PSALM")
     .map(e=>Number(/^Psalterium\/Psalmorum\/Psalm(\d+)/u.exec(e.sourceId)?.[1])),
     psalms);
    assert.equal(r.ministerDialoguesResolved,2);
    assert.equal(r.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(r.visitaShortConclusionPrinted1961,true);
    assert.ok(r.frames.every(f=>Object.keys(f.texts).every(l=>l==="la")));
    assert.ok(r.frames.every(f=>!JSON.stringify(f.texts).includes("/:")));
    assert.ok(transport.calls.length>0);
    assert.ok(transport.calls.every(url=>url.startsWith(base)));
    assert.equal(r.frames.filter(f=>f.kind==="EXAMINATION").length,
     context===COMPLINE_CONTEXT.FINAL_PRAYER?1:0);
   }
  }
 }
});
test("unreviewed future date, local overlays and other seven Hours cannot fetch Latin text",async()=>{
 for(const option of [
  {date:"2027-01-11"}, {date:"2027-01-12"},
  {date:"2027-12-07"}, {date:"2026-12-07",calendarScope:"LOCAL"},
  {date:"2026-12-08",hour:"VESPERS"},
  {date:"2026-12-13",hour:"MATINS"}
 ]){
  let fetches=0;
  const r=await loadPublishedLatinCompline({...option,
   fetchSource:async()=>{fetches++;throw Error("Unapproved network fetch")}
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.published,false);
  assert.equal(fetches,0);
 }
});
