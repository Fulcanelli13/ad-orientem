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
   const entry=page.locator(base+"[data-f07-mercy-entry='m1']");
   assert.equal(await entry.count(),1,"Claude m1 must precede canonical opening prayers");
   assert.equal(await entry.locator(".aoF07MercyEntryOutline li").count(),3,
    "m1 must distinguish Opening, Five decades and Closing");
   assert.equal(await entry.locator(".aoF07MercyEntryChips span").count(),2,
    "m1 must display duration and customary prayer time");
   assert.equal(await page.locator(base+".aoMercyLine").count(),0,
    "Opening prayer text may not bypass the m1 Begin decision");
   await page.screenshot({path:resolve(output,"mercy-m1-home-"+width+".png"),animations:"disabled"});
   await page.locator(base+"[data-p435930-mercy-begin]").click();
   const crown=page.locator(base+"[data-ao-f07-crown]");
   assert.equal(await crown.count(),1,"m2 crown must be present after explicit Begin");
   assert.equal(await crown.locator(".aoF07Bead").count(),55);
   assert.equal(await crown.getAttribute("data-total"),"62","The canonical five decades have 62 events by default");
   assert.equal(await page.locator(base+"[data-ao-mercy-bead-navigation]").count(),1,"The existing bead/decade navigator remains the owner");
   assert.ok((await page.locator(base+".aoMercyLine.aoMercyPrayer p").innerText()).length>15,"Full source prayer remains visible");
   const firstPrayer=await page.locator(base+".aoMercyLine.aoMercyPrayer p").evaluate(el=>{
    const r=el.getBoundingClientRect();
    return {top:r.top,pixels:Math.max(0,Math.min(r.bottom,innerHeight-70)-Math.max(0,r.top)),height:innerHeight};
   });
   const verticalStack=await page.evaluate(()=>{
    const root=document.querySelector("#aoPray435930.open");
    const top=selector=>{
     const element=root?.querySelector(selector),box=element?.getBoundingClientRect();
     return box?{top:Math.round(box.top),height:Math.round(box.height)}:null;
    };
    return {
     crown:top(".aoF07CrownBand"),
     recitation:top(".aoF07MercyRecitation"),
     chapters:top(".aoF07MercyChapterChips"),
     progress:top(".aoMercyBeadNavigation"),
     cardHead:top(".aoDevoCardHead"),
     scroll:top(".aoDevoCardScroll"),
     rubric:top(".aoF07MercyRubric"),
     prayer:top(".aoMercyLine.aoMercyPrayer p")
    };
   });
   assert.ok(firstPrayer.pixels>=28,
    "F07 first canonical prayer must show at least one readable line above the app dock at "+
    width+"px: "+JSON.stringify({firstPrayer,verticalStack}));
   await page.screenshot({path:resolve(output,"mercy-crown-opening-"+width+".png"),animations:"disabled"});
   // The Claude pilot intentionally hides the old decade strip. Exercise the
   // visible chapter control, not a hidden legacy button.
   const large=page.locator(base+'.aoF07MercyChapterChips [data-p435930-mercy-chapter="4"]');
   assert.equal(await large.isVisible(),true,"First decade must have a visible chapter target");
   await large.click();
   assert.equal(await crown.getAttribute("data-position"),"4");
   assert.equal(await crown.locator(".aoF07Bead-active").count(),1);
   assert.match(await crown.locator(".aoF07CrownText").innerText(),/Decade|Dizaine/);
   assert.equal(await page.locator(base+".aoMercyLine.aoMercyPrayer .aoF07MercyRoleLabel").count(),2,
    "m2 must show both versicle and response on the large bead");
   assert.equal(await page.locator(base+"[data-f07-mercy-dock-count]").innerText(),"5 / 62");
   await page.locator(base+"[data-p435930-mercy-next]").click();
   assert.equal(await crown.getAttribute("data-position"),"5","Next must use the canonical cursor");
   assert.equal(await page.locator(base+"[data-f07-mercy-dock-count]").innerText(),"6 / 62");
   await page.locator(base+"[data-p435930-mercy-previous]").click();
   assert.equal(await crown.getAttribute("data-position"),"4","Previous reverses the same cursor");
   await page.locator(base+".aoDevoCardScroll").evaluate(el=>{el.scrollTop+=200});
   await page.waitForFunction(()=>{
    const root=document.querySelector("#aoPray435930.open");
    const cursor=Number(root?.querySelector("[data-ao-f07-crown]")?.dataset.position);
    return Number.isInteger(cursor)&&cursor>4;
   },null,{timeout:8000});
   const actual=await page.locator(base+".aoMercyLine.aoMercyPrayer").getAttribute("data-ao-mercy-step");
   assert.equal(await crown.getAttribute("data-position"),actual,
    "Crown must follow the canonical paragraph scroll cursor without a second state engine");
   await page.screenshot({path:resolve(output,"mercy-crown-decade-"+width+".png"),animations:"disabled"});
   const overflow=await page.evaluate(()=>{
    const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
    return {document:document.documentElement.scrollWidth-innerWidth,mount:(mount?.scrollWidth||0)-(mount?.clientWidth||0)};
   });
   assert.ok(overflow.document<=1&&overflow.mount<=1,"No 320/390 horizontal overflow: "+JSON.stringify(overflow));
   // Navigation position is not proof a prayer was recited. Only an explicit
   // click on Finish after the last source paragraph can complete the chaplet.
   const closing=page.locator(base+'.aoF07MercyChapterChips [data-p435930-mercy-chapter="59"]');
   assert.equal(await closing.isVisible(),true,"Closing invocations need a visible chapter target");
   await closing.click();
   const finalAction=page.locator(base+'[data-p435930-mercy-finish]');
   assert.equal(await finalAction.isVisible(),false,"Finish must remain hidden before the last Holy God");
   // On a tall phone all three closing prayers may fit without scrolling.
   // Tapping the exact final source paragraph must focus it and unlock Finish.
   await page.locator(base+'.aoMercyLine[data-ao-mercy-step="61"]').click();
   await page.waitForFunction(()=>
    document.querySelector('#aoPray435930.open [data-p435930-mercy-finish]')?.hidden===false,
    null,{timeout:8000});
   assert.equal(await finalAction.locator('xpath=ancestor::article').getAttribute('data-ao-mercy-step'),"61",
    "Finish must remain attached to the actual last source prayer paragraph");
   assert.equal(await finalAction.isVisible(),true,
    "Finish must be visibly available when the last source prayer is focused");
   assert.equal(await page.locator(base+'[data-f07-mercy-completion]').count(),0,
    "Simply reaching the final text must not mark the chaplet complete");
   await finalAction.click();
   assert.equal(await page.locator(base+'[data-f07-mercy-completion]').count(),1,
    "Finish after the final source event must reveal completion");
   await page.screenshot({path:resolve(output,"mercy-m3-complete-"+width+".png"),animations:"disabled"});
   await page.locator(base+'[data-p435930-mercy-again]').click();
   assert.equal(await page.locator(base+'[data-f07-mercy-completion]').count(),0);
   assert.equal(await entry.count(),1,"Pray again returns to the distinct m1 home");
   await page.locator(base+"[data-p435930-mercy-begin]").click();
   assert.equal(await page.locator(base+'[data-ao-f07-crown]').getAttribute('data-position'),'0',
    "Beginning again must restart the same canonical 62-event sequence");
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
