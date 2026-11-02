// Field regression: reproduce the user's 2 Nov H7 screenshot, not a synthetic
// Mass-source projection. A recently refreshed 31 Oct checkpoint must not
// replace Begin Mass. Tap the visible Mass III choice and start real R17.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
  ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
  ".css":"text/css; charset=utf-8",".png":"image/png",".webp":"image/webp",
  ".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
    const bytes=await readFile(path);
    res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
    res.end(bytes);
  }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
let browser;
try{
  await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
  browser=await chromium.launch({headless:true,executablePath:process.env.AO_BROWSER_BIN||undefined});
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,
    locale:"en-GB",serviceWorkers:"block"});
  await context.addInitScript(()=>{
    const old={
      schema:"ao-mass-entry-bootstrap-v1",state:"suspended",
      session:{resolvedMass:{schema:"ao-resolved-mass-v2",date:"2026-10-31"}},
      readerPreferences:{mode:"LIVE",language:"en"},
      readerPosition:{sectionId:"AO.LIVECURATED.062",sequence:62},
      // Deliberately refreshed TODAY to exercise the stale-checkpoint loophole.
      storedAt:new Date().toISOString(),updatedAt:new Date().toISOString(),
    };
    localStorage.setItem("ao-r17-active-mass-v1",JSON.stringify(old));
  });
  const page=await context.newPage(),pageErrors=[];
  page.on("pageerror",e=>pageErrors.push(String(e?.message??e)));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>Boolean(globalThis.AO_HOME_APP_V1?.paint) &&
    Boolean(globalThis.AO_R17_BROWSER_ENTRY?.installed) &&
    typeof globalThis.AO_CALENDAR_WEEK_CACHE_V4345?.revealDate==="function",null,{timeout:60000});
  const opened=await page.evaluate(async()=>{
    return globalThis.AO_CALENDAR_WEEK_CACHE_V4345.revealDate("2026-11-02",
      {forceLoader:false,prefetch:false});
  });
  assert.equal(opened,true,"2 November must resolve through native Calendar");
  await page.waitForFunction(()=>{
    const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return s?.selectedDate==="2026-11-02"&&!s.resolving&&
      s?.resolution?.date==="2026-11-02"&&s?.resolution?.proper?.status==="ready";
  },null,{timeout:60000});
  await page.evaluate(()=>globalThis.AO_HOME_APP_V1.paint());
  const stale=await page.evaluate(()=>({
    engineResumable:globalThis.AO_R17_BROWSER_ENTRY.hasResumable(),
    resumeButtons:document.querySelectorAll(".homeScreen [data-resume-mass]").length,
    beginButtons:document.querySelectorAll(".homeScreen [data-home-h4-begin]").length,
    savedDate:JSON.parse(localStorage.getItem("ao-r17-active-mass-v1"))?.session?.resolvedMass?.date,
  }));
  assert.equal(stale.savedDate,"2026-10-31");
  assert.equal(stale.engineResumable,false,
    "The 31 Oct checkpoint may not block 2 Nov even if its timestamp is refreshed");
  assert.equal(stale.resumeButtons,0,
    "Home must not replace Begin Mass with a stale 31 Oct Resume button");
  assert.equal(stale.beginButtons,1,"Home must expose a real Begin Mass action");
  await page.locator(".homeScreen [data-home-h7-enter]").first().click();
  await page.waitForSelector(".aoH7DoorView:not([hidden]) [data-formulary]",
    {state:"visible",timeout:25000});
  const choices=page.locator(".aoH7DoorView:not([hidden]) [data-formulary]");
  assert.equal(await choices.count(),3,"All three All Souls formularies must appear");
  const third=choices.filter({hasText:"Mass III"});
  assert.equal(await third.count(),1,"Mass III must be a distinct visible choice");
  await third.click();
  await page.waitForFunction(()=>{
    const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
    return s?.route==="home"&&!s.resolving &&
      s?.resolution?.day?.selectedMassOption?.path==="Sancti/11-02m3" &&
      s?.resolution?.proper?.data?.sourcePath==="Sancti/11-02m3";
  },null,{timeout:60000});
  assert.equal(await page.locator('.homeScreen [data-home-shortcut-error]').count(),0,
    "Visible Mass III choice must not raise a generic open error");
  const begin=page.locator(".aoH7DoorView:not([hidden]) [data-home-h4-begin]");
  assert.equal(await begin.count(),1,"After choosing Mass III, Begin must remain available");
  assert.equal(await begin.isDisabled(),false,"Mass III Begin must not be disabled");
  await begin.click();
  // If the test runs after Nov 2, the explicit historical-date confirmation is required.
  if(await page.locator("[data-home-mass-date-warning]").count())await begin.click();
  await page.waitForFunction(()=>
    Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected) ||
    Boolean(document.querySelector(".homeScreen [data-home-shortcut-error]")),
    null,{timeout:65000});
  const result=await page.evaluate(()=>({
    mounted:Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
    proper:globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass?.proper?.data?.sourcePath??null,
    overlays:globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass?.overlays??[],
    error:document.querySelector(".homeScreen [data-home-shortcut-error]")?.textContent??null,
  }));
  assert.equal(result.mounted,true,"Real H7 Mass III click must open R17: "+JSON.stringify(result));
  assert.equal(result.proper,"Sancti/11-02m3","R17 must not substitute the First Mass Proper");
  assert.ok(result.overlays.includes("REQUIEM"),"Mass III must retain Requiem ceremonial rules");
  assert.deepEqual(pageErrors,[],"No browser errors: "+JSON.stringify(pageErrors.slice(0,5)));
  console.log("PASS field H7 stale 31 Oct checkpoint → All Souls Mass III → Begin R17",
    JSON.stringify({stale,result}));
  await context.close();
}finally{
  await browser?.close();
  if(server.listening)await new Promise(ok=>server.close(ok));
}
