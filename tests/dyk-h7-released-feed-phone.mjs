import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {chromium} from "@playwright/test";
const root=resolve(".");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".woff2":"font/woff2"};
const master=JSON.parse(await readFile(resolve(root,
 "data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json"),"utf8"));
const fixture=structuredClone(master);
fixture.publication_stage="APPROVED_PARTIAL_LIVE";
const fact=fixture.records.find(x=>x.id==="DYK-UM02-014");
assert.ok(fact);
fact.editorial_approval=true;fact.release_authorized=true;
fact.pilot_home_copy.final_english_signoff=true;
fact.pilot_home_copy.final_french_signoff=true;
fact.priority_lexical_screen.manual_semantic_novelty_approved=true;
fact.pilot_destination_audit.publishable_deep_link=true;
fact.pilot_destination_audit.exact_in_app_route_verified=true;
fact.pilot_source_folio.link_browser_verified=true;
fact.publication_days=["2026-10-31","2026-11-01","2026-11-02"];
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
  const errors=[];page.on("pageerror",e=>errors.push(String(e)));
  try{
   // Actual checked-in master: zero publication, existing six-fact H7 fallback.
   await page.goto(origin+"/index.html?aoR17Reader=native",{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForSelector(".homeScreen.aoH7Screens .aoH7HomeView",{timeout:45000});
   await page.waitForFunction(()=>{
    const b=document.querySelector(".homeScreen [data-home-dyk-open]");
    return Boolean(b&&!b.disabled&&b.dataset.homeDykEntry);
   },null,{timeout:45000});
   assert.equal(await page.locator("[data-home-dyk-fact-id]").count(),0);
   assert.equal(await page.locator("[data-home-dyk-entry]").count(),1);
   // Synthetic fixture is contained in this test's browser interception. It is
   // never written into R34 or published with the application.
   await page.route("**/dyk-r34-high-signal-24-editorial-selection.v1.json",
      route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fixture)}));
   await page.reload({waitUntil:"domcontentloaded"});
   await page.waitForSelector(".homeScreen.aoH7Screens .aoH7HomeView",{timeout:45000});
   const published=page.locator("[data-home-dyk-fact-id='DYK-UM02-014']");
   await published.waitFor({state:"visible",timeout:45000});
   assert.equal(await published.getAttribute("data-home-dyk-entry"),null,
      "Approved release must not open an unrelated Glossary entry");
   await published.click();
   const modal=page.locator("[data-dyk-published='DYK-UM02-014']");
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
 console.log("PASS released H7 Discovery real phone: original unpublished master stays on Glossary; synthetic fully authorized fact opens exact in-app source and restores focus");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
