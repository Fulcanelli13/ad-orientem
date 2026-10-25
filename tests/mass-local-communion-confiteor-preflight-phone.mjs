import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp",
 ".png":"image/png",".jpg":"image/jpeg"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("forbidden");return}
  const body=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:"en-GB"});
 try{
  const page=await context.newPage();
  const errors=[];page.on("pageerror",error=>errors.push(String(error.message)));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoR17Reader=native",
   {waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>Boolean(globalThis.AO_CELEBRATION_API?.openPreflight && globalThis.AO_APP_SHELL_V1?.installed),null,{timeout:35000});
  const entry=page.locator(".homeScreen [data-home-mass-entry]");
  await entry.waitFor({state:"visible",timeout:25000});await entry.click();
  const folio=page.locator("[data-ao-full-mass-preflight]");
  await folio.waitFor({state:"visible",timeout:15000});
  await folio.locator('[data-folio-goto="reader"]').first().click();
  const choice=folio.locator("[data-folio-communion-confiteor]");
  await choice.waitFor({state:"visible",timeout:12000});
  assert.equal(await choice.isChecked(),false,"1962 ordinary default must not add a second Confiteor");
  await choice.check();
  assert.equal(await choice.isChecked(),true,"Local Confiteor preflight checkbox reverted");
  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem("ao-mass-customary-v1")??"{}"));
  assert.equal(saved.secondConfiteor,true,"Local Communion custom was not persisted before Mass");
  await folio.locator('[data-full-mass-reader-mode][value="LIVE"]').check();
  const start=page.locator("#ao-mass-flow-v1 [data-ao-start-live]").first();
  await start.click();
  await page.waitForSelector("#ao-r17-native-reader-preview",{state:"attached",timeout:40000});
  await page.waitForFunction(()=>Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.model?.cards?.length),null,{timeout:30000});
  const model=await page.evaluate(()=>{
   const a=globalThis.AO_R17_NATIVE_READER_PREVIEW;
   const cards=a.model.cards;
   const conf=cards.find(c=>c.title==="Second Confiteor · Optional Local Custom");
   const ecce=cards.find(c=>c.title==="Ecce Agnus Dei · Preparation of the Faithful");
   const placeat=cards.find(c=>c.title==="Priest silently prays · Placeat tibi");
   const blessing=cards.find(c=>c.title==="Final Blessing");
   const source=conf?.paragraphs.map(p=>p.sourceCueIds??[]).flat()??[];
   const opened=conf ? a.showSequence(conf.sequence) : null;
   const visible=globalThis.document.querySelector("#ao-r17-native-reader-preview .ao-prayer-body")?.textContent??"";
   return {conf:conf?.sequence,ecce:ecce?.sequence,placeat:placeat?.sequence,blessing:blessing?.sequence,
     source,visible,chosen:opened?.title??a.getCurrentCard()?.title,progress:a.getCurrentCard()?.sequence};
  });
  assert.equal(model.ecce,model.conf+1,"Confiteor no longer precedes Ecce Agnus Dei");
  assert.ok(model.source.includes("AO.SM.C0235")&&model.source.includes("AO.SM.C0238")&&model.source.includes("AO.SM.C0240"),"Confiteor/Misereatur/Indulgentiam source chain missing");
  assert.match(model.visible,/I confess to Almighty God/);
  assert.match(model.visible,/May Almighty God have mercy/);
  assert.match(model.visible,/grant us pardon/);
  assert.equal(model.blessing,model.placeat+1,"Silent Placeat must precede final blessing");
  assert.ok(model.placeat>model.ecce);
  assert.deepEqual(errors,[],"Page errors in actual Communion Confiteor preflight-to-reader journey");
  console.log("PASS actual preflight local Confiteor persisted and reader contains Confiteor, Misereatur, Indulgentiam before Ecce; silent Placeat before blessing",JSON.stringify({conf:model.conf,ecce:model.ecce,placeat:model.placeat,blessing:model.blessing}));
 }finally{await context.close()}
}finally{await browser?.close();await new Promise(done=>server.close(done))}
