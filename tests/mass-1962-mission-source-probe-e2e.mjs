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
   const results={date:r.date,source:p.sourcePath,main:r.day.main.id,
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
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
