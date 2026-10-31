// Real Playwright acceptance: source-backed TLM venue -> preview -> church profile.
// Only the existing Explore surface. No test-only venue, image or fabricated status.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/explore-tlm-church-card");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  const bytes=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok);});
const origin="http://127.0.0.1:"+server.address().port;
let browser;const measurements=[];
try{
 browser=await chromium.launch({headless:true});
 for(const {width,height,language} of [
  {width:320,height:700,language:"en"},
  {width:390,height:844,language:"fr"},
  {width:1440,height:960,language:"en"},
 ]){
  const mobile=width<700,context=await browser.newContext({
   viewport:{width,height},deviceScaleFactor:mobile?2:1,isMobile:mobile,hasTouch:mobile,
   locale:language==="fr"?"fr-FR":"en-GB",reducedMotion:"reduce"
  });
  const page=await context.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  const captures=async suffix=>page.screenshot({
   path:resolve(out,width+"-"+language+"-"+suffix+".png"),animations:"disabled",fullPage:false
  });
  try{
   await page.goto(origin+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.locator('[data-ao-app-surface="find"]').waitFor({state:"visible",timeout:30000});
   await page.locator('[data-ao-app-surface="find"]').click();
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().loadState==="ready"&&
    !!document.querySelector(".aoHeritageMassShortcut"),null,{timeout:60000});
   if(language==="fr"){
    await page.evaluate(async()=>{
     globalThis.AO_RUNTIME_V8.store.dispatch({type:"set-language",language:"fr"});
     await globalThis.AO_FIND_APP_V1.paint();
    });
   }
   await page.locator(".aoHeritageMassShortcut").click();
   // The state changes to TLM before the async 2,582-record directory render
   // finishes. Wait for the actual new lens DOM before selecting List; counting
   // buttons on the old Heritage DOM silently skips the view transition.
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="tlm",null,{timeout:25000});
   await page.locator('.aoFindBody[data-explore-lens="tlm"]').waitFor({state:"visible",timeout:60000});
   const list=page.locator('[data-find-filter="view"][data-find-filter-value="list"]');
   assert.equal(await list.count(),1,"TLM view must expose a real List control");
   await list.click();
   // The view toggle repaints asynchronously. Never type into a retiring
   // map search input: its input event can be superseded by list rendering.
   await page.locator('.aoFindBody[data-find-view="list"][data-explore-lens="tlm"]').waitFor({state:"visible",timeout:30000});
   await page.locator(".aoTlmVenueCard").first().waitFor({state:"visible",timeout:20000});
   // Test the compact secondary community menu on real touch-width layouts.
   // It must expose exact community filters without clipping or raw registry codes.
   const more=page.locator(".aoTlmMoreInstitutes");
   assert.equal(await more.count(),1,"Additional source communities need a compact disclosure");
   await more.locator("summary").click();
   const cantiusFilter=more.locator('[data-find-affiliation="CANONS_ST_JOHN_CANTIUS"]');
   await cantiusFilter.waitFor({state:"visible",timeout:12000});
   assert.match(await cantiusFilter.innerText(),
     language==="fr"?/Chanoines de Saint-Jean-de-Cantius/:/Canons of St John Cantius/);
   const menuBounds=await more.locator(".aoFindAffiliations").evaluate(el=>{
     const bounds=el.getBoundingClientRect();
     return {left:bounds.left,right:bounds.right,width:innerWidth,
       height:bounds.height,overflow:el.scrollWidth-el.clientWidth};
   });
   assert.ok(menuBounds.left>=-2&&menuBounds.right<=width+2,
     "Community menu must fit the phone viewport: "+JSON.stringify(menuBounds));
   assert.ok(menuBounds.overflow<=2,"Community filters must wrap instead of scrolling horizontally");
   await more.locator("summary").click();
   const search=page.locator("#ao-find-modular-root [data-find-query]");
   await search.fill("Cantius");
   // An institute-affiliation search may return other churches served by
   // the Canons (e.g. Sacred Heart, Springfield). The approved visual reference
   // is the physical St John Cantius Church in Chicago, source V19:SJC-001.
   // Select its stable R49 identity, not the first affiliation match.
   const exact=page.locator('.aoTlmVenueCard[data-explore-item="tlm:r49:V19:SJC-001"]');
   try{
    await page.waitForFunction(()=>{
     const root=document.querySelector("#ao-find-modular-root");
     return root?.querySelector("[data-find-query]")?.value==="Cantius"&&
      !!root?.querySelector('.aoTlmVenueCard[data-explore-item="tlm:r49:V19:SJC-001"]');
    },null,{timeout:15000});
    await exact.waitFor({state:"visible"});
   }
   catch(error){
    console.error("Church search diagnostic:",await page.evaluate(()=>({
     status:globalThis.AO_FIND_APP_V1?.status?.(),
     query:document.querySelector("#ao-find-modular-root [data-find-query]")?.value,
     results:document.querySelector("#ao-find-modular-root .aoFindResultMeta")?.textContent,
     view:document.querySelector("#ao-find-modular-root .aoFindBody")?.dataset?.findView,
     visible:document.querySelector("#ao-find-modular-root .aoFindList")?.textContent?.slice(0,250)
    })));
    throw error;
   }
   const title=await exact.innerText();
   assert.match(title,/St\.? John Cantius Church/i,"Search must find the exact Chicago church, not an affiliated venue");
   const approvedPhoto=exact.locator(".aoTlmVenueVisual > img");
   assert.equal(await approvedPhoto.count(),1,
    "Exact Chicago church must display its approved Place photograph, not an affiliation emblem");
   assert.match(await approvedPhoto.getAttribute("src"),/assets\/approved\/place-media\/US-st-john-cantius-chicago\.webp$/);
   await exact.click();
   const preview=page.locator(".aoExploreQuickPreview");
   await preview.waitFor({state:"visible",timeout:12000});
   assert.equal(await preview.locator('[data-explore-expand-detail]').count(),1);
   assert.match(await preview.innerText(),/St\.? John Cantius Church/i);
   await captures("01-preview");
   await preview.locator('[data-explore-expand-detail]').click();
   const expanded=page.locator(".aoTlmChurchProfile");
   await expanded.waitFor({state:"visible",timeout:12000});
   assert.match(await expanded.locator("h2").innerText(),/St\.? John Cantius Church/i);
   assert.equal(await expanded.locator(".aoTlmProfileSpotlight").count(),1);
   assert.equal(await expanded.locator(".aoTlmProfileAffiliation").count(),1);
   assert.equal(await expanded.locator(".aoTlmProfileSourceDisclosure").count(),1);
   assert.match(await expanded.innerText(),language==="fr"?/Non établi|Sources et vérification/:/Not established|Sources & verification/);
   const metrics=await expanded.evaluate(el=>{
    const r=el.getBoundingClientRect(),spot=el.querySelector(".aoTlmProfileSpotlight")?.getBoundingClientRect();
    const nav=el.querySelector(".aoTlmProfileChrome")?.getBoundingClientRect();
    const actions=[...el.querySelectorAll(".aoTlmProfileChrome button")].map(e=>e.getBoundingClientRect().height);
    return {vw:innerWidth,vh:innerHeight,x:r.x,right:r.right,y:r.y,bottom:r.bottom,
     width:r.width,scrollWidth:el.scrollWidth,clientWidth:el.clientWidth,
     contentHeight:el.scrollHeight,spotWidth:spot?.width,navHeight:nav?.height,
     actionHeights:actions,documentOverflow:document.documentElement.scrollWidth-innerWidth,
     visualKind:el.querySelector(".aoTlmProfileMedia .aoTlmVenueIdentity")?.dataset?.visualKind??"photo"};
   });
   assert.ok(metrics.x>=-2&&metrics.right<=width+2,"Profile extends outside viewport: "+JSON.stringify(metrics));
   assert.ok(metrics.scrollWidth<=metrics.clientWidth+2,"Profile horizontally scrolls: "+JSON.stringify(metrics));
   assert.ok(metrics.documentOverflow<=2,"Page horizontally overflows: "+JSON.stringify(metrics));
   assert.ok(metrics.actionHeights.every(n=>n>=44),"Back/close tap target below 44 px");
   assert.ok(metrics.spotWidth>0&&metrics.navHeight>=44,"Profile primary hierarchy collapsed");
   assert.deepEqual(errors,[],"JS errors in real browser: "+errors.slice(0,5).join(" | "));
   await captures("02-expanded-top");
   const summary=expanded.locator(".aoTlmProfileSourceDisclosure summary");
   await summary.click();
   assert.equal(await expanded.locator(".aoTlmProfileSourceDisclosure").getAttribute("open"),"");
   assert.ok((await expanded.locator('.aoTlmProfileSourceContent a[href^="https://"]').count())>0,
    "Expanded profile must retain original source links");
   await expanded.evaluate(el=>{el.scrollTop=el.scrollHeight;});
   await captures("03-expanded-sources");
   await expanded.locator("[data-explore-collapse-detail]").click();
   await preview.waitFor({state:"visible"});
   assert.equal(await page.locator(".aoTlmChurchProfile").count(),0,"Back must restore preview");
   measurements.push({width,language,title,metrics,passed:true});
   console.log("PASS TLM source-backed preview and church profile "+width+"px "+language);
  }catch(error){
   await captures("FAIL-current-state").catch(()=>{});
   measurements.push({width,language,passed:false,error:String(error.stack||error)});
   throw error;
  }finally{await context.close();}
 }
}finally{
 await writeFile(resolve(out,"metrics.json"),JSON.stringify(measurements,null,2)+"\n");
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
