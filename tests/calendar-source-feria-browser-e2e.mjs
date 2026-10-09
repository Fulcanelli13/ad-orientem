// Verify production DayResolver on all 55 historical uncontextualized feria
// titles. The original 2024/2027 ordo comparison owns the 55-date cohort.
// An absent Temporale must not acquire an invented weekday source.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,readFileSync} from "node:fs";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {promisify} from "node:util";
const fsRead=promisify(readFile);
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const registry=JSON.parse(readFileSync(resolve(root,"data/calendar/1962-editorial-reconciliation-2024-2027.v1.json"),"utf8"));
const dates=registry.groups.find(x=>x.key==="generic_feria").dates;
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname),file=resolve(root,"."+pathname);
    if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const data=await fsRead(file);
    res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
    res.end(data);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
try{
  browser=await chromium.launch({headless:true});
  const page=await browser.newPage({serviceWorkers:"block"});
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:60000});
  const records=[];
  for(let offset=0;offset<dates.length;offset+=8){
    const chunk=dates.slice(offset,offset+8);
    records.push(...await page.evaluate(async dates=>{
      const {calendarObservanceAlias}=await import("/src/calendar/observance-title.js");
      const resolver=globalThis.AO_RUNTIME_V8.resolver;
      return Promise.all(dates.map(async date=>{
        try{
          const r=await resolver.resolveDay(date);
          return {date,status:r.status,properStatus:r.proper?.status,error:r.error||r.proper?.error||null,
            main:r.day?.main?.id||null,mainTitle:r.day?.main?.title||null,
            temporal:(r.day?.tempora||[]).map(x=>x.id),
            properSourcePath:r.proper?.data?.sourcePath||null,
            en:calendarObservanceAlias(r,"en"),fr:calendarObservanceAlias(r,"fr"),
            commemorations:(r.day?.commemorations||[]).map(x=>x.id),
          };
        }catch(e){return {date,status:"exception",error:String(e?.message||e)};}
      }));
    },chunk));
  }
  assert.equal(records.length,55);
  assert.equal(new Set(records.map(x=>x.date)).size,55);
  for(const r of records){
    assert.equal(r.status,"ready",r.date+": failure "+r.error);
    assert.equal(r.properStatus,"ready",r.date+": unresolved Proper "+r.error);
    assert.match(r.main||"",/^:feria:4:[wvgrbp]$/,r.date+": non-generic main");
  }
  const inherited=records.filter(x=>x.temporal.some(id=>/^tempora:(?:Epi|Pasc|Pent|Quadp)\d+-[1-5]:4:[wvgrbp]$/i.test(id)));
  const without=records.filter(x=>!x.temporal.length);
  assert.equal(inherited.length,53,"Source-linked historic 53 ferias changed");
  assert.equal(without.length,2,"Missing Temporale source count changed");
  for(const r of inherited){
    assert.ok(r.en&&r.fr,r.date+": lineage title missing; source "+r.temporal);
    assert.ok(!/^\s*Feria\s*$/i.test(r.en),r.date+": generic English label remained");
    assert.ok(!/^\s*Férie\s*$/i.test(r.fr),r.date+": generic French label remained");
    assert.ok(!/Sunday of |Dimanche de /i.test(r.en),r.date+": possible weekday-to-Sunday mislabel");
  }
  for(const r of without)assert.equal(r.en,null,
    r.date+": do not infer a missing Temporal source from civil date alone");
  for(const date of ["2024-11-05","2024-11-06","2024-11-07","2024-11-08","2027-11-03","2027-11-05"]){
    const r=records.find(x=>x.date===date);
    assert.match(r.en||"",/transferred.*Sunday after Epiphany/,date+": resumed Sunday source disguised as a January week");
    assert.match(r.fr||"",/reporté/,date+": French resumed Sunday lost");
  }
  console.log("FERIA_55_REAL_SOURCE_PROBES="+JSON.stringify({
    historic:55,linked:inherited.length,unlinked:without.length,
    linkedSample:inherited.slice(0,3),unlinkedEvidence:without,
    resumedEvidence:records.filter(x=>x.en?.includes("transferred")),
  }));
  console.log("PASS actual 2024/2027 pinned DayResolver feria + Proper projection, 53 grounded; 2 hold for orphan source review");
}finally{
  await browser?.close();await new Promise(ok=>server.close(ok));
}