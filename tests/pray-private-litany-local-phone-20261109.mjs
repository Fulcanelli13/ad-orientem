import assert from "node:assert/strict";
import http from "node:http";
import {readFile} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".json":"application/json",".css":"text/css; charset=utf-8",".svg":"image/svg+xml",".png":"image/png",".jpg":"image/jpeg",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden")}
  const body=await readFile(file);
  res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream","cache-control":"no-store"});res.end(body);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,bad)=>{server.once("error",bad);server.listen(0,"127.0.0.1",ok)});
let browser,scenarios=0;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390])for(const ui of ["en","fr"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?700:844},isMobile:true,hasTouch:true,locale:ui==="fr"?"fr-FR":"en-GB",serviceWorkers:"block",reducedMotion:"reduce"});
  const page=await ctx.newPage(),errors=[];let externalSourceRequests=0;
  page.on("pageerror",err=>errors.push(err.message));
  page.on("request",request=>{if(request.url().includes("wikisource.org"))externalSourceRequests++});
  await page.route("**/w/api.php**",route=>route.abort("blockedbyclient"));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>globalThis.AO_SETTINGS_APP_V1?.status?.().installed===true&&typeof globalThis.AO_APP_SHELL_V1?.navigate==="function",null,{timeout:45000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("settings")))?.ok,true);
   await page.locator('#ao-settings-modular-root [data-settings-route="/settings/language-reading"]').click();
   await page.locator('#ao-settings-modular-root [data-pref-path="general.uiLanguage"][data-pref-value="'+ui+'"]').click();
   await page.waitForFunction(x=>document.documentElement.lang===x,ui,{timeout:10000});
   assert.equal((await page.evaluate(()=>globalThis.AO_APP_SHELL_V1.navigate("pray")))?.ok,true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.litany_saints",{returnContext:null})),true);
   const scope="#aoPray435930.open ";
   await page.locator(scope+"[data-ao-private-litany-bundled='true']").waitFor({state:"attached",timeout:16000});
   const expected=ui==="en"?7:11;
   await page.locator(scope+"[data-ao-devo-chapter]").first().waitFor({state:"attached",timeout:12000});
   assert.equal(await page.locator(scope+"[data-ao-devo-chapter]").count(),expected,"Original historical Litany card count");
   assert.ok((await page.locator(scope+".aoP435930LitanyLine").count())>=8);
   assert.equal(externalSourceRequests,0,"Historical source must be bundled rather than loaded from Wikisource");
   await ctx.setOffline(true);
   const content=[];
   for(let i=0;i<expected;i++){
    if(i>0)await page.locator(scope+'[data-ao-devo-chapter="'+i+'"]').evaluate(el=>el.click());
    const lines=await page.locator(scope+".aoP435930LitanyLine").allTextContents();
    assert.ok(lines.length>=1,"Empty original historical Litany card "+i);
    content.push(...lines);
    assert.ok((await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth))<=2,
     "Horizontal overflow "+width+"px/"+ui+"/"+i);
   }
   assert.ok(content.length>=80,"Complete 1883/1862 historical Litany not traversable");
   assert.ok(!content.some(s=>/Psalm LXIX|Psaume LXIX|psalmus lxix/i.test(s)),"Appended Psalm must not replace private Litany text");
   assert.equal(externalSourceRequests,0);
   assert.deepEqual(errors,[],"No browser errors in offline Litany "+width+"/"+ui);
   scenarios++;
   console.log("PASS native original local Litany "+ui+" "+width+"px, "+expected+" source cards, "+content.length+" displayed lines offline");
  }finally{await ctx.close()}
 }
 assert.equal(scenarios,4);
}finally{await browser?.close().catch(()=>{});await new Promise(ok=>server.close(ok))}
