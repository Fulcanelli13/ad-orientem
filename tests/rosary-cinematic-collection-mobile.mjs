import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"application/javascript",".mjs":"application/javascript",
 ".css":"text/css; charset=utf-8",".json":"application/json",".webp":"image/webp",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const p=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403).end();return}
  const body=await readFile(p);
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream",
   "cache-control":"no-store"});
  res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500).end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(4289,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true,channel:"chromium"});
 const out="reviews/captures/rosary-art-coherence";
 await mkdir(resolve(root,out),{recursive:true});
 const errors=[],collected=[];
 for(const set of ["joyful","sorrowful","glorious","luminous"]){
  // New isolated native Rosary session per set. This artwork test does not
  // rely on the unrelated legacy Change Mysteries navigation handler.
  const context=await browser.newContext({viewport:{width:390,height:844},
   deviceScaleFactor:2,isMobile:true,hasTouch:true,locale:"fr-FR",reducedMotion:"reduce"});
  const page=await context.newPage();
  page.on("pageerror",e=>errors.push(String(e)));
  await page.goto("http://127.0.0.1:4289/index.html",{waitUntil:"domcontentloaded",timeout:60000});
  await page.waitForFunction(()=>typeof window.AO_PRAY_APP_V1?.open==="function",null,{timeout:30000});
  assert.equal(await page.evaluate(async()=>window.AO_PRAY_APP_V1.open()),true);
  await page.waitForFunction(()=>typeof window.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  assert.equal(await page.evaluate(()=>window.AO_PRAY_V435930.open("pray.rosary",{returnContext:null})),true);
  const button=page.locator("#aoPrayerBookRoot.open [data-pb-rosary-set='"+set+"']").first();
  await button.waitFor({state:"visible",timeout:7000}).catch(async error=>{
    const diag=await page.evaluate((wanted)=>{
      const roots=[...document.querySelectorAll("#aoPrayerBookRoot")].map(r=>({
       classes:r.className,hidden:r.hidden,style:r.getAttribute("style"),
       area:r.getBoundingClientRect().toJSON(),hasSelection:!!r.querySelector("[data-pb-rosary-set='"+wanted+"']"),
       choices:[...r.querySelectorAll("[data-pb-rosary-set]")].map(n=>[n.dataset.pbRosarySet,n.getBoundingClientRect().height]),
       change:!!r.querySelector("[data-lab-rosary-change]")}));
      return {state:window.AO_ROSARY_V381?.state?.(),roots};
    },set);
    throw new Error("Rosary source-set change diagnostic "+JSON.stringify(diag)+"; "+String(error));
   });
  await button.evaluate(x=>x.click());
  await page.waitForFunction(n=>window.AO_ROSARY_V381?.state?.()?.set===n,set,{timeout:10000});
  await page.waitForSelector("#aoPrayerBookRoot.open .aoRosaryCinemaTimeline",{timeout:12000});
  const stops=page.locator("#aoPrayerBookRoot.open .aoRosaryCinemaStop");
  assert.equal(await stops.count(),5,"Set "+set+" has incomplete five-stage timeline");
  for(let mi=0;mi<5;mi++){
   const stop=stops.nth(mi);
   const index=Number(await stop.getAttribute("data-ao-rosary-cinema-jump"));
   await stop.evaluate(x=>x.click());
   await page.waitForFunction(n=>window.AO_ROSARY_V381?.state?.()?.step===n,index,{timeout:7500});
   await page.waitForTimeout(450);
   const entry=await page.locator("#aoPrayerBookRoot.open .aoRosaryCinema").evaluate((el,params)=>{
    const stage=el.querySelector(".aoRosaryCinemaStage");
    const img=el.querySelector(".aoRosaryCinemaImage");
    return {id:el.querySelector(".aoRosaryCinemaStop.active")?.dataset.aoRosaryCinemaId,
     set:params.set,mi:params.mi,artwork:stage?.dataset.artwork||"none",
     src:img?.getAttribute("src"),width:img?.naturalWidth,height:img?.naturalHeight,
     name:stage?.querySelector("h2")?.textContent?.trim(),
     historicalSwitchHidden:!!el.querySelector(".aoRosaryCinemaArtModes")?.hidden,
     originalCollection:el.dataset.aoArtCollection};
   },{set,mi});
   assert.ok(entry.id&&entry.src&&entry.width>60&&entry.height>60,
     "Existing Rosary illustration missing or unreadable: "+JSON.stringify(entry));
   assert.equal(entry.historicalSwitchHidden,true,
     "Antwerp art switch must remain hidden until approved 15/15 offline package");
   assert.equal(entry.originalCollection,"existing",
     "Existing artwork must remain default");
   collected.push(entry);
   if(set!=="luminous"){
    const shot=resolve(root,out,set+"-"+(mi+1)+".png");
    await page.locator("#aoPrayerBookRoot.open .aoRosaryCinema").screenshot({
      path:shot,animations:"disabled",timeout:12000
    });
   }
  }
  console.log("ART COHERENCE "+set+": "+
   collected.filter(x=>x.set===set).map(x=>x.name+" ["+x.width+"x"+x.height+"]").join(" | "));
  await context.close();
 }
 assert.equal(collected.length,20);
 assert.equal(new Set(collected.map(x=>x.id)).size,20);
 assert.ok(!errors.some(x=>/rosary-cinematic|rosary-antwerp/i.test(x)),
  "Rosary art scene caused browser runtime error: "+errors.join("; "));
 await writeFile(resolve(root,out,"existing-rosary-art-index.json"),
  JSON.stringify({version:1,viewport:"390x844 2x",caption:"Original Rosary artwork; Antwerp pack not yet enabled",
  entries:collected},null,2)+"\n","utf8");
 console.log("PASS Rosary original 15 plus optional five: 20 illustrated mysteries, no missing scene, Antwerpen unavailable while unlicensed");
}finally{await browser?.close();await new Promise(done=>server.close(done))}
