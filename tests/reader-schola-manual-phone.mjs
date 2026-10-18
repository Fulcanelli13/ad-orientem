import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/curated65-phone");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png"};
const server=http.createServer(async(req,res)=>{
 try{
  const name=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const path=resolve(root,"."+name);
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message??e));}
});
await new Promise((resolve,reject)=>{server.once("error",reject);server.listen(4297,"127.0.0.1",resolve);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const ctx=await browser.newContext({viewport:{width,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  try{
   const page=await ctx.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e.message??e)));
   await page.goto("http://127.0.0.1:4297/tests/fixtures/reader-phone-harness.html?production=1&aoLiveCards=65",
     {waitUntil:"networkidle",timeout:55000});
   await page.waitForFunction(()=>document.documentElement.dataset.harnessReady==="true",{},{timeout:25000});
   const chosen=await page.evaluate(()=>{
     const api=window.__AO_PHONE_PREVIEW;
     const c=api.model.cards.find(card=>card.paragraphs.some(p=>
       (p.sourceCueIds??[]).includes("AO.SM.C0055")));
     if(!c)return {error:"GLORIA_SOURCE_CARD_MISSING"};
     api.showSequence(c.sequence);
     return {card:c.title,sequence:c.sequence};
   });
   assert.equal(chosen.error,undefined,JSON.stringify(chosen));
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.trackId==="GLORIA");
   const dock=page.locator(".ao-schola-dock");
   await dock.waitFor({state:"visible"});
   const prev=page.locator("[data-schola-previous]");
   const next=page.locator("[data-schola-next]");
   assert.equal(await prev.count(),1);
   assert.equal(await next.count(),1);
   assert.equal(await prev.isDisabled(),true,"Previous must not wrap before the first phrase");
   assert.equal(await next.isEnabled(),true,"Next phrase correction unavailable");
   const before=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
     state:window.__AO_PHONE_PREVIEW.getScholaState()
   }));
   await next.click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.index===1);
   await page.waitForFunction(()=>document.querySelector("[data-schola-previous]")?.disabled===false);
   const advanced=await page.evaluate(()=>({
     card:window.__AO_PHONE_PREVIEW.getCurrentCard().sectionId,
     cue:window.__AO_PHONE_PREVIEW.getActiveCue(),
     segment:window.__AO_PHONE_PREVIEW.getScholaState()?.schola?.segmentId,
     number:document.querySelector('[data-role="schola-page"]')?.textContent
   }));
   assert.equal(advanced.card,before.card,"Schola step moved LIVE prayer card");
   assert.equal(advanced.cue,before.cue,"Schola step moved priest/faithful focus");
   assert.equal(advanced.number.trim().startsWith("2 /"),true,"Schola counter did not follow manual correction");
   await prev.click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.index===0);
   assert.equal(await prev.isDisabled(),true);
   await page.locator("[data-schola-pause]").click();
   assert.equal(await page.locator("[data-schola-pause]").getAttribute("aria-pressed"),"true");
   await next.click();
   await page.waitForFunction(()=>window.__AO_PHONE_PREVIEW.getScholaState()?.index===1);
   assert.equal(await page.locator("[data-schola-pause]").getAttribute("aria-pressed"),"true",
     "Manual Schola correction should not override user's pause");
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   assert.equal(overflow,false,"Schola controls overflow narrow phone");
   assert.deepEqual(errors,[],"Runtime page errors");
   await page.screenshot({path:resolve(out,"live-schola-correction-"+width+".png"),animations:"disabled"});
  }finally{await ctx.close();}
 }
 console.log("PASS LIVE 65 Schola: independent tap next/previous, 320/390 phone layout, manual pause ownership, no Mass focus movement");
}finally{
 await browser?.close();
 await new Promise(resolve=>server.close(resolve));
}
