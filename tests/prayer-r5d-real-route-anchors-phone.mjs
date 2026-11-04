import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dest=resolve(root,"artifacts/prayer-r5d-real-route-anchors");
await mkdir(dest,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".jpg":"image/jpeg",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const full=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(full!==root&&!full.startsWith(root+sep)){res.writeHead(403);return res.end("Denied")}
  const data=await readFile(full);
  res.writeHead(200,{"content-type":mime[extname(full)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
const report={schema:"AO_PRAYER_R5D_15_REAL_OWNER_ANCHORS_PHONE_V1",
 realOwnerChecks:0,knownStaticOwnerChecks:3,publicationAuthorized:false,
 photoBrowserApproval:false,records:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const context=await browser.newContext({viewport:{width,height:width===320?700:844},
   locale:language==="fr"?"fr-FR":"en-GB",isMobile:true,hasTouch:true,
   reducedMotion:"reduce",serviceWorkers:"block"});
  const page=await context.newPage();
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoPrayerPilot=1",
     {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_PRAY_APP_V1?.status?.().installed===true,
     null,{timeout:45000});
   await page.evaluate(async(lang)=>{
     const r=await import("/src/pray/canonical-data.js");
     // Settings controls remain the real language owner; no text mutation.
     return Boolean(r);
   },language);
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(lang=>document.documentElement.lang===lang,language,{timeout:12000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   const open=async id=>{
     assert.equal(await page.evaluate(route=>globalThis.AO_PRAY_V435930.open(route,{returnContext:null}),id),true,id);
   };
   const verify=async(slot,owner,route)=>{
     const selector='#aoPray435930.open [data-ao-prayer-photo-pending="'+slot+'"]';
     const anchor=page.locator(selector);
     await anchor.waitFor({state:"attached",timeout:9000});
     assert.equal(await anchor.count(),1,slot+" cannot have duplicate anchors");
     const e=await anchor.evaluate(el=>({
       owner:el.getAttribute("data-ao-prayer-photo-owner"),
       hidden:el.hidden,state:el.getAttribute("data-ao-photo-publication"),
       inside:!!el.closest("#aoPray435930.open"),
       overflow:Math.max(0,document.documentElement.scrollWidth-innerWidth),
       releasedImageCount:el.querySelectorAll("img").length
     }));
     assert.equal(e.hidden,true,slot);
     assert.equal(e.owner,owner,slot);
     assert.equal(e.inside,true,slot);
     assert.equal(e.state,"pending",slot);
     assert.equal(e.releasedImageCount,0,slot);
     assert.ok(e.overflow<=2,route+" overflow "+e.overflow);
     report.realOwnerChecks++;
     report.records.push({slot,owner,route,width,language,...e});
   };
   await open("pray.five_wounds");
   for(const [group,id] of [[1,"02"],[2,"03"]]){
     await page.locator('#aoPray435930.open [data-p435930-five-wound="'+group+'"]').first().click();
     await verify("STG-pray.five_wounds-"+id,"five-wounds-group","pray.five_wounds");
   }
   await open("pray.precious_blood");
   for(const [step,id] of [[1,"02"],[3,"04"]]){
     await page.locator('#aoPray435930.open [data-p435930-blood-mystery="'+step+'"]').first().click();
     await verify("STG-pray.precious_blood-"+id,"precious-blood-mystery","pray.precious_blood");
   }
   await open("pray.st_joseph_seven_sorrows");
   for(const [step,id] of [[1,"02"],[3,"04"]]){
     await page.locator('#aoPray435930.open [data-p435930-joseph-step="'+step+'"]').click();
     await verify("STG-pray.st_joseph_seven_sorrows-"+id,"joseph-sorrow-and-joy","pray.st_joseph_seven_sorrows");
     assert.equal(await page.locator("#aoPray435930.open [data-ao-joseph-canonical]").count(),3,
       "Historical St Joseph prayer sequence must remain intact");
   }
   await open("pray.stations");
   await verify("COV-pray.stations","stations-entry","pray.stations");
   await open("pray.benediction");
   const altar='#aoPray435930.open .aoClaudeAltarCard';
   await page.locator(altar).waitFor({state:"attached",timeout:15000});
   await page.locator('#aoPray435930.open .aoClaudeRiteRail [data-p435930-ben-step="2"]').click();
   await verify("STG-pray.benediction-02","benediction-hymn-author","pray.benediction");
   assert.equal(await page.locator('#aoPray435930.open [data-ao-altar-moment="hymn"]').count(),1);
   await open("pray.seven_words");
   for(const [step,id] of [[0,"01"],[1,"02"],[3,"04"],[4,"05"]]){
     if(step!==0){
       const stop=page.locator('#aoPray435930.open .aoDevoStops [data-ao-devo-chapter="'+step+'"]');
       await stop.waitFor({state:"attached",timeout:12000});
       await stop.click();
     }
     await verify("STG-pray.seven_words-"+id,"seven-words-word","pray.seven_words");
   }
   assert.deepEqual(errors,[],"Unhandled source-reader errors: "+errors.join("; "));
   await page.screenshot({path:resolve(dest,"anchors-"+width+"-"+language+".png"),animations:"disabled"});
  }finally{await context.close()}
 }
 assert.equal(report.realOwnerChecks,48); // 12 owner checks × 320/390 × EN/FR
 await writeFile(resolve(dest,"report.json"),JSON.stringify(report,null,2)+"\n");
 console.log("PASS 48 exact stage-owner checks on actual Prayer UI, EN/FR × 320/390. Images unreleased.");
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
