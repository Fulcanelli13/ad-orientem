// Exhaustive date-scoped read-only source witness for the 2026 1962 calendar.
// Every candidate comes from the actual resolver, never a manually invented
// civil-date or named-feast mapping. No automatic rubrical certification.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",".json":"application/json",".css":"text/css",".mjs":"text/javascript",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
 if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
 const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});res.end(bytes)
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise(done=>server.listen(0,"127.0.0.1",done));
let browser;try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:80000});
 page.on("console",m=>{if(m.type()==="error")console.error("SOURCE_PAGE_ERROR",m.text().slice(0,350))});
 const dates=Array.from({length:365},(_,i)=>new Date(Date.UTC(2026,0,i+1,12)).toISOString().slice(0,10));
 const aggregate={multi:[],single:[],inseparable:[],failures:[],unmappedGroups:[],checked:0};
 for(let offset=0;offset<dates.length;offset+=30){
   const batch=dates.slice(offset,offset+30);
   const items=await page.evaluate(async dates=>{
     const rows=[];
     for(const date of dates){
       try{
         const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
         const p=r?.proper?.data,comms=r?.day?.commemorations??[];
         const cal=p?.calendarCommemorations??[];
         const groups=["collects","secrets","postcommunions"].map(k=>p?.[k]?.length??null);
         const row={date,status:r?.status,properStatus:r?.proper?.status,
           main:{id:r?.day?.main?.id,rank:r?.day?.main?.rank,path:r?.day?.main?.path,title:r?.day?.main?.title},
           commemorations:comms.map(x=>({id:x.id,title:x.title,rank:x.rank,path:x.path,inseparable:x.inseparable,privileged:x.privileged})),
           sourceCommemorations:cal.map(x=>({name:x.name,path:x.path,prayerSourcePath:x.prayerSourcePath,inseparable:x.inseparable})),
           prayerCounts:groups,
           trilingual:["collects","secrets","postcommunions"].map(k=>(p?.[k]??[]).map(x=>(["lat","en","fr"].every(l=>!!String(x?.[l]??"").trim())))),
           sourcePath:p?.sourcePath};
         rows.push(row);
       }catch(e){rows.push({date,error:String(e?.message??e)})}
     }return rows;
   },batch);
   for(const row of items){
     aggregate.checked++;
     if(row.error||row.status!=="ready"||row.properStatus!=="ready")aggregate.failures.push(row);
     if(row.commemorations?.length>1)aggregate.multi.push(row);
     else if(row.commemorations?.length===1)aggregate.single.push({date:row.date,main:row.main,comm:row.commemorations[0],prayers:row.prayerCounts});
     if(row.commemorations?.some(x=>x.inseparable))aggregate.inseparable.push(row);
     if(row.sourceCommemorations?.length>1||row.prayerCounts?.some(x=>x>2))
       aggregate.unmappedGroups.push(row);
   }
   console.log("MASS_1962_2026_SCAN",JSON.stringify({checked:aggregate.checked,multi:aggregate.multi.length,single:aggregate.single.length,unmappedGroups:aggregate.unmappedGroups.length,failed:aggregate.failures.length}));
 }
 console.log("MASS_1962_MULTI_WITNESSES="+JSON.stringify(aggregate.multi));
 console.log("MASS_1962_SOURCE_GROUP_CANDIDATES="+JSON.stringify(aggregate.unmappedGroups));
 console.log("MASS_1962_SOURCE_SCAN_SUMMARY="+JSON.stringify({checked:aggregate.checked,failures:aggregate.failures.slice(0,30),multiDates:aggregate.multi.map(x=>x.date),single:aggregate.single.length,inseparableDates:aggregate.inseparable.map(x=>x.date)}));
 assert.equal(aggregate.checked,365);
 assert.ok(aggregate.single.length>0,"Resolver returned no commemoration evidence");
 console.log("PASS: 365 actual 2026 1962 Calendar days inspected; multiple source-owned commemoration candidates logged for bounded rubrical projection.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
