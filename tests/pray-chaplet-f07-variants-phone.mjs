import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir} from "node:fs/promises";
import {extname,resolve,sep} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const captures=resolve(root,"artifacts/pray-chaplet-f07-variants");await mkdir(captures,{recursive:true});
const mime={".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".mjs":"text/javascript; charset=utf-8",".css":"text/css; charset=utf-8",".json":"application/json",".svg":"image/svg+xml",".png":"image/png",".woff2":"font/woff2"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);res.end();return}
  const data=await readFile(path);res.writeHead(200,{"content-type":mime[extname(path)]||"application/octet-stream"});res.end(data);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e))}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const cases=[
 {route:"pray.five_wounds",kind:"five-wounds",dots:30,prayer:".aoFiveWoundsPrayerText",next:"[data-p435930-five-next]",after:"1",previous:"[data-p435930-five-prev]",legacyNav:".aoFiveWoundsRail button"},
 {route:"pray.precious_blood",kind:"precious-blood",dots:47,prayer:".aoPreciousBloodCard p",next:"[data-p435930-blood-next]",after:"1:0",previous:"[data-p435930-blood-prev]",legacyNav:".aoPreciousBloodRail button"},
 {route:"pray.little_crown",kind:"little-crown",dots:15,prayer:".aoLittleCrownPrayerText",next:"[data-p435930-crown-next]",after:"1",previous:"[data-p435930-crown-prev]",legacyNav:".aoLittleCrownBeads button"}
];
let browser;
try{
 browser=await chromium.launch({headless:true});
 for(const width of [320,390]){
  for(const c of cases){
   const page=await browser.newPage({viewport:{width,height:width===320?568:844},isMobile:true,hasTouch:true,serviceWorkers:"block"});
   const errors=[];page.on("pageerror",e=>errors.push(e.message));
   try{
    const base="http://127.0.0.1:"+server.address().port+"/index.html?aoChapletF07Pilot=1";
    await page.goto(base,{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
    await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
    assert.equal(await page.evaluate(route=>globalThis.AO_PRAY_V435930.open(route,{returnContext:null}),c.route),true);
    const prefix="#aoPray435930.open ";
    const band=page.locator(prefix+'[data-f07-variant="'+c.kind+'"]');
    assert.equal(await band.count(),1,c.route+" source-owned presentation band missing");
    assert.equal(await band.locator(".aoF07VariantDot").count(),c.dots);
    if(c.kind==="five-wounds"){
     const alignment=await page.locator(prefix+".aoP435930Head").evaluate(h=>{
      const lang=h.querySelector(".aoP435930SessionLanguage")?.getBoundingClientRect();
      const home=h.querySelector(".aoP435930Home")?.getBoundingClientRect();
      return {langLeft:lang?.left,homeLeft:home?.left,langTop:lang?.top,homeTop:home?.top,viewport:innerWidth};
     });
     assert.ok(Number.isFinite(alignment.langLeft)&&Number.isFinite(alignment.homeLeft)&&
      alignment.langLeft>alignment.viewport*.58&&alignment.homeLeft>alignment.langLeft+35&&
      Math.abs(alignment.langTop-alignment.homeTop)<=4,
      "F07 Five Wounds: Home shortcut must stay beside EN/FR on the same header row: "+JSON.stringify(alignment));
    }
    assert.equal(await page.locator(prefix+c.legacyNav).count(),c.kind==="precious-blood"?7:c.kind==="five-wounds"?5:15);
    const text=page.locator(prefix+c.prayer).first();
    assert.ok((await text.innerText()).trim().length>=18,c.route+" canonical prayer text absent");
    const geometry=await text.evaluate(el=>{
     const rect=el.getBoundingClientRect(),root=document.querySelector("#aoPray435930.open .aoP435930Mount");
     const footer=el.closest("main")?.querySelector(".aoFiveWoundsActions,.aoPreciousBloodActions,.aoLittleCrownActions");
     const availableBottom=Math.min(innerHeight-70,(footer?.getBoundingClientRect().top??innerHeight)-6);
     return {top:rect.top,prayerHeight:rect.height,availableBottom,visiblePixels:Math.max(0,Math.min(rect.bottom,availableBottom)-Math.max(0,rect.top)),
      pageOverflow:document.documentElement.scrollWidth-innerWidth,mountOverflow:(root?.scrollWidth||0)-(root?.clientWidth||0)};
    });
    assert.ok(geometry.visiblePixels>=Math.min(40,Math.max(1,geometry.prayerHeight-0.5)),"F07 "+c.kind+" first source prayer below mobile dock at "+width+": "+JSON.stringify(geometry));
    assert.ok(geometry.pageOverflow<=1&&geometry.mountOverflow<=1,
     "F07 "+c.kind+" horizontal overflow at "+width+": "+JSON.stringify(geometry));
    await page.screenshot({path:resolve(captures,c.kind+"-"+width+"-opening.png"),animations:"disabled"});
    await page.locator(prefix+c.next).click();
    assert.equal(await band.getAttribute("data-f07-position"),c.after,c.route+" indicator must follow source navigation");
    assert.equal(await band.locator('[data-f07-status="current"]').count(),1);
    await page.locator(prefix+c.previous).click();
    assert.equal(await band.getAttribute("data-f07-position"),c.kind==="precious-blood"?"opening":"0");
    await page.screenshot({path:resolve(captures,c.kind+"-"+width+"-return.png"),animations:"disabled"});
    assert.deepEqual(errors,[],c.route+" uncaught mobile error(s)");
    console.log("PASS F07 "+width+" "+c.kind+": canonical "+c.dots+" positions, first prayer, controls, next/previous and rollback-safe navigation");
   }finally{await page.close()}
  }
 }
 const page=await browser.newPage({viewport:{width:320,height:568},isMobile:true,serviceWorkers:"block"});
 try{
  await page.goto("http://127.0.0.1:"+server.address().port+"/index.html",{waitUntil:"domcontentloaded",timeout:90000});
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
  await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open());
  await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
  for(const c of cases){
   await page.evaluate(route=>globalThis.AO_PRAY_V435930.open(route,{returnContext:null}),c.route);
   assert.equal(await page.locator("#aoPray435930.open [data-f07-variant]").count(),0,
    c.route+" nonpilot default must remain unchanged");
  }
 }finally{await page.close()}
}finally{await browser?.close();await new Promise(done=>server.close(done))}
