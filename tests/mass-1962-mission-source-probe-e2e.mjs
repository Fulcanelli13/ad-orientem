import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const server=http.createServer(async(req,res)=>{
 try{const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
 const bytes=await readFile(path);
 res.writeHead(200,{"content-type":{".js":"text/javascript",".html":"text/html",".json":"application/json",".css":"text/css",".svg":"image/svg+xml"}[extname(path)]||"application/octet-stream"});
 res.end(bytes)
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));let browser;
try{
 browser=await chromium.launch({headless:true});const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>!!globalThis.AO_RUNTIME_V8?.resolver?.resolveDay,null,{timeout:80000});
 const out=await page.evaluate(async()=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   const r=await resolver.resolveDay("2026-10-18");
   const p=r.proper.data,host=resolver.properResolver;
   const {select1962CommemorationsForMassForm}=await import("/src/mass/1962-commemoration-form-source.js");
   const {properToReaderSlots}=await import("/src/mass/proper-reader-slots.js");
   const {massCalendarPreflightContext,fillMassCalendarPreflight}=await import("/src/mass/calendar-preflight-context.js");
   const projections={};
   for(const form of ["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]){
     const x=select1962CommemorationsForMassForm({proper:r.proper,calendarResolution:r,form});
     const q=x.proper?.data??x.proper;
     const slots=properToReaderSlots(q,{language:"fr"});
     const legacy={date:r.date,celebrationId:"mass_of_day",celebrationType:"CALENDAR",
       actualCelebration:r.day.main,proper:r.proper,canStart:true};
     const context=massCalendarPreflightContext(legacy,{
       selectedDate:r.date,resolving:false,resolution:r},"fr",{form});
     const node=document.createElement("section");
     node.innerHTML='<p data-mass-calendar-mission hidden></p>';
     fillMassCalendarPreflight(node,context);
     projections[form]={status:x.status,mission:q.missionSundayCollectDecision?.status??null,
       collected:q.collects.length,secret:q.secrets.length,postcommunion:q.postcommunions.length,
       focus:slots.slots.COLLECT_SET.data?.paragraphs?.length??0,
       notice:node.querySelector("[data-mass-calendar-mission]")?.textContent??"",
       noticeVisible:!node.querySelector("[data-mass-calendar-mission]").hidden};
   }
   const results={date:r.date,source:p.sourcePath,main:r.day.main.id,projections,
     collectEnds:(p.collects||[]).map(row=>Object.fromEntries(["lat","en","fr"].map(k=>[k,row[k]?.slice(-220)]))),
     sourceAvailability:!!host?.resolveSource};
   for(const lang of ["la","en","fr"]){
     try{
       const parsed=await host.resolveSource("Commune/Propaganda",lang,{requestedFiles:[],warnings:[],errors:[],languageGaps:[],structuralInheritances:[],cacheHits:[],referencesResolved:[]});
       const rows=parsed?.map?.get("Oratio");
       results[lang]={sections:parsed?.order?.slice(0,12),raw:rows?.slice(0,5)??null};
     }catch(error){results[lang]={error:String(error?.message??error)}}
   }
   return results;
 });
 console.log("MISSION_SUNDAY_HOST_PROBE="+JSON.stringify(out));
 assert.ok(out.main.includes("Pent21"),"Wrong 18 October Sunday resolved");
 for(const [form,proof] of Object.entries(out.projections)){
   const ordinary=form==="LOW"?2:1;
   assert.equal(proof.status,"CERTIFIED",form);
   assert.equal(proof.mission,"CERTIFIED",form);
   assert.deepEqual([proof.collected,proof.secret,proof.postcommunion],
      [ordinary,ordinary,ordinary],form+" must add NO extra Secret/Postcommunion");
   assert.equal(proof.focus,ordinary+1,form+" must have principal and Mission prayer focus paragraphs");
   assert.equal(proof.noticeVisible,true,form+" preflight must show the actual mission notice");
   assert.match(proof.notice,/Missions|mission/i);
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
