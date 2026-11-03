import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-ritual-folio-r4");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const bytes=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream","cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});

let browser;
const prefix="#aoPray435930.open ";
const cases=[
 {route:"pray.stations",selector:".aoP435930Stations .aoDevoCardScroll"},
 {route:"pray.seven_words",selector:'[data-ao-devotional-owner="sevenWords"] .aoDevoCardScroll'},
 {route:"pray.benediction",selector:'[data-ao-rite-owner="benediction"] .aoClaudeAltarScroll'},
 {route:"pray.forty_hours",choose:'[data-p435930-forty-mode="visitor"]',selector:'[data-ao-rite-owner="forty-hours-visitor"] .aoDevoCardScroll'},
 {route:"pray.visit_blessed_sacrament",choose:'[data-p435930-ador-mode="visit"]',selector:'[data-ao-adoration-folio="v1"] .aoDevoCardScroll'}
];
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const errors=[];page.on("pageerror",err=>errors.push(err.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:20000});
   assert.equal(await page.locator("#ao-prayer-ritual-folio-r4").count(),1,"R4 ritual folio styles not installed");
   for(const item of cases){
    const ok=await page.evaluate(route=>globalThis.AO_PRAY_V435930.open(route,{returnContext:null}),item.route);
    assert.equal(ok,true,"Cannot open source-owned route "+item.route);
    if(item.choose)await page.locator(prefix+item.choose).first().click();
    const target=page.locator(prefix+item.selector).first();
    await target.waitFor({state:"visible",timeout:15000});
    const metrics=await target.evaluate(el=>{
     const style=getComputedStyle(el),rect=el.getBoundingClientRect(),mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
     return {overflow:style.overflowY,maxHeight:style.maxHeight,
      height:rect.height,scrollHeight:el.scrollHeight,clientHeight:el.clientHeight,
      prayerText:el.innerText.trim().length,
      documentOverflow:document.documentElement.scrollWidth-innerWidth,
      mountOverflow:(mount?.scrollWidth??0)-(mount?.clientWidth??0)};
    });
    assert.equal(metrics.overflow,"auto","Source-owned local focus scroll was altered: "+item.route+" "+JSON.stringify(metrics));
    assert.ok(metrics.height>=60&&metrics.clientHeight>=60,"Source reader lost its content viewport: "+item.route);
    assert.ok(metrics.prayerText>=35,"Source prayer unreadable: "+item.route);
    assert.ok(metrics.scrollHeight>0,"No readable prayer surface: "+item.route);
    assert.ok(metrics.documentOverflow<=2&&metrics.mountOverflow<=2,"Horizontal overflow: "+item.route+" "+JSON.stringify(metrics));
    if(item.route==="pray.stations"||item.route==="pray.benediction"){
     await page.screenshot({path:resolve(output,item.route.replace("pray.","")+"-"+width+".png"),animations:"disabled"});
    }
    console.log("PASS R4 "+width+" "+item.route+" "+JSON.stringify(metrics));
   }
   for(const [route,selector] of [
    ["programme.first_friday",'[data-ao-programme-owner="first-friday"]'],
    ["programme.first_saturday",'[data-ao-programme-owner="first-saturday"]']
   ]){
    assert.equal(await page.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),route),true);
    await page.locator(prefix+selector).waitFor({state:"visible",timeout:12000});
    assert.ok((await page.locator(prefix+selector).innerText()).length>50,"Programme text or date was lost: "+route);
   }
   // Office and Angelus continue to use their existing source-owned presentation,
   // without new stage controls or fabricated historical prayer texts.
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.angelus_regina",{returnContext:null})),true);
   await page.locator(prefix+"[data-ao-ritual-reader=angelus]").waitFor({state:"visible",timeout:12000});
   assert.equal(await page.locator(prefix+" .aoP435930PrayerUnit").count()>0,true);
   assert.deepEqual(errors,[],"Browser Prayer errors at "+width+"px");
  }finally{await page.close()}
 }
 console.log("PASS R4: five source-owned ritual focus readers, visible monthly date validation and untouched Angelus");
}finally{if(browser)await browser.close();await new Promise(resolve=>server.close(resolve))}
