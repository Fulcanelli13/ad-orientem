import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile} from "node:fs/promises";
import {resolve,extname,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/prayer-reader-design-pilot");
await mkdir(output,{recursive:true});
const mime={".html":"text/html",".js":"text/javascript",".mjs":"text/javascript",".css":"text/css",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://localhost").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(data);
 }catch(e){res.writeHead(e.code==="ENOENT"?404:500);res.end(String(e.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  const errors=[];page.on("pageerror",err=>errors.push(err.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoPrayerReadersPilot=1",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   const open=id=>page.evaluate(id=>globalThis.AO_PRAY_V435930.open(id,{returnContext:null}),id);
   assert.equal(await open("pray.library"),true);
   const base="#aoPray435930.open ";
   await page.locator(base+'[data-p435930-lib-open="marian_memorare"]').click();
   assert.equal(await page.locator(base+'.aoReaderPilotSingle').count(),1);
   const focus=page.locator(base+'[data-p435930-pilot-focus]');
   await focus.click();
   assert.equal(await page.locator(base+'.aoReaderPilotSingle.aoReaderPilotFocus').count(),1);
   await page.screenshot({path:resolve(output,"single-focus-"+width+".png"),animations:"disabled"});
   await focus.click();
   assert.equal(await page.locator(base+'.aoReaderPilotSingle.aoReaderPilotFocus').count(),0);
   assert.equal(await open("pray.library"),true);
   await page.locator(base+'[data-p435930-lib-open="litany_loreto_1962"]').click();
   assert.equal(await page.locator(base+'[data-ao-reader-design-pilot="litany"]').count(),1);
   assert.equal(await page.locator(base+'.aoReaderPilotLitanyPair').count()>40,true);
   await page.screenshot({path:resolve(output,"loreto-1962-"+width+".png"),animations:"disabled"});
   await page.locator(base+'[data-p435930-pilot-loreto-form="litany_loreto_current"]').click();
   assert.equal(await page.locator(base+'[data-p435930-pilot-loreto-form="litany_loreto_current"]').getAttribute("aria-pressed"),"true");
   await page.locator(base+'[data-p435930-pilot-loreto-language="fr"]').click();
   assert.equal(await page.locator(base+'.aoReaderPilotLitany .aoDevoCardScroll').getAttribute("lang"),"fr");
   await page.locator(base+'[data-p435930-pilot-loreto-group]').click();
   assert.equal(await page.locator(base+'.aoReaderPilotLitanyPair small').count()>40,true);
   await page.screenshot({path:resolve(output,"loreto-current-fr-group-"+width+".png"),animations:"disabled"});
   await page.locator(base+'[data-p435930-pilot-loreto-language="la"]').click();
   assert.equal(await page.locator(base+'.aoReaderPilotLitany .aoDevoCardScroll').getAttribute("lang"),"la");
   await page.screenshot({path:resolve(output,"loreto-current-la-"+width+".png"),animations:"disabled"});
   const overflow=await page.evaluate(()=>{
    const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
    return {document:Math.max(0,document.documentElement.scrollWidth-innerWidth),
      mount:mount?Math.max(0,mount.scrollWidth-mount.clientWidth):999};
   });
   assert.ok(overflow.document<=1&&overflow.mount<=1,"no overflow "+width+": "+JSON.stringify(overflow));
   assert.equal(await open("pray.litany_saints"),true);
   assert.equal(await page.locator(base+'[data-ao-reader-design-pilot="litany"]').count(),0,"public/private Saints litany owner untouched");
   assert.deepEqual(errors,[],"Uncaught reader pilot JS errors: "+errors.join("; "));
   console.log("PASS "+width+"px: Memorare focus, 1962/current Loreto, French/Latin, communal roles and retained Litany of Saints owner");
  }finally{await page.close()}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
