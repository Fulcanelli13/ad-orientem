import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",
".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(file));
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:1,
  isMobile:true,hasTouch:true,serviceWorkers:"block",reducedMotion:"reduce"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 try{
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
    null,{timeout:45000});
  const openModule=async(id,opts={})=>{
    const res=await page.evaluate(({id,opts})=>window.AO_MODULES.open(id,opts),{id,opts});
    assert.equal(res?.ok,true,"Module open failure "+id+": "+JSON.stringify(res));
  };
  // Calendar -> specific Novena direct detail -> Back must restore Calendar,
  // never synthesize a Novenas index or Prayer hub.
  const calendar=await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("calendar"));
  assert.equal(calendar.ok,true);
  await openModule("pray.novenas",{novenaId:"st_joseph",returnContext:{surface:"calendar"}});
  await page.locator("#aoPray435930.open [data-n1-back]").waitFor({state:"visible",timeout:15000});
  assert.equal(await page.locator("#aoPray435930.open [data-n1-select]").count(),0,
    "Direct Novena detail unexpectedly opened the overview");
  await page.locator("#aoPray435930.open [data-n1-back]").click();
  await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.getActive?.()==="calendar"&&
   document.querySelector("#aoPray435930.open")==null,null,{timeout:15000});
  assert.equal(await page.locator("#aoPray435930.open [data-n1-select]").count(),0,
    "Synthetic Novena overview was inserted on Calendar Back");

  // Prayer hub -> all Novenas -> selected detail -> real visited overview
  // -> original Prayer hub. Both Back destinations are legitimate.
  const pray=await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("pray"));
  assert.equal(pray.ok,true);
  await openModule("pray.novenas");
  await page.locator("#aoPray435930.open [data-n1-select]").first().waitFor({state:"visible",timeout:15000});
  await page.locator("#aoPray435930.open [data-n1-select]").first().click();
  await page.locator("#aoPray435930.open [data-n1-back]").click();
  assert.ok(await page.locator("#aoPray435930.open [data-n1-select]").count()>=15,
    "Visited Novena overview was not restored");
  await page.locator("#aoPray435930.open [data-n1-back]").click();
  await page.waitForFunction(()=>document.querySelector("#aoPray435930.open [data-ao-rosary-chooser]")==null &&
   document.querySelector("#aoPray435930.open .aoP435930Home")!==null,null,{timeout:15000});
  assert.equal(await page.evaluate(()=>window.AO_APP_SHELL_V1.getActive()),"pray");

  // Home -> guided Morning Prayer -> Back must skip an unvisited all-prayers list.
  const home=await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("home"));
  assert.equal(home.ok,true);
  await openModule("pray.morning_evening");
  await page.locator("#aoPray435930.open [data-tp381-back]").waitFor({state:"visible",timeout:15000});
  assert.equal(await page.locator('#aoPray435930.open [data-tp381-daily-mode="list"]').count(),1,
   "Guided Prayer should offer a direct prayer index without opening it");
  await page.locator("#aoPray435930.open [data-tp381-back]").click();
  await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.getActive?.()==="home"&&
   document.querySelector("#aoPray435930.open")==null,null,{timeout:15000});
  assert.equal(await page.locator("#aoPray435930.open [data-tp381-daily-mode='list']").count(),0,
    "Unvisited All Prayers list invented on Back");
  assert.deepEqual(errors,[],"Unexpected browser errors: "+errors.join("; "));
  console.log("PASS 390px non-Mass exact Back: Calendar direct Novena, visited overview, Prayer hub, Home guided prayer");
 }finally{await page.close()}
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
