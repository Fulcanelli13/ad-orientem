// Targeted selected-year Schola closeout: compare the research-only raw
// Proper projector with the EXISTING actual Reader recovery + adapter path.
// Eight dates, no new liturgical sources, no score/audio release, no UI edits.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const ordinary=Object.freeze([
 {date:"2026-03-06",sourcePath:"Tempora/Quad2-5"},
 {date:"2026-03-27",sourcePath:"Tempora/Quad5-5Feria"},
 {date:"2026-05-04",sourcePath:"Sancti/05-04"},
 {date:"2026-10-08",sourcePath:"Sancti/10-08"},
 {date:"2026-12-26",sourcePath:"Sancti/12-26"},
 {date:"2026-12-28",sourcePath:"Sancti/12-28"}
]);
const special=Object.freeze([
 {date:"2026-04-03",sourcePath:"Tempora/Quad6-5r"},
 {date:"2026-04-04",sourcePath:"Tempora/Quad6-6r"}
]);
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".woff2":"font/woff2",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream",
   "cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser,report;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>
  typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",
  null,{timeout:90000});
 report=await page.evaluate(async targets=>{
  const resolver=globalThis.AO_RUNTIME_V8.resolver;
  const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
  const {recoverReaderProperOmissions}=await import("/src/mass/reader-proper-runtime-recovery.js");
  const {adaptV346ResolvedMass}=await import("/src/mass/host-adapter.js");
  const ORATION=["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"];
  const projection=(p,language)=>{
   if(!p)return {ready:false,missing:["PROPER_NOT_PRESENT"],error:"No Proper"};
   try{
    const x=properToReaderSlots(p,{language});
    return {ready:x.ready,missing:x.missing,
     missingReasons:x.missing.map(slot=>({slot,
      reason:x.slots?.[slot]?.reason??"SOURCE_VALUE_OR_TRANSLATION_INCOMPLETE",
      conflict:Boolean(x.slots?.[slot]?.sourceConflict)})),
     availableOrations:ORATION.filter(s=>x.slots?.[s]?.status==="READY"),
     correctionProof:(x.sourceEditorialCorrections??[]).map(v=>({
      id:v.id,sourcePath:v.sourcePath,slot:v.slot,fields:v.fields
     }))};
   }catch(e){return {ready:false,missing:[],error:String(e?.message??e)}}
  };
  const result=[];
  for(const target of targets){
   const {date,sourcePath,kind}=target;
   try{
    const outcome=await resolver.resolveDay(date);
    const proper=outcome?.proper?.data;
    const actualSourcePath=proper?.sourcePath??outcome?.proper?.sourcePath??null;
    const principalId=outcome?.day?.main?.id??null;
    const item={date,kind,sourcePath:actualSourcePath,
     resolvedDayStatus:outcome?.status??null,
     resolvedProperStatus:outcome?.proper?.status??null,
     principalId,
     identityMatched:actualSourcePath===sourcePath&&
      outcome?.status==="ready"&&["ready","cached"].includes(
       String(outcome?.proper?.status??"").toLowerCase()),
     raw:{en:projection(proper,"en"),fr:projection(proper,"fr")},
     publicScoresApproved:0};
    if(kind==="SPECIAL_RITE"){
     item.readerDisposition="NATIVE_SPECIAL_RITE_REQUIRED_NO_ORDINARY_MASS_INFERENCE";
     result.push(item);continue;
    }
    // This is the REAL existing reader path, not a second Schola parser.
    const recovered=await recoverReaderProperOmissions(proper,{
     hostResolver:resolver.properResolver,
     principalCelebrationId:principalId,calendarDate:date
    });
    const request={canStart:true,date,
     calendarDay:{id:principalId,title:outcome?.day?.main?.title??null},
     celebrationId:"mass_of_day",requestedCelebrationId:"mass_of_day",
     celebrationType:"CALENDAR",properSource:actualSourcePath};
    const adapted=adaptV346ResolvedMass(request,{form:"low",proper:recovered});
    const reader=adapted?.proper?.data??null;
    item.readerSourcePath=reader?.sourcePath??null;
    item.readerDisposition="ACTUAL_EXISTING_READER_RECOVERY_AND_ADAPTER";
    item.reader={en:projection(reader,"en"),fr:projection(reader,"fr")};
    // Source diagnostics for the named C7b commemoration. Read-only:
    // reveal which exact original three-language predicate is not satisfied.
    if(date==="2026-03-06"){
     const inspect=p=>{
      const details={selectedSource:p?.sourcePath,
       calendarCommemorations:p?.calendarCommemorations?.map(x=>({
        path:x.path,prayerSourcePath:x.prayerSourcePath,inseparable:x.inseparable
       })),
       appliedCommemorations:p?.appliedCommemorations?.map(x=>({
        path:x.path,prayerSourcePath:x.prayerSourcePath,inseparable:x.inseparable
       })),
       commemorationFormDecision:p?.commemorationFormDecision??null,
       selectedOrations:{}};
      for(const [slot,plural,single] of [
       ["COLLECT_SET","collects","collect"],["SECRET_SET","secrets","secret"]]){
       const rows=Array.isArray(p?.[plural])&&p[plural].length?
        p[plural]:p?.[single]?[p[single]]:[];
       details.selectedOrations[slot]=rows.map((row,index)=>({
        index,sourcePath:row?.sourcePath??null,
        oneConclusion:row?.oneConclusion?{kind:row.oneConclusion.kind,status:row.oneConclusion.status}:null,
        latin:String(row?.lat??row?.la??""),
        english:String(row?.en??""),french:String(row?.fr??"")
       }));
      }
      return details;
     };
     item.martyrsSourceTrace={raw:inspect(proper),recovered:inspect(recovered),reader:inspect(reader)};
    }
    item.readerReadyBothLanguages=Boolean(item.reader.en.ready&&item.reader.fr.ready);
    item.userFacingFailureEstablished=item.readerReadyBothLanguages?false:
     "READER_PROJECTION_STILL_HELD_CHECK_NATIVE_CARD_CONTEXT";
    item.didNotClaimActualChantPerformance=true;
    result.push(item);
   }catch(e){result.push({date,kind,sourcePath,error:String(e?.stack??e)})}
  }
  return {schema:"ao-schola-2026-real-reader-eight-date-reconciliation-v1",
   evidence:"CURRENT_AO_RUNTIME_DAY_RESOLVER_EXISTING_READER_RECOVERY_AND_HOST_ADAPTER",
   scope:"Six ordinary 2026 raw projection holds and two structurally separate Triduum rites",
   rows:result,publication:{scoreApprovals:0,newGabcScores:0,
    changedPrayerTexts:false,changedCalendar:false,changedScholaClock:false}};
 },[...ordinary.map(x=>({...x,kind:"ORDINARY"})),
     ...special.map(x=>({...x,kind:"SPECIAL_RITE"}))]);
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
// Always preserve the observed runtime evidence before the assertions:
 // a failing historical correction must still produce a reviewable artifact.
 const dest=resolve(root,"artifacts/mass");
 await mkdir(dest,{recursive:true});
 await writeFile(resolve(dest,"schola-2026-eight-date-real-reader-reconciliation.json"),
  JSON.stringify(report,null,2)+"\n");
 assert.equal(report.schema,"ao-schola-2026-real-reader-eight-date-reconciliation-v1");
