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
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
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
  assert.deepEqual(data.modes,["MISSAL","SIMPLE","LIVE"]);
  assert.equal(data.readerPresent,false,"Follow Mass started LIVE without preparation");
  assert.ok(data.startButtons>0,"No explicit Start Mass control");
  console.log("PASS real phone "+width+"px Follow Mass opens Mass preparation, not LIVE",JSON.stringify(data));
  if(errors.length)console.log("Other page warnings",errors.slice(0,3));
  await page.close();
 }
}finally{await browser?.close();await new Promise(resolve=>server.close(resolve))}
