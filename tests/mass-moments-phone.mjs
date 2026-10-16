import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const dir=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try {
  const file=resolve(dir,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==dir&&!file.startsWith(dir+sep)){res.writeHead(403);res.end("forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 } catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
let browser;
try {
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,430]){
  const page=await browser.newPage({viewport:{width,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(String(e.message||e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.status?.()?.visibleOwner===true,null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("learn"))).ok,true);
   assert.equal(await page.evaluate(()=>globalThis.AO_LEARN_APP_V1.openModule("learn.mass")),true);
   const root=page.locator("#ao-mass-formation-root");
   await root.waitFor({state:"visible",timeout:15000});
   await root.locator("[data-ao-mf-open-moments]").tap();
   await root.locator("[data-ao-mf-moment]").first().waitFor({state:"visible",timeout:15000});
   assert.equal(await root.locator("[data-ao-mf-moment]").count(),32);
   await root.locator('[data-ao-mf-moment="AO.CARD.017"]').tap();
   await root.locator('[data-ao-mf-moment-detail="AO.CARD.017"]').waitFor();
   assert.equal(await root.locator(".aoMFMomentRead").count(),3);
   assert.equal(await root.locator("[data-ao-mass-formation-anchor]").count(),4);
   assert.equal(await root.locator('[data-ao-mf-related-stage="MF04"]').count(),1);
   assert.equal(await root.locator(".aoReferencePanel").count(),0,"Moment view must not invent source claim attributions");
   const anchor=root.locator('[data-ao-mass-formation-anchor="MFS11"]');
   await anchor.tap();
   const bible=page.locator("#ao-scripture-overlay");
   await bible.waitFor({state:"visible",timeout:12000});
   assert.match(await bible.locator(".aoScriptureContextTitle").innerText(),/Genesis 14:18/);
   await bible.locator('[data-scripture-close]').tap();
   await root.locator('[data-ao-mf-moment-detail="AO.CARD.017"]').waitFor();
   await root.locator('[data-ao-mf-related-stage="MF04"]').tap();
   await root.locator(".aoMFClaim").first().waitFor();
   assert.equal(await root.locator(".aoMFClaim").count(),3);
   assert.equal(await root.locator(".aoReferencePanel").count(),1,"Retain original claim-sourced drawer");
   const status=await page.evaluate(()=>globalThis.AO_MASS_FORMATION_V1?.status?.());
   assert.equal(status.stageId,"MF04");
   await root.locator("[data-ao-mf-back]").tap();
   await root.locator('[data-ao-mf-moment-detail="AO.CARD.017"]').waitFor();
   assert.equal(await root.locator('[data-ao-mf-moment-detail="AO.CARD.017"]').count(),1,
     "Study Back must restore the actually visited Mass moment, not invent a list");
   await root.locator("[data-ao-mf-moments-list]").tap();
   await root.locator('[data-ao-mf-moment="AO.CARD.030"]').tap();
   assert.equal(await root.locator('[data-ao-mf-moment-detail="AO.CARD.030"]').count(),1);
   assert.equal(await root.locator('[data-ao-mass-formation-anchor="MFS16"]').count(),1);
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
   assert.ok(overflow<=2,"Phone horizontal overflow "+overflow+" at "+width);
   assert.deepEqual(errors.filter(e=>/TypeError|SyntaxError|ReferenceError/.test(e)),[]);
   console.log("PASS "+width+"px Mass moments → Canon → Scripture → Study → Last Gospel; existing reader untouched");
  }finally{await page.close();}
 }
} finally {await browser?.close();await new Promise(done=>server.close(done));}
