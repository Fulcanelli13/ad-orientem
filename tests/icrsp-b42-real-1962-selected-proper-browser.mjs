/**
 * B42: observe the REAL browser production Calendar DayResolver and print gate.
 * No invented Common selector, fake Proper fixture or source-text copying.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const plan=JSON.parse(await readFile(resolve(root,"data/source-text/icrsp-france-b42-real-calendar-18-proper-probe-plan.v1.json"),"utf8"));
assert.equal(plan.schema,"AO_ICRSP_B42_REAL_PRODUCTION_1962_DATE_PROBE_PLAN_V1");
assert.equal(plan.oracleCases.length,18);
assert.equal(new Set(plan.oracleCases.map(x=>x.date)).size,18);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",
 ".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const filename=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(filename!==root&&!filename.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(filename);
  res.writeHead(200,{"content-type":mime[extname(filename)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser,observations=[];
try {
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 for(let i=0;i<plan.oracleCases.length;i+=6){
  const dates=plan.oracleCases.slice(i,i+6).map(x=>x.date);
  const rows=await page.evaluate(async dates=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   const {assessPrintableProper}=await import("/src/calendar/print-proper.js");
   const {selectedCalendarProperProjection}=await import("/src/learn/mass-explorer-selected-calendar-proper.js");
   const str=s=>String(s??"").trim();
   const short=s=>str(s).replace(/\s+/g," ").slice(0,95);
   const latin=x=>typeof x==="string"?x:str(x?.lat??x?.la??x?.latin??x?.text?.lat);
   const lang=(x,k)=>typeof x==="string"?"":str(x?.[k]??x?.text?.[k]);
   const first=x=>Array.isArray(x)?x[0]:x;
   const simple=x=>({latin:short(latin(x)),englishPresent:Boolean(lang(x,"en")),frenchPresent:Boolean(lang(x,"fr"))});
   return Promise.all(dates.map(async date=>{
    try{
     const resolution=await resolver.resolveDay(date);
     const main=resolution?.day?.main||{},proper=resolution?.proper?.data||{};
     const pair={selectedDate:date,resolution};
     const print={};
     for(const language of ["en","fr"]){
      try {
       const a=assessPrintableProper(resolution,{language,massForm:"MISSA_CANTATA_SIMPLE"});
       print[language]={ready:Boolean(a?.ok),reason:str(a?.reason),missing:Array.isArray(a?.missing)?a.missing:[]};
      }catch(e){print[language]={ready:false,error:String(e?.message||e)};}
     }
     const projections={};
     for(const [language,french] of [["en",false],["fr",true]]){
      try{
       const a=selectedCalendarProperProjection(pair,{french});
       projections[language]={ready:Boolean(a),sourcePath:a?.sourcePath??null,availableSlots:a?.slotsAvailable??0};
      }catch(e){projections[language]={ready:false,error:String(e?.message||e)};}
     }
     const comm=resolution?.day?.commemorations||main.commemorations||resolution?.commemorations||[];
     const explicit=proper?.calendarCommemorations||[];
     return {date,resolvedDate:resolution?.date??null,status:resolution?.status??null,
      main:{id:main.id??null,title:main.title??main.name??null,rank:main.rank??null},
      proper:{status:resolution?.proper?.status??null,sourcePath:proper.sourcePath??null,
       title:proper.name??null,rank:proper.rank??null,
       introit:simple(proper.introit),collect:simple(first(proper.collects)),
       epistle:simple(proper.epistle),gospel:simple(proper.gospel),
       collectCount:proper.collects?.length??0,secretCount:proper.secrets?.length??0,
       postcommunionCount:proper.postcommunions?.length??0,
       sourceCommemorations:explicit.map(x=>({name:x.name??null,path:x.path??null,prayerSourcePath:x.prayerSourcePath??null}))},
      observedCommemorations:Array.isArray(comm)?comm.map(x=>typeof x==="string"?x:{id:x?.id??null,title:x?.title??x?.name??null}):[],
      printGate:print,explorerProjection:projections,exception:null};
    }catch(e){return {date,status:"exception",exception:String(e?.stack||e).slice(0,600)};}
   }));
  },dates);
  observations.push(...rows);
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
const checks=[];
const byDate=new Map(observations.map(x=>[x.date,x]));
for(const spec of plan.expectedHardAssertions){
 const a=byDate.get(spec.date),issues=[];
 if(!a||a.status!=="ready"||a.resolvedDate!==spec.date)issues.push("DAY_RESOLVER_NOT_READY_FOR_EXACT_DATE");
 if(a?.proper?.status!=="ready"||!a?.proper?.sourcePath)issues.push("CANONICAL_SELECTED_PROPER_UNAVAILABLE");
 const main=String(a?.main?.id??"").toLowerCase();
 const introit=String(a?.proper?.introit?.latin??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
 if(spec.rule==="MAIN_ST_MARTIN_AND_STATUIT_LATIN_INTROIT"){
  if(!main.includes("sancti:11-11"))issues.push("ST_MARTIN_NOT_PRINCIPAL_SOURCE_ID");
  if(!/statuit\s+ei\s+dominus/.test(introit))issues.push("STATUIT_NOT_SELECTED_LATIN_INTROIT");
  const collect=String(a?.proper?.collect?.latin??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
  if(!/deus\s+qui\s+conspicis/.test(collect))issues.push("SAINT_MARTIN_FEAST_SPECIFIC_COLLECT_MISSING_OR_REPLACED_BY_GENERIC_COMMON");
 }else if(spec.rule==="ST_REMI_IS_NOT_PRINCIPAL_STATUIT_MASS"){
  if(/sancti:10-01/.test(main))issues.push("REMI_WRONGLY_PRINCIPAL");
  if(/statuit\s+ei\s+dominus/.test(introit))issues.push("REMI_COMMON_WRONGLY_REPLACES_FERIA");
  if(!/da\s+pacem\s+domine/.test(introit))issues.push("REMI_FERIAL_DA_PACEM_INTROIT_MISSING");
 }else issues.push("UNKNOWN_HARD_RULE");
 checks.push({date:spec.date,rule:spec.rule,observedMainId:a?.main?.id??null,
  observedSourcePath:a?.proper?.sourcePath??null,observedIntroit:a?.proper?.introit?.latin??null,
  issues,independentSourceReferences:plan.oracleCases.find(x=>x.date===spec.date)?.independentSources??[]});
}
const summary={count:observations.length,ready:observations.filter(x=>x.status==="ready").length,
 withSelectedSourcePath:observations.filter(x=>x.proper?.sourcePath).length,
 enPrintReady:observations.filter(x=>x.printGate?.en?.ready).length,
 frPrintReady:observations.filter(x=>x.printGate?.fr?.ready).length,
 bilingualExplorerReady:observations.filter(x=>x.explorerProjection?.en?.ready&&x.explorerProjection?.fr?.ready).length,
 hardAssertions:checks.length,hardDiscrepancies:checks.reduce((s,x)=>s+x.issues.length,0),
 fullPrintedLatinTextCertified:false,feastSpecificProperFormValidated:false,
 normalOrLocalMassChoiceInferred:false,productionEdited:false};
const doc={schema:"AO_ICRSP_B42_REAL_1962_RESOLVER_OBSERVATIONS_V1",
 recordedAt:new Date().toISOString(),method:"Production index.html served locally, Playwright Chromium, AO_RUNTIME_V8.resolver.resolveDay actual live source for each civil date. Printed Common comparison limited to structural incipit, not full source text.",
 sourcePlan:"data/source-text/icrsp-france-b42-real-calendar-18-proper-probe-plan.v1.json",
 summary,checks,observations,
 explicitHolds:["There is no invented Common selection for saints only commemorated in the actual Mass.",
  "English/French readiness reports the existing publication gate, not new translation authority.",
  "A returned sourcePath and expected incipit is not full 1962 printed edition certification.",
  "Actual selected proper must still be verified slot-by-slot against printed source before an app change.",
  "There are no copied source bodies and no changes to canonical Calendar, Saints or Mass."]};
const output=resolve(root,"artifacts/icrsp/b42-actual-1962-calendar-proper.json");
await mkdir(resolve(root,"artifacts/icrsp"),{recursive:true});
await writeFile(output,JSON.stringify(doc,null,2)+"\n","utf8");
console.log("ICRSP_B42_RUNTIME_SUMMARY="+JSON.stringify(summary));
for(const x of observations)console.log("ICRSP_B42_DATE="+JSON.stringify({
 date:x.date,main:x.main?.id,proper:x.proper?.sourcePath,introit:x.proper?.introit?.latin,
 collect:x.proper?.collect?.latin,printFrReady:x.printGate?.fr?.ready,projectionFrReady:x.explorerProjection?.fr?.ready,status:x.status
}));
for(const c of checks)console.log("ICRSP_B42_INDEPENDENT_CHECK="+JSON.stringify(c));
assert.equal(observations.length,18,"Expected 18 unique exact source-day queries");
assert.equal(new Set(observations.map(x=>x.date)).size,18,"Duplicate calendar query");
if(process.argv.includes("--strict"))
 assert.equal(summary.hardDiscrepancies,0,"Independently grounded Martin/Remigius Proper discrepancy; inspect permanent source record");
