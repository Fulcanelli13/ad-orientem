import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {createLatinComplinePinnedReader,assembleLatinDatedComplinePilot}
 from "../src/office/saturday-compline-2026-pilot.js";
import {assemblePrivateOfficeReview}
 from "../src/office/private-office-review.js";
import {COMPLINE_CONTEXT,projectComplineRecitation}
 from "../src/office/compline-recitation-projection.js";

const load=name=>JSON.parse(readFileSync(
 new URL("../tests/fixtures/office/"+name+"-la.json",import.meta.url),"utf8"));
const saturday=load("advent-i-saturday-compline");
const tuesday=load("advent-i-feria-iii-compline");
const week=load("advent-i-week-compline");
const base="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/";
function source({truncate=false}={}){
 const calls=[];
 const fetchSource=async(url)=>{
  calls.push(url);
  assert.ok(url.startsWith(base+"Latin/"),
   "Latin-only Compline requested a translation: "+url);
  const raw=decodeURIComponent(url.slice((base+"Latin/").length));
  assert.match(raw,/\.txt$/u);
  const id=raw.slice(0,-4);
  let body;
  if(id.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(id.slice("Psalterium/Psalmorum/Psalm".length));
   body=[87,102,233].includes(n)?saturday.psalms[n]:
    [11,12,15].includes(n)?tuesday.psalms[n]?.text:
    week.psalms[n]?.text;
   if(truncate&&n===87)body=body.slice(0,15);
  }else{
   const items=saturday.sections[id];
   assert.ok(items,"Original Latin source file not whitelisted: "+id);
   body=Object.entries(items)
    .map(([heading,lines])=>"["+heading+"]\n"+lines.join("\n"))
    .join("\n\n")+"\n";
  }
  assert.equal(typeof body,"string",id);
  return {ok:true,status:200,url,text:async()=>body};
 };
 return {fetchSource,calls};
}
const dates=["2026-11-28","2026-11-29","2026-11-30","2026-12-01",
 "2026-12-02","2026-12-03","2026-12-04","2026-12-05"];
