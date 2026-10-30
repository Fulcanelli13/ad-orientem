import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/pray-chaplet-f07");await mkdir(output,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const file=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(file!==root&&!file.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const bytes=await readFile(file);res.writeHead(200,{"content-type":mime[extname(file)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,no)=>{server.once("error",no);server.listen(0,"127.0.0.1",ok)});
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  const page=await browser.newPage({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
  const errors=[];page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto("http://127.0.0.1:"+server.address().port+"/index.html?aoChapletF07Pilot=1",{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.divine_mercy",{returnContext:null})),true);
   const base="#aoPray435930.open ";
   const crown=page.locator(base+"[data-ao-f07-crown]");
   assert.equal(await crown.count(),1,"Opt-in F07 crown must be present in the actual Divine Mercy reader");
   assert.equal(await crown.locator(".aoF07Bead").count(),55);
   assert.equal(await crown.getAttribute("data-total"),"62","The canonical five decades have 62 events by default");
   assert.equal(await page.locator(base+"[data-ao-mercy-bead-navigation]").count(),1,"The existing bead/decade navigator remains the owner");
   assert.ok((await page.locator(base+".aoMercyLine.aoMercyPrayer p").innerText()).length>15,"Full source prayer remains visible");
   const firstPrayer=await page.locator(base+".aoMercyLine.aoMercyPrayer p").evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {top:r.top,pixels:Math.max(0,Math.min(r.bottom,innerHeight-70)-Math.max(0,r.top)),height:innerHeight};
   });
   assert.ok(firstPrayer.pixels>=12,
    "F07 first canonical prayer must appear above the app dock at "+width+"px: "+JSON.stringify(firstPrayer));
   await page.screenshot({path:resolve(output,"mercy-crown-opening-"+width+".png"),animations:"disabled"});
   const large=page.locator(base+'[data-p435930-mercy-jump="4"]');
   await large.click();
   assert.equal(await crown.getAttribute("data-position"),"4");
   assert.equal(await crown.locator(".aoF07Bead-active").count(),1);
   assert.match(await crown.locator(".aoF07CrownText").innerText(),/Decade|Dizaine/);
   await page.locator(base+'[data-ao-mercy-step="5"]').focus();
   assert.equal(await crown.getAttribute("data-position"),"5",
    "F07 crown must follow the existing paragraph focus cursor without a second state engine");
   await page.screenshot({path:resolve(output,"mercy-crown-decade-"+width+".png"),animations:"disabled"});
   const overflow=await page.evaluate(()=>{
    const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
    return {document:document.documentElement.scrollWidth-innerWidth,mount:(mount?.scrollWidth||0)-(mount?.clientWidth||0)};
   });
   assert.ok(overflow.document<=1&&overflow.mount<=1,"No 320/390 horizontal overflow: "+JSON.stringify(overflow));
   assert.deepEqual(errors,[],"No uncaught F07 pilot errors");
   console.log("PASS F07 "+width+"px: source 62 events, 55-bead crown, decade jump, full prayer, no overflow");
  }finally{await page.close()}
 }
 const legacy=await browser.newPage({viewport:{width:320,height:568},isMobile:true});
 try{
  await legacy.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await legacy.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
  await legacy.evaluate(()=>globalThis.AO_PRAY_APP_V1.open());
  await legacy.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  await legacy.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.divine_mercy",{returnContext:null}));
  assert.equal(await legacy.locator("#aoPray435930.open [data-ao-f07-crown]").count(),0,"Default Divine Mercy stays unchanged");
  assert.equal(await legacy.locator("#aoPray435930.open [data-ao-mercy-bead-navigation]").count(),1);
 }finally{await legacy.close()}
}finally{await browser?.close();await new Promise(ok=>server.close(ok))}
