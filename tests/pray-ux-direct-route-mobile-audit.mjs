import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {INTERNAL_PRAYER_VIEWS,supportedDirectPrayerRoute} from "../src/pray/internal-route-owner.js";

/*
 * One finite Prayer direct-entry regression gate. This owns neither liturgical
 * editions nor contents: existing source/editorial and per-reader tests retain
 * those contracts. A delegated Rosary reader is verified by its own gate.
 */
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dest=resolve(root,"artifacts/pray-ux-unified");
await mkdir(dest,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".png":"image/png",".svg":"image/svg+xml",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});

const routes=Object.entries(INTERNAL_PRAYER_VIEWS);
assert.equal(routes.length,27,"Maintain an explicitly reviewed internal route inventory");
assert.equal(new Set(routes.map(x=>x[0])).size,routes.length);
assert.ok(supportedDirectPrayerRoute("pray.rosary"),"The Rosary must keep its delegated bead owner");
assert.equal(supportedDirectPrayerRoute("pray.unknown"),false,"Unsupported routes must fail closed");
assert.ok(routes.every(([route])=>supportedDirectPrayerRoute(route)));
const capture=new Set([
 "pray.hub","pray.angelus_regina","pray.divine_mercy",
 "pray.five_wounds","pray.precious_blood","pray.little_crown",
 "pray.confession","pray.benediction","pray.adoration",
 "pray.library","pray.litany_saints","pray.tenebrae",
 "programme.first_friday"
]);
const report={checkedAt:new Date().toISOString(),routeCount:routes.length,delegatedRosary:true,widths:[],screens:[],exceptions:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?700:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:50000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   for(const [route,view] of routes){
    const opened=await page.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),route);
    assert.equal(opened,true,route+" must enter its source-owned Prayer view");
    const row=await page.evaluate(()=>{
     const shell=document.querySelector("#aoPray435930.open");
     const mount=shell?.querySelector(".aoP435930Mount");
     const main=mount?.querySelector("main.aoP435930Body");
     const title=shell?.querySelector("#aoP435930Title");
     const reader=main?.querySelector(".aoDevoCardScroll");
     const source=main?.querySelector("details.aoP435930Source,details.aoPreciousBloodProvenance,details.aoFiveWoundsSource");
     const paragraph=reader?.querySelector("p")||main?.querySelector("p");
     const font=paragraph?parseFloat(getComputedStyle(paragraph).fontSize):null;
     return {
      view:mount?.dataset.aoPrayView||"",
      title:title?.textContent?.trim()||"",
      hasMain:!!main,
      chars:(main?.textContent||"").trim().length,
      bodyOverflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      mountOverflow:mount?Math.max(0,mount.scrollWidth-mount.clientWidth):0,
      font,
      sourceClosed:source?source.open===false:null,
      focusable:main?.querySelectorAll('button:not([disabled]),a[href],summary').length||0,
      singleOwner:main?.querySelectorAll('[data-ao-devotional-owner]').length||0
     };
    });
    report.screens.push({width,route,...row});
    assert.equal(row.view,view,route+" must resolve to the expected canonical reader");
    assert.ok(row.hasMain&&row.title&&row.chars>0,route+" must expose visible main content and a heading");
    assert.ok(row.bodyOverflow<=1,route+" clips the phone document by "+row.bodyOverflow+"px at "+width);
    assert.ok(row.singleOwner<=1,route+" has multiple competing devotional owners");
    if(route==="pray.litany_saints"){
     const selector=await page.evaluate(()=>{
      const buttons=[...document.querySelectorAll("#aoPray435930.open .aoBatch03LitanyUses button")];
      return buttons.map(b=>({height:b.getBoundingClientRect().height,
       background:getComputedStyle(b).backgroundColor,color:getComputedStyle(b).color}));
     });
     assert.equal(selector.length,4,"Keep four distinct private/public Litany editions");
     assert.ok(selector.every(x=>x.height>=60),"Litany edition choices need 60px accessible mobile controls");
     assert.ok(selector.every(x=>!/rgb\\(2(?:3\\d|4\\d|5\\d),\\s*2(?:3\\d|4\\d|5\\d),\\s*2(?:3\\d|4\\d|5\\d)\\)/.test(x.background)),
      "Litany source choices should not retain light native button backgrounds");
    }
    if(route==="pray.little_crown"){
     const prayer=await page.evaluate(()=>{
      const el=document.querySelector("#aoPray435930.open .aoLittleCrownPrayerText");
      const r=el?.getBoundingClientRect();
      const visibleEnd=innerHeight-65;
      return {top:r?.top,bottom:r?.bottom,visibleHeight:r?Math.max(0,Math.min(r.bottom,visibleEnd)-Math.max(0,r.top)):0,
       font:el?parseFloat(getComputedStyle(el).fontSize):0};
     });
     assert.ok(prayer.visibleHeight>=22&&prayer.font>=19,
      "Little Crown must show actual 19px+ source prayer on the 320/390 opening screen: "+JSON.stringify(prayer));
    }
    if(capture.has(route)){
     const file="route-"+route.replace(/[^a-z0-9]+/gi,"-")+"-"+width+".png";
     await page.screenshot({path:resolve(dest,file),animations:"disabled"});
    }
   }
   report.widths.push(width);
   // Existing long-form chapters have their own dedicated EN/FR tests.
   // This audit prevents loss of access/ownership and gross mobile overflow
   // across every *supported* route, not just the visually curated ones.
   assert.deepEqual(errors,[],"Uncaught Prayer errors at "+width+": "+errors.join("; "));
   console.log("PASS "+width+"px: "+routes.length+" canonical Prayer internal entries, delegated Rosary contract.");
  }finally{await page.close()}
 }
 await writeFile(resolve(dest,"route-screening.json"),JSON.stringify(report,null,2)+"\n");
 console.log("PASS all 54 direct-entry phone checks. Report: artifacts/pray-ux-unified/route-screening.json");
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
