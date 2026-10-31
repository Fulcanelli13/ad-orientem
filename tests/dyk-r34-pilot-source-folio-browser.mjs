// Optional Chromium acceptance for the unpublished R34 seven-fact source folio.
// npm run test:dyk-pilot-browser (requires Playwright Chromium).
import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {chromium} from "@playwright/test";

const root=resolve("."),mime={".js":"text/javascript",".json":"application/json",
".html":"text/html",".css":"text/css",".svg":"image/svg+xml"};
const html='<!doctype html><html lang="en"><head><meta name="viewport" content="width=device-width, initial-scale=1"></head>'+
'<body style="margin:0;background:#081018;color:#e9e0d0;font:16px system-ui">'+
'<main style="padding:16px"><h1>R34 · unpublished source review</h1><div id="facts"></div></main>'+
'<script type="module">'+
'import {createDykPilotSourceFolioOwner} from "/src/home/dyk-pilot-source-folio.js";'+
'const data=await fetch("/data/research/did-you-know/dyk-r34-high-signal-24-editorial-selection.v1.json").then(r=>r.json());'+
'const owner=createDykPilotSourceFolioOwner(window,{loadSelection:()=>data});'+
'for(const item of data.records.filter(x=>x.lane==="all-souls-november-2")){'+
'const button=document.createElement("button");button.type="button";'+
'button.dataset.openFact=item.id;button.textContent=item.id;'+
'button.style.cssText="display:block;margin:8px 0;min-height:44px;width:100%;";'+
'button.addEventListener("click",()=>owner.open({factId:item.id,language:document.documentElement.lang,trigger:button}));'+
'document.querySelector("#facts").appendChild(button);'+
'}window.__R34_REVIEW__={owner,data};</script></body></html>';
const server=createServer(async(req,res)=>{
 try{
  const path=new URL(req.url,"http://127.0.0.1").pathname;
  if(path==="/__dyk_review__"){res.writeHead(200,{"content-type":"text/html"});res.end(html);return}
  const absolute=resolve(root,"."+decodeURIComponent(path));
  if(!absolute.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(absolute);
  res.writeHead(200,{"content-type":mime[extname(absolute)]||"application/octet-stream"});
  res.end(data);
 }catch(e){res.writeHead(404);res.end(String(e.message))}
});
await new Promise(ok=>server.listen(0,"127.0.0.1",ok));
let browser;
try{
 browser=await chromium.launch({headless:true});
 const origin="http://127.0.0.1:"+server.address().port;
 for(const width of [390,1280]){
  for(const language of ["en","fr"]){
   const page=await browser.newPage({viewport:{width,height:844}});
   const errors=[];page.on("pageerror",e=>errors.push(String(e)));
   await page.goto(origin+"/__dyk_review__",{waitUntil:"domcontentloaded"});
   await page.waitForFunction(()=>Boolean(window.__R34_REVIEW__?.owner));
   await page.evaluate(lang=>document.documentElement.lang=lang,language);
   const buttons=page.locator("[data-open-fact]");
   assert.equal(await buttons.count(),7);
   for(let i=0;i<7;i++){
    const opener=buttons.nth(i),id=await opener.getAttribute("data-open-fact");
    await opener.click();
    const article=page.locator('[data-dyk-source-folio="'+id+'"]');
    await article.waitFor({state:"visible"});
    assert.equal(await article.getAttribute("role"),"dialog");
    assert.equal(await article.getAttribute("aria-modal"),"true");
    assert.equal(await article.locator("a[data-dyk-original-source]").count(),1);
    assert.ok((await article.locator(".aoDykSourceMeta").innerText()).includes(" · "));
    const bounds=await article.evaluate(el=>{const r=el.getBoundingClientRect();return {left:r.left,right:r.right,width:innerWidth};});
    assert.ok(bounds.left>=-1&&bounds.right<=bounds.width+1,"Overflow "+JSON.stringify({width,language,id,bounds}));
    const title=await article.locator("h2").innerText();
    assert.ok(language==="fr"?title.includes("saviez-vous"):title.includes("Did you know"));
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("[data-dyk-source-folio]").count(),0);
    assert.equal(await opener.evaluate(el=>document.activeElement===el),true,"Source folio should restore the triggering Home card");
   }
   assert.deepEqual(errors,[],"Runtime errors "+width+" "+language);
   await page.close();
  }
 }
 console.log("PASS R34 pilot review: seven fact-specific bilingual source sheets at 390px and 1280px, source links, Escape, restored focus, no overflow");
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
