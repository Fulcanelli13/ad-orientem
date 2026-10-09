import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
  try{
    const loc=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),file=resolve(root,"."+loc);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await readFile(file);
    res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:45000});
 const dates=["2024-05-06","2027-05-03","2027-06-30","2027-08-15","2027-11-30","2027-12-08"];
 const result=[];
 for(const date of dates){
   const row=await page.evaluate(async date=>{
     const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
     const p=r?.proper?.data;
     return {date,status:r?.status,properStatus:r?.proper?.status,main:r?.day?.main,
       path:p?.sourcePath??p?.meta?.path??p?.source?.path??p?.path??null,
       properTitle:p?.name||p?.title,properColour:p?.color,canonicalColour:p?.canonicalColor,
       inherited:p?.inheritedProper,calendarCommemorations:p?.calendarCommemorations,
       comms:(r?.day?.commemorations||[]).map(x=>({id:x.id,title:x.title,path:x.path,inseparable:x.inseparable})),
       collects:p?.collects?.length||0,secrets:p?.secrets?.length||0,postcommunions:p?.postcommunions?.length||0,
       temporale:(r?.day?.tempora||[]).map(x=>({id:x.id,path:x.path,color:x.color}))};
   },date);
   result.push(row);
 }
 console.log("1962_COMMEMORATIONS_AND_ROGATIONS="+JSON.stringify(result));
 for(const date of ["2024-05-06","2027-05-03"]){
   const item=result.find(x=>x.date===date);
   assert.equal(item.status,"ready",date+" resolver unavailable");
   assert.equal(item.main?.rank,4,date+" must retain IV-class weekday");
   assert.equal(item.main?.color,"White",date+" must be ordinary Eastertide white");
   assert.equal(item.properStatus,"ready",date+" must load full Eastertide Mass proper");
   assert.match(item.path||"",/Tempora\/Pasc5-0/,date+" must inherit Sunday Eastertide Mass, not unselected Rogation");
   assert.equal(item.properColour,"White",date+" Proper did not inherit white Mass colour");
 }
 const peter=result.find(x=>x.date==="2027-06-30");
 assert.match(peter.main?.id||"",/^sancti:06-30:/);
 assert.ok(peter.comms.some(x=>x.inseparable&&/Peter|Petrus/i.test(x.title)),"Petrine inseparable commemoration missing");
 assert.equal(peter.properStatus,"ready","Saint Paul Mass Proper must load");
 // The two apostolic prayers are already included in Sancti/06-30;
 // ordinary merge logic must not append duplicate collect by commemoration path.
 assert.ok(peter.collects>=2,"Saint Paul's Mass must contain the embedded Petrine Collect");
 for(const [date,id,path] of [
   ["2027-08-15",/tempora:Pent13-0:/,/Tempora\/Pent13-0/],
   ["2027-11-30",/tempora:Adv1-2:/,/Tempora\/Adv1-0/],
   ["2027-12-08",/tempora:Adv2-3:/,/Tempora\/Adv2-0/]
 ]){
   const item=result.find(x=>x.date===date),comm=item.comms.find(x=>id.test(x.id));
   assert.ok(comm,date+" must preserve privileged commemoration");
   assert.match(comm.path||"",path,date+" must point to existing source proper with Collect");
   assert.equal(item.properStatus,"ready",date+" Proper loading failed");
   assert.ok(item.collects>=2,date+" must include second Collect for privileged commemoration");
   assert.ok(item.secrets>=2,date+" must include second Secret for privileged commemoration");
   assert.ok(item.postcommunions>=2,date+" must include second Postcommunion");
 }
 console.log("PASS 1962 ordinary Rogation weekday colour+proper and privileged Sunday/Advent/Petrine commemorations");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
