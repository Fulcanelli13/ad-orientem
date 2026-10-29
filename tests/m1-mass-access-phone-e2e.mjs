import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/m1-mass-access");await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,320]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",e=>errors.push(String(e.message)));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native&aoMassAccessM1=1",
    {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForSelector(".homeScreen",{state:"visible",timeout:30000});
  await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.installed&&globalThis.AO_CELEBRATION_API?.openPreflight),
    null,{timeout:30000});
  const entry=page.locator(".homeScreen [data-home-mass-entry]");
  await entry.waitFor({state:"visible",timeout:12000});await entry.click();
  const p=page.locator('[data-ao-full-mass-preflight][data-ao-mass-access-m1="true"]');
  await p.waitFor({state:"visible",timeout:18000});
  await page.waitForSelector("[data-m1-rows] [data-m1-choice='mass']",{state:"visible"});
  const ids=await page.locator("[data-m1-rows] [data-m1-choice]").evaluateAll(
    nodes=>nodes.map(n=>n.dataset.m1Choice));
  assert.deepEqual(ids.slice(0,6),["mass","ceremony","reader","language","before","after"]);
  assert.equal(await page.locator("[data-ao-start-live]").count(),1,
    "M1 must reuse the one authoritative Start Mass button");
  assert.equal(await page.locator(".aoMassFolioStepNav").isVisible(),false,"Old wizard must be hidden in M1");
  // Review frames must show the settled overlay, not a mid-transition crossfade.
  await page.waitForTimeout(750);
  await page.screenshot({path:resolve(out,width+"-overview-dark.png")});
  await page.locator("[data-m1-choice='ceremony']").click();
  await page.locator('[data-full-mass-form][value="LOW"]').check();
  await page.waitForSelector("[data-m1-choice='ceremony']",{state:"visible"});
  assert.equal(await p.getAttribute("data-ao-chosen-mass-form"),"LOW");
  const chosen=await page.locator("[data-m1-choice='ceremony'] .aoM1ChoiceContent strong").innerText();
  assert.match(chosen,/Low Mass/i,"Overview did not reflect native ceremony selection");
  await page.locator("[data-m1-choice='reader']").click();
  await page.locator('[data-full-mass-reader-mode][value="MISSAL"]').check();
  await page.waitForSelector("[data-m1-choice='reader']",{state:"visible"});
  assert.equal(await p.getAttribute("data-ao-chosen-reader-mode"),"MISSAL");
  await page.locator("[data-m1-choice='language']").click();
  await page.locator("[data-folio-language]").selectOption("fr");
  await page.locator("[data-folio-overview-button]").click();
  await page.waitForSelector("[data-m1-choice='language']",{state:"visible"});
  assert.match(await page.locator("[data-m1-choice='language']").innerText(),/Français/);
  await page.locator("[data-m1-choice='before']").click();
  await page.locator("[data-folio-before][value='full']").check();
  await page.locator("[data-folio-overview-button]").click();
  await page.waitForSelector("[data-m1-choice='before']",{state:"visible"});
  assert.match(await page.locator("[data-m1-choice='before']").innerText(),/Préparation complète/);
  await page.locator("[data-m1-choice='after']").click();
  await page.locator("[data-folio-after][value='thanksgiving']").check();
  await page.locator("[data-folio-overview-button]").click();
  await page.waitForSelector("[data-m1-choice='after']",{state:"visible"});
  assert.match(await page.locator("[data-m1-choice='after']").innerText(),/Action de grâces/);
  const state=await page.evaluate(()=>{
    const root=document.querySelector("[data-ao-full-mass-preflight]");
    const rect=root.getBoundingClientRect();
    const exp=globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.fullMassPreflight?.experience;
    return {form:root.dataset.aoChosenMassForm,reader:root.dataset.aoChosenReaderMode,
      width:rect.width,viewport:document.documentElement.clientWidth,
      preferences:exp,ownerCount:document.querySelectorAll("[data-ao-full-mass-preflight]").length,
      readerMounted:!!globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected};
  });
  assert.equal(state.ownerCount,1,"No duplicate preflight state owner");
  assert.equal(state.readerMounted,false,"Chooser must not start R17");
  assert.equal(state.preferences?.before,"full");
  assert.equal(state.preferences?.after,"thanksgiving");
  assert.ok(state.width<=state.viewport+1,"M1 overflows the viewport");
  assert.equal(errors.length,0,"M1 browser errors: "+JSON.stringify(errors));
  await page.screenshot({path:resolve(out,width+"-overview-fr.png")});
  console.log("PASS M1 phone "+width+"px: one preflight, six source-owned choices, live updates, no reader restart");
  await page.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
