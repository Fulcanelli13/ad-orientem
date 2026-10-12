import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",".json":"application/json",".css":"text/css",".svg":"image/svg+xml"};
const srv=http.createServer(async(req,res)=>{
 try{const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
 const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream"});res.end(bytes)
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(done=>srv.listen(0,"127.0.0.1",done));
let browser;try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+srv.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:80000});
 const found=await page.evaluate(async()=>{
   const days=["2026-01-19","2026-03-04","2026-09-01","2026-10-21","2026-12-04"];
   const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const {assessPrintableProper}=await import("/src/calendar/print-proper.js");
   const {massCalendarPreflightContext}=await import("/src/mass/calendar-preflight-context.js");
   const output=[];
   for(const date of days){
     const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
     const raw=r?.proper?.data;
     const forms={};
     for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
       const selected=select1962CommemorationsForMassForm({proper:r.proper,calendarResolution:r,form});
       const p=selected.proper?.data??selected.proper;
       const mapped=properToReaderSlots(p,{language:"fr"});
       const preflight=massCalendarPreflightContext({
         date,celebrationType:"CALENDAR",celebrationId:"mass_of_day",
         actualCelebration:r.day.main,proper:r.proper,
       },{selectedDate:date,resolving:false,resolution:r},"fr",{form});
       const originalPrint=assessPrintableProper(r,{language:"fr"});
       const print=assessPrintableProper(r,{language:"fr",massForm:form});
       const outputForm={
         status:selected.status,reason:selected.reason??null,
         detail:p.commemorationFormDecision?.detail??null,
         scope:selected.decision?.scope??null,
         applied:selected.decision?.appliedCount??null,
         groups:selected.decision?.prayerGroupCount??null,
         counts:["collects","secrets","postcommunions"].map(k=>p[k]?.length??0),
         focus:["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].map(k=>mapped.slots[k].data?.paragraphs?.length??null),
         ready:!["COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].some(k=>mapped.slots[k].status!=="READY"),
         kind:p.collects?.[1]?.oneConclusion?.kind??null,
         endingValid:["collects","secrets","postcommunions"].every(k=>
           p[k]?.length<2||!p[k][1]?.oneConclusion||
           ["lat","en","fr"].every(lang=>p[k][1][lang].endsWith(
             p[k][1].oneConclusion.segments[lang].conclusion))),
         names:preflight.commemorations,
         preflight:preflight.commemorationOrations.status,
         print:print.ok,printReason:print.reason??null,
         originalPrint:originalPrint.ok,originalPrintReason:originalPrint.reason??null,
         retainedCalendar:p.calendarCommemorations?.length??0,
       };
       forms[form]=outputForm;
     }
     output.push({date,main:r?.day?.main?.id,source:r?.proper?.data?.sourcePath,
       calendarCount:r?.day?.commemorations?.length,rawGroups:
         ["collects","secrets","postcommunions"].map(k=>raw?.[k]?.length??0),
       forms});
   }
   return output;
 });
 for(const day of found){
   console.log("MASS_1962_TWO_COMM_REAL="+JSON.stringify(day));
   assert.equal(day.calendarCount,2,day.date+" needs two actual canonical witnesses");
   assert.deepEqual(day.rawGroups,[3,3,3],day.date+" raw source must retain 3 orations");
   for(const [form,x] of Object.entries(day.forms)){
     const low=form==="LOW",privileged=day.date==="2026-12-04";
     const expectedApplied=low?2:privileged?1:0;
     const expectedGroups=low?2:privileged?2:1;
     assert.equal(x.status,"CERTIFIED",day.date+"/"+form+": "+x.reason+" "+x.detail);
     assert.equal(x.scope,"TWO_SOURCED_III_IV_CLASS_COMMEMORATIONS");
     assert.equal(x.applied,expectedApplied,day.date+"/"+form+" applied Calendar commemorations");
     assert.equal(x.groups,expectedGroups,day.date+"/"+form+" liturgical oration groups");
     assert.deepEqual(x.counts,[expectedGroups,expectedGroups,expectedGroups],day.date+"/"+form);
     assert.deepEqual(x.focus,[low?3:expectedGroups,low?3:expectedGroups,low?3:expectedGroups],
       day.date+"/"+form+" paragraph focus");
     assert.equal(x.kind,low?"MULTIPLE_COMMEMORATIONS":null);
     assert.equal(x.endingValid,true);
     assert.equal(x.ready,true,day.date+"/"+form+" all prayer slots ready");
     assert.equal(x.names.length,2,"Calendar always retains both names");
     assert.equal(x.retainedCalendar,2,"Proper source retains both Calendar records");
     assert.equal(x.preflight,expectedApplied===0?"NOT_APPLIED_TO_FORM":"COMPLETE",
       day.date+"/"+form+" preflight form wording");
     if(x.originalPrint)assert.equal(x.print,true,day.date+"/"+form+" printed Proper");
     else assert.equal(x.printReason,x.originalPrintReason,"Existing print block must not be bypassed");
   }
 }
 console.log("PASS: five actual 1962 2026 double-commemoration days × four Mass forms × three prayer groups / LIVE and print source parity.");
}finally{await browser?.close();await new Promise(done=>srv.close(done))}
