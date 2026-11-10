// Real 320px / 390px browser integration smoke. Synthetic approval is only
// intercepted in the test's in-memory browser; NEVER written to the app.
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
const preview=JSON.parse(await readFile(resolve(root,
 "data/research/did-you-know/release-candidates/ao-dyk-display-preview-526-RESEARCH_ONLY.v1.json"),"utf8"));
const first=structuredClone(preview.records[0]);
first.editorial.owner_decision="APPROVED";
first.editorial.copy_adjustment_pending=false;
first.eligibility="APPROVED_FOR_LIVE";
for(const key of Object.keys(first.release_gate))first.release_gate[key]=true;
const url=first.research_provenance.source_urls_raw.split(/[;\n]/)[0].trim();
first.published_source={url,source_id:"TEST-MOBILE-SOURCE",
 source_record_id:"TEST-MOBILE-SOURCE",deep_link_verified:true};
const fixture={schema:"AO_DYK_526_APPROVED_RELEASE_V1",
 release_stage:"APPROVED_PARTIAL_LIVE",published:true,
 global_release_authorized:true,owner_release_decision:"APPROVED",
 records:[first]};
const server=http.createServer(async(req,res)=>{
 try{
  const path=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const absolute=resolve(root,"."+path);
  if(absolute!==root&&!absolute.startsWith(root+sep)){
   res.writeHead(403);return res.end("Forbidden");
  }
  const bytes=await readFile(absolute);
  res.writeHead(200,{"content-type":mime[extname(absolute)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const origin="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:844},isMobile:true,hasTouch:true});
  const unexpected=[],pageErrors=[];
  page.on("request",req=>{
   const u=req.url();
   if(u.includes("dyk-526-approved-release.v1.json")||u.includes("ao-dyk-display-preview-526-RESEARCH_ONLY"))
    unexpected.push(u);
  });
  page.on("pageerror",e=>pageErrors.push(String(e)));
  try{
   await page.goto(origin+"/index.html?aoR17Reader=native",
    {waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForSelector(".homeScreen.aoH7Screens .aoH7HomeView",{timeout:45000});
   await page.waitForFunction(()=>{
    const b=document.querySelector(".homeScreen [data-home-dyk-open]");
    return Boolean(b&&!b.disabled&&(b.dataset.homeDykEntry||b.dataset.homeDykFactId));
   },null,{timeout:45000});
   const original=await page.evaluate(()=>{
    const b=document.querySelector(".homeScreen [data-home-dyk-open]");
    const rect=b.getBoundingClientRect();
    return {bank:b.dataset.homeDykBank||null,
     title:b.querySelector("[data-home-dyk-title]")?.textContent,
     fact:b.querySelector("[data-home-dyk-fact]")?.textContent,
     left:rect.left,right:rect.right,viewport:window.innerWidth};
   });
   assert.equal(original.bank,null,"Unapproved 526 record must be absent by default");
   assert.ok(original.title&&original.fact);
   assert.ok(original.left>=-3&&original.right<=original.viewport+3,
    "Home DYK card must fit "+width+"px phone viewport");
   assert.deepEqual(unexpected,[],"No 526 request should occur while disabled");

   // Intercept the *hypothetical* approved source only after verifying public
   // default. The production Home gate remains hard-disabled throughout.
   await page.route("**/dyk-526-approved-release.v1.json",route=>
    route.fulfill({status:200,contentType:"application/json",body:JSON.stringify(fixture)}));
   const test=await page.evaluate(async({fixture,date,id})=>{
    const module=await import("/src/home/dyk-526-home-bridge.js");
    const b=document.querySelector(".homeScreen [data-home-dyk-open]");
    const denied=module.applyDyk526HomeCard(b,fixture,id,date,"fr");
    const allowed=module.applyDyk526HomeCard(b,fixture,id,date,"fr",{enabled:true});
    return {disabled:module.DYK526_HOME_ENABLED,denied,allowed,
     bank:b.dataset.homeDykBank,id:b.dataset.homeDykFactId,
     title:b.querySelector("[data-home-dyk-title]").textContent,
     fact:b.querySelector("[data-home-dyk-fact]").textContent};
   },{fixture,date:"2026-11-10",id:first.id});
   assert.equal(test.disabled,false);
   assert.equal(test.denied,false);
   assert.equal(test.allowed,true);
   assert.equal(test.bank,"526");
   assert.equal(test.id,first.id);
   assert.equal(test.title,first.proposed_title.fr);
   assert.equal(test.fact,first.proposed_copy.fr);

   const opened=await page.evaluate(async({id,date})=>{
    const module=await import("/src/home/dyk-526-home-bridge.js");
    return module.openDyk526HomeSource(window,{
     id,date,language:"fr",enabled:true,
     trigger:document.querySelector(".homeScreen [data-home-dyk-open]")
    });
   },{id:first.id,date:"2026-11-10"});
   assert.equal(opened,true,"Synthetic verified source modal should open");
   const dialog=page.locator("[data-dyk-published='"+first.id+"']");
   await dialog.waitFor({state:"visible",timeout:10000});
   assert.equal(await dialog.locator("a").first().getAttribute("href"),url);
   const bounds=await dialog.boundingBox();
   assert.ok(bounds&&bounds.x>=-3&&bounds.x+bounds.width<=width+3,
    "Source modal must fit "+width+"px phone viewport");
   await page.keyboard.press("Escape");
   assert.equal(await page.locator("[data-dyk-published]").count(),0);
   assert.equal(await page.locator("[data-home-dyk-open]").evaluate(el=>document.activeElement===el),true);
   assert.deepEqual(pageErrors,[],"Unexpected Home script exceptions at "+width+"px");
  }finally{await page.close();}
 }
 console.log("PASS DYK 526 phone: 320/390px real Home unchanged; synthetic EN/FR-ready source modal and fail-closed default");
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
