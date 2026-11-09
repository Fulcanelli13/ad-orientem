import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {LATIN_COMPLINE_RELEASE,CHRISTMAS_2026_COMPLINE_RELEASE,
 DEC28_JAN03_LATIN_COMPLINE_RELEASE,
 EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE,
 latinComplineReleaseEligibility,loadPublishedLatinCompline}
 from "../src/office/latin-compline-public-release.js";
import {EPIPHANY_2027_FIVE_DATE_PROFILES,
 reviewEpiphany2027FiveDayLatinCertificate}
 from "../src/office/compline-epiphany-jan04-08-2027-release-certificate.js";
import {officeRouteState} from "../src/office/office-route-state.js";
import {getDivineOfficePrayerReadiness}
 from "../src/pray/divine-office-readiness-gate.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";
const fixture=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const saturday=fixture("advent-i-saturday-compline");
const monday=fixture("advent-iii-feria-ii-compline");
const week=fixture("advent-i-week-compline");
const marian=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
const EXPECTED_EVENTS={
 "2027-01-04":[6,7,7],"2027-01-05":[4,90,133],
 "2027-01-06":[4,90,133],"2027-01-07":[69,70,70],
 "2027-01-08":[76,76,85]
};
function transport(){
 const calls=[];
 const fetchSource=async url=>{
  assert.ok(url.startsWith(BASE),"Public Office source must be pinned Latin: "+url);
  calls.push(url);
  const rel=decodeURIComponent(url.slice(BASE.length));
  assert.match(rel,/\.txt$/u);
  const id=rel.slice(0,-4);
  let body;
  if(id==="Psalterium/Mariaant")body=marian;
  else if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   body=[6,7].includes(n)?monday.psalms[n]?.text:
    [87,102,233].includes(n)?saturday.psalms[n]:
    week.psalms[n]?.text;
  }else if(saturday.sections[id])
   body=Object.entries(saturday.sections[id]).map(([key,lines])=>
    "["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n";
  assert.equal(typeof body,"string","Missing pinned source "+id);
  return {ok:true,status:200,url,text:async()=>body};
 };
 return {calls,fetchSource};
}
test("five additional source-certified Latin dates make exactly 42, Holy Family remains withheld",()=>{
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.length,23);
 assert.equal(CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates.length,7);
 assert.equal(DEC28_JAN03_LATIN_COMPLINE_RELEASE.approvedDates.length,7);
 assert.equal(EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.approvedDates.length,5);
 const dates=[...LATIN_COMPLINE_RELEASE.approvedDates,
  ...CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates,
  ...DEC28_JAN03_LATIN_COMPLINE_RELEASE.approvedDates,
  ...EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.approvedDates];
 assert.equal(new Set(dates).size,42);
 assert.equal(dates.at(-1),"2027-01-08");
 assert.equal(EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.holyFamilyJan09_10Released,false);
 for(const p of EPIPHANY_2027_FIVE_DATE_PROFILES){
  const certificate=reviewEpiphany2027FiveDayLatinCertificate(p.date);
  assert.equal(certificate.status,"EXPLICIT_EPIPHANY_JAN04_08_LATIN_TEXT_CERTIFIED");
  assert.equal(certificate.profile,p);
  assert.equal(certificate.printedMame1961PsalterLeafFacsimileCertified,false);
  const permission=latinComplineReleaseEligibility({date:p.date});
  assert.equal(permission.status,"ELIGIBLE",p.date+" "+permission.reason);
  assert.equal(permission.certificateFamily,"EPIPHANY_JAN04_08_FINITE_LATIN");
  assert.equal(permission.officeDate,p.officeDate);
  assert.equal(permission.psalmDay,p.psalmDay);
  assert.equal(permission.marianSection,"Nativiti");
  assert.equal(permission.printedPsalmDisplayFrames,p.printedPsalmDisplayFrames);
  assert.equal(permission.language,"la");
  assert.equal(permission.exact1961PsalterLeafVerified,false);
  const route=officeRouteState({date:p.date,hour:"COMPLINE"});
  assert.equal(route.status,"RELEASED");
  assert.equal(route.officeDate,p.officeDate);
  assert.equal(route.label,p.label);
  assert.equal(route.published,true);
  assert.equal(route.readingEnabled,true);
  assert.equal(getDivineOfficePrayerReadiness({date:p.date}).published,true);
 }
});
test("a mutated I Vespers Epiphany date, Psalm family or Holy Family boundary fails closed",()=>{
 for(const [date,changes] of [
  ["2027-01-04",{psalmDay:"Dominica"}],
  ["2027-01-05",{officeDate:"2027-01-05"}],
  ["2027-01-05",{psalmDay:"Feria III"}],
  ["2027-01-06",{psalmDay:"Feria IV"}],
  ["2027-01-07",{psalmDay:"Dominica"}],
  ["2027-01-08",{psalmDay:"Dominica"}],
  ["2027-01-08",{marianSection:"Advent"}],
  ["2027-01-08",{printedPsalmDisplayFrames:30}]
 ]){
  const p=EPIPHANY_2027_FIVE_DATE_PROFILES.find(x=>x.date===date);
  const r=reviewEpiphany2027FiveDayLatinCertificate(date,{
   candidate:{...p,...changes}
  });
  assert.equal(r.status,"WITHHELD",date+" "+JSON.stringify(changes));
 }
 for(const date of ["2027-01-03","2027-01-09","2027-01-10","2027-01-11"])
  assert.equal(reviewEpiphany2027FiveDayLatinCertificate(date).status,"WITHHELD");
});
test("20 positive full PUBLIC Latin Compline variants, with source-backed Epiphany first-Vespers",async()=>{
 for(const p of EPIPHANY_2027_FIVE_DATE_PROFILES){
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    const source=transport();
    const result=await loadPublishedLatinCompline({
     date:p.date,context,minister,fetchSource:source.fetchSource
    });
    assert.equal(result.status,"PUBLIC_LATIN_COMPLINE",p.date+" "+result.reason);
    assert.equal(result.civilDate,p.date);
    assert.equal(result.officeDate,p.officeDate);
    assert.equal(result.sourceEventCount,42);
    assert.equal(result.readingEventCount,40);
    assert.equal(result.printedPsalmDisplayFrames,p.printedPsalmDisplayFrames);
    assert.equal(result.frames.filter(x=>x.kind==="PSALM").length,
     p.printedPsalmDisplayFrames);
    assert.deepEqual(result.events.filter(x=>x.kind==="PSALM").map(x=>
     Number(/^Psalterium\/Psalmorum\/Psalm(\d+)/u.exec(x.sourceId)?.[1])),
     EXPECTED_EVENTS[p.date]);
    assert.equal(result.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(result.ministerDialoguesResolved,2);
    assert.equal(result.presidingMinister,minister);
    assert.equal(result.openingPaterOmitted,
     context===COMPLINE_CONTEXT.FINAL_PRAYER);
    assert.deepEqual(result.availableLanguages,["la"]);
    const antiphon=result.frames.find(x=>x.kind==="MARIAN_ANTIPHON");
    const collect=result.frames.find(x=>x.kind==="MARIAN_COLLECT");
    assert.equal(antiphon.sourceId,"Psalterium/Mariaant#Nativiti");
    assert.equal(collect.sourceId,"Psalterium/Mariaant#Nativiti:Oratio");
    assert.match(antiphon.texts.la.join(" "),/Post partum, Virgo/u);
    assert.match(collect.texts.la.join(" "),/Deus, qui salútis ætérnæ/u);
    assert.equal(result.published,true);
    assert.equal(result.rightsApproved,true);
    assert.ok(source.calls.length>=7);
    assert.ok(source.calls.every(x=>x.startsWith(BASE)));
   }
  }
 }
});
test("9/10 Jan Holy Family, all other Hours/local calendars stay zero-fetch withheld",async()=>{
 for(const date of ["2027-01-09","2027-01-10","2027-01-11",
  "2027-01-12","2028-01-06"]){
  assert.equal(latinComplineReleaseEligibility({date}).status,"WITHHELD");
  assert.equal(officeRouteState({date,hour:"COMPLINE"}).readingEnabled,false);
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    let calls=0;
    const r=await loadPublishedLatinCompline({
     date,context,minister,fetchSource:async()=>{
      calls++;throw Error("UNREVIEWED_PROPER_OFFICE_FETCH")
     }
    });
    assert.equal(r.status,"WITHHELD");
    assert.equal(r.published,false);
    assert.equal(calls,0);
   }
  }
 }
 for(const args of [
  {date:"2027-01-06",hour:"VESPERS"},
  {date:"2027-01-08",hour:"LAUDS"},
  {date:"2027-01-05",calendarScope:"LOCAL"},
  {date:"2027-01-07",calendarScope:"SSPX"}
 ]){
  let calls=0;
  const r=await loadPublishedLatinCompline({...args,fetchSource:async()=>{
   calls++;throw Error("NOT_ALLOWED")
  }});
  assert.equal(r.status,"WITHHELD");
  assert.equal(calls,0);
 }
});
