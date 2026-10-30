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
   await page.waitForFunction(()=>globalThis.AO_FIND_APP_V1?.status?.().lens==="tlm",null,{timeout:25000});
   const list=page.locator('[data-find-filter="view"][data-find-filter-value="list"]');
   if(await list.count())await list.click();
   // The view toggle repaints asynchronously. Never type into a retiring
   // map search input: its input event can be superseded by list rendering.
   await page.locator('.aoFindBody[data-find-view="list"]').waitFor({state:"visible",timeout:20000});
   await page.locator(".aoTlmVenueCard").first().waitFor({state:"visible",timeout:20000});
   const search=page.locator("#ao-find-modular-root [data-find-query]");
   await search.fill("Cantius");
   const cards=page.locator(".aoTlmVenueCard");
   try{await cards.first().waitFor({state:"visible",timeout:15000});}
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
   const title=await cards.first().innerText();
   assert.match(title,/Cantius/i,"Search must find an existing St John Cantius listing");
   await cards.first().click();
   const preview=page.locator(".aoExploreQuickPreview");
   await preview.waitFor({state:"visible",timeout:12000});
   assert.equal(await preview.locator('[data-explore-expand-detail]').count(),1);
   assert.match(await preview.innerText(),/Canons of St John Cantius|Cantius/i);
   await captures("01-preview");
   await preview.locator('[data-explore-expand-detail]').click();
   const expanded=page.locator(".aoTlmChurchProfile");
   await expanded.waitFor({state:"visible",timeout:12000});
   assert.match(await expanded.locator("h2").innerText(),/Cantius/i);
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
