import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/mass-source-context-p1");
await mkdir(output,{recursive:true});
const formation=JSON.parse(await readFile(resolve(root,"data/learn/mass-formation-campion.v1.json"),"utf8"));
const mime={".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",
 ".json":"application/json; charset=utf-8",".css":"text/css; charset=utf-8",
 ".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const fixture='<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width,initial-scale=1">'+
 '<style>:root{color-scheme:dark;--ao-bg-canvas:#080c12;--ao-surface-1:#101821;'+
 '--ao-text-primary:#e9e4da;--ao-text-muted:#a9a5a0;--ao-rule:#444048;--liturgical:#c9ad78;'+
 '--ao-global-ribbon-h:0px;--safe-bottom:0px;--safe-top:0px;--ao-font-body:Georgia,serif;'+
 '--ao-font-display:Georgia,serif;--ao-font-ui:system-ui,sans-serif}'+
 'html,body{margin:0;min-height:100%;background:var(--ao-bg-canvas);color:var(--ao-text-primary)}</style></head><body></body></html>';
const server=http.createServer(async(req,res)=>{
 try {
  const url=new URL(req.url,"http://127.0.0.1");
  if(url.pathname==="/__source_study__"){res.writeHead(200,{"content-type":"text/html; charset=utf-8"});res.end(fixture);return}
  const path=resolve(root,"."+decodeURIComponent(url.pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end("Blocked");return}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":mime[extname(path)]??"application/octet-stream","cache-control":"no-store"});
  res.end(bytes);
 }catch(error){res.writeHead(error?.code==="ENOENT"?404:500);res.end(String(error))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try {
 browser=await chromium.launch({headless:true});
 const result=[];
 for(const size of [320,390,1280]){
  for(const language of ["en","fr"]){
   const context=await browser.newContext({viewport:{width:size,height:size<500?844:900},
     isMobile:size<500,hasTouch:size<500,deviceScaleFactor:1});
   const page=await context.newPage(),fatal=[];
   page.on("pageerror",error=>fatal.push(String(error)));
   try{
    await page.goto("http://127.0.0.1:"+server.address().port+"/__source_study__",
      {waitUntil:"domcontentloaded"});
    await page.evaluate(async lang=>{
      document.documentElement.lang=lang;
      window.AO_RUNTIME_V8={store:{getState:()=>({language:lang})}};
      const {createMassFormationRuntime}=await import("/src/learn/mass-formation.js");
      window.__massStudy=createMassFormationRuntime(window,{fetchImpl:fetch.bind(window)});
    },language);
    for(const stage of formation.stages){
      const sources=[...new Set(stage.claims.flatMap(x=>x.sources))];
      const sourceId=stage.id==="MF03"?"SRC-MEDIATOR-DEI":sources[0];
      const source=formation.sources.find(x=>x.id===sourceId);
      const count=stage.claims.filter(x=>x.sources.includes(sourceId)).length;
      assert.ok(source,"Missing original source: "+sourceId);
      assert.equal(await page.evaluate(id=>window.__massStudy.open({stageId:id}),stage.id),true);
      const reader=page.locator("#ao-mass-formation-root");
      const disclosure=reader.locator(".aoReferencePanel");
      await disclosure.locator("summary").first().click();
      assert.equal(await reader.locator('[data-ao-reference-study-source]').count(),sources.length,
        stage.id+" original source index must have a context link for every cited source");
      const trigger=reader.locator('[data-ao-reference-study-source="'+sourceId+'"]');
      const originalUrl=await reader.locator('[data-ao-reference-id="'+sourceId+'"]').first().getAttribute("href");
      assert.equal(originalUrl,source.canonical_url);
      // Capture the true launch position after Playwright has brought the
      // source button into view; otherwise testing would compare the wrong
      // (pre-scroll) position against the correctly preserved reader state.
      await trigger.scrollIntoViewIfNeeded();
      const prevPosition=await reader.evaluate(x=>x.scrollTop);
      await trigger.click();
      const sourceReader=page.locator('[data-ao-mf-source-reader="'+sourceId+'"]');
      await sourceReader.waitFor({state:"visible",timeout:12000});
      assert.equal(await sourceReader.locator("[data-ao-mf-source-claim]").count(),count);
      const url=sourceReader.locator("[data-ao-mf-source-original]");
      assert.equal(await url.getAttribute("href"),originalUrl);
      assert.equal(await url.getAttribute("target"),"_blank");
      const metrics=await sourceReader.evaluate(node=>{
        const action=node.querySelector("[data-ao-mf-source-original]"),rect=action.getBoundingClientRect();
        return {overflow:node.scrollWidth-node.clientWidth,actionTop:rect.top,
          modal:node.getAttribute("aria-modal"),role:node.getAttribute("role"),
          header:node.querySelector("h1")?.innerText,
          claimLabels:[...node.querySelectorAll(".aoMFSourceClaimId")].map(x=>x.textContent),
          buttons:[...node.querySelectorAll("button")].filter(x=>x.getBoundingClientRect().width<40).length};
      });
      assert.equal(metrics.role,"dialog");
      assert.equal(metrics.modal,"true");
      assert.ok(metrics.overflow<=2,stage.id+" horizontal source reader overflow "+size+"px: "+metrics.overflow);
      assert.ok(metrics.actionTop<=(size<500?630:680),
        stage.id+" source link should be visible without scrolling at "+size+"px: "+metrics.actionTop);
      assert.equal(metrics.claimLabels.length,count);
      assert.equal(metrics.buttons,0,"Source reader touch controls smaller than 40px");
      assert.equal(await reader.evaluate(node=>node.inert),true);
      if(stage.id==="MF03"||stage.id==="MF08"){
        await page.screenshot({path:resolve(output,"source-"+size+"-"+language+"-"+stage.id+".png"),animations:"disabled"});
      }
      await sourceReader.locator(".aoMFSourceReturn").click();
      assert.equal(await reader.evaluate(node=>node.inert),false);
      assert.equal(await trigger.evaluate(node=>document.activeElement===node),true,
        stage.id+" did not restore the source context trigger focus");
      assert.ok(Math.abs((await reader.evaluate(node=>node.scrollTop))-prevPosition)<=4,
        stage.id+" lost the original Formation scroll position");
      assert.equal(await disclosure.getAttribute("open"),"",
        stage.id+" source disclosure lost its open state");
      result.push(stage.id+":"+sourceId+":"+size+":"+language);
    }
    assert.deepEqual(fatal,[],size+" "+language+" JS exceptions");
   }finally{await page.close();await context.close()}
  }
 }
 assert.equal(result.length,48);
 console.log("PASS 48 original-claim source contexts across eight stages × 320/390/1280 px × EN/FR, original link, focus, no overflow");
}finally{
 await browser?.close();await new Promise(ok=>server.close(ok));
}
