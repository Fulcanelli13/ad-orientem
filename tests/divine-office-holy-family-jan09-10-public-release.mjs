import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN}
 from "../src/app/source-transport-compat.js";
import {LATIN_COMPLINE_RELEASE,CHRISTMAS_2026_COMPLINE_RELEASE,
 DEC28_JAN03_LATIN_COMPLINE_RELEASE,
 EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE,
 HOLY_FAMILY_2027_LATIN_COMPLINE_RELEASE,
 latinComplineReleaseEligibility,loadPublishedLatinCompline}
 from "../src/office/latin-compline-public-release.js";
import {HOLY_FAMILY_2027_RELEASE_PROFILES,
 HOLY_FAMILY_2027_TEXT_CERTIFICATE,
 HOLY_FAMILY_2027_ORDINARY_HYMN_BLOB_SHA,
 HOLY_FAMILY_2027_PROPER_BLOB_SHA,
 reviewHolyFamily2027LatinComplineCertificate}
 from "../src/office/compline-holy-family-jan09-10-2027-release-certificate.js";
import {officeRouteState} from "../src/office/office-route-state.js";
import {getDivineOfficePrayerReadiness}
 from "../src/pray/divine-office-readiness-gate.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";
const fixture=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const saturday=fixture("advent-i-saturday-compline");
const week=fixture("advent-i-week-compline");
const marian=readFileSync(new URL(
 "../data/office/research/christmas-2026-marian-latin-pinned-source.txt",
 import.meta.url),"utf8");
