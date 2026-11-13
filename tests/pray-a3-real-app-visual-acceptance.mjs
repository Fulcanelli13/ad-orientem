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
  // Prayer is lazy-mounted: open its public app owner before waiting for the runtime.
  await page.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
  assert.equal(await page.evaluate(()=>window.AO_PRAY_APP_V1.open()),true);
  await page.waitForFunction(()=>typeof window.AO_PRAY_V435930?.open==="function",null,{timeout:25000});
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
   await page.waitForFunction(()=>document.querySelector("[data-ao-claude-painting-a3] .bg")?.complete===true,null,{timeout:12000});
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
   const geometry=await painting.evaluate(el=>{
    const measure=selector=>{
     const target=selector==="self"?el:document.querySelector(selector);
     if(!target)return null;
     const r=target.getBoundingClientRect(),style=getComputedStyle(target);
     return {top:r.top,bottom:r.bottom,left:r.left,right:r.right,height:r.height,width:r.width,
      overflowY:style.overflowY,display:style.display,pointerEvents:style.pointerEvents};
    };
    return {root:measure("self"),sheet:measure("#aoPray435930 .aoP435930Sheet"),
     header:measure("#aoPray435930 .aoP435930Head"),
     card:measure("#aoPray435930 .aoClaudePaintingA3Card"),
     title:measure("#aoPray435930 .aoClaudePaintingA3 .ct"),
     photo:measure("#aoPray435930 .aoClaudePaintingA3 .bg"),
     text:measure("#aoPray435930 .aoClaudePaintingA3 .tx"),
     mode:measure("#aoPray435930 .aoA3ExperienceModes"),
     ribbon:measure("#ao-global-ribbon")};
   });
   console.log("A3_GEOMETRY "+width+" "+id+" "+JSON.stringify(geometry));
   assert.ok(geometry.root.height>=height-2,id+" painting viewport is short: "+JSON.stringify(geometry));
   assert.equal(geometry.ribbon?.display,"none",id+" unrelated global navigation still visible");
   assert.equal(initial.imageLoaded,true,id+" actual approved photograph failed to load");
   assert.equal(initial.imageFit,"contain",id+" image cropped");
   assert.match(initial.animation,/aoClaudeA3Kb/,id+" painting not animated");
   assert.equal(initial.layout,initial.ratio>0.40?"veil":"cinematic",id+" active text-fit incorrect");
   assert.ok(initial.clientWidth<=width+1,id+" viewport overflow");
   await page.screenshot({path:resolve(out,width+"-"+id+"-pray.png"),fullPage:false});
   const swap=painting.locator("[data-ao-a3-swap]");
   if(await swap.count()){
    await swap.click();
    await swap.evaluate(async el=>{
     const transitions=[...el.querySelectorAll(".st>*")].flatMap(node=>node.getAnimations());
     await Promise.all(transitions.map(animation=>animation.finished.catch(()=>{})));
    });
    await page.evaluate(()=>new Promise(done=>requestAnimationFrame(done)));
    assert.equal(await swap.getAttribute("aria-pressed"),"true",id+" language toggle inactive");
    const swapped=await painting.evaluate(el=>{
     const face=el.querySelector(".sw .st .b");
     return {visible:face?.getAttribute("aria-hidden")==="false",
      layout:el.dataset.aoA3ReadingLayout,ratio:(face?.scrollHeight||0)/(el.clientHeight||1)};
    });
    assert.ok(swapped.visible,id+" translation not exposed");
    assert.ok(await painting.locator(".sw .st .b").evaluate(el=>Number(getComputedStyle(el).opacity))>.95,
     id+" switched vernacular not visibly opaque");
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
   await page.evaluate(()=>{document.documentElement.dataset.reducedMotion="true";});
   assert.equal(await painting.locator(".bg").evaluate(el=>getComputedStyle(el).animationName),"none",
    id+" app-level reduced motion not respected");
   await page.evaluate(()=>{delete document.documentElement.dataset.reducedMotion;});
   await page.locator("#aoPray435930.open .aoP435930Back").click({timeout:8000});
   assert.equal(await painting.count(),0,id+" Back did not exit the painting");
   reports.push({width,id,...initial});
  }
  // The canonical source lines remain inside the painting, while the Claude
  // Choir fixed response is deliberately moved to its card sibling outside it.
  for(const id of ["adoration_litany_blessed_sacrament","devotion_litany_st_joseph"]){
   if(resolvePrayerEditorialArtwork("COV-"+id).state!=="PUBLISHED_EXACT_PHOTO")continue;
   assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.library")),true);
   await page.locator('#aoPray435930.open [data-p435930-lib-open="'+id+'"]').first().click();
   const choir=page.locator("#aoPray435930.open [data-ao-claude-painting-a3]");
   await choir.waitFor({state:"visible",timeout:15000});
   assert.equal(await choir.getAttribute("data-ao-a3-id"),id,id+" resolved to another prayer");
   assert.equal(await choir.getAttribute("data-ao-a3-kind"),"litany",id+" lost Choir kind");
   const card=page.locator("#aoPray435930.open .aoClaudePaintingA3Card");
   const rows=choir.locator(".aoClaudeChoirBeat");
   const foot=card.locator(".aoClaudeChoirResponse");
   const detail=await choir.evaluate(el=>({
    id:el.dataset.aoA3Id,
    sourceRowCount:el.querySelectorAll(".aoClaudeChoirBeat").length,
    sourceFaceCount:el.querySelectorAll(".aoClaudeChoirScroll").length,
    sourceTextLength:el.querySelector(".aoClaudeChoirScroll")?.textContent?.length||0,
    canonicalTextLength:window.AO_PRAY_CANONICAL_DATA_V435930?.prayers?.[el.dataset.aoA3Id]?.en?.length||0,
    footerCount:el.closest(".aoClaudePaintingA3Card")?.querySelectorAll(".aoClaudeChoirResponse").length||0
   }));
   console.log("A3_CHOIR_DIAGNOSTIC "+width+" "+id+" "+JSON.stringify(detail));
   await page.screenshot({path:resolve(out,width+"-"+id+"-choir.png"),fullPage:false});
   assert.ok(detail.sourceRowCount>5,id+" lost source-owned response beats: "+JSON.stringify(detail));
   assert.ok(detail.sourceTextLength>100,id+" source verses are blank: "+JSON.stringify(detail));
   assert.equal(await foot.count(),1,id+" lost card-level fixed response footer");
   assert.equal(await choir.locator('[data-ao-a3-mode="focus"]').count(),0,
    id+" got inappropriate standalone contemplation");
   // The opening Kyrie has no fabricated footer answer. Activate the first
   // source-authored invocation with an actual response before checking its bar.
   // Rows already carry their responses in source-owned data attributes.
   // A single p row is itself the response owner, not a nested element.
   const responsiveRow=choir.locator('.aoClaudeChoirBeat[data-ao-choir-answer]:not([data-ao-choir-answer=""])').first();
   assert.ok(await responsiveRow.count(),id+" no attested response-bearing invocation");
   const expectedAnswer=await responsiveRow.getAttribute("data-ao-choir-answer");
   await responsiveRow.click({timeout:12000});
   await page.waitForFunction(()=>{
    const card=document.querySelector("#aoPray435930.open .aoClaudePaintingA3Card");
    const bar=card?.querySelector(".aoClaudeChoirResponse");
    return bar&&!bar.hidden&&Boolean(bar.querySelector(".aoClaudeChoirResponseText")?.textContent);
   },null,{timeout:10000});
   const geo=await foot.evaluate(el=>{
    const box=el.getBoundingClientRect(),root=el.closest(".aoClaudePaintingA3Card").getBoundingClientRect();
    return {visible:box.height>20&&box.width>0&&!el.hidden,
     atFoot:Math.abs(root.bottom-box.bottom)<12,
     answer:el.querySelector(".aoClaudeChoirResponseText")?.textContent||""};
   });
   assert.ok(geo.visible&&geo.atFoot,id+" footer detached from painting: "+JSON.stringify(geo));
   assert.equal(geo.answer,expectedAnswer,id+" footer did not match the selected canonical response");
   reports.push({width,id,kind:"litany",sourceRowCount:detail.sourceRowCount,choirFoot:geo});
  }
  await page.evaluate(()=>window.AO_PRAY_V435930.close({silent:true}));
  const restoredRibbon=await page.evaluate(()=>{
   const ribbon=document.querySelector("#ao-global-ribbon");
   return ribbon?getComputedStyle(ribbon).display:null;
  });
  assert.ok(restoredRibbon!==null&&restoredRibbon!=="none","A3 exit must restore global navigation");
  assert.deepEqual(errors,[],"Browser errors at "+width+": "+JSON.stringify(errors));
  await context.close();
 }
 await writeFile(resolve(out,"report.json"),JSON.stringify({released,withheld,reports},null,2));
 console.log("PASS A3 real-app mobile/desktop screenshots and mode controls",JSON.stringify({released,withheld,captures:reports.length}));
}finally{await browser?.close();await new Promise(done=>server.close(done));}
