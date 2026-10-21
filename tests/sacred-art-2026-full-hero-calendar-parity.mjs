// Resolve every date in 2026 hero master against the actual Ad Orientem
// 1962 production DayResolver. This is a verification of liturgical identity,
// NEVER artwork/photograph approval or permission to publish.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const source="data/calendar/sacred-art-2026-complete-hero-coverage-master.v1.json";
const master=JSON.parse(await readFile(resolve(root,source),"utf8"));
const rows=master.dateIndex;
assert.equal(master.counts.sundays,52);
assert.equal(master.counts.classIDates,53);
assert.equal(master.counts.additionalMajorHighlights,17);
assert.equal(master.counts.uniqueCalendarDates,102);
assert.equal(rows.length,102);
assert.equal(new Set(rows.map(x=>x.date)).size,102);
const out=resolve(root,"artifacts/sacred-art-full-year-resolver");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const f=resolve(root,"."+p);
  if(f!==root&&!f.startsWith(root+sep)){res.writeHead(403);res.end();return}
  res.writeHead(200,{"content-type":mime[extname(f)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(f));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser,result;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({serviceWorkers:"block"});
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_RUNTIME_V8?.resolver?.resolveDay==="function",null,{timeout:90000});
 const actual=[];
 for(let i=0;i<rows.length;i+=8){
  const dates=rows.slice(i,i+8).map(x=>x.date);
  const resolved=await page.evaluate(async list=>{
   const resolver=globalThis.AO_RUNTIME_V8.resolver;
   return Promise.all(list.map(async date=>{
    try{
     const r=await resolver.resolveDay(date);
     const main=r?.day?.main||{};
     const gospel=r?.proper?.data?.gospel||{};
     const scripture=r?.proper?.data?.scripture||{};
     const ref=(gospel.ref||gospel.reference||gospel.citation||scripture.gospel?.reference||"");
     return {date,status:r?.status||null,returnedDate:r?.date||null,
       observedPrincipalId:main.id||null,observedTitle:main.title||main.name||null,
       observedRank:main.rank??null,observedColour:main.color||null,
       properReady:r?.proper?.status==="ready",gospelReference:ref};
    }catch(e){return {date,error:String(e)}}
   }));
  },dates);
  actual.push(...resolved);
 }
 const map=new Map(actual.map(x=>[x.date,x]));
 const classI=master.groups.classI.map(x=>{
  const a=map.get(x.date);
  return {date:x.date,expectedId:x.observedPrincipalId,actualId:a?.observedPrincipalId||null,
   matched:x.observedPrincipalId===a?.observedPrincipalId,
   title:a?.observedTitle||null};
 });
 const sunday=master.groups.sundays.map(x=>({
   date:x.date,actualId:map.get(x.date)?.observedPrincipalId||null,
   title:map.get(x.date)?.observedTitle||null,observedRank:map.get(x.date)?.observedRank??null,
   gospelReference:map.get(x.date)?.gospelReference||null,
   researchHeroLocked:Boolean(x.lockedDatePainting)
 }));
 const extras=master.groups.additionalMajorHighlights.map(x=>({
   date:x.date,nominalTitle:x.title,observedPrincipalId:map.get(x.date)?.observedPrincipalId||null,
   actualPrincipalTitle:map.get(x.date)?.observedTitle||null,
   sameTitleAsNominal:x.title===map.get(x.date)?.observedTitle,
   actualObservedRank:map.get(x.date)?.observedRank??null,
   requiresTitleAliasReconciliation:x.title!==map.get(x.date)?.observedTitle
 }));
 const locked=rows.filter(x=>x.lockedDatePainting).map(x=>({
   date:x.date,painting:x.lockedDatePainting.title,artist:x.lockedDatePainting.artist,
   dayPrincipal:map.get(x.date)?.observedPrincipalId||null,
   principalMatch:classI.some(v=>v.date===x.date&&v.matched)
 }));
 result={schema:"AO_SACRED_ART_2026_ALL_102_UNIQUE_HERO_DATES_RUNTIME_AUDIT_V1",
   asOf:"2026-10-21",source,method:"REAL_APP_1962_DAYRESOLVER_CHROMIUM",
   counts:{uniqueDates:rows.length,successfullyResolved:actual.filter(x=>x.status==="ready"&&x.returnedDate===x.date&&x.observedPrincipalId).length,
     sundayRows:sunday.length,classIDates:classI.length,classIPrincipalMatches:classI.filter(x=>x.matched).length,
     classIPrincipalMismatches:classI.filter(x=>!x.matched).length,
     spotlightRows:extras.length,spotlightTitleAliasesToReview:extras.filter(x=>!x.sameTitleAsNominal).length,
     lockedUserPaintings:locked.length,lockedClassIPrincipalMatches:locked.filter(x=>x.principalMatch).length,
     appImagesReleased:0,photoRightsApprovedByThisAudit:0},
   observedDates:actual,classIAudit:classI,sundayAudit:sunday,supplementarySpotlightAudit:extras,
   lockedSelectionAudit:locked,scope:"Calendar verification only: NO image/photo re-curation or rights grant."};
 await mkdir(out,{recursive:true});
 await writeFile(resolve(out,"2026-hero-102-dayresolver-proof.json"),JSON.stringify(result,null,2)+"\n");
 console.log("HERO_YEAR_SUMMARY "+JSON.stringify(result.counts));
 for(const x of actual)console.log("HERO_YEAR_OBSERVED "+JSON.stringify(x));
 for(const x of classI.filter(x=>!x.matched))console.log("HERO_CLASS_I_MISMATCH "+JSON.stringify(x));
 for(const x of extras.filter(x=>!x.sameTitleAsNominal))console.log("HERO_SUPPLEMENTARY_TITLE_ALIAS "+JSON.stringify(x));
 assert.equal(result.counts.successfullyResolved,102,"All target dates must resolve, otherwise remain on hold");
 assert.equal(result.counts.lockedClassIPrincipalMatches,10,"All exact curator-approved dates must retain correct canonical principal");
 assert.equal(result.counts.classIPrincipalMismatches,0,"Old Class I principal registry differs from actual resolver; reconcile before release");
 console.log("HERO_YEAR_RESOLVER_PASS 102/102 actual dates; 53/53 Class I principal IDs; 10/10 approved heroes unchanged");
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
