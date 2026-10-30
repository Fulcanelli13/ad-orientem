// Production DOM acceptance: default Mass page, real R17 checkpoint, no implicit Resume.
// No fabricated source/Proper or session fixture; uses the same Start Mass click as users.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css",
 ".png":"image/png",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const url="http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native";
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const context=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const page=await context.newPage(); const errors=[];
  page.on("pageerror",err=>errors.push(String(err.message)));
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.installed &&
    globalThis.AO_R17_BROWSER_ENTRY?.installed,{timeout:45000});
  assert.equal(await page.evaluate(()=>globalThis.AO_R17_BROWSER_ENTRY.hasResumable()),false,
    "Fresh profile must start without an R17 checkpoint");
  const missing=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.go("mass",{resume:true}));
  assert.equal(missing.reason,"NO_RESUMABLE_MASS","Explicit Resume must fail closed with no checkpoint");
  await page.locator('#ao-global-ribbon [data-ao-app-surface="mass"]').click();
  await page.waitForSelector('html[data-ao-m1-mass-root="true"] [data-m1-rows]',{state:"visible",timeout:25000});
  assert.equal(await page.locator("[data-ao-start-live]").count(),1,"Only original Start Mass");
  assert.equal(await page.locator("[data-ao-full-mass-preflight]").count(),1,"One source-owned preflight");
  const sourceBefore=await page.evaluate(()=>globalThis.AO_CELEBRATION_API?.getResolvedMass?.()?.proper?.data?.sourcePath??null);
  await page.locator("[data-ao-start-live]").click();
  await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected ||
    document.querySelector("[data-ao-start-live]")?.dataset?.aoR17Error==="true",
    null,{timeout:45000});
  let started=await page.evaluate(()=>({
    ok:Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
    error:document.querySelector("[data-ao-start-live]")?.title,
    engine:document.documentElement.dataset.aoMassEngine,
    checkpoint:JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"null")
  }));
  assert.equal(started.ok,true,"The original Start must open R17: "+JSON.stringify(started).slice(0,1300));
  assert.equal(started.checkpoint?.state,"active");
  assert.ok(started.checkpoint?.session?.resolvedMass,"Real checkpoint must retain a resolved Mass");
  const selected=await page.evaluate(async()=>{
    const api=globalThis.AO_R17_NATIVE_READER_PREVIEW;
    const cards=api.model?.cards??[];
    const target=cards.find((c,i)=>i>2&&c?.sectionId)??cards[0];
    if(!target?.sectionId)throw Error("No R17 curated section to checkpoint");
    api.showSection(target.sectionId);
    const {checkpointPersistedMass}=await import("/src/mass/browser-entry.js");
    checkpointPersistedMass({preview:api});
    return {sectionId:api.getCurrentCard()?.sectionId,
      stored:JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"null")?.readerPosition?.sectionId};
  });
  assert.equal(selected.sectionId,selected.stored,"Checkpoint must save the actual reader position");
  assert.ok(selected.sectionId,"Nonempty canonical section required");
  assert.equal(await page.evaluate(()=>globalThis.AO_R17_BROWSER_ENTRY.suspend()),true,"Suspend must preserve checkpoint");
  let previous=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"null"));
  assert.equal(previous.state,"suspended");
  assert.equal(previous.readerPosition?.sectionId,selected.sectionId);
  await page.reload({waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>globalThis.AO_R17_BROWSER_ENTRY?.installed&&globalThis.AO_APP_SHELL_V1?.installed,
    null,{timeout:45000});
  assert.equal(await page.evaluate(()=>globalThis.AO_R17_BROWSER_ENTRY.hasResumable()),true);
  const fresh=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.go("mass"));
  assert.equal(fresh.ok,true,"Fresh tab navigation must be permitted with a checkpoint");
  assert.equal(fresh.resumedMass,undefined,"Ordinary Mass tab may not silently Resume");
  await page.waitForSelector('html[data-ao-m1-mass-root="true"] [data-m1-rows]',{state:"visible",timeout:20000});
  assert.equal(await page.evaluate(()=>Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected)),false,
    "Fresh entry with checkpoint must show the source preflight, never the LIVE reader");
  let unchanged=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-r17-active-mass-v1")||"null"));
  assert.equal(unchanged.readerPosition?.sectionId,selected.sectionId,
    "Ordinary Mass entry must not overwrite existing checkpoint");
  const result=await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.go("mass",{resume:true}));
  assert.equal(result.ok,true,"Explicit Resume must restore a saved reader: "+JSON.stringify(result));
  assert.equal(result.resumedMass,true);
  await page.waitForFunction(()=>globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected,null,{timeout:30000});
  const restored=await page.evaluate(()=>({
    sectionId:globalThis.AO_R17_NATIVE_READER_PREVIEW?.getCurrentCard?.()?.sectionId,
    resumed:globalThis.AO_R17_MASS_RUNTIME?.resumed,
    rootPage:document.documentElement.dataset.aoM1MassRoot==="true",
    source:globalThis.AO_R17_ACTIVE_MASS?.session?.resolvedMass?.proper?.data?.sourcePath??null
  }));
  assert.equal(restored.sectionId,selected.sectionId,"Resume must restore the saved curated card");
  assert.equal(restored.resumed,true,"R17 runtime must mark an explicit resume");
  assert.equal(restored.rootPage,false,"The preflight page must yield ownership to R17 on Resume");
  assert.deepEqual(errors,[],"Browser page errors: "+JSON.stringify(errors.slice(0,4)));
  console.log("PASS M1 default fresh/Resume "+width+"px",JSON.stringify({sourceBefore,selected,restored}));
  await context.close();
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
