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
 const editionChooser=page.locator(".aoPrivateLitanyEditionChooser");
 if(await editionChooser.count() && !(await editionChooser.evaluate(el=>el.open)))
  await editionChooser.locator(":scope > summary").tap();
 await page.locator("#aoPray435930.open [data-p435930-lit-use='major']:visible").first().tap();
 await page.locator("[data-ao-litany-use='major'][data-ao-rogations-source='R25_LATIN_UNCOLLATED']").waitFor({state:"attached",timeout:15000});
 assert.equal(await page.locator("[data-ao-litany-use='major']").count(),1);
 assert.equal(await page.locator("[data-ao-icrsp-major-sequence] li").count(),5);
 assert.equal(await page.locator("[data-ao-litany-use='major'] a[href*='a0087_nouveau']").count(),1);
 assert.equal(await page.locator("[data-ao-litany-use='major'] [data-ao-rogations-source-hold='UNCOLLATED_ORIGINAL_PRINT']").count(),1,
  "Shared Latin R25 text must visibly retain its uncollated original-edition warning");
 await page.waitForFunction(()=>document.querySelectorAll('#aoPray435930.open [data-ao-litany-use="major"] [data-ao-rogations-latin-row]').length===4,null,{timeout:15000});
 assert.equal(await page.locator("[data-ao-litany-use='major'] [data-ao-rogations-latin-row]").count(),4,
  "Public Rogations must begin with original Latin Exsurge, not a link-only placeholder");
 const activePicker=page.locator("#aoPray435930.open [data-ao-litany-use='major'] .aoPrivateLitanyEditionChooser");
 if(await activePicker.count() && !await activePicker.evaluate(x=>x.open))
  await activePicker.locator(":scope > summary").tap();
 await page.locator("#aoPray435930.open [data-p435930-lit-use='vigil']:visible").first().tap();
 // The loading shell briefly exposes an inline edition chooser; after R33
 // validates, the source-backed guided reader owns a collapsed disclosure.
 // Wait for that final reader before switching back to the private edition.
 await page.locator("#aoPray435930.open [data-ao-litany-use='vigil'][data-ao-easter-vigil-litanies='R33_TWO_PARTS_NOT_PRINT_CERTIFIED']")
  .waitFor({state:"attached",timeout:15000});
 assert.equal(await page.locator("[data-ao-litany-use='vigil']").count(),1);
 const vigilPicker=page.locator("#aoPray435930.open [data-ao-litany-use='vigil'] .aoPrivateLitanyEditionChooser");
 assert.equal(await vigilPicker.count(),1,"Loaded Vigil edition selector must remain available");
 if(!await vigilPicker.evaluate(x=>x.open))
  await vigilPicker.locator(":scope > summary").tap();
 await page.locator("#aoPray435930.open [data-p435930-lit-use='private']:visible").first().tap();
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
 await page.locator("[data-ao-stations-direct-reading] [data-p435930-station-reading='simple']").tap();
 assert.equal(await page.locator(".aoP435930VR").count(),0,"Simple Stations must not impose a vocal response");
 const opt=page.locator("[data-ao-stations-options] > summary");
 if(!await options.evaluate(el=>el.open))await opt.tap();
 await page.locator("label.aoBatch03SimpleVersicles").tap();
 assert.equal(await page.locator("[data-p435930-station-simple-responses]").isChecked(),true);
 assert.equal(await page.locator(".aoP435930VR").count(),1,"Explicit versicle request must display traditional prayer");
 if(!await options.evaluate(el=>el.open))await opt.tap();
 await page.locator("[data-ao-stations-direct-reading] [data-p435930-station-reading='guided']").tap();
 assert.equal(await page.locator(".aoP435930VR").count(),1);
 assert.equal(await page.locator("[data-p435930-station-step]").count(),14);

 await open("pray.confession");
 assert.equal(await page.locator("[data-p435930-conf-path]").count(),3);
 assert.equal(await page.locator("[data-ao-confession-section='0']").count(),1);
 assert.equal(await page.locator("[data-p435930-since]").count(),0,"Confession must not collect a time-since-last-Confession text entry");
 assert.equal(await page.locator(".aoP435930ConfProgressLabel").count(),1,"Confession must show the current-stage eyebrow");
 await page.locator(".aoP435930ConfSources > summary").tap();
 assert.ok(await page.locator(".aoP435930ConfSources a[href*='wikisource.org']").count()>=1);
 assert.equal(await page.locator("[data-ao-confession-section='0'] input[type='checkbox']").count(),0,
  "Do not turn Confession into a checklist of sins");

 const out=await page.evaluate(async()=>globalThis.AO_MODULES.open("pray.communion_treasury",{returnContext:null}));
 assert.notEqual(out?.ok,false);
 await page.locator("[data-ao-communion-purpose-picker='before']").waitFor();
 assert.equal(await page.locator("[data-tp381-communion-purpose]").count(),3);
 assert.equal(await page.locator("[data-tp381-communion-source='sacrament_come_holy_spirit']").count(),1);
 await page.locator("[data-tp381-communion-purpose='approach']").evaluate(el=>el.click());
 assert.match(await page.locator("[data-ao-devo-card]").first().getAttribute("data-ao-devo-card"),/beforeThomas/);
 await page.locator("[data-tp381-communion-source='beforeAmbrose']").evaluate(el=>el.click());
 assert.match(await page.locator("[data-ao-devo-card]").first().getAttribute("data-ao-devo-card"),/beforeAmbrose/);
 await page.locator("[data-tp381-communion='after']").evaluate(el=>el.click());
 assert.equal(await page.locator("[data-tp381-communion-purpose]").count(),4,
  "Three established purpose groups and one distinct historical intercession group");
 assert.equal(await page.locator("[data-tp381-communion-purpose='intercession']").count(),1,
  "Historical intercessions must be separately identified, not mixed into Thanksgiving");
 await page.locator("[data-tp381-communion-source='afterBonaventure']").evaluate(el=>el.click());
 assert.match(await page.locator("[data-ao-devo-card]").first().getAttribute("data-ao-devo-card"),/afterBonaventure/);
 assert.deepEqual(errors,[],"Prayer module browser exceptions");
 console.log("PASS Batch 3 mobile: Litany use separation, seven Psalms, Simple/Guided Stations, Confession privacy, 11 direct Communion prayer choices");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
