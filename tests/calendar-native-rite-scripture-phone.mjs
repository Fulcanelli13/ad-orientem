import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".mjs":"text/javascript;charset=utf-8",".json":"application/json",
 ".css":"text/css;charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".woff2":"font/woff2",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const target=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(target!==root&&!target.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(target);
  res.writeHead(200,{"content-type":mime[extname(target)]||"application/octet-stream"});res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 const errors=[];page.on("pageerror",err=>errors.push(err.message));
 await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
  {waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>globalThis.AO_CALENDAR_APP_V1?.select&&
  globalThis.AO_SCRIPTURE_APP_V1?.openContext&&
  globalThis.AO_APP_SHELL_V1?.navigate,null,{timeout:45000});
 for(const [date,expected,count,firstReference] of [
  ["2026-04-03","GOOD_FRIDAY",4,/Hosea 6:1/],
  ["2026-04-04","EASTER_VIGIL",4,/Genesis 1:1/]
 ]){
  const actual=await page.evaluate(async selected=>{
   const nav=await globalThis.AO_APP_SHELL_V1.navigate("calendar");
   const ok=await globalThis.AO_CALENDAR_APP_V1.select(selected);
   const state=globalThis.AO_RUNTIME_V8?.store?.getState?.();
   return {ok,nav,day:state?.resolution?.date,main:state?.resolution?.day?.main?.id,
    proper:state?.resolution?.proper?.sourcePath??state?.resolution?.proper?.data?.sourcePath,
    status:state?.resolution?.proper?.status,
    slots:[...document.querySelectorAll("#ao-calendar-modular-root [data-cal-scripture-slot]")]
     .map(x=>x.dataset.calScriptureSlot)};
  },date);
  console.log("CALENDAR_NATIVE_RITE_SELECTED="+JSON.stringify({date,actual}));
  assert.equal(actual.ok,true,date+" Calendar day failed to select");
  assert.equal(actual.day,date);
  const buttons=page.locator("#ao-calendar-modular-root [data-cal-scripture-slot^='NATIVE_RITE:']");
  assert.equal(await buttons.count(),count,date+" selected rite records missing");
  assert.ok(actual.slots.some(x=>x.startsWith("NATIVE_RITE:")));
  const first=buttons.first();
  assert.match(await first.innerText(),firstReference);
  const scroll=await page.locator("#ao-calendar-modular-root").evaluate(root=>{
   root.scrollTop=Math.min(80,Math.max(0,root.scrollHeight-root.clientHeight));
   return root.scrollTop;
  });
  const slot=await first.getAttribute("data-cal-scripture-slot");
  await first.tap();
  const overlay=page.locator("#ao-scripture-overlay");
  await overlay.waitFor({state:"visible",timeout:16000});
  const ctx=await overlay.locator("[data-ao-scripture-context-reader]").first().getAttribute("data-ao-scripture-context-reader");
  assert.match(ctx,firstReference);
  assert.equal(await page.evaluate(()=>globalThis.AO_SCRIPTURE_APP_V1.status().open),true);
  await overlay.locator("[data-scripture-close]").tap();
  await overlay.waitFor({state:"hidden",timeout:14000});
  // The source owner restores scroll after the pending Calendar paint frame.
  await page.evaluate(()=>new Promise(resolve=>
    requestAnimationFrame(()=>requestAnimationFrame(resolve))));
  const returned=await page.evaluate(()=>({
   date:globalThis.AO_CALENDAR_APP_V1.status().selectedDate,
   slot:document.activeElement?.dataset?.calScriptureSlot,
   scroll:document.querySelector("#ao-calendar-modular-root")?.scrollTop
  }));
  assert.equal(returned.date,date);
  assert.equal(returned.slot,slot,"Return focus must restore the exact native-rite lesson");
  assert.equal(returned.scroll,scroll,"Return should preserve selected Calendar scroll");
  await page.locator("#ao-calendar-modular-root [data-cal-close]").tap();
 }
 assert.deepEqual(errors,[]);
 console.log("PASS mobile Calendar Good Friday and Easter Vigil complete native-rite lessons, Scripture overlay, exact date/slot/scroll return");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
