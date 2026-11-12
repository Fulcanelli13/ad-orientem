import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
import {stageClaudeChurchR8} from "../tools/pray/stage-claude-church-r8.mjs";

// REAL CHURCH ACCEPTANCE. Requires the owner's R8 source directory, not a
// simulated gallery. Deliberately not in default CI until art release approval.
// AO_R8_SOURCE=/path/to/Ad_Orientem node tests/pray-claude-church-staged-phone.mjs
if(!process.env.AO_R8_SOURCE)throw Error(
  "Set AO_R8_SOURCE to the extracted OWNER R8 Ad_Orientem directory; no mock 3D Church fallback.");
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
await stageClaudeChurchR8(process.env.AO_R8_SOURCE,resolve(root,"assets/pray-church"),{overwrite:true});
const types={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",
 ".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",
 ".json":"application/json; charset=utf-8",".png":"image/png",
 ".jpg":"image/jpeg",".webp":"image/webp",".svg":"image/svg+xml",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end()}
  const data=await readFile(file);
  res.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream","cache-control":"no-store"});
  res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const language of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},
   hasTouch:true,isMobile:true,reducedMotion:"reduce",serviceWorkers:"block"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(String(e.message||e)));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoChurchPilot=1",
    {waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_APP_SHELL_V1?.navigate&&
    globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true,null,{timeout:45000});
   await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("settings"));
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+language+'"]').click();
   await page.waitForFunction(lang=>document.documentElement.lang===lang,language);
   const entered=await page.evaluate(()=>window.AO_APP_SHELL_V1.navigate("pray"));
   assert.equal(entered?.ok,true,"Church pilot shell navigation failed");
   const church=page.frameLocator("#ao-r10-prayer-church");
   await church.locator("#church").waitFor({state:"visible",timeout:20000});
   await church.locator('#churchUI [data-a="places"]').click();
   assert.equal(await church.locator('#sheet.on [data-a="fastOpen"]').count(),12,
    "Claude's original 12 Church locations missing");
   await church.locator('#sheet.on [data-a="fastOpen"][data-v="votive"]').click();
   await church.locator("#familyGallery.on").waitFor({state:"visible"});
   const selected=await church.locator("#familyGallery").evaluate(node=>({
     title:node.innerText.slice(0,200),
     html:node.innerHTML.slice(0,150),
     scrollTop:node.scrollTop
   }));
   const item=church.locator('[data-a="gItem"][data-v="novena:st_joseph"]');
   assert.ok(await item.count(),"St Joseph novena not found in Votive Candles gallery");
   await item.click();
   await page.locator("#aoPray435930.open .aoN1Reader").waitFor({state:"visible",timeout:30000});
   assert.equal(await page.evaluate(()=>window.AO_NOVENAS_V3.state().id),"st_joseph");
   const hidden=await page.locator("#ao-r10-prayer-church").evaluate(x=>x.style.visibility);
   assert.equal(hidden,"hidden","Church should pause under the guided reader");
   // Reader handles its own Back: day -> programme details -> Church.
   for(let i=0;i<3;i++){
    if(await page.locator("#ao-r10-prayer-church").evaluate(x=>x.style.visibility==="visible"))break;
    await page.locator('#aoPray435930.open [data-n1-back]').click();
   }
   await page.waitForFunction(()=>document.querySelector("#ao-r10-prayer-church")?.style.visibility==="visible");
   await church.locator("#familyGallery.on").waitFor({state:"visible"});
   const returned=await church.locator("#familyGallery").evaluate(x=>x.innerText.slice(0,200));
   assert.ok(returned.includes(selected.title.slice(0,12)),"Original Church gallery not restored");
   await church.locator('[data-a="gBack"]').click();
   await church.locator('#churchUI [data-a="places"]').click();
   await church.locator('#sheet.on [data-a="fastOpen"][data-v="door"]').click();
   await page.waitForFunction(()=>window.AO_APP_SHELL_V1?.getActive?.()==="home",null,{timeout:15000});
   assert.equal(await page.locator("#ao-r10-prayer-church").count(),0,
    "West-door Home exit left a ghost iframe");
   assert.deepEqual(errors,[],"Real hosted R8 browser errors: "+errors.join(" | "));
   console.log("PASS staged R8 Church: "+width+"px "+language+
    " Places -> Votive Candles -> source-owned St Joseph -> real N3 Back -> same gallery -> West door Home.");
  }finally{await ctx.close()}
 }
}finally{
 await browser?.close().catch(()=>{});
 await new Promise(ok=>server.close(ok));
}
