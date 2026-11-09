import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {LATIN_COMPLINE_RELEASE,CHRISTMAS_2026_COMPLINE_RELEASE,
 DEC28_JAN03_LATIN_COMPLINE_RELEASE,
 latinComplineReleaseEligibility,loadPublishedLatinCompline}
 from "../src/office/latin-compline-public-release.js";
import {DEC28_JAN03_LATIN_RELEASE_PROFILES,
 reviewDec28Jan03LatinComplineCertificate}
 from "../src/office/compline-dec28-jan03-2027-release-certificate.js";
import {officeRouteState} from "../src/office/office-route-state.js";
import {getDivineOfficePrayerReadiness}
 from "../src/pray/divine-office-readiness-gate.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";

const fixture=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const sunday=fixture("advent-i-week-compline");
const saturday=fixture("advent-i-saturday-compline");
const marian=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
function transport(){
 const calls=[];
 const fetchSource=async url=>{
  assert.ok(url.startsWith(BASE),"Unsupported Office source "+url);
  calls.push(url);
  const relative=decodeURIComponent(url.slice(BASE.length));
  assert.match(relative,/\.txt$/u);
  const id=relative.slice(0,-4);
  let body;
  if(id==="Psalterium/Mariaant")body=marian;
  else if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   body=[87,102,233].includes(n)?saturday.psalms[n]:sunday.psalms[n]?.text;
  }else if(saturday.sections[id])
   body=Object.entries(saturday.sections[id]).map(([key,lines])=>
    "["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n";
  assert.equal(typeof body,"string","Missing original source "+id);
  return {ok:true,status:200,url,text:async()=>body};
 };
 return {calls,fetchSource};
}
test("finite separately source-reviewed year-boundary certificate extends public Latin Compline to 37 dates",()=>{
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.length,23);
 assert.equal(CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates.length,7);
 assert.equal(DEC28_JAN03_LATIN_COMPLINE_RELEASE.approvedDates.length,7);
 const dates=[...LATIN_COMPLINE_RELEASE.approvedDates,
  ...CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates,
  ...DEC28_JAN03_LATIN_COMPLINE_RELEASE.approvedDates];
 assert.equal(new Set(dates).size,37);
 assert.equal(dates.at(-1),"2027-01-03");
 assert.equal(DEC28_JAN03_LATIN_COMPLINE_RELEASE.sourceRevision,PIN);
 assert.equal(DEC28_JAN03_LATIN_COMPLINE_RELEASE.printedMame1961PsalterFacsimileCollated,false);
 for(const profile of DEC28_JAN03_LATIN_RELEASE_PROFILES){
  const certificate=reviewDec28Jan03LatinComplineCertificate(profile.date);
  assert.equal(certificate.status,"EXPLICIT_FINITE_YEAR_BOUNDARY_LATIN_CERTIFIED");
  assert.equal(certificate.profile,profile);
  assert.equal(certificate.printedMame1961PsalterFacsimileCollated,false);
  const permission=latinComplineReleaseEligibility({date:profile.date});
  assert.equal(permission.status,"ELIGIBLE",profile.date+" "+permission.reason);
  assert.equal(permission.certificateFamily,"YEAR_BOUNDARY_2027_FINITE_LATIN");
  assert.equal(permission.officeDate,profile.officeDate);
  assert.equal(permission.psalmDay,profile.psalmDay);
  assert.equal(permission.marianSection,"Nativiti");
  assert.equal(permission.printedPsalmDisplayFrames,profile.printedPsalmDisplayFrames);
  assert.equal(permission.exact1961PsalterLeafVerified,false);
  assert.equal(permission.language,"la");
  const route=officeRouteState({date:profile.date,hour:"COMPLINE"});
  assert.equal(route.status,"RELEASED");
  assert.equal(route.officeDate,profile.officeDate);
  assert.equal(route.label,profile.label);
  assert.equal(route.published,true);
  assert.equal(route.readingEnabled,true);
  const readiness=getDivineOfficePrayerReadiness({date:profile.date});
  assert.equal(readiness.published,true);
  assert.equal(readiness.rightsApproved,true);
 }
});
test("mutated 29/30 Dec octave, 31 Dec/2 Jan Office rollovers and Marian ending are denied",()=>{
 for(const [date,changes] of [
  ["2026-12-28",{officeClass:"III_FEAST"}],
  ["2026-12-29",{psalmDay:"Feria III"}],
  ["2026-12-30",{psalmDay:"Feria IV"}],
  ["2026-12-31",{officeDate:"2026-12-31"}],
  ["2027-01-01",{marianSection:"Advent"}],
  ["2027-01-02",{psalmDay:"Sabbato"}],
  ["2027-01-02",{officeDate:"2027-01-02"}],
  ["2027-01-03",{officeClass:"ORDINARY_SUNDAY"}],
  ["2027-01-03",{rubric:"169(e)"}]
 ]){
  const profile=DEC28_JAN03_LATIN_RELEASE_PROFILES.find(r=>r.date===date);
  const result=reviewDec28Jan03LatinComplineCertificate(date,{
   candidate:{...profile,...changes}
  });
  assert.equal(result.status,"WITHHELD",date+" "+JSON.stringify(changes));
 }
 for(const date of ["2026-12-27","2027-01-04","2028-01-03"])
  assert.equal(reviewDec28Jan03LatinComplineCertificate(date).status,"WITHHELD");
});
test("28 PUBLIC Latin full 42→40 readings use exact dates, rubrics and Nativiti pinned source",async()=>{
 for(const p of DEC28_JAN03_LATIN_RELEASE_PROFILES){
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    const source=transport();
    const r=await loadPublishedLatinCompline({
     date:p.date,context,minister,fetchSource:source.fetchSource
    });
    assert.equal(r.status,"PUBLIC_LATIN_COMPLINE",p.date+" "+r.reason);
    assert.equal(r.civilDate,p.date);
    assert.equal(r.officeDate,p.officeDate);
    assert.equal(r.sourceEventCount,42);
    assert.equal(r.readingEventCount,40);
    assert.equal(r.printedPsalmDisplayFrames,p.printedPsalmDisplayFrames);
    assert.equal(r.frames.filter(f=>f.kind==="PSALM").length,p.printedPsalmDisplayFrames);
    const expected=[4,90,133];
    const psalms=r.events.filter(x=>x.kind==="PSALM")
     .map(x=>Number(/^Psalterium\/Psalmorum\/Psalm(\d+)/u.exec(x.sourceId)?.[1]));
    assert.deepEqual(psalms,expected);
    assert.equal(r.ministerDialoguesResolved,2);
    assert.equal(r.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(r.presidingMinister,minister);
    assert.equal(r.openingPaterOmitted,
     context===COMPLINE_CONTEXT.FINAL_PRAYER);
    assert.deepEqual(r.availableLanguages,["la"]);
    const antiphon=r.frames.find(x=>x.kind==="MARIAN_ANTIPHON");
    const collect=r.frames.find(x=>x.kind==="MARIAN_COLLECT");
    assert.equal(antiphon.sourceId,"Psalterium/Mariaant#Nativiti");
    assert.equal(collect.sourceId,"Psalterium/Mariaant#Nativiti:Oratio");
    assert.match(antiphon.texts.la.join(" "),/Post partum, Virgo/u);
    assert.match(collect.texts.la.join(" "),/Deus, qui salútis ætérnæ/u);
    assert.doesNotMatch(antiphon.texts.la.join(" "),/Ángelus Dómini/u);
    assert.equal(r.published,true);
    assert.equal(r.rightsApproved,true);
    assert.ok(source.calls.length>=7);
    assert.ok(source.calls.every(url=>url.startsWith(BASE)));
   }
  }
 }
});
test("9 Jan 2027 onward, non-universal calendars and other Hours zero-fetch WITHHELD",async()=>{
 for(const date of ["2027-01-09","2027-01-10","2027-01-11",
  "2027-01-12","2028-01-01"]){
  assert.equal(latinComplineReleaseEligibility({date}).status,"WITHHELD");
  assert.equal(officeRouteState({date,hour:"COMPLINE"}).readingEnabled,false);
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    let count=0;
    const result=await loadPublishedLatinCompline({
     date,context,minister,fetchSource:async()=>{count++;throw Error("FORBIDDEN")}
    });
    assert.equal(result.status,"WITHHELD");
    assert.equal(result.published,false);
    assert.equal(count,0);
   }
  }
 }
 for(const option of [
  {date:"2026-12-29",hour:"VESPERS"},
  {date:"2027-01-01",hour:"LAUDS"},
  {date:"2027-01-02",calendarScope:"LOCAL"},
  {date:"2027-01-03",calendarScope:"SSPX"}
 ]){
  let calls=0;
  const result=await loadPublishedLatinCompline({...option,
   fetchSource:async()=>{calls++;throw Error("UNAUTHORIZED")}
  });
  assert.equal(result.status,"WITHHELD");
  assert.equal(calls,0);
 }
});
