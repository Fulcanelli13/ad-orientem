import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {CHRISTMAS_2026_COMPLINE_RELEASE,LATIN_COMPLINE_RELEASE,
 latinComplineReleaseEligibility,loadPublishedLatinCompline}
 from "../src/office/latin-compline-public-release.js";
import {CHRISTMAS_2026_RELEASE_PROFILES,
 reviewChristmas2026LatinComplineCertificate,
 CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA}
 from "../src/office/compline-christmas-2026-release-certificate.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";
import {officeRouteState} from "../src/office/office-route-state.js";
import {getDivineOfficePrayerReadiness}
 from "../src/pray/divine-office-readiness-gate.js";
const fixture=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const saturday=fixture("advent-i-saturday-compline");
const tuesday=fixture("advent-i-feria-iii-compline");
const week=fixture("advent-i-week-compline");
const marian=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
function transport(){
 const calls=[];
 const fetchSource=async url=>{
  assert.ok(url.startsWith(BASE),"Christmas Office fetched unapproved source "+url);
  calls.push(url);
  const rel=decodeURIComponent(url.slice(BASE.length));
  assert.match(rel,/\.txt$/u);
  const id=rel.slice(0,-4);
  let raw;
  if(id==="Psalterium/Mariaant")raw=marian;
  else if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   raw=[87,102,233].includes(n)?saturday.psalms[n]:
    [11,12,15].includes(n)?tuesday.psalms[n]?.text:
    week.psalms[n]?.text;
  }else if(saturday.sections[id])
   raw=Object.entries(saturday.sections[id]).map(([key,lines])=>
    "["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n";
  assert.equal(typeof raw,"string","Missing pinned original Latin leaf "+id);
  return {ok:true,status:200,url,text:async()=>raw};
 };
 return {calls,fetchSource};
}
test("Christmas release is additive, finite and claims no 1961 Mame Psalter facsimile",()=>{
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.length,23);
 assert.equal(CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates.length,7);
 assert.equal(new Set([...LATIN_COMPLINE_RELEASE.approvedDates,
  ...CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates]).size,30);
 assert.equal(CHRISTMAS_2026_COMPLINE_RELEASE.sourceRevision,PIN);
 assert.equal(CHRISTMAS_2026_COMPLINE_RELEASE.sourceMarianBlobSha,
  CHRISTMAS_2026_MARIAN_PINNED_BLOB_SHA);
 assert.equal(CHRISTMAS_2026_COMPLINE_RELEASE.printed1961MamePsalterFacsimileVerified,false);
 assert.equal(CHRISTMAS_2026_RELEASE_PROFILES.length,7);
 for(const profile of CHRISTMAS_2026_RELEASE_PROFILES){
  const certificate=reviewChristmas2026LatinComplineCertificate(profile.date);
  assert.equal(certificate.status,"EXPLICIT_FINITE_ROMAN_1960_LATIN_TEXT_CERTIFIED");
  assert.equal(certificate.profile,profile);
  assert.equal(certificate.printed1961MamePsalterFacsimileVerified,false);
  const permission=latinComplineReleaseEligibility({date:profile.date});
  assert.equal(permission.status,"ELIGIBLE",profile.date+" "+permission.reason);
  assert.equal(permission.psalmDay,profile.psalmDay);
  assert.equal(permission.marianSection,profile.marianSection);
  assert.equal(permission.officeDate,profile.officeDate);
  assert.equal(permission.printedPsalmDisplayFrames,profile.printedPsalmDisplayFrames);
  assert.equal(permission.language,"la");
  assert.equal(permission.exact1961PsalterLeafVerified,false);
  const route=officeRouteState({date:profile.date,hour:"COMPLINE"});
  assert.equal(route.status,"RELEASED");
  assert.equal(route.officeDate,profile.officeDate);
  assert.equal(route.readingEnabled,true);
  assert.equal(route.label,profile.label);
  assert.equal(route.published,true);
  assert.equal(getDivineOfficePrayerReadiness({date:profile.date}).published,true);
 }
});
test("mutating signed calendar/release certificate refuses wrong date, psalter or season",()=>{
 for(const [date,changed] of [
  ["2026-12-21",{psalmDay:"Feria II"}],
  ["2026-12-22",{psalmDay:"Dominica"}],
  ["2026-12-24",{officeDate:"2026-12-24"}],
  ["2026-12-24",{marianSection:"Advent"}],
  ["2026-12-26",{psalmDay:"Sabbato"}],
  ["2026-12-27",{officeClass:"II_FEAST"}],
  ["2026-12-27",{rubric:"169(e)"}]
 ]){
  const profile=CHRISTMAS_2026_RELEASE_PROFILES.find(x=>x.date===date);
  const certificate=reviewChristmas2026LatinComplineCertificate(date,{
   candidate:{...profile,...changed}
  });
  assert.equal(certificate.status,"WITHHELD",date);
 }
 for(const date of ["2026-12-20","2026-12-28","2027-12-24"])
  assert.equal(reviewChristmas2026LatinComplineCertificate(date).status,"WITHHELD");
});
test("28 full PUBLIC Latin reader variants, exact Christmas first-Vespers and seasonal Marian texts",async()=>{
 for(const p of CHRISTMAS_2026_RELEASE_PROFILES){
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
    assert.equal(r.frames.filter(f=>f.kind==="PSALM").length,
     p.printedPsalmDisplayFrames);
    assert.equal(r.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(r.ministerDialoguesResolved,2);
    assert.equal(r.presidingMinister,minister);
    assert.equal(r.openingPaterOmitted,
     context===COMPLINE_CONTEXT.FINAL_PRAYER);
    const a=r.frames.filter(f=>f.kind==="MARIAN_ANTIPHON");
    const c=r.frames.filter(f=>f.kind==="MARIAN_COLLECT");
    assert.equal(a.length,1);
    assert.equal(c.length,1);
    assert.equal(a[0].sourceId,"Psalterium/Mariaant#"+p.marianSection);
    assert.equal(c[0].sourceId,"Psalterium/Mariaant#"+p.marianSection+":Oratio");
    const av=a[0].texts.la.join(" "),cv=c[0].texts.la.join(" ");
    if(p.date<"2026-12-24"){
     assert.match(av,/Ángelus Dómini/u);
     assert.match(cv,/Grátiam tuam/u);
     assert.doesNotMatch(av,/Post partum/u);
    }else{
     assert.match(av,/Post partum/u);
     assert.match(cv,/Deus, qui salútis ætérnæ/u);
     assert.doesNotMatch(av,/Ángelus Dómini/u);
    }
    assert.equal(r.availableLanguages.length,1);
    assert.deepEqual(r.availableLanguages,["la"]);
    assert.equal(r.exact1961PsalterLeafVerified,undefined);
    assert.equal(r.published,true);
    assert.equal(r.rightsApproved,true);
    assert.ok(source.calls.length>=7);
    assert.ok(source.calls.every(x=>x.startsWith(BASE)));
   }
  }
 }
});
test("dates 28 Dec onward and all EN/FR/local/other-hour requests remain withheld BEFORE any fetch",async()=>{
 for(const date of ["2026-12-28","2026-12-29","2026-12-30",
  "2026-12-31","2027-01-01"]){
  assert.equal(officeRouteState({date,hour:"COMPLINE"}).readingEnabled,false);
  for(const context of Object.values(COMPLINE_CONTEXT)){
   for(const minister of Object.values(COMPLINE_MINISTER)){
    let fetches=0;
    const r=await loadPublishedLatinCompline({
     date,context,minister,fetchSource:async()=>{fetches++;throw Error("FETCH_DENIED")}
    });
    assert.equal(r.status,"WITHHELD");assert.equal(fetches,0);
   }
  }
 }
 for(const options of [
  {date:"2026-12-24",hour:"VESPERS"},
  {date:"2026-12-25",hour:"PRIME"},
  {date:"2026-12-26",calendarScope:"LOCAL"},
  {date:"2026-12-27",calendarScope:"SSPX"}
 ]){
  let fetches=0;
  const r=await loadPublishedLatinCompline({
   ...options,fetchSource:async()=>{fetches++;throw Error("FETCH_DENIED")}
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(fetches,0);
 }
});
