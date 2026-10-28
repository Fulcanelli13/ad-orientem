import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/rosary-chaplets-discovery");
await mkdir(out,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:40000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:20000});
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   const rootSel="#aoPray435930.open";
   const door=page.locator(rootSel+' [data-p435930-family="chaplets"]');
   assert.equal(await door.count(),1);
   assert.equal(await page.locator(rootSel+' [data-p435930-own="pray.divine_mercy"]').count(),1,"Divine Mercy direct shortcut remains");
   await door.click();
   const family=page.locator(rootSel+" .aoP435930FamilyDoor"); // not required in family detail
   const all=await page.locator(rootSel+" .aoP435930ModuleGrid [data-p435930-own]").evaluateAll(xs=>xs.map(x=>x.dataset.p435930Own));
   assert.deepEqual(all,["pray.rosary","pray.rosary_methods","pray.divine_mercy","pray.five_wounds"]);
   assert.equal(await page.locator(rootSel+" #aoP435930Title").innerText(),"Rosary & Chaplets");
   assert.equal(await page.locator(rootSel+" .aoP435930HomeIntro h2").count(),0,"Do not duplicate family title below app header");
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"No horizontal clipping");
   await page.screenshot({path:resolve(out,"rosary-chaplets-family-"+width+".png"),animations:"disabled"});
   // The new Five Wounds uses one reader, existing prayers, and no duplicate top-level module.
   await page.locator(rootSel+' [data-p435930-own="pray.five_wounds"]').click();
   assert.equal(await page.locator(rootSel+' [data-ao-five-wounds-reader]').count(),1);
   assert.equal(await page.locator(rootSel+' [data-ao-five-wounds-reader] [role="progressbar"]').getAttribute("aria-valuenow"),"1");
   assert.match(await page.locator(rootSel+' .aoFiveWoundsPrayerText').innerText(),/Glory be to the Father/);
   await page.locator(rootSel+' [data-p435930-five-next]').click();
   assert.equal(await page.locator(rootSel+' .aoFiveWoundsProgress').getAttribute("aria-valuenow"),"2");
   await page.locator(rootSel+' [data-p435930-five-wound="4"]').click();
   assert.equal(await page.locator(rootSel+' .aoFiveWoundsProgress').getAttribute("aria-valuenow"),"25");
   await page.locator(rootSel+' [data-p435930-five-latin]').click();
   assert.match(await page.locator(rootSel+' .aoFiveWoundsPrayerText').innerText(),/Gloria Patri/);
   await page.screenshot({path:resolve(out,"five-wounds-guided-"+width+".png"),animations:"disabled"});
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),"Five Wounds reader must not clip horizontally");
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.hub",{returnContext:null}));
   await page.locator(rootSel+' [data-p435930-family="chaplets"]').click();
   // Enter the existing Divine Mercy owner from its new discovery family.
   await page.locator(rootSel+' [data-p435930-own="pray.divine_mercy"]').click();
   assert.equal(await page.locator(rootSel+" .aoMercyReader [data-ao-mercy-bead-navigation]").count(),1);
   await page.screenshot({path:resolve(out,"chaplet-from-family-"+width+".png"),animations:"disabled"});
   assert.deepEqual(errors,[],errors.join("; "));
   console.log("PASS "+width+"px Rosary & Chaplets discovery: original Rosary and methods routes unchanged, Five Wounds opened source-owning reader, canonical Mercy preserved");
  }finally{await page.close()}
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
