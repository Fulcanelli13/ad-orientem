import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {readFile,mkdir} from "node:fs/promises";
import http from "node:http";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {
 SEVEN_SORROWS_LOCKED_MASTER_SHA256,SEVEN_SORROWS_PHOTO_PROOFS,
 sevenSorrowsArtMarkup,sevenSorrowsArtEnabled
} from "../src/pray/seven-sorrows-novena-hero-proof.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const save=resolve(root,"artifacts/prayer-wave1-seven-sorrows-proof");
await mkdir(save,{recursive:true});
assert.equal(SEVEN_SORROWS_LOCKED_MASTER_SHA256,
 "c9c338596bc2a1f069535facfab1fe11cee1aaad7d67e5440c2114cfe9f09f2a");
const flag="?aoPrayerArt=sorrows-review";
assert.equal(sevenSorrowsArtEnabled({search:flag,novenaId:"seven_sorrows",screen:"detail"}),true);
for(const c of [{},{search:flag,novenaId:"st_therese",screen:"detail"},
 {search:flag,novenaId:"seven_sorrows",screen:"day"},
 {search:"",novenaId:"seven_sorrows",screen:"detail"}])assert.equal(sevenSorrowsArtMarkup(c),"");
assert.match(sevenSorrowsArtMarkup({search:flag,novenaId:"seven_sorrows",screen:"detail",french:true}),/Sept Douleurs/);
for(const [name,sha] of [[SEVEN_SORROWS_PHOTO_PROOFS.small,SEVEN_SORROWS_PHOTO_PROOFS.smallSha256],
 [SEVEN_SORROWS_PHOTO_PROOFS.large,SEVEN_SORROWS_PHOTO_PROOFS.largeSha256]]){
 assert.equal(createHash("sha256").update(await readFile(resolve(root,name))).digest("hex"),sha,name);
}
const runtime=await readFile(resolve(root,"src/pray/novena-runtime.js"),"utf8");
assert.equal((runtime.match(/sevenSorrowsArtMarkup\(\{/g)||[]).length,1,"one integration point only");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
 ".json":"application/json",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",
 ".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390,1440]){
  const mobile=width<600;
  const page=await browser.newPage({viewport:{width,height:mobile?844:900},isMobile:mobile,
   hasTouch:mobile,reducedMotion:"reduce",serviceWorkers:"block",deviceScaleFactor:1});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html"+flag,
   {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
  assert.equal(await page.evaluate(()=>window.AO_PRAY_APP_V1.open()),true);
  await page.waitForFunction(()=>typeof window.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  await page.evaluate(()=>window.AO_MODULES.open("pray.novenas",{returnContext:null}));
  await page.waitForFunction(()=>typeof window.AO_NOVENAS_V3?.open==="function",null,{timeout:15000});
  assert.equal(await page.evaluate(()=>window.AO_NOVENAS_V3.open({novenaId:"seven_sorrows"})),true);
  assert.equal(await page.evaluate(()=>window.AO_NOVENAS_V3.state().id),"seven_sorrows");
  assert.equal(await page.evaluate(()=>window.AO_NOVENAS_V3.state().screen),"detail");
  const rootSel="#aoPray435930";
  const art=page.locator(rootSel+" [data-ao-seven-sorrows-art-proof]");
  await art.waitFor({state:"attached",timeout:12000});
  assert.equal(await page.locator(rootSel+" .aoN1DetailFolio [data-n1-begin]").count(),1,
   "source-owned novena start lost");
  assert.equal(await page.locator(rootSel+" .aoN1DayLeaf").count(),9,"nine original days lost");
  const hierarchy=await art.evaluate(el=>{
    const main=el.closest("main"),start=main.querySelector("[data-n1-begin]");
    return Boolean(start?.compareDocumentPosition(el)&Node.DOCUMENT_POSITION_FOLLOWING);
  });
  assert.equal(hierarchy,true,"optional image must not precede novena action");
  await page.waitForFunction(()=>{
   const boot=document.querySelector("#ao-cinema-boot"),loader=document.querySelector("#ao-cinema-loader");
   return (!boot||boot.classList.contains("aoCinemaBootDone"))&&
    (!loader||!loader.classList.contains("aoCinemaLoaderOn"));
  },null,{timeout:45000});
  assert.equal(await art.evaluate(el=>el.open),false,"image should be collapsed by default");
  await art.scrollIntoViewIfNeeded();
  const collapsed=await art.evaluate(el=>({
   height:el.getBoundingClientRect().height,
   summaryHeight:el.querySelector("summary").getBoundingClientRect().height,
   documentOverflow:document.documentElement.scrollWidth-innerWidth
  }));
  assert.ok(collapsed.height<=80&&collapsed.summaryHeight>=43&&collapsed.documentOverflow<=2,
   "art must be compact and readable "+JSON.stringify(collapsed));
  await page.screenshot({path:resolve(save,"sorrows-collapsed-"+width+".png"),animations:"disabled"});
  await art.locator("summary").click();
  const image=art.locator("figure img");
  await image.evaluate(async el=>{if(!el.complete)await new Promise((ok,no)=>{
   el.onload=ok;el.onerror=no
  })});
  const visual=await image.evaluate(el=>({
   loaded:el.complete&&el.naturalWidth>0,objectFit:getComputedStyle(el).objectFit,
   height:el.getBoundingClientRect().height,overflow:document.documentElement.scrollWidth-innerWidth,
   source:el.currentSrc
  }));
  assert.equal(visual.loaded,true,"photo failed to load");
  assert.equal(visual.objectFit,"contain");
  assert.ok(visual.height<=471&&visual.overflow<=2,"full painting clipping/overflow");
  assert.match(visual.source,/seven-sorrows-whole-(720|1440)-proof\.webp/);
  await art.scrollIntoViewIfNeeded();
  await page.screenshot({path:resolve(save,"sorrows-expanded-"+width+".png"),animations:"disabled"});
  await page.locator(rootSel+" [data-n1-begin]").click();
  assert.equal(await page.evaluate(()=>window.AO_NOVENAS_V3.state().screen),"day");
  assert.equal(await art.count(),0,"photo must disappear in nine-day prayer");
  assert.ok(await page.locator(rootSel+" .aoN1Reader .aoDevoCard").count()===1,
   "canonical source-owned day card missing");
  assert.deepEqual(errors,[],"browser exceptions "+width);
  await page.close();
 }
 const plain=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
 await plain.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded"});
 await plain.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function");
 assert.equal(await plain.evaluate(()=>window.AO_PRAY_APP_V1.open()),true);
 await plain.waitForFunction(()=>typeof window.AO_PRAY_V435930?.open==="function");
 await plain.evaluate(()=>window.AO_MODULES.open("pray.novenas",{returnContext:null}));
 await plain.waitForFunction(()=>typeof window.AO_NOVENAS_V3?.open==="function");
 assert.equal(await plain.evaluate(()=>window.AO_NOVENAS_V3.open({novenaId:"seven_sorrows"})),true);
 assert.equal(await plain.locator("[data-ao-seven-sorrows-art-proof]").count(),0,
   "default novena route changed");
 await plain.close();
 console.log(JSON.stringify({result:"PASS_WAVE1_SEVEN_SORROWS_CANONICAL_NOVENA_PHOTO",
  widths:[320,390,1440],nineDaysPreserved:true,defaultRouteUnchanged:true,
  sourceImageHashVerified:2,productionReleased:false}));
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
