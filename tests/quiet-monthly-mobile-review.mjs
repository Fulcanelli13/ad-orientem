import assert from "node:assert/strict";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import http from "node:http";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/quiet-monthly-review");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(data);
 }catch(err){res.writeHead(err?.code==="ENOENT"?404:500);res.end(String(err?.message||err))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4209,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB"});
 const page=await context.newPage();
 const errors=[];page.on("pageerror",e=>errors.push(String(e?.message||e)));
 const start=async()=>{
  await page.goto("http://127.0.0.1:4209/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
 };
 const open=async kind=>{
  const route=kind==="friday"?"programme.first_friday":"programme.first_saturday";
  const result=await page.evaluate(route=>globalThis.AO_PRAY_V435930.open(route,{returnContext:null}),route);
  assert.equal(result,true,route);
  await page.waitForSelector("#aoPray435930.open .aoQuietSeriesDisclosure",{timeout:12000});
 };
 const sample={
  firstFriday:{tracking:true,records:[
   {date:"2026-07-03",complete:true},{date:"2026-08-07",complete:true},
   {date:"2026-09-04",complete:true}
  ]},
  firstSaturday:{tracking:true,records:[
   {date:"2026-07-04",complete:true},{date:"2026-08-01",complete:true},
   {date:"2026-09-05",complete:true}
  ]}
 };
 const snapshot=async(name,kind,{expanded=false}={})=>{
  const drawer=page.locator("#aoPray435930.open .aoQuietSeriesDisclosure");
  if(expanded)await drawer.locator("summary").evaluate(el=>el.click());
  const data=await page.evaluate(()=>{
   const details=document.querySelector("#aoPray435930.open .aoQuietSeriesDisclosure"),box=details?.querySelector(".aoQuietMonthRegister");
   const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),height:Math.round(r.height),width:Math.round(r.width)}};
   return {
    kind:details?.dataset.aoSeriesKind,
    expanded:details?.open,
    streak:box?.dataset.aoMonthStreak||null,
    tracking:box?.dataset.aoMonthTracking||"false",
    statuses:[...(box?.querySelectorAll(".aoQuietMonthCell")||[])].map(c=>({month:c.dataset.month,status:c.dataset.status})),
    pips:[...details.querySelectorAll(".aoQuietSeriesPip")].map(c=>c.dataset.status),
    regions:{
      summary:rect(details?.querySelector("summary")),
      monthRegister:rect(box),
      guidedDate:rect(document.querySelector("#aoPray435930.open .aoP435930Date")),
      guide:rect(document.querySelector("#aoPray435930.open .aoP435930GuideNow")),
      firstAction:rect(document.querySelector("#aoPray435930.open .aoP435930GuideNav"))
    },
    horizontalOverflow:Math.round(document.documentElement.scrollWidth-innerWidth),
    screenshotViewport:{width:innerWidth,height:innerHeight}
   };
  });
  assert.equal(data.kind,kind);assert.equal(data.expanded,expanded);
  assert.ok(data.regions.summary?.height>=44&&data.regions.summary?.height<76,
    "A compact month summary must not crowd the prayer: "+JSON.stringify(data.regions.summary));
  assert.ok(data.horizontalOverflow<=1);
  if(!expanded)assert.ok(data.regions.guide?.top<580,
    "First prayer instruction must be visible on opening: "+JSON.stringify(data.regions.guide));
  await page.screenshot({path:resolve(out,name+".png"),animations:"disabled"});
  return data;
 };
 await start();
 await open("friday");
 const fridayOff=await snapshot("friday-tracking-off-compact-390","friday");
 assert.equal(fridayOff.tracking,"false");
 assert.equal(fridayOff.statuses.length,0,"Opted-out users must not see a large empty register");
 const fridayOffOpen=await snapshot("friday-tracking-off-expanded-390","friday",{expanded:true});
 assert.equal(fridayOffOpen.regions.monthRegister,null,"No register without opt-in");
 await page.evaluate(records=>{
  const state=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
  state.firstFriday=records.firstFriday;state.firstSaturday=records.firstSaturday;
  localStorage.setItem("ao.pray.v435930",JSON.stringify(state));
 },sample);
 await start();await open("friday");
 const fridayCompact=await snapshot("friday-three-months-compact-390","friday");
 assert.deepEqual(fridayCompact.pips.slice(0,4),["recorded","recorded","recorded","unrecorded"]);
 const fridayRecorded=await snapshot("friday-three-months-expanded-390","friday",{expanded:true});
 assert.equal(fridayRecorded.streak,"3");
 assert.equal(fridayRecorded.statuses.filter(x=>x.status==="recorded").length,3);
 await open("saturday");
 const saturdayCompact=await snapshot("saturday-three-months-compact-390","saturday");
 assert.deepEqual(saturdayCompact.pips,["recorded","recorded","recorded","unrecorded","unrecorded"]);
 const saturdayRecorded=await snapshot("saturday-three-months-expanded-390","saturday",{expanded:true});
 assert.equal(saturdayRecorded.streak,"3");
 assert.equal(saturdayRecorded.statuses.filter(x=>x.status==="recorded").length,3);
 await page.setViewportSize({width:320,height:720});
 await open("saturday");
 const saturdayNarrow=await snapshot("saturday-three-months-compact-320","saturday");
 assert.ok(saturdayNarrow.regions.summary.width<=320);
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{
  const state=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
  state.firstFriday.records.push({date:"2026-10-02",complete:false});
  localStorage.setItem("ao.pray.v435930",JSON.stringify(state));
 });
 await start();await open("friday");
 const fridayInterrupted=await snapshot("friday-interrupted-390","friday",{expanded:true});
 assert.equal(fridayInterrupted.streak,"0");
 assert.deepEqual(fridayInterrupted.statuses.slice(0,4).map(x=>x.status),
  ["recorded","recorded","recorded","incomplete"]);
 await writeFile(resolve(out,"report.json"),JSON.stringify({fridayOff,fridayOffOpen,fridayCompact,fridayRecorded,saturdayCompact,saturdayRecorded,saturdayNarrow,fridayInterrupted,errors},null,2));
 assert.deepEqual(errors,[],"Unhandled browser errors");
 console.log("PASS actual phone review: compact opt-out, recorded 9/5-month, narrow 320px, expanded register and interrupted series");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}