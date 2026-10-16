// Read-only 365-day extraction from the ORIGINAL Ad Orientem 1962 day resolver.
// This produces source-ID observations, not newly adjudicated feasts, saints,
// historical canonization verdicts or additional calendar observances.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const year=2026,root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/saints-calendar-census");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".woff2":"font/woff2",
 ".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
  try{
    const requested=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const path=resolve(root,"."+requested);
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return;}
    const bytes=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(err){if(!res.headersSent)res.writeHead(err?.code==="ENOENT"?404:500);if(!res.writableEnded)res.end(String(err?.message??err));}
});
await mkdir(out,{recursive:true});
const dates=[];
for(let t=Date.UTC(year,0,1);t<Date.UTC(year+1,0,1);t+=86400000)
  dates.push(new Date(t).toISOString().slice(0,10));
assert.equal(dates.length,365);

let browser;
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 const observations=[];
 for(let i=0;i<dates.length;i+=16){
   const block=await page.evaluate(async targetDates=>{
     const resolver=globalThis.AO_RUNTIME_V8?.resolver;
     const {observedCycle}=await import("/src/calendar/observed-cycle.js");
     const {calendarCommemorationNames}=await import("/src/calendar/calendar-runtime.js");
     return Promise.all(targetDates.map(async date=>{
       try{
         const r=await resolver.resolveDay(date),day=r?.day||{},main=day?.main||{},p=r?.proper?.data||{};
         const comm=calendarCommemorationNames(r,{language:"en"});
         const commFr=calendarCommemorationNames(r,{language:"fr"});
         const named=Array.isArray(day.commemorations)?day.commemorations:[];
         const properComm=Array.isArray(p.calendarCommemorations)?p.calendarCommemorations:[];
         return {
           date,resolve_status:String(r?.status||""),proper_status:String(r?.proper?.status||""),
           principal:{source_id:String(main.id||""),title_en:String(p.name||p.title?.en||main.title||main.name||""),
             title_fr:String(p.nameFr||p.title?.fr||main.titleFr||main.nameFr||""),
             observed_cycle:observedCycle(r),raw_rank:p.rank??main.rank??null,
             source_path:String(main.sourcePath||main.properPath||main.path||p.sourcePath||"")},
           commemorations:{labels_en:comm,labels_fr:commFr,
             canonical_rows:named.map(x=>typeof x==="object"&&x!==null?{
               source_id:String(x.id??x.source_id??""),title:String(x.title?.en??x.title??x.name??""),
               title_fr:String(x.titleFr??x.title?.fr??x.nameFr??"")}:
               {source_id:"",title:String(x),title_fr:""}),
             proper_prayers:properComm.map(x=>({name:String(x.name||""),path:String(x.path||""),
               prayer_source_path:String(x.prayerSourcePath||"")}))},
           failed:!r||r.status==="failed"||!main.id||!main.title||r.date&&r.date!==date,
           error:String(r?.error||r?.proper?.error||"")
         };
       }catch(e){return{date,failed:true,error:String(e?.message??e)};}
     }));
   },dates.slice(i,i+16));
   observations.push(...block);
 }
 assert.equal(observations.length,365);
 assert.deepEqual(observations.map(x=>x.date),dates);
 const failures=observations.filter(x=>x.failed);
 assert.equal(failures.length,0,"Cannot publish incomplete year census: "+JSON.stringify(failures.slice(0,6)));
 const byCycle=Object.fromEntries(["sanctorale","temporale","unknown"].map(k=>[k,observations.filter(x=>x.principal.observed_cycle===k).length]));
 const counters={days:observations.length,...byCycle,
   observed_distinct_principal_source_ids:new Set(observations.map(x=>x.principal.source_id)).size,
   days_with_named_commemoration:observations.filter(x=>x.commemorations.labels_en.length).length,
   named_commemoration_occurrences:observations.reduce((n,x)=>n+x.commemorations.labels_en.length,0),
   days_with_proper_prayer_oration_evidence:observations.filter(x=>x.commemorations.proper_prayers.length).length};
 assert.equal(byCycle.sanctorale+byCycle.temporale+byCycle.unknown,365);
 const result={schema:"ao.saints.2026-observed-liturgical-day-census.v1",
   year,publication:"RESEARCH_ONLY_NO_CALENDAR_MUTATION",
   source:"Fulcanelli13/ad-orientem ORIGINAL AO_RUNTIME_V8.resolver.resolveDay + observedCycle + calendarCommemorationNames",
   identity_policy:"Observed principal source ID is NOT automatically a canonical saint. A feast may celebrate Our Lord, Our Lady, an event or a saint/group; an arbitrary title cannot establish sainthood. Named commemorations remain distinct.",
   limits:["Observed principal of one real year, not every nominal 1962 Sanctoral feast","Local, religious and transferred feasts require separate source governance","Calendar may differ across years, and rank/commemoration proof is owned by the independent Calendar audit","Rows here are original resolver observations, not independent certification of liturgical correctness"],
   counters,days:observations};
 await writeFile(resolve(out,"saints-calendar-2026-observed-owner-census.json"),JSON.stringify(result,null,2)+"\n");
 console.log("PASS 365 days and source-owner Sanctoral/Temporale census: "+JSON.stringify(counters));
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
