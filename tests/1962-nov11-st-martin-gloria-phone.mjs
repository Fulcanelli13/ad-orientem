// Public-path browser regression for the original Nov 11 St Martin P0.
// Uses local app and real date-picker/host preflight; no mocked Mass source.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",
 ".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden");}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"en-GB"});
 const errors=[];page.on("pageerror",e=>errors.push(String(e.message??e)));
 const base="http://127.0.0.1:"+server.address().port;
 const response=await page.goto(base+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:90000});
 assert.equal(response.status(),200);
 await page.waitForFunction(()=>Boolean(globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner&&
  globalThis.AO_R17_BROWSER_ENTRY?.status?.()?.installed&&
  globalThis.AO_CALENDAR_APP_V1?.select),null,{timeout:65000});
 await page.locator(".homeScreen .aoH7HomeView .date[data-home-calendar-view='picker']").click();
 await page.locator(".homeScreen .aoH4CalendarInline #ao-calendar-modular-root").waitFor({state:"visible",timeout:45000});
 assert.equal(await page.evaluate(()=>globalThis.AO_CALENDAR_APP_V1.select("2026-11-11",{closeAfter:false})),true);
 await page.locator(".homeScreen .aoH4CalendarBack [data-home-calendar-today]").click();
 await page.waitForFunction(()=>{
  const s=globalThis.AO_RUNTIME_V8?.store?.getState?.();
  return s?.selectedDate==="2026-11-11"&&!s.resolving&&
   s.resolution?.day?.main?.id==="sancti:11-11:3:w"&&
   s.resolution?.proper?.status==="ready";
 },null,{timeout:45000});
 await page.locator(".homeScreen .aoH7HomeView [data-home-h7-enter]").click();
 await page.locator(".homeScreen .aoH7DoorView:not([hidden])").waitFor({state:"visible",timeout:20000});
 await page.waitForFunction(()=>Boolean(document.querySelector(
  ".homeScreen [data-home-h4-begin]:not([disabled])")),null,{timeout:40000});
 const choices=await page.evaluate(()=>{
  const entry=globalThis.AO_R17_BROWSER_ENTRY;
  return {language:entry.selectTodayOption("readerLanguage","en"),
   mode:entry.selectTodayOption("readerMode","LIVE"),
   form:entry.selectTodayOption("form","MISSA_CANTATA_INCENSE"),
   aspersion:entry.status()?.fullMassPreflight?.aspersionDecisionRequired};
 });
 assert.ok(choices.language&&choices.mode&&choices.form,
  "Production source-owned Mass-preflight selections were refused");
 if(choices.aspersion===true)
  assert.equal(await page.evaluate(()=>globalThis.AO_R17_BROWSER_ENTRY.selectTodayOption("aspersion","no")),true);
 await page.locator(".homeScreen [data-home-h4-begin]").click();
 const selector="#ao-r17-native-reader-preview";
 await page.locator(selector).waitFor({state:"visible",timeout:90000});
 await page.waitForFunction(()=>Boolean(
  globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected&&
  globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass),null,{timeout:45000});
 const actual=await page.evaluate(()=>{
  const m=globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass;
  const p=globalThis.AO_R17_NATIVE_READER_PREVIEW;
  return {date:m?.date,source:m?.proper?.data?.sourcePath??null,
   sourceGloria:m?.proper?.data?.hasGloria??null,
   gloria:m?.provenance?.gloria??null,credo:m?.provenance?.credo??null,
   ruling:m?.provenance?.gloriaSourceReconciliation??null,
   sourceCards:p?.model?.cards?.filter(c=>c.sourceSectionId==="AO.CARD.003").length??0,
   total:p?.model?.totalCards??null};
 });
 console.log("NOV11_REAL_READER_SOURCE "+JSON.stringify(actual));
 assert.deepEqual([actual.date,actual.source,actual.sourceGloria,actual.gloria,actual.credo],
  ["2026-11-11","Sancti/11-11",true,true,false],
  "The real 1962 St Martin reader still suppresses Gloria");
 assert.equal(actual.ruling?.clause,"BR_237_C_AND_RGMR_431_A");
 assert.equal(actual.sourceCards,3);
 assert.ok(actual.total>=65);

 const jump=page.locator(selector+' [data-role="section-jump"]');
 await jump.click();
 const all=page.locator(selector+' [data-reader-section-all] [data-reader-section]');
 const gloria=all.filter({hasText:/Gloria/i}).first();
 await gloria.waitFor({state:"visible",timeout:20000});
 await gloria.click();
 assert.match((await page.evaluate(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.title))??"",/Gloria/);

 // The same explicit Mass VIII action that failed on public 11 Nov must not
 // hide Gloria or silently rewrite an actual day's selected Proper.
 await jump.click();
 const kyrie=all.filter({hasText:/Kyrie/i}).first();
 await kyrie.waitFor({state:"visible",timeout:20000});
 await kyrie.click();
 const chooser=page.locator(selector+' [data-ordinary-reference-chooser="KYRIE"] select');
 await chooser.waitFor({state:"visible",timeout:20000});
 await chooser.selectOption("MASS_08");
 const suite=page.locator(selector+' [data-ordinary-mass-suite="MASS_08"]');
 await suite.waitFor({state:"visible",timeout:20000});
 await suite.click();
 await jump.click();
 await gloria.waitFor({state:"visible",timeout:20000});
 await gloria.click();
 const gloryChooser=page.locator(selector+' [data-ordinary-reference-chooser="GLORIA"] select');
 await gloryChooser.waitFor({state:"visible",timeout:20000});
 assert.equal(await gloryChooser.inputValue(),"MASS_08");
 assert.deepEqual(errors,[],"JavaScript errors");
 console.log("PASS source-exact 1962 St Martin Gloria: real date selection, host entry, 65-card reader, catch-up and Mass VIII suite at 390px");
 await page.close();
}finally{
 await browser?.close();
 server.close();
}
