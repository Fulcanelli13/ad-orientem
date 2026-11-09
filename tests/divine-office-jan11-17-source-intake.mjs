import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {JAN11_17_CIVIL_DATES,JAN11_17_SOURCE_SCHEMA,
 JAN11_17_RESEARCH_STATUS,reviewJan11_17OfficeSource,
 researchJan11_17PrivateComplineAppointment}
 from "../src/office/compline-jan11-17-2027-source-gate.js";
import {latinComplineReleaseEligibility,loadPublishedLatinCompline,
 LATIN_COMPLINE_RELEASE,CHRISTMAS_2026_COMPLINE_RELEASE,
 DEC28_JAN03_LATIN_COMPLINE_RELEASE,
 EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE,
 HOLY_FAMILY_2027_LATIN_COMPLINE_RELEASE}
 from "../src/office/latin-compline-public-release.js";
import {officeRouteState} from "../src/office/office-route-state.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER}
 from "../src/office/compline-recitation-projection.js";
const source=JSON.parse(readFileSync(new URL(
 "../data/office/research/compline-jan11-17-2027-source-intake.v1.json",
 import.meta.url),"utf8"));
const get=date=>source.dates.find(x=>x.date===date);
test("independent seven-date 11–17 Jan source appointment cannot authorize public text",()=>{
 assert.equal(source.schema,JAN11_17_SOURCE_SCHEMA);
 assert.equal(source.state,"RESEARCH_ONLY");
 assert.equal(source.publicReleaseApproved,false);
 assert.equal(source.completeLatinTextCollated,false);
 assert.deepEqual(source.dates.map(r=>r.date),JAN11_17_CIVIL_DATES);
 assert.equal(new Set(JAN11_17_CIVIL_DATES).size,7);
 assert.equal([LATIN_COMPLINE_RELEASE,CHRISTMAS_2026_COMPLINE_RELEASE,
  DEC28_JAN03_LATIN_COMPLINE_RELEASE,EPIPHANY_JAN04_08_LATIN_COMPLINE_RELEASE,
  HOLY_FAMILY_2027_LATIN_COMPLINE_RELEASE].reduce((s,x)=>s+x.approvedDates.length,0),44);
 for(const date of JAN11_17_CIVIL_DATES){
  const r=get(date);
  const q=reviewJan11_17OfficeSource({date,record:r});
  assert.equal(q.status,JAN11_17_RESEARCH_STATUS,date+" "+q.reason);
  assert.equal(q.appointment.officeDate,r.officeDate);
  assert.equal(q.appointment.psalmDay,r.psalmDay);
  assert.equal(q.appointment.marianSection,"Nativiti");
  assert.deepEqual(q.appointment.psalmIds,r.psalmIds);
  assert.equal(q.appointment.printedPsalmFrames,r.printedPsalmFrames);
  assert.equal(q.sourceTextCertified,false);
  assert.equal(q.published,false);
  assert.equal(q.publicReleaseApproved,false);
  const privateSource=researchJan11_17PrivateComplineAppointment(date);
  assert.equal(privateSource.status,"EXPLICIT_POST_EPIPHANY_PRIVATE_SOURCE_RESEARCH");
  assert.equal(privateSource.rightsApproved,false);
  assert.equal(privateSource.published,false);
 }
});
test("13 Jan Baptism and 16 Jan Sunday First Vespers have distinct and exact Psalter",()=>{
 const baptism=get("2027-01-13");
 assert.equal(baptism.weekday,"Feria IV");
 assert.equal(baptism.officeClass,"II_FEAST");
 assert.equal(baptism.rubric,"1960_VARIATIONES_24;168(d)");
 assert.equal(baptism.psalmDay,"Dominica");
 assert.deepEqual(baptism.psalmIds,[4,90,133]);
 const saturday=get("2027-01-16");
 assert.equal(saturday.weekday,"Sabbato");
 assert.equal(saturday.officeClass,"II_SUNDAY_FIRST_VESPERS");
 assert.equal(saturday.officeDate,"2027-01-17");
 assert.equal(saturday.rubric,"166(b)");
 assert.equal(saturday.psalmDay,"Sabbato");
 assert.deepEqual(saturday.psalmIds,[87,102]);
 assert.equal(saturday.printedPsalmFrames,41);
 const sunday=get("2027-01-17");
 assert.equal(sunday.rubric,"166(h)");
 assert.equal(sunday.psalmDay,"Dominica");
 assert.deepEqual(sunday.psalmIds,[4,90,133]);
 for(const date of JAN11_17_CIVIL_DATES)
  assert.equal(get(date).marianSection,"Nativiti");
});
test("mutated after-Epiphany weekday, Baptism feast and Saturday vespers are withheld",()=>{
 const mutation=[
  ["2027-01-11",{psalmDay:"Dominica"}],
  ["2027-01-12",{psalmDay:"Feria IV"}],
  ["2027-01-13",{psalmDay:"Feria IV"}],
  ["2027-01-13",{officeClass:"IV_FERIA"}],
  ["2027-01-13",{psalmIds:[33,60]}],
  ["2027-01-14",{psalmDay:"Dominica"}],
  ["2027-01-15",{psalmDay:"Sabbato"}],
  ["2027-01-16",{psalmDay:"Dominica"}],
  ["2027-01-16",{psalmIds:[4,90,133]}],
  ["2027-01-16",{officeDate:"2027-01-16"}],
  ["2027-01-16",{firstVespers:"NONE"}],
  ["2027-01-17",{psalmDay:"Sabbato"}],
  ["2027-01-17",{marianSection:"Advent"}],
  ["2027-01-13",{textVerified:true}],
  ["2027-01-16",{published:true}],
  ["2027-01-17",{holdReasons:[]}]
 ];
 for(const [date,change] of mutation){
  const q=reviewJan11_17OfficeSource({date,record:{...get(date),...change}});
  assert.equal(q.status,"WITHHELD",date+" "+JSON.stringify(change));
  assert.equal(q.published,false);
 }
 for(const date of ["2027-01-10","2027-01-18","2028-01-16"])
  assert.equal(reviewJan11_17OfficeSource({date,record:{...get("2027-01-16"),date}}).status,"WITHHELD");
});
test("all 7 × 2 × 2 future public Compline readers withhold without network fetch",async()=>{
 for(const date of JAN11_17_CIVIL_DATES){
  assert.equal(latinComplineReleaseEligibility({date}).status,"WITHHELD");
  assert.equal(officeRouteState({date,hour:"COMPLINE"}).readingEnabled,false);
  for(const context of Object.values(COMPLINE_CONTEXT))
   for(const minister of Object.values(COMPLINE_MINISTER)){
    let requests=0;
    const r=await loadPublishedLatinCompline({
     date,context,minister,fetchSource:async()=>{
      requests++;throw Error("UNAPPROVED_POST_EPIPHANY_FETCH")
     }
    });
    assert.equal(r.status,"WITHHELD");
    assert.equal(r.published,false);
    assert.deepEqual(r.frames,[]);
    assert.equal(requests,0);
   }
 }
});
