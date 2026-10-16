import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const out=resolve(root,"artifacts/visual-acceptance/source-references");
await mkdir(out,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",
 ".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",
 ".webp":"image/webp",".jpg":"image/jpeg"};
const fixture='<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1">'+
'<style>:root{color-scheme:dark;--ao-bg-canvas:#080c12;--ao-surface-1:#101821;'+
'--ao-text-primary:#e9e4da;--ao-text-muted:#a9a5a0;--ao-rule:#444048;'+
'--liturgical:#c9ad78;--ao-global-ribbon-h:0px;--safe-bottom:0px;--safe-top:0px;'+
'--ao-font-body:Georgia,serif;--ao-font-display:Georgia,serif;--ao-font-ui:system-ui,sans-serif}'+
'html,body{margin:0;min-height:100%;background:var(--ao-bg-canvas);'+
'color:var(--ao-text-primary);font:16px/1.6 var(--ao-font-body)}'+
'a{color:var(--liturgical)}button{font-family:inherit}</style></head><body></body></html>';
const server=http.createServer(async(req,res)=>{
 try{
  const pathname=new URL(req.url,"http://127.0.0.1").pathname;
  if(pathname==="/__reference_qa__"){
   res.writeHead(200,{"content-type":mime[".html"],"cache-control":"no-store"});
   res.end(fixture);return;
  }
  const absolute=resolve(root,"."+decodeURIComponent(pathname));
  if(absolute!==root&&!absolute.startsWith(root+sep)){
   res.writeHead(403);res.end("blocked");return;
  }
  const contents=await readFile(absolute);
  res.writeHead(200,{"content-type":mime[extname(absolute)]||"application/octet-stream","cache-control":"no-store"});
  res.end(contents);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok);});
