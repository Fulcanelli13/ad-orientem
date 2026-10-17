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
  await page.waitForSelector("#aoPray435930.open .aoQuietMonthRegister",{timeout:12000});
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
 const snapshot=async(name,kind)=>{
  const selector="#aoPray435930.open .aoQuietMonthRegister";
  const data=await page.evaluate(selector=>{
   const box=document.querySelector(selector);
   const rect=el=>{if(!el)return null;const r=el.getBoundingClientRect();return {top:Math.round(r.top),bottom:Math.round(r.bottom),height:Math.round(r.height),width:Math.round(r.width)}};
   return {
    kind:box?.dataset.aoMonthKind,
    streak:box?.dataset.aoMonthStreak,
    tracking:box?.dataset.aoMonthTracking,
    statuses:[...box.querySelectorAll(".aoQuietMonthCell")].map(c=>({month:c.dataset.month,status:c.dataset.status})),
    regions:{
      monthRegister:rect(box),
      guidedDate:rect(document.querySelector("#aoPray435930.open .aoP435930Date")),
      guide:rect(document.querySelector("#aoPray435930.open .aoP435930GuideNow")),
      firstAction:rect(document.querySelector("#aoPray435930.open .aoP435930GuideNav"))
    },
    horizontalOverflow:Math.round(document.documentElement.scrollWidth-innerWidth),
    screenshotViewport:{width:innerWidth,height:innerHeight}
   };
  },selector);
  assert.equal(data.kind,kind);assert.ok(data.regions.monthRegister?.height>0);assert.ok(data.horizontalOverflow<=1);
  await page.screenshot({path:resolve(out,name+".png"),animations:"disabled"});
  return data;
 };
 await start();
 await open("friday");
 const fridayOff=await snapshot("friday-tracking-off-390","friday");
 assert.equal(fridayOff.tracking,"false");
 assert.ok(fridayOff.statuses.every(x=>x.status==="unrecorded"));
 await page.evaluate(records=>{
  const state=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
  state.firstFriday=records.firstFriday;state.firstSaturday=records.firstSaturday;
  localStorage.setItem("ao.pray.v435930",JSON.stringify(state));
 },sample);
 await start();await open("friday");
 const fridayRecorded=await snapshot("friday-three-months-390","friday");
 assert.equal(fridayRecorded.streak,"3");
 assert.equal(fridayRecorded.statuses.filter(x=>x.status==="recorded").length,3);
 await open("saturday");
 const saturdayRecorded=await snapshot("saturday-three-months-390","saturday");
 assert.equal(saturdayRecorded.streak,"3");
 assert.equal(saturdayRecorded.statuses.filter(x=>x.status==="recorded").length,3);
 await page.setViewportSize({width:320,height:720});
 const saturdayNarrow=await snapshot("saturday-three-months-320","saturday");
 assert.ok(saturdayNarrow.regions.monthRegister.width<=320);
 await page.setViewportSize({width:390,height:844});
 await page.evaluate(()=>{
  const state=JSON.parse(localStorage.getItem("ao.pray.v435930")||"{}");
  state.firstFriday.records.push({date:"2026-10-02",complete:false});
  localStorage.setItem("ao.pray.v435930",JSON.stringify(state));
 });
 await start();await open("friday");
 const fridayInterrupted=await snapshot("friday-interrupted-390","friday");
 assert.equal(fridayInterrupted.streak,"0");
 assert.deepEqual(fridayInterrupted.statuses.slice(0,4).map(x=>x.status),
  ["recorded","recorded","recorded","incomplete"]);
 await writeFile(resolve(out,"report.json"),JSON.stringify({fridayOff,fridayRecorded,saturdayRecorded,saturdayNarrow,fridayInterrupted,errors},null,2));
 assert.deepEqual(errors,[],"Unhandled browser errors");
 console.log("PASS actual phone review: empty 9-month, recorded 9-month, recorded 5-month, narrow 320px and interrupted states");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}