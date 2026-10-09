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
 const dates=["2024-05-06","2027-05-03","2027-06-30","2027-08-15","2027-11-30","2027-12-08","2024-12-08",
   "2024-10-27","2027-10-31","2026-10-25","2024-01-07","2027-01-03","2027-01-10","2027-05-23","2028-08-06","2026-11-01","2024-12-04","2027-12-04","2026-12-04","2022-12-04",
   "2024-01-25","2027-01-25","2024-02-22","2027-02-22"];
 const result=[];
 for(const date of dates){
   const row=await page.evaluate(async date=>{
     const r=await globalThis.AO_RUNTIME_V8.resolver.resolveDay(date);
     const p=r?.proper?.data;
     return {date,status:r?.status,properStatus:r?.proper?.status,error:r?.error||null,diagnosticErrors:r?.diagnostic?.errors||[],main:r?.day?.main,
       path:p?.sourcePath??p?.meta?.path??p?.source?.path??p?.path??null,
       properTitle:p?.name||p?.title,properColour:p?.color,canonicalColour:p?.canonicalColor,
       inherited:p?.inheritedProper,calendarCommemorations:p?.calendarCommemorations,
       comms:(r?.day?.commemorations||[]).map(x=>({id:x.id,title:x.title,path:x.path,inseparable:x.inseparable})),
       collects:p?.collects?.length||0,secrets:p?.secrets?.length||0,postcommunions:p?.postcommunions?.length||0,
       lastCollect:p?.collects?.at(-1)||null,lastSecret:p?.secrets?.at(-1)||null,lastPostcommunion:p?.postcommunions?.at(-1)||null,
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
   assert.ok(item.collects>=1&&item.secrets>=1&&item.postcommunions>=1,date+" must load all Mass orations");
 }
 const peter=result.find(x=>x.date==="2027-06-30");
 assert.match(peter.main?.id||"",/^sancti:06-30:/);
 assert.ok(peter.comms.some(x=>x.inseparable&&/Peter|Petrus/i.test(x.title)),"Petrine inseparable commemoration missing");
 assert.equal(peter.properStatus,"ready","Saint Paul Mass Proper must load");
 // The two apostolic prayers are already included in Sancti/06-30;
 // ordinary merge logic must not append duplicate collect by commemoration path.
 assert.ok(peter.collects>=1,"St Paul and St Peter must retain the combined Oratio");
 assert.equal(peter.comms.find(x=>x.inseparable)?.path,null,"Inseparable Petrine prayers are in the original St Paul Proper and must not be appended twice");
 for(const [date,id,path] of [
   ["2027-08-15",/tempora:Pent13-0:/,/Tempora\/Pent13-0/],
   ["2027-11-30",/tempora:Adv1-2:/,/Tempora\/Adv1-2/],
   ["2027-12-08",/tempora:Adv2-3:/,/Tempora\/Adv2-3/]
 ]){
   const item=result.find(x=>x.date===date),comm=item.comms.find(x=>id.test(x.id));
   assert.ok(comm,date+" must preserve privileged commemoration");
   assert.match(comm.path||"",path,date+" must point to existing source proper with Collect");
   assert.equal(item.properStatus,"ready",date+" Proper loading failed");
   assert.ok(item.collects>=2,date+" must include second Collect for privileged commemoration");
   assert.ok(item.secrets>=2,date+" must include second Secret for privileged commemoration");
   assert.ok(item.postcommunions>=2,date+" must include second Postcommunion");
 }


 // Historic 2024/2027 count disagreements on 25 Jan and 22 Feb come
 // from witnesses that omit the linked Apostle or the Lenten feria in
 // their *displayed count*. The three Mass orations still must exist.
 for(const date of ["2024-01-25","2027-01-25"]){
   const row=result.find(x=>x.date===date);
   assert.equal(row.properStatus,"ready",date+": St Paul Conversion Proper absent");
   assert.ok(row.comms.some(x=>x.id==="sancti:01-25c:4:w"),date+": St Peter apostolic commemoration omitted");
   for(const key of ["collects","secrets","postcommunions"])
     assert.ok(row[key]>=2,date+": St Peter "+key+" not composed");
 }
 for(const date of ["2024-02-22","2027-02-22"]){
   const row=result.find(x=>x.date===date);
   assert.equal(row.properStatus,"ready",date+": Chair of St Peter Proper absent");
   assert.ok(row.comms.some(x=>x.id==="sancti:02-22c:4:r"),date+": St Paul commemoration omitted");
   assert.ok(row.comms.some(x=>/^tempora:Quad/.test(x.id)),date+": privileged Lenten feria omitted");
   for(const key of ["collects","secrets","postcommunions"])
     assert.ok(row[key]>=3,date+": one of three appointed "+key+" absent");
 }
 // The III-class St Peter Chrysologus on Dec 4 requires the III-class
 // Advent weekday plus a commemoration of St Barbara (ordos and 1962).
 // Both accompanying three-prayer sets must survive into the Mass Proper.
 for(const date of ["2024-12-04","2027-12-04","2026-12-04"]){
   const row=result.find(x=>x.date===date);
   assert.equal(row.status,"ready",date+": Calendar failed");
   assert.equal(row.properStatus,"ready",date+": Mass Proper unavailable");
   assert.match(row.main?.id||"",/^sancti:12-04:3:w$/,date+": Peter Chrysologus displaced");
   assert.ok(row.comms.some(x=>/tempora:Adv[1-4]-/.test(x.id)),date+": Advent feria missing");
   const barbara=row.comms.find(x=>x.id==="commemoration:12-04-barbara:4:r");
   assert.ok(barbara,date+": universal 1962 St Barbara commemoration omitted");
   assert.equal(barbara.path,"Sancti/12-04pl",date+": wrong pinned Barbara Collect owner");
   assert.ok(row.calendarCommemorations?.some(x=>x.path==="Sancti/12-04pl"),
     date+": Barbara missing from composed Mass orations");
   assert.equal(row.comms.length,2,date+": only Advent feria + Barbara should be commemorated");
   for(const key of ["collects","secrets","postcommunions"])
     assert.equal(row[key],3,date+": required triple of Peter, Advent, Barbara "+key+" absent");
 }
 const deferred=result.find(x=>x.date==="2022-12-04");
 assert.ok(!deferred.comms.some(x=>x.id==="commemoration:12-04-barbara:4:r"),
   "Advent Sunday must not acquire Barbara commemoration from Dec 4 civil-date rule");
 // The 1960 General Rubrics 16(a), 17(d) explicitly prohibit the
 // Sunday commemoration under a feast of the Lord assigned to that Sunday.
 // This is a source-owner prayer rule, not only a Calendar label preference.
 for(const date of ["2024-10-27","2027-10-31","2026-10-25"]){
   const item=result.find(x=>x.date===date);
   assert.match(item.main?.id||"",/^sancti:10-DU:1:w$/,date+": wrong Lord's feast");
   assert.equal(item.comms.length,0,date+": Christ the King must omit the Sunday");
   assert.equal(item.calendarCommemorations?.length||0,0,date+": forbidden Sunday Mass orations were appended");
   for(const key of ["collects","secrets","postcommunions"])
     assert.equal(item[key],1,date+": unexpected extra "+key+" in Christ the King Proper");
 }
 for(const date of ["2024-01-07","2027-01-03","2027-01-10","2027-05-23","2028-08-06"]){
   const item=result.find(x=>x.date===date);
   assert.equal(item.status,"ready",date+": Lord's feast day unresolved");
   assert.ok(!item.comms.some(x=>/^tempora:.*-0/.test(x.id||"")),
     date+": Sunday commemoration added beneath an assigned Lord's feast");
 }
 // Do not generalize this suppression to feasts of saints or Our Lady:
 // e.g. a first-class feast replacing a second-class Sunday may require
 // privileged Sunday orations, as on the Assumption or All Saints.
 const saintsSunday=result.find(x=>x.date==="2026-11-01");
 assert.ok(saintsSunday.comms.some(x=>/^tempora:.*-0/.test(x.id||"")),
   "All Saints must retain the privileged Sunday commemoration");
 assert.ok(saintsSunday.collects>=2&&saintsSunday.secrets>=2&&saintsSunday.postcommunions>=2,
   "All Saints must retain the three Sunday orations");
 console.log("PASS 1962 ordinary Rogations, Christ the King no-Sunday-commemoration, other Lord feasts and privileged saint/Advent/Petrine commemorations");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
