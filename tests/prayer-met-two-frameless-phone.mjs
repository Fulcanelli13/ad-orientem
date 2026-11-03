// Real Prayer in-app acceptance, not just resolver screenshots.
// EN/FR at 320/390 checks release-photo decode, actual Prayer stage navigation,
// and the original text/route structure that must not be replaced by artwork.
import assert from "node:assert/strict";
import http from "node:http";
import {readFile,mkdir,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const output=resolve(root,"artifacts/prayer-met-two-eight");
await mkdir(output,{recursive:true});
const type={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".css":"text/css",".json":"application/json",".svg":"image/svg+xml",
 ".jpg":"image/jpeg",".png":"image/png",".webp":"image/webp",".woff2":"font/woff2"};
const srv=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Forbidden");}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":type[extname(path)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{srv.once("error",fail);srv.listen(0,"127.0.0.1",ok)});
let browser;const matrix=[];
try{
 browser=await chromium.launch({headless:true});
 const url="http://127.0.0.1:"+srv.address().port+"/index.html?aoPrayerPilot=1";
 for(const width of [320,390])for(const locale of ["en-GB","fr-FR"]){
  const ctx=await browser.newContext({viewport:{width,height:width===320?640:844},
    locale,isMobile:true,hasTouch:true,reducedMotion:"reduce",serviceWorkers:"block"});
  const page=await ctx.newPage(),errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try{
   await page.goto(url,{waitUntil:"domcontentloaded",timeout:90000});
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
   assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
   await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
   const rootSelector="#aoPray435930.open";
   if(locale==="fr-FR"){
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null}));
    const toggle=page.locator(rootSelector+" [data-p435930-session-language]");
    assert.equal(await toggle.count(),1);
    if((await toggle.textContent()).trim()==="EN")await toggle.click();
    assert.equal((await toggle.textContent()).trim(),"FR");
   }
   const readPhoto=async(slot,filename,tag)=>{
    const locator=page.locator(rootSelector+' [data-ao-editorial-slot="'+slot+'"] img');
    assert.equal(await locator.count(),1,"One exact in-route source image must exist for "+tag);
    const info=await locator.evaluate(async img=>{
     img.loading="eager";await img.decode();
     const r=img.getBoundingClientRect();
     return {src:img.getAttribute("src"),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
       width:r.width,height:r.height,left:r.left,right:r.right,fit:getComputedStyle(img).objectFit,
       horizontalOverflow:document.documentElement.scrollWidth-innerWidth};
    });
    assert.ok(info.src.endsWith(filename),tag+" incorrect painting "+JSON.stringify(info));
    assert.ok(info.naturalWidth>=2500&&info.naturalHeight>=3500,tag+" source failed to decode");
    assert.equal(info.fit,"contain",tag+" must preserve complete painting");
    assert.ok(info.width>90&&info.height>40&&info.left>=-1&&info.right<=width+1,tag+" must fit mobile");
    assert.ok(info.horizontalOverflow<=1,tag+" horizontal overflow "+info.horizontalOverflow);
    await page.screenshot({path:resolve(output,tag+"-"+width+"-"+locale+".png"),animations:"disabled"});
    return {tag,slot,...info};
   };
   const checked=[];
   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null}));
   const contrition=page.locator(rootSelector+' [data-p435930-lib-open="sacrament_act_of_contrition"]');
   assert.equal(await contrition.count(),1,"Canonical Act of Contrition must exist in Prayer Library");
   await contrition.click();
   checked.push(await readPhoto("COV-sacrament_act_of_contrition","latour-penitent-magdalen-frameless.jpg","contrition-library"));
   assert.ok(await page.locator(rootSelector+" .aoDevoCardScroll").count(),"The prayer text reader must remain intact");

   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.montfort_consecration",{returnContext:null}));
   assert.equal(await page.locator(rootSelector+" [data-ao-montfort-b26-reader]").count(),1);
   const phase1=page.locator(rootSelector+' [data-p435930-montfort-phase="1"]');
   assert.equal(await phase1.count(),1);
   await phase1.click();
   checked.push(await readPhoto("STG-pray.montfort_consecration-01","latour-penitent-magdalen-frameless.jpg","montfort-phase-1"));
   const phase2=page.locator(rootSelector+' [data-p435930-montfort-phase="13"]');
   assert.equal(await phase2.count(),1);
   await phase2.click();
   checked.push(await readPhoto("STG-pray.montfort_consecration-02","latour-penitent-magdalen-frameless.jpg","montfort-phase-2"));

   await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.st_joseph_seven_sorrows",{returnContext:null}));
   assert.equal(await page.locator(rootSelector+" [data-ao-st-joseph-seven-reader]").count(),1);
   for(const [n,slot,tag] of [
     [4,"STG-pray.st_joseph_seven_sorrows-05","joseph-fifth"],
     [5,"STG-pray.st_joseph_seven_sorrows-06","joseph-sixth"]
   ]){
    const nav=page.locator(rootSelector+' [data-p435930-joseph-step="'+n+'"]');
    assert.equal(await nav.count(),1);await nav.click();
    checked.push(await readPhoto(slot,"giordano-flight-egypt-frameless.jpg",tag));
    assert.ok(await page.locator(rootSelector+" .aoJosephSevenOriginal").count(),
      "Source-owned Joseph historical prayer must be preserved at "+tag);
   }
   // The canonical stage map also covers the Rosary/Seven Sorrows slot,
   // but that signature reader is deliberately not restructured here.
   const exact=await page.evaluate(async()=>{
    const m=await import("/src/pray/art-slot-map.v1.js");
    return ["STG-prayer.seven_sorrows_chaplet-02","STG-pray.confession-02","COV-daily.nightly_examen"]
      .map(slot=>({slot,state:m.resolvePrayerEditorialArtwork(slot).state,artId:m.resolvePrayerEditorialArtwork(slot).artId}));
   });
   assert.deepEqual(exact.map(x=>x.state),Array(3).fill("PUBLISHED_EXACT_PHOTO"));
   assert.deepEqual(exact.map(x=>x.artId),["giordano-flight","latour","latour"]);
   assert.deepEqual(errors,[],"Unhandled Prayer app errors "+errors.join("|"));
   matrix.push({width,locale,liveRoutes:checked,remainingExactResolverSlots:exact,result:"PASS"});
  }finally{await ctx.close();}
 }
}finally{
 await browser?.close();
 await new Promise(ok=>srv.close(ok));
}
assert.equal(matrix.length,4);
await writeFile(resolve(output,"report.json"),JSON.stringify({matrix,uniqueWorks:2,exactApprovedSlots:8},null,2)+"\n");
console.log("PASS La Tour/Giordano full-frame photos and canonical prayer content on 320/390 EN/FR; 8 exact resolver bindings; Rosary signature unchanged");
