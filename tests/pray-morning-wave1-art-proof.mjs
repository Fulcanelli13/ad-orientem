import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile,mkdir} from "node:fs/promises";
import http from "node:http";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {MORNING_WAVE1_PROOF,MORNING_WAVE1_MASTER_SHA256,
 morningWave1ArtMarkup,morningWave1ArtEnabled} from "../src/pray/morning-wave1-art-proof.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const save=resolve(root,"artifacts/prayer-wave1-morning-proof");
await mkdir(save,{recursive:true});
assert.equal(MORNING_WAVE1_MASTER_SHA256,
 "381db59fa47aee7603c4b9eb12f8dff8de4841eb0a4fd50c6d229e0fbd3cb63c");
const flag="?aoPrayerArt=morning-review";
assert.equal(morningWave1ArtEnabled({search:flag,daypart:"morning",mode:"guided",step:0}),true);
for(const args of [{},{search:flag,daypart:"evening"},{search:flag,daypart:"morning",step:1},
 {search:flag,mode:"list"}])assert.equal(morningWave1ArtMarkup(args),"","no unexpected artwork");
assert.match(morningWave1ArtMarkup({search:flag}),/details/);
const manifest=JSON.parse(await readFile(resolve(root,"assets/pray/hero-proof/morning-sorrows-file-proof.json"),"utf8"));
assert.equal(manifest.no_publication,true);
assert.equal(manifest.records.length,2);
assert.deepEqual(manifest.records.map(x=>x.module),["morning","seven-sorrows"]);
for(const entry of manifest.records)for(const source of entry.files){
 const f=resolve(root,"assets/pray/hero-proof",source.path.split("/").at(-1));
 assert.equal(createHash("sha256").update(await readFile(f)).digest("hex"),source.sha256,source.path);
 assert.equal(source.full_original_composition,true);
 assert.equal(source.cropped,false);
 assert.equal(source.retouched,false);
}
const MIME={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
 ".png":"image/png",".webp":"image/webp",".jpg":"image/jpeg",".svg":"image/svg+xml",
 ".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":MIME[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
const url="http://127.0.0.1:"+server.address().port+"/index.html";
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,1440]){
  const phone=width<600;
  const page=await browser.newPage({viewport:{width,height:phone?844:900},isMobile:phone,
   hasTouch:phone,serviceWorkers:"block",reducedMotion:"reduce"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto(url+flag,{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function");
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
  assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.morning_evening",{returnContext:null})),true);
  const rootSel="#aoPray435930[data-ao-contemplative-daily='guided']";
  await page.waitForSelector(rootSel+" .aoDevoSequenceTimeline",{timeout:20000});
  const art=page.locator(rootSel+" [data-ao-morning-art-proof]");
  assert.equal(await art.count(),1,"opening art capsule is explicit only in morning preview");
  const details=await art.evaluate(el=>({
    open:el.open,summaryHeight:el.querySelector("summary")?.getBoundingClientRect().height,
    horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,
    rootBackground:getComputedStyle(document.querySelector("#aoPray435930 .aoP435930Sheet")).backgroundImage,
    horizonHeight:document.querySelector(".aoQuietHorizonCanvas")?.getBoundingClientRect().height,
    timerCount:document.querySelectorAll("[data-tp381-daily-timer]").length,
    startLight:document.querySelector("#aoPray435930")?.style.getPropertyValue("--ao-contemplative-light"),
    card:document.querySelector(".aoTP381GuideCard")?.textContent?.length
  }));
  assert.equal(details.open,false,"art must not interrupt reading by expanding automatically");
  assert.ok(details.summaryHeight<=65,"opening art trigger too tall");
  assert.equal(details.horizontalOverflow,false,"horizontal overflow "+width);
  assert.ok(details.rootBackground.includes("gradient"),"full screen atmosphere displaced");
  assert.ok(details.horizonHeight>65,"horizon removed");
  assert.ok(details.startLight.length>0,"sky progression disabled");
  assert.ok(details.card>20,"prayer lost");
  const thumb=art.locator("summary img");
  await thumb.evaluate(async el=>{if(!el.complete)await new Promise((ok,no)=>{el.onload=ok;el.onerror=no})});
  assert.ok(await thumb.evaluate(el=>el.naturalWidth>0),"thumbnail failed");
  await art.locator("summary").click();
  assert.equal(await art.evaluate(el=>el.open),true);
  const full=art.locator("figure img");
  await full.evaluate(async el=>{if(!el.complete)await new Promise((ok,no)=>{el.onload=ok;el.onerror=no})});
  const pic=await full.evaluate(el=>({loaded:el.naturalWidth>0,fit:getComputedStyle(el).objectFit,
   height:el.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth>innerWidth+1}));
  assert.equal(pic.loaded,true);
  assert.equal(pic.fit,"contain");
  assert.equal(pic.overflow,false);
  assert.ok(pic.height<=460,"artwork image should respect available viewport");
  await page.screenshot({path:resolve(save,"morning-art-open-"+width+".png"),animations:"disabled"});
  await art.locator("summary").click();
  await page.locator(rootSel+" .aoDevoStop[data-ao-devo-chapter='1']").click();
  assert.equal(await art.count(),0,"art disappears after opening prayer");
  const afterLight=await page.locator("#aoPray435930").evaluate(el=>el.style.getPropertyValue("--ao-contemplative-light"));
  assert.notEqual(afterLight,details.startLight,"sunrise no longer progresses");
  await page.locator(rootSel+" [data-tp381-daypart='evening']").click();
  assert.equal(await page.locator("[data-ao-morning-art-proof]").count(),0);
  assert.equal(await page.locator(rootSel+" .aoQuietHorizon").getAttribute("data-ao-quiet-daily-horizon"),"evening");
  assert.deepEqual(errors,[],"browser errors "+width);
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await page.goto(url,{waitUntil:"domcontentloaded"});
 await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function");
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
 assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.morning_evening",{returnContext:null})),true);
 assert.equal(await page.locator("[data-ao-morning-art-proof]").count(),0,"default experience changed");
 await page.close();
 console.log(JSON.stringify({result:"PASS_MORNING_SOURCE_OWNED_ART_PROOF",widths:[320,390,1440],
  eveningArtworkAbsent:true,defaultOff:true,horizonProgresses:true,srcHashesVerified:true,
  artworkPublished:false}));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