assert.equal(report.rows.length,8);
for(const t of [...ordinary.map(x=>({...x,kind:"ORDINARY"})),...special.map(x=>({...x,kind:"SPECIAL_RITE"}))]){
 const row=report.rows.find(x=>x.date===t.date);
 assert.ok(row);
 assert.equal(row.error,undefined,t.date+" resolver or adapter unexpectedly failed");
 assert.equal(row.kind,t.kind,t.date+" wrong structural rite");
 assert.equal(row.sourcePath,t.sourcePath,t.date+" source path drift");
 assert.equal(row.identityMatched,true,t.date+" actual 1962 selected Proper not ready");
 assert.equal(row.publicScoresApproved,0,t.date+" public notation inferred from source");
 if(t.kind==="SPECIAL_RITE"){
  assert.equal(row.readerDisposition,"NATIVE_SPECIAL_RITE_REQUIRED_NO_ORDINARY_MASS_INFERENCE");
  assert.equal(row.reader,undefined,"Triduum forced through ordinary reader");
 }else{
  assert.equal(row.readerDisposition,"ACTUAL_EXISTING_READER_RECOVERY_AND_ADAPTER");
  assert.equal(row.readerSourcePath,t.sourcePath,t.date+" recovery changed selected Mass");
  for(const lang of ["en","fr"]){
   const expectedRawReady=t.date==="2026-03-06"||
     (t.date==="2026-10-08"&&lang==="fr");
   assert.equal(row.raw[lang].ready,expectedRawReady,
    t.date+":"+lang+" unexpected raw Schola source projection status");
   assert.ok(row.raw[lang].missing.every(s=>
    ["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].includes(s)),
    t.date+" raw hold has a non-oration source defect");
   assert.equal(row.reader[lang].error,undefined,
    t.date+" real reader projection threw an exception");
  }
 }
}
const martyrs=report.rows.find(x=>x.date==="2026-03-06");
for(const lang of ["en","fr"]){
 assert.equal(martyrs.reader?.[lang]?.ready,true,
  "Previously merged #1788 Perpetua/Felicity corrected Reader regressed in "+lang);
 assert.deepEqual(
  martyrs.reader[lang].correctionProof.filter(x=>x.id===
   "1962_C7B_PERPETUA_FELICITY_NONVIRGIN_INHERITANCE").map(x=>x.slot).sort(),
  ["COLLECT_SET","SECRET_SET"],
  "Previous source-attested C7b correction lost: "+lang);
}
assert.equal(report.publication.scoreApprovals,0);
console.log("SCHOLA_EIGHT_DATE_REAL_READER "+JSON.stringify({
 ordinary:ordinary.length,specialRites:special.length,
 readyAfterActualReader:report.rows.filter(x=>x.kind==="ORDINARY"&&
  x.readerReadyBothLanguages===true).length,
 outstandingAfterActualReader:report.rows.filter(x=>x.kind==="ORDINARY"&&
  x.readerReadyBothLanguages!==true).map(x=>({date:x.date,
  en:x.reader?.en?.missing,fr:x.reader?.fr?.missing})),
 mar6BothLanguagesRestored:true,newPublicScores:0}));
