// Verify that Oct 19 editor-approved feast image dates are matched to the REAL
// Ad Orientem 1962 DayResolver, not an old snapshot or feast-title inference.
// Research verdict is written as JSON even when some expected IDs diverge.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,writeFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {APPROVED_FEAST_HERO_DATES,approvedFeastHeroForResolvedDay} from "../src/calendar/approved-feast-heroes.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dir=resolve(root,"artifacts/sacred-art-verified-principal");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
   const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
   const file=resolve(root,"."+name);
   if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
   res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
   res.end(await readFile(file));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(e.message)}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
let result=null;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:120000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",{timeout:120000});
 const dates=APPROVED_FEAST_HERO_DATES.map(x=>x.date);
 const actual=await page.evaluate(async dates=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   return await Promise.all(dates.map(async date=>{
     try{
       const r=await resolver.resolveDay(date);
       return {date,status:r?.status,returnedDate:r?.date,
         principalId:r?.day?.main?.id||null,title:r?.day?.main?.title||r?.day?.main?.name||null,
         rank:r?.day?.main?.rank||null,colour:r?.day?.main?.color||null};
     }catch(e){return {date,error:String(e)}}}
   ));
 },dates);
 const rows=APPROVED_FEAST_HERO_DATES.map(d=>{
   const a=actual.find(x=>x.date===d.date);
   return {...a,editorApprovedArtist:d.artist,editorApprovedPainting:d.title,
      expectedPrincipalId:d.observedPrincipalId,
      idMatches:a?.principalId===d.observedPrincipalId,
      adapterWouldShow:!!approvedFeastHeroForResolvedDay(d.date,a?.principalId)};
 });
 result={schema:"AO_TEN_FEAST_HERO_ACTUAL_DAYRESOLVER_PARITY_V1",method:"REAL_PRODUCTION_BROWSER_DAY_RESOLVER",
   source:"src/calendar/approved-feast-heroes.js",
   checks:{dates:rows.length,dayResolverResults:rows.filter(x=>x.principalId).length,
     principalIdMatches:rows.filter(x=>x.idMatches).length,
     mismatches:rows.filter(x=>!x.idMatches).map(x=>({date:x.date,actual:x.principalId,expected:x.expectedPrincipalId}))},
   records:rows,releasePermissions:"NONE; THIS IS CALENDAR MAPPING QA ONLY"};
 await mkdir(dir,{recursive:true});
 await writeFile(resolve(dir,"ten-approved-hero-real-resolver-parity.json"),JSON.stringify(result,null,2)+"\n");
 for(const x of rows)console.log("HERO_RESOLVER_PROOF "+JSON.stringify(x));
 console.log("HERO_RESOLVER_COMPLETE "+JSON.stringify(result.checks));
 assert.equal(result.checks.dayResolverResults,10,"Not all ten actual observances resolved");
 assert.equal(result.checks.principalIdMatches,10,"Artwork date canonical principal ID mismatch detected: fix mapping before release");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
