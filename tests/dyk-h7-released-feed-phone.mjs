import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {chromium} from "@playwright/test";
import {dykHomeRotationSlot,DYK_GLOSSARY_FALLBACK_IDS} from "../src/home/dyk-published-feed.js";
const root=resolve(".");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".woff2":"font/woff2"};
const master=JSON.parse(await readFile(resolve(root,
 "data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json"),"utf8"));
const fixture=structuredClone(master);
fixture.publication_stage="APPROVED_PARTIAL_LIVE";
const fact=fixture.records.find(x=>x.id==="DYK-UM03-012");
assert.ok(fact);
fact.editorial_approval=true;fact.release_authorized=true;
fact.pilot_home_copy.final_english_signoff=true;
fact.pilot_home_copy.final_french_signoff=true;
fact.priority_lexical_screen.manual_semantic_novelty_approved=true;
fact.pilot_destination_audit.publishable_deep_link=true;
fact.pilot_destination_audit.exact_in_app_route_verified=true;
fact.pilot_source_folio.link_browser_verified=true;
// Choose an actual date on which the test-only R34 approval wins the
// combined previously published and newly curated Customs/Glossary rotation.
// The new 520 IDs legitimately change which fact appears on each civil date.
// Use a R34 ID NOT present in the independently curated public bank: a shared
// ID can be live from that bank without authorizing its separate R34 record.
const historical=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/weiser-historical-20-publication.v1.json"),"utf8"));
const r50=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/weiser-r50-sixteen-publication.v1.json"),"utf8"));
const r50b=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/weiser-r50-second-sixteen-publication.v1.json"),"utf8"));
const h100=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/dyk-h100-pitre-ritus-24-publication.v1.json"),"utf8"));
const h125=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/dyk-h125-multisource-25-publication.v1.json"),"utf8"));
const h150=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/dyk-h150-originals-25-publication.v1.json"),"utf8"));
const h175=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/dyk-h175-multisource-25-publication.v1.json"),"utf8"));
const h200=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/dyk-h200-three-sources-25-publication.v1.json"),"utf8"));
const h225=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/dyk-h225-world-liturgies-25-publication.v1.json"),"utf8"));
const historicalIds=[...historical.records,...r50.records,...r50b.records,...h100.records,...h125.records,...h150.records,...h175.records,...h200.records,...h225.records].map(x=>x.id);
const curated=JSON.parse(await readFile(resolve(root,
 "data/did-you-know/dyk-customs-glossary-520.v1.json"),"utf8"));
assert.equal(curated.count,520,"Test must include the actual new public DYK pool");
const fullPublicIds=[...historicalIds,...curated.records.map(x=>x.id)];
const dayMs=86400000;
const base=Date.UTC(2026,10,1);
const testDate=Array.from({length:2200},(_,i)=>
 new Date(base+i*dayMs).toISOString().slice(0,10))
 .find(date=>dykHomeRotationSlot(date,[...fullPublicIds,fact.id],DYK_GLOSSARY_FALLBACK_IDS)===fact.id);
assert.ok(testDate,"Test-only R34 release must receive one legitimate daily slot");
const h225Date=Array.from({length:2200},(_,i)=>
 new Date(base+i*dayMs).toISOString().slice(0,10))
 .find(date=>dykHomeRotationSlot(date,fullPublicIds,DYK_GLOSSARY_FALLBACK_IDS)==="DYK-H225-R-001");
