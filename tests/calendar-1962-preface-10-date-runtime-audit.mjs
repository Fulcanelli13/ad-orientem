import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(body);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(e.message)}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:80000});
 const candidates=[
  ["2026-01-06","Epiphany"],
  ["2026-02-02","Nativity"],
  ["2026-04-05","Easter"],
  ["2026-05-24","Holy Spirit"],
  ["2026-06-12","Sacred Heart"],
  ["2026-10-07","BVM"],
  ["2026-10-11","Holy Trinity"],
  ["2026-10-15","Common"],
  ["2026-10-18","Holy Trinity"],
  ["2026-12-08","BVM"],
 ];
 const details=await page.evaluate(async dates=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
   const {calendarCommemorationNames}=await import("/src/calendar/calendar-runtime.js");
   const result=[];
   for(const [date,expectedOrdoPreface] of dates){
     try{
       const day=await resolver.resolveDay(date);
       const p=day?.proper?.data;
       const pref=p?.preface??null;
       const names=calendarCommemorationNames(day,{language:"en"});
       const text=String(pref?.lat??pref?.la??"");
       const check=p?properToReaderSlots(p,{language:"en"}).slots.PREFACE:null;
       const corrected=p?await recoverReaderProperOmissions(p,{
         hostResolver:resolver.properResolver,
         principalCelebrationId:day?.day?.main?.id??null
       }):null;
       const after=corrected?.data??corrected??null;
       const correctedPreface=after?.preface??null;
       const correctedLatin=String(correctedPreface?.lat??correctedPreface?.la??"");
       result.push({
         date,expectedOrdoPreface,ready:day?.status,properStatus:day?.proper?.status,
         main:day?.day?.main?.title||null,mainId:day?.day?.main?.id||null,
         commemorationNames:names,commemorationCount:(day?.day?.commemorations||[]).length,
         prefaceStatus:check?.status||"MISSING",
         correctedPrefaceLatinOpening:correctedLatin.slice(0,200),
         correctedPrefaceLatinLength:correctedLatin.length,
         correctedPrefaceEnglishLength:String(correctedPreface?.en??"").length,
         correctedPrefaceFrenchLength:String(correctedPreface?.fr??"").length,
         prefaceLatinLength:text.length,
         prefaceEnglishLength:String(pref?.en??"").length,
         prefaceFrenchLength:String(pref?.fr??"").length,
         prefaceLatinOpening:text.slice(0,550),prefaceReference:pref?.sourceRef??pref?.sourcePath??null,
         provenance:pref?.source??null,
         manuallyCertifiedAgainst1962:false,publishable:false
       });
     }catch(error){result.push({date,expectedOrdoPreface,error:String(error),manuallyCertifiedAgainst1962:false,publishable:false});}
   }
   return result;
 },candidates);
 const doc={schema:"AO_1962_SOURCE_PREFACE_RUNTIME_SAMPLE_AUDIT_V1",date:"2026-10-12",
 sourceOrdo:"https://extraordinaryform.org/ordo/2025-2026Ordo.pdf",
 governingRubrics:"https://propria.org/wp-content/uploads/2019/10/the-new-rubrics-of-the-roman-missal-and-breviary-1960-by-rev.-patrick-l.-murphy.pdf#page=52",
 limitation:"These are runtime Proper preface texts, not proof of rubrically correct prefatory text in the original 1962 Missal. Expected categories are taken from a particular published Ordo and may have regional/votive exceptions.",
 rows:details,
 stats:{testedDates:details.length,prefaceReaderReady:details.filter(x=>x.prefaceStatus==="READY").length,
 incomplete:details.filter(x=>x.prefaceStatus!=="READY").length,editoriallyApproved:0},publicationStatus:"RESEARCH_ONLY"};
 await mkdir(resolve(root,"data/calendar/audits"),{recursive:true});
 await writeFile(resolve(root,"data/calendar/audits/1962-2026-preface-runtime-10-date-audit.v1.json"),JSON.stringify(doc,null,2)+"\n");
 console.log("RUNTIME_PREFACE_AUDIT="+JSON.stringify({stats:doc.stats,rows:details.map(r=>({date:r.date,expect:r.expectedOrdoPreface,name:r.main,commemorations:r.commemorationNames,ready:r.prefaceStatus,latin:r.prefaceLatinOpening?.slice(0,180),latlen:r.prefaceLatinLength,source:r.prefaceReference,error:r.error}))}));
 assert.equal(details.length,10);
 for(const [date,expected] of [["2026-05-24",/^de Spiritu Sancto/i],["2026-10-07",/^de Beata Maria Virgine/i],["2026-12-08",/^de Beata Maria Virgine/i]]){
   const row=details.find(x=>x.date===date);
   assert.match(row?.correctedPrefaceLatinOpening??"",expected,"production resolver recovery: "+date);
   assert.ok(row.correctedPrefaceEnglishLength>100&&row.correctedPrefaceFrenchLength>100,"trilingual Preface incomplete: "+date);
 }
 assert.match(details.find(x=>x.date==="2026-12-08")?.correctedPrefaceLatinOpening??"",/Conceptióne Immaculáta/i);
 assert.match(details.find(x=>x.date==="2026-10-07")?.correctedPrefaceLatinOpening??"",/festivitáte/i);
 assert.equal(details.find(x=>x.date==="2026-10-11")?.commemorationNames?.[0],"Maternity of the Blessed Virgin Mary");
 assert.ok(details.every(x=>x.manuallyCertifiedAgainst1962===false&&!x.publishable));
}finally{await browser?.close();await new Promise(done=>server.close(done))}
