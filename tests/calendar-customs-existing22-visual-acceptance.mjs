// Browser-only acceptance: source-bounded Customs variants live inside published Calendar articles
// in explicit editorial preview, never as new day events or canonical Customs.
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/calendar-customs-existing22-preview");
await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const u=new URL(req.url,"http://127.0.0.1");
  const p=resolve(root,"."+decodeURIComponent(u.pathname));
  if(p!==root&&!p.startsWith(root+sep)){res.writeHead(403);res.end("Forbidden");return;}
  res.writeHead(200,{"content-type":mime[extname(p)]||"application/octet-stream","cache-control":"no-store"});
  res.end(await readFile(p));
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const base="http://127.0.0.1:"+server.address().port;
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  for(const review of [false,true]){
   const page=await browser.newPage({viewport:{width,height:width===320?740:844},
    isMobile:true,hasTouch:true,deviceScaleFactor:1,reducedMotion:"reduce"});
   const errors=[];
   page.on("pageerror",e=>errors.push(String(e?.message||e)));
   try{
    await page.goto(base+"/index.html?aoR17Reader=native"+(review?"&customsVariantsReview=1":""),
      {waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.status?.().visibleOwner===true,
      null,{timeout:45000});
    const opened=await page.evaluate(async()=>{
     const {installCalendarBrowserOwner}=await import("/src/calendar/calendar-runtime.js");
     return installCalendarBrowserOwner(globalThis).open();
    });
    assert.equal(opened,true,"Calendar must open through its actual owner");
    const cal=page.locator("#ao-calendar-modular-root");
    await cal.locator(".aoCalCustomCatalogue").waitFor({state:"visible",timeout:60000});
    await cal.locator(".aoCalCustomCatalogue > summary").click();
    const parent=cal.locator('[data-cal-custom-id="ADVT-001"]');
    assert.equal(await parent.count(),1,"The existing Advent wreath article must remain one canonical card");
    await parent.locator(":scope > summary").click();
    const variant=cal.locator('[data-cal-custom-variant="AO-CUST-VAR-003"]');
    const count=await variant.count();
    assert.equal(count,review?1:0,"Variant should be visible only with explicit editorial preview flag");
    if(review){
      assert.equal(await cal.locator('[data-cal-customs-variants-preview="ADVT-001"]').count(),1);
      assert.match(await variant.textContent(),/John or Joan/);
      await variant.locator("summary").click();
      assert.match(await variant.textContent(),/1958|Weiser|Advent/);
      const source=variant.locator('a[href^="https://www.fisheaters.com/srpdf/"]');
      assert.equal(await source.count(),1,"A source link must accompany historical variant");
      assert.ok((await source.getAttribute("href")).endsWith(".pdf"));
    }
    const dimensions=await page.evaluate(()=>{
     const el=document.querySelector("#ao-calendar-modular-root");
     return {width:innerWidth,documentScroll:document.documentElement.scrollWidth,
      articleScroll:el?.scrollWidth,articleClient:el?.clientWidth,
      canonicalArticles:el?.querySelectorAll("[data-cal-custom-id]").length};
    });
    assert.equal(dimensions.canonicalArticles,35,"No extra published article card");
    assert.ok(dimensions.articleScroll<=dimensions.articleClient+2,
      "Calendar horizontal overflow at "+width+": "+JSON.stringify(dimensions));
    assert.ok(errors.length===0,"Browser errors: "+errors.join(" | "));
    await parent.scrollIntoViewIfNeeded();
    await page.screenshot({path:resolve(output,`calendar-customs-${review?"review":"default"}-en-${width}.png`),
      fullPage:false,animations:"disabled"});
    console.log("PASS browser Calendar Customs: "+width+"px, "+(review?"review":"ordinary")+
      ", published=35, variant="+count+", no Calendar overflow");
   }finally{await page.close();}
  }
 }
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