assert.ok(h225Date,"The first H225 fact must remain reachable in the combined public rotation");
fact.publication_days=[testDate];
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const absolute=resolve(root,"."+path);
  if(absolute!==root&&!absolute.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden")}
  const bytes=await readFile(absolute);
  res.writeHead(200,{"content-type":mime[extname(absolute)]||"application/octet-stream",
    "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const origin="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [390,1280]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:width===390,hasTouch:width===390});
   // Stub only the clock, not the app or selector. This makes the authorized
   // source-bounded date stable in Playwright across runner time zones.
   await page.addInitScript(({date})=>{
     const NativeDate=Date;
     const epoch=new NativeDate(date+"T12:00:00Z").getTime();
     class FixedDate extends NativeDate{
       constructor(...args){if(args.length)super(...args);else super(epoch)}
       static now(){return epoch}
     }
     window.Date=FixedDate;
   },{date:testDate});
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  try{
   // The checked-in R34 source has zero approvals. The 151 published
   // historical and 24 Glossary cards are independently permitted on Home.
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForSelector(".homeScreen.aoH7Screens .aoH7HomeView",{timeout:45000});
   await page.waitForFunction(()=>{
     const b=document.querySelector(".homeScreen [data-home-dyk-open]");
     return Boolean(b&&!b.disabled&&(b.dataset.homeDykEntry||b.dataset.homeDykFactId));
   },null,{timeout:45000});
   assert.equal(await page.locator("[data-home-dyk-fact-id='DYK-UM03-012']").count(),0,
     "Unapproved R34 research cannot appear on the public Home");
   // Synthetic fixture is contained in this test's browser interception. It is
   // never written into R34 or published with the application.
   await page.route("**/dyk-r34-high-signal-24-editorial-selection.v1.json",
      route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fixture)}));
   await page.reload({waitUntil:"domcontentloaded"});
   await page.waitForSelector(".homeScreen.aoH7Screens .aoH7HomeView",{timeout:45000});
   const published=page.locator("[data-home-dyk-fact-id='DYK-UM03-012']");
   await published.waitFor({state:"visible",timeout:45000});
   assert.equal(await published.getAttribute("data-home-dyk-entry"),null,
      "Approved release must not open an unrelated Glossary entry");
   await published.click();
   const modal=page.locator("[data-dyk-published='DYK-UM03-012']");
   await modal.waitFor({state:"visible",timeout:30000});
   assert.equal(await modal.getAttribute("role"),"dialog");
   assert.equal((await modal.locator("a[href*='#page=331']").count()),1);
   assert.equal(await modal.locator("a").first().getAttribute("rel"),"noopener noreferrer");
   await page.keyboard.press("Escape");
   assert.equal(await page.locator("[data-dyk-published]").count(),0);
   assert.equal(await published.evaluate(el=>document.activeElement===el),true);
   assert.deepEqual(errors,[],"H7 home runtime errors for "+width);
  }finally{await page.close()}
 }

 // Verify the actual H225 original-source journey at both compact phone widths.
 // This does not override any publication gate or intercept an approved manifest.
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
  await page.addInitScript(({date})=>{
   const NativeDate=Date,epoch=new NativeDate(date+"T12:00:00Z").getTime();
   class FixedDate extends NativeDate{
    constructor(...args){if(args.length)super(...args);else super(epoch)}
    static now(){return epoch}
   }
   window.Date=FixedDate;
  },{date:h225Date});
  const errors=[];page.on("pageerror",error=>errors.push(String(error)));
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
   const published=page.locator("[data-home-dyk-fact-id='DYK-H225-R-001']");
   await published.waitFor({state:"visible",timeout:45000});
   assert.ok((await published.locator("[data-home-dyk-fact]").innerText()).includes("Ambrosian"));
   await published.click();
   const modal=page.locator("[data-dyk-published='DYK-H225-R-001']");
   await modal.waitFor({state:"visible",timeout:30000});
   assert.equal(await modal.getAttribute("role"),"dialog");
   assert.equal(await modal.locator("a[href='https://www.newadvent.org/cathen/01394a.htm']").count(),1);
   assert.ok((await modal.innerText()).includes("Read historical source article"));
   await page.keyboard.press("Escape");
   assert.equal(await page.locator("[data-dyk-published]").count(),0);
   assert.equal(await published.evaluate(el=>document.activeElement===el),true);
   assert.deepEqual(errors,[],"H225 source phone errors at "+width);
  }finally{await page.close()}
 }

 console.log("PASS released H7 Discovery phone: original H225 and test-only R34 facts remain source-accessible in the expanded 520-fact Home rotation");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
