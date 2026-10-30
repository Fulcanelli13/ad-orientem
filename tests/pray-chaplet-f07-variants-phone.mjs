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
 {route:"pray.five_wounds",kind:"five-wounds",dots:5,prayer:".aoFiveWoundsPrayerText",next:"[data-p435930-five-next]",after:"1",previous:"[data-p435930-five-prev]",legacyNav:".aoF07WoundChips button"},
 {route:"pray.precious_blood",kind:"precious-blood",dots:7,prayer:".aoPreciousBloodCard p",next:"[data-p435930-blood-next]",after:"1:0",previous:"[data-p435930-blood-prev]",legacyNav:".aoF07BloodJump .aoPreciousBloodRail button"},
 {route:"pray.little_crown",kind:"little-crown",dots:15,prayer:".aoLittleCrownPrayerText",next:"[data-p435930-crown-next]",after:"1",previous:"[data-p435930-crown-prev]",legacyNav:".aoF07LittleCrownBead"}
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
    assert.equal(await band.locator(c.kind==="little-crown"?".aoF07LittleCrownBead":
      c.kind==="five-wounds"?".aoF07WoundPoint":c.kind==="precious-blood"?".aoF07BloodSegment":".aoF07VariantDot").count(),c.dots);
    if(c.kind==="five-wounds"){
     assert.equal(await page.locator(prefix+" .aoF07ReaderLanguage summary").count(),1,
      "F07 w1 must own one discreet Aa language menu");
     const header=page.locator(prefix+" .aoP435930Head .aoP435930Home");
     assert.equal(await header.count(),1,"Home shortcut must remain reachable");
     assert.ok(await header.isVisible(),"Home shortcut must stay visible");
     assert.equal(await page.locator(prefix+" .aoP435930Head .aoP435930SessionLanguage:visible").count(),0,
      "No duplicate EN/FR header control in the opt-in w1 reader");
    }
    assert.equal(await page.locator(prefix+c.legacyNav).count(),c.kind==="precious-blood"?7:c.kind==="five-wounds"?5:15);
    if(c.kind==="little-crown"){
     const circle=band.locator(".aoF07LittleCrownCircle");
     assert.equal(await circle.count(),1,"Little Crown must be a fifteen-bead circle");
     const metrics=await band.locator(".aoF07LittleCrownBead").evaluateAll(nodes=>{
      const boxes=nodes.map(n=>n.getBoundingClientRect());
      return {count:boxes.length,minSize:Math.min(...boxes.map(r=>Math.min(r.width,r.height))),
       collisions:boxes.reduce((a,r,i)=>a+boxes.slice(i+1).filter(q=>
        Math.hypot(r.x+r.width/2-(q.x+q.width/2),r.y+r.height/2-(q.y+q.height/2))<47.5).length,0)};
     });
     assert.ok(metrics.minSize>=48&&metrics.collisions===0,
      "Little Crown 48px source-owned circle must not overlap: "+JSON.stringify(metrics));
     assert.equal(await page.locator(prefix+"[data-p435930-crown-bead]").count(),15,
      "No duplicate hidden fifteen-bead navigation sheet");
     assert.equal(await page.locator(prefix+".aoF07JumpDisclosure").count(),0);
     assert.equal(await band.locator('.aoF07LittleCrownCentre[aria-valuenow="1"]').count(),1);
     assert.equal(await page.locator(prefix+".aoF07LittleCrownLanguage summary").count(),1,
      "Quiet Aa menu replaces LATIN pill in the pilot");
    }
    const text=page.locator(prefix+c.prayer).first();
    assert.ok((await text.innerText()).trim().length>=18,c.route+" canonical prayer text absent");
    const geometry=await text.evaluate(el=>{
     const rect=el.getBoundingClientRect(),root=document.querySelector("#aoPray435930.open .aoP435930Mount");
     const footer=el.closest("main")?.querySelector(".aoFiveWoundsActions,.aoPreciousBloodActions,.aoLittleCrownActions");
     const availableBottom=Math.min(innerHeight-70,(footer?.getBoundingClientRect().top??innerHeight)-6);
     return {top:rect.top,prayerHeight:rect.height,availableBottom,visiblePixels:Math.max(0,Math.min(rect.bottom,availableBottom)-Math.max(0,rect.top)),
      pageOverflow:document.documentElement.scrollWidth-innerWidth,mountOverflow:(root?.scrollWidth||0)-(root?.clientWidth||0)};
    });
    // Capture *before* the visibility assertion so failing 320px layouts
    // still yield a real browser screenshot, not only an error message.
    await page.screenshot({path:resolve(captures,c.kind+"-"+width+"-opening.png"),animations:"disabled"});
    console.log("F07-GEOMETRY "+width+" "+c.kind+" "+JSON.stringify(geometry));
    assert.ok(geometry.visiblePixels>=Math.min(40,Math.max(1,geometry.prayerHeight-0.5)),"F07 "+c.kind+" first source prayer below mobile dock at "+width+": "+JSON.stringify(geometry));
    assert.ok(geometry.pageOverflow<=1&&geometry.mountOverflow<=1,
     "F07 "+c.kind+" horizontal overflow at "+width+": "+JSON.stringify(geometry));

    await page.locator(prefix+c.next).click();
    if(c.kind==="precious-blood"){
     assert.equal(await band.getAttribute("data-f07-phase"),"1");
     assert.equal(await band.getAttribute("data-f07-bead"),"0");
     assert.equal(await band.locator('[data-f07-blood-status="current"]').count(),1);
    }else{
     assert.equal(await band.getAttribute("data-f07-position"),c.after,c.route+" source cursor");
     assert.equal(await band.locator(c.kind==="five-wounds"?'[data-f07-wound-status="current"]':
       c.kind==="little-crown"?".aoF07LittleCrownBead.active":'[data-f07-status="current"]').count(),1);
    }
    await page.locator(prefix+c.previous).click();
    if(c.kind==="precious-blood")assert.equal(await band.getAttribute("data-f07-phase"),"0");
    else assert.equal(await band.getAttribute("data-f07-position"),"0");
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
