import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html",".js":"text/javascript",".json":"application/json",".css":"text/css",".mjs":"text/javascript"};
const server=http.createServer(async(req,res)=>{try{const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream"});res.end(bytes)}catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}});
await new Promise(done=>server.listen(0,"127.0.0.1",done));let browser;
try{
browser=await chromium.launch({headless:true});const page=await browser.newPage({serviceWorkers:"block"});
await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
await page.waitForFunction(()=>!!globalThis.AO_RUNTIME_V8?.resolver?.resolveDay,null,{timeout:80000});
const rows=await page.evaluate(async()=>{
const dates=["2026-01-25","2026-02-22","2026-06-29","2026-06-30","2026-08-01"];
const out=[];
for(const date of dates){
const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);const p=r?.proper?.data;
out.push({date,status:r?.status,properStatus:r?.proper?.status,
main:{id:r?.day?.main?.id,path:r?.day?.main?.path,title:r?.day?.main?.title,rank:r?.day?.main?.rank},
comms:r?.day?.commemorations?.map(q=>({id:q.id,path:q.path,title:q.title,rank:q.rank,inseparable:q.inseparable})),
source:p?.sourcePath,sourceComms:p?.calendarCommemorations?.map(q=>({name:q.name,path:q.path,prayerSourcePath:q.prayerSourcePath,inseparable:q.inseparable})),
groups:["collects","secrets","postcommunions"].map(k=>({name:k,count:p?.[k]?.length,rows:p?.[k]?.map((x,i)=>({id:i,latin:String(x?.lat??"").slice(0,140),latinEnding:String(x?.lat??"").slice(-145),enOk:!!x?.en,frOk:!!x?.fr}))})),
warnings:r?.diagnostic?.warnings?.slice(0,3)??[]});
}return out});
for(const row of rows){console.log("PETER_PAUL_1962_WITNESS="+JSON.stringify(row));assert.equal(row.status,"ready",row.date)}
}finally{await browser?.close();await new Promise(done=>server.close(done))}
