import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {calendarCustomArticle} from "../src/calendar/customs-read-model.js";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const capture=resolve(root,"artifacts/customs-living-library");
await mkdir(capture,{recursive:true});
const mime={".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8"};
const server=http.createServer(async(req,res)=>{
  try{
    const path=new URL(req.url,"http://127.0.0.1").pathname;
    if(path==="/customs-test"){
      res.writeHead(200,{"content-type":"text/html; charset=utf-8","cache-control":"no-store"});
      return res.end('<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body></body></html>');
    }
    const requested=resolve(root,"."+decodeURIComponent(path));
    if(requested!==root&&!requested.startsWith(root+sep)){res.writeHead(403);return res.end("forbidden");}
    res.writeHead(200,{"content-type":mime[extname(requested)]||"application/octet-stream","cache-control":"no-store"});
    res.end(await readFile(requested));
  }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error?.message||error));}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
const base="http://127.0.0.1:"+server.address().port;
const metrics=[];
let browser;
try{
  browser=await chromium.launch({headless:true});
  for(const {width,language} of [{width:320,language:"fr"},{width:390,language:"en"},{width:768,language:"fr"}]){
    const page=await browser.newPage({viewport:{width,height:800},locale:language==="fr"?"fr-FR":"en-GB",isMobile:width<600,hasTouch:width<600});
    const errors=[];page.on("pageerror",e=>errors.push(e.message));
    await page.goto(base+"/customs-test",{waitUntil:"domcontentloaded"});
    const response=await page.evaluate(async lang=>{
      document.documentElement.lang=lang;
      globalThis.AO_RUNTIME_V8={store:{getState:()=>({language:document.documentElement.lang})}};
      const {installCustomsBrowserOwner}=await import("/src/customs/customs-browser.js");
      const api=installCustomsBrowserOwner(globalThis);
      const opened=await api.open({view:"year"});
      return {opened,...api.status};
    },language);
    assert.equal(response.opened,true,"Customs owner must open from standalone route");
    assert.equal(response.canonical,40);
    assert.equal(response.research,568);
    const rootLocator=page.locator("#ao-customs-library-root");
    await rootLocator.waitFor({state:"visible"});
    assert.equal(await page.locator('[data-cust-id]').count(),28,"year partition includes the 26 legacy and two new dated customs");
    assert.equal(await page.locator('[data-cust-view="year"][aria-current="page"]').count(),1);
    const geometry=await rootLocator.evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,viewport:innerWidth,buttons:[...el.querySelectorAll("button")].filter(b=>b.getBoundingClientRect().height<43).map(b=>b.outerHTML.slice(0,100))}));
    assert.ok(geometry.scrollWidth<=geometry.width+3&&geometry.width<=geometry.viewport+3,"horizontal overflow in "+language+" "+width+": "+JSON.stringify(geometry));
    assert.equal(geometry.buttons.length,0,"undersized tap targets in "+language+" "+width+": "+JSON.stringify(geometry.buttons));
    await page.screenshot({path:resolve(capture,"year-"+language+"-"+width+".png"),fullPage:false});
    await page.locator('[data-cust-view="life"]').click();
    assert.equal(await page.locator('[data-cust-id]').count(),12,"all undated and life customs must be accessible");
    await page.locator('[data-cust-id="BELL-004"]').click();
    assert.match(await rootLocator.textContent(),/CONTEXT|Contexte|contextuel|historiqu/i,"context-only record warning must be visible");
    await page.locator("[data-cust-back]").click();
    await page.locator('[data-cust-view="all"]').click();
    assert.equal(await page.locator('[data-cust-id]').count(),40,"complete canonical collection contains 40 identities");
    await page.locator('[data-cust-id="BLSS-002"]').click();
    const details=await rootLocator.textContent();
    assert.ok(details.includes(language==="fr"?"Assomption : bénédiction des herbes":"Assumption — blessing of herbs"),"language-specific title missing");
    assert.ok(details.includes(calendarCustomArticle("BLSS-002").caution[language]),"published pastoral qualification missing or stale in "+language);
    assert.ok(await page.locator(".aoCustArticle a[href^='https://']").count()>=1,"canonical source links missing");
    const historical=page.locator(".aoCustHistorical");
    assert.equal(await historical.count(),1,"Assumption historical witness missing");
    assert.match(await historical.textContent(),language==="fr"?/régions germaniques/i:/Germanic regions/i,
      "historical account not localized or not attributed");
    assert.ok(await page.locator(".aoCustHistorical a[href^='https://']").count()>=1,
      "historical witness lacks independently inspectable source links");
    if(language==="fr")assert.ok(!(await rootLocator.textContent()).includes("15 August, Assumption"),
      "French article retained its English-only calendar hint");
    await page.screenshot({path:resolve(capture,"assumption-"+language+"-"+width+".png"),fullPage:false});
    await page.locator("[data-cust-back]").click();
    await page.locator("[data-cust-archive]").click();
    await page.locator("[data-cust-triage]").selectOption("EXCLUDE");
    assert.equal(await page.locator("[data-cust-research]").count(),34,"all 34 protected research exclusions must remain accessible");
    await page.locator("[data-cust-research]").first().click();
    assert.match(await rootLocator.textContent(),/RESEARCH|recherche|historique/i,"excluded research must not look like an approved custom");
    await page.locator("[data-cust-back]").click();
    await page.locator("[data-cust-triage]").selectOption("");
    assert.equal(await page.locator("[data-cust-research]").count(),60,"archive pagination must not drop source observations");
    await page.locator("[data-cust-more]").click();
    assert.equal(await page.locator("[data-cust-research]").count(),120);
    await page.screenshot({path:resolve(capture,"archive-"+language+"-"+width+".png"),fullPage:false});
    assert.deepEqual(errors,[],"unhandled client-side errors");
    await page.locator("[data-cust-close]").click();
    assert.equal(await rootLocator.count(),0,"closing the module should restore the calling interface");
    metrics.push({width,language,year:28,life:12,canonical:40,research:568,excluded:34,archivePage:120,overflow:false});
    await page.close();
  }
  await writeFile(resolve(capture,"metrics.json"),JSON.stringify(metrics,null,2));
  console.log("PASS first-class Customs phone EN/FR: 40 canonical, 568 research, 28/12 partition, 34 exclusions, sources, tap targets and no overflow.");
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
