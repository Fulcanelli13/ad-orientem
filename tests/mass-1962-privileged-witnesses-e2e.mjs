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
   const output=[];
   for(const date of dates){
     const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
     const p=r?.proper?.data;
     const comm=r?.day?.commemorations??[];
     output.push({
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
 for(const row of rows){
   console.log("MASS_1962_PRIVILEGED_WITNESS="+JSON.stringify(row));
   assert.equal(row.status,"ready",row.date+" calendar unavailable");
   assert.equal(row.properStatus,"ready",row.date+" Proper unavailable");
 }
 console.log("PASS: five 2026 witness days resolved; source and prayer classification recorded.");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
