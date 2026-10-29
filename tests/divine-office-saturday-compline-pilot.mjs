import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {DIVINUM_OFFICIUM_PIN as PIN} from "../src/app/source-transport-compat.js";
import {assembleSaturdayComplinePilot as assemble,
 createSaturdayComplinePinnedReader}
 from "../src/office/saturday-compline-2026-pilot.js";

const f=Object.fromEntries(["la","en","fr"].map(l=>[l,JSON.parse(
 readFileSync(new URL("../tests/fixtures/office/advent-i-saturday-compline-"+l+".json",
 import.meta.url),"utf8"))]));
const direct={
 sourceRevision:PIN,
 async section(path,name,language){
  const text=f[language]?.sections?.[path]?.[name];
  if(!Array.isArray(text))throw Error("FIXTURE_SOURCE_MISSING:"+language+":"+path+"#"+name);
  return [...text];
 },
 async psalm(n,l){return f[l]?.psalms?.[n]}
};
test("1960 rubric 166(b): Saturday Compline, not Sunday, after Advent First Vespers",async()=>{
 const p=await assemble({reader:direct});
 assert.equal(p.status,"SOURCE_FIRST_SATURDAY_COMPLINE_RESEARCH_NOT_CERTIFIED",p.reason);
 assert.equal(p.officeDate,"2026-11-28");
 assert.equal(p.civilDate,"2026-11-28");
 assert.equal(p.rubricalAppointment,
  "SATURDAY_COMPLINE_AFTER_SUNDAY_FIRST_VESPERS_BR166B");
 assert.equal(p.hour,"COMPLINE");
 assert.equal(p.blockCount,42);
 assert.equal(p.blocks.filter(x=>x.kind==="PSALM").length,3);
 assert.deepEqual(p.blocks.filter(x=>x.kind==="PSALM").map(x=>x.sourceId),[
  "Psalterium/Psalmorum/Psalm87#2-19",
  "Psalterium/Psalmorum/Psalm102#1-12",
  "Psalterium/Psalmorum/Psalm102#13-22"
 ]);
 assert.equal(p.blocks.filter(x=>x.kind==="CANTICLE").length,1);
 assert.equal(p.blocks.filter(x=>x.kind==="DOXOLOGY").length,4);
 assert.equal(p.blocks.filter(x=>x.kind==="ANTIPHON").length,4);
 assert.equal(p.blocks.filter(x=>x.kind==="MARIAN_ANTIPHON").length,1);
 assert.equal(p.blocks.filter(x=>x.kind==="MARIAN_COLLECT").length,1);
 assert.equal(p.blocks.filter(x=>x.kind==="COLLECT").length,1);
 assert.equal(p.blocks.filter(x=>x.kind==="SHORT_RESPONSORY").length,1);
 for(const b of p.blocks)for(const l of ["la","en","fr"]){
  assert.ok(Array.isArray(b.texts[l])&&b.texts[l].length>0,
    b.sourceId+" "+l);
  assert.equal(b.originalSourceOnly,true);
 }
 assert.ok(p.focusFrameCount>p.blockCount);
 assert.equal(p.sourceDocumentsPerLanguage,7);
 assert.equal(p.officeCompletenessCertified,false);
 assert.equal(p.rightsApproved,false);
 assert.equal(p.publishable,false);
 assert.equal(p.published,false);
});
test("the Latin Compline original includes Saturday antiphon, Marian collect, and the night blessing",async()=>{
 const p=await assemble({reader:direct});
 assert.equal(p.status,"SOURCE_FIRST_SATURDAY_COMPLINE_RESEARCH_NOT_CERTIFIED",p.reason);
 assert.match(p.blocks.find(x=>x.kind==="ANTIPHON").texts.la[0],
  /Intret orátio mea/u);
 assert.match(p.blocks.find(x=>x.kind==="HYMN").texts.la.join(" "),/Te lucis/);
 assert.match(p.blocks.find(x=>x.kind==="CANTICLE").texts.la.join(" "),/Nunc dimíttis/);
 assert.match(p.blocks.find(x=>x.kind==="MARIAN_ANTIPHON").texts.la.join(" "),
  /Alma Redemptóris Mater/);
 assert.match(p.blocks.find(x=>x.kind==="MARIAN_COLLECT").texts.la[0],
  /Grátiam tuam/);
 assert.equal(p.blocks.filter(x=>x.kind==="PATER_NOSTER").length,2);
});
test("missing French Saturday antiphon, Marian collect or psalm blocks the whole new pilot",async()=>{
 for(const breakReader of [
  {section:async(p,n,l)=>{
   if(l==="fr"&&p==="Psalterium/Psalmi/Psalmi minor"&&n==="Completorium")
    return ["Dominica = incorrect","4,90,133"];
   return direct.section(p,n,l);
  },psalm:direct.psalm},
  {section:async(p,n,l)=>{
   if(l==="en"&&p==="Psalterium/Mariaant")return ["missing antiphon"];
   return direct.section(p,n,l);
  },psalm:direct.psalm},
  {section:direct.section,psalm:async(n,l)=>l==="fr"&&n===87?"":direct.psalm(n,l)}
 ]){
  const out=await assemble({reader:{sourceRevision:PIN,...breakReader}});
  assert.equal(out.status,"WITHHELD");
  assert.equal(out.blocks.length,0);
  assert.equal(out.published,false);
 }
});
test("source URL reader reads only the exact 21 pinned leaves and denies other Psalms",async()=>{
 let calls=[];
 const reader=createSaturdayComplinePinnedReader({fetchSource:async(url,init)=>{
  calls.push(url);
  assert.ok(url.includes(PIN)&&url.endsWith(".txt"));
  assert.equal(init.credentials,"omit");
  const m=/\/(Latin|English|Francais)\/(.+)\.txt$/u.exec(url);
  assert.ok(m);
  const lang={Latin:"la",English:"en",Francais:"fr"}[m[1]];
  const path=decodeURIComponent(m[2]);
  const source=f[lang];
  let text;
  if(path.startsWith("Psalterium/Psalmorum/Psalm")){
   const n=Number(path.match(/Psalm(\d+)$/u)?.[1]);
   text=source.psalms[n];
  }else{
   const v=source.sections[path];
   assert.ok(v);
   text=Object.entries(v).map(([key,rows])=>"["+key+"]\n"+rows.join("\n"))
    .join("\n\n");
  }
  return {ok:true,status:200,url,text:async()=>text};
 }});
 const output=await assemble({reader});
 assert.equal(output.status,"SOURCE_FIRST_SATURDAY_COMPLINE_RESEARCH_NOT_CERTIFIED",output.reason);
 assert.equal(reader.cachedDistinctFiles(),21);
 assert.equal(new Set(calls).size,21);
 await assert.rejects(reader.psalm(109,"la"),/NOT_ALLOWED/);
 await assert.rejects(reader.section("Tempora/Adv1-0","Oratio","fr"),/NOT_ALLOWED/);
});
