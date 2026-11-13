import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {resolvePrayerEditorialArtwork} from "../src/pray/art-slot-map.v1.js";
import {A3_FOCUS_CUTS} from "../src/pray/claude-painting-a3-experience.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/a3-visual-acceptance");
await mkdir(out,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",
 ".json":"application/json",".css":"text/css",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const uri=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
  const file=resolve(root,"."+uri);
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden");}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((done,reject)=>{server.once("error",reject);server.listen(4298,"127.0.0.1",done);});
const ids=Object.keys(A3_FOCUS_CUTS);
const released=ids.filter(id=>resolvePrayerEditorialArtwork("COV-"+id).state==="PUBLISHED_EXACT_PHOTO");
const withheld=ids.filter(id=>!released.includes(id));
assert.ok(released.length>0,"No approved, exact-photo A3 prayer is eligible for visual acceptance");
let browser;
const reports=[];
try{
 browser=await chromium.launch({headless:true});
 for(const [width,height] of [[320,700],[390,844],[1365,900]]){
  const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:1,
   isMobile:width<600,hasTouch:width<600,serviceWorkers:"block"});
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message)));
  await page.goto("http://127.0.0.1:4298/index.html?aoPrayerPaintingA3=1",
   {waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof window.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  for(const id of ids){
   assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.library")),true);
   const entry=page.locator('#aoPray435930.open [data-p435930-lib-open="'+id+'"]').first();
   await entry.click({timeout:20000});
   const painting=page.locator("#aoPray435930.open [data-ao-claude-painting-a3]");
   if(!released.includes(id)){
    assert.equal(await painting.count(),0,id+" must keep non-A3 reader until exact photo publication");
    continue;
   }
   await painting.waitFor({state:"visible",timeout:15000});
   // Measure after the real browser finishes loading its display fonts.
   await page.evaluate(async()=>{await document.fonts.ready;await new Promise(done=>requestAnimationFrame(()=>requestAnimationFrame(done)));});
   await page.waitForFunction(()=>document.querySelector("[data-ao-claude-painting-a3]")?.dataset?.aoA3ReadingLayout,null,{timeout:10000});
   const initial=await painting.evaluate(el=>{
    const bg=el.querySelector(".bg"),face=el.querySelector(".sw .st .a")||el.querySelector(".aoA3PlainText");
    const box=el.querySelector(".tx");
    return {imageLoaded:bg.complete&&bg.naturalWidth>0,imageFit:getComputedStyle(bg).objectFit,
     animation:getComputedStyle(bg).animationName,
     layout:el.dataset.aoA3ReadingLayout,
     ratio:(face?.scrollHeight||0)/(el.clientHeight||1),
     overflow:getComputedStyle(box).overflowY,
     imageTitle:bg.alt,clientWidth:el.clientWidth};
   });
   assert.equal(initial.imageLoaded,true,id+" actual approved photograph failed to load");
   assert.equal(initial.imageFit,"contain",id+" image cropped");
   assert.match(initial.animation,/aoClaudeA3Kb/,id+" painting not animated");
   assert.equal(initial.layout,initial.ratio>0.40?"veil":"cinematic",id+" active text-fit incorrect");
   assert.ok(initial.clientWidth<=width+1,id+" viewport overflow");
   await page.screenshot({path:resolve(out,width+"-"+id+"-pray.png"),fullPage:false});
   const swap=painting.locator("[data-ao-a3-swap]");
   if(await swap.count()){
    await swap.click();
    assert.equal(await swap.getAttribute("aria-pressed"),"true",id+" language toggle inactive");
    const swapped=await painting.evaluate(el=>{
     const face=el.querySelector(".sw .st .b");
     return {visible:face?.getAttribute("aria-hidden")==="false",
      layout:el.dataset.aoA3ReadingLayout,ratio:(face?.scrollHeight||0)/(el.clientHeight||1)};
    });
    assert.ok(swapped.visible,id+" translation not exposed");
    assert.equal(swapped.layout,swapped.ratio>0.40?"veil":"cinematic",id+" translation fit incorrect");
    await page.screenshot({path:resolve(out,width+"-"+id+"-translation.png"),fullPage:false});
   }
   const focus=painting.locator('[data-ao-a3-mode="focus"]');
   if(await focus.count()){
    await focus.click();
    assert.equal(await painting.getAttribute("data-ao-a3-focus-step"),"0");
    const stage=painting.locator("[data-ao-a3-focus-next]");
    await stage.click();
    assert.equal(await painting.getAttribute("data-ao-a3-focus-step"),"1",id+" focus did not advance");
    await painting.locator("[data-ao-a3-focus-translate]").click();
    assert.equal(await painting.getAttribute("data-ao-a3-focus-language"),"vern");
    const visible=await painting.locator(".aoA3FocusVerse:visible").count();
    assert.equal(visible,1,id+" showed multiple languages/passages at once");
    await page.screenshot({path:resolve(out,width+"-"+id+"-contemplate.png"),fullPage:false});
    await painting.locator('[data-ao-a3-mode="pray"]').click();
   }
   const veil=await painting.getAttribute("data-ao-a3-reading-layout");
   if(veil==="veil"){
    const scrolled=await painting.locator(".tx").evaluate(el=>{
     el.scrollTop=el.scrollHeight;
     return el.scrollTop+el.clientHeight>=el.scrollHeight-3;
    });
    assert.equal(scrolled,true,id+" veil clipped the prayer ending");
   }
   await painting.locator("[data-ao-a3-view]").click();
   assert.equal(await painting.locator(".bg").evaluate(el=>getComputedStyle(el).animationName),"none",
    id+" painting-only state still animates");
   await painting.locator("[data-ao-a3-view]").click();
   await page.emulateMedia({reducedMotion:"reduce"});
   assert.equal(await painting.locator(".bg").evaluate(el=>getComputedStyle(el).animationName),"none",
    id+" reduced motion not respected");
   await page.emulateMedia({reducedMotion:"no-preference"});
   reports.push({width,id,...initial});
  }
  assert.deepEqual(errors,[],"Browser errors at "+width+": "+JSON.stringify(errors));
  await context.close();
 }
 await writeFile(resolve(out,"report.json"),JSON.stringify({released,withheld,reports},null,2));
 console.log("PASS A3 real-app mobile/desktop screenshots and mode controls",JSON.stringify({released,withheld,captures:reports.length}));
}finally{await browser?.close();await new Promise(done=>server.close(done));}
