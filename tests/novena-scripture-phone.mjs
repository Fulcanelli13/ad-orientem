import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {NOVENA_SCRIPTURE_CONTEXT_V1} from "../src/pray/novena-scripture-context.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css",".svg":"image/svg+xml",".webp":"image/webp",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message??e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:844},
   hasTouch:true,isMobile:true,deviceScaleFactor:1,serviceWorkers:"block",reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(String(e.message||e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   await page.evaluate(async()=>globalThis.AO_MODULES?.open?.("pray.novenas",{returnContext:null}));
   await page.waitForFunction(()=>typeof globalThis.AO_NOVENAS_V3?.open==="function",null,{timeout:20000});
   const targets=width===390?NOVENA_CORPUS_V4_IDS:
     ["corpus_christi","assumption","immaculate_conception","st_michael"];
   for(const id of targets){
    assert.equal(await page.evaluate(id=>globalThis.AO_NOVENAS_V3.open({novenaId:id,returnContext:null}),id),
      true,"The existing historical novena must open: "+id);
    const panel=page.locator('#aoPray435930.open [data-n1-scripture-context="'+id+'"]');
    await panel.waitFor({state:"attached",timeout:9000});
    assert.equal(await panel.locator("[data-ao-scripture-context]").getAttribute("data-ao-scripture-context"),
      NOVENA_SCRIPTURE_CONTEXT_V1[id].reference,id+" uses a different source reference");
    assert.equal(await page.locator("#aoPray435930.open .aoN1SourceDetails").count(),1,
      "Original novena source and edition details were displaced: "+id);
    assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state().screen),"detail");
    const overflow=await panel.evaluate(el=>document.documentElement.scrollWidth-innerWidth);
    assert.ok(overflow<=2,id+" Bible link overflows "+width+"px by "+overflow);
   }
   assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.open({
     novenaId:"corpus_christi",returnContext:null})),true);
   const panel=page.locator('#aoPray435930.open [data-n1-scripture-context="corpus_christi"]');
   await page.locator("#aoPray435930.open .aoN1AboutDisclosure > summary").tap();
   await panel.locator("summary").tap();
   const trigger=panel.locator("[data-ao-scripture-context]");
   await trigger.tap();
   const reader=page.locator("#ao-scripture-overlay");
   await reader.waitFor({state:"visible",timeout:9000});
   assert.equal(await reader.locator(".aoScriptureReading h3").innerText(),"John 6:48–58");
   await reader.locator(".aoScriptureVerse").first().waitFor({state:"visible",timeout:14000});
   assert.equal(await reader.locator('[data-scripture-witness-unreviewed="dr-challoner"]').count(),1,
     "Canonical Bible witness must disclose uncollated edition state");
   await reader.locator('[data-scripture-context-depth="chapter"]').tap();
   assert.ok(await reader.locator(".aoScriptureVerse").count()>60,
     "The shared reader must expose the real chapter, not copied novena prayer text");
   await reader.locator("[data-scripture-close]").tap();
   assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state().id),"corpus_christi",
     "Bible return lost the current novena");
   assert.equal(await page.evaluate(()=>globalThis.AO_NOVENAS_V3.state().screen),"detail",
     "Bible return entered the daily prayer without user selection");
   assert.equal(await trigger.evaluate(el=>document.activeElement===el),true,
     "Return must focus the invoking novena Scripture button");
   assert.deepEqual(errors.filter(x=>/ReferenceError|SyntaxError|TypeError/.test(x)),[],
     "Uncaught Scripture/novena errors "+width);
   console.log("PASS "+width+"px Novena Scripture contexts ("+targets.length+") and John passage → full chapter → same novena");
  }finally{await page.close();}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