test("all eight appointed dates assemble 42 complete Latin blocks without reading any translations",async()=>{
 for(const date of dates){
  const transport=source();
  const reader=createLatinComplinePinnedReader({date,fetchSource:transport.fetchSource});
  const result=await assembleLatinDatedComplinePilot({reader,date});
  assert.match(result.status,/SOURCE_FIRST_.*COMPLINE_RESEARCH_NOT_CERTIFIED/u,date+": "+result.reason);
  assert.equal(result.sourceRevision,PIN);
  assert.deepEqual(result.availableLanguages,["la"]);
  assert.equal(result.blockCount,42);
  assert.equal(result.blocks.at(-1).kind,"FINAL_ASSISTANCE");
  assert.match(result.blocks.at(-1).texts.la[0],/^Divínum auxílium/u);
  assert.equal(result.blocks.at(-1).texts.la[1],"R. Amen.");
  assert.equal(result.blocks.some(x=>x.kind==="FINAL_RESPONSE"),false);
  assert.match(result.blocks.find(x=>x.kind==="BLESSING"&&x.sourceId.includes("Completorium2")).texts.la[0],/Benedícat et custódiat/u);
  assert.ok(result.focusFrameCount>42);
  assert.ok(result.blocks.every(b=>
   Object.keys(b.texts).length===1&&Array.isArray(b.texts.la)&&b.texts.la.length>0));
  assert.ok(result.frames.every(f=>
   Object.keys(f.texts).length===1&&Array.isArray(f.texts.la)&&f.texts.la.length>0));
  assert.equal(result.sourceTextAltered,false);
  assert.equal(result.officeCompletenessCertified,false);
  assert.equal(result.rightsApproved,false);
  assert.equal(result.published,false);
  assert.ok(transport.calls.length>0);
  assert.ok(transport.calls.every(u=>u.includes("/Latin/")));
  assert.equal(reader.cachedDistinctFiles(),reader.maxDistinctFiles);
  await assert.rejects(reader.section("Psalterium/Common/Prayers","Pater noster","fr"),/COMPLINE_LANGUAGE_NOT_SUPPORTED/);
 }
});
test("native review projects Latin source text without any English/French witness",async()=>{
 const transport=source();
 const reading=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date:"2026-11-28",
  fetchSource:transport.fetchSource,languageMode:"latin"
 });
 assert.equal(reading.status,"PRIVATE_SOURCE_TEXT_REVIEW",reading.reason);
 assert.deepEqual(reading.availableLanguages,["la"]);
 assert.equal(reading.eventCount,42);
 assert.ok(reading.frameCount>42);
 assert.equal(reading.readingPublished,false);
 assert.equal(reading.publishable,false);
 assert.equal(reading.published,false);
 assert.ok(transport.calls.every(x=>x.includes("/Latin/")));
});
test("Latin missing source fails closed and cannot display partial Hour",async()=>{
 const r=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date:"2026-11-28",
  fetchSource:source({truncate:true}).fetchSource,
  languageMode:"latin"
 });
 assert.equal(r.status,"WITHHELD");
 assert.equal(r.frames.length,0);
 assert.equal(r.published,false);
});
test("language scopes and unreviewed dates never silently default to other witnesses",async()=>{
 const transport=source();
 const bad=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date:"2026-11-28",
  fetchSource:transport.fetchSource,languageMode:"latin-and-french"
 });
 assert.equal(bad.status,"WITHHELD");
 assert.equal(transport.calls.length,0);
 for(const d of ["2026-11-27","2026-12-06"]){
  const x=await assemblePrivateOfficeReview({
   hour:"COMPLINE",date:d,fetchSource:transport.fetchSource,languageMode:"latin"
  });
  assert.equal(x.status,"WITHHELD");
 }
});

test("1961 §147 and Office §56: last-prayer Compline substitutes examen for ONLY the opening Pater",async()=>{
 const transport=source();
 const raw=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date:"2026-11-28",
  fetchSource:transport.fetchSource,languageMode:"latin"
 });
 assert.equal(raw.status,"PRIVATE_SOURCE_TEXT_REVIEW",raw.reason);
 const final=projectComplineRecitation(raw,{context:COMPLINE_CONTEXT.FINAL_PRAYER});
 assert.equal(final.status,"PRIVATE_SOURCE_TEXT_REVIEW",final.reason);
 assert.equal(final.eventCount,42,"complete original source register preserved");
 assert.equal(final.frames.length,raw.frames.length);
 assert.equal(final.openingPaterOmitted,true);
 assert.equal(final.editorialRubricFrames,1);
 assert.equal(final.frames.filter(f=>f.kind==="EXAMINATION").length,1);
 assert.equal(final.frames.some(f=>f.kind==="PATER_NOSTER"&&
  f.sourceId==="Psalterium/Common/Prayers#Pater noster"),false);
 assert.ok(final.frames.some(f=>f.kind==="PATER_NOSTER"&&
  f.sourceId==="Psalterium/Common/Prayers#Pater noster Et"),
  "later Compline Pater noster must remain");
 assert.equal(final.frames.find(f=>f.kind==="EXAMINATION").originalSourceOnly,false);
 assert.equal(final.published,false);
 const other=projectComplineRecitation(raw,{context:COMPLINE_CONTEXT.OTHER_TIME});
 assert.equal(other.status,"PRIVATE_SOURCE_TEXT_REVIEW");
 assert.equal(other.frames.some(f=>f.sourceId==="Psalterium/Common/Prayers#Pater noster"),true);
 assert.equal(other.editorialRubricFrames,0);
 assert.equal(other.published,false);
 assert.equal(projectComplineRecitation(raw,{context:"CHOIR_UNDEFINED"}).status,"WITHHELD");
});
