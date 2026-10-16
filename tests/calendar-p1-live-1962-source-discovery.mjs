// Focused *production resolver* witness. Unlike synthetic adapter tests,
// these values come from the existing app, not a guessed Saints/Commune path.
// Research-only; never changes Mass selection or touches an active session.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 page.setDefaultTimeout(90000);
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 const results=await page.evaluate(async dates=>{
  const source=globalThis.AO_RUNTIME_V8?.resolver;
  const reports=[];
  for(const date of dates){
   try{
    const r=await source.resolveDay(date);
    const d=r?.day??{},p=r?.proper?.data??{},comm=d.commemorations??[];
    reports.push({
      date,status:r?.status??null,dayDate:r?.date??null,
      principal:{id:d.main?.id??null,path:d.main?.path??null,rank:d.main?.rank??null,title:d.main?.title??null},
      proper:{status:r?.proper?.status??null,path:p.sourcePath??r?.proper?.sourcePath??null,
        orationGroups:Object.fromEntries(["collects","secrets","postcommunions"].map(k=>[k,
          (p[k]??[]).map((x,i)=>({index:i+1,sourcePath:x?.sourcePath??null,
           latinPresent:Boolean(x?.lat??x?.la),englishPresent:Boolean(x?.en),frenchPresent:Boolean(x?.fr)}))])),
        calendarCommemorations:(p.calendarCommemorations??[]).map(x=>
         ({id:x?.id??null,path:x?.path??null,prayerSourcePath:x?.prayerSourcePath??null})),
        appliedCommemorations:(p.appliedCommemorations??[]).map(x=>({id:x?.id??null,path:x?.path??null})),
        formDecision:{status:p.commemorationFormDecision?.status??null,
          source:p.commemorationFormDecision?.source??null,
          reason:p.commemorationFormDecision?.reason??null}},
      calendarCommemorations:(Array.isArray(comm)?comm:[comm]).map(x=>typeof x==="string"?
        {value:x,id:null,path:null}:{id:x?.id??null,path:x?.path??null,title:x?.title??x?.name??null}),
    });
   }catch(e){reports.push({date,error:String(e?.message??e)})}
  }
  return reports;
 },["2026-10-09","2027-10-09","2026-10-15","2026-10-03","2026-09-23"]);
 console.log("P1_REAL_SOURCE_WITNESS="+JSON.stringify(results));
 const october=results[0];
 assert.equal(october.date,"2026-10-09");
 assert.equal(october.status,"ready","October 9 canonical resolver must be ready");
 assert.equal(october.dayDate,"2026-10-09");
 assert.ok(october.principal?.id?.startsWith("sancti:10-09:"),"The original day must remain traditional 1962");
 assert.ok(october.principal?.path&&october.proper?.path,"Source path discovery cannot be declared on title alone");
 console.log("P1 resolver live source identity PASS; witness is observation only, not an authorized alternative saint Mass.");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
