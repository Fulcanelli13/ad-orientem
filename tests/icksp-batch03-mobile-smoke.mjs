import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+path);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((done,fail)=>{server.once("error",fail);server.listen(4373,"127.0.0.1",done)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
 const errors=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("http://127.0.0.1:4373/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 const open=async id=>{
  assert.equal(await page.evaluate(route=>globalThis.AO_PRAY_V435930.open(route,{returnContext:null}),id),true,"Prayer route "+id);
  await page.locator("#aoPray435930.open").waitFor();
 };
 await open("pray.litany_saints");
 assert.equal(await page.locator("[data-p435930-lit-use]").count(),4);
 await page.locator("[data-p435930-lit-use='major']").tap();
 assert.equal(await page.locator("[data-ao-litany-use='major']").count(),1);
 assert.equal(await page.locator("[data-ao-icrsp-major-sequence] li").count(),5);
 assert.equal(await page.locator("[data-ao-litany-use='major'] a[href*='a0087_nouveau']").count(),1);
 assert.match(await page.locator("[data-ao-litany-use='major']").innerText(),/not yet locally|attend une collation/i);
 await page.locator("[data-p435930-lit-use='vigil']").tap();
 assert.equal(await page.locator("[data-ao-litany-use='vigil']").count(),1);
 await page.locator("[data-p435930-lit-use='private']").tap();
 assert.equal(await page.locator("[data-p435930-lit-use='private'][aria-pressed='true']").count(),1);

 await open("pray.penitential_psalms");
 assert.equal(await page.locator("[data-p435930-pen-scripture]").count(),1);
 await page.locator("[data-ao-penitential-offline] > summary").tap();
 assert.equal(await page.locator("[data-p435930-pen-cache]").count(),1);
 assert.match(await page.locator("[data-ao-penitential-offline]").innerText(),/seven chapters/i);
 assert.equal(await page.locator("[data-p435930-pen-litany]").count(),0,"Litany continuation must remain at final Psalm only");

 await open("pray.stations");
 const options=page.locator("[data-ao-stations-options]");
 await options.locator(":scope > summary").tap();
 await options.locator("[data-p435930-seg='simple']").tap();
 assert.equal(await page.locator(".aoP435930VR").count(),0,"Simple Stations must not impose a vocal response");
 const opt=page.locator("[data-ao-stations-options] > summary");
 if(!await options.evaluate(el=>el.open))await opt.tap();
 await page.locator("label.aoBatch03SimpleVersicles").tap();
 assert.equal(await page.locator("[data-p435930-station-simple-responses]").isChecked(),true);
 assert.equal(await page.locator(".aoP435930VR").count(),1,"Explicit versicle request must display traditional prayer");
 if(!await options.evaluate(el=>el.open))await opt.tap();
 await page.locator("[data-ao-stations-options] [data-p435930-seg='guided']").tap();
 assert.equal(await page.locator(".aoP435930VR").count(),1);
 assert.equal(await page.locator("[data-p435930-station-step]").count(),14);

 await open("pray.confession");
 assert.equal(await page.locator("[data-p435930-conf-path]").count(),3);
 assert.equal(await page.locator("[data-ao-confession-section='0']").count(),1);
 assert.equal(await page.locator("[data-p435930-since]").getAttribute("autocomplete"),"off");
 await page.locator(".aoP435930ConfSources > summary").tap();
 assert.ok(await page.locator(".aoP435930ConfSources a[href*='wikisource.org']").count()>=1);
 assert.equal(await page.locator("[data-ao-confession-section='0'] input[type='checkbox']").count(),0,
  "Do not turn Confession into a checklist of sins");

 const out=await page.evaluate(async()=>globalThis.AO_MODULES.open("pray.communion_treasury",{returnContext:null}));
 assert.notEqual(out?.ok,false);
 await page.locator("[data-ao-communion-direct-picker]").waitFor();
 assert.equal(await page.locator("[data-tp381-communion-pick]").count(),7);
 await page.locator("[data-ao-communion-direct-picker] > summary").tap();
 await page.locator("[data-tp381-communion-pick='5']").tap();
 assert.match(await page.locator("[data-ao-devo-card]").first().getAttribute("data-ao-devo-card"),/beforeThomas/);
 await page.locator("[data-tp381-communion='after']").tap();
 assert.equal(await page.locator("[data-tp381-communion-pick]").count(),4);
 await page.locator("[data-ao-communion-direct-picker] > summary").tap();
 await page.locator("[data-tp381-communion-pick='2']").tap();
 assert.match(await page.locator("[data-ao-devo-card]").first().getAttribute("data-ao-devo-card"),/afterBonaventure/);
 assert.deepEqual(errors,[],"Prayer module browser exceptions");
 console.log("PASS Batch 3 mobile: Litany use separation, seven Psalms, Simple/Guided Stations, Confession privacy, 11 direct Communion prayer choices");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
