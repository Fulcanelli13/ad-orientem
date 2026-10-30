import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const body=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const errors=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoTodayH4=0&aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_CELEBRATION_API?.openPreflight),null,{timeout:30000});
  const entry=page.locator(".homeScreen [data-home-mass-entry]");
  assert.equal(await entry.count(),1,"Home Follow Mass CTA missing");
  await entry.click();
  await page.waitForFunction(()=>{
   const back=document.querySelector("#ao-mass-flow-v1 .aoMassFlowBackdrop");
   return back&&back.isConnected&&!back.hidden&&
     getComputedStyle(back).display!=="none"&&getComputedStyle(back).visibility!=="hidden";
  },null,{timeout:18000});
  const prep=page.locator("[data-ao-full-mass-preflight]");
  await prep.waitFor({state:"visible",timeout:15000});
  const hierarchy=await page.evaluate(()=>{
   const flow=document.querySelector("#ao-mass-flow-v1"),pre=flow?.querySelector("[data-ao-full-mass-preflight]");
   const parent=pre?.parentElement;
   const describe=e=>({tag:e.tagName,cls:String(e.className||"").slice(0,150),
      id:e.id,ds:Object.keys(e.dataset||{}).slice(0,16),
      text:(e.textContent||"").trim().replace(/\\s+/g," ").slice(0,120),
      visible:!!e.getClientRects().length,display:getComputedStyle(e).display});
   return {flow:flow?describe(flow):null,
      direct:parent?[...parent.children].map(describe):[],
      nodes:flow?[...flow.querySelectorAll("*")].filter(e=>e.children.length<5 && /VOX|MASS OF THE DAY|CONTENT READINESS|HOW DO YOU WANT TO FOLLOW/i.test((e.textContent||"").trim().slice(0,90)))
        .slice(0,30).map(describe):[]};
  });
  for(const donor of hierarchy.direct.filter(x=>/aoPreflightHero|aoReadiness|aoRubricStatus ok/.test(x.cls) ||
    (x.cls==="aoChoiceGrid"&&/VOX.*Missal/.test(x.text)))){
    assert.equal(donor.visible,false,"Obsolete host card appears above Guided Folio: "+JSON.stringify(donor));
  }
  assert.equal(hierarchy.direct.filter(x=>x.cls==="aoFullMassPreflight").length,1,
    "Exactly one Guided Folio must own the preparation form");
  const data=await page.evaluate(()=>{
   const root=document.querySelector("[data-ao-full-mass-preflight]");
   const backing=document.querySelector("#ao-mass-flow-v1 .aoMassFlowBackdrop");
   const cs=getComputedStyle(root),rect=root.getBoundingClientRect();
   return {title:root.querySelector("[data-full-mass-title]")?.textContent,
      categories:root.querySelectorAll("[data-full-mass-category]").length,
      forms:root.querySelectorAll("[data-full-mass-form]").length,
      modes:[...root.querySelectorAll("[data-full-mass-reader-mode]")].map(x=>x.value),
      startButtons:document.querySelectorAll("[data-ao-start-live]").length,
      readerPresent:Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
      visible:cs.visibility!=="hidden"&&cs.display!=="none"&&rect.width>80&&rect.height>80,
      backdrop:backing?.className};
  });
  assert.equal(data.visible,true,"Mass preparation layout not visible: "+JSON.stringify(data));
  assert.ok(data.categories>=5,"Mass category selection missing: "+JSON.stringify(data));
  assert.ok(data.forms>=3,"Low/Sung/Solemn choices missing: "+JSON.stringify(data));
  assert.deepEqual(data.modes,["MISSAL","LIVE"]);
  assert.equal(data.readerPresent,false,"Follow Mass started LIVE without preparation");
  assert.ok(data.startButtons>0,"No explicit Start Mass control");

  // Real mobile handoff: a chosen full preparation must open the canonical
  // Prayer reader and leave the Mass source selection untouched on Back.
  assert.equal(await page.locator("[data-folio-before]").count(),3,
    "Before Mass must have none, brief and full choices");
  assert.equal(await page.locator("[data-folio-after]").count(),3,
    "After Mass must have none, thanksgiving and full choices");
  // M1 shows one source-owned choice panel at a time. Select the visible
  // Before/After rows instead of clicking controls hidden behind other rows.
  await page.locator("[data-m1-choice='before']").click();
  await page.locator("[data-folio-before][value='full']").check();
  await page.locator("[data-folio-overview-button]").click();
  await page.locator("[data-m1-choice='after']").click();
  await page.locator("[data-folio-after][value='full']").check();
  await page.locator("[data-folio-overview-button]").click();
  await page.locator("[data-m1-choice='before']").click();
  assert.deepEqual(await page.evaluate(()=>{
    const x=globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight?.experience;
    return {before:x?.before,after:x?.after};
  }),{before:"full",after:"full"},"Mass Folio choices did not reach the session");
  await page.locator("[data-folio-open-prayer='before']").click();
  await page.waitForSelector("#aoPray435930.open [data-tp381-mass-continue]",{state:"visible",timeout:15000});
  assert.equal(await page.locator("#aoPray435930 .aoMassFolioPrayerNav").count(),1,
    "Preparation rendered outside the existing canonical Prayer reader");
  await page.locator("#aoPray435930 [data-tp381-mass-cancel]").click();
  await page.waitForFunction(()=>!document.getElementById("aoPray435930")?.classList.contains("open"),null,{timeout:10000});
  await prep.waitFor({state:"visible",timeout:10000});
  assert.equal(await page.locator("[data-folio-before][value='full']").isChecked(),true,
    "Prayer Back discarded the chosen Mass preparation");
  assert.equal(await page.locator("[data-folio-after][value='full']").isChecked(),true,
    "Prayer Back discarded post-Mass preference");

  console.log("PASS real phone "+width+"px Follow Mass opens Mass preparation, not LIVE",JSON.stringify(data));
  if(errors.length)console.log("Other page warnings",errors.slice(0,3));
  await page.close();
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
