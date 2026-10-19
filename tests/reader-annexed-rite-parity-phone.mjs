import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {parseReaderProgress} from "../src/mass/reader-dom.js";

assert.deepEqual(parseReaderProgress("3 / 9 · Palm Sunday"),{current:3,total:9,percent:100/3});
assert.deepEqual(parseReaderProgress("34 / 67"),{current:34,total:67,percent:34/67*100});
assert.equal(parseReaderProgress("Unknown"),null);
assert.equal(parseReaderProgress("0 / 3"),null);
assert.equal(parseReaderProgress("4 / 3"),null);
assert.equal(parseReaderProgress("3 / 0"),null);

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".woff2":"font/woff2",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+pathname);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(4377,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:2});
 for(const rite of ["asperges","palm","ash","candlemas"]){
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message??e)));
  await page.goto("http://127.0.0.1:4377/tests/fixtures/reader-phone-harness.html?"+
    new URLSearchParams({mode:"LIVE",lang:"fr",rite}),{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>
    ["true","error"].includes(document.documentElement.dataset.harnessReady),null,{timeout:90000});
  assert.equal(await page.evaluate(()=>document.documentElement.dataset.harnessReady),"true",
    rite+": "+await page.evaluate(()=>globalThis.__AO_PHONE_HARNESS_ERROR??""));
  const state=()=>page.evaluate(()=>{
    const reader=window.__AO_PHONE_PREVIEW;
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const bar=document.querySelector('[data-role="reader-progressbar"]');
    return {
      event:root?.dataset.r17NativeEvent,
      source:reader.getNativeEventState()?.cardId??null,
      card:reader.getCurrentCard()?.id??null,
      mode:reader.getPresentationMode(),
      progress:document.querySelector('[data-role="progress"]')?.textContent??"",
      barHidden:bar?.hidden,
      ariaNow:bar?.getAttribute("aria-valuenow"),
      ariaMax:bar?.getAttribute("aria-valuemax"),
      percent:parseFloat(bar?.firstElementChild?.style.width||"0"),
      specialRefresh:root?.dataset.r17SpecialModeRefreshed??null,
    };
  });
  const initial=await state();
  assert.ok(initial.source,rite+" must begin with source-owned prelude");
  assert.equal(initial.mode,"LIVE");
  assert.equal(initial.barHidden,false,rite+" missing shared progress bar");
  const progress=parseReaderProgress(initial.progress);
  assert.ok(progress,rite+" missing bounded stage progress");
  assert.equal(initial.ariaNow,String(progress.current));
  assert.equal(initial.ariaMax,String(progress.total));
  assert.ok(Math.abs(initial.percent-progress.percent)<.1);
  for(const mode of ["MISSAL","SIMPLE","LIVE"]){
    await page.locator("[data-reader-preferences]").click();
    await page.waitForFunction(()=>
      document.querySelector('[data-role="mass-preferences"]')?.dataset?.open==="true");
    const button=page.locator('[data-reader-mode="'+mode+'"]');
    assert.equal(await button.isDisabled(),false,rite+" should allow "+mode);
    await button.click();
    await page.locator("[data-reader-preferences-close]").click();
    const after=await state();
    assert.equal(after.mode,mode);
    assert.equal(after.event,initial.event,rite+" changed rite");
    assert.equal(after.source,initial.source,rite+" advanced ceremonial source");
    assert.equal(after.card,initial.card,rite+" changed projected card");
    assert.equal(after.progress,initial.progress,rite+" changed index");
    assert.equal(after.specialRefresh,mode,rite+" mode change did not rebuild special-rite surface");
    assert.equal(after.barHidden,false,rite+" lost progress bar in "+mode);
    assert.equal(after.ariaNow,initial.ariaNow);
    assert.equal(after.ariaMax,initial.ariaMax);
    assert.ok(Math.abs(after.percent-initial.percent)<.1);
    assert.equal(await page.locator('[data-ao-reader-shell]').getAttribute("data-mode"),mode);
    assert.ok(await page.locator(".ao-reader-paragraph").count()>0,
      rite+" displayed no source-owned paragraph in "+mode);
  }
  const dir=resolve(root,"artifacts/annexed-reader-parity");
  await mkdir(dir,{recursive:true});
  await page.locator('[data-ao-reader-shell]').screenshot({path:resolve(dir,rite+"-390px.png"),animations:"disabled"});
  assert.deepEqual(errors,[],rite+" phone emitted errors");
  await page.close();
 }
 await context.close();
 console.log("PASS shared annexed reader: Asperges, Palm, Ash, Candlemas preserve exact source and progress across MISSAL/SIMPLE/LIVE at 390px.");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