const base="http://127.0.0.1:"+server.address().port;
let browser;
const failures=[];
const results=[];
try{
 browser=await chromium.launch({headless:true});
 for(const device of [{name:"phone",width:390,height:844,isMobile:true,hasTouch:true},
  {name:"desktop",width:1280,height:900,isMobile:false,hasTouch:false}]){
  for(const lang of ["en","fr"]){
   const context=await browser.newContext({
    viewport:{width:device.width,height:device.height},
    deviceScaleFactor:device.isMobile?2:1,isMobile:device.isMobile,hasTouch:device.hasTouch
   });
   const page=await context.newPage();
   const fatal=[];
   page.on("pageerror",error=>fatal.push(String(error)));
   try{
    async function setup(surface){
     await page.goto(base+"/__reference_qa__",{waitUntil:"domcontentloaded"});
     await page.evaluate(locale=>{
      document.documentElement.lang=locale;
      window.AO_RUNTIME_V8={store:{getState:()=>({language:locale})}};
     },lang);
     const info=await page.evaluate(async name=>{
      if(name==="mass"){
       const m=await import("/src/learn/mass-formation.js");
       const app=m.createMassFormationRuntime(window,{fetchImpl:fetch.bind(window)});
       window.__referenceRuntime=app;
       return {opened:await app.open({stageId:"MF01"}),root:"#ao-mass-formation-root",
        disclosure:".aoReferencePanel",evidence:".aoRefEvidence",minRows:2};
      }
      if(name==="spiritual"){
       const m=await import("/src/learn/spiritual-life.js");
       const data=await import("/src/learn/spiritual-life-data.js");
       const app=m.createSpiritualLifeRuntime(window);
       window.__referenceRuntime=app;
       return {opened:app.open({lessonId:data.SPIRITUAL_LIFE_LESSONS[0].id}),
        root:"#ao-spiritual-life-root",disclosure:".aoSLSources",
        evidence:".aoSLEvidence",minRows:4};
      }
      if(name==="ethics"){
       const m=await import("/src/learn/sexual-ethics.js");
       const app=m.createSexualEthicsRuntime(window);
       window.__referenceRuntime=app;
       return {opened:app.open({questionId:"CSE014"}),root:"#ao-sexual-ethics-root",
        disclosure:".aoCSESources",evidence:".aoCSESourceDetail",minRows:2};
      }
      const m=await import("/src/learn/formation-recovery-review.js");
      const app=m.createFormationRecoveryReview(window);
      window.__referenceRuntime=app;
      const opened=await app.open({corpus:"apologetics",studyPreview:true});
      return {opened,root:"#ao-formation-recovery-review",disclosure:".rrEvidenceDisclosure",
       evidence:".rrEvidenceList",minRows:4};
     },surface);
     assert.equal(info.opened,true,surface+" runtime failed to open");
     if(surface==="formation"){
      await page.locator('[data-rr-theme="god-revelation"]').click();
      await page.locator('[data-rr-dossier="APOL-001"]').click();
      assert.equal(await page.locator('[data-rr-canonical-synthesis="APOL-001"]').count(),1);
     }
     return info;
    }
    for(const surface of ["mass","spiritual","ethics","formation"]){
     const info=await setup(surface);
     const label=device.name+"-"+lang+"-"+surface;
     const node=page.locator(info.root);
     assert.equal(await node.count(),1,label+" missing canonical reader root");
     const drawer=page.locator(info.disclosure).first();
     await drawer.waitFor({state:"attached",timeout:20000});
     assert.equal(await drawer.getAttribute("open"),null,label+" sources should start folded");
     const before=await page.evaluate(({root,disclosure})=>{
      const node=document.querySelector(root),drawer=document.querySelector(disclosure);
      return {linksBefore:drawer.querySelectorAll("a[href]").length,
       rootWidth:node.getBoundingClientRect().width,rootOverflow:node.scrollWidth-node.clientWidth};
     },info);
     assert.ok(before.rootWidth<=device.width+2,label+" root exceeds viewport");
     assert.ok(before.rootOverflow<=3,label+" horizontal overflow before sources opened: "+before.rootOverflow);
     await page.screenshot({path:resolve(out,label+"-reading.png"),fullPage:false});
     await drawer.locator("summary").first().click();
     assert.notEqual(await drawer.getAttribute("open"),null,label+" drawer cannot be opened");
     if(surface==="mass"||surface==="spiritual"||surface==="ethics"){
      const selector=surface==="mass"?"[data-ao-source-index]":surface==="spiritual"?"[data-ao-sl-source-index]":"[data-ao-cse-source-index]";
      const index=drawer.locator(selector).first();
      assert.equal(await index.count(),1,label+" missing first-tap source index");
      assert.equal(await index.isVisible(),true,label+" first-tap source list is hidden");
      assert.ok(await index.locator("li").count()>0,label+" source index empty");
      const nested=drawer.locator(info.evidence).first();
      assert.equal(await nested.getAttribute("open"),null,label+" claim evidence should remain folded");
      assert.ok(await index.locator('a[href^="https://"]').count()>0,
       label+" existing citations not reachable on first tap");
      if(surface==="mass"){
       const sourceButton=index.locator('[data-ao-reference-study-source="SRC-MEDIATOR-DEI"]');
       assert.equal(await sourceButton.count(),1,label+" contextual source reader is not available");
       await sourceButton.click();
       const study=page.locator('[data-ao-mf-source-reader="SRC-MEDIATOR-DEI"]');
       await study.waitFor({state:"visible",timeout:12000});
       assert.ok(await study.locator('[data-ao-mf-source-claim]').count()>=1,
         label+" original claim backlinks lost");
       assert.equal(await study.locator('[data-ao-mf-source-original="SRC-MEDIATOR-DEI"]').count(),1);
       assert.equal(await node.evaluate(element=>element.inert),true,label+" original lesson must be inert in source context");
       assert.match(await study.innerText(),lang==="fr"?/non des citations ou des passages vérifiés/:/not quotations or verified passages/,
         label+" must distinguish claims from original source text");
       await page.screenshot({path:resolve(out,label+"-context.png"),fullPage:false});
       await study.locator(".aoMFSourceReturn").click();
       assert.equal(await node.evaluate(element=>element.inert),false,label+" must restore lesson controls");
       assert.equal(await sourceButton.evaluate(element=>document.activeElement===element),true,
         label+" original cited source must regain keyboard focus");
      }
     }
     const evidence=page.locator(info.evidence).first();
     await evidence.waitFor({state:"attached"});
     if(surface!=="formation"){
      const sub=evidence.locator("summary").first();
      assert.ok(await sub.count(),label+" nested evidence summary absent");
      await sub.click();
     }
     const linkCount=await drawer.locator('a[href^="https://"]').count();
     assert.ok(linkCount>0,label+" lost original source hyperlinks");
     const rows=await page.evaluate(({surface,evidence})=>{
      const block=document.querySelector(evidence);
      return surface==="mass"?block.querySelectorAll("[data-ao-evidence-row]").length:
       surface==="spiritual"?block.querySelectorAll("[data-ao-sl-evidence-block]").length:
        surface==="ethics"?block.querySelectorAll(".aoCSESource").length:
       block.querySelectorAll("[data-rr-evidence-row]").length;
     },{surface,evidence:info.evidence});
     assert.ok(rows>=info.minRows,label+" missing source-to-paragraph links: "+rows);
     const metrics=await page.evaluate(({root,disclosure})=>{
      const reader=document.querySelector(root),panel=document.querySelector(disclosure);
      const rect=panel.getBoundingClientRect();
      const badLinks=[...panel.querySelectorAll("a[href]")].filter(a=>
       a.protocol!=="https:"||a.target!=="_blank"||!a.rel.includes("noopener")).length;
      return {scrollOverflow:reader.scrollWidth-reader.clientWidth,
       panelWidth:rect.width,viewport:innerWidth,linksBad:badLinks};
     },info);
     assert.equal(metrics.linksBad,0,label+" unsafe or malformed external source links");
     assert.ok(metrics.scrollOverflow<=3,label+" horizontal overflow with open sources: "+metrics.scrollOverflow);
     assert.ok(metrics.panelWidth<=device.width+2,label+" drawer wider than viewport");
     await drawer.scrollIntoViewIfNeeded();
     await page.screenshot({path:resolve(out,label+"-sources.png"),fullPage:false});
     results.push({label,rows,sourceLinks:linkCount,horizontalOverflowPx:metrics.scrollOverflow});
    }
    assert.equal(fatal.length,0,device.name+" "+lang+" runtime JS errors:\n"+fatal.join("\n"));
   }catch(error){failures.push({device:device.name,lang,error:String(error?.stack||error),pageerrors:fatal});}
   finally{await page.close();await context.close();}
  }
 }
 assert.deepEqual(failures,[],"Source reference browser acceptance regressions");
 console.log(JSON.stringify({status:"PASS_SOURCE_REFERENCE_BROWSER",surfaces:results.length,screenshots:results.length*2,results},null,2));
}finally{await browser?.close();await new Promise(ok=>server.close(ok));}
