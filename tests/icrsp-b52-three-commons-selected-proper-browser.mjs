/**
 * ICRSP B52 — use the REAL production Calendar/Proper resolver to prevent
 * plausible but false Common-formulary substitutions. RESEARCH ONLY.
 * Printed family structures: B41. Actual source-day baseline: B42.
 * Does not create or authorize a selectable Common, mutate a Mass or
 * certify any source translation or publication rights.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const b41=JSON.parse(await readFile(resolve(root,"data/source-text/icrsp-france-b41-1962-vatican-three-commons-print-image-collation.v1.json"),"utf8"));
const b42=JSON.parse(await readFile(resolve(root,"data/source-text/icrsp-france-b42-first-live-18-date-resolver-observations.v1.json"),"utf8"));
assert.equal(b41.cases.length,3,"B41 three photographed 1962 Common families required");
assert.equal(b41.counts.printedPagesInspected,11);
const fam=new Map(b41.cases.map(x=>[x.id,x]));
for(const id of ["CONFESSOR_PONTIFF_STATUIT","MULTIPLE_VIRGIN_MARTYRS","MULTIPLE_NONVIRGIN_FEMALE_MARTYRS"])
  assert.ok(fam.has(id),id+" missing original-Missal witness");
const rules=(id)=>fam.get(id).printedRules;
assert.ok(rules("CONFESSOR_PONTIFF_STATUIT").some(x=>x.kind==="ALTERNATE_MASS"&&x.name==="Sacerdotes tui"));
assert.ok(rules("MULTIPLE_VIRGIN_MARTYRS").some(x=>x.kind==="EPISTLE_SUBSTITUTION"&&x.reference==="1 Cor.7:25-34"));
assert.ok(rules("MULTIPLE_VIRGIN_MARTYRS").some(x=>x.kind==="ALTERNATE_GOSPEL"&&x.reference==="Mt.19:3-12"));
assert.ok(rules("MULTIPLE_NONVIRGIN_FEMALE_MARTYRS").some(x=>x.kind==="PLURAL_SUBSTITUTION"));
assert.ok(!rules("MULTIPLE_NONVIRGIN_FEMALE_MARTYRS").some(x=>x.kind==="EPISTLE_SUBSTITUTION"),
  "Non-virgin female martyrs cannot inherit Virgins' replacement Epistle");

const scope=[
 {date:"2026-11-11",main:"sancti:11-11:3:w",path:"Sancti/11-11",
  introit:"Statuit ei Dominus",collect:"Deus qui conspicis",
  neverCollect:"Da quaesumus omnipotens Deus ut beati N"},
 {date:"2026-03-06",main:"tempora:Quad2-5:3:v",path:"Tempora/Quad2-5",
  introit:"Ego autem cum justitia apparebo",collect:"Da quaesumus omnipotens Deus"},
 {date:"2026-07-10",main:"sancti:07-10:3:r",path:"Sancti/07-10",
  introit:"Laudate pueri Dominum",neverIntroit:"Me exspectaverunt"}
];
const prior=new Map(b42.dateRows.map(x=>[x.date,x]));
for(const row of scope){
 const witness=prior.get(row.date);
 assert.equal(witness?.mainId,row.main,row.date+": B42 source ID changed");
 assert.equal(witness?.sourcePath,row.path,row.date+": B42 Proper path changed");
}
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".woff2":"font/woff2",
 ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async (req,res)=>{
 try {
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser,rows;
try {
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 rows=await page.evaluate(async dates=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const text=(a)=>typeof a==="string"?a:String(a?.lat??a?.la??a?.latin??"");
  return Promise.all(dates.map(async date=>{
   try {
    const x=await resolver.resolveDay(date),p=x?.proper?.data??{};
    const first=a=>Array.isArray(a)?a[0]:a;
    return {date,status:x?.status??null,selectedId:x?.day?.main?.id??null,
      sourcePath:p.sourcePath??null,properStatus:x?.proper?.status??null,
      introit:text(p.introit),collect:text(first(p.collects??p.collect)),
      gospel:text(p.gospel),commemorations:x?.day?.commemorations?.length??0,
      sourceLabels:(p.calendarCommemorations??[]).map(y=>y.prayerSourcePath??y.path??null)};
   }catch(e){return {date,error:String(e?.message??e)};}
  }));
 },scope.map(x=>x.date));
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
const words=s=>String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"")
 .replace(/[^a-zA-Z]+/g," ").trim().replace(/\s+/g," ").toLowerCase();
const contains=(t,phrase)=>(" "+words(t)+" ").includes(" "+words(phrase)+" ");
let assertions=0;
for(const expected of scope){
 const actual=rows.find(x=>x.date===expected.date);
 assert.equal(actual?.status,"ready",expected.date+" day resolution");
 assert.equal(actual?.properStatus,"ready",expected.date+" Proper resolution");
 assert.equal(actual?.selectedId,expected.main,expected.date+" selected principal");
 assert.equal(actual?.sourcePath,expected.path,expected.date+" source identity");
 assert.ok(contains(actual.introit,expected.introit),expected.date+" Introit");
 if(expected.collect) assert.ok(contains(actual.collect,expected.collect),expected.date+" Collect");
 if(expected.neverIntroit) assert.ok(!contains(actual.introit,expected.neverIntroit),
    expected.date+" wrongly inserted a different Common Introit");
 if(expected.neverCollect) assert.ok(!contains(actual.collect,expected.neverCollect),
    expected.date+" feast-specific Collect lost to generic Common");
 assertions++;
 console.log("ICRSP_B52_REAL_SELECTED_PROPER="+JSON.stringify({
  date:actual.date,principalId:actual.selectedId,path:actual.sourcePath,
  expectedIntroitPresent:true,ownCollectPresent:!!expected.collect,
  wrongCommonInsertionBlocked:!!(expected.neverCollect||expected.neverIntroit),
  fullLatinPrintedEditionCertified:false,completeBilingualFormularyCertified:false}));
}
console.log("ICRSP_B52_SUMMARY="+JSON.stringify({
 photographedCommons:3,printPagesInspected:11,liveDatesChecked:rows.length,
 liveSelectedProperAssertions:assertions,actualMissingCommonRuntimeTextProven:0,
 allThreeCommonFamilyAlternateSelectionsRuntimeCertified:false,
 publicationApproved:false,productionChanged:false}));
assert.equal(assertions,3);
