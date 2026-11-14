import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {CHURCH_NOVENA_IDS} from "../src/pray/church-novena-ids.v1.js";

// Runs against the real served Ad Orientem app + production AO_NOVENAS_V3
// browser runtime. The 3D Church is still a separate review prototype:
// only its return-to-gallery callback contract is simulated here.
const repo=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(repo,"artifacts/pray-church-novena-integrated");
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".css":"text/css; charset=utf-8",".json":"application/json; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",
 ".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(repo,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==repo&&!file.startsWith(repo+sep)){res.writeHead(403);return res.end("Forbidden")}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream",
   "cache-control":"no-store"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
const report={schema:"ad-orientem.church-novena.r9.browser.v1",
 boundary:"REAL_PRODUCTION_NOVENA_READER;CHURCH_GALLERY_CALLBACK_SIMULATED;NOT_HOSTED_3D_CHURCH",
 test:"19 canonical routes, two mobile widths, two languages, real nine-day controls and Back closure",
 expected:19*2*2,passed:[],failures:[],screenshots:[]};
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const lang of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   isMobile:true,hasTouch:true,deviceScaleFactor:1,serviceWorkers:"block",
   reducedMotion:"reduce",locale:lang==="fr"?"fr-FR":"en-GB"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e?.message||e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.navigate&&
    globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings"))).ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+lang+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,lang,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray"))).ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.openChurchNovenaRoute==="function"&&
    typeof globalThis.AO_NOVENAS_V3?.open==="function",null,{timeout:30000});
   await page.evaluate(()=>{window.__churchR9={returns:[]}});

   const invalid=await page.evaluate(()=>window.AO_PRAY_APP_V1.openChurchNovenaRoute("novena:not_registered"));
   assert.deepEqual(invalid.reason,"UNKNOWN_NOVENA_ROUTE");
   for(const id of CHURCH_NOVENA_IDS){
    const start=await page.evaluate(async id=>{
     const context={gallery:"votive-candles",camera:{x:3.25,z:9.5},selected:"novena:"+id};
     const result=await window.AO_PRAY_APP_V1.openChurchNovenaRoute("novena:"+id,{
      novenaDay:1,returnContext:context,
      returnToChurch:receipt=>{window.__churchR9.returns.push(receipt);return true}
     });
     const state=window.AO_NOVENAS_V3?.state?.();
     return{result,state,language:document.documentElement.lang,
      dayButtons:document.querySelectorAll("#aoPray435930.open .aoN1DetailFolio [data-n1-day]").length,
      detail:document.querySelectorAll("#aoPray435930.open .aoN1DetailFolio").length};
    },id);
    assert.equal(start.result?.ok,true,id+" real reader refused");
    assert.equal(start.result?.id,id);
    assert.equal(start.state?.id,id,id+" opened a different programme");
    assert.equal(start.state?.screen,"day",id+" direct day entry was lost");
    assert.equal(start.state?.day,1,id+" direct day did not open day 1");
    assert.equal(start.language,lang,id+" UI language changed");
    assert.equal(await page.locator("#aoPray435930.open .aoN1Reader").count(),1,
     id+" real novena reader not rendered");
    const dayNine=await page.evaluate(()=>{
     const wrap=document.querySelector("#aoPray435930.open .aoN1Reader");
     const dis=wrap?.querySelector(".aoN1DayDisclosure");if(dis)dis.open=true;
     const button=wrap?.querySelector('[data-n1-day="9"]');if(!button)return null;
     button.click();
     const state=window.AO_NOVENAS_V3.state();
     const card=document.querySelector("#aoPray435930.open .aoN1Reader .aoDevoCardScroll");
     return{day:state.day,mode:state.mode,screen:state.screen,
      stage:state.stage,body:(card?.innerText||"").trim().length,
      width:document.documentElement.scrollWidth-innerWidth};
    });
    assert.equal(dayNine?.day,9,id+" day-nine control failed");
    assert.equal(dayNine?.screen,"day",id+" wrong screen after day-nine selection");
    assert.ok(dayNine?.body>20,id+" day nine card is blank");
    assert.ok(dayNine?.width<=2,id+" document overflow at "+width+"px");
    // This is the ACTUAL reader Back control, not a mocked onCloseReturn call.
    const previousReturns=await page.evaluate(()=>window.__churchR9.returns.length);
    const restored=await page.evaluate(async previous=>{
     for(let tries=0;tries<4;tries++){
      // A return from an earlier programme does not count as this journey.
      if(window.__churchR9.returns.length>previous)return window.__churchR9.returns.at(-1);
      const b=document.querySelector('#aoPray435930.open [data-n1-back]');
      if(!b)break;
      b.click();await Promise.resolve();await new Promise(r=>setTimeout(r,0));
     }
     await Promise.resolve();await new Promise(r=>setTimeout(r,0));
     return window.__churchR9.returns.length>previous?
       window.__churchR9.returns.at(-1):null;
    },previousReturns);
    assert.equal(restored?.id,id,id+" reader Back did not reach originating Church callback");
    assert.equal(restored?.route,"novena:"+id);
    assert.equal(restored?.context?.gallery,"votive-candles");
    assert.equal(restored?.context?.selected,"novena:"+id);
    const returnCount=await page.evaluate(()=>window.__churchR9.returns.length);
    assert.equal(returnCount,previousReturns+1,
     id+" restored gallery more than once");
    assert.equal(await page.locator("#aoPray435930.open .aoN1Reader").count(),0,
     id+" stale reader remained over Church after Back");
    report.passed.push({width,lang,id,dayNine:true,backToGalleryCallback:true});
   }
   if(lang==="en"){
    const file=resolve(out,"r9-reader-"+width+".png");
    await mkdir(out,{recursive:true});
    const last=CHURCH_NOVENA_IDS.at(-1);
    await page.evaluate(id=>window.AO_PRAY_APP_V1.openChurchNovenaRoute("novena:"+id,{novenaDay:9}),last);
    await page.screenshot({path:file,fullPage:false});
    report.screenshots.push(file.replace(repo+"/",""));
   }
   assert.deepEqual(errors,[],"Browser errors at "+width+"/"+lang+": "+errors.join(" | "));
  }catch(err){report.failures.push({width,lang,error:String(err?.stack||err)});throw err}
  finally{await ctx.close()}
 }
 assert.equal(report.passed.length,report.expected);
 console.log("PASS actual production app: 19 N3 readers x 320/390 x EN/FR; day one/nine, source reader and actual Back-to-Church return callback. 3D Church UI not tested.");
}finally{
 await mkdir(out,{recursive:true});
 await writeFile(resolve(out,"r9-integrated-browser-report.json"),JSON.stringify(report,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(done=>server.close(done));
}
