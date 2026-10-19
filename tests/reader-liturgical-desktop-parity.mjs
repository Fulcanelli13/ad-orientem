import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/liturgical-desktop-review");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const uri=new URL(req.url,"http://127.0.0.1");
  const file=resolve(root,"."+decodeURIComponent(uri.pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]??"application/octet-stream","cache-control":"no-store"});
  res.end(body);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message??error))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
const url="http://127.0.0.1:"+server.address().port;
const report={schema:"ao-liturgical-desktop-visual-v1",viewport:{width:1440,height:900},readers:[],tenebrae:[],errors:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:900},
   deviceScaleFactor:1,hasTouch:false,locale:"en-GB",serviceWorkers:"block"});
 const ceremonies=[
   {name:"mass",rite:null},
   {name:"asperges",rite:"asperges"},
   {name:"palm",rite:"palm"},
   {name:"ash",rite:"ash"},
   {name:"candlemas",rite:"candlemas"},
   {name:"good-friday",rite:"good-friday"},
   {name:"easter-vigil",rite:"easter-vigil"}
 ];
 const baselines=Object.create(null);
 for(const spec of ceremonies){
  for(const mode of ["LIVE","MISSAL"]){
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e.message??e)));
   const query=new URLSearchParams({mode,lang:"fr",
     ...(spec.rite?{rite:spec.rite}:{})});
   await page.goto(url+"/tests/fixtures/reader-phone-harness.html?"+query,
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>["true","error"].includes(document.documentElement.dataset.harnessReady),
     null,{timeout:90000});
   assert.equal(await page.evaluate(()=>document.documentElement.dataset.harnessReady),"true",
     spec.name+"/"+mode+" reader fixture error: "+
       await page.evaluate(()=>globalThis.__AO_PHONE_HARNESS_ERROR??""));
   const sample=await page.evaluate(()=>{
    const root=document.querySelector("#ao-r17-native-reader-preview");
    const shell=root?.querySelector("[data-ao-reader-shell]");
    const ribbon=shell?.querySelector(".ao-reader-top-ribbon");
    const card=shell?.querySelector(".ao-prayer-card");
    const paragraphs=[...(card?.querySelectorAll(".ao-reader-paragraph")??[])];
    const texts=paragraphs.filter(x=>x.textContent.trim());
    const bb=el=>{if(!el)return null;const r=el.getBoundingClientRect();
      return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
    const active=paragraphs.some(x=>x.dataset.readingActive==="true");
    return {mode:shell?.dataset.mode,arrows:root?.querySelectorAll("[data-reader-nav]").length,
      progress:root?.querySelector('[data-role="reader-progressbar"]')?.hidden===false,
      textLength:card?.textContent?.trim()?.length??0,paragraphs:paragraphs.length,
      textCount:texts.length,focusActive:active,opacity:texts.length?
        parseFloat(getComputedStyle(texts[0]).opacity):null,
      font:texts.length?getComputedStyle(texts[0]).fontFamily:null,
      shell:bb(shell),ribbon:bb(ribbon),card:bb(card),
      bodyOverflow:root?.scrollWidth-root?.clientWidth,
      documentOverflow:document.documentElement.scrollWidth-innerWidth,
      sectionJump:root?.querySelectorAll("[data-role='section-jump']").length??0};
   });
   assert.equal(sample.mode,mode,spec.name+" wrong display mode");
   assert.equal(sample.arrows,0,spec.name+" rendered obsolete arrows");
   assert.ok(sample.progress,spec.name+" no persistent progress");
   assert.ok(sample.textCount>0 && sample.textLength>30,
     spec.name+" no visible source-owned reading text");
   assert.ok(sample.shell&&sample.card&&sample.ribbon,spec.name+" shell incomplete");
   assert.ok(sample.bodyOverflow<=2&&sample.documentOverflow<=2,
     spec.name+" desktop horizontal overflow: "+JSON.stringify(sample));
   assert.ok(sample.card.width>=520&&sample.card.right<=1441,
     spec.name+" reading card not usable at 1440 px");
   assert.ok(sample.ribbon.right<=1441&&sample.ribbon.width>400,
     spec.name+" top ribbon overflows desktop viewport");
   assert.ok(sample.sectionJump===1,spec.name+" missing section jump");
   // Uncued annexed-rite passages must remain legible even in LIVE.
   if(mode==="LIVE"&&sample.textCount>0&&!sample.focusActive&&spec.rite
      &&!["good-friday","easter-vigil"].includes(spec.rite)){
      assert.ok(sample.opacity>=.8,
       spec.name+" uncued source rows rendered illegibly: "+sample.opacity);
   }
   if(spec.name==="mass")baselines[mode]=sample.font;
   else if(baselines[mode]&&["asperges","palm","ash","candlemas"].includes(spec.name)){
     assert.equal(sample.font,baselines[mode],spec.name+" deviates from Mass "+mode+" text family");
   }
   assert.deepEqual(errors,[],spec.name+"/"+mode+" emitted browser exceptions");
   report.readers.push({name:spec.name,mode,...sample});
   await page.locator("[data-ao-reader-shell]").screenshot({
     path:resolve(out,spec.name+"-"+mode.toLowerCase()+"-1440.png"),animations:"disabled"});
   await page.close();
  }
 }
 // Tenebrae is the Office engine; share the palette and reading idiom
 // without imposing Mass event rails or ritual modes.
 const office=await context.newPage(),officeErrors=[];
 office.on("pageerror",e=>officeErrors.push(String(e.message??e)));
 await office.goto(url+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
 await office.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",
   null,{timeout:30000});
 assert.equal(await office.evaluate(async()=>globalThis.AO_PRAY_APP_V1.open()),true);
 await office.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",
   null,{timeout:30000});
 assert.equal(await office.evaluate(()=>globalThis.AO_PRAY_V435930.open(
   "pray.tenebrae",{returnContext:null})),true);
 await office.waitForFunction(()=>document.getElementById("ao-tenebrae-shared-reader-v1")?.sheet?.cssRules?.length>0
   && document.querySelector("#aoPray435930 .aoTenebReading"),null,{timeout:30000});
 for(const hour of ["MATINS","LAUDS"]){
  if(hour==="LAUDS")
   await office.locator('#aoPray435930 [data-p435930-tenebrae-hour="LAUDS"]').click();
  const state=await office.evaluate(()=>{
   const shell=document.querySelector("#aoPray435930 .aoTenebBody");
   const header=shell?.querySelector(".aoTenebReaderRibbon");
   const reading=shell?.querySelector(".aoTenebReading");
   const bounds=x=>{const r=x?.getBoundingClientRect();
     return r?{x:r.x,width:r.width,right:r.right}:null};
   return {overflow:shell?.scrollWidth-shell?.clientWidth,
     titleCount:shell?.querySelectorAll(".aoTenebReaderRibbon .aoTenebIntro h2").length,
     faceControls:shell?.querySelectorAll(".aoTenebReaderRibbon [data-p435930-tenebrae-face]").length,
     arrows:shell?.querySelectorAll("[data-p435930-tenebrae-move]").length,
     progress:shell?.querySelectorAll(".aoTenebStageNav .aoDevoProgress").length,
     textLength:reading?.textContent?.trim()?.length,
     header:bounds(header),reading:bounds(reading)};
  });
  assert.ok(state.titleCount===1&&state.faceControls===1&&state.arrows===0
    &&state.progress===1,"Tenebrae duplicate or missing reading chrome");
  assert.ok(state.textLength>50&&state.overflow<=2,
    "Tenebrae desktop content unreadable or horizontally overflowed");
  assert.ok(state.reading.width>=500&&state.reading.right<=1441,
    "Tenebrae Office reading card not usable at desktop width");
  assert.ok(state.header.right<=1441,"Tenebrae Office header overflows desktop");
  report.tenebrae.push({hour,...state});
  await office.locator("#aoPray435930 .aoTenebBody").screenshot({
   path:resolve(out,"tenebrae-"+hour.toLowerCase()+"-1440.png"),animations:"disabled"});
 }
 assert.deepEqual(officeErrors,[],"Tenebrae desktop browser errors");
 await office.close();
 await context.close();
 await writeFile(resolve(out,"desktop-reader-layout-report.json"),JSON.stringify(report,null,2));
 console.log("PASS liturgical desktop 1440px: Mass, four annexed rites, Good Friday, Easter Vigil LIVE/MISSAL and Tenebrae Matins/Lauds; source text, progress, no arrows, no overflow");
}catch(error){
 report.errors.push(String(error?.stack??error));
 await writeFile(resolve(out,"desktop-reader-layout-report.json"),JSON.stringify(report,null,2));
 throw error;
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}