/**
 * Browser acceptance for exact original photos at 320/390 EN/FR.
 * Renders the real published slot adapter in the actual Prayer root and
 * exercises the real Prayer library route for Sign of the Cross.
 * The 16 isolated slot screenshots are route-independent QA witnesses; they
 * DO NOT replace all route-specific navigation tests.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {mkdir,readFile,writeFile} from "node:fs/promises";
import {resolve,sep,extname} from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "@playwright/test";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const folder=resolve(root,"artifacts/prayer-museum-four-release");
await mkdir(folder,{recursive:true});
const types={".html":"text/html;charset=utf-8",".js":"text/javascript;charset=utf-8",
 ".css":"text/css",".json":"application/json",".svg":"image/svg+xml",
 ".png":"image/png",".jpg":"image/jpeg",".jpeg":"image/jpeg",".webp":"image/webp"};
const server=http.createServer(async(req,res)=>{
 try{
  const path=resolve(root,"."+decodeURIComponent(new URL(req.url,"http://127.0.0.1").pathname));
  if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403);return res.end("Denied");}
  const bytes=await readFile(path);
  res.writeHead(200,{"content-type":types[extname(path)]||"application/octet-stream"});res.end(bytes);
 }catch(e){res.writeHead(e?.code==="ENOENT"?404:500);res.end(String(e?.message||e));}
});
await new Promise((ok,fail)=>{server.once("error",fail);server.listen(0,"127.0.0.1",ok)});
const works=[
 {id:"bouts",slot:"STG-pray.angelus-04",filename:"bouts-annunciation-original.jpg",minHeight:3000},
 {id:"cavallino",slot:"COV-pray.little_crown",filename:"cavallino-shepherds-original.jpg",minHeight:2800},
 {id:"girardin",slot:"COV-foundations_sign_of_cross",filename:"girardin-trinity-original.jpg",minHeight:3000},
 {id:"hondius",slot:"STG-pray.rosary-06",filename:"hondius-doctors-original.jpg",minHeight:2900}
];
const cases=[];let browser;
try{
 browser=await chromium.launch({headless:true});
 const origin="http://127.0.0.1:"+server.address().port;
 for(const width of [320,390]){
  for(const locale of ["en-GB","fr-FR"]){
   const context=await browser.newContext({viewport:{width,height:width===320?640:844},
    isMobile:true,hasTouch:true,serviceWorkers:"block",locale,reducedMotion:"reduce",colorScheme:"dark"});
   const page=await context.newPage(),errors=[];
   page.on("pageerror",e=>errors.push(String(e.message)));
   try{
    await page.goto(origin+"/index.html?aoPrayerPilot=1",{waitUntil:"domcontentloaded",timeout:90000});
    await page.waitForFunction(()=>typeof globalThis.AO_PRAY_APP_V1?.open==="function",null,{timeout:45000});
    assert.equal(await page.evaluate(()=>globalThis.AO_PRAY_APP_V1.open()),true);
    await page.waitForFunction(()=>typeof globalThis.AO_PRAY_V435930?.open==="function",null,{timeout:30000});
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null}));
    const rootSelector="#aoPray435930.open";
    if(locale==="fr-FR"){
     await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.adoration",{returnContext:null}));
     const toggle=page.locator(rootSelector+" [data-p435930-session-language]");
     assert.equal(await toggle.count(),1);
     if((await toggle.textContent()).trim()==="EN")await toggle.click();
     assert.equal((await page.locator(rootSelector+" [data-p435930-session-language]").textContent()).trim(),"FR");
     await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null}));
    }
    const checked=[];
    for(const work of works){
     const state=await page.evaluate(async(slotId)=>{
      const mod=await import("/src/pray/art-slot-map.v1.js");
      const result=mod.resolvePrayerEditorialArtwork(slotId);
      const mount=document.querySelector("#aoPray435930.open .aoP435930Mount");
      if(!mount)throw Error("No Prayer mount");
      document.querySelector("#aoPrayerFourMuseumPreview")?.remove();
      const wrapper=document.createElement("section");
      wrapper.id="aoPrayerFourMuseumPreview";
      wrapper.setAttribute("aria-label","QA: exact museum original image");
      wrapper.style.cssText="margin:12px 8px 16px;max-width:calc(100% - 16px);min-width:0";
      wrapper.innerHTML='<h2 style="font:20px Georgia;margin:0 0 12px">Museum original · exact slot QA</h2>'+
        mod.prayerEditorialArtworkMarkup(slotId,{className:"aoPrayerEditorialCardCover"});
      mount.prepend(wrapper);
      return {state:result.state,artId:result.artId,slotId:result.slotId};
     },work.slot);
     assert.deepEqual(state,{state:"PUBLISHED_EXACT_PHOTO",artId:work.id,slotId:work.slot},work.id);
     const image=page.locator("#aoPrayerFourMuseumPreview [data-ao-editorial-slot=\""+work.slot+"\"] img");
     assert.equal(await image.count(),1,"Exactly one source photo "+work.id);
     const im=await image.evaluate(async img=>{
      img.loading="eager";
      await img.decode();
      const r=img.getBoundingClientRect(),p=img.parentElement.getBoundingClientRect();
      return {src:img.getAttribute("src"),naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,
       renderedWidth:r.width,renderedHeight:r.height,left:r.left,right:r.right,viewport:innerWidth,
       fit:getComputedStyle(img).objectFit,parentWidth:p.width,parentHeight:p.height,
       xoverflow:document.documentElement.scrollWidth-innerWidth};
     });
     assert.ok(im.src.endsWith(work.filename),JSON.stringify(im));
     assert.ok(im.naturalWidth>=2500&&im.naturalHeight>=work.minHeight,work.id+" image decode");
     assert.equal(im.fit,"contain",work.id+" artwork must not crop");
     assert.ok(im.left>=-1&&im.right<=im.viewport+1,work.id+" artwork within phone");
     assert.ok(im.renderedWidth>100&&im.renderedHeight>100,work.id+" visible image");
     assert.ok(im.xoverflow<=1,work.id+" horizontal overflow "+im.xoverflow);
     await page.screenshot({path:resolve(folder,work.id+"-"+width+"-"+locale+".png"),animations:"disabled"});
     checked.push({id:work.id,slot:work.slot,...im});
    }
    await page.evaluate(()=>document.querySelector("#aoPrayerFourMuseumPreview")?.remove());
    await page.evaluate(()=>globalThis.AO_PRAY_V435930.open("pray.library",{returnContext:null}));
    const sign=page.locator(rootSelector+' [data-p435930-lib-open="foundations_sign_of_cross"]');
    assert.equal(await sign.count(),1,"Real library must expose Sign of the Cross");
    await sign.click();
    const trueCard=page.locator(rootSelector+' [data-ao-editorial-slot="COV-foundations_sign_of_cross"] img');
    assert.equal(await trueCard.count(),1,"Sign of the Cross must carry the exact source image in the real route");
    assert.ok((await trueCard.getAttribute("src")).endsWith("girardin-trinity-original.jpg"));
    await trueCard.evaluate(async e=>{e.loading="eager";await e.decode();});
    await page.screenshot({path:resolve(folder,"live-sign-of-cross-"+width+"-"+locale+".png"),animations:"disabled"});
    assert.deepEqual(errors,[],"Unexpected page errors: "+errors.join("; "));
    cases.push({width,locale,images:checked,actualPrayerRoute:"COV-foundations_sign_of_cross",result:"PASS"});
   }finally{await context.close();}
  }
 }
}finally{
 await browser?.close();
 await new Promise(ok=>server.close(ok));
}
assert.equal(cases.length,4);
await writeFile(resolve(folder,"report.json"),JSON.stringify({cases,images:4,canonicalPositions:15,actualRouteSamples:4},null,2)+"\n");
console.log("PASS: four selected museum source images decoded uncropped and no overflow at 320/390 EN/FR; exact Sign of the Cross live-route sampled");
