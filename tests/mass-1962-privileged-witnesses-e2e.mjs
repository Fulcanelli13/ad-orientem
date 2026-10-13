import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
 const body=await readFile(path);
 res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
 res.end(body)
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:80000});
 const rows=await page.evaluate(async()=>{
   const dates=["2026-10-11","2026-10-18","2026-11-01","2026-11-30","2026-12-08"];
   const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const {composeProperReaderParagraphs}=await import("/src/mass/proper-reader-composition.js");
   const {assessPrintableProper}=await import("/src/calendar/print-proper.js");
   const forms=["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"];
   const output=[];
   for(const date of dates){
     const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
     const p=r?.proper?.data;
     const comm=r?.day?.commemorations??[];
     const formEvidence=Object.fromEntries(forms.map(form=>{
       const result=select1962CommemorationsForMassForm({
         proper:r?.proper,calendarResolution:r,form
       });
       const selected=result?.proper?.data??result?.proper;
       const slots=properToReaderSlots(selected,{language:"fr"});
       const displayed=composeProperReaderParagraphs(
         "AO.SM.B019",slots.slots.COLLECT_SET.data.paragraphs,{language:"fr"}
       );
       const print=assessPrintableProper(r,{language:"fr",massForm:form});
       return [form,{status:result.status,reason:result.reason??null,
         scope:result.decision?.scope??null,applied:result.decision?.appliedCount??null,
         prayerCounts:["collects","secrets","postcommunions"].map(k=>selected?.[k]?.length??null),
         readerCollects:slots.slots.COLLECT_SET.data?.paragraphs?.length??null,
         renderedCollects:displayed.length,
         additionalOremus:displayed.filter(p=>p.latin==="Orémus.").length,
         renderedResponses:displayed.filter(p=>p.kind==="RESPONSE").length,
         missionCollect:selected?.missionSundayCollectDecision?.status??null,
         missionUnderOneConclusion:selected?.collects?.[0]?.oneConclusion?.status??null,
         printed:print.ok,printReason:print.reason??null,
         preservedCalendarCount:selected?.calendarCommemorations?.length??null}];
     }));
     output.push({formEvidence,
       date,status:r?.status,properStatus:r?.proper?.status,
       main:{id:r?.day?.main?.id,title:r?.day?.main?.title,rank:r?.day?.main?.rank,path:r?.day?.main?.path},
       source:p?.sourcePath,riteProfile:p?.riteProfile,
       calendarCommemorations:p?.calendarCommemorations?.map(x=>({path:x.path,prayerSourcePath:x.prayerSourcePath,name:x.name,inseparable:x.inseparable})),
       dayCommemorations:comm.map(x=>({id:x.id,title:x.title,rank:x.rank,path:x.path,privileged:x.privileged,inseparable:x.inseparable})),
       prayerCounts:["collects","secrets","postcommunions"].map(k=>p?.[k]?.length??null),
       prayerFull:["collects","secrets","postcommunions"].map(k=>(p?.[k]??[]).map(x=>["lat","en","fr"].every(lang=>typeof x?.[lang]==="string"&&x[lang].trim().length>0))),
       notes:r?.diagnostic?.warnings?.slice?.(0,3)??[],
     });
   }
   return output;
 });
 const expected={
   "2026-10-11":[1,0,0,0],
   "2026-10-18":[1,0,0,0],
   "2026-11-01":[1,1,1,1],
   "2026-11-30":[1,1,1,1],
   "2026-12-08":[1,1,1,1],
 };
 for(const row of rows){
   console.log("MASS_1962_PRIVILEGED_WITNESS="+JSON.stringify(row));
   assert.equal(row.status,"ready",row.date+" calendar unavailable");
   assert.equal(row.properStatus,"ready",row.date+" Proper unavailable");
   for(const [index,form] of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].entries()){
     const actual=row.formEvidence[form],n=1+expected[row.date][index];
     assert.equal(actual.status,"CERTIFIED",row.date+"/"+form+": "+actual.reason);
     assert.equal(actual.applied,expected[row.date][index]);
     assert.deepEqual(actual.prayerCounts,[n,n,n]);
     // Source Proper paragraphs exclude display-only intermediate Amen/Oremus.
     assert.equal(actual.readerCollects,n+(row.date==="2026-10-18"?1:0),
       row.date+"/"+form+" source prayer focus paragraphs");
     const displayedCount=row.date==="2026-10-18"?
       (form==="LOW"?6:3):(n===2?5:2);
     assert.equal(actual.renderedCollects,displayedCount,
       row.date+"/"+form+" rendered Collect/Oremus/Amen sequence");
     assert.equal(actual.additionalOremus,n-1,
       row.date+"/"+form+" extra Oremus only between separate conclusions");
     assert.equal(actual.renderedResponses,n,
       row.date+"/"+form+" Amen at each separate conclusion");
     if(row.date==="2026-10-18"){
       assert.equal(actual.missionCollect,"CERTIFIED",form+" must include Mission Sunday under one conclusion");
       assert.equal(actual.missionUnderOneConclusion,"CERTIFIED");
     }else{
       assert.equal(actual.missionCollect,null,"Mission Sunday cannot leak to another date");
     }
     assert.equal(actual.printed,true,row.date+"/"+form+" print: "+actual.printReason);
     assert.equal(actual.preservedCalendarCount,1,row.date+"/"+form);
   }
 }
 // 18 October also has a separate local Mission Sunday (Missal §453)
 // oration under ONE conclusion. This test certifies St Luke's separate
 // commemoration only, never the missing Mission Sunday/local option.
 console.log("PASS: five authenticated 2026 witnesses × four forms × LIVE/print, preserving Calendar sources.");
 console.log("PASS: five 2026 witness days resolved; source and prayer classification recorded.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
