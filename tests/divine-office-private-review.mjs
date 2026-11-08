import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {projectPrivateOfficeReview,assemblePrivateOfficeReview}
 from "../src/office/private-office-review.js";

const load=name=>JSON.parse(readFileSync(new URL(
 "../tests/fixtures/office/"+name,import.meta.url),"utf8"));
const languages={Latin:"la",English:"en",Francais:"fr"};
const prefix="https://raw.githubusercontent.com/DivinumOfficium/divinum-officium/"+
 PIN+"/web/www/horas/";
const compline={};
for(const lang of ["la","en","fr"]){
 compline[lang]={
  sat:load("advent-i-saturday-compline-"+lang+".json"),
  tue:load("advent-i-feria-iii-compline-"+lang+".json"),
  rest:load("advent-i-week-compline-"+lang+".json")
 };
}
const vespers={};
for(const lang of ["la","en","fr"])
 vespers[lang]=load("advent-i-preview-"+lang+".json");
const ordinary=readFileSync(new URL(
 "../tests/fixtures/office/advent-i-preview-ordinary.txt",import.meta.url),"utf8");
const universal=JSON.parse(readFileSync(new URL(
 "../data/office/research/advent-i-2026-universal-commemoration.json",
 import.meta.url),"utf8"));

function complineFetch({corruptFrench=false}={}){
 return async(url)=>{
  assert.ok(url.startsWith(prefix));
  const m=/^(Latin|English|Francais)\/(.+)\.txt$/u.exec(url.slice(prefix.length));
  assert.ok(m,"no unpinned or non-language source");
  const lang=languages[m[1]],path=m[2],f=compline[lang];
  let body;
  if(path.startsWith("Psalterium/Psalmorum/Psalm")){
   const number=Number(path.slice("Psalterium/Psalmorum/Psalm".length));
   if([87,102,233].includes(number))body=f.sat.psalms[number];
   else if([11,12,15].includes(number))body=f.tue.psalms[number].text;
   else body=f.rest.psalms[number]?.text;
  }else{
   const sections=f.sat.sections[path];
   assert.ok(sections,"real pinned-section fixture missing: "+path);
   body=Object.entries(sections)
     .map(([key,lines])=>"["+key+"]\n"+lines.join("\n"))
     .join("\n\n")+"\n";
  }
  assert.ok(typeof body==="string");
  if(corruptFrench&&lang==="fr"&&path.endsWith("Psalm70"))body=body.slice(0,10);
  return {ok:true,status:200,url,text:async()=>body};
 };
}
function vespersFetch(){
 return async(url)=>{
  assert.ok(url.startsWith(prefix));
  const rest=url.slice(prefix.length);
  let body;
  if(rest==="Ordinarium/Vespera.txt")body=ordinary;
  else{
   const m=/^(Latin|English|Francais)\/(.+)\.txt$/u.exec(rest);
   assert.ok(m);const lang=languages[m[1]],path=decodeURIComponent(m[2]);
   const f=vespers[lang];
   body=f.leaves[path]||
    (f.sections[path]&&Object.entries(f.sections[path])
      .map(([key,lines])=>"["+key+"]\n"+lines.join("\n")).join("\n\n")+"\n");
  }
  assert.equal(typeof body,"string","no source fallback");
  return {ok:true,status:200,url,text:async()=>body};
 };
}
const days=[
 "2026-11-28","2026-11-29","2026-11-30","2026-12-01",
 "2026-12-02","2026-12-03","2026-12-04","2026-12-05"
];
test("real eight-date Compline fixtures render original trilingual 42-block private reading frames",async()=>{
 for(const date of days){
  const result=await assemblePrivateOfficeReview({
   hour:"COMPLINE",date,fetchSource:complineFetch()
  });
  if(result.status!=="PRIVATE_SOURCE_TEXT_REVIEW"){
   const {createComplinePinnedReader,assembleDatedComplinePilot}=
    await import("../src/office/saturday-compline-2026-pilot.js");
   const reader=createComplinePinnedReader({date,fetchSource:complineFetch()});
   const pilot=await assembleDatedComplinePilot({date,reader});
   const invalidFrame=pilot.frames?.findIndex(f=>!f||typeof f.kind!=="string"||
    !("sourceId" in f)||!["la","en","fr"].every(lang=>
     Array.isArray(f.texts?.[lang])&&f.texts[lang].length>0&&
     f.texts[lang].every(t=>typeof t==="string"&&t.length>0&&t.length<20000)));
   assert.fail(JSON.stringify({date,reason:result.reason,pilotStatus:pilot.status,
     pilotReason:pilot.reason,sourceRevision:pilot.sourceRevision,
     blockCount:pilot.blockCount,frameCount:pilot.frames?.length,
     focusFrameCount:pilot.focusFrameCount,invalidFrame,
     invalidSource:pilot.frames?.[invalidFrame]?.sourceId,
     firstFrame:pilot.frames?.[0]&&{kind:pilot.frames[0].kind,sourceId:pilot.frames[0].sourceId}}));
  }
  assert.equal(result.status,"PRIVATE_SOURCE_TEXT_REVIEW",date+": "+result.reason);
  assert.equal(result.eventCount,42);
  assert.equal(result.hour,"COMPLINE");
  assert.equal(result.officeDate,date);
  assert.equal(result.rightsApproved,false);
  assert.equal(result.liturgicallyCertified,false);
  assert.equal(result.published,false);
  assert.ok(result.frameCount>42);
  assert.ok(result.frames.some(f=>f.kind==="PSALM"));
  assert.ok(result.frames.every(f=>["la","en","fr"].every(lang=>
   f.texts[lang].every(t=>t.length>0))));
 }
});
test("Advent I First Vespers preserves separate civil/Office dates and verse-focused original source",async()=>{
 const r=await assemblePrivateOfficeReview({
  hour:"VESPERS",date:"2026-11-28",fetchSource:vespersFetch(),
  universalWitness:universal
 });
 assert.equal(r.status,"PRIVATE_SOURCE_TEXT_REVIEW",r.reason);
 assert.equal(r.eventCount,38);
 assert.equal(r.civilDate,"2026-11-28");
 assert.equal(r.officeDate,"2026-11-29");
 assert.ok(r.frameCount>r.eventCount);
 assert.ok(r.frames.some(f=>f.kind==="MAGNIFICAT"));
 assert.equal(r.rightsApproved,false);
 assert.equal(r.published,false);
});
test("an incomplete French Compline source withholds every frame",async()=>{
 const r=await assemblePrivateOfficeReview({
  hour:"COMPLINE",date:"2026-12-03",
  fetchSource:complineFetch({corruptFrench:true})
 });
 assert.equal(r.status,"WITHHELD");
 assert.equal(r.frames.length,0);
 assert.equal(r.published,false);
});
test("no Office is fabricated outside the finite reviewed date and Hour scope",async()=>{
 for(const [hour,date] of [["MATINS","2026-11-28"],
  ["VESPERS","2026-11-29"],["COMPLINE","2026-11-08"]]){
  const r=await assemblePrivateOfficeReview({
   hour,date,fetchSource:complineFetch(),universalWitness:universal
  });
  assert.equal(r.status,"WITHHELD");
  assert.equal(r.frames.length,0);
 }
});
test("null calendar notice source and all release flags remain explicitly unverified",()=>{
 const p=projectPrivateOfficeReview({hour:"VESPERS",date:"2026-11-28"});
 assert.equal(p.status,"WITHHELD");
 assert.equal(p.rightsApproved,false);
 assert.equal(p.published,false);
});
