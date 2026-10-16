// Future-year release gate for actual 1962 production resolver. Not a
// hardcoded 2026 Ordo and not independent certification of source rubrics.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/calendar-oracle");
const years=[2027,2028,2029,2030,2032];
const expectedEasters=new Map([
 [2027,"2027-03-28"],[2028,"2028-04-16"],[2029,"2029-04-01"],
 [2030,"2030-04-21"],[2032,"2032-03-28"]
]);
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json;charset=utf-8",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",
 ".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
let browser;
const report={
 schema:"AO_LIVING_TRADITIONAL_FUTURE_YEAR_RESOLVER_AUDIT_V1",
 base:"ACTUAL_PRODUCTION_1962_DAY_RESOLVER",years,
 certification:"MULTI_YEAR_ENGINE_REGRESSION_NOT_INDEPENDENT_LITURGICAL_APPROVAL",
 rows:[],fixedFutureSamples:[],easters:[],seasonBoundaries:[],annunciationCases:[]
};
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 for(const year of years){
  const count=(((year%4===0)&&(year%100!==0))||(year%400===0))?366:365;
  const dates=Array.from({length:count},(_,i)=>new Date(Date.UTC(year,0,i+1,12)).toISOString().slice(0,10));
  for(let i=0;i<dates.length;i+=28){
   const chunk=dates.slice(i,i+28);
   const rows=await page.evaluate(async chunk=>{
    const {buildReviewedSanctoralCards}=await import("/src/calendar/reviewed-sanctoral-cards.js");
    const {canonical1962Commemorations}=await import("/src/calendar/traditional-day-adjudication.js");
    const model=await (await fetch("/data/calendar/living-sanctoral-read-model.v1.json")).json();
    const resolver=globalThis.AO_RUNTIME_V8.resolver;
    return Promise.all(chunk.map(async date=>{
     try{
      const r=await resolver.resolveDay(date);
      const main=r?.day?.main;
      const comm=canonical1962Commemorations(r);
      const modern=main?.id?buildReviewedSanctoralCards({
        date,jurisdiction:"UNSPECIFIED",observedPrincipalId:main.id,
        observedCommemorationIds:comm.map(x=>x.sourceId),...model}):[];
      return {
       date,resolved:Boolean(r?.date===date&&main?.id&&main.rank&&main.color!==undefined),
       mainId:main?.id||null,mainRank:main?.rank||null,
       colour:main?.color??r?.day?.colour??null,
       historicalCommemorationIds:comm.map(x=>x.identity),
       supplementaryIds:modern.map(x=>x.id),
       incorrectlySelectedMass:modern.some(x=>x.massSelectionAuthority!=="NONE"||x.changes1962Principal)
      };
     }catch(e){return {date,resolved:false,error:String(e.stack||e)}}
    }));
   },chunk);
   report.rows.push(...rows);
  }
 }
 const samples=["2036-02-29","2040-03-25","2040-10-09","2050-10-09","2060-12-25"];
 report.fixedFutureSamples=await page.evaluate(async dates=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const model=await (await fetch("/data/calendar/living-sanctoral-read-model.v1.json")).json();
  const {buildReviewedSanctoralCards}=await import("/src/calendar/reviewed-sanctoral-cards.js");
  return Promise.all(dates.map(async date=>{
   try{
    const x=await resolver.resolveDay(date);
    const id=x?.day?.main?.id;
    return {date,resolved:Boolean(x?.date===date&&id),
      mainId:id||null,
      modernSaints: id?buildReviewedSanctoralCards({
        date,observedPrincipalId:id,jurisdiction:"UNSPECIFIED",...model}).map(s=>s.id):[]};
   }catch(e){return {date,resolved:false,error:String(e.message||e)}}
  }));
 },samples);
 const basic=await page.evaluate(async years=>{
  const {buildLiturgicalYear,annunciationObservanceDate}=await import("/src/calendar/liturgical-year.js");
  return years.map(year=>{
   const season=buildLiturgicalYear(year+"-06-01");
   const last=buildLiturgicalYear(year+"-12-31");
   const next=buildLiturgicalYear((year+1)+"-01-01");
   return {
    year,easter:season.easter,
    annunc:annunciationObservanceDate(year),
    end:last.end,continuity:last.end===next.end&&last.start===next.start,
    endOfLiturgicalYear: last.end,
    currentBeforeAdvent:buildLiturgicalYear(year+"-11-01").start,
    currentAfterAdvent:last.start,
    nonemptyPeriods:season.periods.every(p=>p.start&&p.end&&p.days>=1)
   };
  });
 },years);
 report.easters=basic.map(({year,easter})=>({year,easter}));
 report.annunciationCases=basic.map(({year,annunc})=>({year,date:annunc}));
 report.seasonBoundaries=basic.map(({year,continuity,nonemptyPeriods,endOfLiturgicalYear})=>({
  year,continuity,nonemptyPeriods,endOfLiturgicalYear}));
 const unresolved=report.rows.filter(x=>!x.resolved);
 const duplicates=report.rows.filter(x=>
  new Set(x.historicalCommemorationIds).size!==x.historicalCommemorationIds.length);
 const incorrectlySelected=report.rows.filter(x=>x.incorrectlySelectedMass);
 report.summary={
  totalCivilDays:report.rows.length,
  resolvedDays:report.rows.length-unresolved.length,
  unresolvedDays:unresolved.length,
  years,leapDates:report.rows.filter(x=>x.date.endsWith("-02-29")).length,
  duplicateCommemorationDays:duplicates.length,invalidModernMassSelections:incorrectlySelected.length,
  moreDistantFutureSamplesResolved:report.fixedFutureSamples.filter(x=>x.resolved).length,
  sourceIndependentLiturgicalCertification:false
 };
 await mkdir(out,{recursive:true});
 await writeFile(resolve(out,"living-traditional-future-year-audit.json"),JSON.stringify(report,null,2)+"\n");
 console.log("LIVING_TRADITIONAL_FUTURE_YEAR_AUDIT="+JSON.stringify(report.summary));
 assert.equal(report.rows.length,years.reduce((sum,y)=>sum+(((y%4===0)&&(y%100!==0))||(y%400===0)?366:365),0));
 assert.equal(new Set(report.rows.map(x=>x.date)).size,report.rows.length);
 assert.deepEqual(unresolved.map(x=>x.date),[],"Actual production resolver must cover every day, including 2028/2032 leap days");
 assert.deepEqual(duplicates,[],"No repeated 1962 commemoration source identities");
 assert.deepEqual(incorrectlySelected,[],"Modern-source cards never select a Mass");
 assert.ok(basic.every(x=>x.continuity&&x.nonemptyPeriods),"Advent and Christmas must flow across year boundaries");
 for(const x of basic)assert.equal(x.easter,expectedEasters.get(x.year),"Independent dated Easter checkpoint "+x.year);
 assert.equal(basic.find(x=>x.year===2027).annunc,"2027-04-05",
  "2027 Annunciation must transfer after Easter octave, not stay in Holy Week");
 assert.equal(basic.find(x=>x.year===2029).annunc,"2029-04-09",
  "2029 Annunciation on Palm Sunday transfers after Low Sunday");
 assert.equal(report.rows.find(x=>x.date==="2028-02-29")?.resolved,true);
 assert.equal(report.rows.find(x=>x.date==="2032-02-29")?.resolved,true);
 assert.deepEqual(report.rows.find(x=>x.date==="2027-10-09")?.supplementaryIds,
  ["saint.john-henry-newman"],"Newman 2026 decree must apply in subsequent years");
 assert.deepEqual(report.rows.find(x=>x.date==="2027-10-12")?.supplementaryIds,
  ["saint.carlo-acutis"],"Carlo feast-date witness must recur without being a universal 1962 feast");
 assert.ok(report.fixedFutureSamples.every(x=>x.resolved),
  "Production resolver must not stop at the current year or the 2030s");
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