const BASE="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/Latin/";
const TE_LUCIS_ID="Psalterium/Special/Minor Special#Hymnus Completorium";
function transport({wrongDoxology=false}={}){
 const calls=[];
 const fetchSource=async url=>{
  assert.ok(url.startsWith(BASE),"Nonapproved source "+url);
  calls.push(url);
  const rel=decodeURIComponent(url.slice(BASE.length));
  assert.match(rel,/\.txt$/u);
  const id=rel.slice(0,-4);
  let body;
  if(id==="Psalterium/Mariaant")body=marian;
  else if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   body=[87,102,233].includes(n)?saturday.psalms[n]:week.psalms[n]?.text;
  }else if(saturday.sections[id]){
   const sections={...saturday.sections[id]};
   if(wrongDoxology&&id==="Psalterium/Special/Minor Special"){
    sections["Hymnus Completorium"]=[
     ...sections["Hymnus Completorium"].slice(0,10),
     "* Jesu, tuis obédiens","Qui factus es paréntibus,",
     "Cum Patre summo ac Spíritu","Semper tibi sit glória.","Amen."
    ];
   }
   body=Object.entries(sections).map(([name,lines])=>
    "["+name+"]\n"+lines.join("\n")).join("\n\n")+"\n";
  }
  assert.equal(typeof body,"string","Missing pinned Latin leaf "+id);
  return {ok:true,status:200,url,text:async()=>body};
 };
 return {calls,fetchSource};
}
test("44 consecutive date certificates, Holy Family two dates independently approved under BR186/188",()=>{
 assert.equal(LATIN_COMPLINE_RELEASE.approvedDates.length,23);
 assert.equal(CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates.length,7);
 assert.equal(DEC28_JAN03_LATIN_COMPLINE_RELEASE.approvedDates.length,7);
 assert.equal(EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.approvedDates.length,5);
 assert.equal(HOLY_FAMILY_2027_LATIN_COMPLINE_RELEASE.approvedDates.length,2);
 const dates=[...LATIN_COMPLINE_RELEASE.approvedDates,
  ...CHRISTMAS_2026_COMPLINE_RELEASE.approvedDates,
  ...DEC28_JAN03_LATIN_COMPLINE_RELEASE.approvedDates,
  ...EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE.approvedDates,
  ...HOLY_FAMILY_2027_LATIN_COMPLINE_RELEASE.approvedDates];
 assert.equal(new Set(dates).size,44);
 assert.equal(dates.at(-1),"2027-01-10");
 assert.equal(HOLY_FAMILY_2027_TEXT_CERTIFICATE.rubric186ComplineOrdinaryHymnVerified,true);
 assert.equal(HOLY_FAMILY_2027_TEXT_CERTIFICATE.rubric188AssignedOrdinaryDoxologyVerified,true);
 assert.equal(HOLY_FAMILY_2027_TEXT_CERTIFICATE.conflictingIcrspDoxologyInstructionDisclosed,true);
 assert.equal(HOLY_FAMILY_2027_ORDINARY_HYMN_BLOB_SHA,
  "34dc6ce45b64442f36de81cfac6160e733e92316");
 assert.equal(HOLY_FAMILY_2027_PROPER_BLOB_SHA,
  "df64bda0db4cae456ffe1f7a83f7a02cfefc67b0");
 for(const p of HOLY_FAMILY_2027_RELEASE_PROFILES){
  const certificate=reviewHolyFamily2027LatinComplineCertificate(p.date);
  assert.equal(certificate.status,"EXPLICIT_HOLY_FAMILY_2027_LATIN_COMPLINE_CERTIFIED");
  assert.equal(certificate.profile,p);
  assert.equal(certificate.improperVespersDoxologyInsertionForbidden,true);
  const permission=latinComplineReleaseEligibility({date:p.date});
  assert.equal(permission.status,"ELIGIBLE");
  assert.equal(permission.certificateFamily,"HOLY_FAMILY_JAN09_10_FINITE_LATIN");
  assert.equal(permission.officeDate,"2027-01-10");
  assert.equal(permission.psalmDay,"Dominica");
  assert.equal(permission.marianSection,"Nativiti");
  assert.equal(permission.printedPsalmDisplayFrames,30);
  assert.equal(permission.exact1961PsalterLeafVerified,false);
  const route=officeRouteState({date:p.date,hour:"COMPLINE"});
  assert.equal(route.status,"RELEASED");
  assert.equal(route.label,p.label);
  assert.equal(route.officeDate,"2027-01-10");
  assert.equal(route.readingEnabled,true);
  const readiness=getDivineOfficePrayerReadiness({date:p.date});
  assert.equal(readiness.published,true);
 }
});
test("immutable certificate rejects changed Holy Family psalter, hymns or source proof",()=>{
 for(const [date,change] of [
  ["2027-01-09",{psalmDay:"Sabbato"}],
  ["2027-01-09",{officeDate:"2027-01-09"}],
  ["2027-01-10",{officeClass:"II_SUNDAY"}],
  ["2027-01-10",{marianSection:"Advent"}],
  ["2027-01-10",{rubric:"166(h)"}]
 ]){
  const p=HOLY_FAMILY_2027_RELEASE_PROFILES.find(x=>x.date===date);
  assert.equal(reviewHolyFamily2027LatinComplineCertificate(date,{
   candidate:{...p,...change}
  }).status,"WITHHELD");
 }
 for(const change of [
  {rubric188AssignedOrdinaryDoxologyVerified:false},
  {ordinaryTeLucisConclusion:"Jesu, tuis obédiens"},
  {properDoxologyNotReassignedToTeLucis:false},
  {conflictingIcrspDoxologyInstructionDisclosed:false},
  {originalLatinOrdinaryGitBlob:"invalid"},
  {holyFamilyProperDoxologyGitBlob:"invalid"},
  {chantToneOrGregorianNotationCertified:true},
  {translationsApproved:true}
 ]){
  assert.equal(reviewHolyFamily2027LatinComplineCertificate("2027-01-09",{
   certificate:{...HOLY_FAMILY_2027_TEXT_CERTIFICATE,...change}
  }).status,"WITHHELD",JSON.stringify(change));
 }
 for(const date of ["2027-01-08","2027-01-11","2028-01-10"])
  assert.equal(reviewHolyFamily2027LatinComplineCertificate(date).status,"WITHHELD");
});
test("eight full PUBLIC Latin Holy Family recitations preserve Te lucis assigned Ordinary doxology",async()=>{
 for(const p of HOLY_FAMILY_2027_RELEASE_PROFILES)
  for(const context of Object.values(COMPLINE_CONTEXT))
   for(const minister of Object.values(COMPLINE_MINISTER)){
    const source=transport();
    const r=await loadPublishedLatinCompline({
     date:p.date,context,minister,fetchSource:source.fetchSource
    });
    assert.equal(r.status,"PUBLIC_LATIN_COMPLINE",p.date+" "+r.reason);
    assert.equal(r.civilDate,p.date);
    assert.equal(r.officeDate,"2027-01-10");
    assert.equal(r.sourceEventCount,42);
    assert.equal(r.readingEventCount,40);
    assert.equal(r.printedPsalmDisplayFrames,30);
    assert.equal(r.frames.filter(f=>f.kind==="PSALM").length,30);
    assert.deepEqual(r.events.filter(e=>e.kind==="PSALM").map(e=>
     Number(/^Psalterium\/Psalmorum\/Psalm(\d+)/u.exec(e.sourceId)?.[1])),
     [4,90,133]);
    const hymn=r.frames.filter(f=>f.kind==="HYMN");
    assert.equal(hymn.length,3);
    assert.ok(hymn.every(f=>f.sourceId===TE_LUCIS_ID));
    const text=hymn.flatMap(f=>f.texts.la).join(" ");
    assert.match(text,/Te lucis ante términum/u);
    assert.match(text,/Præsta, Pater piíssime/u);
    assert.match(text,/Regnans per omne sǽculum/u);
    assert.doesNotMatch(text,/Jesu, tuis/u);
    assert.doesNotMatch(text,/Semper tibi sit glória/u);
    const marian=r.frames.find(f=>f.kind==="MARIAN_ANTIPHON");
    assert.equal(marian.sourceId,"Psalterium/Mariaant#Nativiti");
    assert.match(marian.texts.la.join(" "),/Post partum/u);
    assert.equal(r.frames.find(f=>f.kind==="MARIAN_COLLECT").sourceId,
     "Psalterium/Mariaant#Nativiti:Oratio");
    assert.deepEqual(r.availableLanguages,["la"]);
    assert.equal(r.blessingAmensRestoredFromPinnedSource,2);
    assert.equal(r.ministerDialoguesResolved,2);
    assert.equal(r.presidingMinister,minister);
    assert.equal(r.openingPaterOmitted,
     context===COMPLINE_CONTEXT.FINAL_PRAYER);
    assert.equal(r.published,true);
    assert.equal(r.rightsApproved,true);
    assert.ok(source.calls.length>=7);
   }
});
test("a proper Holy Family Vespers doxology inserted into Te lucis fails public source gate",async()=>{
 for(const date of ["2027-01-09","2027-01-10"]){
  const source=transport({wrongDoxology:true});
  const r=await loadPublishedLatinCompline({date,fetchSource:source.fetchSource});
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.published,false);
  assert.equal(r.reason,"HOLY_FAMILY_BR186_188_COMPLINE_HYMN_OR_DOXOLOGY_CHANGED");
 }
});
test("11 January onward, other Hours and local calendars remain zero-fetch withheld",async()=>{
 for(const date of ["2027-01-11","2027-01-12","2027-01-13","2028-01-09"]){
  assert.equal(latinComplineReleaseEligibility({date}).status,"WITHHELD");
  assert.equal(officeRouteState({date,hour:"COMPLINE"}).readingEnabled,false);
  for(const context of Object.values(COMPLINE_CONTEXT))
   for(const minister of Object.values(COMPLINE_MINISTER)){
    let n=0;
    const r=await loadPublishedLatinCompline({
     date,context,minister,fetchSource:async()=>{n++;throw Error("NO")}
    });
    assert.equal(r.status,"WITHHELD");
    assert.equal(n,0);
   }
 }
 for(const options of [
  {date:"2027-01-10",hour:"VESPERS"},
  {date:"2027-01-09",hour:"LAUDS"},
  {date:"2027-01-09",calendarScope:"LOCAL"},
  {date:"2027-01-10",calendarScope:"SSPX"}
 ]){
  let n=0;
  const r=await loadPublishedLatinCompline({
   ...options,fetchSource:async()=>{n++;throw Error("NO")}
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(n,0);
 }
});
