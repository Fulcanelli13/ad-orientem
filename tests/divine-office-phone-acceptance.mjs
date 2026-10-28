#!/usr/bin/env node
/**
 * Browser acceptance for real pinned Divine Office documents in the
 * research-only Mass-shaped reader. Generate them into --out first.
 *
 * Runs under CI on a local ephemeral HTTP server. No screenshots or source
 * text leave CI; outputs only geometry and pass/fail summaries.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {readFileSync,existsSync} from "node:fs";
import {resolve,join,extname,sep} from "node:path";
import {chromium} from "@playwright/test";

const args=process.argv.slice(2);
if(args.length!==2||args[0]!=="--out")throw Error("USAGE: --out /tmp/ao-office-probe");
const root=resolve(args[1]);
const locations={
  main:resolve(root,"preview/mass"),
  advent:resolve(root,"advent-vespers/preview/mass"),
};
for(const dir of Object.values(locations))
  if(!existsSync(join(dir,"preview-manifest.json")))throw Error("OFFICE_PHONE_MISSING_PREVIEW:"+dir);
const mime={".html":"text/html; charset=utf-8",".css":"text/css; charset=utf-8",".js":"text/javascript; charset=utf-8"};
let port;
const server=http.createServer((req,res)=>{
  try{
    const pathname=decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname);
    const [,bucket,...parts]=pathname.split("/");
    const base=locations[bucket];
    if(!base||parts.length!==1||!/^[-a-z0-9.]+$/.test(parts[0])){
      res.writeHead(404);res.end("not found");return;
    }
    const dest=resolve(base,parts[0]);
    if(!dest.startsWith(base+sep)){res.writeHead(403);res.end("forbidden");return;}
    const body=readFileSync(dest);
    res.writeHead(200,{
      "content-type":mime[extname(dest)]??"application/octet-stream",
      "cache-control":"no-store","x-content-type-options":"nosniff",
    });res.end(body);
  }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",()=>{port=server.address().port;ok()});});
let browser;
const cases=[
  {width:320,height:568,isMobile:true,hasTouch:true,bucket:"main",file:"2026-10-28-matins-en.html"},
  {width:390,height:844,isMobile:true,hasTouch:true,bucket:"main",file:"2026-11-01-vespers-fr.html"},
  {width:390,height:844,isMobile:true,hasTouch:true,bucket:"advent",file:"2026-11-28-vespers-en.html"},
  {width:390,height:844,isMobile:true,hasTouch:true,bucket:"advent",file:"2026-11-29-vespers-fr.html"},
  {width:768,height:1024,isMobile:false,hasTouch:true,bucket:"main",file:"2026-10-31-vespers-en.html"},
  {width:1200,height:900,isMobile:false,hasTouch:false,bucket:"main",file:"2026-11-03-matins-fr.html"},
];
const metrics=[];
try{
  browser=await chromium.launch({headless:true});
  for(const fixture of cases){
    const {width,height,isMobile,hasTouch,bucket,file}=fixture;
    const context=await browser.newContext({viewport:{width,height},isMobile,hasTouch,deviceScaleFactor:1});
    const page=await context.newPage();
    const errors=[],requests=[];
    page.on("pageerror",e=>errors.push(String(e)));
    page.on("request",r=>{if(!r.url().startsWith("http://127.0.0.1:"+port+"/"))requests.push(r.url());});
    await page.goto("http://127.0.0.1:"+port+"/"+bucket+"/"+file,{
      waitUntil:"load",timeout:45000});
    await page.waitForFunction(()=>document.querySelector(".aoOfficeMassReader")?.dataset.officeInteractionsMounted==="true",null,{timeout:10000});
    const state=await page.evaluate(()=>{
      const root=document.querySelector(".aoOfficeMassReader"),v=root?.querySelector(".aoOfficeMassViewport");
      const r=root.getBoundingClientRect(),vp=v.getBoundingClientRect();
      const n=root.querySelectorAll(".aoOfficeMassCard").length;
      return {
        root:{x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height},
        viewport:{x:vp.x,y:vp.y,right:vp.right,bottom:vp.bottom,height:vp.height},
        documentWidth:document.documentElement.scrollWidth,innerWidth,
        cardTotal:n,visibleCards:[...root.querySelectorAll(".aoOfficeMassCard")].filter(c=>!c.hidden).length,
        verification:root.dataset.officePublished,chant:root.dataset.officeChantEnabled,
        mode:root.dataset.officeMode,topRibbonVisible:root.querySelector(".ao-reader-top-ribbon")?.getBoundingClientRect().height,
        navigation: [...root.querySelectorAll("[data-office-nav]")].map(b=>({
          height:b.getBoundingClientRect().height,width:b.getBoundingClientRect().width,
        })),
        lineCount:root.querySelector(".aoOfficeMassCard:not([hidden])")?.querySelectorAll(".aoOfficeLiveParagraph").length??0,
      };
    });
    assert.equal(errors.length,0,file+" browser JS errors "+errors);
    assert.equal(requests.length,0,file+" unexpected remote request "+requests);
    assert.equal(state.mode,"LIVE",file);
    assert.equal(state.verification,"false",file);
    assert.equal(state.chant,"false",file);
    assert.equal(state.visibleCards,1,file);
    assert.ok(state.cardTotal>1,file+" no cards");
    assert.ok(state.root.x>=-1&&state.root.right<=width+1,file+" shell overflows horizontally");
    assert.ok(state.documentWidth<=width+1,file+" page overflows horizontally: "+state.documentWidth);
    assert.ok(state.viewport.height>180,file+" stage too small");
    assert.ok(state.topRibbonVisible>=44,file+" missing top ribbon");
    for(const nav of state.navigation){
      assert.ok(nav.height>=44&&nav.width>=44,file+" navigation hit target under 44px: "+JSON.stringify(nav));
    }
    const root=page.locator(".aoOfficeMassReader");
    const next=root.locator('[data-office-nav="1"]');
    await next.click();
    assert.equal(await root.getAttribute("data-office-card-index"),"1",file+" next failed");
    assert.equal(await root.locator(".aoOfficeMassCard:not([hidden])").count(),1);
    const progressPct=await root.locator("[data-office-progress-width]").evaluate(el=>Number.parseFloat(el.style.width));
    assert.ok(Math.abs(progressPct-200/state.cardTotal)<.001,
      file+" progress bar incorrect: "+progressPct+"% vs "+(200/state.cardTotal)+"%");
    const active=await root.locator(".aoOfficeMassCard:not([hidden]) .aoOfficeLiveParagraph").count();
    assert.ok(active>0,file+" no source lines in active card");
    const title=await root.locator("[data-office-section-title]").innerText();
    assert.equal(title,await root.locator("[data-office-card-title]").innerText(),file+" top title stale");
    const source=await root.locator("[data-office-source-role]").innerText();
    assert.ok(source.length>0,file+" no role in rail");
    await root.locator('[data-office-nav="-1"]').click();
    assert.equal(await root.getAttribute("data-office-card-index"),"0");
    await root.locator("[data-office-settings-toggle]").click();
    assert.equal(await root.locator("[data-office-settings-menu]").isVisible(),true);
    await root.locator('[data-office-mode-select="MISSAL"]').click();
    assert.equal(await root.getAttribute("data-office-mode"),"MISSAL");
    assert.equal(await root.locator('.aoOfficeMassCard:not([hidden]) [data-office-face="LIVE"]').isVisible(),false);
    assert.equal(await root.locator('.aoOfficeMassCard:not([hidden]) [data-office-face="MISSAL"]').isVisible(),true);
    const cols=await page.evaluate(()=>{
      const n=document.querySelector(".aoOfficeMissalCols");
      const left=n?.children[0]?.getBoundingClientRect(),right=n?.children[1]?.getBoundingClientRect();
      return {style:n&&getComputedStyle(n).gridTemplateColumns,
        leftX:left?.x,rightX:right?.x,
        vernacular:n?.children[1]?.textContent.length??0,
        latin:n?.children[0]?.textContent.length??0};
    });
    assert.ok(cols.latin>20&&cols.vernacular>20,file+" incomplete bilingual content");
    // Mass MISSAL parity: bilingual columns stay side by side even at 320px.
    assert.ok(cols.style?.trim().split(/\s+/).length===2,
      file+" MISSAL grid is not two columns: "+cols.style);
    assert.ok(cols.rightX>cols.leftX+(width<650?35:80),
      file+" MISSAL is not Latin-left/vernacular-right: "+JSON.stringify(cols));
    await root.locator("[data-office-settings-toggle]").click();
    await root.locator('[data-office-mode-select="LIVE"]').click();
    assert.equal(await root.getAttribute("data-office-mode"),"LIVE");
    await root.locator("[data-office-sections-toggle]").click();
    assert.equal(await root.locator("[data-office-sections-menu]").isVisible(),true);
    const targetIndex=Math.min(3,state.cardTotal-1);
    await root.locator('[data-office-section-select="'+targetIndex+'"]').click();
    assert.equal(await root.getAttribute("data-office-card-index"),String(targetIndex));
    await root.locator("[data-office-hours-toggle]").click();
    assert.ok(await root.locator("[data-office-hours-menu]").isVisible());
    await root.locator("[data-office-hours-toggle]").click();
    assert.equal(await root.locator("[data-office-hours-menu]").isVisible(),false);
    if(bucket==="advent"){
      // Only Vespers exists for these dates. Local navigation must not
      // advertise missing research documents for the other seven hours.
      assert.equal(await root.locator("[data-office-hour-link]").count(),1,file);
    }else{
      assert.equal(await root.locator("[data-office-hour-link]").count(),8,file);
    }
    // Access the longest source cell on the page and force its internal scroll
    // to verify illuminated line tracking, not a cosmetic unchanging first line.
    const longest=await root.evaluate(node=>{
      const cs=[...node.querySelectorAll(".aoOfficeMassCard")];
      return cs.reduce((acc,c,i)=>{
        const lines=c.querySelectorAll(".aoOfficeLiveParagraph").length;
        return lines>acc.lines?{index:i,lines}:acc;
      },{index:0,lines:0});
    });
    await root.locator('[data-office-jump="'+longest.index+'"]').click();
    const scroll=root.locator("[data-office-card-scroll]");
    const scrollStats=await scroll.evaluate(el=>{
      const lines=[...el.querySelectorAll(".aoOfficeMassCard:not([hidden]) .aoOfficeLiveParagraph")];
      const before=lines.findIndex(l=>l.dataset.active==="true");
      el.scrollTop=el.scrollHeight-el.clientHeight;
      el.dispatchEvent(new Event("scroll"));
      return {before,total:lines.length,scrollTop:el.scrollTop,
        scrollHeight:el.scrollHeight,clientHeight:el.clientHeight};
    });
    await page.waitForTimeout(80);
    const after=await root.locator(".aoOfficeMassCard:not([hidden]) .aoOfficeLiveParagraph").evaluateAll(nodes=>nodes.findIndex(n=>n.dataset.active==="true"));
    assert.ok(after>=0&&after<scrollStats.total,file+" no lit line");
    if(scrollStats.total>6&&scrollStats.scrollTop>100){
      assert.ok(after>scrollStats.before,file+" scroll focus did not advance: "+JSON.stringify({scrollStats,after}));
    }
    // Keyboard nav preserves the same source-owned cards.
    await root.locator(".aoOfficeMassViewport").focus({timeout:1000}).catch(()=>{});
    await page.keyboard.press("ArrowLeft");
    assert.equal(await root.getAttribute("data-office-card-index"),String(Math.max(0,longest.index-1)),file+" keyboard left");
    if(hasTouch){
      // Synthetic Touch objects validate the reader's swipe-specific event
      // handler without relying on unavailable real-handset automation.
      const before=Number(await root.getAttribute("data-office-card-index"));
      await scroll.evaluate(el=>{
        const make=(x,y)=>new Touch({identifier:1,target:el,clientX:x,clientY:y});
        el.dispatchEvent(new TouchEvent("touchstart",{touches:[make(280,280)],bubbles:true}));
        el.dispatchEvent(new TouchEvent("touchend",{changedTouches:[make(90,282)],bubbles:true}));
      });
      assert.equal(Number(await root.getAttribute("data-office-card-index")),Math.min(state.cardTotal-1,before+1),file+" horizontal swipe");
    }
    metrics.push({file,width,height,cardCount:state.cardTotal,longestCellLines:longest.lines,
      stageHeight:Math.round(state.viewport.height),overflowPx:Math.max(0,state.documentWidth-width),
      missalColumns:cols.style,focusBefore:scrollStats.before,focusAfter:after,
      mobile:isMobile,passed:true});
    await context.close();
  }
  console.log("OFFICE_PHONE_ACCEPTANCE",JSON.stringify({
    cases:metrics.length,phoneCases:metrics.filter(x=>x.width<=390).length,
    maxOverflowPx:Math.max(...metrics.map(x=>x.overflowPx)),
    maximumSourceCellLines:Math.max(...metrics.map(x=>x.longestCellLines)),
    results:metrics,published:0,realHandsetTested:false,
  }));
}finally{
  if(browser)await browser.close();
  await new Promise(ok=>server.close(ok));
}
